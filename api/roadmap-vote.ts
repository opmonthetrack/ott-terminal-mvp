// Dedicated on-chain roadmap voting endpoint for Vercel serverless runtime.
// A vote is only counted after a validated XRPL Mainnet Payment signed in Xaman.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const ROADMAP_VOTE_CYCLE = "cycle-1";
const ROADMAP_VOTE_MEMO_PREFIX = "OTT Make Waves Roadmap Vote";
const ROADMAP_VOTE_MEMO_TYPE = "OTT_ROADMAP_VOTE";
const ROADMAP_VOTE_AMOUNT_DROPS = "1";
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL = process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";
const MAX_ACCOUNT_TX_PAGES = 5;
const ACCOUNT_TX_PAGE_LIMIT = 200;

const ROADMAP_OPTIONS = [
  { id: "academy-expansion", title: "Academy Expansion" },
  { id: "web2-license", title: "Web2 License Access" },
  { id: "marketplace-merch", title: "Marketplace + Merch" },
  { id: "ai-research", title: "AI Research Assistant" },
  { id: "token-tools-review", title: "Token Tools + Legal Review" },
] as const;

const ROADMAP_OPTION_IDS = new Set(ROADMAP_OPTIONS.map((option) => option.id));

const OTT_PUBLIC_APP_URL =
  normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL) ||
  normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  "https://ott-terminal-mvp.vercel.app";

const ROADMAP_VOTE_WALLET =
  process.env.OTT_ROADMAP_VOTE_WALLET?.trim() ||
  process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
  process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
  "";

type RequestBody = Record<string, unknown> & {
  action?: string;
};

type RequestLike = {
  method?: string;
  body?: RequestBody;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type XrplMemo = {
  Memo?: {
    MemoType?: string;
    MemoData?: string;
    MemoFormat?: string;
  };
};

type XrplTransaction = {
  Account?: string;
  Destination?: string;
  TransactionType?: string;
  Amount?: string | Record<string, unknown>;
  SourceTag?: number;
  Memos?: XrplMemo[];
  hash?: string;
  ledger_index?: number;
  date?: number;
};

type XrplMeta = {
  TransactionResult?: string;
};

type AccountTxEntry = {
  validated?: boolean;
  tx?: XrplTransaction;
  tx_json?: XrplTransaction;
  meta?: XrplMeta;
  ledger_index?: number;
};

type AccountTxResponse = {
  result?: {
    account?: string;
    transactions?: AccountTxEntry[];
    marker?: unknown;
    error?: string;
    error_message?: string;
  };
  error?: string;
};

type VerifiedVoteTransaction = {
  account: string;
  voteId: string;
  title: string;
  txHash: string | null;
  ledgerIndex: number;
  timestamp: string | null;
};

let cachedStats:
  | {
      expiresAt: number;
      value: ReturnType<typeof buildStatsResponse>;
    }
  | undefined;

function normalizePublicUrl(value: string | undefined) {
  const cleanValue = value?.trim().replace(/\/$/, "");

  if (!cleanValue) {
    return "";
  }

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

function getString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function hexToText(value: string | undefined) {
  if (!value || value.length % 2 !== 0) {
    return "";
  }

  try {
    const bytes = value.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

function getXamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY;
  const apiSecret = process.env.XAMAN_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Missing XAMAN_API_KEY or XAMAN_API_SECRET.");
  }

  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  };
}

function getVoteOption(voteId: string) {
  return ROADMAP_OPTIONS.find((option) => option.id === voteId) ?? null;
}

function getVoteMemo(voteId: string) {
  return `${ROADMAP_VOTE_MEMO_PREFIX} | ${ROADMAP_VOTE_CYCLE} | ${voteId}`;
}

function getVoteReturnUrl(_voteId: string) {
  return (
    `${OTT_PUBLIC_APP_URL}/?ott_xaman_return=1` +
    `&payload={id}` +
    `&action=roadmap-vote` +
    `&target=roadmap`
  );
}

async function createXamanVotePayload(body: RequestBody) {
  const voteId = getString(body, "voteId");
  const walletAddress = getString(body, "walletAddress");
  const option = getVoteOption(voteId);

  if (!option || !ROADMAP_OPTION_IDS.has(voteId as (typeof ROADMAP_OPTIONS)[number]["id"])) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid roadmap vote option.",
        allowedVoteIds: ROADMAP_OPTIONS.map((item) => item.id),
      },
    };
  }

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return {
      status: 400,
      body: { ok: false, error: "Invalid walletAddress." },
    };
  }

  if (!ROADMAP_VOTE_WALLET || !isValidXrplAddress(ROADMAP_VOTE_WALLET)) {
    return {
      status: 503,
      body: {
        ok: false,
        error:
          "Roadmap voting wallet is not configured. Set OTT_ROADMAP_VOTE_WALLET or OTT_PROOF_DESTINATION_WALLET.",
      },
    };
  }

  const memoText = getVoteMemo(voteId);
  const returnUrl = getVoteReturnUrl(voteId);
  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: ROADMAP_VOTE_WALLET,
    Amount: ROADMAP_VOTE_AMOUNT_DROPS,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex(ROADMAP_VOTE_MEMO_TYPE),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (walletAddress) {
    txjson.Account = walletAddress;
  }

  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify({
      txjson,
      options: {
        submit: true,
        return_url: {
          app: returnUrl,
          web: returnUrl,
        },
      },
      custom_meta: {
        identifier: `ott-vote-${voteId}`,
        instruction: `OTT roadmap vote: ${option.title}`,
        blob: {
          actionId: "roadmap-vote",
          voteId,
          sourceTag: MAKE_WAVES_SOURCE_TAG,
        },
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "Xaman roadmap vote payload creation failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "ott-roadmap-vote",
      cycle: ROADMAP_VOTE_CYCLE,
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      vote: option,
      proof: {
        destinationWallet: ROADMAP_VOTE_WALLET,
        amountDrops: ROADMAP_VOTE_AMOUNT_DROPS,
        memoType: ROADMAP_VOTE_MEMO_TYPE,
        memoText,
      },
      payload,
    },
  };
}

function readTx(entry: AccountTxEntry) {
  return entry.tx_json ?? entry.tx ?? {};
}

function getMemoTexts(tx: XrplTransaction) {
  return (tx.Memos ?? []).map((memo) => ({
    type: hexToText(memo.Memo?.MemoType),
    data: hexToText(memo.Memo?.MemoData),
  }));
}

function parseVerifiedVote(entry: AccountTxEntry): VerifiedVoteTransaction | null {
  const tx = readTx(entry);
  const meta = entry.meta ?? {};

  if (!entry.validated) {
    return null;
  }

  if (meta.TransactionResult !== "tesSUCCESS") {
    return null;
  }

  if (
    tx.TransactionType !== "Payment" ||
    tx.Destination !== ROADMAP_VOTE_WALLET ||
    tx.Amount !== ROADMAP_VOTE_AMOUNT_DROPS ||
    tx.SourceTag !== MAKE_WAVES_SOURCE_TAG ||
    !tx.Account ||
    !isValidXrplAddress(tx.Account)
  ) {
    return null;
  }

  const expectedPrefix = `${ROADMAP_VOTE_MEMO_PREFIX} | ${ROADMAP_VOTE_CYCLE} | `;
  const voteMemo = getMemoTexts(tx).find(
    (memo) =>
      memo.type === ROADMAP_VOTE_MEMO_TYPE &&
      memo.data.startsWith(expectedPrefix),
  );

  if (!voteMemo) {
    return null;
  }

  const voteId = voteMemo.data.slice(expectedPrefix.length).trim();
  const option = getVoteOption(voteId);

  if (!option) {
    return null;
  }

  const rippleEpochSeconds = typeof tx.date === "number" ? tx.date : null;
  const timestamp =
    rippleEpochSeconds === null
      ? null
      : new Date((rippleEpochSeconds + 946684800) * 1000).toISOString();

  return {
    account: tx.Account,
    voteId,
    title: option.title,
    txHash: tx.hash ?? null,
    ledgerIndex: tx.ledger_index ?? entry.ledger_index ?? 0,
    timestamp,
  };
}

async function fetchAllVoteAccountTransactions() {
  if (!ROADMAP_VOTE_WALLET || !isValidXrplAddress(ROADMAP_VOTE_WALLET)) {
    throw new Error(
      "Roadmap voting wallet is not configured. Set OTT_ROADMAP_VOTE_WALLET or OTT_PROOF_DESTINATION_WALLET.",
    );
  }

  const entries: AccountTxEntry[] = [];
  let marker: unknown = undefined;

  for (let page = 0; page < MAX_ACCOUNT_TX_PAGES; page += 1) {
    const params: Record<string, unknown> = {
      account: ROADMAP_VOTE_WALLET,
      ledger_index_min: -1,
      ledger_index_max: -1,
      binary: false,
      forward: false,
      limit: ACCOUNT_TX_PAGE_LIMIT,
    };

    if (marker !== undefined) {
      params.marker = marker;
    }

    const response = await fetch(XRPL_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_tx",
        params: [params],
      }),
    });

    const data = (await response.json()) as AccountTxResponse;

    if (!response.ok || data.error || data.result?.error) {
      throw new Error(
        data.result?.error_message || data.result?.error || data.error || "XRPL account_tx lookup failed.",
      );
    }

    entries.push(...(data.result?.transactions ?? []));
    marker = data.result?.marker;

    if (marker === undefined || marker === null) {
      break;
    }
  }

  return entries;
}

function buildStatsResponse(entries: AccountTxEntry[]) {
  const allVerifiedTransactions = entries
    .map(parseVerifiedVote)
    .filter((vote): vote is VerifiedVoteTransaction => Boolean(vote))
    .sort((left, right) => right.ledgerIndex - left.ledgerIndex);

  const latestVoteByWallet = new Map<string, VerifiedVoteTransaction>();

  for (const vote of allVerifiedTransactions) {
    if (!latestVoteByWallet.has(vote.account)) {
      latestVoteByWallet.set(vote.account, vote);
    }
  }

  const activeVotes = Array.from(latestVoteByWallet.values()).sort(
    (left, right) => right.ledgerIndex - left.ledgerIndex,
  );
  const counts = ROADMAP_OPTIONS.reduce<Record<string, number>>((result, option) => {
    result[option.id] = 0;
    return result;
  }, {});

  for (const vote of activeVotes) {
    counts[vote.voteId] = (counts[vote.voteId] ?? 0) + 1;
  }

  const ranking = ROADMAP_OPTIONS.map((option) => ({
    id: option.id,
    title: option.title,
    votes: counts[option.id] ?? 0,
  })).sort((left, right) => {
    if (right.votes !== left.votes) {
      return right.votes - left.votes;
    }

    return left.title.localeCompare(right.title);
  });

  return {
    ok: true,
    mode: "ott-roadmap-vote-stats",
    cycle: ROADMAP_VOTE_CYCLE,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    proof: {
      destinationWallet: ROADMAP_VOTE_WALLET,
      amountDrops: ROADMAP_VOTE_AMOUNT_DROPS,
      memoType: ROADMAP_VOTE_MEMO_TYPE,
    },
    totals: {
      activeVerifiedVotes: activeVotes.length,
      uniqueWallets: activeVotes.length,
      verifiedVoteTransactions: allVerifiedTransactions.length,
      scannedAccountTransactions: entries.length,
    },
    counts,
    ranking,
    mostVoted: ranking[0] ?? null,
    leastVoted: ranking.length > 0 ? ranking[ranking.length - 1] : null,
    recentVotes: activeVotes.slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
}

async function getVoteStats(body: RequestBody) {
  const walletAddress = getString(body, "walletAddress");

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return {
      status: 400,
      body: { ok: false, error: "Invalid walletAddress." },
    };
  }

  const now = Date.now();
  let baseStats = cachedStats?.expiresAt && cachedStats.expiresAt > now
    ? cachedStats.value
    : undefined;

  if (!baseStats) {
    const entries = await fetchAllVoteAccountTransactions();
    baseStats = buildStatsResponse(entries);
    cachedStats = {
      expiresAt: now + 10_000,
      value: baseStats,
    };
  }

  const walletVote = walletAddress
    ? baseStats.recentVotes.find((vote) => vote.account === walletAddress) ?? null
    : null;

  return {
    status: 200,
    body: {
      ...baseStats,
      walletVote,
    },
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const body = req.body ?? {};

    if (body.action === "xaman.createRoadmapVotePayload") {
      const result = await createXamanVotePayload(body);
      return res.status(result.status).json(result.body);
    }

    if (body.action === "xrpl.getRoadmapVoteStats") {
      const result = await getVoteStats(body);
      return res.status(result.status).json(result.body);
    }

    return res.status(400).json({
      ok: false,
      error: "Unknown roadmap vote API action.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown roadmap vote API error.",
    });
  }
}
