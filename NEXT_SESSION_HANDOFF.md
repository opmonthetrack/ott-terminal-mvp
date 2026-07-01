# XRPL OnTheTrack Terminal — Next Session Handoff

## Current Status

The MVP scope is now frozen.

Current phase:

```txt
Functional test → live review → UI polish → demo recording → submission
```

Do not add new major features before testing.

## Main Project Identity

```txt
Project: XRPL OnTheTrack Terminal
SourceTag: 2606170002
Positioning: education-first XRPL onboarding, partner discovery and proof layer
```

## Safe Pitch Line

```txt
The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. It explains routes, shows risk awareness and directs users to official providers.
```

## Latest Important Files

Frontend:

```txt
src/App.tsx
src/tabs/SmokeTestTab.tsx
src/tabs/AccessGateTab.tsx
src/tabs/PitchModeTab.tsx
src/tabs/SubmissionPackTab.tsx
src/tabs/TruthDeskTab.tsx
src/tabs/PartnerHubTab.tsx
src/tabs/RewardLedgerTab.tsx
```

Libraries:

```txt
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
```

Backend:

```txt
api/ott.ts
```

## Current Rule

Before UI polish, only do:

```txt
red error fixes
missing import/export fixes
Vercel setup fixes
smoke test fixes
small text corrections
```

Do not add:

```txt
new big tabs
new token mechanics
new DeFi execution
new custody logic
new broker/exchange logic
mainnet token distribution
```

## Immediate Next Action

```txt
1. Open Vercel
2. Confirm latest deploy is green
3. Open live app
4. Click Smoke Test tab
5. Test main tabs
6. Screenshot any red error
7. Fix red errors one by one
```

## Smoke Test Priority

Test these first:

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

## If Build Is Red

Fix order:

```txt
1. Missing import
2. Missing export
3. Unused import
4. Wrong path/casing
5. Old API files still present
6. Env variable issue
```

## If Vercel Function Limit Returns

Keep only:

```txt
api/ott.ts
```

Delete old API files.

## Environment Variables

Required:

```txt
XAMAN_API_KEY
XAMAN_API_SECRET
```

Recommended:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
OTT_PROOF_DESTINATION_WALLET=
OTT_TRUTH_DESK_WALLET=
OTT_ACCESS_WALLET=
```

## Demo Route

Final 2-minute route:

```txt
Dashboard
→ Partner Hub
→ Proof Stamp
→ XRPL Verify
→ Reward Ledger
→ Truth Desk
→ Access Gate
→ Pitch Mode
```

## UI Polish Starts Only When

```txt
Vercel green
Live app opens
No blank main tabs
Smoke Test passes
SourceTag 2606170002 visible
No critical runtime errors
```

## First UI Polish Targets

When ready:

```txt
1. Sidebar grouping
2. Dashboard hero clarity
3. Partner Hub readability
4. Truth Desk forms
5. Access Gate forms
6. Reward Ledger events
7. Pitch Mode presentation
8. Mobile responsiveness
9. Final branding
```

## Final Submission Links To Fill

```txt
Live App:
GitHub Repo:
Demo Video:
Pitch Deck:
Contact:
X / Twitter:
Telegram / Discord:
```

## Best Next Message To Continue

Use this in the next chat/session:

```txt
We are continuing XRPL OnTheTrack Terminal. MVP scope is frozen. SourceTag is 2606170002. We are now checking Vercel/live app/smoke test before UI polish. Only fix red errors and stabilize.
```
