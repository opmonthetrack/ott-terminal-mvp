# XRPL OnTheTrack Terminal — Smoke Test Guide

## Goal

Use this guide before UI/design polish.

The goal is to confirm that the app is functionally stable:

- Vercel deploy is green
- app opens
- main tabs load
- SourceTag is correct
- no blank screens
- no red build/runtime errors
- single API router works

## Correct SourceTag

```txt
2606170002
```

Do not use old values.

## Test Order

Open the live app and test in this order:

```txt
1. Dashboard
2. Daily Check-In
3. Xaman Center
4. XRPL Verify
5. Partner Hub
6. Reward Ledger
7. Truth Desk
8. Access Gate
9. Pitch Mode
10. Submission Pack
11. Smoke Test
```

## What To Check Per Tab

### Dashboard

Expected:

- page loads
- SourceTag visible
- XP / reward summary visible
- no blank screen

### Daily Check-In

Expected:

- action list visible
- Create Xaman Payload button visible
- SourceTag `2606170002` visible

### Xaman Center

Expected:

- Xaman payload actions visible
- SourceTag shown
- no missing export errors

### XRPL Verify

Expected:

- tx hash input visible
- verify button visible
- SourceTag check described

### Partner Hub

Expected:

- partner list visible
- route education visible
- checklist visible
- Proof Stamp section visible

### Reward Ledger

Expected:

- XP events section visible
- mainnet legal lock visible
- no rewardStore crash

### Truth Desk

Expected:

- Ask Truth visible
- 1-on-1 visible
- payment payload section visible
- verify payment section visible

### Access Gate

Expected:

- Banxa route visible
- XRP route visible
- RLUSD route visible
- OTT Access Pass route visible
- payload + verify sections visible for payment routes

### Pitch Mode

Expected:

- 2-minute pitch steps visible
- copy script button visible
- demo checklist visible

### Submission Pack

Expected:

- deliverable checklist visible
- copy blocks visible
- demo recording order visible

### Smoke Test

Expected:

- manual checklist visible
- pass/fail/todo buttons work
- copy report works

## If Vercel Turns Red

Copy or screenshot the exact red error.

Most common fixes:

```txt
Cannot resolve import
```

Means file path or casing is wrong.

```txt
No exported member
```

Means the file exists but does not export the function/type the tab expects.

```txt
is declared but its value is never read
```

Means unused import or unused variable. Remove it.

```txt
No more than 12 Serverless Functions
```

Means old loose API files still exist. Keep only `api/ott.ts`.

## API Check

The project should use only one serverless API router:

```txt
api/ott.ts
```

Old loose API files should be deleted:

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

## Environment Variables

For live Xaman payload creation, Vercel needs:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
```

For destination wallets:

```txt
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

For XRPL RPC:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
```

## Go / No-Go

### Go to UI polish when:

```txt
Vercel is green
Live app opens
Dashboard loads
Partner Hub loads
Truth Desk loads
Access Gate loads
Pitch Mode loads
Submission Pack loads
Smoke Test tab loads
No blank screens
No red errors
SourceTag is 2606170002
```

### No-Go when:

```txt
Any tab is blank
Any import/export error exists
Any SourceTag is wrong
Vercel deploy is red
Old API files still trigger function limit
```

## Report Format

Use this format after testing:

```txt
Build: Green / Red
Live app opens: Yes / No
SourceTag correct: Yes / No

Dashboard: Pass / Fail
Daily Check-In: Pass / Fail
Xaman Center: Pass / Fail
XRPL Verify: Pass / Fail
Partner Hub: Pass / Fail
Reward Ledger: Pass / Fail
Truth Desk: Pass / Fail
Access Gate: Pass / Fail
Pitch Mode: Pass / Fail
Submission Pack: Pass / Fail
Smoke Test: Pass / Fail

Notes:
```

## Next Step After This

After this smoke test is complete, move to:

```txt
UI polish
demo recording
submission link filling
final launch posts
```
