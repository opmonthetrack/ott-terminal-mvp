import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = new URL(process.env.AUDIT_BASE_URL || 'https://ott-terminal-mvp.vercel.app').origin;
const output = path.resolve(process.env.AUDIT_OUTPUT_DIR || 'artifacts/age-dna-ui');
fs.mkdirSync(output, { recursive: true });
const access = process.env.AUDIT_ACCESS_FILE ? JSON.parse(fs.readFileSync(process.env.AUDIT_ACCESS_FILE, 'utf8')).url : base;
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const checks = [], errors = [];
let storageState;
async function check(name, action) {
  try { const detail = await action(); checks.push({ name, pass: true, detail }); console.log('PASS', name); }
  catch (error) { checks.push({ name, pass: false, error: error.message }); console.log('FAIL', name, error.message); }
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ base, date: new Date().toISOString(), checks, errors }, null, 2));
}
async function session(language = 'en', mobile = false, theme) {
  const context = await browser.newContext({ storageState, viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
  if (!theme) await context.addInitScript(lang => localStorage.setItem('ott-terminal-language-v2', lang), language);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(60000);
  page.on('pageerror', error => errors.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', message: message.text() }); });
  return { context, page };
}
async function visual(page, name, scope = '.age-dna') {
  await page.locator(scope).waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 2, `Horizontal overflow ${overflow}px`);
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
  const axe = await new AxeBuilder({ page }).include(scope).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(axe.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target), detail: v.nodes.map(n => n.failureSummary) })), []);
}
const account = 'r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59';
const issuer = 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B';
// Synthetic RPC evidence for deterministic UI scenarios, never sent to a ledger.
async function fixture(page, mode) {
  await page.addInitScript(({ account, issuer, mode }) => {
    const RealSocket = window.WebSocket;
    window.__dnaCommands = [];
    const ledger = 10001;
    const row = (id, nodes, type = 'OfferCreate', who = account) => ({ validated: true, tx: { hash: String(id).padStart(64, '0'), ledger_index: id, Account: who, TransactionType: type, Fee: '10' }, meta: { TransactionIndex: 0, TransactionResult: 'tesSUCCESS', AffectedNodes: nodes } });
    const history = [row(1, [{ CreatedNode: { LedgerEntryType: 'AccountRoot', NewFields: { Account: account, Balance: '1000000000' } } }], 'Payment', issuer), row(2, [
      { ModifiedNode: { LedgerEntryType: 'AccountRoot', PreviousFields: { Balance: '1000000000' }, FinalFields: { Account: account, Balance: '989999990' } } },
      { ModifiedNode: { LedgerEntryType: 'RippleState', PreviousFields: { Balance: { currency: 'USD', value: '0' } }, FinalFields: { Balance: { currency: 'USD', value: '100' }, LowLimit: { issuer: account, currency: 'USD' }, HighLimit: { issuer, currency: 'USD' } } } },
    ])];
    window.WebSocket = class {
      constructor(url, protocols) {
        if (!String(url).includes('xrplcluster.com')) return new RealSocket(url, protocols);
        this.closed = false; setTimeout(() => { if (!this.closed) this.onopen?.({}); }, 0);
      }
      close() { this.closed = true; }
      send(raw) {
        const request = JSON.parse(raw); window.__dnaCommands.push(request.command);
        const common = { validated: true, ledger_index: ledger };
        let result;
        switch (request.command) {
          case 'account_info': result = { ...common, account_data: { Account: request.account, Balance: '989999990', Flags: 0, TransferRate: 1000000000 } }; break;
          case 'account_lines': result = { ...common, account, lines: [{ currency: 'USD', account: issuer, balance: '100' }] }; break;
          case 'account_tx': result = { validated: true, account, ledger_index_max: ledger, transactions: history, ...(mode === 'partial' ? { marker: { ledger: 2, seq: 1 } } : {}) }; break;
          case 'book_offers': result = { ...common, offers: [{ Account: issuer, TakerGets: mode === 'shallow' ? '10000000' : '20000000', TakerPays: { currency: 'USD', issuer, value: mode === 'shallow' ? '50' : '100' } }] }; break;
          case 'fee': result = { drops: { open_ledger_fee: '10' } }; break;
          case 'ledger': result = { ...common, ledger: { close_time: 800000000 } }; break;
          default: throw new Error('Unexpected command: ' + request.command);
        }
        setTimeout(() => { if (!this.closed) this.onmessage?.({ data: JSON.stringify({ id: request.id, status: 'success', result }) }); }, 5);
      }
    };
  }, { account, issuer, mode });
}
try {
  await check('candidate access and app identity', async () => {
    const context = await browser.newContext(); const page = await context.newPage();
    await page.goto(access, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('main').waitFor({ timeout: 30000 });
    assert.equal(new URL(page.url()).origin, base, 'Unexpected authentication redirect');
    assert.match(await page.title(), /OTT/i);
    storageState = await context.storageState(); await context.close();
  });
  if (!checks[0].pass) throw new Error('Cannot test the intended deployment');

  for (const language of ['en', 'nl']) for (const mobile of [false, true]) {
    await check(`public entry ${language} ${mobile ? 'mobile' : 'desktop'}`, async () => {
      const { page, context } = await session(language, mobile);
      try {
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        const entry = page.getByRole('button', { name: /Open Wallet DNA/i });
        await entry.waitFor(); assert.equal(await page.getByRole('dialog').count(), 0);
        await entry.click(); await page.getByRole('heading', { name: 'Wallet DNA', exact: true }).waitFor();
        await visual(page, `dna-${language}-${mobile ? 'mobile' : 'desktop'}`);
        await page.locator('.dna-form input').fill('invalid');
        await page.locator('.dna-form button').click();
        await page.locator('.dna-error').waitFor();
        assert.match(await page.locator('.dna-error').innerText(), /r-address|walletadres/i);
        await page.locator('.dna-form select').selectOption('testnet'); assert.equal(await page.locator('.dna-error').count(), 0);
      } finally { await context.close(); }
    });
  }
  for (const mode of ['known', 'partial', 'shallow']) await check(`synthetic evidence ${mode}`, async () => {
    const { page, context } = await session('en', true);
    try {
      await fixture(page, mode); await page.goto(base + '/?tab=portfolio', { waitUntil: 'domcontentloaded' });
      await page.locator('.dna-form input').fill(account); await page.locator('.dna-form button').click();
      await page.locator('.dna-summary').waitFor();
      const asset = page.locator('.dna-asset').first();
      assert.match(await asset.locator('.dna-values').innerText(), mode === 'partial' ? /Unknown/ : /10\.00001 XRP/);
      await asset.getByRole('button', { name: 'Check current bids' }).click(); await asset.locator('.dna-quote').waitFor();
      const quote = await asset.locator('.dna-quote').innerText();
      assert.match(quote, mode === 'known' ? /9\.99998 XRP/ : /Not established/);
      if (mode === 'shallow') assert.match(quote, /Insufficient sampled depth/);
      await visual(page, 'dna-synthetic-' + mode);
      const commands = await page.evaluate(() => window.__dnaCommands);
      assert.ok(commands.every(c => ['account_info', 'account_lines', 'account_tx', 'book_offers', 'fee', 'ledger'].includes(c)));
      await page.locator('.dna-form select').selectOption('testnet');
      assert.equal(await page.locator('.dna-summary,.dna-quote').count(), 0);
      return { synthetic: true, commands };
    } finally { await context.close(); }
  });
  if (process.env.AUDIT_REAL_SCAN === '1') await check('real public mainnet evidence', async () => {
    const { page, context } = await session('en', true);
    try {
      await page.goto(base + '/?tab=portfolio', { waitUntil: 'domcontentloaded' });
      await page.locator('.dna-form input').fill(account); await page.locator('.dna-form button').click();
      await page.locator('.dna-summary,.dna-error').first().waitFor({ timeout: 90000 });
      assert.equal(await page.locator('.dna-error').count(), 0, await page.locator('.dna-error').allTextContents());
      const asset = page.locator('.dna-asset').filter({ has: page.locator('button:not([disabled])') }).first();
      await asset.getByRole('button', { name: 'Check current bids' }).click();
      await asset.locator('.dna-quote,.dna-error').first().waitFor({ timeout: 45000 });
      assert.equal(await asset.locator('.dna-error').count(), 0, await asset.locator('.dna-error').allTextContents());
      assert.match(await asset.locator('.dna-quote').innerText(), /Not established/);
      await visual(page, 'dna-real-mainnet');
      return { synthetic: false, summary: await page.locator('.dna-summary').innerText(), quote: await asset.locator('.dna-quote').innerText() };
    } finally { await context.close(); }
  });
  for (const theme of ['light', 'dark']) await check(`xapp ${theme} preview and lesson memory`, async () => {
    const { page, context } = await session('en', true, theme);
    try {
      await page.goto(base + '/?xapp=1&xAppStyle=' + theme, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /AGE Wallet DNA/ }).waitFor();
      assert.match(await page.locator('main').innerText(), /Snapshot unavailable/);
      await page.getByRole('button', { name: /AGE Wallet DNA/ }).click();
      await page.locator('.age-dna').waitFor();
      assert.equal(await page.locator('.dna-form input').getAttribute('readonly'), '');
      assert.equal(await page.locator('.dna-form button').isDisabled(), true);
      await visual(page, 'dna-xapp-' + theme);
      await page.getByRole('button', { name: 'Home', exact: true }).click();
      await page.getByRole('button', { name: /Free lessons/ }).click();
      await page.getByText('What the XRP Ledger records', { exact: true }).click();
      await page.getByRole('button', { name: 'A wallet r-address', exact: true }).click();
      assert.match(await page.locator('main').innerText(), /1\s*\/\s*6/);
      await page.getByRole('button', { name: 'Home', exact: true }).click();
      await page.getByRole('button', { name: /Free lessons/ }).click();
      assert.match(await page.locator('main').innerText(), /1\s*\/\s*6/);
      return { nativeXaman: false, persistedWithinSession: true };
    } finally { await context.close(); }
  });
  await check('public HTTP contracts with candidate access', async () => {
    const context = await browser.newContext({ storageState }); const rows = [];
    const paths = [['/', 200], ['/?xapp=1', 200], ['/privacy.html', 200], ['/terms.html', 200], ['/xapp-support.html', 200], ['/api/ott', 405], ['/api/academy-progress', 401], ['/api/access-payment?scope=status', 401], ['/api/ott', 400, { action: 'xrpl.verifyTransaction', txHash: 'invalid' }], ['/api/support-payment', 200, { action: 'xrpl.getSupportStats' }], ['/api/roadmap-vote', 200, { action: 'xrpl.getRoadmapVoteStats' }]];
    try {
      for (const [pathname, expected, body] of paths) {
        const response = await context.request.fetch(base + pathname, { method: body ? 'POST' : 'GET', ...(body ? { data: body } : {}), timeout: 30000 });
        const content = await response.text();
        assert.equal(new URL(response.url()).origin, base); assert.equal(response.status(), expected, pathname);
        if (pathname.includes('/api/')) { const json = JSON.parse(content); if (expected === 200) assert.notEqual(json.ok, false); }
        else assert.match(content, /OTT|OnTheTrack/i);
        rows.push({ pathname, expected, status: response.status() });
      }
      return rows;
    } finally { await context.close(); }
  });
} finally { await browser.close(); }
const pageErrors = errors.filter(e => e.type === 'pageerror');
await check('no unhandled page exceptions', async () => assert.deepEqual(pageErrors, []));
console.log(JSON.stringify({ checks: checks.length, passed: checks.filter(c => c.pass).length, consoleMessages: errors.length }));
if (checks.some(c => !c.pass)) process.exitCode = 1;
