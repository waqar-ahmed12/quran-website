// The bottom of the page: it rises into view the first time it scrolls in, and runs the enquiry form.
//
// The browser's own checks (required, type="email") decide what's wrong with a field, and this shows the reason under
// it in the page's words (the field's data-missing and data-invalid) instead of the browser's bubbles. A field is checked
// when the visitor leaves it with something typed, again as they fix it, and all of them on sending, when the first one
// that's wrong gets the focus (ui-ux-pro-max: error-placement, inline-validation, focus-management).
// Sending needs a form service, which isn't chosen yet: at launch, set the form's action to its address. Until then
// nothing is sent, and the form says so.

(() => {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    footer.classList.add('pending');
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        footer.classList.remove('pending');
        reveal.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    reveal.observe(footer);
  }

  const form = footer.querySelector('.enquiry');
  const fields = [...form.querySelectorAll('input, textarea')];
  const send = form.querySelector('[type="submit"]');
  const status = form.querySelector('.status');

  // Shows or clears the reason a field is wrong, and returns whether it's fine.
  function check(field) {
    const { valueMissing, typeMismatch } = field.validity;
    const reason = valueMissing ? field.dataset.missing : typeMismatch ? field.dataset.invalid : '';
    const error = document.getElementById(field.getAttribute('aria-describedby'));
    error.textContent = reason;
    error.hidden = !reason;
    field.setAttribute('aria-invalid', reason ? 'true' : 'false');
    return !reason;
  }

  for (const field of fields) {
    field.addEventListener('blur', () => {
      if (field.value) check(field);
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') check(field); // the reason goes as soon as it's fixed
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const wrong = fields.filter((field) => !check(field));
    if (wrong.length) return wrong[0].focus();
    const action = form.getAttribute('action');
    if (!action) return say('standin');
    say('sending');
    send.disabled = true;
    try {
      const response = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      say('sent');
    } catch {
      say('failed');
    } finally {
      send.disabled = false;
    }
  });

  // Puts one of the form's messages (its data-sending, data-sent, data-failed or data-standin) under the button.
  function say(state) {
    status.dataset.state = state;
    status.textContent = form.dataset[state];
  }

  // TRYOUT "Email form: Behind a button": the form opens when asked for.
  const showForm = footer.querySelector('.show-form');
  showForm.addEventListener('click', () => {
    footer.classList.add('form-open');
    showForm.setAttribute('aria-expanded', 'true');
    fields[0].focus();
  });
})();
