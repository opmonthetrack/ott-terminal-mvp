type RequestLike = {
  method?: string;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  }

  const apiKey = process.env.XAMAN_API_KEY?.trim() ?? "";
  if (!UUID_PATTERN.test(apiKey)) {
    return res.status(503).json({
      ok: false,
      error: "The Xaman xApp connection is not configured.",
    });
  }

  return res.status(200).json({
    ok: true,
    apiKey,
  });
}
