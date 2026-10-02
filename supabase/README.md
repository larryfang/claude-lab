# Learner accounts

The course remains on GitHub Pages. A dedicated Supabase Free project (`claude-lab`, Sydney, `sbzrhwxpavjogwdnavkh`) supplies Auth and Postgres. Google and GitHub sign-in use PKCE so the authentication callback does not collide with the course's hash routes.

## Learner experience

- Guests can use every lesson and save progress locally. Home, progress and lesson-footer reminders recommend Google/Gmail to keep progress across devices. Guest access remains available.
- Google/Gmail is recommended; GitHub is the alternative. Both create learner accounts through provider sign-in. There are no email/password registration, confirmation, or password-reset forms.
- Provider sign-in restores only that account's workspace. Guest progress is offered as an explicit import.
- Completions, checklists, exercise results, quiz scores, review cards, daily review scores, streak activity and the last lesson sync. Different-device changes merge by field, with a revision check to prevent lost updates. Explicit completion undo is supported.
- Browser preferences remain local. Notebook text and typed briefs are excluded from cloud state and analytics. Notebook entries are kept separately for each account and the guest workspace on this browser. XP from local notebook entries can therefore differ between devices.
- Offline changes are cached and uploaded when connectivity returns. Each browser keeps at most 500 pending activity events; prolonged offline use can lose older analytics events, while progress is retained.
- The account screen exports synced progress, up to 10,000 recent raw events and up to 10,000 daily aggregate rows. Local notebook export is available separately.

## Deployment and OAuth

1. Run `npm ci`, `npm test` and `npm run check:links`.
2. Apply migration files in order to a fresh Supabase project, then apply `seed.sql`. Regenerate the catalog with `npm run build:catalog` after changing course lessons or quick-start routes.
3. Set the browser-safe project URL and **publishable** key in `assets/js/cloud-config.js`. Never put a secret or service-role key there.
4. In Google Cloud, configure a Web OAuth client with the callback `https://sbzrhwxpavjogwdnavkh.supabase.co/auth/v1/callback`. Use your own client for a fork. A dedicated consent brand is preferable when launching a separate product. Only `openid email profile` are requested.
5. Configure the Google client ID/secret privately in Supabase Auth. Set the Auth site URL to `https://larryfang.github.io/claude-lab/` and permit that exact redirect plus `http://127.0.0.1:4173/` and `http://localhost:4173/` for testing. For a fork, substitute its own URLs and callback project reference.
6. Populate `private.course_admin_emails` privately with the owner email. A confirmed email is required. This allowlist is never shipped in this public repository. Do not authorize using editable user metadata.
7. For GitHub sign-in, register a GitHub OAuth App named **Claude Lab** with homepage `https://larryfang.github.io/claude-lab/` and exact callback `https://sbzrhwxpavjogwdnavkh.supabase.co/auth/v1/callback`. Leave wildcard matching and Device Flow off. Generate its client secret privately and enter the client ID/secret in Supabase Auth → Sign In / Providers → GitHub, then enable and save. The client requests `user:email`; no repository or organization scopes are requested. Google settings remain separate.
8. Publish the static course; verify Google sign-in, resume and sign-out on the published origin. `file://` previews can use guest lessons but cannot sign in.

`supabase/config.toml` describes a local development stack; production settings are configured separately. For a local stack, use a local project's public key and callback rather than the production configuration. Management credentials used for provisioning were read from existing local configuration and never copied into this repository.

## Security and records

Every public table has row-level security. Authenticated learners can access only their own profile, progress, events and daily totals. Lesson/path catalogs are public read-only. Events derive identity from the verified JWT, use server timestamps and deduplicate by event ID. Daily totals are written only by an internal trigger. The owner report checks a server-managed allowlist on each call before it can read other learners' records.

The owner sees email/display name, last lesson, current completions, quiz attempts/accuracy and estimated active time. “Likely paused” means the selected route or course is unfinished and no activity has been recorded for seven days. It is an inference; the browser cannot determine why someone stopped. Completed quick-start routes are classified as complete even if unrelated lessons remain.

Raw events are automatically removed after **90 days** by a nightly database job; daily totals and progress persist until account deletion. Deleting an Auth user cascades to all their learning tables. An owner can handle a learner's deletion request through Supabase Auth; revoke/sign out sessions first. Existing browser caches are local and can be cleared by the learner. There is no self-service account deletion UI in this release.

The free tier has a 500 MB database allowance and may pause an inactive project. The dashboard displays database size; retention reduces growth but does not guarantee staying within that allowance. The anonymous guest collector remains separate and does not link prior guest visits to an identified learner.

## Verification

`npm test` checks the course and guest/account UI without management credentials. `npm run check:accounts` is an opt-in live integration check that needs `SUPABASE_ACCESS_TOKEN` supplied privately in the process environment. It creates temporary confirmed test identities, exercises row isolation, conflict handling, analytics and browser sync, then deletes those identities and their cascaded records. It never records browser traces or prints credentials. Do not run it against a different project without reviewing the target configuration.

Security advisor warning `authenticated_security_definer_function_executable` for `learning_admin_report` is intentional: signed-in users may call the endpoint, and the function enforces the owner allowlist before reading any report data. Leaked-password protection is a paid Auth feature; Google remains recommended; the course exposes provider sign-in only. Keep account security settings and dependencies under review.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Cron retention](https://supabase.com/docs/guides/cron/quickstart), [Free plan limits](https://supabase.com/pricing).

## GitHub rollout status — 2 October 2026

Email/password registration was removed at the owner's request. The GitHub client flow is implemented with PKCE and safe callback handling. The owner configured the GitHub OAuth app and credentials; public Auth settings confirm GitHub enabled. Real sign-in reached the Claude Lab authorization screen with read-only email access, and an authenticated local session subsequently reported Progress synced. GitHub-specific callback and import tests intercept Auth responses; provider-specific identity linking has not been separately verified live. Use the approved local address `http://127.0.0.1:4173/`; port 4174 is not currently allowlisted. The in-app preview now uses 4173. If the provider is disabled later, the button stays on the course and offers Google rather than redirecting to a provider error screen.

Reference: [Supabase GitHub Auth](https://supabase.com/docs/guides/auth/social-login/auth-github).
