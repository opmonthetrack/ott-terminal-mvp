import {
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesAction,
  type MakeWavesActionId,
} from "./makeWaves";

export { MAKE_WAVES_SOURCE_TAG };

export type XamanPayloadShape = {
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

export type CreateMakeWavesPayloadInput = {
  actionId: MakeWavesActionId;
  walletAddress?: string;
  destinationWallet?: string;
  amountDrops?: string;
};

export type XamanPayloadResponse = {
  ok: boolean;
  mode?: string;
  sourceTag?: number;
  action?: {
    id: MakeWavesActionId;
    title: string;
    xp: number;
  };
  payload?: XamanPayloadShape;
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

export type XamanPayloadVerificationResponse = {
  ok: boolean;
  sourceTag?: number;
  verified?: {
    signed: boolean;
    resolved: boolean;
    account: string | null;
    txid: string | null;
    sourceTag: number | null;
    actionId: MakeWavesActionId;
    xp: number;
    makeWavesVerified: boolean;
    ledgerStatus: "not-signed" | "pending" | "verified" | "failed";
    validated: boolean;
    success: boolean;
    transactionResult: string | null;
    transactionType: string | null;
    destination: string | null;
    amountDrops: string | null;
    sourceTagMatches: boolean;
    walletMatches: boolean;
    xamanAccountMatchesTx: boolean;
    destinationMatches: boolean;
    amountMatches: boolean;
    memoMatches: boolean;
    memoTypeMatches: boolean;
  };
  payload?: unknown;
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

export async function createMakeWavesPayload(
  input: CreateMakeWavesPayloadInput
): Promise<XamanPayloadResponse> {
  return postOtt<XamanPayloadResponse, CreateMakeWavesPayloadInput>(
    "xaman.createMakeWavesPayload",
    input
  );
}

export async function createDailyCheckInPayload(
  walletAddress?: string
): Promise<XamanPayloadResponse> {
  return createMakeWavesPayload({
    actionId: "daily-checkin",
    walletAddress,
  });
}

export async function createSourceTagProofPayload(
  walletAddress?: string
): Promise<XamanPayloadResponse> {
  return createMakeWavesPayload({
    actionId: "source-tag-proof",
    walletAddress,
  });
}

export async function verifyMakeWavesPayload(
  uuid: string,
  actionId: MakeWavesActionId = "daily-checkin",
  expectedWallet?: string
): Promise<XamanPayloadVerificationResponse> {
  return postOtt<
    XamanPayloadVerificationResponse,
    {
      uuid: string;
      actionId: MakeWavesActionId;
      expectedWallet?: string;
    }
  >("xaman.verifyMakeWavesPayload", {
    uuid,
    actionId,
    expectedWallet,
  });
}

export function getXamanPayloadUuid(
  response: XamanPayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getXamanPayloadUrl(
  response: XamanPayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getXamanPayloadQr(
  response: XamanPayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openXamanPayload(response: XamanPayloadResponse | null) {
  const url = getXamanPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isMakeWavesRewardAllowed(
  response: XamanPayloadVerificationResponse | null,
  actionId: MakeWavesActionId
) {
  const action = getMakeWavesAction(actionId);

  return Boolean(
    response?.verified?.makeWavesVerified &&
      response.verified.validated &&
      response.verified.success &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG &&
      response.verified.xp === action.xp
  );
}

export function getMakeWavesVerificationLabel(
  response: XamanPayloadVerificationResponse | null
) {
  const verified = response?.verified;

  if (!verified) {
    return "No Xaman payload verified yet";
  }

  if (verified.makeWavesVerified) {
    return `XRPL Mainnet transaction verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (verified.ledgerStatus === "pending") {
    return "Transaction signed. Waiting for XRPL Mainnet validation; verify again shortly";
  }

  if (verified.signed && verified.ledgerStatus === "failed") {
    return `Signed, but reward verification failed (${verified.transactionResult ?? "ledger checks failed"})`;
  }

  return "Xaman payload not signed yet";
}
