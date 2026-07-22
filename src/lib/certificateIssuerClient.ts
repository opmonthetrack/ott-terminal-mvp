import { ottSupabase } from "./ottAuth";
import type { AcademyCertificateClaim, XamanCreatedPayload } from "./academyCertificateClient";

export type CertificateIssuerAction =
  | "create-mint"
  | "verify-mint"
  | "create-offer"
  | "verify-offer";

export type CertificateIssuerResponse = {
  ok: boolean;
  pending?: boolean;
  stage?: string;
  queue?: AcademyCertificateClaim[];
  claim?: AcademyCertificateClaim;
  payload?: XamanCreatedPayload;
  xrpl?: Record<string, unknown>;
  error?: string;
};

async function getSessionToken() {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;

  if (!session?.access_token) {
    throw new Error("Log eerst in met het geautoriseerde OTT-founderaccount.");
  }

  return session.access_token;
}

async function parseResponse(response: Response) {
  const data = (await response.json()) as CertificateIssuerResponse;
  if (!response.ok) throw data;
  return data;
}

export async function loadCertificateIssuerQueue() {
  const token = await getSessionToken();
  const response = await fetch("/api/certificate?scope=issuer", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}

export async function runCertificateIssuerAction(
  claimId: string,
  action: CertificateIssuerAction,
) {
  const token = await getSessionToken();
  const response = await fetch("/api/certificate?scope=issuer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ claimId, action }),
  });
  return parseResponse(response);
}
