---
tags: [architecture, adr, hub]
---
# Decision log

**Part of** [[docs/architecture/README|Architecture]] · [[MAP]]

An **ADR** (Architecture Decision Record) is a short note of one decision: the situation, what was chosen, what else
was considered and why it lost, and what follows from it. Code shows *what* was built; these say *why*, so no one has to
argue the same question again in six months.

| # | Decision | Status | Date |
|---|---|---|---|
| 1 | [[docs/architecture/decisions/0001-static-frontend\|A static frontend, with no framework and no build step]] | accepted | 2026-09-12 |
| 2 | [[docs/architecture/decisions/0002-content-as-code\|Lessons, words and verses are code, not database rows]] | accepted | 2026-09-14 |
| 3 | [[docs/architecture/decisions/0003-local-first\|Local first; accounts are optional]] | proposed | 2026-10-08 |
| 4 | [[docs/architecture/decisions/0004-node-zero-dependency-api\|The API is Node 24 with no dependencies]] | proposed | 2026-10-08 |
| 5 | [[docs/architecture/decisions/0005-sqlite\|SQLite is the database]] | proposed | 2026-10-08 |
| 6 | [[docs/architecture/decisions/0006-progress-event-log\|Progress syncs as an append-only log of events]] | proposed | 2026-10-08 |
| 7 | [[docs/architecture/decisions/0007-email-link-sign-in\|Sign in with an emailed link, not a password]] | proposed | 2026-10-08 |
| 8 | [[docs/architecture/decisions/0008-adults-hold-accounts\|Adults hold accounts; children are learner profiles]] | proposed | 2026-10-08 |
| 9 | [[docs/architecture/decisions/0009-hosting\|Netlify for the pages, Fly.io for the API]] | proposed | 2026-10-08 |
| 10 | [[docs/architecture/decisions/0010-own-enquiry-endpoint\|Enquiries go to our own API]] | proposed | 2026-10-08 |
| 11 | [[docs/architecture/decisions/0011-voice-to-teacher-gated\|A learner's voice reaches the teacher only by a separate decision]] | **needs your decision** | 2026-10-08 |

The same list as a live table, built by Obsidian from each record's `status:` and `date:` properties:

![[docs/architecture/decisions/decisions.base]]

## Statuses

`proposed` → `accepted` → later, maybe `superseded` (by a newer ADR) or `deprecated`.

- To accept one, change its `status:` to `accepted` and the Status section to "Accepted on (date)". The table above and
  the live table follow.
- **A record is never rewritten to say something else.** A changed mind is a new ADR that says "Supersedes ADR-000N",
  and the old one's status becomes `superseded`. The history of why is the point.

## Writing a new one

Copy the shape of any record here: the frontmatter (`tags`, `adr`, `status`, `date`), a **Part of** line, then
Status, Context, Decision, Alternatives considered, Consequences. Number it next in line, add it to the table above,
and link it from the note it affects.
