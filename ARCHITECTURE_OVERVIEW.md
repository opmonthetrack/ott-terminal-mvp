# XRPL OnTheTrack Terminal — Architecture Overview

## Purpose

This document explains how the XRPL OnTheTrack Terminal is structured.

The project is built as an education-first XRPL onboarding, partner discovery and proof layer.

Core identity:

```txt
SourceTag: 2606170002
```

## High-Level Architecture

```txt
React / Vite / TypeScript Frontend
        ↓
src/lib client helpers
        ↓
Single Vercel API router
        ↓
api/ott.ts
        ↓
Xaman API + XRPL JSON-RPC
```

## Why One API Router?

Vercel Hobby has a serverless function limit.

To avoid deployment failure, all backend routes are handled by:

```txt
api/ott.ts
```

This prevents the error:

```txt
No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

## Frontend Structure

Main app shell:

```txt
src/App.tsx
```

Main tab files:

```txt
src/tabs/DashboardTab.tsx
src/tabs/DailyCheckInTab.tsx
src/tabs/XamanCenterTab.tsx
src/tabs/XrplVerifyTab.tsx
src/tabs/PartnerHubTab.tsx
src/tabs/TruthDeskTab.tsx
src/tabs/AccessGateTab.tsx
src/tabs/RewardLedgerTab.tsx
src/tabs/OTTTestnetTokenTab.tsx
src/tabs/PitchModeTab.tsx
src/tabs/SubmissionPackTab.tsx
src/tabs/SmokeTestTab.tsx
```

## Core Library Files

```txt
src/lib/makeWaves.ts
```

Contains:

```txt
MAKE_WAVES_SOURCE_TAG = 2606170002
MAKE_WAVES_ACTIONS
XP values
memo helpers
SourceTag helpers
```

```txt
src/lib/xamanClient.ts
```

Frontend client for:

```txt
xaman.createMakeWavesPayload
xaman.verifyMakeWavesPayload
```

```txt
src/lib/xrplClient.ts
```

Frontend client for:

```txt
xrpl.verifyTransaction
```

```txt
src/lib/rewardStore.ts
```

Local browser ledger for:

```txt
XP
Reward events
Proof Stamp rewards
Testnet token simulation
Mainnet legal lock events
```

```txt
src/lib/partnerCatalog.ts
```

Education-first partner routes and risk notes.

```txt
src/lib/proofStampClient.ts
src/lib/proofStampVerifyClient.ts
```

Client helpers for:

```txt
Proof Stamp payload creation
Proof Stamp tx verification
```

```txt
src/lib/truthDeskClient.ts
src/lib/truthDeskVerifyClient.ts
```

Client helpers for:

```txt
Ask Truth payment payload
1-on-1 payment payload
Truth Desk tx verification
```

```txt
src/lib/accessStore.ts
src/lib/accessClient.ts
```

Client helpers for:

```txt
Access Gate routes
Access payment payload
Access payment verification
Local access state
```

```txt
src/lib/ottTokenClient.ts
src/lib/ottTokenVerifyClient.ts
```

Client helpers for:

```txt
OTT testnet trustline
OTT testnet token payment
Token payment verification
```

## API Router

Main backend file:

```txt
api/ott.ts
```

The frontend sends a POST request to:

```txt
/api/ott
```

With an `action` value.

Example:

```json
{
  "action": "xaman.createAccessPaymentPayload",
  "routeId": "xrp-payment"
}
```

## Supported API Actions

### Xaman Actions

```txt
xaman.createMakeWavesPayload
xaman.verifyMakeWavesPayload
xaman.createTrustlinePayload
xaman.createTokenPaymentPayload
xaman.createProofStampPayload
xaman.createTruthDeskPayload
xaman.createAccessPaymentPayload
```

### XRPL Verify Actions

```txt
xrpl.verifyTransaction
xrpl.verifyTokenPayment
xrpl.verifyProofStamp
xrpl.verifyTruthDeskPayment
xrpl.verifyAccessPayment
```

## SourceTag Strategy

The app uses:

```txt
2606170002
```

This SourceTag is used for meaningful proof flows.

The strategy:

```txt
Reading/clicking = off-chain local XP
Meaningful completion = optional XRPL Proof Stamp
Payments/services/access = Xaman payload + XRPL tx verification
```

This avoids unnecessary ledger spam.

## Proof Flow

Typical proof route:

```txt
1. User reads education route
2. User checks risk notes
3. User creates Xaman payload
4. User signs transaction
5. User pastes tx hash
6. App verifies:
   - validated
   - tesSUCCESS
   - SourceTag 2606170002
   - memo content
   - amount
   - destination
7. App records local XP / access state
```

## Legal-Safe Boundaries

The Terminal does not:

```txt
custody funds
act as broker
provide yield
execute trades
promise token value
promise investment returns
```

It does:

```txt
explain routes
show risk awareness
link to official providers
create Xaman payloads
verify XRPL proof
track local XP
```

## Data Storage

The MVP uses local browser storage for:

```txt
Reward Ledger
Access Gate state
Partner route progress
XP events
```

This is MVP-safe and simple.

Future version can add:

```txt
database
user profile sync
partner admin dashboard
public proof explorer
```

## Environment Variables

Required:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
```

Recommended:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
```

Destination wallets:

```txt
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

## Main Risk Areas

```txt
Wrong SourceTag
Old API files still present
Missing Vercel env variables
Invalid destination wallets
Import/export mismatch
Unused imports blocking TypeScript build
```

## Final Architecture Goal

The goal is a simple, judge-readable MVP:

```txt
Frontend tabs explain the routes.
Client helpers send actions to /api/ott.
api/ott talks to Xaman and XRPL.
SourceTag 2606170002 ties proof together.
Reward Ledger stores local education progress.
```

## Next Architecture Improvements

After UI polish:

```txt
database-backed profiles
partner admin management
public proof explorer
NFT Access Pass ownership verification
RLUSD issued-currency access route
xApp packaging
multi-language content
```
