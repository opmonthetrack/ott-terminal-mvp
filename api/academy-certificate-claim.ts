import { createClient } from "@supabase/supabase-js";

const COURSE_VERSION = "1.0";
const REQUIRED_AVERAGE = 75;
const MAX_SERIAL = 5000;
const ISSUANCE_TYPE = "foundation-certificate";
const REQUIRED_COURSES = [
  "blockchain-crypto-basics",
  "intro-to-xrpl",
  "payments-use-cases",
  "source-tag-proof",
  "defi-island",
  "blockchain-for-business",
  "decentralized-identity",
  "deep-dive-defi",
  "tokenization-rwa",
  "stablecoins",
  "defi-exchanges-lending-trading",
  "build-react",
  "code-javascript",
  "agentic-transactions",
];

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

function getHeader(req: RequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getBearerToken(req: RequestLike) {
  const authorization = getHeader(req, "authorization");
  return authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function formatSerial(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    )?.trim();
    const token = getBearerToken(req);
    const walletAddress = getString(req.body?.walletAddress);

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        ok: false,
        error: "Trusted certificate storage is not configured on the server.",
      });
    }

    if (!token) {
      return res.status(401).json({ ok: false, error: "Sign in before claiming a certificate." });
    }

    if (!isValidXrplAddress(walletAddress)) {
      return res.status(400).json({
        ok: false,
        error: "Connect and verify a valid XRPL receiving wallet first.",
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ ok: false, error: "The OTT account session could not be verified." });
    }

    const userId = userData.user.id;
    const { data: rows, error: completionError } = await admin
      .from("academy_completions")
      .select("course_id,overall_score")
      .eq("user_id", userId)
      .eq("course_version", COURSE_VERSION)
      .in("course_id", REQUIRED_COURSES);

    if (completionError) {
      return res.status(500).json({ ok: false, error: "Academy results could not be verified." });
    }

    const scoreByCourse = new Map<string, number>();
    for (const row of rows ?? []) {
      const courseId = String(row.course_id ?? "");
      const score = Number(row.overall_score ?? 0);
      if (REQUIRED_COURSES.includes(courseId) && Number.isFinite(score)) {
        scoreByCourse.set(courseId, Math.max(scoreByCourse.get(courseId) ?? 0, score));
      }
    }

    const completedCount = REQUIRED_COURSES.filter((courseId) => scoreByCourse.has(courseId)).length;
    const averageScore = completedCount
      ? Math.round(
          REQUIRED_COURSES.reduce((sum, courseId) => sum + (scoreByCourse.get(courseId) ?? 0), 0) /
            REQUIRED_COURSES.length,
        )
      : 0;

    if (completedCount !== REQUIRED_COURSES.length) {
      return res.status(409).json({
        ok: false,
        error: `Complete all ${REQUIRED_COURSES.length} Academy lessons before claiming the NFT.`,
        eligibility: { completedCount, requiredCount: REQUIRED_COURSES.length, averageScore },
      });
    }

    if (averageScore < REQUIRED_AVERAGE) {
      return res.status(409).json({
        ok: false,
        error: `Your Academy average must be at least ${REQUIRED_AVERAGE}%.`,
        eligibility: { completedCount, requiredCount: REQUIRED_COURSES.length, averageScore },
      });
    }

    const { data: existing, error: existingError } = await admin
      .from("nft_issuance_records")
      .select("id,status,serial_number,wallet_address,transaction_hash,metadata_uri,created_at,updated_at")
      .eq("user_id", userId)
      .eq("issuance_type", ISSUANCE_TYPE)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ ok: false, error: "Existing certificate status could not be checked." });
    }

    if (existing) {
      return res.status(200).json({
        ok: true,
        alreadyExists: true,
        eligibility: { completedCount, requiredCount: REQUIRED_COURSES.length, averageScore },
        claim: {
          ...existing,
          serial: formatSerial(Number(existing.serial_number)),
        },
      });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: highestRows, error: serialError } = await admin
        .from("nft_issuance_records")
        .select("serial_number")
        .eq("issuance_type", ISSUANCE_TYPE)
        .order("serial_number", { ascending: false })
        .limit(1);

      if (serialError) {
        return res.status(500).json({ ok: false, error: "A certificate serial could not be allocated." });
      }

      const nextSerial = Number(highestRows?.[0]?.serial_number ?? 0) + 1;
      if (nextSerial < 1 || nextSerial > MAX_SERIAL) {
        return res.status(409).json({ ok: false, error: "The Foundation Certificate edition is full." });
      }

      const { data: inserted, error: insertError } = await admin
        .from("nft_issuance_records")
        .insert({
          user_id: userId,
          issuance_type: ISSUANCE_TYPE,
          status: "reserved",
          serial_number: nextSerial,
          wallet_address: walletAddress,
          qualification_score: averageScore,
          qualification_course_count: completedCount,
        })
        .select("id,status,serial_number,wallet_address,transaction_hash,metadata_uri,created_at,updated_at")
        .single();

      if (!insertError && inserted) {
        return res.status(201).json({
          ok: true,
          alreadyExists: false,
          eligibility: { completedCount, requiredCount: REQUIRED_COURSES.length, averageScore },
          claim: {
            ...inserted,
            serial: formatSerial(nextSerial),
          },
        });
      }

      if (!String(insertError?.message ?? "").toLowerCase().includes("duplicate")) {
        return res.status(500).json({ ok: false, error: "The certificate reservation could not be stored." });
      }
    }

    return res.status(409).json({
      ok: false,
      error: "Another certificate was reserved at the same time. Try again.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown certificate claim error.",
    });
  }
}
