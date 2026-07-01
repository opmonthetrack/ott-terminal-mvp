import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type VerifyXrplTransactionInput = {
  txHash: string;
  expectedWallet?: string;
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
  transactionType: string | null;
  walletMatches: boolean;
  ledgerIndex: number | null;
  xp?: number;
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

export async function verifyXrplTransaction(
  input: VerifyXrplTransactionInput
): Promise<VerifyXrplTransactionResponse> {
  return postOtt<VerifyXrplTransactionResponse, VerifyXrplTransactionInput>(
    "xrpl.verifyTransaction",
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
    return "No XRPL transaction verified yet";
  }

  if (isMakeWavesTransactionVerified(response)) {
    return `XRPL transaction verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
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

  if (!response.verified.walletMatches) {
    return "Wallet address does not match";
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
