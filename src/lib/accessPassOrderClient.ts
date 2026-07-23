import { ottSupabase } from "./ottAuth";

export type AccessPassOrder = {
  id: string;
  user_id: string;
  customer_wallet: string;
  access_tier: string;
  price_drops: number;
  destination_wallet: string;
  source_tag: number;
  status: string;
  payment_payload_uuid: string | null;
  payment_tx_hash: string | null;
  payer_account: string | null;
  payment_validated_at: string | null;
  serial_number: number | null;
  serial?: string | null;
  issuance_record_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type AccessPassClaim = {
  id: string;
  user_id: string;
  status: string;
  lifecycle_step: string;
  serial_number: number;
  serial?: string;
  wallet_address: string | null;
  metadata_uri: string | null;
  mint_payload_uuid: string | null;
  mint_transaction_hash: string | null;
  nftoken_id: string | null;
  offer_payload_uuid: string | null;
  offer_transaction_hash: string | null;
  transfer_offer_id: string | null;
  accept_payload_uuid: string | null;
  accept_transaction_hash: string | null;
  transaction_hash: string | null;
  error_message: string | null;
  minted_at: string | null;
  offer_created_at: string | null;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
};

export type XamanAccessPayload = {
  uuid?: string;
  next?: { always?: string; no_push_msg_received?: string };
  refs?: { qr_png?: string; qr_matrix?: string; websocket_status?: string };
  meta?: { signed?: boolean; resolved?: boolean };
  response?: { account?: string; txid?: string };
};

export type AccessPassResponse = {
  ok: boolean;
  setupRequired?: boolean;
  stage?: string;
  pending?: boolean;
  alreadyPaid?: boolean;
  priceXrp?: string;
  order?: AccessPassOrder | null;
  claim?: AccessPassClaim | null;
  payload?: XamanAccessPayload;
  xrpl?: Record<string, unknown>;
  error?: string;
};

async function authHeaders() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error("Log eerst in met je OTT-account.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function readResponse(response: Response) {
  let data: AccessPassResponse;
  try {
    data = await response.json() as AccessPassResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return data;
}

export async function getAccessPassOrderStatus() {
  const response = await fetch("/api/access-payment?scope=status", {
    method: "GET",
    headers: await authHeaders(),
  });
  return readResponse(response);
}

export async function createAccessPassPayment(customerWallet: string) {
  const response = await fetch("/api/access-payment?scope=order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "create-payment", customerWallet, accessTier: "Alpha" }),
  });
  return readResponse(response);
}

export async function verifyAccessPassPayment(uuid?: string) {
  const response = await fetch("/api/access-payment?scope=order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "verify-payment", uuid }),
  });
  return readResponse(response);
}

export async function createAccessPassAcceptPayload() {
  const response = await fetch("/api/access-payment?scope=transfer", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "create-accept" }),
  });
  return readResponse(response);
}

export async function verifyAccessPassAcceptPayload() {
  const response = await fetch("/api/access-payment?scope=transfer", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "verify-accept" }),
  });
  return readResponse(response);
}
