---
tags: [architecture, adr]
adr: 3
status: proposed
date: 2026-10-08
---
# ADR-0003: Local first. Accounts are optional, and no lesson needs the server

**Part of** [[docs/architecture/decisions/README|Decision log]] · shapes [[docs/architecture/01-system-overview|System overview]]
and [[docs/architecture/06-sync|Progress sync]]

## Status
Proposed, waiting for your yes.

## Context
- The Qaida works today with no account and no network. Its design notes say so on purpose
  (`design-system/quran-landing/pages/qaida.md`: "one key, `qaida`, no accounts").
- The landing page promises "a free Qaida you can hear". Anyone should be able to start without giving an email.
- One-to-one students would gain from two things only a server can give: progress on more than one device, and a teacher
  who can see it between lessons.

## Decision
The device stays the first copy of a learner's progress. An account is something an adult **chooses**, to save progress
across devices or share it with the teacher. No feature of the free Qaida asks for sign-in. The API only ever adds to
the Qaida: if it is slow or down, every lesson works exactly as it does today, and sync catches up later.

## Alternatives considered

### Sign-in required to use the Qaida
- For: one source of truth, simpler code.
- Against: a wall in front of a free resource, and children's data collected for no reason.
- Rejected.

### Server first: the pages fetch progress before showing anything
- For: always up to date.
- Against: no connection means no lesson, and every page waits on a round trip.
- Rejected.

## Consequences
- Two copies of progress (device and server) must agree. The rules for that are
  [[docs/architecture/decisions/0006-progress-event-log|ADR-0006]] and [[docs/architecture/06-sync|Progress sync]].
- The API can be offline for a deploy or an incident with no student noticing, which keeps operations light.
- Later, a service worker can make the whole Qaida installable and fully offline, with no change to this decision.
