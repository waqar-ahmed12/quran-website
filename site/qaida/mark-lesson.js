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
  // `own` is every mark this lesson teaches, in lesson order: a list of one on lessons 4-6 (data-mark names a
  // single mark), three on Lesson 7 (data-mark="tanween" names a SET — docs/lesson-7/03 §2). `parts` is what
  // partsOf() makes of it: two parts for one mark (unchanged), one part per mark plus a last "every letter" part
  // for several. `mark` is a moving target from here on: the OPEN PART's mark, kept current by setGroup(), and it
  // is what every "the lesson's own mark" read in this file now means (docs/lesson-7/03 §2's table) unless a
  // comment says otherwise.
  const own = marks.marksOf(root.dataset.mark);
  if (!own.length) return;
  const set = marks.setOf(root.dataset.mark); // the lesson's own word ("tanween"); null on lessons 4-6
  const parts = marks.partsOf(own);
  let mark = own[0];

  const LESSON = own[0].lesson;
  const LAST = parts[parts.length - 1].n;
  const DRILLING = parts.map((p) => p.n); // the one-mark case is [1, 2]; Lesson 7's is [1, 2, 3, 4]
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
  // New on Lesson 8 (docs/lesson-8/04 §4): null on lessons 4-7, which don't have these elements at all.
  const lamAlifNote = $('.lam-alif-note');
  const skipNote = $('.skip-note');
  // New on Lesson 9 (docs/lesson-9/04 §4): null on lessons 4-8, which teach no mark with `same` and never turn the
  // joined block off.
  const metNote = $('.met-note');
  // New on Lesson 10: null everywhere else.
  const jazamNote = $('.jazam-note');
  const madaniNote = $('.madani-note');
  // New on Lesson 14 (docs/lesson-14/04 §3): the three lines a lead needs. Null on every other page.
  const leadLine = $('.lead-line');
  const leadsNote = $('.leads-note');
  const wyNote = $('.wy-note');
  // New on Lesson 15 (docs/lesson-15/03 §4): the hum on noon and meem. Null on every other page.
  const humNote = $('.hum-note');
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
  const prev = $('.prev');

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
  const partOf = (n = group) => parts.find((p) => p.n === n) || parts[0];
  const currentPart = () => partOf();
  // A mark with nothing before it (the first) has no "other mark" to be told apart from, so which-mark falls back to the
  // look-alike wrong answers there instead of asking a question with no contrast in it. On a lesson with several marks
  // (Lesson 7), the LAST part is shown against the lesson's OTHER marks — own.slice(1), since `mark` is own[0] there
  // (partsOf's own choice) — never its single counterpart, which is last lesson's skill (docs/lesson-7/03 §5). A
  // one-mark lesson's own "every" part has nothing else in `own` to slice, so it falls through to the single
  // counterpart unchanged, exactly as lessons 5 and 6 already read it.
  const others = () => (currentPart().every && own.length > 1 ? own.slice(1) : marks.othersOf(mark));
  const other = () => others()[0] || null;
  const distractors = () => {
    const wanted = root.dataset.distractors;
    if (wanted === 'which-mark') return other() ? 'which-mark' : 'look-alike';
    return ['mark-or-not', 'any'].includes(wanted) ? wanted : 'look-alike';
  };
  // The other marks' letters ride along as wrong answers unless the teacher turns them off (docs/lesson-5/06 §2).
  //   alternate: one twin per letter, zabar or zair by turns, flipping between the parts, so the review stays the size
  //              Lesson 5 measured (docs/lesson-6/03 §4). With only one other mark this is the same as `both`.
  //   both:      every letter against every other mark. `on` is the old word for it and still works: it may be in a
  //              teacher's exported setting.txt.
  const twinMode = () => {
    if (!others().length || root.dataset.twins === 'off') return 'off';
    return root.dataset.twins === 'alternate' ? 'alternate' : 'both';
  };
  const twinsOn = () => twinMode() !== 'off';
  const reviewCount = () => {
    const n = Math.round(Number(root.dataset.review));
    // None unless the teacher asks: the user, 2026-09-20, "don't add simple alphabets without symbols". A plain letter is a
    // different question from the mark this lesson is about, and it was coming up as much as the marked ones.
    return Number.isFinite(n) ? Math.min(16, Math.max(0, n)) : 0;
  };
  // The trio (the letter, the letter with the other mark, the letter with this one) needs an other mark to show, and the quartet
  // (all of the marks taught so far) needs two; a board asked for and not available falls back one step, so a value typed into
  // another lesson's panel gives that lesson's own board rather than a broken one (docs/lesson-6/04 §3). `auto` (Lesson 7's
  // default) picks whichever of those the OPEN PART can actually show: a trio in a warm-up, a quartet in the last part.
  const boardMode = () => {
    const wanted = root.dataset.board;
    if (wanted === 'marked') return 'marked';
    if (wanted === 'auto') return others().length > 1 ? 'quad' : other() ? 'trio' : 'pairs';
    if (wanted === 'quad' && others().length > 1) return 'quad';
    if ((wanted === 'quad' || wanted === 'trio') && other()) return 'trio';
    return 'pairs';
  };
  // An arrow before a tile says "and now with this mark". Three in a row is noise, so a quartet draws only the last, the mark
  // the lesson is about, unless the teacher says otherwise. The trio and the pairs keep every arrow they always had.
  const arrowBefore = (index, count) => {
    const wanted = root.dataset.arrows || (boardMode() === 'quad' ? 'last' : 'all');
    return wanted === 'none' ? false : wanted === 'last' ? index === count - 1 : true;
  };
  // Whose stroke an item carries, for the advice: is it one of the OPEN PART's own required items? Reads part
  // membership directly (docs/lesson-7/03 §4: an item can belong to more than one part), rather than comparing the
  // item's own mark against the page's current one — on Lesson 7's last part an item may carry any of the three
  // marks by rotation, and it is still this part's own. A twin and a bare letter are review: never advice, never
  // counted, never the gate, because they are in no part at all.
  const isOwn = (item) => Boolean(item) && marks.inPart(item, group);
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

  // {mark} and {Mark} are filled from the OPEN PART's own mark (docs/lesson-7/03 §6), so switching part or names
  // rewrites the page without a reload. {set} is the lesson's own word ("tanween"), empty on lessons 4-6.
  // {jazam} and {lead} (Lesson 15, docs/lesson-15/04 §3) are the student's own words for the jazam and for the vowel on
  // the lead alif; a line that names either does not have to know which set of names is showing.
  const say = (text, values = {}) => fill(text, {
    ...marks.wordsFor(mark, shell), set: set ? set.names[shell.state.names === 'zabar' ? 'zabar' : 'fatha'] : '',
    Set: set ? marks.cap(set.names[shell.state.names === 'zabar' ? 'zabar' : 'fatha']) : '',
    jazam: marks.nameOf(marks.markOf('sukun'), shell), lead: marks.nameOf(marks.markOf('fatha'), shell), ...values,
  });

  // A part's own name, filled from ITS OWN mark — not the page's current one (docs/lesson-7/04 §3): the rail shows
  // all four parts at once, so "Meet {mark}" has to read "Meet kasratain" on button 2 even while part 1 is open.
  const groupName = (n) => fill(bandsNav.dataset[`group${n}`] || '', marks.wordsFor(partOf(n).mark, shell));

  // The parts -------------------------------------------------------------------------------------------

  const stat = (n) => marks.stats(shell, LESSON, items, n, { target: target(), readyAt: readyAt() });
  // The lesson is ready when the last part is: all of the letters at four fifths, with nothing shaky.
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
      const part = partOf(n);
      button.querySelector('.band-glyph').textContent = marks.sampleOf(shell, part.mark, part);
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
    const twins = plan.twins ? twinsFor(own, n, options) : [];
    const bare = marks.reviewItems(shell, mark, { ...options, count: plan.bare, prefer: plan.prefer });
    return [...own, ...twins, ...bare];
  }

  // Which marks a given item is told apart from: its own single counterpart, unless this is a lesson with several
  // marks AND the open part is the last one, where it is the OTHER marks the lesson teaches — "which two?", not
  // "one or two?" again (docs/lesson-7/03 §5). Per item, not per part: on Lesson 7's last part an item may carry
  // any of the three marks by rotation, and its twins are always the OTHER two, whichever it is.
  function twinMarksFor(item) {
    const self = marks.markOf(item.mark);
    if (!self) return [];
    return currentPart().every && own.length > 1 ? own.filter((m) => m !== self) : marks.othersOf(self);
  }

  // Which of the other marks each letter is told apart from. Every own item still has exactly one same-letter twin at least,
  // which is what the engine's familyFirst needs to make one wrong answer "the same letter, another mark". When alternating, the
  // mark for a letter is chosen by its place in a teaching order that does not depend on the part (the mark's own six, then the
  // rest), plus the part: so part 1 is balanced, and every letter drilled against zabar in part 1 meets zair in part 2
  // (docs/lesson-6/03 §4). With one other mark this is every letter against it, as Lesson 5 always was.
  function twinsFor(ownItems, n, options) {
    const keysBy = new Map();
    const every = shell.lettersOf().map(([glyph]) => shell.keyOf(glyph));
    const order = [...mark.first, ...every.filter((key) => !mark.first.includes(key))];
    ownItems.forEach((item) => {
      const at = Math.max(0, order.indexOf(item.key));
      const wanted = twinMarksFor(item);
      if (!wanted.length) return;
      const chosen = twinMode() === 'alternate' ? [wanted[(at + n) % wanted.length]] : wanted;
      for (const m of chosen) {
        keysBy.set(m, [...(keysBy.get(m) || []), item.key]);
      }
    });
    return [...keysBy].flatMap(([m, keys]) => marks.twinItems(shell, mark, { ...options, keys, marks: [m] }));
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
    mark = (parts.find((p) => p.n === n) || parts[0]).mark; // the open part's own mark, from here until the next switch
    // Where the stroke sits, for the stylesheet: a mark below the letter shares its strip with the dots below and the
    // tails, so the tiles need room at the other end (docs/lesson-5/02 §2). Page-wide, for things that are not a
    // .mark-tile (docs/lesson-7/03 §7 moves the tile's own rule to the tile itself, below).
    root.dataset.sits = mark.sits;
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
  // Lesson 9's same-sound tile (docs/lesson-9/03 §7): joined by an "=" sign, not the arrow that means "and now with
  // this mark" — the two spellings are not a sequence, they are the same sound twice.
  const EQUALS = '<span class="pair-equals" aria-hidden="true">=</span>';

  // "Where you will meet it" (docs/lesson-9/04 §4): one real word per warm-up mark, the same three the walkthrough
  // and the exercise page already use (docs/lesson-9/05 §2-3) — small on purpose, so this stays a page-local look-up
  // rather than a reach into spell.js's own word list. `standing-kasra` and `inverted-damma` are the words the Qur'an
  // actually carries them in: on ه, after a letter with a vowel (docs/lesson-9/02 §5).
  const MET_WORDS = {
    'standing-fatha': [['ه', 'standing-fatha'], ['ذ', 'fatha-alif']], // haadhaa, "this"
    'standing-kasra': [['ب', 'kasra'], ['ه', 'standing-kasra']], // bihii, "with it"
    'inverted-damma': [['ل', 'fatha'], ['ه', 'inverted-damma']], // lahuu, "for him"
  };
  // The active script's own glyph for a letter, by its key, the same map spell.js and exercise.js build.
  function glyphOfRoot(root) {
    const names = new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), glyph]));
    return root.map(([key, id]) => marks.glyphOf(names.get(key) || key, marks.markOf(id))).join('');
  }
  // The consonant a letter is said with, for the sounds in Lesson 15's captions (a-ba, ab, ab-ba - docs/lesson-15/01
  // §3): the row that is featured is the part's first letter, which is baa in three parts and taa in the other. The
  // caption's own wording is the page's text field; only the letter is filled in, as {c}. The Arabic letters are keys
  // (the Madani form, as everywhere), so nothing here is a combining mark.
  const CONSONANT = {
    ا: "'", ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh', د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd',
    ط: 't', ظ: 'z', ع: "'", غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w', ي: 'y', ء: "'",
  };
  // 'standing-fatha' -> 'StandingFatha', to match data-met-standing-fatha's camelCased dataset key.
  const pascalOf = (id) => id.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());

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
  // `kind` is 'bare', 'marked' (this lesson's stroke, the one that is pointed at) or 'other' (a stroke it is shown against:
  // `stroke` says which, for a board with more than one).
  function markTile(kind, letter, label, stroke) {
    const strokeOf = kind === 'marked' ? mark : kind === 'other' || kind === 'same' ? stroke || other() : null;
    const button = el('button', `letter mark-tile ${kind}`);
    button.type = 'button';
    button.dataset.kind = kind;
    button.dataset.base = letter;
    // Which end of the tile the stroke needs room at (docs/lesson-7/03 §7): a mixed row (Lesson 7's last part) can
    // hold marks above and below at once, so the rule that used to hang off the whole page now hangs off the tile.
    button.dataset.sits = strokeOf ? strokeOf.sits : 'above';
    // Two letters, not one (Lesson 8's alif; lessons 10-13's wow and yaa; Lesson 9's Madani khari zair and ulta
    // paish, whose small yaa/waw take room after the letter too — docs/lesson-9/03 §4): wider, never taller
    // (docs/lesson-8/03 §6). Read through formOf so a form with no tail of its own (every Indo-Pak stroke) never
    // widens, even when the SAME mark has one in the other script.
    //
    // The lead (Lesson 14's alif with zabar, docs/lesson-14/03 §2): drawn in front of every tile but the bare one,
    // and it makes the tile two letters wide as a tail does. The other mark's own lead if it has one, else the
    // lesson's; '' on every lesson but 14.
    const lead = strokeOf ? marks.leadOf(strokeOf) || marks.leadOf(mark) : '';
    button.toggleAttribute('data-tail', Boolean(strokeOf && (marks.formOf(strokeOf).tail.length > 0 || lead)));
    // The same id the engine gives that item, so "the letter just missed" can be found by comparing them.
    button.dataset.id = shell.keyOf(letter) + (strokeOf ? marks.suffixOf(strokeOf) : '');
    button.dataset.audio = strokeOf ? strokeOf.audio : 'letters';
    button.setAttribute('aria-label', label);
    const glyph = arabic(el('span', 'glyph'));
    if (kind === 'marked' && pointMode() === 'tint') {
      // Fragile on purpose: the mark (and, with a tail, what follows it — docs/lesson-8/03 §2) in a span of its
      // own, so the teacher can see what that does to the attachment.
      glyph.append(document.createTextNode(lead + letter), el('span', 'tinted', marks.drawnOf(strokeOf)));
    } else {
      glyph.textContent = strokeOf ? lead + marks.glyphOf(letter, strokeOf) : letter;
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
    const script = shell.state.script;
    // The stroke AND the script join the cache key (docs/lesson-8/03 §7, docs/lesson-9/03 §5): a page can hold a
    // tailed and an untailed stroke ("baa" and its twin "ba") at once, and the two need two different boxes for the
    // same letter; and a mark whose Madani and Indo-Pak forms differ (Lesson 9's) needs two boxes even for the
    // letter, spec and mark id alone — the two scripts can share a face (Scheherazade New set for both) and would
    // otherwise collide.
    const key = `${letter}|${spec}|${mark.id}|${script}`;
    if (boxes.has(key)) return boxes.get(key);
    let box = null;
    try {
      const canvas = document.createElement('canvas');
      const c = canvas.getContext && canvas.getContext('2d', { willReadFrequently: true });
      if (c) {
        const S = 100; // font size, in pixels; the box is kept in units of it
        const W = 420;
        const H = 420;
        const form = marks.formOf(mark, script);
        const tailed = form.tail.length > 0;
        // A mark with a tail (docs/lesson-8/03 §7) draws from the RIGHT edge, not centred: "baa" is wider than
        // "ba", so centring each draw on its own would slide the shared letter sideways between the two and the diff below
        // would see the whole letter move, not just the alif. Anchored at the right edge instead, the shared
        // letter+mark prefix lands on the same pixels in both draws (Arabic runs right to left from there).
        // Lesson 14's lead (docs/lesson-14/03 §3) is drawn right-anchored the same way: the lead is on the right and
        // the letter to its left, so the shared "lead + letter" lands on the same pixels in both draws and the diff
        // is the jazam alone. positionHalos anchors right for the same tiles, which carry data-tail.
        const lead = marks.leadOf(mark, script);
        const wide = tailed || Boolean(lead);
        const X = wide ? W - 40 : W / 2; // the text is anchored here (centre, or the right edge), baseline at Y
        const Y = 270;
        canvas.width = W;
        canvas.height = H;
        const draw = (text) => {
          c.clearRect(0, 0, W, H);
          c.font = `${weight} ${S}px ${family}`;
          c.textAlign = wide ? 'right' : 'center';
          c.textBaseline = 'alphabetic';
          c.fillText(text, X, Y);
          return c.getImageData(0, 0, W, H).data;
        };
        // The ring should say "look at what THIS lesson added", not "look at everything that changed" (docs/lesson-8/03
        // §7, generalised for docs/lesson-9/03 §5): `head` is the letter already carrying every mark but the last one a
        // form draws, plus, when the form has a tail, an invisible joiner (U+200D — Lesson 3's trick for a start
        // shape) so the letter is in the shape it takes before that tail. The difference against the WHOLE glyph is
        // then just the one new stroke — the alif on Lesson 8, the small alif/yaa/waw on Lesson 9's Madani forms, the
        // standing mark itself on Lesson 9's Indo-Pak forms (whose `head` is plainly the bare letter, `form.cp` being
        // one mark long). On a letter that never joins forward the joiner does nothing; on laam and alif together the
        // head (laam's start shape) and the whole (one ligature) differ almost entirely, which is honest — the whole
        // shape really is what is new there.
        const head = tailed
          ? letter + String.fromCharCode(...form.cp) + String.fromCharCode(0x200D)
          : letter + String.fromCharCode(...form.cp.slice(0, -1));
        const plain = draw(lead + head);
        const withMark = draw(lead + marks.glyphOf(letter, mark, script));
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
        // Measured 2026-09-29 in the browser pane (docs/lesson-14/03 §3): with the lead, Scheherazade New re-draws laam
        // as another variant when a Madani jazam is added (the string is 6px wider at 100px), so the diff above holds
        // the whole letter and the ring came out 0.47 x 1.03em, not the jazam's 0.26 x 0.17em. A mark is never taller
        // than a third of an em, so when the box is, the mark is the highest new ink: keep only a band of its own
        // height (0.2em) from the top of it. Only with a lead, so lessons 4-13's rings are measured exactly as before.
        if (lead && x1 >= 0 && y1 - y0 + 1 > S * 0.3) {
          const bottom = Math.min(H, Math.round(y0 + S * 0.2));
          let bx0 = W;
          let bx1 = -1;
          let by1 = -1;
          for (let y = y0; y < bottom; y += 1) {
            for (let x = 0; x < W; x += 1) {
              const at = (y * W + x) * 4 + 3;
              if (withMark[at] - plain[at] > 60) {
                if (x < bx0) bx0 = x;
                if (x > bx1) bx1 = x;
                by1 = y;
              }
            }
          }
          if (bx1 >= 0) { x0 = bx0; x1 = bx1; y1 = by1; }
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
      // A tailed tile's box was measured from the glyph's right edge, not its centre (markBox, docs/lesson-8/03
      // §7): anchor the ring the same way, or it would be placed as if "baa" were centred like "ba".
      const cx = tile.hasAttribute('data-tail')
        ? g.right - t.left - inset
        : g.left + g.width / 2 - t.left - inset;
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

  function pairCell(kind, letter, label, caption, stroke) {
    const cell = el('div', `pair-cell ${kind}`);
    cell.append(markTile(kind, letter, label, stroke), el('span', 'pair-caption', caption));
    cell.lastChild.setAttribute('aria-hidden', 'true');
    return cell;
  }

  function pairOf(row, { feature = false, labels } = {}) {
    const words = templates();
    const bare = fill(words.bare, { name: row.name });
    const withMark = say(words.marked, { name: row.name });
    // The trio shows where the stroke moved: the letter, then with the mark of the lesson before, then with this one. The quartet
    // is the same with every mark taught so far, in the order they were taught; the trio of a lesson with two of them shows the
    // nearest, which is the first.
    const board = boardMode();
    const middle = board === 'quad' ? row.others : board === 'trio' ? row.others.slice(0, 1) : [];
    const pair = el('div', `pair${feature ? ' feature' : ''}${board === 'trio' || board === 'quad' ? ` ${board}` : ''}`);
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
    const count = middle.length + 1;
    middle.forEach((one, i) => {
      // That mark's own word, not this lesson's: "Baa with zabar" beside "Baa with zair". The caption's {other} is this column's.
      const stroke = marks.markOf(one.id);
      const withOther = say(words.marked, { name: row.name, mark: one.name });
      // A column may have a caption of its own (Lesson 15: the same row says "a-ba" for a vowel and "ab" for a jazam),
      // keyed by the mark's id: `data-pair-other-sukun` beats `data-pair-other`. Every earlier page has only the latter.
      const template = (labels && boardBox.dataset[`pairOther${pascalOf(one.id)}`]) || (labels && labels.other);
      const caption = labels ? say(template, { other: one.name, Other: marks.cap(one.name), c: CONSONANT[row.key] || '' }) : withOther;
      if (arrowBefore(i, count)) pair.insertAdjacentHTML('beforeend', ARROW);
      pair.append(pairCell('other', row.glyph, withOther, caption, stroke));
    });
    if (arrowBefore(count - 1, count)) pair.insertAdjacentHTML('beforeend', ARROW);
    pair.append(pairCell('marked', row.glyph, withMark, labels ? labels.marked : withMark));
    return pair;
  }

  function renderBoard() {
    const words = boardBox.dataset;
    const rows = marks.boardRows(shell, mark, currentPart(), { others: others() });
    // {where} says which end of the letter the OPEN PART's mark sits at — a warm-up part's mark can be either
    // (docs/lesson-7/04 §4), unlike lessons 4-6 where it never changes on the same page.
    const where = mark.sits === 'below' ? words.whereBelow : words.whereAbove;

    // The mark on its own, and where it sits. Ulta paish is not standing, it is TURNED OVER (docs/lesson-9/04 §4):
    // a mark can override the shared `markSits` line with its own, keyed `data-mark-sits-{its own id}`, and every
    // other mark simply has none to find.
    aloneGlyph.textContent = marks.aloneOf(mark);
    aloneLabel.textContent = say(words.markAlone);
    aloneSits.textContent = say(words[`markSits${pascalOf(mark.id)}`] || words.markSits, { where });

    // The featured pair: one letter twice, bare and marked, the two ways of saying it under each.
    featureBox.textContent = '';
    if (rows.length) {
      const c = CONSONANT[rows[0].key] || '';
      const feature = pairOf(rows[0], {
        // `other` is the template: each middle column fills its own {other}, and {c} is the letter's consonant.
        feature: true, labels: { bare: say(words.pairBare, { c }), other: words.pairOther,
          marked: say(words[`pairMarked${pascalOf(mark.id)}`] || words.pairMarked, { c }),
        },
      });
      // The same-sound tile (docs/lesson-9/03 §7, `04` §4): part 1 only, and only for a mark that HAS a `same` — no
      // other lesson's row does, so this is a no-op everywhere but Lesson 9's khari zabar. A plain pair-cell, never
      // an answer: it says "this is the same sound, spelled the other way", not "which one is it".
      const sameMark = currentPart().first && mark.same ? marks.markOf(mark.same) : null;
      if (sameMark) {
        const caption = say(words.same, { name: rows[0].name, sameMark: marks.nameOf(sameMark, shell) });
        feature.insertAdjacentHTML('beforeend', EQUALS);
        feature.append(pairCell('same', rows[0].glyph, caption, caption, sameMark));
      }
      featureBox.append(feature);
    }
    featureBox.append(el('p', 'mark-does', say(words.markDoes)));

    pairsBox.textContent = '';
    pairsBox.dataset.board = boardMode();
    rows.forEach((row, i) => {
      const pair = pairOf(row);
      pair.style.setProperty('--i', i);
      pairsBox.append(pair);
    });

    // The mark travels with the letter wherever it sits. Not drilled, and not a word. A tailed mark (Lesson 8's
    // alif) shows something different here (docs/lesson-8/03 §8): joinedOf would be "baa" repeated as if it were
    // one made-up word, so instead the block shows HOW the alif joins — the part's first joining letter and first
    // non-joining letter, side by side, and in the "every" part laam and alif together as a third (docs/lesson-8/02 §4's lam-alif).
    // Lesson 9 switches the whole block off (docs/lesson-9/03 §7, `04` §4): the Madani small yaa and waw do not
    // join, so "the same letter twice" has nothing true to show, and the "where you will meet it" / Madani lines
    // below take its place. The elements still exist on the page (so a null check is never needed here), they are
    // simply left empty and hidden.
    const joinedOff = boardBox.dataset.joined === 'off';
    if (rows.length && !joinedOff) {
      if (mark.tail) {
        const joining = rows.find((row) => !marks.NEVER_JOIN.includes(row.key));
        const apart = rows.find((row) => marks.NEVER_JOIN.includes(row.key));
        const examples = [joining, apart].filter(Boolean);
        // The alif is exactly an alif (not a future lesson's wow or yaa sukun): laam only forms a required
        // ligature with an alif after it, so only here does the joined block need a third example.
        if (mark.tail.length === 1 && mark.tail[0] === 0x0627) {
          const laam = rows.find((row) => row.key === 'ل');
          if (laam) examples.push(laam);
        }
        joinedGlyph.textContent = examples.map((row) => row.marked).join('  ');
      } else {
        joinedGlyph.textContent = rows[0].joined;
      }
      arabic(joinedGlyph);
    }
    joinedText.textContent = joinedOff ? '' : say(words.joined);
    joinedNote.textContent = joinedOff ? '' : say(words.joinedNote);
    // Both shown in the part that holds every letter only — the one-mark case's part 2 (docs/lesson-8/04 §4), which
    // has `first: false` but never gets `every: true` (that flag is only set on a multi-mark lesson's own last
    // part, marks.js's partsOf): the lam-alif line beside a tile the student has not reached in a warm-up, and the
    // skip note once the table actually has a gap to explain.
    const full = currentPart().every || !currentPart().first;
    // Only an alif tail makes the laam ligature: Lesson 10's wow never does (docs/lesson-10/02 §4).
    const alifTail = Boolean(mark.tail) && mark.tail.length === 1 && mark.tail[0] === 0x0627;
    if (lamAlifNote) {
      lamAlifNote.hidden = !(alifTail && full);
      if (!lamAlifNote.hidden) lamAlifNote.textContent = say(words.lamAlif);
    }
    if (skipNote) {
      skipNote.hidden = !(mark.skip && mark.skip.length && full);
      if (!skipNote.hidden) skipNote.textContent = say(words.skipNote);
    }
    // Lesson 14's three lines (docs/lesson-14/03 §4, 04 §3): all null on every other page, and all hidden when the
    // mark has no lead. `lead-line` says why the alif is there; the leads line shows the other two leads, composed
    // here from the alif and each vowel's own code point and never typed; `wy-note` is part 2 only, where the alif's
    // table holds wow and yaa.
    const lead = marks.leadOf(mark);
    if (leadLine) {
      leadLine.hidden = !lead;
      if (lead) leadLine.textContent = say(words.leadLine);
    }
    if (leadsNote) {
      leadsNote.hidden = !lead || !rows.length;
      if (!leadsNote.hidden) {
        // The lead's own vowel is its last character: swap it for each vowel the lesson is told apart from.
        const stem = lead.slice(0, -1);
        const example = marks.othersOf(mark).map((m) => stem + marks.drawnOf(m) + marks.glyphOf(rows[0].glyph, mark)).join('  ');
        const [before, after = ''] = say(leadsNote.dataset.template).split('{example}');
        leadsNote.textContent = '';
        leadsNote.append(document.createTextNode(before), arabic(el('span', 'leads-example', example)), document.createTextNode(after));
      }
    }
    if (wyNote) {
      wyNote.hidden = !(lead && full);
      if (!wyNote.hidden) wyNote.textContent = say(words.wyNote);
    }
    // Lesson 15's hum line (docs/lesson-15/03 §4): named once, shown when the open part holds a noon or a meem, never
    // drilled - the drill cannot hear a hum.
    if (humNote) {
      humNote.hidden = !rows.some((row) => row.key === 'ن' || row.key === 'م');
      if (!humNote.hidden) humNote.textContent = say(words.humNote);
    }
    // Lesson 10's one line about the small mark on the wow (docs/lesson-10/04 §3): named once, never taught or asked.
    // {jazam} is the student's own word for it, from the page's two fields.
    if (jazamNote) {
      const d = jazamNote.dataset;
      // A line per script where the scripts differ (Lesson 11: Indo-Pak marks the wow, Madani leaves it bare -
      // docs/lesson-11/03 §4). Lesson 10 has only the shared template and reads exactly what it did.
      const template = d[shell.state.script === 'indopak' ? 'templateIndopak' : 'templateMadani'] || d.template;
      jazamNote.textContent = say(template, { jazam: shell.state.names === 'zabar' ? d.jazamZabar : d.jazamFatha });
    }
    // "Where you will meet it" and the Madani note (docs/lesson-9/04 §4): in the joined block's place, one per mark,
    // shown only in that mark's own warm-up part — never on the last part, which mixes all three. `MET_WORDS` are
    // real words already used elsewhere on this lesson's own page (docs/lesson-9/05 §2-3), composed here rather
    // than typed as Arabic in an attribute (docs/lesson-4/02 §1's rule for any combining mark).
    if (metNote) {
      const show = joinedOff && currentPart().first && Boolean(MET_WORDS[mark.id]);
      metNote.hidden = !show;
      if (show) metNote.textContent = fill(words[`met${pascalOf(mark.id)}`], { example: glyphOfRoot(MET_WORDS[mark.id]) });
    }
    if (madaniNote) {
      const show = joinedOff && currentPart().first && shell.state.script === 'madani' && Boolean(mark.forms && mark.forms.madani);
      madaniNote.hidden = !show;
      if (show) madaniNote.textContent = say(words[`madani${pascalOf(mark.id)}`]);
    }
    joinedBox.hidden = joinedOff || !rows.length;

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
      shell.centerInk(prompt, shown);
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

  // Missing when the browser can't record at all (voice.js removes it): docs/your-voice/02 §1. item.audio.kind is
  // already the mark's audio key (fatha, kasra), so lessons 4, 5 and 6 are correct with no case analysis.
  const sayButton = after.querySelector('.say');
  if (sayButton) {
    sayButton.addEventListener('click', () => {
      const v = view.verdict;
      if (v && v.item.audio && window.qaidaEcho) window.qaidaEcho.open(v.item.audio.kind, v.item.audio.glyph, v.item.name);
    });
  }

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

  // The last lesson has no next one (docs/lesson-14/03 §8): with `data-last` its Next says so and goes back to the
  // Qaida, until step 11's finish screen gives it somewhere better. No other page has data-last, and no other page
  // lacks a next lesson, so nothing else changes.
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

  // The previous lesson: always built by the time this page can be reached, so a plain link (Lesson 4's own is a
  // static <a>, with no dataset here, and paints nothing). Lessons 5 and 6's follow the student's choice of names,
  // the same way the "next" button's own label does.
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
    // The lesson's subject in one glyph: composed, never pasted (docs/lesson-4/02 §1). The mark's own sample letter: baa
    // carries a dot exactly where zair goes, so it would be the worst letter to show the lesson by (docs/lesson-5/02 §5).
    titleMark.textContent = marks.leadOf(mark) + marks.glyphOf(mark.sample, mark);
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

  // The lesson's own marks, not the open part's (own.map) — the whole point of this string is to catch a change
  // that means the ITEMS must be rebuilt (script, wrong-answer choice, review count...), and switching part is not
  // one of those; setGroup()/usePool() already handle it on their own.
  const shapeOf = () => [
    shell.state.script, own.map((m) => m.id).join(','), distractors(), reviewCount(), twinMode(),
    lookAlikes().map((list) => list.join('')).join(','),
  ].join('|');

  function build() {
    items = marks.allItems(shell, own, { templates: templates(), distractors: distractors(), looks: lookAlikes() });
    usePool(group);
  }

  // Seen quietly: whatever is already ready on the way in, or after the letters changed, is not "just now".
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
      mark = partOf(group).mark; // the open part's own mark, before anything reads it (setGroup() isn't called yet)
      root.dataset.sits = mark.sits;
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
    paintPrev();
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
    // The item last answered or asked, for the top-bar Say it button to open on (docs/your-voice/04 §1).
    get lastItem() {
      const item = (view.verdict && view.verdict.item) || (view.question && view.question.item);
      return item && item.audio ? [item.audio.kind, item.audio.glyph, item.name] : null;
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
    get review() {
      return reviewCount();
    },
    // Whether there is a mark before this one to be told apart from, and whether its letters are riding along.
    // Getters, not values: on a lesson with several marks this depends on the OPEN PART (docs/lesson-7/03 §5).
    get hasOther() {
      return Boolean(other());
    },
    get otherCount() {
      return others().length;
    },
    // Whether ANY of this lesson's own marks is followed by a letter, in the CURRENT script (Lesson 8's alif;
    // lessons 10-13's wow and yaa; Lesson 9's Madani khari zair and ulta paish, whose small yaa/waw exist only in
    // Madani — docs/lesson-9/04 §9): so the options panel's two-letter-tiles row appears on Madani and not on
    // Indo-Pak, rather than being fixed to whichever part happens to be open.
    get hasTail() {
      return own.some((m) => marks.formOf(m).tail.length > 0 || Boolean(marks.leadOf(m)));
    },
    get twins() {
      return twinsOn();
    },
    get twinMode() {
      return twinMode();
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
    groupCosts: () => marks.sizes(items, parts).map((count, i) => ({
      n: parts[i].n, items: count, answers: Math.ceil(count * readyAt() - 1e-9) * target(),
    })),
    // The parts themselves, so the options panel can build a Part row for however many there are (docs/lesson-7/04 §7).
    get parts() {
      return parts.map((p) => ({ n: p.n, name: groupName(p.n) }));
    },
    // How many marks this lesson teaches: 1 on lessons 4-6, 3 on Lesson 7 — what the options panel's board row uses
    // to decide whether "A trio, then all three" (auto) is worth offering at all (docs/lesson-7/04 §7).
    get markCount() {
      return own.length;
    },
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
