# OTT UX Reset — Explore, Wallet Safety & Token Research Lab

Status: product blueprint for `feature/ui-reset-auth-first`

## Product principle

OTT must teach first, verify second and only then send the user to an external protocol. The interface must remain neutral, source-driven and calm. It must never label a project or token as a scam. It reports observed facts, missing evidence, contradictions and risk indicators.

## New top-level structure

The customer navigation remains limited to:

1. Home
2. Learn
3. Explore
4. Profile

The old sidebar stays removed.

## 1. Explore

Explore becomes a clean XRPL ecosystem directory inspired by a market table, but not a noisy trading terminal.

### Filters

- All
- Native XRPL
- Lending
- DEX / AMM
- Tokens
- NFTs
- RWA / Custody
- Cross-chain
- Research tools
- High complexity

### Table fields

- Project
- Network / chain
- Category
- Custody model
- Wallet support
- Live status
- TVL / volume when verifiable
- Data timestamp
- Learn button

Market-cap, TVL and volume must show the data provider and retrieval time. Missing data is displayed as `Not independently verified`, never as zero.

### Learning gate

Each protocol opens into a short Learn page before the external link becomes the primary action.

Required sections:

- What the product does
- Where the assets move
- Who controls the keys
- Smart-contract, issuer or counterparty risk
- Withdrawal / lock-up conditions
- Jurisdiction and legal entity when available
- Audits and source links
- What remains unverified
- Acknowledgement: `I understand the main risks`
- External action: `Open official platform`

The gate is education, not an endorsement or access restriction. The official URL must always be clearly identified and external links open in a new tab.

### Initial directory candidates

Native XRPL and related:

- XRPL native DEX / AMM
- Orchestra Finance
- Anboto
- XPMarket
- Magnetic
- Sologenic
- onXRP / onXah ecosystem routes where verified
- XRP.cafe
- OnTheDEX
- Soil XRPL
- Doppler Finance

Institutional / infrastructure learning cards:

- XLS-66 Lending Protocol
- Evernorth
- Hex Trust
- Tenity
- Zodia Custody
- Archax

Cross-chain learning cards:

- Flare / FXRP
- XRPL EVM Sidechain
- Axelar bridge and interoperability

### Accuracy rules

- XLS-66 must be presented as a proposed / voting protocol until activation is confirmed from XRPL amendment data.
- Evernorth must be described as intending to use the lending protocol; OTT must not claim Evernorth created XLS-66.
- Nasdaq language must distinguish an announced or pending business combination from a completed public listing.
- A dApp ranking is a dated snapshot from its data provider, not a permanent ecosystem ranking.
- Cross-chain XRP representations are not native XRP on XRPL. The report must explain bridge, agent, collateral and smart-contract dependencies.

## 2. Wallet Safety

Wallet selection is separate from normal OTT account login.

### Wallet card data

Every wallet card shows:

- OTT compatibility score
- Self-custodial, hardware-assisted or custodial model
- Where private keys are stored
- Whether the user can export or recover the account secret
- Recovery portability to another XRPL-compatible wallet
- What happens if the wallet company or backend disappears
- Mobile / browser / hardware dependencies
- Supported transaction capabilities
- Provider legal entity and jurisdiction when verified
- Regulatory status: `not checked`, `non-custodial software`, or verified authorisation reference
- Last verification date

### Important distinction

The compatibility percentage measures how much of OTT's planned XRPL functionality works with the wallet. It is not a safety rating and not a regulatory approval score.

### Xaman education

Explain clearly:

- XRP, issued tokens and XRPL NFTs are ledger assets, not stored inside the Xaman company.
- Xaman is a self-custodial interface; keys remain on the user's device.
- With the correct account secret, an XRPL account can be imported into another compatible wallet.
- Losing the account secret can make recovery impossible.
- Xaman card accounts require a configured backup / recovery route because their key is not extractable.
- Some Xaman services and xApps can still depend on company infrastructure even though core signing and ledger ownership are separate.

### Other-wallet verification checklist

Do not assume equivalence. Before publishing a wallet claim, test and document:

- Account import / export standard
- Native XRPL account ownership
- Secret, mnemonic or hardware recovery path
- Payment, memo and destination tag
- TrustSet
- OfferCreate and AMM operations
- NFT mint / transfer / offer
- Sign-in and session connection
- Mobile return flow
- Dependency on proprietary servers
- Company shutdown scenario

### Legal wording

OTT must not state that a wallet is MiCA compliant solely because it is available in Europe. Non-custodial wallet software and providers holding customer assets have different regulatory positions. Display evidence and authorisation references rather than making broad compliance claims.

## 3. Token Research Lab

Working description: `Independent XRPL Token Research`.

This is the main call-to-action area where users contribute verifiable material and receive a neutral evidence report.

### Input model

An XRPL issued token does not use a single EVM-style contract address. Minimum identification is:

- Issuer r-address
- Currency code, including hex currency code where applicable
- Optional known project name

Additional inputs:

- Founder / treasury / distribution wallet addresses
- Official website
- Social profiles
- Whitepaper upload
- Roadmap upload
- Tokenomics document upload
- Audit upload
- Legal entity and registration documents
- Claimed supply, market cap, holders, reserves, burn or blackhole percentage
- User notes and questions

Supported document types initially: PDF and plain text. Later: DOCX and website snapshot ingestion.

### Automated ledger analysis

The analysis engine should retrieve and calculate where technically available:

- Issuer account settings
- Domain and account metadata
- Master-key disabled status
- Regular key and signer list
- Default Ripple
- Require Auth
- Global Freeze
- No Freeze
- Clawback ability
- Deposit Auth
- Blackhole evidence
- Trustline count and active holder estimate
- Issued supply estimate
- Top holder concentration
- Founder / treasury wallet concentration
- AMM pools
- DEX order-book depth
- Recent transaction activity
- Liquidity and volume from named external providers
- Price-source disagreement
- Wallet relationships and repeated funding patterns
- NFT or MPT relationships when relevant

### Document and claim verification

Extract claims from uploaded files and compare each claim against observed evidence.

Examples:

- Claimed supply vs ledger-derived supply
- Claimed market cap vs observed price multiplied by defensible circulating supply
- Claimed holder count vs trustline / balance evidence
- Claimed burn vs inaccessible or blackholed balances
- Claimed locked allocations vs escrow, multisign or identifiable custody evidence
- Roadmap milestones vs dated public releases and ledger activity
- Named partners vs first-party confirmation
- Audit claims vs uploaded audit and auditor identity

Each claim receives one of:

- Confirmed by current evidence
- Partially supported
- Not independently verified
- Contradicted by observed data
- Not measurable with available data

### Neutral report output

OTT never outputs `scam` or `safe investment`.

Report sections:

1. Executive summary
2. Identity confidence
3. Ledger control analysis
4. Supply and distribution
5. Liquidity and market quality
6. Founder / connected-wallet concentration
7. Documents and roadmap consistency
8. Operational transparency
9. Legal and regulatory evidence
10. Missing evidence
11. Positive indicators
12. Risk indicators
13. Questions the user should ask
14. Sources and timestamps
15. Methodology and limitations

### Scoring model

The report uses an `Evidence Confidence Score`, not an investment score.

Suggested weighted model:

- Token identity and issuer clarity: 10
- Ledger controls and issuer privileges: 15
- Supply verifiability: 15
- Distribution and concentration: 15
- Liquidity and market-data quality: 15
- Founder / treasury transparency: 10
- Whitepaper and roadmap consistency: 10
- Legal, audit and operational evidence: 10

Total: 100.

Every category must display:

- Points earned
- Available evidence
- Missing evidence
- Why the score changed

A low score means evidence is incomplete, contradictory or concentrated. It does not prove fraud.

### Separate risk indicators

Do not compress every issue into one number. Show independent flags:

- Issuer control risk
- Concentration risk
- Liquidity risk
- Market-data confidence
- Documentation consistency
- Counterparty risk
- Cross-chain / bridge risk
- Regulatory-evidence status

### Community evidence contribution

Users may upload additional evidence. More data improves comparison, but does not automatically improve the project's score.

Controls required:

- Files private by default
- Explicit permission before sharing a document with the public evidence library
- File hash and upload timestamp
- Duplicate detection
- Source type and uploader declaration
- Malware scanning
- Personal-data warning and redaction option
- Version history
- Dispute / correction process
- No anonymous allegation presented as fact

### AI rules

The AI agent must:

- Separate ledger facts, third-party facts, project claims and inference
- Cite every major conclusion
- Show data timestamps
- State uncertainty
- Avoid financial advice
- Avoid definitive criminal or fraud accusations
- Never invent market cap, holder count or legal status
- Prefer `unknown` over an unsupported estimate
- Explain methodology in understandable language

## Implementation phases

### Phase A — UX shell

- Build new Explore screen
- Add category filters and calm table / card view
- Add Learn-before-link protocol detail page
- Add Wallet Safety section
- Add Token Research Lab call-to-action and input form mock-up

### Phase B — XRPL evidence engine

- Issuer + currency identification
- Account flags and blackhole analysis
- Trustline and distribution analysis
- DEX / AMM evidence
- Source timestamps and report schema

### Phase C — document analysis

- Private uploads
- Text extraction
- Claim extraction and evidence comparison
- Neutral report generation

### Phase D — live external data

- Provider adapters for market, liquidity, TVL and dApp data
- Conflict detection between providers
- Scheduled refresh and stale-data warnings

### Phase E — governance and quality

- Community evidence contributions
- Corrections and disputes
- Methodology versioning
- Human-review workflow for public reports

## Non-negotiable safeguards

- OTT does not custody user assets.
- OTT never asks for a seed phrase or private key.
- Wallet connection is not normal account login.
- External projects are not endorsed merely by being listed.
- Uploaded files are private unless the user explicitly publishes them.
- Scores always include methodology, source timestamps and limitations.
- No `scam` verdicts and no guaranteed-return language.
