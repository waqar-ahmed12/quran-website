// Phase 1: the hero scroll animation. Phase 2: the headline with the closed book. Phase 3: aayat on the open pages.
// Phase 5: the ending after the book, with its options.
// Retouched video frames of the Qur'an opening, drawn to a canvas by scroll position.
// Spec: WEBSITE-BUILD.md sections 2 to 4; the settings the user chose are under section 7.

(() => {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const smoothstep = (t) => t * t * (3 - 2 * t);

  // Frames --------------------------------------------------------------------

  const SKIP = [39, 40]; // identical to f038, a hold in the source video
  const urls = [];
  for (let i = 0; i <= 88; i++) {
    if (!SKIP.includes(i)) urls.push(`assets/hero/frames/f${String(i).padStart(3, '0')}.png`);
  }
  const LAST = urls.length - 1; // 87 frames, indices 0..86

  // Geometry, in pixels of the 1280x720 frames ----------------------------------

  const SRC_W = 1280;
  const SRC_H = 720;
  const BOOK_LEFT = 255;   // left edge of the book; it never moves in the footage
  const BOOK_H = 580;      // y 70-650, centred on the frame's middle
  const SPINE = 640;       // right edge until the cover passes upright
  const OPEN_RIGHT = 1037; // right edge fully open
  const FEATHER_X = 180;   // how far the frame's rectangle fades into the stage
  const FEATHER_Y = 40;

  // Timeline, in screen heights of scrolling on a computer -----------------------
  // Phones scroll two thirds as far for everything (the hero is shorter there, in styles.css).

  const REST = 0.45;  // closed book with the headline
  const OPEN = 2.25;  // the cover opens (the same scrolling as when the user signed off phase 1)
  const SETTLE = 0.4; // open pages
  const AYAH = 1;     // time to read the aayat before the page moves on
  const TOTAL = REST + OPEN + SETTLE + AYAH; // 4.1; .hero in styles.css is one screen taller than this
  const NAME_GONE = 8; // the headline has faded out by this frame, early in the opening

  // Smoothing ---------------------------------------------------------------------

  // A mouse wheel scrolls in steps, so everything glides toward the scroll position instead of
  // jumping to it, and the book cross-fades between frames. The user chose this "slow glide" by eye.
  let glide = 0.28; // roughly the seconds it takes to close two thirds of the gap; 0 jumps straight there
  let blend = true; // cross-fade neighbouring frames, rather than showing whole frames only
  // Stopped between two frames, the cross-fade settles onto the nearer frame over this many seconds: held still, it looks blurred.
  const SHARPEN = 0.25;
  // Once scrolling reaches this, the aayat fade in by themselves (the transition on .group), not with the scroll.
  const APPEAR = REST + OPEN * 0.9;

  // A book left half open opens or closes by itself once scrolling stops: toward the nearer end, or the way the
  // visitor was scrolling. 'off' leaves it where it stopped.
  let finish = 'direction';
  let finishSpeed = 1;     // screens of scrolling a second; a half-open book is about one screen from either end
  const FINISH_WAIT = 180; // ms without scrolling before it finishes

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.stage');
  const subject = stage.querySelector('.subject'); // the book and its aayat, moved together by atmosphere.js
  const canvas = subject.querySelector('canvas');
  const wordmark = stage.querySelector('.wordmark');
  const ctx = canvas.getContext('2d');
  const close = document.querySelector('.close'); // the ending, after the book
  const closeInner = close.querySelector('.inner');

  const frames = []; // decoded images by index, filled in as they arrive
  const rights = []; // measured right edge of the book in each frame
  const started = new Set();
  const groups = []; // one element per group of aayat, filled in when aayat.json arrives

  let scale = 1;      // footage pixels to CSS pixels, set on resize
  let pos = null;     // scroll position shown, in screens; lags the real one while gliding
  let painted = null; // position last shown
  let drawn = null;   // frame last drawn; fractional between frames
  let last = 0;       // time of the previous glide step, 0 when at rest
  let dirty = true;
  let queued = false;
  let visible = true;
  let showing = false; // whether the pages show aayat
  let current = -1;   // the group of aayat last picked
  let previous = -1;  // the last group shown, so the next pass shows a different one
  let moving = false; // still gliding toward the scroll position; atmosphere.js keeps the book still meanwhile
  let sharpen = 1;    // 0 while moving, 1 once settled onto a whole frame
  let direction = 0;  // 1 when the visitor last scrolled down, -1 up
  let lastY = scrollY;
  let touching = false;
  let finishTimer = 0;
  let autoScroll = 0; // the animation frame of a scroll the page started itself, 0 when none
  let ended = false;  // scrolling has reached the end of the book's screens

  // Loading -----------------------------------------------------------------------

  function load(i) {
    if (started.has(i)) return;
    started.add(i);
    const img = new Image();
    img.src = urls[i];
    img.decode().then(
      () => {
        frames[i] = img;
        rights[i] = measureRight(img);
        if (i >= LAST - 3) place(); // the open book's measured edge sets where the pages are
        dirty = true;
        schedule();
      },
      () => console.warn(`Frame missing: ${urls[i]}`), // the nearest loaded frame is drawn instead
    );
  }

  // First and last frames, then coarse to fine, so scrubbing works before everything arrives.
  function loadAll() {
    load(0);
    load(LAST);
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i <= LAST; i += step) load(i);
    }
  }

  // Once the cover passes upright its cream lining faces the camera, so the book's right
  // edge is the rightmost bright pixel along the middle row, and never less than the spine.
  const probe = document.createElement('canvas');
  probe.width = SRC_W;
  probe.height = 1;
  const probeCtx = probe.getContext('2d', { willReadFrequently: true });

  function measureRight(img) {
    try {
      probeCtx.drawImage(img, 0, SRC_H / 2, SRC_W, 1, 0, 0, SRC_W, 1);
      const px = probeCtx.getImageData(0, 0, SRC_W, 1).data;
      for (let x = SRC_W - 1; x > SPINE; x--) {
        if (px[x * 4] + px[x * 4 + 1] + px[x * 4 + 2] > 300) return x + 1;
      }
      return SPINE;
    } catch {
      return null; // pixels unreadable, e.g. opened as a file rather than through serve.js
    }
  }

  // Averaged over nearby frames so the centring glides instead of stepping.
  function rightEdge(i) {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - 3); j <= Math.min(LAST, i + 3); j++) {
      if (rights[j] != null) {
        sum += rights[j];
        n++;
      }
    }
    return n ? sum / n : SPINE + ((OPEN_RIGHT - SPINE) * i) / LAST;
  }

  // Aayat -------------------------------------------------------------------------
  // The exact text comes from aayat.json, written by fetch-aayat.js from Quran.com. Never typed by hand.

  const aayat = document.createElement('div');
  aayat.className = 'aayat';
  subject.append(aayat);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Arabic on the right page, the first page in a mushaf, each ayah closed by its numbered marker.
  // The left page carries the surah name, reference and English meaning.
  function renderGroup({ ref, surah, aayat: verses }) {
    const group = el('section', 'group');
    const right = el('div', 'page right');
    const arabic = el('p', 'arabic');
    arabic.lang = 'ar';
    arabic.dir = 'rtl';
    for (const { key, text } of verses) {
      const marker = el('span', 'marker', `۝${Number(key.split(':')[1]).toLocaleString('ar-u-nu-arab')}`);
      marker.setAttribute('aria-hidden', 'true');
      arabic.append(`${text} `, marker, ' ');
    }
    right.append(arabic);
    const left = el('div', 'page left');
    left.append(
      el('p', 'surah', surah),
      el('p', 'meaning', verses.map((v) => v.translation).join(' ')),
      el('p', 'ref', ref.replace('-', '–')),
    );
    group.append(right, left);
    return group;
  }

  fetch('aayat.json')
    .then((res) => res.json())
    .then((data) => {
      for (const g of data.groups) groups.push(aayat.appendChild(renderGroup(g)));
      fit();
      dirty = true;
      schedule();
    })
    .catch(() => console.warn('No aayat yet: run fetch-aayat.js'));

  // Where the open book's pages are: CSS lays the text over them from these.
  function place() {
    const open = (BOOK_LEFT + rightEdge(LAST)) / 2;
    stage.style.setProperty('--s', scale);
    stage.style.setProperty('--x0', `${canvas.clientWidth / 2 - open * scale}px`);
    stage.style.setProperty('--y0', `${(canvas.clientHeight - SRC_H * scale) / 2}px`);
    stage.style.setProperty('--book-h', `${BOOK_H * scale}px`);
    placeEnding();
  }

  // Shrinks a page's text until it fits, for aayat longer than the page holds at its normal size.
  function fit() {
    for (const page of aayat.querySelectorAll('.page')) {
      page.style.fontSize = '';
      let size = parseFloat(getComputedStyle(page).fontSize);
      while (page.scrollHeight > page.clientHeight && size > 10) {
        size *= 0.94;
        page.style.fontSize = `${size}px`;
      }
    }
  }

  // One group at a time, picked at random each time the pages come into view. It fades in by itself once
  // the book is open and stays; scrolling back before that fades it out, so the next pass picks again.
  // Under reduced motion a random group is simply shown.
  function showAayat(s, still) {
    const show = still || s >= APPEAR;
    if (show === showing || !groups.length) return;
    showing = show;
    if (show) current = pick();
    groups.forEach((group, k) => {
      group.style.opacity = show && k === current ? 1 : 0;
    });
  }

  // A random group, never the one shown last time.
  function pick() {
    let k;
    do k = Math.floor(Math.random() * groups.length);
    while (groups.length > 1 && k === previous);
    return (previous = k);
  }

  // The ending ----------------------------------------------------------------------
  // One line and two ways in, on the screen after the book. It rises gently into view the first time it scrolls in
  // (styles.css), except under reduced motion.

  if (!reduceMotion.matches) {
    close.classList.add('pending');
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        close.classList.remove('pending');
        reveal.disconnect();
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    reveal.observe(closeInner);
  }

  // TRYOUT "Under the book": when scrolling reaches the end, the open book rises and shrinks so the ending fits
  // under it (styles.css). Scrolling back a little undoes it; the gap between the two points stops it flickering.
  function endAt(s) {
    const end = s >= TOTAL - 0.1 || (ended && s > TOTAL - 0.4);
    if (end !== ended) hero.classList.toggle('ended', (ended = end));
  }

  // How far the book rises and shrinks for "Under the book", and where the ending goes: the book stays full size if
  // both fit, and the two sit centred on the screen together. In footage pixels the open book, with the page edges
  // that reach past it, runs from 10 above its top to 44 below its bottom.
  function placeEnding() {
    const h = canvas.clientHeight;
    const tall = (BOOK_H + 54) * scale;
    const above = (BOOK_H / 2 + 10) * scale; // from the middle of the screen to the top of the book
    const gap = Math.max(24, h * 0.05);
    const text = closeInner.offsetHeight;
    const k = Math.min(1, Math.max(0.55, (h - 3 * gap - text) / tall));
    const top = Math.max(gap, (h - tall * k - gap - text) / 2);
    const vars = document.documentElement.style;
    vars.setProperty('--end-scale', k);
    vars.setProperty('--end-y', `${top - h / 2 + above * k}px`);
    vars.setProperty('--end-top', `${top + tall * k + gap}px`);
  }

  // Drawing -----------------------------------------------------------------------

  // Cross-fades the two frames either side of a position, or while they are still loading, draws
  // the nearest frame that has arrived. Returns false while no frame has loaded yet.
  function draw(at) {
    const a = Math.floor(at);
    const b = Math.min(a + 1, LAST);
    const f = at - a;
    const fade = f > 0 && !!frames[a] && !!frames[b];
    const base = fade ? a : nearestLoaded(Math.round(at));
    if (base < 0) return false;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    // The book is centred by choosing which part of the frame is drawn, never by moving the canvas.
    const right = rightEdge(a) + (rightEdge(b) - rightEdge(a)) * f;
    const centre = (BOOK_LEFT + right) / 2;
    const w = SRC_W * scale;
    const h = SRC_H * scale;
    const x = width / 2 - centre * scale;
    const y = (height - h) / 2;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(frames[base], x, y, w, h);
    if (fade) {
      ctx.globalAlpha = f;
      ctx.drawImage(frames[b], x, y, w, h);
      ctx.globalAlpha = 1;
    }
    featherEdges(x, y, w, h);

    // Where the book is on screen, so atmosphere.js keeps its dust and light off it.
    const top = y + ((SRC_H - BOOK_H) / 2) * scale;
    hero.book = { left: x + BOOK_LEFT * scale, right: x + right * scale, top, bottom: top + BOOK_H * scale, scale };
    return true;
  }

  // Fades a drawn rectangle out at its edges so it never shows against the stage.
  function featherEdges(x, y, w, h) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = feather(ctx.createLinearGradient(x, 0, x + w, 0), FEATHER_X / SRC_W);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = feather(ctx.createLinearGradient(0, y, 0, y + h), FEATHER_Y / SRC_H);
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  function feather(gradient, edge) {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(edge, '#000');
    gradient.addColorStop(1 - edge, '#000');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    return gradient;
  }

  // How far the hero has been scrolled, in computer screen heights (0 to TOTAL).
  function targetScroll() {
    const range = hero.offsetHeight - stage.offsetHeight;
    return range > 0 ? clamp(-hero.getBoundingClientRect().top / range) * TOTAL : 0;
  }

  // The book's frame at a scroll position; smoothstep eases into and out of the opening.
  function frameAt(s) {
    return smoothstep(clamp((s - REST) / OPEN)) * LAST;
  }

  function nearestLoaded(i) {
    for (let d = 0; d <= LAST; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(step);
  }

  // Each animation frame, moves part of the way toward the scroll position and keeps going until it arrives,
  // then settles onto a whole frame. Uses elapsed time, so it feels the same on 60 Hz and 144 Hz screens.
  function step(now) {
    queued = false;
    if (!visible) {
      last = 0;
      return;
    }
    const target = targetScroll();
    const dt = last ? Math.min(now - last, 50) / 1000 : 1 / 60;
    if (pos === null || reduceMotion.matches || !glide) {
      pos = target;
    } else {
      pos += (target - pos) * (1 - Math.exp(-dt / glide));
      if (Math.abs(target - pos) < 0.0005) pos = target;
    }
    sharpen = pos === target ? Math.min(1, sharpen + dt / SHARPEN) : Math.max(0, sharpen - (3 * dt) / SHARPEN);
    last = pos === target && sharpen === 1 ? 0 : now;
    paint();
    if (moving !== (pos !== target)) {
      moving = pos !== target;
      hero.dispatchEvent(new Event(moving ? 'bookmove' : 'bookrest'));
    }
    if (last) schedule();
  }

  // Updates the headline and aayat, and redraws the book only when its frame, the size or the loaded
  // frames have changed. Under reduced motion the book is shown open and the headline stays.
  function paint() {
    if (pos === null) return;
    const still = reduceMotion.matches;
    const exact = frameAt(pos);
    const whole = Math.round(exact);
    const frame = still ? LAST : blend ? exact + (whole - exact) * smoothstep(sharpen) : whole;
    if (pos !== painted || dirty) {
      wordmark.style.opacity = still ? 1 : 1 - clamp(frame / NAME_GONE);
      showAayat(pos, still);
      endAt(pos);
      painted = pos;
    }
    if (frame !== drawn || dirty) {
      if (draw(frame)) {
        drawn = frame;
        dirty = false;
      }
    }
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    // One size for the whole opening: the open book always fits, and the 720p footage is
    // never stretched past its own size.
    scale = Math.min((height * 0.8) / BOOK_H, (width * 0.88) / (OPEN_RIGHT - BOOK_LEFT), 1);
    place();
    fit();
    dirty = true;
    paint(); // draw now: resizing the canvas has just cleared it
    schedule(); // the hero's height follows the window, so the scroll position may now mean a different frame
  }

  // Reduced motion: no scrubbing, just the open book, and only its frame is loaded.
  function applyMotion() {
    document.documentElement.classList.toggle('still', reduceMotion.matches);
    if (reduceMotion.matches) load(LAST);
    else loadAll();
    dirty = true;
    schedule();
  }

  // TRYOUT --------------------------------------------------------------------------
  // Options shown only on this PC or a phone on the same wifi. Once the user picks: put the picks in the
  // settings above and in styles.css, then delete this block, the TRYOUT part of styles.css and the
  // unused Arabic font in index.html.

  if (/^(localhost|[\d.]+)$/.test(location.hostname)) {
    const narrow = matchMedia('(max-width: 767px)').matches;
    const panel = document.createElement('details');
    panel.className = 'tryout';
    panel.open = !narrow; // closed to start with on phones, where it would cover the book
    panel.innerHTML = '<summary>Options</summary>';
    document.body.append(panel);

    // Groups of rows, each under a heading that opens and closes. Rows go into the group named last, and naming a
    // group again adds to it. atmosphere.js and ending-options.js use this too; `first` puts a new group at the top.
    let group = panel;
    window.tryoutGroup = (title, { open = false, first = false } = {}) => {
      group = [...panel.querySelectorAll(':scope > details')].find((g) => g.dataset.title === title);
      if (group) return;
      group = document.createElement('details');
      group.dataset.title = title;
      group.open = open;
      group.append(el('summary', '', title));
      if (first) panel.querySelector('summary').after(group);
      else panel.append(group);
    };

    // A row of buttons; the one matching `initial` starts pressed. atmosphere.js adds its rows with this too.
    window.addOption = (label, choices, initial, pick) => {
      const row = document.createElement('div');
      row.append(el('span', '', label));
      for (const [text, value] of Object.entries(choices)) {
        const b = el('button', '', text);
        b.type = 'button';
        b.setAttribute('aria-pressed', value === initial);
        b.addEventListener('click', () => {
          for (const other of row.querySelectorAll('button')) other.setAttribute('aria-pressed', other === b);
          pick(value);
        });
        row.append(b);
      }
      group.append(row);
    };

    // A slider with its value shown beside it, in the words `format` gives.
    window.addSlider = (label, min, max, step, initial, format, pick) => {
      const row = document.createElement('div');
      const range = el('input', '');
      Object.assign(range, { type: 'range', min, max, step, value: initial });
      range.setAttribute('aria-label', label);
      const shown = el('output', '', format(initial));
      range.addEventListener('input', () => {
        const value = Number(range.value);
        shown.textContent = format(value);
        pick(value);
      });
      row.append(el('span', '', label), range, shown);
      group.append(row);
    };

    const redraw = () => {
      dirty = true;
      schedule();
    };
    const retime = (set) => (value) => {
      set(value);
      redraw();
    };
    const setData = (key) => (value) => {
      document.documentElement.dataset[key] = value;
      fit();
    };
    tryoutGroup('Opening and aayat');
    const glideText = (v) => (v ? `${v.toFixed(2)} s${v === 0.28 ? ' (your pick)' : ''}` : 'Off');
    addSlider('Opening glide', 0, 0.5, 0.01, glide, glideText, retime((v) => (glide = v)));
    addOption('Blend frames', { Off: false, On: true }, blend, retime((v) => (blend = v)));
    addOption('Half-open book', { Stays: 'off', 'Nearer end': 'nearest', 'Way you scrolled': 'direction' }, finish, (v) => (finish = v));
    addSlider('Auto open/close speed', 25, 300, 5, finishSpeed * 100, (v) => `${v}%`, (v) => (finishSpeed = v / 100));
    addOption('Arabic lettering', { 'Amiri Quran': 'amiri', Scheherazade: 'scheherazade' }, 'amiri', setData('arabic'));
    addOption('Left page', { 'Surah name': 'name', 'English meaning': 'meaning' }, 'name', setData('left'));
    if (narrow) {
      const phoneScroll = setData('phoneScroll');
      phoneScroll('short');
      addOption('Scroll length', { Long: 'long', Medium: 'medium', Short: 'short' }, 'short', (v) => {
        phoneScroll(v);
        redraw();
      });
      addOption('Surah name', { 'Under the book': 'under', 'On the page': 'page' }, 'under', setData('phoneLeft'));
    }
  }

  // Finishing the opening ------------------------------------------------------------

  function onScroll() {
    schedule();
    if (autoScroll) return; // the page's own scrolling
    direction = Math.sign(scrollY - lastY) || direction;
    lastY = scrollY;
    waitToFinish();
  }

  function waitToFinish() {
    clearTimeout(finishTimer);
    finishTimer = setTimeout(finishOpening, FINISH_WAIT);
  }

  function finishOpening() {
    if (finish === 'off' || touching || autoScroll || reduceMotion.matches || !visible) return;
    const progress = (targetScroll() - REST) / OPEN;
    if (progress <= 0.002 || progress >= 0.998) return; // closed or open already
    const open = finish === 'nearest' ? progress >= 0.5 : direction > 0;
    scrollToScreens(open ? REST + OPEN : REST);
  }

  // Scrolls the page to a point on the hero's timeline, easing in and out.
  function scrollToScreens(s) {
    const range = hero.offsetHeight - stage.offsetHeight;
    const from = scrollY;
    const distance = hero.getBoundingClientRect().top + scrollY + (s / TOTAL) * range - from;
    const duration = Math.max(300, (1000 * Math.abs(distance)) / innerHeight / finishSpeed); // a short finish still eases
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2;
      scrollTo(0, from + distance * eased);
      autoScroll = t < 1 ? requestAnimationFrame(tick) : 0;
      if (!autoScroll) lastY = scrollY;
    };
    autoScroll = requestAnimationFrame(tick);
  }

  // Any scrolling by the visitor takes over from the page's own.
  function takeOver() {
    cancelAnimationFrame(autoScroll);
    autoScroll = 0;
    lastY = scrollY;
  }

  addEventListener('scroll', onScroll, { passive: true });
  for (const type of ['wheel', 'keydown', 'mousedown']) addEventListener(type, takeOver, { passive: true });
  addEventListener(
    'touchstart',
    () => {
      touching = true;
      takeOver();
    },
    { passive: true },
  );
  addEventListener(
    'touchend',
    () => {
      touching = false;
      waitToFinish();
    },
    { passive: true },
  );
  document.fonts.addEventListener('loadingdone', fit); // text changes size when its font arrives
  reduceMotion.addEventListener('change', applyMotion);
  new ResizeObserver(resize).observe(canvas);
  new ResizeObserver(placeEnding).observe(closeInner); // the ending's height changes with its words and fonts
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
    schedule();
  }).observe(hero);
  applyMotion();
})();
