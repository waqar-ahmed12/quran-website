// TEMPORARY — local preview only, for choosing the headline/subline. Delete this file and its
// <script> tag in index.html once a choice is locked in, same as the font/gold/position buttons
// used earlier in phase 2.
//
// Why these seven: current fixes the free-Qaida overpromise (not live yet) while keeping the
// journey headline; warm and hadith are the same headline with a different subline; the rest
// are distinct directions (teacher-first, radical simplicity, beginner empathy, parent-inclusive).
// The hadith line is a translation, not a Qur'an verse, kept separate from the aayat that appear
// on the book's pages later in the scroll. Verify its exact wording against sunnah.com before
// shipping it, the same rule the aayat text follows.
//
// The user asked for control over the actual wording, not only a choice between presets: two text fields at the
// top now edit the headline and the sentence under it directly, as you type. The preset buttons below still work —
// clicking one fills the fields in — so they're quick starting points, not the only way to set the words.

(() => {
  const options = [
    {
      label: 'Current (fixed)',
      h1: 'From Alif to Ayah',
      p: 'A real teacher, one letter at a time, until the verses are yours.',
    },
    {
      label: 'Warmer',
      h1: 'From Alif to Ayah',
      p: "One-to-one lessons, at your pace, with a teacher who's actually listening.",
    },
    {
      label: 'Hadith',
      h1: 'From Alif to Ayah',
      p: '“The best among you are those who learn the Qur’an and teach it.” — the Prophet ﷺ',
    },
    {
      label: 'Teacher, not app',
      h1: 'A Teacher, Not an App',
      p: 'Qur’an lessons, one to one — reading, Tajweed, and Hifz, for every age.',
    },
    {
      label: 'Read. Recite. Together.',
      h1: 'Read. Recite. Together.',
      p: 'Qur’an lessons with a real teacher, one to one.',
    },
    {
      label: 'Start wherever',
      h1: 'Start Wherever You Are',
      p: 'From your very first letter to your first surah — with a teacher beside you.',
    },
    {
      label: 'For your child too',
      h1: 'From Alif to Ayah',
      p: 'For your first lesson or your child’s — a real teacher, one to one.',
    },
  ];

  const h1 = document.querySelector('.wordmark h1');
  const p = document.querySelector('.wordmark p');

  // Collapsible, and closed to start with on phones, where it would cover the book.
  const panel = document.createElement('details');
  panel.open = !matchMedia('(max-width: 767px)').matches;
  panel.style.cssText = `
    position: fixed; left: 1rem; bottom: 1rem; z-index: 9999;
    padding: 0.5rem 0.75rem; max-width: 220px;
    max-height: calc(100svh - 2rem); overflow-y: auto;
    background: rgba(20, 16, 15, 0.92);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    font: 12px/1.3 system-ui, sans-serif;
    color: #FAFAF9;
  `;
  const summary = document.createElement('summary');
  summary.textContent = 'Headline';
  summary.style.cssText = 'cursor: pointer; padding: 0.25rem 0;';

  // Free-text fields: what you type replaces the words on the page as you go.
  const fields = document.createElement('div');
  fields.style.cssText = 'display: flex; flex-direction: column; gap: 0.3rem; margin: 0.4rem 0;';
  const fieldStyle = `
    box-sizing: border-box; width: 100%; padding: 0.4rem 0.5rem;
    font: 12px/1.3 system-ui, sans-serif; color: #FAFAF9;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(250,250,249,0.3); border-radius: 6px;
  `;
  const fieldLabelStyle = 'color: #A8A29E; font: 11px/1.2 system-ui, sans-serif;';

  function field(labelText, initial, onInput) {
    const label = document.createElement('label');
    label.style.cssText = fieldLabelStyle;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = initial;
    input.style.cssText = fieldStyle;
    input.addEventListener('input', () => {
      onInput(input.value);
      unpress(); // typing means no preset below is "the" chosen one any more
    });
    fields.append(label, input);
    return input;
  }

  const headlineField = field('Headline', h1.textContent, (v) => (h1.textContent = v));
  const sublineField = field('Sentence below it', p.textContent, (v) => (p.textContent = v));

  if (window.registerControl) {
    window.registerControl('Headline', 'Headline', {
      get: () => headlineField.value,
      set: (v) => {
        h1.textContent = headlineField.value = v;
        unpress();
      },
    });
    window.registerControl('Headline', 'Sentence below it', {
      get: () => sublineField.value,
      set: (v) => {
        p.textContent = sublineField.value = v;
        unpress();
      },
    });
  }

  const list = document.createElement('div');
  list.style.cssText = 'display: flex; flex-direction: column; gap: 0.4rem;';
  const presetsLabel = document.createElement('p');
  presetsLabel.textContent = 'Or start from one of these:';
  presetsLabel.style.cssText = 'margin: 0.5rem 0 0.15rem; color: #A8A29E; font: 11px/1.2 system-ui, sans-serif;';
  panel.append(summary, fields, presetsLabel, list);

  function unpress() {
    panel.querySelectorAll('button').forEach((b) => {
      b.style.borderColor = 'rgba(250,250,249,0.25)';
      b.style.color = '#FAFAF9';
    });
  }

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.textContent = opt.label;
    btn.style.cssText = `
      font: 12px/1.3 system-ui, sans-serif;
      color: #FAFAF9;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(250,250,249,0.25);
      border-radius: 999px;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      text-align: left;
    `;
    btn.addEventListener('click', () => {
      h1.textContent = headlineField.value = opt.h1;
      p.textContent = sublineField.value = opt.p;
      unpress();
      btn.style.borderColor = '#D4AF37';
      btn.style.color = '#D4AF37';
    });
    list.appendChild(btn);
  });

  document.body.appendChild(panel);
})();
