// What each item is, and what to listen to. Written by Claude on 19 Nov 2026 from the measurements (not by ear), so
// anything marked "listen" needs a human check. Keyed by recording, then item number as the check page numbers them.
// level: redo = probably needs a new take · listen = check by ear · mark = the mark's own name · skip = not for the Qaida
(() => {
  const GLYPHS = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'ل', 'م',
    'ن', 'و', 'ہ', 'ء', 'ی'];
  const NAMES = ['Alif', 'Baa', 'Taa', 'Thaa', 'Jeem', 'Ḥaa', 'Khaa', 'Daal', 'Dhaal', 'Raa', 'Zaa', 'Seen', 'Sheen', 'Ṣaad', 'Ḍaad',
    'Ṭaa', 'Ẓaa', 'ʿAyn', 'Ghayn', 'Faa', 'Qaaf', 'Kaaf', 'Laam', 'Meem', 'Noon', 'Waaw', 'Haa', 'Hamzah', 'Yaa'];
  const CONS = ['', 'b', 't', 'th', 'j', 'ḥ', 'kh', 'd', 'dh', 'r', 'z', 's', 'sh', 'ṣ', 'ḍ', 'ṭ', 'ẓ', 'ʿ', 'gh', 'f', 'q', 'k', 'l',
    'm', 'n', 'w', 'h', 'ʾ', 'y'];
  const MARK = { a: 'َ', i: 'ِ', u: 'ُ' };

  // name(3) = Taa; sound('a', 2, 3) = "ba + ta"; letters are numbered 1-29 as on the recording script.
  const name = (...ks) => ({ ar: ks.map((k) => GLYPHS[k - 1]).join(' '), en: ks.map((k) => NAMES[k - 1]).join(' + ') });
  const sound = (v, ...ks) => ({ ar: ks.map((k) => GLYPHS[k - 1] + MARK[v]).join(' '), en: ks.map((k) => CONS[k - 1] + v).join(' + ') });
  const with_ = (base, more) => ({ ...base, ...more });
  // items first..first+count-1 hold letters from..from+count-1
  const run = (make, first, from, count) => Object.fromEntries(Array.from({ length: count }, (_, i) => [first + i, make(from + i)]));
  const mark = (en, n) => ({ ar: '', en: `${en} ${n}`, level: 'mark' });

  const names = {
    ...run((k) => name(k), 2, 1, 21),
    1: { ar: '', en: 'not a letter', level: 'skip', note: 'Breathing or the phone being moved; there is no voice in it. Cut.' },
    13: with_(name(12), { note: 'The sharpest "s" in this file, but much softer and shorter than in the WhatsApp clip. A light de-esser will do.' }),
    19: with_(name(18), { note: 'Said "ʿain", the Urdu way. Calm and clear, not strained like the WhatsApp take.' }),
    20: with_(name(19), { note: 'Said "ghain", the Urdu way.' }),
    23: with_(name(23), { level: 'skip', note: 'Laam said before Kaaf by mistake. He went back and said Kaaf, Laam (next two). Drop this one.' }),
    24: name(22), 25: name(23), 26: name(24), 27: name(25), 28: name(26), 29: name(27),
    30: with_(name(28, 29), { level: 'listen', note: 'Hamzah, a sharp breath, then the first Yaa, all joined. Hamzah comes from here; Yaa is said again next.' }),
    31: with_(name(29), { note: 'Yaa again. Keep whichever Yaa sounds better.' }),
  };

  const s = (k) => sound('a', k);
  const zabar = {
    1: { ar: '', en: 'not a letter', level: 'skip', note: 'A short, quiet sound before he starts. Cut.' },
    2: mark('zabar', 1), 3: mark('zabar', 2), 4: mark('fatha', 1), 5: mark('zabar', 3), 6: mark('fatha', 2), 7: mark('zabar', 4),
    8: mark('fatha', 3), 9: mark('zabar', 5), 10: mark('fatha', 4),
    ...run(s, 11, 1, 8),
    19: with_(s(9), { level: 'listen', note: 'The vowel lasts about 0.47 s, twice as long as most. Check it is still a short "dha", not "dhaa".' }),
    20: with_(sound('a', 10, 11), { level: 'redo', note: 'Ra, then about a second of mumbling, then za, all joined. Za\'s vowel lasts 0.6 s, too long for a zabar. Za probably needs a new take; check ra too.' }),
    21: s(12), 22: s(13), 23: s(14), 24: s(15),
    25: with_(sound('a', 16, 17), { note: 'Ṭa and ẓa with only a breath between. Both measure fine and can be cut apart.' }),
    26: with_(s(18), { level: 'redo', note: 'ʿa, first try: breathy, with very little voice.' }),
    27: with_(s(18), { level: 'redo', note: 'More tries at ʿa (and perhaps gha), with long hisses between them, 47.3–51.1 s.' }),
    28: with_(s(18), { level: 'redo', note: 'Still more tries, 51.9–55.8 s, with some very quiet sounds. None of this measures as one clean ʿa.' }),
    29: with_(s(19), { level: 'listen', note: 'Gha, right after the ʿa tries. Check it is clean.' }),
    ...run(s, 30, 20, 8),
    38: with_(s(28), { level: 'listen', note: 'Almost no voice in it, as if whispered. Check it sounds like the "a" of item 11.' }),
    39: s(29),
    40: with_(s(29), { level: 'listen', note: 'Ya again, but its vowel is closer to "e". Keep whichever ya is right.' }),
  };

  const z = (k) => sound('i', k);
  const zair = {
    1: { ar: '', en: 'not a letter', level: 'skip', note: 'Something said very quietly, before an 11-second pause. Cut.' },
    2: { ar: '', en: 'zair + kasra, about 6 of each', level: 'mark', note: 'Said in pairs without stopping, 12.5–22.2 s. "Kasra" is quick and soft. The pairs can be cut apart.' },
    3: with_(z(1), { note: 'Breathing just before it; trimmed when cut.' }),
    ...run(z, 4, 2, 21),
    14: with_(z(12), { note: 'The longest "s" in this file (half a second). A de-esser will soften it.' }),
    25: with_(sound('i', 23, 24, 25), { level: 'listen', note: 'Li, mi and ni joined. Mi and ni are held about 0.6 s: check they don\'t sound like "mee" and "nee" (that is Lesson 13).' }),
    26: z(26), 27: z(27), 28: z(28), 29: z(29),
    30: with_(z(29), { note: 'Yi again. Keep the better one.' }),
  };

  const p = (k) => sound('u', k);
  const paish = {
    1: { ar: '', en: 'not a letter', level: 'skip', note: 'A short sound at the very start.' },
    2: { ar: '', en: 'not a letter', level: 'skip', note: 'Breathing or handling before he starts.' },
    3: { ar: '', en: 'not a letter', level: 'skip', note: 'Breathing or handling before he starts.' },
    ...Object.fromEntries([4, 5, 6, 7, 8, 9].map((n, i) => [n, { ar: '', en: `paish + damma ${i + 1}`, level: 'mark' }])),
    10: p(1), 11: p(2), 12: p(3), 13: p(4),
    14: with_(sound('u', 5, 6), { note: 'Joined, but they can be cut apart.' }),
    15: p(7), 16: p(8), 17: p(9), 18: p(10), 19: p(11), 20: p(12), 21: p(13),
    22: with_(sound('u', 14, 15, 16), { note: 'Three joined with short pauses; they can be cut apart.' }),
    23: with_(p(17), { level: 'listen', note: 'The vowel lasts about 0.54 s, long for a paish. Check it.' }),
    ...run(p, 24, 18, 5),
    29: with_(p(23), { level: 'listen', note: 'Held about 0.6 s. Check it doesn\'t sound like "loo" (that is Lesson 11).' }),
    30: p(24),
    31: with_(p(25), { level: 'listen', note: 'Held about 0.6 s. Check it doesn\'t sound like "noo".' }),
    32: p(26), 33: p(27), 34: p(28), 35: p(29),
    36: with_(p(29), { note: 'Yu again. Keep the better one.' }),
    37: { ar: '', en: 'not a letter', level: 'skip', note: 'The end: the phone being picked up.' },
  };

  window.CHECK_NOTES = {
    names: { items: names, file: '31 items: the 29 names, plus a noise at the start and one Laam said out of order. Yaa is said twice.' },
    zabar: { items: zabar, file: 'Starts with the mark\'s own names, zabar ×5 and fatha ×4 (items 2–10), then the 29 sounds. A loud noise at 5.3 s falls in a gap and gets cut.' },
    zair: { items: zair, file: 'A quiet start, an 11-second pause, then zair and kasra about six times each (item 2), then the 29 sounds.' },
    paish: { items: paish, file: '"Paish damma" six times, each as one phrase (items 4–9), then the 29 sounds. He says damma with a "d".' },
  };
})();
