# OTT Academy — Learning and NFT Architecture

## Purpose

OTT Academy must feel calm, understandable and earned. The learner first understands a subject, then proves understanding, and only after verified completion unlocks an optional on-chain achievement.

The public XRP Ledger Learning Portal is used as a UX benchmark for course structure, not as content to copy. OTT adds its own source-first research, wallet safety, AI assessment and achievement system.

## Benchmark patterns to adopt

### Course hub

Each course card shows only:

- course title;
- one-sentence outcome;
- level: Beginner, Intermediate or Advanced;
- estimated completion time;
- number of lessons;
- prerequisites when relevant;
- current progress percentage;
- one primary action: Start or Continue.

Do not show full lesson text on the course overview.

### Lesson page

Every lesson follows the same predictable order:

1. Lesson number and title.
2. Estimated reading time.
3. Difficulty.
4. One key takeaway.
5. Three to five short learning blocks.
6. Important terms linked to a glossary.
7. Sources and last-reviewed date.
8. One short practical example or analogy.
9. Knowledge check.
10. Next lesson.

A normal lesson should take roughly 5–15 minutes. Long subjects are split instead of creating a wall of text.

### Knowledge checks

OTT uses two kinds of assessment:

- short randomized multiple-choice checks for factual recall;
- typed answers of no more than 200 characters for actual understanding.

The AI assessor must:

- judge the answer against the learning objective;
- provide short constructive feedback;
- remain neutral;
- never invent requirements not present in the lesson;
- allow a retry;
- record the lesson version used for assessment.

A lesson is passed only when every required answer reaches the configured threshold. Current default: 70/100 per answer.

### Course final

A course is completed only when:

- every required lesson is passed;
- every required typed answer is passed;
- the final randomized course check reaches at least 80%;
- no assessment is still pending;
- the user account has saved the completion state.

Guest users may study and practise, but verified progress requires a normal OTT account. A wallet is not required for learning.

## OTT learning paths

### Path 1 — Foundations

1. Blockchain and crypto basics
2. What the XRP Ledger is
3. Accounts, addresses and reserves
4. Wallet types and key ownership
5. Transactions, fees and confirmation

### Path 2 — Using XRPL safely

1. Choosing a wallet
2. Self-custody versus custody
3. Recovery and provider failure
4. Reading a signing request
5. Sending and receiving XRP
6. Destination tags and memos
7. Common phishing and approval risks

### Path 3 — Tokens and markets

1. Issuer plus currency identity
2. Trustlines
3. Supply and distribution
4. Freeze, clawback and issuer controls
5. Order books and the native DEX
6. AMMs and liquidity
7. Market cap, liquidity and concentration
8. Blackhole claims and evidence

### Path 4 — NFTs

1. What makes an NFT different
2. XRPL NFT fields and flags
3. Metadata and IPFS
4. Minting
5. Offers and transfers
6. Royalties and transfer fees
7. Burning and lifecycle
8. Completion NFT design

### Path 5 — DeFi and ecosystem

1. Native XRPL DeFi
2. DEX, pathfinding and autobridging
3. AMMs and liquidity provider risk
4. Lending models and counterparty risk
5. Custody and RWA platforms
6. Cross-chain and bridge risk
7. Learn-before-link project reviews

### Path 6 — Research and evidence

1. Token identity verification
2. Ledger data versus project claims
3. Holder concentration
4. Founder and treasury wallets
5. Whitepaper review
6. Roadmap review
7. Partner-claim verification
8. Producing a neutral evidence report

## Study Center

Academy receives a separate Study Center with:

- searchable glossary;
- lesson quizzes;
- course finals;
- wallet safety checklist;
- transaction examples;
- code sandboxes for developer courses;
- source library;
- frequently asked questions;
- personal weak-topic review.

The Study Center is not another large menu. It is opened from Academy and uses search plus a small number of categories.

## Achievement ladder

### Lesson completion

Reward:

- checkmark;
- saved score;
- small XP amount;
- no NFT.

Reason: minting an NFT after every tiny lesson would create noise, cost and low-value collectibles.

### Course completion

Reward:

- course badge unlocked;
- shareable completion page;
- optional course achievement NFT.

The user chooses whether to mint. Learning completion must never depend on payment or minting.

### Learning-path completion

Reward:

- pathway certificate;
- optional higher-level certificate NFT;
- evidence of all underlying course completions.

### Final OTT foundation completion

Reward:

- final comprehensive assessment;
- OTT XRPL Foundation Certificate;
- optional final certificate NFT;
- public verification link without exposing private account data.

## Initial badge families

Working titles; artwork and final naming still require approval.

1. Ledger Foundations — Blockchain and crypto basics
2. XRPL Navigator — Intro to the XRPL
3. Key Guardian — Wallet safety and recovery
4. Payment Pathfinder — XRP payments
5. Token Explorer — Tokens, trustlines and issuer controls
6. Liquidity Learner — DEX, order books and AMMs
7. NFT Builder — NFTs and metadata
8. DeFi Navigator — DeFi and ecosystem platforms
9. Evidence Analyst — Token Research Lab
10. OTT XRPL Foundation — final pathway certificate

## NFT eligibility rules

An achievement NFT can be requested only when:

- the user has a verified OTT account;
- course completion is stored server-side;
- the course version is recorded;
- all required assessments passed;
- the completion has not already been used for the same NFT claim;
- an XRPL wallet is connected and ownership is proven;
- the user explicitly confirms the mint or delivery transaction.

Do not trust progress stored only in localStorage for NFT eligibility.

## NFT metadata model

Recommended fields:

```json
{
  "name": "OTT Academy — Key Guardian #001",
  "description": "Verified completion achievement for the OTT Wallet Safety course.",
  "image": "ipfs://<image-cid>",
  "external_url": "https://ott-terminal-mvp.vercel.app/verify/<public-proof-id>",
  "attributes": [
    { "trait_type": "Program", "value": "OTT Academy" },
    { "trait_type": "Course", "value": "Wallet Safety" },
    { "trait_type": "Course ID", "value": "wallet-safety-v1" },
    { "trait_type": "Level", "value": "Beginner" },
    { "trait_type": "Version", "value": "1.0" },
    { "trait_type": "Achievement", "value": "Course Complete" },
    { "trait_type": "Serial", "value": "001" }
  ]
}
```

Do not place email addresses, legal names, quiz answers or private profile data in public NFT metadata.

Use a random public proof ID or completion hash that resolves to a privacy-safe verification page.

## Numbering and first 500 NFTs

The first production batch may reserve serials `#001` through `#500`, but the split across courses must be approved only after the curriculum and badge families are final.

Do not create 500 identical metadata files prematurely.

Required production order:

1. Approve course list and course IDs.
2. Approve badge names.
3. Design one visual master per badge family.
4. Define edition policy and serial allocation.
5. Generate image variants and metadata.
6. Validate every CID and metadata file.
7. Test mint and delivery on XRPL Testnet.
8. Verify duplicate-claim prevention.
9. Freeze the production metadata manifest.
10. Mint or deliver on Mainnet only after final approval.

## Suggested edition policy

Preferred model:

- dynamic course achievement NFTs minted only for eligible learners;
- unique serial per badge family;
- no promise of financial value;
- no artificial investment language;
- certificate and learning utility only.

Alternative capped model:

- first 500 total Academy achievements;
- serial allocation recorded in a central manifest;
- unused numbers remain unminted;
- future collections use a new version and collection identifier.

The final choice must be made before artwork and metadata generation.

## Wallet and payment separation

Normal account login saves learning progress.

Wallet connection is used only for:

- ownership proof;
- signing;
- optional achievement NFT claim;
- on-chain voting or payments.

The UI says `wallet` by default. A specific provider name is shown only inside provider selection, provider-specific instructions or an active signing flow.

## UI principles

- One main learning objective per screen.
- No sidebar.
- Course hub uses spacious cards.
- Lesson page has a readable narrow column.
- Progress is visible but not visually dominant.
- One primary action at the end of each lesson.
- Sources are expandable.
- Technical depth is optional, not forced into the first reading layer.
- NFT information appears only near completion, not throughout every lesson.

## Content integrity

OTT may learn from the structure of external courses, but must not reproduce their lesson text or copyrighted artwork.

Each OTT lesson needs:

- original wording;
- official or primary sources;
- source review date;
- version history;
- a distinction between fact, interpretation and risk guidance;
- correction workflow when source information changes.

## Build sequence

1. Redesign Academy course hub.
2. Introduce the reusable lesson template.
3. Add normal account-backed progress storage.
4. Preserve existing typed-answer AI assessment.
5. Add randomized knowledge checks.
6. Add course final and completion gate.
7. Build achievement unlock screen.
8. Build server-side NFT eligibility record.
9. Finalise artwork and metadata for badge families.
10. Test NFT claim on Testnet.
11. Release first approved Mainnet achievement collection.
