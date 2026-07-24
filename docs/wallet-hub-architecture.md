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

## NFT scale

- Genesis Access Pass: #001–#500, preserved as limited founding edition
- Public Access Pass: up to 100,000 serials
- XRPL Foundation Certificate: up to 50,000 serials
- Wallet Foundation Certificate: up to 100,000 serials
- Wallet Security Certificate: up to 100,000 serials
- Wallet Operations Certificate: up to 100,000 serials

Academy credentials are non-transferable in the OTT product model and require verified completion plus validated wallet ownership before issuance.

## Security

- OTT never requests a seed phrase or private key.
- Read-only profiles cannot unlock access or claim ownership.
- Every signing connector must pass a harmless Testnet transaction before being marked live.
- Mainnet transactions retain the Make Waves SourceTag `2606170002` where the product flow requires it.
