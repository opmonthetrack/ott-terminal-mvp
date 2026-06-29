import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

export type CreateTrustlinePayloadInput = {
  userWallet?: string;
  issuerWallet: string;
  currencyCode?: string;
  limitAmount?: string;
};

export type XamanTrustlinePayloadResponse = {
  ok: boolean;
  mode?: "testnet-trustline";
  sourceTag?: number;
  token?: {
    currencyCode: string;
    issuerWallet: string;
    limitAmount: string;
  };
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
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
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

export async function createOttTrustlinePayload(
  input: CreateTrustlinePayloadInput
): Promise<XamanTrustlinePayloadResponse> {
  return postJson<XamanTrustlinePayloadResponse, CreateTrustlinePayloadInput>(
    "/api/xaman/create-trustline-payload",
    {
      currencyCode: "OTT",
      limitAmount: "1000000",
      ...input,
    }
  );
}

export function getOttTrustlinePayloadUuid(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getOttTrustlinePayloadUrl(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getOttTrustlinePayloadQr(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openOttTrustlinePayload(
  response: XamanTrustlinePayloadResponse | null
) {
  const url = getOttTrustlinePayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function getOttTrustlineStatusLabel(
  response: XamanTrustlinePayloadResponse | null
) {
  if (!response?.payload?.uuid) {
    return "No OTT trustline payload created yet";
  }

  if (response.sourceTag === MAKE_WAVES_SOURCE_TAG) {
    return `OTT trustline payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  return `OTT trustline payload created, but SourceTag should be ${MAKE_WAVES_SOURCE_TAG}`;
}

export function isOttTrustlinePayloadReady(
  response: XamanTrustlinePayloadResponse | null
) {
  return Boolean(
    response?.ok &&
      response.sourceTag === MAKE_WAVES_SOURCE_TAG &&
      response.payload?.uuid
  );
}
