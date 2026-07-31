# OTT Xaman Safety Companion — review package

Prepared: 31 July 2026  
Publisher draft: OnTheTrack / TruthOnTheTrack  
Public source: <https://github.com/opmonthetrack/ott-terminal-mvp>

This document is the reviewer-facing explanation, qualification matrix and final owner checklist for the Xaman xApp. Do not commit personal KYC records, identity documents or private contact details to this repository; provide those directly to Xaman.

## Submission details

| Field | Value |
| --- | --- |
| Working title | **OTT Xaman Safety Companion** |
| Short description | A read-only XRPL wallet companion with asset, activity, security, destination and transaction checks for the account selected in Xaman. |
| Production launch URL | `https://ott-terminal-mvp.vercel.app/` |
| Browser-only layout preview | `https://ott-terminal-mvp.vercel.app/?xapp=1` |
| Support | `https://ott-terminal-mvp.vercel.app/xapp-support.html` |
| Privacy | `https://ott-terminal-mvp.vercel.app/privacy.html` |
| Terms | `https://ott-terminal-mvp.vercel.app/terms.html` |
| Source | `https://github.com/opmonthetrack/ott-terminal-mvp` |
| Customer support | `info@onthetrack.com` |
| Technical support | `info@onthetrack.com` |

Use the production root URL in the Xaman Developer Console. Xaman supplies the one-time `xAppToken` itself. The `?xapp=1` parameter is only an account-free browser preview and must not replace a real sandbox test.

## Detailed explanation for the reviewer

OTT Xaman Safety Companion is a dedicated, read-only xApp experience. It is not the full OTT browser terminal fitted into Xaman. One source repository and one deployment serve two isolated entry modes:

- a normal browser visit lazy-loads the complete OTT Terminal;
- a Xaman launch with `xAppToken` lazy-loads only the compact Safety Companion and the Xaman SDK integration.

The xApp reads the account and network selected in Xaman, then retrieves public data from the corresponding XRP Ledger network. Its five mobile sections provide an account/reserve overview, trustline and NFT inventory, recent transaction history, a transaction/address scanner and a security/education report. It exposes public issuer, freeze, account-flag, Regular Key, signer-list, tag and ledger evidence without ranking or promoting an asset.

Users can paste or scan a 64-character transaction hash, scan an XRPL address, or use Xaman's native Destination Picker. A matching transaction displays validation status, result, type, amount, fee, sender, destination, source/destination tags, ledger and date. Native Xaman panels are used for QR scanning, destination selection, transaction details, sharing, external links and closing the xApp.

The xApp creates no payload and makes no payment, trustline, offer, token, NFT, credential or signing request. It never asks for a seed phrase, recovery words or private key. Its purpose is expectation setting and evidence checking before the user treats public XRPL information as reliable. Xaman's own signing screen remains the final authority for any transaction created elsewhere.

All external destinations—support, privacy, terms and source—open through Xaman's native `openBrowser` method. Native QR, Destination Picker, transaction details, share and close actions are used where available. The xApp does not use cookies, `localStorage`, `sessionStorage` or polling.

## Initial review answers

These answers map directly to the questions in Xaman's publishing guidance.

### 1. What use case will the app have?

Give Xaman users an account-aware XRPL safety workspace. A user can inspect wallet reserve, assets, trustlines, NFTs, recent activity, security flags, destinations and transaction evidence without granting custody or signing anything.

### 2. Who is the target audience?

Xaman users who want to confirm account context or transaction evidence, including newer XRPL users, support teams, educators and experienced users checking an unfamiliar hash. The utility is asset-neutral and is not limited to holders of an OTT token or NFT.

### 3. Does it use an issued currency?

No. The xApp does not issue, sell, swap, promote or require any issued currency. It can display the public amount field from a transaction supplied by the user, including an issued-asset amount when that is what the ledger transaction contains.

### 4. Is the xApp intended to make a profit?

The xApp itself is free and contains no purchase, fee, subscription, donation, token promotion or feature-unlock flow. OnTheTrack may benefit indirectly from trust and brand awareness. The separately loaded browser terminal can contain other OTT features, but none of those features or purchase routes is exposed by the Xaman entry mode.

### 5–6. Personal or company title?

**Owner confirmation required before submission.** The current draft uses OnTheTrack / TruthOnTheTrack as the accountable publisher. If this is a registered company release, provide the registered legal name, registration details and business contact directly to Xaman. Otherwise submit under the owner's personal title and provide the requested personal details privately to Xaman.

### 7. Has the developer completed KYC?

**Owner action required.** Complete Xaman's developer KYC/wallet verification and privately provide the verified XRP address plus every XRP address associated with the xApp. Never place identity documents or private KYC evidence in the public repository.

### 8. Can Xaman revoke access at any time?

**Owner acknowledgement required.** The accountable publisher must personally confirm understanding and acceptance of this condition during submission.

### 9. Working title and description

**Title:** OTT Xaman Safety Companion  
**Description:** A read-only XRPL wallet companion with asset, activity, security, destination and transaction checks for the account selected in Xaman. No custody and no signing requests.

## Qualification matrix

Status meanings: **PASS** is backed by code or a live platform audit; **LIVE TEST** needs a real Xaman sandbox/device result; **OWNER** requires personal or legal action that cannot be completed from source code.

| Xaman requirement | Evidence | Status |
| --- | --- | --- |
| Value to a significant share of users | Wallet reserve, asset inventory, activity, address/tag and transaction verification are general XRPL safety utilities. | **PASS** |
| Clear first screen and instructions | First screen identifies the selected network, wallet balance, estimated reserve and explicit read-only boundary. | **PASS** |
| Protect users from dangerous mistakes | No payload creation; secret warnings; issuer/freeze/flag visibility; destination-tag detection; transaction/account comparison. | **PASS** |
| Say what it does and do what it says | Static xApp audit checks required claims and forbids signing/payment/gating modules in the xApp boundary. | **PASS** |
| Public and maintained source | Public GitHub repository; xApp code, audits, CI and dependency overrides are versioned together. | **PASS** |
| Accountable, non-anonymous developer | Publisher identity and KYC must be supplied directly to Xaman; in-app owner/support identity is visible. | **OWNER** |
| Customer and technical support | Dedicated bilingual page, separate email subjects, in-app support button and secret-sharing warning. | **PASS** |
| No speculation or token-purchase pressure | xApp has no token purchase, swap, price, yield, donation or NFT-unlock route. | **PASS** |
| Clearly third-party | Header states “Independent xApp by OnTheTrack · not operated by Xaman.” | **PASS** |
| Tailored to Xaman, not a normal website | `xAppToken` selects a separate lazy-loaded component; full web app and xApp bundles are isolated. | **PASS** |
| Xaman account/network integration | Uses Xaman SDK environment, selected account/network, QR, Destination Picker, transaction details and share actions. | **LIVE TEST** |
| External links use native browser | Support, privacy, terms and source use `xapp.openBrowser`; no `window.open`. | **LIVE TEST** |
| Reliable storage rule | xApp stores no user data in cookies, local storage or session storage. | **PASS** |
| No polling | No `setInterval`; XRPL reads use bounded WebSocket requests and Xaman context is initialized once. | **PASS** |
| Accessible text and controls | 16 px standard body/input text, at least 40 px touch targets (primary controls 48 px), labels, live regions, contrast themes and reduced-motion handling. | **PASS** |
| Device sizes and scrolling | Responsive layouts exist for 620 px and 420 px widths. Physical iOS/Android testing remains required. | **LIVE TEST** |
| Xaman themes | Light, dark, moonlight and royal theme values are implemented from `xAppStyle`. | **LIVE TEST** |
| Transparent initial background | Inline HTML boot style is transparent before application CSS loads. | **PASS** |
| Support, terms and privacy | All three public URLs are present in the xApp and route audit. | **PASS** |
| App Store rule / no NFT gating | The xApp may display a public NFT count but never unlocks or gates a feature based on NFT ownership. | **PASS** |
| Dependency review | Automated audit blocks moderate/high/critical advisories; current result is 0 critical, 0 high and 0 moderate. | **PASS** |
| KYC and verified associated addresses | Must be completed and provided by the accountable owner. | **OWNER** |
| Tested duration and tester count | Record real sandbox sessions and tester/device totals below. | **LIVE TEST** |

## Technical review map

| File | Reviewer purpose |
| --- | --- |
| `src/main.tsx` | Chooses the isolated web or Xaman lazy-loaded entry mode. |
| `src/xapp/XamanXapp.tsx` | Dedicated read-only xApp UI and user protections. |
| `src/xapp/xaman-xapp.css` | Responsive themes, contrast, fonts and touch targets. |
| `src/lib/xamanXappRuntime.ts` | One-time Xaman token initialization and native bridge methods. |
| `src/lib/xrplWalletProfile.ts` | Bounded public XRPL WebSocket reads for wallet and transaction evidence. |
| `src/lib/xamanXappRuntime.ts` | Initializes the native bridge with the registered public Xaman application identifier; never contains the API secret. |
| `public/xapp-support.html` | Customer/technical support and safe reporting instructions. |
| `scripts/audit-xaman-xapp.mjs` | Automated review-boundary regression checks. |
| `.github/workflows/platform-quality.yml` | Reproducible CI for routes, xApp rules, dependencies, TypeScript and production build. |

## Reviewer test flow

1. Launch the production root URL as a sandbox xApp with a real one-time token.
2. Confirm the first screen identifies OnTheTrack as an independent third party and promises no signing.
3. Confirm the account and network match the account currently selected in Xaman.
4. Confirm the public wallet snapshot loads or returns a clear network/account error.
5. Open Assets and compare trustlines, freeze flags and NFTs with an independent explorer.
6. Open Activity and confirm recent transaction types, direction and result; open one in Xaman's native details panel.
7. Paste and scan a known transaction hash and verify the decoded result against an independent explorer.
8. Use Destination Picker for an address with and without a required destination tag, then scan an address QR.
9. Review AccountRoot flags, Regular Key, signer-list counts and all five safety lessons.
10. Test invalid/cross-network evidence, Share, support/privacy/terms/source, Close, scrolling, rotation, text scaling and every theme.
11. Confirm a normal browser visit still opens the full OTT Terminal, while a Xaman launch never exposes full-terminal tabs.

## Sandbox test record

Fill this with actual evidence before final review.

| Date | Xaman version | Device / OS | Theme | Network | Checks run | Result / issue |
| --- | --- | --- | --- | --- | --- | --- |
| _pending_ | _pending_ | _pending_ | Light | Mainnet | Launch, account, snapshot, hash, QR, links, close | _pending_ |
| _pending_ | _pending_ | _pending_ | Dark | Testnet | Launch, account, empty/error states, scrolling | _pending_ |
| _pending_ | _pending_ | _pending_ | Moonlight / Royal | Mainnet | Contrast, text scaling, rotation | _pending_ |

Testing period: **_pending_**  
Number of testers: **_pending_**  
Number of distinct devices: **_pending_**  
All blocking defects resolved: **_pending_**

## Platform assurance notes

- Production build, TypeScript, public-route audit and xApp boundary audit pass locally.
- The dependency gate reports 0 critical, 0 high and 0 moderate advisories. Nine low advisories remain in the existing Crossmark/XRPL dependency chain used by the separate browser terminal; upstream offers no complete fix. Crossmark is not imported by the xApp entry mode.
- The live Supabase project is healthy and all 10 public tables have RLS enabled.
- Public execution rights were removed from two internal `SECURITY DEFINER` trigger helpers, clearing those security advisories.
- Owner RLS policies were optimized without changing ownership semantics, and the missing foreign-key index was added.
- Supabase still reports leaked-password protection as unavailable/disabled. The project is on the Free plan; Supabase documents this feature as Pro-plan-and-above. This is a platform account hardening option, not an xApp data path—the xApp itself does not use Supabase authentication.

## Final owner checklist

- [ ] Confirm whether the publisher is a registered company or a personal title.
- [ ] Complete Xaman developer KYC and wallet verification.
- [ ] Send verified owner and associated xApp XRP addresses privately to Xaman.
- [ ] Personally acknowledge Xaman's right to revoke xApp access.
- [ ] Configure the Xaman Developer Console launch URL as the production root URL.
- [ ] Confirm the public Xaman application identifier in the client belongs to that same xApp registration.
- [ ] Add sandbox tester Device UUIDs and run the complete device/theme test record.
- [ ] Record testing duration and tester count truthfully.
- [ ] Merge/deploy the reviewed source commit and verify every public URL.
- [ ] Submit this explanation plus the exact public commit/repository URL for final review.

Do not claim public listing, endorsement or approval while the xApp is sandboxed or under review. Approval of a direct public xApp URL does not guarantee placement in Xaman's featured xApps list.
