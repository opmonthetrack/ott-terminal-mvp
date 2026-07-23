import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appPath = path.join(root, "src", "App.tsx");
const app = fs.readFileSync(appPath, "utf8");

const expectedPublicTabs = [
  "home",
  "dashboard",
  "wallet",
  "academy",
  "xamanactivation",
  "network",
  "intel",
  "news",
  "ottintelligence",
  "roadmap",
  "support",
  "xaman",
  "xrplverify",
  "source",
  "checkin",
  "rewardledger",
  "accessgate",
];

function fail(message) {
  console.error(`\nSite route audit failed: ${message}\n`);
  process.exit(1);
}

const coreStart = app.indexOf("function getCoreMenuGroups");
const founderStart = app.indexOf("function getFounderMenuGroups");
if (coreStart < 0 || founderStart < 0 || founderStart <= coreStart) {
  fail("could not locate the public and founder menu registries in src/App.tsx");
}

const coreMenuSource = app.slice(coreStart, founderStart);
const publicIds = [...coreMenuSource.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]);
const duplicates = publicIds.filter((id, index) => publicIds.indexOf(id) !== index);

if (duplicates.length) {
  fail(`duplicate public menu ids: ${[...new Set(duplicates)].join(", ")}`);
}

if (publicIds.length !== expectedPublicTabs.length) {
  fail(`expected ${expectedPublicTabs.length} public menu items but found ${publicIds.length}: ${publicIds.join(", ")}`);
}

for (const id of expectedPublicTabs) {
  if (!publicIds.includes(id)) {
    fail(`public menu item '${id}' is missing`);
  }
  if (!app.includes(`activeTab === "${id}"`)) {
    fail(`public menu item '${id}' has no render route`);
  }
}

for (const id of publicIds) {
  if (!expectedPublicTabs.includes(id)) {
    fail(`unexpected public menu item '${id}' is not documented in the 17-item public route contract`);
  }
}

const requiredReturnRouting = [
  'params.get("support_payment_return") === "1"',
  'params.get("access_payment_return") === "1"',
  'params.get("access_accept_return") === "1"',
  'params.get("tab")',
];
for (const fragment of requiredReturnRouting) {
  if (!app.includes(fragment)) {
    fail(`missing URL/return routing fragment: ${fragment}`);
  }
}

const requiredPublicFiles = [
  "public/privacy.html",
  "public/terms.html",
  "public/robots.txt",
  "public/sitemap.xml",
];
for (const relativePath of requiredPublicFiles) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    fail(`required public file is missing or empty: ${relativePath}`);
  }
}

const support = fs.readFileSync(path.join(root, "src", "tabs", "SupportDonationTab.tsx"), "utf8");
for (const amount of ["0.589", "1.589", "2.589"]) {
  if (!support.includes(`"${amount}"`)) {
    fail(`support amount ${amount} XRP is missing from the in-app support page`);
  }
}

console.log(`Site route audit passed: ${publicIds.length} public menu items, return routing, legal files and XRP support amounts are complete.`);
