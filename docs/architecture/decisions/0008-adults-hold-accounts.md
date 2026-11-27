---
tags: [architecture, adr]
adr: 8
status: proposed
date: 2026-10-08
---
# ADR-0008: Adults hold accounts; children are learner profiles

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/04-data-model|Data model]]
and [[docs/architecture/07-security-and-privacy|Security and privacy]]

## Status
Proposed, waiting for your yes.

## Context
- The teacher teaches every age ([[WEBSITE-BUILD]] §7, phase 2), so many learners are children.
- Laws in the countries students live in set extra rules for children's data (the UK Children's Code, GDPR, COPPA in
  the US). Collecting nothing from a child is the simplest way to stay well inside them.
- Families often have more than one child learning.
- The voice feature's notes already treat a child's data with care ([[docs/your-voice/06-accessibility-and-privacy|its privacy section]]).

## Decision
Only adults sign in. An account holds one or more **learner profiles**: a display name (a nickname is fine), the script
and the names of the marks. An adult learning alone has one profile, for themselves. Progress, and sharing with the
teacher, belong to a learner, and the adult controls both. There is no field for age, birthday, photo, school or
location.

## Alternatives considered

### Accounts for children, behind an age question
- Against: needs age checks and parental consent flows, and a child would type an email address.
- Rejected.

### One learner per account
- For: simpler screens.
- Against: a family with three children would need three email addresses.
- Rejected.

## Consequences
- The teacher sees a learner's display name and the account holder's email, which is who they'd reply to anyway.
- Deleting an account removes every learner under it at once.
- The account page has to make adding a second learner obvious, since that's the family case.
