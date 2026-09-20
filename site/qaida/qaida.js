// The free Qaida, Lesson 1: every letter of the chosen script, tap a letter to see its name for a moment, and how far
// the student has reached kept on this device. What's shared with the Qaida home is in shell.js.
// QAIDA-BUILD.md step 1. The design is recorded in design-system/quran-landing/pages/qaida.md.

(() => {
  const shell = window.qaidaShell;
  if (!shell) return;

  const LESSON = 1;
  const $ = (selector) => document.querySelector(selector);

  const lesson = $('.lesson');
  const grid = $('.letters');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const reset = $('.reset');
  const endLine = $('.end-line');
  const next = $('.next');
  const soundNote = $('.sound-note');
  const current = $('.current');

  let tiles = [];
  let letters = [];
  let shape = ''; // which script and grouping the tiles on screen were built for
  let peekMs = 1600;
  let open = null;
  let chosen = -1; // the letter the strip under the grid is showing

  // The letters ------------------------------------------------------------------------------

  function build() {
    letters = shell.lettersOf();
    open = null;
    // The two scripts don't hold the same letters in the same places, so the strip starts empty again.
    chosen = -1;
    if (current) current.hidden = true;
    grid.textContent = '';

    tiles = letters.map(([glyph], i) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'letter';
      tile.style.setProperty('--i', i);
      tile.innerHTML =
        `<span class="glyph" lang="ar" aria-hidden="true">${glyph}</span>` +
        '<span class="name" dir="ltr" aria-hidden="true"></span>' +
        '<span class="mark-seen" aria-hidden="true"></span>' +
        // Only shown once this letter has a real recording — see renderSound().
        '<span class="mark-sound" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" focusable="false"><path d="M4.5 9.5h3L11 6.5v11L7.5 14.5h-3z" />' +
        '<path class="wave" d="M14 9.5a4 4 0 0 1 0 5" /></svg></span>';
      tile.addEventListener('click', () => peek(i));
      return tile;
    });

    for (const family of shell.familiesOf()) {
      const group = document.createElement('div');
      group.className = 'family';
      group.append(...family.map((i) => tiles[i]));
      grid.append(group);
    }

    // The stepped bar draws one segment per letter, and the two scripts don't have the same number of them.
    bar.style.setProperty('--total', letters.length);
    bar.setAttribute('aria-valuemax', letters.length);
  }

  const replay = () => {
    grid.classList.remove('arrive');
    void grid.offsetWidth; // start the animation again
    grid.classList.add('arrive');
    clearTimeout(replay.timer);
    replay.timer = setTimeout(() => grid.classList.remove('arrive'), 150 + letters.length * 35 + 900);
  };

  // Tap to peek: the name shows for a moment, one letter at a time. Tapping the same letter again keeps it showing.

  function close(tile) {
    clearTimeout(tile.timer);
    tile.classList.remove('peek');
    if (open === tile) open = null;
  }

  function peek(i) {
    const tile = tiles[i];
    if (!tile) return;
    if (open && open !== tile) close(open);
    clearTimeout(tile.timer);
    tile.classList.add('peek');
    open = tile;
    tile.timer = setTimeout(() => close(tile), peekMs);
    // Seeing the name and hearing it are the same tap: that's how a letter is learnt.
    if (window.qaidaAudio) window.qaidaAudio.play('letters', letters[i][0]);
    showChosen(i);
    if (shell.markSeen(LESSON, letters[i][0])) renderProgress(shell.seenCount(LESSON) === letters.length);
  }

  // The letter last tapped, held in a strip under the grid: hear it again, or trace it. A tile is already a button,
  // so its own buttons can't live inside it — and at this size they'd crowd the letter anyway.
  function showChosen(i) {
    chosen = i;
    if (!current) return;
    const [glyph, name] = letters[i];
    current.querySelector('.current-glyph').textContent = glyph;
    current.querySelector('.current-name').textContent = name;
    current.hidden = false;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !open) return;
    // A panel on top of the page gets the Escape first; it has its own way of closing.
    if (document.querySelector('dialog[open]')) return;
    close(open);
  });

  if (current) {
    current.querySelector('.current-hear').addEventListener('click', () => {
      if (chosen < 0) return;
      peek(chosen);
    });

    current.querySelector('.current-trace').addEventListener('click', () => {
      if (chosen < 0 || !window.qaidaTrace) return;
      window.qaidaTrace.open(letters[chosen][0], letters[chosen][1]);
    });
  }

  // Progress ---------------------------------------------------------------------------------

  let armed = 0; // "Start again" asks once more before clearing

  function disarm() {
    clearTimeout(armed);
    armed = 0;
    reset.textContent = reset.dataset.label;
  }

  function renderProgress(justFinished = false) {
    const total = letters.length;
    const seen = shell.seenCount(LESSON);
    const done = seen === total;
    const fill = (text) => text.replaceAll('{seen}', seen).replaceAll('{total}', total);
    const marked = shell.seenKeys(LESSON);

    tiles.forEach((tile, i) => tile.toggleAttribute('data-seen', marked.has(shell.keyOf(letters[i][0]))));
    progressText.textContent = fill(done ? progressText.dataset.done : progressText.dataset.template);
    bar.style.setProperty('--p', total ? seen / total : 0);
    bar.setAttribute('aria-valuenow', seen);
    bar.setAttribute('aria-valuemax', total);
    reset.hidden = seen === 0;
    if (!armed) reset.textContent = reset.dataset.label;
    lesson.classList.toggle('complete', done);
    endLine.textContent = fill(done ? endLine.dataset.after : endLine.dataset.before);
    next.setAttribute('aria-disabled', String(!done));
    shell.setDone(LESSON, done);

    if (justFinished) {
      lesson.classList.add('just-finished');
      clearTimeout(renderProgress.timer);
      renderProgress.timer = setTimeout(() => lesson.classList.remove('just-finished'), 2600);
    }
  }

  reset.addEventListener('click', () => {
    if (!armed) {
      reset.textContent = reset.dataset.confirm;
      armed = setTimeout(disarm, 3000);
      return;
    }
    disarm();
    shell.clearLesson(LESSON);
    renderProgress();
  });

  // A link to Lesson 2. Until every letter has been seen it doesn't go, and the line above it says why.
  next.addEventListener('click', (event) => {
    if (next.getAttribute('aria-disabled') !== 'true') return;
    event.preventDefault();
    endLine.classList.remove('nudge');
    void endLine.offsetWidth;
    endLine.classList.add('nudge');
  });

  // Sound ------------------------------------------------------------------------------------

  // A speaker mark on the letters that have a real recording, and one honest line about the rest. The recordings
  // arrive a few at a time, so this is the state of things rather than a promise.
  function renderSound() {
    const audio = window.qaidaAudio;
    if (!audio || !soundNote) return;
    let recorded = 0;
    tiles.forEach((tile, i) => {
      const has = audio.has('letters', letters[i][0]);
      if (has) recorded += 1;
      tile.toggleAttribute('data-recorded', has);
    });
    const total = letters.length;
    soundNote.hidden = recorded === total;
    soundNote.textContent = (recorded === 0 ? soundNote.dataset.none : soundNote.dataset.some)
      .replaceAll('{done}', recorded)
      .replaceAll('{total}', total);
  }

  // Drawing it all ---------------------------------------------------------------------------

  // The names on the tiles follow the student's choice; the letters themselves follow the script, so a change of
  // script builds the tiles again (the two lists are not the same length).
  function render() {
    const wanted = `${shell.state.script}|${shell.state.grouping}`;
    const rebuilt = wanted !== shape;
    if (rebuilt) {
      build();
      shape = wanted;
    }

    tiles.forEach((tile, i) => {
      const name = letters[i][1];
      tile.querySelector('.name').textContent = name;
      tile.setAttribute('aria-label', name);
    });

    renderProgress();
    renderSound();
    if (rebuilt) replay();
  }

  shell.onChange(render);
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // The manifest arrives a moment later; the speaker marks appear when it does.
  if (window.qaidaAudio) window.qaidaAudio.ready.then(renderSound);

  // For the options panel (qaida-options.js).
  window.qaida = {
    kind: 'letters', // the options panel builds its rows from this: a drill lesson has different ones
    render,
    replay,
    get peekMs() {
      return peekMs;
    },
    setPeek(ms) {
      peekMs = ms;
    },
    seeAll() {
      const was = shell.seenCount(LESSON) === letters.length;
      for (const [glyph] of letters) shell.markSeen(LESSON, glyph);
      renderProgress(!was);
    },
    clear() {
      shell.clearLesson(LESSON);
      renderProgress();
    },
  };
})();
