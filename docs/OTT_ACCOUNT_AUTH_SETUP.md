# OTT Account Authentication Setup

## Goal

OTT uses a normal Web2 account for profile, cross-device progress and future permissions. XRPL wallets remain separate and optional until a user signs, proves ownership, receives an NFT or performs another on-chain action.

## Required Vercel variables

Add these to Development, Preview and Production:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

The browser must never receive the Supabase service-role key.

## Supabase project setup

1. Create one Supabase project for OTT.
2. Open the SQL Editor.
3. Run `supabase/migrations/20260721_ott_accounts_academy.sql`.
4. Set the Site URL to the production OTT domain.
5. Add the Vercel preview and local development URLs to the redirect allow list.
6. Keep email confirmation enabled for production.
7. Configure custom SMTP before public launch.

## Login methods

### Email

Enable Email in Authentication → Providers. The application supports:

- account creation with email and password;
- email confirmation;
- normal sign-in;
- password reset.

### Google

Create a Google web OAuth client. Configure the Supabase callback URL shown under the Google provider. Add the production OTT origin and local development origin to the Google client.

### Apple

Create an Apple Services ID and signing key for web OAuth. Store the `.p8` file outside the repository. Apple web OAuth secrets expire and require scheduled rotation.

### Microsoft / Hotmail / Outlook

Use the Azure provider in Supabase. Register a Microsoft Entra application, configure the Supabase callback URL and allow personal Microsoft accounts when Hotmail and Outlook users must be supported.

### GitHub

Create a GitHub OAuth App and use the Supabase callback URL. Store the GitHub client secret only in the Supabase provider configuration.

## Data boundaries

- `profiles`: normal account profile and language.
- `linked_wallets`: wallet addresses only after a signed ownership proof.
- `academy_completions`: server-backed course completion records.
- `nft_claims`: read-only to the user; eligibility and serial assignment are written by a trusted server.

Row Level Security restricts normal users to their own rows. There is intentionally no direct client write policy for NFT claims.

## Launch checklist

- Account create and confirmation tested.
- Password reset tested.
- Google tested on desktop and mobile.
- Apple tested and secret-rotation reminder created.
- Microsoft tested with Outlook/Hotmail and work accounts.
- GitHub tested.
- Production and preview redirect URLs allowlisted.
- Custom SMTP configured.
- Privacy policy and account deletion route published.
- Wallet linking requires a fresh signed challenge.
- Academy completion cannot be forged from localStorage.
