// TEMPORARY, local preview only: options and text fields for the bottom of the page, first in the Options panel. Once
// the user picks, write the chosen words into index.html and the chosen look into styles.css, then delete this file, its
// <script> tag, the "bottom of the page" TRYOUT part of styles.css, and the show-form button (index.html) and its code
// (footer.js) if "Open" wins.
//
// From taste-skill:minimalist-skill and ui-ux-pro-max, 2026-09-14. The user's list for the bottom: Free Qaida, One-to-one
// lessons, About the teacher and Contact; contact by WhatsApp and an email form; the teacher's name and years. Claude
// wrote every line as a stand-in, and every line has a text field here, because the user tests wording with other people.

(() => {
  if (!window.addText) return;

  const root = document.documentElement;
  const footer = document.querySelector('.footer');
  const $ = (selector) => footer.querySelector(selector);

  // Made first so it ends up just under "Bottom of the page", which is made next, also first.
  tryoutGroup('Bottom: form messages', { first: true });
  tryoutGroup('Bottom of the page', { open: true, first: true });

  addOption('Layout', { 'Side by side': 'side', Stacked: 'stacked' }, 'side', (v) => (root.dataset.footer = v));
  // Claude's pick (2026-09-14): the full form on a contact page of its own, with a link to it here. The other two keep
  // the form on this page, to compare.
  root.dataset.form = 'page';
  addOption('Email form', { 'On its own page': 'page', 'Here, open': 'open', 'Here, behind a button': 'closed' }, 'page', (v) => {
    root.dataset.form = v;
    footer.classList.remove('form-open');
    $('.show-form').setAttribute('aria-expanded', 'false');
  });
  addOption('Top edge', { 'Line and star': 'star', Line: 'line', Nothing: 'none' }, 'star', (v) => (root.dataset.edge = v));

  // [the field's name, the element whose words it sets]
  const WORDS = [
    ['Teacher heading', '.about .label'],
    ['Teacher name (stand-in)', '.about .lead'],
    ['Years (stand-in)', '.years'],
    ['About the teacher', '.bio'],
    ['Contact heading', '.contact .label'],
    ['Contact title', '.contact .lead'],
    ['Contact line', '.intro'],
    ['WhatsApp button', '.whatsapp span'],
    ['Email link (own page)', '.email-page'],
    ['Email button (behind a button)', '.show-form'],
    ['Between WhatsApp and form', '.or'],
    ['Name label', 'label[for="enquiry-name"]'],
    ['Email label', 'label[for="enquiry-email"]'],
    ['Message label', 'label[for="enquiry-message"]'],
    ['Send button', '.enquiry [type="submit"]'],
    ['Privacy line', '.privacy'],
    ['Footer name (stand-in)', '.footer-base .name'],
    ['Qaida link', '.footer-base .qaida'],
    ['Lessons link', '.footer-base .lessons'],
    ['About link', '.footer-base [href="#about"]'],
    ['Contact link', '.footer-base [href="#contact"]'],
    ['Copyright line', '.copyright'],
  ];
  for (const [label, selector] of WORDS) {
    const el = $(selector);
    addText(label, el.textContent, (v) => (el.textContent = v));
  }

  // The form's messages are data- attributes that footer.js reads when it needs them.
  // [the field's name, the element, the data- attribute]
  const MESSAGES = [
    ['Name left empty', '#enquiry-name', 'missing'],
    ['Email left empty', '#enquiry-email', 'missing'],
    ['Email not complete', '#enquiry-email', 'invalid'],
    ['Message left empty', '#enquiry-message', 'missing'],
    ['While sending', '.enquiry', 'sending'],
    ['Sent', '.enquiry', 'sent'],
    ['Didn’t send', '.enquiry', 'failed'],
    ['Not connected yet', '.enquiry', 'standin'],
  ];
  const status = $('.status');
  tryoutGroup('Bottom: form messages');
  for (const [label, selector, key] of MESSAGES) {
    const el = $(selector);
    addText(label, el.dataset[key], (v) => {
      el.dataset[key] = v;
      // A message already showing takes the new words straight away.
      for (const field of footer.querySelectorAll('[aria-invalid="true"]')) field.dispatchEvent(new Event('input'));
      if (status.dataset.state === key) status.textContent = v;
    });
  }
})();
