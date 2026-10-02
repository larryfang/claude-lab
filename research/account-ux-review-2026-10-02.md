# Account experience review — 2 October 2026

## Final experience

Google/Gmail is the recommended sign-in option. Home, progress and lesson-footer reminders explain browser-only guest storage and offer Google and GitHub. The account page gives each provider a clear action, preserves guest access and offers explicit progress import after a verified sign-in. Per-account workspace separation and local notebook privacy are preserved.

At the owner's request, email/password registration, login, confirmation resend, reset requests and password update forms were removed. Their browser handlers, styles and tests were removed too. The extra local password configuration was reverted. There is no SMTP dependency in the selected sign-in experience.

GitHub uses the existing Supabase PKCE callback with the exact course-origin redirect and `user:email` scope. No repository or organization scopes are requested. Callbacks identify GitHub cancellation correctly and remove authorization codes and provider error details before rendering. The client checks that GitHub is enabled before redirecting; until configured, it keeps learners on the course and offers Google.

## GitHub setup and live verification

The owner registered the **Claude Lab** GitHub OAuth application with homepage `https://larryfang.github.io/claude-lab/` and callback `https://sbzrhwxpavjogwdnavkh.supabase.co/auth/v1/callback`, then entered its credentials in Supabase. Public Auth settings now confirm both Google and GitHub enabled. Wildcard matching and Device Flow are off. No client secret was copied into this repository or chat.

A real sign-in from the approved `http://127.0.0.1:4173/` preview reached GitHub's **Authorize Claude Lab** screen, requesting only read-only email access. An authenticated local session subsequently reported **Progress synced** and retained its lesson scroll position. GitHub-specific callback and guest-import regressions intercept Auth responses; the presence of an authenticated session alone does not prove provider-specific identity linking. Port 4174 is not in the current Supabase redirect allowlist; the in-app preview is now on 4173.

## Validation

Account coverage checks Google and GitHub PKCE redirects, minimal scopes, callback errors, guest preservation/import, account isolation, missing provider configuration, mobile themes and absence of email/password forms. GitHub callback tests intercept Auth responses; they are not evidence of a real configured GitHub login.

- Course manifest: all 71 registered pages verified.
- Unit checks: all 46 passed.
- Full browser suite: all 94 passed, including 15 account tests and 21 additional browser regressions from the bug audit.
- Live links: all 124 passed, with one protected report and one placeholder/local URL excluded.
- Desktop and 320px account layouts inspected; the existing in-app preview shows Google and GitHub on the approved local sign-in origin.
- Diff whitespace check passed.

References: [Supabase GitHub Auth](https://supabase.com/docs/guides/auth/social-login/auth-github), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

## Lesson scrolling regression

Background sync previously compared serialized JSON strings. The server reordered object fields, so an unchanged save appeared different and rerendered the lesson. Rendering updated the last-visit timestamp and scheduled another save, creating repeated flashes and scroll-to-top jumps. Both sync branches now use the state diff to compare values independently of object field order. A browser regression reproduced the failure before the fix and covers automatic saves plus an unchanged explicit sync. The live authenticated preview also remained scrolled to the lesson footer with Progress synced.

The broader review fixed 28 confirmed issues across sync, imports, account privacy, keyboard access, flashcards, reflections, search recovery and simulations. See `bug-audit-2026-10-02.md` for the findings and evidence boundaries. Asset cache version: `2026-10-02g`. This report records the audit verification; publication is checked separately during release.
