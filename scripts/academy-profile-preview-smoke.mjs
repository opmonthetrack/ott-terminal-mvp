import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");
const TEST_WALLET = "rsEHpJiExneayjkrQdeQEveUwabmmPbksq";
const outputDir = path.resolve("artifacts/academy-profile-preview");
await fs.mkdir(outputDir, { recursive: true });

if (!BASE_URL) {
  throw new Error("BASE_URL is required.");
}

const results = [];
const errors = [];
const add = (name, passed, details = {}) => results.push({ name, passed, ...details });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  serviceWorkers: "block",
});
const page = await context.newPage();

page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error" && !/favicon|ResizeObserver|ERR_ABORTED/i.test(message.text())) {
    errors.push(`console: ${message.text()}`);
  }
});

async function waitForModule() {
  await page.waitForTimeout(400);
  await page.getByText(/Loading terminal module/i).waitFor({ state: "hidden", timeout: 12_000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function openNav(label) {
  await page.locator("aside details").evaluateAll((items) => items.forEach((item) => { item.open = true; }));
  const button = page.locator("aside nav button").filter({ has: page.getByText(label, { exact: true }) }).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await waitForModule();
}

try {
  await page.goto(`${BASE_URL}/?founder=1`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await waitForModule();
  add("Preview home loads", (await page.locator("body").innerText()).includes("XRPL OnTheTrack Terminal"));

  await page.evaluate((walletAddress) => {
    const now = Date.now();
    localStorage.setItem(
      "ott-terminal-wallet-session-v1",
      JSON.stringify({
        walletAddress,
        verifiedAt: now,
        expiresAt: now + 7 * 24 * 60 * 60 * 1000,
        method: "xaman",
      }),
    );
  }, TEST_WALLET);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForModule();
  const restoredText = await page.locator("body").innerText();
  add("Wallet session restores after refresh", restoredText.includes(TEST_WALLET) || restoredText.includes("Connected"));

  const enButton = page.locator("aside").getByRole("button", { name: "EN", exact: true });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  await openNav("Wallet & Profile");
  const walletText = await page.locator("main").innerText();
  add(
    "Wallet Dashboard is customer profile center",
    walletText.includes("Verified Customer Command Center") &&
      walletText.includes("My Profile") &&
      walletText.includes("Academy Progress"),
  );
  await page.screenshot({ path: path.join(outputDir, "wallet-profile.png"), fullPage: false });

  await page.getByRole("button", { name: "My Profile", exact: true }).click();
  await page.getByPlaceholder("XRPL Learner").fill("Preview Learner");
  await page.getByPlaceholder("on_the_track").fill("preview_learner");
  await page.getByPlaceholder(/What are you learning/i).fill("Learning XRPL safely with AI-verified Academy modules.");
  await page.getByRole("button", { name: /Save Private Profile/i }).click();
  await page.waitForTimeout(300);
  const savedProfileText = await page.locator("main").innerText();
  add("Optional private profile saves", savedProfileText.includes("Profile saved locally"));

  await openNav("Academy");
  const academyText = await page.locator("main").innerText();
  add(
    "Professional AI Academy renders",
    academyText.includes("AI Assessment") &&
      academyText.includes("Pass every answer") &&
      academyText.includes("No self-verification"),
  );

  await page.getByRole("button", { name: /Assessment Room/i }).click();
  await page.waitForTimeout(300);
  const textareas = page.locator("main textarea");
  const textareaCount = await textareas.count();
  const maxLengths = await textareas.evaluateAll((items) => items.map((item) => item.maxLength));
  add("Every module uses three typed answers", textareaCount === 3, { textareaCount });
  add("Answers are capped at 200 characters", maxLengths.every((value) => value === 200), { maxLengths });

  await textareas.nth(0).fill("Too short");
  await textareas.nth(1).fill("Too short");
  await textareas.nth(2).fill("Too short");
  await page.getByRole("button", { name: /AI Check & Complete/i }).click();
  await page.waitForTimeout(300);
  const blockedText = await page.locator("main").innerText();
  add("Incomplete answers block module completion", blockedText.includes("Answer every task with a meaningful explanation"));

  const apiResult = await page.evaluate(async ({ baseUrl, walletAddress }) => {
    const response = await fetch(`${baseUrl}/api/academy-assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: "blockchain-crypto-basics",
        language: "en",
        walletAddress,
        answers: [
          {
            taskId: "task-1",
            answer: "A ledger is a shared record of account balances and validated transactions that participants can independently verify.",
          },
          {
            taskId: "task-2",
            answer: "Seed loss, phishing links, and sending an irreversible transaction to the wrong destination are three major wallet risks.",
          },
          {
            taskId: "task-3",
            answer: "Signing authorizes an action from a self-custody wallet, so the destination, amount, memo and risk must be understood first.",
          },
        ],
      }),
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: response.status, ok: response.ok, json, text: text.slice(0, 800) };
  }, { baseUrl: BASE_URL, walletAddress: TEST_WALLET });
  add(
    "AI Academy endpoint executes",
    apiResult.status === 200 && apiResult.json?.ok === true && apiResult.json?.mode === "ai" && apiResult.json?.assessments?.length === 3,
    { status: apiResult.status, response: apiResult.json ?? apiResult.text },
  );

  await page.screenshot({ path: path.join(outputDir, "academy-assessment.png"), fullPage: false });

  await openNav("Wallet & Profile");
  await page.getByRole("button", { name: /Disconnect/i }).click();
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForModule();
  const disconnectedText = await page.locator("body").innerText();
  const storedSession = await page.evaluate(() => localStorage.getItem("ott-terminal-wallet-session-v1"));
  add("Disconnect clears persistent session", storedSession === null && disconnectedText.includes("Guest"));
} catch (error) {
  errors.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  await browser.close();
}

const failed = results.filter((item) => !item.passed);
const report = { baseUrl: BASE_URL, results, errors, failed: failed.length };
await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(
  path.join(outputDir, "report.md"),
  [
    "# Academy / Profile Preview Smoke Test",
    "",
    `- URL: ${BASE_URL}`,
    `- Checks: ${results.length}`,
    `- Passed: ${results.length - failed.length}`,
    `- Failed: ${failed.length}`,
    `- Browser errors: ${errors.length}`,
    "",
    ...results.map((item) => `- ${item.passed ? "PASS" : "FAIL"} — ${item.name}`),
    "",
    ...(errors.length ? errors.map((item) => `- ERROR — ${item}`) : ["- No browser errors"]),
  ].join("\n"),
);

console.log(JSON.stringify(report, null, 2));
if (failed.length || errors.length) process.exitCode = 1;
