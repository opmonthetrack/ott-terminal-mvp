# XRPL OnTheTrack Terminal

**XRPL OnTheTrack Terminal** is an education-first XRPL intelligence, onboarding and proof terminal built for the XRPL Commons **Make Waves** challenge.

It helps users, builders and community members understand XRPL activity before they act. The terminal combines live intelligence, SourceTag proof, Xaman signing, Academy learning, local XP, social publishing workflows and pitch-ready submission tools.

Live terminal:

```txt
https://ott-terminal-mvp.vercel.app
```

Make Waves SourceTag:

```txt
2606170002
```

---

## What It Is

XRPL OnTheTrack Terminal is not just a wallet dashboard.

It is a guided XRPL layer for:

- learning XRPL safely
- following XRPL ecosystem signals
- turning news into source-first social output
- connecting and signing with Xaman
- proving activity with SourceTag `2606170002`
- tracking local XP and OTT Credits
- preparing a clean Make Waves demo and pitch

The product position is simple:

```txt
Connect → Learn → Prove → Unlock → Share
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

It explains, routes, verifies and teaches.

Future token, certificate, donation or access features remain utility-focused and legal-gated.

---

## Main Live Modules

### Home / Make Waves Landing

The landing page introduces the terminal as a Make Waves intelligence and proof terminal. It highlights the live SourceTag, the intelligence workflow, the education layer and the safe access model.

Main routes from Home:

- XRPL Intelligence
- Newsroom
- Daily Proof
- Academy

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

Access Gate is currently scanner-only and live-safe.

It checks for an OTT Access Pass NFT conceptually, but active mint/payment routes are disabled for V1 safety.

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

Current demo story highlights:

- Dashboard Snapshot
- XRPL Intelligence
- OTT Intelligence
- Newsroom
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

---

### Smoke Test

Smoke Test is the final QA page.

It checks whether the Make Waves demo route is ready:

- Home
- Dashboard Snapshot
- XRPL Intelligence
- OTT Intelligence
- Newsroom
- Xaman Center
- Daily Check-In
- Reward Ledger
- SourceTag
- Academy
- Access Gate scanner-only
- Pitch Mode
- Submission Pack

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

1. Open Home and show the terminal positioning.
2. Open Dashboard Snapshot and show live intelligence status.
3. Open XRPL Intelligence and select a live signal.
4. Open OTT Intelligence and explain the source-first analysis.
5. Open Newsroom and show platform-ready social output.
6. Open Xaman Center or Daily Check-In.
7. Sign/verify a SourceTag proof payload.
8. Open Reward Ledger and show XP / OTT Credits.
9. End with Pitch Mode or Submission Pack.

Core sentence:

```txt
XRPL OnTheTrack Terminal helps users learn, verify and share XRPL activity safely before they act.
```

---

## Hackathon One-Liner

XRPL OnTheTrack Terminal is an education-first XRPL intelligence, onboarding and proof terminal that helps users learn, verify and share XRPL activity safely with Make Waves SourceTag `2606170002`.

---

## Short Description

XRPL OnTheTrack Terminal combines live XRPL intelligence, Xaman proof flows, SourceTag verification, Academy education, Reward Ledger XP and a social Newsroom into one guided terminal. It helps users and builders understand XRPL activity before taking action, while keeping the product education-first, non-custodial and legal-safe.

---

## Legal-Safe Pitch Line

The terminal is education-first. It does not custody funds, act as a broker, execute trades, provide yield or promise investment returns. It helps users learn, verify sources and route themselves safely through XRPL ecosystem activity.

---

## Closing Line

This is not another wallet dashboard. It is an XRPL intelligence, education and proof terminal built to help users move safely on the track.
