(function () {
  'use strict';

  const root = document.getElementById('twitchEventsModule');
  if (!root) return;

  const state = {
    loaded: false,
    loading: false,
    error: '',
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
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function prettyJson(value) {
    try { return JSON.stringify(value, null, 2); }
    catch (_) { return String(value ?? ''); }
  }

  function currentPreset() {
    return state.presets.find(p => p.kind === state.form.kind) || null;
  }

  function applyPreset(kind) {
    const preset = state.presets.find(p => p.kind === kind);
    state.form.kind = kind;
    state.activeKind = kind;
    if (preset && preset.defaults) {
      state.form = { ...state.form, ...preset.defaults, kind, dryRun: state.form.dryRun !== false };
    }
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

  async function loadAll(force = false) {
    if (state.loaded && !force) return render();
    state.loading = true;
    state.error = '';
    render();
    try {
      const data = await window.CGN.api('/api/twitch/alerts/debug/presets');
      state.presets = Array.isArray(data.presets) ? data.presets : [];
      if (!state.presets.some(p => p.kind === state.form.kind) && state.presets[0]) applyPreset(state.presets[0].kind);
      else applyPreset(state.form.kind);
      state.loaded = true;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
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
      const data = await window.CGN.api('/api/twitch/alerts/debug/eventsub', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
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
    if (field === 'message') {
      return `<label class="twitch-events-field twitch-events-field-wide"><span>${esc(label)}</span><textarea data-field="${field}" rows="3">${esc(value)}</textarea></label>`;
    }
    const type = ['bits', 'amount', 'total', 'viewers', 'cost'].includes(field) ? 'number' : 'text';
    const min = type === 'number' ? ' min="0" step="1"' : '';
    return `<label class="twitch-events-field"><span>${esc(label)}</span><input data-field="${field}" type="${type}" value="${esc(value)}"${min}></label>`;
  }

  function render() {
    const presetOptions = state.presets.map(p => `<option value="${esc(p.kind)}"${p.kind === state.form.kind ? ' selected' : ''}>${esc(p.label || p.kind)}</option>`).join('');
    const fields = FIELD_SETS[state.form.kind] || [];
    const result = state.result;
    const alertPayload = result?.normalizedAlertPayload || null;
    const alertResult = result?.alertResult || null;
    const buffer = result?.subMessageBuffer || null;

    root.innerHTML = `
      <div class="twitch-events-page">
        <section class="glass card span-12 twitch-events-hero">
          <div>
            <p class="twitch-events-kicker">Debug / Alert-System</p>
            <h2>Twitch Event Simulator</h2>
            <p class="muted">Simuliert Twitch-EventSub-Payloads über die echte Twitch-Alert-Bridge. Standard ist Dry-Run, damit keine Alerts versehentlich abgespielt werden.</p>
          </div>
          <div class="twitch-events-status">
            <span class="pill">Backend: /api/twitch/alerts/debug/eventsub</span>
            <span class="pill ${state.form.dryRun ? 'warn' : 'ok'}">${state.form.dryRun ? 'Dry-Run aktiv' : 'Live-Test aktiv'}</span>
          </div>
        </section>

        ${state.error ? `<section class="glass card span-12 twitch-events-error">${esc(state.error)}</section>` : ''}

        <section class="glass card twitch-events-form-card">
          <div class="twitch-events-card-head">
            <div>
              <h3>Event bauen</h3>
              <p class="muted">Preset wählen, Werte anpassen, dann simulieren.</p>
            </div>
            <button id="twitchEventsReloadBtn" type="button">Presets neu laden</button>
          </div>

          <div class="twitch-events-form-grid">
            <label class="twitch-events-field twitch-events-field-wide"><span>Preset</span><select data-field="kind">${presetOptions}</select></label>
            ${fields.map(renderField).join('')}
            <label class="twitch-events-check twitch-events-field-wide"><input data-field="dryRun" type="checkbox" ${state.form.dryRun ? 'checked' : ''}> <span>Dry-Run: normalisieren, aber keinen Alert abspielen</span></label>
          </div>

          <div class="twitch-events-actions">
            <button id="twitchEventsSimulateBtn" type="button" ${state.busy || state.loading ? 'disabled' : ''}>${state.busy ? 'Simuliere...' : 'Event simulieren'}</button>
            <button id="twitchEventsResetBtn" type="button">Preset zurücksetzen</button>
          </div>
        </section>

        <section class="glass card twitch-events-result-card">
          <h3>Auswertung</h3>
          ${result ? `
            <div class="twitch-events-result-grid">
              <div><strong>Kind</strong><span>${esc(result.kind || '')}</span></div>
              <div><strong>EventSub</strong><span>${esc(result.subscriptionType || '')}</span></div>
              <div><strong>Dry-Run</strong><span>${result.dryRun ? 'Ja' : 'Nein'}</span></div>
              <div><strong>Alert</strong><span>${esc(alertResult?.data?.eventUid || alertResult?.reason || alertResult?.status || '')}</span></div>
            </div>
            <details open><summary>Normalized Alert Payload</summary><pre>${esc(prettyJson(alertPayload))}</pre></details>
            <details><summary>Alert Result</summary><pre>${esc(prettyJson(alertResult))}</pre></details>
            <details><summary>Sub-Puffer</summary><pre>${esc(prettyJson(buffer))}</pre></details>
            <details><summary>Komplette Antwort</summary><pre>${esc(prettyJson(result))}</pre></details>
          ` : `<p class="muted">Noch kein Event simuliert.</p>`}
        </section>
      </div>
    `;

    root.querySelector('[data-field="kind"]')?.addEventListener('change', event => {
      applyPreset(event.target.value);
      render();
    });
    root.querySelectorAll('input[data-field], textarea[data-field], select[data-field]').forEach(node => {
      if (node.dataset.field === 'kind') return;
      node.addEventListener('input', readForm);
      node.addEventListener('change', readForm);
    });
    root.querySelector('#twitchEventsReloadBtn')?.addEventListener('click', () => loadAll(true));
    root.querySelector('#twitchEventsSimulateBtn')?.addEventListener('click', simulate);
    root.querySelector('#twitchEventsResetBtn')?.addEventListener('click', () => {
      applyPreset(state.form.kind);
      state.result = null;
      render();
    });
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'twitch_events') loadAll();
  });

  window.TwitchEventsModule = { loadAll, render };
})();
