(function(){
  const root = document.getElementById('obsModule');
  if (!root) return;

  const DEFAULT_CONFIG = {
    autoRefreshEnabled: true,
    fastRefreshMs: 2000,
    fullRefreshMs: 10000,
    showStatusLine: true,
    showPerformance: true,
    showOverview: true,
    hideInternalScenesOnMain: true
  };

  const state = {
    initialized: false,
    loading: false,
    savingConfig: false,
    error: '',
    configError: '',
    configLoaded: false,
    config: { ...DEFAULT_CONFIG },
    autoRefresh: true,
    lastLoaded: '',
    lastFastLoaded: '',
    lastFullLoaded: '',
    status: null,
    scenes: [],
    sceneAliases: [],
    replay: null,
    audioState: '',
    statsRoute: null,
    browserSources: null,
    sources: null,
    lastReplaySave: '',
    fastTimer: null,
    fullTimer: null,
    activeTab: 'overview'
  };

  const PERMISSIONS = [
    'obs.view',
    'obs.scene.switch.safe',
    'obs.replay.save',
    'obs.audio.view',
    'obs.dashboard.config.edit'
  ];

  const TABS = [
    { id:'overview', label:'Übersicht' },
    { id:'scenes', label:'Szenen' },
    { id:'overlays', label:'Overlays' },
    { id:'audio', label:'Audio' },
    { id:'replay', label:'Replay' },
    { id:'config', label:'Config' }
  ];


  function dataOf(res){ return res && typeof res === 'object' && Object.prototype.hasOwnProperty.call(res, 'data') ? res.data : res; }
  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  function isOnline(){ return !!(state.status && state.status.obsConnected); }
  function isDetected(){ return !!(state.status && state.status.obsDetected); }
  function time(){ return new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }
  function sceneNameOf(item){ return String(item?.sceneName || item?.name || '').trim(); }
  function isInternalScene(name){ return String(name || '').trim().startsWith('_'); }
  function normalScenes(){ return state.scenes.filter(item => { const name = sceneNameOf(item); return name && (!state.config.hideInternalScenesOnMain || !isInternalScene(name)); }); }
  function internalScenes(){ return state.scenes.filter(item => isInternalScene(sceneNameOf(item))); }
  function fastSeconds(){ return Math.round(Number(state.config.fastRefreshMs || DEFAULT_CONFIG.fastRefreshMs) / 1000); }
  function fullSeconds(){ return Math.round(Number(state.config.fullRefreshMs || DEFAULT_CONFIG.fullRefreshMs) / 1000); }
  function clampNumber(value, min, max, fallback){ const n = Number(value); if (!Number.isFinite(n)) return fallback; return Math.min(max, Math.max(min, Math.round(n))); }

  function sanitizeLocalConfig(input = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...(input || {}) };
    cfg.autoRefreshEnabled = !!cfg.autoRefreshEnabled;
    cfg.fastRefreshMs = clampNumber(cfg.fastRefreshMs, 1000, 60000, DEFAULT_CONFIG.fastRefreshMs);
    cfg.fullRefreshMs = clampNumber(cfg.fullRefreshMs, 3000, 120000, DEFAULT_CONFIG.fullRefreshMs);
    if (cfg.fullRefreshMs < cfg.fastRefreshMs) cfg.fullRefreshMs = cfg.fastRefreshMs;
    cfg.showStatusLine = cfg.showStatusLine !== false;
    cfg.showPerformance = cfg.showPerformance !== false;
    cfg.showOverview = cfg.showOverview !== false;
    cfg.hideInternalScenesOnMain = cfg.hideInternalScenesOnMain !== false;
    return cfg;
  }

  function cleanRouteError(err, fallback = 'Route nicht erreichbar') {
    const raw = err && err.message ? err.message : String(err || fallback);
    if (/<!doctype|<html|cannot\s+(get|post)/i.test(raw)) {
      const m = raw.match(/Cannot\s+(GET|POST|PUT|DELETE)\s+([^<\s]+)/i);
      return m ? `Route fehlt: ${m[1].toUpperCase()} ${m[2]}` : fallback;
    }
    return raw;
  }

  async function optionalApi(path, fallback = null, options = {}){
    try { return { ok:true, data:dataOf(await CGN.api(path, options)) }; }
    catch (err) { return { ok:false, data:fallback, error: cleanRouteError(err) }; }
  }

  async function loadDashboardConfig() {
    const res = await optionalApi('/api/obs/dashboard/config', null);
    if (res.ok && res.data && res.data.config) {
      state.config = sanitizeLocalConfig(res.data.config);
      state.configLoaded = true;
      state.configError = '';
      state.autoRefresh = !!state.config.autoRefreshEnabled;
    } else {
      state.config = sanitizeLocalConfig(state.config);
      state.configError = res.error || 'OBS-Dashboard-Config nicht verfügbar. Lokale Standardwerte aktiv.';
    }
  }

  async function saveDashboardConfig(payload) {
    state.savingConfig = true;
    state.configError = '';
    render();
    const res = await optionalApi('/api/obs/dashboard/config', null, { method:'POST', body: JSON.stringify({ config: payload }) });
    state.savingConfig = false;
    if (!res.ok || !res.data || !res.data.config) {
      state.configError = res.error || 'Config konnte nicht gespeichert werden.';
      render();
      return;
    }
    state.config = sanitizeLocalConfig(res.data.config);
    state.autoRefresh = !!state.config.autoRefreshEnabled;
    resetRefreshTimers();
    await loadAll(false);
  }

  async function loadAll(loadConfigFirst = false){
    if (loadConfigFirst || !state.configLoaded) await loadDashboardConfig();
    state.loading = true;
    state.error = '';
    render();
    try {
      const [statusRes, scenesRes, replayRes, audioRes, statsRes, browserRes, sourcesRes] = await Promise.all([
        optionalApi('/api/obs/status', null),
        optionalApi('/api/obs/scenes', { scenes:[], aliases:[] }),
        optionalApi('/api/obs/replay/status', null),
        optionalApi('/api/obs/audio/state', ''),
        optionalApi('/api/obs/stats', null),
        optionalApi('/api/obs/browser-sources', null),
        optionalApi('/api/obs/sources', null)
      ]);

      if (statusRes.ok) state.status = statusRes.data || {};
      else {
        state.status = state.status || {};
        state.error = statusRes.error || 'OBS-Status konnte nicht geladen werden.';
      }

      if (scenesRes.ok) {
        const data = scenesRes.data || {};
        state.scenes = Array.isArray(data.scenes) ? data.scenes : [];
        state.sceneAliases = Array.isArray(data.aliases) ? data.aliases : [];
        if (data.currentProgramSceneName && state.status) state.status.currentProgramSceneName = data.currentProgramSceneName;
        if (data.currentPreviewSceneName && state.status) state.status.currentPreviewSceneName = data.currentPreviewSceneName;
      } else {
        state.scenes = [];
      }

      state.replay = replayRes.ok ? replayRes.data : null;
      state.audioState = audioRes.ok ? String(audioRes.data || '').trim() : (state.status?.audioBusy ? 'BUSY' : 'IDLE');
      state.statsRoute = statsRes.ok ? statsRes.data : null;
      state.browserSources = browserRes.ok ? browserRes.data : null;
      state.sources = sourcesRes.ok ? sourcesRes.data : null;
      state.lastLoaded = time();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'OBS-Daten konnten nicht geladen werden.');
    } finally {
      state.loading = false;
      render();
    }
  }

  async function loadFullSilent(){
    // Vollständige Daten aktualisieren, ohne den sichtbaren Bereich neu zu rendern.
    // Dadurch springt der Inhalt unter der Statusleiste nicht bei jedem Komplett-Refresh.
    state.error = '';
    try {
      const [statusRes, scenesRes, replayRes, audioRes, statsRes, browserRes, sourcesRes] = await Promise.all([
        optionalApi('/api/obs/status', null),
        optionalApi('/api/obs/scenes', { scenes:[], aliases:[] }),
        optionalApi('/api/obs/replay/status', null),
        optionalApi('/api/obs/audio/state', ''),
        optionalApi('/api/obs/stats', null),
        optionalApi('/api/obs/browser-sources', null),
        optionalApi('/api/obs/sources', null)
      ]);

      if (statusRes.ok) state.status = statusRes.data || {};
      else state.error = statusRes.error || 'OBS-Status konnte nicht geladen werden.';

      if (scenesRes.ok) {
        const data = scenesRes.data || {};
        state.scenes = Array.isArray(data.scenes) ? data.scenes : [];
        state.sceneAliases = Array.isArray(data.aliases) ? data.aliases : [];
        if (data.currentProgramSceneName && state.status) state.status.currentProgramSceneName = data.currentProgramSceneName;
        if (data.currentPreviewSceneName && state.status) state.status.currentPreviewSceneName = data.currentPreviewSceneName;
      }

      state.replay = replayRes.ok ? replayRes.data : state.replay;
      state.audioState = audioRes.ok ? String(audioRes.data || '').trim() : (state.status?.audioBusy ? 'BUSY' : 'IDLE');
      state.statsRoute = statsRes.ok ? statsRes.data : state.statsRoute;
      state.browserSources = browserRes.ok ? browserRes.data : state.browserSources;
      state.sources = sourcesRes.ok ? sourcesRes.data : state.sources;
      state.lastLoaded = time();
      state.lastFullLoaded = state.lastLoaded;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'OBS-Daten konnten nicht geladen werden.');
    } finally {
      if (state.activeTab === 'overview') {
        updateFastView();
        updateOverviewCounters();
        updateErrorView();
      } else {
        render();
      }
    }
  }

  async function loadFast(){
    state.error = '';
    try {
      const [statusRes, replayRes, audioRes, statsRes] = await Promise.all([
        optionalApi('/api/obs/status', null),
        optionalApi('/api/obs/replay/status', null),
        optionalApi('/api/obs/audio/state', ''),
        optionalApi('/api/obs/stats', null)
      ]);
      if (statusRes.ok) state.status = statusRes.data || {};
      else state.error = statusRes.error || 'OBS-Status konnte nicht geladen werden.';
      state.replay = replayRes.ok ? replayRes.data : state.replay;
      state.audioState = audioRes.ok ? String(audioRes.data || '').trim() : (state.status?.audioBusy ? 'BUSY' : 'IDLE');
      state.statsRoute = statsRes.ok ? statsRes.data : state.statsRoute;
      state.lastLoaded = time();
      state.lastFastLoaded = state.lastLoaded;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'OBS-Schnellwerte konnten nicht geladen werden.');
    } finally {
      updateFastView();
    }
  }

  function updateFastView(){
    // Schnelle Refreshes aktualisieren nur Textwerte.
    // Kein komplettes root.innerHTML, sonst zuckt der untere Bereich.
    if (!root.querySelector('.obs-statusline')) {
      render();
      return;
    }

    const status = state.status || {};
    const replayActive = !!(replayObj() && (replayObj().replayBufferActive || replayObj().outputActive));
    const current = status.currentProgramSceneName || '—';
    const preview = status.currentPreviewSceneName || '—';
    const perf = buildPerf();
    const audioBusy = String(state.audioState || '').toUpperCase() === 'BUSY' || !!status.audioBusy;
    const streamActive = !!(status.streamActive || streamObj().outputActive);
    const recordActive = !!(status.recordActive || recordObj().outputActive);

    setText('[data-obs-live-status]', `OBS ${isOnline() ? 'Online' : (isDetected() ? 'Erkannt' : 'Offline')}`);
    setText('[data-obs-live-scene]', current);
    setText('[data-obs-live-cpu]', fmtPercent(perf.cpu));
    setText('[data-obs-live-ram]', fmtMb(perf.ram));
    setText('[data-obs-live-fps]', fmtFps(perf.fps));
    setText('[data-obs-live-frame]', fmtMs(perf.frameMs));
    setText('[data-obs-live-stream]', yesNo(streamActive));
    setText('[data-obs-live-record]', yesNo(recordActive));
    setText('[data-obs-live-drops]', `R:${fmtDrop(perf.renderDrops, perf.renderDropPct)} E:${fmtDrop(perf.encodeDrops, perf.encodeDropPct)} N:${fmtDrop(perf.networkDrops, perf.networkDropPct)}`);
    setText('[data-obs-live-updated]', state.lastLoaded || '—');

    const line = root.querySelector('.obs-statusline');
    if (line) {
      line.classList.toggle('online', isOnline());
      line.classList.toggle('offline', !isOnline());
    }

    setText('[data-obs-card-connection]', isOnline() ? 'Online' : 'Offline');
    setText('[data-obs-card-connection-note]', `Detected: ${status.obsDetected ? 'Aktiv' : 'Nein'} · Connected: ${status.obsConnected ? 'Ja' : 'Nein'}`);
    setText('[data-obs-card-scene]', current);
    setText('[data-obs-card-preview]', `Preview: ${preview}`);
    setText('[data-obs-card-replay]', replayActive ? 'An' : 'Aus');
    setText('[data-obs-card-audio]', audioBusy ? 'BUSY' : 'IDLE');
    setText('[data-obs-card-audio-note]', Array.isArray(status.audioActive) && status.audioActive.length ? status.audioActive.join(', ') : 'Kein aktiver Sound erkannt.');

    setText('[data-obs-perf-cpu]', fmtPercent(perf.cpu));
    setText('[data-obs-perf-ram]', fmtMb(perf.ram));
    setText('[data-obs-perf-fps]', fmtFps(perf.fps));
    setText('[data-obs-perf-frame]', fmtMs(perf.frameMs));
    setText('[data-obs-perf-bitrate]', Number.isFinite(Number(perf.bitrate)) ? `${fmtCompact(perf.bitrate)} kb/s` : '—');
    setText('[data-obs-perf-drops]', `R:${fmtDrop(perf.renderDrops, perf.renderDropPct)} · E:${fmtDrop(perf.encodeDrops, perf.encodeDropPct)} · N:${fmtDrop(perf.networkDrops, perf.networkDropPct)}`);

    root.querySelectorAll('#obsReplaySave').forEach(btn => { btn.disabled = !replayActive; });
  }

  function setText(selector, value){
    const el = root.querySelector(selector);
    if (el) el.textContent = String(value ?? '');
  }

  async function switchScene(sceneName){
    if (!sceneName) return;
    if (isInternalScene(sceneName)) {
      state.error = 'Interne _-Szenen werden auf der OBS-Hauptseite nicht geschaltet. Dafür später die Detailseite nutzen.';
      render();
      return;
    }
    try {
      await CGN.api('/api/obs/scene/switch', { method:'POST', body: JSON.stringify({ scene: sceneName }) });
      await loadAll();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'Szenenwechsel fehlgeschlagen.');
      render();
    }
  }

  async function saveReplay(){
    try {
      await CGN.api('/api/obs/replay/save', { method:'POST', body:'{}' });
      state.error = '';
      state.lastReplaySave = time();
      await loadAll();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'Replay konnte nicht gespeichert werden.');
      render();
    }
  }

  function aliasFor(sceneName){
    const found = state.sceneAliases.find(x => String(x.sceneName || '').toLowerCase() === String(sceneName || '').toLowerCase());
    return found ? found.alias : '';
  }

  function statsObj(){
    return (state.statsRoute && state.statsRoute.stats) || (state.status && state.status.stats) || null;
  }

  function streamObj(){
    return (state.statsRoute && state.statsRoute.stream) || {};
  }

  function recordObj(){
    return (state.statsRoute && state.statsRoute.record) || {};
  }

  function replayObj(){
    return state.replay || (state.statsRoute && state.statsRoute.replay) || {};
  }

  function firstNumber(...values){
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  function fmtNumber(value, decimals = 0){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(n);
  }

  function fmtCompact(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat('de-DE', { notation:'compact', maximumFractionDigits:1 }).format(n);
  }

  function fmtPercent(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return `${fmtNumber(n, n < 10 ? 1 : 0)}%`;
  }

  function calcPercent(part, total){
    const p = Number(part);
    const t = Number(total);
    if (!Number.isFinite(p) || !Number.isFinite(t) || t <= 0) return null;
    return (p / t) * 100;
  }

  function fmtDrop(value, percent){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    const base = fmtCompact(n);
    const p = Number(percent);
    if (!Number.isFinite(p)) return base;
    const decimals = p > 0 && p < 1 ? 2 : 1;
    return `${base} (${fmtNumber(p, decimals)}%)`;
  }

  function fmtMs(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return `${fmtNumber(n, n < 10 ? 1 : 0)} ms`;
  }

  function fmtMb(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return `${fmtNumber(n, n < 1024 ? 0 : 1)} MB`;
  }

  function fmtGb(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return `${fmtNumber(n, n < 100 ? 1 : 0)} GB`;
  }

  function fmtFps(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return fmtNumber(n, n % 1 === 0 ? 0 : 1);
  }

  function buildPerf(){
    const s = statsObj() || {};
    const stream = streamObj();
    const cpu = firstNumber(s.cpuUsage, s.cpu_usage);
    const ram = firstNumber(s.memoryUsage, s.memory_usage);
    const disk = firstNumber(s.availableDiskSpace, s.available_disk_space);
    const fps = firstNumber(s.activeFps, s.activeFPS, s.fps);
    const frameMs = firstNumber(s.averageFrameRenderTime, s.average_frame_render_time);
    const renderDrops = firstNumber(s.renderSkippedFrames, s.renderSkippedFrameCount, s.render_skipped_frames);
    const renderTotal = firstNumber(s.renderTotalFrames, s.renderTotalFrameCount, s.render_total_frames);
    const encodeDrops = firstNumber(s.outputSkippedFrames, s.outputSkippedFrameCount, s.output_skipped_frames);
    const encodeTotal = firstNumber(s.outputTotalFrames, s.outputTotalFrameCount, s.output_total_frames);
    const networkDrops = firstNumber(stream.outputSkippedFrames, stream.droppedFrames, stream.networkDroppedFrames);
    const networkTotal = firstNumber(stream.outputTotalFrames, stream.totalFrames, stream.output_total_frames);
    const bitrate = firstNumber(stream.outputBitrate, stream.bitrate, s.outputBitrate, s.bitrate);
    return {
      cpu, ram, disk, fps, frameMs,
      renderDrops, renderTotal, renderDropPct: calcPercent(renderDrops, renderTotal),
      encodeDrops, encodeTotal, encodeDropPct: calcPercent(encodeDrops, encodeTotal),
      networkDrops, networkTotal, networkDropPct: calcPercent(networkDrops, networkTotal),
      bitrate
    };
  }

  function yesNo(active, yes='Aktiv', no='Inaktiv'){
    return active ? yes : no;
  }

  function render(){
    const status = state.status || {};
    const replayActive = !!(replayObj() && (replayObj().replayBufferActive || replayObj().outputActive));
    const current = status.currentProgramSceneName || '—';
    const preview = status.currentPreviewSceneName || '—';
    const normal = normalScenes();
    const internal = internalScenes();
    const browserCount = Number(state.browserSources?.count ?? (Array.isArray(state.browserSources?.browserSources) ? state.browserSources.browserSources.length : NaN));
    const sourceCount = Array.isArray(state.sources?.inputs) ? state.sources.inputs.length : null;
    const perf = buildPerf();
    const audioBusy = String(state.audioState || '').toUpperCase() === 'BUSY' || !!status.audioBusy;
    const streamActive = !!(status.streamActive || streamObj().outputActive);
    const recordActive = !!(status.recordActive || recordObj().outputActive);

    root.innerHTML = `
      ${renderTabNav()}

      ${state.config.showStatusLine ? renderStatusLine(current, perf, streamActive, recordActive) : ''}

      ${state.error ? `<div class="obs-error">${esc(state.error)}</div>` : ''}
      ${state.configError ? `<div class="obs-error obs-warn">${esc(state.configError)}</div>` : ''}

      ${renderActivePanel({ status, replayActive, current, preview, normal, internal, browserCount, sourceCount, perf, audioBusy, streamActive, recordActive })}
    `;

    bindCommonEvents();
  }

  function renderTabNav(){
    return `<div class="obs-tabs" role="tablist">${TABS.map(tab => `<button type="button" class="obs-tab ${state.activeTab === tab.id ? 'active' : ''}" data-obs-tab="${esc(tab.id)}">${esc(tab.label)}</button>`).join('')}</div>`;
  }

  function renderStatusLine(current, perf, streamActive, recordActive){
    return `<div class="obs-statusline ${isOnline() ? 'online' : 'offline'}">
      <span class="obs-dot"></span>
      <strong data-obs-live-status>OBS ${isOnline() ? 'Online' : (isDetected() ? 'Erkannt' : 'Offline')}</strong>
      <span>Szene: <b data-obs-live-scene>${esc(current)}</b></span>
      <span>CPU <b data-obs-live-cpu>${esc(fmtPercent(perf.cpu))}</b></span>
      <span>RAM <b data-obs-live-ram>${esc(fmtMb(perf.ram))}</b></span>
      <span>FPS <b data-obs-live-fps>${esc(fmtFps(perf.fps))}</b></span>
      <span>Frame <b data-obs-live-frame>${esc(fmtMs(perf.frameMs))}</b></span>
      <span>Stream <b data-obs-live-stream>${esc(yesNo(streamActive))}</b></span>
      <span>Aufnahme <b data-obs-live-record>${esc(yesNo(recordActive))}</b></span>
      <span>Drops <b data-obs-live-drops>R:${esc(fmtDrop(perf.renderDrops, perf.renderDropPct))} E:${esc(fmtDrop(perf.encodeDrops, perf.encodeDropPct))} N:${esc(fmtDrop(perf.networkDrops, perf.networkDropPct))}</b></span>
      <span class="obs-status-actions">
        <label class="obs-check obs-status-check"><input id="obsAutoRefreshStatus" type="checkbox" ${state.autoRefresh ? 'checked' : ''}> Auto-Refresh</label>
        <span>Schnell: ${fastSeconds()}s · Komplett: ${fullSeconds()}s</span>
        <span>Zuletzt: <b data-obs-live-updated>${esc(state.lastLoaded || '—')}</b></span>
      </span>
    </div>`;
  }

  function renderActivePanel(ctx){
    if (state.activeTab === 'scenes') return renderScenesPanel(ctx);
    if (state.activeTab === 'overlays') return renderOverlaysPanel(ctx);
    if (state.activeTab === 'audio') return renderAudioPanel(ctx);
    if (state.activeTab === 'replay') return renderReplayPanel(ctx);
    if (state.activeTab === 'config') return renderConfigPanel(ctx);
    return renderOverviewPanel(ctx);
  }

  function renderOverviewPanel(ctx){
    const { status, replayActive, current, preview, normal, internal, browserCount, sourceCount, perf, audioBusy } = ctx;
    return `<div class="obs-grid obs-panel obs-panel-overview">
      <div class="obs-card"><h3>OBS Verbindung</h3><div class="obs-metric ${isOnline() ? 'ok' : 'bad'}" data-obs-card-connection>${isOnline() ? 'Online' : 'Offline'}</div><div class="obs-note" data-obs-card-connection-note>Detected: ${status.obsDetected ? 'Aktiv' : 'Nein'} · Connected: ${status.obsConnected ? 'Ja' : 'Nein'}</div></div>
      <div class="obs-card"><h3>Aktuelle Szene</h3><div class="obs-metric obs-scene-name" data-obs-card-scene>${esc(current)}</div><div class="obs-note" data-obs-card-preview>Preview: ${esc(preview)}</div></div>
      <div class="obs-card"><h3>Replay Buffer</h3><div class="obs-metric ${replayActive ? 'ok' : 'bad'}" data-obs-card-replay>${replayActive ? 'An' : 'Aus'}</div><div class="obs-note">${state.lastReplaySave ? 'Letzter Save: ' + esc(state.lastReplaySave) : 'Save nur wenn Replay aktiv ist.'}</div></div>
      <div class="obs-card"><h3>Audio Busy</h3><div class="obs-metric ${audioBusy ? 'warn' : 'ok'}" data-obs-card-audio>${audioBusy ? 'BUSY' : 'IDLE'}</div><div class="obs-note" data-obs-card-audio-note>${Array.isArray(status.audioActive) && status.audioActive.length ? esc(status.audioActive.join(', ')) : 'Kein aktiver Sound erkannt.'}</div></div>
      ${state.config.showPerformance ? `<div class="obs-card obs-stat"><h3>Performance</h3><div class="obs-stat-grid">${renderPerfStats(perf)}</div></div>` : ''}
      ${state.config.showOverview ? `<div class="obs-card obs-stat"><h3>Übersicht</h3><div class="obs-stat-grid">${renderOverviewStats(normal, internal, browserCount, sourceCount)}</div></div>` : ''}
      <div class="obs-card full"><div class="obs-section-head"><div><h3>Schnellaktionen</h3><p>Control-Center für den normalen Streambetrieb. Weitere Einstellungen liegen in den Tabs.</p></div></div><div class="obs-actions"><button id="obsReloadNow">Status neu laden</button><button id="obsReplaySave" class="success" ${replayActive ? '' : 'disabled'}>Replay speichern</button></div></div>
    </div>`;
  }

  function renderScenesPanel(ctx){
    const { current, normal, internal } = ctx;
    return `<div class="obs-grid obs-panel obs-panel-scenes">
      <div class="obs-card full"><div class="obs-section-head"><div><h3>Szenen Schnellwechsel</h3><p>Nur normale Szenen ohne führenden Unterstrich. Interne Overlay-/Hilfsszenen werden hier bewusst ausgeblendet.</p></div><span class="pill">${normal.length} sichtbar · ${internal.length} intern</span></div><div class="obs-scene-grid">${renderSceneCards(current, normal)}</div></div>
      <div class="obs-card full"><h3>Interne Szenen</h3><p class="obs-note">${internal.length} interne Szene(n) mit führendem Unterstrich gefunden. Diese gehören später auf eine getrennte Detail-/Overlay-Seite und werden hier nicht geschaltet.</p></div>
    </div>`;
  }

  function renderOverlaysPanel(ctx){
    const list = Array.isArray(state.browserSources?.browserSources) ? state.browserSources.browserSources : (Array.isArray(state.browserSources?.sources) ? state.browserSources.sources : []);
    return `<div class="obs-grid obs-panel obs-panel-overlays">
      <div class="obs-card full"><div class="obs-section-head"><div><h3>Overlays / Browserquellen</h3><p>Übersicht vorhandener Browserquellen. Schalten/Bearbeiten kommt später mit Rechteprüfung.</p></div><span class="pill">${Number.isFinite(ctx.browserCount) ? ctx.browserCount : list.length} erkannt</span></div>${renderBrowserSourceList(list)}</div>
    </div>`;
  }

  function renderAudioPanel(ctx){
    const status = ctx.status || {};
    const active = Array.isArray(status.audioActive) ? status.audioActive : [];
    return `<div class="obs-grid obs-panel obs-panel-audio">
      <div class="obs-card"><h3>Audio Busy</h3><div class="obs-metric ${ctx.audioBusy ? 'warn' : 'ok'}">${ctx.audioBusy ? 'BUSY' : 'IDLE'}</div><div class="obs-note">Route: /obs/audio/state</div></div>
      <div class="obs-card"><h3>Aktive Audioquellen</h3><div class="obs-metric obs-scene-name">${active.length ? esc(active.length) : '0'}</div><div class="obs-note">${active.length ? esc(active.join(', ')) : 'Keine aktive Audioquelle gemeldet.'}</div></div>
      <div class="obs-card full"><h3>Audio-Steuerung</h3><p class="obs-note">Mute/Unmute und Lautstärke kommen auf diese Seite, sobald die Bedienlogik und Freigaben sauber festgelegt sind.</p></div>
    </div>`;
  }

  function renderReplayPanel(ctx){
    const replay = replayObj() || {};
    return `<div class="obs-grid obs-panel obs-panel-replay">
      <div class="obs-card"><h3>Replay Buffer</h3><div class="obs-metric ${ctx.replayActive ? 'ok' : 'bad'}">${ctx.replayActive ? 'An' : 'Aus'}</div><div class="obs-note">${state.lastReplaySave ? 'Letzter Save: ' + esc(state.lastReplaySave) : 'Noch kein Save über Dashboard.'}</div></div>
      <div class="obs-card"><h3>Status</h3><div class="obs-metric obs-scene-name">${esc(replay.outputState || replay.replayBufferState || '—')}</div><div class="obs-note">Route: /obs/replay/status</div></div>
      <div class="obs-card full"><div class="obs-section-head"><div><h3>Replay Aktionen</h3><p>Replay speichern ist für Mods/Freundin interessant. Start/Stop später nur mit gesonderter Freigabe.</p></div></div><div class="obs-actions"><button id="obsReplaySave" class="success" ${ctx.replayActive ? '' : 'disabled'}>Replay speichern</button><button id="obsReloadNow">Status neu laden</button></div></div>
    </div>`;
  }

  function renderConfigPanel(){
    return `<div class="obs-grid obs-panel obs-panel-config">
      <div class="obs-card full"><div class="obs-section-head"><div><h3>OBS-Dashboard Einstellungen</h3><p>Refresh-Zeiten und sichtbare Bereiche. Wird in <code>config/obs_dashboard.json</code> gespeichert.</p></div></div>${renderConfigEditor()}</div>
    </div>`;
  }

  function renderBrowserSourceList(list){
    if (!list.length) return '<div class="obs-empty">Keine Browserquellen geladen oder Route liefert keine Liste.</div>';
    return `<div class="obs-list">${list.map(item => {
      const name = item.inputName || item.sourceName || item.name || item.sceneItemName || 'Browserquelle';
      const url = item.url || item.inputSettings?.url || item.settings?.url || '';
      return `<div class="obs-list-row"><strong>${esc(name)}</strong><span>${url ? esc(url) : 'Keine URL im API-Ergebnis.'}</span></div>`;
    }).join('')}</div>`;
  }

  function bindCommonEvents(){
    root.querySelector('#obsReloadNow')?.addEventListener('click', loadAll);
    root.querySelector('#obsReplaySave')?.addEventListener('click', saveReplay);
    root.querySelectorAll('#obsAutoRefreshStatus, #obsAutoRefreshConfig').forEach(input => input.addEventListener('change', e => { state.autoRefresh = !!e.target.checked; state.config.autoRefreshEnabled = state.autoRefresh; resetRefreshTimers(); render(); }));
    root.querySelector('#obsSaveConfig')?.addEventListener('click', collectAndSaveConfig);
    root.querySelectorAll('[data-obs-switch-scene]').forEach(btn => btn.addEventListener('click', () => switchScene(btn.dataset.obsSwitchScene)));
    root.querySelectorAll('[data-obs-tab]').forEach(btn => btn.addEventListener('click', () => { state.activeTab = btn.dataset.obsTab || 'overview'; render(); }));
  }



  function renderConfigEditor(){
    const cfg = state.config;
    return `<div class="obs-config-grid">
      <label><span>Schnelle Werte alle</span><input id="obsFastRefreshMs" type="number" min="1000" max="60000" step="500" value="${esc(cfg.fastRefreshMs)}"><small>ms · Stats, Szene, Replay, Audio</small></label>
      <label><span>Komplett-Refresh alle</span><input id="obsFullRefreshMs" type="number" min="3000" max="120000" step="1000" value="${esc(cfg.fullRefreshMs)}"><small>ms · Szenen, Quellen, Browserquellen</small></label>
      <label class="obs-checkline"><input id="obsAutoRefreshConfig" type="checkbox" ${state.autoRefresh ? 'checked' : ''}> <span>Auto-Refresh aktivieren</span></label>
      <label class="obs-checkline"><input id="obsShowStatusLine" type="checkbox" ${cfg.showStatusLine ? 'checked' : ''}> <span>Statusleiste anzeigen</span></label>
      <label class="obs-checkline"><input id="obsShowPerformance" type="checkbox" ${cfg.showPerformance ? 'checked' : ''}> <span>Performance-Karte anzeigen</span></label>
      <label class="obs-checkline"><input id="obsShowOverview" type="checkbox" ${cfg.showOverview ? 'checked' : ''}> <span>Übersicht-Karte anzeigen</span></label>
      <label class="obs-checkline"><input id="obsHideInternalScenes" type="checkbox" ${cfg.hideInternalScenesOnMain ? 'checked' : ''}> <span>Interne _-Szenen auf Hauptseite ausblenden</span></label>
      <div class="obs-config-actions"><button id="obsSaveConfig" ${state.savingConfig ? 'disabled' : ''}>${state.savingConfig ? 'Speichere…' : 'Einstellungen speichern'}</button><span class="muted">Minimum schnell: 1s, empfohlen: 2s. Komplettlisten besser 10s+.</span></div>
    </div>`;
  }

  function collectAndSaveConfig(){
    saveDashboardConfig({
      autoRefreshEnabled: !!(root.querySelector('#obsAutoRefreshConfig')?.checked ?? state.autoRefresh),
      fastRefreshMs: Number(root.querySelector('#obsFastRefreshMs')?.value || DEFAULT_CONFIG.fastRefreshMs),
      fullRefreshMs: Number(root.querySelector('#obsFullRefreshMs')?.value || DEFAULT_CONFIG.fullRefreshMs),
      showStatusLine: !!root.querySelector('#obsShowStatusLine')?.checked,
      showPerformance: !!root.querySelector('#obsShowPerformance')?.checked,
      showOverview: !!root.querySelector('#obsShowOverview')?.checked,
      hideInternalScenesOnMain: !!root.querySelector('#obsHideInternalScenes')?.checked
    });
  }

  function renderPerfStats(perf){
    const rows = [
      ['CPU', fmtPercent(perf.cpu), '', 'data-obs-perf-cpu'],
      ['RAM', fmtMb(perf.ram), '', 'data-obs-perf-ram'],
      ['Freier Speicher', fmtGb(perf.disk), '', ''],
      ['FPS', fmtFps(perf.fps), '', 'data-obs-perf-fps'],
      ['Framezeit', fmtMs(perf.frameMs), '', 'data-obs-perf-frame'],
      ['Bitrate', Number.isFinite(Number(perf.bitrate)) ? `${fmtCompact(perf.bitrate)} kb/s` : '—', '', 'data-obs-perf-bitrate'],
      ['Drops', `R:${fmtDrop(perf.renderDrops, perf.renderDropPct)} · E:${fmtDrop(perf.encodeDrops, perf.encodeDropPct)} · N:${fmtDrop(perf.networkDrops, perf.networkDropPct)}`, 'wide', 'data-obs-perf-drops']
    ];
    return rows.map(([label, value, extra, attr]) => `<div class="${extra ? 'obs-stat-' + extra : ''}"><span>${esc(label)}</span><strong ${attr || ''}>${esc(value)}</strong></div>`).join('');
  }

  function renderOverviewStats(normal, internal, browserCount, sourceCount){
    return [
      ['Normale Szenen', fmtCompact(normal.length), 'data-obs-overview-normal'],
      ['Interne Szenen', fmtCompact(internal.length), 'data-obs-overview-internal'],
      ['Browserquellen', Number.isFinite(browserCount) ? fmtCompact(browserCount) : '—', 'data-obs-overview-browser'],
      ['Quellen gesamt', sourceCount !== null ? fmtCompact(sourceCount) : '—', 'data-obs-overview-sources'],
      ['Studio Mode', yesNo(!!state.status?.studioModeEnabled, 'An', 'Aus'), 'data-obs-overview-studio'],
      ['Stream', yesNo(!!state.status?.streamActive), 'data-obs-overview-stream'],
      ['Aufnahme', yesNo(!!state.status?.recordActive), 'data-obs-overview-record'],
      ['Replay', yesNo(!!(replayObj()?.replayBufferActive || replayObj()?.outputActive), 'An', 'Aus'), 'data-obs-overview-replay']
    ].map(([label, value, attr]) => `<div><span>${esc(label)}</span><strong ${attr || ''}>${esc(value)}</strong></div>`).join('');
  }

  function renderSceneCards(current, scenes){
    if (state.loading && !scenes.length) return '<div class="obs-empty">Lade Szenen…</div>';
    if (!scenes.length) return '<div class="obs-empty">Keine normalen Szenen geladen. Prüfe /obs/scenes oder OBS-Verbindung.</div>';
    return scenes.map(item => {
      const name = sceneNameOf(item);
      const active = String(name) === String(current);
      const alias = aliasFor(name);
      const kind = classifyScene(name);
      return `<button class="obs-scene-card ${active ? 'active' : ''} ${kind.className}" data-obs-switch-scene="${esc(name)}" ${active ? 'disabled' : ''}>
        <span class="obs-scene-title">${esc(name)}</span>
        <span class="obs-scene-meta">${alias ? 'Alias: ' + esc(alias) : kind.label}${active ? ' · aktuell aktiv' : ''}</span>
      </button>`;
    }).join('');
  }

  function classifyScene(name){
    const lower = String(name || '').toLowerCase();
    if (lower.includes('ende')) return { className:'is-ending', label:'Ende / vorsichtig' };
    if (lower.includes('pause') || lower.includes('brb')) return { className:'is-pause', label:'Pause / BRB' };
    if (lower.includes('start')) return { className:'is-start', label:'Startszene' };
    if (lower.includes('live') || lower.includes('gameplay')) return { className:'is-live', label:'Live-Szene' };
    return { className:'', label:'Normale Szene' };
  }

  function isObsModuleVisible(){
    if (!root || root.hidden || root.classList.contains('is-hidden')) return false;
    const style = window.getComputedStyle ? window.getComputedStyle(root) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    return true;
  }

  function resetRefreshTimers(){
    if (state.fastTimer) clearInterval(state.fastTimer);
    if (state.fullTimer) clearInterval(state.fullTimer);
    state.fastTimer = null;
    state.fullTimer = null;
    if (!state.autoRefresh) return;
    state.fastTimer = setInterval(() => {
      if (!state.autoRefresh) return;
      if (!isObsModuleVisible()) return;
      loadFast();
    }, state.config.fastRefreshMs);
    state.fullTimer = setInterval(() => {
      if (!state.autoRefresh) return;
      if (!isObsModuleVisible()) return;
      loadFullSilent();
    }, state.config.fullRefreshMs);
  }

  async function init(){
    if (state.initialized) {
      resetRefreshTimers();
      return;
    }
    state.initialized = true;
    render();
    await loadAll(true);
    resetRefreshTimers();
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail && event.detail.module === 'obs') {
      init();
      setTimeout(() => loadFast(), 150);
    }
  });

  window.OBSModule = { loadAll, init, permissions: PERMISSIONS };
  if (window.CGN?.activeModule === 'obs' || isObsModuleVisible()) init();
})();
