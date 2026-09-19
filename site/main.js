// Phase 1: the hero scroll animation. Phase 2: the headline with the closed book. Phase 3: aayat on the open pages.
// Phase 5: the ending after the book, with its options.
// Retouched video frames of the Qur'an opening, drawn to a canvas by scroll position.
// Spec: WEBSITE-BUILD.md sections 2 to 4; the settings the user chose are under section 7.

(() => {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const light = () => document.documentElement.dataset.theme === 'light';

  // A critically damped spring: moves [pos, vel] toward target over roughly `tau` seconds. Unlike the plain ease in
  // step(), it carries speed from frame to frame, so a new target starts the motion gently instead of at full speed.
  function springTo(pos, vel, target, tau, dt) {
    const w = 2 / tau;
    const e = Math.exp(-w * dt);
    const gap = pos - target;
    const push = vel + w * gap;
    return [target + (gap + push * dt) * e, (vel - w * push * dt) * e];
  }

  // Frames --------------------------------------------------------------------

  const SKIP = [39, 40]; // identical to f038, a hold in the source video
  const ext = new URLSearchParams(window.location.search).has('png') ? 'png' : 'webp';
  const urls = [];
  for (let i = 0; i <= 88; i++) {
    if (!SKIP.includes(i)) urls.push(`assets/hero/frames/f${String(i).padStart(3, '0')}.${ext}`);
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

  // Light frames: the ivory Qur'an opening, its own footage (not a recolour of the dark one) --------------
  // Built by videos/make-light-frames.ps1, then videos/build-light-geom.js. The footage is framed almost
  // exactly like the dark take — same size, book the same height and in the same place — so everything below
  // is drawn, centred and laid out by the same code, off the same constants. Only the right edge differs.

  const LIGHT_LEFT = 262; // left edge of the book, as BOOK_LEFT is for dark; read off the open frame

  const LIGHT_OPEN_RIGHT = 1028; // right edge fully open
  // The book's right edge in each frame, measured by videos/make-light-frames.ps1. main.js smooths these the
  // same way it smooths the dark frames' own measurements.
  const rightsLight = [
    653, 653, 653, 653, 653, 653, 653, 653, 654, 654, 654, 654, 654, 654, 655, 655, 655, 655, 646, 647, 647, 642,
    642, 644, 645, 646, 643, 642, 643, 647, 642, 653, 645, 655, 656, 657, 651, 655, 660, 661, 646, 664, 683, 702,
    721, 735, 754, 774, 793, 819, 838, 855, 872, 888, 903, 917, 931, 943, 959, 969, 979, 987, 995, 1001, 1007,
    1013, 1017, 1010, 1023, 1025, 1027, 1027, 1028, 1028,
  ];

  // One frame file per measurement, so the two can't fall out of step.
  const urlsLight = rightsLight.map((_, i) => `assets/hero/light-frames/f${String(i).padStart(3, '0')}.${ext}`);
  const LAST_LIGHT = urlsLight.length - 1;

  // Timeline, in screen heights of scrolling on a computer -----------------------
  // Phones scroll less far for everything (--pace in styles.css).

  const REST = 0.45;  // closed book with the headline
  const OPEN = 2.25;  // the cover opens (the same scrolling as when the user signed off phase 1)
  // Scrolling on the open book before the page moves on: the pages settle and the aayat can be read. It was 1.4
  // screens (0.4 to settle, 1 for the aayat) until the user found it too long; TRYOUT "Scroll once it opens".
  let hold = 0.35;
  let total = REST + OPEN + hold; // .hero in styles.css is one screen taller than this, through --timeline
  const NAME_GONE = 8; // the headline has faded out by this frame, early in the opening

  // Smoothing ---------------------------------------------------------------------

  // A mouse wheel scrolls in steps, so everything glides toward the scroll position instead of
  // jumping to it, and the book cross-fades between frames. The user chose this "slow glide" by eye.
  let glide = 0.28; // roughly the seconds it takes to close two thirds of the gap; 0 jumps straight there
  // How the shown position catches up: 'before' is the plain ease the user chose; 'soft' is a spring that starts
  // gently. Only the drawing changes: the page's own scrolling and the finish glide are untouched. TRYOUT "Glide feel".
  let feel = 'before';
  // The wheel. The browser's own wheel scrolling is a quick burst (Firefox: 408 px in 117 ms for four notches, peaking
  // near 7,800 px/s), then the page stands still for `finishWait`, then the automatic finish starts at full speed:
  // burst, stop, sudden restart (the user, 2026-09-18, "a jolt, then the page starts to move ... the speed of scroll is
  // different from the automatic", measured with the Scroll check). So the page takes the wheel over: each notch adds
  // to a target and the real scroll position glides to it, and the automatic finish carries on from wherever that glide
  // has got to, at the speed it was going. TRYOUT "Wheel scrolling" and "Wheel smoothness".
  let wheelSmooth = true;
  let wheelTau = 0.2;  // seconds, roughly how long the wheel's glide takes to settle
  let wheelTarget = 0; // where the wheel is sending the page, in px
  let wheelPos = 0;    // where the glide has got to, in px; kept here because scrollY is rounded to whole pixels
  let wheelVel = 0;    // px a second
  let wheelSet = 0;    // the last position handed to scrollTo, so scrolling by anything else is noticed
  let wheelLast = 0;   // time of the glide's previous step
  let wheelRaf = 0;    // the animation frame of the glide, 0 when it isn't running
  let blend = true; // cross-fade neighbouring frames, rather than showing whole frames only
  // Stopped between two frames, the cross-fade settles onto the nearer frame over this many seconds: held still, it looks blurred.
  const SHARPEN = 0.25;
  // Once scrolling reaches this, the aayat fade in by themselves (the transition on .group), not with the scroll.
  const APPEAR = REST + OPEN * 0.9;

  // A book left half open opens or closes by itself once scrolling stops: toward the nearer end, or the way the
  // visitor was scrolling. 'off' leaves it where it stopped.
  let finish = 'direction';
  let finishSpeed = 1;     // screens of scrolling a second; a half-open book is about one screen from either end
  let finishWait = 100;    // ms without scrolling before it finishes; 180 felt stuck (2026-09-14). TRYOUT "Wait before gliding"
  // How the page's own scrolling starts when the wheel isn't still gliding: 'moving' starts at full speed, as if carrying
  // on from the visitor's scrolling, and jumps if that had already stopped; 'gentle' eases in from still. 'gentle' is
  // the user's own pick (setting.txt, 2026-09-18). TRYOUT "Glide start".
  let glideStart = 'gentle';
  const TAB_SPEED = 3;     // screens a second when Tab glides through the opening
  // The same goes for the ending: the page never rests with it part way in (settleEnding). TRYOUT "Ending locks into place".
  let lockEnding = true;
  // A book on a screen invites the one gesture this page hasn't got: someone who has never met a page like this swipes
  // sideways to turn over, nothing happens, and the open book looks like the end of the site (the user, 2026-09-19:
  // "they expect to turn the page over"). 'nudge' answers the sideways try with the downward move it was asking for:
  // the cue flashes and the page eases down a little, so the gesture teaches itself. 'flash' only lights the cue.
  // TRYOUT "If they swipe sideways".
  let swipeAnswer = 'nudge';
  const SWIPE_X = 48;    // px sideways before a drag counts as a page-turn try
  const SWIPE_EDGE = 40; // a drag starting this near either edge is the browser's own back and forward, left alone
  const SWIPE_GAP = 900; // ms; one gesture gets one answer
  const SWIPE_NUDGE = 0.2; // screens the page eases down, enough to show it moves without taking them off the book

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 768px)'); // "Under the book" is for computers only
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.stage');
  const subject = stage.querySelector('.subject'); // the book and its aayat, moved together by atmosphere.js
  const canvas = subject.querySelector('canvas');
  const wordmark = stage.querySelector('.wordmark');
  const openHint = stage.querySelector('.open-hint'); // the cue under the open book
  const ctx = canvas.getContext('2d');
  const close = document.querySelector('.close'); // the ending, after the book
  const closeInner = close.querySelector('.inner');
  const topbar = document.querySelector('.topbar');
  const resting = stage.querySelectorAll('.wordmark, .beside'); // shown with the closed book; they fade as it opens
  const themeButton = topbar.querySelector('.theme');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const frames = []; // decoded images by index, filled in as they arrive
  const rights = []; // measured right edge of the book in each frame
  const started = new Map(); // frame index to the promise of its arrival
  const lightFrames = []; // the light-mode frames, decoded images by index
  const startedLight = new Map();
  const groups = []; // one element per group of aayat, filled in when aayat.json arrives

  let scale = 1;      // footage pixels to CSS pixels, set on resize
  let pos = null;     // scroll position shown, in screens; lags the real one while gliding
  let vel = 0;        // its speed in screens a second, used by the 'soft' glide only
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

  // The two takes -------------------------------------------------------------------
  // Whichever is on screen. They are framed the same way, so everything below — loading, centring, drawing,
  // where the pages are — is one piece of code working off whichever this returns. Anything that isn't the
  // same for both is here, and only here: the dark frames' right edge can be measured in the browser, the
  // light frames' can't (see videos/build-light-geom.js), so it arrives measured.

  const darkFilm = { urls, frames, rights, started, left: BOOK_LEFT, openRight: OPEN_RIGHT, last: LAST, measure: true };
  const lightFilm = {
    urls: urlsLight,
    frames: lightFrames,
    rights: rightsLight,
    started: startedLight,
    left: LIGHT_LEFT,
    openRight: LIGHT_OPEN_RIGHT,
    last: LAST_LIGHT,
    measure: false,
    smoothEdge: 8, // frames each side, see rightEdge; 0 for the plain average. TRYOUT "Light book sway"
  };
  const film = () => (light() ? lightFilm : darkFilm);

  // Loading -----------------------------------------------------------------------

  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));

  // Returns a promise that settles once the frame has arrived, or failed to. `priority` is a network hint only
  // ('high' | 'low'); browsers without fetchPriority just ignore the unknown property.
  function load(f, i, priority) {
    if (f.started.has(i)) return f.started.get(i);
    const img = new Image();
    if (priority) img.fetchPriority = priority;
    img.src = f.urls[i];
    const arrived = img.decode().then(
      () => {
        f.frames[i] = img;
        if (f.measure) f.rights[i] = measureRight(img);
        if (i >= f.last - 3) place(); // the open book's measured edge sets where the pages are
        dirty = true;
        schedule();
      },
      () => {
        if (f.urls[i].endsWith('.webp')) {
          const fallback = new Image();
          if (priority) fallback.fetchPriority = priority;
          fallback.src = f.urls[i].replace('.webp', '.png');
          return fallback.decode().then(
            () => {
              f.frames[i] = fallback;
              if (f.measure) f.rights[i] = measureRight(fallback);
              if (i >= f.last - 3) place();
              dirty = true;
              schedule();
            },
            () => console.warn(`Frame missing: ${f.urls[i]}`),
          );
        }
        console.warn(`Frame missing: ${f.urls[i]}`);
      },
    );
    f.started.set(i, arrived);
    return arrived;
  }

  // Stream loading for a film: concurrently decodes frames into f.frames.
  function streamFilm(f, order, concurrency = 8, priority = 'low') {
    let cursor = 0;
    let active = 0;
    return new Promise((resolve) => {
      const next = () => {
        if (cursor >= order.length && active === 0) return resolve();
        while (active < concurrency && cursor < order.length) {
          const i = order[cursor++];
          if (f.started.has(i)) continue;
          active++;
          load(f, i, priority).finally(() => {
            active--;
            next();
          });
        }
        if (active === 0 && cursor >= order.length) resolve();
      };
      next();
    });
  }

  // Preloads both takes so scrubbing is 100% fluid on first scroll and theme switching
  // is instant with ZERO new file downloads. Both WebP sets together are only ~2.3 MB.
  let loadingThemes = false;
  function preloadThemes() {
    if (loadingThemes) return;
    loadingThemes = true;

    const primary = film();
    const secondary = light() ? darkFilm : lightFilm;
    const onScreen = Math.max(0, Math.min(primary.last, Math.round(frameAt(pos === null ? targetScroll() : pos))));

    // 1. Critical covers and on-screen frame first with high priority
    Promise.allSettled([
      load(primary, onScreen, 'high'),
      load(primary, 0, 'high'),
      load(primary, primary.last, 'high'),
      load(secondary, 0, 'high'),
      load(secondary, secondary.last, 'high'),
    ]).then(() => {
      // 2. Stream the active take in scroll order (from current screen outwards) with high concurrency
      const primaryOrder = [];
      for (let i = onScreen; i <= primary.last; i++) primaryOrder.push(i);
      for (let i = onScreen - 1; i >= 0; i--) primaryOrder.push(i);
      streamFilm(primary, primaryOrder, 10, 'high');

      // 3. Concurrently stream the alternate take in the background
      const secondaryOrder = [];
      const secOnScreen = Math.min(secondary.last, onScreen);
      for (let i = secOnScreen; i <= secondary.last; i++) secondaryOrder.push(i);
      for (let i = secOnScreen - 1; i >= 0; i--) secondaryOrder.push(i);
      streamFilm(secondary, secondaryOrder, 8, 'low');
    });
  }

  // Lookahead buffering in the direction of scroll to ensure adjacent frames are always ready to blend
  function bufferAhead(f, from, dir) {
    const LOOKAHEAD = 16;
    const start = dir >= 0 ? from : Math.max(0, from - LOOKAHEAD);
    const end = dir >= 0 ? Math.min(f.last, from + LOOKAHEAD) : from;
    for (let i = start; i <= end; i++) {
      if (!f.started.has(i)) load(f, i, 'high');
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

  // The light take's measured edge wobbles by up to 10 px while the cover swings up (646, 664, 661, 646 ...), and the
  // book is centred on it, so it swayed left and right there (the user, 2026-09-19, "moves left and right unnaturally").
  // The book only ever opens wider, so the measurement is taken as its running maximum, then averaged over `smoothEdge`
  // frames each side, the window shrinking toward both ends so the first and last frames keep their exact values (the
  // open book's place, and so the aayat's, depends on the last). 12 backward steps of the centre became none, and the
  // irregular jerk fell from 2.5 to 1.0 px a frame. Worked out once and kept.
  function smoothedRights(f) {
    if (f.smoothed && f.smoothed.from === f.rights) return f.smoothed.values;
    const peak = [];
    f.rights.forEach((r, i) => peak.push(Math.max(r, i ? peak[i - 1] : 0)));
    const values = peak.map((_, i) => {
      const r = Math.min(f.smoothEdge, i, f.last - i);
      let sum = 0;
      let weight = 0;
      for (let j = i - r; j <= i + r; j++) {
        const w = r + 1 - Math.abs(j - i);
        sum += peak[j] * w;
        weight += w;
      }
      return sum / weight;
    });
    f.smoothed = { from: f.rights, values };
    return values;
  }

  // Averaged over nearby frames so the centring glides instead of stepping.
  function rightEdge(f, i) {
    if (f.smoothEdge) return smoothedRights(f)[i];
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - 3); j <= Math.min(f.last, i + 3); j++) {
      if (f.rights[j] != null) {
        sum += f.rights[j];
        n++;
      }
    }
    return n ? sum / n : SPINE + ((f.openRight - SPINE) * i) / f.last;
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

  // Where the open book's pages are: CSS lays the text over them from these. The page positions in styles.css
  // suit both takes, which put the book in the same part of the frame.
  function place() {
    const f = film();
    const open = (f.left + rightEdge(f, f.last)) / 2;
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
        if (!entry.isIntersecting || under()) return; // under the book, the words wait for the book (endAt)
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
    const end = s >= total - 0.1 || (ended && s > total - 0.4);
    if (end === ended) return;
    hero.classList.toggle('ended', (ended = end));
    if (under()) close.classList.toggle('pending', !end); // the words arrive in order once the book has made room
  }

  function under() {
    return document.documentElement.dataset.ending === 'under' && wide.matches && !reduceMotion.matches;
  }

  // Tells styles.css how long the timeline is, so the hero's height matches it.
  function applyTimeline() {
    total = REST + OPEN + hold;
    hero.style.setProperty('--timeline', total);
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

  // The top bar and the scroll hint --------------------------------------------------------

  // The top bar stays in view the whole way down: data-topbar-scroll="stays" on <html> (the user, 2026-09-19).
  // TRYOUT "Scrolling down: Bar slides away" gives the opening the screen to itself instead, the bar coming back as
  // soon as they scroll up, and near the top.
  let barY = scrollY; // where the page was when the bar last moved
  function placeTopbar() {
    const dy = scrollY - barY;
    if (Math.abs(dy) < 8 && scrollY > 80) return; // a finger's jitter doesn't count
    barY = scrollY;
    const stays = document.documentElement.dataset.topbarScroll === 'stays';
    topbar.classList.toggle('away', !stays && dy > 0 && scrollY > 80);
  }

  // The scroll hint sits under the headline only where the space under the closed book holds both with room to spare.
  // The open book's cue needs far less, being on its own at the foot of the stage — but it still has to clear the book.
  function fitHint() {
    const room = (canvas.clientHeight - BOOK_H * scale) / 2;
    const words = wordmark.querySelector('h1').offsetHeight + wordmark.querySelector('p').offsetHeight;
    stage.classList.toggle('roomy', room >= words + 130); // the hint takes about 78px, leaving 26px above and below
    stage.classList.toggle('roomy-open', room >= 78); // the cue itself, with a little air under the book
  }

  // The cue under the open book, from the moment the aayat fade in until the visitor scrolls on past the hero. Once
  // they have, it has done its job and never shows again — including on the way back up, so it doesn't nag.
  let cueDone = false;
  function showOpenCue(s, still) {
    if (still) return;
    if (s >= total - 0.1) cueDone = true;
    stage.classList.toggle('open-cue', !cueDone && s >= APPEAR);
  }

  // Answers a sideways swipe: the cue flashes, and with 'nudge' the page eases down far enough to show that this is
  // the way through. Only while the cue itself is live, so it never fires on the ending or the footer.
  let swipeAt = 0;
  function answerSwipe() {
    if (swipeAnswer === 'off' || reduceMotion.matches || cueDone || pos === null || pos < APPEAR) return;
    const now = performance.now();
    if (now - swipeAt < SWIPE_GAP) return;
    swipeAt = now;
    openHint.classList.remove('flash');
    void openHint.offsetWidth; // lets the animation run again on a second swipe
    openHint.classList.add('flash');
    if (swipeAnswer !== 'nudge') return;
    const limit = document.documentElement.scrollHeight - innerHeight;
    takeOver();
    freeScroll(true); // snapping would pull the page straight back
    scrollToY(Math.min(limit, scrollY + innerHeight * SWIPE_NUDGE), 1.6, true);
  }

  // Drawing -----------------------------------------------------------------------

  // Cross-fades the two frames either side of a position, or while they are still loading, draws
  // the nearest frame that has arrived. Returns false while no frame has loaded yet.
  function draw(at) {
    const f = film();
    const a = Math.floor(at);
    const b = Math.min(a + 1, f.last);
    const t = at - a;
    const fade = t > 0 && !!f.frames[a] && !!f.frames[b];
    const base = fade ? a : nearestLoaded(f, Math.round(at));
    if (base < 0 || !f.frames[base]) {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      return false;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    // The book is centred by choosing which part of the frame is drawn, never by moving the canvas. It follows
    // the frame actually on screen, so a frame still on its way isn't put where a later one belongs.
    const right = fade ? rightEdge(f, a) + (rightEdge(f, b) - rightEdge(f, a)) * t : rightEdge(f, base);
    const centre = (f.left + right) / 2;
    const w = SRC_W * scale;
    const h = SRC_H * scale;
    const x = width / 2 - centre * scale;
    const y = (height - h) / 2;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(f.frames[base], x, y, w, h);
    if (fade) {
      ctx.globalAlpha = t;
      ctx.drawImage(f.frames[b], x, y, w, h);
      ctx.globalAlpha = 1;
    }
    featherEdges(x, y, w, h);

    // Where the book is on screen, so atmosphere.js keeps its dust and light off it.
    const top = y + ((SRC_H - BOOK_H) / 2) * scale;
    hero.book = { left: x + f.left * scale, right: x + right * scale, top, bottom: top + BOOK_H * scale, scale };
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

  // How far the hero has been scrolled, in computer screen heights (0 to total). With `at`, how far it will have been
  // scrolled once the page rests at that scroll position.
  function targetScroll(at = scrollY) {
    const range = hero.offsetHeight - stage.offsetHeight;
    return range > 0 ? clamp(-(hero.getBoundingClientRect().top + (scrollY - at)) / range) * total : 0;
  }

  // The book's frame at a scroll position; smoothstep eases into and out of the opening. The two takes have
  // different numbers of frames, so this is a share of the opening, not a frame count: the book is exactly as
  // far open at a given scroll position whichever is showing.
  function frameAt(s) {
    return smoothstep(clamp((s - REST) / OPEN)) * film().last;
  }

  function nearestLoaded(f, i) {
    for (let d = 0; d <= f.last; d++) {
      if (f.frames[i - d]) return i - d;
      if (f.frames[i + d]) return i + d;
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
      vel = 0;
    } else if (feel === 'soft') {
      [pos, vel] = springTo(pos, vel, target, glide, dt);
      if (Math.abs(target - pos) < 0.0005 && Math.abs(vel) < 0.001) {
        pos = target;
        vel = 0;
      }
    } else {
      pos += (target - pos) * (1 - Math.exp(-dt / glide));
      vel = 0;
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
    const frame = still ? film().last : blend ? exact + (whole - exact) * smoothstep(sharpen) : whole;
    if (pos !== painted || dirty) {
      const rest = still ? 1 : 1 - clamp(frame / NAME_GONE);
      for (const part of resting) part.style.opacity = rest;
      showAayat(pos, still);
      showOpenCue(pos, still);
      endAt(pos);
      painted = pos;
    }
    if (frame !== drawn || dirty) {
      if (draw(frame)) {
        drawn = frame;
        dirty = false;
      }
    }
    const f = film();
    if (!f.started.has(whole)) load(f, whole, 'high');
    bufferAhead(f, whole, direction >= 0 ? 1 : -1);
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
    // One size for both takes, from the wider of the two, so the book doesn't change size with the theme.
    scale = Math.min((height * 0.8) / BOOK_H, (width * 0.88) / (OPEN_RIGHT - BOOK_LEFT), 1);
    place();
    fitHint();
    fit();
    dirty = true;
    paint(); // draw now: resizing the canvas has just cleared it
    schedule(); // the hero's height follows the window, so the scroll position may now mean a different frame
  }

  // Reduced motion: no scrubbing, just the open book, and only its frame is loaded.
  function applyMotion() {
    document.documentElement.classList.toggle('still', reduceMotion.matches);
    const f = film();
    if (reduceMotion.matches) load(f, f.last, 'high');
    else preloadThemes();
    place();
    dirty = true;
    schedule();
  }

  // Light and dark ----------------------------------------------------------------------------
  // The switch at the end of the top bar. The choice is remembered on this device (index.html applies it before the
  // page draws). Where the browser can, the whole page cross-fades from one to the other.

  function applyTheme() {
    const isLight = light();
    themeButton.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeButton.querySelector('.words').textContent = isLight ? themeButton.dataset.toDark : themeButton.dataset.toLight;
    themeColor.content = isLight ? '#F5F4F1' : '#1F1A18';
    applyMotion();
  }

  const prefetchOtherTheme = () => {
    const other = light() ? darkFilm : lightFilm;
    const targetFrame = Math.max(0, Math.min(other.last, Math.round(frameAt(pos === null ? targetScroll() : pos))));
    load(other, targetFrame, 'high');
    bufferAhead(other, targetFrame, direction >= 0 ? 1 : -1);
  };
  themeButton.addEventListener('pointerenter', prefetchOtherTheme);
  themeButton.addEventListener('touchstart', prefetchOtherTheme, { passive: true });

  themeButton.addEventListener('click', () => {
    // Both takes run on the same timeline, down a page of the same height, so the scroll position and the eased
    // position carry straight over: the book is left exactly as far open as it was, still gliding where it was
    // gliding. Nothing here may reset `pos` — that was what made the book jump on a switch (the user, 2026-09-14:
    // "if the Qur'an is closing in black and I change theme, the white Qur'an should be closing as well").
    const other = light() ? darkFilm : lightFilm;
    const targetFrame = Math.max(0, Math.min(other.last, Math.round(frameAt(pos === null ? targetScroll() : pos))));
    load(other, targetFrame, 'high');

    const turn = () => {
      const theme = light() ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem('theme', theme);
      } catch {
        // a private window can refuse; the switch still works for this visit
      }
      applyTheme();
      dirty = true;
      paint(); // draw now, so the cross-fade ends on the new book
      waitToFinish(); // clicking stopped any glide the page had running; pick it up again
    };

    // The cross-fade waits for the page to draw, so a page that isn't showing just changes. The browser can still cancel
    // a cross-fade part way; the theme changes all the same, so its promises are allowed to fail quietly.
    if (!document.startViewTransition || reduceMotion.matches || document.visibilityState !== 'visible') return turn();
    const fade = document.startViewTransition(async () => {
      if (!other.frames[targetFrame]) {
        await Promise.race([
          load(other, targetFrame, 'high'),
          new Promise((r) => setTimeout(r, 200)),
        ]);
      }
      turn();
    });
    Promise.allSettled([fade.ready, fade.updateCallbackDone, fade.finished]);
  });

  // TRYOUT --------------------------------------------------------------------------
  // Options shown everywhere for now, including once this is hosted on Netlify, so the user can send the link to
  // friends and have them try things and Export their picks back. Once the user picks: put the picks in the
  // settings above and in styles.css, then delete this block, the TRYOUT part of styles.css and the
  // unused Arabic font in index.html.

  {
    const narrow = matchMedia('(max-width: 767px)').matches;
    const panel = document.createElement('details');
    panel.className = 'tryout';
    panel.open = false; // collapsed to start with; open "Options" to see or change anything
    panel.innerHTML = '<summary>Options</summary>';
    document.body.append(panel);

    // Every control below registers itself here (key: "<group title> :: <label>") with a way to read and set its
    // current value. Export settings turns the whole map into one block of text; Import settings reads that same
    // block back and applies each value, so one person's choices (a title, an atmosphere mix, anything on the
    // panel) can be checked on someone else's screen without them clicking through every option by hand.
    const registry = (window.tryoutRegistry = new Map());
    const registerControl = (label, control) => registry.set(`${group.dataset.title || 'General'} :: ${label}`, control);
    window.registerControl = (groupTitle, label, control) => registry.set(`${groupTitle} :: ${label}`, control);

    function extractSettings(raw) {
      if (!raw || typeof raw !== 'string') return {};
      raw = raw.trim();
      try {
        return JSON.parse(raw);
      } catch {}

      // Auto-repair missing leading/trailing braces or leading junk
      try {
        const firstQuote = raw.indexOf('"');
        if (firstQuote !== -1) {
          let candidate = raw.slice(firstQuote);
          if (!candidate.startsWith('{')) candidate = '{' + candidate;
          if (!candidate.endsWith('}')) candidate = candidate + '}';
          return JSON.parse(candidate);
        }
      } catch {}

      // Fault-tolerant regex parser for clipped strings
      const data = {};
      const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*("(?:[^"\\]*(?:\\.[^"\\]*)*)"|true|false|null|-?\d+(?:\.\d+)?)/g;
      let m;
      while ((m = regex.exec(raw)) !== null) {
        try {
          const key = JSON.parse('"' + m[1] + '"');
          const val = JSON.parse(m[2]);
          data[key] = val;
        } catch {}
      }
      return data;
    }

    const io = document.createElement('div');
    io.className = 'tryout-io';
    const ioButtons = document.createElement('div');
    const exportButton = el('button', '', 'Export settings');
    exportButton.type = 'button';
    const copyButton = el('button', '', 'Copy');
    copyButton.type = 'button';
    const importButton = el('button', '', 'Import settings');
    importButton.type = 'button';
    const clearButton = el('button', '', 'Clear');
    clearButton.type = 'button';
    ioButtons.append(exportButton, copyButton, importButton, clearButton);

    const ioText = document.createElement('textarea');
    ioText.rows = 4;
    ioText.setAttribute('aria-label', 'Exported settings — copy this, or paste someone else’s here');
    ioText.placeholder = 'Click Export settings to copy, or paste settings here and click Import';
    const ioStatus = el('span', 'tryout-io-status', '');
    io.append(ioButtons, ioText, ioStatus);
    panel.querySelector('summary').after(io);

    const copyToClipboard = (text) => {
      ioText.value = text;
      ioText.focus();
      ioText.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {}
      if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text).then(
          () => true,
          () => ok,
        );
      }
      return Promise.resolve(ok);
    };

    exportButton.addEventListener('click', () => {
      const data = {};
      for (const [key, control] of registry) data[key] = control.get();
      const json = JSON.stringify(data, null, 2);
      copyToClipboard(json).then((success) => {
        ioStatus.textContent = success
          ? '✓ Settings exported & copied to clipboard!'
          : '✓ Settings exported below — press Ctrl+C to copy.';
        ioStatus.style.color = success ? '#4ade80' : '#fbbf24';
      });
    });

    copyButton.addEventListener('click', () => {
      if (!ioText.value.trim()) {
        const data = {};
        for (const [key, control] of registry) data[key] = control.get();
        ioText.value = JSON.stringify(data, null, 2);
      }
      copyToClipboard(ioText.value).then((success) => {
        ioStatus.textContent = success ? '✓ Copied to clipboard!' : 'Selected above — press Ctrl+C to copy.';
        ioStatus.style.color = success ? '#4ade80' : '#fbbf24';
      });
    });

    clearButton.addEventListener('click', () => {
      ioText.value = '';
      ioStatus.textContent = 'Cleared text box.';
      ioStatus.style.color = '#A8A29E';
    });

    importButton.addEventListener('click', async () => {
      let raw = ioText.value.trim();
      if (!raw && navigator.clipboard?.readText) {
        try {
          raw = (await navigator.clipboard.readText()).trim();
          if (raw) ioText.value = raw;
        } catch {}
      }

      if (!raw) {
        ioStatus.textContent = 'Paste settings into the box first, then click Import.';
        ioStatus.style.color = '#fbbf24';
        return;
      }

      const data = extractSettings(raw);
      const keys = Object.keys(data);
      if (keys.length === 0) {
        ioStatus.textContent = 'Could not find any settings in the pasted text.';
        ioStatus.style.color = '#f87171';
        return;
      }

      let applied = 0;
      for (const key of keys) {
        let control = registry.get(key);
        if (!control) {
          const suffix = key.includes(' :: ') ? key.split(' :: ').slice(1).join(' :: ') : key;
          for (const [regKey, regCtrl] of registry) {
            if (regKey.endsWith(` :: ${suffix}`) || regKey === suffix) {
              control = regCtrl;
              break;
            }
          }
        }
        if (control) {
          try {
            control.set(data[key]);
            applied++;
          } catch {}
        }
      }

      ioStatus.textContent = `✓ Applied ${applied} of ${keys.length} settings!`;
      ioStatus.style.color = applied > 0 ? '#4ade80' : '#f87171';
    });

    // Groups of rows, each under a heading that opens and closes. Rows go into the group named last, and naming a
    // group again adds to it. atmosphere.js and ending-options.js use this too; `first` puts a new group right
    // under the Export/Import row, which always stays the top of the panel.
    let group = panel;
    window.tryoutGroup = (title, { open = false, first = false } = {}) => {
      group = [...panel.querySelectorAll(':scope > details')].find((g) => g.dataset.title === title);
      if (group) return;
      group = document.createElement('details');
      group.dataset.title = title;
      group.open = open;
      group.append(el('summary', '', title));
      if (first) io.after(group);
      else panel.append(group);
    };

    // A row of buttons; the one matching `initial` starts pressed. atmosphere.js adds its rows with this too.
    window.addOption = (label, choices, initial, pick) => {
      const row = document.createElement('div');
      row.append(el('span', '', label));
      let current = initial;
      const buttons = [];
      const choose = (value, fire = true) => {
        current = value;
        for (const [b, v] of buttons) b.setAttribute('aria-pressed', v === value);
        if (fire) pick(value);
      };
      for (const [text, value] of Object.entries(choices)) {
        const b = el('button', '', text);
        b.type = 'button';
        b.setAttribute('aria-pressed', value === initial);
        b.addEventListener('click', () => choose(value));
        buttons.push([b, value]);
        row.append(b);
      }
      group.append(row);
      registerControl(label, { get: () => current, set: choose });
    };

    // A slider with its value shown beside it, in the words `format` gives.
    window.addSlider = (label, min, max, step, initial, format, pick) => {
      const row = document.createElement('div');
      const range = el('input', '');
      Object.assign(range, { type: 'range', min, max, step, value: initial });
      range.setAttribute('aria-label', label);
      const shown = el('output', '', format(initial));
      const apply = (value, fire = true) => {
        range.value = value;
        shown.textContent = format(value);
        if (fire) pick(value);
      };
      range.addEventListener('input', () => apply(Number(range.value)));
      row.append(el('span', '', label), range, shown);
      group.append(row);
      registerControl(label, { get: () => Number(range.value), set: apply });
    };

    // A free-text field: typing updates the page as you go. wordmark-options.js and ending-options.js use this for
    // the headline, the sentence under it, the closing line, the button words and the name at the very end, so any
    // of them can be typed exactly as wanted, not only chosen from a preset. Returns the input, so a preset button
    // can fill it in too and the field always shows what the page currently says.
    window.addText = (label, initial, pick) => {
      const row = document.createElement('div');
      const field = el('input', '');
      Object.assign(field, { type: 'text', value: initial });
      field.setAttribute('aria-label', label);
      const apply = (value, fire = true) => {
        field.value = value;
        if (fire) pick(value);
      };
      field.addEventListener('input', () => apply(field.value));
      row.append(el('span', '', label), field);
      group.append(row);
      registerControl(label, { get: () => field.value, set: apply });
      return field;
    };

    // What scroll-check.js records each frame: where the shown position is, and which frame is drawn.
    window.heroState = () => ({ pos, drawn, target: targetScroll(), sharpen });

    // top-options.js owns the row, next to the other two cues; the setting itself lives in here.
    window.setSwipeAnswer = (value) => (swipeAnswer = value);

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
    tryoutGroup('Ending', { open: true, first: true });
    addOption('Scroll once it opens', { 'As before': 1.4, Less: 0.7, Least: 0.35 }, hold, (v) => {
      hold = v;
      applyTimeline();
      redraw();
    });
    addOption('Ending locks into place', { Yes: true, No: false }, lockEnding, (v) => (lockEnding = v));
    if (matchMedia('(hover: none) and (pointer: coarse)').matches) {
      addOption('Swipe stops at each section', { Yes: '', No: 'free' }, '', setData('swipe'));
    }
    addSlider('Wait before gliding', 0, 400, 10, finishWait, (v) => `${v} ms`, (v) => (finishWait = v));
    addOption('Glide start', { 'Already moving': 'moving', 'Gently (before)': 'gentle' }, glideStart, (v) => (glideStart = v));
    addOption('Wheel scrolling', { 'Browser’s own': false, Smooth: true }, wheelSmooth, (v) => {
      wheelSmooth = v;
      cancelWheelGlide();
    });
    addSlider('Wheel smoothness', 0.05, 0.5, 0.01, wheelTau, (v) => `${v.toFixed(2)} s`, (v) => (wheelTau = v));
    tryoutGroup('Opening and aayat');
    const glideText = (v) => (v ? `${v.toFixed(2)} s${v === 0.28 ? ' (your pick)' : ''}` : 'Off');
    addSlider('Opening glide', 0, 0.5, 0.01, glide, glideText, retime((v) => (glide = v)));
    addOption('Glide feel', { 'As before': 'before', 'Soft start': 'soft' }, feel, retime((v) => (feel = v)));
    addOption('Blend frames', { Off: false, On: true }, blend, retime((v) => (blend = v)));
    addOption('Light book sway', { 'As before': 0, Smoothed: 8 }, lightFilm.smoothEdge, (v) => {
      lightFilm.smoothEdge = v;
      place();
      dirty = true;
      schedule();
    });
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
      addOption('Surah name', { 'On the page': 'page', 'Under the book': 'under' }, 'page', setData('phoneLeft'));
    }
  }

  // Finishing the opening ------------------------------------------------------------

  function onScroll() {
    schedule();
    placeTopbar();
    if (autoScroll) return; // the page's own scrolling
    if (!wheelRaf) direction = Math.sign(scrollY - lastY) || direction; // while the wheel glides, its own direction stands
    lastY = scrollY;
    if (!wheelRaf) waitToFinish(); // while the wheel's glide runs, the wheel itself times the finish (onWheel)
  }

  function waitToFinish(extra = 0) {
    clearTimeout(finishTimer);
    finishTimer = setTimeout(finishOpening, finishWait + extra);
  }

  // Phones and tablets stop at each part of the page by themselves (scroll snapping in styles.css), which also catches
  // a hard swipe before it carries past a part (the user, 2026-09-14). The glides below are for mice, trackpads and keys.
  function snapping() {
    return getComputedStyle(document.documentElement).scrollSnapType !== 'none';
  }

  function finishOpening() {
    if (touching || autoScroll || reduceMotion.matches || snapping()) return;
    const at = wheelRaf ? wheelTarget : scrollY; // while the wheel's glide runs, judge from where it is heading
    if (lockEnding && settleEnding(at)) return;
    if (finish === 'off' || !visible) return;
    const progress = (targetScroll(at) - REST) / OPEN;
    if (progress <= 0.002 || progress >= 0.998) return; // closed or open already
    const open = finish === 'nearest' ? progress >= 0.5 : direction > 0;
    scrollToScreens(open ? REST + OPEN : REST);
  }

  // Around the ending the page never rests part way (the user, 2026-09-14: it should "lock in", without a fight). It has
  // three resting places, given as where the ending's top is in the window: under the open book's whole screen (that
  // screen's height), filling the screen (0), and scrolled away with the footer's top at the top of the window (minus its
  // own height). Stopped between two of them, the page carries on to the one the visitor was heading for ("Nearer end":
  // the nearer one), so the book glides up and the ending settles into the screen. Past the last, the footer scrolls
  // freely. Like the half-open book, it waits for scrolling to stop, and any wheel, key, click or touch takes over.
  // Returns whether it moved.
  function settleEnding(at = scrollY) {
    if (under()) return false; // there the ending shares the book's screen
    const top = close.getBoundingClientRect().top + (scrollY - at); // where the ending's top is once the page rests at `at`
    const stops = [stage.offsetHeight, 0, -close.offsetHeight];
    for (let k = 0; k < 2; k++) {
      const above = stops[k];
      const below = stops[k + 1];
      if (top >= above - 1 || top <= below + 1) continue;
      const down = finish === 'nearest' ? top - below < above - top : direction > 0;
      const y = Math.min(at + top - (down ? below : above), document.documentElement.scrollHeight - innerHeight);
      if (Math.abs(y - at) < 1) return false; // the page doesn't go any further
      scrollToY(y);
      return true;
    }
    return false;
  }

  // Scrolls the page to a point on the hero's timeline.
  function scrollToScreens(s) {
    const range = hero.offsetHeight - stage.offsetHeight;
    scrollToY(hero.getBoundingClientRect().top + scrollY + (s / total) * range);
  }

  // Scrolls the page to y at `speed` screens a second, starting already moving, or gently from still. Snapping pauses
  // meanwhile, or it would pull each step of the glide back to a stop.
  //
  // If the wheel's glide is still moving, this carries on from where it has got to and how fast it was going: a curve
  // that leaves at that speed and arrives at rest, so there is no stop and no sudden start in between.
  let autoDir = 0; // which way the page's own scrolling is going
  let autoVel = 0; // and how fast, in px a second, so a wheel turned the other way can swing it back instead of stopping it dead
  function scrollToY(y, speed = finishSpeed, gentle = glideStart === 'gentle') {
    if (wheelRaf && Math.abs(wheelVel) > 100) {
      // Carrying on needs y ahead of the wheel's glide, with room to slow down: behind it, or too close to stop in,
      // the page would have to turn round or stop dead. Then the glide is left to arrive first, and the finish
      // (started again when it does) runs from rest.
      const toGo = y - wheelPos;
      if (toGo * wheelVel <= 0 || (3 * Math.abs(toGo)) / Math.abs(wheelVel) < 0.15) return;
    }
    cancelAnimationFrame(autoScroll);
    const carry = wheelRaf ? { from: wheelPos, v: wheelVel, at: wheelLast } : null;
    cancelWheelGlide(); // only one thing drives the scroll position at a time, or they fight over it every frame
    freeScroll(true);
    const from = carry ? carry.from : scrollY;
    const distance = y - from;
    autoDir = Math.sign(distance);
    let seconds = Math.max(300, (1000 * Math.abs(distance)) / innerHeight / speed) / 1000; // a short finish still eases
    let v0 = 0;
    if (carry) {
      // Leaving at speed v0 and arriving at rest without running past the end takes at most 3 x distance / v0, so when
      // the wheel was going fast and the finish is slow, the finish takes a little less time than it would, rather than
      // the speed dropping in one frame. Going away from the end, the speed is held to what 3 x distance / time allows.
      v0 = carry.v;
      const room = 3 * Math.abs(distance);
      if (v0 * distance > 0) seconds = Math.min(seconds, room / Math.abs(v0));
      else v0 = Math.max(-room / seconds, Math.min(room / seconds, v0));
    }
    const duration = seconds * 1000;
    const start = carry && carry.at ? carry.at : performance.now(); // from the wheel glide's last step, so no frame is lost
    let lastAt = from;
    let lastTime = start;
    autoVel = v0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      let at;
      if (carry) at = from + v0 * seconds * (t * t * t - 2 * t * t + t) + distance * (3 * t * t - 2 * t * t * t);
      else at = from + distance * (!gentle ? Math.sin((t * Math.PI) / 2) : t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);
      scrollTo(0, at);
      autoVel = ((at - lastAt) * 1000) / Math.max(1, now - lastTime);
      lastAt = at;
      lastTime = now;
      autoScroll = t < 1 ? requestAnimationFrame(tick) : 0;
      if (!autoScroll) {
        lastY = scrollY;
        freeScroll(false);
      }
    };
    autoScroll = requestAnimationFrame(tick);
  }

  function freeScroll(on) {
    document.documentElement.classList.toggle('free-scroll', on);
  }

  // Any scrolling by the visitor takes over from the page's own.
  function takeOver() {
    cancelAnimationFrame(autoScroll);
    autoScroll = 0;
    freeScroll(false);
    lastY = scrollY;
    tabFrom = null;
  }

  // Stops the wheel's own glide, for whatever takes over from it: a key, a click, a touch, the page's own finish.
  function cancelWheelGlide() {
    cancelAnimationFrame(wheelRaf);
    wheelRaf = 0;
    wheelVel = 0;
    wheelLast = 0;
  }

  // Each frame, glides the real scroll position toward where the wheel has sent it, with a spring (like `glide`, it
  // starts gently rather than at full speed, so a burst of notches doesn't lurch).
  function stepWheel(now) {
    wheelRaf = 0;
    if (Math.abs(scrollY - wheelSet) > 3) {
      // Something else moved the page (a jump to a link, the browser's find): leave it to that.
      cancelWheelGlide();
      waitToFinish();
      return;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    wheelTarget = Math.min(max, Math.max(0, wheelTarget));
    const dt = wheelLast ? Math.min(now - wheelLast, 50) / 1000 : 1 / 60;
    wheelLast = now;
    // A spring pulls harder the further it is from its target, so a huge flick would lurch. The glide chases a point no
    // more than 0.6 of a screen ahead of it, which caps the pull and, for very long flicks, the speed; nearer than that
    // it is the plain spring.
    const reach = Math.max(300, innerHeight * 0.6);
    const chase = wheelPos + Math.max(-reach, Math.min(reach, wheelTarget - wheelPos));
    [wheelPos, wheelVel] = springTo(wheelPos, wheelVel, chase, Math.max(0.02, wheelTau), dt);
    if (wheelPos < 0 || wheelPos > max) {
      wheelPos = Math.min(max, Math.max(0, wheelPos)); // the page's ends stop it dead
      wheelVel = 0;
    }
    const arrived = Math.abs(wheelTarget - wheelPos) < 1 && Math.abs(wheelVel) < 30;
    if (arrived) wheelPos = wheelTarget;
    wheelSet = wheelPos;
    scrollTo(0, wheelPos);
    if (arrived) {
      cancelWheelGlide();
      waitToFinish(); // the glide has come to rest: now the usual wait for the finish
      return;
    }
    wheelRaf = requestAnimationFrame(stepWheel);
  }

  // Whether something under the pointer can scroll itself the way the wheel turned (the options panel, a text box), so
  // the wheel is left to it.
  function scrollsItself(node, dy) {
    for (let el = node instanceof Element ? node : node && node.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      const overflow = getComputedStyle(el).overflowY;
      if ((overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      }
    }
    return false;
  }

  // The wheel, in CSS pixels, whatever unit the browser reports it in (Firefox counts a line as 34 px).
  const wheelPixels = (e) => e.deltaY * (e.deltaMode === 1 ? 34 : e.deltaMode === 2 ? innerHeight : 1);
  // The browser's own smooth scrolling took about this long (ms) to finish a notch, and "Wait before gliding" was
  // counted from there; the finish keeps that timing (the user tuned it), so it comes this long after the last notch.
  const WHEEL_TAIL = 130;

  // A wheel turned the way the page is already going doesn't stop it: stopping there felt stuck (the user, 2026-09-14).
  function onWheel(e) {
    if (e.ctrlKey || e.shiftKey || e.defaultPrevented || !e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // zoom, sideways
    const same = autoScroll && Math.sign(e.deltaY) === autoDir;
    if (!wheelSmooth || reduceMotion.matches || snapping() || scrollsItself(e.target, e.deltaY)) {
      cancelWheelGlide(); // the browser scrolls this one itself
      if (!same) takeOver();
      return;
    }
    e.preventDefault(); // this wheel now moves the page through the glide below, not the browser's own burst
    if (same) return;
    const carried = autoScroll ? autoVel : 0; // turned against the page's own glide: it swings back, not stops dead
    takeOver();
    direction = Math.sign(e.deltaY); // the way the wheel turned, at once: the page hasn't moved yet, so it can't say
    if (!wheelRaf) {
      wheelPos = wheelSet = wheelTarget = scrollY;
      wheelVel = carried;
      wheelLast = 0;
    }
    wheelTarget = Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(0, wheelTarget + wheelPixels(e)));
    if (!wheelRaf) wheelRaf = requestAnimationFrame(stepWheel);
    waitToFinish(WHEEL_TAIL); // the finish comes this long after the last notch, while the glide is still moving
  }

  addEventListener('scroll', onScroll, { passive: true });
  for (const type of ['keydown', 'mousedown']) {
    addEventListener(
      type,
      () => {
        cancelWheelGlide();
        takeOver();
      },
      { passive: true },
    );
  }
  addEventListener('wheel', onWheel, { passive: false });

  // Tab from the top bar lands on the ending's buttons, and the browser jumps there past the opening (the user,
  // 2026-09-14). Instead the page glides there through the book, quickly. Arrows, Space and Page Down scrub as always.
  let tabFrom = null; // where the page was when Tab was pressed
  addEventListener('keydown', (e) => e.key === 'Tab' && (tabFrom = scrollY));
  addEventListener('focusin', (e) => {
    const from = tabFrom;
    tabFrom = null;
    if (from === null || reduceMotion.matches) return;
    const glide = () => {
      const end = hero.getBoundingClientRect().top + scrollY + hero.offsetHeight - stage.offsetHeight; // book fully open
      if (from >= end - 1 || scrollY <= end) return false; // already past the opening, or the jump didn't cross it
      const to = close.contains(e.target) ? scrollY + close.getBoundingClientRect().top : scrollY;
      freeScroll(true); // before going back, or snapping would pull the page to a stop
      scrollTo(0, from);
      scrollToY(to, TAB_SPEED, true);
      return true;
    };
    // Chrome has already jumped by now; a browser that jumps after this event is caught before the next frame is drawn.
    if (!glide()) requestAnimationFrame(glide);
  });
  // Where a touch began, so a sideways drag can be told from a scroll (answerSwipe).
  let touchX = 0;
  let touchY = 0;
  let swiped = false; // this gesture has already been answered
  addEventListener(
    'touchstart',
    (e) => {
      touching = true;
      cancelWheelGlide();
      takeOver();
      const t = e.touches[0];
      swiped = false;
      if (t) {
        touchX = t.clientX;
        touchY = t.clientY;
      }
    },
    { passive: true },
  );

  addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (!t || swiped) return;
      const dx = t.clientX - touchX;
      const dy = t.clientY - touchY;
      // Clearly sideways rather than a scroll that wandered, and not started at an edge, where the drag belongs to the
      // browser's own back and forward.
      if (Math.abs(dx) < SWIPE_X || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (touchX < SWIPE_EDGE || touchX > innerWidth - SWIPE_EDGE) return;
      swiped = true;
      answerSwipe();
    },
    { passive: true },
  );

  // A trackpad pushed sideways is the same question asked with two fingers.
  addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) > 24 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 2) answerSwipe();
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
  new ResizeObserver(fitHint).observe(wordmark); // so does the headline's
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
    schedule();
  }).observe(hero);
  applyTimeline();
  applyTheme();
})();
