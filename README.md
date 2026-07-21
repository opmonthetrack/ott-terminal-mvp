# XRPL OnTheTrack Terminal

**XRPL OnTheTrack Terminal** is an education-first XRPL intelligence, onboarding and proof terminal built for the XRPL Commons **Make Waves** challenge.

It helps users, builders and community members understand XRPL activity before they act. The terminal combines live intelligence, SourceTag proof, Xaman signing, Xaman wallet activation education, Academy learning, local XP, social publishing workflows, Access Pass scanning and founder-only pitch tooling.

Live terminal:

```txt
https://ott-terminal-mvp.vercel.app
```

Make Waves SourceTag:

```txt
2606170002
```

---

## Product Position

XRPL OnTheTrack Terminal is not just a wallet dashboard.

It is a guided XRPL onboarding and intelligence layer with a simple user model:

```txt
Free to Learn
Xaman to Prove
Pass to Unlock
```

Meaning:

```txt
Guest users can start without Xaman.
Xaman users can create proof, earn XP and verify actions.
Access users can unlock premium routes through a Web2 license later or an XRPL Access Pass.
Founder demo tools stay hidden behind Labs / QA.
```

The main product flow is:

```txt
Read → Learn → Activate → Connect → Prove → Unlock → Share
```

---

## Core Safety Positioning

The terminal is **education-first**.

It does **not**:

- custody funds
- act as a broker
- execute trades
- provide yield
- promise token value
- promise investment returns
- give financial advice
- guarantee rewards, profit or resale value
- automatically convert fiat into crypto

It explains, routes, verifies and teaches.

Future token, certificate, donation, Web2 license or access features remain utility-focused and legal-gated.

---

## User Visibility Model

### Public / Guest

Users can open the terminal and start without Xaman.

Visible for guests:

- Home
- Daily Snapshot
- XRPL Intelligence
- OTT Intelligence
- Newsroom
- SourceTag explanation
- Xaman Activation guide
- Academy / free education
- Access Gate explanation

Guest users can learn, read sources and understand the terminal before connecting a wallet.

### Xaman User

A user with Xaman can:

- connect/sign with Xaman
- complete Daily Check-In proof
- verify SourceTag actions
- see local XP and OTT Credits
- use Reward Ledger
- scan for Access Pass ownership

### Access User

Premium access has two planned routes:

```txt
1. Web2 Access License
   For normal users who pay through fiat routes later.

2. XRPL Access Pass
   For crypto-native users who unlock through a wallet-held utility NFT.
```

The V1 Access Gate combines a 1.589 XRP Xaman service-payment page with manual founder-controlled mint and delivery. Payment never auto-mints or auto-unlocks; the customer scans the delivered NFT from the same wallet.

### Founder / Labs

Founder and pitch tools are hidden behind the Labs / QA toggle.

Founder-only tools:

- Pitch Mode
- Submission Pack
- Smoke Test
- Launch / internal QA tools

These are not shown as the normal customer journey.

---

## Main Live Modules

### Home / Make Waves Landing

The landing page introduces the terminal with the final access model:

```txt
Free to Learn
Xaman to Prove
Pass to Unlock
```

It makes clear that users can start free without Xaman, then activate/connect Xaman when they are ready to prove activity or unlock wallet-based features.

Main routes from Home:

- Start Free / Academy
- Xaman Activation
- Daily Proof
- Access
- XRPL Intelligence
- Newsroom

---

### Daily Snapshot / Dashboard

The Dashboard gives a quick live overview of the terminal state.

It shows:

- Daily Intelligence Snapshot
- live `/api/news` status
- top XRPL signal
- source health
- SourceTag `2606170002`
- quick routes into Intelligence, Newsroom, OTT Intelligence and Reward Ledger

---

### XRPL Intelligence

XRPL Intelligence pulls source-weighted ecosystem signals from official and high-context sources.

It tracks:

- XRPL Core / Amendments
- XLS standards
- Ripple / RLUSD / payments context
- Xaman ecosystem updates
- CBDC / ISO 20022 / macro payment infrastructure
- RWA / tokenization context

Macro content is treated as context only. The terminal does not claim XRP or XRPL usage unless a direct source supports it.

---

### OTT Intelligence AI Studio

OTT Intelligence turns selected XRPL Intelligence items into structured analysis.

Modes include:

- Builder Lens
- Beginner Explain
- Risk Context
- Content Angle
- Verify Checklist

The goal is to separate facts, context, opportunity and risk before posting or acting.

---

### Social Newsroom

The Newsroom converts live XRPL Intelligence items into platform-specific drafts.

Supported output modes:

- X / Twitter post
- LinkedIn post
- Instagram caption
- Facebook post
- TikTok hook
- YouTube outline
- Medium article outline
- WhatsApp status

The Newsroom uses a dedicated social tag playbook:

```txt
src/data/socialTagPlaybook.ts
```

That file separates:

- hashtags
- cashtags
- suggested mentions
- platform rules
- topic context
- verify-before-posting handles

The app does **not** auto-post. It opens platforms or share dialogs and lets the user review first.

---

### Xaman Activation

Xaman Activation explains why a new XRPL/Xaman wallet may exist locally before it is active on XRPL Mainnet.

It explains:

- why XRPL wallets need activation reserve
- how users can activate through their own exchange route
- how an existing XRPL/Xaman user can help activate a new wallet
- how OTT Assisted Activation may work later as an onboarding service
- why users must never share secret keys or recovery words

Important boundary:

```txt
OTT does not custody wallets.
OTT does not ask for seed phrases.
OTT does not act as an exchange or investment broker.
```

---

### Xaman Center

Xaman Center is the self-custody signing layer.

It supports Xaman payload creation and verification for proof-based user actions.

Important boundary:

```txt
Xaman signing remains user-controlled.
The terminal does not custody funds or secretly execute transactions.
```

---

### Daily Check-In

Daily Check-In creates a Xaman Make Waves proof payload.

Flow:

1. connect Xaman
2. choose a proof action
3. create payload
4. sign in Xaman
5. verify payload
6. credit local XP and OTT Credits after validation

Example reward:

```txt
+10 XP
+1 OTT Credit
```

---

### Reward Ledger

Reward Ledger shows local proof progress for the connected wallet.

It tracks:

- XP
- OTT Credits
- proof events
- SourceTag proof context
- local demo event history
- locked future-token policy

Important:

```txt
XP = learning/reputation progress
OTT Credits = internal terminal utility points
Future OTT Token = inactive until utility, profitability and legal review
```

XP and OTT Credits have no cash value, no withdrawal and no guaranteed token conversion.

---

### SourceTag Monitor

SourceTag Monitor explains the Make Waves identity layer.

Project SourceTag:

```txt
2606170002
```

The SourceTag is used to make activity traceable and demo-ready.

---

### Academy

Academy is the education layer of the terminal.

It includes free and premium-oriented learning modules around:

- blockchain basics
- XRPL basics
- payments
- SourceTag proof
- DeFi island / ecosystem education
- stablecoins
- RWA
- DID
- React / JavaScript / AI agents

Certificate NFT functionality is framed as a future optional completion proof, not an investment product.

---

### Access Gate

Access Gate explains the access model and scans connected wallets for an OTT Access Pass NFT.

The current V1 Access Gate is live-safe:

```txt
scanner unlock after delivery
manual founder-controlled mint and delivery
1.589 XRP Xaman service payment
no claim
no XRP movement
no RLUSD movement
no automatic fiat-to-crypto conversion
```

Access routes:

```txt
Free Public Access
→ learning, intelligence, newsroom preview, activation education

Xaman User Access
→ proof, XP, Reward Ledger, wallet verification

Web2 Access License
→ coming soon for fiat users through a business/payment route

XRPL Access Pass
→ Xaman service payment, manual NFT delivery and scanner unlock for crypto-native users
```

Access Pass positioning:

```txt
utility access only
no yield
no value promise
no investment claim
```

---

### Pitch Mode

Pitch Mode contains a jury-ready Make Waves story and demo script.

It is hidden behind the Founder / Labs toggle and is not part of the normal public customer menu.

Current demo story highlights:

- Dashboard Snapshot
- XRPL Intelligence
- OTT Intelligence
- Newsroom
- Xaman Activation
- Xaman Proof
- Reward Ledger
- Academy / Access / future certificate utility

---

### Submission Pack

Submission Pack contains copy-ready Make Waves material:

- one-liner
- short description
- feature list
- demo route
- business model angle
- compliance notes
- social caption
- final links checklist

It is hidden behind Founder / Labs.

---

### Smoke Test

Smoke Test is the final QA page.

It checks whether the Make Waves demo route is ready:

- Home
- Dashboard Snapshot
- XRPL Intelligence
- OTT Intelligence
- Newsroom
- Xaman Activation
- Xaman Center
- Daily Check-In
- Reward Ledger
- SourceTag
- Academy
- Access Gate payment + manual delivery + scanner unlock
- Pitch Mode
- Submission Pack

It is hidden behind Founder / Labs.

---

## API Design

The project uses Vercel serverless API routes.

Main proof/signing router:

```txt
api/ott.ts
```

This handles:

- Xaman Make Waves payload creation
- Xaman payload verification
- XRPL transaction verification
- token payment verification
- proof stamp verification
- Truth Desk verification
- Access verification

Intelligence router:

```txt
api/news.js
```

This powers:

- XRPL Intelligence
- Dashboard Snapshot
- Newsroom
- OTT Intelligence

---

## Data Helpers

Social tag and platform playbook:

```txt
src/data/socialTagPlaybook.ts
```

News/intelligence client:

```txt
src/lib/newsClient.ts
```

Reward storage:

```txt
src/lib/rewardStore.ts
```

Access scanner helper:

```txt
src/lib/accessNftPass.ts
```

---

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide icons
- Xaman payload API
- XRPL JSON-RPC verification
- Vercel serverless functions
- local browser storage for V1 XP demo state

---

## Required Environment Variables

Xaman payload creation:

```txt
XAMAN_API_KEY=
XAMAN_API_SECRET=
```

Public app URL:

```txt
OTT_PUBLIC_APP_URL=https://ott-terminal-mvp.vercel.app
```

Optional destination wallets:

```txt
OTT_PROOF_DESTINATION_WALLET=
OTT_TRUTH_DESK_WALLET=
OTT_ACCESS_WALLET=
```

Optional XRPL RPC override:

```txt
XRPL_RPC_URL=https://s1.ripple.com:51234/
```

---

## Recommended Make Waves Demo Flow

Two-minute version:

1. Open Home and show: Free to Learn, Xaman to Prove, Pass to Unlock.
2. Open Dashboard Snapshot and show live intelligence status.
3. Open XRPL Intelligence and select a live signal.
4. Open OTT Intelligence and explain source-first analysis.
5. Open Newsroom and show platform-ready social output.
6. Open Xaman Activation and explain onboarding for beginners.
7. Open Xaman Center or Daily Check-In.
8. Sign/verify a SourceTag proof payload.
9. Open Reward Ledger and show XP / OTT Credits.
10. Open Access Gate and explain the 1.589 XRP payment, manual founder delivery and XRPL Access Pass scanner unlock.
11. Open Founder / Labs only for Pitch Mode or Submission Pack if needed.

Core sentence:

```txt
XRPL OnTheTrack Terminal helps people learn XRPL safely, activate their wallet journey, verify actions with Xaman and unlock premium access without custody, hype or investment promises.
```

---

## Promotion Angle

The user-facing message is simple:

```txt
Start free. Learn XRPL. Activate Xaman when ready. Prove real activity. Unlock more when you need it.
```

Promotional pillars:

- free XRPL learning
- beginner-friendly Xaman activation education
- source-first XRPL intelligence
- social content creation from verified sources
- self-custody proof with Xaman
- no custody, no broker, no yield promise
- future Web2 access route for non-crypto users
- XRPL Access Pass route for crypto-native users

---

## Hackathon One-Liner

XRPL OnTheTrack Terminal is an education-first XRPL intelligence, wallet activation, onboarding and proof terminal that helps users learn, verify and share XRPL activity safely with Make Waves SourceTag `2606170002`.

---

## Short Description

XRPL OnTheTrack Terminal combines live XRPL intelligence, Xaman activation education, Xaman proof flows, SourceTag verification, Academy learning, Reward Ledger XP, Access Pass scanning and a social Newsroom into one guided terminal. It helps users and builders understand XRPL activity before taking action, while keeping the product education-first, non-custodial and legal-safe.

---

## Legal-Safe Pitch Line

The terminal is education-first. It does not custody funds, act as a broker, execute trades, provide yield, automatically convert fiat into crypto or promise investment returns. It helps users learn, verify sources and route themselves safely through XRPL ecosystem activity.

---

## Closing Line

This is not another wallet dashboard. It is an XRPL intelligence, education, wallet activation and proof terminal built to help users move safely on the track.
