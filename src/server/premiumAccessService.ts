import { createClient, type User } from "@supabase/supabase-js";

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    send: (body: string) => void;
  };
};

type GrantScope = "academy-premium" | "wallet-academy" | "research-pro" | "all-premium";

type GrantRow = {
  id: string;
  target_user_id: string | null;
  wallet_address: string | null;
  access_scope: GrantScope;
  status: string;
  starts_at: string;
  expires_at: string | null;
  reason: string;
  granted_by: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

type WalletLinkRow = {
  id: string;
  user_id: string;
  wallet_address: string;
  status: string;
  xaman_payload_uuid: string | null;
  verified_at: string | null;
  revoked_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type XamanPayload = {
  uuid?: string;
  meta?: { signed?: boolean; resolved?: boolean; expired?: boolean };
  response?: { account?: string; hex?: string; txid?: string };
  next?: { always?: string; no_push_msg_received?: string };
  refs?: { qr_png?: string; qr_matrix?: string; websocket_status?: string };
  [key: string]: unknown;
};

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GRANT_SCOPES = new Set<GrantScope>([
  "academy-premium",
  "wallet-academy",
  "research-pro",
  "all-premium",
]);
const GRANT_FIELDS = [
  "id", "target_user_id", "wallet_address", "access_scope", "status",
  "starts_at", "expires_at", "reason", "granted_by", "revoked_by",
  "revoked_at", "created_at", "updated_at",
].join(",");
const LINK_FIELDS = [
  "id", "user_id", "wallet_address", "status", "xaman_payload_uuid",
  "verified_at", "revoked_at", "error_message", "created_at", "updated_at",
].join(",");

function header(req: RequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function bearer(req: RequestLike) {
  const value = header(req, "authorization");
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serverStorage() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim() || "";
  return { url, key };
}

function makeAdmin() {
  const storage = serverStorage();
  if (!storage.url || !storage.key) {
    throw new Error("Trusted Supabase server storage is not configured.");
  }
  return createClient(storage.url, storage.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type AdminClient = ReturnType<typeof makeAdmin>;

function adminAllowed(userId: string, email: string) {
  const ids = new Set(
    (process.env.OTT_MINT_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const emails = new Set(
    (process.env.OTT_MINT_ADMIN_EMAILS ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

async function authenticatedUser(req: RequestLike, admin: AdminClient) {
  const token = bearer(req);
  if (!token) throw new Error("AUTH_REQUIRED");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

function setupError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");
  return /ott_access_grants|ott_wallet_links|schema cache|does not exist/i.test(message);
}

function activeNow(grant: GrantRow, now = Date.now()) {
  if (grant.status !== "active") return false;
  if (new Date(grant.starts_at).getTime() > now) return false;
  if (grant.expires_at && new Date(grant.expires_at).getTime() <= now) return false;
  return true;
}

function entitlementSummary(grants: GrantRow[], accessPassIssued: boolean) {
  const scopes = new Set(grants.map((grant) => grant.access_scope));
  const allPremium = accessPassIssued || scopes.has("all-premium");
  return {
    accessPassIssued,
    allPremium,
    academyPremium: allPremium || scopes.has("academy-premium"),
    walletAcademy: allPremium || scopes.has("academy-premium") || scopes.has("wallet-academy"),
    researchPro: allPremium || scopes.has("research-pro"),
  };
}

function publicAppUrl() {
  return (process.env.OTT_PUBLIC_APP_URL || "https://ott-terminal-mvp.vercel.app").replace(/\/$/, "");
}

function xamanCredentials() {
  return {
    key: process.env.XAMAN_API_KEY?.trim() || "",
    secret: process.env.XAMAN_API_SECRET?.trim() || "",
  };
}

async function createXamanPayload(payload: Record<string, unknown>) {
  const credentials = xamanCredentials();
  if (!credentials.key || !credentials.secret) {
    throw new Error("Xaman server credentials are not configured.");
  }
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": credentials.key,
      "x-api-secret": credentials.secret,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as XamanPayload & { error?: { message?: string } | string };
  if (!response.ok || !data.uuid) {
    const error = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(error || "Xaman wallet-proof request could not be created.");
  }
  return data;
}

async function getXamanPayload(uuid: string) {
  const credentials = xamanCredentials();
  if (!credentials.key || !credentials.secret) {
    throw new Error("Xaman server credentials are not configured.");
  }
  const response = await fetch(`${XAMAN_API_URL}/${encodeURIComponent(uuid)}`, {
    method: "GET",
    headers: {
      "x-api-key": credentials.key,
      "x-api-secret": credentials.secret,
    },
  });
  const data = await response.json() as XamanPayload & { error?: { message?: string } | string };
  if (!response.ok) {
    const error = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(error || "Xaman wallet-proof result could not be loaded.");
  }
  return data;
}

async function loadActiveGrantsForUser(admin: AdminClient, userId: string, wallets: string[]) {
  const { data: userGrants, error: userError } = await admin
    .from("ott_access_grants")
    .select(GRANT_FIELDS)
    .eq("target_user_id", userId)
    .eq("status", "active");
  if (userError) throw userError;

  let walletGrants: GrantRow[] = [];
  if (wallets.length > 0) {
    const { data, error } = await admin
      .from("ott_access_grants")
      .select(GRANT_FIELDS)
      .in("wallet_address", wallets)
      .eq("status", "active");
    if (error) throw error;
    walletGrants = (data ?? []) as GrantRow[];
  }

  const unique = new Map<string, GrantRow>();
  [...((userGrants ?? []) as GrantRow[]), ...walletGrants]
    .filter((grant) => activeNow(grant))
    .forEach((grant) => unique.set(grant.id, grant));
  return [...unique.values()];
}

async function handleGrantStatus(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });

  let admin: AdminClient;
  let user: User;
  try {
    admin = makeAdmin();
    user = await authenticatedUser(req, admin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTH_REQUIRED" || message === "AUTH_INVALID") {
      return res.status(401).json({ ok: false, error: "Sign in with your OTT account first." });
    }
    return res.status(503).json({ ok: false, error: message || "Premium access service unavailable." });
  }

  try {
    const requestedWallet = queryValue(req.query?.wallet).trim();
    const { data: links, error: linkError } = await admin
      .from("ott_wallet_links")
      .select(LINK_FIELDS)
      .eq("user_id", user.id)
      .eq("status", "verified");
    if (linkError) throw linkError;

    const verifiedLinks = (links ?? []) as WalletLinkRow[];
    const verifiedWallets = verifiedLinks.map((link) => link.wallet_address);
    const walletLinked = Boolean(requestedWallet && verifiedWallets.includes(requestedWallet));
    const grants = await loadActiveGrantsForUser(admin, user.id, verifiedWallets);

    let walletGrantAvailable = false;
    if (requestedWallet && XRPL_ADDRESS.test(requestedWallet) && !walletLinked) {
      const { data, error } = await admin
        .from("ott_access_grants")
        .select("id,starts_at,expires_at,status")
        .eq("wallet_address", requestedWallet)
        .eq("status", "active");
      if (error) throw error;
      walletGrantAvailable = (data ?? []).some((grant) => activeNow(grant as GrantRow));
    }

    const { data: pass, error: passError } = await admin
      .from("nft_issuance_records")
      .select("id")
      .eq("user_id", user.id)
      .eq("issuance_type", "access-pass")
      .eq("status", "issued")
      .limit(1)
      .maybeSingle();
    if (passError) throw passError;

    return res.status(200).json({
      ok: true,
      setupRequired: false,
      entitlements: entitlementSummary(grants, Boolean(pass)),
      grants,
      walletLinks: verifiedLinks,
      requestedWallet: requestedWallet || null,
      walletLinked,
      walletGrantAvailable,
    });
  } catch (error) {
    if (setupError(error)) {
      return res.status(200).json({
        ok: true,
        setupRequired: true,
        entitlements: entitlementSummary([], false),
        grants: [],
        walletLinks: [],
        walletLinked: false,
        walletGrantAvailable: false,
      });
    }
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Premium access status could not be loaded.",
    });
  }
}

async function handleWalletLink(req: RequestLike, res: ResponseLike) {
  let admin: AdminClient;
  let user: User;
  try {
    admin = makeAdmin();
    user = await authenticatedUser(req, admin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return res.status(message.startsWith("AUTH_") ? 401 : 503).json({
      ok: false,
      error: message.startsWith("AUTH_") ? "Sign in with your OTT account first." : message,
    });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await admin
        .from("ott_wallet_links")
        .select(LINK_FIELDS)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return res.status(200).json({ ok: true, walletLinks: data ?? [] });
    } catch (error) {
      if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true, walletLinks: [] });
      return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Wallet links could not be loaded." });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
  const action = stringValue(req.body?.action);

  try {
    if (action === "create") {
      const walletAddress = stringValue(req.body?.walletAddress);
      if (!XRPL_ADDRESS.test(walletAddress)) {
        return res.status(400).json({ ok: false, error: "Enter a valid XRPL wallet address." });
      }

      const returnUrl = `${publicAppUrl()}/?tab=academy&wallet_link_return=1&payload={id}`;
      const payload = await createXamanPayload({
        txjson: { TransactionType: "SignIn" },
        options: {
          return_url: { app: returnUrl, web: returnUrl },
          expire: 5,
        },
        custom_meta: {
          identifier: `ott-wallet-link:${user.id}:${walletAddress}`,
          instruction: "Sign this off-ledger request to prove this XRPL wallet belongs to your OTT account. No payment or XRPL transaction is submitted.",
        },
      });

      const { data, error } = await admin
        .from("ott_wallet_links")
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress,
          status: "pending",
          xaman_payload_uuid: payload.uuid,
          verified_at: null,
          revoked_at: null,
          error_message: null,
        }, { onConflict: "user_id,wallet_address" })
        .select(LINK_FIELDS)
        .single();
      if (error) throw error;

      return res.status(200).json({ ok: true, walletLink: data, payload });
    }

    if (action === "verify") {
      const payloadUuid = stringValue(req.body?.payloadUuid);
      if (!UUID.test(payloadUuid)) return res.status(400).json({ ok: false, error: "Invalid Xaman payload ID." });

      const { data: link, error: linkError } = await admin
        .from("ott_wallet_links")
        .select(LINK_FIELDS)
        .eq("user_id", user.id)
        .eq("xaman_payload_uuid", payloadUuid)
        .single();
      if (linkError || !link) throw linkError ?? new Error("Wallet-link request not found.");

      const payload = await getXamanPayload(payloadUuid);
      if (!payload.meta?.resolved) {
        return res.status(200).json({ ok: true, pending: true, walletLink: link, payload });
      }
      if (!payload.meta?.signed) {
        const { data, error } = await admin
          .from("ott_wallet_links")
          .update({ status: "failed", error_message: "Xaman SignIn request was rejected or expired." })
          .eq("id", link.id)
          .select(LINK_FIELDS)
          .single();
        if (error) throw error;
        return res.status(400).json({ ok: false, error: "Xaman wallet proof was not signed.", walletLink: data });
      }

      const signingAccount = payload.response?.account?.trim() || "";
      if (signingAccount !== link.wallet_address) {
        const { error } = await admin
          .from("ott_wallet_links")
          .update({
            status: "failed",
            error_message: `Expected ${link.wallet_address}, received ${signingAccount || "no account"}.`,
          })
          .eq("id", link.id);
        if (error) throw error;
        return res.status(400).json({ ok: false, error: "The Xaman signer does not match the wallet being linked." });
      }

      const { data, error } = await admin
        .from("ott_wallet_links")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          revoked_at: null,
          error_message: null,
        })
        .eq("id", link.id)
        .select(LINK_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, pending: false, walletLink: data, payload });
    }

    if (action === "revoke") {
      const walletAddress = stringValue(req.body?.walletAddress);
      if (!XRPL_ADDRESS.test(walletAddress)) return res.status(400).json({ ok: false, error: "Invalid wallet address." });
      const { data, error } = await admin
        .from("ott_wallet_links")
        .update({ status: "revoked", revoked_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("wallet_address", walletAddress)
        .select(LINK_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, walletLink: data });
    }

    return res.status(400).json({ ok: false, error: "Unknown wallet-link action." });
  } catch (error) {
    if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true });
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Wallet-link action failed." });
  }
}

async function findUserByEmail(admin: AdminClient, email: string) {
  const expected = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === expected);
    if (found) return found;
    if (data.users.length < 100) break;
  }
  return null;
}

async function founderContext(req: RequestLike) {
  const admin = makeAdmin();
  const user = await authenticatedUser(req, admin);
  if (!adminAllowed(user.id, user.email ?? "")) throw new Error("FOUNDER_REQUIRED");
  return { admin, user };
}

async function describeUser(admin: AdminClient, userId: string | null) {
  if (!userId) return null;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return { id: userId, email: null, name: null };
  const metadata = data.user.user_metadata ?? {};
  const name = [metadata.display_name, metadata.full_name, metadata.name]
    .find((value) => typeof value === "string" && value.trim());
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: typeof name === "string" ? name.trim() : null,
  };
}

async function handleFounderGrants(req: RequestLike, res: ResponseLike) {
  let admin: AdminClient;
  let founder: User;
  try {
    ({ admin, user: founder } = await founderContext(req));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return res.status(message === "FOUNDER_REQUIRED" ? 403 : message.startsWith("AUTH_") ? 401 : 503).json({
      ok: false,
      error: message === "FOUNDER_REQUIRED" ? "This OTT account is not authorized for founder access management." : "Founder account verification failed.",
    });
  }

  try {
    if (req.method === "GET") {
      const { data, error } = await admin
        .from("ott_access_grants")
        .select(GRANT_FIELDS)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const grants = (data ?? []) as GrantRow[];
      const userIds = [...new Set(grants.map((grant) => grant.target_user_id).filter((value): value is string => Boolean(value)))];
      const users = await Promise.all(userIds.map((id) => describeUser(admin, id)));

      const walletAddresses = [...new Set(grants.map((grant) => grant.wallet_address).filter((value): value is string => Boolean(value)))];
      let walletLinks: WalletLinkRow[] = [];
      if (walletAddresses.length > 0) {
        const { data: links, error: linkError } = await admin
          .from("ott_wallet_links")
          .select(LINK_FIELDS)
          .in("wallet_address", walletAddresses)
          .eq("status", "verified");
        if (linkError) throw linkError;
        walletLinks = (links ?? []) as WalletLinkRow[];
      }

      return res.status(200).json({ ok: true, grants, users: users.filter(Boolean), walletLinks });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
    const action = stringValue(req.body?.action);

    if (action === "search") {
      const query = stringValue(req.body?.query);
      if (!query) return res.status(400).json({ ok: false, error: "Enter an email, user ID or XRPL wallet." });

      if (XRPL_ADDRESS.test(query)) {
        const { data: links, error } = await admin
          .from("ott_wallet_links")
          .select(LINK_FIELDS)
          .eq("wallet_address", query)
          .eq("status", "verified");
        if (error) throw error;
        const linkedUsers = await Promise.all(((links ?? []) as WalletLinkRow[]).map((link) => describeUser(admin, link.user_id)));
        return res.status(200).json({
          ok: true,
          targets: [{ type: "wallet", walletAddress: query, linkedUsers: linkedUsers.filter(Boolean) }],
        });
      }

      let found: User | null = null;
      if (UUID.test(query)) {
        const { data } = await admin.auth.admin.getUserById(query);
        found = data.user ?? null;
      } else if (query.includes("@")) {
        found = await findUserByEmail(admin, query);
      }

      if (!found) return res.status(200).json({ ok: true, targets: [] });
      return res.status(200).json({
        ok: true,
        targets: [{
          type: "account",
          userId: found.id,
          email: found.email ?? null,
          name: found.user_metadata?.display_name ?? found.user_metadata?.full_name ?? found.user_metadata?.name ?? null,
        }],
      });
    }

    if (action === "create") {
      const targetUserId = stringValue(req.body?.targetUserId) || null;
      const walletAddress = stringValue(req.body?.walletAddress) || null;
      const accessScope = stringValue(req.body?.accessScope) as GrantScope;
      const reason = stringValue(req.body?.reason);
      const startsAt = stringValue(req.body?.startsAt) || new Date().toISOString();
      const expiresAt = stringValue(req.body?.expiresAt) || null;

      if (!targetUserId && !walletAddress) return res.status(400).json({ ok: false, error: "Choose an OTT account or XRPL wallet." });
      if (targetUserId && !UUID.test(targetUserId)) return res.status(400).json({ ok: false, error: "Invalid OTT user ID." });
      if (walletAddress && !XRPL_ADDRESS.test(walletAddress)) return res.status(400).json({ ok: false, error: "Invalid XRPL wallet." });
      if (!GRANT_SCOPES.has(accessScope)) return res.status(400).json({ ok: false, error: "Invalid access scope." });
      if (reason.length < 3) return res.status(400).json({ ok: false, error: "A founder reason is required." });
      if (!Number.isFinite(new Date(startsAt).getTime())) return res.status(400).json({ ok: false, error: "Invalid start date." });
      if (expiresAt && (!Number.isFinite(new Date(expiresAt).getTime()) || new Date(expiresAt) <= new Date(startsAt))) {
        return res.status(400).json({ ok: false, error: "Expiry must be later than the start date." });
      }
      if (targetUserId) {
        const { data } = await admin.auth.admin.getUserById(targetUserId);
        if (!data.user) return res.status(404).json({ ok: false, error: "OTT account not found." });
      }

      let existingQuery = admin
        .from("ott_access_grants")
        .select(GRANT_FIELDS)
        .eq("access_scope", accessScope)
        .eq("status", "active");
      existingQuery = targetUserId
        ? existingQuery.eq("target_user_id", targetUserId)
        : existingQuery.eq("wallet_address", walletAddress as string);
      const { data: existing, error: existingError } = await existingQuery.maybeSingle();
      if (existingError) throw existingError;

      let grant: GrantRow;
      let eventType = "created";
      if (existing) {
        const { data, error } = await admin
          .from("ott_access_grants")
          .update({ starts_at: startsAt, expires_at: expiresAt, reason })
          .eq("id", existing.id)
          .select(GRANT_FIELDS)
          .single();
        if (error) throw error;
        grant = data as GrantRow;
        eventType = "extended";
      } else {
        const { data, error } = await admin
          .from("ott_access_grants")
          .insert({
            target_user_id: targetUserId,
            wallet_address: walletAddress,
            access_scope: accessScope,
            status: "active",
            starts_at: startsAt,
            expires_at: expiresAt,
            reason,
            granted_by: founder.id,
          })
          .select(GRANT_FIELDS)
          .single();
        if (error) throw error;
        grant = data as GrantRow;
      }

      const { error: eventError } = await admin.from("ott_access_grant_events").insert({
        grant_id: grant.id,
        event_type: eventType,
        actor_user_id: founder.id,
        details: { startsAt, expiresAt, reason, accessScope, targetUserId, walletAddress },
      });
      if (eventError) throw eventError;
      return res.status(200).json({ ok: true, grant, eventType });
    }

    if (action === "revoke") {
      const grantId = stringValue(req.body?.grantId);
      if (!UUID.test(grantId)) return res.status(400).json({ ok: false, error: "Invalid grant ID." });
      const revokedAt = new Date().toISOString();
      const { data, error } = await admin
        .from("ott_access_grants")
        .update({ status: "revoked", revoked_by: founder.id, revoked_at: revokedAt })
        .eq("id", grantId)
        .eq("status", "active")
        .select(GRANT_FIELDS)
        .single();
      if (error) throw error;
      const { error: eventError } = await admin.from("ott_access_grant_events").insert({
        grant_id: grantId,
        event_type: "revoked",
        actor_user_id: founder.id,
        details: { revokedAt },
      });
      if (eventError) throw eventError;
      return res.status(200).json({ ok: true, grant: data });
    }

    return res.status(400).json({ ok: false, error: "Unknown founder grant action." });
  } catch (error) {
    if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true, grants: [], users: [], walletLinks: [] });
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Founder access action failed." });
  }
}

export default async function premiumAccessHandler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  if (scope === "grant-status") return handleGrantStatus(req, res);
  if (scope === "wallet-link") return handleWalletLink(req, res);
  if (scope === "grants") return handleFounderGrants(req, res);
  return res.status(400).json({ ok: false, error: "Unknown premium access scope." });
}
