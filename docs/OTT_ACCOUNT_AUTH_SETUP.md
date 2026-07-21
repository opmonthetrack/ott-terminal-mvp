# OTT Account Authentication Setup

## Goal

OTT uses a normal Web2 account for profile, cross-device progress and future permissions. XRPL wallets remain separate and optional until a user signs, proves ownership, receives an NFT or performs another on-chain action.

## Required Vercel variables

Add these to Development, Preview and Production:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`VITE_SUPABASE_*` values are public browser configuration. `SUPABASE_SERVICE_ROLE_KEY` is a server-only secret and must never use the `VITE_` prefix, appear in client code, screenshots, issues or commits.

The service-role key is used only by trusted server functions after the user's access token has been verified.

## Supabase project setup

1. Create one Supabase project for OTT.
2. Open the SQL Editor.
3. Run `supabase/migrations/20260721_ott_accounts_academy.sql`.
4. Run `supabase/migrations/20260721_secure_academy_writes.sql`.
5. Set the Site URL to the production OTT domain.
6. Add the Vercel preview and local development URLs to the redirect allow list.
7. Keep email confirmation enabled for production.
8. Configure custom SMTP before public launch.

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
- `academy_completions`: trusted server-written course completion records.
- `academy_legacy_imports`: older local wallet results awaiting a new server-side assessment.
- `nft_claims`: read-only to the user; eligibility and serial assignment are written by a trusted server.

Row Level Security restricts normal users to their own rows. Authenticated browsers can read their own Academy completions but cannot insert or update certificate-eligible completion rows.

## Academy trust flow

1. The signed-in browser sends the user's Supabase access token with the course answers.
2. The Academy server verifies the token with Supabase.
3. Gemini assesses each answer against the server-owned rubric.
4. Every answer must score at least 70%.
5. Only after all answers pass does the server write `academy_completions` using the service role.
6. The browser reads the trusted row back and updates the local display cache.
7. Older wallet-local results are imported separately with `needs_reassessment` and do not silently unlock a certificate.

## Launch checklist

- Account create and confirmation tested.
- Password reset tested.
- Google tested on desktop and mobile.
- Apple tested and secret-rotation reminder created.
- Microsoft tested with Outlook/Hotmail and work accounts.
- GitHub tested.
- Production and preview redirect URLs allowlisted.
- Custom SMTP configured.
- Both SQL migrations applied.
- `SUPABASE_SERVICE_ROLE_KEY` exists only in Vercel server environment variables.
- Privacy policy and account deletion route published.
- Wallet linking requires a fresh signed challenge.
- Academy completion cannot be forged from localStorage or browser API calls.
