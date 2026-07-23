import fs from "node:fs";

const apiFile = "api/access-payment.ts";
let apiSource = fs.readFileSync(apiFile, "utf8");

const premiumImport = 'import premiumAccessHandler from "../src/server/premiumAccessService";';
if (!apiSource.includes('from "../src/server/researchReviewService"')) {
  if (!apiSource.includes(premiumImport)) throw new Error("Premium service import anchor not found.");
  apiSource = apiSource.replace(
    premiumImport,
    `${premiumImport}\nimport researchReviewHandler from "../src/server/researchReviewService";`,
  );
}

const premiumScopes = 'const PREMIUM_SCOPES = new Set(["grant-status", "wallet-link", "grants"]);';
if (!apiSource.includes("RESEARCH_SCOPES")) {
  if (!apiSource.includes(premiumScopes)) throw new Error("Premium scopes anchor not found.");
  apiSource = apiSource.replace(
    premiumScopes,
    `${premiumScopes}\nconst RESEARCH_SCOPES = new Set(["research-review", "watchlist"]);`,
  );
}

apiSource = apiSource.replace(
  'return !["status", "metadata", "image", "readiness", ...PREMIUM_SCOPES].includes(scope);',
  'return !["status", "metadata", "image", "readiness", ...PREMIUM_SCOPES, ...RESEARCH_SCOPES].includes(scope);',
);

const premiumRoute = `  if (PREMIUM_SCOPES.has(scope)) {\n    return premiumAccessHandler(req, res);\n  }`;
if (!apiSource.includes("RESEARCH_SCOPES.has(scope)")) {
  if (!apiSource.includes(premiumRoute)) throw new Error("Premium route anchor not found.");
  apiSource = apiSource.replace(
    premiumRoute,
    `  if (RESEARCH_SCOPES.has(scope)) {\n    return researchReviewHandler(req, res);\n  }\n\n${premiumRoute}`,
  );
}

fs.writeFileSync(apiFile, apiSource);

const mainFile = "src/main.tsx";
let mainSource = fs.readFileSync(mainFile, "utf8");
const managerImport = 'import { FounderAccessManager } from "./tabs/FounderAccessManager";';
if (!mainSource.includes('from "./tabs/FounderResearchReview"')) {
  if (!mainSource.includes(managerImport)) throw new Error("Founder access manager import anchor not found.");
  mainSource = mainSource.replace(
    managerImport,
    `${managerImport}\nimport { FounderResearchReview } from "./tabs/FounderResearchReview";`,
  );
}

const managerFlag = 'const showAccessManager = founderMode && params.get("accessmanager") === "1";';
if (!mainSource.includes("showResearchReview")) {
  if (!mainSource.includes(managerFlag)) throw new Error("Founder manager flag anchor not found.");
  mainSource = mainSource.replace(
    managerFlag,
    `${managerFlag}\nconst showResearchReview = founderMode && params.get("research") === "1";`,
  );
}

const routeAnchor = `      {showAccessManager ? (\n        <FounderAccessManager />`;
if (!mainSource.includes("<FounderResearchReview />")) {
  if (!mainSource.includes(routeAnchor)) throw new Error("Founder manager render anchor not found.");
  mainSource = mainSource.replace(
    routeAnchor,
    `      {showResearchReview ? (\n        <FounderResearchReview />\n      ) : showAccessManager ? (\n        <FounderAccessManager />`,
  );
}

fs.writeFileSync(mainFile, mainSource);

const verifyFile = "src/tabs/XrplVerifyTab.tsx";
let verifySource = fs.readFileSync(verifyFile, "utf8");
const requestImport = 'import { TokenResearchRequestPanel } from "../components/TokenResearchRequestPanel";';
if (!verifySource.includes('from "../components/PublicResearchWatchlist"')) {
  if (!verifySource.includes(requestImport)) throw new Error("Token request panel import anchor not found.");
  verifySource = verifySource.replace(
    requestImport,
    `${requestImport}\nimport { PublicResearchWatchlist } from "../components/PublicResearchWatchlist";`,
  );
}

const renderAnchor = `      <IssuerResearchAudit />\n      <TokenResearchRequestPanel />`;
if (!verifySource.includes("<PublicResearchWatchlist />")) {
  if (!verifySource.includes(renderAnchor)) throw new Error("Research panels render anchor not found.");
  verifySource = verifySource.replace(
    renderAnchor,
    `      <IssuerResearchAudit />\n      <PublicResearchWatchlist />\n      <TokenResearchRequestPanel />`,
  );
}

fs.writeFileSync(verifyFile, verifySource);
console.log("Founder research review and public watchlist integrated.");
