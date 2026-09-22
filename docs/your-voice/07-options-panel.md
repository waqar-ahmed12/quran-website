# 7. The options panel

`site/qaida/qaida-options.js` is **temporary** — deleted at step 13 with the TRYOUT block of `qaida.css` and
`recordings.html`. Until then it is how the user decides a look without being asked about it in words, and how every
line of wording gets edited and exported to `setting.txt`.

Every row registers under `"Your voice :: <label>"` and goes into the Export block automatically, because `section()`
and the control helpers already do that (`qaida-options.js:40-60`).

## 1. Where the section goes

`section('Your voice')`, on **every lesson page**, immediately after **Sound and tracing** on Lesson 1 and after
**The drill** on lessons 2–5. Not on the home — there is nothing to say there — except for one row, §4.

## 2. The rows

| Row | Control | Default | What it does |
|---|---|---|---|
| **Say it button** | buttons: *In the top bar and on the letter* / *Only on the letter* / *Only in the top bar* | In the top bar and on the letter | `data-say` on `<html>`; CSS hides one or the other. The user decides how much of the top bar this is worth |
| **Longest recording** | slider 2–15s, step 1 | **6 s** | the cap in `02-capture-and-storage.md` §3 |
| **The moving ring while recording** | buttons: *On* / *Off* | On | the level ring, `03-the-panel.md` §4 |
| **The shape of the sound** | buttons: *Both voices* / *Only yours* / *Off* | Both voices | the waveforms. *Only yours* is there in case the teacher's lane reads as a standard to be met |
| **Gap between the two** | slider 0–1.5s, step 0.1 | **0.4 s** | "One after the other" |
| **Play the teacher first when the panel opens** | buttons: *Yes* / *No* | **No** | nothing autoplays today, anywhere in the Qaida. This row is here because for this one panel there is a real argument the other way, and it is the user's call, not Claude's |
| **A mark on Say it when you have recorded it** | buttons: *On* / *Off* | On | the dot, `04-where-it-appears.md` §5 |
| **Keep recordings** | buttons: *Until deleted* / *Until the page is closed* | Until deleted | *Until the page closed* skips the database entirely — for a shared or school computer |

**Every one of these is a row and not a question**, per the standing rule: the user looks at the page with the option
set one way, taps, and looks again. None of them is asked in words.

## 3. The two rows that are not looks

| Row | Control | What it does |
|---|---|---|
| **Recordings kept** | a line, not a control | *"{n} recordings, about {size}."* From `voice-store.ids()`. The user needs to see that it is small |
| **Delete every recording of my voice** | a button, two taps | `voice-store.clear()`. Also lives in the real Settings dialog, not only in the temporary panel — see §4 |

## 4. What survives step 13

The panel goes; two things in it must not.

1. **Delete every recording of my voice** moves into the real Settings dialog (the one behind the top bar's Settings
   button), not the tryout panel. Build it there from the start, and let the options panel's copy be a second button
   pointing at the same function. Deleting a child's voice cannot live in a file that is scheduled for deletion.
2. **Whatever the user picks for each row above** becomes a `data-` attribute on `<html>` in every lesson page, or a
   constant in `voice.js`, exactly as the earlier steps' picks did.

## 5. Words

The panel's **Words (lesson N)** section picks up every `data-words` and `data-words-attr` in the new markup
automatically — it walks the document — so the fourteen strings in `05-wording.md` each get their field with no extra
work here. Check after building that all of them appear, including the ones on attributes of the dialog that only
show in one state; a string that never renders still has a field, because the panel reads attributes, not what is on
screen.
