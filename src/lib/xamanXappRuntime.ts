import { withTimeout } from "./asyncReliability";
import { resolveXamanNetwork } from "./xamanNetwork";
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
  on(event: "networkswitch", listener: (data: unknown) => void): void;
  off?(event: "networkswitch", listener: (data: unknown) => void): void;
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

async function createXamanXappRuntime(): Promise<XamanXappRuntime> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("xAppToken")?.trim() ?? "";
  const theme = getXamanXappTheme();

  if (params.has("xAppToken") && !token) throw new Error("The Xaman launch token is missing. Close and reopen OTT from Xaman.");
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

  const { Xumm: XummSdk } = await withTimeout(import("xumm"), XAPP_READY_TIMEOUT_MS);
  const sdk: Xumm = new XummSdk(XAMAN_APPLICATION_ID, token);
  let bridge = (sdk.xapp ?? null) as XamanXappBridge | null;

  try {
    await withTimeout(sdk.environment.ready, XAPP_READY_TIMEOUT_MS);
    bridge = (sdk.xapp ?? bridge) as XamanXappBridge | null;
    const [accountValue, networkTypeValue, networkIdValue] = await withTimeout(Promise.all([
      sdk.user.account,
      sdk.user.networkType,
      sdk.user.networkId,
    ]), XAPP_READY_TIMEOUT_MS, "Xaman context took too long to load. Close and reopen OTT in Xaman.");
    const account = accountValue?.trim() ?? "";
    if (!XRPL_ADDRESS_PATTERN.test(account)) {
      throw new Error("Xaman did not provide a valid selected XRPL account.");
    }

    const network = resolveXamanNetwork(networkTypeValue, networkIdValue);
    const networkType = networkTypeValue?.trim() || network.toUpperCase();
    const networkId = typeof networkIdValue === "number" ? networkIdValue : null;
    return {
      account,
      bridge,
      network,
      networkId,
      networkType,
      preview: false,
      theme,
    };
  } finally {
    try {
      const readyBridge = (sdk.xapp ?? bridge) as XamanXappBridge | null;
      await withTimeout(Promise.resolve(readyBridge?.ready()), 1000);
    } catch {
      // The content remains usable if an older Xaman client does not support ready().
    }
  }
}

export function initializeXamanXapp() {
  if (!runtimePromise) {
    runtimePromise = withTimeout(createXamanXappRuntime(), 12000, "Xaman context took too long to load. Close and reopen OTT in Xaman.").catch(error => {
      runtimePromise = null;
      throw error;
    });
  }
  return runtimePromise;
}

export function extractXrplTransactionHash(value: string) {
  return value.match(/(?:^|[^A-Fa-f0-9])([A-Fa-f0-9]{64})(?:$|[^A-Fa-f0-9])/)?.[1]?.toUpperCase() ?? "";
}

export function extractXrplAddress(value: string) {
  return value.match(/(?:^|[^1-9A-HJ-NP-Za-km-z])(r[1-9A-HJ-NP-Za-km-z]{24,34})(?:$|[^1-9A-HJ-NP-Za-km-z])/)?.[1] ?? "";
}
