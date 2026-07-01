import { MAKE_WAVES_SOURCE_TAG } from "../../src/lib/makeWaves";
import { getPartnerProofStampMemo } from "../../src/lib/partnerCatalog";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";

type RequestBody = {
  walletAddress?: string;
  destinationWallet?: string;
  partnerId?: string;
  routeName?: string;
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

function cleanAmountDrops(value: string | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue || !/^[0-9]+$/.test(cleanValue)) {
    return "1";
  }

  return cleanValue;
}

function cleanRouteName(value: string | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return "OTT Partner Route";
  }

  return cleanValue.slice(0, 80);
}

function cleanPartnerId(value: string | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return "anodos";
  }

  return cleanValue.slice(0, 60);
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
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim();
  const partnerId = cleanPartnerId(req.body?.partnerId);
  const routeName = cleanRouteName(req.body?.routeName);
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
        "Missing or invalid destinationWallet. Add OTT_PROOF_DESTINATION_WALLET in Vercel or send destinationWallet.",
    });
  }

  const memoText = getPartnerProofStampMemo(partnerId as never);
  const visibleMemo = `${memoText} | ${routeName} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    Amount: amountDrops,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_PROOF_STAMP"),
          MemoData: textToHex(visibleMemo),
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
        identifier: `ott-proof-stamp-${partnerId}`,
        instruction: `Stamp ${routeName} completion on XRPL with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
        blob: {
          sourceTag: MAKE_WAVES_SOURCE_TAG,
          mode: "partner-proof-stamp",
          partnerId,
          routeName,
          destinationWallet,
          amountDrops,
          memoText: visibleMemo,
        },
      },
    }),
  });

  const payload = (await xamanResponse.json()) as XamanPayloadResponse;

  if (!xamanResponse.ok) {
    return res.status(502).json({
      ok: false,
      error: "Xaman proof stamp payload creation failed.",
      details: payload,
    });
  }

  return res.status(200).json({
    ok: true,
    mode: "partner-proof-stamp",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    route: {
      partnerId,
      routeName,
    },
    payment: {
      destinationWallet,
      amountDrops,
    },
    payload,
    transactionMeta: {
      transactionType: "Payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      memoText: visibleMemo,
    },
  });
}
