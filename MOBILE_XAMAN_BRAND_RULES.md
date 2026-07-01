# XRPL OnTheTrack Terminal V2 — Mobile Xaman + Brand Rules

## Priority

From this point forward the app must be:

```txt
mobile-first
Xaman-first
brand-consistent
customer-smooth
premium
```

## Main Product Structure

Keep the 3-layer structure:

```txt
1. XRPL Explorer
2. Xaman Wallet Dashboard
3. OTT Proof / Education Layer
```

Everything already built can stay as modules, but the customer must not feel like they are inside a messy demo.

## Customer Flow Must Feel Smooth

The user journey must be:

```txt
Open OTT Terminal
→ see clean XRPL Explorer
→ tap Connect Xaman
→ open Xaman app
→ sign
→ return to OTT Terminal
→ wallet dashboard opens automatically
→ proof / education routes become available
```

No confusing dead ends.

No unclear buttons.

No random tab overload.

## Mobile Rules

The mobile version must have:

```txt
sticky mobile top header
bottom navigation
clear Xaman connect button
large tap areas
no tiny text for key actions
no horizontal overflow
cards stacked cleanly
QR fallback only when useful
direct deeplink for mobile
```

## Mobile Bottom Navigation

Main mobile nav should stay simple:

```txt
Home
Explore
Wallet
Proof
Xaman
```

Everything else goes behind menu:

```txt
Education
Truth Desk
Access Gate
Reward Ledger
Submission
Smoke Test
Advanced
```

## Xaman Mobile Flow Rules

For mobile, the Xaman action must happen directly after user tap.

Flow:

```txt
1. User taps Connect / Sign with Xaman
2. App creates payload
3. App opens payload.next.always
4. Xaman app opens
5. User signs inside Xaman
6. Xaman returns user to OTT Terminal
7. App verifies payload
8. Signed wallet address is saved
9. Wallet Dashboard opens automatically
```

## Return Handling

The app must remember:

```txt
last payload UUID
selected action
expected SourceTag
return target tab
timestamp
```

When the user returns from Xaman, the app should:

```txt
read stored payload UUID
verify payload
extract signed account
save wallet address
open Wallet Dashboard
show success state
```

## Fallback Handling

If mobile redirect fails:

```txt
show Open Xaman button again
show QR code fallback
show Copy Link button
show Verify button
do not lose payload UUID
```

## Customer Error Messages

Use simple messages:

```txt
Xaman signing is still waiting.
Open Xaman again.
Signature found. Wallet connected.
Signature rejected or expired.
Try again with a new payload.
```

Avoid technical messages unless inside debug mode.

## Logo Usage Direction

The OTT logo should not be treated like a small random icon.

Use it as:

```txt
main brand mark in header
centerpiece on home hero
loading mark
mobile splash / connect screen
proof badge
SourceTag identity badge
footer / watermark
```

## Logo Placement

Recommended placements:

```txt
Desktop sidebar top
Mobile header right
Home hero large mark
Xaman connect card
SourceTag proof card
Reward Ledger identity section
Submission / Pitch screen
```

## Logo Should Feel Premium

Use the logo with:

```txt
enough empty space
clean border
dark background
subtle glow only if controlled
no stretched sizing
no blurry scaling
no random colors behind it
```

## Logo Color Palette Direction

Current OTT visual direction:

```txt
obsidian black
pure white
soft silver
metallic gold accent
deep charcoal
subtle grey lines
red only for warnings/disclaimers
```

Suggested design tokens:

```txt
background: #050505
surface: #0B0B0D
surfaceSoft: #111114
border: rgba(255,255,255,0.10)
textMain: #FFFFFF
textMuted: rgba(255,255,255,0.55)
textDim: rgba(255,255,255,0.32)
goldAccent: #D6B46A
silverAccent: #C8CCD2
danger: #E5484D
success: #FFFFFF
```

## Brand Mood

The app must feel:

```txt
XRPL-native
corporate cyberpunk
premium terminal
black / white / metallic
clean data platform
not cartoon
not casino
not meme coin
not exchange clone
```

## Home Hero Rule

The home screen should show:

```txt
OTT logo
XRPL OnTheTrack Terminal
Explorer + Dashboard + Proof
SourceTag 2606170002
Connect Xaman button
Search XRPL button
```

## Xaman Connect Screen Rule

The Xaman screen should feel like a secure login gateway:

```txt
OTT logo visible
Xaman connect button prominent
mobile deeplink first
QR fallback second
status clearly shown
wallet connected success state
```

## Proof / SourceTag Screen Rule

SourceTag must become part of the brand identity:

```txt
2606170002
OTT proof identity
verified actions
proof stamps
wallet-linked history
```

## Do Not Forget

Before public review, test:

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
Xaman open app
return to webapp
payload verify
wallet address saved
bottom nav visible
no horizontal scroll
buttons large enough
logo sharp
dark mode consistent
```

## Next Frontend Build Steps

```txt
1. Add mobile Xaman return/session helper
2. Add logo asset component
3. Add central brand theme tokens
4. Update Home hero with logo
5. Update Xaman screen with mobile-first deeplink flow
6. Update Wallet Dashboard success state
7. Hide advanced/demo modules from default customer journey
```

## Final Rule

A normal customer should not feel like they are testing a hackathon demo.

They should feel:

```txt
I opened a real XRPL terminal.
I connected Xaman smoothly.
I understand what I can do next.
OTT feels like a serious brand.
```
