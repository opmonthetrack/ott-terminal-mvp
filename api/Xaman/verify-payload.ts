const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_PAYLOAD_BASE_URL = "https://xumm.app/api/v1/platform/payload";

type RequestBody = {
  uuid?: string;
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

function readSourceTag(payload: unknown): number | null {
  const data = payload as {
    payload?: {
      txjson?: {
        SourceTag?: number;
      };
    };
    txjson?: {
      SourceTag?: number;
    };
  };

  return data?.payload?.txjson?.SourceTag ?? data?.txjson?.SourceTag ?? null;
}

function readSigned(payload: unknown): boolean {
  const data = payload as {
    meta?: {
      signed?: boolean;
    };
  };

  return Boolean(data?.meta?.signed);
}

function readResolved(payload: unknown): boolean {
  const data = payload as {
    meta?: {
      resolved?: boolean;
    };
  };

  return Boolean(data?.meta?.resolved);
}

function readTransactionHash(payload: unknown): string | null {
  const data = payload as {
    response?: {
      txid?: string;
      txhash?: string;
    };
  };

  return data?.response?.txid ?? data?.response?.txhash ?? null;
}

function readAccount(payload: unknown): string | null {
  const data = payload as {
    response?: {
      account?: string;
    };
    payload?: {
      txjson?: {
        Account?: string;
      };
    };
  };

  return data?.response?.account ?? data?.payload?.txjson?.Account ?? null;
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

  const uuid = req.body?.uuid?.trim();

  if (!uuid) {
    return res.status(400).json({
      ok: false,
      error: "Missing payload uuid.",
    });
  }

  const xamanResponse = await fetch(`${XAMAN_PAYLOAD_BASE_URL}/${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
    },
  });

  const data = await xamanResponse.json();

  if (!xamanResponse.ok) {
    return res.status(xamanResponse.status).json({
      ok: false,
      error: "Could not fetch Xaman payload result.",
      details: data,
    });
  }

  const signed = readSigned(data);
  const resolved = readResolved(data);
  const txHash = readTransactionHash(data);
  const account = readAccount(data);
  const sourceTag = readSourceTag(data);
  const sourceTagMatches = sourceTag === MAKE_WAVES_SOURCE_TAG;

  return res.status(200).json({
    ok: true,
    makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
    verified: {
      signed,
      resolved,
      txHash,
      account,
      sourceTag,
      sourceTagMatches,
      rewardAllowed: Boolean(signed && resolved && txHash && sourceTagMatches),
    },
    payload: data,
  });
}
