// The free Qaida: say it and listen back. QAIDA-BUILD.md step 7, specified in docs/your-voice/.
//
// The student records their own voice against the letter in front of them, hears it back next to the teacher's own
// recording, and decides for themselves whether the two match. Built the way trace.js is: a dialog, a top-bar
// button, no marking. Nothing here is ever scored — the honest tools for judging pronunciation would be wrong most
// often on exactly the letters (ع ح ق ص ض ط ظ ء) a beginner most needs encouragement through, and that is the same
// rule the tracing board already lives under, for a stronger reason (docs/your-voice/01 §3).
//
// It never leaves the device: there is no network call of any kind, and no upload, anywhere in this file or in
// voice-store.js — the check script asserts that by reading them. That is also why the teacher's own clip never gets
// a waveform here: drawing one would mean reading it over the network, and a missing picture is allowed (03 §5)
// where that is not. The play button for the teacher's clip is unaffected; only the peak envelope is skipped.

(() => {
  const shell = window.qaidaShell;
  if (!shell) return;

  // Three things have to be true before any of this is offered, and all three are testable up front. If any is
  // false the Say it buttons are not rendered at all — not disabled, not greyed, not there (docs/your-voice/02 §1).
  const can = Boolean(
    window.MediaRecorder
    && navigator.mediaDevices
    && navigator.mediaDevices.getUserMedia
    && window.isSecureContext,
  );

  if (!can) {
    for (const button of document.querySelectorAll('.open-echo, .current-say, .say')) button.remove();
    const settings = document.querySelector('.voice-settings');
    if (settings) settings.hidden = true;
    return;
  }

  const dialog = document.querySelector('.echo');
  if (!dialog) return; // this page hasn't been given the panel yet

  const store = window.qaidaVoiceStore || null;
  const root = document.documentElement;
  const $ = (selector) => dialog.querySelector(selector);
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (whole, key) => (key in values ? values[key] : whole));

  const title = $('.echo-title');
  const glyphEl = $('.echo-glyph');
  const nameEl = $('.echo-name');
  const asksEl = $('.echo-asks');
  const teacherLane = $('.lane.teacher');
  const mineLane = $('.lane.mine');
  const playTeacherBtn = $('.play-teacher');
  const playMineBtn = $('.play-mine');
  const teacherWave = $('.teacher-wave');
  const mineWave = $('.mine-wave');
  const deleteMineBtn = $('.delete-mine');
  const recordBtn = $('.record');
  const recordWord = $('.record-word');
  const bothBtn = $('.both');
  const stateEl = $('.echo-state');
  const noteEl = $('.echo-note');
  const unmuteBtn = $('.unmute-echo');

  // Options, read fresh every time so a row edited in the panel takes effect straight away (the same reasoning
  // lesson-2.js gives for reading its look-alike table on every question).
  const cap = () => {
    const n = Number(root.dataset.echoCap);
    return Number.isFinite(n) && n >= 2 && n <= 15 ? n : 6;
  };
  const ringOn = () => root.dataset.echoRing !== 'off';
  const waveOn = () => root.dataset.echoWave !== 'off';
  const gapMs = () => {
    const n = Number(root.dataset.echoGap);
    return Number.isFinite(n) && n >= 0 && n <= 1500 ? n : 400;
  };
  const autoplayTeacher = () => root.dataset.echoAuto === 'yes';
  const dotOn = () => root.dataset.echoDot !== 'off';
  const keepUntilClosed = () => root.dataset.echoKeep === 'session';

  const itemId = (kind, glyph) => `${kind}:${shell.keyOf(glyph)}`;

  // What is open right now --------------------------------------------------------------------

  let opener = null;
  let openToken = 0;
  let currentKind = '';
  let currentGlyph = '';
  let currentName = '';
  let currentId = '';
  let hasTeacher = false;

  let mineBlob = null;
  let mineUrl = null;
  let mineWaveResult = null; // { peaks, seconds } | null, decoded from mineBlob only — see the file header

  let teacherAudio = null;
  let mineAudio = null;
  let bothTimer = 0;
  let bothPlaying = false;

  let stream = null;
  let recorder = null;
  let chunks = [];
  let mime = '';
  let recStart = 0;
  let capTimer = 0;
  let secTimer = 0;
  let cappedByTimer = false;

  let meterCtx = null;
  let analyser = null;
  let levelRaf = 0;
  let slowSince = 0; // once the ring can't keep ~50fps it drops to 4/s and never recovers mid-recording

  let waveAudioCtx = null;
  let closing = false;
  let closeTimer = 0;

  const setState = (state) => {
    dialog.dataset.state = state;
  };
  const say = (text, values) => {
    stateEl.textContent = fill(text, values || {});
  };

  function paintItem() {
    if (!currentGlyph) {
      title.textContent = title.dataset.free || 'Your voice';
      glyphEl.textContent = '';
      nameEl.textContent = '';
      asksEl.hidden = true;
      return;
    }
    title.textContent = fill(title.dataset.template || 'Say {name}', { name: currentName });
    glyphEl.textContent = currentGlyph;
    nameEl.textContent = currentName;
    asksEl.hidden = false;
    asksEl.textContent = currentKind === 'letters' ? asksEl.dataset.name : asksEl.dataset.sound;
  }

  function renderReadyLine() {
    if (shell.state.muted) {
      unmuteBtn.hidden = false;
      say(stateEl.dataset.muted);
      return;
    }
    unmuteBtn.hidden = true;
    say(mineBlob ? stateEl.dataset.after : stateEl.dataset.before);
  }

  async function renderNote() {
    const storeOk = store ? await store.ready : false;
    if (!storeOk || keepUntilClosed()) {
      noteEl.textContent = noteEl.dataset.nostore;
    } else if (!hasTeacher) {
      noteEl.textContent = noteEl.dataset.noTeacher;
    } else {
      noteEl.textContent = noteEl.dataset.privacy;
    }
  }

  // The dot on the Say it buttons, for the item currently in view — even before this panel has been opened on it.
  let lastDotId = undefined;

  async function refreshDot(force) {
    const last = window.qaida && window.qaida.lastItem;
    const id = last ? itemId(last[0], last[1]) : null;
    if (!force && id === lastDotId) return;
    lastDotId = id;
    const has = Boolean(id && dotOn() && store && await store.has(id));
    for (const button of document.querySelectorAll('.open-echo, .current-say, .say')) {
      button.toggleAttribute('data-recorded', has);
    }
  }

  setInterval(() => {
    if (!document.hidden) refreshDot(false);
  }, 600);

  // Opening and closing -------------------------------------------------------------------------

  async function open(kind, glyph, name) {
    const token = ++openToken;
    opener = document.activeElement;
    stopBoth();
    currentKind = kind || '';
    currentGlyph = glyph || '';
    currentName = name || '';
    currentId = currentGlyph ? itemId(currentKind, currentGlyph) : '';
    paintItem();

    if (!dialog.open) dialog.showModal();
    dialog.classList.remove('closing');
    closing = false;
    setState('ready');

    mineBlob = null;
    mineWaveResult = null;
    if (mineUrl) {
      URL.revokeObjectURL(mineUrl);
      mineUrl = null;
    }
    teacherLane.hidden = true;
    mineLane.hidden = true;
    bothBtn.hidden = true;
    drawWave(teacherWave, null, 1);
    drawWave(mineWave, null, 1);

    hasTeacher = Boolean(currentId && window.qaidaAudio && window.qaidaAudio.has(currentKind, currentGlyph));
    teacherLane.hidden = !hasTeacher;

    let record = null;
    if (currentId && store) record = await store.get(currentId);
    if (token !== openToken) return; // superseded by a newer open() while that lookup was in flight

    if (record) {
      mineBlob = record.blob;
      mineUrl = URL.createObjectURL(mineBlob);
    }
    mineLane.hidden = !mineBlob;
    bothBtn.hidden = !(hasTeacher && mineBlob);

    renderReadyLine();
    await renderNote();
    if (token !== openToken) return;
    await decodeMine();
    if (token !== openToken) return;
    refreshDot(true);

    if (autoplayTeacher() && hasTeacher && !shell.state.muted) playTeacher();
  }

  function finishClosing() {
    clearTimeout(closeTimer);
    dialog.removeEventListener('animationend', onAnimEnd);
    dialog.classList.remove('closing');
    closing = false;
    if (dialog.open) dialog.close();
  }

  function onAnimEnd(event) {
    if (event.target === dialog) finishClosing();
  }

  function close() {
    if (!dialog.open || closing) return;
    // A student who taps outside mid-recording hasn't asked to throw their voice away: finish and keep it. Closing
    // while the microphone prompt is still pending (state 'asking') cancels — startRecording()'s own check for
    // `dialog.open` discards whatever the prompt eventually answers.
    if (dialog.dataset.state === 'recording') stopRecording();
    stopBoth();
    if (still()) {
      dialog.close();
      return;
    }
    closing = true;
    dialog.classList.add('closing');
    dialog.addEventListener('animationend', onAnimEnd);
    closeTimer = setTimeout(finishClosing, 300);
  }

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('close', () => {
    dialog.classList.remove('closing');
    closing = false;
    stopTeardown();
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  });

  for (const button of dialog.querySelectorAll('.close-echo')) button.addEventListener('click', close);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  // Changing the script or names can change which letters exist, exactly as trace.js already accounts for.
  shell.onChange(() => {
    if (dialog.open) close();
  });

  // The top-bar button opens on the letter last looked at, or blank with nothing to open on.
  for (const button of document.querySelectorAll('.open-echo')) {
    button.addEventListener('click', () => {
      const item = window.qaida && window.qaida.lastItem;
      if (item) open(item[0], item[1], item[2]);
      else open();
    });
  }

  // Recording -------------------------------------------------------------------------------------

  const TYPES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/mpeg'];

  // Every track stopped and the AudioContext closed — a leaked one keeps the browser's recording indicator lit, and
  // a student who sees it after closing the panel has been given a real reason not to trust the site.
  async function stopTeardown() {
    stopMeter();
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
    if (meterCtx) {
      const closing2 = meterCtx;
      meterCtx = null;
      try {
        await closing2.close();
      } catch {
        // already closed, or never fully opened
      }
    }
    clearTimeout(capTimer);
    clearInterval(secTimer);
  }

  function stopMeter() {
    if (levelRaf) cancelAnimationFrame(levelRaf);
    levelRaf = 0;
    if (analyser) {
      try {
        analyser.disconnect();
      } catch {
        // nothing was connected
      }
      analyser = null;
    }
    recordBtn.style.removeProperty('--level');
  }

  function startMeter() {
    if (!ringOn() || still()) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor || !stream) return;
    meterCtx = new AudioCtor();
    const source = meterCtx.createMediaStreamSource(stream);
    analyser = meterCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let smoothed = 0;
    let nextTick = 0;
    slowSince = 0;

    const tick = (now) => {
      if (!analyser || dialog.dataset.state !== 'recording') return;
      if (now >= nextTick) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        smoothed = smoothed * 0.7 + rms * 0.3;
        recordBtn.style.setProperty('--level', String(Math.min(1, smoothed * 3.2)));
        const target = slowSince ? 250 : 1000 / 50;
        if (now - nextTick > 40 && !slowSince) slowSince = now; // measured its own frame time, once, never recovers
        nextTick = now + target;
      }
      levelRaf = requestAnimationFrame(tick);
    };
    levelRaf = requestAnimationFrame(tick);
  }

  function tickSeconds() {
    clearInterval(secTimer);
    say(stateEl.dataset.recording, { n: 0 });
    secTimer = setInterval(() => {
      if (dialog.dataset.state !== 'recording') {
        clearInterval(secTimer);
        return;
      }
      say(stateEl.dataset.recording, { n: Math.floor((performance.now() - recStart) / 1000) });
    }, 1000);
  }

  async function startRecording() {
    const state = dialog.dataset.state;
    if (state === 'recording' || state === 'asking' || state === 'saving') return;
    setState('asking');
    say(stateEl.dataset.asking);
    let gotStream;
    try {
      gotStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (error) {
      if (!dialog.open) return; // closed while the prompt was up
      if (error && error.name === 'NotFoundError') {
        setState('nomic');
        say(stateEl.dataset.nomic);
      } else {
        setState('denied');
        say(stateEl.dataset.denied);
      }
      return;
    }
    if (!dialog.open) {
      // Closed while waiting for the prompt: nothing was asked for, so let go of what was just granted.
      for (const track of gotStream.getTracks()) track.stop();
      return;
    }
    stream = gotStream;
    const chosen = TYPES.find((t) => window.MediaRecorder.isTypeSupported(t)) || '';
    try {
      recorder = chosen ? new MediaRecorder(stream, { mimeType: chosen, audioBitsPerSecond: 32000 }) : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    mime = recorder.mimeType || chosen || '';
    chunks = [];
    cappedByTimer = false;
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) chunks.push(event.data);
    };
    recorder.onstop = onRecordingStopped;
    recStart = performance.now();
    recorder.start();
    setState('recording');
    startMeter();
    tickSeconds();
    capTimer = setTimeout(() => {
      if (dialog.dataset.state === 'recording') {
        cappedByTimer = true;
        stopRecording();
      }
    }, cap() * 1000);
  }

  function stopRecording() {
    if (!recorder || recorder.state === 'inactive') return;
    clearTimeout(capTimer);
    clearInterval(secTimer);
    stopMeter();
    try {
      recorder.stop();
    } catch {
      // already stopping
    }
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
    setState('saving');
    say(stateEl.dataset.saving);
  }

  async function onRecordingStopped() {
    const ms = Math.round(performance.now() - recStart);
    const blob = new Blob(chunks, { type: mime || 'audio/webm' });
    chunks = [];
    if (meterCtx) {
      const closing2 = meterCtx;
      meterCtx = null;
      try {
        await closing2.close();
      } catch {
        // already closed
      }
    }
    let kept = false;
    if (currentId && !keepUntilClosed() && store) kept = await store.put(currentId, blob, mime, ms);

    mineBlob = blob;
    if (mineUrl) URL.revokeObjectURL(mineUrl);
    mineUrl = URL.createObjectURL(blob);
    mineWaveResult = null;
    mineLane.hidden = false;
    bothBtn.hidden = !hasTeacher;

    setState('ready');
    await decodeMine();
    await renderNote();
    refreshDot(true);

    if (cappedByTimer) {
      cappedByTimer = false;
      say(stateEl.dataset.cap);
    } else {
      renderReadyLine();
    }
    void kept; // the note line already says whether it was kept; nothing else reads this
  }

  recordBtn.addEventListener('click', () => {
    if (dialog.dataset.state === 'recording') stopRecording();
    else startRecording();
  });

  // Playback ----------------------------------------------------------------------------------

  function playTeacher() {
    if (shell.state.muted || !hasTeacher || !window.qaidaAudio) {
      if (shell.state.muted) renderReadyLine();
      return;
    }
    const url = window.qaidaAudio.urlFor(currentKind, currentGlyph);
    if (!url) return;
    if (!teacherAudio) teacherAudio = new Audio();
    teacherAudio.src = url;
    teacherAudio.play().catch(() => {});
  }

  function playMine() {
    if (shell.state.muted || !mineUrl) {
      if (shell.state.muted) renderReadyLine();
      return;
    }
    if (!mineAudio) mineAudio = new Audio();
    mineAudio.src = mineUrl;
    mineAudio.play().catch(() => {});
  }

  function stopBoth() {
    clearTimeout(bothTimer);
    bothPlaying = false;
    if (teacherAudio) teacherAudio.pause();
    if (mineAudio) mineAudio.pause();
  }

  playTeacherBtn.addEventListener('click', playTeacher);
  playMineBtn.addEventListener('click', playMine);

  bothBtn.addEventListener('click', () => {
    if (bothPlaying) {
      stopBoth();
      return;
    }
    if (shell.state.muted) {
      renderReadyLine();
      return;
    }
    bothPlaying = true;
    playTeacher();
    bothTimer = setTimeout(() => {
      if (!bothPlaying) return;
      bothPlaying = false; // a second tap stops it; it never loops by itself
      playMine();
    }, gapMs());
  });

  unmuteBtn.addEventListener('click', () => {
    shell.state.muted = false;
    shell.save();
    shell.applyMute();
    renderReadyLine();
  });

  deleteMineBtn.addEventListener('click', async () => {
    if (mineUrl) {
      URL.revokeObjectURL(mineUrl);
      mineUrl = null;
    }
    mineBlob = null;
    mineWaveResult = null;
    mineLane.hidden = true;
    bothBtn.hidden = true;
    drawWave(mineWave, null, 1);
    if (currentId && store) await store.remove(currentId);
    refreshDot(true);
    say(stateEl.dataset.deleted);
    await renderNote();
  });

  // The waveform — the student's own clip only. Decoded from the recorded Blob directly, never read over the
  // network, which is also why the teacher's lane never gets one here (docs/your-voice/03 §5: a missing picture is
  // not an error).
  function drawWave(canvas, result, scale) {
    const box = canvas.getBoundingClientRect();
    const ctx2d = canvas.getContext('2d');
    if (!box.width || !box.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    ctx2d.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx2d.clearRect(0, 0, box.width, box.height);
    if (!result || !waveOn()) return;
    const width = box.width * Math.max(0, Math.min(1, scale));
    const barWidth = width / result.peaks.length;
    const mid = box.height / 2;
    ctx2d.fillStyle = getComputedStyle(canvas).color;
    result.peaks.forEach((p, i) => {
      const h = Math.max(1, p * box.height * 0.92);
      ctx2d.fillRect(i * barWidth, mid - h / 2, Math.max(1, barWidth - 1), h);
    });
  }

  async function decodeMine() {
    if (!mineBlob || !waveOn()) {
      drawWave(mineWave, null, 1);
      return;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      drawWave(mineWave, null, 1);
      return;
    }
    if (!waveAudioCtx) waveAudioCtx = new AudioCtor();
    try {
      const bytes = await mineBlob.arrayBuffer();
      const buffer = await waveAudioCtx.decodeAudioData(bytes);
      const data = buffer.getChannelData(0);
      const peakCount = 200;
      const block = Math.max(1, Math.floor(data.length / peakCount));
      const peaks = new Float32Array(peakCount);
      for (let i = 0; i < peakCount; i += 1) {
        let max = 0;
        const start = i * block;
        const end = Math.min(start + block, data.length);
        for (let j = start; j < end; j += 1) max = Math.max(max, Math.abs(data[j]));
        peaks[i] = max;
      }
      mineWaveResult = { peaks, seconds: buffer.duration };
    } catch {
      // Some browsers won't decode their own recorded blob back out of storage. The play button still works.
      mineWaveResult = null;
    }
    drawWave(mineWave, mineWaveResult, mineWaveResult ? Math.min(1, mineWaveResult.seconds / cap()) : 1);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    if (!dialog.open) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawWave(mineWave, mineWaveResult, mineWaveResult ? Math.min(1, mineWaveResult.seconds / cap()) : 1);
    }, 150);
  });

  // Stop when the tab is hidden or the page is going away, not only when the panel is closed.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && dialog.dataset.state === 'recording') stopRecording();
  });
  window.addEventListener('pagehide', () => {
    stopTeardown();
  });

  // Deleting everything, from the real Settings dialog and, until step 13, the temporary options panel too.
  async function deleteAll() {
    if (store) await store.clear();
    mineBlob = null;
    mineWaveResult = null;
    if (mineUrl) {
      URL.revokeObjectURL(mineUrl);
      mineUrl = null;
    }
    if (dialog.open) {
      mineLane.hidden = true;
      bothBtn.hidden = true;
      drawWave(mineWave, null, 1);
      renderReadyLine();
    }
    refreshDot(true);
    await refreshVoiceSettings();
  }

  // The real Settings dialog's own copy of the delete row (docs/your-voice/07 §4) — built there from the start so a
  // child's voice is never one file away from having no way to remove it. Two taps, the same pattern as "Start again".
  const voiceSettings = document.querySelector('.voice-settings');
  const voiceCount = document.querySelector('.voice-count');
  const deleteVoiceBtn = document.querySelector('.delete-voice');

  async function refreshVoiceSettings() {
    if (!voiceSettings) return;
    voiceSettings.hidden = false;
    if (!voiceCount || !store) return;
    const ids = await store.ids();
    if (ids.length === 0) {
      voiceCount.textContent = voiceCount.dataset.none;
      return;
    }
    let bytes = 0;
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop -- a handful of tiny clips; no need to parallelise a dev-only count
      const record = await store.get(id);
      if (record) bytes += record.blob.size;
    }
    const size = bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    voiceCount.textContent = fill(voiceCount.dataset.template, { n: ids.length, size });
  }

  let voiceArmed = 0;
  const disarmVoice = () => {
    clearTimeout(voiceArmed);
    voiceArmed = 0;
    if (deleteVoiceBtn) deleteVoiceBtn.textContent = deleteVoiceBtn.dataset.label;
  };

  if (deleteVoiceBtn) {
    deleteVoiceBtn.addEventListener('click', async () => {
      if (!voiceArmed) {
        deleteVoiceBtn.textContent = deleteVoiceBtn.dataset.confirm;
        voiceArmed = setTimeout(disarmVoice, 3000);
        return;
      }
      disarmVoice();
      await deleteAll();
    });
  }

  for (const button of document.querySelectorAll('.open-settings')) {
    button.addEventListener('click', refreshVoiceSettings);
  }
  refreshVoiceSettings();

  window.qaidaEcho = { open, close, deleteAll };
})();
