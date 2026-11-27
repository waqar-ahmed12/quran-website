---
tags: [architecture, security, privacy]
---
# 7. Security and privacy

**Part of** [[docs/architecture/README|Architecture]] · builds on
[[docs/your-voice/06-accessibility-and-privacy|"a child's voice"]] · decisions
[[docs/architecture/decisions/0007-email-link-sign-in|ADR-0007]],
[[docs/architecture/decisions/0008-adults-hold-accounts|ADR-0008]],
[[docs/architecture/decisions/0011-voice-to-teacher-gated|ADR-0011]]

**In one paragraph.** The site teaches children, so it holds as little as it can. Adults hold accounts; a child is a
display name under them. A child's voice never leaves the device. Every account's data can be downloaded or deleted
by its owner in one step. On the technical side: no passwords to steal, cookies scripts can't read, no SQL built from
strings, no third-party scripts, and no runtime dependencies to poison.

> This page is an engineering design, not legal advice. Before launch, the privacy page and the age rules for the
> countries your students live in should be read by you, and ideally by someone who knows them (UK GDPR and the
> Children's Code, EU GDPR, and COPPA in the US).

## What is held, and why

| Data | Why | Where | How long | Who sees it |
|---|---|---|---|---|
| Progress on the device | So lessons remember you | The browser's localStorage | Until the browser's data is cleared | Anyone using that browser |
| Your own recordings | Say it and listen back | The browser's IndexedDB | Until deleted (200 clips at most) | Anyone using that browser |
| Account email | To sign in | Database | While the account exists | You; the teacher only if you write to them |
| Learner display name, script, names | To tell profiles apart | Database | While the account exists | You; your teacher, if you shared that learner |
| Progress events and totals | Sync and the teacher's view | Database | While the account exists | You; your teacher, if shared |
| Enquiry | To reply about lessons | Database, and the teacher's inbox | 12 months after it is closed | The teacher |
| Server logs | To find faults | The host's log stream | 30 days | The operator |

Server logs hold the request id, path, status and time. They never hold a request body, an email address or a cookie,
and IP addresses are kept only by the in-memory rate limiter, never written to the logs.

## Children

- **Only adults sign in** ([[docs/architecture/decisions/0008-adults-hold-accounts|ADR-0008]]). A child never types an
  email or anything else about themselves. The adult creates a learner profile, and a nickname is fine.
- **No age, no birthday, no photo, no school, no location.** The design has no field for any of them, so they can't leak.
- **Sharing with the teacher is the adult's act.** It needs an invite code from the teacher, it is per learner, and the
  adult can stop it in one tap.
- **No analytics, no trackers, no ads, no third-party scripts, and no outside requests at all.** Since 2026-10-08 even
  the fonts come from the site itself (`site/fonts/`), so a visitor's address isn't sent to Google. If you want to know
  visitor numbers, a cookie-free, self-contained counter is the most that fits (roadmap, "later ideas").

## A child's voice

[[docs/your-voice/06-accessibility-and-privacy|The voice feature's privacy section]] promised: "Your recordings stay in
this browser, on this device. Nothing is sent anywhere", and it said a pipe for children's voices "needs the user's
explicit decision, a privacy notice". **This architecture keeps that promise.** Nothing in phases A to G sends a
recording. Sending one to the teacher is a separate decision with its own conditions:
[[docs/architecture/decisions/0011-voice-to-teacher-gated|ADR-0011]].

## Threats and what stops them

| Threat | What stops it |
|---|---|
| Someone signs in as you with a stolen link | Links are 32 random bytes, last 15 minutes and work once. Only their SHA-256 is stored. The link opens a page that **POSTs** the token, so mail scanners that open links can't use it up or sign in with it |
| A script on the page steals the session | The cookie is `HttpOnly`, so scripts can't read it. The Content Security Policy in `site/_headers` allows only the site's own scripts, plus a hash for each page's inline theme script |
| Another site makes your browser act for you (CSRF) | `SameSite=Lax` cookie, an `Origin` check on every changing request, and JSON-only bodies, which a plain HTML form can't send |
| A teacher, or another family, reads a learner who isn't theirs | Every query is scoped to the account, or joined through an open `enrolment`. Someone else's id answers 404. Every route has a "wrong person" test |
| Finding out who has an account | `POST /auth/link` always answers 202 and takes the same time either way |
| Spam through the contact form | A honeypot field, 5 an hour per IP, length limits, and the teacher's email alert carries plain text only |
| SQL injection | Prepared statements only. A check fails if a template string is passed to `prepare(` |
| Flooding the server | 64 KB bodies, 200 events per batch, rate limits, and the host's connection limits |
| Losing the database | Litestream streams every change to a bucket; a restore is rehearsed before launch ([[docs/architecture/08-deployment-and-operations|operations]]) |
| A secret leaks | Secrets live only in the host's secret store and GitHub Actions secrets, never in git; `.env` is ignored. Rotating one is in the runbook |
| A poisoned npm package | There are none: the server has no dependencies ([[docs/architecture/decisions/0004-node-zero-dependency-api|ADR-0004]]) |
| The development PC is compromised | It is known to be infected ([[WEBSITE-BUILD]] §0). **No production secret goes on it until it is cleaned.** Tests run and deploys happen on GitHub's machines, from the repository, so the PC never holds a deploy key |

## Headers

**Already in place for the pages (2026-10-08).** `site/_headers` sets them; Netlify reads that file when it publishes
`site/`, and `serve.js` reads it too, so the local preview blocks exactly what the live site would.

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`, with `script-src 'self'` plus a SHA-256 hash for each page's inline theme script, and `style-src`, `font-src`, `connect-src` and `form-action` all `'self'`; `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `microphone=(self)` (for Say it), and camera, geolocation, payment and USB off |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Robots-Tag` | `noindex` while the site is unfinished; deleted at launch |

After editing any inline `<script>`, run `node tools/csp-hashes.js` to rewrite the hashes, or the browser will refuse
the script.

**What the backend changes here: almost nothing.** Because `/api/*` is on the same origin, `connect-src 'self'` and
`form-action 'self'` already allow it. Still to add: `Strict-Transport-Security` once the domain is on HTTPS (phase G),
and the same headers on the API's own replies (phase B).

## Your rights, built in

| Right | How |
|---|---|
| See your data | Account page → "Download my data": `GET /me/export`, one JSON file of every row about you |
| Delete it | Account page → "Delete my account": `DELETE /me`. Every table, at once, by cascade (the schema test proves it). Backups age out within 30 days |
| Stop sharing with the teacher | One tap per learner, from either side |
| Fix it | Rename a learner; change the account's email from the account page, confirmed by a link sent to the new address (phase D) |

Each export, deletion and enrolment writes an `audit_event` with no personal details, so "who saw my child's progress,
and since when" always has an answer.

## Before launch

- A privacy page in plain words, linked from the form, the account pages and the footer.
- The contact form says what happens to a message and for how long.
- The "Your recordings stay in this browser" line is still true word for word (unless ADR-0011 changed it, and then the
  page says exactly what changed).
- A security review pass (the `agent-skills:security-and-hardening` skill) over the finished server.
