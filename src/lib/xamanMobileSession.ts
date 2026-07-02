import {
  MAKE_WAVES_SOURCE_TAG,
  type MakeWavesActionId,
} from "./makeWaves";

export type XamanReturnTarget =
  | "wallet"
  | "xaman"
  | "source"
  | "partners"
  | "truthdesk"
  | "accessgate";

export type XamanMobileSession = {
  payloadUuid: string;
  actionId: MakeWavesActionId;
  sourceTag: number;
  returnTarget: XamanReturnTarget;
  createdAt: number;
  expectedWallet?: string;
};

export type XamanReturnState = {
  hasReturnedFromXaman: boolean;
  payloadUuid: string | null;
  actionId: MakeWavesActionId | null;
  returnTarget: XamanReturnTarget;
};

const STORAGE_KEY = "ott-terminal-xaman-mobile-session-v1";
const MAX_SESSION_AGE_MS = 15 * 60 * 1000;

export function saveXamanMobileSession(input: {
  payloadUuid: string;
  actionId: MakeWavesActionId;
  returnTarget?: XamanReturnTarget;
  expectedWallet?: string;
}) {
  const session: XamanMobileSession = {
    payloadUuid: input.payloadUuid,
    actionId: input.actionId,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    returnTarget: input.returnTarget ?? "wallet",
    expectedWallet: input.expectedWallet,
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  return session;
}

export function loadXamanMobileSession(): XamanMobileSession | null {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as XamanMobileSession;

    if (!session.payloadUuid || !session.actionId) {
      clearXamanMobileSession();
      return null;
    }

    if (isXamanMobileSessionExpired(session)) {
      clearXamanMobileSession();
      return null;
    }

    return session;
  } catch {
    clearXamanMobileSession();
    return null;
  }
}

export function clearXamanMobileSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isXamanMobileSessionExpired(session: XamanMobileSession) {
  return Date.now() - session.createdAt > MAX_SESSION_AGE_MS;
}

export function getXamanReturnState(): XamanReturnState {
  const params = new URLSearchParams(window.location.search);
  const hasReturnedFromXaman =
    params.get("xaman_return") === "1" ||
    params.get("ott_xaman_return") === "1";

  const session = loadXamanMobileSession();

  return {
    hasReturnedFromXaman,
    payloadUuid: session?.payloadUuid ?? null,
    actionId: session?.actionId ?? null,
    returnTarget: session?.returnTarget ?? "wallet",
  };
}

export function shouldVerifyXamanReturn() {
  const state = getXamanReturnState();

  return Boolean(
    state.hasReturnedFromXaman &&
      state.payloadUuid &&
      state.actionId,
  );
}

export function cleanXamanReturnUrl() {
  const url = new URL(window.location.href);

  url.searchParams.delete("xaman_return");
  url.searchParams.delete("ott_xaman_return");
  url.searchParams.delete("uuid");
  url.searchParams.delete("payload");

  window.history.replaceState({}, document.title, url.toString());
}

export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();

  return /iphone|ipad|ipod|android|mobile/.test(userAgent);
}

export function openXamanMobileDeepLink(payloadUrl: string | null) {
  if (!payloadUrl) {
    return false;
  }

  window.location.href = payloadUrl;

  return true;
}

export function getXamanSessionDebugLabel() {
  const session = loadXamanMobileSession();

  if (!session) {
    return "No active Xaman mobile session.";
  }

  const ageSeconds = Math.round((Date.now() - session.createdAt) / 1000);

  return `Active Xaman session: ${session.actionId} / ${session.payloadUuid} / ${ageSeconds}s old`;
}
