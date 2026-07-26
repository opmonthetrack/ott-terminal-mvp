# Discord account login

Discord OAuth is enabled in Supabase and exposed in OTT only when `VITE_AUTH_DISCORD_ENABLED=true` is present at build time.

The implementation requests the minimum identity scopes required for OTT account login: `identify` and `email`.
