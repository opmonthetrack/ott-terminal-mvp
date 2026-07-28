# OTT Terminal — Technical Smoke Test V4

This checklist converts external product feedback into release gates. A test may only be marked **PASS** when the expected result was observed. A green build alone is not proof of a working wallet, payment, vote or NFT lifecycle.

## 1. Public routing and refresh

- Open each of the eight public hubs: Home, Learn, Explore, XRPL Tools, Profile & Wallet, Progress, Access & Credentials and Community.
- Open every documented `?tab=` subroute directly in a new browser tab.
- Refresh each direct route manually.
- Use browser back and forward repeatedly.
- Confirm that invalid `?tab=` values return safely to Home.
- Confirm that no `#` hash router is required; OTT uses query routing.
- Confirm that Vercel rewrites keep `/`, public legal files and API routes available after refresh.

Expected: no 404, blank route, duplicated page or silent reset after refresh.

## 2. Xaman desktop and mobile

### Desktop QR

- Create one Xaman SignIn request on desktop.
- Scan the QR code with Xaman.
- Approve once and reject once.
- Confirm the approved account is the account returned by the verified payload.
- Refresh the terminal and confirm the verified wallet session is restored.

### Mobile deep-link

- Open OTT from X, WhatsApp or a mobile browser on a phone with Xaman installed.
- Create the same request and use the same-device signing link.
- Return from Xaman to the correct OTT route.
- Test approval, rejection and expiry.
- Confirm the app never asks for a seed phrase or secret.

Expected: QR, deep-link, return route and signer verification work on controlled devices.

## 3. Network boundaries

Current live OTT wallet session networks are XRPL Mainnet, Testnet and Devnet.

- Verify that every signing action states or enforces its intended network.
- Verify that a Testnet action cannot silently become Mainnet.
- Verify that switching a provider network invalidates or refreshes stale account data.
- Verify that wallet address, network and verification method remain visible in diagnostics.
- Do **not** mark Xahau switching as passed. Xahau is not currently a live selectable OTT session network.
- Before adding Xahau, create a separate network identifier, endpoint policy, wallet compatibility matrix and return-flow test.

Expected: no silent cross-network reuse and no unsupported Xahau claim.

## 4. Input validation and resilience

Test search, profile, Academy, wallet, issuer, transaction and simulation inputs with:

- leading and trailing spaces;
- empty values;
- accented characters;
- emoji;
- quotes, apostrophes and backslashes;
- `<script>` and HTML-like text;
- very long values;
- malformed XRPL addresses;
- malformed hashes and UUIDs;
- pasted line breaks;
- rapid repeated submissions.

Expected: friendly validation, no frozen interface, no raw exception, no unescaped executable HTML and no duplicate server action.

## 5. Immediate action feedback

For account, wallet, voting, support, access, issuer and Academy actions:

- show a busy state immediately;
- disable duplicate submission while processing;
- show a success check only after verified success;
- show a clear rejection, expiry or validation error;
- preserve the correct route after external returns;
- support reduced-motion users.

Expected: every action visibly answers “waiting, succeeded, failed or blocked”.

## 6. Mobile layout

Test approximately 360px, 390px, 430px, 768px and desktop widths.

- menus and dialogs stay inside the viewport;
- tables scroll horizontally inside their own area;
- charts, images, videos and iframes scale within their container;
- hashes, wallet addresses and code never force page-wide overflow;
- fixed controls do not hide primary actions;
- touch targets remain at least 44×44 pixels;
- Start Tour can be completed with one hand;
- Xaman return pages remain usable inside an in-app browser.

Expected: no page-wide horizontal scrolling and no unreachable action.

## 7. Typography and OTT brand

- Inter remains the default for paragraphs, learning material, forms and long explanations.
- Orbitron is used only for explicit brand/title treatments.
- Code uses a real monospace font.
- Long headings wrap cleanly on mobile.
- Contrast and focus states remain WCAG-readable.

Expected: futuristic identity without sacrificing reading speed.

## 8. Beginner entry test

Ask a first-time visitor to open OTT without guidance.

Within three seconds they should understand:

1. OTT teaches and verifies XRPL knowledge.
2. A wallet is not required to start learning.
3. Start Tour is the safe first action.
4. Wallet synchronization is only needed for signed or ownership-based actions.

Expected: the visitor can choose Learn, Explore or Initialize Terminal without asking what to click.

## 9. Premium and founder boundary

- A localStorage edit must not unlock Wallet Academy or OTT Intelligence Pro.
- Premium access must come from the authenticated server response.
- Wallet-based rights must require a verified account-wallet link.
- `?founder=1` must not authorize a public/member account.
- Founder and issuer APIs must also require the server allowlist.
- Founder routes must never appear in the eight public hubs.

Expected: public, account, premium and founder are distinct and enforced on both client and server.

## 10. XRPL DEX Intelligence pre-release gate

Before an OTT-rated Top 50 page becomes public:

- define the eligible asset universe and ranking timestamp;
- document every data source;
- separate observed facts from OTT analysis;
- show issuer address and verified identity evidence;
- define liquidity, volume and concentration calculations;
- label missing, conflicting and stale data;
- prevent “safe”, “guaranteed” or investment-return claims;
- provide a correction and review workflow;
- show that a high OTT Rating is not financial advice;
- launch read-only before adding any swap or order-entry function.

Expected: transparent intelligence, not an opaque token leaderboard.
