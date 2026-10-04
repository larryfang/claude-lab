# Learner accounts

The course remains on GitHub Pages. A dedicated Supabase Free project (`claude-lab`, Sydney, `sbzrhwxpavjogwdnavkh`) supplies Auth and Postgres. Google and GitHub sign-in use PKCE so the authentication callback does not collide with the course's hash routes.

## Learner experience

- Guests can use every lesson and save progress locally. Home, progress and lesson-footer reminders recommend Google/Gmail to keep progress across devices. Guest access remains available.
- Google/Gmail is recommended; GitHub is the alternative. Both create learner accounts through provider sign-in. There are no email/password registration, confirmation, or password-reset forms. The production Email provider is disabled as well; Google and GitHub remain enabled.
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
6. Privately provision `private.course_admin_owner` with the sole confirmed owner's Auth user ID and the exact `provider_id` of its Google and/or GitHub identities in `auth.identities`. The singleton constraint allows one administrator account. Migration `20261004035244_sole_course_owner.sql` pins the existing confirmed email-allowlisted owner and its linked identities automatically; it refuses multiple confirmed owners or ambiguous provider identities. On a fresh project it remains empty until provisioned. Verify the actual provider account before pinning it. Never publish the identifiers or authorize using editable metadata, usernames or email matches.
7. For GitHub sign-in, register a GitHub OAuth App named **Claude Lab** with homepage `https://larryfang.github.io/claude-lab/` and exact callback `https://sbzrhwxpavjogwdnavkh.supabase.co/auth/v1/callback`. Leave wildcard matching and Device Flow off. Generate its client secret privately and enter the client ID/secret in Supabase Auth → Sign In / Providers → GitHub, then enable and save. The client requests `user:email`; no repository or organization scopes are requested. Google settings remain separate.
8. Disable the Email provider in Supabase Auth → Sign In / Providers → Email. Keep new-user signup enabled for Google/GitHub.
9. Deploy the Vercel collector after rebuilding `analytics/catalog.json`; `.vercelignore` includes the public cloud configuration needed by the owner verification endpoint. Its public publishable key does not grant administrator access.
10. Publish the static course; verify Google sign-in, resume and sign-out on the published origin. `file://` previews can use guest lessons but cannot sign in.

`supabase/config.toml` describes a local development stack; production settings are configured separately. For a local stack, use a local project's public key and callback rather than the production configuration. Management credentials used for provisioning were read from existing local configuration and never copied into this repository.

## Security and records

Every public table has row-level security. Authenticated learners can access only their own profile, progress, events and daily totals. Lesson/path catalogs are public read-only. Events derive identity from the verified JWT, use server timestamps and deduplicate by event ID. Daily totals are written only by an internal trigger. Each owner report checks the single pinned Auth account, email confirmation and a matching trusted Google/GitHub identity before reading other learners' records. Changing or copying an email does not transfer ownership. Removing the owner or all pinned identities denies access; deleting the owner account removes the private configuration through a cascade. The historical email allowlist no longer authorizes reports.

The owner sees email/display name, last lesson, current completions, quiz attempts/accuracy and estimated active time. The expanded dashboard adds 7/30/90-day course filters, signup provider mix, new-account activation, daily activity, second-week return cohorts, practice finishes, and paginated learner search. Directory filters do not change summary cards. CSV exports can include up to 10,000 matching learners; aggregate reports omit names and emails. “Likely paused” means the selected route or course is unfinished and no activity has been recorded for seven days. It is an inference; the browser cannot determine why someone stopped. Completed quick-start routes and validated selected sessions are classified as complete even if the larger course is unfinished.

Raw events are automatically removed after **90 days** by a nightly database job; daily totals and progress persist until account deletion. Deleting an Auth user cascades to all their learning tables. An owner can handle a learner's deletion request through Supabase Auth; revoke/sign out sessions first. Existing browser caches are local and can be cleared by the learner. There is no self-service account deletion UI in this release.

The dashboard displays actual database size without assuming a subscription allowance. Check the current project plan and limits in Supabase; retention reduces growth but does not guarantee staying within a quota. The anonymous guest collector remains separate and does not link prior guest visits to an identified learner.

## Verification

`npm test` checks the course, guest/account/admin UI, reporting API and SQL authorization without management credentials. The SQL suite creates and stops a disposable local PostgreSQL cluster, not a production database. It verifies single-owner constraints, both linked providers, email/metadata impersonation denial, revocation and migration bootstrap. `npm run check:accounts` is an opt-in live integration check that needs `SUPABASE_ACCESS_TOKEN` supplied privately in the process environment. Its password-based temporary identities require a separate test project with Email enabled; it deliberately cannot run against the provider-only production configuration. It exercises row isolation, conflict handling, analytics, browser sync and denial of administrator access, then deletes those identities and their cascaded records. It never promotes a disposable identity, records browser traces or prints credentials. Do not run it against a different project without reviewing the target configuration.

All public administrator endpoints are `SECURITY INVOKER` wrappers. Privileged queries run in the unexposed `private` schema, set an empty search path and enforce the sole confirmed owner account and pinned provider identities on every call. Schema usage does not grant access to private tables; learners cannot read or change the owner configuration. The old `learning_admin_report` remains compatible through the same guarded design. The hosted collector accepts only that verified owner session; legacy URL/header tokens no longer bypass sign-in. The laptop-only development collector retains its separate local token. Leaked-password protection is a paid Auth feature; production Email sign-in is disabled and the course uses Google/GitHub only. Keep account security settings and dependencies under review.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Cron retention](https://supabase.com/docs/guides/cron/quickstart), [Free plan limits](https://supabase.com/pricing).

## GitHub rollout status — 2 October 2026

Email/password registration was removed at the owner's request. The GitHub client flow is implemented with PKCE and safe callback handling. The owner configured the GitHub OAuth app and credentials; public Auth settings confirm GitHub enabled. Real sign-in reached the Claude Lab authorization screen with read-only email access, and an authenticated local session subsequently reported Progress synced. GitHub-specific callback and import tests intercept Auth responses. On 4 October, a live Auth audit confirmed that the owner's verified Google and GitHub identities belong to the same Auth account; the single-owner migration pins that account and both provider identifiers privately. Use the approved local address `http://127.0.0.1:4173/`; port 4174 is not currently allowlisted. The in-app preview now uses 4173. If the provider is disabled later, the button stays on the course and offers Google rather than redirecting to a provider error screen.

Reference: [Supabase GitHub Auth](https://supabase.com/docs/guides/auth/social-login/auth-github).

## Administrator metrics and reports

Open `#/admin` while signed in with the single pinned course-owner account through Google or GitHub. The server denies other learners even if they call the reporting endpoints directly. The browser clears private content on route changes, sign-out or access denial and never saves dashboard responses in local storage.

- Activity windows use UTC calendar days and include the incomplete current day. Period active learners are a union of accounts, not the sum of daily active learners. Comparisons use the previous equal-length calendar window; short history is labelled.
- Account totals, signup providers and new accounts are site-wide. Activity and lesson diagnostics follow the selected course. New-account activation uses recorded lesson opens and completion actions, not imported progress, and is an observed cohort rather than proof of event order.
- Return cohorts use the latest twelve Monday-based signup weeks. Only accounts with a fully elapsed second week enter the return-rate denominator; returns are recorded lesson activity on days 7–13.
- Lesson completion among period viewers intersects those viewers with current saved completions. All current completers is a separate all-time figure, so imports or earlier visits cannot produce a completion percentage above 100%.
- Quiz accuracy uses all attempts, including retries. Active time estimates visible, recently active lesson-tab time. Practice finishes record local guided exercises; they do not certify competence.
- Guest reports use anonymous browser IDs and tab/inactivity sessions. No identity bridge exists between them and registered accounts. Sign-in starts count Google/GitHub button clicks only, beginning with this release, not completed signup. Returning guest IDs mean previously observed IDs in the available store history.
- Charts have daily tables; the layout supports light/dark themes, keyboard controls and 320px screens. Daily, lesson, guest and learner CSV exports protect spreadsheet formulas. Markdown reports contain aggregate metrics; print is also available. Store learner exports privately.

Collector reads and exports state their coverage limits. Notebook entries, typed practice briefs, credentials and raw browser IDs are excluded from administrator report downloads.
