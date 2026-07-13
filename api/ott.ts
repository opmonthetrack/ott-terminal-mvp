// api/ott-rewards.ts
// Isolated reward verification route.
// IMPORTANT: this file does not create Xaman payloads and does not modify api/ott.ts.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XRPL_MAINNET_RPC_URL =
  process.env.XRPL_MAINNET_RPC_URL || "https://s1.ripple.com:51234/";

type MakeWavesActionId =
  | "daily-checkin"
  | "source-tag-proof"
  | "wallet-safety"
  | "academy-lesson"
  | "xrpl-verify";

type RewardAction = {
  id: MakeWavesActionId;
  title: string;
  xp: number;
  ottCredits: number;
  memo: string;
};

const REWARD_ACTIONS: Record<MakeWavesActionId, RewardAction> = {
  "daily-checkin": {
    id: "daily-checkin",
    title: "Daily Check-In",
    xp: 10,
    ottCredits: 1,
    memo: "OTT_MAKE_WAVES | Daily Check-In | SourceTag 2606170002",
  },
  "source-tag-proof": {
    id: "source-tag-proof",
    title: "SourceTag Proof",
    xp: 15,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | SourceTag Proof | SourceTag 2606170002",
  },
  "wallet-safety": {
    id: "wallet-safety",
    title: "Wallet Safety",
    xp: 20,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | Wallet Safety | SourceTag 2606170002",
  },
  "academy-lesson": {
    id: "academy-lesson",
    title: "Academy Lesson",
    xp: 25,
    ottCredits: 3,
    memo: "OTT_MAKE_WAVES | Academy Lesson | SourceTag 2606170002",
  },
  "xrpl-verify": {
    id: "xrpl-verify",
    title: "XRPL Verify",
    xp: 20,
    ottCredits: 2,
    memo: "OTT_MAKE_WAVES | XRPL Verify | SourceTag 2606170002",
  },
};

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

type XrplTxJson = {
  Account?: string;
  Destination?: string;
  SourceTag?: number;
  TransactionType?: string;
  Amount?: string | Record<string, unknown>;
  Memos?: XrplMemo[];
  Fee?: string;
  hash?: string;
};

type XrplMeta = {
  TransactionResult?: string;
};

type XrplTxResult = {
  validated?: boolean;
  tx_json?: XrplTxJson;
  tx?: XrplTxJson;
  meta?: XrplMeta;
  hash?: string;
  ledger_index?: number;
  error?: string;
  error_message?: string;
};

type XrplRpcResponse = {
  result?: XrplTxResult;
  error?: string;
};

function getString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isValidTxHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function isMakeWavesActionId(value: string): value is MakeWavesActionId {
  return value in REWARD_ACTIONS;
}

function readTxJson(result: XrplTxResult): XrplTxJson {
  return result.tx_json ?? result.tx ?? {};
}

function readMeta(result: XrplTxResult): XrplMeta {
  return result.meta ?? {};
}

function hexToText(value: string | undefined) {
  if (!value || value.length % 2 !== 0 || !/^[A-Fa-f0-9]+$/.test(value)) {
    return "";
  }

  try {
    const bytes =
      value.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

function extractMemoText(memos: XrplMemo[] | undefined) {
  return (memos ?? []).map((memo) => ({
    type: hexToText(memo.Memo?.MemoType),
    data: hexToText(memo.Memo?.MemoData),
    format: hexToText(memo.Memo?.MemoFormat),
  }));
}

async function fetchMainnetTransaction(txHash: string) {
  const response = await fetch(XRPL_MAINNET_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "tx",
      params: [
        {
          transaction: txHash,
          binary: false,
        },
      ],
    }),
  });

  const data = (await response.json()) as XrplRpcResponse;
  const ledgerError = data.error || data.result?.error;

  if (ledgerError === "txnNotFound") {
    return {
      status: "pending" as const,
      data,
    };
  }

  if (!response.ok || ledgerError) {
    throw new Error(
      data.result?.error_message ||
        ledgerError ||
        "XRPL Mainnet transaction lookup failed.",
    );
  }

  if (!data.result) {
    return {
      status: "pending" as const,
      data,
    };
  }

  return {
    status: "found" as const,
    data,
  };
}

async function verifyRewardTransaction(body: RequestBody) {
  const txHash = getString(body, "txHash").toUpperCase();
  const actionIdValue = getString(body, "actionId");
  const expectedWallet = getString(body, "expectedWallet");
  const expectedDestination =
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
    process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
    "";
  const expectedAmountDrops = "1";

  if (!isValidTxHash(txHash)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Missing or invalid txHash.",
      },
    };
  }

  if (!isMakeWavesActionId(actionIdValue)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Unknown or non-public reward action.",
      },
    };
  }

  if (!isValidXrplAddress(expectedWallet)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Missing or invalid expectedWallet.",
      },
    };
  }

  if (!isValidXrplAddress(expectedDestination)) {
    return {
      status: 500,
      body: {
        ok: false,
        error:
          "Missing valid OTT_PROOF_DESTINATION_WALLET for reward verification.",
      },
    };
  }

  const action = REWARD_ACTIONS[actionIdValue];
  const lookup = await fetchMainnetTransaction(txHash);

  if (lookup.status === "pending") {
    return {
      status: 200,
      body: {
        ok: true,
        pending: true,
        awardEligible: false,
        rewardKey: `${txHash}:${action.id}`,
        message:
          "Transaction is signed but not validated on XRPL Mainnet yet. Verify again in a few seconds.",
        action: {
          id: action.id,
          title: action.title,
          xp: action.xp,
          ottCredits: action.ottCredits,
        },
      },
    };
  }

  const txResult = lookup.data.result as XrplTxResult;
  const txJson = readTxJson(txResult);
  const meta = readMeta(txResult);
  const memos = extractMemoText(txJson.Memos);
  const memoTypes = memos.map((memo) => memo.type).filter(Boolean);
  const memoData = memos.map((memo) => memo.data).filter(Boolean);

  const validated = Boolean(txResult.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const transactionTypeMatches = txJson.TransactionType === "Payment";
  const sourceTagMatches = txJson.SourceTag === MAKE_WAVES_SOURCE_TAG;
  const walletMatches = txJson.Account === expectedWallet;
  const destinationMatches = txJson.Destination === expectedDestination;
  const amountDrops =
    typeof txJson.Amount === "string" ? txJson.Amount : null;
  const amountMatches = amountDrops === expectedAmountDrops;
  const memoTypeMatches = memoTypes.some((memo) =>
    memo.includes("OTT_MAKE_WAVES"),
  );
  const memoMatches = memoData.some((memo) => memo.includes(action.memo));

  const awardEligible = Boolean(
    validated &&
      success &&
      transactionTypeMatches &&
      sourceTagMatches &&
      walletMatches &&
      destinationMatches &&
      amountMatches &&
      memoTypeMatches &&
      memoMatches,
  );

  return {
    status: 200,
    body: {
      ok: true,
      pending: false,
      awardEligible,
      rewardKey: `${txHash}:${action.id}`,
      message: awardEligible
        ? `Verified on XRPL Mainnet: +${action.xp} XP and +${action.ottCredits} OTT Credits eligible.`
        : "Transaction found, but one or more reward checks failed.",
      action: {
        id: action.id,
        title: action.title,
        xp: awardEligible ? action.xp : 0,
        ottCredits: awardEligible ? action.ottCredits : 0,
      },
      transaction: {
        txHash,
        account: txJson.Account ?? null,
        destination: txJson.Destination ?? null,
        transactionType: txJson.TransactionType ?? null,
        sourceTag: txJson.SourceTag ?? null,
        amountDrops,
        feeDrops: txJson.Fee ?? null,
        ledgerIndex: txResult.ledger_index ?? null,
        transactionResult,
        validated,
        memos,
      },
      checks: {
        validated,
        success,
        transactionTypeMatches,
        sourceTagMatches,
        walletMatches,
        destinationMatches,
        amountMatches,
        memoTypeMatches,
        memoMatches,
      },
      storage: {
        persisted: false,
        mode: "stateless-verification",
        note:
          "Server-side duplicate prevention is added in the next database step. Do not treat this response alone as a permanent balance ledger.",
      },
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

    if (body.action !== "rewards.verifyMakeWavesTransaction") {
      return res.status(400).json({
        ok: false,
        error: "Unknown reward API action.",
      });
    }

    const result = await verifyRewardTransaction(body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown OTT reward verification error.",
    });
  }
}
