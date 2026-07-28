# OTT XRPL Wallet Hub

## Product rule

An XRPL account is the public ledger identity. A wallet is one possible signing interface for that account. OTT keeps these concepts separate.

## Connection levels

1. **Live signed connector** — ownership or provider access is verified through an official signing/provider flow.
2. **Read-only profile** — any valid classic address can be inspected, but ownership is never claimed.
3. **Registry and education** — a wallet is documented before its connector is enabled.

## Initial connector order

- Xaman — existing live payload and return verification
- CROSSMARK — official browser SDK sign-in
- GemWallet — official browser provider API
- WalletConnect — shared mobile transport for Joey and compatible wallets
- MetaMask XRPL Snap
- Ledger hardware transport

## Dependency boundary

The first provider-neutral build pins the official packages through `package.json` and the committed npm lockfile:

- `@crossmarkio/sdk` — browser-extension sign-in and transaction approval
- `@gemwallet/api` — installation, address and network provider methods

WalletConnect is intentionally not installed until OTT has a Reown project ID and a controlled XRPL namespace test. MetaMask Snap and Ledger are also kept out of the production bundle until their isolated connector review is complete.

## Wallet profile

The common profile reads validated public XRPL data:

- XRP balance
- sequence and owner count
- trustlines and non-zero token balances
- NFTs
- offers and escrows
- signer lists
- payment channels
- checks and deposit preauthorization
- account domain and flags

## Public wallet testing release gate

A user receives a one-time, account-bound ledger challenge. The challenge binds the authenticated OTT account, selected provider, connected classic address, destination, exact amount, Make Waves SourceTag and memo. A copied transaction hash cannot complete another user's challenge.

The user test reaches 100% only after the transaction is validated with `tesSUCCESS` and every expected ledger field matches. The public provider percentage combines the technical connector gate with unique validated community tests. A Wallet Tester Pass can be reserved only when both the user's test and the provider certification equal 100%.

The percentage is evidence-based and must not be described as AI certainty. AI may summarize verified results, but database constraints and ledger validation determine certification and NFT eligibility.

## Audit semantics

The shell owns the single document `<main>` landmark. Individual tabs use content containers and sections inside that landmark. The Roadmap tab was corrected after the strict 68-screen audit detected a nested main landmark; its replacement passed the normal route, TypeScript and production-build gate before commit.

## NFT scale

- Genesis Access Pass: #001–#500, preserved as limited founding edition
- Public Access Pass: up to 100,000 serials
- Wallet Tester Pass: up to 100,000 serials, gated by a validated wallet integration test
- XRPL Foundation Certificate: up to 50,000 serials
- Wallet Foundation Certificate: up to 100,000 serials
- Wallet Security Certificate: up to 100,000 serials
- Wallet Operations Certificate: up to 100,000 serials

Academy credentials are non-transferable in the OTT product model and require verified completion plus validated wallet ownership before issuance. A database reservation or button click is not an on-ledger NFT mint; issuance still requires an issuer transaction, validated hash and recorded NFTokenID.

## Hardened support payment contract

The public support page and server use one shared contract:

- only `0.589`, `1.589` and `2.589` XRP are accepted;
- the support destination is returned by the server and is not hardcoded in the visible page;
- every payment includes Make Waves SourceTag `2606170002` and the OTT support memo;
- a returned Xaman signature is not presented as a completed payment until the XRPL transaction has `validated = true`, `tesSUCCESS`, the exact destination, an allowed amount and the required SourceTag and memo;
- the public total counts the same strict transaction contract;
- the ledger scan reports when its 1,000-transaction window is incomplete;
- public supporter names are not republished automatically and require their transaction hash to be included in the server-side reviewed allowlist;
- support-stat scans use a short server cache and payload creation has an instance-level request limit.

The request limit is an initial abuse-control layer for the Vercel serverless instance. A distributed rate limiter should be added before high-volume traffic is expected.

## Security

- OTT never requests a seed phrase or private key.
- Read-only profiles cannot unlock access or claim ownership.
- Every signing connector must pass a harmless Testnet transaction before being marked live.
- Mainnet transactions retain the Make Waves SourceTag `2606170002` where the product flow requires it.
