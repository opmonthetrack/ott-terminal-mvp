const WALLET_SESSION_STORAGE_KEY = "ott-terminal-wallet-session-v1";
const WALLET_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type WalletSession = {
  walletAddress: string;
  verifiedAt: number;
  expiresAt: number;
  method: "xaman";
};

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

export function saveWalletSession(walletAddress: string) {
  if (!isLikelyXrplAddress(walletAddress)) {
    return null;
  }

  const verifiedAt = Date.now();
  const session: WalletSession = {
    walletAddress,
    verifiedAt,
    expiresAt: verifiedAt + WALLET_SESSION_MAX_AGE_MS,
    method: "xaman",
  };

  window.localStorage.setItem(WALLET_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("ott-wallet-session-changed", { detail: session }));

  return session;
}

export function loadWalletSession(): WalletSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(WALLET_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as WalletSession;

    if (
      !isLikelyXrplAddress(session.walletAddress) ||
      session.method !== "xaman" ||
      !Number.isFinite(session.verifiedAt) ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= Date.now()
    ) {
      clearWalletSession();
      return null;
    }

    return session;
  } catch {
    clearWalletSession();
    return null;
  }
}

export function clearWalletSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(WALLET_SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ott-wallet-session-changed", { detail: null }));
}

export function getStoredWalletAddress() {
  return loadWalletSession()?.walletAddress ?? "guest";
}
