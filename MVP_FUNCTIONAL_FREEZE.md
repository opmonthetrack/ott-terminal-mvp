# XRPL OnTheTrack Terminal — MVP Functional Freeze

## Purpose

This document freezes the current MVP scope before UI/design polish.

From this point, the goal is not to keep adding features. The goal is:

```txt
stabilize → test → fix red errors → review live app → polish UI → record demo → submit
```

## Current MVP Scope

The MVP includes:

```txt
Dashboard
Daily Check-In
SourceTag Monitor
Xaman Center
XRPL Verify
Reward Ledger
OTT Testnet
Partner Hub
Truth Desk
Access Gate
Pitch Mode
Submission Pack
Smoke Test
```

These are enough for a strong hackathon submission.

## Current Backend Scope

The backend is frozen around one router:

```txt
api/ott.ts
```

This router supports:

```txt
Xaman payload creation
Xaman payload verification
XRPL transaction verification
Proof Stamp verification
Truth Desk verification
Access Gate verification
OTT testnet token verification
```

## SourceTag Lock

Do not change:

```txt
2606170002
```

This is the official Make Waves / XRPL OnTheTrack proof identity.

## Feature Freeze Rule

Do not add new major features before UI polish.

Avoid adding:

```txt
new large tabs
new token mechanics
new DeFi execution
mainnet token distribution
custody logic
broker/exchange logic
complex databases
admin panels
```

## Allowed Before UI Polish

Only allow:

```txt
red error fixes
missing import/export fixes
small text corrections
smoke test improvements
documentation corrections
Vercel/env setup fixes
```

## Not Allowed Before UI Polish

Do not do:

```txt
major redesign
new business model routes
new partner system
new NFT minting system
new RLUSD production flow
new token promise logic
```

## Why Freeze Now?

Because the MVP story is already complete:

```txt
User learns
User checks risk
User uses Xaman
User verifies XRPL proof
User gets local XP
User can access service/payment routes
Jury can understand the product
```

## Final MVP Story

```txt
XRPL OnTheTrack Terminal helps users learn first, understand risk, use Xaman safely and verify meaningful XRPL actions with SourceTag 2606170002.
```

## Next Work Order

```txt
1. Confirm Vercel green
2. Run Smoke Test
3. Fix red errors
4. Review live app
5. Collect UI polish notes
6. Polish UI
7. Record demo
8. Submit
```

## Go To UI Polish When

```txt
Vercel green
Live app opens
Smoke Test passes
No blank main tabs
SourceTag correct
No major runtime errors
```

## If New Ideas Come Up

Park them under:

```txt
Post-hackathon roadmap
```

Do not add them to the MVP unless they fix a blocking issue.
