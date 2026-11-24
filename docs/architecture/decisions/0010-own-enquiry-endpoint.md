---
tags: [architecture, adr]
adr: 10
status: proposed
date: 2026-10-08
---
# ADR-0010: Enquiries go to our own API, not a form service

**Part of** [[docs/architecture/decisions/README|Decision log]] · built in phase C of the
[[docs/architecture/10-roadmap|roadmap]]

## Status
Proposed, waiting for your yes.

## Context
- The landing page's form posts to the form's `action`, which isn't set yet. [[WEBSITE-BUILD]] §7 suggested Formspree,
  Web3Forms or the host's own forms.
- A contact page of its own was chosen, with more than name, email and message: who the lessons are for, their level,
  their time zone.
- Enquiries hold parents' emails and sometimes children's names.

## Decision
The contact page sends to `POST /api/v1/enquiries`. The server checks it, drops bots (a honeypot field and a rate
limit), saves it, and emails the teacher a plain-text alert. The teacher's dashboard shows the inbox, and closed
enquiries are deleted after 12 months.

## Alternatives considered

### Formspree, Web3Forms or Netlify Forms
- For: working in minutes, with spam filtering included.
- Against: families' details kept by another company, a monthly limit, and no link to the rest of the system.
- **Allowed as a stop-gap**: if the site launches before phase C is done, pointing the form at one of these is fine, as
  long as the privacy page names it. Switching later is a change of one URL.

### Just a mailto: link
- Against: no form fields, and a worse experience on phones without a mail app set up.
- Rejected.

## Consequences
- It is the first backend feature, and the smallest that touches every layer (page, API, database, email). It proves
  the stack before accounts are built on it.
- Spam is the house's problem now, so the honeypot and rate limit have tests.
