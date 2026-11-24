---
tags: [architecture, adr]
adr: 1
status: accepted
date: 2026-09-12
---
# ADR-0001: A static frontend, with no framework and no build step

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/02-frontend|Frontend]]

## Status
Accepted. Recorded on 2026-10-08 from the decision made on 2026-09-12 ([[PLAN]], "Decisions log": "Stack locked to plain
HTML/CSS/JS").

## Context
- The site was built phase by phase, each phase seen working in the browser at once. A build step would have stood
  between every edit and seeing it.
- The landing page's hero is hand-tuned canvas code (frame scrubbing, wheel glide, lock-in). A framework adds nothing
  to it.
- The development PC is infected ([[WEBSITE-BUILD]] §0), so installing build tools and packages was ruled out. Node,
  which is validly signed, is the one trusted runtime.
- Speed matters: visitors arrive on phones, and the Qaida should open fast anywhere.

## Decision
Plain HTML, CSS and JavaScript, served as files. Each script wraps itself in a function and shares only through a few
`window.*` names. New pages for the backend (account, contact, teacher dashboard, privacy) follow the same rules.

## Alternatives considered

### React or Next.js
- For: components, a big ecosystem, familiar to employers.
- Against: a build step and hundreds of packages for pages that are mostly static, and server rendering isn't needed.
- Rejected: the cost lands on every edit and every visitor, and the benefit doesn't.

### Astro
- For: the closest fit. Static by default, ships no JavaScript unless asked, and has shared layouts.
- Against: a build step and dependencies, on a PC where installing them isn't safe yet.
- Not now: the trigger to revisit is below.

### Web components
- For: built into the browser, no build step.
- Against: the shared pieces today are behaviours (the engine, the shell), not widgets, so they would add ceremony.
- Rejected for now. Could suit the teacher dashboard's tables if they grow.

## Consequences
- The 45 HTML pages repeat their `<head>` and the inline theme script. That is accepted, and the check scripts catch
  drift in the parts that matter.
- No type checker. If wanted, `// @ts-check` with JSDoc types gets most of TypeScript's checking with no build step.
- The 25 check scripts can load the real files in Node directly, because there is nothing to compile.
- **Revisit when** there are more than about 60 pages, or a shared layout change has to be made by hand in many files
  more than once a month. Then write a new ADR that supersedes this one (Astro is the likely answer).
