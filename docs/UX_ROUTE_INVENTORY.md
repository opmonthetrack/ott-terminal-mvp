# OTT Terminal Route Ownership & Duplication Inventory

Branch: `audit/ux-consolidation-20260728`

Status: inventory baseline — no route is removed until its replacement is visible and tested.

## Current route model

The current application contains 36 render routes:

- 18 public routes;
- 3 free-account routes;
- 1 premium route;
- 14 founder-only routes.

The non-founder total is therefore 22. The existing Smoke Test wording that says 17 public routes is stale and must be corrected. The customer interface currently presents 8 hub destinations in the full menu, while the persistent top/mobile navigation shows 4 shortcuts.

## Canonical customer hubs

These eight route IDs remain the stable entry URLs during consolidation. Their labels and internal content may be cleaned up, but old direct links must continue to resolve.

| Canonical route | Final hub | Primary responsibility | Full content that must not appear elsewhere |
|---|---|---|---|
| `home` | Start | orientation, mission, first useful action | Academy, wallet setup, NFT catalogue |
| `academy` | Learn | XRPL Academy, Wallet Academy and learning library | account management, full NFT catalogue |
| `intel` | Explore | ecosystem, institutions, ISO 20022, SWIFT, DeFi, tokenization and sourced research | transaction verification and founder operations |
| `network` | Verify | ledger, transaction, issuer, SourceTag and evidence checks | general discovery feeds |
| `xaman` | Wallets | supported wallets, connection, testing, recovery and signing safety | OTT account profile and full NFT catalogue |
| `wallet` | My OTT | OTT account, progress, activity, owned credentials and personal status | wallet-provider education and collection catalogue |
| `accessgate` | NFT & Access | overview, seven collections, eligibility, access and delivery | complete account and wallet-management flows |
| `roadmap` | Community | voting, quests, support and public results | founder controls |

## Non-founder route disposition

| Current route | Current audience | Primary owner | Decision | Consolidation note |
|---|---|---|---|---|
| `home` | public | Start | KEEP | One compact welcome and one first action above the fold. |
| `academy` | public | Learn | KEEP | Remove full NFT gallery; use eligibility/status links to NFT & Access. |
| `intel` | public | Explore | KEEP / REBUILD HUB | Becomes the single discovery entrance. |
| `network` | public | Verify | KEEP / REBUILD HUB | Becomes the single verification entrance. |
| `xaman` | public | Wallets | KEEP / REBUILD HUB | Provider selection and connection only; official wallet logos required. |
| `wallet` | public | My OTT | KEEP / SPLIT | Account/profile/progress stays; provider education and full NFT gallery leave. |
| `accessgate` | public | NFT & Access | KEEP / CONSOLIDATE | Overview at top, seven compact cards, eligibility and access status. |
| `roadmap` | public | Community | KEEP / CONSOLIDATE | Voting, quests, support summary and public totals. |
| `dashboard` | account | My OTT | MERGE | Progress summary becomes a My OTT section, not a second account homepage. |
| `checkin` | account | My OTT | MOVE NESTED | Personal proof action lives under My OTT activity; Community may link to it. |
| `rewardledger` | account | My OTT | MERGE | One activity/proof history; no second progress dashboard. |
| `source` | public | Verify | MERGE | SourceTag verification becomes a Verify tool. |
| `xrplverify` | public | Verify | MERGE | Transaction verification becomes a Verify tool. |
| `xamanactivation` | public | Wallets | MERGE | Custody, recovery and signing education becomes a Wallets section. |
| `ecosystem` | public | Explore | MOVE NESTED | Explore category; no separate top-level destination. |
| `validator` | public | Explore | MOVE NESTED | Infrastructure category within Explore. |
| `developer` | public | Explore | MOVE NESTED | Technical reference category within Explore. |
| `tokenization` | public | Explore | MOVE NESTED | Tokenization/RWA category within Explore. |
| `news` | public | Explore | MOVE NESTED | Sourced newsroom within Explore. |
| `defi` | public | Explore | MOVE NESTED | DeFi directory within Explore; official logos only. |
| `ottintelligence` | premium | Explore | MOVE NESTED / LOCKED | Premium research mode inside Explore, retaining entitlement checks. |
| `support` | public | Community | MERGE | 0.589, 1.589 and 2.589 XRP support lives in Community with one dedicated detail view. |

## Founder route disposition

Founder routes remain outside normal customer navigation.

| Current route | Decision | Note |
|---|---|---|
| `launch` | KEEP | Founder landing and release control. |
| `pitchmode` | KEEP NESTED | Presentation workflow only. |
| `submission` | KEEP NESTED | Make Waves evidence and delivery pack. |
| `smoketest` | REPLACE QA MODEL | Keep route, replace self-declared checklist with evidence-based route QA. |
| `truthdesk` | KEEP / CONSOLIDATE | Primary founder research and publishing workspace. |
| `ai` | MERGE | AI tools belong inside Truth Desk unless a distinct operational reason is proven. |
| `partners` | REVIEW / NEST | Partner administration under Founder operations. |
| `portfolio` | REVIEW / NEST | Private prototype; no public route. |
| `otttestnet` | KEEP NESTED | Controlled transaction and release testing. |
| `factory` | MERGE TOKEN LAB | Combine with token concept and reward policy where functions overlap. |
| `token` | MERGE TOKEN LAB | One private token/legal workspace. |
| `rewardpolicy` | MERGE TOKEN LAB | One eligibility and reward-policy source of truth. |
| `marketplace` | HIDE UNTIL READY | No customer exposure until real payment and fulfilment are complete. |
| `profile` | REMOVE AFTER MIGRATION | Legacy profile remains only until migration evidence proves it is safe to delete. |

## Confirmed duplicate or overlapping surfaces

1. `NftCollectionGallery` is rendered in both `WalletTab` and `AccessGateTab`.
2. NFT overview and collection artwork are buried below long account/access content instead of having one clear home.
3. `wallet`, `dashboard` and `rewardledger` overlap on profile, progress and activity.
4. `network`, `xrplverify` and `source` overlap on verification.
5. `intel`, `ecosystem`, `validator`, `developer`, `tokenization`, `news`, `defi` and `ottintelligence` overlap on discovery/research.
6. `xaman` and `xamanactivation` overlap on wallets and wallet education.
7. `roadmap` and `support` overlap on community participation and funding.
8. The current dark tour and hardcoded light pages do not share one theme system.
9. Provider buttons use generic icons for some brands instead of verified official assets.

## Scroll and interaction rules

For every canonical hub:

- one title and one primary action must be visible without long scrolling;
- no more than three primary sections before tabs, accordions or drawers;
- detailed content opens on demand;
- mobile must not require scrolling past repeated introductory text to reach the primary action;
- original logos must have controlled dimensions, transparent/appropriate backgrounds and accessible text fallbacks;
- other hubs may show only a compact status card plus a link to the canonical owner.

## First implementation slice: NFT & Access

1. Keep `accessgate` as the canonical URL.
2. Place the progression overview immediately below a compact header.
3. Render seven compact collection cards with Access, Earned and Planned filters.
4. Open full rules/details in a drawer or accordion.
5. Remove `NftCollectionGallery` from `WalletTab`.
6. Remove the duplicate full gallery from the scanner portion of `AccessGateTab` and replace it with the canonical hub layout.
7. My OTT shows only owned NFT status, eligibility and a link to `?tab=accessgate`.
8. Use one collection registry for ID, title, supply, image, status and rule.
9. Resolve the XRPL Foundation Certificate naming/ID mismatch before IPFS or mint activation.

## QA evidence required per route

A route cannot be marked passed from a green build alone. Record:

- exact preview commit;
- desktop EN screenshot;
- desktop NL screenshot;
- mobile EN screenshot;
- mobile NL screenshot;
- light and dark result after theme support exists;
- primary-action visibility;
- scroll/overflow result;
- original-logo result;
- direct URL, refresh and back-navigation result;
- loading, empty and error-state result;
- console/runtime-error result;
- founder approval.
