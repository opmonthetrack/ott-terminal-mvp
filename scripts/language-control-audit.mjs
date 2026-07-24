import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/language-control-audit");
fs.mkdirSync(outputDir, { recursive: true });

const routes = [
  "home", "dashboard", "wallet", "academy", "xamanactivation", "network",
  "intel", "news", "ottintelligence", "roadmap", "support", "xaman",
  "xrplverify", "source", "checkin", "rewardledger", "accessgate",
];
const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function technicalOrBrand(value) {
  if (!/[A-Za-z]/.test(value)) return true;
  return /^(EN|NL|Google|Apple|Microsoft|GitHub|Xaman|XRPL|XRP|RLUSD|NFT|OTT|AI|XP|Banxa|Mainnet|Testnet|SourceTag)$/i.test(value) ||
    /\b(Xaman|XRPL|XRP|RLUSD|NFT|OTT|AI|XP|Banxa|SourceTag|Mainnet|Testnet)\b/i.test(value) ||
    /^#?\d+(?:[.,–-]\d+)*\s*(?:XRP|XP|%)?$/i.test(value);
}

function obviousEnglish(value) {
  return /\b(create|sign in|sign out|continue|back|open|close|refresh|verify|connect|disconnect|learn|explore|view|start|clear|scan|vote|support|profile|account|loading|retry|copy|download|submit|send|save|reset|next|previous|finish|privacy policy|terms of use)\b/i.test(value);
}

async function waitForRoute(page) {
  await page.waitForFunction(() => {
    const main = document.querySelector("main");
    const text = (main?.textContent || "").replace(/\s+/g, " ").trim();
    return text.length > 100 && text !== "Loading…" && text !== "Laden…";
  }, { timeout: 12_000 }).catch(() => undefined);
  await page.waitForTimeout(200);
}

async function controls(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    return [...document.querySelectorAll('button, a[href]')]
      .filter(visible)
      .map((element, index) => ({
        index,
        tag: element.tagName.toLowerCase(),
        href: element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "",
        name: (element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim(),
      }))
      .filter((item) => item.name);
  });
}

const browser = await chromium.launch({ headless: true });
const results = [];
const blockers = [];

for (const profile of profiles) {
  const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch });
  await context.addInitScript(() => localStorage.setItem("ott-account-welcome-choice-v1", "done"));
  const page = await context.newPage();
  await page.route("**/api/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, fallback: true, items: [], debug: [], counts: {}, totals: {}, ranking: [], stats: { totalXrp: "0", paymentCount: 0, uniqueSupporters: 0 }, latestPublicSupporters: [] }) });
  });

  for (const routeName of routes) {
    const snapshots = {};
    for (const language of ["en", "nl"]) {
      await page.addInitScript((value) => {
        localStorage.setItem("ott-terminal-language-v2", value);
        localStorage.setItem("ott-account-welcome-choice-v1", "done");
      }, language);
      const url = routeName === "home" ? baseUrl : `${baseUrl}/?tab=${routeName}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await waitForRoute(page);
      snapshots[language] = await controls(page);
    }

    const en = snapshots.en;
    const nl = snapshots.nl;
    const unchanged = [];
    const maximum = Math.min(en.length, nl.length);
    for (let index = 0; index < maximum; index += 1) {
      const enName = normalize(en[index].name);
      const nlName = normalize(nl[index].name);
      if (enName === nlName && !technicalOrBrand(enName)) {
        const item = { index, name: enName, en: en[index], nl: nl[index], obviousEnglish: obviousEnglish(enName) };
        unchanged.push(item);
        if (item.obviousEnglish) blockers.push({ profile: profile.name, route: routeName, ...item });
      }
    }
    if (en.length !== nl.length) {
      blockers.push({ profile: profile.name, route: routeName, type: "count-mismatch", englishCount: en.length, dutchCount: nl.length });
    }
    results.push({ profile: profile.name, route: routeName, englishCount: en.length, dutchCount: nl.length, unchanged });
  }
  await context.close();
}

await browser.close();
const report = { generatedAt: new Date().toISOString(), baseUrl, routeChecks: results.length, blockers, results };
fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputDir, "report.md"), [
  "# EN/NL Control Parity Audit", "",
  `Generated: ${report.generatedAt}`,
  `Route/profile checks: ${report.routeChecks}`,
  `Blocking untranslated controls or count mismatches: ${blockers.length}`, "",
  ...blockers.map((item, index) => `${index + 1}. ${item.profile} / ${item.route}: ${item.type === "count-mismatch" ? `control count ${item.englishCount} EN vs ${item.dutchCount} NL` : `unchanged English control “${item.name}”`}`),
  "",
].join("\n"));
console.log(JSON.stringify({ routeChecks: results.length, blockers: blockers.length }, null, 2));
if (blockers.length > 0) process.exitCode = 1;
