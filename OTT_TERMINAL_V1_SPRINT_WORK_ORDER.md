# OTT Terminal V1.0 Sprint — Quick Work Order

## Vandaag: geen demo-gevoel meer

### 1. Navigatie schoonmaken
- Alleen V1-relevante groepen standaard zichtbaar:
  - V1 Terminal
  - Proof / Education
  - Services / Access
- Demo / QA en Labs / Advanced staan achter een toggle.
- Alle menu-labels hebben NL/EN basis.

### 2. Niet aanraken
- api/ott.ts
- Xaman login
- Xaman return handler
- Wallet dashboard logic
- NFT scanner helper
- Disabled mint route blijft disabled tot flow safe is.

### 3. Volgende tab-content polish
Prioriteit:
1. Academy — LOI/radartraining-achtige e-learning
2. Access Gate — free/paid status professioneel
3. Marketplace/Webshop — shop placeholder + Shopify roadmap
4. Partner Hub — leer/partner routes
5. Truth Desk — premium service page
6. Reward Ledger — XP/proof overzicht

## V1.0 navigatie

### Free / public
- Start
- XRPL Verkenner
- Wallet Overzicht
- Portfolio
- SourceTag
- Xaman Center
- XRPL Verificatie
- Academy intro
- Webshop preview

### Paid / access gated
- Full Academy
- Truth Desk
- Partner Hub
- Reward Ledger
- Premium wallet / proof tools
- Downloads / services

### Hidden / Labs
- Pitch Mode
- Submission Pack
- Smoke Test
- Legacy Dashboard
- Launch Control
- Advanced modules

## Access strategy

V1 live:
- Xaman login
- Wallet scan
- NFT pass found = access open
- No NFT = paid route
- Payment/access stored server-side
- NFT fulfillment can be admin/manual first

V1.1:
- Safe mint/transfer queue
- NFTokenID stored
- Automated fulfillment
- Shopify webhook integration

## Commit message

```txt
V1 navigation cleanup + NL/EN menu + Labs hidden
```
