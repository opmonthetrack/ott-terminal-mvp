import crossmarkSdk from "@crossmarkio/sdk";
import {
  getAddress as getGemWalletAddress,
  getNetwork as getGemWalletNetwork,
  isInstalled as isGemWalletInstalled,
  submitTransaction as submitGemWalletTransaction,
} from "@gemwallet/api";
import type {
  WalletProviderId,
  WalletVerificationMethod,
  XrplNetwork,
} from "./walletRegistry";
import { isLikelyXrplAddress } from "./walletSession";

export type WalletConnectorResult = {
  walletAddress: string;
  providerId: WalletProviderId;
  network: XrplNetwork;
  verificationMethod: WalletVerificationMethod;
};

function normalizeNetwork(value: unknown): XrplNetwork {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("test")) return "testnet";
  if (normalized.includes("dev")) return "devnet";
  return "mainnet";
}

function requireAddress(value: unknown, providerName: string) {
  const address = String(value ?? "").trim();
  if (!isLikelyXrplAddress(address)) {
    throw new Error(`${providerName} did not return a valid XRPL classic address.`);
  }
  return address;
}

function requireHash(value: unknown, providerName: string) {
  const hash = String(value ?? "").trim().toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(hash)) {
    throw new Error(`${providerName} did not return a valid submitted XRPL transaction hash.`);
  }
  return hash;
}

export async function connectCrossmark(): Promise<WalletConnectorResult> {
  const sdk = crossmarkSdk as unknown as {
    async?: { detect?: (timeout?: number) => Promise<boolean> };
    methods?: {
      signInAndWait?: () => Promise<unknown>;
      getAddress?: () => unknown;
      getNetwork?: () => unknown;
    };
  };
  if (!sdk.methods?.signInAndWait) {
    throw new Error("CROSSMARK is not available. Install and unlock the browser extension first.");
  }
  const detected = await sdk.async?.detect?.(5_000);
  if (detected === false) {
    throw new Error("CROSSMARK was not detected. Install or unlock the extension and refresh this page.");
  }
  const result = await sdk.methods.signInAndWait() as {
    response?: {
      address?: string;
      data?: {
        address?: string;
        network?: string;
        networkId?: string | number;
        user?: { address?: string };
      };
    };
  };
  const address = result.response?.data?.address
    ?? result.response?.data?.user?.address
    ?? result.response?.address
    ?? sdk.methods.getAddress?.();
  const network = result.response?.data?.network
    ?? result.response?.data?.networkId
    ?? sdk.methods.getNetwork?.();
  return {
    walletAddress: requireAddress(address, "CROSSMARK"),
    providerId: "crossmark",
    network: normalizeNetwork(network),
    verificationMethod: "signed",
  };
}

export async function connectGemWallet(): Promise<WalletConnectorResult> {
  const installation = await isGemWalletInstalled() as { result?: { isInstalled?: boolean } };
  if (!installation.result?.isInstalled) {
    throw new Error("GemWallet is not installed. Install and unlock the browser extension first.");
  }
  const addressResponse = await getGemWalletAddress() as { result?: { address?: string } };
  const networkResponse = await getGemWalletNetwork() as { result?: { network?: string } };
  return {
    walletAddress: requireAddress(addressResponse.result?.address, "GemWallet"),
    providerId: "gemwallet",
    network: normalizeNetwork(networkResponse.result?.network),
    verificationMethod: "provider",
  };
}

export async function connectMetaMaskSnap(): Promise<WalletConnectorResult> {
  const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error("MetaMask is not installed in this browser. Install the MetaMask browser extension first.");
  }
  try {
    await ethereum.request({
      method: "wallet_requestSnaps",
      params: { "npm:xrpl-snap": {} },
    });
    const response = await ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: "npm:xrpl-snap",
        request: { method: "xrpl_getAccount" },
      },
    }) as { address?: string; account?: { address?: string } } | string;

    const rawAddress = typeof response === "string" ? response : (response?.address ?? response?.account?.address);
    return {
      walletAddress: requireAddress(rawAddress, "MetaMask XRPL Snap"),
      providerId: "metamask-xrpl",
      network: "mainnet",
      verificationMethod: "signed",
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "MetaMask XRPL Snap connection failed.");
  }
}

export async function connectWalletConnect(providerId: WalletProviderId = "walletconnect"): Promise<WalletConnectorResult> {
  const providerName = providerId === "joey" ? "Joey Wallet" : providerId === "katz" ? "Katz Wallet" : "WalletConnect";
  try {
    const { SignClient } = await import("@walletconnect/sign-client");
    const { WalletConnectModal } = await import("@walletconnect/modal");

    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "c4f79cc821944d9680842e344664b15b";

    const signClient = await SignClient.init({
      projectId,
      metadata: {
        name: "XRPL OnTheTrack Terminal",
        description: "XRPL Terminal & Verification Layer",
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    });

    const modal = new WalletConnectModal({
      projectId,
      chains: ["xrpl:0"],
    });

    const { uri, approval } = await signClient.connect({
      requiredNamespaces: {
        xrpl: {
          methods: ["xrpl_signTransaction", "xrpl_signMessage"],
          chains: ["xrpl:0"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });

    if (uri) {
      void modal.openModal({ uri });
    }

    const session = await approval();
    modal.closeModal();

    const account = session.namespaces.xrpl?.accounts?.[0];
    const address = account ? account.split(":")[2] : "";

    return {
      walletAddress: requireAddress(address, providerName),
      providerId,
      network: "mainnet",
      verificationMethod: "signed",
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("did not return a valid")) {
      throw error;
    }
    throw new Error(`${providerName} WalletConnect pairing was closed or needs a valid Reown Project ID.`);
  }
}

export async function submitWalletTestTransaction(
  providerId: WalletProviderId,
  txjson: Record<string, unknown>,
) {
  if (providerId === "crossmark") {
    const sdk = crossmarkSdk as unknown as {
      methods?: { signAndSubmitAndWait?: (transaction: Record<string, unknown>) => Promise<unknown> };
    };
    if (!sdk.methods?.signAndSubmitAndWait) throw new Error("CROSSMARK signing is not available in this browser.");
    const result = await sdk.methods.signAndSubmitAndWait(txjson) as {
      response?: { txid?: string; hash?: string; data?: { txid?: string; hash?: string } };
    };
    return requireHash(
      result.response?.data?.txid
        ?? result.response?.data?.hash
        ?? result.response?.txid
        ?? result.response?.hash,
      "CROSSMARK",
    );
  }

  if (providerId === "gemwallet") {
    const result = await submitGemWalletTransaction({ transaction: txjson }) as {
      result?: { hash?: string; txHash?: string; transactionHash?: string };
    };
    return requireHash(
      result.result?.hash ?? result.result?.txHash ?? result.result?.transactionHash,
      "GemWallet",
    );
  }

  if (providerId === "metamask-xrpl") {
    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown }) => Promise<unknown> } }).ethereum;
    if (!ethereum) throw new Error("MetaMask is not available in this browser.");
    const result = await ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: "npm:xrpl-snap",
        request: { method: "xrpl_signTransaction", params: { tx: txjson } },
      },
    }) as { hash?: string; txid?: string; result?: { hash?: string } } | string;
    const hash = typeof result === "string" ? result : (result?.hash ?? result?.txid ?? result?.result?.hash);
    return requireHash(hash, "MetaMask XRPL Snap");
  }

  throw new Error("This wallet does not have a public OTT transaction-test adapter yet.");
}

export async function connectWalletProvider(providerId: WalletProviderId) {
  if (providerId === "crossmark") return connectCrossmark();
  if (providerId === "gemwallet") return connectGemWallet();
  if (providerId === "metamask-xrpl") return connectMetaMaskSnap();
  if (providerId === "walletconnect" || providerId === "joey" || providerId === "katz") {
    return connectWalletConnect(providerId);
  }
  throw new Error("This wallet connector is not live yet. Use its education guide or open a read-only XRPL profile.");
}
