import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type VerifyProofStampInput = {
  txHash: string;
  expectedWallet?: string;
  expectedDestination?: string;
  expectedAmountDrops?: string;
  expectedMemoContains?: string;
};

export type ProofStampMemoText = {
  type: string;
  data: string;
  format: string;
};

export type ProofStampVerification = {
  proofStampVerified: boolean;
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
  hasProofMemo: boolean;
  memoText: ProofStampMemoText[];
  ledgerIndex: number | null;
};

export type VerifyProofStampResponse = {
  ok: boolean;
  makeWavesSourceTag?: number;
  txHash?: string;
  verified?: ProofStampVerification;
  xrpl?: unknown;
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

export async function verifyProofStamp(
  input: VerifyProofStampInput
): Promise<VerifyProofStampResponse> {
  return postJson<VerifyProofStampResponse, VerifyProofStampInput>(
    "/api/xrpl/verify-proof-stamp",
    input
  );
}

export function isProofStampVerified(
  response: VerifyProofStampResponse | null
): boolean {
  return Boolean(
    response?.verified?.proofStampVerified &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}

export function getProofStampVerificationLabel(
  response: VerifyProofStampResponse | null
) {
  if (!response?.verified) {
    return "No Proof Stamp verified yet";
  }

  if (isProofStampVerified(response)) {
    return `Proof Stamp verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
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

  if (!response.verified.hasProofMemo) {
    return "Proof Stamp memo not found";
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

  return "Proof Stamp verification incomplete";
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

  return "Unknown Proof Stamp verification error.";
}

export function shortProofStampHash(txHash: string | null | undefined) {
  if (!txHash) {
    return "No tx hash";
  }

  if (txHash.length <= 16) {
    return txHash;
  }

  return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
}
