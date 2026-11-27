---
tags: [recordings, audio, licences, research]
---
# Recordings: free and openly licensed sources

*Research, 2026-10-10 (the user: "please find royalty free recordings for my qaida"). **Nothing was downloaded** and nothing in
`site/` changed. Every licence below was read from the source's own page on the day. Where it could not be read, this
note says so.*

**Part of:** [[MAP]] · [[QAIDA-BUILD]] (step 10, the recordings) · [[docs/your-voice/README|Say it and listen back]] ·
[[docs/pass-2/03-open-questions|Pass 2 open questions]] §5 (whose voice reads the verses)

## What the Qaida needs

| Kind | Where | How many |
|---|---|---|
| Letter **names** ("Baa") | Lessons 1–3, `audio/letters/` | 29 |
| Letter **sounds with a mark** ("ba", "bin", "baa", "ab"…) | Lessons 4–15, one folder per mark in `manifest.json` | most of the 447 rows on `recordings.html` |
| The Qur'an's own **words**, by reference (`1:2:1`) | Lessons 16–22 | about 130 |
| Whole **verses** | Lesson 23 (Al-Fatiha), Lesson 29 | 7, then about 60 |

The rule stays as it was: **a person's voice, never an AI voice** (`QAIDA-BUILD.md`, Decisions: Recordings). None of the
sources below is synthetic.

## 1. Best lead: Qamar Apps' Qaidas, CC BY-SA 4.0 (letters, marks, words)

Qamar Apps publishes four Qaida apps whose store listings each say **"licensed under a Creative Commons
Attribution-ShareAlike 4.0 International License"**, all four voiced by **one teacher: Mufti Mohammed Ghiyas Mohiuddin of
Madrasa Arabia Hifzul Quraan, India**:

| App | Fits | Lessons | Listing |
|---|---|---|---|
| Noorani Qaida, Indian Edition | Indo-Pak | 27 | [App Store](https://apps.apple.com/us/app/id1063165689) |
| Noorani Qaida, Pakistani Edition | Indo-Pak | 16 | [listing](https://iphoneaddict.fr/apps/education/noorani-qaida-pakistani-edition.html) |
| Al Qaida Al Nooraniya | Madani | 17 | [listing](https://iphoneaddict.fr/apps/education/al-qaida-al-nooraniya.html) |
| Ahsanul Qawaid | Indo-Pak | 30 | [App Store](https://apps.apple.com/us/app/ahsanul-qawaid/id1069764083) |

**Why it fits:** a real teacher, recorded for learners, and a Qaida covers what Lessons 1–15 teach (letters, marks,
tanween, madd, jazam, shadda). CC BY-SA lets the site use it, trimmed or not, even commercially.

**What CC BY-SA asks:** credit (the teacher, Qamar Apps, a link to the licence, and "trimmed" if it was), and **the
clips themselves stay CC BY-SA**. Only the clips: the site's own code and pages are not affected by it.

**Not yet known, and the reason to write to them first:**
- The audio is inside the apps. Getting it out of an app package from a mirror site is a download from an untrusted
  source, so **ask for the files**: support@qamarapps.com. A licence notice inside the app, or a line in their reply,
  also settles whether the store listing's licence covers the audio (it says the app, and the app is mostly the audio).
- **Whether it says "ba" or "baa zabar ba".** An Indo-Pak Noorani Qaida is often read by spelling it out
  (*hijje*). The Qaida needs the sound on its own, kept apart from the name (`recordings.html` warns about exactly this).
- **Coverage.** Their rows will not line up one-to-one with the 447. Expect most of the single letters and marks, and
  gaps where this Qaida's order differs.
- `qamarapps.com` did not load on 2026-10-10.

## 2. Quran.com's word-by-word audio: streamed, not copied (the words in Lessons 16–22)

Each Qur'an word has its own clip on Quran.com's CDN, a public file that the API returns as the word's `audioUrl`. It
appears to be named by the same reference the lessons already use (`1:2:1` → `wbw/001_002_001.mp3`; not yet tested). The [Quran Foundation developer terms](https://api-docs.quran.foundation/legal/developer-terms/)
allow free and commercial apps, but:
- **no copy kept longer than a week** outside their Content Sync API, and no "prepackaged… build-time bundle". So the
  site can **stream** the clips, but it **cannot save them into `site/qaida/audio/`**;
- streaming means one change to `site/_headers`: `media-src` must allow `https://audio.qurancdn.com`. That breaks
  "nothing loads from another site" (`CLAUDE.md`), so it is **the user's call**;
- the reciter of the word clips is not named on any page found, and a word said on its own can lose what Lesson 20 is
  about (a madd that reaches into the next word).

## 3. Whole verses (Lessons 23 and 29): no clear open licence found

- **EveryAyah.com** (including Al-Husary's *muallim* recitation): no licence on the site; mirrors record its status as
  unknown ([Maqra's note](https://huggingface.co/datasets/maqra-project/az-balayev)). Free to listen to, but not cleared to copy.
- **QuranLab** looked at every big source and hosts **no audio** for that reason: a recitation is its own copyrighted
  recording, separate from the text ([dataset](https://huggingface.co/datasets/quranlab/quran-audio)).
- **The King Fahd Complex** (qurancomplex.gov.sa) is reported to allow its recitations for free use in apps and websites.
  **This is not confirmed:** the site refused the connection on 2026-10-10. It is the lead to check, since the site
  already names that Complex for its fonts.
- **AQQD** (24,183 clips, 309 reciters) calls itself CC0, but the clips come from other sites, and its own page gives two
  licences. Not safe to rely on.

**So the verses still come down to `docs/pass-2/03` §5:** the teacher recites them, or the King Fahd Complex's
permission is confirmed, or a reciter is asked directly.

## Looked at and ruled out

| Source | Why not |
|---|---|
| Wikimedia Commons, Wiktionary | Pronunciations of whole Arabic words (CC BY-SA), but no set of letter names was found, and Commons did not load to check further |
| Lingua Libre (CC BY-SA 4.0) | Common words, no alphabet list found |
| Mozilla Common Voice Arabic (CC0) | Everyday sentences, not letters or Qur'an |
| "Arabic Letter Utterance" (Mendeley) | 10 letters, made for speech-recognition research, licence not shown |
| Forvo, other Qaida apps, YouTube | All rights reserved, or no licence stated |

## Recommended next step

1. **Email Qamar Apps** (support@qamarapps.com): ask for the original audio files of Al Qaida Al Nooraniya and one
   Indo-Pak edition, and confirm the CC BY-SA 4.0 licence covers them. If yes, listen to a few clips before deciding.
2. **Decide on streaming Quran.com's word clips** for Lessons 16–22 (one line in `_headers`), or leave those words for
   the teacher.
3. **Confirm the King Fahd Complex's terms** by opening the site yourself, for the verses.

Nothing is downloaded or added to `site/` without the user's yes.
