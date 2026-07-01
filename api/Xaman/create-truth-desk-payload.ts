import { MAKE_WAVES_SOURCE_TAG } from "../../src/lib/makeWaves";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ONE_XRP_DROPS = "1000000";

type TruthDeskServiceType = "ask-truth" | "one-on-one";

type RequestBody = {
  walletAddress?: string;
  destinationWallet?: string;
  serviceType?: TruthDeskServiceType;
  question?: string;
  meetingGoal?: string;
  durationMinutes?: number;
  amountDrops?: string;
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

function cleanAmountDrops(value: string | undefined, fallback = ONE_XRP_DROPS) {
  const cleanValue = value?.trim();

  if (!cleanValue || !/^[0-9]+$/.test(cleanValue)) {
    return fallback;
  }

  return cleanValue;
}

function cleanText(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) ?? "";
}

function isValidDuration(value: number | undefined) {
  return value === 15 || value === 30 || value === 45 || value === 60;
}

function getServiceLabel(serviceType: TruthDeskServiceType) {
  if (serviceType === "ask-truth") {
    return "Ask Truth";
  }

  return "Truth 1-on-1";
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

  const walletAddress = req.body?.walletAddress?.trim();
  const destinationWallet =
    req.body?.destinationWallet?.trim() ||
    process.env.OTT_TRUTH_DESK_WALLET?.trim();
  const serviceType = req.body?.serviceType ?? "ask-truth";
  const question = cleanText(req.body?.question, 200);
  const meetingGoal = cleanText(req.body?.meetingGoal, 500);
  const durationMinutes = req.body?.durationMinutes;
  const amountDrops = cleanAmountDrops(req.body?.amountDrops);

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid walletAddress.",
    });
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return res.status(400).json({
      ok: false,
      error:
        "Missing or invalid destinationWallet. Add OTT_TRUTH_DESK_WALLET in Vercel or send destinationWallet.",
    });
  }

  if (serviceType !== "ask-truth" && serviceType !== "one-on-one") {
    return res.status(400).json({
      ok: false,
      error: "Invalid serviceType.",
    });
  }

  if (serviceType === "ask-truth" && !question) {
    return res.status(400).json({
      ok: false,
      error: "Question is required for Ask Truth.",
    });
  }

  if (serviceType === "ask-truth" && question.length > 200) {
    return res.status(400).json({
      ok: false,
      error: "Question must be max 200 characters.",
    });
  }

  if (serviceType === "one-on-one" && !isValidDuration(durationMinutes)) {
    return res.status(400).json({
      ok: false,
      error: "durationMinutes must be 15, 30, 45 or 60.",
    });
  }

  if (serviceType === "one-on-one" && !meetingGoal) {
    return res.status(400).json({
      ok: false,
      error: "meetingGoal is required for 1-on-1.",
    });
  }

  const serviceLabel = getServiceLabel(serviceType);
  const memoSubject =
    serviceType === "ask-truth"
      ? question
      : `${durationMinutes} min | ${meetingGoal}`;
  const memoText = `OTT_TRUTH_DESK | ${serviceLabel} | ${memoSubject} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    Amount: amountDrops,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_TRUTH_DESK"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (walletAddress) {
    txjson.Account = walletAddress;
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
        identifier: `ott-truth-desk-${serviceType}`,
        instruction: `${serviceLabel} payment with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
        blob: {
          sourceTag: MAKE_WAVES_SOURCE_TAG,
          mode: "truth-desk-service-payment",
          serviceType,
          serviceLabel,
          question,
          meetingGoal,
          durationMinutes,
          destinationWallet,
          amountDrops,
          memoText,
        },
      },
    }),
  });

  const payload = (await xamanResponse.json()) as XamanPayloadResponse;

  if (!xamanResponse.ok) {
    return res.status(502).json({
      ok: false,
      error: "Xaman Truth Desk payload creation failed.",
      details: payload,
    });
  }

  return res.status(200).json({
    ok: true,
    mode: "truth-desk-service-payment",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    service: {
      serviceType,
      serviceLabel,
      question,
      meetingGoal,
      durationMinutes: serviceType === "one-on-one" ? durationMinutes : null,
    },
    payment: {
      destinationWallet,
      amountDrops,
    },
    payload,
    transactionMeta: {
      transactionType: "Payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      memoText,
    },
  });
}
