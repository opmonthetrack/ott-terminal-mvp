import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const SOURCE_TAG = 2606170002;
const TEST_AMOUNT_DROPS = "1";
const MEMO_TYPE = "OTT_WALLET_TEST";
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL = process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";
const PUBLIC_APP_URL = normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL)
  || normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  || "https://ott-terminal-mvp.vercel.app";
const TEST_DESTINATION = (
  process.env.OTT_WALLET_TEST_DESTINATION
  || process.env.OTT_PROOF_DESTINATION_WALLET
  || process.env.OTT_ROADMAP_VOTE_WALLET
  || ""
).trim();

const TESTABLE_PROVIDERS = new Set(["xaman", "crossmark", "gemwallet"]);

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
  query?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
  setHeader?: (name: string, value: string) => void;
};

type ChallengeRow = {
  id: string;
  user_id: string;
  provider_id: string;
  wallet_address: string;
  network: string;
  destination_wallet: string;
  amount_drops: number | string;
  source_tag: number | string;
  memo_text: string;
  status: string;
  xaman_payload_uuid: string | null;
  transaction_hash: string | null;
  expires_at: string;
};

type CertificationRow = {
  provider_id: string;
  technical_score: number;
  minimum_validated_tests: number;
  public_testing_enabled: boolean;
  auto_certify: boolean;
  status: string;
  notes: string | null;
};

type ResultRow = {
  id: string;
  provider_id: string;
  wallet_address: string;
  transaction_hash: string;
  score: number;
  status: string;
  validated_at: string;
};

type XrplTx = {
  Account?: string;
  Destination?: string;
  TransactionType?: string;
  Amount?: string | Record<string, unknown>;
  SourceTag?: number;
  Memos?: Array<{ Memo?: { MemoType?: string; MemoData?: string } }>;
  hash?: string;
};

type XrplTxResult = XrplTx & {
  validated?: boolean;
  ledger_index?: number;
  meta?: { TransactionResult?: string };
  metaData?: { TransactionResult?: string };
  tx_json?: XrplTx;
};

function normalizePublicUrl(value: string | undefined) {
  const clean = value?.trim().replace(/\/$/, "") ?? "";
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function hexToText(value: string | undefined) {
  if (!value || value.length % 2 !== 0 || !/^[0-9A-Fa-f]+$/.test(value)) return "";
  try {
    return new TextDecoder().decode(new Uint8Array(value.match(/.{2}/g)?.map((part) => parseInt(part, 16)) ?? []));
  } catch {
    return "";
  }
}

function getBearerToken(req: RequestLike) {
  const raw = req.headers?.authorization ?? req.headers?.Authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim() || "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function authenticate(admin: SupabaseClient, req: RequestLike): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

function xamanHeaders() {
  const key = process.env.XAMAN_API_KEY?.trim();
  const secret = process.env.XAMAN_API_SECRET?.trim();
  if (!key || !secret) throw new Error("Xaman server credentials are not configured.");
  return { "Content-Type": "application/json", "X-API-Key": key, "X-API-Secret": secret };
}

async function createXamanPayload(txjson: Record<string, unknown>, challengeId: string) {
  const returnUrl = `${PUBLIC_APP_URL}/?tab=wallet&wallet_test_return=1&challenge=${encodeURIComponent(challengeId)}&payload={id}`;
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: xamanHeaders(),
    body: JSON.stringify({
      txjson,
      options: { submit: true, return_url: { app: returnUrl, web: returnUrl } },
      custom_meta: {
        identifier: `ott-wallet-test-${challengeId.slice(0, 8)}`,
        instruction: "OTT wallet integration proof: review the 1-drop payment and SourceTag.",
      },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error("Xaman could not create the wallet-test request.");
  return payload as { uuid?: string; next?: { always?: string; no_push_msg_received?: string } };
}

async function getXamanPayload(uuid: string) {
  const response = await fetch(`${XAMAN_API_URL}/${uuid}`, { headers: xamanHeaders() });
  const payload = await response.json();
  if (!response.ok) throw new Error("Xaman wallet-test status could not be read.");
  return payload as {
    meta?: { signed?: boolean; resolved?: boolean; expired?: boolean };
    response?: { account?: string; txid?: string };
  };
}

async function getXrplTransaction(hash: string) {
  const response = await fetch(XRPL_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "tx", params: [{ transaction: hash, binary: false }] }),
  });
  const data = await response.json() as { result?: XrplTxResult; error?: string };
  if (!response.ok || data.error || !data.result) throw new Error("The XRPL transaction is pending or could not be read.");
  return data.result;
}

function transaction(result: XrplTxResult): XrplTx {
  return result.tx_json ?? result;
}

function transactionResult(result: XrplTxResult) {
  return result.meta?.TransactionResult ?? result.metaData?.TransactionResult ?? "";
}

function memoMatches(tx: XrplTx, expected: string) {
  return (tx.Memos ?? []).some((item) => (
    hexToText(item.Memo?.MemoType) === MEMO_TYPE
    && hexToText(item.Memo?.MemoData) === expected
  ));
}

function providerScore(config: CertificationRow, validatedTests: number) {
  const required = Math.max(1, Number(config.minimum_validated_tests));
  const communityScore = Math.min(15, Math.round((validatedTests / required) * 15));
  const raw = Math.min(100, Number(config.technical_score) + communityScore);
  const certified = Boolean(config.auto_certify && validatedTests >= required);
  return certified ? 100 : Math.min(95, raw);
}

async function loadProviderStats(admin: SupabaseClient) {
  const { data: configs, error: configError } = await admin
    .from("wallet_provider_certifications")
    .select("provider_id,technical_score,minimum_validated_tests,public_testing_enabled,auto_certify,status,notes")
    .order("provider_id");
  if (configError) throw configError;

  const { data: results, error: resultError } = await admin
    .from("wallet_test_results")
    .select("provider_id,user_id")
    .eq("status", "validated")
    .eq("score", 100);
  if (resultError) throw resultError;

  const uniqueByProvider = new Map<string, Set<string>>();
  for (const row of results ?? []) {
    const providerId = String(row.provider_id);
    const users = uniqueByProvider.get(providerId) ?? new Set<string>();
    users.add(String(row.user_id));
    uniqueByProvider.set(providerId, users);
  }

  return (configs ?? []).map((config) => {
    const typed = config as CertificationRow;
    const validatedTests = uniqueByProvider.get(typed.provider_id)?.size ?? 0;
    const percentage = providerScore(typed, validatedTests);
    return {
      providerId: typed.provider_id,
      percentage,
      validatedTests,
      requiredTests: typed.minimum_validated_tests,
      publicTestingEnabled: typed.public_testing_enabled,
      status: percentage === 100 ? "live" : typed.status,
      notes: typed.notes,
    };
  });
}

function setupRequired(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /wallet_(provider|test)|relation .* does not exist|42P01/i.test(message);
}

async function statusResponse(admin: SupabaseClient, user: User | null) {
  try {
    const providers = await loadProviderStats(admin);
    let result: ResultRow | null = null;
    let reward: Record<string, unknown> | null = null;

    if (user) {
      const { data } = await admin
        .from("wallet_test_results")
        .select("id,provider_id,wallet_address,transaction_hash,score,status,validated_at")
        .eq("user_id", user.id)
        .eq("status", "validated")
        .order("validated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      result = (data as ResultRow | null) ?? null;

      const { data: rewardData } = await admin
        .from("wallet_test_rewards")
        .select("id,provider_id,wallet_address,status,serial_number,issuance_record_id,updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      reward = (rewardData as Record<string, unknown> | null) ?? null;
    }

    const testedProvider = result ? providers.find((item) => item.providerId === result?.provider_id) ?? null : null;
    return {
      ok: true,
      configured: true,
      setupRequired: false,
      sourceTag: SOURCE_TAG,
      amountDrops: TEST_AMOUNT_DROPS,
      destinationWallet: TEST_DESTINATION,
      providers,
      user: user ? {
        signedIn: true,
        result,
        individualPercentage: result?.score ?? 0,
        providerPercentage: testedProvider?.percentage ?? 0,
        nftEligible: Boolean(result?.score === 100 && testedProvider?.percentage === 100),
        reward,
      } : { signedIn: false, result: null, individualPercentage: 0, providerPercentage: 0, nftEligible: false, reward: null },
    };
  } catch (error) {
    if (setupRequired(error)) {
      return { ok: true, configured: true, setupRequired: true, providers: [], sourceTag: SOURCE_TAG, amountDrops: TEST_AMOUNT_DROPS };
    }
    throw error;
  }
}

async function createChallenge(admin: SupabaseClient, user: User, body: Record<string, unknown>) {
  const providerId = stringValue(body.providerId);
  const walletAddress = stringValue(body.walletAddress);
  if (!TESTABLE_PROVIDERS.has(providerId)) throw new Error("This wallet connector is not open for public testing yet.");
  if (!isAddress(walletAddress)) throw new Error("A valid connected XRPL classic address is required.");
  if (!isAddress(TEST_DESTINATION)) throw new Error("OTT_WALLET_TEST_DESTINATION is not configured.");

  const { data: config, error: configError } = await admin
    .from("wallet_provider_certifications")
    .select("provider_id,public_testing_enabled")
    .eq("provider_id", providerId)
    .single();
  if (configError || !config?.public_testing_enabled) throw new Error("Public testing is not enabled for this wallet.");

  const { data: challenge, error } = await admin
    .from("wallet_test_challenges")
    .insert({
      user_id: user.id,
      provider_id: providerId,
      wallet_address: walletAddress,
      network: "mainnet",
      destination_wallet: TEST_DESTINATION,
      amount_drops: Number(TEST_AMOUNT_DROPS),
      source_tag: SOURCE_TAG,
      memo_text: "pending",
      status: "created",
    })
    .select("id,user_id,provider_id,wallet_address,network,destination_wallet,amount_drops,source_tag,memo_text,status,xaman_payload_uuid,transaction_hash,expires_at")
    .single();
  if (error || !challenge) throw new Error("The one-time wallet-test challenge could not be created. Run the public wallet-testing migration.");

  const memoText = `OTT|WT|1|${providerId}|${challenge.id}`;
  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Account: walletAddress,
    Destination: TEST_DESTINATION,
    Amount: TEST_AMOUNT_DROPS,
    SourceTag: SOURCE_TAG,
    Memos: [{ Memo: { MemoType: textToHex(MEMO_TYPE), MemoData: textToHex(memoText) } }],
  };

  let payload: Record<string, unknown> | null = null;
  if (providerId === "xaman") {
    payload = await createXamanPayload(txjson, challenge.id) as Record<string, unknown>;
  }

  const payloadUuid = stringValue(payload?.uuid);
  const { error: updateError } = await admin
    .from("wallet_test_challenges")
    .update({ memo_text: memoText, status: providerId === "xaman" ? "signing" : "created", xaman_payload_uuid: payloadUuid || null })
    .eq("id", challenge.id)
    .eq("user_id", user.id);
  if (updateError) throw new Error("The wallet-test challenge could not be finalized.");

  return {
    ok: true,
    challenge: { id: challenge.id, providerId, walletAddress, expiresAt: challenge.expires_at },
    proof: { destinationWallet: TEST_DESTINATION, amountDrops: TEST_AMOUNT_DROPS, sourceTag: SOURCE_TAG, memoType: MEMO_TYPE, memoText },
    txjson,
    payload,
  };
}

async function verifyChallenge(admin: SupabaseClient, user: User, body: Record<string, unknown>) {
  const challengeId = stringValue(body.challengeId);
  if (!isUuid(challengeId)) throw new Error("A valid wallet-test challenge is required.");

  const { data, error } = await admin
    .from("wallet_test_challenges")
    .select("id,user_id,provider_id,wallet_address,network,destination_wallet,amount_drops,source_tag,memo_text,status,xaman_payload_uuid,transaction_hash,expires_at")
    .eq("id", challengeId)
    .eq("user_id", user.id)
    .single();
  if (error || !data) throw new Error("This wallet-test challenge was not found for the signed-in account.");
  const challenge = data as ChallengeRow;
  if (new Date(challenge.expires_at).getTime() < Date.now() && challenge.status !== "validated") {
    await admin.from("wallet_test_challenges").update({ status: "expired" }).eq("id", challenge.id);
    throw new Error("The wallet-test challenge expired. Create a new one.");
  }

  let txHash = stringValue(body.transactionHash).toUpperCase();
  if (challenge.provider_id === "xaman") {
    if (!challenge.xaman_payload_uuid) throw new Error("No Xaman request is attached to this challenge.");
    const payload = await getXamanPayload(challenge.xaman_payload_uuid);
    if (!payload.meta?.resolved) return { ok: true, pending: true, stage: "wallet-approval" };
    if (!payload.meta?.signed) {
      await admin.from("wallet_test_challenges").update({ status: "declined" }).eq("id", challenge.id);
      throw new Error("The Xaman wallet-test request was declined or expired.");
    }
    const signer = stringValue(payload.response?.account);
    if (signer !== challenge.wallet_address) throw new Error("The signing Xaman account does not match the connected wallet.");
    txHash = stringValue(payload.response?.txid).toUpperCase();
  }
  if (!isHash(txHash)) throw new Error("The wallet did not return a valid XRPL transaction hash.");

  const result = await getXrplTransaction(txHash);
  if (!result.validated) {
    await admin.from("wallet_test_challenges").update({ status: "pending", transaction_hash: txHash }).eq("id", challenge.id);
    return { ok: true, pending: true, stage: "ledger-validation", transactionHash: txHash };
  }
  const tx = transaction(result);
  const checks = {
    validated: result.validated === true,
    result: transactionResult(result) === "tesSUCCESS",
    transactionType: tx.TransactionType === "Payment",
    account: tx.Account === challenge.wallet_address,
    destination: tx.Destination === challenge.destination_wallet,
    amount: String(tx.Amount) === String(challenge.amount_drops),
    sourceTag: Number(tx.SourceTag) === Number(challenge.source_tag),
    memo: memoMatches(tx, challenge.memo_text),
  };
  if (Object.values(checks).some((value) => value !== true)) {
    await admin.from("wallet_test_challenges").update({ status: "failed", transaction_hash: txHash, error_message: "Validated transaction did not match every one-time challenge field." }).eq("id", challenge.id);
    throw new Error("The validated XRPL transaction does not match the one-time OTT wallet-test challenge.");
  }

  const now = new Date().toISOString();
  const { data: storedResult, error: resultError } = await admin
    .from("wallet_test_results")
    .upsert({
      challenge_id: challenge.id,
      user_id: user.id,
      provider_id: challenge.provider_id,
      wallet_address: challenge.wallet_address,
      transaction_hash: txHash,
      score: 100,
      checks,
      status: "validated",
      validated_at: now,
    }, { onConflict: "user_id,provider_id" })
    .select("id,provider_id,wallet_address,transaction_hash,score,status,validated_at")
    .single();
  if (resultError || !storedResult) throw new Error("The validated wallet test could not be stored.");

  await admin.from("wallet_test_challenges").update({ status: "validated", transaction_hash: txHash, validated_at: now, error_message: null }).eq("id", challenge.id);
  await admin.from("ott_wallet_links").upsert({
    user_id: user.id,
    wallet_address: challenge.wallet_address,
    provider_id: challenge.provider_id,
    network: "mainnet",
    verification_method: "signed",
    status: "verified",
    xaman_payload_uuid: challenge.xaman_payload_uuid,
    proof_transaction_hash: txHash,
    verified_at: now,
    last_tested_at: now,
    revoked_at: null,
    error_message: null,
  }, { onConflict: "user_id,wallet_address" });

  return { ok: true, pending: false, result: storedResult, status: await statusResponse(admin, user) };
}

async function claimReward(admin: SupabaseClient, user: User, body: Record<string, unknown>) {
  const resultId = stringValue(body.resultId);
  if (!isUuid(resultId)) throw new Error("A valid 100 percent wallet-test result is required.");
  const { data: result, error } = await admin
    .from("wallet_test_results")
    .select("id,user_id")
    .eq("id", resultId)
    .eq("user_id", user.id)
    .eq("status", "validated")
    .eq("score", 100)
    .single();
  if (error || !result) throw new Error("The wallet-test result is not eligible for this account.");

  const { data, error: reserveError } = await admin.rpc("reserve_ott_wallet_tester_pass", { p_result_id: resultId });
  if (reserveError) throw new Error(reserveError.message || "The Wallet Tester Pass could not be reserved.");
  const reservation = Array.isArray(data) ? data[0] : data;
  return { ok: true, reservation, status: await statusResponse(admin, user) };
}

function metadataResponse(serialRaw: string) {
  const serial = Number(serialRaw);
  if (!Number.isInteger(serial) || serial < 1 || serial > 100000) return null;
  const number = String(serial).padStart(6, "0");
  return {
    name: `OTT Wallet Tester Pass #${number}`,
    description: "Proof that the holder completed a server-validated OTT wallet integration test. Utility and recognition only; no value, yield or governance promise.",
    image: `${PUBLIC_APP_URL}/nft/wallet-tester-pass.svg`,
    external_url: `${PUBLIC_APP_URL}/?tab=wallet`,
    attributes: [
      { trait_type: "Collection", value: "OTT Wallet Tester Pass" },
      { trait_type: "Serial", value: number },
      { trait_type: "SourceTag", value: String(SOURCE_TAG) },
      { trait_type: "Proof standard", value: "Validated XRPL challenge" },
      { trait_type: "Utility", value: "Public tester recognition" },
    ],
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method === "GET" && stringValue(req.query?.action) === "metadata") {
    const metadata = metadataResponse(stringValue(req.query?.serial));
    if (!metadata) return res.status(400).json({ ok: false, error: "Invalid tester-pass serial." });
    res.setHeader?.("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).json(metadata);
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed." });

  const admin = adminClient();
  if (!admin) return res.status(200).json({ ok: true, configured: false, setupRequired: true, providers: [] });
  const action = stringValue(req.body?.action) || "status";
  const user = await authenticate(admin, req);

  try {
    if (action === "status") return res.status(200).json(await statusResponse(admin, user));
    if (!user) return res.status(401).json({ ok: false, error: "Sign in to create or verify a public wallet test." });
    if (action === "create") return res.status(200).json(await createChallenge(admin, user, req.body ?? {}));
    if (action === "verify") return res.status(200).json(await verifyChallenge(admin, user, req.body ?? {}));
    if (action === "claim") return res.status(200).json(await claimReward(admin, user, req.body ?? {}));
    return res.status(400).json({ ok: false, error: "Unknown wallet-test action." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Wallet-test action failed.";
    if (setupRequired(error)) return res.status(200).json({ ok: true, configured: true, setupRequired: true, providers: [], error: message });
    return res.status(409).json({ ok: false, error: message });
  }
}
