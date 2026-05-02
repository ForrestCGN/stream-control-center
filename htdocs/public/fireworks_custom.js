// ForrestCGN Fireworks Overlay Renderer (WS-driven) + Sound + Heart/BigHeart/Ground
// Place this file at:
// D:\Streaming\stramAssets\htdocs\public\fireworks_custom.js
//
// Sounds must be here:
// D:\Streaming\stramAssets\htdocs\assets\sounds\fireworks\
// - burst-sm-1.mp3
// - burst-sm-2.mp3
// - burst1.mp3
// - burst2.mp3
// - crackle-sm-1.mp3
// - crackle1.mp3
// - lift1.mp3
// - lift2.mp3
// - lift3.mp3
//
// Overlay HTML should load it via:
// <script src="/public/fireworks_custom.js?v=WHATEVER"></script>

(() => {
  const canvas = document.getElementById("fw-canvas");
  if (!canvas) {
    console.error("[FW] canvas #fw-canvas not found");
    return;
  }
  const ctx = canvas.getContext("2d", { alpha: true });

  // =====================
  // PERFORMANCE CONFIG
  // =====================
  const QUALITY = "balanced"; // "low" | "balanced" | "high"
  const DPR_CAP = (QUALITY === "high") ? 1.5 : (QUALITY === "balanced" ? 1.25 : 1.0);

  const MAX_SPARKS  = (QUALITY === "high") ? 2000 : (QUALITY === "balanced" ? 1400 : 950);
  const MAX_ROCKETS = (QUALITY === "high") ? 28   : (QUALITY === "balanced" ? 18   : 12);

  const ROCKET_TRAIL = (QUALITY === "high") ? 14 : (QUALITY === "balanced" ? 10 : 6);
  const SPARK_TRAIL  = (QUALITY === "high") ? 10 : (QUALITY === "balanced" ? 7  : 5);

  // NOTE: transparent fade using destination-out (no black overlay)
  const FADE_ALPHA = (QUALITY === "high") ? 0.18 : (QUALITY === "balanced" ? 0.22 : 0.28);

  const GRAVITY = 0.055;
  const AIR_DRAG = 0.985;
  const HARD_CLEAR_AFTER_MS = 200;

  // =====================
  // SOUND CONFIG
  // =====================
  const SOUND_ENABLED = true;
  const SOUND_BASE = "/assets/sounds/fireworks/";

  const SOUND_POOL = {
    burst: ["burst-sm-1.mp3", "burst-sm-2.mp3", "burst1.mp3", "burst2.mp3"],
    crackle: ["crackle-sm-1.mp3", "crackle1.mp3"],
    heart: ["burst1.mp3", "burst2.mp3"],
    finale: ["burst2.mp3", "burst1.mp3"],
    ground: ["crackle-sm-1.mp3", "crackle1.mp3"],
    lift: ["lift1.mp3", "lift2.mp3", "lift3.mp3"]
  };

  const SOUND_COOLDOWN_MS = 60;
  let lastSoundAt = 0;

  const audio = (() => {
    if (!SOUND_ENABLED) return null;

    const cache = new Map();
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function play(name, volume = 0.5) {
      const now = Date.now();
      if (now - lastSoundAt < SOUND_COOLDOWN_MS) return;
      lastSoundAt = now;

      const url = SOUND_BASE + name;
      let base = cache.get(url);
      if (!base) {
        base = new Audio(url);
        base.preload = "auto";
        cache.set(url, base);
      }
      const clip = base.cloneNode(true);
      clip.volume = volume;
      clip.play().catch(() => {});
    }

    return { play, pick };
  })();

  // =====================
  // CANVAS RESIZE
  // =====================
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // =====================
  // UTILS
  // =====================
  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hsla = (h, s, l, a) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

  // =====================
  // STATE
  // =====================
  const rockets = [];
  const sparks = [];
  const crackles = [];
  const fountains = [];

  // FPS gate
  let fps = 60;
  let lastFpsT = performance.now();
  let frames = 0;
  function fpsGate() {
    frames++;
    const now = performance.now();
    if (now - lastFpsT >= 500) {
      fps = (frames * 1000) / (now - lastFpsT);
      frames = 0;
      lastFpsT = now;
    }
    return fps;
  }

  function fade() {
    // Transparent fade: remove previous pixels WITHOUT painting black (keeps OBS scene visible).
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0,0,0,${FADE_ALPHA})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "source-over";
  }

  function drawTrailPoints(trail, hue, alphaMul, radiusBase) {
    const step = (QUALITY === "low") ? 2 : 1;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < trail.length; i += step) {
      const t = trail[i];
      const a = (i / trail.length) * alphaMul;
      ctx.fillStyle = hsla(hue, 100, 62, a);
      ctx.beginPath();
      ctx.arc(t.x, t.y, radiusBase + a * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =====================
  // SPAWN / EXPLODE
  // =====================
  function spawnRocket(power = 1, forcedEffect = null, forcedTargetY = null, forcedX = null) {
    if (rockets.length >= MAX_ROCKETS) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const x = (forcedX != null) ? forcedX : rand(w * 0.10, w * 0.90);
    const y = h + 12;

    const hue = rand(0, 360);

    const isHeart = (forcedEffect === "heart" || forcedEffect === "heart_big");
    const veryHigh = isHeart && Math.random() < 0.25;

    const targetY = (forcedTargetY != null)
      ? forcedTargetY
      : (isHeart
        ? (veryHigh ? rand(h * 0.04, h * 0.25) : rand(h * 0.05, h * 0.55))
        : rand(h * 0.07, h * 0.70));

    const baseVyMin = isHeart ? 9.8 : 8.8;
    const baseVyMax = isHeart ? 14.0 : 12.6;
    const vy = -rand(baseVyMin, baseVyMax) * (0.92 + power * 0.05);

    const vx = rand(-1.2, 1.2);
    const ttl = rand(42, 96) * (1 / (0.95 + power * 0.03));

    let effect = "normal";
    if (forcedEffect) {
      effect = forcedEffect;
    } else {
      const roll = Math.random();
      effect = (roll < 0.18) ? "crackle" : (roll < 0.34 ? "glitter" : "normal");
    }

    rockets.push({ x, y, vx, vy, hue, targetY, ttl, effect, trail: [], forceTarget: (forcedTargetY != null) });

    if (audio && Math.random() < 0.5) {
      audio.play(audio.pick(SOUND_POOL.lift), 0.25);
    }
  }

  function explodeBurst(x, y, hue, intensity = 10, mode = "burst", effect = "normal") {
    const I = clamp(intensity, 1, 50);
    const budgetLeft = MAX_SPARKS - sparks.length;
    if (budgetLeft <= 0) return;

    if (audio) {
      let pool = SOUND_POOL.burst;
      if (effect === "crackle") pool = SOUND_POOL.crackle;
      if (mode === "finale") pool = SOUND_POOL.finale;
      audio.play(audio.pick(pool), mode === "finale" ? 0.65 : 0.5);
    }

    let target = (mode === "finale") ? Math.floor(160 + I * 6) : Math.floor(90 + I * 4);
    if (fps < 50) target *= 0.85;
    if (fps < 42) target *= 0.70;
    if (fps < 35) target *= 0.55;

    target = Math.max(28, Math.min(Math.floor(target), budgetLeft));

    const baseSpeed = (mode === "finale") ? 4.0 : 3.3;
    const speed = baseSpeed + I * 0.02;

    for (let i = 0; i < target; i++) {
      const a = (i / target) * (Math.PI * 2) + rand(-0.03, 0.03);
      const v = speed * rand(0.55, 1.0);

      sparks.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        hue: (hue + rand(-14, 14) + 360) % 360,
        sat: rand(65, 92),
        lum: rand(48, 68),
        alpha: 1,
        size: rand(1.1, 2.2),
        decay: rand(0.012, 0.020) + (mode === "finale" ? 0.002 : 0),
        trail: [],
        twinkle: Math.random() < (mode === "finale" ? 0.20 : 0.12),
        crackle: effect === "crackle",
        glitter: effect === "glitter"
      });
    }
  }

  function explodeHeart(x, y, hue, intensity = 10, big = false) {
    const I = clamp(intensity, 1, 50);
    const budgetLeft = MAX_SPARKS - sparks.length;
    if (budgetLeft <= 0) return;

    if (audio) audio.play(audio.pick(SOUND_POOL.heart), big ? 0.65 : 0.5);

    let points = Math.floor((big ? 180 : 120) + I * (big ? 4 : 3));
    if (fps < 45) points *= 0.8;
    points = Math.max(big ? 120 : 80, Math.min(points, budgetLeft));

    const baseScale = (big ? 7.2 : 2.8) + I * (big ? 0.10 : 0.05);
    const scale = baseScale * rand(0.90, 1.15);

    const rot = rand(-0.32, 0.32);
    const cosr = Math.cos(rot);
    const sinr = Math.sin(rot);

    for (let i = 0; i < points; i++) {
      const t = (i / points) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        1 * Math.cos(4 * t);

      const rx = hx * cosr - hy * sinr;
      const ry = hx * sinr + hy * cosr;

      const vx = (rx / 16) * scale + rand(-0.18, 0.18);
      const vy = (-ry / 16) * scale + rand(-0.18, 0.18);

      sparks.push({
        x, y,
        vx, vy,
        hue: (hue + rand(-8, 8) + 360) % 360,
        sat: rand(70, 95),
        lum: rand(55, 72),
        alpha: 1,
        size: rand(big ? 1.8 : 1.1, big ? 3.2 : 2.0),
        decay: rand(big ? 0.008 : 0.010, big ? 0.013 : 0.016),
        trail: [],
        twinkle: Math.random() < 0.10,
        crackle: false,
        glitter: true
      });
    }
  }

  function spawnCrackle(x, y, hue, amount) {
    amount = Math.min(amount, 240);
    for (let i = 0; i < amount; i++) {
      crackles.push({
        x, y,
        vx: rand(-3.0, 3.0),
        vy: rand(-3.0, 3.0),
        hue: (hue + rand(-10, 10) + 360) % 360,
        alpha: 1,
        size: rand(0.8, 1.6),
        decay: rand(0.04, 0.07)
      });
    }
  }

  function spawnFountain(intensity, durationMs) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    fountains.push({
      x: w * 0.5,
      y: h - 10,
      until: Date.now() + durationMs,
      intensity: clamp(intensity, 1, 50),
      hue: rand(0, 360)
    });

    if (audio) audio.play(audio.pick(SOUND_POOL.ground), 0.45);
  }

  // =====================
  // DRAW / UPDATE
  // =====================
  function drawRocket(r) {
    r.trail.push({ x: r.x, y: r.y });
    if (r.trail.length > ROCKET_TRAIL) r.trail.shift();
    drawTrailPoints(r.trail, r.hue, 0.55, 1.2);

    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = hsla(r.hue, 100, 72, 0.9);
    ctx.beginPath();
    ctx.arc(r.x, r.y, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSpark(p) {
    p.trail.push({ x: p.x, y: p.y, a: p.alpha });
    if (p.trail.length > SPARK_TRAIL) p.trail.shift();

    ctx.globalCompositeOperation = "lighter";
    const step = (QUALITY === "low") ? 2 : 1;
    for (let i = 0; i < p.trail.length; i += step) {
      const t = p.trail[i];
      const a = (i / p.trail.length) * t.a * 0.38;
      ctx.fillStyle = hsla(p.hue, p.sat, p.lum, a);
      ctx.beginPath();
      ctx.arc(t.x, t.y, p.size + a * 1.0, 0, Math.PI * 2);
      ctx.fill();
    }

    const coreA = p.twinkle ? (0.6 + Math.random() * 0.3) : 0.85;
    ctx.fillStyle = hsla(p.hue, 90, 70, p.alpha * coreA);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCrackle(c) {
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = hsla(c.hue, 100, 75, c.alpha * 0.9);
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // =====================
  // CONTROL
  // =====================
  let running = false;
  let spawnTimer = null;
  let lastEmptyAt = 0;

  const current = {
    intensity: 10,
    duration: 8000,
    mode: "burst",
    heartChanceBurst: 0.06,
    heartChanceHeartMode: 0.70
  };

  // =====================
  // QUEUE (prevents multiple spawners stacking)
  // =====================
  const FW_QUEUE = [];
  let FW_PLAYING = false;

  function enqueueShow(params) {
    const item = {
      intensity: clamp(Number(params.intensity) || 10, 1, 50),
      duration_ms: clamp(Number(params.duration_ms) || 8000, 300, 60000),
      mode: (params.mode || "burst").toLowerCase()
    };

    // Soft-merge burst/ground spam to keep it sane
    const last = FW_QUEUE.length ? FW_QUEUE[FW_QUEUE.length - 1] : null;
    if (last && last.mode === item.mode && (item.mode === "burst" || item.mode === "ground")) {
      last.intensity = clamp(last.intensity + Math.floor(item.intensity * 0.5), 1, 50);
      last.duration_ms = clamp(last.duration_ms + Math.floor(item.duration_ms * 0.5), 300, 60000);
    } else {
      FW_QUEUE.push(item);
    }

    if (!FW_PLAYING) playNextFromQueue();
  }

  function playNextFromQueue() {
    const next = FW_QUEUE.shift();
    if (!next) {
      FW_PLAYING = false;
      return;
    }
    FW_PLAYING = true;

    startFireworks(next);

    setTimeout(() => {
      running = false;
      if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
      setTimeout(() => playNextFromQueue(), 500);
    }, next.duration_ms + 200);
  }

  function tick() {
    if (!running && rockets.length === 0 && sparks.length === 0 && crackles.length === 0 && fountains.length === 0) {
      if (lastEmptyAt && (Date.now() - lastEmptyAt) > HARD_CLEAR_AFTER_MS) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        lastEmptyAt = 0;
      }
      return;
    }

    fpsGate();
    fade();

    // ground emit
    for (let i = fountains.length - 1; i >= 0; i--) {
      const f = fountains[i];
      if (Date.now() > f.until) { fountains.splice(i, 1); continue; }

      const budgetLeft = MAX_SPARKS - sparks.length;
      if (budgetLeft <= 0) continue;

      let emit = Math.floor(2 + f.intensity * 0.25);
      if (fps < 45) emit = Math.max(2, Math.floor(emit * 0.7));
      emit = Math.min(emit, 18, budgetLeft);

      for (let k = 0; k < emit; k++) {
        const a = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        const v = rand(2.8, 4.8) + f.intensity * 0.02;
        sparks.push({
          x: f.x + rand(-10, 10),
          y: f.y + rand(-2, 2),
          vx: Math.cos(a) * v + rand(-0.3, 0.3),
          vy: Math.sin(a) * v,
          hue: (f.hue + rand(-18, 18) + 360) % 360,
          sat: rand(60, 90),
          lum: rand(50, 66),
          alpha: 1,
          size: rand(1.0, 1.8),
          decay: rand(0.020, 0.035),
          trail: [],
          twinkle: Math.random() < 0.08,
          crackle: false,
          glitter: Math.random() < 0.10
        });
      }
    }

    // rockets update
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += GRAVITY * 0.30;
      r.vx *= AIR_DRAG;
      r.vy *= AIR_DRAG;
      r.ttl--;

      drawRocket(r);

      const reachedTarget = r.y <= r.targetY;
      const apex = r.vy > -1.25;
      const shouldExplode = reachedTarget || r.ttl <= 0 || (!r.forceTarget && apex);

      if (shouldExplode) {
        if (r.effect === "heart_big") {
          explodeHeart(r.x, r.y, r.hue, current.intensity, true);
        } else if (r.effect === "heart") {
          explodeHeart(r.x, r.y, r.hue, current.intensity, false);
        } else {
          explodeBurst(r.x, r.y, r.hue, current.intensity, current.mode, r.effect);
        }
        rockets.splice(i, 1);
      }
    }

    // sparks update
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY;
      p.vx *= AIR_DRAG;
      p.vy *= AIR_DRAG;

      p.alpha -= p.decay;
      if (p.alpha <= 0) { sparks.splice(i, 1); continue; }

      if (p.glitter && Math.random() < 0.06 && crackles.length < 260) {
        crackles.push({
          x: p.x, y: p.y,
          vx: rand(-1.4, 1.4),
          vy: rand(-1.4, 1.4),
          hue: p.hue,
          alpha: 0.9,
          size: rand(0.7, 1.2),
          decay: rand(0.06, 0.09)
        });
      }

      if (p.crackle && p.alpha < 0.35 && !p._crackled) {
        p._crackled = true;
        const amt = Math.floor(18 + current.intensity * 1.2);
        if (fps > 40) spawnCrackle(p.x, p.y, p.hue, amt);
        if (audio && Math.random() < 0.35) audio.play(audio.pick(SOUND_POOL.crackle), 0.55);
      }

      drawSpark(p);
    }

    // crackles update
    for (let i = crackles.length - 1; i >= 0; i--) {
      const c = crackles[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += GRAVITY * 0.6;
      c.vx *= 0.96;
      c.vy *= 0.96;
      c.alpha -= c.decay;
      if (c.alpha <= 0) { crackles.splice(i, 1); continue; }
      drawCrackle(c);
    }

    if (!running && rockets.length === 0 && sparks.length === 0 && crackles.length === 0 && fountains.length === 0) {
      lastEmptyAt = Date.now();
    } else {
      lastEmptyAt = 0;
    }

    requestAnimationFrame(tick);
  }

  function startFireworks({ intensity, duration_ms, mode }) {
    // Queue-safety: never leave old spawners running
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    running = false;

    current.intensity = clamp(Number(intensity) || 10, 1, 50);
    current.duration = clamp(Number(duration_ms) || 8000, 300, 60000);
    current.mode = (mode || "burst").toLowerCase();

    if (current.mode === "ground") {
      spawnFountain(current.intensity, current.duration);
      tick();
      return;
    }

    if (current.mode === "heart_big") {
      const w = window.innerWidth, h = window.innerHeight;
      spawnRocket(1.35, "heart_big", h * 0.30, w * 0.5);
      running = false;
      tick();
      return;
    }

    running = true;

    let baseRate =
      (current.mode === "finale") ? 105 :
      (current.mode === "heart")  ? 160 :
      220;

    baseRate -= current.intensity * ((current.mode === "finale") ? 1.1 : 0.9);

    if (fps < 50) baseRate += 40;
    if (fps < 42) baseRate += 80;
    if (fps < 35) baseRate += 140;

    const rate = clamp(baseRate, 120, 360);
    const power = (current.mode === "finale") ? 1.25 : 1.0;

    const startedAt = Date.now();

    spawnTimer = setInterval(() => {
      const n = Math.max(1, Math.round(current.intensity / ((current.mode === "finale") ? 12 : 18)));

      for (let i = 0; i < n; i++) {
        let force = null;

        if (current.mode === "heart") {
          force = (Math.random() < current.heartChanceHeartMode) ? "heart" : null;
        } else if (current.mode === "burst") {
          if (Math.random() < current.heartChanceBurst) force = "heart";
        }

        spawnRocket(power, force);
      }

      if (Date.now() - startedAt >= current.duration) {
        clearInterval(spawnTimer);
        spawnTimer = null;
        running = false;
      }
    }, rate);

    tick();
  }

  // =====================
  // WEBSOCKET INPUT
  // =====================
  function connectWS() {
    const ws = new WebSocket("ws://127.0.0.1:8080/");
    ws.onopen = () => console.log("[FW] WS connected");

    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }

      const op = (msg.op || msg.type || "").toLowerCase();
      if (op === "fireworks") {
        enqueueShow({
          intensity: msg.intensity,
          duration_ms: msg.duration_ms ?? msg.durationMs,
          mode: msg.mode
        });
      } else if (op === "fireworks_stop") {
        // Stop current show and clear pending queue
        running = false;
        if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
        FW_QUEUE.length = 0;
        FW_PLAYING = false;
      } else if (op === "fireworks_clear") {
        // Hard clear everything (including queue)
        running = false;
        if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
        FW_QUEUE.length = 0;
        FW_PLAYING = false;
        rockets.length = 0;
        sparks.length = 0;
        crackles.length = 0;
        fountains.length = 0;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    ws.onclose = () => {
      console.log("[FW] WS closed, reconnecting...");
      setTimeout(connectWS, 1500);
    };
    ws.onerror = () => {
      try { ws.close(); } catch {}
    };
  }

  connectWS();

  window.__FW_CUSTOM = "FORREST_FIREWORKS_CUSTOM_V4_QUEUE";
})();

