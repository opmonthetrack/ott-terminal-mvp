import { MAKE_WAVES_SOURCE_TAG } from "./makeWaves";

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

export type CreateTrustlinePayloadInput = {
  userWallet?: string;
  issuerWallet: string;
  currencyCode?: string;
  limitAmount?: string;
};

export type CreateTokenPaymentPayloadInput = {
  senderWallet?: string;
  destinationWallet: string;
  issuerWallet: string;
  currencyCode?: string;
  tokenAmount?: string;
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
  payload?: XamanPayloadShape;
  transactionMeta?: {
    transactionType: string;
    sourceTag: number;
    memoText: string;
  };
  error?: string;
  details?: unknown;
};

export type XamanTokenPaymentPayloadResponse = {
  ok: boolean;
  mode?: "testnet-token-payment";
  sourceTag?: number;
  token?: {
    currencyCode: string;
    issuerWallet: string;
    destinationWallet: string;
    tokenAmount: string;
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

export type OttTokenPayloadResponse =
  | XamanTrustlinePayloadResponse
  | XamanTokenPaymentPayloadResponse;

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

export async function createOttTrustlinePayload(
  input: CreateTrustlinePayloadInput
): Promise<XamanTrustlinePayloadResponse> {
  return postOtt<XamanTrustlinePayloadResponse, CreateTrustlinePayloadInput>(
    "xaman.createTrustlinePayload",
    {
      currencyCode: "OTT",
      limitAmount: "1000000",
      ...input,
    }
  );
}

export async function createOttTokenPaymentPayload(
  input: CreateTokenPaymentPayloadInput
): Promise<XamanTokenPaymentPayloadResponse> {
  return postOtt<
    XamanTokenPaymentPayloadResponse,
    CreateTokenPaymentPayloadInput
  >("xaman.createTokenPaymentPayload", {
    currencyCode: "OTT",
    tokenAmount: "1",
    ...input,
  });
}

export function getOttPayloadUuid(
  response: OttTokenPayloadResponse | null
): string | null {
  return response?.payload?.uuid ?? null;
}

export function getOttPayloadUrl(
  response: OttTokenPayloadResponse | null
): string | null {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}

export function getOttPayloadQr(
  response: OttTokenPayloadResponse | null
): string | null {
  return response?.payload?.refs?.qr_png ?? null;
}

export function openOttPayload(response: OttTokenPayloadResponse | null) {
  const url = getOttPayloadUrl(response);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function getOttTrustlinePayloadUuid(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return getOttPayloadUuid(response);
}

export function getOttTrustlinePayloadUrl(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return getOttPayloadUrl(response);
}

export function getOttTrustlinePayloadQr(
  response: XamanTrustlinePayloadResponse | null
): string | null {
  return getOttPayloadQr(response);
}

export function openOttTrustlinePayload(
  response: XamanTrustlinePayloadResponse | null
) {
  return openOttPayload(response);
}

export function getOttTokenPaymentPayloadUuid(
  response: XamanTokenPaymentPayloadResponse | null
): string | null {
  return getOttPayloadUuid(response);
}

export function getOttTokenPaymentPayloadUrl(
  response: XamanTokenPaymentPayloadResponse | null
): string | null {
  return getOttPayloadUrl(response);
}

export function getOttTokenPaymentPayloadQr(
  response: XamanTokenPaymentPayloadResponse | null
): string | null {
  return getOttPayloadQr(response);
}

export function openOttTokenPaymentPayload(
  response: XamanTokenPaymentPayloadResponse | null
) {
  return openOttPayload(response);
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

export function getOttTokenPaymentStatusLabel(
  response: XamanTokenPaymentPayloadResponse | null
) {
  if (!response?.payload?.uuid) {
    return "No OTT token payment payload created yet";
  }

  if (response.sourceTag === MAKE_WAVES_SOURCE_TAG) {
    return `OTT token payment payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  }

  return `OTT token payment payload created, but SourceTag should be ${MAKE_WAVES_SOURCE_TAG}`;
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

export function isOttTokenPaymentPayloadReady(
  response: XamanTokenPaymentPayloadResponse | null
) {
  return Boolean(
    response?.ok &&
      response.sourceTag === MAKE_WAVES_SOURCE_TAG &&
      response.payload?.uuid
  );
}
