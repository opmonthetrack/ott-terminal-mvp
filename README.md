# XRPL OnTheTrack Terminal

**XRPL OnTheTrack Terminal** is an education-first onboarding, partner discovery and proof layer for XRPL users, builders and service routes.

The Terminal helps users understand XRPL routes before taking action. It combines learning flows, partner discovery, Xaman payloads, optional on-ledger Proof Stamps, local XP, access routes and safe service routes.

## Core Positioning

XRPL OnTheTrack Terminal is education-first.

It does **not**:

- custody funds
- act as broker
- provide yield
- execute trades
- promise token value
- promise investment returns

It explains routes, shows risk awareness and directs users to official providers after education.

## SourceTag

The Make Waves proof identity for this project is:

```txt
2606170002
```

Meaningful proof routes use this SourceTag for traceability:

- Daily Check-In
- Partner Proof Stamp
- XRPL Verify
- Truth Desk payment
- Access Gate payment
- OTT testnet token demo flow

## Main Features

### Dashboard

Shows the overall project state, SourceTag, XP overview and next steps.

### Daily Check-In

Creates a Xaman payload for user engagement and credits local XP after signed payload verification.

### SourceTag Monitor

Shows the Make Waves SourceTag identity and proof strategy.

### Xaman Center

Creates and verifies Xaman payloads for proof-based user actions.

### XRPL Verify

Verifies XRPL transaction hashes and checks SourceTag proof.

### Partner Hub

Education-first partner discovery route with checklists, risk awareness and optional Proof Stamp verification.

### Truth Desk

Paid service route for:

- Ask Truth: 1 XRP for one short question
- 1-on-1 booking request: demo XRP payment route

This is for education, orientation and project feedback only.

### Access Gate

Access route layer for:

- fiat route via external provider
- XRP payment
- RLUSD route concept
- OTT Access Pass NFT concept

Access payments unlock app access only. They are not investment products.

### Reward Ledger

Local XP and proof ledger. XP is off-chain and has no guaranteed financial value.

### OTT Testnet Token

Testnet-only token simulation and verification. Mainnet token distribution is locked until legal review.

### Pitch Mode

Two-minute demo flow for judges, partners and hackathon presentation.

### Submission Pack

Copy-ready hackathon submission text, checklist and demo recording order.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Xaman payload API
- XRPL JSON-RPC verification
- Vercel serverless API router

## API Design

To stay within Vercel Hobby plan limits, the project uses one serverless API router:

```txt
api/ott.ts
```

This router handles:

- Xaman payload creation
- Xaman payload verification
- XRPL transaction verification
- token payment verification
- proof stamp verification
- Truth Desk payment verification
- Access Gate payment verification

## Required Environment Variables

For Xaman payload creation:

```txt
XAMAN_API_KEY=
XAMAN_API_SECRET=
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

## Demo Flow

Recommended two-minute demo:

1. Open Dashboard and show SourceTag `2606170002`.
2. Open Partner Hub and show education/risk checks.
3. Create a Proof Stamp payload.
4. Verify a transaction hash.
5. Open Truth Desk and show paid question route.
6. Open Access Gate and show payment route.
7. End with Reward Ledger and legal lock.

## Hackathon One-Liner

XRPL OnTheTrack Terminal is an education-first onboarding, partner discovery and proof layer for XRPL users, builders and service routes.

## Short Description

XRPL OnTheTrack Terminal helps users understand XRPL routes before taking action. It combines learning flows, partner discovery, Xaman payloads, optional on-ledger Proof Stamps, local XP and safe access/service routes.

The MVP does not custody funds, does not act as broker, does not provide yield and does not execute trades. It explains, routes and verifies proof with SourceTag `2606170002`.

## Legal-Safe Pitch Line

The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. It routes users to official providers only after explanation and risk awareness.

## Closing Line

This is not another wallet dashboard. It is a guided XRPL education and proof layer built to help users, builders and partners move safely on the track.
