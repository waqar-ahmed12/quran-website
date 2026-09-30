// The free Qaida, the home: the fourteen lessons, which of them are open, and how far the student has reached.
// What's shared with a lesson page is in shell.js. QAIDA-BUILD.md step 1; the design is recorded in
// design-system/quran-landing/pages/qaida.md.

(() => {
  const shell = window.qaidaShell;
  if (!shell) return;

  const $ = (selector) => document.querySelector(selector);

  const list = $('.lessons');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const resetAll = $('.reset-all');

  const ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6" />',
    lock: '<rect x="5.5" y="10.5" width="13" height="9" rx="1.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />',
    star: '<rect x="6" y="6" width="12" height="12" /><rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />',
  };

  const icon = (name, className) =>
    `<svg class="card-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

  // The fourteen cards -------------------------------------------------------------------------

  function build() {
    const words = list.dataset;
    const column = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    const letters = shell.lettersOf().length;
    list.textContent = '';

    let part = 0;
    for (const entry of shell.LESSONS) {
      const { n } = entry;
      // The home is in two parts (docs/lesson-15/03 §7): "Learning to read" (1-14) and "Reading the Qur'an" (15-29). A
      // heading goes in when the part changes, as an item of the list that spans the whole row, so the list stays one list.
      if ((entry.part || 1) !== part) {
        part = entry.part || 1;
        const head = document.createElement('li');
        head.className = 'part-head';
        const title = document.createElement('h2');
        title.textContent = words[`part${part}`] || '';
        head.append(title);
        list.append(head);
      }
      const done = shell.isDone(n);
      const built = entry.built === true;
      // Nothing is locked (docs/lesson-2/09-going-in-order.md): finished, next up, or later. Only a lesson that
      // isn't built yet leads nowhere, and says so.
      const state = done ? 'done' : !built ? 'soon' : shell.inOrder(n) ? 'next' : 'later';

      // What the card says under its title: how far through it, or where it sits in the order.
      const where = state === 'next' ? words.next : words.later;
      let meta = where;
      if (done) meta = words.finished;
      else if (!built) meta = words.soon;
      else if (entry.progress === 'letters') {
        const seen = shell.seenCount(n);
        if (seen > 0) meta = words.progress.replaceAll('{seen}', seen).replaceAll('{total}', letters);
      } else if (entry.progress === 'drill') {
        // How many are known out of how many the lesson asks about, as the lesson last wrote it down.
        const total = shell.drillOf(n).total || letters;
        const known = Math.min(shell.masteredCount(n), total);
        if (known > 0) meta = words.known.replaceAll('{known}', known).replaceAll('{total}', total);
      }

      const item = document.createElement('li');
      item.className = 'lesson-card';
      item.dataset.state = state;
      item.style.setProperty('--i', n - 1);

      // Built: a real link, whatever the order. Not built: a button that says so, so nothing leads nowhere.
      const card = document.createElement(built ? 'a' : 'button');
      card.className = 'card';
      if (built) {
        card.href = entry.href;
        // Ahead of the next one: a word of advice first, once (the user, 2026-09-19).
        if (state === 'later') {
          card.addEventListener('click', (event) => {
            if (shell.state.skipped || !advice) return;
            event.preventDefault();
            showAdvice(entry.href);
          });
        }
      } else {
        card.type = 'button';
        card.setAttribute('aria-disabled', 'true');
        card.addEventListener('click', () => shell.say(words.standin));
      }

      // Built as nodes, not as markup: the titles and lines are editable in the options panel, and text stays text.
      const span = (className, content) => {
        const node = document.createElement('span');
        node.className = className;
        node.textContent = content;
        return node;
      };
      const number = span('card-n', String(n).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const text = span('card-text', '');
      text.append(span('card-title', entry.title[column]), span('card-lede', entry.lede), span('card-meta', meta));
      card.append(number, text);
      // The lock only ever means "not built yet", never "not earned".
      card.insertAdjacentHTML('beforeend', done ? icon('star', 'done') : built ? icon('arrow', 'go') : icon('lock', 'shut'));

      // Screen readers get the number, the title and the state in one go, without the decoration.
      card.setAttribute('aria-label', `Lesson ${n}: ${entry.title[column]}. ${meta}`);

      item.append(card);
      list.append(item);
    }
  }

  // The advice, at the door ---------------------------------------------------------------------
  // A lesson opened ahead of the next one: "it's best to go in order", and two ways out. Escape or a click outside
  // count as "Carry on anyway" — the lesson is behind it either way, and a dialog you can't dismiss is a lock.

  const advice = $('.order-advice');
  const adviceBack = advice && advice.querySelector('.order-advice-back');
  const adviceOn = advice && advice.querySelector('.order-advice-on');
  let adviceTarget = '';

  function showAdvice(href) {
    const next = shell.LESSONS.find(({ n }) => n === shell.nextUp());
    adviceTarget = href;
    adviceBack.href = next.href;
    adviceBack.textContent = adviceBack.dataset.template.replaceAll('{n}', next.n);
    advice.showModal();
  }

  function carryOn() {
    shell.setSkipped(true);
    if (advice.open) advice.close();
    if (adviceTarget) location.href = adviceTarget;
  }

  if (advice) {
    adviceOn.addEventListener('click', carryOn);
    advice.addEventListener('cancel', (event) => {
      event.preventDefault();
      carryOn();
    });
    advice.addEventListener('click', (event) => {
      if (event.target === advice) carryOn();
    });
  }

  // How far through the whole Qaida ------------------------------------------------------------

  let armed = 0; // "Start again" asks once more before clearing everything

  function disarm() {
    clearTimeout(armed);
    armed = 0;
    resetAll.textContent = resetAll.dataset.label;
  }

  function renderProgress() {
    const total = shell.LESSONS.length;
    const done = shell.doneCount();
    const fill = (text) => text.replaceAll('{done}', done).replaceAll('{total}', total);

    progressText.textContent =
      done === 0 ? progressText.dataset.none
        : done === total ? fill(progressText.dataset.all)
          : fill(progressText.dataset.template);
    bar.style.setProperty('--p', done / total);
    bar.setAttribute('aria-valuenow', done);
    bar.setAttribute('aria-valuemax', total);

    // Anything at all saved, finished or not, is worth a way to clear it.
    const started = shell.LESSONS.some(({ n }) => shell.lessonState(n).seen.length > 0 || shell.isDone(n));
    resetAll.hidden = !started;
    if (!armed) resetAll.textContent = resetAll.dataset.label;
  }

  resetAll.addEventListener('click', () => {
    if (!armed) {
      resetAll.textContent = resetAll.dataset.confirm;
      armed = setTimeout(disarm, 3000);
      return;
    }
    disarm();
    for (const { n } of shell.LESSONS) shell.clearLesson(n);
    // "Start again" already claims to clear everything; this makes that true for a voice recorded here too
    // (docs/your-voice/02 §5). A no-op today: the home doesn't load voice-store.js, only a lesson page does.
    if (window.qaidaVoiceStore) window.qaidaVoiceStore.clear();
    render();
  });

  // Drawing it all -----------------------------------------------------------------------------

  function render() {
    build();
    renderProgress();
  }

  shell.onChange(render);
  shell.renderSetup(); // draws the page for the first time, through the listener above
  if (!shell.state.chosen) requestAnimationFrame(shell.showChooser);

  // For the options panel (qaida-options.js).
  window.qaidaHome = {
    render,
    setTitle(n, text) {
      const entry = shell.LESSONS.find((lesson) => lesson.n === n);
      if (!entry) return;
      entry.title[shell.state.names === 'zabar' ? 'zabar' : 'fatha'] = text;
      render();
    },
    setLede(n, text) {
      const entry = shell.LESSONS.find((lesson) => lesson.n === n);
      if (!entry) return;
      entry.lede = text;
      render();
    },
    finishFirst() {
      for (const [glyph] of shell.lettersOf()) shell.markSeen(1, glyph);
      render();
    },
    clearAll() {
      for (const { n } of shell.LESSONS) shell.clearLesson(n);
      if (window.qaidaVoiceStore) window.qaidaVoiceStore.clear();
      render();
    },
  };
})();
