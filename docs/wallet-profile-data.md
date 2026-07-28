# Universal XRPL wallet profile data

The profile is provider-neutral and reads only public validated ledger data.

## Core

- classic address
- active network
- validated ledger index
- XRP balance
- sequence
- owner count
- account flags
- domain

## Assets and objects

- trustline count
- non-zero token line count
- NFT count
- DEX offer count
- escrow count
- signer list count
- payment channel count
- check count
- deposit preauthorization count
- loaded object count

## Verification display

- **Ownership verified:** a supported provider or signed request returned the address.
- **Read-only:** a visitor entered a public address; no ownership claim is made.

Read-only profiles must never unlock paid access, vote, mint, claim XP or receive credentials.
