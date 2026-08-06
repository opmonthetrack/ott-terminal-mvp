import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "https://ott-terminal-mvp.vercel.app";
const outputDir = path.resolve(process.env.AUDIT_OUTPUT_DIR || "artifacts/live-public-smoke-audit");
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

const findings = [];
const results = [];
const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

function finding(severity, category, message, scope = {}) {
  findings.push({ severity, category, message, ...scope });
}

function slug(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function settle(page, milliseconds = 1200) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(milliseconds);
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
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);

  // Safe shell interactions: welcome, language switch, primary navigation,
  // browser history and all-tools dialog. No signing/payment buttons are clicked.
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("ott-account-welcome-choice-v1");
    localStorage.setItem("ott-terminal-language-v2", "en");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await settle(page, 500);

  const welcome = page.locator('[role="dialog"]').first();
  if (await welcome.isVisible().catch(() => false)) {
    const named = Boolean(await welcome.getAttribute("aria-label")) || Boolean(await welcome.getAttribute("aria-labelledby"));
    if (!named) finding("high", "dialog", "Welcome dialog has no accessible name.", { profile: profile.name });
    await page.keyboard.press("Escape");
    if (await welcome.isVisible().catch(() => false)) {
      finding("high", "keyboard", "Welcome dialog does not close with Escape.", { profile: profile.name });
      await page.getByRole("button", { name: /continue as guest/i }).click();
    }
  }

  const nlButton = page.getByRole("button", { name: /^NL$|^Nederlands$/ }).first();
  if (await nlButton.isVisible().catch(() => false)) {
    await nlButton.click();
    await page.waitForTimeout(150);
    if (await page.locator("html").getAttribute("lang") !== "nl") {
      finding("critical", "language", "NL button did not switch the document language to Dutch.", { profile: profile.name });
    }
  } else {
    finding("high", "language", "Visible NL language control was not found.", { profile: profile.name });
  }

  const enButton = page.getByRole("button", { name: /^EN$|^English$/ }).first();
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
    await page.waitForTimeout(150);
  }

  const learnButton = page.getByRole("button", { name: /^Learn$/ }).first();
  if (await learnButton.isVisible().catch(() => false)) {
    await learnButton.click();
    await page.waitForTimeout(300);
    if (new URL(page.url()).searchParams.get("tab") !== "academy") {
      finding("critical", "navigation", "Primary Learn button did not navigate to Academy.", { profile: profile.name });
    }
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    if (new URL(page.url()).searchParams.has("tab")) {
      finding("high", "history", "Browser Back did not return from Academy to Home.", { profile: profile.name });
    }
  }

  const toolsButton = page.getByRole("button", { name: /open all tools/i });
  if (await toolsButton.isVisible().catch(() => false)) {
    await toolsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    if (!(await dialog.isVisible().catch(() => false))) {
      finding("critical", "navigation", "All-tools button did not open the menu.", { profile: profile.name });
    } else {
      const named = Boolean(await dialog.getAttribute("aria-label")) || Boolean(await dialog.getAttribute("aria-labelledby"));
      if (!named) finding("high", "dialog", "All-tools dialog has no accessible name.", { profile: profile.name });
      await page.keyboard.press("Escape");
      if (await dialog.isVisible().catch(() => false)) {
        finding("high", "keyboard", "All-tools dialog does not close with Escape.", { profile: profile.name });
      }
    }
  }

  for (const language of languages) {
    for (const route of routes) {
      const scope = { profile: profile.name, language, route };
      const consoleErrors = [];
      const pageErrors = [];
      const onConsole = (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      };
      const onPageError = (error) => pageErrors.push(String(error?.message || error));
      page.on("console", onConsole);
      page.on("pageerror", onPageError);

      await page.goto(route === "home" ? baseUrl : `${baseUrl}/?tab=${route}`, { waitUntil: "domcontentloaded" });
      await page.evaluate((nextLanguage) => localStorage.setItem("ott-terminal-language-v2", nextLanguage), language);
      await page.reload({ waitUntil: "domcontentloaded" });
      await settle(page);

      const audit = await page.evaluate(() => {
        const isVisible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const accessibleName = (element) =>
          (element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || "")
            .replace(/\s+/g, " ").trim();
        const buttons = [...document.querySelectorAll("button")].filter(isVisible).map((button) => {
          const rect = button.getBoundingClientRect();
          return { name: accessibleName(button), width: Math.round(rect.width), height: Math.round(rect.height) };
        });
        const controls = [...document.querySelectorAll("input, select, textarea")].filter(isVisible).map((control) => {
          const explicit = control.id ? document.querySelector(`label[for="${CSS.escape(control.id)}"]`) : null;
          const wrapped = control.closest("label");
          return {
            type: control.getAttribute("type") || control.tagName.toLowerCase(),
            name: control.getAttribute("aria-label") || control.getAttribute("aria-labelledby") || explicit?.textContent?.trim() || wrapped?.textContent?.trim() || "",
          };
        });
        const mains = [...document.querySelectorAll("main")];
        return {
          bodyText: document.body.innerText,
          visibleMainCount: mains.filter(isVisible).length,
          nestedMainCount: document.querySelectorAll("main main").length,
          h1Count: document.querySelectorAll("h1").length,
          unnamedButtons: buttons.filter((item) => !item.name),
          smallButtons: buttons.filter((item) => item.width < 44 || item.height < 44),
          unnamedControls: controls.filter((item) => !item.name),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          duplicateIds: [...new Set([...document.querySelectorAll("[id]")].map((node) => node.id).filter((id, index, ids) => id && ids.indexOf(id) !== index))],
          imagesWithoutAlt: [...document.querySelectorAll("img")].filter((image) => !image.hasAttribute("alt")).length,
        };
      });

      let axe = [];
      try {
        const response = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        axe = response.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length, help: item.help }));
      } catch (error) {
        finding("high", "audit", `Axe could not complete: ${String(error)}`, scope);
      }

      const htmlLang = await page.locator("html").getAttribute("lang");
      const title = await page.title();
      const currentUrl = page.url();
      results.push({ ...scope, currentUrl, htmlLang, title, consoleErrors, pageErrors, audit: { ...audit, bodyText: undefined }, axe });

      if (audit.visibleMainCount < 1) finding("critical", "render", "No visible main landmark/content area was found.", scope);
      if (audit.nestedMainCount) finding("high", "semantics", `${audit.nestedMainCount} nested main landmark(s) found.`, scope);
      if (htmlLang !== language) finding("critical", "language", `Document lang is '${htmlLang}' instead of '${language}'.`, scope);
      if (!title || title === "Vite + React + TS") finding("high", "seo", "Missing or default document title.", scope);
      if (route !== "home" && new URL(currentUrl).searchParams.get("tab") !== route) finding("critical", "routing", "Direct tab route did not remain selected.", scope);
      if (pageErrors.length) finding("critical", "runtime", pageErrors.join(" | "), scope);
      if (consoleErrors.length) finding("high", "runtime", consoleErrors.join(" | "), scope);
      if (audit.h1Count !== 1) finding("medium", "semantics", `Expected one h1, found ${audit.h1Count}.`, scope);
      if (audit.unnamedButtons.length) finding("high", "accessibility", `${audit.unnamedButtons.length} visible button(s) lack an accessible name.`, scope);
      if (audit.unnamedControls.length) finding("high", "accessibility", `${audit.unnamedControls.length} visible form control(s) lack a label.`, scope);
      if (audit.duplicateIds.length) finding("high", "html", `Duplicate IDs: ${audit.duplicateIds.join(", ")}.`, scope);
      if (audit.imagesWithoutAlt) finding("high", "accessibility", `${audit.imagesWithoutAlt} image(s) lack alt text.`, scope);
      if (audit.overflow > 2) finding("high", "responsive", `Horizontal overflow of ${audit.overflow}px.`, scope);
      if (audit.smallButtons.length) finding("medium", "touch-target", `${audit.smallButtons.length} visible button(s) are smaller than 44×44px.`, { ...scope, examples: audit.smallButtons.slice(0, 10) });

      if (language === "nl") {
        const englishLeaks = [
          "DAILY INTELLIGENCE SNAPSHOT", "OTT COMMAND DASHBOARD", "Privacy Policy", "Terms of Use",
          "XAMAN PAYMENT", "Create Access Payload", "Verify Access Payment", "Open Banxa", "Connect With Xaman",
        ].filter((text) => audit.bodyText.includes(text));
        if (englishLeaks.length) finding("high", "translation", `English UI text remains in Dutch mode: ${englishLeaks.join(", ")}.`, scope);
      }

      for (const violation of axe) {
        const severity = violation.impact === "critical" ? "critical" : violation.impact === "serious" ? "high" : "medium";
        finding(severity, "axe", `${violation.id}: ${violation.help} (${violation.nodes} node(s)).`, scope);
      }

      if (["dashboard", "academy", "support"].includes(route) && language === "nl") {
        await page.screenshot({ path: path.join(outputDir, `${slug(profile.name)}-${language}-${route}.png`), fullPage: true });
      }

      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    }
  }

  // Safe support amount selector interaction.
  await page.goto(`${baseUrl}/?tab=support`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("ott-terminal-language-v2", "en"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await settle(page, 800);
  for (const amount of ["0.589", "1.589", "2.589"]) {
    const amountButton = page.getByRole("button", { name: new RegExp(`^${amount.replace(".", "\\.")}\\s*XRP$`) });
    if (!(await amountButton.isVisible().catch(() => false))) {
      finding("critical", "interaction", `Support amount button ${amount} XRP was not found.`, { profile: profile.name });
      continue;
    }
    await amountButton.click();
    const submit = page.getByRole("button", { name: new RegExp(`Support with ${amount.replace(".", "\\.")} XRP`, "i") });
    if (!(await submit.isVisible().catch(() => false))) {
      finding("critical", "interaction", `Selecting ${amount} XRP did not update the support action.`, { profile: profile.name });
    }
    if (!(await amountButton.getAttribute("aria-pressed"))) {
      finding("medium", "accessibility", `Support amount ${amount} XRP does not expose selected state with aria-pressed.`, { profile: profile.name });
    }
  }

  await context.close();
}

await browser.close();

const unique = [];
const seen = new Set();
for (const item of findings) {
  const key = JSON.stringify(item);
  if (!seen.has(key)) { seen.add(key); unique.push(item); }
}
unique.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
const counts = unique.reduce((out, item) => ({ ...out, [item.severity]: (out[item.severity] || 0) + 1 }), {});
const report = { generatedAt: new Date().toISOString(), baseUrl, routeChecks: results.length, counts, findings: unique, results };
fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
const markdown = [
  "# OTT Live Public Smoke Audit", "", `Generated: ${report.generatedAt}`, `Base URL: ${baseUrl}`,
  `Route checks: ${results.length}`, `Findings: ${unique.length}`, "", "## Summary", "",
  `- Critical: ${counts.critical || 0}`, `- High: ${counts.high || 0}`, `- Medium: ${counts.medium || 0}`, "", "## Findings", "",
  ...unique.map((item, index) => `${index + 1}. **${item.severity.toUpperCase()} — ${item.category}** (${[item.profile, item.language, item.route].filter(Boolean).join(" / ")}): ${item.message}`),
  "", "## Safety limit", "", "This run intentionally did not submit account credentials, Xaman signatures, XRPL transactions, payments, votes, NFT offers or founder actions.", "",
];
fs.writeFileSync(path.join(outputDir, "report.md"), markdown.join("\n"));
console.log(markdown.join("\n"));
