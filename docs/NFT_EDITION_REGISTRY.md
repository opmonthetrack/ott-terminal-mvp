# OTT NFT Edition Registry

This registry is the current source of truth for NFT collection identity and serial allocation.

## 1. OTT Access Pass

- Collection ID: `ott-access-pass-v1`
- Purpose: access utility for OTT Terminal
- Reserved edition: `#001` through `#500`
- Serial format: three digits
- Academy completion does not consume an Access Pass serial.

## 2. OTT XRPL Foundation Certificate

- Collection ID: `ott-xrpl-foundation-certificate-v1`
- Purpose: optional on-chain certificate after verified Foundation completion
- Reserved edition: `#0001` through `#5000`
- Serial format: four digits
- This is a separate collection from the OTT Access Pass.

## Certificate eligibility

A Foundation Certificate cannot be issued until all of the following exist and pass validation:

1. All required Academy courses are completed.
2. Every required AI-assessed answer has passed.
3. The randomized Foundation final assessment has passed.
4. Completion is stored server-side under a verified OTT account.
5. The receiving XRPL wallet is connected and ownership is proven.
6. The completion has not already claimed a certificate serial.
7. The user explicitly confirms the optional mint or delivery action.
8. The image, metadata, URI and public verification record have been validated.

## Current production status

- Access Pass edition: reserved; implementation already belongs to the access product.
- Foundation Certificate edition: reserved; artwork, metadata, final assessment and claim service are not production-ready yet.
- Course completion badges remain off-chain until a separate edition policy is approved.

## Implementation source

The matching application constants are defined in:

`src/lib/nftEditionRegistry.ts`

Any mint, metadata, claim or verification code must import or mirror those identifiers and limits. Do not infer collection identity from the serial number alone.
