# Claude Lab experience review — 30 September 2026

## Aim

Make the course easier to start, practise and return to, while strengthening the learner's ability to question an agent's output. Keep course progress in the browser and use clearly labelled fictional data for the new practice exercise.

## Primary sources reviewed

Reviewed on 30 September 2026:

- [Anthropic Academy: Getting good at Claude — a research-backed curriculum](https://academy.claude.com/tutorials/getting-good-at-claude-a-research-backed-curriculum). Supports teaching goal clarity early in agentic work and critical evaluation throughout the curriculum. This informed the new exercise and lesson review questions; the exercise wording and data are original.
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices). Supports explicit goals, relevant context, planning and verification with observable evidence. The introductory Code lesson now asks learners to define an acceptance criterion, a failure case and the evidence needed for handover.
- [Claude Help Center: current Cowork guidance](https://support.claude.com/en/articles/16761823). Checked the current Cowork surface and guidance against the course's product description. The welcome lesson's source-check date is now 30 September.

These sources inform teaching choices; they do not establish that this independent course guarantees task quality or completion within a fixed time.

## Experience delivered

| Learner need | Change | Correctness boundary |
| --- | --- | --- |
| Understand what to practise before committing to a track | Interactive Brief → Plan → Verify exercise on the homepage and a full Practice studio | Guided fictional example; no agent, model call or file modification runs |
| Recognize plausible but unsupported claims | Review three claims against three source records with corrective feedback | Recorded total is USD 30,000; the missing amount stays missing; a negotiation stage does not prove a closing date |
| Take the exercise into a real workspace | Download the same CSV and edit/copy a B.R.I.E.F. example | The local checker detects signals, not correctness or guaranteed compliance |
| Choose an achievable starting point | Six work goals, 15/30/60-minute session planner, saved preferences | Uses manifest estimates and completed lessons; flags a lesson longer than the slot; distinguishes session content from full-route outcome |
| Read with less distraction | Persistent focus mode, clearer lesson overview and accessible contents outline | Exercise counts come from rendered content; curated route survives resuming and section jumps |
| Transfer judgment to work | Module-specific evidence questions in all 63 non-reference lessons | Completion records activity; evidence determines whether work is ready |
| Use the course comfortably on a phone or keyboard | Responsive layout, keyboard-operated tabs, focus-safe mobile menu, scrollable code access | Checked at 320, 390, 768, 1024 and 1440 pixels, with both themes and reduced motion |

## Content corrections

- Replaced the claim that most effective briefs are 120–250 words with prompts about observable results, inputs and review.
- Replaced promises about walking away to many finished deliverables with instructions to steer and inspect the evidence.
- Clarified that elapsed times are estimates, and that the small studio exercise is distinct from the larger lane lab.
- Replaced a claim that a short company-context addition changes results more than anything else with a request for current audience/company context; memory can be stale.

## Defects reproduced and fixed

- A closed phone sidebar was inaccessible when opened: synchronize `inert`, focus containment and focus restoration with menu state and viewport changes.
- Closing the phone contents outline after scrolling shifted the target out of view: collapse before scrolling, preserve the route and respect reduced motion.
- Resuming a curated route lost its path: retain the path alongside the last lesson.
- Dark code blocks inherited a near-white background with near-white text: give code examples a stable dark background and a keyboard focus stop for scrolling.
- Dark course links, active navigation duration labels and beginner chips had insufficient contrast: correct their rendered foreground/background combinations.

## Verification

Local verification passed on 30 September:

- `npm test`: manifest/content checks, 32 unit tests and 58 browser tests passed. All 71 pages render at 320px in both themes, with accurate overviews and no browser errors. All 14 guided simulations complete and reset.
- The focus-mode test also passed after adding the final reset-state regression.
- `npm run check:links`: 124 public URLs passed; one private report returned its expected authentication response; zero URLs were unverified; one intentional placeholder/local URL was skipped.
- `git diff --check`: passed.
- Axe scans: zero WCAG 2 A/AA and 2.1 A/AA violations in 32 states (eight representative routes × two themes × 390/1440px). Four homepage/studio phone states were rechecked after making mobile global navigation visible, also with zero violations.
- Visual inspection: desktop homepage, dark Code lesson and phone studio inspected; five viewport sizes exercised by browser tests.

Browser tests exercise the new studio, local-only text checks, copy fallback, CSV contents, recommendation/resume behavior, focus mode and reset, phone navigation, rendered text contrast, all 71 lesson overviews, all 63 judgment checks and both-theme layouts. Existing tests continue to cover the guided simulations, quizzes, progress, review, search and learning tools.

Accessibility scanning uses axe-core 4.10.3 against eight representative routes in two themes and two viewport sizes. Automated scans complement keyboard and visual checks; they are not a claim of complete accessibility certification.

Real paid Claude sessions and external connector actions are outside these deterministic site checks. The product labels the practice exercise accordingly.
