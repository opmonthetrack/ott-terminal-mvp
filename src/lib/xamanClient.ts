export const MAKE_WAVES_SOURCE_TAG = 2606170002;

export type CreateXamanPayloadInput = {
  userWallet?: string;
  destinationWallet: string;
  amountDrops?: string;
  memoText?: string;
};

export type XamanCreatePayloadResponse = {
  ok: boolean;
  sourceTag?: number;
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
  makeWavesSourceTag?: number;
  verified?: {
    signed: boolean;
    resolved: boolean;
    txHash: string | null;
    account: string | null;
    sourceTag: number | null;
    sourceTagMatches: boolean;
    rewardAllowed: boolean;
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
  return postJson<XamanCreatePayloadResponse, CreateXamanPayloadInput>(
    "/api/xaman/create-payload",
    {
      amountDrops: "1000000",
      memoText: "OTT_DAILY_CHECKIN",
      ...input,
    }
  );
}

export async function verifyMakeWavesPayload(
  uuid: string
): Promise<XamanVerifyPayloadResponse> {
  return postJson<XamanVerifyPayloadResponse, { uuid: string }>(
    "/api/xaman/verify-payload",
    {
      uuid,
    }
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
      response?.verified?.sourceTag === MAKE_WAVES_SOURCE_TAG
  );
}
