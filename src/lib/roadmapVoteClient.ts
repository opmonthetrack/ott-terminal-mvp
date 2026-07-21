import type { XamanPayloadShape } from "./xamanClient";

export type RoadmapVoteOptionId =
  | "academy-expansion"
  | "web2-license"
  | "marketplace-merch"
  | "ai-research"
  | "token-tools-review";

export type RoadmapVotePayloadResponse = {
  ok: boolean;
  mode?: string;
  cycle?: string;
  sourceTag?: number;
  vote?: {
    id: RoadmapVoteOptionId;
    title: string;
  };
  proof?: {
    destinationWallet: string;
    amountDrops: string;
    memoType: string;
    memoText: string;
  };
  payload?: XamanPayloadShape;
  error?: string;
  details?: unknown;
};

export type RoadmapVoteRecord = {
  account: string;
  voteId: RoadmapVoteOptionId;
  title: string;
  txHash: string | null;
  ledgerIndex: number;
  timestamp: string | null;
};

export type RoadmapVoteRankingItem = {
  id: RoadmapVoteOptionId;
  title: string;
  votes: number;
};

export type RoadmapVoteStatsResponse = {
  ok: boolean;
  mode?: string;
  cycle?: string;
  sourceTag?: number;
  proof?: {
    destinationWallet: string;
    amountDrops: string;
    memoType: string;
  };
  totals?: {
    activeVerifiedVotes: number;
    uniqueWallets: number;
    verifiedVoteTransactions: number;
    scannedAccountTransactions: number;
  };
  counts?: Partial<Record<RoadmapVoteOptionId, number>>;
  ranking?: RoadmapVoteRankingItem[];
  mostVoted?: RoadmapVoteRankingItem | null;
  leastVoted?: RoadmapVoteRankingItem | null;
  recentVotes?: RoadmapVoteRecord[];
  walletVote?: RoadmapVoteRecord | null;
  updatedAt?: string;
  error?: string;
};

async function postRoadmapVote<TResponse>(body: Record<string, unknown>) {
  const response = await fetch("/api/roadmap-vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export function createRoadmapVotePayload(
  voteId: RoadmapVoteOptionId,
  walletAddress?: string,
) {
  return postRoadmapVote<RoadmapVotePayloadResponse>({
    action: "xaman.createRoadmapVotePayload",
    voteId,
    walletAddress,
  });
}

export function getRoadmapVoteStats(walletAddress?: string) {
  return postRoadmapVote<RoadmapVoteStatsResponse>({
    action: "xrpl.getRoadmapVoteStats",
    walletAddress,
  });
}

export function getRoadmapVotePayloadUuid(
  response: RoadmapVotePayloadResponse | null,
) {
  return response?.payload?.uuid ?? null;
}

export function getRoadmapVotePayloadUrl(
  response: RoadmapVotePayloadResponse | null,
) {
  return (
    response?.payload?.next?.always ??
    response?.payload?.next?.no_push_msg_received ??
    null
  );
}
