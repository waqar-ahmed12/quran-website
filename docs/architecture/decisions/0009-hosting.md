---
tags: [architecture, adr]
adr: 9
status: proposed
date: 2026-10-08
---
# ADR-0009: Netlify for the pages, Fly.io for the API, one origin through a rewrite

**Part of** [[docs/architecture/decisions/README|Decision log]] · the details are in
[[docs/architecture/08-deployment-and-operations|Deployment and operations]]

## Status
Proposed, waiting for your yes. Nothing is signed up for yet.

## Context
- `netlify.toml` already publishes `site/`, and `site/_headers` sets its security headers and the long caching for the
  hero frames.
- The frames are large and never change, which is what a CDN is for.
- SQLite needs a disk that survives restarts ([[docs/architecture/decisions/0005-sqlite|ADR-0005]]). Serverless functions
  have no such disk.
- A cookie is simplest when the pages and the API share one origin: no CORS, and no third-party cookie rules.

## Decision
Netlify serves the pages. A Netlify rewrite sends `/api/*` to a Fly.io app running one always-on machine with a volume
for the database and Litestream for backups. The browser only ever talks to the site's own domain.

## Alternatives considered

### One small VPS (for example Hetzner) running everything behind Caddy
- For: the cheapest, full control, and one bill.
- Against: you look after the operating system (updates, firewall, disk), and there is no CDN for the frames unless one
  is added.
- A sound alternative if you'd rather learn to run a server yourself. It only changes this ADR and the operations note.

### Render or Railway
- For: simple to deploy.
- Against: persistent disks are paid extras, and their set-up for SQLite and Litestream is less well trodden.
- Rejected, narrowly.

### Netlify Functions (or Vercel) with a hosted Postgres
- Against: functions keep no disk, so SQLite is out; cold starts; and a second service for the database.
- Rejected.

## Consequences
- Two providers to know, each doing what it is best at.
- An API call goes browser → Netlify → Fly, a little slower than direct. Sync happens in the background, so no one
  waits on it.
- A few dollars a month at launch ([[docs/architecture/08-deployment-and-operations#What it costs|costs]]).
- Deploy previews of the pages don't reach the production API; account features are switched off there.
