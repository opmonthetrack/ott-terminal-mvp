import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL || "https://ott-terminal-mvp.vercel.app").replace(/\/$/, "");
const ARTIFACT_DIR = path.resolve("artifacts/live-smoke");
const TAB_SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "tabs");
const runId = new Date().toISOString().replace(/[:.]/g, "-");

await fs.mkdir(TAB_SCREENSHOT_DIR, { recursive: true });

const report = {
  runId,
  baseUrl: BASE_URL,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  browser: "Chromium / Playwright",
  home: null,
  standalonePages: [],
  apiChecks: [],
  tabs: [],
  manualRequired: [
    "Xaman wallet connection signature and return",
    "Daily Check-In signature and reward credit",
    "Access Pass NFT scan using a real holder wallet",
    "Founder NFT mint/send signature using the protected founder token",
  ],
  fatalErrors: [],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function isCriticalConsoleMessage(message) {
  const text = message.text();
  return (
    message.type() === "error" &&
    !text.includes("favicon") &&
    !text.includes("ResizeObserver loop") &&
    !text.includes("net::ERR_ABORTED")
  );
}

function isFatalText(text) {
  return (
    text.includes("Application Error") ||
    text.includes("Failed to fetch dynamically imported module") ||
    text.includes("ChunkLoadError") ||
    text.includes("Something went wrong")
  );
}

async function waitForModule(page) {
  await page.waitForTimeout(450);
  await page
    .getByText(/Loading terminal module/i)
    .waitFor({ state: "hidden", timeout: 12_000 })
    .catch(() => {});
  await page.waitForTimeout(250);
}

async function screenshot(page, filename) {
  const output = path.join(TAB_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: output, fullPage: false });
  return path.relative(process.cwd(), output);
}

async function safeBodyText(page, selector = "body") {
  try {
    return await page.locator(selector).innerText({ timeout: 8_000 });
  } catch {
    return "";
  }
}

async function directJsonCheck(page, name, url, options = {}) {
  const result = await page.evaluate(
    async ({ requestUrl, requestOptions }) => {
      try {
        const response = await fetch(requestUrl, requestOptions);
        const text = await response.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
        return {
          ok: response.ok,
          status: response.status,
          contentType: response.headers.get("content-type"),
          json,
          text: text.slice(0, 1_000),
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    { requestUrl: url, requestOptions: options },
  );

  const check = { name, url, ...result };
  report.apiChecks.push(check);
  return check;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  serviceWorkers: "block",
  ignoreHTTPSErrors: false,
});
const page = await context.newPage();

let currentTab = "bootstrap";
let tabConsoleErrors = [];
let tabPageErrors = [];
let tabFailedRequests = [];
let tabBadResponses = [];

page.on("console", (message) => {
  if (isCriticalConsoleMessage(message)) {
    tabConsoleErrors.push({ tab: currentTab, text: message.text() });
  }
});

page.on("pageerror", (error) => {
  tabPageErrors.push({ tab: currentTab, text: error.message });
});

page.on("requestfailed", (request) => {
  if (["document", "script", "xhr", "fetch"].includes(request.resourceType())) {
    tabFailedRequests.push({
      tab: currentTab,
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      failure: request.failure()?.errorText || "unknown",
    });
  }
});

page.on("response", (response) => {
  const request = response.request();
  const isSameOrigin = response.url().startsWith(BASE_URL);
  if (
    isSameOrigin &&
    response.status() >= 400 &&
    ["document", "script", "xhr", "fetch"].includes(request.resourceType())
  ) {
    tabBadResponses.push({
      tab: currentTab,
      url: response.url(),
      status: response.status(),
      resourceType: request.resourceType(),
    });
  }
});

function resetTabSignals(label) {
  currentTab = label;
  tabConsoleErrors = [];
  tabPageErrors = [];
  tabFailedRequests = [];
  tabBadResponses = [];
}

try {
  resetTabSignals("home");
  const homeUrl = `${BASE_URL}/?qa=${encodeURIComponent(runId)}`;
  const homeResponse = await page.goto(homeUrl, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await waitForModule(page);

  const homeText = await safeBodyText(page);
  const homeShot = await screenshot(page, "00-home.png");
  report.home = {
    url: page.url(),
    status: homeResponse?.status() ?? null,
    title: await page.title(),
    screenshot: homeShot,
    fatalText: isFatalText(homeText),
    consoleErrors: [...tabConsoleErrors],
    pageErrors: [...tabPageErrors],
    failedRequests: [...tabFailedRequests],
    badResponses: [...tabBadResponses],
  };

  if (!homeResponse?.ok() || report.home.fatalText || tabPageErrors.length > 0) {
    report.fatalErrors.push("Production home page did not load cleanly.");
  }

  const enButton = page.getByRole("button", { name: "EN", exact: true });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
    await page.waitForTimeout(200);
  }

  const showLabsButton = page.getByRole("button", { name: /Show Founder \/ Labs/i });
  if (await showLabsButton.isVisible().catch(() => false)) {
    await showLabsButton.click();
    await page.waitForTimeout(250);
  }

  await page.locator("aside details").evaluateAll((details) => {
    details.forEach((detail) => {
      detail.open = true;
    });
  });

  const labels = await page.locator("aside nav button").evaluateAll((buttons) =>
    buttons
      .map((button) => button.querySelector("span")?.textContent?.trim() || "")
      .filter(Boolean),
  );

  for (let index = 0; index < labels.length; index += 1) {
    const label = labels[index];
    resetTabSignals(label);

    const navButton = page
      .locator("aside nav button")
      .filter({ has: page.getByText(label, { exact: true }) })
      .first();

    const result = {
      order: index + 1,
      label,
      status: "UNKNOWN",
      mode: "unknown",
      headingFound: false,
      screenshot: null,
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      badResponses: [],
      notes: [],
    };

    try {
      await navButton.scrollIntoViewIfNeeded();
      await navButton.click({ timeout: 10_000 });
      await waitForModule(page);

      const mainText = await safeBodyText(page, "main");
      result.headingFound = mainText.toLowerCase().includes(label.toLowerCase());

      if (isFatalText(mainText)) {
        result.status = "FAIL";
        result.mode = "fatal-render-error";
        result.notes.push("Fatal application/chunk error text detected.");
      } else if (mainText.includes("Locked Preview")) {
        result.status = "PASS";
        result.mode = "access-gate-preview";
        result.notes.push("Premium module correctly protected for guest browser.");
      } else {
        result.status = "PASS";
        result.mode = "module-rendered";
      }

      if (!result.headingFound) {
        result.notes.push("Exact tab label was not found in rendered main content; screenshot retained for review.");
      }

      result.screenshot = await screenshot(
        page,
        `${String(index + 1).padStart(2, "0")}-${slugify(label)}.png`,
      );
    } catch (error) {
      result.status = "FAIL";
      result.mode = "interaction-error";
      result.notes.push(error instanceof Error ? error.message : String(error));
      result.screenshot = await screenshot(
        page,
        `${String(index + 1).padStart(2, "0")}-${slugify(label)}-failed.png`,
      ).catch(() => null);
    }

    result.consoleErrors = [...tabConsoleErrors];
    result.pageErrors = [...tabPageErrors];
    result.failedRequests = [...tabFailedRequests];
    result.badResponses = [...tabBadResponses];

    const criticalNetworkFailure = result.badResponses.some((item) => item.status >= 500);
    const criticalScriptFailure = result.failedRequests.some(
      (item) => item.resourceType === "script" || item.resourceType === "document",
    );

    if (
      result.pageErrors.length > 0 ||
      criticalNetworkFailure ||
      criticalScriptFailure ||
      result.consoleErrors.some((item) =>
        /Failed to fetch dynamically imported module|ChunkLoadError|Application Error/i.test(item.text),
      )
    ) {
      result.status = "FAIL";
    }

    report.tabs.push(result);
  }

  resetTabSignals("support-standalone");
  const supportResponse = await page.goto(`${BASE_URL}/support-donation.html?qa=${runId}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(2_000);
  const supportText = await safeBodyText(page);
  const supportScreenshot = await screenshot(page, "90-support-standalone.png");
  report.standalonePages.push({
    name: "Support donation page",
    url: page.url(),
    status: supportResponse?.status() ?? null,
    passed:
      Boolean(supportResponse?.ok()) &&
      supportText.includes("Support OTT Terminal") &&
      supportText.includes("Total collected") &&
      !isFatalText(supportText),
    screenshot: supportScreenshot,
    consoleErrors: [...tabConsoleErrors],
    pageErrors: [...tabPageErrors],
    failedRequests: [...tabFailedRequests],
    badResponses: [...tabBadResponses],
  });

  await directJsonCheck(page, "News API", `${BASE_URL}/api/news`);
  await directJsonCheck(page, "Live support stats", `${BASE_URL}/api/support-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "xrpl.getSupportStats" }),
  });
  await directJsonCheck(page, "Support invalid amount is rejected", `${BASE_URL}/api/support-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "xaman.createSupportPaymentPayload",
      amountXrp: "0.123",
    }),
  });
  await directJsonCheck(page, "Support valid Xaman payload creation", `${BASE_URL}/api/support-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "xaman.createSupportPaymentPayload",
      amountXrp: "0.589",
    }),
  });

  const tabFailures = report.tabs.filter((tab) => tab.status === "FAIL");
  const standaloneFailures = report.standalonePages.filter((item) => !item.passed);
  const newsApi = report.apiChecks.find((check) => check.name === "News API");
  const statsApi = report.apiChecks.find((check) => check.name === "Live support stats");
  const invalidAmount = report.apiChecks.find(
    (check) => check.name === "Support invalid amount is rejected",
  );
  const validPayload = report.apiChecks.find(
    (check) => check.name === "Support valid Xaman payload creation",
  );

  if (tabFailures.length > 0) {
    report.fatalErrors.push(`${tabFailures.length} tab(s) failed to render cleanly.`);
  }
  if (standaloneFailures.length > 0) {
    report.fatalErrors.push(`${standaloneFailures.length} standalone page(s) failed.`);
  }
  if (!newsApi?.ok) {
    report.fatalErrors.push("News API did not return a successful response.");
  }
  if (!statsApi?.ok || !statsApi?.json?.ok) {
    report.fatalErrors.push("Live support statistics endpoint failed.");
  }
  if (invalidAmount?.status !== 400) {
    report.fatalErrors.push("Support endpoint did not reject an unsupported amount.");
  }
  if (!validPayload?.ok || !validPayload?.json?.payload?.next) {
    report.fatalErrors.push("Valid Xaman support payload creation failed.");
  }
} catch (error) {
  report.fatalErrors.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  report.finishedAt = new Date().toISOString();
  await browser.close();
}

const passedTabs = report.tabs.filter((tab) => tab.status === "PASS").length;
const failedTabs = report.tabs.filter((tab) => tab.status === "FAIL").length;
const renderedModules = report.tabs.filter((tab) => tab.mode === "module-rendered").length;
const lockedPreviews = report.tabs.filter((tab) => tab.mode === "access-gate-preview").length;

const markdown = [
  "# OTT Terminal Live Smoke Test",
  "",
  `- Run: ${report.runId}`,
  `- Production URL: ${report.baseUrl}`,
  `- Browser: ${report.browser}`,
  `- Tabs checked: ${report.tabs.length}`,
  `- Passed tabs: ${passedTabs}`,
  `- Failed tabs: ${failedTabs}`,
  `- Modules rendered as guest: ${renderedModules}`,
  `- Premium access gates confirmed: ${lockedPreviews}`,
  `- Fatal findings: ${report.fatalErrors.length}`,
  "",
  "## Tabs",
  "",
  "| # | Tab | Result | Mode | Notes |",
  "|---:|---|---|---|---|",
  ...report.tabs.map(
    (tab) =>
      `| ${tab.order} | ${tab.label} | ${tab.status} | ${tab.mode} | ${tab.notes.join(" ").replaceAll("|", "\\|") || "—"} |`,
  ),
  "",
  "## Standalone pages",
  "",
  ...report.standalonePages.map(
    (item) => `- ${item.passed ? "PASS" : "FAIL"} — ${item.name} — HTTP ${item.status}`,
  ),
  "",
  "## API checks",
  "",
  ...report.apiChecks.map(
    (check) => `- ${check.ok ? "OK" : "CHECK"} — ${check.name} — HTTP ${check.status}`,
  ),
  "",
  "## Manual signature checks still required",
  "",
  ...report.manualRequired.map((item) => `- ${item}`),
  "",
  "## Fatal findings",
  "",
  ...(report.fatalErrors.length > 0
    ? report.fatalErrors.map((item) => `- ${item}`)
    : ["- None"]),
  "",
].join("\n");

await fs.writeFile(path.join(ARTIFACT_DIR, "report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(ARTIFACT_DIR, "report.md"), markdown);

console.log(markdown);

if (report.fatalErrors.length > 0) {
  process.exitCode = 1;
}
