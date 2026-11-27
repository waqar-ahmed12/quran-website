---
tags: [architecture, adr]
adr: 4
status: proposed
date: 2026-10-08
---
# ADR-0004: The API is Node 24 with no dependencies

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/03-backend|Backend]]

## Status
Proposed, waiting for your yes.

## Context
- Node 24 (validly signed) is the one runtime trusted on this PC. Python is the worm, and installing new software waits
  until the PC is cleaned ([[WEBSITE-BUILD]] §0).
- The API is small: about 25 routes, a dozen tables, no file uploads at first.
- Node 24 now has, built in, everything such an API needs: an HTTP server, SQLite (`node:sqlite`, checked working here on
  2026-10-08), hashing and random tokens (`node:crypto`), a test runner (`node:test`) and `fetch`.
- Every npm package is code from strangers that runs with the server's rights. Supply-chain attacks are a real and
  growing way in.
- Node 24 is a long-term support release, maintained until April 2028.

## Decision
Write the server in Node 24, as ES modules, using only Node's own modules. `server/package.json` lists no dependencies,
and a check fails the build if one appears. The small pieces a framework would give (a router, body parsing, cookies,
validation) are written here, each in one short file with its own tests.

## Alternatives considered

### Express or Fastify
- For: well known, many plugins, faster to start.
- Against: dozens of packages for routing about 25 paths, which takes about 60 lines.
- Rejected, but either is a reasonable swap later: the routes are thin, so moving would be a contained change.

### Supabase or Firebase (a hosted backend)
- For: the fastest way to accounts and a database, with no server to run.
- Against: children's and families' data in a third party's database, rules written in their language, and lock-in.
  Also less of the system is yours to understand and show.
- Rejected.

### Python with Django or FastAPI
- Against: Python is unsafe on this PC today.
- Rejected.

### Deno or Bun
- For: modern, with batteries included.
- Against: not installed, and installing is what's on hold.
- Rejected.

## Consequences
- Nothing to install, nothing to audit for vulnerabilities, nothing to keep updated except Node itself.
- The house owns a little more code: the router, validation and cookie handling. Each is small and tested.
- `node:sqlite` is still marked as in active development. Only `db/database.js` imports it, so moving to another driver
  (`better-sqlite3` has nearly the same synchronous API) would touch one file.
- Upgrading Node is the one dependency to manage: plan the move to the next LTS before April 2028.
