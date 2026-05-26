window.ChannelpointsReadonlySyncTab = (function(){
  'use strict';

  const UI_VERSION = '0.8.1';
  const UI_BUILD = 'dashboard-readonly-sync-tab';

  const api = {
    status: '/api/channelpoints/twitch/rewards-readonly/status',
    preview: '/api/channelpoints/twitch/rewards-readonly/preview',
    sync: '/api/channelpoints/twitch/sync',
    localRewards: '/api/channelpoints/rewards'
  };

  const state = {
    loaded:false,
    busy:false,
    error:'',
    notice:'',
    status:null,
    preview:null,
    sync:null,
    localRewards:null,
    lastAction:''
  };

  let injected = false;
  let observer = null;
  let injectTimer = null;

  function esc(value) {
    return window.CGN?.esc
      ? window.CGN.esc(value)
      : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function asArray(value) { return Array.isArray(value) ? value : []; }

  function pill(label, mode) {
    return `<span class="cp-pill ${esc(mode || 'neutral')}">${esc(label)}</span>`;
  }

  function apiCall(url, options) {
    if (window.CGN?.api) return window.CGN.api(url, options);
    const opts = options || {};
    const headers = { ...(opts.headers || {}) };
    if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    return fetch(url, { ...opts, headers }).then(async response => {
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw:text }; }
      if (!response.ok || data.ok === false) {
        const err = new Error(data.error || data.message || `HTTP ${response.status}`);
        err.data = data;
        throw err;
      }
      return data;
    });
  }

  function scheduleInject(delay) {
    clearTimeout(injectTimer);
    injectTimer = setTimeout(() => injectPanel(), delay || 80);
  }

  function panelRoot() {
    return document.getElementById('channelpointsModule');
  }

  function existingMainContainer() {
    const root = panelRoot();
    if (!root) return null;
    return root.querySelector('.cp-admin') || root;
  }

  function ensurePanelElement() {
    const root = panelRoot();
    const container = existingMainContainer();
    if (!root || !container) return null;

    let panel = root.querySelector('[data-cp-readonly-sync-panel]');
    if (panel) return panel;

    panel = document.createElement('section');
    panel.className = 'cp-panel cp-readonly-sync-panel';
    panel.setAttribute('data-cp-readonly-sync-panel', '1');

    const twitchPanel = container.querySelector('.cp-twitch-panel');
    if (twitchPanel && twitchPanel.parentNode) twitchPanel.parentNode.insertBefore(panel, twitchPanel);
    else container.appendChild(panel);
    return panel;
  }

  function rewardTitle(row) {
    return row?.title || row?.reward?.title || row?.name || row?.reward_key || row?.id || '-';
  }

  function rewardId(row) {
    return row?.id || row?.twitch_reward_id || row?.reward?.id || '';
  }

  function rewardCost(row) {
    return row?.cost ?? row?.reward?.cost ?? '';
  }

  function rewardEnabled(row) {
    const enabled = row?.is_enabled ?? row?.twitch_is_enabled ?? row?.reward?.is_enabled;
    if (enabled === true || enabled === 1 || enabled === '1') return true;
    if (enabled === false || enabled === 0 || enabled === '0') return false;
    return null;
  }

  function rewardLocalMatch(row) {
    return row?.localMatch || row?.local || row?.mapped || row?.matched || null;
  }

  function syncValue(data, key) {
    if (!data) return '';
    if (data[key] !== undefined && data[key] !== null) return data[key];
    if (data.stats && data.stats[key] !== undefined && data.stats[key] !== null) return data.stats[key];
    if (data.summary && data.summary[key] !== undefined && data.summary[key] !== null) return data.summary[key];
    if (data.sync && data.sync[key] !== undefined && data.sync[key] !== null) return data.sync[key];
    return '';
  }

  function renderRewardRows(rows) {
    const list = asArray(rows).slice(0, 12);
    if (!list.length) return '<div class="cp-empty">Noch keine Preview-Daten geladen.</div>';
    return `<div class="cp-readonly-sync-table">
      <div class="head"><span>Twitch-Reward</span><span>Kosten</span><span>Status</span><span>Mapping</span></div>
      ${list.map(row => {
        const enabled = rewardEnabled(row);
        const local = rewardLocalMatch(row);
        const mapped = local ? pill('lokal gemappt', 'ok') : (rewardId(row) ? pill('Twitch-ID vorhanden', 'neutral') : pill('ohne ID', 'warn'));
        return `<div class="row">
          <span><strong>${esc(rewardTitle(row))}</strong><small>${esc(rewardId(row))}</small></span>
          <span>${esc(rewardCost(row))}</span>
          <span>${enabled === true ? pill('Twitch aktiv', 'ok') : (enabled === false ? pill('Twitch aus', 'off') : pill('unbekannt', 'neutral'))}</span>
          <span>${mapped}</span>
        </div>`;
      }).join('')}
    </div>${asArray(rows).length > 12 ? `<small class="cp-muted-line">Zeige 12 von ${esc(asArray(rows).length)} gelesenen Twitch-Rewards.</small>` : ''}`;
  }

  function renderPanel() {
    const panel = ensurePanelElement();
    if (!panel) return;

    const status = state.status || {};
    const preview = state.preview || null;
    const sync = state.sync || null;
    const statusOk = status.ok === true;
    const previewOk = preview && preview.ok === true;
    const syncOk = sync && sync.ok === true;
    const rewardCount = preview?.rewardCount ?? status?.rewardCount ?? sync?.rewardCount ?? '';
    const localDbWrite = preview?.localDbWrite === true || sync?.localDbWrite === true;
    const twitchWrite = preview?.twitchWrite === true || sync?.twitchWrite === true;
    const rows = asArray(preview?.rewards || preview?.data || preview?.items || preview?.twitchRewards);

    panel.innerHTML = `<div class="cp-panel-head">
      <h3>Twitch Rewards Read-Only Sync</h3>
      <span>${pill(`UI ${UI_VERSION}`, 'neutral')} ${twitchWrite ? pill('Twitch Write aktiv', 'warn') : pill('kein Twitch-Write', 'ok')}</span>
    </div>
    <div class="cp-readonly-sync-grid">
      <div><strong>Status</strong><span>${statusOk ? 'Modul erreichbar' : 'noch nicht geladen'} · ${esc(status.moduleVersion || '-')} · ${esc(status.moduleBuild || '-')}</span></div>
      <div><strong>Preview</strong><span>${previewOk ? `${esc(rewardCount)} Twitch-Rewards gelesen` : 'nicht geladen'} · DB-Write: ${localDbWrite ? 'ja' : 'nein'}</span></div>
      <div><strong>Letzter Sync</strong><span>${syncOk ? `${esc(sync.rewardCount ?? rewardCount ?? '-')} Rewards verarbeitet` : 'noch nicht ausgeführt'}${syncOk ? ` · created ${esc(syncValue(sync, 'created') || 0)} · updated ${esc(syncValue(sync, 'updated') || 0)}` : ''}</span></div>
      <div><strong>Sicherheit</strong><span>GET/Read-Only gegen Twitch. Sync schreibt nur lokal in SQLite.</span></div>
    </div>
    <div class="cp-readonly-sync-actions">
      <button type="button" data-cp-ro-action="reload-status" ${state.busy ? 'disabled' : ''}>Status prüfen</button>
      <button type="button" data-cp-ro-action="preview" ${state.busy ? 'disabled' : ''}>Twitch Preview lesen</button>
      <button type="button" data-cp-ro-action="sync" ${state.busy ? 'disabled' : ''}>Lokal synchronisieren</button>
    </div>
    ${state.notice ? `<div class="cp-alert ok">${esc(state.notice)}</div>` : ''}
    ${state.error ? `<div class="cp-alert error">${esc(state.error)}</div>` : ''}
    ${state.busy ? '<div class="cp-loading">Read-Only-Sync läuft...</div>' : ''}
    ${renderRewardRows(rows)}
    <details class="cp-advanced-box cp-readonly-sync-details"><summary>Letzte API-Antwort</summary><pre>${esc(JSON.stringify(sync || preview || status || {}, null, 2))}</pre></details>`;

    wirePanel(panel);
  }

  function wirePanel(panel) {
    panel.querySelector('[data-cp-ro-action="reload-status"]')?.addEventListener('click', () => loadStatus(true));
    panel.querySelector('[data-cp-ro-action="preview"]')?.addEventListener('click', () => loadPreview());
    panel.querySelector('[data-cp-ro-action="sync"]')?.addEventListener('click', () => runSync());
  }

  async function loadStatus(manual) {
    try {
      state.busy = true;
      state.error = '';
      state.notice = manual ? 'Status wird geprüft...' : state.notice;
      renderPanel();
      state.status = await apiCall(api.status);
      state.notice = manual ? 'Status geprüft.' : '';
      state.loaded = true;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.busy = false;
      renderPanel();
    }
  }

  async function loadPreview() {
    try {
      state.busy = true;
      state.error = '';
      state.notice = 'Twitch-Preview wird read-only geladen...';
      renderPanel();
      state.preview = await apiCall(api.preview);
      state.notice = `Preview geladen: ${state.preview.rewardCount ?? asArray(state.preview.rewards).length ?? 0} Twitch-Rewards. Kein lokaler DB-Write.`;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.busy = false;
      renderPanel();
    }
  }

  async function runSync() {
    if (!window.confirm('Twitch-Rewards jetzt lokal synchronisieren?\n\nTwitch wird NICHT beschrieben. Es werden nur lokale Daten in SQLite aktualisiert.')) return;
    try {
      state.busy = true;
      state.error = '';
      state.notice = 'Lokaler Sync läuft...';
      renderPanel();
      state.sync = await apiCall(api.sync, { method:'POST', body:'{}' });
      state.notice = `Lokaler Sync abgeschlossen: ${state.sync.rewardCount ?? '-'} Rewards. Twitch-Write: ${state.sync.twitchWrite === true ? 'JA' : 'nein'}.`;
      if (window.ChannelpointsModule?.loadAll) await window.ChannelpointsModule.loadAll(true);
      scheduleInject(160);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.busy = false;
      renderPanel();
    }
  }

  function injectPanel() {
    const root = panelRoot();
    if (!root || root.hidden) return;
    renderPanel();
    if (!state.loaded && !state.busy) loadStatus(false);
    injected = true;
  }

  function startObserver() {
    const root = panelRoot();
    if (!root || observer) return;
    observer = new MutationObserver(() => {
      if (!root.hidden && !root.querySelector('[data-cp-readonly-sync-panel]')) scheduleInject(60);
    });
    observer.observe(root, { childList:true, subtree:false });
  }

  window.addEventListener('cgn:module-show', event => {
    if (event?.detail?.module !== 'channelpoints') return;
    startObserver();
    scheduleInject(160);
  });

  document.addEventListener('DOMContentLoaded', () => {
    startObserver();
    scheduleInject(250);
  });

  return { uiVersion:UI_VERSION, uiBuild:UI_BUILD, injectPanel, loadStatus, loadPreview, runSync, state };
})();
