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

(() => {
  if (!window.addOption) return;

  const root = document.documentElement;
  const line = document.querySelector('.close h2');
  const entry = document.querySelector('.entry');
  const lessons = entry.querySelector('.lessons');
  const qaida = entry.querySelector('.qaida');

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
    addOption('Ending', { 'After the book': 'after', 'Under the book': 'under' }, 'after', (v) => (root.dataset.ending = v));
  }
  addOption('Closing line', LINES, line.textContent, (v) => (line.textContent = v));
  addOption('Button words', Object.fromEntries(Object.keys(WORDS).map((k) => [k, k])), 'Short', (v) => {
    [lessons.textContent, qaida.textContent] = WORDS[v];
  });
  addOption('Button look', { 'Gold and outline': 'solid', 'Two outlines': 'outline', Underlined: 'text' }, 'solid', (v) => (root.dataset.buttons = v));
  addOption('Stands out', { Lessons: 'lessons', Qaida: 'qaida' }, 'lessons', (v) => {
    const lead = v === 'lessons' ? lessons : qaida;
    lessons.classList.toggle('primary', lead === lessons);
    qaida.classList.toggle('primary', lead === qaida);
    entry.prepend(lead); // the leading button comes first for keyboards and screen readers too
  });

  // Neither page exists yet, so a click says so instead of going nowhere.
  const NOT_BUILT = {
    '#lessons': 'Stand-in link: the one-to-one lessons page isn’t built yet.',
    '#qaida': 'Stand-in link: the free Qaida isn’t built yet.',
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
  entry.addEventListener('click', (e) => {
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
