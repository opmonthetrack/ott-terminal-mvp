# XRPL OnTheTrack Terminal — Repo File Index

## Purpose

This file is the central index for the project repository.

Use it to quickly see which files belong to the MVP, which files are documentation, and which files are only for testing/submission.

## MVP Status

```txt
MVP scope: frozen
Current phase: smoke test / live app review before UI polish
SourceTag: 2606170002
```

## Main App Files

```txt
src/App.tsx
```

Main app shell and sidebar routing.

```txt
src/main.tsx
src/index.css
```

Vite/React entry and global styling.

## Main Tab Files

```txt
src/tabs/DashboardTab.tsx
src/tabs/DailyCheckInTab.tsx
src/tabs/SourceTagMonitorTab.tsx
src/tabs/XamanCenterTab.tsx
src/tabs/XrplVerifyTab.tsx
src/tabs/RewardLedgerTab.tsx
src/tabs/OTTTestnetTokenTab.tsx
src/tabs/PartnerHubTab.tsx
src/tabs/TruthDeskTab.tsx
src/tabs/AccessGateTab.tsx
src/tabs/PitchModeTab.tsx
src/tabs/SubmissionPackTab.tsx
src/tabs/SmokeTestTab.tsx
```

## Supporting Existing Tabs

Depending on the original project, these may also exist:

```txt
src/tabs/NetworkState.tsx
src/tabs/WalletTab.tsx
src/tabs/PortfolioTab.tsx
src/tabs/EcosystemTab.tsx
src/tabs/ValidatorTab.tsx
src/tabs/DeveloperHubTab.tsx
src/tabs/TokenizationTab.tsx
src/tabs/TokenFactory.tsx
src/tabs/ProfileTab.tsx
src/tabs/OTTTokenCenterTab.tsx
src/tabs/OTTRewardPolicyTab.tsx
src/tabs/OTTIntelligence.tsx
src/tabs/LaunchControlTab.tsx
src/tabs/AIHubTab.tsx
src/tabs/MarketplaceTab.tsx
src/tabs/NewsTab.tsx
src/tabs/DeFiTab.tsx
src/tabs/AcademyTab.tsx
src/tabs/LedgerIntelTab.tsx
```

## Core Library Files

```txt
src/lib/makeWaves.ts
```

Contains the official SourceTag and action definitions.

```txt
src/lib/xamanClient.ts
src/lib/xrplClient.ts
```

Xaman and XRPL client helpers.

```txt
src/lib/rewardStore.ts
```

Local XP and reward ledger.

```txt
src/lib/partnerCatalog.ts
```

Partner Hub education catalog.

```txt
src/lib/proofStampClient.ts
src/lib/proofStampVerifyClient.ts
```

Proof Stamp payload and verification helpers.

```txt
src/lib/truthDeskClient.ts
src/lib/truthDeskVerifyClient.ts
```

Truth Desk payload and verification helpers.

```txt
src/lib/accessStore.ts
src/lib/accessClient.ts
```

Access Gate local state, payload and verification helpers.

```txt
src/lib/ottTokenClient.ts
src/lib/ottTokenVerifyClient.ts
```

OTT testnet token payload and verification helpers.

## Backend

Use one Vercel serverless API router:

```txt
api/ott.ts
```

Do not keep old loose API files.

## Backend Actions

The frontend sends POST requests to:

```txt
/api/ott
```

With action names like:

```txt
xaman.createMakeWavesPayload
xaman.verifyMakeWavesPayload
xaman.createProofStampPayload
xaman.createTruthDeskPayload
xaman.createAccessPaymentPayload
xrpl.verifyTransaction
xrpl.verifyProofStamp
xrpl.verifyTruthDeskPayment
xrpl.verifyAccessPayment
xrpl.verifyTokenPayment
```

## Required Root Documentation

```txt
README.md
.env.example
ARCHITECTURE_OVERVIEW.md
PROJECT_STATUS.md
MVP_FUNCTIONAL_FREEZE.md
NEXT_SESSION_HANDOFF.md
```

## Testing / QA Documentation

```txt
SMOKE_TEST_GUIDE.md
TEST_REPORT_TEMPLATE.md
VERCEL_SETUP_GUIDE.md
KNOWN_ERRORS_QUICK_FIXES.md
PRE_UI_POLISH_TASK_QUEUE.md
LIVE_APP_REVIEW_PLAN.md
FINAL_DEPLOY_CHECKLIST.md
```

## Hackathon / Submission Documentation

```txt
HACKATHON_DEMO_SCRIPT.md
SUBMISSION_FORM_ANSWERS.md
PITCH_DECK_OUTLINE.md
JUDGE_QA.md
LAUNCH_POST_PACK.md
```

## Files To Delete If Still Present

Delete these old API files if they exist:

```txt
api/xaman/create-payload.ts
api/xaman/verify-payload.ts
api/xaman/create-trustline-payload.ts
api/xaman/create-token-payment-payload.ts
api/xaman/create-proof-stamp-payload.ts
api/xaman/create-truth-desk-payload.ts

api/xrpl/verify-transaction.ts
api/xrpl/verify-token-payment.ts
api/xrpl/verify-proof-stamp.ts
api/xrpl/verify-truth-desk-payment.ts
```

## SourceTag Check

Search the repo for:

```txt
2606170002
```

Expected main definition:

```txt
src/lib/makeWaves.ts
```

If another SourceTag appears, check if it is old and replace it.

## Go / No-Go Before UI Polish

Go when:

```txt
Vercel green
Live app opens
Smoke Test tab loads
Main tabs load
SourceTag is 2606170002
No old API function limit
No red import/export errors
```

No-Go when:

```txt
Any main tab blank
Vercel red
Wrong SourceTag
api/ott.ts missing
Old API files still active
```

## Next Practical Step

```txt
Open Vercel → confirm green → open live app → run Smoke Test → collect screenshots only if red.
```
