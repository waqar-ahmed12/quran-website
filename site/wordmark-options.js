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

  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed; left: 1rem; bottom: 1rem; z-index: 9999;
    display: flex; flex-direction: column; gap: 0.4rem;
    padding: 0.75rem; max-width: 220px;
    background: rgba(20, 16, 15, 0.92);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    font-family: system-ui, sans-serif;
  `;

  options.forEach((opt, i) => {
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
      h1.textContent = opt.h1;
      p.textContent = opt.p;
      panel.querySelectorAll('button').forEach((b) => {
        b.style.borderColor = 'rgba(250,250,249,0.25)';
        b.style.color = '#FAFAF9';
      });
      btn.style.borderColor = '#D4AF37';
      btn.style.color = '#D4AF37';
    });
    if (i === 0) {
      btn.style.borderColor = '#D4AF37';
      btn.style.color = '#D4AF37';
    }
    panel.appendChild(btn);
  });

  document.body.appendChild(panel);
})();
