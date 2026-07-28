# OTT Visual System & Governance Acceptance Criteria

Branch: `audit/ux-consolidation-20260728`

This file is a release gate. Items remain open until they are visible in the current preview, tested on desktop/mobile and approved by the founder.

## A. One recognizable OTT visual system

- Use one blue → violet → magenta OTT gradient family.
- Use Orbitron only for major product headings and branded labels; body copy stays readable.
- Use consistent radii, borders, shadows, spacing and page widths.
- Use one canonical OTT logo and a reusable family of OTT feature marks.
- Do not mix an old square dashboard layout with the newer rounded OTT product layout.
- Light and dark are two modes of one design system, not separate app identities.

## B. Home and tour

- Home hero must visibly feel like OTT, not a generic SaaS template.
- The Start Tour button is horizontally centred below the main experience instead of floating on the right.
- Tour and page use the same OTT colours, typography and marks.
- Primary action remains visible without long scrolling.

## C. Academy information architecture

The four primary Academy destinations must be clearly recognisable and aligned in one compact control row/grid:

1. Courses
2. Library
3. Wallet Academy
4. NFT Certificate

Each gets a reusable OTT feature mark. These marks become the canonical identifiers wherever these functions are linked elsewhere. No additional full Academy, Wallet Academy or NFT gallery is rendered underneath the active section.

## D. XRPL Tools

- Replace the legacy explorer/dashboard presentation with the canonical OTT hub shell.
- Keep live ledger, account, transaction and SourceTag functions.
- Put the search action above the fold.
- Move detailed network metrics and recent transactions behind compact tabs or expandable sections.
- Use less vertical scrolling and no repeated page introduction.

## E. NFT & Access

- Replace the remaining legacy/duplicated presentation with the canonical OTT hub shell.
- One compact header only.
- Progression overview, filters and seven collection cards have one home.
- Public Access Pass exposes the checkout action on its own card.
- Receiving wallet, paying wallet/provider and payment asset are separate choices.
- XRP and RLUSD are never shown as live until server validation and delivery pass end-to-end tests.

## F. Whitepaper roadmap

The Community/Roadmap hub must link to a dedicated whitepaper roadmap covering phases 1–6.

Phase 6 must describe, as gated concepts rather than promises:

- verified XP-to-utility rules;
- OTT token utility only after technical, abuse-control and legal review;
- transparent monthly NFT-holder utility campaigns;
- OTT utility tokens and/or verified XP as capped, auditable voting leverage;
- no guaranteed value, yield, profit, conversion or airdrop.

## G. Voting with three proven wallets

Voting must work through the three currently targeted signing providers:

- Xaman;
- CROSSMARK;
- GemWallet.

Requirements:

- Use one canonical unsigned XRPL vote transaction definition.
- Xaman may receive a server-created payload.
- CROSSMARK and GemWallet sign and submit the same transaction through their proven provider adapters.
- Connected wallet address must match the signing account.
- Count only validated `tesSUCCESS` transactions matching destination, 1 drop, SourceTag and exact vote memo.
- A newer validated vote replaces the previous vote for the same wallet.
- Display the connected provider and official verified logo.
- Never label a provider live until a signed Testnet/Mainnet proof is captured as required by the release plan.

## H. QA gate

For Home, Academy, XRPL Tools, NFT & Access and Roadmap record:

- desktop EN/NL;
- mobile EN/NL;
- light/dark when theme support is active;
- primary action visibility;
- scroll length and overflow;
- official/canonical logo use;
- direct URL, refresh and back navigation;
- loading, empty and error states;
- console/runtime errors;
- founder approval.
