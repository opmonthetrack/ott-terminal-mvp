export type SupportAmount = "0.589" | "1.589" | "2.589";

export type SupportStats = {
  totalXrp: string;
  totalDrops?: string;
  paymentCount: number;
  uniqueSupporters: number;
  publicMessageCount: number;
  latestPaymentAt?: string | null;
  updatedAt?: string;
};

export type PublicSupporter = {
  name: string;
  account: string;
  amountXrp: string;
  date: string | null;
};

export type XamanSupportPayload = {
  uuid?: string;
  next?: { always?: string; no_push_msg_received?: string };
  refs?: { qr_png?: string };
  meta?: { signed?: boolean; resolved?: boolean };
  response?: { account?: string; txid?: string };
};

type SupportResponse = {
  ok: boolean;
  stats?: SupportStats;
  latestPublicSupporters?: PublicSupporter[];
  payload?: XamanSupportPayload;
  verified?: {
    signed: boolean;
    resolved: boolean;
    payerAccount: string | null;
    txid: string | null;
  };
  support?: {
    amountXrp: string;
    amountDrops: string;
    destinationWallet: string;
    hasPublicMessage: boolean;
  };
  error?: string;
};

async function request(body: Record<string, unknown>) {
  const response = await fetch("/api/support-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  let data: SupportResponse;
  try {
    data = await response.json() as SupportResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }

  if (!response.ok || !data.ok) throw data;
  return data;
}

export function loadSupportStats() {
  return request({ action: "xrpl.getSupportStats" });
}

export function createSupportPayment(input: {
  amountXrp: SupportAmount;
  supporterName?: string;
  publicMessage?: string;
  publicConsent?: boolean;
}) {
  return request({ action: "xaman.createSupportPaymentPayload", ...input });
}

export function verifySupportPayment(uuid: string) {
  return request({ action: "xaman.verifySupportPaymentPayload", uuid });
}
