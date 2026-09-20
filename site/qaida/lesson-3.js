// The free Qaida, Lesson 3: letter shapes. QAIDA-BUILD.md step 5; the specification is docs/lesson-3/.
//
// The same letters a third time, now joined: on their own, at the start, in the middle and at the end. This file is the
// page: the band rail, the board of shapes (the teaching half) and the drill under it (the testing half). Which shapes
// exist and which group each belongs to is shapes.js. What to ask next, what counts as known and when to say "you seem
// ready" is practice.js, which is unchanged: the six groups fall out of its `required` flag (docs/lesson-3/03 §2).
//
// The wording never scolds. A wrong answer names both shapes and says nothing more; the advice is plain, short, and only
// ever advice. Nothing is locked: every group opens at any time, and one opened out of turn is advised about once.

(() => {
  const shell = window.qaidaShell;
  const engine = window.qaidaPractice;
  const shapes = window.qaidaShapes;
  if (!shell || !engine || !shapes) return;

  const LESSON = 3;
  const TABLE = shapes.TABLE;
  const root = document.documentElement;
  const $ = (selector) => document.querySelector(selector);

  const lesson = $('.lesson');
  const bandsNav = $('.bands');
  const bandsList = $('.bands ol');
  const bandAdvice = $('.band-advice');
  const bandAdviceText = $('.band-advice .struggle-text');
  const bandAnnounce = $('.band-announce');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const bandLine = $('.band-line');
  const reset = $('.reset');
  const soundNote = $('.sound-note');
  const boardBox = $('.shapes');
  const boardTitle = $('.shapes-title');
  const boardScroll = $('.shapes-scroll');
  const boardTable = $('.shapes-table');
  const headsTrack = $('.shapes-heads-track');
  const boardNote = $('.shapes-note');
  const drillBox = $('.drill');
  const askLine = $('.ask');
  const prompt = $('.prompt');
  const choicesBox = $('.choices');
  const verdictLine = $('.verdict');
  const announce = $('.announce');
  const after = $('.after');
  const struggle = $('.advice .struggle');
  const struggleText = $('.advice .struggle-text');
  const readyNote = $('.ready-note');
  const practiseButton = $('.practise');
  const drillTitle = $('#drill-title');
  const wordsBox = $('[data-name-isolated]');
  const endLine = $('.end-line');
  const next = $('.next');

  const audio = () => window.qaidaAudio;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A phone: the board lays each letter out differently, and again when the window is turned or resized across the line.
  const narrowQuery = matchMedia('(max-width: 599px)');
  const isNarrow = () => Boolean(narrowQuery && narrowQuery.matches);
  const fill = shapes.fill;

  // What is on the board now, apart from what the engine holds.
  const view = {
    question: null,
    verdict: null,
    struggling: null, // the one shape the advice is about
    input: 'pointer', // how the last answer was given: a right answer only moves on by itself for a pointer
    focusChoice: false, // Next was pressed, so the keyboard belongs on the first choice of the new question
  };

  let drill = null;
  let items = []; // every shape in the lesson: the whole lesson, whatever group is open
  let pool = []; // the same, with `required` set for the open group only
  let byId = new Map();
  let shape = ''; // which script, drilling and wrong-answer choice the items on screen were built for
  let band = 1;
  let mode = 'form';
  let pause = 900; // how long a right answer stays before the next question, for a pointer
  let advanceTimer = 0;
  let swapTimer = 0;
  let announced = 0;
  let advised = false; // the "this group comes later" line is shown once a visit, not every time
  let missedId = ''; // the shape just missed keeps a gold edge on the board until the next question
  const ready = new Set(); // the groups already known to be ready, so "you seem to know this" fires once, on the way in

  // What the drill runs with. The engine is measured against these, so the rail can measure every group the same way.
  const target = () => (drill ? drill.settings.target : 3);
  const readyAt = () => (drill ? drill.settings.readyAt : 0.8);
  const drilled = () => (root.dataset.drilled === 'all' ? 'all' : 'new');
  const distractors = () => (['same-letter', 'any'].includes(root.dataset.distractors) ? root.dataset.distractors : 'position');
  const boardMode = () => (root.dataset.board === 'all' ? 'all' : 'band');

  // Words -------------------------------------------------------------------------------------------

  const templates = () => {
    const d = wordsBox.dataset;
    return { isolated: d.nameIsolated, initial: d.nameInitial, medial: d.nameMedial, final: d.nameFinal, joined: d.nameJoined };
  };

  const bandName = (n) => bandsNav.dataset[`band${n}`] || '';

  // The groups -----------------------------------------------------------------------------------------

  const stat = (n) => shapes.stats(shell, LESSON, items, n, { target: target(), readyAt: readyAt() });
  const allReady = () => shapes.DRILLING.every((n) => stat(n).ready);

  // The group the student is up to: the first one not yet ready. The table once they all are.
  function upTo() {
    for (const n of shapes.DRILLING) if (!stat(n).ready) return n;
    return TABLE;
  }

  function lessonKnown() {
    const record = shell.drillOf(LESSON);
    return items.filter((item) => (record.streak[item.id] || 0) >= target()).length;
  }

  // The rail, once; paintRail() keeps it up to date without rebuilding it, so a button never loses the keyboard.
  function buildRail() {
    bandsList.textContent = '';
    for (const { n } of shapes.BANDS) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'band';
      button.dataset.band = String(n);
      button.innerHTML =
        '<span class="band-n" aria-hidden="true"></span>' +
        '<span class="band-glyph" lang="ar" aria-hidden="true"></span>' +
        '<span class="band-name" aria-hidden="true"></span>' +
        '<span class="band-state" aria-hidden="true"></span>' +
        '<svg class="band-star" viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">' +
        '<rect x="-7" y="-7" width="14" height="14" /><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" /></svg>' +
        '<span class="band-bar" aria-hidden="true"><span class="band-fill"></span></span>';
      button.addEventListener('click', () => setBand(n, { user: true }));
      item.append(button);
      bandsList.append(item);
    }
  }

  function paintRail() {
    const words = bandsNav.dataset;
    const wholeLesson = items.length ? lessonKnown() / items.length : 0;
    for (const button of bandsList.querySelectorAll('.band')) {
      const n = Number(button.dataset.band);
      const s = n === TABLE ? null : stat(n);
      const done = n === TABLE ? allReady() : s.ready;
      const now = n === band;
      const state = now ? words.bandNow : done ? words.bandDone : n > band ? words.bandLater : '';
      const name = bandName(n);

      button.dataset.state = now ? 'now' : done ? 'done' : n > band ? 'later' : 'past';
      button.toggleAttribute('data-done', done);
      if (now) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      button.querySelector('.band-n').textContent = String(n);
      button.querySelector('.band-glyph').textContent = shapes.sampleOf(shell, n);
      button.querySelector('.band-name').textContent = name;
      button.querySelector('.band-state').textContent = state || '';
      button.style.setProperty('--p', n === TABLE ? wholeLesson : s.total ? s.known / s.total : 0);
      // The name of the state is in the label, so it does not depend on the gold.
      button.setAttribute('aria-label', fill(words.bandLabel, { n, name, state }).replace(/\s+/g, ' ').trim());
    }
  }

  // Which group a student is in changes what is on the board and what the drill is asking about, and nothing else.
  // `user` is a tap on the rail: only that moves the keyboard and only that can be told "this group comes later".
  function setBand(wanted, { user = false } = {}) {
    const n = Math.min(TABLE, Math.max(1, Math.round(Number(wanted)) || 1));
    const early = user && n !== band && n > upTo();
    // Measured before anything on the page changes: has the student scrolled down past the start of the shapes?
    const scrolledPast = user && boardBox.getBoundingClientRect().top < railBottom();
    clearTimeout(advanceTimer);
    clearTimeout(swapTimer);
    band = n;
    root.dataset.band = String(n);
    view.struggling = null;
    view.verdict = null;
    drillBox.classList.remove('leaving');

    // The drill is handed only this group's shapes, or all of them for the table. No engine change.
    pool = shapes.poolFor(items, n);
    byId = new Map(pool.map((item) => [item.id, item]));
    drill.setItems(pool);


    // Advice, said once, and never again for the rest of the visit.
    const words = bandsNav.dataset;
    const advise = early && !advised;
    if (advise) advised = true;
    bandAdvice.hidden = !advise;
    bandAdviceText.textContent = advise ? words.bandEarly : '';

    swapBoard(() => {
      renderBoard();
      // The page glides up once the new shapes are in place: asked for earlier, the change in height cancels it.
      if (scrolledPast) {
        const glide = () => boardBox.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
        if (still()) glide();
        else requestAnimationFrame(glide);
      }
    });
    paintRail();
    paintAdvice();
    paintProgress();

    const line = fill(n === TABLE ? words.bandAnnounceTable : words.bandAnnounce, { n, name: bandName(n) });
    bandAnnounce.textContent = advise ? `${line} ${words.bandEarly}` : line;

    if (user) {
      const current = bandsList.querySelector('[aria-current]');
      if (current && bandsList.scrollWidth > bandsList.clientWidth) {
        bandsList.scrollTo({ left: Math.max(0, current.parentElement.offsetLeft - 8), behavior: still() ? 'auto' : 'smooth' });
      }
      // Told where they landed before being put inside a grid: the board's heading, not its first tile.
      setTimeout(() => boardTitle.focus({ preventScroll: true }), still() ? 0 : 160);
    }
  }

  // The rail sticks under the top bar, so anything the page scrolls to has to stop below it.
  const railBottom = () => bandsNav.getBoundingClientRect().bottom;
  function measureRail() {
    root.style.setProperty('--rail-h', `${Math.round(bandsNav.getBoundingClientRect().height)}px`);
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(measureRail).observe(bandsNav);

  // From looking to practising: the exercise is the next section down.
  practiseButton.addEventListener('click', () => {
    drillTitle.focus({ preventScroll: true });
    drillBox.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  });

  // The board ---------------------------------------------------------------------------------------

  let peeked = null;
  let peekMs = 1600;

  function closePeek(tile) {
    clearTimeout(tile.timer);
    tile.classList.remove('peek');
    if (peeked === tile) peeked = null;
  }

  // Tap a shape and it says where it sits, and the letter's own recording plays: a letter sounds the same wherever it is.
  function peekTile(tile) {
    if (peeked && peeked !== tile) closePeek(peeked);
    clearTimeout(tile.timer);
    tile.classList.add('peek');
    peeked = tile;
    tile.timer = setTimeout(() => closePeek(tile), peekMs);
    if (audio() && tile.dataset.base) audio().play('letters', tile.dataset.base);
  }

  boardTable.addEventListener('click', (event) => {
    const tile = event.target.closest('.letter');
    if (tile) peekTile(tile);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !peeked) return;
    if (document.querySelector('dialog[open]')) return; // a panel on top gets the Escape first
    closePeek(peeked);
  });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // A shape as a tile. Its container carries the name and the shape itself is hidden from a screen reader: a joined form
  // is a letter wrapped in invisible joiners, and would otherwise be read out as one (docs/lesson-3/06 §1).
  function shapeTile(row, column, glyph, label, heading) {
    const cell = el('td');
    const button = el('button', 'letter shape');
    button.type = 'button';
    button.dataset.id = `${row.key}:${column}`;
    button.dataset.base = row.glyph;
    button.setAttribute('aria-label', label);
    const g = el('span', 'glyph', glyph);
    g.lang = 'ar';
    g.dir = 'rtl';
    g.setAttribute('aria-hidden', 'true');
    const name = el('span', 'name', heading);
    name.dir = 'ltr';
    name.setAttribute('aria-hidden', 'true');
    button.append(g, name);
    cell.append(button);
    return cell;
  }

  // The sticky column headings ----------------------------------------------------------------------
  // The table can scroll sideways on a phone, and a sticky heading cannot live inside something that scrolls sideways. So the
  // headings the eye reads are a bar of their own above the table, sticky under the rail, and each of its words is set to sit
  // exactly over its column, wherever the table has been scrolled to.
  let headCells = [];

  function buildHeads(headings) {
    headsTrack.textContent = '';
    headCells = headings.map(({ text, th }) => {
      const cell = el('span', 'shapes-head', text);
      cell.th = th;
      headsTrack.append(cell);
      return cell;
    });
    positionHeads();
  }

  function positionHeads() {
    const track = headsTrack.getBoundingClientRect();
    for (const cell of headCells) {
      const box = cell.th.getBoundingClientRect();
      cell.style.setProperty('left', `${Math.round((box.left - track.left) * 10) / 10}px`);
      cell.style.setProperty('width', `${Math.round(box.width * 10) / 10}px`);
    }
  }

  let headFrame = 0;
  const positionSoon = () => {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(headFrame);
    headFrame = requestAnimationFrame(positionHeads);
  };
  boardScroll.addEventListener('scroll', positionSoon, { passive: true });
  if (typeof window.addEventListener === 'function') window.addEventListener('resize', positionSoon);
  if (typeof ResizeObserver === 'function') new ResizeObserver(positionSoon).observe(boardTable);
  // The lettering and the words arrive a moment after the first paint and change the columns' widths.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionSoon);
  if (narrowQuery && typeof narrowQuery.addEventListener === 'function') {
    narrowQuery.addEventListener('change', () => {
      if (drill) renderBoard();
    });
  }

  function renderBoard() {
    const words = boardBox.dataset;
    const words3 = templates();
    const table = band === TABLE || boardMode() === 'all';
    const rows = shapes.boardRows(shell, table ? TABLE : band);
    const two = !table && band === 1; // the six that never join forward: two shapes, not four
    const columns = two ? ['isolated', 'joined'] : ['isolated', 'initial', 'medial', 'final'];
    const heading = (column) => words[`col${column[0].toUpperCase()}${column.slice(1)}`] || '';
    const demoShown = !table;

    closePeekNow();
    boardTable.textContent = '';
    boardScroll.setAttribute('aria-label', words.region || '');

    const caption = el('caption', 'sr-only', words.caption || '');
    // The last column's heading says what it is: three shapes together, or a letter between two others.
    const demoHeading = two ? words.demoGap : words.demo;
    // The real headings are in the table, for a screen reader, and are visually empty: the ones the eye reads are the
    // sticky bar above the table (positionHeads), which stays in view while the shapes scroll.
    // On a phone the name would take a fifth of the width, and four tiles and the example do not fit beside it without
    // scrolling sideways. So each letter's name goes on a line of its own above its shapes, and the columns are shapes only.
    const stacked = isNarrow() && demoShown;
    const across = columns.length + (demoShown ? 1 : 0);

    const head = el('thead');
    const headRow = el('tr');
    const headings = [];
    const addHeading = (text) => {
      const th = el('th');
      th.scope = 'col';
      th.append(el('span', 'sr-only', text || ''));
      headRow.append(th);
      headings.push({ text: text || '', th });
    };
    if (!stacked) addHeading(words.colLetter);
    for (const column of columns) addHeading(heading(column));
    if (demoShown) addHeading(demoHeading);
    head.append(headRow);

    const body = el('tbody');
    const groups = []; // stacked: one body per letter, its name row and its shapes row
    const nameCell = (row) => {
      const th = el('th');
      th.scope = 'row';
      const label = el('span', 'row-name', row.name);
      label.dir = 'ltr';
      th.append(label);
      return th;
    };
    // The row the shapes go in. Beside the name, or (on a phone) under it.
    const startRow = (row, i) => {
      const tr = el('tr');
      tr.style.setProperty('--i', i);
      if (!stacked) {
        tr.append(nameCell(row));
        body.append(tr);
        return tr;
      }
      const group = el('tbody', 'letter-group');
      const top = el('tr', 'name-row');
      top.style.setProperty('--i', i);
      const th = nameCell(row);
      th.scope = 'rowgroup';
      th.colSpan = across;
      top.append(th);
      group.append(top, tr);
      groups.push(group);
      return tr;
    };

    rows.forEach((row, i) => {
      const tr = startRow(row, i);

      for (const column of columns) {
        const backOnly = row.cls === 'back-only';
        // In the table's four columns the joined shape of a back-only letter sits under "end of a word", which is where
        // it is used; the two before it are empty, and say so, so nobody counts two pairs of identical pictures.
        const key = two ? column : table && backOnly && column === 'final' ? 'joined' : column;
        const glyph = row.cells[key];
        if (glyph == null || (table && backOnly && (column === 'initial' || column === 'medial'))) {
          const none = el('td', 'none');
          const dash = el('span', '', '—');
          dash.setAttribute('aria-hidden', 'true');
          none.append(el('span', 'sr-only', words.noneCell || ''), dash);
          tr.append(none);
          continue;
        }
        const form = key === 'joined' ? 'joined' : column;
        tr.append(shapeTile(row, form, glyph, fill(words3[form], { name: row.name }), heading(column)));
      }

      if (demoShown) {
        const cell = el('td', 'demo');
        if (row.demo) {
          const g = el('span', 'glyph', row.demo);
          g.lang = 'ar';
          g.dir = 'rtl';
          g.setAttribute('aria-hidden', 'true');
          cell.append(g, el('span', 'sr-only', demoHeading || ''));
        }
        tr.append(cell);
      }
    });

    // ء has one shape and nothing to tell apart, so it gets a line of its own and never a question.
    if (two) {
      const found = shell.lettersOf().find(([glyph]) => shell.keyOf(glyph) === 'ء');
      if (found) {
        const row = shapes.rowFor(shell, found[0], found[1]);
        const tr = startRow(row, rows.length);
        tr.append(shapeTile(row, 'isolated', row.cells.isolated, fill(words3.isolated, { name: row.name }), heading('isolated')));
        const note = el('td', 'hamzah', fill(words.hamzah, { name: row.name }));
        note.colSpan = columns.length; // its own line: the rest of the row, the demo's column included
        note.dir = 'ltr'; // an English sentence in a right-to-left table would put its full stop on the wrong side
        tr.append(note);
      }
    }
    boardTable.append(caption, head, ...(stacked ? groups : [body]));
    boardTable.dataset.table = table ? 'all' : 'band';
    boardTable.toggleAttribute('data-stacked', stacked);
    buildHeads(headings);

    const notes = [];
    if (!table && band === 1) notes.push(words.nofwd);
    if (!table && band === 2) notes.push(words.nochange);
    if (demoShown) notes.push(two ? words.demoNoteGap : words.demoNote);
    boardNote.textContent = notes.filter(Boolean).join(' ');
    boardNote.hidden = notes.every((text) => !text);
    paintMissed();
  }

  function closePeekNow() {
    if (peeked) closePeek(peeked);
  }

  // The board's rows arrive 35ms apart on a new group, and leave at 150ms; not under reduced motion.
  function replayBoard() {
    boardTable.classList.remove('arrive');
    void boardTable.offsetWidth; // start the animation again
    boardTable.classList.add('arrive');
    clearTimeout(replayBoard.timer);
    replayBoard.timer = setTimeout(() => boardTable.classList.remove('arrive'), 150 + 30 * 35 + 900);
  }

  let boardBuilt = false;
  function swapBoard(paint) {
    clearTimeout(swapBoard.timer);
    if (!boardBuilt || still()) {
      boardBuilt = true;
      paint();
      if (!still()) replayBoard();
      return;
    }
    boardScroll.classList.add('leaving');
    swapBoard.timer = setTimeout(() => {
      paint();
      boardScroll.classList.remove('leaving');
      replayBoard();
    }, 150);
  }

  // The shape just missed keeps a gold edge, so the eye goes back to the teaching half and not only to the correction.
  function paintMissed() {
    for (const tile of boardTable.querySelectorAll('.letter')) tile.toggleAttribute('data-missed', tile.dataset.id === missedId);
  }

  // A question, on the board -------------------------------------------------------------------------

  const recorded = (item) => Boolean(audio() && audio().has(item.audio.kind, item.audio.glyph));

  // The three ways to ask (docs/lesson-3/03 §3): Lesson 2's three, with different items behind them. Hearing a letter
  // narrows the answer to that letter's shapes and no further, so it is only asked when the wrong answers are other
  // letters; it is off by default until the teacher has heard it.
  const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: () => true };
  const NAME_TO_FORM = { id: 'name-to-form', ask: 'name', answerWith: 'glyph', minStreak: 1, available: () => true };
  const SOUND_TO_FORM = {
    id: 'sound-to-form',
    ask: 'sound',
    answerWith: 'glyph',
    minStreak: 1,
    available: (item) => recorded(item) && distractors() !== 'same-letter',
  };

  // Mixed, a shape is first named from its picture; only once that has been answered is it asked the other way round.
  function formatsFor(kind) {
    if (kind === 'name') return [{ ...NAME_TO_FORM, minStreak: 0 }];
    if (kind === 'sound') return [{ ...SOUND_TO_FORM, minStreak: 0 }];
    if (kind === 'mix') return [FORM_TO_NAME, NAME_TO_FORM, SOUND_TO_FORM];
    return [FORM_TO_NAME];
  }

  function buildPrompt(q) {
    prompt.textContent = '';
    prompt.dataset.mode = q.prompt.mode;
    if (q.prompt.mode === 'glyph') {
      const shown = el('span', 'prompt-glyph', q.prompt.glyph);
      shown.lang = 'ar';
      shown.dir = 'rtl';
      // A joined form reads out as a letter in invisible joiners; the choices carry the names.
      shown.setAttribute('aria-hidden', 'true');
      prompt.append(shown);
    } else if (q.prompt.mode === 'name') {
      prompt.append(el('span', 'prompt-name', q.prompt.name));
    } else {
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'button play';
      play.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9.5h3.5L12.5 6v12L8 14.5H4.5z" />' +
        '<path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" /></svg><span></span>';
      play.addEventListener('click', () => {
        if (audio() && view.question) audio().play(view.question.prompt.audio.kind, view.question.prompt.audio.glyph);
      });
      prompt.append(play);
    }
  }

  function buildChoices(q) {
    const face = q.format.answerWith === 'glyph' ? 'glyph' : 'name';
    choicesBox.textContent = '';
    choicesBox.dataset.face = face;
    // Two across on a narrow screen and one row on a wide one, for four; three stay three; six are three and three.
    choicesBox.style.setProperty('--cols', q.choices.length === 3 ? 3 : 2);
    choicesBox.style.setProperty('--cols-wide', q.choices.length === 6 ? 3 : q.choices.length);

    q.choices.forEach((item, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.id = item.id;
      button.dataset.face = face;
      button.style.setProperty('--i', i);
      const inner = document.createElement('span');
      if (face === 'glyph') {
        // Named by the shape's name, with the shape itself hidden from a screen reader: the same as Lesson 2's tiles.
        inner.className = 'choice-glyph';
        inner.lang = 'ar';
        inner.dir = 'rtl';
        inner.setAttribute('aria-hidden', 'true');
        inner.textContent = item.glyph;
      } else {
        inner.className = 'choice-name';
        inner.textContent = item.name;
      }
      button.append(inner);
      choicesBox.append(button);
    });
    labelChoices();
  }

  // The names can be edited in the options panel while a question is up, so the labels are set apart from the building.
  function labelChoices() {
    for (const button of choicesBox.children) {
      const item = byId.get(button.dataset.id);
      if (!item) continue;
      if (button.dataset.face === 'glyph') button.setAttribute('aria-label', item.name);
      else button.firstChild.textContent = item.name;
    }
  }

  function paintQuestion() {
    const q = view.question;
    if (!q) return;
    const text = { glyph: askLine.dataset.glyph, name: askLine.dataset.name, sound: askLine.dataset.sound }[q.prompt.mode];
    askLine.textContent = fill(text, { name: q.item.name });
    const play = prompt.querySelector('.play span');
    if (play) play.textContent = prompt.dataset.play;
  }

  function showQuestion(q) {
    clearTimeout(advanceTimer);
    clearTimeout(swapTimer);
    const sameQuestion = view.question && view.question.n === q.n; // the choices dealt again, not a new question
    const swap = () => {
      // Whatever has happened in the 150ms, the board shows the engine's question, not the one this call was told of.
      const now = drill.question;
      if (!now) return;
      view.question = now;
      view.verdict = null;
      verdictLine.textContent = '';
      after.hidden = true;
      if (missedId) {
        missedId = '';
        paintMissed();
      }
      buildPrompt(now);
      buildChoices(now);
      paintQuestion();
      if (announced !== now.n) {
        announced = now.n;
        announce.textContent = fill(announce.dataset.template, { n: now.n });
      }
      drillBox.classList.remove('leaving');
      if (view.focusChoice) {
        view.focusChoice = false;
        const first = choicesBox.querySelector('.choice');
        if (first) first.focus({ preventScroll: true });
      }
    };

    // The old question fades out and the new one in. Not under reduced motion, and not on the first question.
    if (view.question && !sameQuestion && !still()) {
      drillBox.classList.add('leaving');
      swapTimer = setTimeout(swap, 150);
    } else {
      swap();
    }
  }

  // An answer ---------------------------------------------------------------------------------------

  function paintVerdict() {
    const v = view.verdict;
    if (!v) return;
    // A wrong answer names BOTH shapes on purpose: here the two are usually the same letter in different places, and
    // saying only the right one would leave the student not knowing what they had picked.
    verdictLine.textContent = fill(v.right ? verdictLine.dataset.right : verdictLine.dataset.wrong, {
      name: v.item.name,
      chosen: v.chosen.name,
    });
    after.querySelector('.after-glyph').textContent = v.item.glyph;
    after.querySelector('.after-name').textContent = v.item.name;
  }

  function showVerdict(v) {
    view.verdict = v;
    for (const button of choicesBox.children) {
      const id = button.dataset.id;
      // Gold against dim, and a tick on the right one: never a failure colour, and never colour alone.
      button.dataset.verdict = id === v.item.id ? 'right' : id === v.chosen.id ? 'wrong' : 'dim';
      button.setAttribute('aria-disabled', 'true');
    }
    paintVerdict();

    if (!v.right) {
      missedId = v.item.id;
      paintMissed();
    }

    // Seeing the shape and hearing its letter are the same moment. Nothing plays if the sound is off.
    if (audio() && v.item.audio) audio().play(v.item.audio.kind, v.item.audio.glyph);

    // A wrong answer never moves on by itself: the student decides when they have finished looking at it. A right one
    // does, for a pointer — but moving focus out from under a keyboard is the classic drill bug, so from the keyboard
    // it waits for Next.
    const waits = !v.right || view.input === 'key' || root.dataset.advance === 'wait';
    after.dataset.kind = v.right ? 'right' : 'wrong';
    after.hidden = !waits;
    if (waits) {
      after.querySelector('.next-question').focus({ preventScroll: true });
    } else {
      advanceTimer = setTimeout(() => drill.next(), pause);
    }
  }

  choicesBox.addEventListener('click', (event) => {
    const button = event.target.closest('.choice');
    const q = drill && drill.question;
    // Not while the old question is still fading: its buttons would answer the new one.
    if (!button || !q || q.answered || drillBox.classList.contains('leaving')) return;
    // Enter and Space arrive as a click with no pointer behind it.
    view.input = event.detail === 0 ? 'key' : 'pointer';
    drill.answer(button.dataset.id);
  });

  after.querySelector('.next-question').addEventListener('click', () => {
    view.focusChoice = true;
    drill.next();
  });

  after.querySelector('.hear').addEventListener('click', () => {
    const v = view.verdict;
    if (v && audio() && v.item.audio) audio().play(v.item.audio.kind, v.item.audio.glyph);
  });

  // The writing board opens on the ISOLATED letter, not the joined shape: a joiner draws a stray connecting stroke that a
  // student would faithfully copy, and a beginner writes the body of a letter first (docs/lesson-3/06 §4).
  const trace = (item) => {
    if (item && window.qaidaTrace) window.qaidaTrace.open(item.base, item.letterName || item.name);
  };
  after.querySelector('.trace').addEventListener('click', () => trace(view.verdict && view.verdict.item));
  struggle.querySelector('.trace').addEventListener('click', () => trace(view.struggling));

  // "Show me": back up to the teaching half, with that shape marked.
  struggle.querySelector('.show-me').addEventListener('click', () => {
    if (view.struggling) {
      missedId = view.struggling.id;
      paintMissed();
    }
    boardTitle.focus({ preventScroll: true });
    boardBox.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  });

  // The advice, and the end of the lesson -----------------------------------------------------------------

  function paintAdvice() {
    if (view.struggling) {
      struggleText.textContent = fill(struggleText.dataset.template, { name: view.struggling.name });
    }
    struggle.hidden = !view.struggling;

    // A recommendation, never a gate: it says the group is known, and nothing unlocks or stops.
    const all = allReady();
    const here = band !== TABLE && stat(band).ready;
    readyNote.textContent = all ? readyNote.dataset.templateLesson : readyNote.dataset.template;
    readyNote.hidden = !(all || here);
  }

  function paintFinished() {
    const done = shell.isDone(LESSON);
    lesson.classList.toggle('complete', done);
    endLine.textContent = done ? endLine.dataset.after : endLine.dataset.before;
  }

  function onStruggling(item) {
    view.struggling = item;
    paintAdvice();
  }

  function onError(code) {
    // An honest line, never a broken board.
    view.question = null;
    prompt.textContent = '';
    choicesBox.textContent = '';
    askLine.textContent = '';
    after.hidden = true;
    verdictLine.textContent = code === 'formats' ? soundNote.dataset.none : verdictLine.dataset.error;
  }

  // Which groups have just become ready. The engine's own `ready` fires once a visit and so cannot tell group 3 from group
  // 4 after `setItems`; every group is measured here instead. A group already ready on the way in is not congratulated.
  function watchReady(quiet) {
    let crossed = 0;
    for (const n of shapes.DRILLING) {
      const now = stat(n).ready;
      if (now && !ready.has(n)) {
        ready.add(n);
        if (n === band) crossed = n;
      }
      if (!now) ready.delete(n);
    }
    const wasDone = shell.isDone(LESSON);
    if (allReady()) shell.setDone(LESSON, true);
    if (quiet) return;

    // Once, not forever: the class comes off again, and the star turns in a single time (the step-1 bug on the record).
    if (crossed) {
      const button = bandsList.querySelector(`[data-band="${crossed}"]`);
      if (button) {
        button.classList.add('just-ready');
        setTimeout(() => button.classList.remove('just-ready'), 900);
      }
    }
    if (!wasDone && shell.isDone(LESSON)) {
      lesson.classList.add('just-finished');
      clearTimeout(watchReady.timer);
      watchReady.timer = setTimeout(() => lesson.classList.remove('just-finished'), 2600);
    }
  }

  // Progress ---------------------------------------------------------------------------------------

  let armed = 0; // "Start again" asks once more before clearing

  function disarm() {
    clearTimeout(armed);
    armed = 0;
    reset.textContent = reset.dataset.label;
  }

  // No counts on the page (the user, 2026-09-20: they produce stress). The bar is the whole lesson and a few plain words say
  // how it is going; the line under it appears only when the open group is done. The numbers still drive the bar, the rail's
  // fills and the home's card; they are just not shown.
  const stageOf = (fraction) => (fraction <= 0 ? 0 : fraction < 0.4 ? 1 : fraction < 0.75 ? 2 : fraction < 1 ? 3 : 4);

  function paintProgress() {
    if (!drill) return;
    // The engine writes the size of the OPEN GROUP as the lesson's total, because that is all it was handed. The home
    // reads that number to draw its card, so the whole lesson's is put back here (docs/lesson-3/03 §2).
    shell.setDrillTotal(LESSON, items.length, target());

    const total = items.length;
    const known = lessonKnown();
    progressText.textContent = progressText.dataset[`stage${stageOf(total ? known / total : 0)}`] || '';
    bar.style.setProperty('--p', total ? known / total : 0);
    bar.style.setProperty('--total', total);
    bar.setAttribute('aria-valuenow', known);
    bar.setAttribute('aria-valuemax', total);
    // Read aloud as the words on the page, not as a bare number.
    bar.setAttribute('aria-valuetext', progressText.textContent);

    const p = drill.progress();
    const groupDone = band !== TABLE && p.total > 0 && p.known === p.total;
    bandLine.textContent = groupDone ? bandLine.dataset.done : '';
    bandLine.hidden = !groupDone;
    const record = shell.drillOf(LESSON);
    reset.hidden = Object.keys(record.right).length + Object.keys(record.wrong).length === 0;
    if (!armed) reset.textContent = reset.dataset.label;

    // A shape the advice was about, once it is known again, no longer needs the advice.
    if (view.struggling && (record.streak[view.struggling.id] || 0) >= target()) view.struggling = null;

    watchReady(false);
    paintRail();
    paintAdvice();
    paintFinished();
  }

  function clear() {
    shell.clearLesson(LESSON);
    view.struggling = null;
    ready.clear();
    advised = false;
    drill.reset();
    setBand(1);
  }

  reset.addEventListener('click', () => {
    if (!armed) {
      reset.textContent = reset.dataset.confirm;
      armed = setTimeout(disarm, 3000);
      return;
    }
    disarm();
    clear();
  });

  next.addEventListener('click', () => { location.href = 'lesson-4.html'; }); // Lesson 4 exists now: a way in, not a note

  function paintNext() {
    const entry = shell.LESSONS.find((lessonEntry) => lessonEntry.n === 4);
    const title = entry ? entry.title[shell.state.names === 'zabar' ? 'zabar' : 'fatha'] : '';
    next.querySelector('span').textContent = fill(next.dataset.lead, { n: 4, title });
  }

  // Sound ------------------------------------------------------------------------------------------

  // A recording belongs to a letter, so the count is of letters. They arrive a few at a time; one honest line says
  // where things have got to.
  function paintSound() {
    if (!soundNote || !audio()) return;
    const letters = shell.lettersOf();
    const count = letters.filter(([glyph]) => audio().has('letters', glyph)).length;
    soundNote.hidden = count === letters.length;
    soundNote.textContent = count === 0 ? soundNote.dataset.none : soundNote.dataset.some;
  }

  // Drawing it all ---------------------------------------------------------------------------------

  function replay() {
    choicesBox.classList.remove('arrive');
    void choicesBox.offsetWidth; // start the animation again
    choicesBox.classList.add('arrive');
    clearTimeout(replay.timer);
    replay.timer = setTimeout(() => choicesBox.classList.remove('arrive'), 150 + 6 * 40 + 900);
    replayBoard();
  }

  const shapeOf = () => `${shell.state.script}|${drilled()}|${distractors()}`;

  function build() {
    items = shapes.allItems(shell, { drilled: drilled(), templates: templates(), distractors: distractors() });
    pool = shapes.poolFor(items, band);
    byId = new Map(pool.map((item) => [item.id, item]));
  }

  // Seen quietly: whatever is already ready on the way in, or after the shapes changed, is not "just now".
  function seedReady() {
    ready.clear();
    for (const n of shapes.DRILLING) if (stat(n).ready) ready.add(n);
  }

  function render() {
    const wanted = shapeOf();
    if (!drill) {
      build();
      shape = wanted;
      band = upTo();
      root.dataset.band = String(band);
      pool = shapes.poolFor(items, band);
      byId = new Map(pool.map((item) => [item.id, item]));
      seedReady();
      buildRail();
      drill = engine.create({
        lesson: LESSON,
        items: pool,
        formats: formatsFor(mode),
        choices: Number(root.dataset.choices) || 4,
        familyFirst: distractors() !== 'any',
        on: {
          question: showQuestion,
          verdict: showVerdict,
          progress: paintProgress,
          struggling: onStruggling,
          error: onError,
        },
      });
      swapBoard(() => renderBoard());
      drill.start();
      replay();
    } else if (wanted !== shape) {
      // A new script, another way of drilling or of choosing wrong answers: a different set of shapes, and a fresh
      // question to show it. What was learnt is kept under each id, so switching script keeps every form known.
      build();
      shape = wanted;
      view.struggling = null;
      seedReady();
      drill.set({ familyFirst: distractors() !== 'any' });
      drill.setItems(pool);
      renderBoard();
    } else {
      // Only the names changed (or a line of wording): the same shapes, so the same items with new names.
      shapes.rename(items, shell, templates());
      shapes.rename(pool, shell, templates());
      labelChoices();
      renderBoard();
    }

    paintQuestion();
    paintVerdict();
    paintRail();
    paintProgress();
    paintFinished();
    paintAdvice();
    paintSound();
    paintNext();
  }

  shell.onChange(render);
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // The manifest arrives a moment later; hearing practice opens for the letters that have a recording when it does.
  if (audio()) audio().ready.then(paintSound);

  // For the options panel (qaida-options.js).
  window.qaida = {
    kind: 'drill',
    render,
    replay,
    clear,
    get pause() {
      return pause;
    },
    get target() {
      return target();
    },
    get readyAt() {
      return readyAt();
    },
    get band() {
      return band;
    },
    setPause(ms) {
      pause = ms;
    },
    setFormat(kind) {
      mode = kind === 'glyph' ? 'form' : kind;
      drill.set({ formats: formatsFor(mode) });
    },
    setChoices: (n) => drill.set({ choices: n }),
    setTarget: (n) => drill.set({ target: n }),
    setReadyAt: (fraction) => drill.set({ readyAt: fraction }),
    set: (partial) => drill.set(partial),
    // Any group, at any time: nothing is locked.
    setBand: (n) => setBand(n),
    // What each group costs, so the options panel can show the teacher the numbers before asking.
    bandTotals: () => shapes.sizes(items),
    // Only the new shapes, or every position of every letter (docs/lesson-3/07 §3). The option has set the attribute.
    setDrilled: () => render(),
    setDistractors: () => render(),
    // A new question even if this one is unanswered: for trying things, so it leaves no mark on the shape.
    next: () => drill.next(true),
    again: () => drill.again(),
    masterAll: () => drill.masterAll(),
    get sound() {
      return shell.lettersOf().filter(([glyph]) => audio() && audio().has('letters', glyph)).length;
    },
  };
})();
