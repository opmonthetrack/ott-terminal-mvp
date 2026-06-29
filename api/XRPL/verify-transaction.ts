import {
  MAKE_WAVES_SOURCE_TAG,
  isMakeWavesSourceTag,
} from "../../src/lib/makeWaves";

const XRPL_RPC_URL =
  process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";

type RequestBody = {
  txHash?: string;
  expectedAccount?: string;
  expectedDestination?: string;
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

type XrplTxJson = {
  Account?: string;
  Destination?: string;
  SourceTag?: number;
  TransactionType?: string;
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
      error: "XRPL transaction lookup failed.",
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

  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(result.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";

  const accountMatches =
    !req.body?.expectedAccount || txJson.Account === req.body.expectedAccount;

  const destinationMatches =
    !req.body?.expectedDestination ||
    txJson.Destination === req.body.expectedDestination;

  const makeWavesVerified = Boolean(
    validated &&
      success &&
      sourceTagMatches &&
      accountMatches &&
      destinationMatches
  );

  return res.status(200).json({
    ok: true,
    makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    verified: {
      makeWavesVerified,
      validated,
      success,
      transactionResult,
      sourceTag,
      sourceTagMatches,
      account: txJson.Account ?? null,
      destination: txJson.Destination ?? null,
      accountMatches,
      destinationMatches,
      transactionType: txJson.TransactionType ?? null,
      ledgerIndex: result.ledger_index ?? null,
    },
    xrpl: data.result,
  });
}
