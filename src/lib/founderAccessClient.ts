import { ottSupabase } from "./ottAuth";
import type { PremiumGrant, WalletLink } from "./premiumAccessClient";

export type FounderAccessScope =
  | "academy-premium"
  | "wallet-academy"
  | "research-pro"
  | "all-premium";

export type FounderTarget = {
  type: "account" | "wallet";
  userId?: string;
  email?: string | null;
  name?: string | null;
  walletAddress?: string;
  linkedUsers?: Array<{ id: string; email: string | null; name: string | null }>;
};

export type FounderGrantUser = {
  id: string;
  email: string | null;
  name: string | null;
};

export type FounderAccessResponse = {
  ok: boolean;
  setupRequired?: boolean;
  eventType?: string;
  grants?: PremiumGrant[];
  users?: FounderGrantUser[];
  walletLinks?: WalletLink[];
  targets?: FounderTarget[];
  grant?: PremiumGrant;
  error?: string;
};

async function authHeaders() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error("Log eerst in met het founderaccount.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parse(response: Response) {
  let data: FounderAccessResponse;
  try {
    data = await response.json() as FounderAccessResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return data;
}

export async function loadFounderAccessGrants() {
  const response = await fetch("/api/access-payment?scope=grants", {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parse(response);
}

export async function searchFounderAccessTarget(query: string) {
  const response = await fetch("/api/access-payment?scope=grants", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "search", query }),
  });
  return parse(response);
}

export async function createFounderAccessGrant(input: {
  targetUserId?: string;
  walletAddress?: string;
  accessScope: FounderAccessScope;
  reason: string;
  startsAt?: string;
  expiresAt?: string;
}) {
  const response = await fetch("/api/access-payment?scope=grants", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "create", ...input }),
  });
  return parse(response);
}

export async function revokeFounderAccessGrant(grantId: string) {
  const response = await fetch("/api/access-payment?scope=grants", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "revoke", grantId }),
  });
  return parse(response);
}
