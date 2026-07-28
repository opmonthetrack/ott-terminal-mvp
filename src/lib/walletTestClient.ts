import { ottSupabase } from "./ottAuth";
import type { WalletProviderId } from "./walletRegistry";

export type WalletProviderTestStatus = {
  providerId: WalletProviderId;
  percentage: number;
  validatedTests: number;
  requiredTests: number;
  publicTestingEnabled: boolean;
  status: string;
  notes?: string | null;
};

export type WalletTestResult = {
  id: string;
  provider_id: WalletProviderId;
  wallet_address: string;
  transaction_hash: string;
  score: number;
  status: string;
  validated_at: string;
};

export type WalletTestStatusResponse = {
  ok: boolean;
  configured?: boolean;
  setupRequired?: boolean;
  sourceTag?: number;
  amountDrops?: string;
  destinationWallet?: string;
  providers?: WalletProviderTestStatus[];
  user?: {
    signedIn: boolean;
    result: WalletTestResult | null;
    individualPercentage: number;
    providerPercentage: number;
    nftEligible: boolean;
    reward: {
      id?: string;
      status?: string;
      serial_number?: number | null;
      issuance_record_id?: string | null;
    } | null;
  };
  error?: string;
};

export type WalletTestChallengeResponse = {
  ok: boolean;
  challenge?: { id: string; providerId: WalletProviderId; walletAddress: string; expiresAt: string };
  proof?: { destinationWallet: string; amountDrops: string; sourceTag: number; memoType: string; memoText: string };
  txjson?: Record<string, unknown>;
  payload?: { uuid?: string; next?: { always?: string; no_push_msg_received?: string } } | null;
  error?: string;
};

async function headers() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  const result: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (session?.access_token) result.Authorization = `Bearer ${session.access_token}`;
  return result;
}

async function callWalletTest<T>(action: string, input: Record<string, unknown> = {}) {
  const response = await fetch("/api/wallet-test", {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify({ action, ...input }),
    cache: "no-store",
  });
  const data = await response.json() as T & { ok?: boolean; error?: string };
  if (!response.ok || data.ok === false) throw new Error(data.error || `Wallet-test request failed (${response.status}).`);
  return data;
}

export function getWalletTestStatus() {
  return callWalletTest<WalletTestStatusResponse>("status");
}

export function createWalletTestChallenge(providerId: WalletProviderId, walletAddress: string) {
  return callWalletTest<WalletTestChallengeResponse>("create", { providerId, walletAddress });
}

export function verifyWalletTestChallenge(challengeId: string, transactionHash?: string) {
  return callWalletTest<WalletTestStatusResponse & { pending?: boolean; stage?: string; status?: WalletTestStatusResponse }>("verify", {
    challengeId,
    transactionHash,
  });
}

export function claimWalletTesterPass(resultId: string) {
  return callWalletTest<{ ok: boolean; reservation?: { serial_number?: number }; status?: WalletTestStatusResponse }>("claim", { resultId });
}
