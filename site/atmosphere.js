// Phase 4: atmosphere. Light in the air in front of the book (dust, glints, orbs or rays), a light that follows
// the mouse, and a slight movement of the book (with its aayat) while nobody is scrolling.
// Spec: WEBSITE-BUILD.md sections 5 and 7. All of it is decoration: it stops offscreen and under reduced motion,
// and lightens itself, then switches off, on devices that measurably can't keep up.

(() => {
  const TAU = Math.PI * 2;
  const wave = (t, period, phase = 0) => Math.sin((t / period) * TAU + phase);
  const ease = (value, target, seconds, dt) => value + (target - value) * (1 - Math.exp(-dt / seconds));
  const rand = (min, max) => min + Math.random() * (max - min);

  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.stage');
  const subject = stage.querySelector('.subject');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');

  // Starting choices, until the user picks from the options panel.
  const settings = { air: 'glints', amount: 'few', light: 'glow', idle: 'drift', size: 'subtle' };
  const SIZE = { subtle: 1, more: 2.2 };
  const IDLE_DELAY = 600; // ms the book must have stopped before it starts moving by itself

  // Three bad seconds in a row lighten the effects; three more switch them off.
  const SLOW_FRAME = 24;  // ms; later than this means a frame was dropped on a 60 Hz screen
  const BAD_SHARE = 0.25; // a second is bad when a quarter of its frames were late
  const BAD_SECONDS = 3;
  const WARMUP = 4000;    // ms after load before judging, while the book's frames are still decoding

  const canvas = document.createElement('canvas');
  canvas.className = 'air';
  canvas.setAttribute('aria-hidden', 'true');
  stage.append(canvas);
  const ctx = canvas.getContext('2d');

  const pointer = { x: 0, y: 0, inside: false }; // the mouse, in window pixels
  const lamp = { x: 0, y: 0, strength: 0 };      // the light, trailing the mouse

  let width = 0;
  let height = 0;
  let unit = 1;                // screen height / 900, so things look the same size on a phone and a computer
  let motes = [];
  let presence = 0;            // fades the air in when it (re)starts
  let inked = false;           // something was drawn last frame, so the canvas needs clearing
  let idle = 0;                // 0 while the book moves with the scroll, 1 once it has been still a while
  let motion = settings.idle;  // the last movement chosen, so switching it off eases out
  let lampStyle = settings.light;
  let bookTransform = '';
  let gliding = false;         // main.js is still moving the book toward the scroll position
  let lastMove = -Infinity;
  let level = 'full';          // full, lite or off
  let visible = true;
  let raf = 0;
  let last = 0;
  let windowStart = 0;
  let frames = 0;
  let late = 0;
  let badSeconds = 0;

  // Sprites: soft shapes drawn once, then stamped, so each frame is only image copies ---------------

  function sprite(w, h, paint) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    paint(c.getContext('2d'), w, h);
    return c;
  }

  const radial = (stops) => (g, w) => {
    const r = w / 2;
    const gradient = g.createRadialGradient(r, r, 0, r, r, r);
    for (const [at, color] of stops) gradient.addColorStop(at, color);
    g.fillStyle = gradient;
    g.fillRect(0, 0, w, w);
  };

  const SPECK = sprite(32, 32, radial([[0, 'rgba(255,240,210,1)'], [0.3, 'rgba(240,210,150,0.5)'], [1, 'rgba(212,175,55,0)']]));
  const SOFT = sprite(64, 64, radial([[0, 'rgba(255,240,210,1)'], [0.55, 'rgba(240,210,150,0.5)'], [1, 'rgba(212,175,55,0)']]));
  const ORB = sprite(128, 128, radial([[0, 'rgba(255,228,170,0.5)'], [0.72, 'rgba(255,222,160,0.65)'], [0.86, 'rgba(240,200,130,0.3)'], [1, 'rgba(212,175,55,0)']]));

  // A four-pointed sparkle: a bright core with thin flares across and down.
  const GLINT = sprite(48, 48, (g, w) => {
    radial([[0, 'rgba(255,250,235,1)'], [0.1, 'rgba(255,230,170,0.85)'], [0.3, 'rgba(212,175,55,0.15)'], [1, 'rgba(212,175,55,0)']])(g, w);
    const c = w / 2;
    for (const across of [true, false]) {
      const flare = across ? g.createLinearGradient(0, 0, w, 0) : g.createLinearGradient(0, 0, 0, w);
      flare.addColorStop(0, 'rgba(255,235,190,0)');
      flare.addColorStop(0.5, 'rgba(255,245,220,0.9)');
      flare.addColorStop(1, 'rgba(255,235,190,0)');
      g.fillStyle = flare;
      if (across) g.fillRect(0, c - 1, w, 2);
      else g.fillRect(c - 1, 0, 2, w);
    }
  });

  // A beam of light: bright down its middle, fading out toward its sides and its far end.
  const BEAM = sprite(64, 512, (g, w, h) => {
    const across = g.createLinearGradient(0, 0, w, 0);
    across.addColorStop(0, 'rgba(255,225,160,0)');
    across.addColorStop(0.5, 'rgba(255,225,160,1)');
    across.addColorStop(1, 'rgba(255,225,160,0)');
    g.fillStyle = across;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const down = g.createLinearGradient(0, 0, 0, h);
    down.addColorStop(0, '#000');
    down.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = down;
    g.fillRect(0, 0, w, h);
  });

  function stamp(image, x, y, r, alpha) {
    ctx.globalAlpha = alpha * presence;
    ctx.drawImage(image, x - r, y - r, r * 2, r * 2);
  }

  // Light in the air ---------------------------------------------------------------------------
  // Counts are for a 1440x900 screen and scale with the screen's area.

  const AIR = {
    // Specks rising slowly and swaying; at full quality one in ten is close to the camera, large and blurred.
    dust: {
      count: { few: 50, more: 100 },
      make(p, fresh) {
        const near = level === 'full' && Math.random() < 0.1;
        const depth = near ? rand(0.85, 1) : rand(0.15, 0.75);
        Object.assign(p, {
          x: rand(0, width),
          y: fresh ? rand(0, height) : height + 20,
          image: near ? SOFT : SPECK,
          r: near ? rand(6, 14) : 1.2 + depth * 2.4,
          rise: 2 + depth * 8,
          sway: rand(3, 12),
          wander: rand(8, 18),
          twinkle: rand(3, 8),
          phase: rand(0, TAU),
          alpha: near ? rand(0.04, 0.09) : 0.2 + depth * 0.5,
        });
      },
      draw(p, t, dt) {
        p.y -= p.rise * unit * dt;
        if (p.y < -20) this.make(p, false);
        const x = p.x + wave(t, p.wander, p.phase) * p.sway * unit;
        stamp(p.image, x, p.y, p.r, p.alpha * (0.7 + 0.3 * wave(t, p.twinkle, p.phase)));
      },
    },

    // Sparkles that catch the light for a moment, then appear somewhere else.
    glints: {
      count: { few: 24, more: 48 },
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
        if (flash > 0.01) stamp(GLINT, p.x, p.y, p.r * unit * (0.5 + 0.5 * flash), p.alpha * flash);
      },
    },

    // Large, faint, out-of-focus circles of light drifting past.
    orbs: {
      count: { few: 7, more: 14 },
      make(p) {
        Object.assign(p, {
          x: rand(0, width),
          y: rand(0, height),
          r: rand(25, 80),
          vx: rand(-6, 6),
          vy: rand(-5, 3),
          pulse: rand(6, 12),
          phase: rand(0, TAU),
          alpha: rand(0.05, 0.12),
        });
      },
      draw(p, t, dt) {
        const r = p.r * unit;
        p.x += p.vx * unit * dt;
        p.y += p.vy * unit * dt;
        if (p.x < -r) p.x += width + 2 * r;
        else if (p.x > width + r) p.x -= width + 2 * r;
        if (p.y < -r) p.y += height + 2 * r;
        else if (p.y > height + r) p.y -= height + 2 * r;
        stamp(ORB, p.x, p.y, r, p.alpha * (0.75 + 0.25 * wave(t, p.pulse, p.phase)));
      },
    },

    // Soft beams falling from above, as if through a high window, slowly swaying and brightening.
    rays: {
      count: { few: 4, more: 7 },
      make(p) {
        Object.assign(p, {
          x: rand(-0.1, 1.1) * width,
          w: rand(60, 200),
          angle: rand(0.2, 0.34),
          sway: rand(12, 20),
          pulse: rand(7, 14),
          phase: rand(0, TAU),
          alpha: rand(0.05, 0.11),
        });
      },
      draw(p, t) {
        const w = p.w * unit;
        ctx.save();
        ctx.translate(p.x, -height * 0.1);
        ctx.rotate(p.angle + wave(t, p.sway, p.phase) * 0.03);
        ctx.globalAlpha = p.alpha * presence * (0.6 + 0.4 * wave(t, p.pulse, p.phase));
        ctx.drawImage(BEAM, -w / 2, 0, w, height * 1.4);
        ctx.restore();
      },
    },
  };

  function populate() {
    motes = [];
    presence = 0;
    const style = AIR[settings.air];
    if (!style) return;
    const scale = Math.min(1.5, Math.max(0.35, (width * height) / (1440 * 900)));
    let n = Math.max(settings.air === 'rays' ? 2 : 1, Math.round(style.count[settings.amount] * scale));
    if (level === 'lite') n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const p = {};
      style.make(p, true);
      motes.push(p);
    }
  }

  // The mouse light: a warm glow around the pointer, or a spotlight that dims everything else.
  function drawLamp(dt) {
    const on = settings.light !== 'off' && pointer.inside && mouse.matches;
    const snap = lamp.strength < 0.02; // appears where the mouse is, rather than sliding in from a corner
    lamp.strength = ease(lamp.strength, on ? 1 : 0, 0.4, dt);
    if (!on && lamp.strength < 0.005) return;
    const rect = canvas.getBoundingClientRect();
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    lamp.x = snap ? x : ease(lamp.x, x, 0.1, dt);
    lamp.y = snap ? y : ease(lamp.y, y, 0.1, dt);
    const spot = lampStyle === 'spot';
    const r = (spot ? 380 : 240) * unit;
    const light = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, r);
    if (spot) {
      light.addColorStop(0.35, 'rgba(12,9,8,0)');
      light.addColorStop(1, 'rgba(12,9,8,0.55)');
    } else {
      light.addColorStop(0, 'rgba(255,222,165,0.14)');
      light.addColorStop(0.45, 'rgba(255,215,150,0.05)');
      light.addColorStop(1, 'rgba(255,215,150,0)');
    }
    ctx.globalAlpha = lamp.strength;
    ctx.fillStyle = light;
    if (spot) ctx.fillRect(0, 0, width, height);
    else ctx.fillRect(lamp.x - r, lamp.y - r, r * 2, r * 2);
    inked = true;
  }

  function paint(t, dt) {
    if (inked) ctx.clearRect(0, 0, width, height);
    inked = false;
    const style = AIR[settings.air];
    if (style && motes.length) {
      presence = ease(presence, 1, 0.8, dt);
      for (const p of motes) style.draw(p, t, dt);
      inked = true;
    }
    drawLamp(dt);
    ctx.globalAlpha = 1;
  }

  // The book ---------------------------------------------------------------------------------------

  // Sine waves whose periods never line up, so the movement doesn't visibly repeat. k is the strength.
  const IDLE = {
    float: (t, k) => `translate3d(${wave(t, 11) * 1.5 * k * unit}px, ${wave(t, 6.5) * 4 * k * unit}px, 0)`,
    breathe: (t, k) => `scale(${1 + (wave(t, 7) + 1) * 0.005 * k})`,
    drift: (t, k) =>
      `rotateX(${wave(t, 9) * 0.6 * k}deg) rotateY(${wave(t, 13, 1) * k}deg) translate3d(0, ${wave(t, 7) * 2 * k * unit}px, 0)`,
  };

  function moveBook(t) {
    const k = idle * SIZE[settings.size];
    // A hair of rotation, never zero, stops the browser snapping the book to whole pixels, which made
    // Float and Breathe move in visible steps.
    setBook(k > 0.01 ? `perspective(1600px) rotate(${(0.1 + wave(t, 17, 2) * 0.06) * k}deg) ${IDLE[motion](t, k)}` : '');
  }

  function setBook(transform) {
    if (transform === bookTransform) return;
    bookTransform = transform;
    subject.style.transform = transform;
    // A layer of its own only while moving: during the opening it would add a pass for the aayat's blend every frame.
    subject.style.willChange = transform ? 'transform' : '';
  }

  // Loop ---------------------------------------------------------------------------------------------

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    unit = height / 900;
    const dpr = Math.min(devicePixelRatio || 1, level === 'full' ? 1.5 : 1); // soft light doesn't need full retina sharpness
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    inked = false; // resizing clears the canvas
    populate();
  }

  function running() {
    return (
      visible &&
      !reduceMotion.matches &&
      level !== 'off' &&
      (settings.air !== 'off' || settings.idle !== 'off' || (settings.light !== 'off' && mouse.matches))
    );
  }

  // Starts the loop if there is anything to animate; otherwise leaves the book still and the canvas clear.
  function refresh() {
    if (running()) return wake();
    idle = 0;
    setBook('');
    if (inked) ctx.clearRect(0, 0, width, height);
    inked = false;
  }

  function wake() {
    if (raf) return;
    last = windowStart = frames = late = 0;
    raf = requestAnimationFrame(frame);
  }

  // Counts late frames each second and steps the effects down when too many seconds in a row are bad.
  function measure(now, dtMs) {
    if (!windowStart) windowStart = now;
    frames++;
    if (dtMs > SLOW_FRAME) late++;
    if (now - windowStart < 1000) return;
    badSeconds = now > WARMUP && late / frames > BAD_SHARE ? badSeconds + 1 : 0;
    windowStart = now;
    frames = late = 0;
    if (badSeconds < BAD_SECONDS) return;
    badSeconds = 0;
    level = level === 'full' ? 'lite' : 'off';
    resize();
    refresh();
  }

  // Uses elapsed time, so it moves at the same speed on 60 Hz and 144 Hz screens.
  function frame(now) {
    raf = 0;
    if (!running()) return refresh();
    const dtMs = last ? now - last : 1000 / 60;
    const dt = Math.min(dtMs, 50) / 1000;
    last = now;
    const t = now / 1000;
    const quiet = !gliding && now - lastMove > IDLE_DELAY;
    idle = ease(idle, quiet && settings.idle !== 'off' ? 1 : 0, quiet ? 1.2 : 0.12, dt);
    moveBook(t);
    paint(t, dt);
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
  document.documentElement.addEventListener('mouseleave', () => (pointer.inside = false));
  reduceMotion.addEventListener('change', refresh);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    refresh();
  }).observe(hero);

  // TRYOUT ------------------------------------------------------------------------------------------
  // Phase 4 options, added to main.js's panel on this PC or a phone on the same wifi. Once the user picks:
  // put the picks in `settings`, delete the styles not chosen, then delete this block and the .readout CSS.

  if (window.addOption) {
    const choose = (key, after) => (value) => {
      settings[key] = value;
      after?.(value);
      refresh();
    };
    addOption('Light in the air', { Off: 'off', Dust: 'dust', Glints: 'glints', Orbs: 'orbs', Rays: 'rays' }, settings.air, choose('air', populate));
    addOption('Amount', { Few: 'few', More: 'more' }, settings.amount, choose('amount', populate));
    if (mouse.matches) {
      addOption('Mouse light', { Off: 'off', Glow: 'glow', Spotlight: 'spot' }, settings.light, choose('light', (v) => v !== 'off' && (lampStyle = v)));
    }
    addOption('Book when still', { Off: 'off', Float: 'float', Breathe: 'breathe', Drift: 'drift' }, settings.idle, choose('idle', (v) => v !== 'off' && (motion = v)));
    addOption('Movement size', { Subtle: 'subtle', More: 'more' }, settings.size, choose('size'));

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
          lite: ' Effects lightened: this device was struggling.',
          off: " Effects switched off: this device couldn't keep up.",
        }[level];
        readout.textContent = `Smoothness on this device (60 is smooth): scrolling ${show(scrolling)}, still ${show(resting)} frames a second.${note}`;
      }
      requestAnimationFrame(meter);
    };
    requestAnimationFrame(meter);
  }
})();
