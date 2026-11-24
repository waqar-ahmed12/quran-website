---
tags: [architecture, adr, privacy]
adr: 11
status: proposed
date: 2026-10-08
---
# ADR-0011: A learner's voice reaches the teacher only by a separate decision

**Part of** [[docs/architecture/decisions/README|Decision log]] · keeps the promise in
[[docs/your-voice/06-accessibility-and-privacy|the voice feature's privacy section]] · blocks phase H of the
[[docs/architecture/10-roadmap|roadmap]]

## Status
**Proposed, and needs your decision.** Until you decide, nothing changes: recordings stay on the device.

## Context
- "Say it and listen back" keeps a student's recordings in their browser only. The page tells them so: "Your recordings
  stay in this browser, on this device. Nothing is sent anywhere."
- Its notes say plainly that a pipe carrying children's voices off their devices "needs the user's explicit decision, a
  privacy notice", and is "not a button" ([[docs/your-voice/09-open-questions|its open questions]]).
- The landing page's line is "a teacher who listens". Homework recordings between one-to-one lessons would make that
  literal, so the request is likely to come.

## Decision
Keep the promise. Phases A to G send no recording anywhere.

If you decide later that recordings may reach the teacher, it is built only on all of these conditions:

1. Only for learners shared with the teacher (an open enrolment).
2. Only by an adult's tap on one clip at a time ("Send to my teacher"), never automatically.
3. The first time, a short, clear notice says who will hear it, where it's kept and for how long, and it needs a yes.
4. Kept in private storage, encrypted at rest, played only through links that expire in minutes.
5. Deleted automatically after 30 days, or at once by the adult or the teacher.
6. The teacher can reply with text, and nothing else is done with the audio (no transcription, no AI analysis).
7. The privacy page and the on-page line change to say exactly this, and the line stays true for clips never sent.

## Alternatives considered

### Upload recordings automatically for enrolled learners
- Rejected outright: it breaks the promise the page makes.

### "Save this recording to my device" as a file the family can send however they like
- Suggested in [[docs/your-voice/09-open-questions|the voice notes]]. It sends nothing and can be built any time,
  independent of this decision.

## Consequences
- Phase H stays blocked, and the rest of the roadmap doesn't depend on it.
- If accepted, it adds an object store (Cloudflare R2) and a `recording` table with an expiry, and the threat model
  gains a section.
