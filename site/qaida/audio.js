// The free Qaida's sound. QAIDA-BUILD.md step 2.
//
// Two rules shape all of this:
//   1. The recordings are the teacher's own voice or a vetted reciter — never an AI voice. Mispronunciation is the
//      exact thing the Qaida teaches against (QAIDA-CONTENT.md). Until a real recording is in, the page plays a
//      wordless hum and says so, rather than a machine pronouncing a letter.
//   2. The recordings arrive a few at a time (the user, 2026-09-18: "there are a lot of words and [I'll] gradually
//      be uploading"). So nothing here assumes a file exists. audio/manifest.json lists only what has been recorded;
//      everything else simply has no recording yet, and the page is honest about it.

(() => {
  const shell = window.qaidaShell;
  if (!shell) return;

  const BASE = 'audio/';

  // Filenames are plain ASCII: Arabic in a filename is fragile across Windows, git and the web server. Keyed by the
  // Madani form of the letter, which is what shell.keyOf() folds ک ہ ی down to — one recording serves both scripts.
  const SLUGS = {
    'ا': 'alif', 'ب': 'ba', 'ت': 'ta', 'ث': 'tha', 'ج': 'jeem', 'ح': 'hha', 'خ': 'kha', 'د': 'dal', 'ذ': 'dhal',
    'ر': 'ra', 'ز': 'za', 'س': 'seen', 'ش': 'sheen', 'ص': 'sad', 'ض': 'dad', 'ط': 'tta', 'ظ': 'zza', 'ع': 'ayn',
    'غ': 'ghayn', 'ف': 'fa', 'ق': 'qaf', 'ك': 'kaf', 'ل': 'lam', 'م': 'meem', 'ن': 'noon', 'ه': 'ha', 'و': 'waw',
    'ء': 'hamza', 'ي': 'ya',
  };

  let manifest = { placeholder: 'placeholder.wav', letters: {} };

  const ready = (async () => {
    try {
      const response = await fetch(`${BASE}manifest.json`, { cache: 'no-cache' });
      if (!response.ok) return manifest;
      const loaded = await response.json();
      if (loaded && typeof loaded === 'object') {
        manifest = { placeholder: 'placeholder.wav', letters: {}, ...loaded };
        if (!manifest.letters || typeof manifest.letters !== 'object') manifest.letters = {};
      }
    } catch {
      // No manifest, or the page was opened from the file system rather than through serve.js. Either way the
      // lesson works; there is simply nothing recorded.
    }
    return manifest;
  })();

  // What file says this thing, if any. `kind` is 'letters' now; later lessons add their own.
  function fileFor(kind, glyph) {
    const key = shell.keyOf(glyph);
    const group = manifest[kind];
    return (group && group[key]) || null;
  }

  const slugFor = (glyph) => SLUGS[shell.keyOf(glyph)] || null;

  // One sound at a time. Tapping a second letter stops the first, the way a teacher wouldn't say two at once.
  let player = null;

  function stop() {
    if (!player) return;
    player.pause();
    player.currentTime = 0;
  }

  // Returns what actually played: 'recording', 'standin', or 'muted'.
  function play(kind, glyph) {
    if (shell.state.muted) return 'muted';
    const file = fileFor(kind, glyph);
    const src = BASE + (file || manifest.placeholder);
    stop();
    if (!player) player = new Audio();
    player.src = src;
    // A browser can refuse to play (no file there, or it wants a firmer gesture). Nothing breaks if it does.
    player.play().catch(() => {});
    return file ? 'recording' : 'standin';
  }

  // Every letter the Qaida wants a recording of, and whether it has one. The recordings page lists this; the lesson
  // uses it to decide which tiles carry a speaker mark.
  // The groups the Qaida wants, in order: the letters' names, then the SOUND of each letter with each mark whose lesson is
  // built (docs/lesson-4/08 §3). marks.js is only there on the pages that load it, so it is looked at when asked, not before.
  function groups() {
    const list = [{ kind: 'letters', say: (name) => name }];
    const marks = window.qaidaMarks;
    if (!marks) return list;
    for (const mark of Object.values(marks.MARKS)) {
      if (!shell.LESSONS.some((lesson) => lesson.n === mark.lesson && lesson.built)) continue;
      // Keyed by mark.audio and never by the student's chosen word for the mark: the recordings are global.
      list.push({ kind: mark.audio, say: (name) => `The sound of ${name} with ${mark.names.fatha} — not its name` });
    }
    return list;
  }

  function wanted() {
    const rows = [];
    for (const { kind, say } of groups()) {
      const seen = new Set();
      for (const script of ['madani', 'indopak']) {
        for (const [glyph, name] of shell.lettersOf(script)) {
          const key = shell.keyOf(glyph);
          if (seen.has(key)) continue;
          seen.add(key);
          rows.push({
            kind,
            key,
            glyph: key,
            name,
            say: say(name),
            slug: SLUGS[key] || key,
            file: (manifest[kind] && manifest[kind][key]) || null,
          });
        }
      }
    }
    return rows;
  }

  window.qaidaAudio = {
    ready,
    play,
    stop,
    slugFor,
    wanted,
    has: (kind, glyph) => Boolean(fileFor(kind, glyph)),
    get manifest() {
      return manifest;
    },
  };
})();
