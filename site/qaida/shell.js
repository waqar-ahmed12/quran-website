// The free Qaida — the parts both pages share: what the student chose, how far they've reached, the 29/30 letters of
// each script, the fourteen lessons, the first-visit choice, and the light/dark switch.
// Loaded before home.js and qaida.js. QAIDA-BUILD.md step 1; the design is recorded in
// design-system/quran-landing/pages/qaida.md.

(() => {
  const root = document.documentElement;
  const STORE = 'qaida';
  const $ = (selector) => document.querySelector(selector);

  // The letters -------------------------------------------------------------------------------
  // [letter, its name]. The names are the Arabic ones in both sets of mark names (the user, 2026-09-18: "even in
  // zabar zair paish, you have to write in arabic the names, like baa and not be") — what the student's choice of
  // names changes is the marks, and the titles of lessons 4–14. The list is a stand-in the teacher checks
  // (QAIDA-CONTENT.md); it's editable in Options → Script and names.

  // Madani: the 29 in alphabet order, as a printed Madani Qaida.
  const MADANI = [
    ['ا', 'Alif'],
    ['ب', 'Baa'],
    ['ت', 'Taa'],
    ['ث', 'Thaa'],
    ['ج', 'Jeem'],
    ['ح', 'Ḥaa'],
    ['خ', 'Khaa'],
    ['د', 'Daal'],
    ['ذ', 'Dhaal'],
    ['ر', 'Raa'],
    ['ز', 'Zaa'],
    ['س', 'Seen'],
    ['ش', 'Sheen'],
    ['ص', 'Ṣaad'],
    ['ض', 'Ḍaad'],
    ['ط', 'Ṭaa'],
    ['ظ', 'Ẓaa'],
    ['ع', 'ʿAyn'],
    ['غ', 'Ghayn'],
    ['ف', 'Faa'],
    ['ق', 'Qaaf'],
    ['ك', 'Kaaf'],
    ['ل', 'Laam'],
    ['م', 'Meem'],
    ['ن', 'Noon'],
    ['ه', 'Haa'],
    ['و', 'Waaw'],
    ['ء', 'Hamzah'],
    ['ي', 'Yaa'],
  ];

  // Indo-Pak: the same 29 letters in the order of a printed Indo-Pak Qaida — و before ه, and the Indo-Pak forms of
  // kaaf, haa and yaa (ک ہ ی). Laam stays; lam-alif is not taught as a letter of its own (the user, 2026-09-18).
  const INDOPAK = [
    ['ا', 'Alif'],
    ['ب', 'Baa'],
    ['ت', 'Taa'],
    ['ث', 'Thaa'],
    ['ج', 'Jeem'],
    ['ح', 'Ḥaa'],
    ['خ', 'Khaa'],
    ['د', 'Daal'],
    ['ذ', 'Dhaal'],
    ['ر', 'Raa'],
    ['ز', 'Zaa'],
    ['س', 'Seen'],
    ['ش', 'Sheen'],
    ['ص', 'Ṣaad'],
    ['ض', 'Ḍaad'],
    ['ط', 'Ṭaa'],
    ['ظ', 'Ẓaa'],
    ['ع', 'ʿAyn'],
    ['غ', 'Ghayn'],
    ['ف', 'Faa'],
    ['ق', 'Qaaf'],
    ['ک', 'Kaaf'],
    ['ل', 'Laam'],
    ['م', 'Meem'],
    ['ن', 'Noon'],
    ['و', 'Waaw'],
    ['ہ', 'Haa'],
    ['ء', 'Hamzah'],
    ['ی', 'Yaa'],
  ];

  // Shape families: letters that share a shape and differ only by their dots sit together. By position in the list.
  const familiesFor = (letters) => {
    const groups = [[0], [1, 2, 3], [4, 5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20]];
    for (let i = 21; i < letters.length; i += 1) groups.push([i]);
    return groups;
  };

  const SCRIPTS = {
    madani: { letters: MADANI, families: familiesFor(MADANI) },
    indopak: { letters: INDOPAK, families: familiesFor(INDOPAK) },
  };

  // The fourteen lessons ----------------------------------------------------------------------
  // The sequence is QAIDA-CONTENT.md's. Titles that name a mark change with the student's choice of names.
  // Only lesson 1 is built; the rest say so when tapped.

  const LESSONS = [
    { n: 1, title: { fatha: 'The letters', zabar: 'The letters' },
      lede: 'All the letters, in the order of a printed Qaida.', href: 'lesson-1.html', built: true },
    { n: 2, title: { fatha: 'Letters out of order', zabar: 'Letters out of order' },
      lede: 'The same letters, shuffled, so each one is known cold.' },
    { n: 3, title: { fatha: 'Letter shapes', zabar: 'Letter shapes' },
      lede: 'How a letter changes at the start, the middle and the end of a word.' },
    { n: 4, title: { fatha: 'Fatha', zabar: 'Zabar' },
      lede: 'The short “a”, written above the letter.' },
    { n: 5, title: { fatha: 'Kasra', zabar: 'Zair' },
      lede: 'The short “i”, written under the letter.' },
    { n: 6, title: { fatha: 'Damma', zabar: 'Paish' },
      lede: 'The short “u”, written above the letter.' },
    { n: 7, title: { fatha: 'Tanween', zabar: 'Tanween' },
      lede: 'The doubled marks: an, in and un at the end of a word.' },
    { n: 8, title: { fatha: 'Fatha and alif', zabar: 'Zabar and alif' },
      lede: 'The long “aa”.' },
    { n: 9, title: { fatha: 'Standing marks', zabar: 'Standing harakaat' },
      lede: 'The same three long vowels, written as marks on their own.' },
    { n: 10, title: { fatha: 'Fatha and wow', zabar: 'Zabar and wow' },
      lede: 'The “au” sound, where wow carries no mark of its own.' },
    { n: 11, title: { fatha: 'Damma and wow', zabar: 'Paish and wow' },
      lede: 'The long “oo”, told apart from the lesson before.' },
    { n: 12, title: { fatha: 'Fatha and yaa', zabar: 'Zabar and yaa' },
      lede: 'The “ai” sound, where yaa carries no mark of its own.' },
    { n: 13, title: { fatha: 'Kasra and yaa', zabar: 'Zair and yaa' },
      lede: 'The long “ee”, told apart from the lesson before.' },
    { n: 14, title: { fatha: 'Sukoon', zabar: 'Jazam' },
      lede: 'The mark that stops a letter, on any letter at all.' },
  ];

  // What the student chose and how far they've reached, on this device only (no accounts) ------
  // { v, script, names, grouping, chosen, lessons: { "1": { seen: ["ا", …], done: false } } }

  const blank = () => ({
    v: 1, script: 'madani', names: 'fatha', grouping: 'families', chosen: false, muted: false, lessons: {},
  });

  function read() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORE));
    } catch {
      // nothing saved, or a private window that refuses storage: start fresh
    }
    const state = blank();
    if (!saved || typeof saved !== 'object') return state;

    // Compared by value, not with `in`: a stored "toString" would otherwise pass and there'd be no such script.
    if (saved.script === 'madani' || saved.script === 'indopak') state.script = saved.script;
    if (saved.names === 'fatha' || saved.names === 'zabar') state.names = saved.names;
    if (saved.grouping === 'families' || saved.grouping === 'grid') state.grouping = saved.grouping;
    state.chosen = saved.chosen === true;
    state.muted = saved.muted === true;

    // The first draft kept one flat list of lesson-1 positions. Carry it over, once, as letters.
    if (!saved.v && Array.isArray(saved.seen)) {
      const seen = saved.seen
        .filter((i) => Number.isInteger(i) && i >= 0 && i < MADANI.length)
        .map((i) => MADANI[i][0]);
      state.lessons['1'] = { seen: [...new Set(seen)], done: false };
      return state;
    }

    if (saved.lessons && typeof saved.lessons === 'object') {
      for (const [key, value] of Object.entries(saved.lessons)) {
        if (!/^\d+$/.test(key) || !value || typeof value !== 'object') continue;
        const seen = Array.isArray(value.seen) ? value.seen.filter((g) => typeof g === 'string') : [];
        state.lessons[key] = { seen: [...new Set(seen)], done: value.done === true };
      }
    }
    return state;
  }

  const state = read();

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      // the lesson still works for this visit
    }
  }

  // How far, lesson by lesson -----------------------------------------------------------------

  // Reading a lesson never creates it: the home asks about all fourteen, and thirteen of them have nothing to say.
  const NOTHING = Object.freeze({ seen: Object.freeze([]), done: false });
  const lessonState = (n) => state.lessons[String(n)] || NOTHING;

  function ownState(n) {
    const key = String(n);
    if (!state.lessons[key]) state.lessons[key] = { seen: [], done: false };
    return state.lessons[key];
  }

  const scriptOf = (script) => (script === 'indopak' ? SCRIPTS.indopak : SCRIPTS.madani);
  const lettersOf = (script = state.script) => scriptOf(script).letters;

  // The same letter in the two scripts: ک is kaaf, ہ is haa, ی is yaa. A student who has seen kaaf has seen kaaf,
  // whichever form it was written in, so progress is kept under one of them. (Lam-alif has no Madani twin.)
  const SAME_LETTER = { 'ک': 'ك', 'ہ': 'ه', 'ی': 'ي' };
  const keyOf = (glyph) => SAME_LETTER[glyph] || glyph;

  // Seen letters are kept as letters, not positions, so switching script keeps credit for the ones both lists share.
  const seenKeys = (n) => new Set(lessonState(n).seen.map(keyOf));

  function seenCount(n, script = state.script) {
    const seen = seenKeys(n);
    return lettersOf(script).filter(([glyph]) => seen.has(keyOf(glyph))).length;
  }

  function markSeen(n, glyph) {
    const key = keyOf(glyph);
    if (seenKeys(n).has(key)) return false;
    ownState(n).seen.push(key);
    save();
    return true;
  }

  function clearLesson(n) {
    const lesson = lessonState(n);
    if (lesson === NOTHING) return;
    lesson.seen = [];
    lesson.done = false;
    save();
  }

  // Lesson 1 is finished when every letter of the script in front of the student has been seen. The flag is kept so
  // later lessons, which won't be counted in letters, can set it themselves.
  function isDone(n) {
    if (n !== 1) return lessonState(n).done;
    return seenCount(1) === lettersOf().length;
  }

  function setDone(n, done) {
    if (lessonState(n).done === done) return;
    ownState(n).done = done;
    save();
  }

  // A lesson opens when the one before it is finished. Lesson 1 is always open.
  const isOpen = (n) => n === 1 || isDone(n - 1);

  const doneCount = () => LESSONS.filter(({ n }) => isDone(n)).length;

  // What the student chose --------------------------------------------------------------------

  const listeners = [];
  const onChange = (fn) => listeners.push(fn);

  const setup = $('.setup');

  function renderSetup() {
    root.dataset.script = state.script;
    root.dataset.names = state.names;
    root.dataset.grouping = state.grouping;
    if (setup) {
      const fill = (className, key) => {
        const node = setup.querySelector(className);
        if (node) node.textContent = setup.dataset[key] || '';
      };
      fill('.setup-script', state.script);
      fill('.setup-names', state.names);
      fill('.setup-grouping', state.grouping);
    }
    if (chooser) {
      for (const input of chooser.querySelectorAll('input')) input.checked = input.value === state[input.name];
    }
    for (const fn of listeners) fn();
  }

  // The first-visit choice --------------------------------------------------------------------

  const chooser = $('.chooser');
  const chooserButton = chooser && chooser.querySelector('.done');
  let closingChooser = false;
  let chooserTimer = 0;

  function closeChooser() {
    if (!chooser || !chooser.open || closingChooser) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chooser.close();
      return;
    }
    closingChooser = true;
    chooser.classList.add('closing');

    const done = () => {
      clearTimeout(chooserTimer);
      chooser.removeEventListener('animationend', onEnd);
      chooser.classList.remove('closing');
      closingChooser = false;
      if (chooser.open) chooser.close();
    };

    const onEnd = (event) => {
      if (event.target === chooser) done();
    };

    chooser.addEventListener('animationend', onEnd);
    chooserTimer = setTimeout(done, 300);
  }

  function showChooser() {
    if (!chooser || (chooser.open && !closingChooser)) return;
    clearTimeout(chooserTimer);
    chooser.classList.remove('closing');
    closingChooser = false;
    if (chooserButton) {
      chooserButton.textContent = state.chosen ? chooserButton.dataset.later : chooserButton.dataset.first;
    }
    if (!chooser.open) chooser.showModal();
  }

  if (chooser) {
    const ASKED = ['script', 'names', 'grouping'];
    chooser.addEventListener('change', (event) => {
      if (!ASKED.includes(event.target.name)) return;
      state[event.target.name] = event.target.value;
      save();
      renderSetup();
    });

    chooser.addEventListener('close', () => {
      state.chosen = true;
      save();
      chooser.classList.remove('closing');
      closingChooser = false;
    });

    chooser.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeChooser();
    });

    const form = chooser.querySelector('form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        closeChooser();
      });
    }

    // A click on the dimmed page around the panel closes it smoothly (the form fills the panel, so only the
    // backdrop is the dialog itself).
    chooser.addEventListener('click', (event) => {
      if (event.target === chooser) closeChooser();
    });
  }

  for (const button of document.querySelectorAll('.open-settings')) button.addEventListener('click', showChooser);

  // A short note at the bottom of the screen, for the lessons that aren't built yet ------------

  const note = $('.note');

  function say(text) {
    if (!note || !text) return;
    note.textContent = text;
    note.classList.add('show');
    clearTimeout(say.timer);
    say.timer = setTimeout(() => note.classList.remove('show'), 3200);
  }

  // Light and dark, shared with the home page --------------------------------------------------

  const themeButton = $('.theme');
  const themeColor = $('meta[name="theme-color"]');

  function applyTheme() {
    const light = root.dataset.theme === 'light';
    if (themeButton) themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    if (themeColor) themeColor.content = light ? '#F5F4F1' : '#1F1A18';
  }

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const turn = () => {
        const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = theme;
        try {
          localStorage.setItem('theme', theme);
        } catch {
          // the switch still works for this visit
        }
        applyTheme();
      };
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return turn();
      const fade = document.startViewTransition(turn);
      Promise.allSettled([fade.ready, fade.updateCallbackDone, fade.finished]);
    });
  }

  applyTheme();

  // Sound on or off, kept on this device like the theme ------------------------------------------

  const muteButton = $('.mute');

  function applyMute() {
    root.dataset.muted = String(state.muted);
    if (!muteButton) return;
    muteButton.setAttribute('aria-pressed', String(state.muted));
    muteButton.setAttribute('aria-label', state.muted ? muteButton.dataset.on : muteButton.dataset.off);
  }

  if (muteButton) {
    muteButton.addEventListener('click', () => {
      state.muted = !state.muted;
      save();
      applyMute();
      if (state.muted && window.qaidaAudio) window.qaidaAudio.stop();
    });
  }

  applyMute();

  // The top bar gains its hairline once the page has scrolled.
  const topbar = $('.topbar');
  const sentinel = $('.top-sentinel');
  if (topbar && sentinel) {
    new IntersectionObserver(([entry]) => topbar.classList.toggle('scrolled', !entry.isIntersecting)).observe(sentinel);
  }

  // What the two pages use ---------------------------------------------------------------------

  window.qaidaShell = {
    state,
    save,
    SCRIPTS,
    LESSONS,
    lettersOf,
    familiesOf: (script = state.script) => scriptOf(script).families,
    lessonState,
    keyOf,
    seenKeys,
    seenCount,
    markSeen,
    clearLesson,
    isDone,
    setDone,
    isOpen,
    doneCount,
    renderSetup,
    applyMute,
    onChange,
    showChooser,
    closeChooser,
    say,
    // The options panel asks for the first-visit choice again, and edits the two lists of names.
    askAgain() {
      state.chosen = false;
      save();
      showChooser();
    },
    setNames(text) {
      const list = text.split(',').map((name) => name.trim());
      lettersOf().forEach((letter, i) => {
        letter[1] = list[i] || '';
      });
      renderSetup();
    },
    namesText: () => lettersOf().map((letter) => letter[1]).join(', '),
  };
})();
