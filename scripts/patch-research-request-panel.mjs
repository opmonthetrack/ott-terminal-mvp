import fs from "node:fs";

const file = "src/tabs/XrplVerifyTab.tsx";
let source = fs.readFileSync(file, "utf8");

const importAnchor = 'import { IssuerResearchAudit } from "../components/IssuerResearchAudit";';
if (!source.includes('from "../components/TokenResearchRequestPanel"')) {
  if (!source.includes(importAnchor)) throw new Error("Issuer audit import anchor not found.");
  source = source.replace(
    importAnchor,
    `${importAnchor}\nimport { TokenResearchRequestPanel } from "../components/TokenResearchRequestPanel";`,
  );
}

const renderAnchor = `      <IssuerResearchAudit />\n    </div>`;
if (!source.includes("<TokenResearchRequestPanel />")) {
  if (!source.includes(renderAnchor)) throw new Error("Issuer audit render anchor not found.");
  source = source.replace(
    renderAnchor,
    `      <IssuerResearchAudit />\n      <TokenResearchRequestPanel />\n    </div>`,
  );
}

fs.writeFileSync(file, source);

const panelFile = "src/components/TokenResearchRequestPanel.tsx";
let panelSource = fs.readFileSync(panelFile, "utf8");
panelSource = panelSource.replace("  CheckCircle2,\n", "");
fs.writeFileSync(panelFile, panelSource);

console.log("Token research request panel integrated and cleaned.");
