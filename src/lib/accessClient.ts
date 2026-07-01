import { ACCESS_SOURCE_TAG, type AccessRoute, type AccessRouteId } from "./accessStore";

export type AccessPayloadShape = {
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

export type CreateAccessPaymentPayloadInput = {
  walletAddress?: string;
  destinationWallet?: string;
  routeId: AccessRouteId;
  routeTitle: string;
  proofMemo: string;
  amountDrops?: string;
};

export type AccessPaymentPayloadResponse = {
  ok: boolean;
  mode?: "terminal-access-payment";
  sourceTag?: number;
  access?: {
    routeId: string;
    routeTitle: string;
  };
  payment?: {
    destinationWallet: string;
    amountDrops: string;
  };
  payload?: AccessPayloadShape;
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

export type VerifyAccessPaymentInput = {
  txHash: string;
  expectedWallet?: string;
  expectedDestination?: string;
  expectedAmountDrops?: string;
  expectedMemoContains?: string;
};

export type AccessMemoText = {
  type: string;
  data: string;
  format: string;
};

export type AccessPaymentVerification = {
  accessPaymentVerified: boolean;
  validated: boolean;
  success: boolean;
  transactionResult: string;
  sourceTag: number | null;
  sourceTagMatches: boolean;
  account: string | null;
  destination: string | null;
  transactionType: string | null;
  isPayment: boolean;
  amountDrops: string | null;
  walletMatches: boolean;
  destinationMatches: boolean;
  amountMatches: boolean;
  memoMatches: boolean;
  hasAccessMemo: boolean;
  memoText: AccessMemoText[];
  ledgerIndex: number | null;
};

export type VerifyAccessPaymentResponse = {
  ok: boolean;
  makeWavesSourceTag?: number;
  txHash?: string;
  verified?: AccessPaymentVerification;
  xrpl?: unknown;
  error?: string;
  details?: unknown;
};

async function postOtt<TResponse, TBody extends Record<string, unknown>>(
  action: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch("/api/ott", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function createAccessPaymentPayload(
  input: CreateAccessPaymentPayloadInput
): Promise<AccessPaymentPayloadResponse> {
  return postOtt<AccessPaymentPayloadResponse, CreateAccessPaymentPayloadInput>(
    "xaman.createAccessPaymentPayload",
    input
  );
}

export async function verifyAccessPayment(
  input: VerifyAccessPaymentInput
): Promise<VerifyAccessPaymentResponse> {
  return postOtt<VerifyAccessPaymentResponse, VerifyAccessPaymentInput>(
    "xrpl.verifyAccessPayment",
    input
  );
}

export function buildAccessPaymentInput(
  route: AccessRoute,
  walletAddress?: string,
  destinationWallet?: string
): CreateAccessPaymentPayloadInput {
  return {
    walletAddress,
    destinationWallet,
    routeId: route.id,
    routeTitle: route.title,
    proofMemo: route.proofMemo,
    amountDrops: route.demoAmountDrops ?? "1000000",
  };
}

export function getAccessPayloadUuid(
  response: AccessPaymentPayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getAccessPayloadUrl(
  response: AccessPaymentPayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getAccessPayloadQr(
  response: AccessPaymentPayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openAccessPayload(response: AccessPaymentPayloadResponse | null) {
  const url = getAccessPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isAccessPayloadReady(
  response: AccessPaymentPayloadResponse | null
) {
  return Boolean(
    response?.ok &&
      response.sourceTag === ACCESS_SOURCE_TAG &&
      response.payload?.uuid
  );
}

export function isAccessPaymentVerified(
  response: VerifyAccessPaymentResponse | null
): boolean {
  return Boolean(
    response?.verified?.accessPaymentVerified &&
      response.verified.sourceTag === ACCESS_SOURCE_TAG
  );
}

export function getAccessPayloadStatusLabel(
  response: AccessPaymentPayloadResponse | null
) {
  if (!response?.payload?.uuid) {
    return "No Access payment payload created yet";
  }

  if (response.sourceTag === ACCESS_SOURCE_TAG) {
    return `Access payment payload ready with SourceTag ${ACCESS_SOURCE_TAG}`;
  }

  return `Access payment payload created, but SourceTag should be ${ACCESS_SOURCE_TAG}`;
}

export function getAccessVerificationLabel(
  response: VerifyAccessPaymentResponse | null
) {
  if (!response?.verified) {
    return "No Access payment verified yet";
  }

  if (isAccessPaymentVerified(response)) {
    return `Access payment verified with SourceTag ${ACCESS_SOURCE_TAG}`;
  }

  if (!response.verified.validated) {
    return "Transaction is not validated yet";
  }

  if (!response.verified.success) {
    return `Transaction failed: ${response.verified.transactionResult}`;
  }

  if (!response.verified.isPayment) {
    return "Transaction is not a Payment";
  }

  if (!response.verified.sourceTagMatches) {
    return `Wrong SourceTag. Expected ${ACCESS_SOURCE_TAG}`;
  }

  if (!response.verified.hasAccessMemo) {
    return "Access memo not found";
  }

  if (!response.verified.walletMatches) {
    return "Sender wallet does not match";
  }

  if (!response.verified.destinationMatches) {
    return "Destination wallet does not match";
  }

  if (!response.verified.amountMatches) {
    return "Payment amount does not match";
  }

  if (!response.verified.memoMatches) {
    return "Memo content does not match";
  }

  return "Access payment verification incomplete";
}

export function getAccessClientErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Access payment error.";
}

export function shortAccessTxHash(txHash: string | null | undefined) {
  if (!txHash) {
    return "No tx hash";
  }

  if (txHash.length <= 16) {
    return txHash;
  }

  return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
}
