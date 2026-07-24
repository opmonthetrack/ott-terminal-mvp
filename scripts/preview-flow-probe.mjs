import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL;
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/preview-flow-probe");
if (!baseUrl) throw new Error("AUDIT_BASE_URL is required");
fs.mkdirSync(outputDir, { recursive: true });

async function postJson(pathname, body) {
  const response = await fetch(new URL(pathname, baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: `Non-JSON response (${response.status})` };
  }
  return { status: response.status, ok: response.ok, data };
}

function payloadSummary(result) {
  const payload = result?.data?.payload;
  return {
    httpStatus: result.status,
    responseOk: result.ok,
    apiOk: result?.data?.ok === true,
    error: result?.data?.error || null,
    uuidPresent: Boolean(payload?.uuid),
    signingUrlPresent: Boolean(payload?.next?.always || payload?.next?.no_push_msg_received),
    qrPresent: Boolean(payload?.refs?.qr_png || payload?.refs?.qr_matrix),
    sourceTag: result?.data?.sourceTag ?? null,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  authentication: {},
  publicApis: {},
  payloadInitiation: {},
  limits: [
    "No valid test-user credentials were supplied, so successful email login is not claimed.",
    "OAuth initiation can be verified, but the third-party account approval callback is not completed.",
    "Xaman signing links are created but never opened or signed.",
    "No XRP payment, vote, NFT mint, NFT offer or NFT acceptance is submitted.",
  ],
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ott-account-welcome-choice-v1", "done");
  localStorage.setItem("ott-terminal-language-v2", "en");
});

await page.goto(`${baseUrl}/?tab=wallet`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const bodyText = await page.locator("body").innerText();
const warning = "The account UI is ready. Add the Supabase browser keys in Vercel before login can be used.";
const signInButton = page.getByRole("button", { name: "Sign in", exact: true });
const knownProviders = ["Google", "Apple", "Microsoft", "GitHub"];
const visibleProviders = [];
for (const provider of knownProviders) {
  if (await page.getByRole("button", { name: provider, exact: true }).isVisible().catch(() => false)) {
    visibleProviders.push(provider);
  }
}

report.authentication.configured = !bodyText.includes(warning) && !(await signInButton.isDisabled().catch(() => true));
report.authentication.visibleProviders = visibleProviders;
report.authentication.emailUiPresent = await page.getByLabel("Email", { exact: true }).isVisible().catch(() => false);
report.authentication.passwordUiPresent = await page.getByLabel("Password", { exact: true }).isVisible().catch(() => false);

if (report.authentication.configured && report.authentication.emailUiPresent && report.authentication.passwordUiPresent) {
  const authResponses = [];
  page.on("response", async (response) => {
    if (/\/auth\/v1\/(token|signup|recover|authorize)/.test(response.url())) {
      authResponses.push({ url: response.url(), status: response.status() });
    }
  });
  await page.getByLabel("Email", { exact: true }).fill(`ott-e2e-probe-${Date.now()}@example.invalid`);
  await page.getByLabel("Password", { exact: true }).fill("ProbeOnly-NotARealPassword-589");
  await signInButton.click();
  await page.waitForTimeout(2500);
  const afterText = await page.locator("body").innerText();
  report.authentication.invalidCredentialProbe = {
    friendlyErrorShown:
      afterText.includes("The email address or password is incorrect.") ||
      afterText.includes("Het e-mailadres of wachtwoord is onjuist."),
    rawCredentialErrorLeaked: afterText.toLowerCase().includes("invalid login credentials"),
    authResponses,
  };
}

if (visibleProviders.includes("Google")) {
  const providerRequests = [];
  page.on("request", (request) => {
    if (/\/auth\/v1\/authorize/.test(request.url()) || /accounts\.google\.com/.test(request.url())) {
      providerRequests.push(request.url());
    }
  });
  await page.getByRole("button", { name: "Google", exact: true }).click().catch(() => undefined);
  await page.waitForTimeout(2000);
  report.authentication.googleInitiation = {
    initiated: providerRequests.length > 0 || /accounts\.google\.com|\/auth\/v1\/authorize/.test(page.url()),
    destinationHost: (() => {
      try { return new URL(providerRequests.at(-1) || page.url()).host; } catch { return null; }
    })(),
  };
}

await page.screenshot({ path: path.join(outputDir, "wallet-auth-preview.png"), fullPage: true }).catch(() => undefined);
await context.close();
await browser.close();

const supportStats = await postJson("/api/support-payment", { action: "xrpl.getSupportStats" });
report.publicApis.supportStats = {
  httpStatus: supportStats.status,
  responseOk: supportStats.ok,
  apiOk: supportStats.data?.ok === true,
  totalsPresent: Boolean(supportStats.data?.stats),
  error: supportStats.data?.error || null,
};

const voteStats = await postJson("/api/roadmap-vote", { action: "xrpl.getRoadmapVoteStats" });
report.publicApis.roadmapVoteStats = {
  httpStatus: voteStats.status,
  responseOk: voteStats.ok,
  apiOk: voteStats.data?.ok === true,
  countsPresent: Boolean(voteStats.data?.counts),
  totalsPresent: Boolean(voteStats.data?.totals),
  error: voteStats.data?.error || null,
};

const xamanCheckIn = await postJson("/api/ott", {
  action: "xaman.createMakeWavesPayload",
  actionId: "daily-checkin",
});
report.payloadInitiation.dailyCheckIn = payloadSummary(xamanCheckIn);

const supportPayload = await postJson("/api/support-payment", {
  action: "xaman.createSupportPaymentPayload",
  amountXrp: "0.589",
  supporterName: "",
  publicMessage: "",
  publicConsent: false,
});
report.payloadInitiation.supportPayment0589 = payloadSummary(supportPayload);
report.payloadInitiation.supportPayment0589.amountXrp = supportPayload.data?.support?.amountXrp ?? null;
report.payloadInitiation.supportPayment0589.destinationWalletPresent = Boolean(supportPayload.data?.support?.destinationWallet);

const roadmapPayload = await postJson("/api/roadmap-vote", {
  action: "xaman.createRoadmapVotePayload",
  voteId: "academy-expansion",
});
report.payloadInitiation.roadmapVote = payloadSummary(roadmapPayload);
report.payloadInitiation.roadmapVote.amountDrops = roadmapPayload.data?.proof?.amountDrops ?? null;
report.payloadInitiation.roadmapVote.destinationWalletPresent = Boolean(roadmapPayload.data?.proof?.destinationWallet);
report.payloadInitiation.roadmapVote.voteId = roadmapPayload.data?.vote?.id ?? null;

fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
const lines = [
  "# OTT Preview Flow Probe",
  "",
  `Generated: ${report.generatedAt}`,
  `Preview: ${baseUrl}`,
  "",
  "## Authentication",
  "",
  `- Supabase browser configuration detected: ${report.authentication.configured ? "yes" : "no"}`,
  `- Visible OAuth providers: ${report.authentication.visibleProviders?.join(", ") || "none"}`,
  `- Email UI present: ${report.authentication.emailUiPresent ? "yes" : "no"}`,
  `- Password UI present: ${report.authentication.passwordUiPresent ? "yes" : "no"}`,
  `- Friendly invalid-credential handling: ${report.authentication.invalidCredentialProbe?.friendlyErrorShown ? "yes" : "not proven"}`,
  `- Google OAuth initiation: ${report.authentication.googleInitiation?.initiated ? "yes" : "not proven"}`,
  "",
  "## Public APIs and unsigned payload creation",
  "",
  `- Support totals API: ${report.publicApis.supportStats.apiOk ? "working" : "failed"}`,
  `- Roadmap totals API: ${report.publicApis.roadmapVoteStats.apiOk ? "working" : "failed"}`,
  `- Daily Check-In Xaman request: ${report.payloadInitiation.dailyCheckIn.apiOk && report.payloadInitiation.dailyCheckIn.signingUrlPresent ? "created" : "failed"}`,
  `- 0.589 XRP support Xaman request: ${report.payloadInitiation.supportPayment0589.apiOk && report.payloadInitiation.supportPayment0589.signingUrlPresent ? "created" : "failed"}`,
  `- Roadmap vote Xaman request: ${report.payloadInitiation.roadmapVote.apiOk && report.payloadInitiation.roadmapVote.signingUrlPresent ? "created" : "failed"}`,
  "",
  "## Limits",
  "",
  ...report.limits.map((item) => `- ${item}`),
  "",
];
fs.writeFileSync(path.join(outputDir, "report.md"), lines.join("\n"));
console.log(JSON.stringify(report, null, 2));
