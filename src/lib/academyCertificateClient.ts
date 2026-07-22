import { ottSupabase } from "./ottAuth";

export type AcademyCertificateClaimResponse = {
  ok: boolean;
  alreadyExists?: boolean;
  eligibility?: {
    completedCount: number;
    requiredCount: number;
    averageScore: number;
  };
  claim?: {
    id: string;
    status: string;
    serial_number: number;
    serial: string;
    wallet_address: string;
    transaction_hash?: string | null;
    metadata_uri?: string | null;
    created_at: string;
    updated_at: string;
  };
  error?: string;
};

export async function reserveAcademyFoundationCertificate(walletAddress: string) {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;

  if (!session?.access_token) {
    throw new Error("Sign in before reserving the Foundation Certificate NFT.");
  }

  const response = await fetch("/api/academy-certificate-claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ walletAddress }),
  });
  const data = (await response.json()) as AcademyCertificateClaimResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}
