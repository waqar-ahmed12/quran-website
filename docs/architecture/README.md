---
tags: [architecture, hub]
---
# Architecture

**Part of** [[MAP]] · the build guides are [[WEBSITE-BUILD]] and [[QAIDA-BUILD]]

Alif to Ayah (working name) is a site for learning to read the Qur'an. It has three parts: a landing page, a free Qaida
of 29 lessons that works on any device with no sign-up, and one-to-one lessons with a teacher. This folder explains how
the whole thing is built: what exists, what is planned, and why each choice was made.

**Where it stands, 2026-10-08.** The **frontend is built**: the landing page, Qaida lessons 1–23, and 25 check scripts
that test it without a browser. The **backend and database are designed here but not built yet**. They get built in
phases, each one signed off before the next ([[docs/architecture/10-roadmap|roadmap]]).

## Read in this order

1. [[docs/architecture/01-system-overview|System overview]]: the whole system on one page, and the rules it follows
2. [[docs/architecture/02-frontend|Frontend]]: the pages, the scripts, and where each piece of state lives
3. [[docs/architecture/03-backend|Backend]]: the API server, layer by layer
4. [[docs/architecture/04-data-model|Data model]]: the database tables, and what is kept out of them on purpose
5. [[docs/architecture/05-api|API]]: every endpoint, who may call it, and what it returns
6. [[docs/architecture/06-sync|Progress sync]]: how a lesson practised offline reaches the teacher
7. [[docs/architecture/07-security-and-privacy|Security and privacy]]: children, voices, threats and controls
8. [[docs/architecture/08-deployment-and-operations|Deployment and operations]]: hosting, CI/CD, backups, monitoring
9. [[docs/architecture/09-testing|Testing]]: the checks that exist, and the ones to add
10. [[docs/architecture/10-roadmap|Roadmap]]: build phases A to I, each with a "done when"
11. [[docs/architecture/11-glossary|Glossary]]: Qaida words and software words

## Decisions

Every choice that would be expensive to undo has a short record of the reasons and the alternatives:
[[docs/architecture/decisions/README|the decision log]]. Two record what was already decided; the rest are
**proposed** and wait for your yes.

## The visual map

Open [[docs/architecture/architecture.canvas|the architecture board]] for the whole system as boxes and arrows. Green
boxes are built, yellow ones are planned, and each note box opens its note. In Graph view (Ctrl+G) these notes are gold
and the decisions orange.

## How to keep this folder true

- When a phase in the roadmap is built, change its status there and in the board, in the same sitting.
- When a decision changes, don't edit the old record. Write a new one that says it **supersedes** the old one, and set
  the old one's `status:` to `superseded`.
- Every note has a `tags:` line and a **Part of** line, so it shows up joined in the graph, as the lesson notes do.
