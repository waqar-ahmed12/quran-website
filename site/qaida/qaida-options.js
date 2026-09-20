// TEMPORARY, preview only: looks to try, and a text field for every line Claude wrote on the Qaida pages.
// Works on both the Qaida home and a lesson page. Once the user picks, set the picks as the data- attributes on
// <html>, then delete this file, its <script> lines and the TRYOUT part of qaida.css.
//
// Export / Import (2026-09-19) works the same way as the landing page's panel (site/main.js): every control
// registers itself under "<section> :: <label>", Export turns the lot into one block of text, and Import reads that
// block back. That is how the user's picks reach setting.txt, and how someone else's picks can be checked here.
// Nothing in this panel survives a reload, so Export before reloading.

(() => {
  const shell = window.qaidaShell;
  const lesson = window.qaida; // only on a lesson page
  const home = window.qaidaHome; // only on the Qaida home
  if (!shell || (!lesson && !home)) return;

  const root = document.documentElement;
  const el = (tag, text = '', className = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  // Which page this is, so the per-page sections don't collide in one exported block: the home and a lesson both
  // have a "Words" section, and without this the home's "Page title" would land on the lesson's when imported.
  const numbered = location.pathname.match(/lesson-(\d+)/);
  const page = home ? 'home' : numbered ? `lesson ${numbered[1]}` : 'lesson';

  const panel = document.createElement('details');
  panel.className = 'tryout';
  panel.open = !matchMedia('(max-width: 767px)').matches; // closed to start with on phones
  panel.append(el('summary', 'Options'));
  document.body.append(panel);

  // Every control below registers itself here, keyed "<section title> :: <label>" — the same keys setting.txt uses.
  const registry = new Map();
  let group = panel;
  let sectionTitle = 'General';

  const register = (label, control) => {
    let key = `${sectionTitle} :: ${label}`;
    // Two rows can honestly share a label (two elements tagged data-words with the same words). Keep both rather
    // than letting the second quietly replace the first.
    for (let n = 2; registry.has(key); n += 1) key = `${sectionTitle} :: ${label} (${n})`;
    registry.set(key, control);
  };

  const section = (title, open = false) => {
    sectionTitle = title;
    group = document.createElement('details');
    group.open = open;
    group.append(el('summary', title));
    panel.append(group);
  };

  // A row of buttons that sets one data- attribute on <html>; the current value starts pressed.
  const option = (label, choices, key, after) => {
    const row = el('div');
    row.append(el('span', label));
    const buttons = [];
    const choose = (value, fire = true) => {
      const wanted = String(value);
      for (const [button, v] of buttons) button.setAttribute('aria-pressed', String(v === wanted));
      root.dataset[key] = wanted;
      if (fire && after) after(wanted);
    };
    for (const [text, value] of Object.entries(choices)) {
      const button = el('button', text);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(root.dataset[key] === value));
      button.addEventListener('click', () => choose(value));
      buttons.push([button, String(value)]);
      row.append(button);
    }
    group.append(row);
    register(label, { get: () => root.dataset[key], set: (value) => choose(value) });
  };

  // A row of plain buttons that each do something once. Nothing to remember, so nothing to export.
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
    const apply = (value, fire = true) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return;
      range.value = n;
      shown.textContent = format(n);
      if (fire) pick(n);
    };
    range.addEventListener('input', () => apply(Number(range.value)));
    row.append(el('span', label), range, shown);
    group.append(row);
    register(label, { get: () => Number(range.value), set: apply });
  };

  const text = (label, initial, pick) => {
    const row = el('div');
    const field = el('input');
    Object.assign(field, { type: 'text', value: initial == null ? '' : initial });
    field.setAttribute('aria-label', label);
    const apply = (value, fire = true) => {
      field.value = value == null ? '' : String(value);
      if (fire) pick(field.value);
    };
    field.addEventListener('input', () => apply(field.value));
    row.append(el('span', label), field);
    group.append(row);
    register(label, { get: () => field.value, set: apply });
  };

  const redraw = () => {
    if (lesson) lesson.render();
    if (home) home.render();
  };

  // Export and Import ---------------------------------------------------------------------------
  // Ported from site/main.js so both panels behave the same. It sits under the summary, above every section.

  // A paste can arrive clipped by a chat window or wrapped in quotes. Try honest JSON, then repair the braces,
  // then read whatever key/value pairs can still be found — better a partial import than nothing at all.
  const extractSettings = (raw) => {
    if (!raw || typeof raw !== 'string') return {};
    const trimmed = raw.trim();
    try {
      return JSON.parse(trimmed);
    } catch {}

    try {
      const firstQuote = trimmed.indexOf('"');
      if (firstQuote !== -1) {
        let candidate = trimmed.slice(firstQuote);
        if (!candidate.startsWith('{')) candidate = `{${candidate}`;
        if (!candidate.endsWith('}')) candidate = `${candidate}}`;
        return JSON.parse(candidate);
      }
    } catch {}

    const data = {};
    const pair = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*("(?:[^"\\]*(?:\\.[^"\\]*)*)"|true|false|null|-?\d+(?:\.\d+)?)/g;
    let found;
    while ((found = pair.exec(trimmed)) !== null) {
      try {
        data[JSON.parse(`"${found[1]}"`)] = JSON.parse(found[2]);
      } catch {}
    }
    return data;
  };

  const io = el('div', '', 'tryout-io');
  const ioButtons = el('div');
  const exportButton = el('button', 'Export settings');
  const copyButton = el('button', 'Copy');
  const importButton = el('button', 'Import settings');
  const clearButton = el('button', 'Clear');
  for (const button of [exportButton, copyButton, importButton, clearButton]) button.type = 'button';
  ioButtons.append(exportButton, copyButton, importButton, clearButton);

  const ioText = document.createElement('textarea');
  ioText.rows = 4;
  ioText.setAttribute('aria-label', 'Exported settings — copy this, or paste someone else’s here');
  ioText.placeholder = 'Click Export settings to copy, or paste settings here and click Import';
  const ioStatus = el('span', '', 'tryout-io-status');
  ioStatus.setAttribute('role', 'status');
  io.append(ioButtons, ioText, ioStatus);
  panel.querySelector('summary').after(io);

  const said = (message, colour) => {
    ioStatus.textContent = message;
    ioStatus.style.color = colour;
  };

  // navigator.clipboard is blocked on plain http in some browsers, and the user previews over http://localhost,
  // so the old execCommand path stays as the fallback. Either way the text is left selected in the box.
  const copyToClipboard = (value) => {
    ioText.value = value;
    ioText.focus();
    ioText.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {}
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(value).then(() => true, () => copied);
    }
    return Promise.resolve(copied);
  };

  const collect = () => {
    const data = {};
    for (const [key, control] of registry) data[key] = control.get();
    return JSON.stringify(data, null, 2);
  };

  exportButton.addEventListener('click', () => {
    copyToClipboard(collect()).then((copied) => {
      said(
        copied ? '✓ Settings exported & copied to clipboard!' : '✓ Settings exported below — press Ctrl+C to copy.',
        copied ? '#4ade80' : '#fbbf24',
      );
    });
  });

  copyButton.addEventListener('click', () => {
    if (!ioText.value.trim()) ioText.value = collect();
    copyToClipboard(ioText.value).then((copied) => {
      said(copied ? '✓ Copied to clipboard!' : 'Selected above — press Ctrl+C to copy.', copied ? '#4ade80' : '#fbbf24');
    });
  });

  clearButton.addEventListener('click', () => {
    ioText.value = '';
    said('Cleared text box.', '#A8A29E');
  });

  importButton.addEventListener('click', async () => {
    let raw = ioText.value.trim();
    if (!raw && navigator.clipboard?.readText) {
      try {
        raw = (await navigator.clipboard.readText()).trim();
        if (raw) ioText.value = raw;
      } catch {}
    }
    if (!raw) {
      said('Paste settings into the box first, then click Import.', '#fbbf24');
      return;
    }

    const data = extractSettings(raw);
    const keys = Object.keys(data);
    if (keys.length === 0) {
      said('Could not find any settings in the pasted text.', '#f87171');
      return;
    }

    let applied = 0;
    for (const key of keys) {
      let control = registry.get(key);
      if (!control) {
        // A key exported from the other Qaida page, or from an older section name: match on the label alone.
        const label = key.includes(' :: ') ? key.split(' :: ').slice(1).join(' :: ') : key;
        for (const [known, candidate] of registry) {
          if (known === label || known.endsWith(` :: ${label}`)) {
            control = candidate;
            break;
          }
        }
      }
      if (!control) continue;
      try {
        control.set(data[key]);
        applied += 1;
      } catch {}
    }

    said(`✓ Applied ${applied} of ${keys.length} settings!`, applied > 0 ? '#4ade80' : '#f87171');
  });

  // The rows -------------------------------------------------------------------------------------

  // How strong the gold edge around a tile (or a paper card) is. Gold on cream is quiet by nature, and it reads
  // differently in the dark and the light theme, so it's a slider rather than a pick.
  const edgeNow = Number(getComputedStyle(root).getPropertyValue('--edge')) || 0.55;
  const edgeSlider = () =>
    slider('Gold edge strength', 0, 1, 0.05, edgeNow, (v) => v.toFixed(2), (v) => root.style.setProperty('--edge', v));

  // Where the buttons at the end of a lesson sit. Two different things, which is what caught us out once already:
  // taking space out ABOVE them moves them up the screen; room BELOW them only makes the page longer.
  // Both are measured off the live page, so each slider starts where the page really is.
  const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
  const inRem = (px) => Math.round((parseFloat(px) / rem) * 4) / 4;
  const show = (v) => `${v} rem · ${Math.round(v * rem)}px`;

  const footSlider = () => {
    const column = document.querySelector('.lesson, .course-home');
    const now = column ? inRem(getComputedStyle(column).paddingBottom) : 2;
    slider('Room below the buttons', 0, 10, 0.25, now, show, (v) => root.style.setProperty('--page-foot', `${v}rem`));
  };

  const gapSlider = () => {
    const end = document.querySelector('.lesson-end');
    const now = end ? inRem(getComputedStyle(end).marginTop) : 0.75;
    slider('Space above the buttons', 0, 6, 0.25, now, show, (v) => root.style.setProperty('--end-gap', `${v}rem`));
  };

  // Lesson 1 shows a page of letter tiles; Lesson 2 is a drill and has different rows. `kind` tells them apart, so a
  // drill lesson never gets a slider for "how long a name stays" that would do nothing.
  if (lesson && lesson.kind !== 'drill') {
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

    section('Sound and tracing');
    actions('Sound', {
      'Play the stand-in': () => window.qaidaAudio && window.qaidaAudio.play('letters', 'ا'),
      'Stop': () => window.qaidaAudio && window.qaidaAudio.stop(),
    });
    actions('The recording list', {
      'Open it': () => window.open('recordings.html', '_blank', 'noopener'),
    });
    actions('Tracing board', {
      'Open it on alif': () => window.qaidaTrace && window.qaidaTrace.open('ا', 'Alif'),
      'Open the blank board': () => window.qaidaTrace && window.qaidaTrace.open(),
    });

    section('Progress and page');
    option('Progress bar', { 'Under the title': 'title', 'Stays at the top': 'top' }, 'progress');
    option('Bar look', { Line: 'line', 'A step per letter': 'steps' }, 'bar');
    option('14-lesson track', { Show: 'show', Hide: 'hide' }, 'track');
    option('After the last letter', { 'Settles down': 'settle', 'Keeps glowing': 'glow', 'No fuss': 'none' }, 'finish');
    option('Big alif by the title', { Center: 'alif', Top: 'top', Watermark: 'watermark', Hide: 'none' }, 'titlemark');
    option('Big alif font', { 'Amiri Quran': 'amiri', 'Indo-Pak Noto': 'noto', Scheherazade: 'scheherazade' }, 'titlemarkFont');
    option('Background', { Plain: 'plain', 'Soft light': 'light', 'Star pattern': 'pattern' }, 'bg');
    gapSlider();
    footSlider();
    actions('Try it', {
      'See every letter': () => lesson.seeAll(),
      'Clear progress': () => lesson.clear(),
      'First-visit choice': () => shell.askAgain(),
    });
  }

  // Lesson 2, the drill (docs/lesson-2/07-options-panel.md). Everything the teacher might want to look at and decide.
  if (lesson && lesson.kind === 'drill') {
    section('The drill', true);
    option('Question', { 'Letter → name': 'glyph', 'Name → letter': 'name', 'Mix both': 'mix', 'Hear it → letter': 'sound' },
      'ask', (v) => lesson.setFormat(v));
    // Hearing needs a real recording of a letter, and none exist until the teacher's arrive. Off until then.
    const soundChoice = group.lastElementChild.querySelectorAll('button')[3];
    if (window.qaidaAudio) {
      window.qaidaAudio.ready.then(() => {
        soundChoice.disabled = lesson.sound === 0;
        soundChoice.title = soundChoice.disabled ? 'Opens when the recordings are in' : '';
      });
    }
    option('Answers to pick from', { Three: '3', Four: '4', Six: '6' }, 'choices', (v) => lesson.setChoices(Number(v)));
    option('Wrong answers offered', { 'A look-alike among them': 'family', 'Any letter': 'any' }, 'distractors',
      (v) => lesson.set({ familyFirst: v === 'family' }));
    option('After a right answer', { 'Move on by itself': 'auto', 'Wait for a tap': 'wait' }, 'advance');
    option('After a miss', { 'Offer Trace it': 'trace', 'Just the answer': 'plain' }, 'miss');
    option('Answers arrive', { 'One by one': 'stagger', 'All at once': 'all' }, 'arrive', () => lesson.replay());
    slider('Right answers in a row to know a letter', 1, 3, 1, lesson.target, (v) => String(v), (v) => lesson.setTarget(v));
    slider('Ready at (share of letters known)', 0.6, 1, 0.05, lesson.readyAt, (v) => `${Math.round(v * 100)}%`,
      (v) => lesson.setReadyAt(v));
    slider('Pause after a right answer', 0.4, 2.5, 0.1, lesson.pause / 1000, (v) => `${v.toFixed(1)} s`,
      (v) => lesson.setPause(v * 1000));
    actions('Try it', {
      'A new question': () => lesson.next(),
      'Same letter, new answers': () => lesson.again(),
      'Know them all': () => lesson.masterAll(),
      'Clear progress': () => lesson.clear(),
      'First-visit choice': () => shell.askAgain(),
    });
    actions('Sound and writing', {
      'Play the stand-in': () => window.qaidaAudio && window.qaidaAudio.play('letters', 'ا'),
      'Stop': () => window.qaidaAudio && window.qaidaAudio.stop(),
      'Open the blank board': () => window.qaidaTrace && window.qaidaTrace.open(),
    });

    section('Progress and page');
    option('Letter tiles', { Paper: 'paper', Outline: 'line', 'Gold ink': 'gold' }, 'tiles');
    option('Letter size', { Comfortable: 'comfortable', Large: 'large' }, 'size');
    edgeSlider();
    option('Progress bar', { 'Under the title': 'title', 'Stays at the top': 'top' }, 'progress');
    option('Bar look', { Line: 'line', 'A step per letter': 'steps' }, 'bar');
    option('14-lesson track', { Show: 'show', Hide: 'hide' }, 'track');
    option('When it says you seem ready', { 'Settles down': 'settle', 'Keeps glowing': 'glow', 'No fuss': 'none' }, 'finish');
    option('Big baa by the title', { Center: 'ba', Top: 'top', Watermark: 'watermark', Hide: 'none' }, 'titlemark');
    option('Big baa font', { 'Amiri Quran': 'amiri', 'Indo-Pak Noto': 'noto', Scheherazade: 'scheherazade' }, 'titlemarkFont');
    option('Background', { Plain: 'plain', 'Soft light': 'light', 'Star pattern': 'pattern' }, 'bg');
    gapSlider();
    footSlider();
  }

  if (home) {
    section('The lesson list', true);
    option('Lesson cards', { Quiet: 'quiet', Paper: 'paper', 'Gold wash': 'gold' }, 'cards');
    option('Lesson numbers', { Show: 'show', Hide: 'hide' }, 'numbers');
    edgeSlider();
    option('Big alif by the title', { Center: 'alif', Top: 'top', Watermark: 'watermark', Hide: 'none' }, 'titlemark');
    option('Big alif font', { 'Amiri Quran': 'amiri', 'Indo-Pak Noto': 'noto', Scheherazade: 'scheherazade' }, 'titlemarkFont');
    option('Background', { Plain: 'plain', 'Soft light': 'light', 'Star pattern': 'pattern' }, 'bg');
    footSlider();
    actions('Try it', {
      'Finish lesson 1': () => home.finishFirst(),
      'Clear everything': () => home.clearAll(),
      'First-visit choice': () => shell.askAgain(),
    });
  }

  // One setting for both pages, so this section keeps its plain name and a pick made here carries across.
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
  // the page's script reads ("attribute|label;attribute|label"). Named per page, because the home and a lesson
  // have different lines under the same labels and an exported block holds both.
  section(`Words (${page})`);
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
