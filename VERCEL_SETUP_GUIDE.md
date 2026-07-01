# XRPL OnTheTrack Terminal — Vercel Setup Guide

## Goal

Use this guide to make sure the live deployment works on Vercel before UI polish.

## 1. Project Structure

The repo should use one Vercel API router:

```txt
api/ott.ts
```

Do not keep the old loose API files, because Vercel Hobby can block the deploy when there are too many serverless functions.

Delete these if they still exist:

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

## 2. Required Environment Variables

Go to:

```txt
Vercel → Project → Settings → Environment Variables
```

Add:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
```

These are required for Xaman payload creation.

## 3. Recommended Environment Variables

Add:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
```

Add valid XRPL destination wallets:

```txt
OTT_PROOF_DESTINATION_WALLET=
OTT_TRUTH_DESK_WALLET=
OTT_ACCESS_WALLET=
```

All wallet values must be valid XRPL r-addresses.

## 4. SourceTag

The app must use:

```txt
2606170002
```

Do not change this in Vercel.

The `.env.example` may include:

```txt
MAKE_WAVES_SOURCE_TAG=2606170002
```

But the actual app code uses the constant from:

```txt
src/lib/makeWaves.ts
```

## 5. Build Settings

Recommended Vercel settings:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## 6. Deploy Check

After deployment, confirm:

```txt
Build status: Green
Live URL opens: Yes
No function limit error: Yes
No TypeScript error: Yes
No missing imports: Yes
```

## 7. API Smoke Check

Open browser dev tools and check that frontend calls go to:

```txt
/api/ott
```

Expected POST actions include:

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

## 8. Common Red Errors

### Serverless Function Limit

Error:

```txt
No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

Fix:

```txt
Keep only api/ott.ts and delete old loose API files.
```

### Missing Environment Variable

Error:

```txt
Missing XAMAN_API_KEY or XAMAN_API_SECRET.
```

Fix:

```txt
Add both variables in Vercel and redeploy.
```

### Invalid Destination Wallet

Error:

```txt
Missing or invalid destinationWallet.
```

Fix:

```txt
Add OTT_PROOF_DESTINATION_WALLET, OTT_TRUTH_DESK_WALLET or OTT_ACCESS_WALLET.
```

### Import Error

Error:

```txt
Could not resolve "../lib/example"
```

Fix:

```txt
Check exact file path and Linux casing.
```

### Export Error

Error:

```txt
Module has no exported member
```

Fix:

```txt
Update the file that should export that function/type.
```

## 9. Final Vercel Go / No-Go

Ready when:

```txt
Vercel deploy is green
/api/ott.ts is the only API function
Environment variables are set
Live app opens
Dashboard loads
Smoke Test tab loads
SourceTag is 2606170002
```

## 10. After Green Deploy

Next order:

```txt
1. Run Smoke Test
2. Fix any red errors
3. Check live app flow
4. Start UI polish
5. Record demo video
6. Fill submission links
```
