# OTT reliability release — 10 September 2026

The public DeFi route previously exposed an unfinished swap and could show static values as live prices. The swap controls and payload-ready claim have been removed. The route is explicitly for research; it creates no order or signing request.

Web and Xaman now share market parsing, source fallback and cancellable requests. Only documented currency/period fields are displayed; missing values remain unknown. OnTheDEX daily USD fields follow https://github.com/OnTheDEX/xrpledger-token-data-api. XRPL.to data has visible source attribution. OnTheDEX returned ERROR_MAINTENANCE and XRPL.to returned HTTP 403 during the live source check, so current market availability remains an external dependency.

Supabase project ssawiyrhzicquhpwhrdk was restored from inactivity and is ACTIVE_HEALTHY. All ten public tables retain RLS. Public auth settings return HTTP 200 with email and Google enabled; signup requires email confirmation. A sign-in attempt using a reserved .invalid test address returns the expected HTTP 400 invalid_credentials response. Unauthenticated profile/completion reads are denied. The only security advisor warning is leaked-password protection, an existing account-plan limitation. No real signup/recovery email was sent. User login, email delivery and Google consent still need a real user session.

Session initialization is bounded. Academy hydration runs outside the auth callback and cannot block the signed-in state; stale initial sessions and stale hydration cannot overwrite a newer session or logout. Supabase requests forward cancellation and have a deadline including the response body.

Xaman context has an overall deadline; an unknown or conflicting network is never treated as Mainnet. Wallet views remain unavailable until context is verified. Network-switch events clear wallet/DNA results and require reopening. Native actions handle synchronous errors and missing responses; pending picker callbacks are cleaned up.

Strobe has a DNS failure. Moai documentation has a DNS failure and its former homepage no longer provides verifiable protocol content. Both directory actions are disabled and their status is research pending; no substitute domain is invented. Of the remaining 15 active directory URLs, 12 returned HTTP 200, Bithomp returned 204, and XRPL.to / xrp.cafe presented automated-client protection (403). Protection responses are not mislabeled as dead services.

The expanded audit exposed missing page headings and insufficient text contrast on four older reference pages. Those pages now have semantic main headings, readable text and explicit reference/example labels. Unmeasured validator uptime/health is no longer displayed as measured fact, and the developer examples use the actual OTT SourceTag 2606170002.

Regression coverage includes market units, missing data, provider failures, cancellation, exact token identity, session races, stale hydration, supported/unsupported Xaman networks and native timeouts. The broad smoke audit now includes all 23 non-founder public routes in EN/NL at desktop/mobile widths (92 screens), including DeFi, ecosystem, validator, developer and tokenization.

## Remaining physical checks

Open OTT from the registered Xaman sandbox on Android and iOS. Confirm selected account/network; scan a QR; cancel and reopen the scanner and Destination Picker; open a transaction; use Share, support/privacy/source links and Close. Change networks and reopen. Test all themes, text scaling and offline recovery. Compare an AGE DNA sample with actual purchase history, including transferred tokens and incomplete history. Record device, Xaman version and results in XAMAN_XAPP_SUBMISSION.md. Browser simulations do not constitute native-device proof or Xaman approval.

The initial candidate passed six targeted browser checks on Vercel: public EN/NL market data with accessibility checks, provider maintenance, disabled bad links, shared Xaman market units and blocked native-context recovery. The 29 DNA calculations and 23 reliability checks pass in CI. The expanded 92-screen audit and final release verification are still running; final results will be attached to PR #58 and the local release record.
