const MAKE_WAVES_SOURCE_TAG = 2606170002;
const ROADMAP_VOTE_CYCLE = "cycle-1";
const ROADMAP_VOTE_MEMO_PREFIX = "OTT Make Waves Roadmap Vote";
const ROADMAP_VOTE_MEMO_TYPE = "OTT_ROADMAP_VOTE";
const ROADMAP_VOTE_AMOUNT_DROPS = "1";

const ROADMAP_OPTIONS = [
  { id: "academy-expansion", title: "Academy Expansion" },
  { id: "web2-license", title: "Web2 License Access" },
  { id: "marketplace-merch", title: "Marketplace + Merch" },
  { id: "ai-research", title: "AI Research Assistant" },
  { id: "token-tools-review", title: "XP, OTT Utility + NFT Holder Rewards" },
] as const;

const ROADMAP_OPTION_IDS = new Set(ROADMAP_OPTIONS.map((option) => option.id));
const ALLOWED_PROVIDERS = new Set(["crossmark", "gemwallet"]);

const ROADMAP_VOTE_WALLET =
  process.env.OTT_ROADMAP_VOTE_WALLET?.trim() ||
  process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
  process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
  "";

type RequestBody = Record<string, unknown> & {
  voteId?: string;
  walletAddress?: string;
  providerId?: string;
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

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function getString(body: RequestBody, key: keyof RequestBody) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  const body = req.body ?? {};
  const voteId = getString(body, "voteId");
  const walletAddress = getString(body, "walletAddress");
  const providerId = getString(body, "providerId");
  const option = ROADMAP_OPTIONS.find((item) => item.id === voteId);

  if (!option || !ROADMAP_OPTION_IDS.has(voteId as (typeof ROADMAP_OPTIONS)[number]["id"])) {
    return res.status(400).json({
      ok: false,
      error: "Invalid roadmap vote option.",
      allowedVoteIds: ROADMAP_OPTIONS.map((item) => item.id),
    });
  }

  if (!isValidXrplAddress(walletAddress)) {
    return res.status(400).json({ ok: false, error: "Connect and verify a valid XRPL wallet before voting." });
  }

  if (!ALLOWED_PROVIDERS.has(providerId)) {
    return res.status(400).json({ ok: false, error: "This endpoint supports CROSSMARK and GemWallet transactions only." });
  }

  if (!isValidXrplAddress(ROADMAP_VOTE_WALLET)) {
    return res.status(503).json({
      ok: false,
      error: "Roadmap voting wallet is not configured. Set OTT_ROADMAP_VOTE_WALLET or OTT_PROOF_DESTINATION_WALLET.",
    });
  }

  const memoText = `${ROADMAP_VOTE_MEMO_PREFIX} | ${ROADMAP_VOTE_CYCLE} | ${voteId}`;
  const txjson = {
    TransactionType: "Payment",
    Account: walletAddress,
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

  return res.status(200).json({
    ok: true,
    mode: "ott-roadmap-provider-transaction",
    providerId,
    cycle: ROADMAP_VOTE_CYCLE,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    vote: option,
    proof: {
      destinationWallet: ROADMAP_VOTE_WALLET,
      amountDrops: ROADMAP_VOTE_AMOUNT_DROPS,
      memoType: ROADMAP_VOTE_MEMO_TYPE,
      memoText,
    },
    txjson,
  });
}
