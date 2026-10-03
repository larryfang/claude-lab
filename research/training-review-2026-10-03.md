# Training and learning-flow review — 3 October 2026

This review gives a planned learning session a clear finish, preserves the learner's place across navigation, and corrects practical exercises that could produce misleading or unsafe results. Google remains the recommended account option, with GitHub available. Guest access remains useful, with account benefits explained at the points where progress matters.

The review covered both course implementations, current product claims, worked examples, reusable briefs, and the existing account regressions. It builds on the separately documented [2 October bug audit](bug-audit-2026-10-02.md); those previously shipped fixes are not counted again here. There is no database migration or change to provider configuration in this release.

## Learning experience

| Finding | Result |
|---|---|
| The time planner advertised a short session, but completion continued into the whole route. | The planned lessons travel with the route. The final lesson opens a session summary with progress, a useful reflection, and an action to plan the next session. |
| Reloads and some home/course resume actions dropped the chosen session. | The last learning place includes session details. Home, course cards, course home, pager and keyboard navigation retain them. |
| Looking up a glossary or template replaced the learner's last learning place. | References retain the current place and offer a return link. |
| Finishing the full course continued into reference material; completed routes lacked a meaningful next step. | Course and route completion show progress and an action to practise or plan another session. |
| Completion and phone outline navigation did not put keyboard focus on the destination heading. | The new destination receives focus; the phone outline closes after selecting a section. |
| Navigation check marks could imply that unfinished lessons were completed. | Completion is announced only for completed lessons, and lesson duration has a clear accessible label. |
| The new visually hidden navigation labels initially appeared on screen and forced excessive wrapping. | A shared visually hidden style keeps the sidebar readable while retaining the accessible labels. The regression checks both the spoken label and row height. |

Invalid, repeated, reordered, oversized and cross-route session tokens fall back to ordinary route navigation. Session details survive the local snapshot and merge contract. Completion records activity; the UI does not present it as proof of professional competence or an approved real-world result.

## Product and training accuracy

The installed Claude Code CLI and its help were checked at **2.1.288**. Volatile claims were compared with current primary documentation; freshness dates were advanced only for lessons whose relevant sources were checked.

| Area | Corrections |
|---|---|
| Cowork surfaces and schedules | Explain the unified conversation and cloud/Desktop storage choices. Label the documented **6 October** change for new Pro/Max tasks as upcoming. Scheduled briefs default to a downloadable result unless storage creation and later reading have been verified. Distinguish a first baseline, genuinely empty results and missing evidence. |
| Connectors, Research and Google Workspace | Describe actual scope and identity limits, current Research entry points and the Google Docs/Sheets/Slides extension. A successful access probe establishes that particular operation, not permanent access to every file or tool. |
| Context and permissions | Remove unsupported context degradation percentages. Explain current memory/rule locations, checkpoint limits, the interactive permission default, and how to select manual mode for the lab. Advisory instructions and model judgement are not deterministic access controls. |
| Hooks and automation | Define PostToolUse as following success. Correct Stop blocking and loop prevention. Quote filenames, stop on invalid event JSON, avoid installing dependencies implicitly, and make the pre-commit review accept only a successful exact `OK` result. Explain the authentication consequence of `--bare`. |
| Subagents, PRs and worktrees | Remove Bash from the purported read-only reviewer. Require review, commit and push before creating the practice PR. Preserve work before worktree removal and avoid forceful cleanup. Handle spaces and a final line without a newline in the sequential file loop. |
| Sales briefs and pipeline | Use stable opportunity IDs in output filenames so repeated account names do not overwrite briefs. Check duplicate IDs, currency and missing values rather than treating repeated accounts as duplicates or unknown amounts as zero. |
| Competitive analysis and customer research | Require evidence about both products at comparable tiers and versions. Undocumented capability is unknown. Podcast advice is a separate synthesis practice, not evidence of demand or ARR for the learner's product. Deduplicate customers and avoid forced theme, quotation or objection quotas. |
| Campaign measurement | Use the ratio of aggregate numerators and denominators rather than averaging row percentages. Distinguish cohorts, missing values, observational patterns and unsupported causal/statistical claims. |
| Product reporting | Separate a ticket marked Done from a verified customer release. Request dated transitions before describing movement over time, and actual activity evidence before describing an assignee's work. Simulated critique is preparation for real review, not customer or engineering validation. |
| Finance exercises | Exclude missing actuals from both sides of comparable totals and label coverage. Correct invoice/payment/bank fixture counts, separate expected open invoices from errors, avoid counting one discrepancy twice, and specify debtor ageing inputs and the as-of date. |
| Reusable skills and briefs | Apply the same corrections to template libraries and capstone prompts. Confirm that a recorded skill was actually used in a fresh task; similar output alone is not proof. |

Primary sources for these changes include [Claude's unified experience](https://support.claude.com/en/articles/16761823), [Cowork across surfaces](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile), [scheduling](https://support.claude.com/en/articles/13854387), [Research](https://support.claude.com/en/articles/11088861-use-research-on-claude), and [Google Workspace](https://support.claude.com/en/articles/16951679-use-claude-in-google-docs-sheets-and-slides). Code behavior was checked against [permission modes](https://code.claude.com/docs/en/permission-modes), [memory](https://code.claude.com/docs/en/memory), [checkpointing](https://code.claude.com/docs/en/checkpointing), [hooks](https://code.claude.com/docs/en/hooks), [subagents](https://code.claude.com/docs/en/sub-agents), [CLI reference](https://code.claude.com/docs/en/cli-reference) and the [official changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md). The [finance plugin](https://github.com/anthropics/knowledge-work-plugins/blob/main/finance/README.md) and [podcast archive](https://github.com/ChatPRD/lennys-podcast-transcripts) were also checked. Exercise arithmetic and evidence limits were reviewed directly.

## Verification

`npm test` passed: **2 courses, 71 registered lessons, 51 unit checks and 106 browser checks** (1.9 minutes for the browser suite). This includes all 71 lessons at 320px in both themes, the guided simulations, account regressions, and the new session flows.

`npm run check:links` passed: **124 live URLs, one protected URL requiring authentication, zero unverified URLs and one placeholder/local URL skipped**. `git diff --check` also passed. The protected URL is the private usage report, whose authentication requirement is tested separately.

The new learning-journey regressions cover session completion and reload, unfinished and invalid sessions, home/course resume actions, reference return, keyboard boundaries, mobile outline focus, finished routes/courses, and accessible navigation. Published shell examples are executed with isolated fake tools to test failures, ambiguous review output, malformed event JSON and filenames containing spaces; these do not invoke a paid model or mutate a real repository.

Local evidence is retained in `/tmp/claude-lab-training-review-final-test.log`, `/tmp/claude-lab-training-review-final-links.log`, `/tmp/claude-lab-session-state-tests.log` and the targeted before/after logs. The reviewed assets use version `2026-10-03a`.

## Coverage boundaries

- Public production Auth settings report Google and GitHub enabled. Account lifecycle and provider callback regressions run in the automated suite. Real provider sign-in and identity linking were not repeated in this pass.
- The optional live account/database suite could not run because a management credential was unavailable to both the process and installed CLI. It has been extended to check session details on its next authenticated run. Local snapshot/merge tests cover the new state contract; existing server validation accepts the unchanged root structure.
- Source retrieval included 24 successful responses from the main 33-source batch and nine rate-limited responses, plus focused successful follow-ups. This is a claim-by-claim review of the changed material, not independent verification of every historical assertion or quotation in the course.
- Independent audit agents could not start because their workspace credits were exhausted. Findings were investigated and verified directly; this report does not claim independent review coverage.
- The course simulations and controlled command tests teach and verify the stated behavior. They do not prove that a real external business workflow will succeed with a particular learner's data, permissions or installed plugins.
