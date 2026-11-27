---
tags: [architecture, glossary]
---
# 11. Glossary

**Part of** [[docs/architecture/README|Architecture]] · what the Qaida teaches is in [[QAIDA-CONTENT]]

## The Qaida's words

| Word | Meaning here |
|---|---|
| **Qaida** | A primer that teaches reading the Qur'an from the letters up. The free Qaida is `site/qaida/` |
| **Mushaf** | A printed copy of the Qur'an |
| **Madani / Indo-Pak** | The two ways of printing the Qur'an the Qaida teaches. The student picks one, and every lesson draws in it |
| **Zabar, zair, paish** (fatha, kasra, damma) | The short vowel marks a, i, u. The student chooses which set of names the pages use |
| **Tanween** | A doubled vowel mark: an, in, un |
| **Jazam** (sukoon) | The mark that says a letter has no vowel |
| **Shadda** (tashdeed) | The mark that says a letter is doubled |
| **Madd** | A wavy line: hold the long vowel longer |
| **Ayah, aayat** | A verse, verses |
| **Surah** | A chapter of the Qur'an |
| **Item** | One thing a drill asks about (a letter, a letter with a mark, a word). Its **id** is how progress is kept |
| **Kit** | A rule lesson's own file of forms, names and words (`al.js`, `madd.js`, …), read by the one rule page |
| **Known** | Answered right twice in a row (`practice.js`'s target) |
| **Struggling** | Missed three times or more and not yet known |

## The software words

| Word | Meaning here |
|---|---|
| **Frontend** | What runs in the visitor's browser: the HTML, CSS and JavaScript in `site/` |
| **Backend** | What runs on a server: the API and the database. Planned, in `server/` |
| **API** | The set of addresses (`/api/v1/…`) the pages call to save or fetch data. [[docs/architecture/05-api|API]] |
| **Endpoint** | One of those addresses with one method, such as `POST /api/v1/enquiries` |
| **Database** | Where the server keeps data. Here, one SQLite file. [[docs/architecture/04-data-model|Data model]] |
| **SQLite** | A complete database that lives in one file, built into Node 24 |
| **Migration** | A numbered file of SQL that changes the database's shape, applied once, in order |
| **Projection** | A table of totals worked out from the events. It can always be rebuilt |
| **Event log** | A record of things that happened, only ever added to, never changed |
| **Outbox** | Events waiting on the device until they can be sent |
| **Idempotent** | Doing it twice has the same effect as doing it once. Sending the same event twice is idempotent here |
| **Local-first** | The device keeps working, and keeps its own copy; the server adds to it rather than being needed for it |
| **Modular monolith** | One program to deploy, split inside into modules with clear edges |
| **Session cookie** | A random value the browser sends back with each request to say who is signed in |
| **Magic link** | An emailed sign-in link that works once, instead of a password |
| **CSRF** | A trick where another site makes your browser send a request to this one |
| **XSS** | A trick where someone gets their script to run inside this site's pages |
| **CSP** | Content Security Policy: a header that tells the browser which scripts it may run |
| **CDN** | A network of servers around the world that hand out the site's files from somewhere close |
| **Proxy / rewrite** | Netlify passing `/api/*` on to the API server, so the browser sees one site |
| **CI/CD** | Continuous integration and delivery: GitHub runs every check on every change, and deploys when they pass |
| **ADR** | Architecture Decision Record: a short note of one decision, its reasons, and what else was considered. [[docs/architecture/decisions/README|The log]] |
| **WAL** | SQLite's write-ahead log: readers don't wait for the writer, and Litestream copies it to make backups |
| **Litestream** | A small program that streams a SQLite database's changes to cloud storage, for backups |
| **Service worker** | A script a browser keeps for a site, which can serve its pages with no connection |
