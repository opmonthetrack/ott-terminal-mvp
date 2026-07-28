import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appPath = path.join(root, "src", "App.tsx");
const mainPath = path.join(root, "src", "main.tsx");
const app = fs.readFileSync(appPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");

const expectedPublicHubs = [
  "home",
  "academy",
  "intel",
  "network",
  "wallet",
  "dashboard",
  "accessgate",
  "roadmap",
  "support",
];

const expectedNonFounderRoutes = [
  "home",
  "dashboard",
  "checkin",
  "source",
  "roadmap",
  "xaman",
  "xamanactivation",
  "xrplverify",
  "network",
  "wallet",
  "ecosystem",
  "validator",
  "developer",
  "tokenization",
  "rewardledger",
  "accessgate",
  "ottintelligence",
  "news",
  "defi",
  "academy",
  "support",
  "intel",
];

const founderOnlyRoutes = [
  "pitchmode",
  "submission",
  "smoketest",
  "launch",
  "truthdesk",
  "marketplace",
  "otttestnet",
  "portfolio",
  "partners",
  "factory",
  "profile",
  "token",
  "rewardpolicy",
  "ai",
];

function fail(message) {
  console.error(`\nSite route audit failed: ${message}\n`);
  process.exit(1);
}

function unique(values) {
  return [...new Set(values)];
}

function extractQuotedRouteIds(source) {
  return [...source.matchAll(/"([a-z][a-z0-9-]*)"/g)]
    .map((match) => match[1])
    .filter((value) => expectedNonFounderRoutes.includes(value) || founderOnlyRoutes.includes(value));
}

const coreStart = app.indexOf("function getCoreMenuGroups");
const founderStart = app.indexOf("function getFounderMenuGroups");
const initialRouteStart = app.indexOf("function getInitialActiveTab");
if (coreStart < 0 || founderStart < 0 || initialRouteStart < 0 || founderStart <= coreStart || initialRouteStart <= founderStart) {
  fail("could not locate the public and founder menu registries in src/App.tsx");
}

const coreMenuSource = app.slice(coreStart, founderStart);
const founderMenuSource = app.slice(founderStart, initialRouteStart);
const publicHubIds = unique(extractQuotedRouteIds(coreMenuSource));
const founderMenuIds = unique(extractQuotedRouteIds(founderMenuSource));

if (publicHubIds.length !== expectedPublicHubs.length) {
  fail(`expected ${expectedPublicHubs.length} public hubs but found ${publicHubIds.length}: ${publicHubIds.join(", ")}`);
}

for (const id of expectedPublicHubs) {
  if (!publicHubIds.includes(id)) {
    fail(`public hub '${id}' is missing`);
  }
}

for (const id of publicHubIds) {
  if (!expectedPublicHubs.includes(id)) {
    fail(`unexpected public hub '${id}' is not part of the nine-hub contract`);
  }
  if (founderOnlyRoutes.includes(id)) {
    fail(`founder route '${id}' leaked into the public hub menu`);
  }
}

for (const id of expectedNonFounderRoutes) {
  if (!app.includes(`activeTab === "${id}"`)) {
    fail(`non-founder route '${id}' has no render route`);
  }
}

for (const id of founderOnlyRoutes) {
  if (!founderMenuIds.includes(id)) {
    fail(`founder route '${id}' is missing from the private founder menu`);
  }
  if (!app.includes(`activeTab === "${id}"`)) {
    fail(`founder route '${id}' has no render route`);
  }
  const founderCatalogPattern = new RegExp(`id:\\s*"${id}"[\\s\\S]{0,260}?audience:\\s*"founder"`);
  if (!founderCatalogPattern.test(app)) {
    fail(`founder route '${id}' is not classified as founder-only`);
  }
}

const requiredRolePolicyFragments = [
  'type RouteAudience = "public" | "account" | "premium" | "founder"',
  "hasFounderAccess(user)",
  "loadPremiumAccessStatus",
  "getRouteLockReason",
  'app_metadata.ott_role',
];
for (const fragment of requiredRolePolicyFragments) {
  if (!app.includes(fragment) && !main.includes(fragment)) {
    fail(`missing role/access policy fragment: ${fragment}`);
  }
}

const requiredFounderGuardFragments = [
  "FOUNDER_QUERY_KEYS",
  "FOUNDER_TAB_IDS",
  "founderRequest.requested && !founderAuthorized",
  "sanitizeFounderUrl",
  "hasFounderAccess(user)",
];
for (const fragment of requiredFounderGuardFragments) {
  if (!main.includes(fragment)) {
    fail(`missing founder guard fragment in src/main.tsx: ${fragment}`);
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

console.log(
  `Site route audit passed: ${expectedPublicHubs.length} public hubs, ${expectedNonFounderRoutes.length} non-founder routes, ${founderOnlyRoutes.length} protected founder routes, return routing, legal files and XRP support amounts are complete.`,
);
