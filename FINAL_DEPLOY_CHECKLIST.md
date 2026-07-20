# XRPL OnTheTrack Terminal — Final Deploy Checklist

## 1. Build Status

Before submission, make sure Vercel is green.

Check:

- no red TypeScript errors
- no missing imports
- no unused imports
- no unresolved files
- no more than 12 serverless functions
- only four intentional API functions are active: `api/ott.ts`, `api/news.js`, `api/nft.ts` and `api/access-payment.ts`

## 2. Required Files

These files should exist in the repo:

```txt
src/App.tsx
src/lib/makeWaves.ts
src/lib/xamanClient.ts
src/lib/xrplClient.ts
src/lib/rewardStore.ts
src/lib/partnerCatalog.ts
src/lib/proofStampClient.ts
src/lib/proofStampVerifyClient.ts
src/lib/truthDeskClient.ts
src/lib/truthDeskVerifyClient.ts
src/lib/accessStore.ts
src/lib/accessClient.ts
src/lib/ottTokenClient.ts
src/lib/ottTokenVerifyClient.ts
api/ott.ts
README.md
.env.example
HACKATHON_DEMO_SCRIPT.md
SUBMISSION_FORM_ANSWERS.md
PITCH_DECK_OUTLINE.md
JUDGE_QA.md
```

## 3. Tabs To Confirm In UI

Open the live app and click through:

```txt
Dashboard
Daily Check-In
SourceTag Monitor
Xaman Center
XRPL Verify
Network State
Wallet
Portfolio
Ecosystem
Validator
Developer Hub
Tokenization
Token Factory
Profile
OTT Token Center
Reward Policy
Reward Ledger
OTT Testnet
Partner Hub
Truth Desk
Access Gate
Pitch Mode
Submission Pack
OTT Intelligence
Launch Control
AI Hub
Marketplace
News
DeFi
Academy
Ledger Intel
```

If any tab is blank, check the import path and exact file casing.

## 4. SourceTag Check

The active SourceTag must be:

```txt
2606170002
```

Search the repo for old values.

Do not use old short values.

## 5. Vercel Environment Variables

Add these in Vercel:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
XRPL_RPC_URL
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

Recommended default:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
```

All wallet variables must be valid XRPL r-addresses.

## 6. Vercel Hobby Plan API Limit

The project must use this single API file:

```txt
api/ott.ts
```

Delete old loose API files if they still exist:

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

## 7. Demo Test Order

Use this order for final test:

1. Dashboard loads.
2. Daily Check-In loads.
3. Xaman Center loads.
4. Partner Hub loads.
5. Truth Desk loads.
6. Access Gate loads.
7. Pitch Mode loads.
8. Submission Pack loads.
9. Reward Ledger loads.
10. No console-breaking errors.

## 8. Xaman Payload Test

Test with a small flow:

1. Open Daily Check-In.
2. Click Create Xaman Payload.
3. Confirm QR/link appears.
4. Open Xaman.
5. Sign or reject.
6. Return and verify status.

If payload creation fails, check:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
api/ott.ts
destination wallet variable
```

## 9. Proof Stamp Test

Test:

1. Open Partner Hub.
2. Select a partner.
3. Complete education checks.
4. Create Proof Stamp payload.
5. Sign with Xaman.
6. Paste tx hash.
7. Verify SourceTag.

Expected SourceTag:

```txt
2606170002
```

## 10. Truth Desk Test

Test:

1. Open Truth Desk.
2. Enter a short question.
3. Create payment payload.
4. Sign.
5. Paste tx hash.
6. Verify payment.

Expected memo should contain:

```txt
OTT_TRUTH_DESK
```

## 11. Access Gate Test

Test:

1. Open Access Gate.
2. Choose XRP Access Payment.
3. Create Access Payload.
4. Sign.
5. Paste tx hash.
6. Verify payment.

Expected memo should contain:

```txt
OTT_ACCESS
```

## 12. Legal-Safe Language

Use this exact line in demo:

```txt
The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. It explains routes, shows risk awareness and directs users to official providers.
```

Avoid:

```txt
guaranteed rewards
investment token
yield
financial advice
bypass regulation
trade execution
custody
broker
```

## 13. Submission Links To Prepare

Fill these before final submission:

```txt
Live App:
GitHub Repo:
Demo Video:
Pitch Deck:
Contact:
X / Twitter:
Telegram / Discord:
```

## 14. Final 30-Second Pitch

XRPL OnTheTrack Terminal helps new users navigate XRPL safely. Instead of sending users directly into tools they may not understand, it gives education routes, risk checks, Xaman payloads and optional Proof Stamps. Builders and partners get a discovery layer, while users get a safer first experience. The project is education-first, non-custodial and uses SourceTag `2606170002` for proof.

## 15. Final Go / No-Go

Ready to submit when:

- Vercel deploy is green
- Live app URL opens
- all main tabs load
- SourceTag is correct
- README is updated
- demo script is ready
- submission answers are ready
- GitHub repo is clean
- demo video is recorded
