import { ottSupabase } from "./ottAuth";

export type PremiumEntitlements = {
  accessPassIssued: boolean;
  allPremium: boolean;
  academyPremium: boolean;
  walletAcademy: boolean;
  researchPro: boolean;
};

export type PremiumGrant = {
  id: string;
  target_user_id: string | null;
  wallet_address: string | null;
  access_scope: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  reason: string;
  created_at: string;
  updated_at: string;
};

export type WalletLink = {
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

export type PremiumAccessResponse = {
  ok: boolean;
  setupRequired?: boolean;
  pending?: boolean;
  entitlements?: PremiumEntitlements;
  grants?: PremiumGrant[];
  walletLinks?: WalletLink[];
  requestedWallet?: string | null;
  walletLinked?: boolean;
  walletGrantAvailable?: boolean;
  walletLink?: WalletLink;
  payload?: {
    uuid?: string;
    meta?: { signed?: boolean; resolved?: boolean };
    response?: { account?: string };
    next?: { always?: string; no_push_msg_received?: string };
    refs?: { qr_png?: string; qr_matrix?: string; websocket_status?: string };
  };
  error?: string;
};

const EMPTY_ENTITLEMENTS: PremiumEntitlements = {
  accessPassIssued: false,
  allPremium: false,
  academyPremium: false,
  walletAcademy: false,
  researchPro: false,
};

async function authHeaders() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error("Log eerst in met je OTT-account.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parseResponse(response: Response) {
  let data: PremiumAccessResponse;
  try {
    data = await response.json() as PremiumAccessResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return {
    ...data,
    entitlements: data.entitlements ?? EMPTY_ENTITLEMENTS,
    grants: data.grants ?? [],
    walletLinks: data.walletLinks ?? [],
  };
}

export async function loadPremiumAccessStatus(walletAddress?: string) {
  const query = new URLSearchParams({ scope: "grant-status" });
  if (walletAddress) query.set("wallet", walletAddress);
  const response = await fetch(`/api/access-payment?${query.toString()}`, {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parseResponse(response);
}

export async function createWalletProof(walletAddress: string) {
  const response = await fetch("/api/access-payment?scope=wallet-link", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "create", walletAddress }),
  });
  return parseResponse(response);
}

export async function verifyWalletProof(payloadUuid: string) {
  const response = await fetch("/api/access-payment?scope=wallet-link", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "verify", payloadUuid }),
  });
  return parseResponse(response);
}

export async function revokeWalletLink(walletAddress: string) {
  const response = await fetch("/api/access-payment?scope=wallet-link", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "revoke", walletAddress }),
  });
  return parseResponse(response);
}

export { EMPTY_ENTITLEMENTS };
