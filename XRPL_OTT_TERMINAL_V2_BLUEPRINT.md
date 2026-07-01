# XRPL OnTheTrack Terminal V2 — Product Blueprint

## New Direction

We are moving from:

```txt
Hackathon concept dashboard
```

to:

```txt
Real XRPL Web3 Terminal
```

The new product structure has 3 core layers:

```txt
1. XRPL Explorer
2. Xaman Wallet Dashboard
3. OTT Proof / Education Layer
```

## One-Liner

XRPL OnTheTrack Terminal is an XRPL-native explorer, wallet dashboard and education/proof layer built around Xaman, live XRPL data and SourceTag `2606170002`.

## Core SourceTag

```txt
2606170002
```

This stays the official OTT proof identity.

---

# 1. XRPL Explorer Layer

## Purpose

This is the public layer. No login required.

It should feel professional, fast and data-driven.

## Core Pages

```txt
Home
XRPL Live
Latest Ledgers
Latest Transactions
Account Lookup
Transaction Lookup
Token / Issued Asset Lookup
DEX / AMM Overview
Validators
NFTs
SourceTag Search
```

## Homepage Must Show

```txt
Live ledger index
Latest transactions
Network status
XRPL stats
Search bar
SourceTag 2606170002 search
Featured assets / routes
Clean explorer-style layout
```

## Goal

When a visitor opens the site, they should immediately feel:

```txt
This is real XRPL data.
This is not just a demo dashboard.
This is a serious terminal.
```

---

# 2. Xaman Wallet Dashboard Layer

## Purpose

This is the connected user layer.

User connects with Xaman and sees their XRPL profile.

## Core Pages

```txt
Connect with Xaman
Wallet Overview
Balances
Trustlines
NFTs
Recent Transactions
Proof Stamps
Access Status
Truth Desk History
Reward / XP Ledger
```

## Xaman Login Goal

The user should be able to:

```txt
Connect wallet
Confirm address
View wallet data
Create payment/proof payloads
Verify tx hashes
```

## Dashboard Must Show

```txt
Wallet address
XRP balance
Issued assets
Trustlines
NFTs
Recent transactions
SourceTag proof history
OTT XP / Reward Ledger
```

## Goal

The connected dashboard should feel like:

```txt
My XRPL command center
```

---

# 3. OTT Proof / Education Layer

## Purpose

This is the unique OnTheTrack layer.

This is where the Terminal becomes more than an explorer.

## Core Modules

```txt
Partner Hub
Education Routes
Risk Checklists
Proof Stamps
Truth Desk
Access Gate
Reward Ledger
Pitch / Creator Layer
```

## Education-First Flow

Every route should follow this order:

```txt
1. Explain route
2. Show risk notes
3. Link official provider
4. Connect Xaman only when needed
5. Create optional proof/payment payload
6. Verify tx hash
7. Record XP / proof
```

## Legal-Safe Line

```txt
The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. It explains routes, shows risk awareness and directs users to official providers.
```

## Goal

The OTT layer should feel like:

```txt
Guided XRPL education + proof + community routes
```

---

# New Main Navigation

## Public Navigation

```txt
Home
Explore
Transactions
Ledgers
Accounts
Assets
Validators
SourceTag
Education
Connect Xaman
```

## Connected Navigation

```txt
Wallet
Portfolio
Transactions
Trustlines
NFTs
Proof Stamps
Reward Ledger
Truth Desk
Access Gate
Settings
```

## OTT Navigation

```txt
Partner Hub
Education Routes
Proof / SourceTag
Truth Desk
Access Gate
Submission / Pitch
```

---

# What We Keep From Current MVP

Do not throw away the current build.

Keep and reuse:

```txt
SourceTag 2606170002
api/ott.ts single router
Xaman payload logic
XRPL tx verification logic
Reward Ledger
Partner Hub content
Truth Desk concept
Access Gate concept
Proof Stamp concept
Pitch / submission docs
```

## What We Change

We reduce the “many-tab demo feeling” and turn it into:

```txt
clean explorer homepage
real XRPL data first
Xaman dashboard second
OTT proof/education third
```

---

# Product MVP V2 Scope

## Must-Have

```txt
Professional homepage
Live XRPL network stats
Latest transactions
Search bar
Xaman connect button
Wallet dashboard shell
SourceTag proof section
Partner Hub simplified
Truth Desk simplified
Access Gate simplified
Reward Ledger simplified
```

## Should-Have

```txt
Account lookup
Transaction lookup
Asset lookup
Trustline display
NFT display
Proof Stamp history
```

## Later

```txt
Full indexer
Partner admin
Public proof explorer
NFT access pass ownership check
RLUSD production route
xApp packaging
Multi-language education
```

---

# Meeting Notes For StellarChain Maker

## What To Say

```txt
I want to build an XRPL-native version with the same professional feeling as StellarChain, but not only as an explorer. I want XRPL explorer + Xaman wallet dashboard + OTT proof/education layer.
```

## Questions To Ask

```txt
1. Do you use your own blockchain indexer or external API?
2. How do you fetch latest ledgers and transactions?
3. How do you cache chain data?
4. How do you structure account / transaction / asset pages?
5. What stack do you use?
6. How hard would this be for XRPL?
7. Can we add Xaman login/OAuth?
8. Can we build SourceTag search?
9. What is MVP vs production scope?
10. Can OTT proof/education be layered on top?
```

---

# Next Build Direction

Stop adding more documentation tabs.

Next technical steps:

```txt
1. Create new clean Home / Explorer layout
2. Add live XRPL data client
3. Add Xaman login/connect flow
4. Build wallet dashboard shell
5. Reposition existing Partner Hub / Proof / Truth Desk under OTT layer
6. Remove or hide demo-only tabs from main navigation
7. Polish UI after the structure is correct
```

## Final Product Sentence

```txt
XRPL OnTheTrack Terminal is the place where users explore XRPL, connect with Xaman, learn routes safely and prove meaningful actions with SourceTag 2606170002.
```
