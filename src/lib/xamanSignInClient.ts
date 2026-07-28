export type XamanSignInPayload = {
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

export type XamanSignInCreateResponse = {
  ok: boolean;
  mode?: "xaman-signin";
  payload?: XamanSignInPayload;
  error?: string;
};

export type XamanSignInVerifyResponse = {
  ok: boolean;
  mode?: "xaman-signin";
  pending?: boolean;
  resolved?: boolean;
  signed?: boolean;
  account?: string | null;
  declined?: boolean;
  error?: string;
};

async function postXamanSignIn<TResponse>(body: Record<string, unknown>): Promise<TResponse> {
  const response = await fetch("/api/ott", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & { error?: string };
  if (!response.ok && response.status !== 202) {
    throw new Error(data.error || "Xaman SignIn request failed.");
  }

  return data;
}

export function createXamanSignIn() {
  return postXamanSignIn<XamanSignInCreateResponse>({ action: "xaman.createSignInPayload" });
}

export function verifyXamanSignIn(uuid: string) {
  return postXamanSignIn<XamanSignInVerifyResponse>({ action: "xaman.verifySignInPayload", uuid });
}

export function getXamanSignInUuid(response: XamanSignInCreateResponse | null) {
  return response?.payload?.uuid ?? null;
}

export function getXamanSignInUrl(response: XamanSignInCreateResponse | null) {
  return response?.payload?.next?.always ?? response?.payload?.next?.no_push_msg_received ?? null;
}

export function getXamanSignInQr(response: XamanSignInCreateResponse | null) {
  return response?.payload?.refs?.qr_png ?? null;
}
