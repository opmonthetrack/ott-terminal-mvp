# XRPL DEX Intelligence — Product Specification

## Product position

XRPL DEX Intelligence is a **read-only research and discovery layer** for XRPL assets and decentralized liquidity. It is not introduced as a trading venue, brokerage service or “best coins” list.

The first release should answer:

- What asset is this?
- Which issuer address created it?
- What evidence connects the issuer to a real project or organization?
- Where does liquidity exist?
- How concentrated are balances and trading activity?
- Which facts are verified, missing, stale or conflicting?
- How did OTT calculate the rating?

## Why this fits OTT

OTT already separates evidence from analysis and researches issuer addresses. Extending the same framework across XRPL DEX assets creates one consistent product:

1. issuer intelligence;
2. ledger and liquidity observations;
3. transparent OTT scoring;
4. educational explanations;
5. optional deeper premium research.

This strengthens the “Terminal” identity because users can inspect ledger reality instead of relying on promotional token pages.

## MVP boundary

### Included

- read-only Top 50 asset directory;
- search by token name, currency code or issuer address;
- issuer-address profile;
- observed XRPL DEX and AMM information;
- rating breakdown and evidence confidence;
- risk and missing-data labels;
- methodology and timestamp;
- links to supporting sources and ledger explorers;
- correction/request-review workflow.

### Excluded from the first release

- swaps;
- order placement;
- custody;
- private-key handling;
- automatic portfolio advice;
- price predictions;
- “buy”, “sell” or “safe investment” labels;
- paid rating improvement;
- hidden sponsored ranking.

A trading interface should only be considered after the intelligence product is stable, legally reviewed and separately tested.

## Top 50 eligibility

“Top 50” must never be an unexplained popularity list. The directory should publish the exact selection rule and timestamp. Candidate eligibility can be built from a combination of:

- validated XRPL DEX/AMM activity;
- minimum observable liquidity;
- minimum trading-history age;
- identifiable currency and issuer pair;
- non-broken issuer/account state;
- data availability sufficient for at least a provisional score.

Assets with manipulated, unverified or insufficient data may remain visible but should be clearly labelled and may be excluded from ordinal ranking.

## OTT Rating framework

Recommended public score: **0–100**, accompanied by evidence confidence and category details.

### 1. Issuer identity and transparency — 20 points

- issuer address disclosed by the project;
- organization and team evidence;
- consistent domains and official accounts;
- clear contact and jurisdiction information;
- no unresolved identity conflict.

### 2. Ledger configuration and issuer controls — 15 points

- issuer account state and flags;
- freeze, clawback and authorization settings explained;
- trust-line and token configuration documented;
- unusual configuration identified without automatically calling it malicious.

### 3. Liquidity quality — 20 points

- observable DEX and/or AMM liquidity;
- depth across realistic order sizes;
- spread and slippage observations;
- dependence on one pool or pair;
- liquidity stability across time windows.

### 4. Market integrity and concentration — 15 points

- holder concentration;
- issuer-related balances where observable;
- concentration of liquidity providers;
- abnormal volume or circular-activity indicators;
- stale or easily distorted markets.

### 5. Product, utility and execution evidence — 15 points

- product or service evidence;
- roadmap delivery history;
- documentation and technical activity;
- token utility described without return promises;
- measurable execution rather than marketing claims.

### 6. Legal, policy and risk disclosure — 10 points

- terms, risk statements and jurisdiction clarity;
- regulatory warnings or public enforcement evidence;
- restricted-access or compliance limitations;
- transparent token distribution and sale information where relevant.

### 7. Data quality and source confidence — 5 points

- primary sources available;
- independent confirmation;
- recent timestamps;
- conflicts resolved or explicitly displayed.

## Evidence status

Every rating category should show one of:

- **Verified** — supported by strong primary or official evidence;
- **Partial** — some evidence exists but important gaps remain;
- **Unverified** — claim exists but has not been independently confirmed;
- **Missing** — required evidence could not be found;
- **Conflict** — credible sources disagree.

A numerical score without this status is not sufficiently transparent.

## Public labels

Recommended neutral labels:

- Strong evidence base;
- Developing evidence base;
- Limited evidence;
- Significant data gaps;
- Conflicting evidence;
- Insufficient data for rating.

Avoid:

- safe;
- scam;
- guaranteed;
- approved investment;
- will increase;
- risk-free.

## Page structure

### Directory

- Top 50 table/card switch;
- search and filters;
- rating, confidence, issuer and liquidity summary;
- last-updated timestamp;
- methodology link;
- mobile horizontal table containment or stacked cards.

### Asset detail

- currency and issuer pair;
- issuer identity evidence;
- rating and category breakdown;
- DEX/AMM observations;
- holder and liquidity concentration;
- account configuration;
- sources and evidence timeline;
- missing/conflicting evidence;
- request correction or deeper review.

### Issuer detail

- one issuer address may relate to multiple assets;
- verified project identity links;
- account flags and relevant ledger state;
- historical changes;
- all related OTT research cases;
- all assets associated with the issuer.

## Free and premium split

### Free

- Top 50 directory;
- overall rating;
- issuer address;
- basic evidence confidence;
- major risk/data-gap labels;
- educational explanation of each rating category.

### OTT Intelligence Pro

- full score breakdown;
- evidence timeline;
- deeper issuer and organization research;
- concentration and liquidity history;
- change alerts;
- downloadable research summary;
- founder-reviewed conclusion and methodology notes.

No user should have to pay merely to see that serious evidence is missing or conflicting.

## Data pipeline requirements

- store the asset as currency + issuer, never currency code alone;
- timestamp all snapshots;
- preserve raw observations separately from derived scores;
- keep scoring methodology versioned;
- record source URL, source type, authority level and retrieval time;
- make rating changes auditable;
- prevent one failed provider from erasing historical data;
- flag stale snapshots;
- require founder review before a score becomes “verified”.

## Release phases

### Phase 1 — Methodology and issuer join

Connect existing issuer research to a normalized asset/issuer record. Publish no ranking yet.

### Phase 2 — Read-only pilot

Show 10–20 manually reviewed assets with transparent evidence and no ordinal “best” claim.

### Phase 3 — Top 50 directory

Activate the documented eligibility rule, automated observations and founder-reviewed ratings.

### Phase 4 — Alerts and premium depth

Add rating-change alerts, research reports and historical comparisons.

### Phase 5 — Trading feasibility review

Only after legal, security, wallet, slippage, transaction simulation and failure-mode review should OTT decide whether a separate swap/order interface belongs in the product.

## Core rule

The OTT Rating must help a user ask better questions. It must never replace their own judgment or be presented as a promise of price performance.
