# Remaining Tabs Light Theme Patch

## Purpose

This patch makes older tabs match the new OTT logo-based light palette without rewriting each tab immediately.

It is meant for these remaining sections:

```txt
Proof / Education:
- Partner Hub
- Reward Ledger

Services / Access:
- Truth Desk
- OTT Testnet

Demo / QA:
- Pitch Mode
- Submission Pack
- Smoke Test

Advanced:
- Legacy Dashboard
- Daily Check-In
- Ecosystem
- Validators
- Developer Hub
- Tokenization
- Token Factory
- Profile
- OTT Token
- Reward Policy
- OTT Intelligence
- Launch Control
- AI Hub
- Marketplace
- Newsroom
- DeFi
- Academy
- Ledger Intel
```

## Important

This does not touch:

```txt
api/ott.ts
Xaman payload logic
Xaman return handler
wallet connect
verification logic
environment variables
```

It only changes visual styling through CSS.

## Install

1. Put this file here:

```txt
src/styles/remainingTabsLightOverride.css
```

2. Import it at the bottom of:

```txt
src/index.css
```

Add:

```css
@import "./styles/remainingTabsLightOverride.css";
```

## After This

Then rebuild important tabs one by one with cleaner custom UI:

```txt
1. Partner Hub
2. Reward Ledger
3. Truth Desk
4. OTT Testnet
5. Pitch Mode
6. Submission Pack
7. Smoke Test
```
