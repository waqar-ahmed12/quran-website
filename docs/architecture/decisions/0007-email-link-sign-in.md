---
tags: [architecture, adr]
adr: 7
status: proposed
date: 2026-10-08
---
# ADR-0007: Sign in with an emailed link, not a password

**Part of** [[docs/architecture/decisions/README|Decision log]] · applies to [[docs/architecture/05-api|API]] and
[[docs/architecture/07-security-and-privacy|Security and privacy]]

## Status
Proposed, waiting for your yes.

## Context
- The people who sign in are adults: parents, adult learners and the teacher. Most will sign in rarely, on a device
  they then stay signed in on.
- Passwords bring a reset flow, a policy, storage of secrets that can leak, and reused passwords from other sites.
- The server needs to send email anyway, for enquiry alerts.

## Decision
Passwordless sign-in. `POST /auth/link` emails a link holding 32 random bytes, valid for 15 minutes and once only; only
its SHA-256 is stored. The link opens a page that **POSTs** the token to `/auth/verify`, so an email scanner that opens
the link can't use it up or sign in with it. The session is a `__Host-session` cookie (`HttpOnly`, `Secure`,
`SameSite=Lax`), 30 days, renewed while used, stored as a hash. The first account to sign in with `TEACHER_EMAIL`
becomes the teacher.

## Alternatives considered

### Email and password, hashed with scrypt
- For: works without email at sign-in time.
- Against: the reset flow is a second sign-in system anyway (by email), and stored hashes are a target.
- Rejected.

### Sign in with Google or Apple
- For: one tap, no email round trip.
- Against: a third party learns which families use the site, consent screens, and more set-up per provider.
- Not for launch. Could be added beside links later.

### Passkeys
- For: the strongest option, and no phishing.
- Against: needs an account to attach to first, and support across older family devices varies.
- A good second step once accounts exist (roadmap, later ideas).

## Consequences
- Signing in depends on email arriving. SPF, DKIM and DMARC for the sending domain are part of phase G, and the page
  says to check the spam folder.
- No password data to protect, and no "forgot password" page.
- Locally and in tests, the mailer prints the link, so the whole flow can be tried without an email provider.
