// The free Qaida, Lessons 4 to 6: a reading exercise, no walkthrough and no meanings. Added 2026-09-27 — the user,
// after a first look at spell.js's inline "More words" list, sharing a photo of a printed Qaida's own "mashq" page:
// "don't you think there should be a separate page for the more words... make a table of 12 words, keep the
// meanings out." Twelve real words using only this lesson's own mark, arranged for silent reading practice, the
// same way the printed page is: no audio (the whole feature is "no speech for now"), no scoring, no meanings, no
// step-through. Reading it on your own is the whole exercise.
//
// One page file for every lesson, exactly the shape mark-lesson.js already is: exercise-4.html, exercise-5.html and
// exercise-6.html differ only in data-mark and their wording. Real, correctly-diacritized Arabic — never invented,
// the same rule the aayat overlay and spell.js live under. A candidate list, not the teacher's own; check every
// word before it ships.

(() => {
  const shell = window.qaidaShell;
  const marks = window.qaidaMarks;
  if (!shell || !marks) return;

  const root = document.documentElement;

  // Twelve per mark, in the pattern that matches it: fatha throughout (fa'ala), fatha-kasra-fatha (fa'ila) or
  // fatha-damma-fatha (fa'ula). Each is [key, markId] pairs, right to left, the same shape spell.js uses. No
  // meanings and no transliteration here on purpose — this page is reading practice, not vocabulary.
  const WORDS = {
    fatha: [
      [['ك', 'fatha'], ['ت', 'fatha'], ['ب', 'fatha']], // kataba, "he wrote"
      [['ذ', 'fatha'], ['ه', 'fatha'], ['ب', 'fatha']], // dhahaba, "he went"
      [['خ', 'fatha'], ['ر', 'fatha'], ['ج', 'fatha']], // kharaja, "he went out"
      [['ج', 'fatha'], ['ل', 'fatha'], ['س', 'fatha']], // jalasa, "he sat"
      [['ف', 'fatha'], ['ت', 'fatha'], ['ح', 'fatha']], // fataha, "he opened"
      [['د', 'fatha'], ['خ', 'fatha'], ['ل', 'fatha']], // dakhala, "he entered"
      [['ر', 'fatha'], ['ج', 'fatha'], ['ع', 'fatha']], // raja'a, "he returned"
      [['ن', 'fatha'], ['ص', 'fatha'], ['ر', 'fatha']], // nasara, "he helped"
      [['ذ', 'fatha'], ['ك', 'fatha'], ['ر', 'fatha']], // dhakara, "he remembered"
      [['ش', 'fatha'], ['ك', 'fatha'], ['ر', 'fatha']], // shakara, "he thanked"
      [['س', 'fatha'], ['ج', 'fatha'], ['د', 'fatha']], // sajada, "he prostrated"
      [['ح', 'fatha'], ['م', 'fatha'], ['د', 'fatha']], // hamada, "he praised"
    ],
    kasra: [
      [['ش', 'fatha'], ['ر', 'kasra'], ['ب', 'fatha']], // shariba, "he drank"
      [['ع', 'fatha'], ['ل', 'kasra'], ['م', 'fatha']], // 'alima, "he knew"
      [['س', 'fatha'], ['م', 'kasra'], ['ع', 'fatha']], // sami'a, "he heard"
      [['ف', 'fatha'], ['ه', 'kasra'], ['م', 'fatha']], // fahima, "he understood"
      [['ح', 'fatha'], ['س', 'kasra'], ['ب', 'fatha']], // hasiba, "he thought"
      [['و', 'fatha'], ['ر', 'kasra'], ['ث', 'fatha']], // waritha, "he inherited"
      [['ح', 'fatha'], ['ف', 'kasra'], ['ظ', 'fatha']], // hafiza, "he memorized"
      [['ل', 'fatha'], ['ب', 'kasra'], ['س', 'fatha']], // labisa, "he wore"
      [['ت', 'fatha'], ['ع', 'kasra'], ['ب', 'fatha']], // ta'iba, "he got tired"
      [['ر', 'fatha'], ['ك', 'kasra'], ['ب', 'fatha']], // rakiba, "he rode"
      [['ع', 'fatha'], ['م', 'kasra'], ['ل', 'fatha']], // 'amila, "he did"
      [['ف', 'fatha'], ['ر', 'kasra'], ['ح', 'fatha']], // fariha, "he was happy"
    ],
    damma: [
      [['ك', 'fatha'], ['ر', 'damma'], ['م', 'fatha']], // karuma, "he was generous"
      [['ك', 'fatha'], ['ب', 'damma'], ['ر', 'fatha']], // kabura, "he was great"
      [['ق', 'fatha'], ['ر', 'damma'], ['ب', 'fatha']], // qaruba, "he was near"
      [['ص', 'fatha'], ['غ', 'damma'], ['ر', 'fatha']], // saghura, "he was small"
      [['ب', 'fatha'], ['ع', 'damma'], ['د', 'fatha']], // ba'uda, "he was far"
      [['ح', 'fatha'], ['س', 'damma'], ['ن', 'fatha']], // hasuna, "he was good"
      [['س', 'fatha'], ['ه', 'damma'], ['ل', 'fatha']], // sahula, "he was easy"
      [['ص', 'fatha'], ['ع', 'damma'], ['ب', 'fatha']], // sa'uba, "he was difficult"
      [['ج', 'fatha'], ['م', 'damma'], ['ل', 'fatha']], // jamula, "he was beautiful"
      [['ع', 'fatha'], ['ظ', 'damma'], ['م', 'fatha']], // 'azuma, "he was great"
      [['ش', 'fatha'], ['ر', 'damma'], ['ف', 'fatha']], // sharufa, "he was noble"
      [['ط', 'fatha'], ['ه', 'damma'], ['ر', 'fatha']], // tahura, "he was pure"
    ],
    // Lesson 7: eight nouns ending in two paish, four in two zair, none in two zabar (it brings an alif, Lesson 8's).
    // None of spell.js's walkthrough words, and no ه (Noto Naskh's broken middle haa, docs/lesson-8/02 §5).
    tanween: [
      [['و', 'fatha'], ['ل', 'fatha'], ['د', 'dammatain']], // waladun, "a boy"
      [['ج', 'fatha'], ['ب', 'fatha'], ['ل', 'dammatain']], // jabalun, "a mountain"
      [['ق', 'fatha'], ['م', 'fatha'], ['ر', 'dammatain']], // qamarun, "a moon"
      [['ش', 'fatha'], ['ج', 'fatha'], ['ر', 'dammatain']], // shajarun, "trees"
      [['م', 'fatha'], ['ط', 'fatha'], ['ر', 'dammatain']], // matarun, "rain"
      [['ح', 'fatha'], ['ج', 'fatha'], ['ر', 'dammatain']], // hajarun, "a stone"
      [['ع', 'fatha'], ['س', 'fatha'], ['ل', 'dammatain']], // 'asalun, "honey"
      [['ث', 'fatha'], ['م', 'fatha'], ['ر', 'dammatain']], // thamarun, "fruit"
      [['ع', 'fatha'], ['م', 'fatha'], ['ل', 'kasratain']], // 'amalin, "a deed"
      [['م', 'fatha'], ['ل', 'kasra'], ['ك', 'kasratain']], // malikin, "a king"
      [['س', 'fatha'], ['ف', 'fatha'], ['ر', 'kasratain']], // safarin, "a journey"
      [['ج', 'fatha'], ['س', 'fatha'], ['د', 'kasratain']], // jasadin, "a body"
    ],
    // docs/lesson-8/05 §5: seven verbs (past tense, "he...") and five nouns (ending in two paish, Lesson 7's mark),
    // using only marks taught by Lesson 8 — zabar, zair, two paish, and zabar-and-alif. No ه anywhere on purpose:
    // Noto Naskh (the Indo-Pak stand-in) draws it broken between letters (docs/lesson-8/02 §5).
    'fatha-alif': [
      [['ق', 'fatha-alif'], ['ل', 'fatha']], // qaala, "he said"
      [['ك', 'fatha-alif'], ['ن', 'fatha']], // kaana, "he was"
      [['ص', 'fatha-alif'], ['م', 'fatha']], // saama, "he fasted"
      [['خ', 'fatha-alif'], ['ف', 'fatha']], // khaafa, "he feared"
      [['ز', 'fatha-alif'], ['ر', 'fatha']], // zaara, "he visited"
      [['س', 'fatha-alif'], ['ف', 'fatha'], ['ر', 'fatha']], // saafara, "he travelled"
      [['س', 'fatha-alif'], ['ع', 'fatha'], ['د', 'fatha']], // saa'ada, "he helped"
      [['ب', 'fatha-alif'], ['ب', 'dammatain']], // baabun, "a door"
      [['د', 'fatha-alif'], ['ر', 'dammatain']], // daarun, "a house"
      [['ط', 'fatha'], ['ع', 'fatha-alif'], ['م', 'dammatain']], // ta'aamun, "food"
      [['س', 'fatha'], ['ل', 'fatha-alif'], ['م', 'dammatain']], // salaamun, "peace"
      [['ك', 'kasra'], ['ت', 'fatha-alif'], ['ب', 'dammatain']], // kitaabun, "a book"
    ],
    // docs/lesson-10/05 §3: twelve words with "au", eleven joining and one standing apart (dawrun). Ordinary
    // spellings, not quotations; candidates for the teacher's check.
    'fatha-waw': [
      [['ي', 'fatha-waw'], ['م', 'dammatain']], // yawmun, "a day"
      [['خ', 'fatha-waw'], ['ف', 'dammatain']], // khawfun, "fear"
      [['ف', 'fatha-waw'], ['ق', 'fatha']], // fawqa, "above"
      [['س', 'fatha-waw'], ['ف', 'fatha']], // sawfa, "will"
      [['ل', 'fatha-waw'], ['ن', 'dammatain']], // lawnun, "a colour"
      [['ن', 'fatha-waw'], ['م', 'dammatain']], // nawmun, "sleep"
      [['م', 'fatha-waw'], ['ت', 'dammatain']], // mawtun, "death"
      [['ص', 'fatha-waw'], ['ت', 'dammatain']], // sawtun, "a voice"
      [['ث', 'fatha-waw'], ['ب', 'dammatain']], // thawbun, "a garment"
      [['ح', 'fatha-waw'], ['ل', 'fatha']], // hawla, "around"
      [['ق', 'fatha-waw'], ['ل', 'dammatain']], // qawlun, "a saying"
      [['د', 'fatha-waw'], ['ر', 'dammatain']], // dawrun, "a turn" — the wow stands apart
    ],
    // docs/lesson-11/05 §3: twelve words with the long "oo", nine joining and three standing apart (duuna, zuurun,
    // duurun). Ordinary spellings, not quotations; candidates for the teacher's check. No silent-alif plurals.
    'damma-waw': [
      [['س', 'damma-waw'], ['ق', 'dammatain']], // suuqun, "a market"
      [['ح', 'damma-waw'], ['ت', 'dammatain']], // huutun, "a fish"
      [['ط', 'damma-waw'], ['ر', 'dammatain']], // tuurun, "a mountain"
      [['ن', 'damma-waw'], ['ح', 'dammatain']], // nuuhun, "Nuh"
      [['س', 'damma-waw'], ['ر', 'dammatain']], // suurun, "a wall"
      [['ي', 'fatha'], ['ك', 'damma-waw'], ['ن', 'damma']], // yakuunu, "he is"
      [['ق', 'damma'], ['ل', 'damma-waw'], ['ب', 'dammatain']], // quluubun, "hearts"
      [['ذ', 'damma'], ['ن', 'damma-waw'], ['ب', 'dammatain']], // dhunuubun, "sins"
      [['ج', 'damma'], ['ن', 'damma-waw'], ['د', 'dammatain']], // junuudun, "soldiers"
      [['د', 'damma-waw'], ['ن', 'fatha']], // duuna, "below" — the wow stands apart
      [['ز', 'damma-waw'], ['ر', 'dammatain']], // zuurun, "falsehood" — the wow stands apart
      [['د', 'damma-waw'], ['ر', 'dammatain']], // duurun, "houses" — the wow stands apart
    ],
    // docs/lesson-12/05 §3: twelve words with "ai", nine joining and three standing apart (raybun, daynun, waylun).
    // Ordinary spellings, not quotations; candidates for the teacher's check. No word ends in the yaa.
    'fatha-yaa': [
      [['ع', 'fatha-yaa'], ['ن', 'dammatain']], // aynun, "an eye"
      [['خ', 'fatha-yaa'], ['ر', 'dammatain']], // khayrun, "good"
      [['غ', 'fatha-yaa'], ['ب', 'dammatain']], // ghaybun, "the unseen"
      [['ل', 'fatha-yaa'], ['ل', 'dammatain']], // laylun, "night"
      [['س', 'fatha-yaa'], ['ف', 'dammatain']], // sayfun, "a sword"
      [['ط', 'fatha-yaa'], ['ر', 'dammatain']], // tayrun, "birds"
      [['ش', 'fatha-yaa'], ['خ', 'dammatain']], // shaykhun, "an old man"
      [['ك', 'fatha-yaa'], ['ف', 'fatha']], // kayfa, "how"
      [['ل', 'fatha-yaa'], ['س', 'fatha']], // laysa, "is not"
      [['ر', 'fatha-yaa'], ['ب', 'dammatain']], // raybun, "doubt" — the yaa stands apart
      [['د', 'fatha-yaa'], ['ن', 'dammatain']], // daynun, "a debt" — the yaa stands apart
      [['و', 'fatha-yaa'], ['ل', 'dammatain']], // waylun, "woe" — the yaa stands apart
    ],
    // docs/lesson-13/03 §2: twelve words with the long "ee", nine joining and three standing apart (qariibun,
    // kariimun, riihun). Ordinary spellings, not quotations; candidates for the teacher's check. No word ends in
    // the yaa. Seven are words the Qur'an uses of Allah; the page says nothing about it (docs/lesson-13/04 §2).
    'kasra-yaa': [
      [['ت', 'kasra-yaa'], ['ن', 'dammatain']], // tiinun, "figs"
      [['ط', 'kasra-yaa'], ['ن', 'dammatain']], // Tiinun (emphatic t), "clay"
      [['ع', 'fatha'], ['ظ', 'kasra-yaa'], ['م', 'dammatain']], // 'azhiimun, "great"
      [['ر', 'fatha'], ['ح', 'kasra-yaa'], ['م', 'dammatain']], // rahiimun, "merciful"
      [['ع', 'fatha'], ['ل', 'kasra-yaa'], ['م', 'dammatain']], // 'aliimun, "all-knowing"
      [['س', 'fatha'], ['م', 'kasra-yaa'], ['ع', 'dammatain']], // samii'un, "all-hearing"
      [['ح', 'fatha'], ['ك', 'kasra-yaa'], ['م', 'dammatain']], // hakiimun, "wise"
      [['ب', 'fatha'], ['ع', 'kasra-yaa'], ['د', 'dammatain']], // ba'iidun, "far"
      [['ج', 'fatha'], ['م', 'kasra-yaa'], ['ل', 'dammatain']], // jamiilun, "beautiful"
      [['ق', 'fatha'], ['ر', 'kasra-yaa'], ['ب', 'dammatain']], // qariibun, "near" — the yaa stands apart
      [['ك', 'fatha'], ['ر', 'kasra-yaa'], ['م', 'dammatain']], // kariimun, "generous" — the yaa stands apart
      [['ر', 'kasra-yaa'], ['ح', 'dammatain']], // riihun, "a wind" — the yaa stands apart
    ],
    // docs/lesson-14/05 §3: twelve words with a jazam. Ordinary spellings, not quotations; candidates for the teacher's
    // check. None has qalqalah (no jazam on ق ط ب ج د), a noon or meem that a tajweed rule changes (noon and meem with a
    // jazam are only ever last, or before a letter that leaves them plain), a hamza, a shadda, or the article. The last
    // is a jazam and a long vowel in one word, lessons 11 and 14 together; in Indo-Pak its wow shows a jazam too.
    sukun: [
      [['ل', 'fatha'], ['م', 'sukun']], // lam, "did not"
      [['م', 'kasra'], ['ن', 'sukun']], // min, "from"
      [['ع', 'fatha'], ['ن', 'sukun']], // 'an, "about"
      [['ب', 'fatha'], ['ل', 'sukun']], // bal, "rather"
      [['ه', 'fatha'], ['ل', 'sukun']], // hal, "is...?"
      [['ك', 'fatha'], ['م', 'sukun']], // kam, "how many"
      [['ش', 'fatha'], ['م', 'sukun'], ['س', 'dammatain']], // shamsun, "a sun"
      [['ب', 'fatha'], ['ح', 'sukun'], ['ر', 'dammatain']], // bahrun, "a sea"
      [['ن', 'fatha'], ['ف', 'sukun'], ['س', 'dammatain']], // nafsun, "a soul"
      [['ي', 'fatha'], ['ع', 'sukun'], ['ل', 'fatha'], ['م', 'damma']], // ya'lamu, "he knows"
      [['ن', 'fatha'], ['ع', 'sukun'], ['ب', 'damma'], ['د', 'damma']], // na'budu, "we worship"
      [['م', 'fatha'], ['ك', 'sukun'], ['ت', 'damma-waw'], ['ب', 'dammatain']], // maktuubun, "written"
    ],
    // docs/lesson-15/05 §3: twelve words with a shadda, eight with the zabar one, three with the zair one and one with the
    // paish one (the last two are rarer at a word's end in ordinary Arabic; the teacher may know better ones). Ordinary
    // spellings, not quotations; candidates for the teacher's check. A shadda only in the middle or at the end of a word
    // (the article's shadda is Lesson 18's), never on alif, and none with a doubled tanween (kullun, haqqun: Lesson 18 on).
    // Words 4 and 5 have the hum (noon and meem); words 6, 9 and 10 carry the zair and shadda together, the ones to look
    // at in both scripts; word 9 also has a jazam (lessons 14 and 15 in one word).
    shadda: [
      [['ش', 'fatha'], ['د', 'shadda-fatha']], // shadda, "he pulled tight"
      [['ر', 'fatha'], ['د', 'shadda-fatha']], // radda, "he gave back"
      [['ع', 'fatha'], ['د', 'shadda-fatha']], // 'adda, "he counted"
      [['ظ', 'fatha'], ['ن', 'shadda-fatha']], // zanna, "he thought" (the hum)
      [['ث', 'damma'], ['م', 'shadda-fatha']], // thumma, "then" (the hum)
      [['ر', 'fatha'], ['ب', 'shadda-kasra']], // rabbi, "my Lord"
      [['ك', 'fatha'], ['ب', 'shadda-fatha'], ['ر', 'fatha']], // kabbara, "he said Allahu akbar"
      [['ق', 'fatha'], ['د', 'shadda-fatha'], ['م', 'fatha']], // qaddama, "he sent ahead"
      [['س', 'fatha'], ['ب', 'shadda-kasra'], ['ح', 'sukun']], // sabbih, "glorify!"
      [['ي', 'damma'], ['ع', 'fatha'], ['ل', 'shadda-kasra'], ['م', 'damma']], // yu'allimu, "he teaches"
      [['س', 'damma'], ['ك', 'shadda-fatha'], ['ر', 'dammatain']], // sukkarun, "sugar"
      [['ي', 'fatha'], ['ر', 'damma'], ['د', 'shadda-damma']], // yaruddu, "he gives back"
    ],
    // docs/lesson-9/05 §3: twelve words, exactly as the mushaf spells them (docs/lesson-9/05 §1) — khari zabar in
    // six, khari zair in three, ulta paish in four, every one built from a mark this lesson teaches. Four of them
    // (words 2, 11 and 12, and spell.js's own walkthrough word 3) are the ones docs/lesson-9/05 §4 is least sure of;
    // kept anyway, and flagged there for the teacher's check.
    standing: [
      [['ذ', 'standing-fatha'], ['ل', 'kasra'], ['ك', 'fatha']], // dhaalika, "that"
      [['ه', 'standing-fatha'], ['ذ', 'kasra'], ['ه', 'standing-kasra']], // haadhihii, "this" (f.)
      [['م', 'standing-fatha'], ['ل', 'kasra'], ['ك', 'kasra']], // maaliki, "master of"
      [['س', 'fatha'], ['م', 'standing-fatha'], ['و', 'standing-fatha'], ['ت', 'dammatain']], // samaawaatun, "heavens"
      [['ظ', 'damma'], ['ل', 'damma'], ['م', 'standing-fatha'], ['ت', 'dammatain']], // zulumaatun, "darknesses"
      [['ك', 'fatha'], ['ل', 'kasra'], ['م', 'standing-fatha'], ['ت', 'dammatain']], // kalimaatun, "words"
      [['ب', 'kasra'], ['ي', 'fatha'], ['د', 'kasra'], ['ه', 'standing-kasra']], // biyadihii, "in his hand"
      [['و', 'fatha'], ['ل', 'fatha'], ['د', 'kasra'], ['ه', 'standing-kasra']], // waladihii, "his child's"
      [['ل', 'fatha'], ['ه', 'inverted-damma']], // lahuu, "for him"
      [['م', 'fatha'], ['ع', 'fatha'], ['ه', 'inverted-damma']], // ma'ahuu, "with him"
      [['م', 'fatha-alif'], ['ل', 'damma'], ['ه', 'inverted-damma']], // maaluhuu, "his wealth"
      [['د', 'fatha-alif'], ['و', 'inverted-damma'], ['د', 'fatha']], // daawuuda, "Dawud"
    ],
  };

  // Exposed so tools/qaida-words-check.js can check every word, on every lesson, without a browser (docs/lesson-8/06
  // §3). Before the grid guard below: the data exists whether or not this particular page has a .mashq to draw it in.
  window.qaidaExerciseWords = WORDS;

  const grid = document.querySelector('.mashq');
  if (!grid) return;

  // A single mark (lessons 4-6, 8) or a SET (Lesson 9's "standing" — marks.markOf returns null for a set, docs/lesson-9/04 §6).
  const mark = marks.markOf(root.dataset.mark) || marks.setOf(root.dataset.mark);
  const words = mark && WORDS[mark.id];
  if (!mark || !words) return;

  const lede = document.querySelector('.exercise-lede');
  const next = document.querySelector('.onward .next');
  const fill = marks.fill;

  // The active script's own glyph for a letter, by its key — the same map spell.js and marks.js build.
  function lettersMap() {
    return new Map(shell.lettersOf().map(([glyph, name]) => [shell.keyOf(glyph), { glyph, name }]));
  }

  function glyphFor(names, word) {
    return word.map(([key, id]) => {
      const found = names.get(key);
      return marks.glyphOf(found ? found.glyph : key, marks.markOf(id));
    }).join('');
  }

  function paint() {
    const names = lettersMap();
    if (lede) lede.textContent = fill(lede.dataset.template, { mark: marks.nameOf(mark, shell) });

    grid.textContent = '';
    words.forEach((word, i) => {
      const cell = document.createElement('span');
      cell.className = 'mashq-word';
      cell.setAttribute('role', 'listitem');
      // No meaning and no transliteration is read out either: this page is reading practice, not narration, the
      // same limit the aayat overlay and every marked tile on the site already accept.
      cell.setAttribute('aria-label', fill(grid.dataset.wordLabel, { n: i + 1 }));
      const glyph = document.createElement('span');
      glyph.lang = 'ar';
      glyph.dir = 'rtl';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = glyphFor(names, word);
      const number = document.createElement('span');
      number.className = 'mashq-n';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(i + 1);
      cell.append(number, glyph);
      grid.append(cell);
    });

    // The next lesson's name follows the student's choice of names, the way a lesson's own Next button does. With no
    // next lesson and `data-last` (Lesson 14, docs/lesson-14/04 §6) it says that instead and goes back to the Qaida.
    if (next && (next.dataset.nextZabar || next.dataset.last)) {
      const span = next.querySelector('span');
      if (span) {
        span.textContent = !nextEntry() && next.dataset.last
          ? next.dataset.last
          : shell.state.names === 'zabar' ? next.dataset.nextZabar : next.dataset.nextFatha;
      }
    }
  }

  const nextEntry = () => shell.LESSONS.find((lesson) => lesson.n === mark.lesson + 1);

  // The next lesson: a real link once it is built, a "not built yet" note until then — the same three lines
  // mark-lesson.js's own Next button already has (docs/lesson-8/06 §2, step 0: "exercise 6 has no Next. Lesson 7
  // exists now: link it"; docs/lesson-8/04 §8 needs the same for exercise-8, where Lesson 9 is not built yet). Only
  // a <button> is wired this way — exercise-4/5's Next is a plain <a href> to a lesson already built when it shipped.
  if (next && next.tagName === 'BUTTON') {
    next.addEventListener('click', () => {
      const entry = nextEntry();
      if (entry && entry.built && entry.href) location.href = entry.href;
      else if (!entry && next.dataset.last) location.href = 'index.html';
      else shell.say(next.dataset.soon);
    });
  }

  shell.onChange(paint);
  // Draws the page for the first time, through the listener above — and, like every other page, writes the student's
  // script, names and grouping onto <html> and ticks them in the Settings dialog. Without this call the dialog opened
  // with nothing chosen (the user, 2026-09-27: "none of the options are selected").
  shell.renderSetup();

  // What the options panel needs to know this page by (qaida-options.js reads window.qaida): kind "exercise" gets
  // the rows that mean something here — no drill, no letters to tap.
  window.qaida = {
    kind: 'exercise',
    count: words.length,
    render: paint,
  };
})();
