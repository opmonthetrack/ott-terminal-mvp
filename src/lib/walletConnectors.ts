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
    methods?: { signInAndWait?: () => Promise<unknown> };
  };
  if (!sdk.methods?.signInAndWait) {
    throw new Error("CROSSMARK is not available. Install and unlock the browser extension first.");
  }
  const result = await sdk.methods.signInAndWait() as {
    response?: { address?: string; data?: { address?: string; network?: string; networkId?: string | number } };
  };
  return {
    walletAddress: requireAddress(result.response?.data?.address ?? result.response?.address, "CROSSMARK"),
    providerId: "crossmark",
    network: normalizeNetwork(result.response?.data?.network ?? result.response?.data?.networkId),
    verificationMethod: "signed",
  };
}

export async function connectGemWallet(): Promise<WalletConnectorResult> {
  const installation = await isGemWalletInstalled() as { result?: { isInstalled?: boolean } };
  if (!installation.result?.isInstalled) {
    throw new Error("GemWallet is not installed. Install and unlock the browser extension first.");
  }
  const [addressResponse, networkResponse] = await Promise.all([
    getGemWalletAddress(),
    getGemWalletNetwork(),
  ]) as [{ result?: { address?: string } }, { result?: { network?: string } }];
  return {
    walletAddress: requireAddress(addressResponse.result?.address, "GemWallet"),
    providerId: "gemwallet",
    network: normalizeNetwork(networkResponse.result?.network),
    verificationMethod: "provider",
  };
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

  throw new Error("This wallet does not have a public OTT transaction-test adapter yet.");
}

export async function connectWalletProvider(providerId: WalletProviderId) {
  if (providerId === "crossmark") return connectCrossmark();
  if (providerId === "gemwallet") return connectGemWallet();
  throw new Error("This wallet connector is not live yet. Use its education guide or open a read-only XRPL profile.");
}
