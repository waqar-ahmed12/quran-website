// The free Qaida's practice engine. QAIDA-BUILD.md step 4; the specification is docs/lesson-2/02-practice-engine.md.
//
// A drill: it asks a question, judges the answer, remembers how each item is going, and chooses what to ask next.
// Lesson 2 is its first customer; lessons 4 to 14 reuse it, so two boundaries are kept on purpose:
//   1. No DOM. The page asks for a question and reports the answer; everything visible is the page's job.
//   2. No storage of its own. Progress goes through qaidaShell (drillOf, recordAnswer, …). The engine never touches
//      localStorage, and it has no idea its items are letters: `glyph` is a string to show, `family` an opaque tag.

(() => {
  const shell = window.qaidaShell;
  if (!shell) return;

  // Revised 2026-09-23 (fixes/lesson 2.txt: "why 39 questions!!! if the user is doing good in a row, it means he
  // knows"). Three in a row to master a letter, and four fifths of the lesson known before it recommends moving on,
  // came to 24 x 3 = 72 correct answers at the least — too long for a recognition drill, by the user's own account
  // after using it. Two in a row now makes an item known, and seven tenths of the lesson makes it ready: a floor of
  // 21 x 2 = 42, and each mistake now costs less to put right too. `clean` stays: a letter still shaky is still
  // advice, never a block, and the numbers are one row each in the options panel if they still feel off.
  const DEFAULTS = {
    choices: 4, // buttons per question, kept between 2 and 6
    target: 2, // consecutive right answers that master an item
    readyAt: 0.7, // fraction of the required items that must be known
    clean: true, // …and none of the ones that were missed may still be unmastered
    strugglingAt: 3, // lifetime misses on one item before it is reported as struggling
    familyFirst: true, // one look-alike among the wrong answers, when there is one
    cooldown: 2, // questions a just-missed item sits out before it can come back
    noRepeatWithin: null, // null: min(3, a third of the pool)
    // 2026-09-24 (fixes/lesson 2.txt: "33 questions in a row and still 8 letters… ask every letter twice randomly,
    // if mistake made, ask one more time… place these randoms close by so the progress moves quickly"). A weighted
    // lottery can leave any one item undrawn for a long time by chance — nobody asked for chance, they asked for
    // every item to get its fair, bounded turn. `deck` is opt-in (only Lesson 2 uses it today: a flat, all-required
    // pool with no review items riding along; the weighted draw below still runs everything else, unchanged) —
    // see buildDeck() and pickFromDeck().
    deck: false,
  };

  const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
  const isRequired = (item) => item.required !== false;

  // `family` is one tag or a list of them: an item can look like two different groups (و is in two).
  const tagsOf = (item) => (Array.isArray(item.family) ? item.family : item.family != null ? [item.family] : []);
  const sharesFamily = (a, b) => tagsOf(a).some((tag) => tagsOf(b).includes(tag));

  function create(options) {
    const settings = { ...DEFAULTS, random: Math.random, on: {}, ...options };
    const lesson = settings.lesson;
    const on = settings.on || {};
    let items = Array.isArray(settings.items) ? settings.items.slice() : [];
    let formats = Array.isArray(settings.formats) ? settings.formats.slice() : [];

    const emit = (name, ...args) => {
      if (typeof on[name] === 'function') on[name](...args);
    };

    // What happened in this visit. What the student has achieved lives in the shell, so it outlasts the visit.
    const fresh = () => ({
      n: 0, // questions drawn
      right: 0,
      wrong: 0,
      asked: new Set(), // ids shown at least once
      recent: [], // ids in the order asked
      missedAt: new Map(), // id -> the question number it was missed on
      readyFired: false,
      struggled: new Set(),
      posBag: { size: 0, queue: [] }, // which button slot the right answer lands in — see drawPosition
      deck: [], // ids still owed a turn, `settings.deck` only — see buildDeck()
    });

    let session = fresh();
    let current = null;
    let started = false;

    const record = () => shell.drillOf(lesson);
    const streakOf = (id) => record().streak[id] || 0;
    const wrongOf = (id) => record().wrong[id] || 0;

    function shuffle(list) {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(settings.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    }

    // Every required item not already known, twice each, shuffled together. Emptied by pickFromDeck as the visit
    // goes on; a miss puts one more copy back in close by (see answer()), never at the very end. Once it runs dry,
    // pickItem falls back to the weighted draw below — free practice, not owed to anyone any more.
    function buildDeck() {
      if (!settings.deck) return [];
      const owed = items.filter((item) => isRequired(item) && streakOf(item.id) < settings.target);
      const queue = [];
      for (const item of owed) queue.push(item.id, item.id);
      return shuffle(queue);
    }

    session.deck = buildDeck(); // build once now that streakOf and shuffle above both exist

    // Progress ---------------------------------------------------------------------------------

    function progress() {
      const needed = items.filter(isRequired);
      const known = needed.filter((item) => streakOf(item.id) >= settings.target).length;
      const toFix = needed.filter((item) => wrongOf(item.id) > 0 && streakOf(item.id) < settings.target).length;
      const total = needed.length;
      const ready = total > 0
        && known / total >= settings.readyAt - 1e-9
        && (!settings.clean || toFix === 0);
      return {
        total, known, asked: session.right + session.wrong, right: session.right, wrong: session.wrong, toFix, ready,
      };
    }

    const writeTotal = () => shell.setDrillTotal(lesson, items.filter(isRequired).length, settings.target);

    // A lesson is "ready" once, per visit. A student who arrives already ready is not congratulated again: the page
    // reads it off progress() and shows the finished state without ceremony.
    function checkReady() {
      if (session.readyFired) return false;
      const now = progress();
      if (!now.ready) return false;
      session.readyFired = true;
      emit('ready', now);
      return true;
    }

    // Formats -----------------------------------------------------------------------------------
    // A format is data, not a branch, so a later lesson can add "see the mark, name it" without editing this file.

    const canUse = (format, item) => typeof format.available !== 'function' || format.available(item);
    const fits = (format, item) => (format.minStreak || 0) <= streakOf(item.id) && canUse(format, item);
    const hasFormat = (item) => formats.some((format) => canUse(format, item));

    function chooseFormat(item) {
      const ready = formats.filter((format) => fits(format, item));
      if (ready.length) return ready[Math.floor(settings.random() * ready.length)];
      const first = formats[0];
      return first && canUse(first, item) ? first : null;
    }

    // Choosing the next item --------------------------------------------------------------------
    // A weighted draw and not a shuffled queue: a queue can't bring a missed item back sooner, which is the whole of
    // what the user asked for ("repeat them not in a row, but increase the frequency").

    const weightOf = (item) => {
      const run = streakOf(item.id);
      let weight = 1;
      if (run === 0 && wrongOf(item.id) > 0) weight *= 4; // missed, and not yet put right
      if (!session.asked.has(item.id)) weight *= 2; // never seen this visit
      if (run >= settings.target) weight *= 0.25; // known: still asked, or it rots, but rarely
      if (!isRequired(item)) weight *= 0.5; // a review item rides along
      return weight;
    };

    function pickItem() {
      const playable = items.filter(hasFormat);
      if (!playable.length) {
        emit('error', 'formats');
        return null;
      }
      // The deck (Lesson 2 only, `settings.deck`) drives things until every item has had its bounded, close-together
      // turns; empty (or switched off), it's the weighted draw everything else has always used.
      if (session.deck.length) {
        const picked = pickFromDeck(playable);
        if (picked) return picked;
      }
      const picked = pickWeighted(playable);
      if (!picked) emit('error', 'formats');
      return picked;
    }

    // Pops the next id the deck owes a turn — skipping over one that would repeat the very last question, since a
    // deck (unlike the lottery below) has no other reason not to hand back the same id twice running.
    function pickFromDeck(playable) {
      const last = session.recent[session.recent.length - 1];
      let at = session.deck.findIndex((id) => id !== last);
      if (at === -1) at = 0; // every copy left is the one just asked — ask it anyway rather than stall
      const id = session.deck[at];
      const item = playable.find((it) => it.id === id);
      const format = item && chooseFormat(item);
      if (!item || !format) return null; // not askable right now; leave it queued and fall back to the lottery once
      session.deck.splice(at, 1);
      return { item, format, fromDeck: true };
    }

    function pickWeighted(playable) {
      const next = session.n + 1;
      const last = session.recent[session.recent.length - 1];
      const span = settings.noRepeatWithin != null
        ? settings.noRepeatWithin
        : Math.min(3, Math.floor(items.length / 3));
      const recent = new Set(span > 0 ? session.recent.slice(-span) : []);
      const cooling = (item) => session.missedAt.has(item.id) && next - session.missedAt.get(item.id) <= settings.cooldown;

      // Hard exclusions, loosened one at a time (last rule first) only if they would leave nothing to ask.
      const notLast = (item) => items.length <= 2 || item.id !== last;
      let pool = playable.filter((item) => notLast(item) && !recent.has(item.id) && !cooling(item));
      if (!pool.length) pool = playable.filter((item) => notLast(item) && !recent.has(item.id));
      if (!pool.length) pool = playable.filter(notLast);
      if (!pool.length) pool = playable;

      while (pool.length) {
        const weights = pool.map(weightOf);
        let roll = settings.random() * weights.reduce((sum, w) => sum + w, 0);
        let index = 0;
        while (index < pool.length - 1 && roll >= weights[index]) {
          roll -= weights[index];
          index += 1;
        }
        const item = pool[index];
        const format = chooseFormat(item);
        if (format) return { item, format };
        pool = pool.filter((other) => other !== item);
      }
      return null;
    }

    // Distractors -------------------------------------------------------------------------------
    // One look-alike and the rest from anywhere. A whole question of look-alikes turns every answer into counting
    // dots, and the student learns to compare rather than to know — the very thing this lesson exists to catch.

    function distractorsFor(item, format, count) {
      const face = format.answerWith === 'glyph' ? 'glyph' : 'name';
      const taken = new Set([item[face]]);
      const chosen = [];
      // Two items may honestly share a glyph in a later lesson; the same button twice would be a bug.
      const take = (other) => {
        const text = other[face];
        if (!text || taken.has(text)) return false;
        taken.add(text);
        chosen.push(other);
        return true;
      };

      // A drill that mixes questions (Lesson 19: "how do you start it?" beside "is the alif read?") tags each item with the question it
      // answers, `askGroup`, and an answer to one question is never offered to another. An item with no tag, which is every item of every
      // lesson before it, is dealt exactly as before: the filter is a no-op.
      const group = item.askGroup;
      const others = shuffle(items.filter((other) => other.id !== item.id && (group == null || other.askGroup === group)));
      if (settings.familyFirst && count > 0) {
        for (const other of others) {
          if (sharesFamily(item, other) && take(other)) break;
        }
      }
      for (const other of others) {
        if (chosen.length >= count) break;
        take(other);
      }
      return chosen;
    }

    // Where the right answer lands. A fresh shuffle is fair only in the long run — over a handful of questions it
    // clusters, which is what the user noticed ("the second option and the last were most likely to be correct").
    // A shuffle bag (the trick behind Tetris's piece bag) fixes that: every slot is drawn once before any slot
    // repeats, so any run of `count` questions in a row covers every position exactly once.
    function drawPosition(count) {
      const bag = session.posBag;
      if (bag.size !== count || !bag.queue.length) {
        session.posBag = { size: count, queue: shuffle([...Array(count).keys()]) };
      }
      return session.posBag.queue.pop();
    }

    function makeQuestion(item, format, n, fromDeck) {
      const prompt = { mode: format.ask };
      if (format.ask === 'glyph') prompt.glyph = item.glyph;
      else if (format.ask === 'name') prompt.name = item.name;
      else if (format.ask === 'sound') prompt.audio = item.audio;

      // A format may bring its own answers (Lesson 21's "tap the letter": the answers are the word's own letters, which are not other items). It
      // says which answer is right (`correctFor`); they keep the order it gave them, which here is the order the letters are read in. Every other
      // format has no `choicesFor`, so it is dealt exactly as before.
      if (typeof format.choicesFor === 'function') {
        const own = format.choicesFor(item);
        if (!Array.isArray(own) || own.length < 2) return null;
        return { n, format, item, prompt, choices: own, correct: format.correctFor(item), answered: false, verdict: null, fromDeck: Boolean(fromDeck) };
      }

      const wanted = clamp(Math.round(Number(settings.choices)) || DEFAULTS.choices, 2, 6) - 1;
      const spread = distractorsFor(item, format, wanted);
      if (!spread.length) return null; // below two choices there is no question to ask

      const total = spread.length + 1;
      const others = shuffle(spread);
      const choices = new Array(total);
      const at = drawPosition(total);
      choices[at] = item;
      for (let i = 0, next = 0; i < total; i += 1) {
        if (i !== at) choices[i] = others[next++];
      }
      return { n, format, item, prompt, choices, correct: item.id, answered: false, verdict: null, fromDeck: Boolean(fromDeck) };
    }

    function advance() {
      const picked = pickItem();
      if (!picked) {
        current = null;
        return null;
      }
      const question = makeQuestion(picked.item, picked.format, session.n + 1, picked.fromDeck);
      if (!question) {
        current = null;
        emit('error', 'pool');
        return null;
      }
      session.n += 1;
      session.recent.push(picked.item.id);
      if (session.recent.length > 12) session.recent.shift();
      session.asked.add(picked.item.id);
      // Keeps `seen` meaning what it has always meant, so the home's "has anything been started" test still works.
      if (picked.item.glyph) shell.markSeen(lesson, picked.item.glyph);
      current = question;
      emit('question', question);
      return question;
    }

    // Answering -----------------------------------------------------------------------------------

    function answer(choiceId) {
      const question = current;
      if (!question) return null;
      if (question.answered) return question.verdict;
      const chosen = question.choices.find((choice) => choice.id === choiceId);
      if (!chosen) return null;

      const item = question.item;
      const right = chosen.id === question.correct;
      const before = streakOf(item.id);
      const streak = shell.recordAnswer(lesson, item.id, right);
      question.answered = true;

      if (right) {
        session.right += 1;
      } else {
        session.wrong += 1;
        session.missedAt.set(item.id, question.n);
        // "If a mistake is made, ask one more time" — put one more turn back in close by (2 to 4 questions ahead,
        // never straight back). Only while this question actually came from the deck: a slip during free practice
        // after the deck is spent shouldn't reopen it.
        if (question.fromDeck) {
          const at = Math.min(session.deck.length, 2 + Math.floor(settings.random() * 3));
          session.deck.splice(at, 0, item.id);
        }
      }

      const mastered = right && before < settings.target && streak >= settings.target;
      const unmastered = !right && before >= settings.target;
      let struggling = false;
      if (!right && isRequired(item) && !session.struggled.has(item.id) && wrongOf(item.id) >= settings.strugglingAt) {
        session.struggled.add(item.id);
        struggling = true;
      }

      // `ready` on the verdict means this answer took the lesson over the line; the callback follows the others.
      const now = progress();
      const crossed = !session.readyFired && now.ready;
      const verdict = { right, question, item, chosen, streak, mastered, unmastered, struggling, ready: crossed };
      question.verdict = verdict;

      emit('verdict', verdict);
      emit('progress', now);
      if (struggling) emit('struggling', item);
      if (crossed) {
        session.readyFired = true;
        emit('ready', now);
      }
      return verdict;
    }

    // Re-ask the current item with the choices dealt again. Used by the options panel, and when a setting that
    // changes the choices is moved.
    function reask(newFormat) {
      if (!current) return null;
      let format = current.format;
      if (newFormat) {
        // The formats changed. If this item can't be asked the new way, draw another item — or, if none can, say so
        // (`error('formats')`) rather than quietly carrying on with the old way.
        format = chooseFormat(current.item);
        if (!format) return advance();
      }
      const question = makeQuestion(current.item, format, current.n, current.fromDeck);
      if (!question) {
        emit('error', 'pool');
        return null;
      }
      current = question;
      emit('question', question);
      return question;
    }

    // What the page holds ---------------------------------------------------------------------------

    const drill = {
      start() {
        if (started) return current;
        started = true;
        writeTotal();
        session.readyFired = progress().ready;
        emit('progress', progress());
        return advance();
      },

      get question() {
        return current;
      },

      answer,

      // No-op while the current question is unanswered, so an answer can't be skipped past. `skip` is for the options
      // panel, which wants a new question to look at and is happy to leave no mark on the letter.
      next(skip = false) {
        if (!started || (current && !current.answered && !skip)) return current;
        return advance();
      },

      // What the drill is running with now, for a panel that shows it.
      get settings() {
        const { choices, target, readyAt, familyFirst } = settings;
        return { choices, target, readyAt, familyFirst };
      },

      again() {
        return reask(false);
      },

      progress,

      struggling() {
        return items.filter(
          (item) => isRequired(item) && wrongOf(item.id) >= settings.strugglingAt && streakOf(item.id) < settings.target,
        );
      },

      // The script changed, so the pool did. Mastery is kept under each item's id; the question on the board is not.
      setItems(list) {
        items = Array.isArray(list) ? list.slice() : [];
        writeTotal();
        current = null;
        emit('progress', progress());
        if (started) advance();
      },

      // For the options panel: change how the drill behaves without rebuilding it.
      set(partial = {}) {
        if ('choices' in partial) settings.choices = clamp(Math.round(Number(partial.choices)) || DEFAULTS.choices, 2, 6);
        if ('target' in partial) settings.target = clamp(Math.round(Number(partial.target)) || DEFAULTS.target, 1, 9);
        if ('readyAt' in partial) settings.readyAt = clamp(Number(partial.readyAt), 0, 1);
        if ('familyFirst' in partial) settings.familyFirst = Boolean(partial.familyFirst);
        for (const key of ['strugglingAt', 'cooldown', 'noRepeatWithin', 'clean']) {
          if (key in partial) settings[key] = partial[key];
        }
        if (Array.isArray(partial.formats)) formats = partial.formats.slice();

        if ('target' in partial) writeTotal();
        if ('target' in partial || 'readyAt' in partial) {
          emit('progress', progress());
          checkReady();
        }

        // Deal the question on the board again with the new settings — or, if there is none (an error had emptied the
        // board), ask one. An answered question is left alone: the next one will use them.
        const dealt = 'choices' in partial || 'familyFirst' in partial || 'formats' in partial;
        if (started && dealt) {
          if (!current) advance();
          else if (!current.answered) reask('formats' in partial);
        }
      },

      masterAll() {
        for (const item of items) {
          for (let guard = 0; streakOf(item.id) < settings.target && guard < 20; guard += 1) {
            shell.recordAnswer(lesson, item.id, true);
          }
        }
        emit('progress', progress());
        checkReady();
      },

      reset() {
        shell.clearDrill(lesson);
        session = fresh();
        session.deck = buildDeck();
        current = null;
        writeTotal();
        emit('progress', progress());
        if (started) advance();
      },
    };

    return drill;
  }

  window.qaidaPractice = { create };
})();
