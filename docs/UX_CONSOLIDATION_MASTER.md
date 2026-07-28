# OTT Terminal UX Consolidation Master

Branch: `audit/ux-consolidation-20260728`

## Release rule

Nothing is considered complete until it is:

1. implemented in code;
2. visible in the Vercel preview;
3. checked on desktop and mobile;
4. checked in English and Dutch;
5. checked in light and dark mode when theme support exists;
6. free from duplicate full-page content;
7. approved by the founder before production merge.

## Product structure

Every complete function has one primary home. Other pages may only show a compact status card and a link to that home.

| Hub | Primary responsibility | Must not duplicate |
|---|---|---|
| Start | orientation, mission, first action | full Academy, wallet or NFT content |
| Learn | Academy, Wallet Academy, XRPL library | account management, NFT gallery |
| Explore | XRPL ecosystem, ISO 20022, SWIFT, DeFi and market research | verification tools and founder controls |
| Verify | transactions, issuers, evidence, token and source checks | general discovery feeds |
| Wallets | wallet selection, connection, testing, recovery and signing safety | account profile and full NFT gallery |
| My OTT | account, progress, activity, owned credentials | complete collection catalogue |
| NFT & Access | NFT overview, seven collections, eligibility, access and delivery status | full account or wallet-management flows |
| Community | roadmap, voting, support, quests and public results | founder operations |
| Founder | QA, issuer, access manager, pitch and operations | public customer navigation |

## Immediate consolidation decisions

### NFT and credentials

- [ ] Create one visible `NFT & Access` hub.
- [ ] Show the progression overview at the top without requiring long scrolling.
- [ ] Show seven compact collection cards with filters: Access, Earned, Planned.
- [ ] Open collection details on demand instead of displaying every explanation at full length.
- [ ] Remove the full gallery from Profile & Wallet.
- [ ] Remove the full gallery from the Access scanner page.
- [ ] Profile shows only owned NFTs, eligibility and one link to the hub.
- [ ] Access shows only access status, scanner, checkout readiness and one link to the hub.
- [ ] Use one canonical collection registry for title, ID, supply, artwork and status.
- [ ] Resolve `XRPL Foundation Certificate` naming and ID differences before IPFS or mint activation.

### Navigation and duplication

- [ ] Inventory every public, account, premium and founder route.
- [ ] Mark every route: keep, merge, move, hide, replace or remove.
- [ ] Eliminate repeated full components across routes.
- [ ] Keep eight or fewer primary customer destinations.
- [ ] Add clear breadcrumbs or back actions for nested content.
- [ ] Add mobile bottom navigation only for the primary destinations.

### Scroll and page density

- [ ] One title and one primary action above the fold.
- [ ] Maximum three primary sections before collapsed or tabbed details.
- [ ] No important action only at the bottom of a long page.
- [ ] Use tabs, accordions, compact cards and detail drawers where appropriate.
- [ ] Test at approximately 390 px, 768 px and desktop widths.
- [ ] Record pages with excessive scroll and reduce them before approval.

### Theme consistency

- [ ] Add one persistent Light / Dark control beside the language control.
- [ ] Use shared theme tokens instead of page-specific hardcoded white or dark palettes.
- [ ] Apply the selected theme to navigation, account, tour, Academy, dialogs and all hubs.
- [ ] Ensure the tour looks like the same app rather than a separate product.

### Brand and logo policy

- [ ] Create one brand registry containing brand name, category, asset path, official source and fallback.
- [ ] Use official wallet logos for Xaman, CROSSMARK, GemWallet, Ledger, Tangem and other supported wallets.
- [ ] Use official project logos for DeFi entries when permission and source are verifiable.
- [ ] Never use a generic Lucide icon as a substitute for an available official brand logo.
- [ ] ISO 20022 is presented as a standard, not as a crypto token or partner endorsement.
- [ ] SWIFT branding is used only with a verified official asset and neutral factual wording.
- [ ] MiCAR is presented as EU regulation; use an EU/regulation treatment rather than inventing a MiCAR company logo.
- [ ] Every local brand image is reviewed for source, dimensions, transparency, crop and visual quality before commit.

## Brand assets awaiting review

These files are currently local and untracked. They are not approved merely because they exist.

- `public/brand/defi/anodos.png`
- `public/brand/defi/doppler-finance.png`
- `public/brand/defi/flarenetwork.png`
- `public/brand/defi/soil.png`
- `public/brand/defi/xmagnetic.webp`
- `public/brand/wallets/xaman.jpg`

For each asset record:

- official source URL;
- download date;
- license or brand-use basis;
- dimensions and format;
- whether dark/light variants exist;
- approved, replace or reject.

## Real QA matrix

A green build is necessary but not sufficient. Every route must be opened and inspected.

| Check | Desktop EN | Desktop NL | Mobile EN | Mobile NL |
|---|---:|---:|---:|---:|
| Route renders | ☐ | ☐ | ☐ | ☐ |
| Correct title and purpose | ☐ | ☐ | ☐ | ☐ |
| Primary action visible | ☐ | ☐ | ☐ | ☐ |
| No duplicate full content | ☐ | ☐ | ☐ | ☐ |
| No horizontal overflow | ☐ | ☐ | ☐ | ☐ |
| Acceptable scroll length | ☐ | ☐ | ☐ | ☐ |
| Images and logos correct | ☐ | ☐ | ☐ | ☐ |
| Empty, loading and error states | ☐ | ☐ | ☐ | ☐ |
| Keyboard and touch targets | ☐ | ☐ | ☐ | ☐ |
| Back, refresh and direct URL | ☐ | ☐ | ☐ | ☐ |
| Console/runtime errors absent | ☐ | ☐ | ☐ | ☐ |

## Current known findings

- [ ] The full NFT gallery currently appears in more than one page.
- [ ] The NFT overview is not exposed as a clear primary destination.
- [ ] The existing Smoke Test is a manual checklist and does not itself prove every page was viewed.
- [ ] The route audit verifies source-code contracts but not visual usability.
- [ ] Public-route counts and visible hub counts need one documented model.
- [ ] Account provider icons are not all official brand logos.
- [ ] Light pages and the dark tour are not yet controlled by one theme system.
- [ ] Main production and the release preview currently show different generations of the app.

## Work order

1. Route and duplication inventory.
2. NFT & Access consolidation.
3. Main navigation and page ownership cleanup.
4. Brand registry and logo verification.
5. Scroll and mobile interaction cleanup.
6. Shared Light / Dark theme.
7. Full route-by-route visual QA with evidence.
8. Founder review and explicit approval.
9. Reconcile with current `main` without dropping either side's valid fixes.
10. Production merge only after all release gates pass.
