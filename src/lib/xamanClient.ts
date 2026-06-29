import {
  MAKE_WAVES_SOURCE_TAG,
  isMakeWavesSourceTag,
} from "./makeWaves";

export type VerifyXrplTransactionInput = {
  txHash: string;
  expectedAccount?: string;
  expectedDestination?: string;
};

export type XrplTransactionVerification = {
  makeWavesVerified: boolean;
  validated: boolean;
  success: boolean;
  transactionResult: string;
  sourceTag: number | null;
  sourceTagMatches: boolean;
  account: string | null;
  destination: string | null;
  accountMatches: boolean;
  destinationMatches: boolean;
  transactionType: string | null;
  ledgerIndex: number | null;
};

export type VerifyXrplTransactionResponse = {
  ok: boolean;
  makeWavesSourceTag?: number;
  txHash?: string;
  verified?: XrplTransactionVerification;
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

export async function verifyXrplTransaction(
  input: VerifyXrplTransactionInput
): Promise<VerifyXrplTransactionResponse> {
  return postJson<VerifyXrplTransactionResponse, VerifyXrplTransactionInput>(
    "/api/xrpl/verify-transaction",
    input
  );
}

export function isMakeWavesTransactionVerified(
  response: VerifyXrplTransactionResponse | null
): boolean {
  return Boolean(
    response?.verified?.makeWavesVerified &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}

export function getXrplVerificationLabel(
  response: VerifyXrplTransactionResponse | null
) {
  if (!response?.verified) {
    return "No transaction verified yet";
  }

  if (isMakeWavesTransactionVerified(response)) {
    return `XRPL verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.validated) {
    return "Transaction is not validated yet";
  }

  if (!response.verified.success) {
    return `Transaction failed: ${response.verified.transactionResult}`;
  }

  if (!isMakeWavesSourceTag(response.verified.sourceTag)) {
    return `Wrong SourceTag. Expected ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.accountMatches) {
    return "Account does not match expected wallet";
  }

  if (!response.verified.destinationMatches) {
    return "Destination does not match expected wallet";
  }

  return "XRPL verification incomplete";
}

export function shortTxHash(txHash: string | null | undefined) {
  if (!txHash) {
    return "No tx hash";
  }

  if (txHash.length <= 16) {
    return txHash;
  }

  return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
}
