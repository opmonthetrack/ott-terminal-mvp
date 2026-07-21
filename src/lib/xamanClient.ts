import {
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesAction,
  type MakeWavesActionId,
} from "./makeWaves";
import { addMainnetLockedEvent, addXpRewardEvent } from "./rewardStore";

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
  voteId?: string;
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
    ledgerValidated: boolean;
    transactionResult: string;
    sourceTagMatches: boolean;
    accountMatches: boolean;
    actionMemoMatches: boolean;
    isPayment: boolean;
    ledgerIndex: number | null;
  };
  payload?: unknown;
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

function hasXamanReturnFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);

  return (
    params.get("xaman_return") === "1" ||
    params.get("ott_xaman_return") === "1"
  );
}

function creditXamanReturnReward(
  response: XamanPayloadVerificationResponse,
  actionId: MakeWavesActionId,
) {
  if (!hasXamanReturnFlag()) {
    return;
  }

  if (!isMakeWavesRewardAllowed(response, actionId)) {
    return;
  }

  const walletAddress = response.verified?.account;

  if (!walletAddress) {
    return;
  }

  addXpRewardEvent({
    walletAddress,
    actionId,
    txHash: response.verified?.txid,
    note: `${getMakeWavesAction(actionId).title} validated from Xaman mobile return with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
  });

  addMainnetLockedEvent({
    walletAddress,
    actionId,
    txHash: response.verified?.txid,
    note: "Future on-chain OTT token conversion stays disabled until utility, profitability and legal review are complete.",
  });
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
  actionId: MakeWavesActionId = "daily-checkin"
): Promise<XamanPayloadVerificationResponse> {
  const response = await postOtt<
    XamanPayloadVerificationResponse,
    { uuid: string; actionId: MakeWavesActionId }
  >("xaman.verifyMakeWavesPayload", {
    uuid,
    actionId,
  });

  creditXamanReturnReward(response, actionId);

  return response;
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
      response.verified.ledgerValidated &&
      response.verified.transactionResult === "tesSUCCESS" &&
      response.verified.sourceTagMatches &&
      response.verified.accountMatches &&
      response.verified.actionMemoMatches &&
      response.verified.xp === action.xp
  );
}

export function getMakeWavesVerificationLabel(
  response: XamanPayloadVerificationResponse | null
) {
  if (!response?.verified) {
    return "No Xaman payload verified yet";
  }

  if (response.verified.makeWavesVerified) {
    return `XRPL Mainnet transaction validated with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (response.verified.signed && !response.verified.ledgerValidated) {
    return "Xaman payload signed; XRPL validation is still pending. Try again shortly";
  }

  if (response.verified.signed) {
    return "Xaman payload signed, but the XRPL transaction did not pass every proof check";
  }

  return "Xaman payload not signed yet";
}
