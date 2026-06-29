import {
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesMemo,
} from "../../src/lib/makeWaves";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";

type RequestBody = {
  senderWallet?: string;
  destinationWallet?: string;
  issuerWallet?: string;
  currencyCode?: string;
  tokenAmount?: string;
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

type XamanPayloadResponse = {
  uuid?: string;
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    websocket_status?: string;
  };
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
};

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function cleanCurrencyCode(value: string) {
  return value.trim().toUpperCase().slice(0, 20);
}

function cleanTokenAmount(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue || Number.isNaN(Number(cleanValue))) {
    return "1";
  }

  return cleanValue;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  const apiKey = process.env.XAMAN_API_KEY;
  const apiSecret = process.env.XAMAN_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({
      ok: false,
      error: "Missing XAMAN_API_KEY or XAMAN_API_SECRET.",
    });
  }

  const senderWallet = req.body?.senderWallet?.trim();
  const destinationWallet = req.body?.destinationWallet?.trim();
  const issuerWallet = req.body?.issuerWallet?.trim();
  const currencyCode = cleanCurrencyCode(req.body?.currencyCode ?? "OTT");
  const tokenAmount = cleanTokenAmount(req.body?.tokenAmount ?? "1");

  if (senderWallet && !isValidXrplAddress(senderWallet)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid senderWallet.",
    });
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid destinationWallet.",
    });
  }

  if (!issuerWallet || !isValidXrplAddress(issuerWallet)) {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid issuerWallet.",
    });
  }

  if (!currencyCode) {
    return res.status(400).json({
      ok: false,
      error: "Missing currencyCode.",
    });
  }

  const memoText = getMakeWavesMemo("ott-token-eligibility");

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Amount: {
      currency: currencyCode,
      issuer: issuerWallet,
      value: tokenAmount,
    },
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_TESTNET_REWARD"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (senderWallet) {
    txjson.Account = senderWallet;
  }

  const xamanResponse = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
    },
    body: JSON.stringify({
      txjson,
      options: {
        submit: true,
        return_url: {
          app: "https://xumm.app",
          web: "https://xumm.app",
        },
      },
      custom_meta: {
        identifier: "ott-testnet-token-payment",
        instruction: `Send ${tokenAmount} ${currencyCode} with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
        blob: {
          sourceTag: MAKE_WAVES_SOURCE_TAG,
          mode: "testnet-token-payment",
          currencyCode,
          issuerWallet,
          destinationWallet,
          tokenAmount,
        },
      },
    }),
  });

  const payload = (await xamanResponse.json()) as XamanPayloadResponse;

  if (!xamanResponse.ok) {
    return res.status(502).json({
      ok: false,
      error: "Xaman token payment payload creation failed.",
      details: payload,
    });
  }

  return res.status(200).json({
    ok: true,
    mode: "testnet-token-payment",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    token: {
      currencyCode,
      issuerWallet,
      destinationWallet,
      tokenAmount,
    },
    payload,
    transactionMeta: {
      transactionType: "Payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      memoText,
    },
  });
}
