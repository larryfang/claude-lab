# Training references and correctness review — 25 September 2026

## Scope and evidence

This follow-up reviewed instructional claims and learner assessment in both tracks. It updates 21 existing lesson/reference pages without changing routes or completion requirements. Research used official Claude Academy, Help Center, and Claude Code documentation. Product details were checked in the English documentation on this date; availability still depends on version, plan, organization settings, and rollout.

This is a focused content review, not a claim that every product feature was exercised in a paid Claude account. The site's automated browser suite checks the course interface and scripted learning blocks. It does not execute the learner's Claude tasks, authenticate their connectors, or assess their submitted work.

## Sources and applications

| Official reference | What it supports | Application in Claude Lab |
|---|---|---|
| [Claude Academy](https://academy.claude.com/) | Official training destination | Clear independent-course and credential wording |
| [AI Fluency: the 4D framework](https://academy.claude.com/courses/ai-fluency-framework-foundations/the-4d-framework) | Delegation, Description, Discernment, Diligence; attribution to Dakan and Feller | A short decision checklist in Welcome, distinct from the course's B.R.I.E.F. mnemonic |
| [Description–Discernment loop](https://academy.claude.com/courses/ai-fluency-framework-foundations/the-description-discernment-loop) | Iterative feedback, explicit expectations, human judgment | Replace the arbitrary restart timer; add observable acceptance checks |
| [Introduction to Claude Cowork](https://academy.claude.com/courses/introduction-to-claude-cowork) | Official introductory Cowork training | Next-30-days resource table with a practical reason to use each resource |
| [Cowork resource hub](https://academy.claude.com/products/cowork) | Official tutorials, use cases, and Help Center entry points | Continued learning and current product help |
| [Claude Code 101](https://academy.claude.com/courses/claude-code-101) | Official introductory Code training | Code track starting resources |
| [AI Fluency for builders](https://academy.claude.com/courses/ai-fluency-for-builders) | Acceptance criteria and responsibility across a build | Capstone criteria defined before implementation |
| [Discernment for code](https://academy.claude.com/courses/ai-fluency-for-builders/discernment-for-code) | Five lenses for reviewing work | Concrete review evidence beyond a passing suite |
| [Discernment for user experience](https://academy.claude.com/courses/ai-fluency-for-builders/discernment-for-user-experience) | Accessibility, user flows, actionable feedback | Keyboard, narrow-screen, empty-state, and error-recovery checks |
| [Incorrect or misleading responses](https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on) | Check factual claims against reliable sources | Source inspection; confidence is not verification |
| [Chat search and memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context) | Context can persist across conversations | Remove claims that a new task necessarily has no prior context |
| [Claude Code memory](https://code.claude.com/docs/en/memory) | Instructions and auto memory carry project knowledge across sessions | Correct the introductory memory model |
| [Permission modes](https://code.claude.com/docs/en/permission-modes) | Plan's bypass exception; starting-mode conditions | Align tour, workflow, permissions, FAQ, flashcards, and glossary |
| [Permission rules](https://code.claude.com/docs/en/permissions) | Manual approval exceptions and explicit ask rules | Remove “every command” and “only after repeated blocks” claims |
| [Sandboxing](https://code.claude.com/docs/en/sandboxing) and [security](https://code.claude.com/docs/en/security) | Isolation and approval are distinct controls | Explain boundaries without treating benchmark percentages as a guarantee |
| [Custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) | Reusable instructions require testing | Remove “guaranteed, exact run” language from explicit skill invocation |

## Editorial decisions

- A sample of three numbers is a teaching exercise, not a statistical assurance or a release gate. Check decision-critical claims, then sample more; expand after an error.
- Aggregation changes row counts legitimately. Teach record accounting, documented exclusions, deduplication, and group counts instead of requiring equal output rows everywhere.
- A second AI task can help review, but shared context and correlated model errors prevent treating it as independent proof.
- Test output proves only the assertions that actually ran. The new skipped-test scenario makes that limit concrete.
- Capstones now request evidence of normal behaviour, failures, corrections, and handover. These are original course exercises informed by the sources, not official Anthropic assessment criteria.
- The Code capstone removes a gratuitous ISO-format option for an integer day difference, tests impossible dates instead, and explains branch, commit, push, and PR prerequisites. Its transcript remains explicitly fictional.
- The course's mnemonic, practice heuristics, self-issued certificate, and product guarantees are now distinguished explicitly.

## Validation record

- Content validation: 71 registered pages and routes passed, including custom block syntax and asset versions.
- Unit checks: 19 passed.
- Browser suite: 40 passed, including every interactive lesson block and completion/replay of all 14 guided simulations.
- External links: 122 checked, zero failures or unverified responses, one intentional placeholder skipped.
- Narrow-screen check: all 71 pages rendered at 320 px with no horizontal page overflow or JavaScript errors. The new tables were also inspected visually at 390 px.
- The first full run exposed a timing-dependent navigation test. It now holds and releases the earlier response explicitly instead of relying on a 500 ms delay. The full rerun passed. The interaction sweep uses the browser's reduced-motion preference so scroll animations do not dominate its timing budget.

These checks validate the training site and scripted exercises. Real Claude tasks, paid-plan features, and external connectors remain outside this automated evidence. Deployment and verification workflows provide the release record for the committed revision.
