import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/release-smoke-audit");
fs.mkdirSync(outputDir, { recursive: true });

const routes = [
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

const languages = ["en", "nl"];
const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const forbiddenDutchCopy = [
  "Privacy Policy",
  "Terms of Use",
  "DAILY INTELLIGENCE SNAPSHOT",
  "OTT COMMAND DASHBOARD",
  "XAMAN PAYMENT",
  "Verify Access",
];

const findings = [];
const results = [];

function finding(severity, category, message, context = {}) {
  findings.push({ severity, category, message, ...context });
}

function safeName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function isBlocking(item) {
  return item.severity === "critical" || item.severity === "high";
}

const browser = await chromium.launch({ headless: true });

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    reducedMotion: "reduce",
    locale: "en-US",
  });

  await context.addInitScript(() => {
    localStorage.setItem("ott-account-welcome-choice-v1", "done");
    localStorage.removeItem("ott-wallet-address-v1");
  });

  const page = await context.newPage();

  // Keep the local preview deterministic without pretending serverless APIs are E2E-tested.
  if (baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")) {
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const action = url.searchParams.get("action") || "";
      const response = action.includes("stats") || action.includes("status")
        ? { ok: true, counts: {}, totals: {}, items: [], debug: [], fallback: true }
        : { ok: false, error: "Local smoke-test API stub" };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  // Dialog and keyboard checks.
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("ott-account-welcome-choice-v1"));
  await page.reload({ waitUntil: "domcontentloaded" });

  const welcome = page.locator('[role="dialog"]').first();
  if (await welcome.isVisible().catch(() => false)) {
    const labelled = await welcome.getAttribute("aria-labelledby");
    const label = await welcome.getAttribute("aria-label");
    if (!labelled && !label) finding("high", "dialog", "Welcome dialog has no accessible name.", { profile: profile.name });
    const activeInside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
    if (!activeInside) finding("high", "dialog", "Focus is not moved into the welcome dialog.", { profile: profile.name });
    await page.keyboard.press("Escape");
    if (await welcome.isVisible().catch(() => false)) finding("high", "dialog", "Welcome dialog does not close with Escape.", { profile: profile.name });
  }

  const toolsButton = page.getByRole("button", { name: /open all tools|open alle tools/i });
  if (!(await toolsButton.isVisible().catch(() => false))) {
    finding("critical", "navigation", "All-tools button is not visible.", { profile: profile.name });
  } else {
    await toolsButton.click();
    const tools = page.locator('[role="dialog"]').first();
    const labelled = await tools.getAttribute("aria-labelledby");
    const label = await tools.getAttribute("aria-label");
    if (!labelled && !label) finding("high", "dialog", "All-tools dialog has no accessible name.", { profile: profile.name });
    const activeInside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
    if (!activeInside) finding("high", "dialog", "Focus is not moved into the all-tools dialog.", { profile: profile.name });
    await page.keyboard.press("Escape");
    if (await tools.isVisible().catch(() => false)) finding("high", "dialog", "All-tools dialog does not close with Escape.", { profile: profile.name });
  }

  if (profile.name === "mobile") {
    const enVisible = await page.getByRole("button", { name: "EN", exact: true }).isVisible().catch(() => false);
    const nlVisible = await page.getByRole("button", { name: "NL", exact: true }).isVisible().catch(() => false);
    if (!enVisible || !nlVisible) finding("high", "language", "EN/NL controls are not directly visible on mobile.", { profile: profile.name });
  }

  for (const language of languages) {
    for (const routeName of routes) {
      const url = routeName === "home" ? baseUrl : `${baseUrl}/?tab=${routeName}`;
      const pageErrors = [];
      const consoleErrors = [];
      const onPageError = (error) => pageErrors.push(String(error?.message || error));
      const onConsole = (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      };
      page.on("pageerror", onPageError);
      page.on("console", onConsole);

      await page.addInitScript((nextLanguage) => {
        localStorage.setItem("ott-terminal-language-v2", nextLanguage);
        localStorage.setItem("ott-account-welcome-choice-v1", "done");
      }, language);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);

      const dom = await page.evaluate(({ language, forbiddenDutchCopy }) => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const controls = [...document.querySelectorAll("input, textarea, select")].filter(visible);
        const unlabeledControls = controls.filter((control) => {
          const id = control.id;
          return !control.getAttribute("aria-label") &&
            !control.getAttribute("aria-labelledby") &&
            !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) &&
            !control.closest("label");
        });
        const buttons = [...document.querySelectorAll('button, [role="button"]')].filter(visible);
        const smallButtons = buttons.filter((button) => {
          const rect = button.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        });
        const ids = [...document.querySelectorAll("[id]")].map((node) => node.id).filter(Boolean);
        const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        const bodyText = document.body.innerText;
        return {
          htmlLang: document.documentElement.lang,
          mainCount: document.querySelectorAll("main").length,
          h1Count: document.querySelectorAll("h1").length,
          unlabeledControls: unlabeledControls.length,
          unnamedButtons: buttons.filter((button) => !(button.getAttribute("aria-label") || button.textContent?.trim() || button.getAttribute("title"))).length,
          smallButtons: smallButtons.length,
          duplicateIds,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          untranslated: language === "nl" ? forbiddenDutchCopy.filter((text) => bodyText.includes(text)) : [],
          mainVisible: Boolean(document.querySelector("main") && visible(document.querySelector("main"))),
        };
      }, { language, forbiddenDutchCopy });

      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const violations = axe.violations.map((item) => ({
        id: item.id,
        impact: item.impact,
        nodes: item.nodes.length,
        description: item.description,
      }));

      const scope = { profile: profile.name, language, route: routeName };
      if (!dom.mainVisible) finding("critical", "render", "Main content is not visible.", scope);
      if (dom.mainCount !== 1) finding("high", "semantics", `Expected one main landmark, found ${dom.mainCount}.`, scope);
      if (dom.h1Count !== 1) finding("high", "semantics", `Expected one h1, found ${dom.h1Count}.`, scope);
      if (dom.htmlLang !== language) finding("high", "language", `HTML lang is ${dom.htmlLang}, expected ${language}.`, scope);
      if (dom.unlabeledControls) finding("high", "forms", `${dom.unlabeledControls} visible form controls have no accessible label.`, scope);
      if (dom.unnamedButtons) finding("high", "buttons", `${dom.unnamedButtons} visible buttons have no accessible name.`, scope);
      if (dom.smallButtons) finding("high", "touch-target", `${dom.smallButtons} visible interaction targets are smaller than 44×44px.`, scope);
      if (dom.duplicateIds.length) finding("high", "html", `Duplicate IDs: ${dom.duplicateIds.join(", ")}.`, scope);
      if (dom.overflow > 2) finding("high", "responsive", `Horizontal overflow: ${dom.overflow}px.`, scope);
      if (dom.untranslated.length) finding("high", "translation", `Dutch page still contains: ${dom.untranslated.join(", ")}.`, scope);
      if (pageErrors.length) finding("critical", "runtime", `Page errors: ${pageErrors.join(" | ")}`, scope);
      if (consoleErrors.length) finding("high", "runtime", `Console errors: ${consoleErrors.join(" | ")}`, scope);
      for (const violation of violations) {
        finding(violation.impact === "critical" ? "critical" : "high", "wcag", `${violation.id}: ${violation.nodes} node(s).`, scope);
      }

      results.push({ ...scope, url: page.url(), title: await page.title(), dom, violations, pageErrors, consoleErrors });

      if (findings.some((item) => item.profile === profile.name && item.language === language && item.route === routeName && isBlocking(item))) {
        await page.screenshot({
          path: path.join(outputDir, `${safeName(profile.name)}-${language}-${safeName(routeName)}.png`),
          fullPage: true,
        });
      }

      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    }
  }

  // Support amount selection must expose state to assistive technology.
  await page.goto(`${baseUrl}/?tab=support`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("ott-terminal-language-v2", "en"));
  await page.reload({ waitUntil: "domcontentloaded" });
  for (const amount of ["0.589", "1.589", "2.589"]) {
    const button = page.getByRole("button", { name: `${amount} XRP`, exact: true });
    if (!(await button.isVisible().catch(() => false))) {
      finding("high", "support", `Support amount ${amount} XRP is not exposed as a named button.`, { profile: profile.name });
      continue;
    }
    await button.click();
    if ((await button.getAttribute("aria-pressed")) !== "true") {
      finding("high", "support", `Support amount ${amount} XRP does not expose aria-pressed=true after selection.`, { profile: profile.name });
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
  blocking: unique.filter(isBlocking).length,
};

fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify({ summary, findings: unique, results }, null, 2));
fs.writeFileSync(
  path.join(outputDir, "report.md"),
  [
    "# OTT Release Smoke Audit",
    "",
    `Generated: ${summary.generatedAt}`,
    `Base URL: ${baseUrl}`,
    `Route checks: ${summary.routeChecks}`,
    `Blocking findings: ${summary.blocking}`,
    "",
    ...unique.map((item, index) => `${index + 1}. **${item.severity.toUpperCase()} — ${item.category}** — ${item.message} (${[item.profile, item.language, item.route].filter(Boolean).join(" / ")})`),
    "",
  ].join("\n"),
);

console.log(JSON.stringify(summary, null, 2));
if (summary.blocking > 0) process.exitCode = 1;
