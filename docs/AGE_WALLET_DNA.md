# AGE Wallet DNA in OTT

Working release: 10 September 2026. Source branch: codex/age-wallet-dna, based on the restored Terminal source 3f53219. This document describes the implementation; it does not assert Xaman approval or a completed production release.

## Product and boundary

OTT provides a free, standalone read-only Wallet DNA screen on the public portfolio route and in the Xaman xApp. The home page leads with Wallet DNA and retains free lessons and research. AGE is introduced through an in-app explanation. No external AGE launch URL has been verified.

The public implementation does not import AGE's owner service, execution service, vault, credentials, signer or trading runtime. No AGE repository files or live trading processes were changed. No new Vercel API functions are needed. The existing twelve-function hosting footprint is unchanged.

## Acquisition evidence

The scanner reads a validated account snapshot, up to four trustline pages and four transaction-history pages of at most 50 requested rows each. A provider can return fewer rows. Exact currency plus issuer identifies each asset.

The calculation uses validated transaction metadata and actual AccountRoot/RippleState changes, ordered by ledger and transaction index, with duplicate transaction hashes excluded. It recognizes simple XRP-to-one-issued-asset acquisitions in Payment or OfferCreate, including directly attributable purchase fees. Remaining cost uses weighted average when holdings leave the wallet. Transfers, airdrops and complex acquisitions do not establish a purchase cost. Complete available history, an evidenced opening account and reconciled current holdings are required to establish the whole position's cost. Purchases observed in a partial scan remain separately visible as evidence.

The public cluster rejected account_tx API v2 during live verification; the scanner explicitly requests v1 for history and normalizes the nested transaction format. Other requests use v2. History failure leaves acquisition costs unknown while verified holdings remain readable. It never turns missing information into zero.

## Direct order-book estimate

A quote checks current holdings and issuer flags at one newly validated ledger, rejects changed or restricted inventory, and samples up to 100 direct XRP bids. It excludes the wallet's own orders and expired orders, respects the API's funded amounts, consumes available depth and accounts for issuer transfer rates (with issuer redemption exemption) and one estimated network fee.

A whole-position gain/loss is displayed only if the position has an established cost and sampled bids cover it in full. Results are in XRP, timestamped and labelled estimates. AMM paths, later price changes, tax basis, fiat acquisition cost and actual execution are not established by this feature. It does not recommend buying, selling or holding and never promises the best return.

## Interaction and data

Scans and quotes run only after user action, with bounded requests and cancellation. Address or network changes clear old results and cancel pending requests. Xaman supplies the locked selected account/network. Browser users may inspect a public address on an explicitly selected network. Results and xApp lesson progress stay in memory; no DNA scan is persisted or sent to AGE. Public RPC providers receive the requested public address and connection metadata.

## Verification

Run npm run quality for route and xApp boundary checks, dependency audit, arithmetic regression tests, TypeScript and production build. Run the explicitly supplied public-address smoke script for live RPC compatibility. Browser and real-device checks are distinct; a browser preview cannot prove native Xaman account selection, signing-screen behaviour or marketplace approval. No financial transaction is part of these checks.

Tests cover fee-inclusive purchase basis, weighted partial sales, transfers, missing history, reconciliation, issuer collisions, v1/v2 formats, partial-payment metadata, failed transactions, funded and missing depth, expired and self-owned orders, issuer transfer rate, losses and unknown costs. See the final release evidence for actual results and remaining limits.

The release smoke workflow includes Wallet DNA in its 72 desktop/mobile, English/Dutch route checks. Run `node scripts/smoke-age-wallet-dna-ui.mjs` for the focused browser suite. Set `AUDIT_BASE_URL` to the intended deployment, `AUDIT_OUTPUT_DIR` for evidence and optionally `CHROMIUM_PATH` for an installed test browser. A protected candidate can use `AUDIT_ACCESS_FILE`, an untracked JSON file containing a temporary Vercel share URL under `url`; do not commit this file. `AUDIT_REAL_SCAN=1` opts into one read-only scan of a public XRPL documentation address. Default evidence scenarios use explicitly synthetic WebSocket responses, including unknown acquisition costs and insufficient order-book depth. They never create or sign transactions.

## Primary references

- https://xrpl.org/docs/references/http-websocket-apis/public-api-methods/account-methods/account_tx
- https://xrpl.org/docs/references/protocol/transactions/metadata
- https://xrpl.org/docs/concepts/payment-types/partial-payments
- https://xrpl.org/docs/references/http-websocket-apis/public-api-methods/path-and-order-book-methods/book_offers
- https://docs.xaman.dev/environments/xapps-dapps/requirements
