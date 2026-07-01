import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type VerifyTruthDeskPaymentInput = {
  txHash: string;
  expectedWallet?: string;
  expectedDestination?: string;
  expectedAmountDrops?: string;
  expectedMemoContains?: string;
};

export type TruthDeskMemoText = {
  type: string;
  data: string;
  format: string;
};

export type TruthDeskPaymentVerification = {
  truthDeskPaymentVerified: boolean;
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
  hasTruthDeskMemo: boolean;
  memoText: TruthDeskMemoText[];
  ledgerIndex: number | null;
};

export type VerifyTruthDeskPaymentResponse = {
  ok: boolean;
  makeWavesSourceTag?: number;
  txHash?: string;
  verified?: TruthDeskPaymentVerification;
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

export async function verifyTruthDeskPayment(
  input: VerifyTruthDeskPaymentInput
): Promise<VerifyTruthDeskPaymentResponse> {
  return postOtt<VerifyTruthDeskPaymentResponse, VerifyTruthDeskPaymentInput>(
    "xrpl.verifyTruthDeskPayment",
    input
  );
}

export function isTruthDeskPaymentVerified(
  response: VerifyTruthDeskPaymentResponse | null
): boolean {
  return Boolean(
    response?.verified?.truthDeskPaymentVerified &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}

export function getTruthDeskVerificationLabel(
  response: VerifyTruthDeskPaymentResponse | null
) {
  if (!response?.verified) {
    return "No Truth Desk payment verified yet";
  }

  if (isTruthDeskPaymentVerified(response)) {
    return `Truth Desk payment verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
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
    return `Wrong SourceTag. Expected ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.hasTruthDeskMemo) {
    return "Truth Desk memo not found";
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

  return "Truth Desk payment verification incomplete";
}

export function getTruthDeskVerifyErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Truth Desk payment verification error.";
}

export function shortTruthDeskHash(txHash: string | null | undefined) {
  if (!txHash) {
    return "No tx hash";
  }

  if (txHash.length <= 16) {
    return txHash;
  }

  return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
}
