# XRPL OnTheTrack Terminal — Known Errors & Quick Fixes

Use this file when Vercel or the live app shows a red error.

## 1. Import Path Error

### Error

```txt
Could not resolve "../lib/..."
```

### Meaning

The file is missing or the path/casing is wrong.

### Fix

Check exact path and Linux casing.

Examples:

```txt
src/lib/accessClient.ts
src/lib/accessStore.ts
src/lib/truthDeskClient.ts
src/lib/truthDeskVerifyClient.ts
src/lib/proofStampClient.ts
src/lib/proofStampVerifyClient.ts
```

## 2. Export Error

### Error

```txt
Module has no exported member
```

### Meaning

The file exists, but it does not export the function/type the tab imports.

### Fix

Open the file and confirm the exact export name.

Example:

```txt
export function createAccessPaymentPayload(...)
export function verifyAccessPayment(...)
export type VerifyAccessPaymentResponse = ...
```

## 3. Unused Import Error

### Error

```txt
is declared but its value is never read
```

### Meaning

TypeScript build blocks unused imports or variables.

### Fix

Remove the unused import or variable.

Common examples:

```txt
Clock
Gift
SearchCheck
AlertTriangle
```

Only remove it if the file does not use it.

## 4. Serverless Function Limit

### Error

```txt
No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

### Meaning

Too many API files exist.

### Fix

Keep only:

```txt
api/ott.ts
```

Delete old files:

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

## 5. Missing Xaman Keys

### Error

```txt
Missing XAMAN_API_KEY or XAMAN_API_SECRET.
```

### Meaning

Vercel env variables are not set.

### Fix

Add these in Vercel:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
```

Then redeploy.

## 6. Invalid Destination Wallet

### Error

```txt
Missing or invalid destinationWallet.
```

### Meaning

The payment/proof route needs a valid XRPL r-address.

### Fix

Add one or more:

```txt
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

All must start with `r`.

## 7. SourceTag Wrong

### Error / Issue

```txt
SourceTag does not show 2606170002
```

### Meaning

An old file or old constant is still active.

### Fix

Search the repo for old SourceTag values and replace with:

```txt
2606170002
```

Main file:

```txt
src/lib/makeWaves.ts
```

## 8. Blank Tab

### Meaning

Usually one of these:

```txt
Import path error
Export error
Runtime localStorage error
Undefined prop
Component not added correctly in App.tsx
```

### Fix Order

Check:

```txt
1. Browser console
2. Vercel build log
3. App.tsx import
4. App.tsx tab union type
5. App.tsx sidebar item
6. App.tsx render block
```

## 9. App.tsx Missing Tab

Every new tab needs 4 parts:

```txt
1. Import
2. ActiveTab union type
3. Sidebar item
4. Render block
```

Example:

```txt
import { SmokeTestTab } from "./tabs/SmokeTestTab";

| "smoketest"

{ id: "smoketest", label: "Smoke Test", status: "QA" }

{activeTab === "smoketest" && (
  <SmokeTestTab walletAddress={walletAddress} />
)}
```

## 10. api/ott.ts Action Unknown

### Error

```txt
Unknown API action.
```

### Meaning

Frontend sends an action name that api/ott.ts does not handle.

### Fix

Confirm exact action string in frontend and backend.

Examples:

```txt
xaman.createAccessPaymentPayload
xrpl.verifyAccessPayment
xaman.createTruthDeskPayload
xrpl.verifyTruthDeskPayment
xaman.createProofStampPayload
xrpl.verifyProofStamp
```

## 11. Payment Verifies False

### Meaning

Usually one of these checks failed:

```txt
SourceTag
memo
amount
destination wallet
sender wallet
transaction validated
tesSUCCESS
```

### Fix

Check the verification label in the tab.

For Access Gate, expected memo:

```txt
OTT_ACCESS
```

For Truth Desk:

```txt
OTT_TRUTH_DESK
```

For Proof Stamp:

```txt
OTT_PROOF
```

## 12. When To Send Screenshot

Send screenshot when:

```txt
Vercel is red
Build log is red
Tab is blank
Payload creation fails
Verification fails unexpectedly
Console shows TypeScript/runtime error
```

Include the visible red text.

## 13. Fix Priority

```txt
1. Vercel red build
2. Blank app / blank tabs
3. Missing imports/exports
4. API router issues
5. Env variable issues
6. Verification logic issues
7. UI polish
```

## 14. Current Safe Baseline

Current target:

```txt
Build green
api/ott.ts single router
SourceTag 2606170002
Main tabs load
Smoke Test passes
Then UI polish
```
