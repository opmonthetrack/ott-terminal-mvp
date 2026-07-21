import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL || "https://ott-terminal-mvp.vercel.app").replace(/\/$/, "");
const OUTPUT_DIR = path.resolve("artifacts/functional-smoke");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "screenshots");
const runId = new Date().toISOString().replace(/[:.]/g, "-");

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

const results = [];
const browserSignals = [];

function addResult(name, passed, details = {}) {
  results.push({ name, passed, ...details });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, `${slugify(name)}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return path.relative(process.cwd(), filePath);
}

async function mainText(page) {
  return page.locator("main").innerText({ timeout: 10_000 }).catch(() => "");
}

async function waitForContent(page, milliseconds = 2_000) {
  await page.waitForTimeout(450);
  await page
    .getByText(/Loading terminal module/i)
    .waitFor({ state: "hidden", timeout: 12_000 })
    .catch(() => {});
  await page.waitForTimeout(milliseconds);
}

async function clickFirstVisible(page, locator) {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      return true;
    }
  }
  return false;
}

async function openApp(page) {
  await page.goto(`${BASE_URL}/?founder=1&functional=${runId}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await waitForContent(page, 500);

  const enButton = page.locator("aside").getByRole("button", { name: "EN", exact: true });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
    await page.waitForTimeout(200);
  }

  const showLabsButton = page
    .locator("aside")
    .getByRole("button", { name: /Show Founder \/ Labs/i });
  if (await showLabsButton.isVisible().catch(() => false)) {
    await showLabsButton.click();
    await page.waitForTimeout(250);
  }

  await page.locator("aside details").evaluateAll((details) => {
    details.forEach((detail) => {
      detail.open = true;
    });
  });
}

async function goToTab(page, label, wait = 1_500) {
  const button = page
    .locator("aside nav button")
    .filter({ has: page.getByText(label, { exact: true }) })
    .first();
  await button.scrollIntoViewIfNeeded();
  await button.click({ timeout: 10_000 });
  await waitForContent(page, wait);
  return mainText(page);
}

async function readClipboard(page) {
  return page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
}

async function clearClipboard(page) {
  await page.evaluate(() => navigator.clipboard.writeText("")).catch(() => {});
}

async function postJson(page, url, body) {
  return page.evaluate(
    async ({ requestUrl, requestBody }) => {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const text = await response.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      return { status: response.status, ok: response.ok, json, text: text.slice(0, 1_000) };
    },
    { requestUrl: url, requestBody: body },
  );
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  serviceWorkers: "block",
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();

page.on("pageerror", (error) => {
  browserSignals.push({ type: "pageerror", message: error.message });
});
page.on("console", (message) => {
  if (message.type() === "error" && !/favicon|ResizeObserver|ERR_ABORTED/i.test(message.text())) {
    browserSignals.push({ type: "console", message: message.text() });
  }
});
page.on("requestfailed", (request) => {
  if (["document", "script", "xhr", "fetch"].includes(request.resourceType())) {
    browserSignals.push({
      type: "requestfailed",
      message: `${request.resourceType()} ${request.url()} ${request.failure()?.errorText || ""}`,
    });
  }
});

try {
  await openApp(page);

  let text = await goToTab(page, "Home", 500);
  const homePass =
    /Free to Learn/i.test(text) && /Xaman to Prove/i.test(text) && /Pass to Unlock/i.test(text);
  addResult("Home access model", homePass, {
    screenshot: await screenshot(page, "home-access-model"),
  });

  text = await goToTab(page, "Daily Snapshot", 7_000);
  const refreshSnapshot = page.getByRole("button", { name: /Refresh Snapshot/i });
  if (await refreshSnapshot.isVisible().catch(() => false)) {
    await refreshSnapshot.click();
    await page.waitForTimeout(6_000);
    text = await mainText(page);
  }
  const dashboardPass =
    /Daily Intelligence Snapshot/i.test(text) &&
    /Today's Top Signal/i.test(text) &&
    !/Loading \/api\/news daily snapshot/i.test(text);
  addResult("Daily Snapshot live feed and refresh", dashboardPass, {
    loadingStillVisible: /Loading \/api\/news daily snapshot/i.test(text),
    screenshot: await screenshot(page, "daily-snapshot-functional"),
  });

  text = await goToTab(page, "XRPL Intelligence", 7_000);
  const refreshIntel = page.locator("main button").filter({ hasText: /Refresh/i });
  if (await clickFirstVisible(page, refreshIntel)) {
    await page.waitForTimeout(5_000);
    text = await mainText(page);
  }
  const externalIntelLinks = await page.locator('main a[href^="http"]').count();
  const intelPass =
    /XRPL Intelligence/i.test(text) &&
    !/Loading.*intelligence/i.test(text) &&
    externalIntelLinks > 0;
  addResult("XRPL Intelligence feed, refresh and source links", intelPass, {
    externalSourceLinks: externalIntelLinks,
    screenshot: await screenshot(page, "xrpl-intelligence-functional"),
  });

  text = await goToTab(page, "Newsroom", 6_000);
  const platformNames = ["LinkedIn", "Instagram", "Facebook", "Medium", "TikTok", "WhatsApp", "YouTube"];
  const missingPlatforms = platformNames.filter((platform) => !text.includes(platform));
  for (const platform of ["LinkedIn", "WhatsApp", "TikTok"]) {
    await clickFirstVisible(
      page,
      page.locator("main button").filter({ hasText: new RegExp(platform, "i") }),
    );
    await page.waitForTimeout(200);
  }
  await clearClipboard(page);
  const copiedNews = await clickFirstVisible(
    page,
    page.locator("main button").filter({ hasText: /Copy Output/i }),
  );
  await page.waitForTimeout(300);
  const newsClipboard = copiedNews ? await readClipboard(page) : "";
  addResult("Newsroom platform modes and Copy Output", missingPlatforms.length === 0 && copiedNews && newsClipboard.length > 10, {
    missingPlatforms,
    clipboardCharacters: newsClipboard.length,
    screenshot: await screenshot(page, "newsroom-functional"),
  });

  text = await goToTab(page, "OTT Intelligence", 6_000);
  const intelligenceModes = [
    "Builder Lens",
    "Beginner Explain",
    "Risk Context",
    "Content Angle",
    "Verify Checklist",
  ];
  const missingModes = intelligenceModes.filter((mode) => !text.includes(mode));
  for (const mode of intelligenceModes) {
    await clickFirstVisible(
      page,
      page.locator("main button").filter({ hasText: new RegExp(mode, "i") }),
    );
    await page.waitForTimeout(180);
  }
  await clearClipboard(page);
  const copiedAnalysis = await clickFirstVisible(
    page,
    page.locator("main button").filter({ hasText: /Copy Analysis/i }),
  );
  await page.waitForTimeout(300);
  const analysisClipboard = copiedAnalysis ? await readClipboard(page) : "";
  addResult("OTT Intelligence analysis modes and copy", missingModes.length === 0 && copiedAnalysis && analysisClipboard.length > 10, {
    missingModes,
    clipboardCharacters: analysisClipboard.length,
    screenshot: await screenshot(page, "ott-intelligence-functional"),
  });

  text = await goToTab(page, "Xaman Activation", 700);
  addResult(
    "Xaman Activation safety guidance",
    /self.?custody/i.test(text) && /private key|seed phrase/i.test(text),
    { screenshot: await screenshot(page, "xaman-activation-functional") },
  );

  const sourceTagPayload = await postJson(page, `${BASE_URL}/api/ott`, {
    action: "xaman.createMakeWavesPayload",
    actionId: "source-tag-proof",
  });
  addResult(
    "Xaman SourceTag proof payload creation",
    sourceTagPayload.status === 200 &&
      sourceTagPayload.json?.ok === true &&
      Boolean(
        sourceTagPayload.json?.payload?.next?.always ||
          sourceTagPayload.json?.payload?.next?.no_push_msg_received,
      ),
    { httpStatus: sourceTagPayload.status },
  );

  const dailyPayload = await postJson(page, `${BASE_URL}/api/ott`, {
    action: "xaman.createMakeWavesPayload",
    actionId: "daily-checkin",
  });
  addResult(
    "Daily Check-In Xaman payload creation",
    dailyPayload.status === 200 &&
      dailyPayload.json?.ok === true &&
      Boolean(
        dailyPayload.json?.payload?.next?.always ||
          dailyPayload.json?.payload?.next?.no_push_msg_received,
      ),
    { httpStatus: dailyPayload.status },
  );

  text = await goToTab(page, "SourceTag", 700);
  addResult("SourceTag page identity", text.includes("2606170002") && /Make Waves/i.test(text), {
    screenshot: await screenshot(page, "sourcetag-functional"),
  });

  text = await goToTab(page, "Roadmap & Vote", 700);
  const localVotingOnly = /Local votes/i.test(text) || /Voting is local/i.test(text);
  addResult("Roadmap voting state", true, {
    status: localVotingOnly ? "KNOWN_GAP_LOCAL_ONLY" : "REVIEW",
    note: localVotingOnly
      ? "Voting renders but is still local-browser feedback, not Xaman/on-chain shared voting."
      : "Voting page rendered; exact local/on-chain wording was not detected.",
    screenshot: await screenshot(page, "roadmap-vote-functional"),
  });

  text = await goToTab(page, "Academy", 700);
  const academyButtons = await page.locator("main button").count();
  addResult("Academy catalog and controls", /Academy/i.test(text) && academyButtons > 0, {
    buttons: academyButtons,
    screenshot: await screenshot(page, "academy-functional"),
  });

  text = await goToTab(page, "Access Gate", 700);
  const accessLinks = await page.locator('main a[href*="access-payment"]').count();
  addResult(
    "Access Gate payment, delivery and scanner content",
    /1\.589 XRP/i.test(text) && /scanner|scan/i.test(text) && accessLinks > 0,
    {
      accessPaymentLinks: accessLinks,
      screenshot: await screenshot(page, "access-gate-functional"),
    },
  );

  text = await goToTab(page, "Pitch Mode", 500);
  await clearClipboard(page);
  const copiedPitch = await clickFirstVisible(
    page,
    page.locator("main button").filter({ hasText: /Copy Full Script/i }),
  );
  await page.waitForTimeout(300);
  const pitchClipboard = copiedPitch ? await readClipboard(page) : "";
  addResult("Pitch Mode steps and Copy Full Script", copiedPitch && pitchClipboard.length > 50, {
    clipboardCharacters: pitchClipboard.length,
    screenshot: await screenshot(page, "pitch-mode-functional"),
  });

  text = await goToTab(page, "Submission Pack", 500);
  await clearClipboard(page);
  const submissionCopyButton = page.locator("main button").filter({ hasText: /Copy/i });
  const copiedSubmission = await clickFirstVisible(page, submissionCopyButton);
  await page.waitForTimeout(300);
  const submissionClipboard = copiedSubmission ? await readClipboard(page) : "";
  addResult("Submission Pack copy blocks", copiedSubmission && submissionClipboard.length > 20, {
    clipboardCharacters: submissionClipboard.length,
    screenshot: await screenshot(page, "submission-pack-functional"),
  });

  text = await goToTab(page, "Smoke Test", 500);
  const passButtons = page.getByRole("button", { name: "PASS", exact: true });
  const passButtonCount = await passButtons.count();
  let smokeStateChanged = false;
  if (passButtonCount > 0) {
    await passButtons.first().click();
    await page.waitForTimeout(250);
    const changedText = await mainText(page);
    smokeStateChanged = /1\/17 passed/i.test(changedText) || /6%/.test(changedText);
  }
  addResult("Built-in Smoke Test checklist interaction", passButtonCount >= 17 && smokeStateChanged, {
    passButtons: passButtonCount,
    stateChanged: smokeStateChanged,
    screenshot: await screenshot(page, "smoke-test-functional"),
  });

  await page.goto(`${BASE_URL}/support-donation.html?functional=${runId}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(2_000);
  const totalCollected = await page.locator("#totalXrp").innerText().catch(() => "");
  const paymentCount = await page.locator("#paymentCount").innerText().catch(() => "");
  await page.locator("#supporterName").fill("QA no-consent test");
  await page.locator("#publicMessage").fill("This message must not create a payload without consent.");
  await page.locator('[data-amount="0.589"]').click();
  await page.waitForTimeout(800);
  const supportStatus = await page.locator("#status").innerText().catch(() => "");
  addResult(
    "Support counter and public-message consent validation",
    /XRP/i.test(totalCollected) && Number(paymentCount) >= 1 && /public|permission|confirm|consent/i.test(supportStatus),
    {
      totalCollected,
      paymentCount,
      validationStatus: supportStatus,
      screenshot: await screenshot(page, "support-functional"),
    },
  );

  const accessResponse = await page.goto(`${BASE_URL}/access-payment.html?functional=${runId}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(700);
  const accessPaymentText = await page.locator("body").innerText().catch(() => "");
  addResult(
    "Standalone Access Pass payment page",
    Boolean(accessResponse?.ok()) && /1\.589 XRP/i.test(accessPaymentText) && /Xaman/i.test(accessPaymentText),
    {
      httpStatus: accessResponse?.status() ?? null,
      screenshot: await screenshot(page, "access-payment-functional"),
    },
  );
} catch (error) {
  addResult("Functional smoke runner", false, {
    error: error instanceof Error ? error.stack || error.message : String(error),
  });
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.passed);
const knownGaps = results.filter((result) => result.status === "KNOWN_GAP_LOCAL_ONLY");
const markdown = [
  "# OTT Terminal Functional Smoke Test",
  "",
  `- Run: ${runId}`,
  `- Checks: ${results.length}`,
  `- Passed: ${results.length - failed.length}`,
  `- Failed: ${failed.length}`,
  `- Browser error signals: ${browserSignals.length}`,
  "",
  "## Results",
  "",
  "| Check | Result | Details |",
  "|---|---|---|",
  ...results.map((result) => {
    const details = Object.entries(result)
      .filter(([key]) => !["name", "passed", "screenshot"].includes(key))
      .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
      .join("; ")
      .replaceAll("|", "\\|");
    return `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${details || "—"} |`;
  }),
  "",
  "## Known product gaps",
  "",
  ...(knownGaps.length
    ? knownGaps.map((result) => `- ${result.name}: ${result.note}`)
    : ["- None detected by this run."]),
  "",
  "## Browser error signals",
  "",
  ...(browserSignals.length
    ? browserSignals.map((signal) => `- ${signal.type}: ${signal.message}`)
    : ["- None"]),
  "",
  "## Still requires a human wallet signature",
  "",
  "- Complete Xaman connect and return",
  "- Sign Daily Check-In and confirm XP / OTT Credit",
  "- Scan a real OTT Access Pass holder wallet",
  "- Sign founder NFT mint/send actions with founder credentials",
  "",
].join("\n");

await fs.writeFile(
  path.join(OUTPUT_DIR, "functional-report.json"),
  JSON.stringify({ runId, results, browserSignals }, null, 2),
);
await fs.writeFile(path.join(OUTPUT_DIR, "functional-report.md"), markdown);
console.log(markdown);

if (failed.length > 0 || browserSignals.length > 0) {
  process.exitCode = 1;
}
