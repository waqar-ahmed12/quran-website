// TEMPORARY, local preview only: options for the top of the page, first in the Options panel. Once the user picks,
// write the chosen words into index.html and the chosen look into styles.css, then delete this file, its <script> tag,
// the "top of the page" TRYOUT part of styles.css and the "stays" check in main.js (placeTopbar).
//
// From taste-skill:redesign-skill, 2026-09-13. The user found the top of the page "very empty". The audit found no name
// or navigation, nothing telling a visitor the page scrolls, and wide empty sides round the narrow closed book. So: a
// top bar with the two links the user wants there (About and Contact go at the bottom only), a scroll hint (MASTER.md's
// scroll-story pattern asks for a cue), and a few words either side of the book. The name and years are stand-ins; the
// user said to write them for now. Every piece of wording has a text field, as the user asked in the third round.

(() => {
  if (!window.addText) return;

  const root = document.documentElement;
  const topbar = document.querySelector('.topbar');
  const name = topbar.querySelector('.name');
  const qaida = topbar.querySelector('.qaida');
  const lessons = topbar.querySelector('.lessons');
  const hint = document.querySelector('.scroll-hint span');

  // Either side of the book: [heading, lines] for the left, then the right. Lines are typed with commas between them.
  // What and how only: the user moved the teacher's name and years to the bottom of the page.
  const BESIDE = {
    'What and how': [
      ['What you learn', 'Reading from zero, Tajweed, Hifz'],
      ['How you learn', 'One-to-one, Online, Every age'],
    ],
    Shorter: [
      ['Learn', 'Reading, Tajweed, Hifz'],
      ['With', 'A real teacher, One-to-one, Online'],
    ],
  };

  tryoutGroup('Top of the page', { first: true }); // starts closed now the work has moved to the bottom

  addOption('Top bar', { Off: 'off', 'Plain links': 'links', 'Lessons as a button': 'button' }, 'button', (v) => {
    root.dataset.topbar = v;
    lessons.classList.toggle('outlined', v === 'button');
  });
  addOption('Light/dark switch', { 'Half circle': 'half', 'Sun and moon': 'sunmoon', Words: 'words' }, 'half', (v) => (root.dataset.toggle = v));
  // The switch's words (shown with "Words"), kept on the button for main.js; the one showing changes as you type.
  const themeButton = topbar.querySelector('.theme');
  const switchWord = (key) => (v) => {
    themeButton.dataset[key] = v;
    if (key === (root.dataset.theme === 'light' ? 'toDark' : 'toLight')) themeButton.querySelector('.words').textContent = v;
  };
  addText('Switch word, dark page', themeButton.dataset.toLight, switchWord('toLight'));
  addText('Switch word, light page', themeButton.dataset.toDark, switchWord('toDark'));
  addOption('Scrolling down', { 'Bar stays': 'stays', 'Bar slides away': 'hides' }, 'hides', (v) => {
    root.dataset.topbarScroll = v;
    topbar.classList.remove('away'); // back in view; it slides away again at the next scroll down
  });
  addText('Site name (stand-in)', name.textContent, (v) => (name.textContent = v));
  addText('Qaida link', qaida.textContent, (v) => (qaida.textContent = v));
  addText('Lessons link', lessons.textContent, (v) => (lessons.textContent = v));

  addOption('Scroll hint', { Show: 'show', Hide: 'hide' }, 'show', (v) => (root.dataset.hint = v));
  addText('Scroll hint words', hint.textContent, (v) => (hint.textContent = v));

  if (!matchMedia('(min-width: 1024px)').matches) return; // the sides only show on computers

  const choices = { Nothing: 'none' };
  for (const k of Object.keys(BESIDE)) choices[k] = k;
  addOption('Beside the book', choices, 'What and how', (v) => {
    root.dataset.beside = v;
    BESIDE[v]?.forEach(([heading, lines], k) => {
      sides[k].heading.value = sides[k].label.textContent = heading;
      sides[k].lines.value = lines;
      setLines(sides[k].list, lines);
    });
  });

  const sides = [...document.querySelectorAll('.beside')].map((side, k) => {
    const label = side.querySelector('.label');
    const list = side.querySelector('ul');
    const where = k ? 'Right' : 'Left';
    return {
      label,
      list,
      heading: addText(`${where} heading`, label.textContent, (v) => (label.textContent = v)),
      lines: addText(`${where} lines`, [...list.children].map((li) => li.textContent).join(', '), (v) => setLines(list, v)),
    };
  });

  function setLines(list, text) {
    const lines = text.split(',').map((line) => line.trim()).filter(Boolean);
    list.replaceChildren(...lines.map((line) => Object.assign(document.createElement('li'), { textContent: line })));
  }
})();
