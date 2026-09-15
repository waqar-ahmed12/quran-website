// The free Qaida, Lesson 1: the 29 letters, tap a letter to see its name for a moment, progress kept on this device.
// QAIDA-BUILD.md step 1. The design is recorded in design-system/quran-landing/pages/qaida.md.

(() => {
  const root = document.documentElement;
  const STORE = 'qaida';
  const $ = (selector) => document.querySelector(selector);

  // Alphabet order, as in a printed Qaida: [letter, name with the fatha-set names, name with the zabar-set names].
  // Both lists are stand-ins written by Claude; the teacher checks them before launch (QAIDA-CONTENT.md).
  const LETTERS = [
    ['ا', 'Alif', 'Alif'],
    ['ب', 'Baa', 'Baa'],
    ['ت', 'Taa', 'Taa'],
    ['ث', 'Thaa', 'Saa'],
    ['ج', 'Jeem', 'Jeem'],
    ['ح', 'Ḥaa', 'Haa'],
    ['خ', 'Khaa', 'Khaa'],
    ['د', 'Daal', 'Daal'],
    ['ذ', 'Dhaal', 'Zaal'],
    ['ر', 'Raa', 'Raa'],
    ['ز', 'Zaay', 'Zaa'],
    ['س', 'Seen', 'Seen'],
    ['ش', 'Sheen', 'Sheen'],
    ['ص', 'Ṣaad', 'Suaad'],
    ['ض', 'Ḍaad', 'Zuaad'],
    ['ط', 'Ṭaa', 'Toay'],
    ['ظ', 'Ẓaa', 'Zoay'],
    ['ع', 'ʿAyn', 'Ain'],
    ['غ', 'Ghayn', 'Ghain'],
    ['ف', 'Faa', 'Faa'],
    ['ق', 'Qaaf', 'Qaaf'],
    ['ك', 'Kaaf', 'Kaaf'],
    ['ل', 'Laam', 'Laam'],
    ['م', 'Meem', 'Meem'],
    ['ن', 'Noon', 'Noon'],
    ['ه', 'Haa', 'Ha'],
    ['و', 'Waaw', 'Waao'],
    ['ء', 'Hamzah', 'Hamza'],
    ['ي', 'Yaa', 'Yaa'],
  ];
  const TOTAL = LETTERS.length;
  const NAMES = {
    fatha: LETTERS.map((letter) => letter[1]),
    zabar: LETTERS.map((letter) => letter[2]),
  };

  // Shape families, by position in LETTERS: letters that share a shape and differ only by dots sit together.
  const FAMILIES = [[0], [1, 2, 3], [4, 5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20],
    [21], [22], [23], [24], [25], [26], [27], [28]];

  // What the student chose and how far they've reached, on this device only (no accounts).
  const state = { script: 'madani', names: 'fatha', seen: [], chosen: false };
  try {
    Object.assign(state, JSON.parse(localStorage.getItem(STORE)) || {});
  } catch {
    // nothing saved, or a private window that refuses storage: start fresh
  }
  if (!Array.isArray(state.seen)) state.seen = [];
  state.seen = [...new Set(state.seen)].filter((i) => Number.isInteger(i) && i >= 0 && i < TOTAL);
  if (!(state.script in { madani: 1, indopak: 1 })) state.script = 'madani';
  if (!(state.names in NAMES)) state.names = 'fatha';

  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      // the lesson still works for this visit
    }
  };

  const lesson = $('.lesson');
  const grid = $('.letters');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const reset = $('.reset');
  const endLine = $('.end-line');
  const next = $('.next');
  const setup = $('.setup');
  const chooser = $('.chooser');
  const chooserButton = chooser.querySelector('.done');
  const note = $('.note');

  // The letters ------------------------------------------------------------------------------

  const tiles = LETTERS.map(([glyph], i) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'letter';
    tile.style.setProperty('--i', i);
    tile.innerHTML =
      `<span class="glyph" lang="ar" aria-hidden="true">${glyph}</span>` +
      '<span class="name" dir="ltr" aria-hidden="true"></span>' +
      '<span class="mark-seen" aria-hidden="true"></span>';
    tile.addEventListener('click', () => peek(i));
    return tile;
  });

  for (const family of FAMILIES) {
    const group = document.createElement('div');
    group.className = 'family';
    group.append(...family.map((i) => tiles[i]));
    grid.append(group);
  }

  const replay = () => {
    grid.classList.remove('arrive');
    void grid.offsetWidth; // start the animation again
    grid.classList.add('arrive');
    clearTimeout(replay.timer);
    replay.timer = setTimeout(() => grid.classList.remove('arrive'), 150 + TOTAL * 35 + 900);
  };
  replay();

  // Tap to peek: the name shows for a moment, one letter at a time. Tapping the same letter again keeps it showing.
  let peekMs = 1600;
  let open = null;

  function close(tile) {
    clearTimeout(tile.timer);
    tile.classList.remove('peek');
    if (open === tile) open = null;
  }

  function peek(i) {
    const tile = tiles[i];
    if (open && open !== tile) close(open);
    clearTimeout(tile.timer);
    tile.classList.add('peek');
    open = tile;
    tile.timer = setTimeout(() => close(tile), peekMs);
    if (!state.seen.includes(i)) {
      state.seen.push(i);
      save();
      renderProgress(state.seen.length === TOTAL);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open && !chooser.open) close(open);
  });

  // Progress ---------------------------------------------------------------------------------

  let armed = 0; // "Start again" asks once more before clearing

  function disarm() {
    clearTimeout(armed);
    armed = 0;
    reset.textContent = reset.dataset.label;
  }

  function renderProgress(justFinished = false) {
    const seen = state.seen.length;
    const done = seen === TOTAL;
    const fill = (text) => text.replaceAll('{seen}', seen).replaceAll('{total}', TOTAL);
    tiles.forEach((tile, i) => tile.toggleAttribute('data-seen', state.seen.includes(i)));
    progressText.textContent = fill(done ? progressText.dataset.done : progressText.dataset.template);
    bar.style.setProperty('--p', seen / TOTAL);
    bar.setAttribute('aria-valuenow', seen);
    bar.setAttribute('aria-valuemax', TOTAL);
    reset.hidden = seen === 0;
    if (!armed) reset.textContent = reset.dataset.label;
    lesson.classList.toggle('complete', done);
    endLine.textContent = fill(done ? endLine.dataset.after : endLine.dataset.before);
    next.setAttribute('aria-disabled', String(!done));
    if (justFinished) {
      lesson.classList.add('just-finished');
      setTimeout(() => lesson.classList.remove('just-finished'), 2400);
    }
  }

  reset.addEventListener('click', () => {
    if (!armed) {
      reset.textContent = reset.dataset.confirm;
      armed = setTimeout(disarm, 3000);
      return;
    }
    disarm();
    state.seen = [];
    save();
    renderProgress();
  });

  function say(text) {
    note.textContent = text;
    note.classList.add('show');
    clearTimeout(say.timer);
    say.timer = setTimeout(() => note.classList.remove('show'), 3200);
  }

  next.addEventListener('click', (event) => {
    event.preventDefault();
    if (next.getAttribute('aria-disabled') === 'true') {
      endLine.classList.remove('nudge');
      void endLine.offsetWidth;
      endLine.classList.add('nudge');
      return;
    }
    say(note.dataset.standin); // stand-in until Lesson 2 exists
  });

  // Script and names -------------------------------------------------------------------------

  function renderSetup() {
    root.dataset.script = state.script;
    root.dataset.names = state.names;
    const names = NAMES[state.names];
    tiles.forEach((tile, i) => {
      tile.querySelector('.name').textContent = names[i];
      tile.setAttribute('aria-label', names[i]);
    });
    setup.querySelector('.setup-script').textContent = setup.dataset[state.script];
    setup.querySelector('.setup-names').textContent = setup.dataset[state.names];
    for (const input of chooser.querySelectorAll('input')) input.checked = input.value === state[input.name];
  }

  function showChooser() {
    if (chooser.open) return;
    chooserButton.textContent = state.chosen ? chooserButton.dataset.later : chooserButton.dataset.first;
    chooser.showModal();
  }

  chooser.addEventListener('change', (event) => {
    state[event.target.name] = event.target.value;
    save();
    renderSetup();
  });

  chooser.addEventListener('close', () => {
    state.chosen = true;
    save();
  });

  // A click on the dimmed page around the panel closes it (the form fills the panel, so only the backdrop is the dialog).
  chooser.addEventListener('click', (event) => {
    if (event.target === chooser) chooser.close();
  });

  for (const button of document.querySelectorAll('.open-settings')) button.addEventListener('click', showChooser);

  // Light and dark, shared with the home page --------------------------------------------------

  const themeButton = $('.theme');
  const themeColor = $('meta[name="theme-color"]');

  function applyTheme() {
    const light = root.dataset.theme === 'light';
    themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeColor.content = light ? '#F5F4F1' : '#1F1A18';
  }

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

  // The top bar gains its hairline once the page has scrolled.
  const topbar = $('.topbar');
  new IntersectionObserver(([entry]) => topbar.classList.toggle('scrolled', !entry.isIntersecting))
    .observe($('.top-sentinel'));

  // Start ------------------------------------------------------------------------------------

  function render() {
    renderSetup();
    renderProgress();
  }

  render();
  applyTheme();
  if (!state.chosen) requestAnimationFrame(showChooser);

  // For the options panel (qaida-options.js).
  window.qaida = {
    names: NAMES,
    render,
    replay,
    get peekMs() {
      return peekMs;
    },
    setPeek(ms) {
      peekMs = ms;
    },
    setNames(set, text) {
      const list = text.split(',').map((name) => name.trim());
      NAMES[set] = LETTERS.map((letter, i) => list[i] || '');
      renderSetup();
    },
    showChooser() {
      state.chosen = false;
      save();
      showChooser();
    },
    seeAll() {
      const was = state.seen.length === TOTAL;
      state.seen = LETTERS.map((letter, i) => i);
      save();
      renderProgress(!was);
    },
    clear() {
      state.seen = [];
      save();
      renderProgress();
    },
  };
})();
