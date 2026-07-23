import { ottSupabase } from "./ottAuth";
import type { AccessPassClaim, XamanAccessPayload } from "./accessPassOrderClient";

export type AccessPassIssuerAction = "create-mint" | "verify-mint" | "create-offer" | "verify-offer";

export type AccessPassReadinessCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  blocking: boolean;
};

export type AccessPassReadiness = {
  ready: boolean;
  safeToTest: boolean;
  safeForMainnet: boolean;
  network: string;
  testnetValidated: boolean;
  checks: AccessPassReadinessCheck[];
};

type IssuerResponse = {
  ok: boolean;
  stage?: string;
  queue?: AccessPassClaim[];
  claim?: AccessPassClaim;
  payload?: XamanAccessPayload;
  readiness?: AccessPassReadiness;
  error?: string;
};

async function authHeaders() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error("Log eerst in met het toegestane founderaccount.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parse(response: Response) {
  let data: IssuerResponse;
  try {
    data = await response.json() as IssuerResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return data;
}

export async function loadAccessPassReadiness() {
  const response = await fetch("/api/access-payment?scope=readiness", {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parse(response);
}

export async function loadAccessPassIssuerQueue() {
  const response = await fetch("/api/access-payment?scope=issuer", {
    method: "GET",
    headers: await authHeaders(),
  });
  return parse(response);
}

export async function runAccessPassIssuerAction(claimId: string, action: AccessPassIssuerAction) {
  const response = await fetch("/api/access-payment?scope=issuer", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ claimId, action }),
  });
  return parse(response);
}
