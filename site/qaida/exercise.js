// The free Qaida, Lessons 4 to 6: a reading exercise, no walkthrough and no meanings. Added 2026-09-27 — the user,
// after a first look at spell.js's inline "More words" list, sharing a photo of a printed Qaida's own "mashq" page:
// "don't you think there should be a separate page for the more words... make a table of 12 words, keep the
// meanings out." Twelve real words using only this lesson's own mark, arranged for silent reading practice, the
// same way the printed page is: no audio (the whole feature is "no speech for now"), no scoring, no meanings, no
// step-through. Reading it on your own is the whole exercise.
//
// One page file for every lesson, exactly the shape mark-lesson.js already is: exercise-4.html, exercise-5.html and
// exercise-6.html differ only in data-mark and their wording. Real, correctly-diacritized Arabic — never invented,
// the same rule the aayat overlay and spell.js live under. A candidate list, not the teacher's own; check every
// word before it ships.

(() => {
  const shell = window.qaidaShell;
  const marks = window.qaidaMarks;
  if (!shell || !marks) return;

  const root = document.documentElement;
  const grid = document.querySelector('.mashq');
  if (!grid) return;

  // Twelve per mark, in the pattern that matches it: fatha throughout (fa'ala), fatha-kasra-fatha (fa'ila) or
  // fatha-damma-fatha (fa'ula). Each is [key, markId] pairs, right to left, the same shape spell.js uses. No
  // meanings and no transliteration here on purpose — this page is reading practice, not vocabulary.
  const WORDS = {
    fatha: [
      [['ك', 'fatha'], ['ت', 'fatha'], ['ب', 'fatha']], // kataba, "he wrote"
      [['ذ', 'fatha'], ['ه', 'fatha'], ['ب', 'fatha']], // dhahaba, "he went"
      [['خ', 'fatha'], ['ر', 'fatha'], ['ج', 'fatha']], // kharaja, "he went out"
      [['ج', 'fatha'], ['ل', 'fatha'], ['س', 'fatha']], // jalasa, "he sat"
      [['ف', 'fatha'], ['ت', 'fatha'], ['ح', 'fatha']], // fataha, "he opened"
      [['د', 'fatha'], ['خ', 'fatha'], ['ل', 'fatha']], // dakhala, "he entered"
      [['ر', 'fatha'], ['ج', 'fatha'], ['ع', 'fatha']], // raja'a, "he returned"
      [['ن', 'fatha'], ['ص', 'fatha'], ['ر', 'fatha']], // nasara, "he helped"
      [['ذ', 'fatha'], ['ك', 'fatha'], ['ر', 'fatha']], // dhakara, "he remembered"
      [['ش', 'fatha'], ['ك', 'fatha'], ['ر', 'fatha']], // shakara, "he thanked"
      [['س', 'fatha'], ['ج', 'fatha'], ['د', 'fatha']], // sajada, "he prostrated"
      [['ح', 'fatha'], ['م', 'fatha'], ['د', 'fatha']], // hamada, "he praised"
    ],
    kasra: [
      [['ش', 'fatha'], ['ر', 'kasra'], ['ب', 'fatha']], // shariba, "he drank"
      [['ع', 'fatha'], ['ل', 'kasra'], ['م', 'fatha']], // 'alima, "he knew"
      [['س', 'fatha'], ['م', 'kasra'], ['ع', 'fatha']], // sami'a, "he heard"
      [['ف', 'fatha'], ['ه', 'kasra'], ['م', 'fatha']], // fahima, "he understood"
      [['ح', 'fatha'], ['س', 'kasra'], ['ب', 'fatha']], // hasiba, "he thought"
      [['و', 'fatha'], ['ر', 'kasra'], ['ث', 'fatha']], // waritha, "he inherited"
      [['ح', 'fatha'], ['ف', 'kasra'], ['ظ', 'fatha']], // hafiza, "he memorized"
      [['ل', 'fatha'], ['ب', 'kasra'], ['س', 'fatha']], // labisa, "he wore"
      [['ت', 'fatha'], ['ع', 'kasra'], ['ب', 'fatha']], // ta'iba, "he got tired"
      [['ر', 'fatha'], ['ك', 'kasra'], ['ب', 'fatha']], // rakiba, "he rode"
      [['ع', 'fatha'], ['م', 'kasra'], ['ل', 'fatha']], // 'amila, "he did"
      [['ف', 'fatha'], ['ر', 'kasra'], ['ح', 'fatha']], // fariha, "he was happy"
    ],
    damma: [
      [['ك', 'fatha'], ['ر', 'damma'], ['م', 'fatha']], // karuma, "he was generous"
      [['ك', 'fatha'], ['ب', 'damma'], ['ر', 'fatha']], // kabura, "he was great"
      [['ق', 'fatha'], ['ر', 'damma'], ['ب', 'fatha']], // qaruba, "he was near"
      [['ص', 'fatha'], ['غ', 'damma'], ['ر', 'fatha']], // saghura, "he was small"
      [['ب', 'fatha'], ['ع', 'damma'], ['د', 'fatha']], // ba'uda, "he was far"
      [['ح', 'fatha'], ['س', 'damma'], ['ن', 'fatha']], // hasuna, "he was good"
      [['س', 'fatha'], ['ه', 'damma'], ['ل', 'fatha']], // sahula, "he was easy"
      [['ص', 'fatha'], ['ع', 'damma'], ['ب', 'fatha']], // sa'uba, "he was difficult"
      [['ج', 'fatha'], ['م', 'damma'], ['ل', 'fatha']], // jamula, "he was beautiful"
      [['ع', 'fatha'], ['ظ', 'damma'], ['م', 'fatha']], // 'azuma, "he was great"
      [['ش', 'fatha'], ['ر', 'damma'], ['ف', 'fatha']], // sharufa, "he was noble"
      [['ط', 'fatha'], ['ه', 'damma'], ['ر', 'fatha']], // tahura, "he was pure"
    ],
  };

  const mark = marks.markOf(root.dataset.mark);
  const words = mark && WORDS[mark.id];
  if (!mark || !words) return;

  const lede = document.querySelector('.exercise-lede');
  const next = document.querySelector('.onward .next');
  const fill = marks.fill;

  // The active script's own glyph for a letter, by its key — the same map spell.js and marks.js build.
  function lettersMap() {
    return new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
  }

  function glyphFor(names, word) {
    return word.map(([key, id]) => {
      const found = names.get(key);
      return marks.glyphOf(found ? found.glyph : key, marks.markOf(id));
    }).join('');
  }

  function paint() {
    const names = lettersMap();
    if (lede) lede.textContent = fill(lede.dataset.template, { mark: marks.nameOf(mark, shell) });

    grid.textContent = '';
    words.forEach((word, i) => {
      const cell = document.createElement('span');
      cell.className = 'mashq-word';
      cell.setAttribute('role', 'listitem');
      // No meaning and no transliteration is read out either: this page is reading practice, not narration, the
      // same limit the aayat overlay and every marked tile on the site already accept.
      cell.setAttribute('aria-label', fill(grid.dataset.wordLabel, { n: i + 1 }));
      const glyph = document.createElement('span');
      glyph.lang = 'ar';
      glyph.dir = 'rtl';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = glyphFor(names, word);
      const number = document.createElement('span');
      number.className = 'mashq-n';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(i + 1);
      cell.append(number, glyph);
      grid.append(cell);
    });

    // The next lesson's name follows the student's choice of names, the way a lesson's own Next button does.
    if (next && next.dataset.nextZabar) {
      const span = next.querySelector('span');
      if (span) span.textContent = shell.state.names === 'zabar' ? next.dataset.nextZabar : next.dataset.nextFatha;
    }
  }

  shell.onChange(paint);
  // Draws the page for the first time, through the listener above — and, like every other page, writes the student's
  // script, names and grouping onto <html> and ticks them in the Settings dialog. Without this call the dialog opened
  // with nothing chosen (the user, 2026-09-27: "none of the options are selected").
  shell.renderSetup();

  // What the options panel needs to know this page by (qaida-options.js reads window.qaida): kind "exercise" gets
  // the rows that mean something here — no drill, no letters to tap.
  window.qaida = {
    kind: 'exercise',
    count: words.length,
    render: paint,
  };
})();
