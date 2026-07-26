# OTT NFT artwork delivery contract

This document defines the founder artwork handoff for the seven OTT NFT collections.

## Master files

Deliver one approved master artwork per collection:

| Collection | Required filename | Maximum serial |
| --- | --- | ---: |
| OTT Genesis Access Pass | `genesis-access-pass.png` | 500 |
| OTT Public Access Pass | `public-access-pass.png` | 100000 |
| OTT Wallet Tester Pass | `wallet-tester-pass.png` | 100000 |
| OTT XRPL Foundation Certificate | `xrpl-foundation-certificate.png` | 50000 |
| OTT Wallet Foundation Certificate | `wallet-foundation-certificate.png` | 100000 |
| OTT Wallet Security Certificate | `wallet-security-certificate.png` | 100000 |
| OTT XRPL Wallet Operations Certificate | `wallet-operations-certificate.png` | 100000 |

The production location is:

```text
public/nft/approved/
```

## Artwork requirements

- Square canvas: preferably 2000 × 2000 px; minimum 1200 × 1200 px.
- PNG in sRGB, with a sharp readable result at 320 × 320 px.
- Keep important text and emblems at least 8% away from every edge.
- Each collection must have a visibly different emblem, title and visual identity.
- Do not include promises of profit, yield, investment value or ownership in OTT.
- Do not include a fixed serial number in the master artwork.
- Do not include wallet addresses, transaction hashes, personal data or dates that change per holder.
- Founder approval is required before any production metadata points to the artwork.

## Dynamic edition data

OTT adds edition-specific information during metadata/image delivery:

- unique serial number;
- collection name;
- course or wallet-provider identifier where applicable;
- language and curriculum version where applicable;
- credential status and validated issuance references.

This prevents the project from needing thousands of manually edited images while preserving a unique serial for every issued NFT.

## Collection purpose

### Genesis Access Pass

Limited founding-access edition for the first 500 approved participants. Transfer and access policy must remain explicit and must not imply financial rights.

### Public Access Pass

Scalable wallet-neutral access edition for the public learning platform. It is separate from the scarce Genesis collection.

### Wallet Tester Pass

Non-transferable recognition for an account-bound, server-validated wallet integration test after the provider reaches the required OTT verification threshold.

### XRPL Foundation Certificate

Non-transferable proof that the broad XRPL foundation curriculum and required assessment were completed.

### Wallet Foundation Certificate

Non-transferable proof of knowledge about XRPL accounts, addresses, reserves, fees and custody models.

### Wallet Security Certificate

Non-transferable proof of recovery, payload review, signing safety, phishing recognition and incident-response knowledge.

### XRPL Wallet Operations Certificate

Non-transferable proof of practical XRPL operations including payments, issued currencies, trustlines, DEX, AMM, NFTs and validated test-network exercises.

## Production acceptance gate

Artwork is accepted only after all seven checks pass:

1. Founder visually approves the master.
2. Filename and collection mapping are exact.
3. Image renders clearly on desktop and mobile.
4. Contrast and title readability pass the UI review.
5. Metadata purpose and edition limit match repository rules.
6. A test serial renders correctly without covering important artwork.
7. The production metadata URI is verified before any real mint.

A reserved database serial or a UI preview is not an on-ledger NFT. Issuance requires a validated XRPL mint transaction, stored transaction hash and stored NFTokenID.
