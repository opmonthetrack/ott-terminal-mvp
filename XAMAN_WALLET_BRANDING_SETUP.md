# Xaman + OTT Wallet Branding Setup

## Goal

When a user signs or pays with Xaman, the flow should feel branded:

```txt
OnTheTrack visible
OTT logo visible
SourceTag 2606170002 visible
correct wallet role visible
smooth return to OTT Terminal
```

## Important Reality Check

A raw XRPL wallet address cannot carry a logo inside the address itself.

Branding must be handled through:

```txt
1. Xaman Developer Console app name/icon
2. Xaman payload instruction/custom_meta
3. Return URL back to OTT Terminal
4. XRPL domain verification for wallet identity
5. xrp-ledger.toml public identity file
```

## Three OTT Wallet Roles

Use these three roles consistently:

```txt
OTT_PROOF_DESTINATION_WALLET
OTT_TRUTH_DESK_WALLET
OTT_ACCESS_WALLET
```

Suggested labels:

```txt
OTT Proof Wallet
OTT Truth Desk Wallet
OTT Access Wallet
```

## Required Public Logo

Logo must exist here:

```txt
public/logo.png
```

Public URL should become:

```txt
https://YOUR-DOMAIN/logo.png
```

## Required Environment Variable

Add this in Vercel:

```txt
OTT_PUBLIC_APP_URL=https://YOUR-DOMAIN
```

Example:

```txt
OTT_PUBLIC_APP_URL=https://ott-terminal.vercel.app
```

Do not include slash at the end.

## Xaman Developer Console Setup

In the Xaman Developer Console, update the app connected to your API key:

```txt
App name: XRPL OnTheTrack Terminal
App logo/icon: upload public/logo.png
App description: XRPL Explorer + Xaman Dashboard + OTT Proof/Education
Website: your OTT Terminal domain
```

This is what controls the app branding users see inside Xaman for your API-key based payloads.

## Payload Branding

Every Xaman payload should include:

```txt
custom_meta.identifier
custom_meta.instruction
custom_meta.blob.brand
custom_meta.blob.logoUrl
custom_meta.blob.sourceTag
custom_meta.blob.walletIdentities
options.return_url
```

The backend router file has been updated to auto-inject:

```txt
brand: XRPL OnTheTrack Terminal
logoUrl: https://YOUR-DOMAIN/logo.png
sourceTag: 2606170002
walletIdentities:
  proof
  truthDesk
  access
```

## Return URL

After signing, Xaman should return user to:

```txt
https://YOUR-DOMAIN/?xaman_return=1
```

The frontend then verifies payload and opens Wallet Dashboard.

## XRPL Domain Verification

To make wallet identity more trustworthy, set a verified domain for the relevant XRPL accounts.

High-level flow:

```txt
1. Put xrp-ledger.toml on your domain
2. Add your three wallet addresses in xrp-ledger.toml
3. Set Domain field on each XRPL account with AccountSet
4. Verify the domain connection
```

## xrp-ledger.toml Direction

Create this later at:

```txt
public/.well-known/xrp-ledger.toml
```

Include:

```toml
[[ACCOUNTS]]
address = "PASTE_OTT_PROOF_DESTINATION_WALLET"
desc = "OTT Proof Wallet — XRPL OnTheTrack Terminal"

[[ACCOUNTS]]
address = "PASTE_OTT_TRUTH_DESK_WALLET"
desc = "OTT Truth Desk Wallet — XRPL OnTheTrack Terminal"

[[ACCOUNTS]]
address = "PASTE_OTT_ACCESS_WALLET"
desc = "OTT Access Wallet — XRPL OnTheTrack Terminal"
```

## Transaction Memo Style

Use readable memos:

```txt
OTT_PROOF_STAMP
OTT_TRUTH_DESK
OTT_ACCESS
OTT_MAKE_WAVES
```

Each memo should include:

```txt
OnTheTrack
route name
SourceTag 2606170002
```

## Customer-Facing Labels

Use simple labels:

```txt
OTT Proof Wallet
OTT Truth Desk Wallet
OTT Access Wallet
```

Avoid showing only raw addresses unless needed.

## Final Customer Experience

The customer should see:

```txt
OTT logo in Xaman app branding
OnTheTrack instruction in sign request
SourceTag 2606170002 in proof context
correct route name
smooth return to OTT Terminal
wallet dashboard opens
```

## Test Checklist

Test on:

```txt
iPhone Safari
iPhone Chrome
Android Chrome
Android Samsung Browser
Desktop Chrome
Desktop Edge
```

Check:

```txt
Logo visible in Xaman app profile/payload screen
Xaman app opens from mobile
User signs
User returns to OTT Terminal
Wallet Dashboard opens
Correct wallet route shown
No lost payload
No blank page
No horizontal mobile overflow
```
