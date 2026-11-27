---
tags: [architecture, api]
status: planned
---
# 5. API

**Part of** [[docs/architecture/README|Architecture]] · served by [[docs/architecture/03-backend|Backend]] · stores into
[[docs/architecture/04-data-model|Data model]]

**In one paragraph.** A small JSON API under `/api/v1`, on the same origin as the site. A browser proves who it is with
one cookie. Every error looks the same. Only an account's own learners can be read or written, and a teacher only sees
learners shared with them. This page is the contract: the server's tests check its replies against it.

## Conventions

| Topic | Rule |
|---|---|
| Base path | `/api/v1`. A breaking change means `/api/v2`, with v1 kept until the site no longer calls it |
| Format | JSON in and out, UTF-8. A body that changes data must be sent as `Content-Type: application/json`, or the answer is 415 |
| Body size | 64 KB at most (413) |
| Identity | The `__Host-session` cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Never a token in a URL or in localStorage |
| Changing requests | Must carry an `Origin` header equal to the site's origin (403), on top of `SameSite` |
| Ids | Random text with a prefix: `acc_`, `lrn_`, `enq_`. Events carry the browser's own UUID |
| Times | Unix milliseconds |
| Lists | Newest first, `?limit=` (default 50, at most 200) and `?before=<id>` for the next page |
| Someone else's thing | 404, never 403, so ids can't be probed |

## Endpoints

### Open to anyone

| Method and path | Does | Replies |
|---|---|---|
| `GET /health` | Checks the server and the database (`SELECT 1`) | 200 `{status:"ok", db:"ok", version}` or 503 |
| `POST /enquiries` | Saves a contact-form message and emails the teacher | 202. Also 202 when the hidden honeypot field was filled, but nothing is saved |
| `POST /auth/link` | Emails a sign-in link to `{email}` | 202 **always**, whether or not the address has an account |
| `POST /auth/verify` | Spends the link's `{token}`, creates the account on a first sign-in, sets the cookie | 200 `{account}` or 400 |

### Signed in

| Method and path | Does | Replies |
|---|---|---|
| `GET /me` | The account and its learners | 200 or 401 |
| `POST /auth/logout` | Ends this session | 204 |
| `GET /me/export` | Everything held about the account, as one JSON file | 200 (download) |
| `DELETE /me` | Deletes the account and everything under it, at once | 204 |
| `GET /learners` | This account's learners | 200 |
| `POST /learners` | Adds one: `{displayName, script, names}` | 201 |
| `PATCH /learners/{id}` | Renames it or changes its script or names | 200 |
| `DELETE /learners/{id}` | Deletes it and its progress | 204 |
| `GET /learners/{id}/progress` | The learner's totals: per lesson, and per item | 200 |
| `POST /learners/{id}/events` | Up to 200 progress events from the device's outbox | 200 `{accepted, duplicates, progress}` |
| `POST /learners/{id}/join` | Uses a teacher's invite `{code}` to share this learner with them | 200 or 400 |
| `DELETE /learners/{id}/teachers/{teacherId}` | Stops sharing this learner with a teacher | 204 |

### Teacher only

| Method and path | Does |
|---|---|
| `GET /teach/enquiries?status=new` | The enquiry inbox |
| `PATCH /teach/enquiries/{id}` | Marks one `replied` or `closed` |
| `POST /teach/invites` | Makes an invite code `{note}`, shown once, valid 7 days |
| `GET /teach/students` | Every learner shared with this teacher, with a one-line summary each |
| `GET /teach/students/{learnerId}` | One learner: lessons done, and the items they struggle with |
| `DELETE /teach/students/{learnerId}` | Ends the enrolment from the teacher's side |

"Struggling" means the same as in the practice engine (`practice.js`, `strugglingAt: 3`): three or more misses and not
yet known. The teacher and the student's own home page never disagree about it.

## Who may call what

| | Visitor | Account holder | Teacher |
|---|---|---|---|
| Health, enquiries, sign-in | yes | yes | yes |
| `/me`, export, delete | | own account | own account |
| `/learners/…` | | own learners only | own learners only |
| `/teach/…` | | | only learners with an open enrolment to them |

Every route has a test that calls it **as the wrong person** and expects 401 or 404
([[docs/architecture/09-testing|Testing]]).

## Examples

**Sending progress.** The browser makes the ids, so a retry after a dropped connection changes nothing.

```http
POST /api/v1/learners/lrn_7Qm2/events
Content-Type: application/json
Origin: https://alif-to-ayah.example

{
  "events": [
    { "id": "9b2c…e1", "lesson": 4, "kind": "answer", "item": "بَ", "correct": true,  "at": 1791441600000 },
    { "id": "4f80…a7", "lesson": 4, "kind": "answer", "item": "تَ", "correct": false, "at": 1791441604000 }
  ]
}
```

```json
{
  "accepted": ["9b2c…e1", "4f80…a7"],
  "duplicates": [],
  "progress": {
    "lessons": { "4": { "done": false } },
    "items": {
      "4": {
        "بَ": { "right": 7, "wrong": 1, "streak": 3 },
        "تَ": { "right": 2, "wrong": 4, "streak": 0 }
      }
    }
  }
}
```

**An enquiry.** `website` is the honeypot: a hidden field people never fill and bots do.

```json
{
  "name": "Amina",
  "email": "amina@example.com",
  "forWhom": "my-child",
  "level": "Knows a few letters",
  "timezone": "Europe/London",
  "message": "Could my daughter start in November?",
  "website": ""
}
```

## Errors

Every error is `application/problem+json` (RFC 9457):

```json
{
  "type": "https://alif-to-ayah.example/problems/validation",
  "title": "Some fields need another look",
  "status": 422,
  "detail": "2 fields are not valid.",
  "errors": [
    { "field": "email", "message": "This doesn't look like an email address." },
    { "field": "message", "message": "Please write a message." }
  ],
  "requestId": "7f3a9c"
}
```

| Status | When |
|---|---|
| 400 | The JSON can't be read, or a sign-in link is used, expired or unknown |
| 401 | Not signed in, or the session has ended |
| 403 | The `Origin` is wrong (a changing request from another site) |
| 404 | No such thing, **or it belongs to someone else** |
| 409 | A conflict, such as an invite code already used |
| 413 | Body over 64 KB, or more than 200 events |
| 415 | A changing request that isn't JSON |
| 422 | Fields fail validation (each one listed) |
| 429 | Too many requests; `Retry-After` says when to try again |
| 500 / 503 | The server's fault; the `requestId` finds it in the logs |

The wording of every message the site shows comes from the page, not the server, so each can still get its text
field in the options panel ([[WEBSITE-BUILD]] §7, "every piece of wording Claude writes gets its own text field").

## Rate limits

Kept in memory, per IP address (one process, so no shared store is needed):

| Route | Limit |
|---|---|
| `POST /auth/link` | 5 an hour per IP, and 3 an hour per email address |
| `POST /enquiries` | 5 an hour per IP |
| `POST /learners/{id}/events` | 120 a minute per session |
| Everything else | 300 a minute per IP |
