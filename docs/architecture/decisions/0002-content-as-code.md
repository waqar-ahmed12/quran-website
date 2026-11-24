---
tags: [architecture, adr]
adr: 2
status: accepted
date: 2026-09-14
---
# ADR-0002: Lessons, words and verses are code, not database rows

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/04-data-model|Data model]]
and [[docs/architecture/02-frontend|Frontend]]

## Status
Accepted. Recorded on 2026-10-08; it has been how the Qaida works since step 1 ([[QAIDA-BUILD]], 2026-09-14), and the
rule that Qur'an text is copied, never typed, dates from [[WEBSITE-BUILD]] §4 (2026-09-13).

## Context
- Qur'an text must be exactly what the mushaf prints. One wrong mark is a real harm, not a bug.
- The words and verses are copied from Quran.com by `tools/fetch-qaida-words.js` and `tools/fetch-qaida-verses.js`, and
  the checks recompute their hashes.
- Every lesson is specified in a folder of notes and checked by a script. Hash fences prove a new lesson left the old
  ones unchanged.
- The backend adds a database. The natural question is whether lessons should move into it.

## Decision
Lesson data, kits, words, verses and the audio manifest stay as versioned files under `site/qaida/`, written by hand or
by the fetch tools, reviewed in git and proved by the checks. The database never stores content. It refers to content
by **lesson number** and **item id**.

## Alternatives considered

### Lessons in the database, edited through an admin page
- For: change a lesson without a deploy.
- Against: Qur'an text would become editable by hand, outside the checks. The history and review that git gives would
  be lost. The Qaida would need the server to show a lesson, which breaks working offline.
- Rejected.

### A headless CMS
- For: an editing interface.
- Against: the same problems, plus a third party, and the content isn't edited by non-developers.
- Rejected.

## Consequences
- Changing a lesson is a deploy, with every check run first. That is a feature here.
- **Item ids are a public contract** between the lesson files, the device, the events and the teacher's view. They
  never change once released, and phase E adds a check for that.
- The teacher's recordings stay as files listed in `audio/manifest.json`. The recordings page (`recordings.html`)
  remains the way to see what's missing.
- The database stays small and holds only what is personal, which makes export and deletion simple and complete.
