window.LoyaltyGamesModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/games/status',
    config: '/api/loyalty/games/config',
    routes: '/api/loyalty/games/routes',
    sessions: '/api/loyalty/games/sessions?gameKey=wheel&limit=50',
    wheelStatus: '/api/loyalty/games/wheel/status',
    wheelConfig: '/api/loyalty/games/wheel/config',
    presets: '/api/loyalty/games/wheel/presets',
    spins: '/api/loyalty/games/wheel/spins?limit=50',
    giveawaysStatus: '/api/loyalty/giveaways/status',
    giveaways: '/api/loyalty/giveaways?limit=100',
    overlay: '/overlays/loyalty/wheel_overlay.html'
  };

  let root = null;
  let state = {
    loading: false,
    saving: false,
    error: '',
    message: '',
    status: null,
    config: null,
    routes: null,
    sessions: null,
    wheelStatus: null,
    wheelConfig: null,
    presets: null,
    spins: null,
    giveawaysStatus: null,
    giveaways: null,
    selectedPresetUid: '',
    selectedPreset: null,
    selectedGiveawayUid: '',
    selectedGiveaway: null,
    activeTab: 'overview'
  };

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.sessions)) return value.sessions;
    return [];
  }

  function fmtDate(value){
    if (!value) return '<span class="lg-muted">-</span>';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('de-DE') : '0';
  }

  function badge(value, okText = 'OK', failText = 'Aus'){
    return value
      ? `<span class="lg-badge lg-badge-ok">${esc(okText)}</span>`
      : `<span class="lg-badge lg-badge-off">${esc(failText)}</span>`;
  }

  function statusBadge(status){
    const clean = String(status || '').toLowerCase();
    if (['active', 'running', 'ok', 'open'].includes(clean)) return `<span class="lg-badge lg-badge-ok">${esc(status)}</span>`;
    if (['draft', 'paused', 'closed_for_entries'].includes(clean)) return `<span class="lg-badge lg-badge-warn">${esc(status)}</span>`;
    return `<span class="lg-badge lg-badge-off">${esc(status || '-')}</span>`;
  }

  function ensureLoyaltyMainSection(){
    if (!window.CGN) return;

    window.CGN.sections.loyalty = {
      label: 'Loyalty',
      icon: '🎟️',
      role: 'mod/supermod/streamer',
      description: 'Punkte, Giveaways, Spiele, Glücksrad, Presets und spätere Rewards.',
      items: ['loyalty_games']
    };

    const nav = document.querySelector('#mainNav .nav-main-block');
    if (nav && !nav.querySelector('[data-section="loyalty"]')) {
      const btn = document.createElement('button');
      btn.className = 'nav-main-item';
      btn.dataset.section = 'loyalty';
      btn.innerHTML = '<span class="nav-icon">🎟️</span><span class="nav-label"><strong>Loyalty</strong><small>Punkte, Giveaways, Spiele</small></span>';

      const communityBtn = nav.querySelector('[data-section="community"]');
      if (communityBtn) nav.insertBefore(btn, communityBtn);
      else nav.appendChild(btn);

      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        window.CGN.setActiveSection('loyalty');
      });
    }
  }

  function registerDashboardModule(){
    if (!window.CGN) return;
    ensureLoyaltyMainSection();

    window.CGN.modules.loyalty_games = {
      title: 'Loyalty Games',
      panelId: 'loyaltyGamesModule',
      group: 'loyalty',
      overlayLink: api.overlay,
      overlayLabel: 'Glücksrad-Overlay öffnen',
      reload(){ return window.LoyaltyGamesModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty_games = {
      label: 'Loyalty Games',
      icon: '🎡',
      enabled: true,
      description: 'Spiele, Glücksrad, Presets und Giveaways im Loyalty-System.'
    };

    const loyaltySection = window.CGN.sections?.loyalty;
    if (loyaltySection && Array.isArray(loyaltySection.items) && !loyaltySection.items.includes('loyalty_games')) {
      loyaltySection.items.push('loyalty_games');
    }

    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('loyalty_games')) {
      const loyaltyIdx = window.CGN.favorites.indexOf('loyalty');
      if (loyaltyIdx >= 0) window.CGN.favorites.splice(loyaltyIdx + 1, 0, 'loyalty_games');
    }

    window.SectionHomeModule?.render?.();
  }

  function apiUrl(path, params){
    const url = new URL(path, window.location.origin);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
    return `${url.pathname}${url.search}`;
  }

  async function apiPost(path, body){
    return window.CGN.api(path, {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  async function apiPut(path, body){
    return window.CGN.api(path, {
      method: 'PUT',
      body: JSON.stringify(body || {})
    });
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyGamesModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.wheelStatus && state.presets && state.giveaways) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.config).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.routes).catch(err => ({ ok:false, error:err.message, routes:[] })),
        window.CGN.api(api.sessions).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.wheelStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.wheelConfig).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.presets).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.spins).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawaysStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.giveaways).catch(err => ({ ok:false, error:err.message, rows:[] }))
      ]);

      const presetRows = rows(presets);
      let selectedPresetUid = state.selectedPresetUid;
      if (!selectedPresetUid || !presetRows.some(p => p.presetUid === selectedPresetUid)) {
        selectedPresetUid = presetRows[0]?.presetUid || '';
      }

      const giveawayRows = rows(giveaways);
      let selectedGiveawayUid = state.selectedGiveawayUid;
      if (!selectedGiveawayUid || !giveawayRows.some(g => g.giveawayUid === selectedGiveawayUid)) {
        selectedGiveawayUid = giveawayRows[0]?.giveawayUid || '';
      }

      state = { ...state, loading:false, error:'', status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, selectedPresetUid, selectedGiveawayUid };
      if (selectedPresetUid) await loadPreset(selectedPresetUid, false);
      if (selectedGiveawayUid) await loadGiveaway(selectedGiveawayUid, false);
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function loadPreset(presetUid, rerender = true){
    if (!presetUid) {
      state.selectedPresetUid = '';
      state.selectedPreset = null;
      if (rerender) render();
      return;
    }

    try {
      const data = await window.CGN.api(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}`);
      state.selectedPresetUid = presetUid;
      state.selectedPreset = data.preset || null;
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }

    if (rerender) render();
  }

  async function loadGiveaway(giveawayUid, rerender = true){
    if (!giveawayUid) {
      state.selectedGiveawayUid = '';
      state.selectedGiveaway = null;
      if (rerender) render();
      return;
    }

    try {
      const data = await window.CGN.api(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}`);
      state.selectedGiveawayUid = giveawayUid;
      state.selectedGiveaway = data.giveaway || null;
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    }

    if (rerender) render();
  }

  async function refreshPresets(selectUid){
    const [presets, spins] = await Promise.all([
      window.CGN.api(api.presets).catch(err => ({ ok:false, error:err.message, rows:[] })),
      window.CGN.api(api.spins).catch(err => ({ ok:false, error:err.message, rows:[] }))
    ]);
    state.presets = presets;
    state.spins = spins;
    if (selectUid) await loadPreset(selectUid, false);
    else if (state.selectedPresetUid) await loadPreset(state.selectedPresetUid, false);
  }

  async function refreshGiveaways(selectUid){
    const [giveawaysStatus, giveaways] = await Promise.all([
      window.CGN.api(api.giveawaysStatus).catch(err => ({ ok:false, error:err.message })),
      window.CGN.api(api.giveaways).catch(err => ({ ok:false, error:err.message, rows:[] }))
    ]);
    state.giveawaysStatus = giveawaysStatus;
    state.giveaways = giveaways;
    if (selectUid) await loadGiveaway(selectUid, false);
    else if (state.selectedGiveawayUid) await loadGiveaway(state.selectedGiveawayUid, false);
  }

  function setMessage(message){
    state.message = message || '';
    setTimeout(() => {
      if (state.message === message) {
        state.message = '';
        render();
      }
    }, 5000);
  }

  async function handleCreatePreset(form){
    const data = new FormData(form);
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/games/wheel/presets', {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        status: data.get('status') || 'draft',
        removeAfterWin: data.get('removeAfterWin') === 'on',
        createdBy: 'dashboard'
      });
      const uid = result.preset?.presetUid;
      await refreshPresets(uid);
      state.activeTab = 'presets';
      setMessage('Preset wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdatePreset(form){
    const presetUid = state.selectedPresetUid;
    if (!presetUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}`, {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        removeAfterWin: data.get('removeAfterWin') === 'on',
        actor: 'dashboard'
      });
      await refreshPresets(presetUid);
      setMessage('Preset-Einstellungen wurden gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleCreateField(form){
    const presetUid = state.selectedPresetUid;
    if (!presetUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields`, {
        label: data.get('label'),
        subLabel: data.get('subLabel'),
        weight: Number(data.get('weight') || 1),
        quantityTotal: Number(data.get('quantityTotal') || 1),
        rewardType: data.get('rewardType') || 'manual',
        rewardValue: data.get('rewardValue') || '',
        enabled: data.get('enabled') === 'on'
      });
      await refreshPresets(presetUid);
      setMessage('Feld wurde hinzugefügt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdateField(form){
    const presetUid = state.selectedPresetUid;
    const fieldUid = form.dataset.fieldUid;
    if (!presetUid || !fieldUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(fieldUid)}`, {
        label: data.get('label'),
        subLabel: data.get('subLabel'),
        weight: Number(data.get('weight') || 1),
        quantityTotal: Number(data.get('quantityTotal') || 1),
        rewardType: data.get('rewardType') || 'manual',
        rewardValue: data.get('rewardValue') || '',
        enabled: data.get('enabled') === 'on',
        sortOrder: Number(data.get('sortOrder') || 1)
      });
      await refreshPresets(presetUid);
      setMessage('Feld wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function presetAction(action, presetUid){
    if (!presetUid) return;
    let path = '';
    let confirmText = '';
    if (action === 'copy') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/copy`;
    } else if (action === 'activate') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/activate`;
    } else if (action === 'pause') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/pause`;
    } else if (action === 'finish') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/finish`;
      confirmText = 'Preset wirklich abschließen? Danach ist es read-only und muss bei Bedarf kopiert werden.';
    } else if (action === 'delete') {
      path = `/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/delete`;
      confirmText = 'Preset wirklich löschen? Es wird als gelöscht markiert.';
    }
    if (!path) return;
    if (confirmText && !window.confirm(confirmText)) return;

    state.saving = true; render();
    try {
      const body = action === 'copy' ? { name: `Kopie von ${state.selectedPreset?.name || 'Preset'}`, quantityMode: 'original', actor: 'dashboard' } : { actor: 'dashboard' };
      const result = await apiPost(path, body);
      const uid = result.preset?.presetUid || presetUid;
      await refreshPresets(uid);
      setMessage(action === 'copy' ? 'Preset wurde kopiert.' : 'Preset wurde aktualisiert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function deleteField(fieldUid){
    const presetUid = state.selectedPresetUid;
    if (!presetUid || !fieldUid) return;
    if (!window.confirm('Feld wirklich deaktivieren/löschen?')) return;

    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(fieldUid)}/delete`, { actor: 'dashboard' });
      await refreshPresets(presetUid);
      setMessage('Feld wurde deaktiviert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function startPresetSpin(presetUid){
    if (!presetUid) return;
    state.saving = true; render();
    try {
      const result = await window.CGN.api(apiUrl('/api/loyalty/games/wheel/spin', {
        presetUid,
        login: 'dashboard',
        displayName: 'Dashboard',
        source: 'dashboard',
        duration: 5000
      }));
      await refreshPresets(presetUid);
      setMessage(`Drehung gestartet: ${result.selectedFieldLabel || 'Ergebnis folgt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function buildPrizeFromForm(data){
    const label = String(data.get('prizeLabel') || '').trim() || String(data.get('title') || 'Gewinn').trim() || 'Gewinn';
    return {
      label,
      description: String(data.get('prizeDescription') || '').trim(),
      quantityTotal: Number(data.get('prizeQuantity') || 1)
    };
  }

  function buildGiveawayPayload(form){
    const data = new FormData(form);
    const mode = String(data.get('mode') || 'classic_single');
    return {
      title: data.get('title'),
      description: data.get('description'),
      mode,
      wheelEnabled: mode.startsWith('wheel_'),
      wheelPresetUid: data.get('wheelPresetUid') || '',
      costAmount: Number(data.get('costAmount') || 0),
      maxTicketsPerUser: Number(data.get('maxTicketsPerUser') || 1),
      firstTicketFree: data.get('firstTicketFree') === 'on',
      subOnly: data.get('subOnly') === 'on',
      subscriberLuckMultiplier: Number(data.get('subscriberLuckMultiplier') || 1),
      winnerCount: Number(data.get('winnerCount') || 1),
      roundPolicy: {
        roundMode: data.get('roundMode') || 'single',
        allowNewEntriesBetweenRounds: data.get('allowNewEntriesBetweenRounds') === 'on',
        removeWinnerAfterRound: data.get('removeWinnerAfterRound') !== 'on' ? false : true,
        ticketCarryoverMode: data.get('ticketCarryoverMode') || 'none'
      },
      prizes: [buildPrizeFromForm(data)],
      actor: 'dashboard'
    };
  }

  async function handleCreateGiveaway(form){
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/giveaways', buildGiveawayPayload(form));
      const uid = result.giveaway?.giveawayUid;
      await refreshGiveaways(uid);
      state.activeTab = 'giveaways';
      setMessage('Giveaway wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function handleUpdateGiveaway(form){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}`, buildGiveawayPayload(form));
      await refreshGiveaways(giveawayUid);
      setMessage('Giveaway wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function giveawayAction(action, giveawayUid){
    if (!giveawayUid) return;
    let path = '';
    let confirmText = '';
    if (action === 'copy') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/copy`;
    else if (action === 'open') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/open`;
    else if (action === 'close') path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/close-entries`;
    else if (action === 'finish') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/finish`; confirmText = 'Giveaway wirklich beenden? Danach ist es read-only.'; }
    else if (action === 'cancel') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/cancel`; confirmText = 'Giveaway wirklich abbrechen?'; }
    else if (action === 'delete') { path = `/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/delete`; confirmText = 'Giveaway wirklich löschen? Es wird als gelöscht markiert.'; }
    if (!path) return;
    if (confirmText && !window.confirm(confirmText)) return;

    state.saving = true; render();
    try {
      const body = action === 'copy' ? { title: `Kopie von ${state.selectedGiveaway?.title || 'Giveaway'}`, actor: 'dashboard' } : { actor: 'dashboard' };
      const result = await apiPost(path, body);
      const uid = result.giveaway?.giveawayUid || giveawayUid;
      await refreshGiveaways(uid);
      setMessage(action === 'copy' ? 'Giveaway wurde kopiert.' : 'Giveaway wurde aktualisiert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderOverview(){
    const status = state.status || {};
    const diag = status.diagnostics || {};
    const wheel = state.wheelStatus || status.games?.wheel || {};
    const presetDiag = diag.presets || {};
    const giveawaysDiag = state.giveawaysStatus?.diagnostics?.counts || {};
    const db = diag.database || {};

    return `
      <div class="lg-grid lg-grid-4">
        <article class="lg-card">
          <span class="lg-card-label">Modul</span>
          <strong>${esc(status.module || 'loyalty_games')}</strong>
          <small>Version ${esc(status.moduleVersion || status.version || '-')}</small>
          ${badge(status.ok !== false && !status.lastError, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Glücksrad</span>
          <strong>${wheel.running ? 'Dreht gerade' : 'Bereit'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'} · ${fmtNumber(wheel.fields || 0)} Felder</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Presets</span>
          <strong>${fmtNumber(presetDiag.presets || rows(state.presets).length)}</strong>
          <small>active ${fmtNumber(presetDiag.active || 0)} · exhausted ${fmtNumber(presetDiag.exhausted || 0)}</small>
          ${badge(true, 'DB')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Giveaways</span>
          <strong>${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)}</strong>
          <small>draft ${fmtNumber(giveawaysDiag.draft || 0)} · open ${fmtNumber(giveawaysDiag.open || 0)}</small>
          ${badge(state.giveawaysStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
      </div>
      <div class="lg-panel">
        <h3>Status</h3>
        <div class="lg-kv">
          <span>Games Schema</span><strong>${esc(String(diag.schemaReady ?? '-'))}</strong>
          <span>Giveaways Schema</span><strong>${esc(String(state.giveawaysStatus?.diagnostics?.schemaReady ?? '-'))}</strong>
          <span>EventBus Games</span><strong>${diag.eventBus?.ready ? 'bereit' : 'broadcast_only'}</strong>
          <span>EventBus Giveaways</span><strong>${state.giveawaysStatus?.diagnostics?.eventBus?.ready ? 'bereit' : 'broadcast_only'}</strong>
          <span>DB</span><strong>${esc(db.adapter || db.dialect || '-')}</strong>
          <span>LastError</span><strong>${status.lastError ? esc(status.lastError) : '<span class="lg-muted">leer</span>'}</strong>
        </div>
      </div>
    `;
  }

  function renderWheel(){
    const wheel = state.wheelStatus || {};
    const active = wheel.activeSession || null;
    const last = wheel.lastResult || null;
    return `
      <div class="lg-grid lg-grid-3">
        <article class="lg-card">
          <span class="lg-card-label">Wheel Status</span>
          <strong>${wheel.running ? 'Running' : 'Idle'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'}</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Kosten</span>
          <strong>${wheel.costEnabled ? fmtNumber(wheel.costAmount) : '0'}</strong>
          <small>noch keine Punktebuchung</small>
          ${badge(!wheel.costEnabled, 'Kosten aus', 'Kosten an')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Overlay</span>
          <strong>Glücksrad</strong>
          <small><a href="${api.overlay}" target="_blank">Overlay öffnen</a></small>
          ${badge(true, 'WS')}
        </article>
      </div>
      <div class="lg-panel">
        <h3>Aktive Session</h3>
        ${active ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(active.sessionUid || '-')}</strong>
            <span>Spin</span><strong>${esc(active.spinUid || '-')}</strong>
            <span>Preset</span><strong>${esc(active.presetUid || '-')}</strong>
            <span>Gewinn</span><strong>${esc(active.selectedFieldLabel || '-')}</strong>
            <span>Dauer</span><strong>${fmtNumber(active.durationMs)} ms</strong>
            <span>Ende</span><strong>${fmtDate(active.endsAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Keine aktive Session.</p>`}
      </div>
      <div class="lg-panel">
        <h3>Letztes Ergebnis</h3>
        ${last ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(last.sessionUid || '-')}</strong>
            <span>Spin</span><strong>${esc(last.spinUid || '-')}</strong>
            <span>Preset</span><strong>${esc(last.presetUid || '-')}</strong>
            <span>Label</span><strong>${esc(last.selectedFieldLabel || '-')}</strong>
            <span>Beendet</span><strong>${fmtDate(last.finishedAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Noch kein Ergebnis im Runtime-State vorhanden.</p>`}
      </div>
    `;
  }

  function renderPresets(){
    const presets = rows(state.presets);
    const selected = state.selectedPreset;
    const fields = rows(selected?.fields || []);
    const editable = !!selected?.editable;
    const isGiveawayLinked = selected?.presetType === 'giveaway_linked';

    return `
      <div class="lg-grid lg-editor-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <h3>Presets</h3>
            <button class="lg-btn" data-lg-preset-refresh>Aktualisieren</button>
          </div>
          <div class="lg-preset-list">
            ${presets.map(preset => `
              <button class="lg-preset-item ${preset.presetUid === state.selectedPresetUid ? 'is-active' : ''}" data-lg-select-preset="${esc(preset.presetUid)}">
                <span>
                  <strong>${esc(preset.name)}</strong>
                  <small>${esc(preset.presetType)} · ${esc(preset.presetUid)}</small>
                </span>
                ${statusBadge(preset.status)}
              </button>
            `).join('') || `<p class="lg-muted">Noch keine Presets gefunden.</p>`}
          </div>
        </div>

        <div class="lg-panel">
          <h3>Neues Standalone-Preset</h3>
          <form class="lg-form" data-lg-create-preset>
            <label>Name<input name="name" required placeholder="z. B. Rentner-Rad"></label>
            <label>Beschreibung<textarea name="description" rows="2" placeholder="Kurzbeschreibung"></textarea></label>
            <div class="lg-form-row">
              <label>Mindest-Slots<input name="minVisibleSlots" type="number" min="1" max="96" value="12"></label>
              <label>Status
                <select name="status">
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                </select>
              </label>
            </div>
            <label class="lg-check"><input name="removeAfterWin" type="checkbox" checked> Gewinnfeld nach Auslosung aus diesem Rad entfernen</label>
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Preset erstellen</button>
          </form>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>${selected ? esc(selected.name) : 'Kein Preset ausgewählt'}</h3>
            ${selected ? `<p class="lg-muted">${esc(selected.description || '')}</p>` : ''}
          </div>
          ${selected ? `<div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-preset-action="copy" data-preset-uid="${esc(selected.presetUid)}">Kopieren</button>
            ${selected.status === 'active' ? `<button class="lg-btn lg-btn-secondary" data-lg-start-spin="${esc(selected.presetUid)}">Drehen</button>` : ''}
            ${selected.status !== 'active' && selected.status !== 'finished' && selected.status !== 'deleted' ? `<button class="lg-btn" data-lg-preset-action="activate" data-preset-uid="${esc(selected.presetUid)}">Aktivieren</button>` : ''}
            ${selected.status === 'active' ? `<button class="lg-btn lg-btn-secondary" data-lg-preset-action="pause" data-preset-uid="${esc(selected.presetUid)}">Pausieren</button>` : ''}
            ${selected.status !== 'finished' && selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-preset-action="finish" data-preset-uid="${esc(selected.presetUid)}">Abschließen</button>` : ''}
            ${selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-preset-action="delete" data-preset-uid="${esc(selected.presetUid)}">Löschen</button>` : ''}
          </div>` : ''}
        </div>

        ${selected ? `
          <div class="lg-kv lg-kv-compact">
            <span>Status</span><strong>${statusBadge(selected.status)}</strong>
            <span>Typ</span><strong>${esc(selected.presetType)}</strong>
            <span>Lifecycle</span><strong>${esc(selected.lifecycleOwner || '-')}</strong>
            <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein, nur kopieren/anzeigen'}</strong>
            <span>Mindest-Slots</span><strong>${fmtNumber(selected.minVisibleSlots)}</strong>
            <span>Gewinn entfernen</span><strong>${selected.settings?.removeAfterWin === false ? 'Nein' : 'Ja'}</strong>
            <span>Felder</span><strong>${fmtNumber(fields.length)}</strong>
          </div>
          ${editable ? `
            <form class="lg-form lg-preset-settings-form" data-lg-update-preset>
              <div class="lg-form-row">
                <label>Name<input name="name" value="${esc(selected.name || '')}" required></label>
                <label>Mindest-Slots<input name="minVisibleSlots" type="number" min="1" max="96" value="${esc(selected.minVisibleSlots || 12)}"></label>
              </div>
              <label>Beschreibung<textarea name="description" rows="2">${esc(selected.description || '')}</textarea></label>
              <label class="lg-check"><input name="removeAfterWin" type="checkbox" ${selected.settings?.removeAfterWin === false ? '' : 'checked'}> Gewinnfeld nach Auslosung aus diesem Rad entfernen</label>
              <button class="lg-btn" type="submit">Preset-Einstellungen speichern</button>
            </form>
          ` : ''}
          ${isGiveawayLinked ? `<p class="lg-warning">Dieses Preset gehört zu einem Giveaway. Bearbeitung nur über den Giveaway-Editor.</p>` : ''}
          ${!editable ? `<p class="lg-warning">Dieses Preset ist nicht direkt bearbeitbar. Änderungen bitte über „Kopieren“ als neues Preset anlegen.</p>` : ''}
        ` : `<p class="lg-muted">Wähle links ein Preset aus.</p>`}
      </div>

      ${selected ? renderFieldsEditor(selected, fields, editable) : ''}
    `;
  }

  function renderFieldsEditor(selected, fields, editable){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <h3>Felder / Gewinne</h3>
          <span class="lg-muted">${editable ? 'Bearbeitbar' : 'Read-only'}</span>
        </div>

        ${editable ? `
          <form class="lg-form lg-inline-form" data-lg-create-field>
            <input name="label" placeholder="Label" required>
            <input name="subLabel" placeholder="Subtext">
            <input name="weight" type="number" min="1" value="1" title="Gewicht">
            <input name="quantityTotal" type="number" min="1" value="1" title="Gesamtmenge">
            <select name="rewardType">
              <option value="manual">manual</option>
              <option value="points">points</option>
              <option value="none">none</option>
              <option value="bonus_spin">bonus_spin</option>
            </select>
            <input name="rewardValue" placeholder="Reward-Wert">
            <label class="lg-check"><input name="enabled" type="checkbox" checked> aktiv</label>
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Feld hinzufügen</button>
          </form>
        ` : ''}

        <div class="lg-field-list">
          ${fields.map(field => `
            <form class="lg-field-card" data-lg-update-field data-field-uid="${esc(field.fieldUid)}">
              <div class="lg-field-top">
                <strong>${esc(field.label)}</strong>
                <code>${esc(field.fieldUid)}</code>
                ${field.enabled ? badge(true, 'Aktiv') : badge(false, 'Aktiv', 'Aus')}
              </div>
              <div class="lg-field-grid">
                <label>Reihenfolge<input name="sortOrder" type="number" value="${esc(field.sortOrder || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Label<input name="label" value="${esc(field.label)}" ${editable ? '' : 'disabled'}></label>
                <label>Subtext<input name="subLabel" value="${esc(field.subLabel || field.sub || '')}" ${editable ? '' : 'disabled'}></label>
                <label>Gewicht<input name="weight" type="number" min="1" value="${esc(field.weight || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Gesamtmenge<input name="quantityTotal" type="number" min="1" value="${esc(field.quantityTotal || 1)}" ${editable ? '' : 'disabled'}></label>
                <label>Restmenge<input value="${esc(field.quantityRemaining ?? field.quantityTotal ?? 1)}" disabled></label>
                <label>Reward-Typ
                  <select name="rewardType" ${editable ? '' : 'disabled'}>
                    ${['manual','points','none','bonus_spin'].map(type => `<option value="${type}" ${field.rewardType === type ? 'selected' : ''}>${type}</option>`).join('')}
                  </select>
                </label>
                <label>Reward-Wert<input name="rewardValue" value="${esc(field.rewardValue || '')}" ${editable ? '' : 'disabled'}></label>
              </div>
              <div class="lg-field-actions">
                <label class="lg-check"><input name="enabled" type="checkbox" ${field.enabled ? 'checked' : ''} ${editable ? '' : 'disabled'}> aktiv</label>
                ${editable ? `<button class="lg-btn" type="submit">Speichern</button><button class="lg-btn lg-btn-danger" type="button" data-lg-delete-field="${esc(field.fieldUid)}">Deaktivieren</button>` : ''}
              </div>
            </form>
          `).join('') || `<p class="lg-muted">Noch keine Felder im Preset.</p>`}
        </div>
      </div>
    `;
  }

  function renderGiveaways(){
    const giveaways = rows(state.giveaways);
    const selected = state.selectedGiveaway;
    const editable = !!selected?.editable;
    const presets = rows(state.presets).filter(p => p.status === 'active' && p.presetType === 'standalone');

    return `
      <div class="lg-grid lg-editor-grid">
        <div class="lg-panel">
          <div class="lg-panel-head">
            <h3>Giveaways</h3>
            <button class="lg-btn" data-lg-giveaway-refresh>Aktualisieren</button>
          </div>
          <div class="lg-preset-list">
            ${giveaways.map(giveaway => `
              <button class="lg-preset-item ${giveaway.giveawayUid === state.selectedGiveawayUid ? 'is-active' : ''}" data-lg-select-giveaway="${esc(giveaway.giveawayUid)}">
                <span>
                  <strong>${esc(giveaway.title)}</strong>
                  <small>${esc(giveaway.mode)} · ${fmtDate(giveaway.createdAt)}</small>
                </span>
                ${statusBadge(giveaway.status)}
              </button>
            `).join('') || `<p class="lg-muted">Noch keine Giveaways gefunden.</p>`}
          </div>
        </div>

        <div class="lg-panel">
          <h3>Neues Giveaway</h3>
          <form class="lg-form" data-lg-create-giveaway>
            ${renderGiveawayFormFields(null, true, presets)}
            <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Giveaway erstellen</button>
          </form>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>${selected ? esc(selected.title) : 'Kein Giveaway ausgewählt'}</h3>
            ${selected ? `<p class="lg-muted">${esc(selected.description || '')}</p>` : ''}
          </div>
          ${selected ? `<div class="lg-actions">
            <button class="lg-btn lg-btn-secondary" data-lg-giveaway-action="copy" data-giveaway-uid="${esc(selected.giveawayUid)}">Kopieren</button>
            ${selected.status === 'draft' ? `<button class="lg-btn" data-lg-giveaway-action="open" data-giveaway-uid="${esc(selected.giveawayUid)}">Öffnen</button>` : ''}
            ${selected.status === 'open' ? `<button class="lg-btn lg-btn-secondary" data-lg-giveaway-action="close" data-giveaway-uid="${esc(selected.giveawayUid)}">Teilnahme schließen</button>` : ''}
            ${!['finished','cancelled','deleted'].includes(selected.status) ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="finish" data-giveaway-uid="${esc(selected.giveawayUid)}">Beenden</button>` : ''}
            ${!['finished','cancelled','deleted'].includes(selected.status) ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="cancel" data-giveaway-uid="${esc(selected.giveawayUid)}">Abbrechen</button>` : ''}
            ${selected.status !== 'deleted' ? `<button class="lg-btn lg-btn-danger" data-lg-giveaway-action="delete" data-giveaway-uid="${esc(selected.giveawayUid)}">Löschen</button>` : ''}
          </div>` : ''}
        </div>

        ${selected ? `
          <div class="lg-kv lg-kv-compact">
            <span>Status</span><strong>${statusBadge(selected.status)}</strong>
            <span>Modus</span><strong>${esc(selected.mode)}</strong>
            <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein, nur kopieren/anzeigen'}</strong>
            <span>Kosten</span><strong>${fmtNumber(selected.costAmount)}</strong>
            <span>Gewinner</span><strong>${fmtNumber(selected.winnerCount)}</strong>
            <span>Rad</span><strong>${selected.wheelEnabled ? 'Ja' : 'Nein'}</strong>
            <span>UID</span><strong><code>${esc(selected.giveawayUid)}</code></strong>
            <span>Erstellt</span><strong>${fmtDate(selected.createdAt)}</strong>
          </div>

          ${editable ? `
            <form class="lg-form lg-preset-settings-form" data-lg-update-giveaway>
              ${renderGiveawayFormFields(selected, true, presets)}
              <button class="lg-btn" type="submit">Giveaway speichern</button>
            </form>
          ` : `<p class="lg-warning">Dieses Giveaway ist read-only. Änderungen bitte über „Kopieren“ als neues Giveaway anlegen.</p>`}
        ` : `<p class="lg-muted">Wähle links ein Giveaway aus.</p>`}
      </div>

      ${selected ? renderGiveawayDetails(selected) : ''}
    `;
  }

  function renderGiveawayFormFields(giveaway, editable, presets){
    const mode = giveaway?.mode || 'classic_single';
    const wheelPresetUid = giveaway?.wheelPresetUid || '';
    const round = giveaway?.roundPolicy || {};
    const prize = rows(giveaway?.prizes || [])[0] || {};
    const removeWinner = round.removeWinnerAfterRound !== false;

    return `
      <label>Titel<input name="title" value="${esc(giveaway?.title || '')}" required ${editable ? '' : 'disabled'}></label>
      <label>Beschreibung<textarea name="description" rows="2" ${editable ? '' : 'disabled'}>${esc(giveaway?.description || '')}</textarea></label>
      <div class="lg-form-row">
        <label>Modus
          <select name="mode" ${editable ? '' : 'disabled'}>
            ${[
              ['classic_single','Classic Single'],
              ['classic_multi','Classic Multi'],
              ['wheel_single','Wheel Single'],
              ['wheel_multi','Wheel Multi']
            ].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <label>Wheel-Preset
          <select name="wheelPresetUid" ${editable ? '' : 'disabled'}>
            <option value="">kein Preset / kein Rad</option>
            ${presets.map(p => `<option value="${esc(p.presetUid)}" ${wheelPresetUid === p.presetUid ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="lg-form-row">
        <label>Kosten pro Ticket<input name="costAmount" type="number" min="0" value="${esc(giveaway?.costAmount ?? 0)}" ${editable ? '' : 'disabled'}></label>
        <label>Max Tickets/User<input name="maxTicketsPerUser" type="number" min="1" value="${esc(giveaway?.maxTicketsPerUser ?? 1)}" ${editable ? '' : 'disabled'}></label>
      </div>
      <div class="lg-form-row">
        <label>Gewinneranzahl<input name="winnerCount" type="number" min="1" value="${esc(giveaway?.winnerCount ?? 1)}" ${editable ? '' : 'disabled'}></label>
        <label>Sub-Luck Faktor<input name="subscriberLuckMultiplier" type="number" min="1" value="${esc(giveaway?.subscriberLuckMultiplier ?? 1)}" ${editable ? '' : 'disabled'}></label>
      </div>
      <div class="lg-form-row">
        <label>Rundenmodus
          <select name="roundMode" ${editable ? '' : 'disabled'}>
            ${[
              ['single','single'],
              ['new_round_new_entries','jede Runde neu'],
              ['reuse_previous_entries','bisherige Teilnehmer']
            ].map(([value,label]) => `<option value="${value}" ${(round.roundMode || 'single') === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
        <label>Ticket-Übernahme
          <select name="ticketCarryoverMode" ${editable ? '' : 'disabled'}>
            ${[
              ['none','none'],
              ['participants_only','Teilnehmer'],
              ['tickets','Tickets']
            ].map(([value,label]) => `<option value="${value}" ${(round.ticketCarryoverMode || 'none') === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="lg-form-row">
        <label>Gewinn-Label<input name="prizeLabel" value="${esc(prize.label || giveaway?.title || '')}" ${editable ? '' : 'disabled'}></label>
        <label>Gewinn-Menge<input name="prizeQuantity" type="number" min="1" value="${esc(prize.quantityTotal || giveaway?.winnerCount || 1)}" ${editable ? '' : 'disabled'}></label>
      </div>
      <label>Gewinn-Beschreibung<textarea name="prizeDescription" rows="2" ${editable ? '' : 'disabled'}>${esc(prize.description || '')}</textarea></label>
      <div class="lg-check-row">
        <label class="lg-check"><input name="firstTicketFree" type="checkbox" ${giveaway?.firstTicketFree ? 'checked' : ''} ${editable ? '' : 'disabled'}> erstes Ticket kostenlos</label>
        <label class="lg-check"><input name="subOnly" type="checkbox" ${giveaway?.subOnly ? 'checked' : ''} ${editable ? '' : 'disabled'}> nur Subs</label>
        <label class="lg-check"><input name="allowNewEntriesBetweenRounds" type="checkbox" ${round.allowNewEntriesBetweenRounds ? 'checked' : ''} ${editable ? '' : 'disabled'}> neue Lose zwischen Runden</label>
        <label class="lg-check"><input name="removeWinnerAfterRound" type="checkbox" ${removeWinner ? 'checked' : ''} ${editable ? '' : 'disabled'}> Gewinner nach Runde entfernen</label>
      </div>
    `;
  }

  function renderGiveawayDetails(giveaway){
    const rounds = rows(giveaway.rounds || []);
    const prizes = rows(giveaway.prizes || []);
    const events = rows(giveaway.events || []);
    return `
      <div class="lg-grid lg-grid-3">
        <div class="lg-panel">
          <h3>Gewinne</h3>
          <div class="lg-mini-list">
            ${prizes.map(prize => `
              <div class="lg-mini-row">
                <strong>${esc(prize.label)}</strong>
                <span>${fmtNumber(prize.quantityRemaining)} / ${fmtNumber(prize.quantityTotal)}</span>
              </div>
            `).join('') || `<p class="lg-muted">Keine Gewinne.</p>`}
          </div>
        </div>
        <div class="lg-panel">
          <h3>Runden</h3>
          <div class="lg-mini-list">
            ${rounds.map(round => `
              <div class="lg-mini-row">
                <strong>Runde ${fmtNumber(round.roundNumber)}</strong>
                <span>${statusBadge(round.status)}</span>
              </div>
            `).join('') || `<p class="lg-muted">Keine Runden.</p>`}
          </div>
        </div>
        <div class="lg-panel">
          <h3>Events</h3>
          <div class="lg-mini-list">
            ${events.slice(0, 8).map(event => `
              <div class="lg-mini-row">
                <strong>${esc(event.eventType)}</strong>
                <span>${fmtDate(event.createdAt)}</span>
              </div>
            `).join('') || `<p class="lg-muted">Keine Events.</p>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderSessions(){
    const list = rows(state.sessions);
    const spinRows = rows(state.spins);
    return `
      <div class="lg-panel">
        <h3>Letzte Sessions</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Gewinn</th><th>Dauer</th><th>Source</th><th>Session</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(row => `
                <tr>
                  <td>${fmtDate(row.createdAt || row.startedAt)}</td>
                  <td>${esc(row.displayName || row.login || '-')}</td>
                  <td>${esc(row.status || '-')}</td>
                  <td><strong>${esc(row.selectedFieldLabel || '-')}</strong></td>
                  <td>${fmtNumber(row.durationMs || 0)} ms</td>
                  <td>${esc(row.source || '-')}</td>
                  <td><code title="${esc(row.sessionUid || '')}">${esc(String(row.sessionUid || '').slice(0, 24))}</code></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Keine Sessions gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Dreh-Verlauf mit Preset</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Preset</th><th>Ergebnis</th><th>Gewicht</th><th>Spin</th>
              </tr>
            </thead>
            <tbody>
              ${spinRows.map(row => `
                <tr>
                  <td>${fmtDate(row.createdAt || row.startedAt)}</td>
                  <td>${esc(row.displayName || row.login || '-')}</td>
                  <td>${esc(row.status || '-')}</td>
                  <td><code>${esc(String(row.presetUid || '').slice(0, 22))}</code></td>
                  <td><strong>${esc(row.resultLabel || '-')}</strong></td>
                  <td>${fmtNumber(row.totalWeight || 0)}</td>
                  <td><code title="${esc(row.spinUid || '')}">${esc(String(row.spinUid || '').slice(0, 22))}</code></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Noch keine Preset-Drehungen gespeichert.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderNotes(){
    const routes = Array.isArray(state.routes?.routes) ? state.routes.routes : [];
    return `
      <div class="lg-panel">
        <h3>Hinweise</h3>
        <ul class="lg-notes">
          <li>LWG-4E ist der erste Giveaway-Dashboard-Editor.</li>
          <li>Noch keine Tickets, keine Gewinnerziehung und kein Rad-Claim.</li>
          <li>Abgeschlossene Giveaways sind read-only und sollen kopiert werden.</li>
          <li>Dashboard darf Regeln verwalten, aber später keine Gewinner oder Gewinne erzwingen.</li>
          <li>EventBus/Broadcast-Grundlagen sind vorbereitet.</li>
        </ul>
      </div>
      <div class="lg-panel">
        <h3>Games-Routen</h3>
        <div class="lg-route-list">
          ${routes.map(route => `<code>${esc(route)}</code>`).join('') || '<span class="lg-muted">Keine Routen geladen.</span>'}
        </div>
      </div>
    `;
  }

  function renderTabs(){
    const tabs = [
      ['overview', 'Übersicht'],
      ['wheel', 'Glücksrad'],
      ['presets', 'Presets'],
      ['giveaways', 'Giveaways'],
      ['history', 'Verlauf'],
      ['notes', 'Hinweise']
    ];
    return `
      <div class="lg-tabs">
        ${tabs.map(([id, label]) => `<button class="lg-tab ${state.activeTab === id ? 'is-active' : ''}" data-lg-tab="${id}">${label}</button>`).join('')}
      </div>
    `;
  }

  function renderActiveTab(){
    if (state.activeTab === 'wheel') return renderWheel();
    if (state.activeTab === 'presets') return renderPresets();
    if (state.activeTab === 'giveaways') return renderGiveaways();
    if (state.activeTab === 'history') return renderSessions();
    if (state.activeTab === 'notes') return renderNotes();
    return renderOverview();
  }

  function bindEvents(){
    root.querySelectorAll('[data-lg-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.lgTab || 'overview';
        render();
      });
    });

    root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));

    root.querySelectorAll('[data-lg-select-preset]').forEach(btn => {
      btn.addEventListener('click', () => loadPreset(btn.dataset.lgSelectPreset));
    });
    root.querySelectorAll('[data-lg-select-giveaway]').forEach(btn => {
      btn.addEventListener('click', () => loadGiveaway(btn.dataset.lgSelectGiveaway));
    });

    root.querySelector('[data-lg-preset-refresh]')?.addEventListener('click', async () => {
      await refreshPresets(state.selectedPresetUid);
      render();
    });
    root.querySelector('[data-lg-giveaway-refresh]')?.addEventListener('click', async () => {
      await refreshGiveaways(state.selectedGiveawayUid);
      render();
    });

    root.querySelector('[data-lg-create-preset]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreatePreset(ev.currentTarget);
    });
    root.querySelector('[data-lg-update-preset]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleUpdatePreset(ev.currentTarget);
    });
    root.querySelector('[data-lg-create-field]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreateField(ev.currentTarget);
    });
    root.querySelectorAll('[data-lg-update-field]').forEach(form => {
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        handleUpdateField(ev.currentTarget);
      });
    });
    root.querySelectorAll('[data-lg-delete-field]').forEach(btn => {
      btn.addEventListener('click', () => deleteField(btn.dataset.lgDeleteField));
    });
    root.querySelectorAll('[data-lg-preset-action]').forEach(btn => {
      btn.addEventListener('click', () => presetAction(btn.dataset.lgPresetAction, btn.dataset.presetUid));
    });
    root.querySelectorAll('[data-lg-start-spin]').forEach(btn => {
      btn.addEventListener('click', () => startPresetSpin(btn.dataset.lgStartSpin));
    });

    root.querySelector('[data-lg-create-giveaway]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreateGiveaway(ev.currentTarget);
    });
    root.querySelector('[data-lg-update-giveaway]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleUpdateGiveaway(ev.currentTarget);
    });
    root.querySelectorAll('[data-lg-giveaway-action]').forEach(btn => {
      btn.addEventListener('click', () => giveawayAction(btn.dataset.lgGiveawayAction, btn.dataset.giveawayUid));
    });
  }

  function render(){
    root = document.getElementById('loyaltyGamesModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = `<div class="lg-panel"><h2>Loyalty Games</h2><p class="lg-muted">Lade Daten...</p></div>`;
      return;
    }

    if (state.error) {
      root.innerHTML = `<div class="lg-panel lg-error"><h2>Loyalty Games</h2><p>${esc(state.error)}</p><button data-lg-reload>Neu laden</button></div>`;
      root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));
      return;
    }

    root.innerHTML = `
      <div class="lg-head">
        <div>
          <p class="lg-eyebrow">Loyalty / Spiele</p>
          <h2>Loyalty Games</h2>
          <p class="lg-subline">Glücksrad, Presets, Giveaways und Verlauf. Tickets/Gewinnerziehung kommen später.</p>
        </div>
        <div class="lg-actions">
          <a class="lg-btn lg-btn-secondary" href="${api.overlay}" target="_blank">Overlay öffnen</a>
          <button class="lg-btn" data-lg-reload ${state.saving ? 'disabled' : ''}>Reload</button>
        </div>
      </div>
      ${state.message ? `<div class="lg-toast">${esc(state.message)}</div>` : ''}
      ${state.saving ? `<div class="lg-toast lg-toast-warn">Speichere...</div>` : ''}
      ${renderTabs()}
      ${renderActiveTab()}
    `;

    bindEvents();
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'loyalty_games') loadAll();
  });

  registerDashboardModule();

  return {
    loadAll,
    render
  };
})();
