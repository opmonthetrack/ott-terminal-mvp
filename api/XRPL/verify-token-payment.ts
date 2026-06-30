import {
  MAKE_WAVES_SOURCE_TAG,
  isMakeWavesSourceTag,
} from "../../src/lib/makeWaves";

const XRPL_RPC_URL =
  process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";

type RequestBody = {
  txHash?: string;
  expectedDestination?: string;
  expectedIssuer?: string;
  expectedCurrency?: string;
  expectedAmount?: string;
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

type IssuedCurrencyAmount = {
  currency?: string;
  issuer?: string;
  value?: string;
};

type XrplTxJson = {
  Account?: string;
  Destination?: string;
  SourceTag?: number;
  TransactionType?: string;
  hash?: string;
  Amount?: string | IssuedCurrencyAmount;
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

function isIssuedCurrencyAmount(
  amount: string | IssuedCurrencyAmount | undefined
): amount is IssuedCurrencyAmount {
  return Boolean(amount && typeof amount === "object");
}

function normalizeCurrency(value: string | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function matchesOptional(expected: string | undefined, actual: string | null) {
  const cleanExpected = expected?.trim();

  if (!cleanExpected) {
    return true;
  }

  return cleanExpected === actual;
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
      error: "XRPL token payment lookup failed.",
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
  const amount = txJson.Amount;

  const issuedAmount = isIssuedCurrencyAmount(amount) ? amount : null;

  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(result.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const isPayment = txJson.TransactionType === "Payment";
  const isTokenPayment = Boolean(isPayment && issuedAmount);

  const tokenCurrency = normalizeCurrency(issuedAmount?.currency);
  const tokenIssuer = issuedAmount?.issuer ?? null;
  const tokenAmount = issuedAmount?.value ?? null;

  const currencyMatches =
    !req.body?.expectedCurrency ||
    normalizeCurrency(req.body.expectedCurrency) === tokenCurrency;

  const issuerMatches = matchesOptional(req.body?.expectedIssuer, tokenIssuer);
  const destinationMatches = matchesOptional(
    req.body?.expectedDestination,
    txJson.Destination ?? null
  );
  const amountMatches = matchesOptional(req.body?.expectedAmount, tokenAmount);

  const tokenPaymentMatches = Boolean(
    isTokenPayment &&
      currencyMatches &&
      issuerMatches &&
      destinationMatches &&
      amountMatches
  );

  const makeWavesTokenVerified = Boolean(
    validated &&
      success &&
      sourceTagMatches &&
      tokenPaymentMatches
  );

  return res.status(200).json({
    ok: true,
    makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
    txHash,
    verified: {
      makeWavesTokenVerified,
      validated,
      success,
      transactionResult,
      sourceTag,
      sourceTagMatches,
      account: txJson.Account ?? null,
      destination: txJson.Destination ?? null,
      transactionType: txJson.TransactionType ?? null,
      isPayment,
      isTokenPayment,
      token: {
        currency: tokenCurrency || null,
        issuer: tokenIssuer,
        amount: tokenAmount,
      },
      checks: {
        currencyMatches,
        issuerMatches,
        destinationMatches,
        amountMatches,
        tokenPaymentMatches,
      },
      ledgerIndex: result.ledger_index ?? null,
    },
    xrpl: data.result,
  });
}
