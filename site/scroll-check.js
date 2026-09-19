// TEMPORARY, local preview only: records what the page does, frame by frame, around one scroll, so a jolt can be
// found from numbers instead of guessed at (2026-09-18). "Record my next scroll" in the options panel, then scroll once
// with the mouse over the book; the report appears to copy. Delete this file and its <script> line in index.html, and
// window.heroState in main.js, once the jolt is fixed.

(() => {
  if (!window.tryoutGroup || !window.heroState) return;

  const stage = document.querySelector('.stage');
  const subject = document.querySelector('.stage .subject');
  const wordmark = document.querySelector('.stage .wordmark');
  const panel = document.querySelector('.tryout');
  if (!stage || !subject || !wordmark || !panel) return;

  const el = (tag, text) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  };

  tryoutGroup('Scroll check', { open: true, first: true });
  const group = panel.querySelector(':scope > details[data-title="Scroll check"]');

  const buttons = el('div');
  const record = el('button', 'Record my next scroll');
  const copy = el('button', 'Copy');
  record.type = copy.type = 'button';
  const status = el('span', 'Click, then scroll once with the wheel, mouse over the book (not over this panel).');
  status.className = 'tryout-io-status';
  buttons.append(record, copy, status);

  const report = el('textarea');
  report.rows = 8;
  report.readOnly = true;
  report.setAttribute('aria-label', 'Scroll recording: copy it and paste it to Claude');
  const boxRow = el('div');
  boxRow.append(report);
  group.append(buttons, boxRow);

  const num = (v, digits = 0) => (v === null || v === undefined || Number.isNaN(v) ? '-' : v.toFixed(digits));
  const pad = (text, width) => String(text).padStart(width);

  // Which options were set, read from the panel's own registry, so the numbers can be matched to a setup.
  const setup = () => {
    const wanted = [
      'Book when still', 'Movement', 'Book when scrolling starts', 'Opening glide', 'Glide feel', 'Wheel scrolling',
      'Wheel smoothness', 'Blend frames', 'Half-open book', 'Wait before gliding', 'Glide start', 'Auto open/close speed',
      'Aayat while moving', 'Gold dust', 'Haze', 'Light behind book', 'Mouse glow',
    ];
    const found = [];
    for (const [key, control] of window.tryoutRegistry || []) {
      const label = key.split(' :: ').slice(1).join(' :: ');
      if (wanted.includes(label)) found.push(`${label}=${control.get()}`);
    }
    return found.join(', ');
  };

  const describe = (rec) => {
    const f = rec.frames;
    if (f.length < 3) return 'The recording was too short. Click the button and try again.';
    const t0 = rec.first ?? f[0].now;
    const at = (frame) => Math.round(frame.now - t0);
    const lines = [];
    const agent = (navigator.userAgent.match(/(OPR|Chrome|Firefox|Edg)\/[\d.]+/g) || []).join(' ');
    lines.push(`SCROLL RECORDING · ${agent} · ${innerWidth}x${innerHeight} at ${devicePixelRatio}x`);
    lines.push(`Options: ${setup()}`);
    lines.push(`Wheel events: ${rec.wheels.length}${rec.wheels.length ? ` (deltaY ${rec.wheels.slice(0, 6).map((w) => w[1]).join(', ')}${rec.wheels.length > 6 ? ', …' : ''})` : ' (none: was it the wheel?)'}, scroll events: ${rec.scrolls.length}`);

    const dts = f.slice(1).map((frame, i) => frame.now - f[i].now);
    const span = f[f.length - 1].now - f[0].now;
    const worst = Math.max(...dts);
    lines.push(`Frames: ${f.length} in ${(span / 1000).toFixed(1)} s = ${((f.length - 1) * 1000 / span).toFixed(0)} a second; longest frame ${worst.toFixed(0)} ms at ${at(f[dts.indexOf(worst) + 1])} ms; over 24 ms: ${dts.filter((d) => d > 24).length}, over 40 ms: ${dts.filter((d) => d > 40).length}`);

    const i0 = Math.max(0, f.findIndex((frame) => frame.now >= t0) - 1);
    const base = f[i0];
    const after = f.slice(i0);
    const moved = after.find((frame) => frame.y !== base.y);
    lines.push(`Page scroll position first changed ${moved ? `${at(moved)} ms after the first wheel event` : 'never (the page did not move)'}`);
    const stageTops = after.map((frame) => frame.stage);
    lines.push(`Book's screen top: ${num(Math.min(...stageTops), 1)} to ${num(Math.max(...stageTops), 1)} (0 to 0 means it stays pinned)`);

    const window600 = after.filter((frame) => frame.now - t0 < 700);
    const dx = window600.map((frame) => frame.x - base.x);
    const dy = window600.map((frame) => frame.top - base.top);
    let fastest = 0;
    let fastestAt = 0;
    for (let i = 1; i < window600.length; i++) {
      const step = Math.hypot(window600[i].x - window600[i - 1].x, window600[i].top - window600[i - 1].top);
      const speed = (step * 1000) / Math.max(1, window600[i].now - window600[i - 1].now);
      if (speed > fastest) {
        fastest = speed;
        fastestAt = at(window600[i]);
      }
    }
    lines.push(`Book layer, first 0.7 s: moved ${num(Math.min(...dx), 1)}..${num(Math.max(...dx), 1)} px across, ${num(Math.min(...dy), 1)}..${num(Math.max(...dy), 1)} px down; fastest ${fastest.toFixed(0)} px/s at ${fastestAt} ms`);

    const shown = after.map((frame) => frame.shown).filter((v) => v !== null);
    const firstShown = shown[0];
    const changedAt = after.find((frame) => frame.shown !== null && frame.shown !== firstShown);
    let biggestJump = 0;
    for (let i = 1; i < after.length; i++) {
      if (after[i].shown !== null && after[i - 1].shown !== null) biggestJump = Math.max(biggestJump, Math.abs(after[i].shown - after[i - 1].shown));
    }
    lines.push(`Picture frame: ${num(firstShown, 2)} at first, ${changedAt ? `starts changing at ${at(changedAt)} ms` : 'never changed'}; biggest change in one frame ${biggestJump.toFixed(2)}`);
    lines.push('');
    lines.push('   ms    dt     y     pos  target   frame  screenTop  bookX  bookY  headline');
    const start = Math.max(0, i0 - 2);
    for (let i = start; i < Math.min(f.length, start + 44); i++) {
      const frame = f[i];
      const dt = i ? frame.now - f[i - 1].now : 0;
      lines.push(
        [
          pad(at(frame), 5),
          pad(dt.toFixed(1), 6),
          pad(num(frame.y), 6),
          pad(num(frame.pos, 3), 7),
          pad(num(frame.target, 3), 7),
          pad(num(frame.shown, 2), 7),
          pad(num(frame.stage, 1), 10),
          pad(num(frame.x - base.x, 1), 6),
          pad(num(frame.top - base.top, 1), 6),
          pad(num(frame.hint, 2), 9),
        ].join(' '),
      );
    }
    return lines.join('\n');
  };

  let recording = null;
  record.addEventListener('click', () => {
    if (recording) return;
    report.value = '';
    status.textContent = 'Recording… scroll once now, with the mouse over the book.';
    status.style.color = '#fbbf24';
    const rec = { began: performance.now(), first: null, wheels: [], scrolls: [], frames: [] };
    recording = rec;
    const onWheel = (e) => {
      const now = performance.now();
      if (rec.first === null) rec.first = now;
      rec.wheels.push([now, Math.round(e.deltaY), e.deltaMode]);
    };
    const onScroll = () => rec.scrolls.push([performance.now(), scrollY]);
    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });

    const finish = () => {
      removeEventListener('wheel', onWheel);
      removeEventListener('scroll', onScroll);
      recording = null;
      report.value = describe(rec);
      status.textContent = rec.first === null ? 'No wheel scroll was seen. Try again.' : 'Done. Press Copy, then paste it to Claude.';
      status.style.color = '#4ade80';
    };

    const sample = (now) => {
      const state = window.heroState();
      const box = subject.getBoundingClientRect();
      rec.frames.push({
        now,
        y: scrollY,
        pos: state.pos,
        target: state.target,
        shown: state.drawn,
        stage: stage.getBoundingClientRect().top,
        x: box.left,
        top: box.top,
        hint: Number(wordmark.style.opacity || 1),
      });
      if ((rec.first !== null && now - rec.first > 2500) || now - rec.began > 20000) return finish();
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  copy.addEventListener('click', async () => {
    if (!report.value) {
      status.textContent = 'Nothing recorded yet.';
      return;
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(report.value);
      ok = true;
    } catch {
      report.focus();
      report.select();
      try {
        ok = document.execCommand('copy');
      } catch {}
    }
    status.textContent = ok ? 'Copied. Paste it into the chat.' : 'Selected above. Press Ctrl+C, then paste it into the chat.';
    status.style.color = ok ? '#4ade80' : '#fbbf24';
  });
})();
