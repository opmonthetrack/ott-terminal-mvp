import { ottSupabase } from "./ottAuth";

export type CertificateLifecycleStep =
  | "reserved"
  | "mint-signing"
  | "minted"
  | "offer-signing"
  | "offer-created"
  | "accept-signing"
  | "issued"
  | "failed";

export type AcademyCertificateClaim = {
  id: string;
  status: "eligible" | "reserved" | "pending" | "issued" | "failed" | string;
  lifecycle_step?: CertificateLifecycleStep | string;
  serial_number: number;
  serial?: string;
  wallet_address: string;
  qualification_score?: number | null;
  qualification_course_count?: number | null;
  transaction_hash?: string | null;
  metadata_uri?: string | null;
  mint_transaction_hash?: string | null;
  nftoken_id?: string | null;
  offer_transaction_hash?: string | null;
  transfer_offer_id?: string | null;
  accept_payload_uuid?: string | null;
  accept_transaction_hash?: string | null;
  error_message?: string | null;
  minted_at?: string | null;
  offer_created_at?: string | null;
  issued_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type XamanCreatedPayload = {
  uuid?: string;
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    websocket_status?: string;
  };
  meta?: {
    signed?: boolean;
    resolved?: boolean;
  };
  response?: {
    account?: string;
    txid?: string;
  };
};

export type AcademyCertificateClaimResponse = {
  ok: boolean;
  alreadyExists?: boolean;
  pending?: boolean;
  stage?: string;
  eligibility?: {
    completedCount: number;
    requiredCount: number;
    averageScore: number;
  };
  claim?: AcademyCertificateClaim | null;
  payload?: XamanCreatedPayload;
  error?: string;
};

async function getSessionToken() {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;

  if (!session?.access_token) {
    throw new Error("Sign in before using the Foundation Certificate NFT flow.");
  }

  return session.access_token;
}

async function parseResponse(response: Response) {
  const data = (await response.json()) as AcademyCertificateClaimResponse;
  if (!response.ok) {
    throw data;
  }
  return data;
}

export async function reserveAcademyFoundationCertificate(walletAddress: string) {
  const token = await getSessionToken();
  const response = await fetch("/api/academy-certificate-claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ walletAddress }),
  });

  return parseResponse(response);
}

export async function getAcademyFoundationCertificateStatus() {
  const token = await getSessionToken();
  const response = await fetch("/api/certificate?scope=status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function createAcademyCertificateAcceptPayload() {
  const token = await getSessionToken();
  const response = await fetch("/api/certificate?scope=transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "create-accept" }),
  });

  return parseResponse(response);
}

export async function verifyAcademyCertificateAcceptPayload() {
  const token = await getSessionToken();
  const response = await fetch("/api/certificate?scope=transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "verify-accept" }),
  });

  return parseResponse(response);
}
