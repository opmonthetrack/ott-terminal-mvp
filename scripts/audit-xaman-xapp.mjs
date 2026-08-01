import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    fail(`required file is missing or empty: ${relativePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function fail(message) {
  console.error(`\nXaman xApp audit failed: ${message}\n`);
  process.exit(1);
}

const main = read("src/main.tsx");
const index = read("index.html");
const component = read("src/xapp/XamanXapp.tsx");
const runtime = read("src/lib/xamanXappRuntime.ts");
const styles = read("src/xapp/xaman-xapp.css");
const support = read("public/xapp-support.html");
const submission = read("XAMAN_XAPP_SUBMISSION.md");
const packageJson = JSON.parse(read("package.json"));

for (const fragment of [
  "isXamanXappLaunch",
  'lazy(() => import("./xapp/XamanXapp")',
  'lazy(() => import("./web/OttWebApplication")',
  "<XamanXapp />",
  "<OttWebApplication />",
]) {
  if (!main.includes(fragment)) fail(`root routing is missing '${fragment}'`);
}

for (const forbidden of ['from "./App.tsx"', 'from "./tabs/']) {
  if (main.includes(forbidden)) fail(`xApp bootstrap eagerly imports full web terminal code '${forbidden}'`);
}

for (const fragment of ["xAppToken", "xaman-xapp-boot", "background: transparent"]) {
  if (!index.includes(fragment)) fail(`transparent xApp boot is missing '${fragment}'`);
}

for (const fragment of [
  "Independent xApp by OnTheTrack · not operated by Xaman",
  "This xApp is read-only",
  'type XappView = "home" | "assets" | "activity" | "scan" | "safety" | "learn" | "research"',
  "loadXrplWalletWorkspace",
  "Learn before you sign",
  "Check a project on-ledger",
  "analyzeXrplToken",
  "Research this issuer",
  "not a project rating, endorsement or fraud determination",
  "Xaman picker",
  "Recent transactions",
  "Active account controls",
  "Five safety lessons",
  "info@onthetrack.com",
  "xapp-support.html",
  "privacy.html",
  "terms.html",
  "SOURCE_REPOSITORY",
]) {
  if (!component.includes(fragment)) fail(`xApp accountability copy is missing '${fragment}'`);
}

for (const fragment of ["openBrowser", "scanQr", "selectDestination", "tx", "share", "close", "ready", "sdk.user.account", "sdk.user.networkType"]) {
  if (!runtime.includes(fragment) && !component.includes(fragment)) {
    fail(`native Xaman integration is missing '${fragment}'`);
  }
}

for (const forbidden of ["window.open", "setInterval(", "localStorage", "sessionStorage", "AccessGateTab", "SupportDonationTab"]) {
  if (component.includes(forbidden) || runtime.includes(forbidden)) {
    fail(`xApp code contains forbidden or review-risky pattern '${forbidden}'`);
  }
}

if (!styles.includes("font-size: 16px") || !styles.includes("min-height: 48px")) {
  fail("xApp accessibility baseline for body text or touch controls is missing");
}

if (!runtime.includes("XAMAN_APPLICATION_ID") || !runtime.includes("49f37b53-0ef8-432f-87d8-d1b1d79fef8b")) {
  fail("xApp runtime must contain the registered public Xaman application identifier");
}

if (runtime.includes("XAMAN_API_SECRET") || runtime.includes("xapp-config")) {
  fail("xApp client must never reference the API secret or require an extra config function");
}

for (const fragment of ["Customer support", "Technical support", "Never send", "Privacy Policy", "Terms of Use"]) {
  if (!support.includes(fragment)) fail(`support page is missing '${fragment}'`);
}

for (const fragment of ["Initial review answers", "Qualification matrix", "Sandbox test record", "Final owner checklist"]) {
  if (!submission.includes(fragment)) fail(`review package is missing '${fragment}'`);
}

const xummVersion = packageJson.dependencies?.xumm ?? "";
if (!/^\^1\.[89]\.|^\^[2-9]\./.test(xummVersion)) {
  fail(`xumm dependency must be 1.8.0 or newer, found '${xummVersion}'`);
}

console.log("Xaman xApp audit passed: dedicated routing, native context, read-only boundary, accessibility, support and public source safeguards are present.");
