// The recording list: every clip the Qaida wants, whether it has one, and a ready-made manifest to paste.
// For the teacher, not for visitors. QAIDA-BUILD.md step 2.

(() => {
  const shell = window.qaidaShell;
  const audio = window.qaidaAudio;
  if (!shell || !audio) return;

  const $ = (selector) => document.querySelector(selector);

  const body = $('.list tbody');
  const progressText = $('.progress-text');
  const bar = $('.bar');
  const checkButton = $('.check');
  const copyButton = $('.copy');
  const block = $('.manifest-block');
  const out = $('.manifest-out');

  // Whatever the teacher's phone or recorder produces, in the order we'd rather have it.
  const EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'opus', 'aac', 'webm'];

  let rows = [];

  function draw() {
    body.textContent = '';
    rows.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.dataset.state = row.file ? 'got' : 'missing';

      const cell = (text, className) => {
        const td = document.createElement('td');
        td.className = className || '';
        td.textContent = text;
        return td;
      };

      const number = cell(String(i + 1), 'num');
      const letter = document.createElement('td');
      letter.className = 'glyph-cell';
      letter.lang = 'ar';
      letter.dir = 'rtl';
      letter.textContent = row.glyph;

      tr.append(
        number,
        letter,
        cell(row.say || row.name, 'say'),
        cell(row.file || `${row.kind}/${row.slug}.mp3`, 'file'),
        cell(row.file ? 'yes' : 'not yet', 'got'),
      );
      body.append(tr);
    });

    const got = rows.filter((row) => row.file).length;
    progressText.textContent = got === rows.length
      ? `All ${rows.length} recorded`
      : `${got} of ${rows.length} recorded`;
    bar.style.setProperty('--p', rows.length ? got / rows.length : 0);
    bar.setAttribute('aria-valuenow', got);
    bar.setAttribute('aria-valuemax', rows.length);
  }

  // Ask the server whether a file is there, without downloading it.
  async function exists(path) {
    try {
      const response = await fetch(`audio/${path}`, { method: 'HEAD', cache: 'no-cache' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function check() {
    checkButton.disabled = true;
    const was = checkButton.textContent;
    checkButton.textContent = 'Looking…';

    for (const row of rows) {
      if (row.file) continue; // already in the manifest
      for (const extension of EXTENSIONS) {
        const path = `${row.kind}/${row.slug}.${extension}`;
        // eslint-disable-next-line no-await-in-loop -- one at a time keeps the server calm and the order readable
        if (await exists(path)) {
          row.file = path;
          break;
        }
      }
    }

    checkButton.textContent = was;
    checkButton.disabled = false;
    draw();
    writeManifest();
    shell.say(`${rows.filter((row) => row.file).length} of ${rows.length} found.`);
  }

  function writeManifest() {
    // One group per kind: the letters' names, then the sound of a letter with each mark that has a lesson.
    const groups = { letters: {} };
    for (const row of rows) {
      if (!groups[row.kind]) groups[row.kind] = {};
      if (row.file) groups[row.kind][row.glyph] = row.file;
    }
    const manifest = {
      _read_me: 'Every recording the Qaida has. Add a line when you add a file; anything not listed here simply has'
        + ' no recording yet, and the lesson says so. The teacher’s own voice or a vetted reciter only, never an'
        + ' AI voice.',
      placeholder: 'placeholder.wav',
      ...groups,
    };
    out.textContent = JSON.stringify(manifest, null, 2);
    block.hidden = false;
  }

  copyButton.addEventListener('click', async () => {
    const done = () => {
      copyButton.textContent = copyButton.dataset.done;
      setTimeout(() => {
        copyButton.textContent = copyButton.dataset.label;
      }, 2000);
    };
    try {
      await navigator.clipboard.writeText(out.textContent);
      done();
    } catch {
      // Clipboard refused (no permission, or not a secure context): select it so Ctrl+C works.
      const range = document.createRange();
      range.selectNodeContents(out);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      out.focus();
      shell.say('Press Ctrl+C to copy.');
    }
  });

  checkButton.addEventListener('click', check);

  audio.ready.then(() => {
    rows = audio.wanted();
    draw();
    if (rows.some((row) => row.file)) writeManifest();
  });
})();
