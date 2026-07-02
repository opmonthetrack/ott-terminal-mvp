# OTT Terminal — Logo-Based Color Palette

## New Direction

The terminal should move away from full black background.

Use:

```txt
white background
black text
logo gradient accents
blue / magenta / coral
soft silver lines
```

## Extracted Logo Colors

From the uploaded logo:

```txt
Black ink:      #080808
XRPL blue:      #3898E8
Magenta:        #C83888
Coral red:      #D84858
Soft silver:    #C8C8C8
White base:     #FFFFFF
```

## Main Palette

```txt
Background:       #FFFFFF
Soft background:  #F7F8FC
Text:             #080808
Muted text:       rgba(8,8,8,0.62)
Dim text:         rgba(8,8,8,0.38)
Border:           rgba(8,8,8,0.12)
Blue accent:      #3898E8
Magenta accent:   #C83888
Coral accent:     #D84858
Silver accent:    #C8C8C8
```

## Brand Gradient

```txt
#3898E8 → #8F49D8 → #C83888 → #D84858
```

## UI Rules

Use white as the main base.

Use black for:

```txt
headings
body text
icons
strong borders
```

Use the gradient for:

```txt
primary buttons
active mobile nav
proof badges
hero text accents
NFT access pass
Xaman connect action
```

Use blue for:

```txt
XRPL explorer
wallet dashboard
success state
live network
```

Use magenta for:

```txt
OTT proof
education
brand identity
SourceTag
```

Use coral red only for:

```txt
warnings
errors
important disclaimers
```

## Do Not Do

```txt
do not make everything black again
do not use random colors
do not overuse red
do not make text low contrast
do not recolor the logo
do not stretch the logo
```

## Next UI Migration Order

```txt
1. Add ottBrandTheme.css
2. Import it in src/index.css
3. Update App shell to light theme
4. Update TerminalHomeTab
5. Update XamanCenterTab
6. Update WalletTab
7. Update AccessGateTab
8. Update Explorer screen
```

## Important

Do not touch:

```txt
api/ott.ts
Xaman working flow
environment variables
mobile return handler
wallet addresses
```

Only change UI classes/colors.
