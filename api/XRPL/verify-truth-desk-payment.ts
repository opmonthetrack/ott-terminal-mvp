import {
  MAKE_WAVES_SOURCE_TAG,
  isMakeWavesSourceTag,
} from "../../src/lib/makeWaves";

const XRPL_RPC_URL =
  process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";

type RequestBody = {
  txHash?: string;
  expectedWallet?: string;
  expectedDestination?: string;
  expectedAmountDrops?: string;
  expectedMemoContains?: string;
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
};

type XrplRpcResponse = {
  result?: XrplTxResult & {
    error?: string;
    error_message?: string;
  };
  error?: string;
};

function isValidTxHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function readTxJson(result: XrplTxResult): XrplTxJson {
  return result.tx_json ?? result.tx ?? {};
}

function readMeta(result: XrplTxResult): XrplMeta {
  return result.meta ?? {};
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

function extractMemoText(memos: XrplMemo[] | undefined) {
  if (!memos?.length) {
    return [];
  }

  return memos.map((memo) => ({
    type: hexToText(memo.Memo?.MemoType),
    data: hexToText(memo.Memo?.MemoData),
    format: hexToText(memo.Memo?.MemoFormat),
  }));
}

function matchesOptional(expected: string | undefined, actual: string | null) {
  const cleanExpected = expected?.trim();

  if (!cleanExpected) {
    return true;
  }

  return cleanExpected === actual;
}

function memoContainsExpected(
  expectedMemoContains: string | undefined,
  memoData: string[]
) {
  const cleanExpected = expectedMemoContains?.trim();

  if (!cleanExpected) {
    return true;
  }

  return memoData.some((memo) => memo.includes(cleanExpected));
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  const txHash = req.body?.txHash?.trim();

  if (!txHash || !isValidTxHash(txHash)) {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid txHash.",
    });
  }

  const xrplResponse = await fetch(XRPL_RPC_URL, {
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

  const data = (await xrplResponse.json()) as XrplRpcResponse;

  if (!xrplResponse.ok || data.error || data.result?.error) {
    return res.status(502).json({
      ok: false,
      error: "XRPL Truth Desk payment lookup failed.",
      details: data,
    });
  }

  const result = data.result;

  if (!result) {
    return res.status(404).json({
      ok: false,
      error: "Transaction not found.",
    });
  }

  const txJson = readTxJson(result);
  const meta = readMeta(result);
  const memoText = extractMemoText(txJson.Memos);
  const memoData = memoText.map((memo) => memo.data).filter(Boolean);

  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(result.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const isPayment = txJson.TransactionType === "Payment";
  const amountDrops =
    typeof txJson.Amount === "string" ? txJson.Amount : null;

  const walletMatches = matchesOptional(
    req.body?.expectedWallet,
    txJson.Account ?? null
  );
  const destinationMatches = matchesOptional(
    req.body?.expectedDestination,
    txJson.Destination ?? null
  );
  const amountMatches = matchesOptional(
    req.body?.expectedAmountDrops,
    amountDrops
  );
  const memoMatches = memoContainsExpected(
    req.body?.expectedMemoContains,
    memoData
  );
  const hasTruthDeskMemo =
    memoData.some((memo) => memo.includes("OTT_TRUTH_DESK")) ||
    memoText.some((memo) => memo.type.includes("OTT_TRUTH_DESK"));

  const truthDeskPaymentVerified = Boolean(
    validated &&
      success &&
      isPayment &&
      sourceTagMatches &&
      walletMatches &&
      destinationMatches &&
      amountMatches &&
      memoMatches &&
      hasTruthDeskMemo
  );

  return res.status(200).json({
    ok: true,
    makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    verified: {
      truthDeskPaymentVerified,
      validated,
      success,
      transactionResult,
      sourceTag,
      sourceTagMatches,
      account: txJson.Account ?? null,
      destination: txJson.Destination ?? null,
      transactionType: txJson.TransactionType ?? null,
      isPayment,
      amountDrops,
      walletMatches,
      destinationMatches,
      amountMatches,
      memoMatches,
      hasTruthDeskMemo,
      memoText,
      ledgerIndex: result.ledger_index ?? null,
    },
    xrpl: data.result,
  });
}
