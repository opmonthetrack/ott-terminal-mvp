import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const outDir = path.resolve("artifacts/critical-smoke-audit");
fs.mkdirSync(outDir, { recursive: true });

const publicRoutes = [
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

const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];

const languages = ["en", "nl"];
const findings = [];
const routeResults = [];
const globalErrors = [];

function addFinding(severity, category, message, context = {}) {
  findings.push({ severity, category, message, ...context });
}

function safeSlug(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function severityRank(value) {
  return { critical: 0, high: 1, medium: 2, low: 3, info: 4 }[value] ?? 5;
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

  const page = await context.newPage();
  let pageErrors = [];
  let consoleErrors = [];

  page.on("pageerror", (error) => pageErrors.push(String(error?.message || error)));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  // Global shell and language-control behavior.
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("ott-account-welcome-choice-v1"));
  await page.reload({ waitUntil: "networkidle" });

  const welcomeDialog = page.locator('[role="dialog"]').first();
  if (await welcomeDialog.isVisible().catch(() => false)) {
    const dialogName = await welcomeDialog.getAttribute("aria-label");
    const labelledBy = await welcomeDialog.getAttribute("aria-labelledby");
    if (!dialogName && !labelledBy) {
      addFinding("high", "accessibility", "Welcome dialog has no accessible name.", { profile: profile.name, route: "home" });
    }
    await page.keyboard.press("Escape");
    if (await welcomeDialog.isVisible().catch(() => false)) {
      addFinding("high", "keyboard", "Welcome dialog does not close with Escape.", { profile: profile.name, route: "home" });
      const guest = page.getByRole("button", { name: /continue as guest|ga verder als gast/i });
      if (await guest.isVisible().catch(() => false)) await guest.click();
    }
  }

  const openTools = page.getByRole("button", { name: /open all tools|open alle tools/i });
  if (await openTools.isVisible().catch(() => false)) {
    await openTools.click();
    const toolsDialog = page.locator('[role="dialog"]').first();
    if (!(await toolsDialog.isVisible().catch(() => false))) {
      addFinding("critical", "navigation", "All tools button did not open its dialog.", { profile: profile.name });
    } else {
      const dialogName = await toolsDialog.getAttribute("aria-label");
      const labelledBy = await toolsDialog.getAttribute("aria-labelledby");
      if (!dialogName && !labelledBy) {
        addFinding("high", "accessibility", "All tools dialog has no accessible name.", { profile: profile.name });
      }
      await page.keyboard.press("Escape");
      if (await toolsDialog.isVisible().catch(() => false)) {
        addFinding("high", "keyboard", "All tools dialog does not close with Escape.", { profile: profile.name });
      }
    }
  } else {
    addFinding("critical", "navigation", "All tools button is not visible.", { profile: profile.name });
  }

  for (const language of languages) {
    for (const route of publicRoutes) {
      pageErrors = [];
      consoleErrors = [];

      const url = route === "home" ? baseUrl : `${baseUrl}/?tab=${route}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate((nextLanguage) => {
        localStorage.setItem("ott-terminal-language-v2", nextLanguage);
      }, language);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(150);

      const htmlLang = await page.locator("html").getAttribute("lang");
      const mainVisible = await page.locator("main").isVisible().catch(() => false);
      const title = await page.title();
      const currentUrl = page.url();

      const domAudit = await page.evaluate(() => {
        const visible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
        };

        const nameOf = (element) =>
          (element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || "")
            .replace(/\s+/g, " ")
            .trim();

        const buttons = [...document.querySelectorAll("button")]
          .filter(visible)
          .map((button) => {
            const rect = button.getBoundingClientRect();
            return {
              name: nameOf(button),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              disabled: button.disabled,
              type: button.getAttribute("type") || "",
            };
          });

        const controls = [...document.querySelectorAll("input, select, textarea")]
          .filter(visible)
          .map((control) => {
            const id = control.id;
            const explicitLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
            const wrappedLabel = control.closest("label");
            return {
              tag: control.tagName.toLowerCase(),
              type: control.getAttribute("type") || "",
              name:
                control.getAttribute("aria-label") ||
                control.getAttribute("aria-labelledby") ||
                explicitLabel?.textContent?.trim() ||
                wrappedLabel?.textContent?.trim() ||
                "",
            };
          });

        const duplicateIds = [...document.querySelectorAll("[id]")]
          .map((node) => node.id)
          .filter((id, index, ids) => id && ids.indexOf(id) !== index);

        return {
          buttons,
          unnamedButtons: buttons.filter((button) => !button.name),
          smallButtons: buttons.filter((button) => button.width < 40 || button.height < 40),
          controls,
          unnamedControls: controls.filter((control) => !control.name),
          duplicateIds: [...new Set(duplicateIds)],
          missingImageAlt: [...document.querySelectorAll("img")].filter((image) => !image.hasAttribute("alt")).length,
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          h1Count: document.querySelectorAll("h1").length,
          placeholderLinks: [...document.querySelectorAll('a[href="#"], a[href=""]')].length,
        };
      });

      let axeViolations = [];
      try {
        const axeResult = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        axeViolations = axeResult.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length,
        }));
      } catch (error) {
        globalErrors.push(`Axe failed on ${profile.name}/${language}/${route}: ${String(error)}`);
      }

      routeResults.push({
        profile: profile.name,
        language,
        route,
        url: currentUrl,
        title,
        htmlLang,
        mainVisible,
        pageErrors,
        consoleErrors,
        domAudit,
        axeViolations,
      });

      if (!mainVisible) addFinding("critical", "render", "Main content did not render.", { profile: profile.name, language, route });
      if (htmlLang !== language) addFinding("high", "language", `HTML language is '${htmlLang}' instead of '${language}'.`, { profile: profile.name, language, route });
      if (!title || title === "Vite + React + TS") addFinding("high", "seo", "Route has a missing or default document title.", { profile: profile.name, language, route });
      if (route !== "home" && !new URL(currentUrl).searchParams.get("tab")) addFinding("critical", "routing", "Direct route lost its tab parameter.", { profile: profile.name, language, route });
      if (pageErrors.length) addFinding("critical", "runtime", `Page errors: ${pageErrors.join(" | ")}`, { profile: profile.name, language, route });
      if (consoleErrors.length) addFinding("high", "runtime", `Console errors: ${consoleErrors.join(" | ")}`, { profile: profile.name, language, route });
      if (domAudit.unnamedButtons.length) addFinding("high", "accessibility", `${domAudit.unnamedButtons.length} visible button(s) have no accessible name.`, { profile: profile.name, language, route });
      if (domAudit.unnamedControls.length) addFinding("high", "accessibility", `${domAudit.unnamedControls.length} visible form control(s) have no label.`, { profile: profile.name, language, route });
      if (domAudit.duplicateIds.length) addFinding("high", "html", `Duplicate IDs: ${domAudit.duplicateIds.join(", ")}.`, { profile: profile.name, language, route });
      if (domAudit.missingImageAlt) addFinding("high", "accessibility", `${domAudit.missingImageAlt} image(s) lack alt text.`, { profile: profile.name, language, route });
      if (domAudit.horizontalOverflow > 2) addFinding("high", "responsive", `Horizontal overflow of ${domAudit.horizontalOverflow}px.`, { profile: profile.name, language, route });
      if (domAudit.h1Count !== 1) addFinding("medium", "semantics", `Expected one h1, found ${domAudit.h1Count}.`, { profile: profile.name, language, route });
      if (domAudit.placeholderLinks) addFinding("medium", "interaction", `${domAudit.placeholderLinks} placeholder link(s) found.`, { profile: profile.name, language, route });
      if (domAudit.smallButtons.length) {
        addFinding("medium", "touch-target", `${domAudit.smallButtons.length} visible button(s) are smaller than 40x40px.`, {
          profile: profile.name,
          language,
          route,
          examples: domAudit.smallButtons.slice(0, 8),
        });
      }

      for (const violation of axeViolations) {
        const severity = violation.impact === "critical" ? "critical" : violation.impact === "serious" ? "high" : "medium";
        addFinding(severity, "axe", `${violation.id}: ${violation.description} (${violation.nodes} node(s)).`, {
          profile: profile.name,
          language,
          route,
        });
      }

      if (pageErrors.length || consoleErrors.length || !mainVisible || domAudit.horizontalOverflow > 2) {
        const screenshotName = `${safeSlug(profile.name)}-${language}-${safeSlug(route)}.png`;
        await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true });
      }
    }
  }

  await context.close();
}

await browser.close();

const uniqueFindings = [];
const seen = new Set();
for (const finding of findings) {
  const key = JSON.stringify(finding);
  if (!seen.has(key)) {
    seen.add(key);
    uniqueFindings.push(finding);
  }
}
uniqueFindings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

const counts = uniqueFindings.reduce((acc, finding) => {
  acc[finding.severity] = (acc[finding.severity] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  publicRoutes,
  profiles: profiles.map((profile) => profile.name),
  languages,
  summary: {
    routeChecks: routeResults.length,
    findings: uniqueFindings.length,
    counts,
    globalErrors,
  },
  findings: uniqueFindings,
  routeResults,
};

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# OTT Critical Smoke Audit",
  "",
  `Generated: ${report.generatedAt}`,
  `Base URL: ${baseUrl}`,
  `Route checks: ${routeResults.length} (17 routes × 2 languages × 2 viewports)`,
  `Findings: ${uniqueFindings.length}`,
  "",
  "## Severity summary",
  "",
  `- Critical: ${counts.critical || 0}`,
  `- High: ${counts.high || 0}`,
  `- Medium: ${counts.medium || 0}`,
  `- Low: ${counts.low || 0}`,
  "",
  "## Findings",
  "",
  ...uniqueFindings.map((finding, index) => {
    const scope = [finding.profile, finding.language, finding.route].filter(Boolean).join(" / ");
    return `${index + 1}. **${finding.severity.toUpperCase()} — ${finding.category}**${scope ? ` (${scope})` : ""}: ${finding.message}`;
  }),
  "",
  "## Limits",
  "",
  "This automated run validates the public guest shell, route rendering, responsive overflow, language state, basic keyboard behavior, DOM/button inventory and WCAG axe checks. Authenticated account, Google OAuth, real Xaman signing, ledger-confirmed payments, NFT delivery and founder-only operations require controlled credentials and human end-to-end verification.",
  "",
];

fs.writeFileSync(path.join(outDir, "report.md"), markdown.join("\n"));
console.log(markdown.join("\n"));
