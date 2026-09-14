// Phase 4: atmosphere, in bright gold on the dark page and deeper gold on the light one. Around the book: gold dust, gold leaf and
// glints mixed by amount, drifting haze, a warm light behind the book, and a gold geometric pattern (faint, or shown
// only under the mouse), with a soft glow that follows the mouse. The book (with its aayat) moves slightly while
// nobody is scrolling. Phase 5: the air can carry on down the page, behind the ending and the footer.
// Spec: WEBSITE-BUILD.md sections 5 and 7. Nothing is ever drawn over the Qur'an itself: the book's area, which
// main.js reports as hero.book, is erased from this layer every frame. All of it is decoration: it stops offscreen
// and under reduced motion, and lightens itself, then switches off, on devices that measurably can't keep up.

(() => {
  const TAU = Math.PI * 2;
  const wave = (t, period, phase = 0) => Math.sin((t / period) * TAU + phase);
  const ease = (value, target, seconds, dt) => value + (target - value) * (1 - Math.exp(-dt / seconds));
  const rand = (min, max) => min + Math.random() * (max - min);
  const wrap = (v, size) => (v < -20 ? v + size + 40 : v > size + 20 ? v - size - 40 : v);

  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.stage');
  const wrapper = stage.querySelector('.book');    // moves the book and its aayat to make room for the ending
  const subject = stage.querySelector('.subject'); // moves them slightly while nobody is scrolling
  const close = document.querySelector('.close');  // the ending, after the book
  const footer = document.querySelector('.footer'); // the bottom of the page, after the ending
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');

  // Starting choices, until the user picks from the options panel. Amounts are percentages, 0 for none; glow is the
  // glow's radius in CSS pixels. reach: 'book' keeps the air on the book's screen, 'page' carries it on behind the ending.
  const settings = { dust: 100, leaf: 40, glints: 0, haze: 30, halo: 40, pattern: 'off', glow: 90, idle: 'drift', move: 100, text: 'steady', reach: 'page' };
  const IDLE_DELAY = 600;    // ms the book must have stopped before it starts moving by itself
  const MAX_PARTICLES = 400; // of each kind
  const LENS = 150;          // radius, in CSS pixels, of the patch of pattern the mouse uncovers

  // Clear space kept around the book, in footage pixels, scaled with the book. The open pages reach a little past
  // the measured rectangle at the bottom right, and the book moves slightly while still.
  const CLEAR = { top: 20, side: 16, bottom: 44, feather: 40 };

  // Smoothness is judged in two-second windows, only while the book is still and the tab is showing: while
  // scrolling, the book's frames cost more than the atmosphere, and a hidden tab pauses. Three slow windows in a
  // row lighten the effects; three more switch them off. Choosing any effect option turns them back on.
  const WINDOW = 2000; // ms
  const MIN_FPS = 45;
  const BAD_WINDOWS = 3;
  const WARMUP = 4000; // ms after load before judging, while the book's frames are still decoding

  const lens = document.createElement('canvas'); // the pattern under the mouse is cut out here, then stamped
  const lensCtx = lens.getContext('2d');

  const pointer = { x: 0, y: 0, inside: false };             // the mouse, in window pixels
  const lamp = { x: 0, y: 0, r: settings.glow, strength: 0 }; // trails the mouse, in window pixels; the glow and pattern follow it
  const particles = { dust: [], leaf: [], glints: [] };

  let width = 0;              // the air's size: one screen, the book's
  let height = 0;
  let dpr = 1;
  let unit = 1;               // screen height / 900, so things look the same size on a phone and a computer
  let presence = 0;           // fades everything in when it (re)starts
  // The canvas being drawn (ctx), where it is in the window (sx, sy), and what turns a drawing position into its
  // pixels (ox, oy). When the air carries on down the page, positions are window pixels, so the air stays put while
  // the page scrolls under it; when it stays with the book, they are the canvas's own, so it scrolls away with the book.
  let ctx = null;
  let sx = 0;
  let sy = 0;
  let ox = 0;
  let oy = 0;
  let idle = 0;               // 0 while the book moves with the scroll, 1 once it has been still a while
  let motion = settings.idle; // the last movement chosen, so switching it off eases out
  let bookTransform = '';
  let bookLayer = false;      // whether .subject has will-change: transform
  let gliding = false;        // main.js is still moving the book toward the scroll position
  let lastMove = -Infinity;
  let level = 'full';         // full, lite or off
  let heroSeen = true;        // some of the book's screen is in the window
  let closeSeen = false;      // some of the ending is in the window
  let footerSeen = false;     // some of the footer is in the window
  let raf = 0;
  let last = 0;
  let windowStart = 0;
  let frames = 0;
  let badWindows = 0;
  let lensPattern = null;

  // Sprites: shapes drawn once, then stamped, so each frame is mostly image copies -----------------------

  function sprite(size, paint) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    paint(c.getContext('2d'), size);
    return c;
  }

  const radial = (stops) => (g, size) => {
    const r = size / 2;
    const gradient = g.createRadialGradient(r, r, 0, r, r, r);
    for (const [at, color] of stops) gradient.addColorStop(at, color);
    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);
  };

  // Outlines of three torn flakes of gold leaf, in a 32 px square.
  const LEAF_SHAPES = [
    [[6, 9], [25, 4], [28, 21], [12, 28], [4, 20]],
    [[9, 5], [27, 11], [22, 27], [5, 24]],
    [[4, 12], [18, 3], [29, 15], [20, 29], [8, 26]],
  ];

  // The colours of the air, as r,g,b: bright gold on the dark page, and deeper gold that still shows on the ivory one
  // (phase 6). Rebuilt when the page changes theme.
  const INKS = {
    dark: {
      core: '255,240,210', warm: '240,210,150', gold: '212,175,55', glowCore: '255,222,165', glow: '255,215,150',
      spark: '255,250,235', sparkWarm: '255,230,170', flare: '255,245,220',
      leaf: ['#7A5A12', '#F3DE9A', '#C9A962'], haze: [222, 196, 150], line: '212,175,55',
    },
    light: {
      core: '140,95,15', warm: '160,115,35', gold: '201,160,70', glowCore: '201,160,70', glow: '201,160,70',
      spark: '150,100,20', sparkWarm: '180,130,40', flare: '160,115,35',
      leaf: ['#6B4E0E', '#D9B44A', '#A67C1E'], haze: [190, 150, 85], line: '154,95,7',
    },
  };
  const inkNow = () => INKS[root.dataset.theme === 'light' ? 'light' : 'dark'];

  function sprites(ink) {
    return {
      speck: sprite(32, radial([[0, `rgba(${ink.core},1)`], [0.3, `rgba(${ink.warm},0.5)`], [1, `rgba(${ink.gold},0)`]])),
      soft: sprite(64, radial([[0, `rgba(${ink.core},1)`], [0.55, `rgba(${ink.warm},0.5)`], [1, `rgba(${ink.gold},0)`]])),
      glow: sprite(256, radial([[0, `rgba(${ink.glowCore},0.13)`], [0.4, `rgba(${ink.glow},0.05)`], [1, `rgba(${ink.glow},0)`]])),
      halo: sprite(256, radial([[0, `rgba(${ink.gold},0.45)`], [0.45, `rgba(${ink.gold},0.16)`], [1, `rgba(${ink.gold},0)`]])),
      fade: sprite(256, radial([[0, '#fff'], [0.5, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']])),
      // A four-pointed sparkle: a bright core with thin flares across and down.
      glint: sprite(48, (g, size) => {
        radial([[0, `rgba(${ink.spark},1)`], [0.1, `rgba(${ink.sparkWarm},0.85)`], [0.3, `rgba(${ink.gold},0.15)`], [1, `rgba(${ink.gold},0)`]])(g, size);
        const c = size / 2;
        for (const across of [true, false]) {
          const flare = across ? g.createLinearGradient(0, 0, size, 0) : g.createLinearGradient(0, 0, 0, size);
          flare.addColorStop(0, `rgba(${ink.flare},0)`);
          flare.addColorStop(0.5, `rgba(${ink.flare},0.9)`);
          flare.addColorStop(1, `rgba(${ink.flare},0)`);
          g.fillStyle = flare;
          if (across) g.fillRect(0, c - 1, size, 2);
          else g.fillRect(c - 1, 0, 2, size);
        }
      }),
      leaves: LEAF_SHAPES.map((shape) =>
        sprite(32, (g) => {
          const metal = g.createLinearGradient(4, 4, 28, 28);
          metal.addColorStop(0, ink.leaf[0]);
          metal.addColorStop(0.45, ink.leaf[1]);
          metal.addColorStop(1, ink.leaf[2]);
          g.fillStyle = metal;
          g.beginPath();
          for (const [x, y] of shape) g.lineTo(x, y);
          g.closePath();
          g.fill();
        }),
      ),
      haze: hazeTile(256, ink.haze),
    };
  }

  let S = sprites(inkNow());

  // Soft, tileable wisps: four octaves of smooth random noise, keeping only the brighter parts.
  function hazeTile(size, rgb) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const img = g.createImageData(size, size);
    const octaves = [4, 8, 16, 32].map((n) => ({ n, v: Float32Array.from({ length: n * n }, Math.random) }));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let sum = 0;
        let amp = 1;
        let total = 0;
        for (const { n, v } of octaves) {
          const fx = (x / size) * n;
          const fy = (y / size) * n;
          const x0 = Math.floor(fx);
          const y0 = Math.floor(fy);
          const x1 = (x0 + 1) % n;
          const y1 = (y0 + 1) % n;
          let tx = fx - x0;
          let ty = fy - y0;
          tx = tx * tx * (3 - 2 * tx);
          ty = ty * ty * (3 - 2 * ty);
          const top = v[y0 * n + x0] + (v[y0 * n + x1] - v[y0 * n + x0]) * tx;
          const bottom = v[y1 * n + x0] + (v[y1 * n + x1] - v[y1 * n + x0]) * tx;
          sum += (top + (bottom - top) * ty) * amp;
          total += amp;
          amp /= 2;
        }
        const k = (y * size + x) * 4;
        img.data[k] = rgb[0];
        img.data[k + 1] = rgb[1];
        img.data[k + 2] = rgb[2];
        img.data[k + 3] = 255 * Math.max(0, (sum / total - 0.42) / 0.58) ** 1.8;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Two canvases show the same air: one over the book's screen, one behind the ending. The ending's is only drawn
  // when the air carries on down the page.
  function layer(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'air';
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    const context = canvas.getContext('2d');
    return { canvas, ctx: context, haze: context.createPattern(S.haze, 'repeat'), stars: null, w: 0, h: 0, inked: false };
  }

  const onBook = layer(stage);
  const onEnding = layer(close);
  const onFooter = layer(footer); // the user found the footer bare without it (2026-09-14)
  const layers = [onBook, onEnding, onFooter];

  // Light and dark: the air takes the other set of colours as soon as the page changes theme.
  new MutationObserver(() => {
    S = sprites(inkNow());
    for (const L of layers) L.haze = L.ctx.createPattern(S.haze, 'repeat');
    buildPattern();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // An eight-pointed star in each tile, its points joined to the neighbouring stars by thin gold lines.
  function buildPattern() {
    const size = Math.round(96 * Math.max(unit, 0.75)); // CSS pixels
    const px = Math.max(8, Math.round(size * dpr));
    const tile = document.createElement('canvas');
    tile.width = tile.height = px;
    const g = tile.getContext('2d');
    g.scale(px / size, px / size);
    g.strokeStyle = `rgb(${inkNow().line})`;
    g.lineWidth = 1;
    const c = size / 2;
    const r = size * 0.3;
    for (const turn of [0, Math.PI / 4]) {
      g.beginPath();
      for (let k = 0; k < 4; k++) g.lineTo(c + r * Math.cos(turn + (k * Math.PI) / 2), c + r * Math.sin(turn + (k * Math.PI) / 2));
      g.closePath();
      g.stroke();
    }
    g.beginPath();
    g.moveTo(0, c);
    g.lineTo(c - r, c);
    g.moveTo(c + r, c);
    g.lineTo(size, c);
    g.moveTo(c, 0);
    g.lineTo(c, c - r);
    g.moveTo(c, c + r);
    g.lineTo(c, size);
    g.stroke();
    for (const L of layers) {
      L.stars = L.ctx.createPattern(tile, 'repeat');
      L.stars.setTransform(new DOMMatrix([size / px, 0, 0, size / px, 0, 0])); // the tile is in device pixels
    }
    lensPattern = lensCtx.createPattern(tile, 'repeat');
  }

  function stamp(image, x, y, r, alpha) {
    ctx.globalAlpha = alpha * presence;
    ctx.drawImage(image, x - r, y - r, r * 2, r * 2);
  }

  // Gold in the air -----------------------------------------------------------------------------------
  // Base counts are for a 1440x900 screen at 100%, and scale with the screen's area and each kind's slider.

  const KINDS = {
    // Fine gold dust on a slow current of air; now and then a speck turns and catches the light.
    dust: {
      base: 90,
      make(p) {
        const near = level === 'full' && Math.random() < 0.08;
        const depth = near ? rand(0.85, 1) : rand(0.1, 0.8);
        Object.assign(p, {
          x: rand(0, width),
          y: rand(0, height),
          near,
          depth,
          r: near ? rand(4, 8) : 0.9 + depth * 2.2,
          vx: 2 + depth * 6,
          vy: -(1 + depth * 3),
          sway: rand(4, 12),
          wander: rand(9, 20),
          twinkle: rand(3, 8),
          catches: !near && Math.random() < 0.35,
          catchEvery: rand(7, 16),
          phase: rand(0, TAU),
          alpha: near ? rand(0.05, 0.1) : 0.25 + depth * 0.5,
        });
      },
      draw(p, t, dt) {
        p.x = wrap(p.x + p.vx * unit * dt, width);
        p.y = wrap(p.y + p.vy * unit * dt, height);
        const x = p.x + wave(t, p.wander, p.phase) * p.sway * unit;
        const y = p.y + wave(t, p.wander * 1.3, p.phase) * p.sway * 0.5 * unit;
        const r = p.r * Math.max(unit, 0.8);
        stamp(p.near ? S.soft : S.speck, x, y, r, p.alpha * (0.75 + 0.25 * wave(t, p.twinkle, p.phase)));
        if (!p.catches) return;
        const shine = Math.max(0, wave(t, p.catchEvery, p.phase)) ** 30; // a slow swell, a few times a minute
        if (shine > 0.02) stamp(S.glint, x, y, (5 + 5 * p.depth) * unit * (0.5 + 0.5 * shine), shine * 0.9);
      },
    },

    // Flakes of gold leaf falling slowly, turning over as they fall and flashing as they face the light.
    leaf: {
      base: 16,
      make(p, fresh) {
        const depth = rand(0.3, 1);
        Object.assign(p, {
          x: rand(0, width),
          y: fresh ? rand(0, height) : -20,
          leaf: Math.floor(rand(0, LEAF_SHAPES.length)),
          size: 5 + depth * 7,
          fall: 5 + depth * 9,
          sway: rand(15, 35),
          wander: rand(5, 9),
          angle: rand(0, TAU),
          spin: rand(-0.5, 0.5),
          flip: rand(0.8, 1.6),
          phase: rand(0, TAU),
          alpha: 0.5 + depth * 0.45,
        });
      },
      draw(p, t, dt) {
        p.y += p.fall * unit * dt;
        if (p.y > height + 20) this.make(p, false);
        p.angle += p.spin * dt;
        const x = p.x + wave(t, p.wander, p.phase) * p.sway * unit;
        const face = Math.cos(t * p.flip + p.phase); // 1 or -1 facing the viewer, 0 edge-on
        const s = p.size * unit;
        const cos = Math.cos(p.angle) * dpr;
        const sin = Math.sin(p.angle) * dpr;
        ctx.globalAlpha = p.alpha * presence * (0.35 + 0.65 * Math.abs(face));
        ctx.setTransform(cos, sin, -sin * face, cos * face, (x + ox) * dpr, (p.y + oy) * dpr);
        ctx.drawImage(S.leaves[p.leaf], -s / 2, -s / 2, s, s);
        ctx.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
        const shine = Math.max(0, face) ** 24;
        if (shine > 0.02) stamp(S.glint, x, p.y, s * 1.2, shine * 0.75);
      },
    },

    // Sparkles that catch the light for a moment, then appear somewhere else.
    glints: {
      base: 24,
      make(p) {
        Object.assign(p, { r: rand(6, 13), period: rand(4, 10), offset: rand(0, 1), alpha: rand(0.55, 0.95), cycle: null });
      },
      draw(p, t) {
        const c = t / p.period + p.offset;
        const cycle = Math.floor(c);
        if (cycle !== p.cycle) {
          p.cycle = cycle;
          p.x = rand(0, width);
          p.y = rand(0, height);
        }
        const flash = Math.sin((c - cycle) * Math.PI) ** 24;
        if (flash > 0.01) stamp(S.glint, p.x, p.y, p.r * unit * (0.5 + 0.5 * flash), p.alpha * flash);
      },
    },
  };

  // Makes the right number of one kind. A fresh start replaces them all; otherwise some are added or removed, so
  // dragging a slider doesn't restart the ones already there.
  function populate(kind, fresh = true) {
    const area = Math.min(1.5, Math.max(0.35, (width * height) / (1440 * 900)));
    let n = Math.round((KINDS[kind].base * area * settings[kind]) / 100);
    if (level === 'lite') n = Math.ceil(n / 2);
    n = Math.min(n, MAX_PARTICLES);
    const list = particles[kind];
    if (fresh) list.length = 0;
    list.length = Math.min(list.length, n);
    while (list.length < n) {
      const p = {};
      KINDS[kind].make(p, true);
      list.push(p);
    }
  }

  // The background ---------------------------------------------------------------------------------------

  // A warm light behind the book. Its middle is erased with the book, so it shows as a glow around the edges. b is in
  // window pixels, and the light is drawn on both canvases, so it doesn't stop in a line where the book's screen ends
  // as that scrolls away.
  function drawHalo(t, b) {
    if (!settings.halo || !b) return false;
    const r = Math.max(b.right - b.left, b.bottom - b.top) * (0.95 + 0.04 * wave(t, 11));
    const x = (b.left + b.right) / 2 - sx - ox; // window pixels to drawing positions
    const y = (b.top + b.bottom) / 2 - sy - oy;
    ctx.globalAlpha = (settings.halo / 100) * presence;
    ctx.drawImage(S.halo, x - r, y - r, r * 2, r * 2);
    return true;
  }

  // Two layers of haze drifting slowly in different directions. Left out at lite quality.
  const HAZE_LAYERS = [
    { scale: 6, vx: 5, vy: -1.5, alpha: 0.6 },
    { scale: 10, vx: -3, vy: -0.8, alpha: 0.4 },
  ];

  function drawHaze(t, L) {
    if (!settings.haze || level === 'lite') return false;
    for (const wisps of HAZE_LAYERS) {
      const k = wisps.scale * unit;
      const span = S.haze.width * k;
      const x = (((t * wisps.vx * unit) % span) + span) % span;
      const y = (((t * wisps.vy * unit) % span) + span) % span;
      L.haze.setTransform(new DOMMatrix([k, 0, 0, k, x, y]));
      ctx.fillStyle = L.haze; // assigned after moving it: some browsers keep the transform from assignment
      ctx.globalAlpha = (settings.haze / 100) * wisps.alpha * 0.5 * presence;
      ctx.fillRect(-ox, -oy, L.w, L.h); // the whole canvas
    }
    return true;
  }

  function drawPattern(L) {
    if (settings.pattern !== 'faint') return false;
    ctx.globalAlpha = 0.07 * presence;
    ctx.fillStyle = L.stars;
    ctx.fillRect(-ox, -oy, L.w, L.h);
    return true;
  }

  // The mouse ------------------------------------------------------------------------------------------------

  // Moves the lamp after the mouse with a slight lag, fading in and out. Returns whether it is showing.
  function trackLamp(dt) {
    const on = (settings.glow > 0 || settings.pattern === 'mouse') && pointer.inside && mouse.matches;
    if (settings.glow > 0) lamp.r = settings.glow;
    const snap = lamp.strength < 0.02; // appears where the mouse is, rather than sliding in from a corner
    lamp.strength = ease(lamp.strength, on ? 1 : 0, 0.35, dt);
    if (lamp.strength < 0.005) return false;
    lamp.x = snap ? pointer.x : ease(lamp.x, pointer.x, 0.08, dt);
    lamp.y = snap ? pointer.y : ease(lamp.y, pointer.y, 0.08, dt);
    return true;
  }

  function drawGlow() {
    if (!settings.glow) return false;
    const x = lamp.x - sx - ox; // window pixels to drawing positions
    const y = lamp.y - sy - oy;
    ctx.globalAlpha = lamp.strength;
    ctx.drawImage(S.glow, x - lamp.r, y - lamp.r, lamp.r * 2, lamp.r * 2);
    return true;
  }

  // The pattern, uncovered in a soft circle under the mouse. It stays fixed to the page as the circle moves over it.
  function drawLens() {
    if (settings.pattern !== 'mouse') return false;
    const x = lamp.x - sx - ox;
    const y = lamp.y - sy - oy;
    const size = Math.round(LENS * 2 * dpr);
    if (lens.width !== size) lens.width = lens.height = size;
    lensCtx.globalCompositeOperation = 'source-over';
    lensCtx.clearRect(0, 0, size, size);
    lensPattern.setTransform(new DOMMatrix([1, 0, 0, 1, -(x - LENS) * dpr, -(y - LENS) * dpr]));
    lensCtx.fillStyle = lensPattern;
    lensCtx.fillRect(0, 0, size, size);
    lensCtx.globalCompositeOperation = 'destination-in';
    lensCtx.drawImage(S.fade, 0, 0, size, size);
    ctx.globalAlpha = 0.45 * lamp.strength;
    ctx.drawImage(lens, x - LENS, y - LENS, LENS * 2, LENS * 2);
    return true;
  }

  // Erases this layer over the book, with a soft edge, so nothing ever sits on the Qur'an. b is in window pixels.
  function eraseBook(b) {
    const s = b.scale;
    const f = CLEAR.feather * s;
    const l = b.left - sx - CLEAR.side * s;
    const r = b.right - sx + CLEAR.side * s;
    const t = b.top - sy - CLEAR.top * s;
    const bottom = b.bottom - sy + CLEAR.bottom * s;
    const w = r - l;
    const h = bottom - t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // in this canvas's own pixels
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(l, t, w, h);
    ctx.drawImage(MASK, 64, 0, 1, 64, l, t - f, w, f);     // top edge
    ctx.drawImage(MASK, 64, 64, 1, 64, l, bottom, w, f);   // bottom edge
    ctx.drawImage(MASK, 0, 64, 64, 1, l - f, t, f, h);     // left edge
    ctx.drawImage(MASK, 64, 64, 64, 1, r, t, f, h);        // right edge
    ctx.drawImage(MASK, 0, 0, 64, 64, l - f, t - f, f, f); // corners
    ctx.drawImage(MASK, 64, 0, 64, 64, r, t - f, f, f);
    ctx.drawImage(MASK, 0, 64, 64, 64, l - f, bottom, f, f);
    ctx.drawImage(MASK, 64, 64, 64, 64, r, bottom, f, f);
    ctx.globalCompositeOperation = 'source-over';
  }

  // With the air staying on the book's screen, fades that screen's lower edge as it scrolls away, so the haze
  // doesn't end in a hard line.
  function fadeBottom(L, amount) {
    const f = L.h * 0.2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = amount;
    ctx.drawImage(MASK, 64, 0, 1, 64, 0, L.h - f, L.w, f); // clear at the top of the band, erased at the bottom
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // For erasing the book's area: opaque at the centre, clear 64 px out. Drawn in slices, so the fade is the
  // same width all round a rectangle of any size.
  const MASK = sprite(128, (g, size) => {
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.min(1, Math.hypot(x + 0.5 - 64, y + 0.5 - 64) / 64);
        img.data[(y * size + x) * 4 + 3] = 255 * (1 - d * d * (3 - 2 * d));
      }
    }
    g.putImageData(img, 0, 0);
  });

  // Draws each canvas that is in the window. The particles move once a frame, however many canvases show them.
  function paint(t, dt) {
    presence = ease(presence, 1, 0.8, dt);
    const lit = trackLamp(dt);
    const page = settings.reach === 'page';
    const book = bookInWindow();
    let step = dt;
    for (const L of layers) {
      ctx = L.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (L.inked) ctx.clearRect(0, 0, L.w, L.h);
      L.inked = false;
      if (L !== onBook && !page) continue;
      const rect = L.canvas.getBoundingClientRect();
      if (!rect.width || rect.bottom <= 0 || rect.top >= innerHeight) continue;
      sx = rect.left;
      sy = rect.top;
      ox = page ? -sx : 0;
      oy = page ? -sy : 0;
      ctx.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
      let drew = drawHalo(t, book);
      drew = drawHaze(t, L) || drew;
      drew = drawPattern(L) || drew;
      for (const kind in KINDS) {
        if (!particles[kind].length) continue;
        for (const p of particles[kind]) KINDS[kind].draw(p, t, step);
        drew = true;
      }
      step = 0;
      if (lit) {
        drew = drawLens() || drew;
        drew = drawGlow() || drew;
      }
      ctx.globalAlpha = 1;
      if (drew && book && L === onBook) eraseBook(book);
      if (drew && L === onBook && !page && sy < 0) fadeBottom(L, Math.min(1, -sy / (height * 0.25)));
      L.inked = drew;
    }
  }

  // Where the book is in the window: hero.book, which is on the book's canvas, moved with the page and, when the
  // ending makes room for itself, with .book.
  function bookInWindow() {
    const b = hero.book;
    if (!b) return null;
    const w = wrapper.getBoundingClientRect(); // the canvas's box, wherever .book has moved it
    const k = w.width / (stage.clientWidth || 1);
    return { left: w.left + b.left * k, right: w.left + b.right * k, top: w.top + b.top * k, bottom: w.top + b.bottom * k, scale: b.scale * k };
  }

  // The book ---------------------------------------------------------------------------------------------

  // Sine waves whose periods never line up, so the movement doesn't visibly repeat. k is the strength.
  const IDLE = {
    float: (t, k) => `translate3d(${wave(t, 11) * 1.5 * k * unit}px, ${wave(t, 6.5) * 4 * k * unit}px, 0)`,
    breathe: (t, k) => `scale(${1 + (wave(t, 7) + 1) * 0.005 * k})`,
    drift: (t, k) =>
      `rotateX(${wave(t, 9) * 0.6 * k}deg) rotateY(${wave(t, 13, 1) * k}deg) translate3d(0, ${wave(t, 7) * 2 * k * unit}px, 0)`,
  };

  function moveBook(t) {
    const k = (idle * settings.move) / 100;
    // A hair of rotation stops the browser snapping the book to whole pixels, which made Float and Breathe
    // move in visible steps.
    const hair = (0.1 + wave(t, 17, 2) * 0.06) * Math.min(k, 1);
    setBook(k > 0.01 ? `perspective(1600px) rotate(${hair}deg) ${IDLE[motion](t, k)}` : '');
  }

  // With 'before', the book gets a layer of its own only while it moves. The fixes keep that layer whenever the book
  // may move, so the aayat are drawn once and moved whole, rather than possibly redrawn at each new size and tilt.
  function setBook(transform) {
    if (transform !== bookTransform) {
      bookTransform = transform;
      subject.style.transform = transform;
    }
    const mayMove = settings.text !== 'before' && settings.idle !== 'off' && settings.move > 0 && !reduceMotion.matches;
    const layer = Boolean(transform) || mayMove;
    if (layer !== bookLayer) {
      bookLayer = layer;
      subject.style.willChange = layer ? 'transform' : '';
    }
  }

  // Loop ---------------------------------------------------------------------------------------------------

  function resize() {
    width = onBook.canvas.clientWidth;
    height = onBook.canvas.clientHeight;
    unit = height / 900;
    dpr = Math.min(devicePixelRatio || 1, level === 'full' ? 1.5 : 1); // soft light doesn't need full retina sharpness
    for (const L of layers) size(L);
    buildPattern();
    for (const kind in KINDS) populate(kind);
    presence = 0;
  }

  // Matches a canvas's pixels to its size on the page. Resizing clears it.
  function size(L) {
    L.w = L.canvas.clientWidth;
    L.h = L.canvas.clientHeight;
    L.canvas.width = Math.round(L.w * dpr);
    L.canvas.height = Math.round(L.h * dpr);
    L.inked = false;
  }

  function running() {
    const seen = heroSeen || ((closeSeen || footerSeen) && settings.reach === 'page');
    const air = settings.dust || settings.leaf || settings.glints || settings.haze || settings.halo || settings.pattern === 'faint';
    const book = settings.idle !== 'off' && settings.move > 0;
    const pointed = (settings.glow > 0 || settings.pattern === 'mouse') && mouse.matches;
    return seen && !reduceMotion.matches && level !== 'off' && Boolean(air || book || pointed);
  }

  // Starts the loop if there is anything to animate; otherwise leaves the book still and the canvases clear.
  function refresh() {
    if (running()) return wake();
    idle = 0;
    setBook('');
    for (const L of layers) {
      if (!L.inked) continue;
      L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L.ctx.clearRect(0, 0, L.w, L.h);
      L.inked = false;
    }
  }

  function wake() {
    if (raf) return;
    last = windowStart = frames = 0;
    raf = requestAnimationFrame(frame);
  }

  function measure(now, dtMs) {
    if (gliding || now - lastMove < 1000 || now < WARMUP || document.hidden || dtMs > 250) {
      windowStart = 0; // not a fair moment to judge; a fresh window starts later
      return;
    }
    if (!windowStart) {
      windowStart = now;
      frames = 0;
      return;
    }
    frames++;
    if (now - windowStart < WINDOW) return;
    badWindows = (frames * 1000) / (now - windowStart) < MIN_FPS ? badWindows + 1 : 0;
    windowStart = 0;
    if (badWindows < BAD_WINDOWS) return;
    badWindows = 0;
    level = level === 'full' ? 'lite' : 'off';
    resize();
    refresh();
  }

  // Uses elapsed time, so it moves at the same speed on 60 Hz and 144 Hz screens. Painting comes before moving the
  // book, so the positions it reads don't make the browser work out the page twice in one frame.
  function frame(now) {
    raf = 0;
    if (!running()) return refresh();
    const dtMs = last ? now - last : 1000 / 60;
    const dt = Math.min(dtMs, 50) / 1000;
    last = now;
    const t = now / 1000;
    const quiet = !gliding && now - lastMove > IDLE_DELAY;
    idle = ease(idle, quiet && settings.idle !== 'off' ? 1 : 0, quiet ? 1.2 : 0.12, dt);
    paint(t, dt);
    if (heroSeen) moveBook(t);
    measure(now, dtMs);
    if (!raf && running()) raf = requestAnimationFrame(frame);
  }

  const moved = () => (lastMove = performance.now());
  addEventListener('scroll', moved, { passive: true });
  hero.addEventListener('bookmove', () => (gliding = true));
  hero.addEventListener('bookrest', () => {
    gliding = false;
    moved();
  });
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
    },
    { passive: true },
  );
  root.addEventListener('mouseleave', () => (pointer.inside = false));
  reduceMotion.addEventListener('change', refresh);
  new ResizeObserver(resize).observe(onBook.canvas);
  new ResizeObserver(() => size(onEnding)).observe(onEnding.canvas);
  new ResizeObserver(() => size(onFooter)).observe(onFooter.canvas);
  const watch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) heroSeen = entry.isIntersecting;
      else if (entry.target === close) closeSeen = entry.isIntersecting;
      else footerSeen = entry.isIntersecting;
    }
    refresh();
  });
  watch.observe(hero);
  watch.observe(close);
  watch.observe(footer);

  // TRYOUT ------------------------------------------------------------------------------------------------
  // Phase 4 options, and phase 5's "Dust in the ending", added to main.js's panel on this PC or a phone on the same
  // wifi. Once the user picks: put the picks in `settings`, delete what was switched off, then delete this block and
  // the .readout CSS.

  if (window.addOption) {
    const choose = (key, after) => (value) => {
      settings[key] = value;
      if (level !== 'full') {
        level = 'full';
        badWindows = 0;
        resize();
      }
      after?.(value);
      refresh();
    };
    const percent = (v) => (v ? `${v}%` : 'Off');
    tryoutGroup('Atmosphere');
    for (const [kind, label] of [['dust', 'Gold dust'], ['leaf', 'Gold leaf'], ['glints', 'Glints']]) {
      addSlider(label, 0, 250, 5, settings[kind], percent, choose(kind, () => populate(kind, false)));
    }
    addSlider('Haze', 0, 100, 5, settings.haze, percent, choose('haze'));
    addSlider('Light behind book', 0, 100, 5, settings.halo, percent, choose('halo'));
    const patterns = mouse.matches ? { Off: 'off', Faint: 'faint', 'Under the mouse': 'mouse' } : { Off: 'off', Faint: 'faint' };
    addOption('Gold pattern', patterns, settings.pattern, choose('pattern'));
    if (mouse.matches) addSlider('Mouse glow', 0, 240, 5, settings.glow, (v) => (v ? `${v} px` : 'Off'), choose('glow'));
    addOption('Book when still', { Off: 'off', Float: 'float', Breathe: 'breathe', Drift: 'drift' }, settings.idle, choose('idle', (v) => v !== 'off' && (motion = v)));
    addSlider('Movement', 0, 300, 5, settings.move, (v) => `${v}%`, choose('move'));
    addOption('Aayat while moving', { 'As before': 'before', 'Fix A': 'steady', 'Fix B': 'flat' }, settings.text, choose('text', (v) => (root.dataset.ink = v === 'flat' ? 'flat' : '')));
    tryoutGroup('Ending');
    addOption('Dust in the ending and footer', { 'Stays with the book': 'book', 'Carries on': 'page' }, settings.reach, choose('reach'));

    // How smoothly this device runs: frames a second while scrolling and while still, counted separately.
    const readout = document.createElement('p');
    readout.className = 'readout';
    document.querySelector('.tryout').append(readout);
    const scrolling = { frames: 0, ms: 0, fps: null };
    const resting = { frames: 0, ms: 0, fps: null };
    let prev = 0;
    let since = 0;
    const meter = (now) => {
      const dt = prev ? now - prev : 0;
      prev = now;
      if (dt > 0 && dt < 250) {
        const bucket = gliding || now - lastMove < 300 ? scrolling : resting;
        bucket.frames++;
        bucket.ms += dt;
      }
      if (now - since > 1000) {
        since = now;
        for (const b of [scrolling, resting]) {
          if (b.ms > 300) b.fps = Math.round((b.frames * 1000) / b.ms);
          b.frames = b.ms = 0;
        }
        const show = (b) => b.fps ?? '–';
        const note = {
          full: '',
          lite: ' Effects were lightened because this device was slow while the book was still.',
          off: ' Effects were switched off because this device was slow while the book was still. Choose any effect option to turn them back on.',
        }[level];
        readout.textContent = `Smoothness on this device (60 is smooth): scrolling ${show(scrolling)}, still ${show(resting)} frames a second.${note}`;
      }
      requestAnimationFrame(meter);
    };
    requestAnimationFrame(meter);
  }
})();
