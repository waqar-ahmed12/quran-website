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

  let tiles = [];
  let letters = [];
  let shape = ''; // which script and grouping the tiles on screen were built for
  let peekMs = 1600;
  let open = null;

  // The letters ------------------------------------------------------------------------------

  function build() {
    letters = shell.lettersOf();
    open = null;
    grid.textContent = '';

    tiles = letters.map(([glyph], i) => {
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
    if (shell.markSeen(LESSON, letters[i][0])) renderProgress(shell.seenCount(LESSON) === letters.length);
  }

  document.addEventListener('keydown', (event) => {
    const chooser = document.querySelector('.chooser');
    if (event.key === 'Escape' && open && !(chooser && chooser.open)) close(open);
  });

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

  next.addEventListener('click', () => {
    if (next.getAttribute('aria-disabled') === 'true') {
      endLine.classList.remove('nudge');
      void endLine.offsetWidth;
      endLine.classList.add('nudge');
      return;
    }
    shell.say(next.dataset.standin); // stand-in until Lesson 2 exists
  });

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
    if (rebuilt) replay();
  }

  shell.onChange(render);
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // For the options panel (qaida-options.js).
  window.qaida = {
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
