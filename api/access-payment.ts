import { createClient } from "@supabase/supabase-js";
import accessPassHandler from "../src/server/accessPassService";
import premiumAccessHandler from "../src/server/premiumAccessService";

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
  [key: string]: unknown;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    send: (body: string) => void;
  };
};

const EMPTY_UUID = "00000000-0000-4000-8000-000000000000";
const XRPL_ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const PREMIUM_SCOPES = new Set(["grant-status", "wallet-link", "grants"]);

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function header(req: RequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function bearer(req: RequestLike) {
  const value = header(req, "authorization");
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function requiresExplicitNetwork(req: RequestLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  return !["status", "metadata", "image", "readiness", ...PREMIUM_SCOPES].includes(scope);
}

function serverStorage() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim() || "";
  return { url, key };
}

function accessPassRpcUrl() {
  return process.env.OTT_ACCESS_PASS_XRPL_RPC_URL?.trim() || "";
}

function rpcMatchesNetwork(network: string, rpcUrl: string) {
  if (!rpcUrl || (network !== "TESTNET" && network !== "MAINNET")) return false;
  const testnetEndpoint = /(?:altnet|testnet|rippletest)/i.test(rpcUrl);
  return network === "TESTNET" ? testnetEndpoint : !testnetEndpoint;
}

function adminAllowed(userId: string, email: string) {
  const ids = new Set(
    (process.env.OTT_MINT_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const emails = new Set(
    (process.env.OTT_MINT_ADMIN_EMAILS ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

function readinessCheck(id: string, label: string, ok: boolean, detail: string, blocking = true) {
  return { id, label, ok, detail, blocking };
}

async function handleReadiness(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Use GET." });
  }

  const storage = serverStorage();
  if (!storage.url || !storage.key) {
    return res.status(503).json({
      ok: false,
      error: "Trusted Supabase server storage is not configured.",
    });
  }

  const token = bearer(req);
  if (!token) return res.status(401).json({ ok: false, error: "Sign in first." });

  const admin = createClient(storage.url, storage.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return res.status(401).json({ ok: false, error: "OTT account session could not be verified." });
  }
  if (!adminAllowed(authData.user.id, authData.user.email ?? "")) {
    return res.status(403).json({ ok: false, error: "This OTT account is not authorized for Access Pass issuance." });
  }

  const network = process.env.OTT_ACCESS_PASS_XRPL_NETWORK?.trim().toUpperCase() || "UNSET";
  const networkExplicit = network === "TESTNET" || network === "MAINNET";
  const rpcUrl = accessPassRpcUrl();
  const rpcConsistent = rpcMatchesNetwork(network, rpcUrl);
  const testnetValidated = process.env.OTT_ACCESS_PASS_TESTNET_VALIDATED?.trim().toLowerCase() === "true";
  const mainnetGateOpen = network !== "MAINNET" || testnetValidated;
  const accessWallet = process.env.OTT_ACCESS_WALLET?.trim() || "";
  const issuerWallet = process.env.OTT_ACCESS_PASS_ISSUER_WALLET?.trim() || "";
  const xamanConfigured = Boolean(process.env.XAMAN_API_KEY?.trim() && process.env.XAMAN_API_SECRET?.trim());

  const { error: orderTableError } = await admin
    .from("access_pass_orders")
    .select("id", { count: "exact", head: true });
  const orderTableReady = !orderTableError;

  const { error: lifecycleError } = await admin
    .from("nft_issuance_records")
    .select("lifecycle_step", { count: "exact", head: true });
  const lifecycleReady = !lifecycleError;

  const { error: reserveFunctionError } = await admin.rpc("reserve_ott_access_pass", {
    p_order_id: EMPTY_UUID,
  });
  const reserveFunctionReady = Boolean(
    reserveFunctionError?.message?.includes("Access Pass order not found"),
  );

  const checks = [
    readinessCheck("supabase", "Trusted Supabase server", true, "Server-only secret storage is available."),
    readinessCheck("order-table", "Access Pass order table", orderTableReady, orderTableReady ? "Migration table found." : "Run the Access Pass migration."),
    readinessCheck("lifecycle", "NFT delivery lifecycle", lifecycleReady, lifecycleReady ? "Lifecycle columns found." : "Run the certificate delivery migration first."),
    readinessCheck("reservation", "Atomic serial reservation", reserveFunctionReady, reserveFunctionReady ? "Reservation function found." : "Run or repair reserve_ott_access_pass()."),
    readinessCheck("network", "Explicit XRPL network", networkExplicit, networkExplicit ? network : "Set OTT_ACCESS_PASS_XRPL_NETWORK to TESTNET first."),
    readinessCheck(
      "rpc",
      "Access Pass RPC matches network",
      rpcConsistent,
      rpcConsistent
        ? `Dedicated ${network} RPC endpoint configured.`
        : "Set OTT_ACCESS_PASS_XRPL_RPC_URL to an endpoint matching the selected network.",
    ),
    readinessCheck("xaman", "Xaman server credentials", xamanConfigured, xamanConfigured ? "Signing payload service configured." : "Set XAMAN_API_KEY and XAMAN_API_SECRET."),
    readinessCheck("payment-wallet", "Access payment wallet", XRPL_ADDRESS.test(accessWallet), XRPL_ADDRESS.test(accessWallet) ? "Explicit destination wallet configured." : "Set a valid OTT_ACCESS_WALLET."),
    readinessCheck("issuer-wallet", "Access Pass issuer wallet", XRPL_ADDRESS.test(issuerWallet), XRPL_ADDRESS.test(issuerWallet) ? "Issuer account configured." : "Set a valid OTT_ACCESS_PASS_ISSUER_WALLET."),
    readinessCheck("founder", "Founder allowlist", true, "Current OTT account is authorized."),
    readinessCheck(
      "mainnet-gate",
      "TESTNET proof before MAINNET",
      mainnetGateOpen,
      network === "MAINNET"
        ? (testnetValidated ? "TESTNET validation has been explicitly recorded." : "MAINNET remains blocked until OTT_ACCESS_PASS_TESTNET_VALIDATED=true.")
        : "TESTNET mode does not require a prior production proof.",
    ),
    readinessCheck(
      "final-artwork",
      "Final Access Pass artwork",
      Boolean(process.env.OTT_ACCESS_PASS_IMAGE_URI?.trim()),
      process.env.OTT_ACCESS_PASS_IMAGE_URI?.trim()
        ? "Final public image URI configured."
        : "Temporary generated artwork will be used until the final public image URI is set.",
      false,
    ),
  ];

  const ready = checks.filter((check) => check.blocking).every((check) => check.ok);

  return res.status(200).json({
    ok: true,
    readiness: {
      ready,
      safeToTest: ready && network === "TESTNET",
      safeForMainnet: ready && network === "MAINNET" && testnetValidated,
      network,
      testnetValidated,
      checks,
    },
  });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  const isStatusRequest = scope === "status";
  const network = process.env.OTT_ACCESS_PASS_XRPL_NETWORK?.trim().toUpperCase() ?? "";
  const rpcUrl = accessPassRpcUrl();
  const testnetValidated = process.env.OTT_ACCESS_PASS_TESTNET_VALIDATED?.trim().toLowerCase() === "true";

  if (PREMIUM_SCOPES.has(scope)) {
    return premiumAccessHandler(req, res);
  }

  if (scope === "readiness") {
    return handleReadiness(req, res);
  }

  if (requiresExplicitNetwork(req) && network !== "TESTNET" && network !== "MAINNET") {
    return res.status(503).json({
      ok: false,
      error: "Access Pass signing is safely disabled until OTT_ACCESS_PASS_XRPL_NETWORK is explicitly TESTNET or MAINNET.",
    });
  }

  if (requiresExplicitNetwork(req) && !rpcMatchesNetwork(network, rpcUrl)) {
    return res.status(503).json({
      ok: false,
      error: "Access Pass signing is safely disabled because OTT_ACCESS_PASS_XRPL_RPC_URL is missing or does not match the selected XRPL network.",
    });
  }

  if (requiresExplicitNetwork(req) && network === "MAINNET" && !testnetValidated) {
    return res.status(503).json({
      ok: false,
      error: "Access Pass MAINNET signing is safely disabled until the complete TESTNET lifecycle is validated and OTT_ACCESS_PASS_TESTNET_VALIDATED=true.",
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
