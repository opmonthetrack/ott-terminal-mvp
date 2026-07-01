import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";
import type { PartnerEducationCard, PartnerId } from "./partnerCatalog";

export type ProofStampPayloadShape = {
  uuid?: string;
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    websocket_status?: string;
  };
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
};

export type CreateProofStampPayloadInput = {
  walletAddress?: string;
  destinationWallet?: string;
  partnerId: PartnerId;
  routeName: string;
  amountDrops?: string;
};

export type ProofStampPayloadResponse = {
  ok: boolean;
  mode?: "partner-proof-stamp";
  sourceTag?: number;
  route?: {
    partnerId: string;
    routeName: string;
  };
  payment?: {
    destinationWallet: string;
    amountDrops: string;
  };
  payload?: ProofStampPayloadShape;
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

async function postJson<TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function createProofStampPayload(
  input: CreateProofStampPayloadInput
): Promise<ProofStampPayloadResponse> {
  return postJson<ProofStampPayloadResponse, CreateProofStampPayloadInput>(
    "/api/xaman/create-proof-stamp-payload",
    {
      amountDrops: "1",
      ...input,
    }
  );
}

export function buildProofStampInput(
  partner: PartnerEducationCard,
  walletAddress?: string,
  destinationWallet?: string
): CreateProofStampPayloadInput {
  return {
    walletAddress,
    destinationWallet,
    partnerId: partner.id,
    routeName: partner.name,
    amountDrops: "1",
  };
}

export function getProofStampPayloadUuid(
  response: ProofStampPayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getProofStampPayloadUrl(
  response: ProofStampPayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getProofStampPayloadQr(
  response: ProofStampPayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openProofStampPayload(response: ProofStampPayloadResponse | null) {
  const url = getProofStampPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isProofStampPayloadReady(
  response: ProofStampPayloadResponse | null
) {
  return Boolean(
    response?.ok &&
      response.sourceTag === MAKE_WAVES_SOURCE_TAG &&
      response.payload?.uuid
  );
}

export function getProofStampStatusLabel(
  response: ProofStampPayloadResponse | null
) {
  if (!response?.payload?.uuid) {
    return "No Proof Stamp payload created yet";
  }

  if (response.sourceTag === MAKE_WAVES_SOURCE_TAG) {
    return `Proof Stamp payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  return `Proof Stamp payload created, but SourceTag should be ${MAKE_WAVES_SOURCE_TAG}`;
}

export function getProofStampErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Proof Stamp error.";
}
