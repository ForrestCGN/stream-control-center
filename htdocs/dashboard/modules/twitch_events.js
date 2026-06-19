(function () {
  'use strict';

  const root = document.getElementById('twitchEventsModule');
  if (!root) return;

  const state = {
    loaded: false,
    loading: false,
    error: '',
    notice: '',
    tab: 'hypetrain',
    presets: [],
    activeKind: 'follow',
    form: {
      kind: 'follow',
      user: 'TestFollower',
      display: 'TestFollower',
      bits: 100,
      message: '',
      tier: '1000',
      amount: 12,
      total: 1,
      viewers: 10,
      title: 'Test Reward',
      cost: 100,
      dryRun: true
    },
    hypetrain: null,
    hypetrainConfig: null,
    hypetrainBusy: false,
    hypetrainTestResult: null,
    hypetrainRecordMediaId: 0,
    result: null,
    busy: false
  };

  const FIELD_SETS = {
    follow: ['user', 'display'],
    bits: ['user', 'display', 'bits', 'message'],
    sub: ['user', 'display', 'tier'],
    resub: ['user', 'display', 'tier', 'amount', 'message'],
    giftSub: ['user', 'display', 'tier', 'total'],
    giftBomb: ['user', 'display', 'tier', 'total'],
    raid: ['user', 'display', 'viewers'],
    channelPoints: ['user', 'display', 'title', 'cost', 'message']
  };

  const LABELS = {
    user: 'Login',
    display: 'Displayname',
    bits: 'Bits',
    message: 'Nachricht / Input',
    tier: 'Tier',
    amount: 'Monate / Amount',
    total: 'Anzahl',
    viewers: 'Raid-Zuschauer',
    title: 'Reward-Titel',
    cost: 'Punkte'
  };

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function prettyJson(value) {
    try { return JSON.stringify(value, null, 2); }
    catch (_) { return String(value ?? ''); }
  }

  function boolText(value) { return value ? 'Ja' : 'Nein'; }
  function num(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }

  function currentPreset() { return state.presets.find(p => p.kind === state.form.kind) || null; }

  function applyPreset(kind) {
    const preset = state.presets.find(p => p.kind === kind);
    state.form.kind = kind;
    state.activeKind = kind;
    if (preset && preset.defaults) state.form = { ...state.form, ...preset.defaults, kind, dryRun: state.form.dryRun !== false };
  }

  function readForm() {
    const get = id => root.querySelector(`[data-field="${id}"]`);
    const kind = get('kind')?.value || state.form.kind || 'follow';
    state.form.kind = kind;
    for (const field of ['user', 'display', 'message', 'tier', 'title']) {
      const node = get(field);
      if (node) state.form[field] = node.value;
    }
    for (const field of ['bits', 'amount', 'total', 'viewers', 'cost']) {
      const node = get(field);
      if (node) state.form[field] = Number(node.value || 0);
    }
    state.form.dryRun = !!get('dryRun')?.checked;
  }

  function buildPayload() {
    readForm();
    const payload = { kind: state.form.kind, dryRun: !!state.form.dryRun };
    const fields = FIELD_SETS[state.form.kind] || [];
    for (const field of fields) {
      const value = state.form[field];
      if (value !== undefined && value !== null && value !== '') payload[field] = value;
    }
    return payload;
  }

  async function loadSimulatorPresets() {
    const data = await window.CGN.api('/api/twitch/alerts/debug/presets');
    state.presets = Array.isArray(data.presets) ? data.presets : [];
    if (!state.presets.some(p => p.kind === state.form.kind) && state.presets[0]) applyPreset(state.presets[0].kind);
    else applyPreset(state.form.kind);
  }

  async function loadHypetrain() {
    const data = await window.CGN.api('/api/twitch/events/hypetrain/config');
    state.hypetrainConfig = data.config || data.hypetrain?.config || {};
    state.hypetrain = data.hypetrain || null;
    const mediaId = Number(state.hypetrainConfig?.recordSound?.mediaId || 0);
    state.hypetrainRecordMediaId = Number.isFinite(mediaId) && mediaId > 0 ? mediaId : 0;
  }

  async function loadAll(force = false) {
    if (state.loaded && !force) return render();
    state.loading = true;
    state.error = '';
    render();
    try {
      await Promise.all([loadSimulatorPresets(), loadHypetrain()]);
      state.loaded = true;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function reloadHypetrain() {
    state.hypetrainBusy = true;
    state.error = '';
    render();
    try {
      await loadHypetrain();
      state.notice = 'Hype-Train-Status wurde aktualisiert.';
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.hypetrainBusy = false;
      render();
    }
  }

  function readHypetrainConfigFromDom() {
    const cfg = JSON.parse(JSON.stringify(state.hypetrainConfig || {}));
    const get = name => root.querySelector(`[data-hype-field="${name}"]`);
    cfg.enabled = !!get('enabled')?.checked;
    cfg.recordDetection = cfg.recordDetection || {};
    cfg.recordDetection.enabled = !!get('recordDetectionEnabled')?.checked;
    cfg.recordDetection.totalRecordEnabled = !!get('totalRecordEnabled')?.checked;
    cfg.recordDetection.levelRecordEnabled = !!get('levelRecordEnabled')?.checked;
    cfg.recordDetection.triggerOnlyOncePerTrain = !!get('triggerOnlyOncePerTrain')?.checked;
    cfg.recordSound = cfg.recordSound || {};
    cfg.recordSound.enabled = !!get('recordSoundEnabled')?.checked;
    const mediaFieldRoot = root.querySelector('[data-hype-media-field]');
    const mediaInputValue = get('recordSoundMediaId')?.value || '';
    const mediaDatasetValue = mediaFieldRoot?.dataset?.mediaId || '';
    const mediaStateValue = state.hypetrainRecordMediaId || 0;
    cfg.recordSound.mediaId = num(mediaInputValue || mediaDatasetValue || mediaStateValue || cfg.recordSound.mediaId, 0);
    state.hypetrainRecordMediaId = cfg.recordSound.mediaId;
    cfg.recordSound.label = get('recordSoundLabel')?.value || 'Hype-Train Rekord';
    cfg.recordSound.priority = num(get('recordSoundPriority')?.value, 1000);
    cfg.recordSound.volume = Math.max(0, Math.min(1, num(get('recordSoundVolume')?.value, 1)));
    cfg.recordSound.queueIfBusy = !!get('recordSoundQueueIfBusy')?.checked;
    cfg.recordSound.canInterrupt = !!get('recordSoundCanInterrupt')?.checked;
    cfg.recordSound.parallelAllowed = !!get('recordSoundParallelAllowed')?.checked;
    cfg.diary = cfg.diary || {};
    cfg.diary.enabled = !!get('diaryEnabled')?.checked;
    cfg.diary.writeOnEnd = !!get('diaryWriteOnEnd')?.checked;
    cfg.diary.systemUsername = get('diarySystemUsername')?.value || 'CGN-HypeTrain';
    cfg.texts = cfg.texts || {};
    cfg.texts.recordBroken = get('textRecordBroken')?.value || cfg.texts.recordBroken || '';
    cfg.texts.trainEnded = get('textTrainEnded')?.value || cfg.texts.trainEnded || '';
    cfg.texts.recordShort = get('textRecordShort')?.value || cfg.texts.recordShort || '';
    return cfg;
  }

  async function saveHypetrainConfig() {
    const cfg = readHypetrainConfigFromDom();
    state.hypetrainBusy = true;
    state.error = '';
    state.notice = '';
    render();
    try {
      const data = await window.CGN.api('/api/twitch/events/hypetrain/config', { method: 'POST', body: JSON.stringify({ hypetrain: cfg }) });
      state.hypetrainConfig = data.config || cfg;
      state.hypetrain = data.hypetrain || state.hypetrain;
      state.notice = 'Hype-Train-Konfiguration gespeichert.';
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.hypetrainBusy = false;
      render();
    }
  }

  async function runHypetrainTest() {
    state.hypetrainBusy = true;
    state.error = '';
    state.notice = '';
    state.hypetrainTestResult = null;
    render();
    try {
      const get = name => root.querySelector(`[data-hype-test="${name}"]`);
      const payload = {
        id: get('id')?.value || `dashboard_test_${Date.now()}`,
        allTimeHighLevel: num(get('oldLevel')?.value, 5),
        allTimeHighTotal: num(get('oldTotal')?.value, 1000),
        level: num(get('level')?.value, 6),
        total: num(get('total')?.value, 1500),
        goal: num(get('goal')?.value, 2000)
      };
      const data = await window.CGN.api('/api/twitch/events/hypetrain/test?confirm=1', { method: 'POST', body: JSON.stringify(payload) });
      state.hypetrainTestResult = data;
      state.hypetrain = data.hypetrain || state.hypetrain;
      state.notice = 'Synthetischer Hype-Train-Test ausgeführt.';
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.hypetrainBusy = false;
      render();
    }
  }

  async function simulate() {
    state.busy = true;
    state.error = '';
    state.result = null;
    render();
    try {
      const payload = buildPayload();
      const data = await window.CGN.api('/api/twitch/alerts/debug/eventsub', { method: 'POST', body: JSON.stringify(payload) });
      state.result = data;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.busy = false;
      render();
    }
  }

  function renderField(field) {
    const label = LABELS[field] || field;
    const value = state.form[field] ?? '';
    if (field === 'message') return `<label class="twitch-events-field twitch-events-field-wide"><span>${esc(label)}</span><textarea data-field="${field}" rows="3">${esc(value)}</textarea></label>`;
    const type = ['bits', 'amount', 'total', 'viewers', 'cost'].includes(field) ? 'number' : 'text';
    const min = type === 'number' ? ' min="0" step="1"' : '';
    return `<label class="twitch-events-field"><span>${esc(label)}</span><input data-field="${field}" type="${type}" value="${esc(value)}"${min}></label>`;
  }

  function renderStat(label, value) {
    return `<div class="twitch-events-stat"><strong>${esc(label)}</strong><span>${esc(value)}</span></div>`;
  }

  function renderHypetrain() {
    const cfg = state.hypetrainConfig || {};
    const recordDetection = cfg.recordDetection || {};
    const recordSound = cfg.recordSound || {};
    const diary = cfg.diary || {};
    const media = cfg.media || { moduleKey: 'twitch_events', categoryKey: 'hypetrain-record' };
    const texts = cfg.texts || {};
    const ht = state.hypetrain || {};
    const counters = ht.counters || {};
    const lastSound = ht.lastSoundResult || null;
    const lastDiary = ht.lastDiaryResult || null;
    const current = ht.current || null;
    const recent = Array.isArray(ht.recent) ? ht.recent : [];
    const records = Array.isArray(ht.recordBrokenEvents) ? ht.recordBrokenEvents : [];
    const selectedMediaId = num(state.hypetrainRecordMediaId || recordSound.mediaId || 0, 0);

    return `
      <div class="twitch-events-page hype-page">
        <section class="glass card span-12 twitch-events-hero">
          <div>
            <p class="twitch-events-kicker">Hype-Train / Rekord-System</p>
            <h2>Hype-Train Rekord-Sound & Tagebuch</h2>
            <p class="muted">Twitch liefert begin/progress/end. Dieses Modul erkennt daraus intern den Rekord, legt den Sound mit höchster Priorität ins Sound-System und schreibt das Ergebnis beim Ende ins Tagebuch.</p>
          </div>
          <div class="twitch-events-status">
            <span class="pill ${cfg.enabled !== false ? 'ok' : 'warn'}">System: ${cfg.enabled !== false ? 'aktiv' : 'aus'}</span>
            <span class="pill ${recordSound.mediaId ? 'ok' : 'warn'}">Sound: ${recordSound.mediaId ? `mediaId ${esc(recordSound.mediaId)}` : 'nicht gewählt'}</span>
            <span class="pill">Build: ${esc(ht.moduleBuild || '')}</span>
          </div>
        </section>

        <section class="glass card hype-config-card">
          <div class="twitch-events-card-head">
            <div><h3>Konfiguration</h3><p class="muted">Sound über Media-System auswählen oder direkt im Picker hochladen.</p></div>
            <button id="hypeReloadBtn" type="button" ${state.hypetrainBusy ? 'disabled' : ''}>Neu laden</button>
          </div>

          <div class="hype-switches">
            <label><input data-hype-field="enabled" type="checkbox" ${cfg.enabled !== false ? 'checked' : ''}> Hype-Train-System aktiv</label>
            <label><input data-hype-field="recordDetectionEnabled" type="checkbox" ${recordDetection.enabled !== false ? 'checked' : ''}> Rekord-Erkennung aktiv</label>
            <label><input data-hype-field="totalRecordEnabled" type="checkbox" ${recordDetection.totalRecordEnabled !== false ? 'checked' : ''}> Gesamt-Rekord erkennen</label>
            <label><input data-hype-field="levelRecordEnabled" type="checkbox" ${recordDetection.levelRecordEnabled !== false ? 'checked' : ''}> Level-Rekord erkennen</label>
            <label><input data-hype-field="triggerOnlyOncePerTrain" type="checkbox" ${recordDetection.triggerOnlyOncePerTrain !== false ? 'checked' : ''}> Sound nur 1× pro Train</label>
          </div>

          <h4>Rekord-Sound</h4>
          <div class="hype-form-grid">
            <label><span>Aktiv</span><input data-hype-field="recordSoundEnabled" type="checkbox" ${recordSound.enabled !== false ? 'checked' : ''}></label>
            <label><span>Label</span><input data-hype-field="recordSoundLabel" value="${esc(recordSound.label || 'Hype-Train Rekord')}"></label>
            <label><span>Priorität</span><input data-hype-field="recordSoundPriority" type="number" min="1" step="1" value="${esc(recordSound.priority || 1000)}"></label>
            <label><span>Lautstärke 0–1</span><input data-hype-field="recordSoundVolume" type="number" min="0" max="1" step="0.05" value="${esc(recordSound.volume ?? 1)}"></label>
            <label class="hype-check"><input data-hype-field="recordSoundQueueIfBusy" type="checkbox" ${recordSound.queueIfBusy !== false ? 'checked' : ''}> Einreihen wenn Sound läuft</label>
            <label class="hype-check"><input data-hype-field="recordSoundCanInterrupt" type="checkbox" ${recordSound.canInterrupt === true ? 'checked' : ''}> Aktuellen Sound unterbrechen</label>
            <label class="hype-check"><input data-hype-field="recordSoundParallelAllowed" type="checkbox" ${recordSound.parallelAllowed === true ? 'checked' : ''}> Parallel erlauben</label>
          </div>

          <div class="hype-media-field" data-hype-media-field data-media-field data-media-id="${esc(selectedMediaId || '')}" data-module-key="${esc(media.moduleKey || 'twitch_events')}" data-category-key="${esc(media.categoryKey || 'hypetrain-record')}" data-allowed-types="audio" data-title="Hype-Train Rekord-Sound auswählen">
            <input type="hidden" data-media-field-value data-hype-field="recordSoundMediaId" value="${esc(selectedMediaId || '')}">
          </div>

          <h4>Tagebuch</h4>
          <div class="hype-form-grid">
            <label class="hype-check"><input data-hype-field="diaryEnabled" type="checkbox" ${diary.enabled !== false ? 'checked' : ''}> Tagebuch aktiv</label>
            <label class="hype-check"><input data-hype-field="diaryWriteOnEnd" type="checkbox" ${diary.writeOnEnd !== false ? 'checked' : ''}> Bei Hype-Train-Ende schreiben</label>
            <label><span>Systemname</span><input data-hype-field="diarySystemUsername" value="${esc(diary.systemUsername || 'CGN-HypeTrain')}"></label>
          </div>

          <h4>Texte</h4>
          <div class="hype-text-grid">
            <label><span>Rekord-Text</span><textarea data-hype-field="textRecordBroken" rows="3">${esc(texts.recordBroken || '')}</textarea></label>
            <label><span>Ende-Tagebuchtext</span><textarea data-hype-field="textTrainEnded" rows="3">${esc(texts.trainEnded || '')}</textarea></label>
            <label><span>Kurztext Rekord</span><textarea data-hype-field="textRecordShort" rows="2">${esc(texts.recordShort || '')}</textarea></label>
          </div>

          <div class="twitch-events-actions">
            <button id="hypeSaveBtn" type="button" ${state.hypetrainBusy ? 'disabled' : ''}>Speichern</button>
          </div>
        </section>

        <section class="glass card hype-status-card">
          <h3>Status</h3>
          <div class="twitch-events-result-grid">
            ${renderStat('Begonnen', counters.started || 0)}
            ${renderStat('Progress', counters.progress || 0)}
            ${renderStat('Beendet', counters.ended || 0)}
            ${renderStat('Rekorde', counters.recordBroken || 0)}
            ${renderStat('Sound queued', counters.soundQueued || 0)}
            ${renderStat('Tagebuch', counters.diaryWritten || 0)}
          </div>
          <div class="hype-current">
            <h4>Aktueller Train</h4>
            ${current ? `<pre>${esc(prettyJson(current))}</pre>` : '<p class="muted">Aktuell kein Hype-Train im Runtime-State.</p>'}
          </div>
          <details><summary>Letzter Sound-Result</summary><pre>${esc(prettyJson(lastSound))}</pre></details>
          <details><summary>Letzter Tagebuch-Result</summary><pre>${esc(prettyJson(lastDiary))}</pre></details>
          <details><summary>Letzte Rekorde</summary><pre>${esc(prettyJson(records))}</pre></details>
          <details><summary>Recent Hype-Train Events</summary><pre>${esc(prettyJson(recent.slice(0, 8)))}</pre></details>
        </section>

        <section class="glass card span-12 hype-test-card">
          <h3>Synthetischer Test</h3>
          <p class="muted">Testet begin → progress → end über die Twitch-Events-Schicht. Achtung: Wenn ein Sound gewählt und aktiv ist, wird er wirklich über das Sound-System eingereiht.</p>
          <div class="hype-form-grid hype-test-grid">
            <label><span>Train-ID</span><input data-hype-test="id" value="dashboard_test_${Date.now()}"></label>
            <label><span>Alter Level-Rekord</span><input data-hype-test="oldLevel" type="number" value="5"></label>
            <label><span>Alter Gesamt-Rekord</span><input data-hype-test="oldTotal" type="number" value="1000"></label>
            <label><span>Neues Level</span><input data-hype-test="level" type="number" value="6"></label>
            <label><span>Neues Total</span><input data-hype-test="total" type="number" value="1500"></label>
            <label><span>Ziel</span><input data-hype-test="goal" type="number" value="2000"></label>
          </div>
          <div class="twitch-events-actions"><button id="hypeTestBtn" type="button" ${state.hypetrainBusy ? 'disabled' : ''}>Test ausführen</button></div>
          ${state.hypetrainTestResult ? `<details open><summary>Testergebnis</summary><pre>${esc(prettyJson(state.hypetrainTestResult))}</pre></details>` : ''}
        </section>
      </div>
    `;
  }

  function renderSimulator() {
    const presetOptions = state.presets.map(p => `<option value="${esc(p.kind)}"${p.kind === state.form.kind ? ' selected' : ''}>${esc(p.label || p.kind)}</option>`).join('');
    const fields = FIELD_SETS[state.form.kind] || [];
    const result = state.result;
    const alertPayload = result?.normalizedAlertPayload || null;
    const alertResult = result?.alertResult || null;
    const buffer = result?.subMessageBuffer || null;

    return `
      <div class="twitch-events-page">
        <section class="glass card span-12 twitch-events-hero">
          <div><p class="twitch-events-kicker">Debug / Alert-System</p><h2>Twitch Event Simulator</h2><p class="muted">Simuliert Twitch-EventSub-Payloads über die echte Twitch-Alert-Bridge. Standard ist Dry-Run.</p></div>
          <div class="twitch-events-status"><span class="pill">Backend: /api/twitch/alerts/debug/eventsub</span><span class="pill ${state.form.dryRun ? 'warn' : 'ok'}">${state.form.dryRun ? 'Dry-Run aktiv' : 'Live-Test aktiv'}</span></div>
        </section>
        <section class="glass card twitch-events-form-card">
          <div class="twitch-events-card-head"><div><h3>Event bauen</h3><p class="muted">Preset wählen, Werte anpassen, dann simulieren.</p></div><button id="twitchEventsReloadBtn" type="button">Presets neu laden</button></div>
          <div class="twitch-events-form-grid">
            <label class="twitch-events-field twitch-events-field-wide"><span>Preset</span><select data-field="kind">${presetOptions}</select></label>
            ${fields.map(renderField).join('')}
            <label class="twitch-events-check twitch-events-field-wide"><input data-field="dryRun" type="checkbox" ${state.form.dryRun ? 'checked' : ''}> <span>Dry-Run: normalisieren, aber keinen Alert abspielen</span></label>
          </div>
          <div class="twitch-events-actions"><button id="twitchEventsSimulateBtn" type="button" ${state.busy || state.loading ? 'disabled' : ''}>${state.busy ? 'Simuliere...' : 'Event simulieren'}</button><button id="twitchEventsResetBtn" type="button">Preset zurücksetzen</button></div>
        </section>
        <section class="glass card twitch-events-result-card">
          <h3>Auswertung</h3>
          ${result ? `<div class="twitch-events-result-grid">${renderStat('Kind', result.kind || '')}${renderStat('EventSub', result.subscriptionType || '')}${renderStat('Dry-Run', boolText(result.dryRun))}${renderStat('Alert', alertResult?.data?.eventUid || alertResult?.reason || alertResult?.status || '')}</div><details open><summary>Normalized Alert Payload</summary><pre>${esc(prettyJson(alertPayload))}</pre></details><details><summary>Alert Result</summary><pre>${esc(prettyJson(alertResult))}</pre></details><details><summary>Sub-Puffer</summary><pre>${esc(prettyJson(buffer))}</pre></details><details><summary>Komplette Antwort</summary><pre>${esc(prettyJson(result))}</pre></details>` : '<p class="muted">Noch kein Event simuliert.</p>'}
        </section>
      </div>`;
  }

  function bind() {
    root.querySelectorAll('[data-twitch-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.twitchTab || 'hypetrain'; render(); }));

    if (state.tab === 'hypetrain') {
      root.querySelector('#hypeReloadBtn')?.addEventListener('click', reloadHypetrain);
      root.querySelector('#hypeSaveBtn')?.addEventListener('click', saveHypetrainConfig);
      root.querySelector('#hypeTestBtn')?.addEventListener('click', runHypetrainTest);
      if (window.MediaField?.initAll) window.MediaField.initAll(root);
      root.querySelector('[data-hype-media-field]')?.addEventListener('media-field:change', event => {
        const mediaId = num(event.detail?.mediaId || event.target?.dataset?.mediaId || root.querySelector('[data-hype-field="recordSoundMediaId"]')?.value, 0);
        state.hypetrainRecordMediaId = mediaId;
        state.hypetrainConfig = state.hypetrainConfig || {};
        state.hypetrainConfig.recordSound = state.hypetrainConfig.recordSound || {};
        state.hypetrainConfig.recordSound.mediaId = mediaId;
      });
      return;
    }

    root.querySelector('[data-field="kind"]')?.addEventListener('change', event => { applyPreset(event.target.value); render(); });
    root.querySelectorAll('input[data-field], textarea[data-field], select[data-field]').forEach(node => {
      if (node.dataset.field === 'kind') return;
      node.addEventListener('input', readForm);
      node.addEventListener('change', readForm);
    });
    root.querySelector('#twitchEventsReloadBtn')?.addEventListener('click', () => loadAll(true));
    root.querySelector('#twitchEventsSimulateBtn')?.addEventListener('click', simulate);
    root.querySelector('#twitchEventsResetBtn')?.addEventListener('click', () => { applyPreset(state.form.kind); state.result = null; render(); });
  }

  function render() {
    root.innerHTML = `
      <div class="twitch-events-tabs">
        <button type="button" data-twitch-tab="hypetrain" class="${state.tab === 'hypetrain' ? 'active' : ''}">Hype-Train Rekord</button>
        <button type="button" data-twitch-tab="simulator" class="${state.tab === 'simulator' ? 'active' : ''}">Event Simulator</button>
      </div>
      ${state.error ? `<section class="glass card span-12 twitch-events-error">${esc(state.error)}</section>` : ''}
      ${state.notice ? `<section class="glass card span-12 twitch-events-notice">${esc(state.notice)}</section>` : ''}
      ${state.loading ? '<section class="glass card span-12"><p class="muted">Lade Twitch-Events…</p></section>' : (state.tab === 'hypetrain' ? renderHypetrain() : renderSimulator())}
    `;
    bind();
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'twitch_events') loadAll();
  });

  window.TwitchEventsModule = { loadAll, render };
})();
