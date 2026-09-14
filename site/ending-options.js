// TEMPORARY, local preview only: phase 5 options for the ending, at the top of the Options panel. Once the user
// picks, write the chosen words into index.html and the chosen look into styles.css, then delete this file, its
// <script> tag and the phase 5 TRYOUT part of styles.css (and endAt/placeEnding in main.js if "After the book" wins).
//
// Words from agent-skills:idea-refine, 2026-09-13. Who they're for: adults starting from zero, reverts, and parents
// choosing for a child, who have just watched the book open on aayat they may not be able to read yet. Each line
// comes at it differently: that moment (these pages), reassurance (every reader began with Alif), the two buttons
// spelled out, and the whole path from reading to Hifz. Left out: what the subline candidates already say (a real
// teacher, one letter at a time, one to one, every age), a free first lesson (not decided), countries, and anything
// close to the wording of the aayat. No button says "book", because how lessons get arranged isn't decided either.
//
// Second round (the user found the ending "dry", with not enough to see): what sits behind the words (nothing, a warm
// light, or the light with a large slowly turning gold star) and a name at the very end, both from
// taste-skill:minimalist-skill's advice against empty, flat sections. main.js adds "Scroll once it opens" above these.
//
// Third round: the user wants to type the words themselves, not only choose from presets — see wordmark-options.js
// for why. Every preset list here now sits beside a text field bound to the same element, so clicking a preset fills
// the field in and the field always shows what the page currently says.

(() => {
  if (!window.addOption) return;

  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const close = document.querySelector('.close');
  const line = document.querySelector('.close h2');
  const entry = document.querySelector('.entry');
  const lessons = entry.querySelector('.lessons');
  const qaida = entry.querySelector('.qaida');
  const signoff = document.querySelector('.signoff');

  const LINES = {
    'These pages': 'Learn to read these pages for yourself.',
    'Began with Alif': 'Every reader of the Qur’an began with Alif.',
    'Two ways in': 'Start on your own with the letters, or learn with a teacher.',
    'Reading to Hifz': 'Learn to read the Qur’an, then to recite it, then to know it by heart.',
  };

  // [lessons button, Qaida button]
  const WORDS = {
    Short: ['One-to-one lessons', 'Free Qaida'],
    Actions: ['Learn with a teacher', 'Start the free Qaida'],
    'Plain English': ['Lessons with a teacher', 'Learn the letters, free'],
  };

  tryoutGroup('Ending', { open: true, first: true });
  if (!matchMedia('(max-width: 767px)').matches) {
    addOption('Ending', { 'After the book': 'after', 'Under the book': 'under' }, 'after', (v) => {
      root.dataset.ending = v;
      // Under the book, the words wait until the book has made room (main.js); after it, they show as they scroll in.
      close.classList.toggle('pending', v === 'under' && !hero.classList.contains('ended'));
    });
  }
  addOption('Behind the words', { Nothing: 'plain', Light: 'light', 'Light and star': 'star' }, 'star', (v) => (root.dataset.backdrop = v));

  const lineField = addText('Closing line', line.textContent, (v) => (line.textContent = v));
  addOption('— or pick one', LINES, '', (v) => (lineField.value = line.textContent = v));

  const lessonsField = addText('Lessons button', lessons.textContent, (v) => (lessons.textContent = v));
  const qaidaField = addText('Qaida button', qaida.textContent, (v) => (qaida.textContent = v));
  addOption('— or pick a pair', Object.fromEntries(Object.keys(WORDS).map((k) => [k, k])), '', (v) => {
    [lessonsField.value, qaidaField.value] = [lessons.textContent, qaida.textContent] = WORDS[v];
  });

  addOption('Button look', { 'Gold and outline': 'solid', 'Two outlines': 'outline', Underlined: 'text' }, 'solid', (v) => (root.dataset.buttons = v));
  addOption('Stands out', { Lessons: 'lessons', Qaida: 'qaida' }, 'lessons', (v) => {
    const lead = v === 'lessons' ? lessons : qaida;
    lessons.classList.toggle('primary', lead === lessons);
    qaida.classList.toggle('primary', lead === qaida);
    entry.prepend(lead); // the leading button comes first for keyboards and screen readers too
  });

  addText('Name at the very end', signoff.textContent, (v) => (signoff.textContent = v));
  addOption('Show it', { Show: 'show', Hide: 'hide' }, 'show', (v) => (root.dataset.signoff = v));

  // Neither page exists yet, so a click on either link, in the ending or the top bar, says so instead of going nowhere.
  const NOT_BUILT = {
    '#lessons': 'Stand-in link: the one-to-one lessons page isn’t built yet.',
    '#qaida': 'Stand-in link: the free Qaida isn’t built yet.',
    '#whatsapp': 'Stand-in link: the WhatsApp number isn’t added yet.',
    '#contact-page': 'Stand-in link: the contact page with the email form isn’t built yet.',
  };
  const note = document.createElement('p');
  note.setAttribute('role', 'status');
  note.style.cssText = `
    position: fixed; left: 50%; top: 1rem; z-index: 10000; transform: translateX(-50%);
    max-width: calc(100vw - 2rem); margin: 0; padding: 0.6rem 0.9rem;
    background: rgba(20, 16, 15, 0.92); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 10px;
    font: 13px/1.3 system-ui, sans-serif; color: #FAFAF9;
  `;
  note.hidden = true;
  document.body.append(note);
  let timer = 0;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    const text = link && NOT_BUILT[link.getAttribute('href')];
    if (!text) return;
    e.preventDefault();
    note.textContent = text;
    note.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => (note.hidden = true), 3500);
  });
})();
