# Wallet hub test plan

## Automated

- clean `npm ci`
- 17 public route contract
- TypeScript
- production build
- EN/NL desktop/mobile smoke audit
- no duplicate main landmarks or headings
- all wallet buttons have accessible names and 44×44 targets
- read-only profile never reports ownership verified

## Manual controlled tests

- Xaman sign and return
- CROSSMARK sign-in and Testnet transaction
- GemWallet address/network and Testnet transaction
- extension absent, locked, rejected and wrong-network states
- refresh and disconnect session behavior
- Joey and Katz after WalletConnect project configuration
- MetaMask XRPL Snap after isolated security review
- Ledger after hardware transport review
