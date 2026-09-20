// The free Qaida, Lesson 2: the same letters again, out of order, one question at a time. QAIDA-BUILD.md step 4; the
// specification is docs/lesson-2/. This file is the page: the pool of letters, the look-alike table, and everything
// visible. The drill itself — what to ask next, what counts as known, when to say "you seem ready" — is practice.js,
// which lessons 4 to 14 reuse, so nothing in here decides that.
//
// The wording never scolds. A wrong answer says what the letter is and nothing else; the two pieces of advice
// (a letter that keeps coming back, and "you seem to know these") are plain, short, and only ever advice.

(() => {
  const shell = window.qaidaShell;
  const engine = window.qaidaPractice;
  if (!shell || !engine) return;

  const LESSON = 2;
  const root = document.documentElement;
  const $ = (selector) => document.querySelector(selector);

  const lesson = $('.lesson');
  const drillBox = $('.drill');
  const askLine = $('.ask');
  const prompt = $('.prompt');
  const choicesBox = $('.choices');
  const verdictLine = $('.verdict');
  const announce = $('.announce');
  const after = $('.after');
  const struggle = $('.struggle');
  const struggleText = $('.struggle-text');
  const readyNote = $('.ready-note');
  const tally = $('.tally');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const reset = $('.reset');
  const endLine = $('.end-line');
  const next = $('.next');
  const soundNote = $('.sound-note');
  const groupsSource = $('[data-groups]');

  const audio = () => window.qaidaAudio;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (whole, key) => (key in values ? values[key] : whole));

  // What is on the board now, apart from what the engine holds.
  const view = {
    question: null,
    verdict: null,
    struggling: null, // the one letter the advice is about
    ready: false, // the "you seem to know these" line is showing
    input: 'pointer', // how the last answer was given: a right answer only moves on by itself for a pointer
    focusChoice: false, // Next was pressed, so the keyboard belongs on the first choice of the new question
  };

  let drill = null;
  let pool = [];
  let byId = new Map();
  let shape = ''; // which script and look-alike table the pool on screen was built for
  let mode = root.dataset.ask || 'glyph';
  let pause = 900; // how long a right answer stays before the next question, for a pointer
  let advanceTimer = 0;
  let swapTimer = 0;
  let announced = 0;

  // The letters ------------------------------------------------------------------------------------

  // "ب ت ث ن ي, ج ح خ ع غ, …" — the teacher's table of look-alikes, groups between commas. Read every time, so editing
  // the field in the options panel takes effect straight away.
  function lookAlikes() {
    const text = groupsSource ? groupsSource.dataset.groups || '' : '';
    return text
      .split(',')
      .map((group) => group.trim().split(/\s+/).filter(Boolean).map(shell.keyOf))
      .filter((group) => group.length > 1);
  }

  // One item per letter of the chosen script. Its id is the letter folded to Madani (ک is ك), so a letter known in one
  // script is known in the other. A letter can look like more than one group (و), so `family` is a list of tags.
  function makePool() {
    const groups = lookAlikes();
    const shapes = shell.familiesOf();
    return shell.lettersOf().map(([glyph, name], i) => {
      const id = shell.keyOf(glyph);
      const family = [];
      shapes.forEach((members, n) => members.includes(i) && family.push(`shape${n}`));
      groups.forEach((members, n) => members.includes(id) && family.push(`look${n}`));
      return { id, glyph, name, family, audio: { kind: 'letters', glyph }, required: true, traceable: true };
    });
  }

  const shapeOf = () => `${shell.state.script}|${lookAlikes().map((group) => group.join('')).join(',')}`;

  // The three ways to ask (docs/lesson-2/02-practice-engine.md §3). Sound needs a real recording of that letter: the
  // wordless stand-in is never a question, because a prompt that says nothing can't be answered.
  const recorded = (item) => Boolean(audio() && audio().has(item.audio.kind, item.audio.glyph));
  const GLYPH_TO_NAME = { id: 'glyph-to-name', ask: 'glyph', answerWith: 'name', minStreak: 0, available: () => true };
  const NAME_TO_GLYPH = { id: 'name-to-glyph', ask: 'name', answerWith: 'glyph', minStreak: 1, available: () => true };
  const SOUND_TO_GLYPH = { id: 'sound-to-glyph', ask: 'sound', answerWith: 'glyph', minStreak: 1, available: recorded };

  // Mixed, a letter is first named from its shape; only once that has been answered is it asked the other way round.
  // Picked on its own for a tryout, a format has no waiting to do.
  function formatsFor(kind) {
    if (kind === 'name') return [{ ...NAME_TO_GLYPH, minStreak: 0 }];
    if (kind === 'sound') return [{ ...SOUND_TO_GLYPH, minStreak: 0 }];
    if (kind === 'mix') return [GLYPH_TO_NAME, NAME_TO_GLYPH, SOUND_TO_GLYPH];
    return [GLYPH_TO_NAME];
  }

  // A question, on the board ----------------------------------------------------------------------

  function buildPrompt(q) {
    prompt.textContent = '';
    prompt.dataset.mode = q.prompt.mode;
    if (q.prompt.mode === 'glyph') {
      const letter = document.createElement('span');
      letter.className = 'prompt-glyph';
      letter.lang = 'ar';
      letter.dir = 'rtl';
      letter.textContent = q.prompt.glyph;
      prompt.append(letter);
    } else if (q.prompt.mode === 'name') {
      const name = document.createElement('span');
      name.className = 'prompt-name';
      name.textContent = q.prompt.name;
      prompt.append(name);
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
        // Named by the letter's name, with the letter itself hidden from a screen reader: the same as Lesson 1's tiles.
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

    // Seeing the letter and hearing it are the same moment. Nothing plays if the sound is off.
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

  const trace = (item) => {
    if (item && window.qaidaTrace) window.qaidaTrace.open(item.glyph, item.name);
  };
  after.querySelector('.trace').addEventListener('click', () => trace(view.verdict && view.verdict.item));
  struggle.querySelector('.trace').addEventListener('click', () => trace(view.struggling));

  // The two pieces of advice, and the end of the lesson --------------------------------------------------

  const target = () => shell.drillOf(LESSON).target;

  function paintAdvice() {
    if (view.struggling) {
      struggleText.textContent = fill(struggleText.dataset.template, { name: view.struggling.name });
    }
    struggle.hidden = !view.struggling;
    readyNote.textContent = readyNote.dataset.template;
    readyNote.hidden = !view.ready;
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

  function onReady() {
    // A recommendation, not a gate: nothing unlocks and nothing stops. It only records that the student was told.
    shell.setDone(LESSON, true);
    view.ready = true;
    paintFinished();
    paintAdvice();
    lesson.classList.add('just-finished');
    clearTimeout(onReady.timer);
    onReady.timer = setTimeout(() => lesson.classList.remove('just-finished'), 2600);
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

  // Progress ---------------------------------------------------------------------------------------

  let armed = 0; // "Start again" asks once more before clearing

  function disarm() {
    clearTimeout(armed);
    armed = 0;
    reset.textContent = reset.dataset.label;
  }

  function paintProgress() {
    const p = drill.progress();
    const done = p.total > 0 && p.known === p.total;
    progressText.textContent = fill(done ? progressText.dataset.done : progressText.dataset.template, p);
    bar.style.setProperty('--p', p.total ? p.known / p.total : 0);
    bar.style.setProperty('--total', p.total);
    bar.setAttribute('aria-valuenow', p.known);
    bar.setAttribute('aria-valuemax', p.total);
    // Read aloud as the sentence — "17 of 29 letters known" — and not as a bare 17.
    bar.setAttribute('aria-valuetext', progressText.textContent);

    tally.hidden = p.asked === 0;
    tally.textContent = fill(p.toFix > 0 ? tally.dataset.template : tally.dataset.clear, p);
    // Worth a way to clear once an answer has been given. (A letter is "seen" the moment it is asked, so `seen` alone
    // would bring the link straight back after clearing.)
    const record = shell.drillOf(LESSON);
    reset.hidden = Object.keys(record.right).length + Object.keys(record.wrong).length === 0;
    if (!armed) reset.textContent = reset.dataset.label;

    // A letter the advice was about, once it is known again, no longer needs the advice.
    if (view.struggling && (shell.drillOf(LESSON).streak[view.struggling.id] || 0) >= target()) {
      view.struggling = null;
      paintAdvice();
    }
  }

  function clear() {
    shell.clearLesson(LESSON);
    view.struggling = null;
    view.ready = false;
    drill.reset();
    paintFinished();
    paintAdvice();
    paintProgress();
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

  next.addEventListener('click', () => shell.say(next.dataset.standin)); // stand-in until Lesson 3 exists

  // Sound ------------------------------------------------------------------------------------------

  // Hearing practice needs a real recording of each letter, and they arrive a few at a time. One honest line says where
  // things have got to.
  function paintSound() {
    if (!soundNote || !audio()) return;
    const count = pool.filter(recorded).length;
    soundNote.hidden = count === pool.length;
    soundNote.textContent = fill(count === 0 ? soundNote.dataset.none : soundNote.dataset.some, {
      done: count,
      total: pool.length,
    });
  }

  // Drawing it all ---------------------------------------------------------------------------------

  function replay() {
    choicesBox.classList.remove('arrive');
    void choicesBox.offsetWidth; // start the animation again
    choicesBox.classList.add('arrive');
    clearTimeout(replay.timer);
    replay.timer = setTimeout(() => choicesBox.classList.remove('arrive'), 150 + 6 * 40 + 900);
  }

  function render() {
    const wanted = shapeOf();
    if (!drill) {
      pool = makePool();
      byId = new Map(pool.map((item) => [item.id, item]));
      shape = wanted;
      drill = engine.create({
        lesson: LESSON,
        items: pool,
        formats: formatsFor(mode),
        choices: Number(root.dataset.choices) || 4,
        familyFirst: root.dataset.distractors !== 'any',
        on: {
          question: showQuestion,
          verdict: showVerdict,
          progress: paintProgress,
          ready: onReady,
          struggling: onStruggling,
          error: onError,
        },
      });
      drill.start();
      replay();
    } else if (wanted !== shape) {
      // A new script, or an edited table of look-alikes: a different pool, and a fresh question to show it.
      pool = makePool();
      byId = new Map(pool.map((item) => [item.id, item]));
      shape = wanted;
      view.struggling = null;
      drill.setItems(pool);
    } else {
      // Only the names changed (or a line of wording): the same letters, so the same items with new names.
      shell.lettersOf().forEach(([, name], i) => {
        if (pool[i]) pool[i].name = name;
      });
      labelChoices();
    }

    paintQuestion();
    paintVerdict();
    paintProgress();
    paintFinished();
    paintAdvice();
    paintSound();
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
      return drill.settings.readyAt;
    },
    setPause(ms) {
      pause = ms;
    },
    setFormat(kind) {
      mode = kind;
      drill.set({ formats: formatsFor(kind) });
    },
    setChoices: (n) => drill.set({ choices: n }),
    setTarget: (n) => drill.set({ target: n }),
    setReadyAt: (fraction) => drill.set({ readyAt: fraction }),
    set: (partial) => drill.set(partial),
    // A new question even if this one is unanswered: for trying things, so it leaves no mark on the letter.
    next: () => drill.next(true),
    again: () => drill.again(),
    masterAll: () => drill.masterAll(),
    get sound() {
      return pool.filter(recorded).length;
    },
  };
})();
