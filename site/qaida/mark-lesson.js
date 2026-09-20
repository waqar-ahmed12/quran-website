// The free Qaida, Lessons 4 to 6: the mark. QAIDA-BUILD.md step 6; the specification is docs/lesson-4/.
//
// ONE page file for every mark lesson. `<html data-mark="fatha">` says which stroke this page teaches; lesson-4.html,
// lesson-5.html and lesson-6.html differ in that attribute and in their wording, and nothing else (docs/lesson-4/README.md).
// Which mark is which, and which letters are asked, is marks.js. What to ask next, what counts as known and when to say
// "you seem ready" is practice.js, which is unchanged: the two groups fall out of its `required` flag.
//
// The wording never scolds. A wrong answer says what the thing is and nothing more. Nothing is locked: both parts open at
// any time, and one opened out of turn is advised about once. No numbers on the page (the user, 2026-09-20).

(() => {
  const shell = window.qaidaShell;
  const engine = window.qaidaPractice;
  const marks = window.qaidaMarks;
  if (!shell || !engine || !marks) return;

  const root = document.documentElement;
  const mark = marks.markOf(root.dataset.mark);
  if (!mark) return;

  const LESSON = mark.lesson;
  const LAST = marks.COUNT;
  // Where the stroke sits, for the stylesheet: a mark below the letter shares its strip with the dots below and the tails, so
  // the tiles need room at the other end (docs/lesson-5/02 §2). Set before anything is drawn.
  root.dataset.sits = mark.sits;
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
  const aloneGlyph = $('.alone-glyph');
  const aloneLabel = $('.alone-label');
  const aloneSits = $('.alone-sits');
  const featureBox = $('.pair-feature');
  const pairsBox = $('.pairs');
  const joinedBox = $('.joined');
  const joinedGlyph = $('.joined-glyph');
  const joinedText = $('.joined-text');
  const joinedNote = $('.joined-note');
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
  const adviceBox = $('.advice');
  const practiseButton = $('.practise');
  const drillTitle = $('#drill-title');
  const wordsBox = $('[data-name-marked]');
  const lookSource = $('[data-groups]');
  const endLine = $('.end-line');
  const next = $('.next');

  const audio = () => window.qaidaAudio;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = marks.fill;

  // What is on the board now, apart from what the engine holds.
  const view = {
    question: null,
    verdict: null,
    struggling: null, // the one letter the advice is about
    input: 'pointer', // how the last answer was given: a right answer only moves on by itself for a pointer
    focusChoice: false, // Next was pressed, so the keyboard belongs on the first choice of the new question
  };

  let drill = null;
  let items = []; // the whole lesson: every letter with the mark, whatever part is open
  let pool = []; // what the drill is handed: the open part's letters, and the bare ones that ride along
  let byId = new Map();
  let shape = ''; // which script, mark, review and wrong-answer choice the items on screen were built for
  let group = 1;
  let mode = 'mark';
  let pause = 900; // how long a right answer stays before the next question, for a pointer
  let advanceTimer = 0;
  let swapTimer = 0;
  let announced = 0;
  let advised = false; // the "this part comes later" line is shown once a visit, not every time
  let missedId = ''; // the letter just missed keeps a gold edge on the board until the next question
  const ready = new Set(); // the parts already known to be ready, so "you seem to know this" fires once, on the way in

  // What the drill runs with. The engine is measured against these, so the rail can measure both parts the same way.
  const target = () => (drill ? drill.settings.target : 3);
  const readyAt = () => (drill ? drill.settings.readyAt : 0.8);
  // A mark with nothing before it (the first) has no "other mark" to be told apart from, so which-mark falls back to the
  // look-alike wrong answers there instead of asking a question with no contrast in it.
  const other = marks.otherOf(mark);
  const distractors = () => {
    const wanted = root.dataset.distractors;
    if (wanted === 'which-mark') return other ? 'which-mark' : 'look-alike';
    return ['mark-or-not', 'any'].includes(wanted) ? wanted : 'look-alike';
  };
  // The other mark's letters ride along as wrong answers unless the teacher turns them off (docs/lesson-5/06 §2).
  const twinsOn = () => Boolean(other) && root.dataset.twins !== 'off';
  const reviewCount = () => {
    const n = Math.round(Number(root.dataset.review));
    // None unless the teacher asks: the user, 2026-09-20, "don't add simple alphabets without symbols". A plain letter is a
    // different question from the mark this lesson is about, and it was coming up as much as the marked ones.
    return Number.isFinite(n) ? Math.min(16, Math.max(0, n)) : 0;
  };
  // The trio (the letter, the letter with the other mark, the letter with this one) needs an other mark to show.
  const boardMode = () => (root.dataset.board === 'marked' ? 'marked' : root.dataset.board === 'trio' && other ? 'trio' : 'pairs');
  // Whose stroke an item carries. A twin and a bare letter are review: never advice, never counted, never the gate.
  const isOwn = (item) => Boolean(item) && item.mark === mark.id;
  const pointMode = () => (['none', 'tint'].includes(root.dataset.point) ? root.dataset.point : 'halo');

  // Words -------------------------------------------------------------------------------------------

  const templates = () => {
    const d = wordsBox.dataset;
    return { marked: d.nameMarked, bare: d.nameBare };
  };

  // The teacher's table of look-alikes, groups between commas: Lesson 2's, carried here so this page can be edited on its own.
  function lookAlikes() {
    const text = lookSource ? lookSource.dataset.groups || '' : '';
    return text
      .split(',')
      .map((list) => list.trim().split(/\s+/).filter(Boolean).map(shell.keyOf))
      .filter((list) => list.length > 1);
  }

  // {mark} and {Mark} are filled from the student's own set of names, so switching it rewrites the page without a reload.
  const say = (text, values = {}) => fill(text, { ...marks.wordsFor(mark, shell), ...values });

  const groupName = (n) => bandsNav.dataset[`group${n}`] || '';

  // The parts -------------------------------------------------------------------------------------------

  const stat = (n) => marks.stats(shell, LESSON, items, n, { target: target(), readyAt: readyAt() });
  // The lesson is ready when the last part is: all of the letters at four fifths, with nothing shaky.
  const allReady = () => stat(LAST).ready;

  // The part the student is up to: the first one not yet ready.
  function upTo() {
    for (const n of marks.DRILLING) if (!stat(n).ready) return n;
    return LAST;
  }

  function lessonKnown() {
    const record = shell.drillOf(LESSON);
    return items.filter((item) => (record.streak[item.id] || 0) >= target()).length;
  }

  // The rail, once; paintRail() keeps it up to date without rebuilding it, so a button never loses the keyboard.
  function buildRail() {
    bandsList.textContent = '';
    for (const n of marks.DRILLING) {
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
      button.querySelector('.band-glyph').textContent = marks.sampleOf(shell, mark, n);
      button.querySelector('.band-name').textContent = name;
      button.querySelector('.band-state').textContent = state || '';
      button.style.setProperty('--p', s.total ? s.known / s.total : 0);
      // The name of the state is in the label, so it does not depend on the gold.
      button.setAttribute('aria-label', say(words.groupLabel, { n, name, state }).replace(/\s+/g, ' ').trim());
    }
  }

  // The pool for one part: its marked letters (all required), the other mark's letters (the twins), and the bare letters that
  // ride along, none of them required. What rides along is one decision made in one place, because the "wrong answers" row of
  // the options panel decides two things at once, which tag the items carry and which review items are built at all:
  //   twins: the open part's own letters with the other mark, so each item has its twin to be told apart from. On whenever
  //          there is an other mark and the teacher has not turned it off. This is skill D, the point of Lesson 5.
  //   bare:  how many plain letters, at most. The engine weighs a review item at half a required one, so eight bare letters
  //          beside six required ones would be most of the questions (docs/lesson-4/03 §3 meant roughly one in eight, with 29
  //          required). So a small part gets a third as many as it has letters. The exception is asking "the same letter,
  //          with and without the mark": that needs a bare twin for every letter, so it gets as many as the part has.
  //   prefer: those bare letters are then the open part's own, so each has its twin.
  function reviewPlan(own) {
    const spot = distractors() === 'mark-or-not';
    return {
      twins: twinsOn(),
      bare: Math.min(reviewCount(), spot ? own.length : Math.ceil(own.length / 3)),
      prefer: spot ? own.map((item) => item.key) : [],
    };
  }

  function poolOf(n) {
    const own = marks.poolFor(items, n);
    const plan = reviewPlan(own);
    const options = { templates: templates(), distractors: distractors(), looks: lookAlikes() };
    const twins = plan.twins ? marks.twinItems(shell, mark, { ...options, keys: own.map((item) => item.key) }) : [];
    const bare = marks.reviewItems(shell, mark, { ...options, count: plan.bare, prefer: plan.prefer });
    return [...own, ...twins, ...bare];
  }

  // How many questions must pass before the same letter can come back. The engine's own is at most 3, which in a part of six
  // letters is a repeat every few questions (the user, 2026-09-20: "a lot of repetitions"): here it is most of the pool, so
  // every letter has been asked before any returns. A letter just missed still comes back sooner, on purpose (`cooldown`).
  const spreadFor = (count) => Math.max(1, Math.min(8, count - 2));

  function usePool(n) {
    pool = poolOf(n);
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
      // The page glides up once the new letters are in place: asked for earlier, the change in height cancels it.
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

  const ARROW = '<svg class="pair-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';

  // Tap a tile and it is said: a marked one asks for its own mark's recordings (the SOUND, "ba"), the bare ones for the
  // letter's name. Where there is no recording yet the stand-in plays, exactly as on Lessons 1 and 3. The tile says which.
  function peekTile(tile) {
    clearTimeout(tile.timer);
    tile.classList.add('peek');
    tile.timer = setTimeout(() => tile.classList.remove('peek'), 700);
    if (audio() && tile.dataset.base) audio().play(tile.dataset.audio || 'letters', tile.dataset.base);
  }

  // A letter as a tile. Its container carries the name and the letter itself is hidden from a screen reader: a combining
  // mark is not reliably announced (docs/lesson-4/06 §1), so the name is built from the same template the sighted student reads.
  // `kind` is 'bare', 'marked' (this lesson's stroke, the one that is pointed at) or 'other' (the stroke it is shown against).
  function markTile(kind, letter, label) {
    const strokeOf = kind === 'marked' ? mark : kind === 'other' ? other : null;
    const button = el('button', `letter mark-tile ${kind}`);
    button.type = 'button';
    button.dataset.kind = kind;
    button.dataset.base = letter;
    // The same id the engine gives that item, so "the letter just missed" can be found by comparing them.
    button.dataset.id = shell.keyOf(letter) + (strokeOf ? String.fromCharCode(strokeOf.cp) : '');
    button.dataset.audio = strokeOf ? strokeOf.audio : 'letters';
    button.setAttribute('aria-label', label);
    const glyph = arabic(el('span', 'glyph'));
    if (kind === 'marked' && pointMode() === 'tint') {
      // Fragile on purpose: the mark in a span of its own, so the teacher can see what that does to the attachment.
      glyph.append(document.createTextNode(letter), el('span', 'tinted', String.fromCharCode(mark.cp)));
    } else {
      glyph.textContent = strokeOf ? marks.glyphOf(letter, strokeOf) : letter;
    }
    if (kind === 'marked') {
      // Where the text sits on its line, so the halo can be measured from it (positionHalos).
      glyph.append(el('span', 'baseline'));
      const halo = el('span', 'halo');
      halo.setAttribute('aria-hidden', 'true');
      button.append(glyph, halo);
      return button;
    }
    button.append(glyph);
    return button;
  }

  // The halo ------------------------------------------------------------------------------------------
  // The stroke does not sit in the same place on every letter (over the middle of baa, to one side of alif, higher on lam),
  // so a ring of one size and place matches none of them. Where the mark's ink falls is measured instead: the letter is drawn
  // on a canvas with and without the mark, and what the mark added is the box the ring goes round. Nothing touches the text.
  // A canvas that cannot be read simply leaves the ring out (docs/lesson-4/04 §3b).
  let boxes = new Map();
  const fontWait = new Set();

  // `spec` is the whole font shorthand (weight, size and family) as the page's own letter is set in.
  function markBox(letter, spec) {
    const family = spec.replace(/^\S+\s+\S+\s+/, '');
    const weight = spec.split(/\s+/)[0];
    const key = `${letter}|${spec}`;
    if (boxes.has(key)) return boxes.get(key);
    let box = null;
    try {
      const canvas = document.createElement('canvas');
      const c = canvas.getContext && canvas.getContext('2d', { willReadFrequently: true });
      if (c) {
        const S = 100; // font size, in pixels; the box is kept in units of it
        const W = 420;
        const H = 420;
        const X = W / 2; // the text is centred here, and its baseline sits here
        const Y = 270;
        canvas.width = W;
        canvas.height = H;
        const draw = (text) => {
          c.clearRect(0, 0, W, H);
          c.font = `${weight} ${S}px ${family}`;
          c.textAlign = 'center';
          c.textBaseline = 'alphabetic';
          c.fillText(text, X, Y);
          return c.getImageData(0, 0, W, H).data;
        };
        const plain = draw(letter);
        const withMark = draw(marks.glyphOf(letter, mark));
        let x0 = W;
        let x1 = -1;
        let y0 = H;
        let y1 = -1;
        for (let y = 0; y < H; y += 1) {
          for (let x = 0; x < W; x += 1) {
            const at = (y * W + x) * 4 + 3;
            if (withMark[at] - plain[at] > 60) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        if (x1 >= 0) box = { x0: (x0 - X) / S, x1: (x1 + 1 - X) / S, y0: (y0 - Y) / S, y1: (y1 + 1 - Y) / S };
      }
    } catch {
      box = null;
    }
    boxes.set(key, box);
    return box;
  }

  function positionHalos() {
    if (pointMode() !== 'halo' || typeof getComputedStyle !== 'function') return;
    for (const tile of boardBox.querySelectorAll('.mark-tile.marked')) {
      const glyph = tile.querySelector('.glyph');
      const halo = tile.querySelector('.halo');
      const baseline = glyph && glyph.querySelector('.baseline');
      if (!glyph || !halo || !baseline) continue;
      const style = getComputedStyle(glyph);
      const size = parseFloat(style.fontSize);
      const spec = `${style.fontWeight || 400} ${size}px ${style.fontFamily}`;
      // A face that has not arrived yet would be measured as the fallback, and the ring would fit a letter that is not on
      // the screen. Wait for it, then measure again: this is what a change of lettering in the options panel needs.
      if (size && document.fonts && typeof document.fonts.check === 'function' && !document.fonts.check(spec, tile.dataset.base)) {
        if (!fontWait.has(spec)) {
          fontWait.add(spec);
          const done = () => {
            fontWait.delete(spec);
            boxes = new Map();
            haloSoon();
          };
          document.fonts.load(spec, tile.dataset.base).then(done, done);
        }
        halo.removeAttribute('data-placed');
        continue;
      }
      const box = size ? markBox(tile.dataset.base, spec) : null;
      if (!box) {
        halo.removeAttribute('data-placed');
        continue;
      }
      const t = tile.getBoundingClientRect();
      const g = glyph.getBoundingClientRect();
      const b = baseline.getBoundingClientRect();
      const inset = (tile.clientLeft || 0);
      const cx = g.left + g.width / 2 - t.left - inset;
      const by = b.top - t.top - inset;
      const pad = size * 0.1;
      const left = cx + box.x0 * size - pad;
      const top = by + box.y0 * size - pad;
      halo.style.setProperty('left', `${Math.round(left * 10) / 10}px`);
      halo.style.setProperty('top', `${Math.round(top * 10) / 10}px`);
      halo.style.setProperty('width', `${Math.round(((box.x1 - box.x0) * size + 2 * pad) * 10) / 10}px`);
      halo.style.setProperty('height', `${Math.round(((box.y1 - box.y0) * size + 2 * pad) * 10) / 10}px`);
      halo.setAttribute('data-placed', '');
    }
  }

  let haloFrame = 0;
  const haloSoon = () => {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(haloFrame);
    haloFrame = requestAnimationFrame(positionHalos);
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(haloSoon).observe(boardBox);
  // A different lettering (or script, size or tile) changes the face and the letter's size without redrawing the board.
  if (typeof MutationObserver === 'function') {
    new MutationObserver(haloSoon).observe(root, {
      attributes: true,
      attributeFilter: ['data-madani-font', 'data-indopak-font', 'data-script', 'data-size', 'data-tiles', 'data-point'],
    });
  }
  // The lettering arrives a moment after the first paint, and a canvas asked before it does draws in the wrong face.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      boxes = new Map();
      haloSoon();
    });
  }

  function pairCell(kind, letter, label, caption) {
    const cell = el('div', `pair-cell ${kind}`);
    cell.append(markTile(kind, letter, label), el('span', 'pair-caption', caption));
    cell.lastChild.setAttribute('aria-hidden', 'true');
    return cell;
  }

  function pairOf(row, { feature = false, labels } = {}) {
    const words = templates();
    const bare = fill(words.bare, { name: row.name });
    const withMark = say(words.marked, { name: row.name });
    // The trio shows where the stroke moved: the letter, then with the mark of the lesson before, then with this one.
    const trio = boardMode() === 'trio';
    const pair = el('div', `pair${feature ? ' feature' : ''}${trio ? ' trio' : ''}`);
    pair.setAttribute('role', 'listitem');
    pair.dataset.key = row.key;
    if (boardMode() === 'marked' && !feature) {
      // Just the marked letter, with the bare one small beneath: the same letter, and one of them carries the mark.
      const cell = pairCell('marked', row.glyph, withMark, withMark);
      const under = arabic(el('span', 'bare-under', row.glyph));
      cell.append(under);
      pair.append(cell);
      return pair;
    }
    pair.append(pairCell('bare', row.glyph, bare, labels ? labels.bare : bare));
    if (trio) {
      // The other mark's own word, not this lesson's: "Baa with zabar" beside "Baa with zair".
      const withOther = say(words.marked, { name: row.name, mark: marks.wordsFor(other, shell).mark });
      pair.insertAdjacentHTML('beforeend', ARROW);
      pair.append(pairCell('other', row.glyph, withOther, labels ? labels.other : withOther));
    }
    pair.insertAdjacentHTML('beforeend', ARROW);
    pair.append(pairCell('marked', row.glyph, withMark, labels ? labels.marked : withMark));
    return pair;
  }

  function renderBoard() {
    const words = boardBox.dataset;
    const rows = marks.boardRows(shell, mark, group);

    // The mark on its own, and where it sits.
    aloneGlyph.textContent = marks.aloneOf(mark);
    aloneLabel.textContent = say(words.markAlone);
    aloneSits.textContent = say(words.markSits);

    // The featured pair: one letter twice, bare and marked, the two ways of saying it under each.
    featureBox.textContent = '';
    if (rows.length) {
      featureBox.append(pairOf(rows[0], {
        feature: true, labels: { bare: say(words.pairBare), other: say(words.pairOther), marked: say(words.pairMarked) },
      }));
    }
    featureBox.append(el('p', 'mark-does', say(words.markDoes)));

    pairsBox.textContent = '';
    pairsBox.dataset.board = boardMode();
    rows.forEach((row, i) => {
      const pair = pairOf(row);
      pair.style.setProperty('--i', i);
      pairsBox.append(pair);
    });

    // The mark travels with the letter wherever it sits. Not drilled, and not a word.
    if (rows.length) {
      joinedGlyph.textContent = rows[0].joined;
      arabic(joinedGlyph);
    }
    joinedText.textContent = say(words.joined);
    joinedNote.textContent = say(words.joinedNote);
    joinedBox.hidden = !rows.length;

    paintMissed();
    positionHalos();
  }

  boardBox.addEventListener('click', (event) => {
    const tile = event.target.closest('.mark-tile');
    if (tile) peekTile(tile);
  });

  // The rows arrive 35ms apart on a new part, and leave at 150ms; not under reduced motion.
  function replayBoard() {
    pairsBox.classList.remove('arrive');
    void pairsBox.offsetWidth; // start the animation again
    pairsBox.classList.add('arrive');
    clearTimeout(replayBoard.timer);
    replayBoard.timer = setTimeout(() => pairsBox.classList.remove('arrive'), 150 + 30 * 35 + 900);
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

  // The letter just missed keeps a gold edge, so the eye goes back to the teaching half and not only to the correction.
  function paintMissed() {
    // Compared by the item's own id, so a missed twin lights the other mark's tile: the board shows where the stroke was.
    for (const tile of boardBox.querySelectorAll('.mark-tile.marked, .mark-tile.other')) {
      tile.toggleAttribute('data-missed', Boolean(missedId) && tile.dataset.id === missedId);
    }
  }

  // A question, on the board -------------------------------------------------------------------------

  const recorded = (item) => Boolean(audio() && audio().has(item.audio.kind, item.audio.glyph));

  // The four ways to ask (docs/lesson-4/03 §5). The last is the only one that tests what the lesson is for, and the only
  // one a screen reader can use, so it is built now and waits behind available() for the teacher's recordings: the
  // stand-in hum is never a question, because a prompt that says nothing cannot be answered.
  const MARK_TO_NAME = { id: 'mark-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: () => true };
  const NAME_TO_MARK = { id: 'name-to-mark', ask: 'name', answerWith: 'glyph', minStreak: 1, available: () => true };
  const SOUND_TO_MARK = {
    id: 'sound-to-mark',
    ask: 'sound',
    answerWith: 'glyph',
    minStreak: 1,
    // Only the marked letters have a recording of the SOUND; a bare review letter's recording is its name.
    available: (item) => item.marked && recorded(item),
  };

  // The one line that makes hearing the first way to ask, the moment the recordings exist (docs/lesson-4/06 §2).
  const SOUND_FIRST = false;

  const soundCount = () => shell.lettersOf().filter(([glyph]) => audio() && audio().has(mark.audio, glyph)).length;

  // Mixed, a letter is first named from its picture; only once that has been answered is it asked the other way round.
  function formatsFor(kind) {
    if (kind === 'name') return [{ ...NAME_TO_MARK, minStreak: 0 }];
    if (kind === 'sound') return [{ ...SOUND_TO_MARK, minStreak: 0 }];
    if (kind === 'mix') return [MARK_TO_NAME, NAME_TO_MARK, SOUND_TO_MARK];
    return SOUND_FIRST && soundCount() ? [{ ...SOUND_TO_MARK, minStreak: 0 }, MARK_TO_NAME] : [MARK_TO_NAME];
  }

  function buildPrompt(q) {
    prompt.textContent = '';
    prompt.dataset.mode = q.prompt.mode;
    if (q.prompt.mode === 'glyph') {
      const shown = arabic(el('span', 'prompt-glyph', q.prompt.glyph));
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
        // Named by the letter's name, with the letter itself hidden from a screen reader: the same as Lesson 2's tiles.
        inner.className = 'choice-glyph';
        arabic(inner);
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
    // "Which one carries the mark?" is only a fair question of the lesson's own item: a twin carries the other mark, and the
    // line would name the wrong one.
    const spot = q.prompt.mode === 'name' && isOwn(q.item) && ['mark-or-not', 'which-mark'].includes(distractors());
    const text = { glyph: askLine.dataset.glyph, name: spot ? askLine.dataset.spot : askLine.dataset.name, sound: askLine.dataset.sound }[q.prompt.mode];
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
    // A bare letter has no mark, and "Yes, Baa with zabar" under a bare ب would be wrong: those have lines of their own.
    const d = verdictLine.dataset;
    const text = v.item.marked ? (v.right ? d.right : d.wrong) : (v.right ? d.rightBare : d.wrongBare);
    // {mark} is the stroke the letter really carries: a twin says "zabar" under a lesson about zair, because it is one.
    verdictLine.textContent = say(text, {
      name: v.item.letterName, chosen: v.chosen.name, mark: v.item.markName, Mark: marks.cap(v.item.markName),
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
      missedId = v.item.marked ? v.item.id : ''; // a twin too: its own tile is on the board, in the middle column
      paintMissed();
    }

    // Seeing the letter and hearing it are the same moment. Nothing plays if the sound is off.
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

  after.querySelector('.next-question').addEventListener('click', () => {
    view.focusChoice = true;
    drill.next();
  });

  after.querySelector('.hear').addEventListener('click', () => {
    const v = view.verdict;
    if (v && audio() && v.item.audio) audio().play(v.item.audio.kind, v.item.audio.glyph);
  });

  // The writing board opens on the letter WITH its mark, not the bare letter as Lesson 3 does: writing the mark is the
  // lesson, and it is the part with a real chance of being drawn in the wrong place (docs/lesson-4/06 §4). A bare review
  // letter opens bare. trace.js draws the guide and centres it on its ink, so the pair is what gets centred.
  const trace = (item) => {
    if (item && window.qaidaTrace) window.qaidaTrace.open(item.marked ? item.glyph : item.base, item.name);
  };
  after.querySelector('.trace').addEventListener('click', () => trace(view.verdict && view.verdict.item));
  struggle.querySelector('.trace').addEventListener('click', () => trace(view.struggling));

  // "Show me": back up to the teaching half, with that letter marked.
  struggle.querySelector('.show-me').addEventListener('click', () => {
    if (view.struggling) {
      missedId = view.struggling.marked ? view.struggling.id : '';
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
    // Review is not what this lesson is about, so it is never advice: not a bare letter, and not the other mark's twin.
    if (!isOwn(item)) return;
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
    verdictLine.textContent = code === 'formats' ? soundNote.dataset.none : verdictLine.dataset.poolError;
  }

  // Which parts have just become ready. The engine's own `ready` fires once a visit and so cannot tell part 1 from part 2
  // after `setItems`; every part is measured here instead. A part already ready on the way in is not congratulated.
  function watchReady(quiet) {
    let crossed = 0;
    for (const n of marks.DRILLING) {
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

  // No counts on the page (the user, 2026-09-20). The bar is the whole lesson and a few plain words say how it is going;
  // the line under it appears only when the open part is done. The numbers still drive the bar, the rail's fills and the
  // home's card; they are just not shown.
  const stageOf = (fraction) => (fraction <= 0 ? 0 : fraction < 0.4 ? 1 : fraction < 0.75 ? 2 : fraction < 1 ? 3 : 4);

  function paintProgress() {
    if (!drill) return;
    // The engine writes the size of the OPEN PART as the lesson's total, because that is all it was handed. The home reads
    // that number to draw its card, so the whole lesson's is put back here (docs/lesson-4/03 §2). The bare review letters
    // are not required, so neither number ever counts them.
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

    // A letter the advice was about, once it is known again, no longer needs the advice.
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

  // The next lesson: a real link once it is built, and a note until then (which is how Lesson 2 waited for Lesson 3).
  function nextEntry() {
    return shell.LESSONS.find((entry) => entry.n === LESSON + 1);
  }

  next.addEventListener('click', () => {
    const entry = nextEntry();
    if (entry && entry.built && entry.href) location.href = entry.href;
    else shell.say(say(next.dataset.soon));
  });

  function paintNext() {
    const entry = nextEntry();
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const text = say(name === 'zabar' ? next.dataset.nextZabar : next.dataset.nextFatha);
    next.querySelector('span').textContent = entry ? text : '';
  }

  function paintHead() {
    const name = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const title = heading.dataset[name === 'zabar' ? 'titleZabar' : 'titleFatha'] || '';
    heading.textContent = title;
    document.title = document.title.replace(/^[^·]*/, `Lesson ${LESSON}: ${title} `);
    // The lesson's subject in one glyph: composed, never pasted (docs/lesson-4/02 §1). The mark's own sample letter: baa
    // carries a dot exactly where zair goes, so it would be the worst letter to show the lesson by (docs/lesson-5/02 §5).
    titleMark.textContent = marks.glyphOf(mark.sample, mark);
  }

  // Sound ------------------------------------------------------------------------------------------

  // A recording belongs to a letter, so the count is of letters. They arrive a few at a time; one honest line says where
  // things have got to.
  function paintSound() {
    if (!soundNote || !audio()) return;
    const count = soundCount();
    soundNote.hidden = count === shell.lettersOf().length;
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

  const shapeOf = () => [
    shell.state.script, mark.id, distractors(), reviewCount(), twinsOn(), lookAlikes().map((list) => list.join('')).join(','),
  ].join('|');

  function build() {
    items = marks.allItems(shell, mark, { templates: templates(), distractors: distractors(), looks: lookAlikes() });
    usePool(group);
  }

  // Seen quietly: whatever is already ready on the way in, or after the letters changed, is not "just now".
  function seedReady() {
    ready.clear();
    for (const n of marks.DRILLING) if (stat(n).ready) ready.add(n);
  }

  function render() {
    const wanted = shapeOf();
    paintHead();
    if (!drill) {
      build();
      shape = wanted;
      group = upTo();
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
        familyFirst: distractors() !== 'any',
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
      // A new script, review or way of choosing wrong answers: a different set of items, and a fresh question to show it.
      // What was learnt is kept under each id, so switching script keeps every letter known.
      build();
      shape = wanted;
      view.struggling = null;
      seedReady();
      drill.set({ familyFirst: distractors() !== 'any' });
      drill.setItems(pool);
      renderBoard();
    } else {
      // Only the names changed (or a line of wording): the same items with new words.
      marks.rename(items, shell, mark, templates());
      marks.rename(pool, shell, mark, templates());
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
  if (audio()) audio().ready.then(() => {
    paintSound();
    if (drill) drill.set({ formats: formatsFor(mode) });
  });

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
    get group() {
      return group;
    },
    get review() {
      return reviewCount();
    },
    // Whether there is a mark before this one to be told apart from, and whether its letters are riding along.
    hasOther: Boolean(other),
    get twins() {
      return twinsOn();
    },
    setPause(ms) {
      pause = ms;
    },
    setFormat(kind) {
      mode = kind === 'glyph' ? 'mark' : kind;
      drill.set({ formats: formatsFor(mode) });
    },
    setChoices: (n) => drill.set({ choices: n }),
    setTarget: (n) => drill.set({ target: n }),
    setReadyAt: (fraction) => drill.set({ readyAt: fraction }),
    set: (partial) => drill.set(partial),
    // Any part, at any time: nothing is locked.
    setGroup: (n) => setGroup(n),
    // What each part costs, so the options panel can show the teacher the numbers before asking (docs/lesson-4/09 §2).
    groupCosts: () => marks.sizes(items).map((count, i) => ({
      n: i + 1, items: count, answers: Math.ceil(count * readyAt() - 1e-9) * target(),
    })),
    // How many bare letters ride along. The option has set the attribute; the pool is rebuilt to match.
    setReview: () => render(),
    setDistractors: () => render(),
    // The other mark riding along, on or off: the option has set the attribute; the pool is rebuilt to match.
    setTwins: () => render(),
    // A new question even if this one is unanswered: for trying things, so it leaves no mark on the letter.
    next: () => drill.next(true),
    again: () => drill.again(),
    masterAll: () => drill.masterAll(),
    get sound() {
      return soundCount();
    },
  };
})();
