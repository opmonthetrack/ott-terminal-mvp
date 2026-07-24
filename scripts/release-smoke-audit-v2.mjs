import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/release-smoke-audit");
fs.mkdirSync(outputDir, { recursive: true });

const routes = [
  "home", "dashboard", "wallet", "academy", "xamanactivation", "network",
  "intel", "news", "ottintelligence", "roadmap", "support", "xaman",
  "xrplverify", "source", "checkin", "rewardledger", "accessgate",
];
const languages = ["en", "nl"];
const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
const forbiddenDutchCopy = [
  "Privacy Policy", "Terms of Use", "DAILY INTELLIGENCE SNAPSHOT",
  "OTT COMMAND DASHBOARD", "XAMAN PAYMENT", "Verify Access",
];

const findings = [];
const results = [];
const screenshots = new Set();

function addFinding(severity, category, message, context = {}, evidence = undefined) {
  findings.push({ severity, category, message, ...context, ...(evidence ? { evidence } : {}) });
}
function safeName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}
function scopeKey(scope) {
  return [scope.profile, scope.language, scope.route].filter(Boolean).join("-");
}
async function waitForRoute(page) {
  await page.waitForFunction(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const text = (main.textContent || "").replace(/\s+/g, " ").trim();
    return text.length > 100 && text !== "Loading…" && text !== "Laden…";
  }, { timeout: 12_000 }).catch(() => undefined);
  await page.waitForTimeout(200);
}

const browser = await chromium.launch({ headless: true });

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    locale: "en-US",
    reducedMotion: "reduce",
  });

  await context.addInitScript(() => {
    localStorage.setItem("ott-account-welcome-choice-v1", "done");
    localStorage.removeItem("ott-wallet-address-v1");
  });

  const page = await context.newPage();

  if (baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")) {
    await page.route("**/api/**", async (route) => {
      const response = {
        ok: true,
        fallback: true,
        items: [],
        debug: [],
        counts: {},
        totals: {},
        stats: { totalXrp: "0", paymentCount: 0, uniqueSupporters: 0 },
        latestPublicSupporters: [],
        ranking: [],
      };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) });
    });
  }

  // Dialog naming, focus and Escape.
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("ott-account-welcome-choice-v1"));
  await page.reload({ waitUntil: "domcontentloaded" });
  const welcome = page.locator('[role="dialog"]').first();
  if (await welcome.isVisible().catch(() => false)) {
    if (!(await welcome.getAttribute("aria-label")) && !(await welcome.getAttribute("aria-labelledby"))) {
      addFinding("high", "dialog", "Welcome dialog has no accessible name.", { profile: profile.name });
    }
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))) {
      addFinding("high", "dialog", "Focus is not inside the welcome dialog.", { profile: profile.name });
    }
    await page.keyboard.press("Escape");
    if (await welcome.isVisible().catch(() => false)) {
      addFinding("high", "dialog", "Welcome dialog does not close with Escape.", { profile: profile.name });
    }
  }

  const toolsButton = page.getByRole("button", { name: /open all tools|open alle tools/i });
  if (!(await toolsButton.isVisible().catch(() => false))) {
    addFinding("critical", "navigation", "All-tools button is not visible.", { profile: profile.name });
  } else {
    await toolsButton.click();
    const tools = page.locator('[role="dialog"]').first();
    if (!(await tools.getAttribute("aria-label")) && !(await tools.getAttribute("aria-labelledby"))) {
      addFinding("high", "dialog", "All-tools dialog has no accessible name.", { profile: profile.name });
    }
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))) {
      addFinding("high", "dialog", "Focus is not inside the all-tools dialog.", { profile: profile.name });
    }
    await page.keyboard.press("Escape");
    if (await tools.isVisible().catch(() => false)) {
      addFinding("high", "dialog", "All-tools dialog does not close with Escape.", { profile: profile.name });
    }
  }

  if (profile.name === "mobile") {
    const enVisible = await page.getByRole("button", { name: "EN", exact: true }).isVisible().catch(() => false);
    const nlVisible = await page.getByRole("button", { name: "NL", exact: true }).isVisible().catch(() => false);
    if (!enVisible || !nlVisible) addFinding("high", "language", "EN/NL controls are not directly visible on mobile.", { profile: profile.name });
  }

  for (const language of languages) {
    await page.addInitScript((nextLanguage) => {
      localStorage.setItem("ott-terminal-language-v2", nextLanguage);
      localStorage.setItem("ott-account-welcome-choice-v1", "done");
    }, language);

    for (const routeName of routes) {
      const scope = { profile: profile.name, language, route: routeName };
      const url = routeName === "home" ? baseUrl : `${baseUrl}/?tab=${routeName}`;
      const pageErrors = [];
      const consoleErrors = [];
      const onPageError = (error) => pageErrors.push(String(error?.message || error));
      const onConsole = (message) => message.type() === "error" && consoleErrors.push(message.text());
      page.on("pageerror", onPageError);
      page.on("console", onConsole);

      await page.goto(url, { waitUntil: "domcontentloaded" });
      await waitForRoute(page);

      const dom = await page.evaluate(({ language, forbiddenDutchCopy }) => {
        const visible = (element) => {
          if (!element) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const controls = [...document.querySelectorAll("input, textarea, select")].filter(visible);
        const buttons = [...document.querySelectorAll('button, [role="button"]')].filter(visible);
        const unlabeledControls = controls.filter((control) => {
          const id = control.id;
          return !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby") &&
            !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) && !control.closest("label");
        });
        const smallButtons = buttons.filter((button) => {
          const rect = button.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        });
        const ids = [...document.querySelectorAll("[id]")].map((node) => node.id).filter(Boolean);
        const bodyText = document.body.innerText;
        return {
          htmlLang: document.documentElement.lang,
          mainCount: document.querySelectorAll("main").length,
          h1Count: document.querySelectorAll("main h1").length,
          unlabeledControls: unlabeledControls.length,
          unnamedButtons: buttons.filter((button) => !(button.getAttribute("aria-label") || button.getAttribute("title") || button.textContent?.trim())).length,
          smallButtons: smallButtons.length,
          duplicateIds: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          untranslated: language === "nl" ? forbiddenDutchCopy.filter((text) => bodyText.includes(text)) : [],
          mainVisible: visible(document.querySelector("main")),
          textLength: (document.querySelector("main")?.textContent || "").trim().length,
        };
      }, { language, forbiddenDutchCopy });

      const axeResult = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violations = axeResult.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      }));

      if (!dom.mainVisible) addFinding("critical", "render", "Main content is not visible.", scope);
      if (dom.mainCount !== 1) addFinding("high", "semantics", `Expected one main landmark, found ${dom.mainCount}.`, scope);
      if (dom.h1Count !== 1) addFinding("high", "semantics", `Expected one h1 in main, found ${dom.h1Count}.`, scope);
      if (dom.htmlLang !== language) addFinding("high", "language", `HTML lang is ${dom.htmlLang}, expected ${language}.`, scope);
      if (dom.unlabeledControls) addFinding("high", "forms", `${dom.unlabeledControls} visible form controls have no accessible label.`, scope);
      if (dom.unnamedButtons) addFinding("high", "buttons", `${dom.unnamedButtons} visible buttons have no accessible name.`, scope);
      if (dom.smallButtons) addFinding("high", "touch-target", `${dom.smallButtons} visible targets are smaller than 44×44px.`, scope);
      if (dom.duplicateIds.length) addFinding("high", "html", `Duplicate IDs: ${dom.duplicateIds.join(", ")}.`, scope);
      if (dom.overflow > 2) addFinding("high", "responsive", `Horizontal overflow: ${dom.overflow}px.`, scope);
      if (dom.untranslated.length) addFinding("high", "translation", `Dutch page still contains: ${dom.untranslated.join(", ")}.`, scope);
      if (pageErrors.length) addFinding("critical", "runtime", `Page errors: ${pageErrors.join(" | ")}`, scope);
      if (consoleErrors.length) addFinding("high", "runtime", `Console errors: ${consoleErrors.join(" | ")}`, scope);
      for (const violation of violations) {
        addFinding(violation.impact === "critical" ? "critical" : "high", "wcag", `${violation.id}: ${violation.nodes.length} node(s).`, scope, violation.nodes);
      }

      results.push({ ...scope, url: page.url(), title: await page.title(), dom, violations, pageErrors, consoleErrors });
      const hasBlocking = findings.some((item) => item.profile === profile.name && item.language === language && item.route === routeName);
      if (hasBlocking) {
        const screenshotKey = `${profile.name}-${routeName}`;
        if (!screenshots.has(screenshotKey)) {
          screenshots.add(screenshotKey);
          await page.screenshot({ path: path.join(outputDir, `${safeName(screenshotKey)}.png`), fullPage: true });
        }
      }

      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    }
  }

  await page.goto(`${baseUrl}/?tab=support`, { waitUntil: "domcontentloaded" });
  await waitForRoute(page);
  for (const amount of ["0.589", "1.589", "2.589"]) {
    const button = page.getByRole("button", { name: `${amount} XRP`, exact: true });
    await button.waitFor({ state: "visible", timeout: 10_000 }).catch(() => undefined);
    if (!(await button.isVisible().catch(() => false))) {
      addFinding("high", "support", `Support amount ${amount} XRP is not exposed as a named button.`, { profile: profile.name });
      continue;
    }
    await button.click();
    if ((await button.getAttribute("aria-pressed")) !== "true") {
      addFinding("high", "support", `Support amount ${amount} XRP does not expose aria-pressed=true.`, { profile: profile.name });
    }
  }

  await context.close();
}

await browser.close();

const unique = [];
const seen = new Set();
for (const item of findings) {
  const key = JSON.stringify(item);
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(item);
  }
}
const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routeChecks: results.length,
  findings: unique.length,
  blocking: unique.length,
};
fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify({ summary, findings: unique, results }, null, 2));
fs.writeFileSync(path.join(outputDir, "report.md"), [
  "# OTT Release Smoke Audit", "",
  `Generated: ${summary.generatedAt}`,
  `Base URL: ${baseUrl}`,
  `Route checks: ${summary.routeChecks}`,
  `Blocking findings: ${summary.blocking}`, "",
  ...unique.map((item, index) => `${index + 1}. **${item.severity.toUpperCase()} — ${item.category}** — ${item.message} (${scopeKey(item)})`),
  "",
].join("\n"));
console.log(JSON.stringify(summary, null, 2));
if (summary.blocking > 0) process.exitCode = 1;
