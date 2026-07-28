import {
  isWalletProviderId,
  type WalletConnectionType,
  type WalletProviderId,
  type WalletVerificationMethod,
  type XrplNetwork,
} from "./walletRegistry";

const WALLET_SESSION_STORAGE_KEY = "ott-terminal-wallet-session-v2";
const LEGACY_WALLET_SESSION_STORAGE_KEY = "ott-terminal-wallet-session-v1";
const WALLET_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type WalletSession = {
  walletAddress: string;
  providerId: WalletProviderId;
  connectionType: WalletConnectionType;
  network: XrplNetwork;
  verificationMethod: WalletVerificationMethod;
  verifiedAt: number;
  expiresAt: number;
};

export type SaveWalletSessionInput = {
  walletAddress: string;
  providerId?: WalletProviderId;
  connectionType?: WalletConnectionType;
  network?: XrplNetwork;
  verificationMethod?: WalletVerificationMethod;
};

export function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function getDefaultConnectionType(providerId: WalletProviderId): WalletConnectionType {
  if (providerId === "xaman") return "xaman-payload";
  if (["crossmark", "gemwallet"].includes(providerId)) return "browser-extension";
  if (["walletconnect", "joey", "katz"].includes(providerId)) return "walletconnect";
  if (providerId === "metamask-xrpl") return "snap";
  if (providerId === "ledger") return "hardware";
  return "read-only";
}

export function saveWalletSession(input: string | SaveWalletSessionInput) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalized: SaveWalletSessionInput = typeof input === "string"
    ? { walletAddress: input, providerId: "xaman", verificationMethod: "signed" }
    : input;

  const walletAddress = normalized.walletAddress.trim();
  if (!isLikelyXrplAddress(walletAddress)) {
    return null;
  }

  const providerId = normalized.providerId ?? "xaman";
  const verifiedAt = Date.now();
  const session: WalletSession = {
    walletAddress,
    providerId,
    connectionType: normalized.connectionType ?? getDefaultConnectionType(providerId),
    network: normalized.network ?? "mainnet",
    verificationMethod: normalized.verificationMethod ?? (providerId === "read-only" ? "read-only" : "provider"),
    verifiedAt,
    expiresAt: verifiedAt + WALLET_SESSION_MAX_AGE_MS,
  };

  window.localStorage.setItem(WALLET_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.removeItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ott-wallet-session-changed", { detail: session }));

  return session;
}

function migrateLegacySession(): WalletSession | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const legacy = JSON.parse(rawValue) as {
      walletAddress?: string;
      verifiedAt?: number;
      expiresAt?: number;
      method?: string;
    };

    if (
      !legacy.walletAddress ||
      !isLikelyXrplAddress(legacy.walletAddress) ||
      legacy.method !== "xaman" ||
      !Number.isFinite(legacy.verifiedAt) ||
      !Number.isFinite(legacy.expiresAt) ||
      Number(legacy.expiresAt) <= Date.now()
    ) {
      window.localStorage.removeItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
      return null;
    }

    const session: WalletSession = {
      walletAddress: legacy.walletAddress,
      providerId: "xaman",
      connectionType: "xaman-payload",
      network: "mainnet",
      verificationMethod: "signed",
      verifiedAt: Number(legacy.verifiedAt),
      expiresAt: Number(legacy.expiresAt),
    };

    window.localStorage.setItem(WALLET_SESSION_STORAGE_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
    return session;
  } catch {
    window.localStorage.removeItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
    return null;
  }
}

export function loadWalletSession(): WalletSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(WALLET_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return migrateLegacySession();
  }

  try {
    const session = JSON.parse(rawValue) as WalletSession;

    if (
      !isLikelyXrplAddress(session.walletAddress) ||
      !isWalletProviderId(session.providerId) ||
      !["mainnet", "testnet", "devnet"].includes(session.network) ||
      !["signed", "provider", "read-only"].includes(session.verificationMethod) ||
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
  window.localStorage.removeItem(LEGACY_WALLET_SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("ott-wallet-session-changed", { detail: null }));
}

export function getStoredWalletAddress() {
  return loadWalletSession()?.walletAddress ?? "guest";
}

export function hasVerifiedWalletOwnership() {
  const session = loadWalletSession();
  return Boolean(session && session.verificationMethod !== "read-only");
}
