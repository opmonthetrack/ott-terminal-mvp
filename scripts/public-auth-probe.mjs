import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "https://ott-terminal-mvp.vercel.app";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/public-auth-probe");
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ott-account-welcome-choice-v1", "done");
  localStorage.setItem("ott-terminal-language-v2", "en");
});

const authResponses = [];
page.on("response", (response) => {
  if (/\/auth\/v1\/(token|signup|recover|authorize)/.test(response.url())) {
    authResponses.push({ url: response.url(), status: response.status() });
  }
});

await page.goto(`${baseUrl}/?tab=wallet`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const bodyBefore = await page.locator("body").innerText();
const email = page.locator('input[type="email"]').first();
const password = page.locator('input[type="password"]').first();
const emailPresent = await email.isVisible().catch(() => false);
const passwordPresent = await password.isVisible().catch(() => false);
const providers = [];
for (const label of ["Google", "Apple", "Microsoft", "GitHub"]) {
  if (await page.getByRole("button", { name: label, exact: true }).isVisible().catch(() => false)) providers.push(label);
}
const setupWarning = bodyBefore.includes("Add the Supabase browser keys in Vercel before login can be used.");
const configured = !setupWarning && emailPresent && passwordPresent;

let invalidCredentialProbe = null;
if (configured) {
  await email.fill(`ott-auth-probe-${Date.now()}@example.invalid`);
  await password.fill("ProbeOnly-NotARealPassword-589");
  const signInButtons = page.getByRole("button", { name: "Sign in", exact: true });
  const count = await signInButtons.count();
  const submit = signInButtons.nth(Math.max(0, count - 1));
  await submit.click();
  await page.waitForTimeout(2500);
  const bodyAfter = await page.locator("body").innerText();
  invalidCredentialProbe = {
    submitEnabled: !(await submit.isDisabled().catch(() => true)),
    friendlyErrorShown: bodyAfter.includes("The email address or password is incorrect."),
    rawProviderErrorLeaked: bodyAfter.toLowerCase().includes("invalid login credentials"),
    authResponses,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  configured,
  setupWarning,
  emailPresent,
  passwordPresent,
  visibleProviders: providers,
  invalidCredentialProbe,
  proofLevel: {
    emailPassword: invalidCredentialProbe?.friendlyErrorShown
      ? "Backend reachable and friendly rejection proven; successful login needs a controlled valid test account."
      : "Not proven.",
    google: providers.includes("Google")
      ? "Provider is enabled; prior probe reached accounts.google.com. Full callback needs a controlled Google test account."
      : "Not enabled.",
    apple: providers.includes("Apple") ? "Enabled but full callback not tested." : "Not enabled.",
    microsoft: providers.includes("Microsoft") ? "Enabled but full callback not tested." : "Not enabled.",
    github: providers.includes("GitHub") ? "Enabled but full callback not tested." : "Not enabled.",
  },
};

fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
await page.screenshot({ path: path.join(outputDir, "wallet-auth.png"), fullPage: true });
console.log(JSON.stringify(report, null, 2));
await context.close();
await browser.close();
