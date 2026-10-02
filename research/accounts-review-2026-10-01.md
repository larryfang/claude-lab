# Learner accounts review — 1 October 2026

## Delivered

A dedicated Supabase Free project in Sydney provides Google Auth configuration, private progress records and identified learning analytics. GitHub Pages remains the static host. Existing credentials were found in another local project; management and privileged keys were never copied into the course.

Guests continue locally. Signing in restores only the verified account. Importing guest progress is explicit and preserves the guest notebook. Signed-in records include lesson views, completions, quiz attempts/results, completed terminal simulations and studio reviews, and estimated active lesson time. Private notebook text and typed briefs are excluded.

Progress uses field-level changes plus a database revision check. Conflicts return HTTP 409, following [Supabase's guidance](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b); SQLSTATE 40001 caused repeated database retries during testing and was replaced before release. “Sync now” also fetches remote changes when the current browser has no pending edits. Offline changes are cached until connectivity returns.

The owner dashboard lists learner journeys, current completions, quiz accuracy, estimated active time, lesson funnel counts and database size. A completed selected quick-start route is treated as complete. “Likely paused” means an unfinished selected route/course with no recorded activity for seven days; it does not establish why someone stopped.

## Data access and retention

All exposed tables have row-level security. Each learner can access only their own records. A confirmed account email must match a private server-managed allowlist to read the owner dashboard. User-editable metadata cannot authorize administration.

Raw events are deduplicated and rolled up into daily totals before the nightly 90-day retention job removes old events. Durable progress and daily totals remain until the Auth account is deleted. The guest collector remains separate; earlier anonymous visits are not attributed to a signed-in learner.

Two security-advisor warnings remain: the intentionally owner-gated report function is callable by signed-in users, and paid leaked-password protection is unavailable in this Free configuration. Public learners use the Google button; no password login UI is provided. The free database allowance is finite and idle projects can pause; see [current pricing](https://supabase.com/pricing).

## Verification

- Course manifest: two tracks, 71 registered pages and unique routes.
- 38 unit checks passed, including privacy exclusions, initial-device merge, explicit undo and prototype-path rejection.
- 65 browser checks passed in the final 2 October release suite, including all lessons, all terminal simulations, both themes, 320px layouts, account access, cached-workspace isolation, PKCE redirect generation and three callback-error regressions.
- 13 live integration checks cover: private state round trip; anonymous/cross-account denial; revision/privacy validation; event identity and deduplication; owner access; route classification; explicit guest import; simultaneous device saves and pull; offline recovery; completion undo; dashboard/export; sign-out and different-account isolation; first-login preservation of unimported guest progress and notes.
- Temporary confirmed test users and all their cascaded learning rows were removed.
- 124 live course URLs passed, one report correctly requires authentication, and one placeholder/local URL is excluded.

## Google login verification — 2 October

On 2 October, the owner approved adding `https://sbzrhwxpavjogwdnavkh.supabase.co/auth/v1/callback` to the existing Butterwell Google OAuth client in MoodEditor. Google Cloud reported “OAuth client saved”; reopening the client confirmed both the original Butterwell callback and the new Claude Lab callback remained configured.

The real Google login returned to the local site with a Supabase external-code exchange failure. A diagnostic Google token request using the secret representation returned by the source project's management configuration confirmed HTTP 401 `invalid_client`: “The provided client secret is invalid.” That management response is not a reusable original Google client secret. No matching original secret was found in the other projects searched, and Google Cloud explicitly no longer reveals the existing secret. The earlier configuration copy therefore did not establish working Google authentication.

The owner subsequently completed the credential entry directly in Supabase and confirmed configuration. Real Google sign-in on the local origin then succeeded: the authorization code was exchanged, the account page reported “Progress synced”, and the confirmed owner account loaded the private dashboard. Sign-out restored the guest account screen, and a second real Google sign-in with the final callback handling succeeded. The Google provider remains enabled with nonce checks required and the published site URL correctly configured. No Google secret was copied into source or Git.

The live account checks and 124 live link checks were rerun successfully after configuration. Disposable integration accounts were removed; the server-managed owner allowlist contains one entry.

The reproduced error screen was corrected before publication: provider failures and cancelled sign-ins now return to the account screen with a retry action and safe feedback. Provider error details and authorization codes are removed from the URL. Three regression checks cover provider failure, cancellation and failed PKCE exchange.

Published Google login was verified on GitHub Pages: the callback returned to `/claude-lab/#/account` without authorization codes or error parameters, and the account reported “Progress synced”. A subsequent sign-out check exposed an additional first-login edge case: existing guest data had not always been persisted separately before switching to the account. The current guest snapshot is now written at initialization; an integration regression verifies that a guest completion and notebook survive login and sign-out without import, with both missing and stale older guest caches. Final assets use cache version `2026-10-02b`.

The Google credential gate is cleared. Publication verification requires successful course and link workflows, successful GitHub Pages deployment, matching public assets and a real Google login on the published origin.

The shared Google project's audience is External and its publishing status is Testing. [Google's audience documentation](https://support.google.com/cloud/answer/15549945) explicitly exempts requests limited to `openid`, email and profile from test-user restrictions and seven-day authorization expiry. Claude Lab requests only those basic scopes; changing the shared project's publishing status is not required for this login flow. Real Google validation used the owner account; additional identities were exercised through disposable Supabase integration accounts.

For ongoing operations and a fork's setup, see [Supabase setup](../supabase/README.md). Reference documentation: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow) and [Cron](https://supabase.com/docs/guides/cron/quickstart).
