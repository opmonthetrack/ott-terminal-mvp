# XRPL OnTheTrack Terminal — Live App Review Plan

## Goal

Use this plan after the build is green and before UI/design polish.

The goal is to look at the live app as a user, not as a builder.

We check:

```txt
Does the app open?
Does the route make sense?
Can a judge understand it?
Can a partner understand it?
Where does the flow feel unclear?
What should be polished later?
```

## Review Order

Open the live Vercel app and go through this order:

```txt
1. Dashboard
2. Partner Hub
3. Proof Stamp / XRPL Verify
4. Reward Ledger
5. Truth Desk
6. Access Gate
7. Pitch Mode
8. Submission Pack
9. Smoke Test
```

## Review Questions

### 1. First Impression

```txt
Does the app look serious?
Does it feel like XRPL / Web3?
Is SourceTag 2606170002 visible?
Is the project purpose clear within 10 seconds?
```

### 2. User Flow

```txt
Do I understand what to click first?
Is the education-first concept clear?
Are high-risk routes explained before action?
Is Xaman used only when it makes sense?
```

### 3. Partner Flow

```txt
Does Partner Hub explain each route clearly?
Are risk notes visible?
Are official provider links positioned correctly?
Does Proof Stamp feel optional and meaningful?
```

### 4. Proof Flow

```txt
Can I understand why SourceTag matters?
Can I see where tx hash verification happens?
Is it clear that every click is not put on-chain?
Is XP clearly off-chain?
```

### 5. Truth Desk Flow

```txt
Is Ask Truth clear?
Is 1-on-1 clear?
Is it clear this is education/project feedback only?
Is it clear this is not financial/legal/tax advice?
```

### 6. Access Gate Flow

```txt
Are the access routes understandable?
Is fiat route clearly external?
Is XRP route clear?
Is RLUSD shown as concept route?
Is NFT Access Pass clearly access utility, not investment?
```

### 7. Submission Flow

```txt
Can a judge understand the project from Pitch Mode?
Can I copy text from Submission Pack?
Does the demo route match the actual tabs?
```

## What To Screenshot

Take screenshots of:

```txt
Dashboard
Partner Hub
Proof Stamp section
XRPL Verify
Reward Ledger
Truth Desk
Access Gate
Pitch Mode
Submission Pack
Smoke Test result
```

## Notes Template

Use this while reviewing:

```txt
Live App URL:

First impression:

Tabs that work well:

Tabs that are confusing:

Text that needs rewriting:

UI elements that need polish:

Mobile issues:

Desktop issues:

Errors or blank screens:

Top 5 polish priorities:
1.
2.
3.
4.
5.
```

## UI Polish Later

Do not polish while reviewing. First collect issues.

After review, polish in this order:

```txt
1. Sidebar grouping
2. Dashboard clarity
3. Partner Hub readability
4. Truth Desk / Access Gate forms
5. Pitch Mode demo flow
6. Mobile responsiveness
7. Branding details
```

## Go To UI Polish When

```txt
Build is green
Live app opens
Main tabs load
No red errors
Smoke Test passes
Review notes are collected
Top 5 polish priorities are known
```

## Stop And Fix First When

```txt
Vercel is red
Any main tab is blank
SourceTag is wrong
api/ott.ts fails
Xaman payload creation fails because of code
Import/export errors appear
```

## Final Review Sentence

If the app can explain this sentence clearly, the MVP story works:

```txt
XRPL OnTheTrack Terminal helps users learn first, understand risk, use Xaman safely and verify meaningful XRPL actions with SourceTag 2606170002.
```
