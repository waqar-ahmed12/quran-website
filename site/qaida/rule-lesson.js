// The free Qaida, Lesson 16 onward: the RULE page. QAIDA-BUILD.md step P2; the specification is docs/lesson-16/
// (03 is this file). `<html data-rule="hamza">` says which rule this page teaches, as `data-mark` says which stroke a mark
// lesson teaches. Which forms there are, their ids and how each is drawn is rules.js. What to ask next, what counts as
// known and when to say "you seem ready" is practice.js, unchanged.
//
// THE DRILL HALF OF mark-lesson.js IS COPIED HERE, NOT SHARED (docs/lesson-16/03 §1). Extracting it would mean editing
// mark-lesson.js, which twelve lessons stand on, to serve one that does not exist yet. A later step extracts the shared
// half once Lesson 18 shows what really is shared, and it runs behind the same fence (tools/qaida-check.js). Copied, with
// the names changed where they said "mark": the question and its choices, the verdict, the strip under it (Hear it,
// Say it, Write it, Next), the advice, the rail, the progress bar, the finish, Previous and Next, and the window.qaida
// object the options panel reads. New: the grid board, the seat strip, and the line under a wrong answer.
//
// There is no halo (docs/lesson-16/03 §5): a ring on the vowel would say the vowel is the point, and this lesson is
// about the part that is not read. The wording never scolds; nothing is locked; no numbers on the page.

(() => {
  const shell = window.qaidaShell;
  const engine = window.qaidaPractice;
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!shell || !engine || !marks || !rules) return;

  const root = document.documentElement;
  const rule = rules.RULES[root.dataset.rule];
  // Everything a rule decides is in its kit (docs/lesson-17/01 §3): the hamza's is in rules.js, and the round taa and the end yaa's
  // is registered by ends.js. This page never reads a rule's own functions, so a third rule is one more entry and no edit here.
  const kit = rule && rules.KITS[rule.id];
  if (!rule || !kit) return;

  const LESSON = rule.lesson;
  const LAST = rule.parts;
  const DRILLING = kit.partsOf(rule).map((p) => p.n);
  const $ = (selector) => document.querySelector(selector);

  const lesson = $('.lesson');
  const bandsNav = $('.bands');
  const bandsList = $('.bands ol');
  const bandAdvice = $('.band-advice');
  const bandAdviceText = $('.band-advice .struggle-text');
  const bandAnnounce = $('.band-announce');
  const heading = $('h1');
  const titleMark = $('.title-mark');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const bandLine = $('.band-line');
  const reset = $('.reset');
  const soundNote = $('.sound-note');
  const boardBox = $('.marks-board');
  const boardTitle = $('.board-title');
  const seatStrip = $('.seat-strip');
  const seatNote = $('.seat-note');
  const gridBox = $('.rule-grid');
  const sameLine = $('.same-line');
  const scriptLine = $('.script-line');
  const leadLine = $('.lead-line');
  const drillBox = $('.drill');
  const askLine = $('.ask');
  const prompt = $('.prompt');
  const choicesBox = $('.choices');
  const verdictLine = $('.verdict');
  const seatEcho = $('.seat-echo');
  const announce = $('.announce');
  const after = $('.after');
  const struggle = $('.advice .struggle');
  const struggleText = $('.advice .struggle-text');
  const readyNote = $('.ready-note');
  const adviceBox = $('.advice');
  const practiseButton = $('.practise');
  const drillTitle = $('#drill-title');
  const wordsBox = $('[data-name-form], [data-name-taa], [data-name-moon], [data-name-start], [data-name-plain], [data-name-plural], [data-name-vowel]'); // the hidden span that holds the names' templates: each rule's own words
  const sunLettersLine = $('.sun-letters'); // Lesson 18 only: the fourteen sun letters, once
  const endLine = $('.end-line');
  const next = $('.next');
  const prev = $('.prev');

  const audio = () => window.qaidaAudio;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = marks.fill;

  const view = {
    question: null,
    verdict: null,
    struggling: null, // the one form the advice is about
    input: 'pointer', // how the last answer was given: a right answer only moves on by itself for a pointer
    focusChoice: false, // Next was pressed, so the keyboard belongs on the first choice of the new question
  };

  let drill = null;
  let items = []; // the whole lesson: all fifteen forms, whatever part is open
  let pool = []; // what the drill is handed: the open part's forms
  let byId = new Map();
  let shape = ''; // which script the items on screen were built for
  let group = 1;
  let mode = kit.byEar ? 'mix' : 'form';
  let pause = 900; // how long a right answer stays before the next question, for a pointer
  let advanceTimer = 0;
  let swapTimer = 0;
  let announced = 0;
  let advised = false; // the "this part comes later" line is shown once a visit, not every time
  let missedId = ''; // the form just missed keeps a gold edge on the board until the next question
  let rowMark = kit.firstRow ? kit.firstRow(1) : 'fatha'; // the row the same-sound line is about: the one last tapped
  const ready = new Set(); // the parts already known to be ready, so "you seem to know this" fires once, on the way in

  const target = () => (drill ? drill.settings.target : 2);
  const readyAt = () => (drill ? drill.settings.readyAt : 0.7);

  // Words -------------------------------------------------------------------------------------------

  const templates = () => kit.templatesOf(wordsBox.dataset);

  // {jazam} and {lead} are the student's own words for the jazam and for the vowel on the lead's baa, so a line that names
  // either does not have to know which set of names is showing (the same two tokens as Lesson 15's page).
  // {standing} is Lesson 9's khari zabar, which Lesson 17's Indo-Pak line names. {fatha}, {kasra} and {damma} are the student's own
  // words for the three vowels, which Lesson 19's lines name (a word is started with one of them).
  const say = (text, values = {}) => fill(text, {
    jazam: marks.nameOf(marks.markOf('sukun'), shell), lead: marks.nameOf(marks.markOf('fatha'), shell),
    standing: marks.nameOf(marks.markOf('standing-fatha'), shell),
    fatha: marks.nameOf(marks.markOf('fatha'), shell), kasra: marks.nameOf(marks.markOf('kasra'), shell),
    damma: marks.nameOf(marks.markOf('damma'), shell), ...values,
  });
  const pascalOf = (id) => id.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
  const groupName = (n) => bandsNav.dataset[`group${n}`] || '';
  // A board line a script may have its own of (Lesson 22: the "better to stop" sign is a small "qalaa" in Madani and a small taa in Indo-Pak): the
  // key with `Madani` or `Indopak` after it where the page has one, and the plain key where it does not, which is every earlier lesson's every line.
  const ownLine = (d, key) => d[`${key}${shell.state.script === 'indopak' ? 'Indopak' : 'Madani'}`] || d[key] || '';

  // The parts ---------------------------------------------------------------------------------------

  // A rule with a board of its own (Lesson 17's) keeps the same-sound line on a row that is in the open part: the end yaa's rows
  // are not on part 1's half of the board, so a line about them would say nothing there. The hamza's rows are on every part.
  function keepRow() {
    if (kit.rowInPart && !kit.rowInPart(rowMark, group)) rowMark = kit.firstRow(group);
  }

  const stat =(n) => rules.stats(shell, LESSON, items, n, { target: target(), readyAt: readyAt() });
  // The lesson is ready when the last part is: every form at seven tenths, with nothing shaky.
  const allReady = () => stat(LAST).ready;

  // The part the student is up to: the first one not yet ready.
  function upTo() {
    for (const n of DRILLING) if (!stat(n).ready) return n;
    return LAST;
  }

  function lessonKnown() {
    const record = shell.drillOf(LESSON);
    return items.filter((item) => (record.streak[item.id] || 0) >= target()).length;
  }

  // The rail, once; paintRail() keeps it up to date without rebuilding it, so a button never loses the keyboard.
  function buildRail() {
    bandsList.textContent = '';
    for (const n of DRILLING) {
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
      button.addEventListener('click', () => setGroup(n, { user: true }));
      item.append(button);
      bandsList.append(item);
    }
  }

  function paintRail() {
    const words = bandsNav.dataset;
    for (const button of bandsList.querySelectorAll('.band')) {
      const n = Number(button.dataset.band);
      const s = stat(n);
      const done = s.ready;
      const now = n === group;
      const state = now ? words.groupNow : done ? words.groupDone : n > group ? words.groupLater : '';
      const name = groupName(n);

      button.dataset.state = now ? 'now' : done ? 'done' : n > group ? 'later' : 'past';
      button.toggleAttribute('data-done', done);
      if (now) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      button.querySelector('.band-n').textContent = String(n);
      button.querySelector('.band-glyph').textContent = kit.sampleOf(n);
      button.querySelector('.band-name').textContent = name;
      button.querySelector('.band-state').textContent = state || '';
      button.style.setProperty('--p', s.total ? s.known / s.total : 0);
      // The name of the state is in the label, so it does not depend on the gold.
      button.setAttribute('aria-label', say(words.groupLabel, { n, name, state }).replace(/\s+/g, ' ').trim());
    }
  }

  // The pool for one part: its forms, all required. There is nothing riding along: no twins, no bare letters. The four
  // seats ARE the look-alikes, and the drill's wrong answers are the other marks (docs/lesson-16/03 §3).
  const poolOf = (n) => rules.poolFor(items, n);

  // How many questions must pass before the same form can come back: most of the pool, so every form has been asked before
  // any returns (Lesson 4's own rule). A form just missed still comes back sooner, on purpose (`cooldown`).
  const spreadFor = (count) => Math.max(1, Math.min(8, count - 2));

  // A rule whose part holds one answer alone (Lesson 18's moon words: only "the laam is read") hands the drill the words that ride
  // along, not required: they are the other answer, and they count for nothing toward a part being ready (`kit.ridersOf`).
  function usePool(n) {
    const riders = kit.ridersOf ? kit.ridersOf(items, n) : [];
    pool = poolOf(n).concat(riders.map((item) => ({ ...item, required: false })));
    byId = new Map(pool.map((item) => [item.id, item]));
    if (drill) drill.set({ noRepeatWithin: spreadFor(pool.length) });
  }

  // Which part a student is in changes what is on the board and what the drill is asking about, and nothing else. `user` is
  // a tap on the rail: only that moves the keyboard and only that can be told "this part comes later".
  function setGroup(wanted, { user = false } = {}) {
    const n = Math.min(LAST, Math.max(1, Math.round(Number(wanted)) || 1));
    const early = user && n !== group && n > upTo();
    // Measured before anything on the page changes: has the student scrolled down past the start of the board?
    const scrolledPast = user && boardBox.getBoundingClientRect().top < railBottom();
    clearTimeout(advanceTimer);
    clearTimeout(swapTimer);
    group = n;
    keepRow();
    root.dataset.group = String(n);
    root.dataset.band = String(n); // the stylesheet's hook for the rail and the taller prompt
    view.struggling = null;
    view.verdict = null;
    drillBox.classList.remove('leaving');

    usePool(n);
    drill.setItems(pool);

    // Advice, said once, and never again for the rest of the visit.
    const words = bandsNav.dataset;
    const advise = early && !advised;
    if (advise) advised = true;
    bandAdvice.hidden = !advise;
    bandAdviceText.textContent = advise ? words.groupEarly : '';

    swapBoard(() => {
      renderBoard();
      // The page glides up once the new forms are in place: asked for earlier, the change in height cancels it.
      if (scrolledPast) {
        const glide = () => boardBox.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
        if (still()) glide();
        else requestAnimationFrame(glide);
      }
    });
    paintRail();
    paintAdvice();
    paintProgress();

    const line = say(words.groupAnnounce, { n, name: groupName(n) });
    bandAnnounce.textContent = advise ? `${line} ${words.groupEarly}` : line;

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

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const arabic = (node) => {
    node.lang = 'ar';
    node.dir = 'rtl';
    node.setAttribute('aria-hidden', 'true');
    return node;
  };

  const formOf = (seat, mark) => rules.formsOf().find((form) => form.seat === seat && form.mark === mark);
  const itemOf = (form) => items.find((item) => item.id === kit.idOf(form));
  const markName = (mark) => marks.nameOf(marks.markOf(mark), shell);

  // Tap a cell and it is said: the form's own recording (a hamza with zabar plays Lesson 4's alif sound, and so on: the seat is
  // never read, so every seat of a mark plays the same thing). Where there is none yet the stand-in plays, as everywhere.
  function peekTile(tile) {
    clearTimeout(tile.timer);
    tile.classList.add('peek');
    tile.timer = setTimeout(() => tile.classList.remove('peek'), 700);
    if (audio() && tile.dataset.audio) audio().play(tile.dataset.audio, tile.dataset.base);
  }

  // A form as a tile. Its button carries the name and the glyph is hidden from a screen reader: a combining mark is not
  // reliably announced (docs/lesson-4/06 §1), so the name is built from the same template the sighted student reads.
  function formTile(form, label) {
    const button = el('button', 'letter mark-tile rule-cell');
    button.type = 'button';
    const spoken = kit.audioOf(form);
    button.dataset.id = kit.idOf(form);
    // `row` is what the board's line follows: a mark on the hamza's grid (its own `mark`), the shape's row on Lesson 17's.
    button.dataset.mark = form.row || form.mark;
    if (form.seat) button.dataset.seat = form.seat;
    button.dataset.audio = spoken.kind;
    button.dataset.base = spoken.glyph;
    button.setAttribute('aria-label', label);
    button.append(arabic(el('span', 'glyph', kit.drawnOf(form))));
    return button;
  }

  // The seats, each with a hamza and zabar on it. "The seat only holds the hamza up."
  function renderSeats() {
    const words = boardBox.dataset;
    seatStrip.textContent = '';
    for (const seat of rules.SEAT_ORDER) {
      const form = formOf(seat, 'fatha');
      const caption = words[`seat${pascalOf(seat)}`];
      const cell = el('div', 'pair-cell seat-cell');
      cell.setAttribute('role', 'listitem');
      const item = itemOf(form);
      cell.append(formTile(form, say(words.cellLabel, { name: item ? item.name : '', seat: words[`col${pascalOf(seat)}`] })), el('span', 'pair-caption', caption));
      cell.lastChild.setAttribute('aria-hidden', 'true');
      seatStrip.append(cell);
    }
    seatNote.textContent = say(words.seatNote);
  }

  // The grid: a row per mark, a column per seat (docs/lesson-16/03 §4). The whole map is on the board from part 1: a form whose
  // part is not yet reached is drawn dim ("comes later", the rail's own word), so the grid never changes shape and the student
  // sees where the lesson is going. A dim cell is a button all the same: nothing is locked.
  function renderGrid() {
    const words = boardBox.dataset;
    gridBox.textContent = '';
    gridBox.dataset.group = String(group);

    const head = el('div', 'rule-row rule-head');
    head.setAttribute('aria-hidden', 'true');
    for (const seat of rules.SEAT_ORDER) head.append(el('span', 'rule-col', words[`col${pascalOf(seat)}`]));
    head.append(el('span', 'rule-label'));
    gridBox.append(head);

    rules.gridOf().forEach((row, i) => {
      const line = el('div', 'rule-row');
      line.setAttribute('role', 'listitem');
      line.dataset.mark = row.mark;
      line.style.setProperty('--i', i);
      if (row.mark === rowMark) line.setAttribute('data-current', '');
      row.cells.forEach((form, at) => {
        if (!form) {
          const dash = el('span', 'rule-dash', '–');
          dash.setAttribute('aria-hidden', 'true');
          line.append(dash);
          return;
        }
        const item = itemOf(form);
        const tile = formTile(form, say(words.cellLabel, { name: item ? item.name : '', seat: words[`col${pascalOf(rules.SEAT_ORDER[at])}`] }));
        tile.dataset.state = rules.firstPartOf(form) <= group ? 'open' : 'later';
        line.append(tile);
      });
      const label = el('div', 'rule-label');
      label.setAttribute('aria-hidden', 'true');
      const template = row.mark === 'sukun' ? words.rowCaptionJazam : words.rowCaption;
      label.append(el('span', 'rule-name', say(template, { mark: markName(row.mark) })), el('span', 'rule-sound', `“${words[`sound${pascalOf(row.mark)}`]}”`));
      line.append(label);
      gridBox.append(line);
    });
    paintMissed();
  }

  // The end shapes' board (Lesson 17, docs/lesson-17/01 §4): the two shapes on their own, then a grid for each, one row per reading.
  // Every row and cell is the hamza grid's own, so the tile, the peek, the dim "comes later" and the gold edge are the same; what
  // differs is what is in them. The whole map is on the board from part 1 (a shape whose part is not open is dim, never hidden).
  function renderShapes() {
    const words = boardBox.dataset;
    seatStrip.textContent = '';
    for (const shape of kit.shapes()) {
      const cell = el('div', 'pair-cell seat-cell');
      cell.setAttribute('role', 'listitem');
      const tile = el('button', 'letter mark-tile rule-cell');
      tile.type = 'button';
      tile.dataset.shape = shape.id;
      tile.setAttribute('aria-label', words[`shape${pascalOf(shape.id)}`]);
      tile.append(arabic(el('span', 'glyph', shape.glyph)));
      cell.append(tile, el('span', 'pair-caption', words[`shape${pascalOf(shape.id)}`]));
      seatStrip.append(cell);
    }
    seatNote.textContent = say(words.seatNote);
  }

  function renderEndsGrid() {
    const words = boardBox.dataset;
    gridBox.textContent = '';
    gridBox.dataset.group = String(group);
    let n = 0;
    for (const board of kit.boards()) {
      gridBox.append(el('p', 'rule-grid-title', words[`title${pascalOf(board.id)}`]));
      if (board.heads) {
        const head = el('div', 'rule-row rule-head');
        head.setAttribute('aria-hidden', 'true');
        head.style.setProperty('--cols', board.columns);
        for (const mark of board.heads) head.append(el('span', 'rule-col', markName(mark)));
        head.append(el('span', 'rule-label'));
        gridBox.append(head);
      }
      for (const row of board.rows) {
        const line = el('div', 'rule-row');
        line.setAttribute('role', 'listitem');
        line.dataset.mark = row.row;
        line.style.setProperty('--i', n);
        line.style.setProperty('--cols', board.columns);
        n += 1;
        if (row.row === rowMark) line.setAttribute('data-current', '');
        for (const form of row.cells) {
          const item = itemOf(form);
          const tile = formTile(form, item ? item.name : '');
          tile.dataset.state = kit.firstPartOf(form) <= group ? 'open' : 'later';
          line.append(tile);
        }
        const label = el('div', 'rule-label');
        label.setAttribute('aria-hidden', 'true');
        label.append(el('span', 'rule-name', words[`row${pascalOf(row.row)}`]), el('span', 'rule-sound', words[`sound${pascalOf(row.row)}`]));
        line.append(label);
        gridBox.append(line);
      }
    }
    paintMissed();
  }

  // Lesson 18's board: the article's two words on their own, then a list of the Qur'an's words for each row (moon, sun, Allah).
  // A word is drawn from the kit's `unitsOf`, so the laam and the letter after it can be lit without touching the rest: a span
  // holding only a colour does not break Arabic joining (docs/lesson-18/01 §6, measured), and every element that holds a word is
  // aria-hidden with the name on its button, as every form's is.
  function litWord(units, className) {
    const word = arabic(el('span', className));
    for (const unit of units) {
      const node = el('span', 'unit', unit.text);
      if (unit.role) node.dataset.role = unit.role;
      word.append(node);
    }
    return word;
  }

  const verseOf = (ref) => ref.split(':').slice(0, 2).join(':');

  function wordTile(form, label) {
    const words = boardBox.dataset;
    const button = el('button', 'letter mark-tile rule-cell word-cell');
    button.type = 'button';
    // Two words (Lesson 19) need a wider tile than one.
    if (form.pair) button.classList.add('word-pair');
    const spoken = kit.audioOf(form);
    button.dataset.id = kit.idOf(form);
    button.dataset.mark = form.kind;
    // A word says itself only once the teacher has recorded it: a wordless hum on every word of the Qur'an would teach nothing.
    if (audio() && audio().has(spoken.kind, spoken.glyph)) {
      button.dataset.audio = spoken.kind;
      button.dataset.base = spoken.glyph;
    }
    button.setAttribute('aria-label', say(words.wordLabel, { name: label, verse: verseOf(form.ref) }));
    button.append(litWord(kit.unitsOf(form.ref, shell.state.script, form.kind), 'glyph'));
    // Where in the Qur'an it was copied from, small: these are its own words, never typed.
    const from = el('span', 'word-ref', verseOf(form.ref));
    from.setAttribute('aria-hidden', 'true');
    button.append(from);
    return button;
  }

  function renderSamples() {
    const words = boardBox.dataset;
    seatStrip.textContent = '';
    for (const sample of kit.samples()) {
      const cell = el('div', 'pair-cell seat-cell');
      cell.setAttribute('role', 'listitem');
      const item = items.find((it) => it.id === sample.ref);
      const tile = wordTile(sample, item ? item.name : '');
      tile.dataset.state = 'open';
      // A sample brings its own caption where one kind has several (Lesson 19's three vowels); Lesson 18's two are told by kind.
      cell.append(tile, el('span', 'pair-caption', say(words[`sample${pascalOf(sample.caption || sample.kind)}`])));
      // How the word is said at a stop (Lesson 22, docs/lesson-22/01 §4): composed by the kit, never the printed word, and labelled as said.
      if (sample.said && kit.saidUnitsOf) {
        const said = el('span', 'word-said');
        said.setAttribute('aria-hidden', 'true');
        said.append(el('span', 'word-said-label', say(words.saidLabel)), litWord(kit.saidUnitsOf(sample.ref, shell.state.script, sample.kind), 'word-said-glyph'));
        cell.append(said);
      }
      seatStrip.append(cell);
    }
    seatNote.textContent = say(words.seatNote);
  }

  function renderWordsGrid() {
    const words = boardBox.dataset;
    gridBox.textContent = '';
    gridBox.dataset.group = String(group);
    kit.boards().forEach((board, i) => {
      const title = el('p', 'rule-grid-title', say(ownLine(words, `title${pascalOf(board.id)}`)));
      // A row that is about a sign (Lesson 22's stop signs) shows the sign itself, large, as the student's own mushaf prints it.
      if (board.glyph) title.append(arabic(el('span', 'rule-sign', board.glyph())));
      gridBox.append(title);
      const line = el('div', 'word-row');
      line.setAttribute('role', 'listitem');
      line.dataset.mark = board.id;
      line.style.setProperty('--i', i);
      if (board.id === rowMark) line.setAttribute('data-current', '');
      const label = el('div', 'rule-label');
      label.setAttribute('aria-hidden', 'true');
      label.append(el('span', 'rule-name', say(ownLine(words, `row${pascalOf(board.id)}`))), el('span', 'rule-sound', say(ownLine(words, `sound${pascalOf(board.id)}`))));
      const tiles = el('div', 'word-tiles');
      for (const form of board.cells) {
        const item = itemOf(form);
        const tile = wordTile(form, item ? item.name : '');
        tile.dataset.state = kit.firstPartOf(form) <= group ? 'open' : 'later';
        tiles.append(tile);
      }
      line.append(label, tiles);
      gridBox.append(line);
    });
    paintMissed();
  }

  // The fourteen sun letters, composed and shown once from part 2 on, for the teacher who wants them learnt; the page itself needs
  // only the marks (docs/lesson-18/01 §5).
  function paintSunLetters() {
    if (!sunLettersLine) return;
    sunLettersLine.hidden = group < 2;
    if (sunLettersLine.hidden) return;
    sunLettersLine.textContent = '';
    sunLettersLine.append(el('span', 'sun-letters-text', say(boardBox.dataset.sunLetters)));
    sunLettersLine.append(arabic(el('span', 'sun-letters-glyphs', kit.sunLetters().join(' '))));
  }

  function paintSameLine() {
    const words = boardBox.dataset;
    if (kit.board === 'ends' || kit.board === 'words') {
      // One line a row: the two round-taa rows and the two yaa readings each say their own (data-same-single, -double, -ee, -aa); the
      // words' rows say theirs (data-same-moon, -sun, -allah).
      sameLine.textContent = say(ownLine(words, `same${pascalOf(rowMark)}`));
    } else {
      const sound = words[`sound${pascalOf(rowMark)}`];
      sameLine.textContent = say(rowMark === 'sukun' ? words.sameJazam : words.sameLine, { sound });
    }
    for (const line of gridBox.querySelectorAll('.rule-row, .word-row')) {
      if (line.dataset.mark === rowMark) line.setAttribute('data-current', '');
      else line.removeAttribute('data-current');
    }
  }

  function renderBoard() {
    const words = boardBox.dataset;
    if (kit.board === 'words') {
      renderSamples();
      renderWordsGrid();
      paintSameLine();
      paintSunLetters();
      scriptLine.textContent = say(shell.state.script === 'indopak' ? words.scriptIndopak : words.scriptMadani);
      // The Indo-Pak student is told once that the Qur'an's own Indo-Pak print is shown in a stand-in face for now; the Madani student
      // has no such line (docs/lesson-18/01 §6).
      leadLine.hidden = shell.state.script !== 'indopak';
      leadLine.textContent = leadLine.hidden ? '' : say(words.fontNote);
      paintMissed();
      return;
    }
    if (kit.board === 'ends') {
      renderShapes();
      renderEndsGrid();
      paintSameLine();
      scriptLine.textContent = say(shell.state.script === 'indopak' ? words.scriptIndopak : words.scriptMadani);
      // What is drawn before a form, and what the student's Qaida says about the yaa: a line of its own for each part.
      leadLine.hidden = false;
      leadLine.textContent = say(words[kit.leadKey(group)]);
      paintMissed();
      return;
    }
    renderSeats();
    renderGrid();
    paintSameLine();
    // One line per script (docs/lesson-16/04 §3): the Indo-Pak student is told what they have been reading since the start,
    // the Madani student what the alif carries. The student sees only their own.
    scriptLine.textContent = say(shell.state.script === 'indopak' ? words.scriptIndopak : words.scriptMadani);
    // The jazam forms are drawn after a lead (docs/lesson-16/02 §4): said where the jazam row comes into play.
    leadLine.hidden = group < 3;
    if (!leadLine.hidden) leadLine.textContent = say(words.leadLine);
    paintMissed();
  }

  boardBox.addEventListener('click', (event) => {
    const tile = event.target.closest('.rule-cell');
    if (!tile) return;
    peekTile(tile);
    if (tile.dataset.mark && tile.dataset.mark !== rowMark) {
      rowMark = tile.dataset.mark;
      paintSameLine();
    }
  });

  // The rows arrive 35ms apart on a new part, and leave at 150ms; not under reduced motion.
  function replayBoard() {
    gridBox.classList.remove('arrive');
    void gridBox.offsetWidth; // start the animation again
    gridBox.classList.add('arrive');
    clearTimeout(replayBoard.timer);
    replayBoard.timer = setTimeout(() => gridBox.classList.remove('arrive'), 150 + 6 * 35 + 900);
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
    boardBox.classList.add('leaving');
    swapBoard.timer = setTimeout(() => {
      paint();
      boardBox.classList.remove('leaving');
      replayBoard();
    }, 150);
  }

  // The form just missed keeps a gold edge, so the eye goes back to the teaching half and not only to the correction. Every
  // cell of that MARK is not marked: only the form that was asked (the seat is what is not read, so the seat is what differs).
  function paintMissed() {
    for (const tile of boardBox.querySelectorAll('.rule-cell')) {
      tile.toggleAttribute('data-missed', Boolean(missedId) && tile.dataset.id === missedId);
    }
  }

  // A question, on the board -------------------------------------------------------------------------

  const recorded = (item) => Boolean(audio() && audio().has(item.audio.kind, item.audio.glyph));

  // The ways to ask (docs/lesson-16/03 §3). Two are on: the picture to its name, and the sound to its name (a name is not a
  // picture, so hearing "a'" and picking "hamza with a jazam" can be asked). The reverse (a name, pick the picture) is NOT
  // built: two pictures honestly have one name, and the engine would mark a right picture wrong.
  const FORM_TO_NAME = { id: 'form-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: () => true };
  const SOUND_TO_NAME = {
    id: 'sound-to-name', ask: 'sound', answerWith: 'name', minStreak: 1, available: (item) => item.marked && recorded(item),
  };

  const soundCount = () => items.filter(recorded).length;

  // A rule whose point is HEARD (Lesson 20's: how long a vowel is held cannot be seen) sets `byEar` in its kit: the page then starts in the
  // mixed way, and a word the teacher has recorded is asked by ear from its very first question, not only after one right answer. A word with
  // no recording is asked by its picture, so nothing waits on a recording (docs/lesson-20/01 §7).
  // A rule whose question is to TAP a letter of the word (Lesson 21's, `tapFormat`) has two ways to ask, and an item has only one of them: the
  // word with its letters tappable (the answers are the letters, and in the last part a "none" besides), and the word with one letter lit and the
  // two names "Read" and "Not read". No question is heard: a letter's being read is seen. The engine asks the format for its answers
  // (`choicesFor`, practice.js), so it never has to know a letter from an item.
  const TAP_THE_LETTER = {
    id: 'tap-the-letter', ask: 'glyph', answerWith: 'letter', tap: true, minStreak: 0,
    available: (item) => Boolean(item.tap),
    choicesFor: (item) => kit.tapChoices(item, group >= 3),
    correctFor: (item) => item.answerId,
  };
  const LIT_TO_NAME = { id: 'lit-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: (item) => !item.tap };

  function formatsFor(kind) {
    if (kit.tapFormat) return [TAP_THE_LETTER, LIT_TO_NAME];
    if (kind === 'sound') return [{ ...SOUND_TO_NAME, minStreak: 0 }];
    if (kind === 'mix') return [FORM_TO_NAME, kit.byEar ? { ...SOUND_TO_NAME, minStreak: 0 } : SOUND_TO_NAME];
    return [FORM_TO_NAME];
  }

  // The word of a question about its letters (docs/lesson-21/01 §5). In a tap question every letter is a button (a role and a tab stop on a span,
  // not a <button>, which is an inline-block and would break the joining); in a question about one letter the word is shown whole with that
  // letter lit, and is hidden from a screen reader as every word is (the question and the answers carry it).
  function tapWord(q) {
    const tapping = Boolean(q.format.tap);
    const word = el('span', 'prompt-glyph prompt-word');
    word.lang = 'ar';
    word.dir = 'rtl';
    if (tapping) {
      word.setAttribute('role', 'group');
      word.setAttribute('aria-labelledby', 'ask');
    } else {
      word.setAttribute('aria-hidden', 'true');
    }
    q.item.units.forEach((unit, i) => {
      const node = el('span', 'unit', unit.text);
      if (unit.role) node.dataset.role = unit.role;
      if (tapping) {
        node.classList.add('tap');
        node.dataset.id = String(i);
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', say(prompt.dataset.letterLabel, { n: i + 1, total: q.item.units.length }));
      }
      word.append(node);
    });
    return word;
  }

  function buildPrompt(q) {
    prompt.textContent = '';
    prompt.dataset.mode = q.prompt.mode;
    if (q.prompt.mode === 'glyph' && q.item.units) {
      // A word in its letters (Lesson 21): each its own span, so one can be lit and, in a tap question, tapped. A span holding only a colour does
      // not break Arabic joining (Lesson 18, measured), so the word still reads as one word. Not centred on its ink: the line is centred as a whole.
      prompt.append(tapWord(q));
    } else if (q.prompt.mode === 'glyph') {
      const shown = arabic(el('span', 'prompt-glyph', q.prompt.glyph));
      prompt.append(shown);
      shell.centerInk(prompt, shown);
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

  // Every answer is a name, never a picture, so the choices are the marks (one each: the engine never offers one name twice).
  function buildChoices(q) {
    choicesBox.textContent = '';
    choicesBox.dataset.face = 'name';
    // A tap question's answers are the letters in the word above; all that is down here is "none", and only where the part allows it.
    if (q.format.tap) {
      choicesBox.style.setProperty('--cols', 1);
      choicesBox.style.setProperty('--cols-wide', 1);
      for (const choice of q.choices.filter((one) => one.none)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice';
        button.dataset.id = choice.id;
        button.dataset.face = 'name';
        const inner = document.createElement('span');
        inner.className = 'choice-name';
        inner.textContent = choicesBox.dataset.none;
        button.append(inner);
        choicesBox.append(button);
      }
      return;
    }
    // Two across on a narrow screen and one row on a wide one, for four; three stay three.
    choicesBox.style.setProperty('--cols', q.choices.length === 3 ? 3 : 2);
    choicesBox.style.setProperty('--cols-wide', q.choices.length === 6 ? 3 : q.choices.length);

    q.choices.forEach((item, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.id = item.id;
      button.dataset.face = 'name';
      button.style.setProperty('--i', i);
      const inner = document.createElement('span');
      inner.className = 'choice-name';
      inner.textContent = item.name;
      button.append(inner);
      choicesBox.append(button);
    });
    labelChoices();
  }

  // The names can be edited in the options panel while a question is up, so the labels are set apart from the building.
  function labelChoices() {
    for (const button of choicesBox.children) {
      const item = byId.get(button.dataset.id);
      if (item) button.firstChild.textContent = item.name;
    }
  }

  function paintQuestion() {
    const q = view.question;
    if (!q) return;
    // A drill that mixes questions (Lesson 19) says which one this word answers: `data-glyph-start`, `-alif`, `-long`. Every other rule
    // has no `askOf` and one line.
    const asked = kit.askOf ? askLine.dataset[`glyph${pascalOf(kit.askOf(q.item, group) || '')}`] : '';
    const text = { glyph: asked || askLine.dataset.glyph, sound: askLine.dataset.sound }[q.prompt.mode];
    askLine.textContent = say(text, { name: q.item.name });
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
      seatEcho.hidden = true;
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

  // Under a wrong answer: the same sound on every seat (docs/lesson-16/03 §1). The miss was a seat or a mark, and the answer
  // to both is one picture: the row of the board, drawn small, with the seat as the only thing that changes.
  function paintSeatEcho() {
    const v = view.verdict;
    seatEcho.hidden = !(v && !v.right);
    if (seatEcho.hidden) return;
    seatEcho.textContent = '';
    // What to show and which line says it are the rule's own: the hamza's row on every seat, a round taa with every mark, an end
    // yaa read both ways (the kit's `echoOf`).
    const echo = kit.echoOf(v.item);
    seatEcho.append(el('span', 'seat-echo-text', say(seatEcho.dataset[echo.line])));
    const forms = el('span', 'seat-echo-forms');
    if (echo.units) {
      // A word (Lesson 18): the same word again, with the two places to look lit.
      forms.append(litWord(echo.units, 'seat-echo-form seat-echo-word'));
      // And how it is said at a stop (Lesson 22): printed, then said, with the word for "said" between them.
      if (echo.said && echo.said.length) {
        const between = el('span', 'seat-echo-said', say(seatEcho.dataset.saidLabel));
        between.setAttribute('aria-hidden', 'true');
        forms.append(between, litWord(echo.said, 'seat-echo-form seat-echo-word'));
      }
    } else {
      for (const form of echo.forms) forms.append(arabic(el('span', 'seat-echo-form', kit.drawnOf(form))));
    }
    seatEcho.append(forms);
  }

  function paintVerdict() {
    const v = view.verdict;
    if (!v) return;
    const d = verdictLine.dataset;
    let template = v.right ? d.right : d.wrong;
    // A tap question says what is not read in the word, and four things can happen: the right letter, the wrong letter, "none" said of a word that
    // has one, and a letter tapped in a word that has none.
    if (v.question.format.tap) {
      const none = v.item.kind === 'none';
      template = v.right ? (none ? d.rightNone : d.rightTap) : (none ? d.wrongNone : v.chosen.none ? d.wrongSaidNone : d.wrongTap);
    }
    verdictLine.textContent = say(template, {
      name: v.item.name, chosen: v.chosen.name, mark: v.item.markName, Mark: marks.cap(v.item.markName),
    });
    after.querySelector('.after-glyph').textContent = v.item.glyph;
    after.querySelector('.after-name').textContent = v.item.name;
    paintSeatEcho();
  }

  function showVerdict(v) {
    view.verdict = v;
    // The right answer is the question's own: an item's id for every question but a tap question, whose answers are the word's letters.
    const rightId = v.question.correct;
    for (const button of [...choicesBox.children, ...prompt.querySelectorAll('.unit.tap')]) {
      const id = button.dataset.id;
      // Gold against dim, and a tick on the right one: never a failure colour, and never colour alone.
      button.dataset.verdict = id === rightId ? 'right' : id === v.chosen.id ? 'wrong' : 'dim';
      button.setAttribute('aria-disabled', 'true');
    }
    paintVerdict();

    if (!v.right) {
      missedId = v.item.boardId || v.item.id;
      rowMark = v.item.mark; // the board's same-sound line follows the miss
      paintSameLine();
      paintMissed();
    }

    // Seeing the form and hearing it are the same moment. Nothing plays if the sound is off.
    if (audio() && v.item.audio) audio().play(v.item.audio.kind, v.item.audio.glyph);

    // A wrong answer never moves on by itself: the student decides when they have finished looking at it. A right one
    // does, for a pointer, but moving focus out from under a keyboard is the classic drill bug, so from the keyboard
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

  // A letter of the word in a tap question (Lesson 21). Enter and Space answer from the keyboard, as they do on a choice.
  function answerTap(node, input) {
    const q = drill && drill.question;
    if (!node || !q || q.answered || drillBox.classList.contains('leaving')) return;
    view.input = input;
    drill.answer(node.dataset.id);
  }
  prompt.addEventListener('click', (event) => answerTap(event.target.closest('.unit.tap'), event.detail === 0 ? 'key' : 'pointer'));
  prompt.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const node = event.target.closest && event.target.closest('.unit.tap');
    if (!node) return;
    event.preventDefault();
    answerTap(node, 'key');
  });

  after.querySelector('.next-question').addEventListener('click', () => {
    view.focusChoice = true;
    drill.next();
  });

  after.querySelector('.hear').addEventListener('click', () => {
    const v = view.verdict;
    if (v && audio() && v.item.audio) audio().play(v.item.audio.kind, v.item.audio.glyph);
  });

  // Missing when the browser can't record at all (voice.js removes it): docs/your-voice/02 §1. The seat is never read, so
  // every seat of a mark shares one recording, and a student's own recording of it (docs/your-voice/) with it. A word (Lesson 18) is
  // kept under its reference and SHOWN as its text, so a switch of script keeps the student's own recording of it.
  const sayButton = after.querySelector('.say');
  if (sayButton) {
    sayButton.addEventListener('click', () => {
      const v = view.verdict;
      if (v && v.item.audio && window.qaidaEcho) window.qaidaEcho.open(v.item.audio.kind, v.item.audio.glyph, titleOf(v.item), v.item.ref ? v.item.glyph : undefined);
    });
  }

  // The writing board opens on the WHOLE form, with its lead for a jazam form: writing the seat and the hamza on it is the
  // part with a real chance of being drawn wrong. trace.js draws the guide and centres it on its ink.
  // A word (Lesson 18) is titled "Trace this word" and "Say this word" (a text field on the advice block): its name is what the laam
  // does, not what is written or said.
  const titleOf = (item) => (item.ref ? adviceBox.dataset.traceWord || item.name : item.name);
  const trace = (item) => {
    if (item && window.qaidaTrace) window.qaidaTrace.open(item.glyph, titleOf(item));
  };
  after.querySelector('.trace').addEventListener('click', () => trace(view.verdict && view.verdict.item));
  struggle.querySelector('.trace').addEventListener('click', () => trace(view.struggling));

  // "Show me": back up to the teaching half, with that form marked.
  struggle.querySelector('.show-me').addEventListener('click', () => {
    if (view.struggling) {
      missedId = view.struggling.boardId || view.struggling.id;
      rowMark = view.struggling.mark;
      paintSameLine();
      paintMissed();
    }
    boardTitle.focus({ preventScroll: true });
    boardBox.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  });

  // The advice, and the end of the lesson -----------------------------------------------------------------

  function paintAdvice() {
    const d = adviceBox.dataset;
    if (view.struggling) struggleText.textContent = say(d.struggling, { name: view.struggling.name });
    struggle.hidden = !view.struggling;

    // A recommendation, never a gate: it says the part is known, and nothing unlocks or stops.
    const all = allReady();
    const here = stat(group).ready;
    readyNote.textContent = say(all ? d.readyLesson : d.readyGroup);
    readyNote.hidden = !(all || here);
  }

  function paintFinished() {
    const done = shell.isDone(LESSON);
    lesson.classList.toggle('complete', done);
    endLine.textContent = say(done ? endLine.dataset.finished : endLine.dataset.before);
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
    seatEcho.hidden = true;
    verdictLine.textContent = code === 'formats' ? soundNote.dataset.none : verdictLine.dataset.poolError;
  }

  // Which parts have just become ready. The engine's own `ready` fires once a visit and so cannot tell one part from another
  // after `setItems`; every part is measured here instead. A part already ready on the way in is not congratulated.
  function watchReady(quiet) {
    let crossed = 0;
    for (const n of DRILLING) {
      const now = stat(n).ready;
      if (now && !ready.has(n)) {
        ready.add(n);
        if (n === group) crossed = n;
      }
      if (!now) ready.delete(n);
    }
    const wasDone = shell.isDone(LESSON);
    // Only the last part finishes the lesson: opening it from a standing start would finish a lesson that had taught nothing.
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

  // No counts on the page (the user, 2026-09-20). The bar is the whole lesson and a few plain words say how it is going.
  const stageOf = (fraction) => (fraction <= 0 ? 0 : fraction < 0.4 ? 1 : fraction < 0.75 ? 2 : fraction < 1 ? 3 : 4);

  function paintProgress() {
    if (!drill) return;
    // The engine writes the size of the OPEN PART as the lesson's total, because that is all it was handed. The home reads
    // that number to draw its card, so the whole lesson's is put back here (docs/lesson-4/03 §2).
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
    const groupDone = p.total > 0 && p.known === p.total;
    bandLine.textContent = groupDone ? bandLine.dataset.done : '';
    bandLine.hidden = !groupDone;
    const record = shell.drillOf(LESSON);
    reset.hidden = Object.keys(record.right).length + Object.keys(record.wrong).length === 0;
    if (!armed) reset.textContent = reset.dataset.label;

    // A form the advice was about, once it is known again, no longer needs the advice.
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
    setGroup(1);
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

  // The next lesson: a real link once it is built, and a note until then (which is how every lesson waited for the next).
  function nextEntry() {
    return shell.LESSONS.find((entry) => entry.n === LESSON + 1);
  }

  next.addEventListener('click', () => {
    const entry = nextEntry();
    if (entry && entry.built && entry.href) location.href = entry.href;
    else if (!entry && next.dataset.last) location.href = 'index.html';
    else shell.say(say(next.dataset.soon));
  });

  function paintNext() {
    const entry = nextEntry();
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const text = say(name === 'zabar' ? next.dataset.nextZabar : next.dataset.nextFatha);
    next.querySelector('span').textContent = entry ? text : next.dataset.last || '';
  }

  // The previous lesson: always built by the time this page can be reached, so a plain link; its label follows the
  // student's choice of names, the way the "next" button's own label does.
  function paintPrev() {
    if (!prev || !prev.dataset.prevZabar) return;
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const span = prev.querySelector('span');
    if (span) span.textContent = say(name === 'zabar' ? prev.dataset.prevZabar : prev.dataset.prevFatha);
  }

  function paintHead() {
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const title = heading.dataset[name === 'zabar' ? 'titleZabar' : 'titleFatha'] || '';
    heading.textContent = title;
    document.title = document.title.replace(/^[^·]*/, `Lesson ${LESSON}: ${title} `);
    // The lesson's subject in one glyph: composed, never pasted (docs/lesson-4/02 §1). The alif seat with zabar; Lesson 17's is a round taa.
    titleMark.textContent = kit.titleGlyph();
  }

  // Sound ------------------------------------------------------------------------------------------

  // A recording belongs to a form, so the count is of forms. They arrive a few at a time; one honest line says where
  // things have got to.
  function paintSound() {
    if (!soundNote || !audio()) return;
    const count = soundCount();
    soundNote.hidden = count === items.length;
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

  // What means the ITEMS must be rebuilt: the script (every form is drawn another way). Names and wording only rename them.
  const shapeOf = () => shell.state.script;

  function build() {
    items = kit.itemsFor(shell, { templates: templates() });
    usePool(group);
  }

  // Seen quietly: whatever is already ready on the way in, or after the forms changed, is not "just now".
  function seedReady() {
    ready.clear();
    for (const n of DRILLING) if (stat(n).ready) ready.add(n);
  }

  function render() {
    const wanted = shapeOf();
    paintHead();
    if (!drill) {
      build();
      shape = wanted;
      group = upTo();
      keepRow();
      root.dataset.group = String(group);
      root.dataset.band = String(group);
      usePool(group);
      seedReady();
      buildRail();
      drill = engine.create({
        lesson: LESSON,
        items: pool,
        formats: formatsFor(mode),
        choices: Number(root.dataset.choices) || 4,
        familyFirst: false,
        noRepeatWithin: spreadFor(pool.length),
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
      // A new script: the same forms drawn another way, and a fresh question to show it. What was learnt is kept under
      // each id, so switching script keeps every form known.
      build();
      shape = wanted;
      view.struggling = null;
      seedReady();
      drill.setItems(pool);
      renderBoard();
    } else {
      // Only the names changed (or a line of wording): the same items with new words.
      kit.rename(items, shell, templates());
      kit.rename(pool, shell, templates());
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
    paintPrev();
  }

  shell.onChange(render);
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // The manifest arrives a moment later; hearing practice opens for the forms that have a recording when it does.
  if (audio()) audio().ready.then(() => {
    paintSound();
    if (drill) drill.set({ formats: formatsFor(mode) });
  });

  // For the options panel (qaida-options.js). Every member the panel reads is here (docs/lesson-16/03 §6): a missing one
  // throws in the panel and takes the page down. The ones that do not apply say so: no other mark to be told apart from,
  // no tails, no twins, no review letters.
  window.qaida = {
    kind: 'drill',
    rule: rule.id,
    render,
    replay,
    clear,
    // The item last answered or asked, for the top-bar Say it button to open on (docs/your-voice/04 §1).
    get lastItem() {
      const item = (view.verdict && view.verdict.item) || (view.question && view.question.item);
      return item && item.audio ? [item.audio.kind, item.audio.glyph, titleOf(item), item.ref ? item.glyph : undefined] : null;
    },
    get pause() {
      return pause;
    },
    get target() {
      return target();
    },
    get readyAt() {
      return readyAt();
    },
    get group() {
      return group;
    },
    review: 0,
    hasOther: false,
    otherCount: 0,
    hasTail: false,
    twins: false,
    twinMode: 'off',
    markCount: 1,
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
    // Any part, at any time: nothing is locked.
    setGroup: (n) => setGroup(n),
    // What each part costs, so the options panel can show the teacher the numbers before asking (docs/lesson-4/09 §2).
    groupCosts: () => marks.sizes(items, DRILLING).map((count, i) => ({
      n: DRILLING[i], items: count, answers: Math.ceil(count * readyAt() - 1e-9) * target(),
    })),
    // The parts themselves, so the options panel can build a Part row for however many there are (docs/lesson-7/04 §7).
    get parts() {
      return DRILLING.map((n) => ({ n, name: groupName(n) }));
    },
    // Nothing rides along on a rule page: these are the panel's rows for the mark lessons, and each one is a no-op here.
    setReview: () => render(),
    setDistractors: () => render(),
    setTwins: () => render(),
    // A new question even if this one is unanswered: for trying things, so it leaves no mark on the form.
    next: () => drill.next(true),
    again: () => drill.again(),
    masterAll: () => drill.masterAll(),
    get sound() {
      return soundCount();
    },
  };
})();
