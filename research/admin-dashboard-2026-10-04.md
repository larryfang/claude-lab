# Administrator analytics dashboard — 4 October 2026

The private dashboard at `#/admin` gives the course owner a view of registered learner activity and a separate view of guest browser usage. Access uses the existing confirmed owner allowlist; no additional administrator, credential or service-role key is introduced.

## Available views

| View | What the administrator can assess |
| --- | --- |
| Overview | Total accounts, new accounts, distinct active learners, estimated active minutes, recorded sessions and weighted quiz accuracy |
| Activity | Daily learner trend, previous equal-length period, daily table and CSV |
| Account activation | New accounts that opened a lesson and recorded a completion, plus Google/GitHub account provider mix |
| Second-week returns | Twelve signup-week cohorts, with eligible accounts and returns on days 7–13 |
| Courses and lessons | Course engagement, current course completions, lesson viewers, current completion among those viewers, quiz accuracy and review signals |
| Learners | Name/email search, journey-status filters, server pagination, last lesson/activity and filtered CSV export |
| Guests | Browser IDs, sessions, lesson opens, returning IDs, provider-button clicks, quiz activity, search gaps, referrals and daily CSV |
| Reports | Aggregate Markdown report, print view, daily/lesson/learner downloads and data definitions |

Filters cover 7, 30 or 90 UTC calendar days and a selected course. Learner search/status changes the directory, not the overview. Reference lessons remain visible but are excluded from full-course completion. Finished selected sessions are recognized independently of a larger unfinished route.

## Metric safeguards

- Period users are distinct across dates. Daily users cannot be added to obtain a period user count.
- Quiz accuracy is correct answers divided by attempts, including retries.
- Current saved progress and period event counts are labelled separately. Imported progress is excluded from recorded activation completions.
- Lesson completion percentages use the intersection of period viewers and current completers; they cannot exceed 100% because someone imported progress without opening the lesson in the window.
- Return rates exclude signup cohorts whose second week has not fully elapsed. Week boundaries are Monday in UTC; the current partial day is labelled.
- Guest IDs describe browsers, not identified people. The two sources are not added together, and no guest-to-account conversion rate is invented.
- Provider-button metrics are attempted sign-in clicks, not successful registrations. Historical clicks were not collected before this release.
- Guest-store reads are bounded at 5,000 objects from at most 20,000 listed objects; partial coverage and read failures are surfaced. Account raw events have 90-day retention, while daily totals and current progress persist until deletion.
- Activity is recorded browser behavior, not a measure of attention, learning quality or competence. Review suggestions identify patterns, not their causes.

## Access and operational changes

Public reporting functions now use invoker wrappers around guarded private functions. Every privileged query checks a confirmed account against the server-owned allowlist. Ordinary users cannot select private tables, alter the allowlist or authorize themselves with editable metadata. Guest aggregate reports verify the same owner JWT before reading private Blob storage; existing report-token workflows remain supported. Responses use no-store caching and an explicit origin allowlist.

Private dashboard responses remain in memory. A stale response after navigation or sign-out cannot overwrite another page; permission denial removes the old dashboard. Exports escape text and spreadsheet formulas, apply directory filters and state their 10,000-row limit. Notebook and typed practice text are excluded.

The production Email provider is disabled to match the requested Google/GitHub-only signup experience. Both OAuth providers remain enabled. The password-based opt-in account checker now rejects a provider-only project before creating disposable identities; its separate privileged workflow was not used for this release.

The Vercel packaging check detected an excluded public configuration file; the collector now includes only that required file from the course assets. The anonymous catalog was regenerated from current course content before final deployment.

## Verification

- Full course/content, unit and browser suites, including SQL checks in an isolated temporary PostgreSQL cluster.
- Database tests for anonymous/non-owner denial, confirmed owner access, metadata forgery, row isolation, dates/course scope, distinct users, weighted quiz totals, imports, selected sessions, search/pagination, activation and twelve cohort boundaries.
- Browser tests for real filters/downloads, formula escaping, access revocation, late responses, retry behavior, empty reports, guest service failure, keyboard access, route aliases and both themes at 320px.
- Live database checks of every report window, owner authorization and denied anonymous execution; migration records retained alongside the SQL source.
- Collector deployment checks of unauthenticated/invalid-session rejection and the Pages-origin preflight. The deployed collector includes the current catalog of 71 lessons across eight paths.
- External link validation and clean whitespace checks. GitHub runs the complete verification suite and publishes Pages on the release push; the final handoff records their outcomes and live owner-session checks.

Local verification passed 67 unit/database checks, 12 dashboard/usage browser checks and 23 dashboard/account browser checks. The preceding full browser run passed 113 checks; the added route and sign-in regressions are included in the current targeted runs. Link validation passed for 124 live URLs, with the private report correctly requiring authentication. Production database checks confirmed owner access, denied anonymous execution, compatible legacy reporting, the twelve-cohort limit and zero privileged administrator functions exposed in the public schema. The refreshed security advisor reports zero errors; its remaining password-protection warning concerns the disabled Email provider.

This document contains no learner names, emails, tokens or production report snapshots.

Implementation references: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [observability and advisors](https://supabase.com/docs/guides/observability), and [Vercel deployment](https://vercel.com/docs/deployments).
