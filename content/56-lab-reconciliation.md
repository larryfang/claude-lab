# Lab: Three-Way Reconciliation & the Chase

Twenty minutes. Three files that should tie and do not, an exception report that says exactly where and by how much — then the debtors-ageing chase emails, drafted and never sent.

The three sources here are your invoices, the payment processor's report and the bank statement. This is not the accounts-payable "three-way match" of purchase order, goods receipt and supplier invoice.

## Part 1 — Make the mess (4 min)

:::lab Step 1 — Generate books that do not tie
```prompt
In the `finance/` subfolder, create realistic but entirely FICTIONAL practice data for a reconciliation exercise. Invent all names.

Create:
- `invoices.csv` — 30 rows: invoice_id, customer, issue_date, due_date, amount_usd, status (open/paid)
- `payments.csv` — 26 rows: payment_id, invoice_id, date, gross_usd, fee_usd, net_usd
- `bank-statement.csv` — 25 rows: date, reference, amount_usd, description

Seed exactly these problems, and do not tell me where they are:
- one invoice paid twice
- two invoices with a payment but no bank line (missing settlement)
- one payment where the bank amount differs from net_usd by a small fee discrepancy
- one bank line with a reference that matches nothing
- one payment applied to the wrong invoice_id (amount matches a different invoice exactly)

Every other row must tie exactly. Leave the files loose in `finance/`.
```

- [ ] Files created — and you genuinely do not know where the problems are, which makes the next part a real test
:::

## Part 2 — The reconciliation (10 min)

:::lab Step 2 — The brief
```prompt
BACKGROUND. I need to reconcile invoices, payments and the bank statement for the month. The three files are in `finance/`.

RESULT. Produce `output/reconciliation.xlsx` with three tabs:
1. Matched — every fully matched invoice–payment–bank set: invoice_id, payment_id, bank reference, amounts at each stage, and the fee explaining any gross-to-net difference
2. Exceptions — a three-tier report: (a) exact matches confirmed — a count only, their rows stay on Matched, (b) timing differences likely to resolve within days, (c) unexplained variances requiring investigation. Within the investigation tier, one row per item with columns: type (duplicate payment / missing settlement / amount mismatch / unmatched bank line / suspected misapplication), the row ids involved from each file, the financial impact in USD, and what a human should check first
3. Control — the totals: sum of invoices, payments and bank lines, counts of matched and unmatched from each file, and a single line stating whether Matched + Exceptions accounts for every row in all three files

Also produce `output/reconciliation-summary.md`: five lines maximum — items matched, exceptions found by type, total financial impact of exceptions, and the single most urgent item.

INPUTS. Only the three files in `finance/`.

EDGES. NEVER force a match. If a match is plausible but not certain — an amount that fits a different invoice, a near-miss on the fee — put it in Exceptions as suspected, with your reasoning, not in Matched. Never estimate a missing value. State every row id. Read-only on `finance/`; write only to `output/`.

FLAG: any row you could not classify, and any open invoice whose customer also appears in Exceptions.

Show me your plan before you start.
```

- [ ] The exception report found the seeded problems — check against the list in Step 1
- [ ] Every exception carries row ids from the source files
- [ ] The Control tab accounts for every row in all three files
:::

:::warning Score it against the seed
This is the rare lab where you know the right answer: five seeded problem types, six items in all (the missing settlement is seeded twice). Did it find all six? Did it invent a seventh that is not real? A reconciliation that **misses** an exception is dangerous; one that **invents** exceptions wastes the reviewer's trust. Both failure modes matter, and you have just measured your setup against each.
:::

:::note Why "three-tier"?
The tiered wording comes from a write-up of the AR-to-GL reconciliation workflow that Anthropic's finance team automates, which uses exactly this structure: *"Specifying 'three-tier' forces Claude to categorise rather than summarise."* ([CFO Connect](https://www.cfoconnect.eu/resources/finance-insights/finance-workflows-anthropic-automates-claude-prompts/)) An AR-to-GL reconciliation skill shown in the team's webinar surfaced a **$33k discrepancy live**. ([CFO Connect recap](https://www.cfoconnect.eu/resources/finance-insights/anthropic-finance-team-claude-skills/))
:::

:::concept Why "never force a match" is the whole lab
The misapplied payment is the trap: the amount matches a different invoice exactly, so a lazy matcher will tie it and move on — and the books will look clean while being wrong. "Plausible but not certain goes to Exceptions, with reasoning" is the single instruction that separates a reconciliation from a tidying exercise.
:::

## Part 3 — The chase drafts (6 min)

Now the ageing follow-up — the weekly task most reliably skipped.

:::lab Step 3 — Tone-graded drafts, never sent
```prompt
Using `finance/invoices.csv`, find every open invoice past its due date and group by days overdue: 1–30, 31–60, 61–90, 91+.

For each overdue customer, draft a chase email in `output/chase-drafts/` (one file per customer, named by customer):
- 1–30 days: friendly reminder, assume oversight
- 31–60 days: firm, restate amount, invoice id and due date, ask for a payment date
- 61–90 days: escalation, mention next steps plainly but professionally
- 91+ days: final notice tone, no threats you have not told me about

Every draft must state the exact invoice ids and amounts from the file. At the top of each draft, add a DO NOT SEND line listing anything I should verify first — a payment that might be in flight from the reconciliation exceptions, a disputed invoice, anything odd.

Do not send anything. Do not connect to email. Drafts on disk only.
```

- [ ] One draft per overdue customer, tone matching the bucket
- [ ] Amounts and invoice ids match the source file — spot-check two
- [ ] The DO NOT SEND flags caught the customers involved in reconciliation exceptions
:::

:::tip The design is the safety
Notice what made this safe: drafts to disk, not a connected mailbox; the verify-first line at the top of each; and the cross-reference against the exceptions, so you never chase a customer whose payment is sitting unmatched in your own books. When you later wire this to a real mail connector, keep all three — and keep it producing **drafts**.
:::

## Reflect

Answer about your own work, not the practice data. Your answers save to your notebook in this browser.

```reflect
Did the reconciliation find all six seeded items, and did it invent any? How would you measure your setup against a known answer before you trust it with your real books?
```

```reflect
Could you have chased a real customer whose payment was sitting unmatched in your own books? What check will stop that at your next close?
```

```quiz
Q: A payment's amount exactly matches a different invoice. Where does it belong in the reconciliation?
- Matched — the amounts tie
+ Exceptions, as a suspected misapplication with reasoning — plausible is not certain
- Deleted from the file
- Split across both invoices
> Books that look clean while being wrong are worse than books with honest exceptions.

Q: What makes the Control tab worth its place?
- It duplicates the summary
+ It proves completeness: every row from all three files is accounted for in Matched or Exceptions, so nothing was silently dropped
- It formats the totals nicely
- It is required by the xlsx format
> Reconciliation is a completeness game. The Control tab is the proof.

Q: Why do the chase drafts cross-reference the reconciliation exceptions?
- To make the emails longer
+ So you never chase a customer whose payment is already sitting unmatched in your own books — the fastest way to look incompetent and damage a relationship
- To reuse the same file
- Connectors require it
> The two deliverables are one system. The exceptions protect the chase.

Q: This lab seeded six known problems before running the reconciliation. What is that technique for?
- Making the data realistic
+ Measuring both failure modes against a known answer: exceptions missed, and exceptions invented
- Saving tokens
- Testing the CSV format
> When you know the right answer, you can grade the tool — and your brief — honestly.
```

:::try Next
The numbers reconcile. Now put them in front of the board — and build the forecast they will ask about.
:::
