// The free Qaida, Lesson 23 onward: the VERSE page. QAIDA-BUILD.md step P3; the specification is docs/lesson-23/ (01 is this file's reasons).
// `<html data-surah="1">` says which surah the page reads, as `data-rule` says which rule a rule page teaches. The text is verse-words.js, copied by
// tools/fetch-qaida-verses.js from Quran.com in both scripts and never edited; which notes a word carries, and the three words spelled through, are
// fatiha.js. This file draws them.
//
// This is a page that is READ, not drilled (docs/lesson-23/01 §1): practice.js is not loaded, nothing is asked, nothing is marked, and no wrong answer
// exists. What is kept is only which verses have been read, as Lesson 1 keeps which letters have been seen (shell.markSeen), so the home can say how
// far the student has got and the lesson can say it is done. A recommendation, never a gate: nothing is locked.
//
// Words on the page that are not the Qur'an's are Claude's candidates in lesson-23.html, a text field each (the options panel); nothing in this file
// speaks to the student except through them.

(() => {
  const shell = window.qaidaShell;
  const marks = window.qaidaMarks;
  const data = window.qaidaVerseWords;
  const root = document.documentElement;
  const kit = window.qaidaSurahs && window.qaidaSurahs[root.dataset.surah];
  if (!shell || !marks || !data || !kit) return;
  const surah = data.surahs[root.dataset.surah];
  if (!surah) return;

  const LESSON = kit.lesson;
  const unitsOf = window.qaidaSurahs.unitsOf;
  const verses = surah.verses;
  const $ = (selector) => document.querySelector(selector);

  const lesson = $('.lesson');
  const heading = $('h1');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const reset = $('.reset');
  const soundNote = $('.sound-note');
  const board = $('.verse-board');
  const verseLabel = $('.verse-label');
  const verseSteps = $('.verse-steps');
  const line = $('.verse-line');
  const hearVerse = $('.hear-verse');
  const sayVerse = $('.say-verse');
  const hint = $('.verse-hint');
  const card = $('.word-card');
  const cardWord = $('.word-card-word');
  const cardLead = $('.word-card-lead');
  const cardNotes = $('.word-notes');
  const hearWord = $('.hear-word');
  const sayWord = $('.say-word');
  const writeWord = $('.write-word');
  const fontNote = $('.lead-line');
  const prevVerse = $('.verse-prev');
  const nextVerse = $('.verse-next');
  const surahBox = $('.surah-text');
  const surahSection = $('.surah-page');
  const endLine = $('.end-line');
  const next = $('.next');
  const prev = $('.prev');

  const audio = () => window.qaidaAudio;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = marks.fill;
  const script = () => (shell.state.script === 'indopak' ? 'indopak' : 'madani');

  // {jazam} and the three vowels are the student's own words, so a line that names one need not know which set of names is showing; {vowel} is the
  // one a note is about (a hamza's, the one a word is started with).
  const say = (text, values = {}) => fill(text, {
    jazam: marks.nameOf(marks.markOf('sukun'), shell),
    fatha: marks.nameOf(marks.markOf('fatha'), shell), kasra: marks.nameOf(marks.markOf('kasra'), shell),
    damma: marks.nameOf(marks.markOf('damma'), shell), ...values,
  });
  const pascalOf = (id) => id.replace(/^[a-z]/, (c) => c.toUpperCase());

  // The Qur'an's text, in the student's script, never altered.
  const refOf = (verse, word) => `${verse.key}:${word.position}`;
  // What is drawn is the copied word with ONE thing left out: the private-use signs Quran.com's Indo-Pak text carries (U+E000 to U+F8FF), which only its own
  // font draws and which would show as boxes in any other (docs/pass-2/01 §9). Nothing else is touched; the saved word keeps them.
  const PRIVATE = /[-]/g;
  const wordText = (word) => word[script()].replace(PRIVATE, '');
  const verseText = (verse) => verse.words.map(wordText).join(' ');
  const numberOf = (verse) => Number(verse.key.split(':')[1]);
  // The verse-end sign is drawn here, never taken from Quran.com's text, whose Indo-Pak sign is a private-use character that only its own font draws
  // (docs/pass-2/01 §9): U+06DD, then the number in Arabic-Indic digits, which a Qur'an face draws inside the one round mark.
  const endSign = (n) => String.fromCharCode(0x06DD) + [...String(n)].map((d) => String.fromCharCode(0x0660 + Number(d))).join('');

  const state = { verse: 0, word: null };

  // Progress ----------------------------------------------------------------------------------------

  const seen = () => shell.seenKeys(LESSON);
  const seenCount = () => verses.filter((verse) => seen().has(verse.key)).length;

  // A verse is read once a word of it is tapped, it is heard or said, or the student moves on from it. Reading it is the one thing that cannot be checked,
  // so the lesson takes the student's own word for it (the Qaida only ever recommends).
  function markSeen(verse) {
    if (!shell.markSeen(LESSON, verse.key)) return;
    paintSteps();
    paintProgress();
    paintFinished();
  }

  const stageOf = (fraction) => (fraction <= 0 ? 0 : fraction < 0.4 ? 1 : fraction < 0.75 ? 2 : fraction < 1 ? 3 : 4);
  let armed = 0; // "Start again" asks once more before clearing

  function paintProgress() {
    const total = verses.length;
    const read = seenCount();
    progressText.textContent = progressText.dataset[`stage${stageOf(total ? read / total : 0)}`] || '';
    bar.style.setProperty('--p', total ? read / total : 0);
    bar.style.setProperty('--total', total);
    bar.setAttribute('aria-valuenow', read);
    bar.setAttribute('aria-valuemax', total);
    bar.setAttribute('aria-valuetext', progressText.textContent);
    reset.hidden = read === 0 && !shell.isDone(LESSON);
    if (!armed) reset.textContent = reset.dataset.label;
    if (read === total) shell.setDone(LESSON, true);
  }

  function paintFinished() {
    const done = shell.isDone(LESSON);
    lesson.classList.toggle('complete', done);
    endLine.textContent = say(done ? endLine.dataset.finished : endLine.dataset.before);
  }

  function clear() {
    shell.clearLesson(LESSON);
    state.word = null;
    paint();
  }

  reset.addEventListener('click', () => {
    if (!armed) {
      reset.textContent = reset.dataset.confirm;
      armed = setTimeout(() => {
        armed = 0;
        reset.textContent = reset.dataset.label;
      }, 3000);
      return;
    }
    clearTimeout(armed);
    armed = 0;
    clear();
  });

  // Sound -------------------------------------------------------------------------------------------

  // A recording belongs to a verse (kind `verses`, its key) or to a word (kind `words`, its reference, as Lessons 18 to 22 keep theirs). Hear is only
  // offered where a recording exists: a wordless hum in the place of a verse would not be a verse.
  const recorded = (kind, key) => Boolean(audio() && audio().has(kind, key));

  function paintSound() {
    const count = verses.filter((verse) => recorded('verses', verse.key)).length;
    soundNote.hidden = !audio() || count === verses.length;
    soundNote.textContent = count === 0 ? soundNote.dataset.none : soundNote.dataset.some;
    const verse = verses[state.verse];
    hearVerse.hidden = !recorded('verses', verse.key);
    const word = state.word == null ? null : verse.words[state.word];
    hearWord.hidden = !word || !recorded('words', refOf(verse, word));
  }

  function openEcho(kind, key, name, shown) {
    if (window.qaidaEcho) window.qaidaEcho.open(kind, key, name, shown);
  }

  const verseName = (verse) => fill(board.dataset.verseButton, { n: numberOf(verse) });
  const wordName = (verse, i) => fill(board.dataset.wordLabel, { n: i + 1, verse: numberOf(verse) });

  hearVerse.addEventListener('click', () => {
    const verse = verses[state.verse];
    if (audio()) audio().play('verses', verse.key);
    markSeen(verse);
  });
  sayVerse.addEventListener('click', () => {
    const verse = verses[state.verse];
    openEcho('verses', verse.key, verseName(verse), verseText(verse));
    markSeen(verse);
  });
  hearWord.addEventListener('click', () => {
    const verse = verses[state.verse];
    if (state.word != null && audio()) audio().play('words', refOf(verse, verse.words[state.word]));
  });
  sayWord.addEventListener('click', () => {
    const verse = verses[state.verse];
    if (state.word == null) return;
    const word = verse.words[state.word];
    openEcho('words', refOf(verse, word), wordName(verse, state.word), wordText(word));
  });
  writeWord.addEventListener('click', () => {
    const verse = verses[state.verse];
    if (state.word == null || !window.qaidaTrace) return;
    window.qaidaTrace.open(wordText(verse.words[state.word]), wordName(verse, state.word));
  });

  // The verse -------------------------------------------------------------------------------------------

  function buildSteps() {
    verseSteps.textContent = '';
    verses.forEach((verse, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'word-step';
      button.dataset.i = String(i);
      button.textContent = String(numberOf(verse));
      button.setAttribute('aria-label', fill(board.dataset.verseButton, { n: numberOf(verse) }));
      button.addEventListener('click', () => show(i));
      verseSteps.append(button);
    });
  }

  function paintSteps() {
    verseLabel.textContent = fill(board.dataset.verseLabel, { n: numberOf(verses[state.verse]), total: verses.length });
    for (const button of verseSteps.children) {
      const current = Number(button.dataset.i) === state.verse;
      button.classList.toggle('current', current);
      button.classList.toggle('seen', seen().has(verses[Number(button.dataset.i)].key));
      if (current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  function paintVerse() {
    const verse = verses[state.verse];
    line.textContent = '';
    verse.words.forEach((word, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'verse-word';
      button.dataset.i = String(i);
      button.setAttribute('aria-label', wordName(verse, i));
      button.setAttribute('aria-pressed', String(state.word === i));
      if (state.word === i) button.classList.add('picked');
      // The Arabic is aria-hidden and the button carries the name, as every glyph on every lesson does.
      const text = document.createElement('span');
      text.className = 'verse-word-text';
      text.lang = 'ar';
      text.setAttribute('aria-hidden', 'true');
      text.textContent = wordText(word);
      button.append(text);
      button.addEventListener('click', () => pick(i));
      line.append(button);
    });
    const sign = document.createElement('span');
    sign.className = 'verse-end';
    sign.lang = 'ar';
    sign.setAttribute('aria-hidden', 'true');
    sign.textContent = endSign(numberOf(verse));
    line.append(sign);
    nextVerse.querySelector('span').textContent = state.verse === verses.length - 1 ? nextVerse.dataset.last : nextVerse.dataset.next;
    prevVerse.disabled = state.verse === 0;
  }

  // A tapped word and its reasons ----------------------------------------------------------------------

  function noteLine(entry) {
    const [kind, vowel] = [].concat(entry);
    const info = kit.kinds[kind];
    const item = document.createElement('li');
    item.className = 'word-note';
    item.dataset.kind = kind;
    const text = document.createElement('span');
    text.className = 'note-text';
    const vowelName = vowel ? marks.nameOf(marks.markOf(vowel), shell) : '';
    text.textContent = say(board.dataset[`note${pascalOf(kind)}`], { vowel: vowelName });
    item.append(text);

    // The lesson that taught it: a link when it is built, and an honest "comes later" when it is not (nothing is locked, and nothing leads nowhere).
    const row = shell.LESSONS.find((candidate) => candidate.n === info.lesson);
    const built = row && row.built && row.href;
    const where = document.createElement(built ? 'a' : 'span');
    where.className = built ? 'note-lesson' : 'note-lesson later';
    if (built) where.href = row.href;
    where.textContent = fill(built ? board.dataset.lessonLink : board.dataset.lessonLater, { n: info.lesson });
    item.append(where);
    return item;
  }

  function paintCard() {
    const verse = verses[state.verse];
    const word = state.word == null ? null : verse.words[state.word];
    card.hidden = !word;
    hint.hidden = Boolean(word);
    hint.textContent = board.dataset.hint;
    if (!word) return;
    cardWord.textContent = wordText(word);
    cardLead.textContent = board.dataset.cardLead;
    card.setAttribute('aria-label', fill(board.dataset.cardTitle, { n: state.word + 1 }));
    cardNotes.textContent = '';
    // Only the notes that are true of this word in the student's own script: a standing zabar in one mushaf is an alif in the other.
    const text = word[script()];
    for (const entry of kit.notes[refOf(verse, word)] || []) {
      const [kind, vowel] = [].concat(entry);
      if (kit.kinds[kind].has(text, script(), vowel)) cardNotes.append(noteLine(entry));
    }
  }

  function pick(i) {
    const verse = verses[state.verse];
    state.word = state.word === i ? null : i;
    for (const button of line.querySelectorAll('.verse-word')) {
      const on = Number(button.dataset.i) === state.word;
      button.classList.toggle('picked', on);
      button.setAttribute('aria-pressed', String(on));
    }
    paintCard();
    paintSound();
    if (state.word != null) markSeen(verse);
    paintSteps();
  }

  function show(i, scroll = false) {
    const leaving = verses[state.verse];
    // Moving on from a verse is the other way it counts as read: the student has been through it.
    if (i !== state.verse) markSeen(leaving);
    state.verse = Math.max(0, Math.min(verses.length - 1, i));
    state.word = null;
    paint();
    if (scroll) board.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  }

  prevVerse.addEventListener('click', () => show(state.verse - 1));
  nextVerse.addEventListener('click', () => {
    if (state.verse < verses.length - 1) {
      show(state.verse + 1);
      return;
    }
    // The last verse: the whole surah is the way on.
    markSeen(verses[state.verse]);
    surahSection.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
    $('#surah-title').focus({ preventScroll: true });
  });

  // The whole surah, as printed ------------------------------------------------------------------------

  function paintSurah() {
    surahBox.textContent = '';
    verses.forEach((verse, i) => {
      const run = document.createElement('span');
      run.className = 'surah-verse';
      run.lang = 'ar';
      run.textContent = `${verseText(verse)} `;
      const sign = document.createElement('button');
      sign.type = 'button';
      sign.className = 'surah-end';
      sign.setAttribute('aria-label', fill(surahSection.dataset.go, { n: numberOf(verse) }));
      const mark = document.createElement('span');
      mark.lang = 'ar';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = endSign(numberOf(verse));
      sign.append(mark);
      sign.addEventListener('click', () => show(i, true));
      run.append(sign, ' ');
      surahBox.append(run);
    });
  }

  // Three words, a piece at a time ---------------------------------------------------------------------

  const spell = $('.spell');
  const spellLabel = $('.spell-words-label');
  const spellNav = $('.spell-words-nav');
  const spellGlyph = $('.spell-glyph');
  const spellCaption = $('.spell-caption');
  const spellBack = $('.spell-back');
  const spellNext = $('.spell-next');
  const spellRestart = $('.spell-restart');
  const spellNextWord = $('.spell-nextword');
  const walk = kit.walk || [];
  let walkWord = 0;
  let walkAt = 0;

  const findWord = (ref) => {
    const [s, v, p] = ref.split(':').map(Number);
    const verse = verses.find((item) => item.key === `${s}:${v}`);
    return verse && verse.words.find((word) => word.position === p);
  };

  // The pieces of a word in the student's script: each a run of its units, cut where fatiha.js says (the two texts are not cut at the same place).
  function piecesOf(entry) {
    const units = unitsOf(wordText(findWord(entry.ref)));
    const cuts = [0, ...(entry.cuts[script()] || []), units.length];
    return cuts.slice(0, -1).map((from, i) => ({ from, to: cuts[i + 1], units: units.slice(from, cuts[i + 1]) }));
  }

  function paintSpell() {
    if (!walk.length) {
      spell.hidden = true;
      return;
    }
    const entry = walk[walkWord];
    const pieces = piecesOf(entry);
    const last = pieces.length; // the step after the last piece is the whole word
    spellGlyph.textContent = '';
    pieces.forEach((piece, i) => {
      const unit = document.createElement('span');
      const role = walkAt >= last ? 'read' : i < walkAt ? 'read' : i === walkAt ? 'active' : 'unread';
      unit.className = `unit ${role}`;
      unit.textContent = piece.units.join('');
      spellGlyph.append(unit);
    });
    const d = spell.dataset;
    spellCaption.textContent = walkAt >= last ? fill(d.wholeLine, { sound: entry.whole }) : fill(d.pieceLine, { sound: entry.sounds[walkAt] });
    spellLabel.textContent = fill(d.wordLabel, { n: walkWord + 1, total: walk.length });
    for (const button of spellNav.children) {
      const current = Number(button.dataset.i) === walkWord;
      button.classList.toggle('current', current);
      if (current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
    spellBack.disabled = walkAt === 0;
    spellNext.hidden = walkAt >= last;
    spellRestart.hidden = walkAt < last;
    spellNextWord.hidden = !(walkAt >= last && walkWord < walk.length - 1);
  }

  function buildSpellNav() {
    spellNav.textContent = '';
    walk.forEach((entry, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'word-step';
      button.dataset.i = String(i);
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', fill(spell.dataset.wordButton, { n: i + 1 }));
      button.addEventListener('click', () => {
        walkWord = i;
        walkAt = 0;
        paintSpell();
      });
      spellNav.append(button);
    });
  }

  spellNext.addEventListener('click', () => {
    walkAt += 1;
    paintSpell();
  });
  spellBack.addEventListener('click', () => {
    if (walkAt > 0) walkAt -= 1;
    paintSpell();
  });
  spellRestart.addEventListener('click', () => {
    walkAt = 0;
    paintSpell();
  });
  spellNextWord.addEventListener('click', () => {
    if (walkWord < walk.length - 1) walkWord += 1;
    walkAt = 0;
    paintSpell();
  });

  // The way on and the way back ------------------------------------------------------------------------

  function nextEntry() {
    return shell.LESSONS.find((entry) => entry.n === LESSON + 1);
  }

  next.addEventListener('click', () => {
    const entry = nextEntry();
    if (entry && entry.built && entry.href) location.href = entry.href;
    else shell.say(say(next.dataset.soon));
  });

  function paintWays() {
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    next.querySelector('span').textContent = say(name === 'zabar' ? next.dataset.nextZabar : next.dataset.nextFatha);
    const span = prev.querySelector('span');
    if (span) span.textContent = say(name === 'zabar' ? prev.dataset.prevZabar : prev.dataset.prevFatha);
  }

  function paintHead() {
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const title = heading.dataset[name === 'zabar' ? 'titleZabar' : 'titleFatha'] || '';
    heading.textContent = title;
    document.title = document.title.replace(/^[^·]*/, `Lesson ${LESSON}: ${title} `);
    // Indo-Pak's own face is not in yet (docs/lesson-23/01 §3), so its student is told once that the print is a stand-in.
    fontNote.textContent = board.dataset.fontNote || '';
    fontNote.hidden = script() !== 'indopak';
  }

  // Drawing it all ---------------------------------------------------------------------------------------

  function paint() {
    paintHead();
    paintSteps();
    paintVerse();
    paintCard();
    paintSound();
    paintProgress();
    paintFinished();
    paintWays();
    paintSurah();
    paintSpell();
  }

  buildSteps();
  buildSpellNav();
  shell.onChange(paint); // a change of script or names redraws it: every word is the same word in the other text, and the notes name the marks
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // The manifest arrives a moment later; Hear opens for the verses and words that have a recording when it does.
  if (audio()) audio().ready.then(paintSound);

  // For the options panel (qaida-options.js) and the top-bar Say it button, which opens on what was last looked at (docs/your-voice/04 §1).
  window.qaida = {
    kind: 'verses',
    render: paint,
    clear,
    get lastItem() {
      const verse = verses[state.verse];
      if (state.word != null) {
        const word = verse.words[state.word];
        return ['words', refOf(verse, word), wordName(verse, state.word), wordText(word)];
      }
      return ['verses', verse.key, verseName(verse), verseText(verse)];
    },
    // Looking at it, for the options panel: where the page is now.
    show: (i) => show(i),
    get verse() {
      return state.verse;
    },
    get word() {
      return state.word;
    },
  };
})();
