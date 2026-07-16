# OTT Terminal Access Pass Metadata Standard

This document defines the production-facing metadata standard for OTT Terminal Access Pass NFTs.

The earlier test NFTs proved that minting, send offers and accept offers work. They also showed that using one fixed metadata file makes multiple NFTs appear with the same name, such as `OTT Access Pass #001`. That is acceptable for testing, but not for paid or promotional users.

## Production naming

Use unique names per pass:

```txt
OTT Terminal Access Pass — Founder #001
OTT Terminal Access Pass — Founder #002
OTT Terminal Access Pass — Early Supporter #001
OTT Terminal Access Pass — Community #001
```

Use `Test` only for internal QA:

```txt
OTT Terminal Access Pass — Test #001
```

## Production description

```txt
Utility access pass for XRPL OnTheTrack Terminal. Founder edition 001. This NFT can be used to verify access inside the terminal. It is not an investment, does not provide yield, and does not promise resale value.
```

## Required attributes

```json
[
  { "trait_type": "Type", "value": "Utility Access" },
  { "trait_type": "Tier", "value": "Founder" },
  { "trait_type": "Edition", "value": "001" },
  { "trait_type": "SourceTag", "value": "2606170002" },
  { "trait_type": "Issuer", "value": "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q" },
  { "trait_type": "Network", "value": "XRPL Mainnet" },
  { "trait_type": "Value Promise", "value": "None" },
  { "trait_type": "Yield Promise", "value": "None" }
]
```

## Safe memo copy

Use human-readable memo copy instead of developer-debug language.

### Mint memo

```txt
OTT Access Pass mint • Utility access only • SourceTag 2606170002
```

### Transfer memo

```txt
OTT Access Pass transfer • Utility access only • SourceTag 2606170002
```

## Xaman instruction copy

### Mint

```txt
Mint OTT Terminal Access Pass. Utility access only — no investment, no yield, no resale value promise.
```

### Transfer / send offer

```txt
Send OTT Terminal Access Pass to the selected wallet. The receiver accepts the NFT offer in Xaman. Utility access only — no investment or value promise.
```

## Workflow for production passes

1. Choose tier: Founder, Early Supporter, Community or Test.
2. Choose edition number: 001, 002, 003, etc.
3. Generate metadata JSON with a unique name and description.
4. Upload the metadata JSON to Pinata/IPFS.
5. Use that metadata URI in the mint payload.
6. Verify the NFT in issuer wallet.
7. Send the NFT to the receiver through a 0 XRP NFT offer.
8. Receiver accepts in Xaman.
9. Access Gate verifies issuer + taxon + metadata URI/CID.

## Important

Existing test NFTs should stay marked as proof/testing. Do not promote them as the commercial collection.

Production NFTs should use unique metadata files so Xaman displays clean names and editions.
