# OTT Terminal

OTT Terminal is an education-first XRP Ledger platform for learning, source-led research, wallet safety, public proof and NFT-based utility access.

- Live app: [ott-terminal-mvp.vercel.app](https://ott-terminal-mvp.vercel.app)
- Make Waves SourceTag: `2606170002`
- Stack: React, TypeScript, Vite, Tailwind CSS, Vercel Functions, Supabase and XRPL JSON-RPC

## Product model

```text
Free to learn
Wallet to prove
Pass to unlock
```

Visitors can explore the platform without connecting a wallet. An OTT account stores verified progress. A self-custody wallet is used only when an XRPL signature, ownership proof, payment or NFT action is required.

OTT Terminal does not custody funds, request recovery secrets, execute hidden transactions, provide financial advice, promise yield or guarantee an NFT’s resale value.

## Public navigation

The public product is organized into nine hubs:

1. Home
2. Learn
3. Explore
4. XRPL Tools
5. Profile & Wallet
6. Progress
7. Access & Credentials
8. Community
9. Support OTT

Advanced founder, issuer and QA routes are protected separately and do not appear in the public navigation.

## Wallet Hub

The Wallet Hub separates a public XRPL account from the wallet application used to authorize actions.

| Provider | Status | Current behavior |
| --- | --- | --- |
| Xaman | Live | Server-created sign-in and transaction payloads with verified return routes |
| CROSSMARK | Beta | Direct browser-extension detection and sign-in |
| GemWallet | Beta | Direct browser-extension detection, address and network access |
| WalletConnect | Planned | Official information route until a reviewed Reown configuration is available |
| Joey Wallet | Planned | Official information route pending WalletConnect validation |
| Katz Wallet | Planned | Official information route pending WalletConnect validation |
| MetaMask XRPL Snap | Planned | Official information route pending a reviewed Snap integration |
| Ledger | Planned | Official information route pending a reviewed hardware transport |

Only Xaman, CROSSMARK and GemWallet are presented as connectable today. Planned providers open their official information pages instead of pretending that a connector is live.

Users can also open any valid XRPL classic address as a read-only profile. Read-only access never proves ownership and cannot sign.

## NFT & Access

The Access & Credentials hub contains seven clearly separated routes:

- Genesis Access Pass — founder/community reward, not for sale
- Public Access Pass — public utility pass
- Wallet Tester Pass — earned wallet-provider testing credential
- XRPL Foundation Certificate — earned learning credential
- Wallet Foundation Certificate — earned wallet credential
- Wallet Security Certificate — earned security credential
- XRPL Wallet Operations Certificate — planned practical credential

The Public Access Pass price is fixed at:

```text
1.589 XRP
1,589,000 drops
```

The protected lifecycle is:

```text
OTT account
→ receiving wallet
→ Xaman payment request
→ validated XRPL payment
→ unique serial reservation
→ NFT mint request
→ free targeted transfer offer
→ receiving-wallet acceptance
→ validated ownership
→ utility access
```

Payment alone never unlocks access. The server validates the destination, amount, SourceTag, transaction result and payer before reserving an NFT. Access requires validated ownership.

### Network safety

Real signing is disabled unless `OTT_ACCESS_PASS_XRPL_NETWORK` is explicitly configured.

- Start with `TESTNET`.
- Use an RPC endpoint matching the selected network.
- Complete the entire payment-to-ownership lifecycle on Testnet.
- Set `OTT_ACCESS_PASS_TESTNET_VALIDATED=true` only after documented validation.
- Enable `MAINNET` only after that gate has passed.

The current safe default is to remain blocked rather than silently submit a real XRP payment with incomplete configuration.

## Support OTT

The support page is a separate public hub. It offers voluntary Xaman payments of:

```text
0.589 XRP
1.589 XRP
2.589 XRP
```

Every accepted support transaction uses SourceTag `2606170002`. Public totals include only fully validated XRPL transactions with a successful transaction result.

Support creates no NFT, access, token, equity, governance or investment rights.

## Roadmap voting

Roadmap voting uses one consolidated Vercel Function:

```text
api/roadmap-vote.ts
```

Supported actions:

```text
xaman.createRoadmapVotePayload
xrpl.prepareRoadmapVoteTransaction
xrpl.getRoadmapVoteStats
```

Xaman, CROSSMARK and GemWallet share the provider-neutral transaction preparation and public statistics flow.

## Supabase

Supabase stores authenticated progress, wallet links, access grants, NFT issuance records and Access Pass orders.

Migrations live in:

```text
supabase/migrations/
```

The Access Pass order and serial-reservation layer is defined in:

```text
supabase/migrations/20260722_access_pass_orders_and_delivery.sql
```

Browser clients use a publishable key. Service-role or secret keys are server-only and must never use a `VITE_` prefix.

## Local development

Requirements:

- Node.js 20 or newer
- npm

Install and run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Production validation:

```bash
npm run quality
```

This runs:

```text
public route audit
TypeScript validation
production build
```

## Environment variables

Copy `.env.example` and configure only the services you need. Important groups are listed below; `.env.example` remains the canonical inventory.

### Public Supabase client

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### Server-side Supabase

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Xaman server integration

```text
XAMAN_API_KEY=
XAMAN_API_SECRET=
OTT_PUBLIC_APP_URL=
```

### Access Pass

```text
OTT_ACCESS_WALLET=
OTT_ACCESS_PASS_ISSUER_WALLET=
OTT_ACCESS_PASS_XRPL_NETWORK=TESTNET
OTT_ACCESS_PASS_XRPL_RPC_URL=https://s.altnet.rippletest.net:51234/
OTT_ACCESS_PASS_TESTNET_VALIDATED=false
OTT_ACCESS_PASS_IMAGE_URI=
OTT_ACCESS_PASS_NFT_TAXON=2606170002
OTT_ACCESS_PASS_NFT_FLAGS=0
```

### Founder authorization

```text
OTT_MINT_ADMIN_EMAILS=
OTT_MINT_ADMIN_USER_IDS=
```

Never commit real credentials or paste service-role, Xaman or wallet secrets into issues, pull requests or browser code.

## Main server routes

| Route | Responsibility |
| --- | --- |
| `api/ott.ts` | Core Xaman and OTT proof actions |
| `api/roadmap-vote.ts` | Consolidated roadmap voting |
| `api/access-payment.ts` | Access Pass readiness, payment and delivery lifecycle |
| `api/support-payment.ts` | Voluntary support payloads and validated totals |
| `api/nft.ts` | NFT inspection and legacy issuer operations |
| `api/news.js` | Source-led XRPL news and intelligence |

## Repository safeguards

- Public routes are enforced by `scripts/audit-public-routes.mjs`.
- Founder routes require both client and server authorization.
- Wallet secrets and recovery phrases are never requested.
- NFT delivery uses server-side validation and database constraints.
- Mainnet Access Pass signing remains gated behind complete Testnet validation.
- The app uses one shared typography system across public pages and tabs.

## Legal and product boundary

OTT Terminal is an education, research, verification and utility-access platform. It is not a bank, broker, exchange, custodian or investment product. Users inspect and approve every wallet action in their own self-custody wallet.
