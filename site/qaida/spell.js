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
    // Lesson 7 (fixes/lesson 7/fixes.txt: "there is no walkthrough words for all tanween"; docs/lesson-10/07 §7):
    // nouns ending in two paish and two zair. None in two zabar — that ending is written with an alif after it,
    // which is Lesson 8. Word 2 carries a paish in the middle, word 3 ends in two zair.
    tanween: [
      { root: [['ق', 'fatha'], ['ل', 'fatha'], ['م', 'dammatain']], syll: ['qa', 'la', 'mun'], meaning: 'a pen' }, // qalamun
      { root: [['ر', 'fatha'], ['ج', 'damma'], ['ل', 'dammatain']], syll: ['ra', 'ju', 'lun'], meaning: 'a man' }, // rajulun
      { root: [['ب', 'fatha'], ['ل', 'fatha'], ['د', 'kasratain']], syll: ['ba', 'la', 'din'], meaning: 'a town' }, // baladin
    ],
    // docs/lesson-8/05 §3: three words that together show everything the board says — the alif joining on, the
    // alif standing apart, and the long vowel in the middle of a longer word that also carries a zair and two
    // paish (every mark lesson so far, in one word). A ligature (laam then alif) is never split across two steps:
    // an alif cannot begin a syllable, so it is always part of the letter-before-it's own step.
    'fatha-alif': [
      { root: [['ق', 'fatha-alif'], ['ل', 'fatha']], syll: ['qaa', 'la'], meaning: 'he said' }, // qaala, the alif joins on
      { root: [['ز', 'fatha-alif'], ['ر', 'fatha']], syll: ['zaa', 'ra'], meaning: 'he visited' }, // zaara, the alif stands apart
      { root: [['ك', 'kasra'], ['ت', 'fatha-alif'], ['ب', 'dammatain']], syll: ['ki', 'taa', 'bun'], meaning: 'a book' }, // kitaabun
    ],
    // docs/lesson-10/05 §2: the wow joined to the letter before it (word 1), standing apart after zaa (word 2), and
    // "au" at the start of a longer word with a zair and two paish after it (word 3). A wow with a jazam is never a
    // step of its own: it is part of its letter's tail, so qaw is one step, not qa then w.
    'fatha-waw': [
      { root: [['ق', 'fatha-waw'], ['م', 'dammatain']], syll: ['qaw', 'mun'], meaning: 'a people' }, // qawmun
      { root: [['ز', 'fatha-waw'], ['ج', 'dammatain']], syll: ['zaw', 'jun'], meaning: 'a pair' }, // zawjun
      { root: [['م', 'fatha-waw'], ['ع', 'kasra'], ['د', 'dammatain']], syll: ['maw', 'i', 'dun'], meaning: 'an appointed time' }, // maw'idun
    ],
    // docs/lesson-11/05 §2: the wow joined to the letter before it (word 1), standing apart after raa (word 2), and
    // the long "oo" in the middle of a longer word (word 3). A wow is never a step of its own: it is part of its
    // letter's tail, so qu-u is one step (quu), not qu then w. Candidates for the teacher's check.
    'damma-waw': [
      { root: [['ن', 'damma-waw'], ['ر', 'dammatain']], syll: ['nuu', 'run'], meaning: 'light' }, // nuurun
      { root: [['ر', 'damma-waw'], ['ح', 'dammatain']], syll: ['ruu', 'hun'], meaning: 'a spirit' }, // ruuhun
      { root: [['ي', 'fatha'], ['ق', 'damma-waw'], ['ل', 'damma']], syll: ['ya', 'quu', 'lu'], meaning: 'he says' }, // yaquulu
    ],
    // docs/lesson-12/05 §2: the yaa joined to the letter before it (word 1), standing apart after zaa (word 2), and
    // "ai" in the middle of a longer word that ends in a zair (word 3). A yaa with a jazam is never a step of its own:
    // it is part of its letter's tail, so bay is one step, not ba then y. No word ends in the yaa, so every yaa here
    // is in its middle shape. Candidates for the teacher's check.
    'fatha-yaa': [
      { root: [['ب', 'fatha-yaa'], ['ت', 'dammatain']], syll: ['bay', 'tun'], meaning: 'a house' }, // baytun
      { root: [['ز', 'fatha-yaa'], ['ت', 'dammatain']], syll: ['zay', 'tun'], meaning: 'oil' }, // zaytun
      { root: [['ع', 'fatha'], ['ل', 'fatha-yaa'], ['ه', 'kasra']], syll: ['a', 'lay', 'hi'], meaning: 'on him' }, // 'alayhi
    ],
    // docs/lesson-13/03 §2: the yaa joined to the letter before it (word 1), standing apart after daal (word 2), and
    // the long "ee" in the middle of a longer word (word 3). A yaa is never a step of its own: it is part of its
    // letter's tail, so fii is one step, not fi then y. No word ends in the yaa, so "fii", "in", is left out as a
    // word (docs/lesson-13/01 §4). Candidates for the teacher's check.
    'kasra-yaa': [
      { root: [['ف', 'kasra-yaa'], ['ل', 'dammatain']], syll: ['fii', 'lun'], meaning: 'an elephant' }, // fiilun
      { root: [['د', 'kasra-yaa'], ['ن', 'dammatain']], syll: ['dii', 'nun'], meaning: 'a religion, a way' }, // diinun
      { root: [['ك', 'fatha'], ['ب', 'kasra-yaa'], ['ر', 'dammatain']], syll: ['ka', 'bii', 'run'], meaning: 'big' }, // kabiirun
    ],
    // docs/lesson-14/05 §2: the jazam closing a word (word 1), in the middle with the word going on after it (word 2),
    // and the closed syllable as the first of three (word 3). A jazam letter is its OWN step ("Laam with jazam: no
    // vowel of its own"), the traditional spelling order, and its `syll` is just the consonant: the blend step after it
    // joins it to the syllable before ("qal"). None has a first-letter jazam, a jazam after a jazam, or a jazam on alif
    // (tools/qaida-words-check.js), and none has qalqalah or a noon that changes (docs/lesson-14/05 §1). Candidates for
    // the teacher's check.
    sukun: [
      { root: [['ق', 'damma'], ['ل', 'sukun']], syll: ['qu', 'l'], meaning: 'say!' }, // qul
      { root: [['ق', 'fatha'], ['ل', 'sukun'], ['ب', 'dammatain']], syll: ['qa', 'l', 'bun'], meaning: 'a heart' }, // qalbun
      { root: [['م', 'fatha'], ['س', 'sukun'], ['ج', 'kasra'], ['د', 'dammatain']], syll: ['ma', 's', 'ji', 'dun'], meaning: 'a mosque' }, // masjidun
    ],
    // docs/lesson-15/05 §2: the shadda on the second of two letters (word 1), in the middle of a word with a letter
    // after it (word 2), and on a meem, where it is held with a hum, in the word a student will most want to read
    // (word 3). A letter with a shadda is ONE step and its `syll` is the doubled consonant with its vowel ("rra"): the
    // blend step after it reads the whole ("marra"). A shadda is never on a word's first letter (that is the article's
    // shadda, Lesson 18; tools/qaida-words-check.js). Candidates for the teacher's check.
    shadda: [
      { root: [['م', 'fatha'], ['ر', 'shadda-fatha']], syll: ['ma', 'rra'], meaning: 'he passed' }, // marra
      { root: [['ع', 'fatha'], ['ل', 'shadda-fatha'], ['م', 'fatha']], syll: ['a', 'lla', 'ma'], meaning: 'he taught' }, // 'allama
      { root: [['م', 'damma'], ['ح', 'fatha'], ['م', 'shadda-fatha'], ['د', 'dammatain']], syll: ['mu', 'ha', 'mma', 'dun'], meaning: 'Muhammad' }, // muhammadun
    ],
    // docs/lesson-9/05 §2: three words that show everything the board says — the standing mark beside Lesson 8's
    // alif spelling of the same sound (word 1), khari zair where the Qur'an actually puts it, on haa (word 2), and a
    // longer word carrying two of the three standing marks at once (word 3). These are the mushaf's OWN spellings,
    // not ordinary Arabic ones (docs/lesson-9/05 §1) — checked against Tanzil's Uthmani text before they ship.
    standing: [
      { root: [['ه', 'standing-fatha'], ['ذ', 'fatha-alif']], syll: ['haa', 'dhaa'], meaning: 'this' }, // haadhaa
      { root: [['ب', 'kasra'], ['ه', 'standing-kasra']], syll: ['bi', 'hii'], meaning: 'with it' }, // bihii
      { root: [['ك', 'kasra'], ['ت', 'standing-fatha'], ['ب', 'fatha'], ['ه', 'inverted-damma']], syll: ['ki', 'taa', 'ba', 'huu'], meaning: 'his book' }, // kitaabahuu
    ],
  };

  // Exposed so tools/qaida-words-check.js can check every word, on every lesson, without a browser (docs/lesson-8/06 §3).
  // Before the section guard below: the data exists whether or not this particular page has a .spell block to draw it in.
  window.qaidaSpellWords = WORDS;

  const section = document.querySelector('.spell');
  if (!section) return;

  // A single mark (lessons 4-6, 8) or a SET (Lesson 9's "standing" — marks.markOf returns null for a set, docs/lesson-9/04 §6).
  const mark = marks.markOf(root.dataset.mark) || marks.setOf(root.dataset.mark);
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

  // Every letter's own glyph, in reading order (root order), never sliced: the fix below (fixes/lesson 4 5/,
  // "should be animated, and be shown in complete word and the word that is being read is highlighted") wants the
  // whole word on screen from the first step, not built up piece by piece.
  function unitsFor(names, entry) {
    return entry.root.map(([key, id]) => {
      const found = names.get(key);
      return marks.glyphOf(found ? found.glyph : key, marks.markOf(id));
    });
  }

  // Which state a letter (index i) is in for the step on screen: 'active' is the part being read right now, 'read'
  // is a letter already covered by an earlier step, 'unread' is a letter the word hasn't reached yet. A 'letter'
  // step lights one letter alone; a 'blend' step lights the whole run it just put together, as ONE piece (a
  // highlighted "qaa" inside "qaala" must stay one unit, not a letter at a time) — except the FINAL blend, the
  // whole word, which settles to plain 'read' rather than staying lit.
  function stateFor(i, step) {
    if (step.kind === 'letter') {
      if (i === step.upto - 1) return 'active';
      return i < step.upto - 1 ? 'read' : 'unread';
    }
    if (step.final) return 'read';
    return i < step.upto ? 'active' : 'unread';
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

    // The whole word, every step: each letter its own span, so the part being read can be lit without touching the
    // rest. No element sits BETWEEN two letters that are meant to join (a span boundary alone doesn't break Arabic
    // shaping in a modern engine, only an inserted character would) — check on the browser checklist regardless
    // (docs/lesson-8/05 §2), since a highlighted "qaa" must stay joined to the "la" after it.
    glyphBox.textContent = '';
    unitsFor(names, entry).forEach((text, i) => {
      const unit = document.createElement('span');
      unit.className = `unit ${stateFor(i, step)}`;
      unit.textContent = text;
      glyphBox.append(unit);
    });

    if (step.kind === 'letter') {
      const [key, id] = entry.root[step.upto - 1];
      const found = names.get(key);
      const m = marks.markOf(id);
      // A letter with a jazam has no sound of its own to say (docs/lesson-14/03 §6): it gets its own line, which
      // names the letter and the mark and says what the jazam does. The blend step after it reads the closed syllable.
      // A letter with a shadda is said twice (docs/lesson-15/03 §5): its own line too, naming what it does.
      let template = section.dataset.letterLine;
      if (m.id === 'sukun' && section.dataset.jazamLine) template = section.dataset.jazamLine;
      else if (m.id.startsWith('shadda') && section.dataset.shaddaLine) template = section.dataset.shaddaLine;
      caption.textContent = fill(template, {
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
