// TEMPORARY, local preview only: looks to try, and a text field for every line Claude wrote on the Qaida pages.
// Works on both the Qaida home and a lesson page. Once the user picks, set the picks as the data- attributes on
// <html>, then delete this file, its <script> lines and the TRYOUT part of qaida.css.

(() => {
  const shell = window.qaidaShell;
  const lesson = window.qaida; // only on a lesson page
  const home = window.qaidaHome; // only on the Qaida home
  if (!/^(localhost|[\d.]+)$/.test(location.hostname) || !shell || (!lesson && !home)) return;

  const root = document.documentElement;
  const el = (tag, text = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  };

  const panel = document.createElement('details');
  panel.className = 'tryout';
  panel.open = !matchMedia('(max-width: 767px)').matches; // closed to start with on phones
  panel.append(el('summary', 'Options'));
  document.body.append(panel);

  let group = panel;
  const section = (title, open = false) => {
    group = document.createElement('details');
    group.open = open;
    group.append(el('summary', title));
    panel.append(group);
  };

  // A row of buttons that sets one data- attribute on <html>; the current value starts pressed.
  const option = (label, choices, key, after) => {
    const row = el('div');
    row.append(el('span', label));
    for (const [text, value] of Object.entries(choices)) {
      const button = el('button', text);
      button.type = 'button';
      button.setAttribute('aria-pressed', root.dataset[key] === value);
      button.addEventListener('click', () => {
        for (const other of row.querySelectorAll('button')) other.setAttribute('aria-pressed', other === button);
        root.dataset[key] = value;
        if (after) after(value);
      });
      row.append(button);
    }
    group.append(row);
  };

  // A row of plain buttons that each do something once.
  const actions = (label, buttons) => {
    const row = el('div');
    row.append(el('span', label));
    for (const [text, run] of Object.entries(buttons)) {
      const button = el('button', text);
      button.type = 'button';
      button.addEventListener('click', run);
      row.append(button);
    }
    group.append(row);
  };

  const slider = (label, min, max, step, initial, format, pick) => {
    const row = el('div');
    const range = el('input');
    Object.assign(range, { type: 'range', min, max, step, value: initial });
    range.setAttribute('aria-label', label);
    const shown = el('output', format(initial));
    range.addEventListener('input', () => {
      shown.textContent = format(Number(range.value));
      pick(Number(range.value));
    });
    row.append(el('span', label), range, shown);
    group.append(row);
  };

  const text = (label, initial, pick) => {
    const row = el('div');
    const field = el('input');
    Object.assign(field, { type: 'text', value: initial == null ? '' : initial });
    field.setAttribute('aria-label', label);
    field.addEventListener('input', () => pick(field.value));
    row.append(el('span', label), field);
    group.append(row);
  };

  const redraw = () => {
    if (lesson) lesson.render();
    if (home) home.render();
  };

  // How strong the gold edge around a tile (or a paper card) is. Gold on cream is quiet by nature, and it reads
  // differently in the dark and the light theme, so it's a slider rather than a pick.
  const edgeNow = Number(getComputedStyle(root).getPropertyValue('--edge')) || 0.55;
  const edgeSlider = () =>
    slider('Gold edge strength', 0, 1, 0.05, edgeNow, (v) => v.toFixed(2), (v) => root.style.setProperty('--edge', v));

  if (lesson) {
    section('Letters', true);
    option('Letter tiles', { Paper: 'paper', Outline: 'line', 'Gold ink': 'gold' }, 'tiles');
    option('Letters grouped', { 'In shape families': 'families', 'Even grid': 'grid' }, 'grouping', (v) => {
      shell.state.grouping = v;
      shell.save();
      shell.renderSetup();
    });
    option('Letter size', { Comfortable: 'comfortable', Large: 'large' }, 'size');
    edgeSlider();
    option('Name shows', { 'Under the letter': 'under', 'As a tag above': 'tag', 'Letter turns over': 'turn' }, 'peek');
    slider('Name stays for', 0.8, 4, 0.1, lesson.peekMs / 1000, (v) => `${v.toFixed(1)} s`, (v) => lesson.setPeek(v * 1000));
    option('Seen letters', { 'Gold dot': 'dot', 'Gold edge': 'edge', Both: 'both' }, 'seenmark');
    option('Letters arrive', { 'One by one': 'stagger', 'All at once': 'all' }, 'arrive', () => lesson.replay());

    section('Progress and page');
    option('Progress bar', { 'Under the title': 'title', 'Stays at the top': 'top' }, 'progress');
    option('Bar look', { Line: 'line', 'A step per letter': 'steps' }, 'bar');
    option('14-lesson track', { Show: 'show', Hide: 'hide' }, 'track');
    option('After the last letter', { 'Settles down': 'settle', 'Keeps glowing': 'glow', 'No fuss': 'none' }, 'finish');
    option('Big alif by the title', { Center: 'alif', Top: 'top', Watermark: 'watermark', Hide: 'none' }, 'titlemark');
    option('Big alif font', { 'Amiri Quran': 'amiri', 'Indo-Pak Noto': 'noto', Scheherazade: 'scheherazade' }, 'titlemarkFont');
    option('Background', { Plain: 'plain', 'Soft light': 'light', 'Star pattern': 'pattern' }, 'bg');
    actions('Try it', {
      'See every letter': () => lesson.seeAll(),
      'Clear progress': () => lesson.clear(),
      'First-visit choice': () => shell.askAgain(),
    });
  }

  if (home) {
    section('The lesson list', true);
    option('Lesson cards', { Quiet: 'quiet', Paper: 'paper', 'Gold wash': 'gold' }, 'cards');
    option('Lesson numbers', { Show: 'show', Hide: 'hide' }, 'numbers');
    edgeSlider();
    option('Big alif by the title', { Center: 'alif', Top: 'top', Watermark: 'watermark', Hide: 'none' }, 'titlemark');
    option('Big alif font', { 'Amiri Quran': 'amiri', 'Indo-Pak Noto': 'noto', Scheherazade: 'scheherazade' }, 'titlemarkFont');
    option('Background', { Plain: 'plain', 'Soft light': 'light', 'Star pattern': 'pattern' }, 'bg');
    actions('Try it', {
      'Finish lesson 1': () => home.finishFirst(),
      'Clear everything': () => home.clearAll(),
      'First-visit choice': () => shell.askAgain(),
    });
  }

  section('Script and names');
  option('Madani lettering', { 'Amiri Quran': 'amiri', 'Scheherazade New': 'scheherazade' }, 'madaniFont');
  option('Indo-Pak lettering', { 'Noto Naskh Arabic': 'noto', 'Scheherazade New': 'scheherazade' }, 'indopakFont');
  // One list: the letters keep their Arabic names whichever set of mark names the student picked.
  text('Letter names (commas)', shell.namesText(), (v) => shell.setNames(v));

  // The fourteen lesson titles and lines live in shell.js, so they get their fields here rather than in the markup.
  // The title edited is the one for the set of names showing now.
  if (home) {
    section('Lesson titles and lines');
    const set = shell.state.names === 'zabar' ? 'zabar' : 'fatha';
    for (const entry of shell.LESSONS) {
      text(`Lesson ${entry.n} title`, entry.title[set], (v) => home.setTitle(entry.n, v));
      text(`Lesson ${entry.n} line`, entry.lede, (v) => home.setLede(entry.n, v));
    }
  }

  // Every line on the page: elements marked data-words edit their own text; data-words-attr lists attributes that
  // the page's script reads ("attribute|label;attribute|label").
  section('Words');
  for (const node of document.querySelectorAll('[data-words], [data-words-attr]')) {
    if (node.dataset.words) {
      text(node.dataset.words, node.textContent.trim(), (v) => (node.textContent = v));
    }
    for (const pair of (node.dataset.wordsAttr || '').split(';').filter(Boolean)) {
      const [attribute, label] = pair.split('|');
      text(label, node.getAttribute(attribute), (v) => {
        node.setAttribute(attribute, v);
        redraw();
      });
    }
  }
})();
