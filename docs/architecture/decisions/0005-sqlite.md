---
tags: [architecture, adr]
adr: 5
status: proposed
date: 2026-10-08
---
# ADR-0005: SQLite is the database

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/04-data-model|Data model]]
and [[docs/architecture/08-deployment-and-operations|Deployment and operations]]

## Status
Proposed, waiting for your yes.

## Context
- The load is small: one teacher, tens of one-to-one students, perhaps thousands of free users, with most of them
  never signing in. Writes are short (a batch of answers, an enquiry).
- The data is relational: accounts have learners, learners have progress, teachers have enrolments.
- One server process is planned ([[docs/architecture/decisions/0004-node-zero-dependency-api|ADR-0004]]), and there is
  no one to run a database server.
- Node 24 has SQLite built in. The schema was tested with it on 2026-10-08 (20 of 20 constraint tests passed).

## Decision
One SQLite file on the API machine's persistent disk, in WAL mode, with foreign keys on and every table `STRICT`.
Exactly one machine writes to it. Litestream streams every change to a bucket for backups.

## Alternatives considered

### PostgreSQL, hosted (Neon, Supabase, Fly Postgres)
- For: many writers at once, managed backups, room for any amount of growth, and the most common choice in industry.
- Against: another service to pay for and secure, a network hop on every query, and a local install (new software on
  this PC) or a cloud database for development.
- Not now. The SQL is kept close to standard (the SQLite-only parts are `STRICT` and `WITHOUT ROWID`), so moving to
  Postgres later is a migration project, not a rewrite. The trigger would be needing a second API machine.

### MongoDB
- Against: the data is relational, and it would be joined by hand.
- Rejected.

### Keep everything in the browser, with no database
- Against: can't carry progress between devices or show it to the teacher.
- Rejected. That is the status quo this ADR exists to extend.

## Consequences
- Exactly one API machine: never scale out horizontally. At this size one machine has room to spare, by orders of
  magnitude.
- Reads are local-disk fast, with no connection pool to tune.
- Backups have to be set up on purpose (Litestream), and restoring has to be rehearsed. Both are in phase G.
- Tests run on an in-memory database, so the whole server suite runs in seconds with nothing to install.
