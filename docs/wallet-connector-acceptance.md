# Wallet connector acceptance criteria

A connector is marked **Live** only when all checks pass on a controlled test account.

1. Official wallet or protocol source confirmed.
2. Installation or availability detection works.
3. User explicitly approves account sharing or sign-in.
4. Returned value is a valid XRPL classic address.
5. Active network is detected and displayed.
6. Disconnect clears OTT session state.
7. Refresh restores only a valid non-expired session.
8. A harmless Testnet transaction is displayed in full before signing.
9. Rejection and expiry are handled without claiming success.
10. Signed transaction hash is found in a validated ledger.
11. Account in the validated transaction matches the connected account.
12. Mainnet cannot be confused with Testnet or Devnet.
13. No seed phrase, mnemonic or private key enters OTT.
14. Keyboard, mobile and screen-reader interaction pass the release audit.

WalletConnect-based wallets additionally require a configured Reown project ID, pairing URI handling, XRPL namespace validation and mobile deep-link return testing.
