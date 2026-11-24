---
tags: [architecture, adr]
adr: 6
status: proposed
date: 2026-10-08
---
# ADR-0006: Progress syncs as an append-only log of events

**Part of** [[docs/architecture/decisions/README|Decision log]] · the protocol is [[docs/architecture/06-sync|Progress sync]] ·
the tables are in [[docs/architecture/04-data-model|Data model]]

## Status
Proposed, waiting for your yes.

## Context
- A learner may practise on a phone and a laptop, both offline at times. Their work must combine, not overwrite.
- Today the device keeps totals per item: right, wrong, and the current run of right answers. Right and wrong are sums,
  but the run depends on the order of answers.
- The teacher's most useful view is "which items does this learner keep missing", which needs per-item history.
- All progress changes already pass through four functions in `shell.js`.

## Decision
Each change becomes an **event** with an id made on the device (`answer`, `seen`, `done`, `undone`, `reset`, and
`baseline` for history from before the account). The device queues events in an outbox and sends them in batches. The
server stores each event once (`ON CONFLICT (id) DO NOTHING`) and keeps per-item and per-lesson totals in the same
transaction. The totals can be rebuilt from the events at any time.

## Alternatives considered

### Copy the whole progress object, last write wins
- For: very simple.
- Against: two devices overwrite each other's work, and there is no history for the teacher.
- Rejected.

### Merge totals by taking the larger number
- For: simple, and never invents progress.
- Against: under-counts whenever both devices practised, and the run of right answers can't be merged this way.
- Rejected, though it is used once, for the first-link baseline, where nothing better exists.

### A CRDT library
- For: a general answer to merging.
- Against: a dependency, and more than is needed. Counts already merge in any order, and only the run needs ordering,
  which is cheap to work out per item.
- Rejected.

## Consequences
- Retries are harmless, so the device can resend freely after any failure.
- The teacher's view and any future statistics come from the same record.
- Storage grows with use: about 100 bytes an answer, so 1 MB for a very busy learner. That is fine for SQLite.
- The one subtle rule (the run of right answers is worked out again per item, in time order) gets its own tests in
  `tools/qaida-sync-check.js`.
