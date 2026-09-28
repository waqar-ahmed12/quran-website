// The free Qaida, Lessons 4 to 6: spelling real words. Added 2026-09-27 (QAIDA-BUILD.md, "First preview, 2026-09-27" —
// the user, after previewing the mark lessons: "there should be actual words... kaf zabar ka, ta zabar ta, kata (read
// from the back), ba zabar ba, kataba (altogether)"). This is the traditional Qaida spelling method: name a letter
// with its mark, then put it together with what came before, one letter at a time, to the whole word.
//
// Widened the same day, still before the user's own preview (2026-09-27, "we should know where we are in the entire
// words... 2-3 words for the walkthrough and more words, but no speech for now, and the options should be collapsed
// by default" — the last two are qaida-options.js's, not this file's): several words now, not one, so this file
// tracks WHICH word is on screen — kept apart from the Part 1 / Part 2 rail above, which is about meeting the mark,
// not this. No audio anywhere in this block: "Hear it" is gone until there is real speech to attach to a word.
//
// A THIRD round, the same day, after a first look at this ("don't you think there should be a separate page for the
// more words... make a table of 12 words, keep the meanings out", with a photo of a printed Qaida's own "mashq"
// page): the extra list moved out to its own exercise-4/5/6.html, twelve words each, no meanings, no walkthrough —
// see exercise.js. This file keeps only the walkthrough and a link to that page.
//
// Real, correctly-diacritized Arabic — never invented, the same rule the aayat overlay lives under
// (WEBSITE-BUILD.md §4) — built only from marks the student has met by that lesson. Shown, never scored: the same
// rule "Write it" and "Say it" already live under (the user's answer, when asked, was "i don't know" — this follows
// that existing precedent rather than guessing at a new one). Nothing here is the teacher's own word list yet; it is
// Claude's candidates, to be checked before they ship (the user asked to propose and confirm, not to supply blind).
// No DOM elsewhere depends on this file, and mark-lesson.js does not change.
//
// A word is built from KEYS (the same fold marks.js's ids use — the Madani glyph), never a hardcoded glyph, so it
// still reads correctly if the page is switched to Indo-Pak: two of the words below use ه, which IS one of the
// letters that differs (ہ) — resolving through shell.lettersOf() is not a formality here, it is load-bearing.

(() => {
  const shell = window.qaidaShell;
  const marks = window.qaidaMarks;
  if (!shell || !marks) return;

  const root = document.documentElement;
  const section = document.querySelector('.spell');
  if (!section) return;

  // {root} is [key, markId] pairs in reading order (right to left, matching how they are typed here); {syll} is each
  // one's romanised sound, in the same order, for the blend line only — this never turns transliteration on
  // elsewhere, and it is not the page's "tap to peek" switch (docs/lesson-4/09-open-questions.md §1 keeps that off).
  // Every word is a real Form I verb, in the pattern that matches the mark: fatha throughout (fa'ala), fatha-kasra-
  // fatha (fa'ila) or fatha-damma-fatha (fa'ula) — a candidate list, not the teacher's own; check before it ships.
  const WORDS = {
    fatha: [
      { root: [['ك', 'fatha'], ['ت', 'fatha'], ['ب', 'fatha']], syll: ['ka', 'ta', 'ba'], meaning: 'he wrote' },
      { root: [['ذ', 'fatha'], ['ه', 'fatha'], ['ب', 'fatha']], syll: ['dha', 'ha', 'ba'], meaning: 'he went' },
      { root: [['خ', 'fatha'], ['ر', 'fatha'], ['ج', 'fatha']], syll: ['kha', 'ra', 'ja'], meaning: 'he went out' },
    ],
    kasra: [
      { root: [['ش', 'fatha'], ['ر', 'kasra'], ['ب', 'fatha']], syll: ['sha', 'ri', 'ba'], meaning: 'he drank' },
      { root: [['ع', 'fatha'], ['ل', 'kasra'], ['م', 'fatha']], syll: ['a', 'li', 'ma'], meaning: 'he knew' },
      { root: [['س', 'fatha'], ['م', 'kasra'], ['ع', 'fatha']], syll: ['sa', 'mi', 'a'], meaning: 'he heard' },
    ],
    damma: [
      { root: [['ك', 'fatha'], ['ر', 'damma'], ['م', 'fatha']], syll: ['ka', 'ru', 'ma'], meaning: 'he was generous' },
      { root: [['ك', 'fatha'], ['ب', 'damma'], ['ر', 'fatha']], syll: ['ka', 'bu', 'ra'], meaning: 'he was great' },
      { root: [['ق', 'fatha'], ['ر', 'damma'], ['ب', 'fatha']], syll: ['qa', 'ru', 'ba'], meaning: 'he was near' },
    ],
  };

  const mark = marks.markOf(root.dataset.mark);
  const walkthrough = mark && WORDS[mark.id];
  if (!mark || !walkthrough) return;

  const $ = (selector) => section.querySelector(selector);
  const wordsLabel = $('.spell-words-label');
  const wordsNav = $('.spell-words-nav');
  const glyphBox = $('.spell-glyph');
  const caption = $('.spell-caption');
  const meaningLine = $('.spell-meaning');
  const backButton = $('.spell-back');
  const nextButton = $('.spell-next');
  const restartButton = $('.spell-restart');
  const nextWordButton = $('.spell-nextword');

  const fill = marks.fill;

  // The active script's own glyph and name for a letter, by its key — the same map allItems() and reviewItems()
  // build in marks.js, so a word reads correctly whichever script is chosen.
  function lettersMap() {
    return new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
  }

  function glyphFor(names, entry, upto) {
    return entry.root.slice(0, upto).map(([key, id]) => {
      const found = names.get(key);
      return marks.glyphOf(found ? found.glyph : key, marks.markOf(id));
    }).join('');
  }

  // One step per letter met, then one per blend: name it, then put it together with what came before. The last
  // blend is the whole word. For a three-letter word this is exactly the user's own five steps.
  function stepsFor(entry) {
    const steps = [];
    entry.root.forEach((_, i) => {
      steps.push({ kind: 'letter', upto: i + 1 });
      if (i > 0) steps.push({ kind: 'blend', upto: i + 1, final: i === entry.root.length - 1 });
    });
    return steps;
  }

  let wordIndex = 0;
  let at = 0;
  let steps = stepsFor(walkthrough[0]);

  function buildWordsNav() {
    wordsNav.textContent = '';
    walkthrough.forEach((entry, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'word-step';
      button.dataset.i = String(i);
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', fill(section.dataset.wordButton, { n: i + 1 }));
      button.addEventListener('click', () => {
        wordIndex = i;
        steps = stepsFor(walkthrough[wordIndex]);
        at = 0;
        paint();
      });
      wordsNav.append(button);
    });
  }

  function paintWordsNav() {
    wordsLabel.textContent = fill(section.dataset.wordLabel, { n: wordIndex + 1, total: walkthrough.length });
    for (const button of wordsNav.children) {
      const current = Number(button.dataset.i) === wordIndex;
      button.classList.toggle('current', current);
      if (current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  function paint() {
    const entry = walkthrough[wordIndex];
    const names = lettersMap();
    const step = steps[at];
    glyphBox.textContent = glyphFor(names, entry, step.upto);

    if (step.kind === 'letter') {
      const [key, id] = entry.root[step.upto - 1];
      const found = names.get(key);
      const m = marks.markOf(id);
      caption.textContent = fill(section.dataset.letterLine, {
        name: found ? found.name : key, mark: marks.nameOf(m, shell), sound: entry.syll[step.upto - 1],
      });
    } else {
      const sound = entry.syll.slice(0, step.upto).join('');
      caption.textContent = fill(step.final ? section.dataset.wholeLine : section.dataset.blendLine, { sound });
    }

    // The meaning line keeps its place on every step and is only invisible until the last one, so the buttons under
    // it never move (the user, 2026-09-27: "when the meaning is revealed, and we move next, the buttons move up").
    // It holds this word's own meaning throughout, so a meaning that wraps to two lines is measured from the start.
    // visibility, not [hidden]: [hidden] takes it out of the layout, which is what made the buttons jump.
    meaningLine.hidden = false;
    meaningLine.textContent = fill(section.dataset.meaningLine, { meaning: entry.meaning });
    meaningLine.style.visibility = step.final ? '' : 'hidden';

    backButton.disabled = at === 0;
    nextButton.hidden = step.final;
    restartButton.hidden = !step.final;
    nextWordButton.hidden = !(step.final && wordIndex < walkthrough.length - 1);

    paintWordsNav();
  }

  nextButton.addEventListener('click', () => {
    if (at < steps.length - 1) {
      at += 1;
      paint();
    }
  });

  backButton.addEventListener('click', () => {
    if (at > 0) {
      at -= 1;
      paint();
    }
  });

  restartButton.addEventListener('click', () => {
    at = 0;
    paint();
  });

  nextWordButton.addEventListener('click', () => {
    if (wordIndex < walkthrough.length - 1) {
      wordIndex += 1;
      steps = stepsFor(walkthrough[wordIndex]);
      at = 0;
      paint();
    }
  });

  buildWordsNav();
  paint();
  // A change of script or names redraws it: the glyph depends on shell.state (one of the three words above uses a
  // letter that differs between scripts), and the letter names and mark words do too.
  shell.onChange(paint);
})();
