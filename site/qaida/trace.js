// The free Qaida: trace the letter you have just learnt. QAIDA-BUILD.md step 3.
//
// A board with the letter drawn faintly underneath, and you write over it with a finger, a mouse or a pen. There is
// deliberately no marking: handwriting recognition on Arabic is unreliable, and a machine telling a student "wrong"
// when they are right teaches them to distrust themselves. A printed Qaida asks the child to compare by eye, and so
// does this.
//
// The same board is also on every lesson as a blank one, opened from the "Board" button in the top bar (the user,
// 2026-09-19: "we don't know when someone would need to write"). Blank means no guide letter, so it can never give
// away the answer to a question in a drill.

(() => {
  const shell = window.qaidaShell;
  const panel = document.querySelector('.tracer');
  if (!shell || !panel) return;

  const $ = (selector) => panel.querySelector(selector);

  const title = $('.tracer-title');
  const hint = $('.board-hint');
  const guide = $('.board-guide');
  const canvas = $('.board-ink');
  const undoButton = $('.undo');
  const clearButton = $('.clear');
  const guideButton = $('.toggle-guide');
  const context = canvas.getContext('2d');
  const guideContext = guide.getContext('2d');

  let letter = '';
  let free = false; // the blank board from the top bar, with no letter underneath
  let scratch = []; // what was written on the blank board, kept until Clear or a reload so a stray tap outside is harmless

  let strokes = []; // each stroke is a list of points, so Undo can drop the last one
  let drawing = null;
  let closing = false;
  let closeTimer = 0;
  let opener = null; // what to put the keyboard back on when the board closes

  // Drawing ------------------------------------------------------------------------------------

  // Measured once when the board opens, not on every movement of the hand: reading layout mid-stroke is what makes
  // drawing feel laggy.
  let box = null;

  function style() {
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = getComputedStyle(canvas).color;
    context.fillStyle = context.strokeStyle;
    context.lineWidth = Math.max(3, (box ? box.width : 300) * 0.012);
  }

  // The canvas has to match its box in real device pixels, or the line looks soft on a phone and a retina screen.
  function fit() {
    const measured = canvas.getBoundingClientRect();
    if (!measured.width || !measured.height) return;
    box = measured;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    for (const [surface, ctx] of [[canvas, context], [guide, guideContext]]) {
      surface.width = Math.round(box.width * ratio);
      surface.height = Math.round(box.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    drawGuide();
    redraw();
  }

  // The letter to write over. Centred on its ink, not on its text box: ج ح خ ع غ ي carry most of their weight below
  // the line they sit on, so centring the box the way CSS does leaves them sitting low on the page.
  function drawGuide() {
    if (!box) return;
    guideContext.clearRect(0, 0, box.width, box.height);
    if (!letter) return;

    const family = getComputedStyle(guide).fontFamily;
    guideContext.textAlign = 'left';
    guideContext.textBaseline = 'alphabetic';
    guideContext.fillStyle = getComputedStyle(guide).color;

    // Start big, then shrink until the ink fits the room we want it to have.
    const room = { width: box.width * 0.74, height: box.height * 0.72 };
    let size = box.height * 0.8;
    let ink = null;
    for (let tries = 0; tries < 6; tries += 1) {
      guideContext.font = `${size}px ${family}`;
      const m = guideContext.measureText(letter);
      ink = {
        left: m.actualBoundingBoxLeft,
        right: m.actualBoundingBoxRight,
        up: m.actualBoundingBoxAscent,
        down: m.actualBoundingBoxDescent,
      };
      const wide = ink.left + ink.right;
      const tall = ink.up + ink.down;
      if (!wide || !tall) return; // the font hasn't arrived yet; document.fonts will call us back
      const fits = Math.min(room.width / wide, room.height / tall);
      if (fits >= 0.995 && fits <= 1.05) break;
      size *= fits;
    }

    // Put the middle of the ink in the middle of the board, across and down.
    const x = box.width / 2 - (ink.right - ink.left) / 2;
    const y = box.height / 2 + (ink.up - ink.down) / 2;
    guideContext.fillText(letter, x, y);
  }

  const dot = (point) => {
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  };

  // Everything from the start. Only needed after Undo, Clear or a resize — a stroke in progress draws itself.
  function redraw() {
    if (!box) return;
    context.clearRect(0, 0, box.width, box.height);
    style();
    for (const stroke of strokes) {
      if (stroke.length < 2) {
        dot(stroke[0]); // a pen touched to paper still leaves a mark
        continue;
      }
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i += 1) context.lineTo(stroke[i].x, stroke[i].y);
      context.stroke();
    }
    undoButton.disabled = strokes.length === 0;
    clearButton.disabled = strokes.length === 0;
  }

  const pointIn = (event) => ({ x: event.clientX - box.left, y: event.clientY - box.top });

  canvas.addEventListener('pointerdown', (event) => {
    if (!box) fit();
    if (!box) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing = [pointIn(event)];
    strokes.push(drawing);
    style();
    dot(drawing[0]);
    undoButton.disabled = false;
    clearButton.disabled = false;
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    event.preventDefault();
    const from = drawing[drawing.length - 1];
    const to = pointIn(event);
    drawing.push(to);
    // Just the new piece of line. Redrawing every stroke on every movement gets slower the more you write.
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  });

  const stopDrawing = () => {
    drawing = null;
  };

  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);

  undoButton.addEventListener('click', () => {
    strokes.pop();
    redraw();
  });

  clearButton.addEventListener('click', () => {
    strokes = [];
    redraw();
  });

  // Hiding the letter is the point of practising: first you trace it, then you try it from memory.
  guideButton.addEventListener('click', () => {
    const hidden = panel.classList.toggle('guide-off');
    guideButton.setAttribute('aria-pressed', String(hidden));
    guideButton.textContent = hidden ? guideButton.dataset.show : guideButton.dataset.hide;
  });

  // Opening and closing ------------------------------------------------------------------------

  function finishClosing() {
    clearTimeout(closeTimer);
    panel.removeEventListener('animationend', onEnd);
    panel.classList.remove('closing');
    closing = false;
    if (panel.open) panel.close();
  }

  function onEnd(event) {
    if (event.target === panel) finishClosing();
  }

  function close() {
    if (!panel.open || closing) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.close();
      return;
    }
    closing = true;
    panel.classList.add('closing');
    panel.addEventListener('animationend', onEnd);
    closeTimer = setTimeout(finishClosing, 300);
  }

  // With a letter: trace it. With nothing: the blank board.
  function open(glyph, name) {
    opener = document.activeElement;
    letter = glyph || '';
    free = !letter;
    strokes = free ? scratch : [];
    box = null; // measured once the panel is on screen, in fit()
    title.textContent = free
      ? title.dataset.free || 'Writing board'
      : (title.dataset.template || '{name}').replaceAll('{name}', name);
    // The line at the bottom says what this board is for. (Older markup carries it as plain text; leave that be.)
    const line = free ? hint && hint.dataset.free : hint && hint.dataset.trace;
    if (line) hint.textContent = line;
    panel.classList.remove('guide-off', 'closing');
    closing = false;
    guideButton.hidden = free; // nothing to hide on a blank board
    guideButton.setAttribute('aria-pressed', 'false');
    guideButton.textContent = guideButton.dataset.hide;
    if (!panel.open) panel.showModal();
    // The panel has to be on screen before the canvas can be measured.
    requestAnimationFrame(fit);
    // Measuring a letter in a font the browser hasn't fetched yet measures the wrong letter, so draw it again once
    // the real lettering is in.
    if (document.fonts) document.fonts.ready.then(() => (box ? drawGuide() : fit()));
  }

  panel.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  panel.addEventListener('close', () => {
    panel.classList.remove('closing');
    closing = false;
    if (free) scratch = strokes; // Clear swaps the list for a new one, so keep whichever is current
    strokes = [];
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  });

  for (const button of panel.querySelectorAll('.close-trace')) button.addEventListener('click', close);

  // The blank board, from the button in the top bar of every lesson.
  for (const button of document.querySelectorAll('.open-board')) button.addEventListener('click', () => open());

  // A click on the dimmed page around the board closes it, the same as the first-visit panel.
  panel.addEventListener('click', (event) => {
    if (event.target === panel) close();
  });

  // Changing the script changes which letters there are — ك becomes ک — so the board steps aside rather than going
  // on showing a letter the lesson no longer holds. The lesson's own strip empties for the same reason.
  shell.onChange(() => {
    if (panel.open) close();
  });

  let resizing = 0;
  window.addEventListener('resize', () => {
    if (!panel.open) return;
    clearTimeout(resizing);
    resizing = setTimeout(fit, 150);
  });

  window.qaidaTrace = { open, close };
})();
