window.LoyaltyGiveawaysModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/giveaways/status',
    list: '/api/loyalty/giveaways?limit=250',
    detailBase: '/api/loyalty/giveaways',
    overlay: '/overlays/loyalty/wheel_overlay.html'
  };

  let root = null;
  let controlRefreshTimer = null;
  let state = {
    loading: false,
    saving: false,
    error: '',
    message: '',
    status: null,
    giveaways: null,
    selectedUid: '',
    selected: null,
    search: '',
    statusFilter: 'all',
    sortBy: 'active',
    sortDir: 'desc',
    modal: null
  };

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.giveaways)) return value.giveaways;
    if (Array.isArray(value?.data?.giveaways)) return value.data.giveaways;
    return [];
  }

  function fmtDate(value){
    if (!value) return '<span class="lgw-muted">-</span>';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('de-DE') : '0';
  }

  function norm(value){ return String(value || '').toLowerCase(); }

  function statusLabel(status){
    const labels = {
      draft: 'Entwurf',
      open: 'Offen',
      active: 'Aktiv',
      running: 'Läuft',
      paused: 'Pausiert',
      closed_for_entries: 'Teilnahme geschlossen',
      waiting_for_claim: 'Wartet auf Chat-Claim',
      waiting_for_wheel: 'Wartet auf Glücksrad',
      wheel_completed: 'Glücksrad abgeschlossen',
      finished: 'Beendet',
      cancelled: 'Abgebrochen',
      canceled: 'Abgebrochen',
      deleted: 'Gelöscht',
      exhausted: 'Aufgebraucht',
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      no_response: 'Nicht bestätigt',
      classic_single: 'Normales Giveaway',
      classic_multi: 'Normales Giveaway',
      wheel_single: 'Glücksrad-Giveaway',
      wheel_multi: 'Glücksrad-Giveaway'
    };
    const key = norm(status);
    return labels[key] || String(status || '-');
  }

  function statusBadge(status){
    const key = norm(status);
    let cls = 'lgw-badge-off';
    if (['open','active','running','confirmed','wheel_completed'].includes(key)) cls = 'lgw-badge-ok';
    else if (['draft','paused','closed_for_entries','waiting_for_claim','waiting_for_wheel','pending'].includes(key)) cls = 'lgw-badge-warn';
    return `<span class="lgw-badge ${cls}">${esc(statusLabel(status))}</span>`;
  }

  function apiUrl(path){ return `${api.detailBase}/${encodeURIComponent(path)}`; }

  async function apiPost(path, body){
    return window.CGN.api(path, { method: 'POST', body: JSON.stringify(body || {}) });
  }

  async function apiPut(path, body){
    return window.CGN.api(path, { method: 'PUT', body: JSON.stringify(body || {}) });
  }

  function isFinalStatus(status){
    return ['finished','cancelled','canceled','deleted','exhausted'].includes(norm(status));
  }

  function isActiveGiveaway(g){
    const s = norm(g?.status);
    return !!g && !['draft','finished','cancelled','canceled','deleted','exhausted'].includes(s);
  }

  function giveawayStartDate(g){
    return g?.startedAt || g?.openedAt || g?.startAt || g?.startsAt || g?.createdAt || '';
  }

  function giveawayWinnerText(g){
    const winners = rows(g?.winners || []);
    if (!winners.length && (g?.winnerDisplayName || g?.winnerLogin)) return g.winnerDisplayName || g.winnerLogin;
    if (!winners.length) return '-';
    return winners.map(w => w.userDisplayName || w.userLogin || '-').join(', ');
  }

  function getChatClaimSettings(giveaway){
    const snapshot = giveaway?.settingsSnapshot?.chatClaim || {};
    const direct = giveaway?.chatClaim || {};
    const meta = giveaway?.metadata?.chatClaim || {};
    const source = { ...snapshot, ...direct, ...meta };
    const timeoutSeconds = Number(source.timeoutSeconds || Math.ceil(Number(source.timeoutMs || 0) / 1000) || 60);
    return {
      enabled: source.enabled === true || source.enabled === 'true' || source.enabled === 1 || source.enabled === '1',
      mode: source.mode || 'any_message',
      timeoutSeconds: Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds : 60,
      timeoutMs: Number(source.timeoutMs || timeoutSeconds * 1000) || 60000,
      activateWheelAfterClaim: source.activateWheelAfterClaim !== false && source.activateWheelAfterClaim !== 'false' && source.activateWheelAfterClaim !== 0 && source.activateWheelAfterClaim !== '0'
    };
  }

  function isWheelGiveaway(g){
    return !!g && (g.wheelEnabled === true || norm(g.mode).startsWith('wheel_'));
  }

  function activeEntries(g){
    return rows(g?.entries || []).filter(e => norm(e.status) !== 'cancelled');
  }

  function winnerRows(g){
    return rows(g?.winners || []).filter(w => norm(w.status) !== 'cancelled');
  }

  function wheelPermissionRows(g){
    return rows(g?.wheelPermissions || []);
  }

  function pendingWheelPermissions(g){
    return wheelPermissionRows(g).filter(p => norm(p.status) === 'pending');
  }

  function usedWheelPermissions(g){
    return wheelPermissionRows(g).filter(p => ['used','claimed','done'].includes(norm(p.status)) || p.spinUid);
  }

  function winnerTarget(g){
    const n = Number(g?.winnerCount || 1);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function winnerProgressText(g){
    return `${fmtNumber(winnerRows(g).length)} / ${fmtNumber(winnerTarget(g))}`;
  }

  function openClaimWinners(g){
    return winnerRows(g).filter(w => {
      const claim = w?.metadata?.chatClaim || {};
      return claim && claim.enabled === true && norm(claim.status) === 'pending';
    });
  }

  function isClaimDone(w){
    const claim = w?.metadata?.chatClaim || {};
    const ws = norm(w?.status);
    return ['claim_confirmed','awarded','finished'].includes(ws) || norm(claim.status) === 'confirmed';
  }

  function latestWinner(g){
    const winners = winnerRows(g);
    return winners.length ? winners[winners.length - 1] : null;
  }

  function controlPhaseText(g){
    const s = norm(g?.status);
    const wheel = isWheelGiveaway(g);
    if (s === 'draft') return 'Bereit zum Starten.';
    if (s === 'open') return 'Teilnahme läuft. Zuschauer können teilnehmen.';
    if (s === 'closed_for_entries') {
      return winnerRows(g).length < winnerTarget(g)
        ? 'Teilnahme geschlossen. Bereit für die nächste Auslosung.'
        : 'Alle Gewinner wurden ausgelost. Bereit zum Abschließen.';
    }
    if (s === 'waiting_for_claim') return 'Wartet auf Chat-Claim des Gewinners.';
    if (s === 'waiting_for_wheel') return wheel ? 'Wartet auf Glücksrad-Drehung des Gewinners.' : 'Wartet auf Abschluss.';
    if (s === 'finished') return 'Giveaway ist abgeschlossen.';
    if (s === 'cancelled' || s === 'canceled') return 'Giveaway wurde abgebrochen.';
    if (s === 'deleted') return 'Giveaway wurde gelöscht.';
    return 'Status prüfen.';
  }

  function startControlRefresh(){
    stopControlRefresh();
    controlRefreshTimer = window.setInterval(async () => {
      if (!state.modal || state.modal.type !== 'control' || state.saving) return;
      const uid = state.modal.uid || state.selectedUid;
      if (!uid) return;
      try {
        await refreshGiveaways(uid, false);
        state.modal = { type:'control', uid };
        render();
      } catch (err) {
        state.error = err.message || String(err);
        render();
      }
    }, 5000);
  }

  function stopControlRefresh(){
    if (controlRefreshTimer) {
      window.clearInterval(controlRefreshTimer);
      controlRefreshTimer = null;
    }
  }

  function selectedGiveaway(){ return state.selected || null; }

  function registerDashboardModule(){
    if (!window.CGN) return;

    window.CGN.modules.loyalty_giveaways = {
      title: 'Giveaways',
      panelId: 'loyaltyGiveawaysModule',
      group: 'loyalty',
      overlayLink: api.overlay,
      overlayLabel: 'Glücksrad-Overlay öffnen',
      reload(){ return window.LoyaltyGiveawaysModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty_giveaways = {
      label: 'Giveaways',
      icon: '🎁',
      enabled: true,
      description: 'Giveaway-Übersicht, Erstellung, Bearbeitung und Live-Steuerung.'
    };

    const loyaltySection = window.CGN.sections?.loyalty;
    if (loyaltySection && Array.isArray(loyaltySection.items) && !loyaltySection.items.includes('loyalty_giveaways')) {
      loyaltySection.items.push('loyalty_giveaways');
    }

    window.SectionHomeModule?.render?.();
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyGiveawaysModule');
    if (!root || !window.CGN) return;
    if (!force && state.giveaways && state.status) { render(); return; }
    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, giveaways] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.list).catch(err => ({ ok:false, error:err.message, rows:[] }))
      ]);
      const list = rows(giveaways);
      let selectedUid = state.selectedUid;
      if (!selectedUid || !list.some(g => g.giveawayUid === selectedUid)) selectedUid = activeGiveaways(list)[0]?.giveawayUid || list[0]?.giveawayUid || '';
      state = { ...state, loading:false, status, giveaways, selectedUid, error:'' };
      if (selectedUid) await loadGiveaway(selectedUid, false);
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function loadGiveaway(uid, rerender = true){
    if (!uid) {
      state.selectedUid = '';
      state.selected = null;
      if (rerender) render();
      return;
    }
    try {
      const data = await window.CGN.api(apiUrl(uid));
      state.selectedUid = uid;
      state.selected = data.giveaway || data.row || data.data?.giveaway || null;
      state.error = '';
    } catch (err) {
      state.selectedUid = uid;
      state.selected = rows(state.giveaways).find(g => g.giveawayUid === uid) || null;
      state.error = err.message || String(err);
    }
    if (rerender) render();
  }

  async function refreshGiveaways(selectUid, rerender = true){
    const [status, giveaways] = await Promise.all([
      window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
      window.CGN.api(api.list).catch(err => ({ ok:false, error:err.message, rows:[] }))
    ]);
    state.status = status;
    state.giveaways = giveaways;
    const uid = selectUid || state.selectedUid;
    if (uid) await loadGiveaway(uid, false);
    if (rerender) render();
  }

  function activeGiveaways(list = rows(state.giveaways)){
    return list.filter(isActiveGiveaway).sort((a,b) => compareGiveaways(a,b,'startDate','desc'));
  }

  function filteredGiveaways(){
    let list = [...rows(state.giveaways)];
    const q = norm(state.search).trim();
    if (q) {
      list = list.filter(g => norm(`${g.title || ''} ${g.description || ''} ${g.giveawayUid || ''}`).includes(q));
    }
    if (state.statusFilter !== 'all') {
      if (state.statusFilter === 'active') list = list.filter(isActiveGiveaway);
      else list = list.filter(g => norm(g.status) === state.statusFilter);
    }
    return list.sort((a,b) => compareGiveaways(a,b,state.sortBy,state.sortDir));
  }

  function compareGiveaways(a,b,sortBy,dir){
    const factor = dir === 'asc' ? 1 : -1;
    const activeA = isActiveGiveaway(a) ? 1 : 0;
    const activeB = isActiveGiveaway(b) ? 1 : 0;
    if (sortBy === 'active' && activeA !== activeB) return (activeA - activeB) * -1;
    let av = '';
    let bv = '';
    if (sortBy === 'name') { av = norm(a.title); bv = norm(b.title); }
    else if (sortBy === 'status') { av = norm(statusLabel(a.status)); bv = norm(statusLabel(b.status)); }
    else if (sortBy === 'createdAt') { av = Date.parse(a.createdAt || '') || 0; bv = Date.parse(b.createdAt || '') || 0; }
    else if (sortBy === 'startDate') { av = Date.parse(giveawayStartDate(a) || '') || 0; bv = Date.parse(giveawayStartDate(b) || '') || 0; }
    else { av = Date.parse(giveawayStartDate(a) || a.createdAt || '') || 0; bv = Date.parse(giveawayStartDate(b) || b.createdAt || '') || 0; }
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return norm(a.title).localeCompare(norm(b.title), 'de');
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

  function setError(err){ state.error = err?.message || String(err || 'Unbekannter Fehler'); render(); }

  function openModal(type, uid){
    state.modal = { type, uid: uid || state.selectedUid || '' };
    if (type === 'control') startControlRefresh();
    else stopControlRefresh();
    render();
  }

  function closeModal(){
    state.modal = null;
    stopControlRefresh();
    render();
  }

  function formValue(form, name, fallback = ''){ return String(new FormData(form).get(name) ?? fallback); }

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
    const isWheelMode = mode.startsWith('wheel_');
    const timeoutSeconds = Math.max(1, Number(data.get('chatClaimTimeoutSeconds') || 60));
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
        removeWinnerAfterRound: data.get('removeWinnerAfterRound') === 'on',
        ticketCarryoverMode: data.get('ticketCarryoverMode') || 'none'
      },
      prizes: [buildPrizeFromForm(data)],
      chatClaim: {
        enabled: !isWheelMode && data.get('chatClaimEnabled') === 'on',
        mode: data.get('chatClaimMode') || 'any_message',
        timeoutSeconds,
        timeoutMs: timeoutSeconds * 1000,
        activateWheelAfterClaim: false
      },
      actor: 'dashboard'
    };
  }

  async function saveGiveaway(form, uid){
    state.saving = true; render();
    try {
      const payload = buildGiveawayPayload(form);
      let result;
      if (uid) result = await apiPut(apiUrl(uid), payload);
      else result = await apiPost(api.detailBase, payload);
      const nextUid = result.giveaway?.giveawayUid || uid || state.selectedUid;
      state.modal = null;
      await refreshGiveaways(nextUid, false);
      setMessage(uid ? 'Giveaway wurde gespeichert.' : 'Giveaway wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function giveawayAction(action, uid, options = {}){
    if (!uid) return;
    const encoded = encodeURIComponent(uid);
    const map = {
      copy: { path: `${api.detailBase}/${encoded}/copy`, confirm: '', body: () => ({ title: `Kopie von ${selectedGiveaway()?.title || 'Giveaway'}`, actor: 'dashboard' }) },
      open: { path: `${api.detailBase}/${encoded}/open`, confirm: '', body: () => ({ actor: 'dashboard' }), control: true },
      close: { path: `${api.detailBase}/${encoded}/close-entries`, confirm: '', body: () => ({ actor: 'dashboard' }) },
      draw: { path: `${api.detailBase}/${encoded}/draw`, confirm: 'Jetzt fair backendseitig einen Gewinner ziehen?', body: () => ({ actor: 'dashboard' }), control: true },
      replaceLast: { path: `${api.detailBase}/${encoded}/winners/replace-last`, confirm: 'Letzten Gewinner wirklich ersetzen? Der bisherige Gewinner wird entfernt und ein Ersatz wird ausgelost.', body: () => ({ actor: 'dashboard', reason: 'dashboard_replace_last_winner' }), control: true },
      finish: { path: `${api.detailBase}/${encoded}/finish`, confirm: 'Giveaway wirklich beenden? Danach ist es read-only.', body: () => ({ actor: 'dashboard' }) },
      cancel: { path: `${api.detailBase}/${encoded}/cancel`, confirm: 'Giveaway wirklich abbrechen?', body: () => ({ actor: 'dashboard' }) },
      delete: { path: `${api.detailBase}/${encoded}/delete`, confirm: 'Giveaway wirklich löschen? Es wird als gelöscht markiert.', body: () => ({ actor: 'dashboard' }) }
    };
    const cfg = map[action];
    if (!cfg) return;
    if (cfg.confirm && !window.confirm(cfg.confirm)) return;
    state.saving = true; render();
    try {
      const result = await apiPost(cfg.path, cfg.body());
      const nextUid = result.giveaway?.giveawayUid || uid;
      await refreshGiveaways(nextUid, false);
      if (options.openControl || cfg.control) { state.modal = { type:'control', uid: nextUid }; startControlRefresh(); }
      setMessage(action === 'draw' ? `Gewinner gezogen: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}` : (action === 'replaceLast' ? `Letzter Gewinner ersetzt. Neuer Gewinner: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}` : 'Giveaway wurde aktualisiert.'));
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function claimWheel(userLogin, userDisplayName, uid = state.selectedUid){
    if (!uid || !userLogin) return;
    state.saving = true; render();
    try {
      const result = await apiPost(`${api.detailBase}/${encodeURIComponent(uid)}/wheel/claim`, {
        userLogin,
        userDisplayName: userDisplayName || userLogin,
        source: 'dashboard',
        duration: 7000
      });
      await refreshGiveaways(uid, false);
      state.modal = { type:'control', uid };
      startControlRefresh();
      setMessage(`Glücksrad gestartet: ${result.spin?.selectedFieldLabel || 'Ergebnis folgt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function confirmClaim(uid, winnerUid){
    if (!uid || !winnerUid) return;
    if (!window.confirm('Claim für diesen Gewinner manuell bestätigen?')) return;
    state.saving = true; render();
    try {
      const g = selectedGiveaway();
      const winner = winnerRows(g).find(w => w.winnerUid === winnerUid) || {};
      await apiPost(`${api.detailBase}/${encodeURIComponent(uid)}/winners/${encodeURIComponent(winnerUid)}/claim/confirm`, {
        userLogin: winner.userLogin || '',
        userDisplayName: winner.userDisplayName || winner.userLogin || '',
        message: 'manual_dashboard_confirm',
        eventId: `dashboard_${Date.now()}`,
        actor: 'dashboard'
      });
      await refreshGiveaways(uid, false);
      state.modal = { type:'control', uid };
      setMessage('Claim wurde manuell bestätigt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderHeader(){
    return `
      <div class="lgw-head">
        <div>
          <p class="lgw-eyebrow">Loyalty / Giveaways</p>
          <h2>Giveaway Control</h2>
          <p class="lgw-subline">Übersicht, Erstellung, Bearbeitung und Live-Steuerung für laufende Giveaways.</p>
        </div>
        <div class="lgw-actions">
          <a class="lgw-btn lgw-btn-secondary" href="${api.overlay}" target="_blank">Glücksrad-Overlay</a>
          <button class="lgw-btn" data-lgw-create ${state.saving ? 'disabled' : ''}>+ Neues Giveaway</button>
          <button class="lgw-btn lgw-btn-secondary" data-lgw-reload ${state.saving ? 'disabled' : ''}>Reload</button>
        </div>
      </div>
      ${state.message ? `<div class="lgw-toast">${esc(state.message)}</div>` : ''}
      ${state.saving ? `<div class="lgw-toast lgw-toast-warn">Speichere...</div>` : ''}
    `;
  }

  function openLoyaltyGamesTab(tab){
    window.LoyaltyGamesModule?.setTab?.(tab || 'overview');
    if (typeof window.CGN?.setActiveModule === 'function') {
      window.CGN.setActiveModule('loyalty_games', { section: 'loyalty' });
    }
  }

  function renderTabs(){
    const tabs = [
      ['overview', 'Übersicht'],
      ['wheel', 'Glücksrad'],
      ['presets', 'Presets'],
      ['giveaways', 'Giveaways'],
      ['chat', 'Chat/Commands'],
      ['history', 'Verlauf'],
      ['notes', 'Hinweise']
    ];
    return `
      <div class="lg-tabs">
        ${tabs.map(([id, label]) => {
          if (id === 'giveaways') return `<button class="lg-tab is-active" data-lgw-tab-current="giveaways">${label}</button>`;
          return `<button class="lg-tab" data-lgw-open-games-tab="${id}">${label}</button>`;
        }).join('')}
      </div>
    `;
  }

  function renderActiveBar(){
    const active = activeGiveaways();
    return `
      <section class="lgw-panel lgw-active-panel">
        <div class="lgw-panel-head">
          <div>
            <h3>Aktive Giveaways</h3>
            <p class="lgw-muted">Laufende Giveaways bleiben hier immer sichtbar. Das Steuerfenster kann jederzeit wieder geöffnet werden.</p>
          </div>
          <strong>${fmtNumber(active.length)}</strong>
        </div>
        ${active.length ? `
          <div class="lgw-active-row">
            <label>Aktives Giveaway
              <select data-lgw-active-select>
                ${active.map(g => `<option value="${esc(g.giveawayUid)}" ${g.giveawayUid === state.selectedUid ? 'selected' : ''}>${esc(g.title || g.giveawayUid)} · ${esc(statusLabel(g.status))}</option>`).join('')}
              </select>
            </label>
            <button class="lgw-btn" data-lgw-open-control="${esc(state.selectedUid || active[0].giveawayUid)}">Steuern</button>
          </div>
          <div class="lgw-active-cards">
            ${active.slice(0, 6).map(g => `
              <article class="lgw-active-card ${g.giveawayUid === state.selectedUid ? 'is-active' : ''}">
                <button class="lgw-active-card-main" data-lgw-select="${esc(g.giveawayUid)}" title="Giveaway auswählen und Details öffnen">
                  <strong>${esc(g.title || '-')}</strong>
                  <span>${statusBadge(g.status)}</span>
                  <small>Start: ${fmtDate(giveawayStartDate(g))}</small>
                </button>
                <div class="lgw-active-card-actions">
                  <button class="lgw-btn lgw-btn-small" data-lgw-open-control="${esc(g.giveawayUid)}" title="Giveaway verwalten / Steuerfenster öffnen">Verwalten</button>
                </div>
              </article>
            `).join('')}
          </div>
        ` : `<p class="lgw-muted">Aktuell kein gestartetes Giveaway.</p>`}
      </section>
    `;
  }

  function renderFilters(){
    return `
      <section class="lgw-panel">
        <div class="lgw-filters">
          <label>Suche
            <input data-lgw-search value="${esc(state.search)}" placeholder="Name, Beschreibung oder UID..." autocomplete="off">
          </label>
          <label>Status
            <select data-lgw-status-filter>
              ${[
                ['all','Alle'], ['active','Nur aktive'], ['draft','Entwurf'], ['open','Offen'], ['closed_for_entries','Teilnahme geschlossen'], ['waiting_for_claim','Wartet auf Claim'], ['waiting_for_wheel','Wartet auf Glücksrad'], ['wheel_completed','Glücksrad abgeschlossen'], ['finished','Beendet'], ['cancelled','Abgebrochen'], ['deleted','Gelöscht']
              ].map(([value,label]) => `<option value="${value}" ${state.statusFilter === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          <label>Sortieren nach
            <select data-lgw-sort-by>
              ${[
                ['active','Aktive zuerst'], ['name','Name'], ['status','Status'], ['createdAt','Erstellt am'], ['startDate','Start-Datum']
              ].map(([value,label]) => `<option value="${value}" ${state.sortBy === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          <label>Richtung
            <select data-lgw-sort-dir>
              <option value="desc" ${state.sortDir === 'desc' ? 'selected' : ''}>Absteigend</option>
              <option value="asc" ${state.sortDir === 'asc' ? 'selected' : ''}>Aufsteigend</option>
            </select>
          </label>
        </div>
      </section>
    `;
  }

  function renderList(){
    const list = filteredGiveaways();
    return `
      <section class="lgw-panel lgw-overview-panel">
        <div class="lgw-panel-head">
          <div>
            <h3>Giveaway-Übersicht</h3>
            <p class="lgw-muted">${fmtNumber(list.length)} Treffer · Details, Bearbeitung und Steuerung öffnen separat im Fenster.</p>
          </div>
          <button class="lgw-btn lgw-btn-secondary" data-lgw-create>Neues Giveaway</button>
        </div>
        <div class="lgw-overview-list">
          ${list.map(g => {
            const editable = g.editable === true || norm(g.status) === 'draft';
            return `
              <article class="lgw-giveaway-item ${g.giveawayUid === state.selectedUid ? 'is-active' : ''}">
                <button class="lgw-giveaway-main" data-lgw-open-details="${esc(g.giveawayUid)}">
                  <strong>${esc(g.title || '-')}</strong>
                  <span>${esc(statusLabel(g.mode))} · ${esc(String(g.giveawayUid || '').slice(0, 28))}</span>
                </button>
                <div class="lgw-giveaway-meta">
                  <span>${statusBadge(g.status)}</span>
                  <span><small>Erstellt</small><strong>${fmtDate(g.createdAt)}</strong></span>
                  <span><small>Start</small><strong>${fmtDate(giveawayStartDate(g))}</strong></span>
                  <span><small>Gewinner</small><strong>${esc(giveawayWinnerText(g))}</strong></span>
                </div>
                <div class="lgw-row-actions lgw-giveaway-actions">
                  <button class="lgw-btn lgw-btn-small" data-lgw-open-details="${esc(g.giveawayUid)}">Anzeigen</button>
                  ${editable ? `<button class="lgw-btn lgw-btn-small lgw-btn-secondary" data-lgw-edit="${esc(g.giveawayUid)}">Bearbeiten</button>` : ''}
                  ${norm(g.status) === 'draft' ? `<button class="lgw-btn lgw-btn-small" data-lgw-action="open" data-uid="${esc(g.giveawayUid)}">Starten</button>` : ''}
                  ${isActiveGiveaway(g) ? `<button class="lgw-btn lgw-btn-small" data-lgw-open-control="${esc(g.giveawayUid)}">Steuern</button>` : ''}
                </div>
              </article>
            `;
          }).join('') || `<div class="lgw-empty">Keine Giveaways gefunden.</div>`}
        </div>
      </section>
    `;
  }

  function renderDetails(){
    const g = selectedGiveaway();
    if (!g) return `<section class="lgw-panel"><h3>Details</h3><p class="lgw-muted">Wähle ein Giveaway aus oder erstelle ein neues.</p></section>`;
    const editable = g.editable === true || norm(g.status) === 'draft';
    const entries = rows(g.entries || []);
    const winners = rows(g.winners || []);
    const permissions = rows(g.wheelPermissions || []);
    const prizes = rows(g.prizes || []);
    const claim = getChatClaimSettings(g);
    return `
      <section class="lgw-panel">
        <div class="lgw-panel-head">
          <div>
            <h3>${esc(g.title || '-')}</h3>
            <p class="lgw-muted">${esc(g.description || '')}</p>
          </div>
          <div class="lgw-actions">
            ${editable ? `<button class="lgw-btn" data-lgw-edit="${esc(g.giveawayUid)}">Bearbeiten</button>` : `<button class="lgw-btn lgw-btn-secondary" data-lgw-action="copy" data-uid="${esc(g.giveawayUid)}">Kopieren</button>`}
            ${norm(g.status) === 'draft' ? `<button class="lgw-btn" data-lgw-action="open" data-uid="${esc(g.giveawayUid)}">Starten</button>` : ''}
            ${isActiveGiveaway(g) ? `<button class="lgw-btn" data-lgw-open-control="${esc(g.giveawayUid)}">Steuerfenster öffnen</button>` : ''}
            ${norm(g.status) === 'draft' ? `<button class="lgw-btn lgw-btn-danger" data-lgw-action="delete" data-uid="${esc(g.giveawayUid)}">Löschen</button>` : ''}
          </div>
        </div>
        <div class="lgw-kv lgw-kv-compact">
          <span>Status</span><strong>${statusBadge(g.status)}</strong>
          <span>Modus</span><strong>${esc(statusLabel(g.mode))}</strong>
          <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein'}</strong>
          <span>Kosten</span><strong>${fmtNumber(g.costAmount)}</strong>
          <span>Max Tickets/User</span><strong>${fmtNumber(g.maxTicketsPerUser || 1)}</strong>
          <span>Gewinneranzahl</span><strong>${fmtNumber(g.winnerCount || 1)}</strong>
          <span>Glücksrad</span><strong>${g.wheelEnabled ? 'Ja' : 'Nein'}</strong>
          <span>Chat-Claim</span><strong>${claim.enabled ? `Ja · ${fmtNumber(claim.timeoutSeconds)}s` : 'Nein'}</strong>
          <span>Erstellt</span><strong>${fmtDate(g.createdAt)}</strong>
          <span>Start-Datum</span><strong>${fmtDate(giveawayStartDate(g))}</strong>
          <span>UID</span><strong><code>${esc(g.giveawayUid)}</code></strong>
        </div>
      </section>
      <section class="lgw-grid lgw-grid-4">
        <article class="lgw-card"><span>Teilnahmen</span><strong>${fmtNumber(entries.filter(e => e.status !== 'cancelled').length)}</strong><small>gespeicherte Tickets/Entries</small></article>
        <article class="lgw-card"><span>Gewinner</span><strong>${fmtNumber(winners.length)}</strong><small>${esc(giveawayWinnerText(g))}</small></article>
        <article class="lgw-card"><span>Glücksrad-Rechte</span><strong>${fmtNumber(permissions.length)}</strong><small>pending/used je nach Backend</small></article>
        <article class="lgw-card"><span>Gewinne</span><strong>${fmtNumber(prizes.length)}</strong><small>Preis-/Mengenliste</small></article>
      </section>
      ${renderWinners(g, winners)}
      ${renderEntries(entries)}
      ${renderWheelPermissions(g, permissions)}
    `;
  }

  function renderWinners(g, winners){
    return `
      <section class="lgw-panel">
        <h3>Gewinner</h3>
        <div class="lgw-table-wrap">
          <table class="lgw-table">
            <thead><tr><th>Zeit</th><th>User</th><th>Status</th><th>Preis</th><th>Tickets</th></tr></thead>
            <tbody>
              ${winners.map(w => `<tr><td>${fmtDate(w.createdAt)}</td><td><strong>${esc(w.userDisplayName || w.userLogin || '-')}</strong><br><small>${esc(w.userLogin || '')}</small></td><td>${statusBadge(w.status)}</td><td>${esc(w.prizeLabel || '-')}</td><td>${fmtNumber(w.totalTicketWeight || 0)}</td></tr>`).join('') || `<tr><td colspan="5" class="lgw-muted">Noch kein Gewinner gezogen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderEntries(entries){
    return `
      <section class="lgw-panel">
        <h3>Teilnahmen</h3>
        <div class="lgw-table-wrap">
          <table class="lgw-table">
            <thead><tr><th>Zeit</th><th>User</th><th>Status</th><th>Tickets</th><th>Gewicht</th><th>Quelle</th></tr></thead>
            <tbody>
              ${entries.slice(0, 80).map(e => `<tr><td>${fmtDate(e.createdAt)}</td><td>${esc(e.userDisplayName || e.userLogin || '-')}</td><td>${esc(e.status || '-')}</td><td>${fmtNumber(e.ticketCount || 0)}</td><td>${fmtNumber(e.ticketWeight || 0)}</td><td>${esc(e.source || '-')}</td></tr>`).join('') || `<tr><td colspan="6" class="lgw-muted">Noch keine Teilnahmen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderWheelPermissions(g, permissions){
    return `
      <section class="lgw-panel">
        <h3>Glücksrad-Berechtigungen</h3>
        <div class="lgw-table-wrap">
          <table class="lgw-table">
            <thead><tr><th>User</th><th>Status</th><th>Drehung</th><th>Erstellt</th><th></th></tr></thead>
            <tbody>
              ${permissions.map(p => `<tr><td>${esc(p.userDisplayName || p.userLogin || '-')}</td><td>${esc(p.status || '-')}</td><td>${esc(p.spinUid || '-')}</td><td>${fmtDate(p.createdAt)}</td><td>${norm(p.status) === 'pending' ? `<button class="lgw-btn lgw-btn-small" data-lgw-claim-wheel="${esc(p.userLogin)}" data-display-name="${esc(p.userDisplayName || p.userLogin)}" data-uid="${esc(g.giveawayUid)}">Glücksrad drehen</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="5" class="lgw-muted">Keine Glücksrad-Berechtigungen vorhanden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderFormFields(g){
    const rawMode = g?.mode || 'classic_single';
    const mode = rawMode === 'classic_multi' ? 'classic_single' : (rawMode === 'wheel_multi' ? 'wheel_single' : rawMode);
    const claim = getChatClaimSettings(g);
    const round = g?.roundPolicy || {};
    const prize = rows(g?.prizes || [])[0] || {};
    const removeWinner = round.removeWinnerAfterRound !== false;
    return `
      <label>Titel<input name="title" value="${esc(g?.title || '')}" required></label>
      <label>Beschreibung<textarea name="description" rows="3">${esc(g?.description || '')}</textarea></label>
      <div class="lgw-form-row">
        <label>Modus<select name="mode">${[
          ['classic_single','Normales Giveaway'], ['wheel_single','Glücksrad-Giveaway']
        ].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <label>Glücksrad-Preset-UID<input name="wheelPresetUid" value="${esc(g?.wheelPresetUid || '')}" placeholder="optional"></label>
      </div>
      <div class="lgw-form-row">
        <label>Kosten pro Ticket<input name="costAmount" type="number" min="0" value="${esc(g?.costAmount ?? 0)}"></label>
        <label>Max Tickets/User<input name="maxTicketsPerUser" type="number" min="1" value="${esc(g?.maxTicketsPerUser ?? 1)}"></label>
      </div>
      <div class="lgw-form-row">
        <label>Gewinneranzahl<input name="winnerCount" type="number" min="1" value="${esc(g?.winnerCount ?? 1)}"></label>
        <label>Sub-Luck Faktor<input name="subscriberLuckMultiplier" type="number" min="1" value="${esc(g?.subscriberLuckMultiplier ?? 1)}"></label>
      </div>
      <div class="lgw-form-row">
        <label>Rundenmodus<select name="roundMode">${[
          ['single','single'], ['new_round_new_entries','jede Runde neu'], ['reuse_previous_entries','bisherige Teilnehmer']
        ].map(([value,label]) => `<option value="${value}" ${(round.roundMode || 'single') === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <label>Ticket-Übernahme<select name="ticketCarryoverMode">${[
          ['none','none'], ['participants_only','Teilnehmer'], ['tickets','Tickets']
        ].map(([value,label]) => `<option value="${value}" ${(round.ticketCarryoverMode || 'none') === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      </div>
      <div class="lgw-form-row">
        <label>Chat-Claim Timeout (nur normales Giveaway)<input name="chatClaimTimeoutSeconds" type="number" min="10" value="${esc(claim.timeoutSeconds || 60)}"></label>
        <label>Claim-Modus<select name="chatClaimMode"><option value="any_message" ${claim.mode === 'any_message' ? 'selected' : ''}>Irgendeine Chatnachricht</option></select></label>
      </div>
      <div class="lgw-check-row">
        <label class="lgw-check"><input name="chatClaimEnabled" type="checkbox" ${claim.enabled ? 'checked' : ''}> Gewinner muss sich im Chat melden (nur normales Giveaway)</label>
        <span class="lgw-muted">Bei Glücksrad-Giveaways ist die Drehung der Claim. Ein zusätzlicher Chat-Claim wird beim Speichern deaktiviert.</span>
      </div>
      <div class="lgw-form-row">
        <label>Gewinn-Label<input name="prizeLabel" value="${esc(prize.label || g?.title || '')}"></label>
        <label>Gewinn-Menge<input name="prizeQuantity" type="number" min="1" value="${esc(prize.quantityTotal || g?.winnerCount || 1)}"></label>
      </div>
      <label>Gewinn-Beschreibung<textarea name="prizeDescription" rows="2">${esc(prize.description || '')}</textarea></label>
      <div class="lgw-check-row">
        <label class="lgw-check"><input name="firstTicketFree" type="checkbox" ${g?.firstTicketFree ? 'checked' : ''}> erstes Ticket kostenlos</label>
        <label class="lgw-check"><input name="subOnly" type="checkbox" ${g?.subOnly ? 'checked' : ''}> nur Subs</label>
        <label class="lgw-check"><input name="allowNewEntriesBetweenRounds" type="checkbox" ${round.allowNewEntriesBetweenRounds ? 'checked' : ''}> neue Lose zwischen Runden</label>
        <label class="lgw-check"><input name="removeWinnerAfterRound" type="checkbox" ${removeWinner ? 'checked' : ''}> Gewinner nach Runde entfernen</label>
      </div>
    `;
  }

  function renderModal(){
    if (!state.modal) return '';
    if (state.modal.type === 'create' || state.modal.type === 'edit') {
      const isEdit = state.modal.type === 'edit';
      const g = isEdit ? selectedGiveaway() : null;
      return `
        <div class="lgw-modal-backdrop" data-lgw-close-modal>
          <div class="lgw-modal" role="dialog" aria-modal="true" aria-label="${isEdit ? 'Giveaway bearbeiten' : 'Neues Giveaway'}" data-lgw-modal-box>
            <div class="lgw-modal-head"><h3>${isEdit ? 'Giveaway bearbeiten' : 'Neues Giveaway'}</h3><button class="lgw-icon-btn" data-lgw-close-modal type="button">×</button></div>
            <form class="lgw-form" data-lgw-save-giveaway data-uid="${esc(isEdit ? g?.giveawayUid || '' : '')}">
              ${renderFormFields(g)}
              <div class="lgw-modal-actions">
                <button class="lgw-btn lgw-btn-secondary" type="button" data-lgw-close-modal>Abbrechen</button>
                <button class="lgw-btn" type="submit" ${state.saving ? 'disabled' : ''}>${isEdit ? 'Speichern' : 'Erstellen'}</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }
    if (state.modal.type === 'details') return renderDetailsModal();
    if (state.modal.type === 'control') return renderControlModal();
    return '';
  }

  function renderDetailsModal(){
    const g = selectedGiveaway();
    return `
      <div class="lgw-modal-backdrop" data-lgw-close-modal>
        <div class="lgw-modal lgw-detail-modal" role="dialog" aria-modal="true" aria-label="Giveaway Details" data-lgw-modal-box>
          <div class="lgw-modal-head">
            <h3>Giveaway Details</h3>
            <button class="lgw-icon-btn" data-lgw-close-modal type="button">×</button>
          </div>
          ${g ? renderDetails() : `<section class="lgw-panel"><p class="lgw-muted">Keine Details geladen.</p></section>`}
        </div>
      </div>
    `;
  }

  function renderControlModal(){
    const uid = state.modal.uid || state.selectedUid;
    const g = uid === state.selectedUid ? selectedGiveaway() : rows(state.giveaways).find(item => item.giveawayUid === uid);
    if (!g) return '';
    const s = norm(g.status);
    const wheel = isWheelGiveaway(g);
    const entries = activeEntries(g);
    const winners = winnerRows(g);
    const pendingClaims = openClaimWinners(g);
    const pendingPermissions = pendingWheelPermissions(g);
    const usedPermissions = usedWheelPermissions(g);
    const canStart = s === 'draft';
    const canClose = s === 'open';
    const canDraw = s === 'closed_for_entries' && winners.length < winnerTarget(g);
    const canFinish = !isFinalStatus(g.status) && ['closed_for_entries','waiting_for_claim','waiting_for_wheel','open'].includes(s);
    const canCancel = !isFinalStatus(g.status) && s !== 'finished';
    const latest = latestWinner(g);
    const latestStatus = norm(latest?.status);
    const wheelResult = latest?.metadata?.wheelResult || {};
    const drawnCount = winners.length;
    const targetCount = winnerTarget(g);
    const hasWinnerSlotsOpen = drawnCount < targetCount;
    const hasAnyWinner = drawnCount > 0;
    const canReplaceLast = hasAnyWinner && !isFinalStatus(g.status) && !['claim_confirmed','awarded','finished','wheel_completed'].includes(latestStatus);
    return `
      <div class="lgw-modal-backdrop" data-lgw-close-modal>
        <div class="lgw-modal lgw-control-modal" role="dialog" aria-modal="true" aria-label="Giveaway steuern" data-lgw-modal-box>
          <div class="lgw-modal-head">
            <div>
              <h3>Giveaway steuern</h3>
              <p class="lgw-muted">Dieses Fenster ist die Live-Konsole. Es aktualisiert sich alle 5 Sekunden automatisch.</p>
            </div>
            <button class="lgw-icon-btn" data-lgw-close-modal type="button">×</button>
          </div>
          <div class="lgw-control-title">
            <div><strong>${esc(g.title || '-')}</strong><small>${esc(statusLabel(g.mode))} · ${esc(g.giveawayUid || '')}</small></div>
            ${statusBadge(g.status)}
          </div>
          <div class="lgw-control-phase">
            <strong>${esc(controlPhaseText(g))}</strong>
            <span>${wheel ? 'Glücksrad-Giveaway: Die Glücksrad-Drehung ist der Claim.' : 'Normales Giveaway: Chat-Claim ist optional je nach Config.'}</span>
          </div>
          <div class="lgw-grid lgw-grid-4 lgw-control-stats">
            <article class="lgw-card"><span>Teilnehmer</span><strong>${fmtNumber(entries.length)}</strong><small>aktive Entries</small></article>
            <article class="lgw-card"><span>Gewinner</span><strong>${esc(winnerProgressText(g))}</strong><small>${esc(giveawayWinnerText(g))}</small></article>
            <article class="lgw-card"><span>${wheel ? 'Glücksrad' : 'Claim'}</span><strong>${wheel ? (pendingPermissions.length ? 'Wartet' : (usedPermissions.length ? 'Gedreht' : 'Bereit')) : (pendingClaims.length ? 'Wartet' : 'OK')}</strong><small>${wheel ? `${fmtNumber(pendingPermissions.length)} offen · ${fmtNumber(usedPermissions.length)} gedreht` : `${fmtNumber(pendingClaims.length)} offen`}</small></article>
            <article class="lgw-card"><span>Nächster Schritt</span><strong>${canStart ? 'Starten' : canClose ? 'Schließen' : canDraw ? (drawnCount > 0 ? 'Weiter auslosen' : 'Auslosen') : pendingClaims.length ? 'Claim' : pendingPermissions.length ? 'Drehung' : !isFinalStatus(g.status) ? 'Abschluss' : 'Fertig'}</strong><small>${fmtDate(g.updatedAt || g.openedAt || g.createdAt)}</small></article>
          </div>

          <section class="lgw-control-section">
            <h4>Ablauf</h4>
            <div class="lgw-control-actions">
              <button class="lgw-btn" data-lgw-action="open" data-uid="${esc(g.giveawayUid)}" ${canStart ? '' : 'disabled'}>Giveaway starten</button>
              <button class="lgw-btn lgw-btn-secondary" data-lgw-action="close" data-uid="${esc(g.giveawayUid)}" ${canClose ? '' : 'disabled'}>Teilnahme schließen</button>
              <button class="lgw-btn" data-lgw-action="draw" data-uid="${esc(g.giveawayUid)}" ${canDraw ? '' : 'disabled'}>${drawnCount > 0 ? 'Weiteren Gewinner auslosen' : 'Gewinner auslosen'}</button>
              <button class="lgw-btn lgw-btn-danger" data-lgw-action="replaceLast" data-uid="${esc(g.giveawayUid)}" ${canReplaceLast ? '' : 'disabled'}>Letzten Gewinner ersetzen</button>
            </div>
            <div class="lgw-control-help">
              <p><strong>Weiteren Gewinner auslosen</strong> zieht einen zusätzlichen Gewinner. Bereits gezogene Gewinner bleiben erhalten.</p>
              <p><strong>Letzten Gewinner ersetzen</strong> entfernt den letzten noch nicht abgeschlossenen Gewinner und lost direkt einen Ersatz aus.</p>
            </div>
          </section>

          <section class="lgw-control-section">
            <h4>${wheel ? 'Glücksrad-Claim' : 'Chat-Claim'}</h4>
            ${wheel ? `
              <p class="lgw-muted">Bei Glücksrad-Giveaways gilt: Gewinner auslosen → Gewinner dreht das Glücksrad → Drehung ist der Claim.</p>
              <div class="lgw-control-actions">
                <a class="lgw-btn lgw-btn-secondary" href="${api.overlay}" target="_blank">Glücksrad-Overlay öffnen</a>
                ${pendingPermissions.map(p => `<button class="lgw-btn" data-lgw-claim-wheel="${esc(p.userLogin)}" data-display-name="${esc(p.userDisplayName || p.userLogin)}" data-uid="${esc(g.giveawayUid)}">Glücksrad drehen für ${esc(p.userDisplayName || p.userLogin)}</button>`).join('')}
                ${!pendingPermissions.length ? `<button class="lgw-btn lgw-btn-disabled" disabled>Keine offene Glücksrad-Drehung</button>` : ''}
              </div>
              ${usedPermissions.length ? `<div class="lgw-mini-list">${usedPermissions.slice(-5).map(p => `<span>${esc(p.userDisplayName || p.userLogin || '-')} · ${esc(p.metadata?.resultLabel || p.spinUid || 'gedreht')}</span>`).join('')}</div>` : ''}
            ` : `
              <p class="lgw-muted">Bei normalen Giveaways kann ein Gewinner per Chat-Claim oder manuell bestätigt werden.</p>
              <div class="lgw-control-actions">
                ${pendingClaims.map(w => `<button class="lgw-btn" data-lgw-confirm-claim="${esc(w.winnerUid)}" data-uid="${esc(g.giveawayUid)}">Claim bestätigen: ${esc(w.userDisplayName || w.userLogin)}</button>`).join('')}
                ${!pendingClaims.length ? `<button class="lgw-btn lgw-btn-disabled" disabled>Kein offener Chat-Claim</button>` : ''}
              </div>
            `}
          </section>

          <section class="lgw-control-section">
            <h4>Abschluss</h4>
            <div class="lgw-control-actions">
              <button class="lgw-btn lgw-btn-secondary" data-lgw-refresh-control="${esc(g.giveawayUid)}">Aktualisieren</button>
              <button class="lgw-btn" data-lgw-action="finish" data-uid="${esc(g.giveawayUid)}" ${canFinish ? '' : 'disabled'}>Giveaway abschließen</button>
              <button class="lgw-btn lgw-btn-danger" data-lgw-action="cancel" data-uid="${esc(g.giveawayUid)}" ${canCancel ? '' : 'disabled'}>Giveaway abbrechen</button>
            </div>
          </section>

          <div class="lgw-warning">Mehrere Gewinner laufen über dieselbe Konsole: Nach einer bestätigten normalen Claim-Phase oder nach einer Glücksrad-Drehung springt das Giveaway wieder auf „Teilnahme geschlossen“, solange noch Gewinner offen sind. Dann kann über „Weiteren Gewinner auslosen“ der nächste Gewinner gezogen werden.</div>
        </div>
      </div>
    `;
  }

  function render(){
    root = document.getElementById('loyaltyGiveawaysModule');
    if (!root) return;
    if (state.loading) {
      root.innerHTML = `<section class="lgw-panel"><h2>Giveaways</h2><p class="lgw-muted">Lade Daten...</p></section>`;
      return;
    }
    if (state.error) {
      root.innerHTML = `<section class="lgw-panel lgw-error"><h2>Giveaways</h2><p>${esc(state.error)}</p><button class="lgw-btn" data-lgw-reload>Neu laden</button></section>`;
      bindEvents();
      return;
    }
    root.innerHTML = `
      ${renderHeader()}
      ${renderTabs()}
      ${renderActiveBar()}
      ${renderFilters()}
      ${renderList()}
      ${renderModal()}
    `;
    bindEvents();
  }

  function bindEvents(){
    root = document.getElementById('loyaltyGiveawaysModule');
    if (!root) return;

    root.querySelectorAll('[data-lgw-reload]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root.querySelectorAll('[data-lgw-open-games-tab]').forEach(btn => {
      btn.addEventListener('click', () => openLoyaltyGamesTab(btn.dataset.lgwOpenGamesTab || 'overview'));
    });
    root.querySelectorAll('[data-lgw-create]').forEach(btn => btn.addEventListener('click', () => openModal('create')));
    root.querySelectorAll('[data-lgw-open-details]').forEach(btn => btn.addEventListener('click', async () => {
      await loadGiveaway(btn.dataset.lgwOpenDetails, false);
      openModal('details', btn.dataset.lgwOpenDetails);
    }));
    root.querySelectorAll('[data-lgw-edit]').forEach(btn => btn.addEventListener('click', async () => {
      await loadGiveaway(btn.dataset.lgwEdit, false);
      openModal('edit', btn.dataset.lgwEdit);
    }));
    root.querySelectorAll('[data-lgw-open-control]').forEach(btn => btn.addEventListener('click', async () => {
      await loadGiveaway(btn.dataset.lgwOpenControl, false);
      openModal('control', btn.dataset.lgwOpenControl);
    }));
    root.querySelectorAll('[data-lgw-select]').forEach(btn => btn.addEventListener('click', () => loadGiveaway(btn.dataset.lgwSelect)));

    root.querySelector('[data-lgw-active-select]')?.addEventListener('change', ev => {
      const uid = ev.currentTarget.value;
      loadGiveaway(uid);
    });

    root.querySelector('[data-lgw-search]')?.addEventListener('input', ev => {
      state.search = ev.currentTarget.value;
      render();
    });
    root.querySelector('[data-lgw-status-filter]')?.addEventListener('change', ev => { state.statusFilter = ev.currentTarget.value; render(); });
    root.querySelector('[data-lgw-sort-by]')?.addEventListener('change', ev => { state.sortBy = ev.currentTarget.value; render(); });
    root.querySelector('[data-lgw-sort-dir]')?.addEventListener('change', ev => { state.sortDir = ev.currentTarget.value; render(); });

    root.querySelectorAll('[data-lgw-action]').forEach(btn => btn.addEventListener('click', () => giveawayAction(btn.dataset.lgwAction, btn.dataset.uid, { openControl: ['open','draw'].includes(btn.dataset.lgwAction) })));
    root.querySelectorAll('[data-lgw-claim-wheel]').forEach(btn => btn.addEventListener('click', () => claimWheel(btn.dataset.lgwClaimWheel, btn.dataset.displayName, btn.dataset.uid)));
    root.querySelectorAll('[data-lgw-confirm-claim]').forEach(btn => btn.addEventListener('click', () => confirmClaim(btn.dataset.uid, btn.dataset.lgwConfirmClaim)));
    root.querySelectorAll('[data-lgw-refresh-control]').forEach(btn => btn.addEventListener('click', async () => {
      await refreshGiveaways(btn.dataset.lgwRefreshControl, false);
      state.modal = { type:'control', uid: btn.dataset.lgwRefreshControl };
      startControlRefresh();
      render();
    }));

    root.querySelector('[data-lgw-save-giveaway]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      saveGiveaway(ev.currentTarget, ev.currentTarget.dataset.uid || '');
    });

    root.querySelectorAll('[data-lgw-close-modal]').forEach(el => el.addEventListener('click', ev => {
      if (ev.target.closest('[data-lgw-modal-box]') && !ev.target.matches('[data-lgw-close-modal]')) return;
      closeModal();
    }));
    root.querySelectorAll('[data-lgw-modal-box]').forEach(box => box.addEventListener('click', ev => ev.stopPropagation()));
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'loyalty_giveaways') loadAll();
  });

  registerDashboardModule();

  return { loadAll, render };
})();
