import fs from "node:fs/promises";
import path from "node:path";

const publicTabs = [
  "TerminalHomeTab.tsx",
  "DashboardTab.tsx",
  "NetworkState.tsx",
  "WalletTab.tsx",
  "LedgerIntelTab.tsx",
  "OTTIntelligence.tsx",
  "NewsTab.tsx",
  "SourceTagMonitorTab.tsx",
  "RoadmapTab.tsx",
  "XamanActivationTab.tsx",
  "XamanCenterTab.tsx",
  "XrplVerifyTab.tsx",
  "DailyCheckInTab.tsx",
  "RewardLedgerTab.tsx",
  "AcademyTab.tsx",
  "AccessGateTab.tsx",
  "SupportDonationTab.tsx",
];

const dutchPattern = /\b(geen|kies|jouw|jij|wordt|worden|leren|veilig|gekoppeld|verificatie|overzicht|profiel|voortgang|opdracht|afronden|gebruiker|gebruikers|betaal|betaling|transactie|bron|nieuws|dagelijkse|stemmen|donatie|ondersteuning|beschikbaar|volgende|terug|openen|sluiten|laden|mislukt|geslaagd|afgerond|bewaar|opslaan|controleer|controleert|ontgrendel|toegang|wallet|alleen|later|vandaag|gisteren|deze|moet|kunnen|heeft|hebt|voor|met|van|het|een)\b/i;
const root = path.resolve("src/tabs");
const report = [];

for (const fileName of publicTabs) {
  const filePath = path.join(root, fileName);
  let content = "";

  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    report.push({ fileName, missing: true });
    continue;
  }

  const lines = content.split("\n");
  const dutchSamples = lines
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((item) => dutchPattern.test(item.text))
    .slice(0, 20);

  report.push({
    fileName,
    missing: false,
    usesLanguageHook: content.includes("useTerminalLanguage"),
    hasEnglishConditional:
      content.includes("isEnglish") ||
      content.includes('language === "en"') ||
      content.includes("language === 'en'"),
    dutchSampleCount: dutchSamples.length,
    dutchSamples,
  });
}

await fs.mkdir("artifacts/language-audit", { recursive: true });
await fs.writeFile(
  "artifacts/language-audit/report.json",
  JSON.stringify(report, null, 2),
);

const markdown = [
  "# Public Tab Language Consistency Audit",
  "",
  "| File | Language hook | Conditional copy | Dutch samples |",
  "|---|---:|---:|---:|",
  ...report.map((item) =>
    `| ${item.fileName} | ${item.usesLanguageHook ? "yes" : "NO"} | ${item.hasEnglishConditional ? "yes" : "NO"} | ${item.dutchSampleCount ?? 0} |`,
  ),
  "",
  ...report.flatMap((item) => [
    `## ${item.fileName}`,
    item.missing
      ? "- File missing"
      : `- Hook: ${item.usesLanguageHook ? "yes" : "no"}\n- Conditional copy: ${item.hasEnglishConditional ? "yes" : "no"}`,
    ...(item.dutchSamples ?? []).map((sample) =>
      `- L${sample.line}: \`${sample.text.replaceAll("`", "'")}\``,
    ),
    "",
  ]),
].join("\n");

await fs.writeFile("artifacts/language-audit/report.md", markdown);
console.log(markdown);
