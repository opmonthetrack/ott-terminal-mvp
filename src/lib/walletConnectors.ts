import crossmarkSdk from "@crossmarkio/sdk";
import {
  getAddress as getGemWalletAddress,
  getNetwork as getGemWalletNetwork,
  isInstalled as isGemWalletInstalled,
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

export async function connectCrossmark(): Promise<WalletConnectorResult> {
  const sdk = crossmarkSdk as unknown as {
    methods?: {
      signInAndWait?: () => Promise<unknown>;
    };
  };

  if (!sdk.methods?.signInAndWait) {
    throw new Error("CROSSMARK is not available. Install and unlock the browser extension first.");
  }

  const result = await sdk.methods.signInAndWait() as {
    response?: {
      address?: string;
      data?: {
        address?: string;
        network?: string;
        networkId?: string | number;
      };
    };
  };

  const walletAddress = requireAddress(
    result.response?.data?.address ?? result.response?.address,
    "CROSSMARK",
  );

  return {
    walletAddress,
    providerId: "crossmark",
    network: normalizeNetwork(result.response?.data?.network ?? result.response?.data?.networkId),
    verificationMethod: "signed",
  };
}

export async function connectGemWallet(): Promise<WalletConnectorResult> {
  const installation = await isGemWalletInstalled() as {
    result?: { isInstalled?: boolean };
  };

  if (!installation.result?.isInstalled) {
    throw new Error("GemWallet is not installed. Install and unlock the browser extension first.");
  }

  const [addressResponse, networkResponse] = await Promise.all([
    getGemWalletAddress(),
    getGemWalletNetwork(),
  ]) as [
    { result?: { address?: string } },
    { result?: { network?: string } },
  ];

  return {
    walletAddress: requireAddress(addressResponse.result?.address, "GemWallet"),
    providerId: "gemwallet",
    network: normalizeNetwork(networkResponse.result?.network),
    verificationMethod: "provider",
  };
}

export async function connectWalletProvider(providerId: WalletProviderId) {
  if (providerId === "crossmark") return connectCrossmark();
  if (providerId === "gemwallet") return connectGemWallet();
  throw new Error("This wallet connector is not live yet. Use its education guide or open a read-only XRPL profile.");
}
