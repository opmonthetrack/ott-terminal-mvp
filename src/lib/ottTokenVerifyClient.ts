import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type VerifyOttTokenPaymentInput = {
  txHash: string;
  expectedDestination?: string;
  expectedIssuer?: string;
  expectedCurrency?: string;
  expectedAmount?: string;
};

export type OttTokenPaymentVerification = {
  makeWavesTokenVerified: boolean;
  validated: boolean;
  success: boolean;
  transactionResult: string;
  sourceTag: number | null;
  sourceTagMatches: boolean;
  account: string | null;
  destination: string | null;
  transactionType: string | null;
  isPayment: boolean;
  isTokenPayment: boolean;
  token: {
    currency: string | null;
    issuer: string | null;
    amount: string | null;
  };
  checks: {
    currencyMatches: boolean;
    issuerMatches: boolean;
    destinationMatches: boolean;
    amountMatches: boolean;
    tokenPaymentMatches: boolean;
  };
  ledgerIndex: number | null;
};

export type VerifyOttTokenPaymentResponse = {
  ok: boolean;
  makeWavesSourceTag?: number;
  txHash?: string;
  verified?: OttTokenPaymentVerification;
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

export async function verifyOttTokenPayment(
  input: VerifyOttTokenPaymentInput
): Promise<VerifyOttTokenPaymentResponse> {
  return postJson<VerifyOttTokenPaymentResponse, VerifyOttTokenPaymentInput>(
    "/api/xrpl/verify-token-payment",
    input
  );
}

export function isOttTokenPaymentVerified(
  response: VerifyOttTokenPaymentResponse | null
): boolean {
  return Boolean(
    response?.verified?.makeWavesTokenVerified &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}

export function getOttTokenPaymentVerificationLabel(
  response: VerifyOttTokenPaymentResponse | null
) {
  if (!response?.verified) {
    return "No OTT token payment verified yet";
  }

  if (isOttTokenPaymentVerified(response)) {
    return `OTT token payment verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.validated) {
    return "Transaction is not validated yet";
  }

  if (!response.verified.success) {
    return `Transaction failed: ${response.verified.transactionResult}`;
  }

  if (!response.verified.sourceTagMatches) {
    return `Wrong SourceTag. Expected ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.isPayment) {
    return "Transaction is not a Payment";
  }

  if (!response.verified.isTokenPayment) {
    return "Transaction is not an issued token payment";
  }

  if (!response.verified.checks.currencyMatches) {
    return "Token currency does not match";
  }

  if (!response.verified.checks.issuerMatches) {
    return "Token issuer does not match";
  }

  if (!response.verified.checks.destinationMatches) {
    return "Destination wallet does not match";
  }

  if (!response.verified.checks.amountMatches) {
    return "Token amount does not match";
  }

  return "OTT token payment verification incomplete";
}

export function shortTokenPaymentHash(txHash: string | null | undefined) {
  if (!txHash) {
    return "No tx hash";
  }

  if (txHash.length <= 16) {
    return txHash;
  }

  return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
}
