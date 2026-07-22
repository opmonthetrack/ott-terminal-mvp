import accessPassHandler from "../src/server/accessPassService";

type RequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    send: (body: string) => void;
  };
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function requiresExplicitNetwork(req: RequestLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  return !["status", "metadata", "image"].includes(scope);
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  const isStatusRequest = scope === "status";
  const network = process.env.OTT_ACCESS_PASS_XRPL_NETWORK?.trim().toUpperCase() ?? "";

  if (requiresExplicitNetwork(req) && network !== "TESTNET" && network !== "MAINNET") {
    return res.status(503).json({
      ok: false,
      error: "Access Pass signing is safely disabled until OTT_ACCESS_PASS_XRPL_NETWORK is explicitly TESTNET or MAINNET.",
    });
  }

  if (!isStatusRequest) {
    return accessPassHandler(req, res);
  }

  const proxy: ResponseLike = {
    setHeader: (name, value) => res.setHeader(name, value),
    status: (code) => ({
      json: (body) => {
        const error = typeof body === "object" && body !== null && "error" in body
          ? String((body as { error?: unknown }).error ?? "")
          : "";

        if (code >= 500 && error.includes("Access Pass order could not be loaded")) {
          return res.status(200).json({
            ok: true,
            setupRequired: true,
            order: null,
            claim: null,
            priceXrp: "1.589",
          });
        }

        return res.status(code).json(body);
      },
      send: (body) => res.status(code).send(body),
    }),
  };

  return accessPassHandler(req, proxy);
}
