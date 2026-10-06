// The free Qaida, Lesson 22: STOPPING. QAIDA-BUILD.md step P2; the specification is docs/lesson-22/ (01 is this file). Every verse ends with a stop, so
// a student stops on a word at least once a verse. Two things are taught. HOW TO STOP ON A WORD: the last letter loses its vowel and is said with a
// jazam (a zabar, zair or paish, and two zair or two paish, the "n" gone with them); two zabar become a long "aa"; a round taa is said "h"; a long vowel
// stays as it is. And WHERE: at the end of every verse, and inside a verse where a small sign over a word says so. The page says "how it is said at a
// stop" and never alters the printed word: the stopped form is composed from it by rule (`saidOf`) and shown beside it, labelled.
//
// THE SIGNS DIFFER BETWEEN THE MUSHAFS, and not only in how they are drawn (docs/lesson-22/01 §2, measured over the whole Qur'an): where Madani prints
// its small jeem ("either"), Indo-Pak prints its small taa ("stop") in 1,591 words, and the two agree on a sign in only a few hundred. So the sign
// questions use only words where both print the same meaning: the small meem (always stop), Madani's "qalaa" beside Indo-Pak's small taa (better to
// stop), the small jeem (either), and the small laam-alif (do not stop). Each script draws its own; `SIGNS` says which code point that is.
//
// The seventh RULE kit, on Lesson 21's page and with its machinery: copied words, never typed (docs/pass-2/02 §3). A word is named by REFERENCE ONLY,
// "surah:verse:position", and its Arabic is in rule-words.js, which tools/fetch-qaida-words.js wrote from Quran.com in both scripts, unmodified. So no
// Arabic is typed in this file, and no combining mark either. The fetch tool reads the references straight out of this file (any quoted reference of
// that shape), so a word is named in one place only, and no other string of that shape may be quoted here.
//
// Two questions, as Lesson 21's two: "how do you stop on this word?" and "what does the lit sign say?", each an ordinary name question, so an item says
// which it is in `askGroup` ('stop' or 'sign') and an answer to one is never offered to the other (Lesson 19's way). No engine change.
//
// Registered in rules.js's KITS as `stop`, so rule-lesson.js reads a kit and never a rule's own functions (docs/lesson-17/01 §3). No DOM and no storage
// here, so tools/qaida-lesson22-check.js loads it in node. marks.js, mark-lesson.js, practice.js, rules.js, ends.js, al.js, wasl.js, madd.js, silent.js
// and every earlier lesson are untouched: the fence in tools/qaida-check.js.

(() => {
  const marks = window.qaidaMarks;
  const rules = window.qaidaRules;
  if (!marks || !rules) return;

  const cc = (...codes) => String.fromCharCode(...codes);
  const fill = marks.fill;
  const scriptNow = () => (window.qaidaShell && window.qaidaShell.state.script) || 'madani';

  // What the page is about, as code points.
  const ALIF = 0x0627;
  const HAA = 0x0647;
  const TAA_MARBUTA = 0x0629;
  const TATWEEL = 0x0640;
  const FATHATAIN = 0x064B;
  const FATHA = 0x064E;
  const VOWELS = [0x064E, 0x064F, 0x0650];
  const TANWEEN = [0x064B, 0x064C, 0x064D];
  // The jazam a stopped form puts on its last letter: U+06E1, the open head, in both scripts (docs/lesson-22/01 §4). In Indo-Pak it is what the copied
  // text itself writes. In Madani it is the shape lessons 10-15 taught (marks.js draws the Madani jazam as U+06E1), NOT the copied text's U+0652: the
  // site's Madani face draws U+0652 as a small circle all but identical to Lesson 21's small circle (U+06DF, "not read"), and this lesson's whole point
  // is that the last letter IS read, with a jazam (measured in the browser pane; the copied words keep their own until a Qur'an font, Lesson 23).
  const JAZAM = { madani: 0x06E1, indopak: 0x06E1 };

  // The four signs both mushafs print with the same meaning, as each script writes it (docs/lesson-22/01 §2).
  const SIGNS = {
    must: { madani: 0x06D8, indopak: 0x06D8 }, // a small meem: always stop
    better: { madani: 0x06D7, indopak: 0x0615 }, // Madani's small "qalaa", Indo-Pak's small taa: better to stop
    either: { madani: 0x06DA, indopak: 0x06DA }, // a small jeem: stop or go on
    no: { madani: 0x06D9, indopak: 0x06D9 }, // a small laam-alif: do not stop
  };
  const ANY_SIGN = new Set([0x06D6, 0x06D7, 0x06D8, 0x06D9, 0x06DA, 0x06DB, 0x0615]);

  // The words (docs/lesson-22/01 §3). A stop word is the last word of its verse, or a word carrying a sign that allows a stop, in both scripts; it holds
  // only marks the student has met. Each kind is how its last letter is stopped; the check proves the text says so, in both scripts.
  //   vowel     - a zabar, zair or paish on the last letter: said with a jazam
  //   tanween   - two zair or two paish: said with a jazam, the "n" gone
  //   fathatain - two zabar, before the alif of Lesson 7: said as a long "aa"
  //   taa       - a round taa, whatever is on it (two zabar included): said "h"
  //   long      - a long vowel at the end: stays as it is
  // Three of every kind, so each list on the board is one row of three on a phone (four wrapped three and one, measured at 375px).
  const VOWEL = ['1:1:4', '2:32:12', '4:23:49'];
  const TANWEEN_WORDS = ['2:158:24', '3:174:15', '5:3:30'];
  const FATHATAIN_WORDS = ['18:9:10', '18:85:2', '16:67:9'];
  const TAA = ['3:8:12', '39:10:15', '17:39:7'];
  const LONG = ['4:91:14', '7:28:10', '20:96:16'];
  // The sign words: mid-verse, the same meaning in both scripts, the sign the only one on the word.
  const MUST = ['17:8:7', '54:6:2', '10:65:3'];
  const BETTER = ['4:11:55', '2:61:36', '4:17:16'];
  const EITHER = ['4:24:10', '2:145:10', '4:176:18'];
  const NO = ['10:22:29', '16:24:6', '2:120:23'];

  // A form is one question's worth of word. `ask: 'stop'` asks how it is said at a stop; `ask: 'sign'` asks what its sign says. `parts` is "meet it in
  // these parts": the stop words in part 1, the signs in part 2, and all of them in the last. `row` is the word's row on the board.
  const stops = [
    ...VOWEL.map((ref) => ({ ref, kind: 'vowel' })),
    ...TANWEEN_WORDS.map((ref) => ({ ref, kind: 'tanween' })),
    ...FATHATAIN_WORDS.map((ref) => ({ ref, kind: 'fathatain' })),
    ...TAA.map((ref) => ({ ref, kind: 'taa' })),
    ...LONG.map((ref) => ({ ref, kind: 'long' })),
  ].map((form) => ({ ...form, row: form.kind, ask: 'stop', parts: [1, 3] }));
  const signs = [
    ...MUST.map((ref) => ({ ref, kind: 'must' })),
    ...BETTER.map((ref) => ({ ref, kind: 'better' })),
    ...EITHER.map((ref) => ({ ref, kind: 'either' })),
    ...NO.map((ref) => ({ ref, kind: 'no' })),
  ].map((form) => ({ ...form, row: form.kind, ask: 'sign', parts: [2, 3] }));
  const forms = [...stops, ...signs];
  const STOP = { id: 'stop', lesson: 22, parts: 3, forms };
  rules.RULES.stop = STOP;

  // The words for the lesson's reading page (exercise-22.html): more of the Qur'an's own, none of them in the drill. Seven verse ends, five with a sign.
  const READING = [
    '2:37:11', '13:32:13', '5:1:23', // a vowel at the end
    '2:106:19', '3:37:34', // two paish, two zair
    '18:78:12', '65:11:34', // two zabar
    '4:103:13', // a round taa
    '7:195:19', '21:24:15', // a long vowel
    '2:187:47', '9:25:8', // a sign: either; do not stop
  ];

  // The walkthrough (spell.js): one word of the three kinds that change most, in three steps: the word up to its end, the end as it is said at a stop,
  // and the whole. `sounds` are the first piece's and the second's, and `whole` the whole said at a stop. The one place a sound is spelled out, as it
  // has been since Lesson 4: candidates for the teacher.
  const WALK = [
    { ref: '1:4:3', kind: 'vowel', sounds: ['ad-dee', 'n'], whole: 'ad-deen', meaning: 'the Judgement' },
    { ref: '18:6:11', kind: 'fathatain', sounds: ['asa', 'faa'], whole: 'asafaa', meaning: 'in grief' },
    { ref: '7:30:6', kind: 'taa', sounds: ['ad-dalaala', 'h'], whole: 'ad-dalaalah', meaning: 'going astray' },
  ];

  const data = () => (window.qaidaRuleWords && window.qaidaRuleWords.words) || {};
  const textOf = (ref, script = scriptNow()) => {
    const word = data()[ref];
    if (!word) return '';
    return script === 'indopak' ? word.indopak : word.madani;
  };

  const formOf = (ref) => forms.find((form) => form.ref === ref) || WALK.find((entry) => entry.ref === ref) || null;
  const kindOf = (ref) => (formOf(ref) || { kind: '' }).kind;

  // A word as its letters with their marks: a base and every combining mark after it, and a tatweel joined to the letter before it (Lesson 21's cut). A
  // sign rides on what it follows: in both scripts that is a space (and in Indo-Pak an invisible zero-width one), so the sign is a unit of its own and
  // can be lit alone. An invisible direction mark (U+200F, at the end of most Indo-Pak verse ends) is a unit too, and holds nothing to see.
  const lettersOf = (text) => text.match(/\P{M}\p{M}*/gu) || [];
  function lettersOfWord(text) {
    const out = [];
    for (const unit of lettersOf(text)) {
      if (unit.codePointAt(0) === TATWEEL && out.length) out[out.length - 1] += unit;
      else out.push(unit);
    }
    return out;
  }
  const codes = (unit) => [...unit].map((ch) => ch.codePointAt(0));
  const isLetter = (c) => (c >= 0x0621 && c <= 0x064A) || c === 0x0671;
  const marksOf = (unit) => codes(unit).slice(1).filter((c) => c !== TATWEEL);
  const isSign = (unit) => codes(unit).some((c) => ANY_SIGN.has(c));
  // The place of the word's last LETTER (not its sign, its space or its direction mark), and of its sign.
  const lastLetterAt = (units) => {
    for (let i = units.length - 1; i >= 0; i -= 1) if (isLetter(units[i].codePointAt(0))) return i;
    return -1;
  };
  const signAt = (units) => units.findIndex(isSign);

  // How the last letter is stopped, read off one script's text: the rule of the lesson, and what the check holds every word to. '' for a word the
  // lesson does not teach (a shadda on the last letter, a final haa, and anything else).
  function stopKindOf(texts, script) {
    const at = lastLetterAt(texts);
    if (at < 1) return '';
    const last = texts[at];
    const own = marksOf(last).filter((c) => !ANY_SIGN.has(c));
    const before = marksOf(texts[at - 1]);
    const base = last.codePointAt(0);
    if (own.includes(0x0651) || before.includes(0x0651) && base === ALIF) return '';
    if (base === TAA_MARBUTA) return own.length === 1 && [...VOWELS, ...TANWEEN].includes(own[0]) ? 'taa' : '';
    if (base === HAA) return '';
    if (own.length === 1 && VOWELS.includes(own[0])) return 'vowel';
    if (own.length === 1 && (own[0] === 0x064C || own[0] === 0x064D)) return 'tanween';
    if (base === ALIF && own.length === 0 && before.length === 1 && before[0] === FATHATAIN) return 'fathatain';
    const bare = own.length === 0 || (script === 'indopak' && own.length === 1 && own[0] === JAZAM.indopak);
    if (base === ALIF && own.length === 0 && before.includes(FATHA)) return 'long';
    if (base === 0x0648 && bare && before.includes(0x064F)) return 'long';
    if ((base === 0x064A || base === 0x0649) && bare && before.includes(0x0650)) return 'long';
    return '';
  }

  // Which sign a word carries, read off one script's text, as a kind ('must', 'better', 'either', 'no'), or '' for none or another.
  function signKindOf(texts, script) {
    const found = texts.flatMap(codes).filter((c) => ANY_SIGN.has(c));
    if (found.length !== 1) return '';
    return Object.keys(SIGNS).find((kind) => SIGNS[kind][script] === found[0]) || '';
  }

  // The places of a word the lesson is about. A stop word lights its end ('end': the last letter, and the letter before it where two zabar or a long
  // vowel spans the two); a sign word lights its sign ('sign'). `step` is which piece of the walkthrough a unit belongs to (the word up to its end, then
  // the end), as Lessons 19 to 21's are.
  function unitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    const texts = lettersOfWord(textOf(ref, script));
    const units = texts.map((text) => ({ text, role: '', step: 0 }));
    if (SIGNS[kind]) {
      const at = signAt(texts);
      if (units[at]) units[at].role = 'sign';
      return units;
    }
    const last = lastLetterAt(texts);
    const from = kind === 'fathatain' || kind === 'long' ? last - 1 : last;
    units.forEach((unit, i) => {
      if (i >= from && i <= last) unit.role = 'end';
      unit.step = i >= from ? 1 : 0;
    });
    return units;
  }

  // HOW IT IS SAID AT A STOP, composed from the printed word by the lesson's rule and never fetched (docs/lesson-22/01 §4). The sign, the space it rides
  // on and any invisible mark after the last letter are left off (a sign is not said); then the last letter changes by its kind. The printed word is
  // never changed: this is a second, labelled thing beside it.
  function saidUnitsOf(ref, script = scriptNow(), kind = kindOf(ref)) {
    const texts = lettersOfWord(textOf(ref, script));
    const last = lastLetterAt(texts);
    if (last < 0 || SIGNS[kind]) return [];
    const drop = (unit, list) => [...unit].filter((ch) => !list.includes(ch.codePointAt(0))).join('');
    // A sign can sit on the last letter itself (an Indo-Pak verse end, 1:4:3): it is not said either.
    const kept = texts.slice(0, last + 1).map((unit) => drop(unit, [...ANY_SIGN]));
    const jazam = cc(JAZAM[script]);
    const lastText = kept[last];
    if (kind === 'vowel' || kind === 'tanween') {
      kept[last] = drop(lastText, [...VOWELS, ...TANWEEN]) + jazam;
    } else if (kind === 'taa') {
      kept[last] = cc(HAA) + jazam;
    } else if (kind === 'fathatain') {
      kept[last - 1] = kept[last - 1].replace(cc(FATHATAIN), cc(FATHA));
    }
    const from = kind === 'fathatain' || kind === 'long' ? last - 1 : last;
    return kept.map((text, i) => ({ text, role: i >= from ? 'end' : '', step: i >= from ? 1 : 0 }));
  }
  const saidOf = (ref, script = scriptNow(), kind = kindOf(ref)) => saidUnitsOf(ref, script, kind).map((unit) => unit.text).join('');

  // What a question shows: the word's letters, with ONE place lit ('ask'): the last letter of a stop word (whatever its kind, so the light never gives
  // the answer away), or the sign of a sign word.
  function promptUnitsOf(form, script = scriptNow()) {
    const texts = lettersOfWord(textOf(form.ref, script));
    const units = texts.map((text) => ({ text, role: '', step: 0 }));
    const at = form.ask === 'sign' ? signAt(texts) : lastLetterAt(texts);
    if (units[at]) units[at].role = 'ask';
    return units;
  }

  // The id is the reference: one fixed string, the same in both scripts, and never a word's Arabic, so a switch of script keeps every credit.
  const idOf = (form) => form.ref;
  const glyphOf = (form, script = scriptNow()) => textOf(form.ref, script);
  const drawnOf = glyphOf;

  // The recordings would be the teacher's own words, one each, kept under the reference (audio/manifest.json, group `words`): the word read stopped, as
  // the README asked. None yet.
  const audioOf = (form) => ({ kind: 'words', glyph: form.ref });

  // The names. A stop word's name is what happens to its end, so it is the answer: four answers, five kinds (a vowel and two zair or two paish both end
  // on a jazam). A sign word's name is what its sign says. {jazam} is the student's own word for it.
  const TEMPLATES = {
    vowel: 'Ends with a {jazam}',
    tanween: 'Ends with a {jazam}',
    fathatain: 'Ends with a long ‘aa’',
    taa: 'Ends with an ‘h’',
    long: 'Stays as it is',
    must: 'Always stop here',
    better: 'Better to stop',
    either: 'Stop or go on',
    no: 'Do not stop here',
  };
  const nameOf = (form, shell, templates = TEMPLATES) => fill(templates[form.kind], {
    jazam: shell ? marks.nameOf(marks.markOf('sukun'), shell) : 'jazam',
  });
  const templatesOf = (d) => ({
    vowel: d.nameVowel, tanween: d.nameTanween, fathatain: d.nameFathatain, taa: d.nameTaa, long: d.nameLong,
    must: d.nameMust, better: d.nameBetter, either: d.nameEither, no: d.nameNo,
  });

  // One item per form, in the order above. `marked: true` and `parts` are what marks.poolFor, marks.stats and marks.sizes read, so the engine's
  // arithmetic is the mark lessons' own. `mark` is the word's ROW on the board, which the page's same-sound line follows.
  function itemsFor(shell, options = {}) {
    const { templates = TEMPLATES, script = scriptNow() } = options;
    return forms.map((form) => ({
      id: idOf(form),
      boardId: form.ref,
      glyph: drawnOf(form, script),
      name: nameOf(form, shell, templates),
      family: [], // the answers are told apart by what is on the last letter, or by the sign, not by a look-alike
      audio: audioOf(form),
      required: false,
      traceable: true,
      marked: true,
      mark: form.row,
      kind: form.kind,
      ref: form.ref,
      markName: '',
      parts: form.parts.slice(),
      askGroup: form.ask,
      units: promptUnitsOf(form, script),
    }));
  }

  // The names changed: the same items with new names, so the engine keeps them.
  function rename(items, shell, templates = TEMPLATES) {
    const byId = new Map(forms.map((form) => [idOf(form), form]));
    for (const item of items) {
      const form = byId.get(item.id);
      if (!form) continue;
      item.name = nameOf(form, shell, templates);
    }
  }

  // Which question line a word is asked with.
  const askOf = (item) => item.askGroup;

  // The board: a list of words for each row, the five ways a word ends and then the four signs, so the page can draw each with its own heading. A sign's
  // row brings the sign itself (`glyph`), drawn large on a tatweel in the student's script. The whole map is on the board from part 1 (a word whose
  // part is not open is drawn dim, never hidden), as on Lessons 18 to 21.
  const ROWS = ['vowel', 'tanween', 'fathatain', 'taa', 'long', 'must', 'better', 'either', 'no'];
  const signGlyph = (kind, script = scriptNow()) => cc(TATWEEL, SIGNS[kind][script]);
  const boards = () => ROWS.map((id) => ({ id, cells: forms.filter((form) => form.row === id), glyph: SIGNS[id] ? () => signGlyph(id) : null }));

  // The three words on their own, each with how it is said at a stop under it: a vowel, two zabar, a round taa (the three ends that change the most).
  const samples = () => [stops[0], stops[VOWEL.length + TANWEEN_WORDS.length], stops[VOWEL.length + TANWEEN_WORDS.length + FATHATAIN_WORDS.length]]
    .map((form) => ({ ...form, said: true }));

  // Under a wrong answer: the same word again with the place to look lit, and for a stop word how it is said at a stop; and the line that says what
  // shows it. A stop word has one line a kind; a sign word one a sign, and the sign that differs between the scripts one a script.
  const pascalOf = (id) => id.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
  const scriptWord = (script) => (script === 'indopak' ? 'Indopak' : 'Madani');
  function echoOf(item) {
    const script = scriptNow();
    const units = unitsOf(item.ref, script, item.kind);
    if (SIGNS[item.kind]) {
      return { line: item.kind === 'better' ? `lineBetter${scriptWord(script)}` : `line${pascalOf(item.kind)}`, units };
    }
    return { line: `line${pascalOf(item.kind)}`, units, said: saidUnitsOf(item.ref, script, item.kind) };
  }

  // The rail's sample for each part, cut from real words: the end of a stop word; the end of a sign word with its sign; the end of a word with two zabar.
  const SAMPLES = [{ ref: VOWEL[0], from: -2 }, { ref: EITHER[0], from: -3 }, { ref: FATHATAIN_WORDS[0], from: -2 }];
  const partsOf = (rule = STOP) => Array.from({ length: rule.parts }, (_, i) => ({ n: i + 1, sample: SAMPLES[i] }));
  function sampleOf(part, script = scriptNow()) {
    const at = SAMPLES[Math.max(1, Math.min(STOP.parts, part)) - 1];
    const texts = lettersOfWord(textOf(at.ref, script));
    // Cut back from the last letter (or the sign), never from an invisible mark after it.
    const end = SIGNS[kindOf(at.ref)] ? signAt(texts) : lastLetterAt(texts);
    return texts.slice(Math.max(0, end + 1 + at.from), end + 1).join('');
  }
  const inPart = (form, n) => form.parts.includes(n);
  const firstPartOf = (form) => form.parts[0];

  // The row the page's same-sound line starts on in each part, and whether a row is one of a part's own.
  const firstRow = (part) => ['vowel', 'must', 'vowel'][Math.max(1, Math.min(STOP.parts, part)) - 1];
  const rowInPart = (row, part) => forms.some((form) => form.row === row && inPart(form, part));
  // The title's glyph is the end of a verse, the one place every mushaf says a student may stop: the verse-end sign around the first verse's number
  // (U+06DD, U+0661), composed. The title face draws the two as one round mark (measured; a small sign on a tatweel floated far above its stroke).
  const titleGlyph = () => cc(0x06DD, 0x0661);

  rules.KITS.stop = {
    board: 'words', formsOf: () => forms, partsOf, sampleOf, idOf, drawnOf, glyphOf, audioOf, itemsFor, rename, inPart, firstPartOf,
    templatesOf, titleGlyph, echoOf, boards, samples, unitsOf, saidUnitsOf, saidOf, lettersOf: lettersOfWord, firstRow, rowInPart, TEMPLATES, askOf,
    promptUnitsOf, stopKindOf, signKindOf, lastLetterAt, signAt, signGlyph, SIGNS, JAZAM,
    VOWEL, TANWEEN: TANWEEN_WORDS, FATHATAIN: FATHATAIN_WORDS, TAA, LONG, MUST, BETTER, EITHER, NO, READING, WALK, textOf, kindOf, nameOf,
  };
  // What spell.js and exercise.js read: a copied word, drawn for the script in use.
  rules.wordText = textOf;
  rules.copiedUnits = unitsOf;
})();
