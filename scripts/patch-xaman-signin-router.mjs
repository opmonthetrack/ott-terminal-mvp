import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "api", "ott.ts");
let source = fs.readFileSync(filePath, "utf8");
const marker = "async function handleCreateXamanSignInPayload";

if (source.includes(marker)) {
  console.log("Xaman SignIn router is already patched.");
  process.exit(0);
}

const brandingNeedle = "return_url: getBrandingReturnUrl(actionId),";
if (!source.includes(brandingNeedle)) {
  throw new Error("Could not find the Xaman branding return_url assignment.");
}
source = source.replace(
  brandingNeedle,
  'return_url: blob.mode === "ott-wallet-signin" && options.return_url\n        ? options.return_url\n        : getBrandingReturnUrl(actionId),',
);

const insertionNeedle = "async function handleCreateMakeWavesPayload(body: RequestBody) {";
if (!source.includes(insertionNeedle)) {
  throw new Error("Could not find handleCreateMakeWavesPayload insertion point.");
}

const signInFunctions = `function getXamanSignInReturnUrl() {
  const deploymentUrl =
    normalizePublicUrl(process.env.VERCEL_URL) ||
    OTT_PUBLIC_APP_URL;

  return \`${'${deploymentUrl}'}/?tab=xaman&xaman_signin_return=1&payload={id}\`;
}

function isValidPayloadUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function handleCreateXamanSignInPayload() {
  const returnUrl = getXamanSignInReturnUrl();
  const result = await createXamanPayload({
    txjson: {
      TransactionType: "SignIn",
    },
    options: {
      submit: false,
      return_url: {
        app: returnUrl,
        web: returnUrl,
      },
    },
    custom_meta: {
      identifier: "ott-wallet-signin",
      instruction: "OnTheTrack — Verify ownership of your XRPL wallet",
      blob: {
        mode: "ott-wallet-signin",
        actionId: "wallet-signin",
        purpose: "Signature-only wallet ownership verification",
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "xaman-signin",
      payload: result.body,
    },
  };
}

async function handleVerifyXamanSignInPayload(body: RequestBody) {
  const uuid = getString(body, "uuid");
  if (!isValidPayloadUuid(uuid)) {
    return {
      status: 400,
      body: { ok: false, error: "A valid Xaman payload UUID is required." },
    };
  }

  const result = await getXamanPayload(uuid);
  if (result.status !== 200) {
    return result;
  }

  const payload = result.body as {
    meta?: { signed?: boolean; resolved?: boolean };
    response?: { account?: string };
  };
  const resolved = Boolean(payload.meta?.resolved);
  const signed = Boolean(payload.meta?.signed);
  const account = payload.response?.account?.trim() ?? "";

  if (signed && !isValidXrplAddress(account)) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "Xaman returned a signed request without a valid XRPL account.",
      },
    };
  }

  return {
    status: resolved ? 200 : 202,
    body: {
      ok: true,
      mode: "xaman-signin",
      pending: !resolved,
      resolved,
      signed,
      account: signed ? account : null,
      declined: resolved && !signed,
      payload,
    },
  };
}

`;

source = source.replace(insertionNeedle, signInFunctions + insertionNeedle);

const handlerNeedle = '    if (action === "xaman.createMakeWavesPayload") {';
if (!source.includes(handlerNeedle)) {
  throw new Error("Could not find API action insertion point.");
}
const signInActions = `    if (action === "xaman.createSignInPayload") {
      result = await handleCreateXamanSignInPayload();
    }

    if (action === "xaman.verifySignInPayload") {
      result = await handleVerifyXamanSignInPayload(body);
    }

`;
source = source.replace(handlerNeedle, signInActions + handlerNeedle);

fs.writeFileSync(filePath, source);
console.log("Patched api/ott.ts with signature-only Xaman SignIn actions.");
