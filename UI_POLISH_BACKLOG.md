# XRPL OnTheTrack Terminal — UI Polish Backlog

## Status

Do not start UI polish until the smoke test and live app review are complete.

Current rule:

```txt
Function first.
Green build first.
Live app review first.
UI polish after.
```

## UI Polish Goal

Make the app feel:

```txt
premium
clear
XRPL-native
judge-ready
partner-ready
OnTheTrack branded
```

## Brand Direction

Core style:

```txt
black / white
minimal
high contrast
corporate cyberpunk
clean cards
sharp typography
optional gold/silver accents
no messy colors
```

Avoid:

```txt
too many gradients
too many colors
busy cards
unclear buttons
small unreadable text
random icons
```

## Polish Priority 1 — Sidebar

Current issue to review:

```txt
Many tabs can feel overwhelming.
```

Goal:

```txt
Group tabs by purpose.
```

Possible groups:

```txt
Core
Proof
Rewards
Partners
Services
Access
Demo
Submission
Advanced
```

Example:

```txt
Core:
Dashboard
Daily Check-In
SourceTag Monitor
Smoke Test

Proof:
Xaman Center
XRPL Verify
Proof Stamp / Partner Hub

Rewards:
Reward Ledger
Reward Policy
OTT Testnet

Services:
Truth Desk
Access Gate

Demo:
Pitch Mode
Submission Pack
```

## Polish Priority 2 — Dashboard

Goal:

```txt
A judge understands the project within 10 seconds.
```

Dashboard should show:

```txt
Project name
SourceTag 2606170002
Education-first positioning
No custody / no broker / no yield / no trade execution
Main demo route
XP summary
Next recommended action
```

## Polish Priority 3 — Partner Hub

Goal:

```txt
Make partner routes easier to scan.
```

Improve:

```txt
route cards
risk labels
official link buttons
checklist spacing
Proof Stamp area
selected partner clarity
```

## Polish Priority 4 — Truth Desk

Goal:

```txt
Make paid question / 1-on-1 flow simple and safe.
```

Improve:

```txt
Ask Truth card
1-on-1 card
payment explanation
risk/legal disclaimer
tx verify section
next steps after verified payment
```

## Polish Priority 5 — Access Gate

Goal:

```txt
Make access payment routes understandable.
```

Improve route cards:

```txt
Fiat route = external provider
XRP route = payment access
RLUSD route = concept / future
NFT Access Pass = access utility, not investment
```

Make clear:

```txt
Access payment unlocks app access only.
No investment promise.
No token value promise.
```

## Polish Priority 6 — Reward Ledger

Goal:

```txt
Make XP and reward state easy to understand.
```

Improve:

```txt
Total XP card
eligible XP card
mainnet locked card
latest events
partner proof stamps
testnet simulation events
```

Important wording:

```txt
XP is off-chain.
XP has no guaranteed financial value.
Mainnet token distribution is locked until legal review.
```

## Polish Priority 7 — Pitch Mode

Goal:

```txt
Make demo presentation smoother.
```

Improve:

```txt
step transitions
speaker script readability
what-to-show cards
copy script button
2-minute timeline
```

## Polish Priority 8 — Submission Pack

Goal:

```txt
Make hackathon submission easy to copy.
```

Improve:

```txt
deliverable status badges
copy blocks
demo order
red flag avoidance
links to docs
```

## Polish Priority 9 — Mobile

Test on:

```txt
desktop
tablet
mobile
```

Fix:

```txt
sidebar overflow
small card text
button stacking
QR code size
forms on narrow screens
```

## Polish Priority 10 — Final Screenshots

Prepare screenshots for:

```txt
Dashboard
Partner Hub
Proof Stamp
XRPL Verify
Reward Ledger
Truth Desk
Access Gate
Pitch Mode
Submission Pack
Smoke Test passed
```

## UI Polish Order

When smoke test passes, polish in this order:

```txt
1. Sidebar grouping
2. Dashboard hero
3. Partner Hub
4. Truth Desk
5. Access Gate
6. Reward Ledger
7. Pitch Mode
8. Submission Pack
9. Mobile responsiveness
10. Final screenshots
```

## Do Not Change During UI Polish

Do not change:

```txt
SourceTag 2606170002
api/ott.ts action names
Xaman client function names
XRPL verification logic
Reward Store event names
Legal-safe wording
MVP scope
```

## Final Visual Goal

The user should feel:

```txt
This is serious.
This is clean.
This is safe.
This is XRPL.
This is OnTheTrack.
```
