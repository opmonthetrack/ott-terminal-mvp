export type AccessNftMintPayloadResponse = {
  ok?: boolean;
  action?: string;
  issuer?: string;
  taxon?: number;
  metadataCid?: string;
  metadataUri?: string;
  uriHex?: string;
  flags?: number;
  payload?: {
    uuid?: string;
    refs?: {
      qr_png?: string;
      qr_matrix?: string;
      qr_uri_quality_opts?: string[];
      websocket_status?: string;
    };
    next?: {
      always?: string;
      no_push_msg_received?: string;
    };
  };
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    qr_uri_quality_opts?: string[];
    websocket_status?: string;
  };
  uuid?: string;
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
  error?: string;
};

export type AccessNftMintVerificationResponse = {
  ok?: boolean;
  action?: string;
  uuid?: string;
  verified?: {
    signed?: boolean;
    resolved?: boolean;
    account?: string | null;
    txid?: string | null;
    issuerMatches?: boolean;
  };
  payload?: unknown;
  error?: string;
};

const ACCESS_NFT_API_ENDPOINT = "/api/ott-access-nft";

export async function createAccessNftMintPayload(): Promise<AccessNftMintPayloadResponse> {
  const response = await fetch(ACCESS_NFT_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "create-access-nft-mint-payload",
    }),
  });

  return parseAccessNftResponse<AccessNftMintPayloadResponse>(response);
}

export async function verifyAccessNftMintPayload(
  payloadUuid: string,
): Promise<AccessNftMintVerificationResponse> {
  const response = await fetch(ACCESS_NFT_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "verify-access-nft-mint-payload",
      payloadUuid,
    }),
  });

  return parseAccessNftResponse<AccessNftMintVerificationResponse>(response);
}

export function getAccessNftMintPayloadUuid(
  payload: AccessNftMintPayloadResponse | null,
) {
  return payload?.uuid || payload?.payload?.uuid || null;
}

export function getAccessNftMintPayloadQr(
  payload: AccessNftMintPayloadResponse | null,
) {
  return payload?.refs?.qr_png || payload?.payload?.refs?.qr_png || null;
}

export function getAccessNftMintPayloadUrl(
  payload: AccessNftMintPayloadResponse | null,
) {
  return (
    payload?.next?.always ||
    payload?.payload?.next?.always ||
    payload?.next?.no_push_msg_received ||
    payload?.payload?.next?.no_push_msg_received ||
    null
  );
}

export function openAccessNftMintPayload(
  payload: AccessNftMintPayloadResponse | null,
) {
  const url = getAccessNftMintPayloadUrl(payload);

  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function isAccessNftMintSigned(
  verification: AccessNftMintVerificationResponse | null,
) {
  return Boolean(verification?.verified?.signed && verification?.verified?.txid);
}

export function getAccessNftMintStatusLabel(
  verification: AccessNftMintVerificationResponse | null,
) {
  if (!verification) {
    return "Access NFT mint not verified yet.";
  }

  if (verification.error) {
    return `Access NFT mint verification failed: ${verification.error}`;
  }

  if (verification.verified?.signed && verification.verified?.txid) {
    return `Access NFT mint signed. TXID: ${verification.verified.txid}`;
  }

  if (verification.verified?.resolved && !verification.verified?.signed) {
    return "Access NFT mint was rejected or expired.";
  }

  return "Access NFT mint is still waiting for signature.";
}

export function getAccessNftMintClientErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;

    if (typeof value === "string") {
      return value;
    }
  }

  return "Access NFT mint request failed.";
}

async function parseAccessNftResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data?.error || `Access NFT API failed with status ${response.status}.`);
  }

  return data;
}
