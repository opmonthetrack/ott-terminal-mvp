import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL || "https://ott-terminal-mvp.vercel.app").replace(/\/$/, "");
const OUTPUT_DIR = path.resolve("artifacts/live-smoke");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "tabs");
const runId = new Date().toISOString().replace(/[:.]/g, "-");

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

const report = {
  runId,
  baseUrl: BASE_URL,
  browser: "Chromium / Playwright",
  startedAt: new Date().toISOString(),
  finishedAt: null,
  tabs: [],
  pages: [],
  apiChecks: [],
  fatalErrors: [],
  manualRequired: [
    "Xaman wallet connection signature and return",
    "Daily Check-In signature and XP/OTT Credit verification",
    "Access Pass NFT scan with a real holder wallet",
    "Founder NFT mint/send signing with the protected founder token",
  ],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function containsFatalText(text) {
  return /Application Error|Failed to fetch dynamically imported module|ChunkLoadError|Something went wrong/i.test(
    text,
  );
}

async function bodyText(page, selector = "body") {
  return page.locator(selector).innerText({ timeout: 10_000 }).catch(() => "");
}

async function waitForTab(page) {
  await page.waitForTimeout(450);
  await page
    .getByText(/Loading terminal module/i)
    .waitFor({ state: "hidden", timeout: 12_000 })
    .catch(() => {});
  await page.waitForTimeout(300);
}

async function saveScreenshot(page, filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  return path.relative(process.cwd(), filePath);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  serviceWorkers: "block",
});
const page = await context.newPage();

let activeArea = "startup";
let consoleErrors = [];
let pageErrors = [];
let failedRequests = [];
let badResponses = [];

function resetSignals(area) {
  activeArea = area;
  consoleErrors = [];
  pageErrors = [];
  failedRequests = [];
  badResponses = [];
}

page.on("console", (message) => {
  const text = message.text();
  if (
    message.type() === "error" &&
    !/favicon|ResizeObserver loop|net::ERR_ABORTED/i.test(text)
  ) {
    consoleErrors.push({ area: activeArea, text });
  }
});

page.on("pageerror", (error) => {
  pageErrors.push({ area: activeArea, text: error.message });
});

page.on("requestfailed", (request) => {
  if (["document", "script", "xhr", "fetch"].includes(request.resourceType())) {
    failedRequests.push({
      area: activeArea,
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      error: request.failure()?.errorText || "unknown",
    });
  }
});

page.on("response", (response) => {
  const request = response.request();
  if (
    response.url().startsWith(BASE_URL) &&
    response.status() >= 400 &&
    ["document", "script", "xhr", "fetch"].includes(request.resourceType())
  ) {
    badResponses.push({
      area: activeArea,
      url: response.url(),
      status: response.status(),
      resourceType: request.resourceType(),
    });
  }
});

async function testPage(name, url, requiredText = []) {
  resetSignals(name);
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await waitForTab(page);
  const text = await bodyText(page);
  const lowerText = text.toLowerCase();
  const missingText = requiredText.filter(
    (value) => !lowerText.includes(value.toLowerCase()),
  );
  const screenshot = await saveScreenshot(page, `${slugify(name)}.png`);
  const passed =
    Boolean(response?.ok()) &&
    !containsFatalText(text) &&
    pageErrors.length === 0 &&
    missingText.length === 0;

  const result = {
    name,
    url: page.url(),
    httpStatus: response?.status() ?? null,
    passed,
    missingText,
    screenshot,
    consoleErrors: [...consoleErrors],
    pageErrors: [...pageErrors],
    failedRequests: [...failedRequests],
    badResponses: [...badResponses],
  };
  report.pages.push(result);
  return result;
}

async function apiCheck(name, requestUrl, requestOptions, validate) {
  const response = await page.evaluate(
    async ({ url, options }) => {
      try {
        const result = await fetch(url, options);
        const text = await result.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
        return {
          transportOk: true,
          ok: result.ok,
          status: result.status,
          json,
          text: text.slice(0, 1_200),
        };
      } catch (error) {
        return {
          transportOk: false,
          ok: false,
          status: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    { url: requestUrl, options: requestOptions },
  );

  const passed = validate(response);
  const check = { name, url: requestUrl, passed, ...response };
  report.apiChecks.push(check);
  return check;
}

try {
  const founderHome = await testPage(
    "00-founder-home",
    `${BASE_URL}/?founder=1&qa=${encodeURIComponent(runId)}`,
    ["Home", "XRPL OnTheTrack Terminal"],
  );

  if (!founderHome.passed) {
    report.fatalErrors.push("Founder-mode production home failed to load cleanly.");
  }

  const enButton = page.locator("aside").getByRole("button", { name: "EN", exact: true });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
    await page.waitForTimeout(250);
  }

  const showLabsButton = page
    .locator("aside")
    .getByRole("button", { name: /Show Founder \/ Labs/i });
  if (await showLabsButton.isVisible().catch(() => false)) {
    await showLabsButton.click();
    await page.waitForTimeout(300);
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

  for (const requiredFounderTab of ["Pitch Mode", "Submission Pack", "Smoke Test"]) {
    if (!labels.includes(requiredFounderTab)) {
      report.fatalErrors.push(`${requiredFounderTab} is not visible in founder mode.`);
    }
  }

  for (let index = 0; index < labels.length; index += 1) {
    const label = labels[index];
    resetSignals(label);

    const result = {
      order: index + 1,
      label,
      passed: false,
      mode: "unknown",
      screenshot: null,
      notes: [],
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      badResponses: [],
    };

    try {
      const button = page
        .locator("aside nav button")
        .filter({ has: page.getByText(label, { exact: true }) })
        .first();
      await button.scrollIntoViewIfNeeded();
      await button.click({ timeout: 10_000 });
      await waitForTab(page);

      const text = await bodyText(page, "main");
      const scriptOrDocumentFailure = failedRequests.some((item) =>
        ["script", "document"].includes(item.resourceType),
      );
      const serverFailure = badResponses.some((item) => item.status >= 500);
      const fatalConsole = consoleErrors.some((item) =>
        /Failed to fetch dynamically imported module|ChunkLoadError|Application Error/i.test(
          item.text,
        ),
      );

      result.mode = text.includes("Locked Preview")
        ? "access-gate-preview"
        : "module-rendered";
      result.passed =
        !containsFatalText(text) &&
        pageErrors.length === 0 &&
        !scriptOrDocumentFailure &&
        !serverFailure &&
        !fatalConsole;

      if (!text.toLowerCase().includes(label.toLowerCase())) {
        result.notes.push("Exact tab label not present in main text; screenshot kept for review.");
      }

      result.screenshot = await saveScreenshot(
        page,
        `${String(index + 1).padStart(2, "0")}-${slugify(label)}.png`,
      );
    } catch (error) {
      result.notes.push(error instanceof Error ? error.message : String(error));
      result.screenshot = await saveScreenshot(
        page,
        `${String(index + 1).padStart(2, "0")}-${slugify(label)}-failed.png`,
      ).catch(() => null);
    }

    result.consoleErrors = [...consoleErrors];
    result.pageErrors = [...pageErrors];
    result.failedRequests = [...failedRequests];
    result.badResponses = [...badResponses];
    report.tabs.push(result);
  }

  const supportPage = await testPage(
    "90-support-standalone",
    `${BASE_URL}/support-donation.html?qa=${runId}`,
    ["Support OTT Terminal", "Total collected", "Live support proof"],
  );
  if (!supportPage.passed) {
    report.fatalErrors.push("Standalone support page failed its live browser check.");
  }

  const returnPage = await testPage(
    "91-support-return-route",
    `${BASE_URL}/?founder=1&support_payment_return=1&payload=qa-${runId}&amount=0.589`,
    ["Home", "XRPL OnTheTrack Terminal"],
  );
  if (!returnPage.passed) {
    report.fatalErrors.push("Support/Xaman return URL failed to reload the terminal cleanly.");
  }

  await apiCheck(
    "News API",
    `${BASE_URL}/api/news`,
    { method: "GET" },
    (response) => response.status === 200,
  );
  await apiCheck(
    "Live support stats",
    `${BASE_URL}/api/support-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "xrpl.getSupportStats" }),
    },
    (response) => response.status === 200 && response.json?.ok === true,
  );
  await apiCheck(
    "Unsupported support amount rejected",
    `${BASE_URL}/api/support-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "xaman.createSupportPaymentPayload",
        amountXrp: "0.123",
      }),
    },
    (response) => response.status === 400,
  );
  await apiCheck(
    "Valid support Xaman payload",
    `${BASE_URL}/api/support-payment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "xaman.createSupportPaymentPayload",
        amountXrp: "0.589",
      }),
    },
    (response) =>
      response.status === 200 &&
      response.json?.ok === true &&
      Boolean(
        response.json?.payload?.next?.always ||
          response.json?.payload?.next?.no_push_msg_received,
      ),
  );

  const failedTabs = report.tabs.filter((tab) => !tab.passed);
  const failedApiChecks = report.apiChecks.filter((check) => !check.passed);

  if (failedTabs.length > 0) {
    report.fatalErrors.push(`${failedTabs.length} tab(s) failed the live browser check.`);
  }
  if (failedApiChecks.length > 0) {
    report.fatalErrors.push(`${failedApiChecks.length} API check(s) failed.`);
  }
} catch (error) {
  report.fatalErrors.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  report.finishedAt = new Date().toISOString();
  await browser.close();
}

const passedTabs = report.tabs.filter((tab) => tab.passed).length;
const failedTabs = report.tabs.filter((tab) => !tab.passed).length;
const renderedTabs = report.tabs.filter((tab) => tab.mode === "module-rendered").length;
const lockedTabs = report.tabs.filter((tab) => tab.mode === "access-gate-preview").length;

const markdown = [
  "# OTT Terminal Live Production Smoke Test",
  "",
  `- Run: ${report.runId}`,
  `- URL: ${report.baseUrl}`,
  `- Browser: ${report.browser}`,
  `- Tabs checked: ${report.tabs.length}`,
  `- Tabs passed: ${passedTabs}`,
  `- Tabs failed: ${failedTabs}`,
  `- Modules rendered: ${renderedTabs}`,
  `- Correct locked previews: ${lockedTabs}`,
  `- Fatal findings: ${report.fatalErrors.length}`,
  "",
  "## Tab results",
  "",
  "| # | Tab | Result | Mode | Notes |",
  "|---:|---|---|---|---|",
  ...report.tabs.map(
    (tab) =>
      `| ${tab.order} | ${tab.label} | ${tab.passed ? "PASS" : "FAIL"} | ${tab.mode} | ${tab.notes.join(" ").replaceAll("|", "\\|") || "—"} |`,
  ),
  "",
  "## Page checks",
  "",
  ...report.pages.map(
    (item) =>
      `- ${item.passed ? "PASS" : "FAIL"} — ${item.name} — HTTP ${item.httpStatus}${item.missingText.length ? ` — missing: ${item.missingText.join(", ")}` : ""}`,
  ),
  "",
  "## API checks",
  "",
  ...report.apiChecks.map(
    (item) => `- ${item.passed ? "PASS" : "FAIL"} — ${item.name} — HTTP ${item.status}`,
  ),
  "",
  "## Manual signature checks",
  "",
  ...report.manualRequired.map((item) => `- ${item}`),
  "",
  "## Fatal findings",
  "",
  ...(report.fatalErrors.length
    ? report.fatalErrors.map((item) => `- ${item}`)
    : ["- None"]),
  "",
].join("\n");

await fs.writeFile(path.join(OUTPUT_DIR, "report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(OUTPUT_DIR, "report.md"), markdown);
console.log(markdown);

if (report.fatalErrors.length > 0) {
  process.exitCode = 1;
}
