import type { Xumm } from "xumm";
import type { XrplNetwork } from "./walletRegistry";

export type XamanXappTheme = "light" | "dark" | "moonlight" | "royal";

export type XamanQrEvent = {
  qrContents?: string | null;
  reason?: string;
};

export type XamanDestinationEvent = {
  destination?: {
    address?: string;
    tag?: number | null;
    name?: string;
  } | null;
  reason?: string;
};

export type XamanXappBridge = {
  ready: () => void | Promise<unknown>;
  openBrowser: (options: { url: string }) => void | Promise<unknown>;
  close: (options?: { refreshEvents?: boolean }) => void | Promise<unknown>;
  scanQr: () => void | Promise<unknown>;
  selectDestination?: (options: { ignoreDestinationTag: boolean }) => void | Promise<unknown>;
  tx?: (options: { account: string; tx: string }) => void | Promise<unknown>;
  share?: (options: { text: string }) => void | Promise<unknown>;
  on(event: "qr", listener: (data: XamanQrEvent) => void): void;
  on(event: "destination", listener: (data: XamanDestinationEvent) => void): void;
  off?(event: "qr", listener: (data: XamanQrEvent) => void): void;
  off?(event: "destination", listener: (data: XamanDestinationEvent) => void): void;
};

export type XamanXappRuntime = {
  account: string;
  bridge: XamanXappBridge | null;
  network: XrplNetwork;
  networkId: number | null;
  networkType: string;
  preview: boolean;
  theme: XamanXappTheme;
};

const XRPL_ADDRESS_PATTERN = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
const XAMAN_APPLICATION_ID = "49f37b53-0ef8-432f-87d8-d1b1d79fef8b";
const XAPP_READY_TIMEOUT_MS = 5_000;
let runtimePromise: Promise<XamanXappRuntime> | null = null;

export function isXamanXappLaunch() {
  const params = new URLSearchParams(window.location.search);
  return params.has("xAppToken") || params.get("xapp") === "1";
}

export function getXamanXappTheme(): XamanXappTheme {
  const value = new URLSearchParams(window.location.search).get("xAppStyle")?.trim().toLowerCase();
  if (value === "dark" || value === "moonlight" || value === "royal") return value;
  return "light";
}

function normalizeNetwork(networkType: string, networkId: number | null): XrplNetwork {
  const normalized = networkType.trim().toLowerCase();
  if (normalized.includes("test") || networkId === 1) return "testnet";
  if (normalized.includes("dev") || networkId === 2) return "devnet";
  return "mainnet";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId = 0;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Xaman context took too long to load.")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function createXamanXappRuntime(): Promise<XamanXappRuntime> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("xAppToken")?.trim() ?? "";
  const theme = getXamanXappTheme();

  if (!token) {
    return {
      account: "",
      bridge: null,
      network: "mainnet",
      networkId: null,
      networkType: "Preview",
      preview: true,
      theme,
    };
  }

  const { Xumm: XummSdk } = await import("xumm");
  const sdk: Xumm = new XummSdk(XAMAN_APPLICATION_ID, token);
  let bridge = (sdk.xapp ?? null) as XamanXappBridge | null;

  try {
    await withTimeout(sdk.environment.ready, XAPP_READY_TIMEOUT_MS);
    bridge = (sdk.xapp ?? bridge) as XamanXappBridge | null;
    const [accountValue, networkTypeValue, networkIdValue] = await Promise.all([
      sdk.user.account,
      sdk.user.networkType,
      sdk.user.networkId,
    ]);
    const account = accountValue?.trim() ?? "";
    if (!XRPL_ADDRESS_PATTERN.test(account)) {
      throw new Error("Xaman did not provide a valid selected XRPL account.");
    }

    const networkType = networkTypeValue?.trim() || "Mainnet";
    const networkId = typeof networkIdValue === "number" ? networkIdValue : null;
    return {
      account,
      bridge,
      network: normalizeNetwork(networkType, networkId),
      networkId,
      networkType,
      preview: false,
      theme,
    };
  } finally {
    try {
      const readyBridge = (sdk.xapp ?? bridge) as XamanXappBridge | null;
      await Promise.resolve(readyBridge?.ready());
    } catch {
      // The content remains usable if an older Xaman client does not support ready().
    }
  }
}

export function initializeXamanXapp() {
  if (!runtimePromise) {
    runtimePromise = createXamanXappRuntime();
  }
  return runtimePromise;
}

export function extractXrplTransactionHash(value: string) {
  return value.match(/(?:^|[^A-Fa-f0-9])([A-Fa-f0-9]{64})(?:$|[^A-Fa-f0-9])/)?.[1]?.toUpperCase() ?? "";
}

export function extractXrplAddress(value: string) {
  return value.match(/(?:^|[^1-9A-HJ-NP-Za-km-z])(r[1-9A-HJ-NP-Za-km-z]{24,34})(?:$|[^1-9A-HJ-NP-Za-km-z])/)?.[1] ?? "";
}
