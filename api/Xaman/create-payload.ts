const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_PAYLOAD_URL = "https://xumm.app/api/v1/platform/payload";

type RequestBody = {
  userWallet?: string;
  destinationWallet?: string;
  amountDrops?: string;
  memoText?: string;
};

type RequestLike = {
  method?: string;
  body?: RequestBody;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
    send?: (body: string) => void;
  };
};

function textToHex(value: string) {
  return Buffer.from(value, "utf8").toString("hex").toUpperCase();
}

function isValidClassicAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
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
      error: "Missing XAMAN_API_KEY or XAMAN_API_SECRET environment variables.",
    });
  }

  const {
    userWallet,
    destinationWallet,
    amountDrops = "1000000",
    memoText = "OTT_DAILY_CHECKIN",
  } = req.body || {};

  if (!destinationWallet || !isValidClassicAddress(destinationWallet)) {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid destinationWallet.",
    });
  }

  if (userWallet && !isValidClassicAddress(userWallet)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid userWallet.",
    });
  }

  if (!/^[0-9]+$/.test(amountDrops)) {
    return res.status(400).json({
      ok: false,
      error: "amountDrops must be a string with drops only.",
    });
  }

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    Amount: amountDrops,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("MakeWaves"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (userWallet) {
    txjson.Account = userWallet;
  }

  const payloadBody = {
    txjson,
    options: {
      submit: true,
      expire: 10,
    },
    custom_meta: {
      identifier: `ott-make-waves-${Date.now()}`,
      instruction: `OTT Make Waves action with SourceTag ${MAKE_WAVES_SOURCE_TAG}. Confirm only if you trust this action.`,
      blob: {
        app: "XRPL OnTheTrack Terminal",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        flow: "make-waves-checkin",
      },
    },
  };

  const xamanResponse = await fetch(XAMAN_PAYLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
    },
    body: JSON.stringify(payloadBody),
  });

  const data = await xamanResponse.json();

  if (!xamanResponse.ok) {
    return res.status(xamanResponse.status).json({
      ok: false,
      error: "Xaman payload creation failed.",
      details: data,
    });
  }

  return res.status(200).json({
    ok: true,
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    payload: data,
  });
}
