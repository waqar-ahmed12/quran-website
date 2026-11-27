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
  let chain = 0; // bumped by every stop(), so a spelling still on its way gives up when something else is tapped

  function stop() {
    chain += 1;
    if (!player) return;
    player.onended = null;
    player.pause();
    player.currentTime = 0;
  }

  // A mark's own name said aloud ("zabar", "fatha"): keyed by the word itself, since a name is not a letter.
  const nameFile = (word) => {
    const group = manifest['mark-names'];
    return (group && group[word]) || null;
  };

  // Several recordings one after another, with the short breath a teacher leaves between them.
  const GAP_MS = 180;
  function playFiles(files) {
    stop();
    if (!player) player = new Audio();
    const id = chain;
    let i = 0;
    const next = () => {
      if (id !== chain || i >= files.length) return;
      player.onended = () => {
        player.onended = null;
        if (id === chain) setTimeout(next, GAP_MS);
      };
      player.src = BASE + files[i];
      i += 1;
      player.play().catch(() => {});
    };
    next();
  }

  // The mark's name, in the teacher's voice: 'recording', 'muted', or 'none' when that name has no recording.
  function playName(word) {
    if (shell.state.muted) return 'muted';
    const file = nameFile(word);
    if (!file) return 'none';
    playFiles([file]);
    return 'recording';
  }

  // A letter with its mark, read the Indo-Pak way (hijje): the letter's name, the mark's name, then the sound, "Baa, zabar,
  // ba". Only when all three are recorded: otherwise null, and the caller plays what it always did. 'muted' when muted.
  function spell(kind, glyph, word) {
    const files = [fileFor('letters', glyph), nameFile(word), fileFor(kind, glyph)];
    if (files.some((file) => !file)) return null;
    if (shell.state.muted) return 'muted';
    playFiles(files);
    return 'spelled';
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
    // A kind is listed once (docs/lesson-9/03 §8): khari zabar shares Lesson 8's 'fatha-alif' sound ("baa" again),
    // so without this a built Lesson 9 would add the same recording group a second time.
    const seen = new Set(['letters']);
    for (const mark of Object.values(marks.MARKS)) {
      if (!shell.LESSONS.some((lesson) => lesson.n === mark.lesson && lesson.built)) continue;
      if (seen.has(mark.audio)) continue;
      seen.add(mark.audio);
      // When a kind is shared (Lessons 9 and 11 share 'damma-waw'), the built row whose id is the kind names it.
      const built = (m) => shell.LESSONS.some((lesson) => lesson.n === m.lesson && lesson.built);
      const owner = Object.values(marks.MARKS).find((m) => m.id === mark.audio && built(m)) || mark;
      // Keyed by mark.audio and never by the student's chosen word for the mark: the recordings are global. A mark
      // with a lead (Lesson 14's alif with fatha) needs the teacher told to say it: "ab" is the alif's "a" and the
      // letter closed, never the letter alone (docs/lesson-14/03 §9).
      // Lesson 15's shadda has a lead too, but its sound is not closed: it is the closed sound AND the opened one, "ab-ba"
      // (docs/lesson-15/03 §8).
      let say = (name) => `The sound of ${name} with ${owner.names.fatha} — not its name`;
      if (marks.leadOf(owner, 'madani')) {
        say = owner.id.startsWith('shadda')
          ? (name) => `The doubled sound, as in "ab-ba": alif with fatha, then ${name} with ${owner.names.fatha}, said twice — not the letter's name`
          : (name) => `The one closed sound: alif with fatha, then ${name} with ${owner.names.fatha} — not the letter's name`;
      }
      list.push({ kind: mark.audio, say });
    }
    // Lesson 16 (docs/lesson-16/03 §7): a rule lesson's one new recording. The seat of a hamza is never read, so every
    // hamza with a jazam is one sound, "a'", said on hamza alone: one row, and not one per seat. Its zabar, zair, paish and
    // two-zabar forms reuse the sounds Lessons 4-7 recorded, so they add no group.
    const rules = window.qaidaRules;
    if (rules && shell.LESSONS.some((lesson) => lesson.n === 16 && lesson.built)) {
      const form = rules.formsOf().find((f) => f.seat === 'line' && f.mark === 'sukun');
      list.push({
        kind: 'hamza-jazam',
        only: ['ء'],
        say: () => 'The sound "a\'": baa with zabar, then a hamza with a jazam — not the letter\'s name',
        display: () => rules.drawnOf(form, 'madani'),
      });
    }
    return list;
  }

  // The mark a group's sound belongs to, if any (docs/lesson-8/03 §8): `kind` is mark.audio, which is mark.id for
  // every mark today. Used to honour `skip` (Lesson 8's alif and hamza are never written, so there is no "baa"
  // sound to want) and to show the composed glyph rather than the bare key.
  function markForKind(kind) {
    const marks = window.qaidaMarks;
    if (!marks) return null;
    const all = Object.values(marks.MARKS);
    // Lessons 9 and 11 share one recording group ('damma-waw'): the row whose id is the kind wins, so the teacher
    // sees the plainer spelling and not Lesson 9's ulta paish (docs/lesson-11/03 §6).
    return all.find((m) => m.id === kind) || all.find((m) => m.audio === kind) || null;
  }

  function wanted() {
    const marks = window.qaidaMarks;
    const rows = [];
    for (const { kind, say, only, display } of groups()) {
      const mark = markForKind(kind);
      const skip = (mark && mark.skip) || [];
      const seen = new Set();
      for (const script of ['madani', 'indopak']) {
        for (const [glyph, name] of shell.lettersOf(script)) {
          const key = shell.keyOf(glyph);
          if (seen.has(key) || skip.includes(key)) continue;
          if (only && !only.includes(key)) continue; // a rule lesson's recording is of one thing, not of every letter
          seen.add(key);
          rows.push({
            kind,
            key,
            glyph: key, // the manifest key (recordings.js writes groups[kind][glyph]) — always the bare letter
            // What the teacher SEES beside the sound's description: the composed glyph for a mark's own group
            // ("baa", not the bare letter, beside "Baa with fatha and alif"), the bare letter for the letters' own names.
            display: display ? display(key) : mark ? marks.leadOf(mark, 'madani') + marks.glyphOf(key, mark) : key, // Lesson 14's shows its lead: what the teacher will say
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
    hasName: (word) => Boolean(nameFile(word)),
    playName,
    spell,
    // The teacher's file for this item, for voice.js to play beside the student's own recording. Null exactly when
    // has() is false — never the stand-in: matching your pronunciation against a wordless hum isn't a thing.
    urlFor: (kind, glyph) => {
      const file = fileFor(kind, glyph);
      return file ? BASE + file : null;
    },
    get manifest() {
      return manifest;
    },
  };
})();
