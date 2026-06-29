import {
  MAKE_WAVES_DAILY_CHECKIN_MEMO,
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesMemo,
  type MakeWavesActionId,
} from "./makeWaves";

export { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type CreateXamanPayloadInput = {
  userWallet?: string;
  destinationWallet: string;
  amountDrops?: string;
  memoText?: string;
  actionId?: MakeWavesActionId;
};

export type XamanCreatePayloadResponse = {
  ok: boolean;
  actionId?: MakeWavesActionId;
  sourceTag?: number;
  transactionMeta?: unknown;
  payload?: {
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
  error?: string;
  details?: unknown;
};

export type XamanVerifyPayloadResponse = {
  ok: boolean;
  actionId?: MakeWavesActionId;
  makeWavesSourceTag?: number;
  statusLine?: string;
  verified?: {
    signed: boolean;
    resolved: boolean;
    txHash: string | null;
    account: string | null;
    sourceTag: number | null;
    sourceTagMatches: boolean;
    rewardAllowed: boolean;
    xp?: number;
  };
  payload?: unknown;
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

export async function createMakeWavesPayload(
  input: CreateXamanPayloadInput
): Promise<XamanCreatePayloadResponse> {
  const actionId = input.actionId ?? "daily-checkin";

  return postJson<XamanCreatePayloadResponse, CreateXamanPayloadInput>(
    "/api/xaman/create-payload",
    {
      amountDrops: "1000000",
      memoText: input.memoText ?? getMakeWavesMemo(actionId),
      ...input,
      actionId,
    }
  );
}

export async function createDailyCheckInPayload(input: {
  userWallet?: string;
  destinationWallet: string;
  amountDrops?: string;
}): Promise<XamanCreatePayloadResponse> {
  return createMakeWavesPayload({
    ...input,
    actionId: "daily-checkin",
    memoText: MAKE_WAVES_DAILY_CHECKIN_MEMO,
  });
}

export async function createSourceTagProofPayload(input: {
  userWallet?: string;
  destinationWallet: string;
  amountDrops?: string;
}): Promise<XamanCreatePayloadResponse> {
  return createMakeWavesPayload({
    ...input,
    actionId: "source-tag-proof",
    memoText: getMakeWavesMemo("source-tag-proof"),
  });
}

export async function verifyMakeWavesPayload(
  uuid: string
): Promise<XamanVerifyPayloadResponse> {
  return postJson<XamanVerifyPayloadResponse, { uuid: string }>(
    "/api/xaman/verify-payload",
    { uuid }
  );
}

export function getXamanPayloadUuid(
  response: XamanCreatePayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getXamanPayloadUrl(
  response: XamanCreatePayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getXamanPayloadQr(
  response: XamanCreatePayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openXamanPayload(response: XamanCreatePayloadResponse | null) {
  const url = getXamanPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isMakeWavesRewardAllowed(
  response: XamanVerifyPayloadResponse | null
): boolean {
  return Boolean(
    response?.verified?.rewardAllowed &&
      response.verified.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}

export function getMakeWavesVerificationLabel(
  response: XamanVerifyPayloadResponse | null
) {
  if (!response?.verified) {
    return "Not verified yet";
  }

  if (isMakeWavesRewardAllowed(response)) {
    return `Verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  if (!response.verified.signed) {
    return "Payload not signed";
  }

  if (!response.verified.sourceTagMatches) {
    return `Wrong SourceTag. Expected ${MAKE_WAVES_SOURCE_TAG}`;
  }

  return "Verification incomplete";
}
