# XRPL OnTheTrack Terminal — Pre-UI Polish Task Queue

## Current Rule

Do not start UI/design polish yet.

First finish:

```txt
1. Build green
2. Live app opens
3. Smoke Test passes
4. Main tabs load
5. SourceTag correct
6. API router stable
```

## Phase 1 — Upload / Sync

Confirm these latest files are uploaded:

```txt
src/App.tsx
src/tabs/SmokeTestTab.tsx
src/tabs/AccessGateTab.tsx
src/tabs/PitchModeTab.tsx
src/tabs/SubmissionPackTab.tsx

src/lib/accessStore.ts
src/lib/accessClient.ts

api/ott.ts
```

## Phase 2 — Vercel Green Check

Check Vercel deploy.

If red, fix in this order:

```txt
1. Missing import
2. Missing export
3. Unused import
4. Wrong path/casing
5. Old API files still active
6. Env variable issue
```

Do not continue to UI until green.

## Phase 3 — Live App Smoke Test

Open the live app and check:

```txt
Dashboard
Partner Hub
Truth Desk
Access Gate
Pitch Mode
Submission Pack
Smoke Test
Reward Ledger
```

Minimum pass:

```txt
No blank screens
No crash
No red console error
SourceTag shows 2606170002
```

## Phase 4 — API Smoke Test

Check that frontend calls go to:

```txt
/api/ott
```

Important actions:

```txt
xaman.createMakeWavesPayload
xaman.createProofStampPayload
xaman.createTruthDeskPayload
xaman.createAccessPaymentPayload
xrpl.verifyTransaction
xrpl.verifyProofStamp
xrpl.verifyTruthDeskPayment
xrpl.verifyAccessPayment
```

## Phase 5 — Env Setup

Vercel should have:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
XRPL_RPC_URL
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

If wallet env vars are missing, payload creation can fail even if build is green.

## Phase 6 — Functional Demo Route

The final working MVP route should be:

```txt
Dashboard
→ Partner Hub
→ Proof Stamp
→ XRPL Verify
→ Reward Ledger
→ Truth Desk
→ Access Gate
→ Pitch Mode
→ Submission Pack
```

## Phase 7 — UI Polish Backlog

Only after smoke test passes:

```txt
1. Sidebar grouping
2. Dashboard hero clarity
3. Partner Hub card readability
4. Truth Desk form polish
5. Access Gate route polish
6. Reward Ledger event readability
7. Pitch Mode presentation polish
8. Mobile responsiveness
9. Branding: black/white + optional gold/silver
10. Final screenshots for submission
```

## Phase 8 — Demo Recording

Record 2 minutes:

```txt
0:00 Dashboard
0:20 Partner Hub
0:45 Proof Stamp / XRPL Verify
1:10 Reward Ledger
1:30 Truth Desk / Access Gate
1:50 Pitch Mode close
```

## Phase 9 — Submission Package

Fill final links:

```txt
Live App:
GitHub Repo:
Demo Video:
Pitch Deck:
Contact:
X / Twitter:
Telegram / Discord:
```

## Go / No-Go

### Go

```txt
Vercel green
Live app opens
Smoke Test passes
No blank tabs
SourceTag 2606170002
api/ott.ts active
```

### No-Go

```txt
Red build
Blank tab
Wrong SourceTag
Function limit error
Missing env vars
Payload routes broken
```

## Immediate Next Best Step

```txt
Open Vercel.
Confirm green deploy.
Open live app.
Run Smoke Test tab.
Send screenshot only if red.
```
