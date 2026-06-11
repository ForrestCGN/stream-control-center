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
    participantListOpen: false,
    participantSearch: '',
    participantSortBy: 'tickets',
    participantSortDir: 'desc',
    participantLimit: 25,
    modal: null,
    highlightedUid: ''
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
      deleted: 'Archiviert',
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

  function isArchivedGiveaway(g){
    return norm(g?.status) === 'deleted';
  }

  function isArchiveEligibleGiveaway(g){
    const s = norm(g?.status);
    return s === 'finished';
  }

  function canArchiveGiveaway(g){
    if (!g || isArchivedGiveaway(g)) return false;
    return isArchiveEligibleGiveaway(g);
  }

  function canHardDeleteGiveaway(g){
    return !!g && !!g.giveawayUid;
  }

  function renderArchiveDeleteActions(g, sizeClass = 'lgw-btn-small'){
    if (!g) return '';
    const uid = esc(g.giveawayUid || '');
    const size = String(sizeClass || '').trim();
    const actions = [];
    if (canArchiveGiveaway(g)) actions.push(`<button class="lgw-btn ${size} lgw-btn-secondary" data-lgw-action="archive" data-uid="${uid}">Archivieren</button>`);
    if (canHardDeleteGiveaway(g)) actions.push(`<button class="lgw-btn ${size} lgw-btn-danger" data-lgw-action="hardDelete" data-uid="${uid}">Löschen</button>`);
    return actions.join('');
  }

  function renderImportantPrimaryButton(g){
    if (!g) return '';
    const uid = esc(g.giveawayUid || '');
    const s = norm(g.status);
    const editable = g.editable === true || s === 'draft';
    if (isActiveGiveaway(g) && s !== 'draft') return `<button class="lgw-btn" data-lgw-open-control="${uid}">Steuern</button>`;
    if (editable) return `<button class="lgw-btn" data-lgw-edit="${uid}">Bearbeiten</button>`;
    return `<button class="lgw-btn" data-lgw-open-details="${uid}">Anzeigen</button>`;
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

  function entryTicketCount(entry){
    const n = Number(entry?.ticketCount ?? entry?.tickets ?? entry?.count ?? 0);
    return Number.isFinite(n) ? n : 0;
  }


  function totalEntryTickets(entries){
    return entries.reduce((sum, entry) => sum + entryTicketCount(entry), 0);
  }

  function sortedParticipantEntries(entries){
    const q = norm(state.participantSearch).trim();
    let list = [...entries];
    if (q) {
      list = list.filter(entry => norm(`${entry.userDisplayName || ''} ${entry.userLogin || ''}`).includes(q));
    }
    const factor = state.participantSortDir === 'asc' ? 1 : -1;
    list.sort((a,b) => {
      let av;
      let bv;
      if (state.participantSortBy === 'name') {
        av = norm(a.userDisplayName || a.userLogin || '');
        bv = norm(b.userDisplayName || b.userLogin || '');
      } else {
        av = entryTicketCount(a);
        bv = entryTicketCount(b);
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return norm(a.userDisplayName || a.userLogin || '').localeCompare(norm(b.userDisplayName || b.userLogin || ''), 'de');
    });
    return list;
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
        await refreshControlModal(uid);
      } catch (err) {
        const box = root?.querySelector('[data-lgw-control-error]');
        if (box) box.textContent = err.message || String(err);
        else { state.error = err.message || String(err); render(); }
      }
    }, 5000);
  }

  function stopControlRefresh(){
    if (controlRefreshTimer) {
      window.clearInterval(controlRefreshTimer);
      controlRefreshTimer = null;
    }
  }

  async function refreshControlModal(uid){
    if (!uid) return;
    await refreshGiveaways(uid, false);
    state.modal = { type:'control', uid };
    const content = root?.querySelector('[data-lgw-control-content]');
    const currentUid = content?.dataset?.lgwControlContent;
    if (!content || currentUid !== uid) {
      render();
      return;
    }
    const g = selectedGiveaway();
    if (!g) {
      render();
      return;
    }
    content.innerHTML = renderControlContent(g);
    bindControlEvents(content);
  }

  function selectedGiveaway(){ return state.selected || null; }

  function isControlModalFor(uid){
    return state.modal?.type === 'control' && (!uid || state.modal.uid === uid || state.selectedUid === uid);
  }

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

  function isPreparedGiveaway(g){
    if (!g) return false;
    const s = norm(g.status);
    if (isFinalStatus(s)) return false;
    return s === 'draft' || isActiveGiveaway(g) || g.setupComplete === false || Array.isArray(g.setupIssues) && g.setupIssues.length > 0;
  }

  function preparednessRank(g){
    const s = norm(g?.status);
    if (isActiveGiveaway(g) && s !== 'draft') return 0;
    if (g?.setupComplete === false || Array.isArray(g?.setupIssues) && g.setupIssues.length > 0) return 1;
    if (s === 'draft') return 2;
    return 3;
  }

  function activeGiveaways(list = rows(state.giveaways)){
    return list.filter(isActiveGiveaway).sort((a,b) => compareGiveaways(a,b,'startDate','desc'));
  }

  function importantGiveaways(list = rows(state.giveaways)){
    return list
      .filter(isPreparedGiveaway)
      .sort((a,b) => {
        const ar = preparednessRank(a);
        const br = preparednessRank(b);
        if (ar !== br) return ar - br;
        return compareGiveaways(a,b,'startDate','desc');
      });
  }

  function setupIssueText(g){
    const issues = Array.isArray(g?.setupIssues) ? g.setupIssues : [];
    if (!issues.length && g?.setupComplete !== false) return '';
    const mapped = issues.map(issue => {
      const raw = String(issue?.message || issue?.reason || issue?.code || issue || '').trim();
      const key = norm(raw);
      if (key.includes('wheel')) return 'Glücksrad fehlt';
      if (key.includes('prize')) return 'Preis fehlt';
      if (key.includes('title')) return 'Titel fehlt';
      return raw || 'Setup unvollständig';
    }).filter(Boolean);
    if (!mapped.length && isWheelGiveaway(g) && !hasGiveawayWheel(g)) mapped.push('Glücksrad fehlt');
    return mapped.length ? `Noch nicht startbereit: ${mapped.join(', ')}` : 'Noch nicht startbereit.';
  }

  function hasGiveawayWheel(g){
    return !!(
      g?.boundWheel?.boundWheelUid ||
      g?.boundWheelUid ||
      g?.wheelSnapshotUid ||
      g?.settingsSnapshot?.wheelSnapshotUid
    );
  }

  function wheelEditorButtonLabel(g){
    return hasGiveawayWheel(g) ? 'Glücksrad bearbeiten' : 'Glücksrad erstellen';
  }

  function needsWheelEditor(g){
    if (!isWheelGiveaway(g)) return false;
    if (!hasGiveawayWheel(g)) return true;
    const issues = Array.isArray(g?.setupIssues) ? g.setupIssues : [];
    return issues.some(issue => {
      const raw = norm(issue?.message || issue?.reason || issue?.code || issue || '');
      return raw.includes('wheel') || raw.includes('glücksrad') || raw.includes('field') || raw.includes('feld');
    });
  }

  function boundWheelFields(giveaway){
    return rows(giveaway?.boundWheelFields || giveaway?.wheelFields || giveaway?.boundWheel?.fields || []);
  }

  async function createGiveawayBoundWheel(giveawayUid){
    if (!giveawayUid) return null;
    const giveaway = selectedGiveaway()?.giveawayUid === giveawayUid ? selectedGiveaway() : rows(state.giveaways).find(g => g.giveawayUid === giveawayUid);
    const title = giveaway?.title || 'Giveaway-Glücksrad';
    const result = await apiPut(`${api.detailBase}/${encodeURIComponent(giveawayUid)}/wheel/bound`, {
      title,
      name: `${title} – Glücksrad`,
      actor: 'dashboard',
      source: 'dashboard_giveaway_control_wheel_modal'
    });
    await refreshGiveaways(giveawayUid, false);
    setMessage(result.created ? 'Giveaway-Glücksrad wurde erstellt.' : 'Giveaway-Glücksrad wurde geladen.');
    return result;
  }

  async function ensureGiveawayBoundWheel(giveawayUid){
    if (!giveawayUid) return null;
    if (!selectedGiveaway() || selectedGiveaway().giveawayUid !== giveawayUid) await loadGiveaway(giveawayUid, false);
    if (hasGiveawayWheel(selectedGiveaway())) return { ok: true, created: false, boundWheel: selectedGiveaway()?.boundWheel || null };
    return createGiveawayBoundWheel(giveawayUid);
  }

  function giveawayWheelFieldPayload(form){
    const data = new FormData(form);
    return {
      label: data.get('label'),
      subLabel: data.get('subLabel') || '',
      weight: Number(data.get('weight') || 1),
      quantityTotal: Number(data.get('quantityTotal') || 1),
      rewardType: data.get('rewardType') || 'manual',
      rewardValue: data.get('rewardValue') || '',
      enabled: data.get('enabled') === 'on',
      sortOrder: Number(data.get('sortOrder') || 1),
      actor: 'dashboard'
    };
  }

  async function openGiveawayWheelEditor(uid){
    if (!uid) return;
    state.saving = true;
    render();
    try {
      await loadGiveaway(uid, false);
      await ensureGiveawayBoundWheel(uid);
      await loadGiveaway(uid, false);
      state.modal = { type: 'wheelEditor', uid };
      stopControlRefresh();
      state.error = '';
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function handleCreateGiveawayWheelField(form){
    const giveawayUid = state.modal?.uid || state.selectedUid;
    if (!giveawayUid) return;
    state.saving = true;
    render();
    try {
      await ensureGiveawayBoundWheel(giveawayUid);
      await apiPost(`${api.detailBase}/${encodeURIComponent(giveawayUid)}/wheel/bound/fields`, giveawayWheelFieldPayload(form));
      await refreshGiveaways(giveawayUid, false);
      await loadGiveaway(giveawayUid, false);
      state.modal = { type: 'wheelEditor', uid: giveawayUid };
      setMessage('Glücksrad-Feld wurde hinzugefügt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function handleUpdateGiveawayWheelField(form){
    const giveawayUid = state.modal?.uid || state.selectedUid;
    const fieldUid = form.dataset.fieldUid;
    if (!giveawayUid || !fieldUid) return;
    state.saving = true;
    render();
    try {
      await apiPut(`${api.detailBase}/${encodeURIComponent(giveawayUid)}/wheel/bound/fields/${encodeURIComponent(fieldUid)}`, giveawayWheelFieldPayload(form));
      await refreshGiveaways(giveawayUid, false);
      await loadGiveaway(giveawayUid, false);
      state.modal = { type: 'wheelEditor', uid: giveawayUid };
      setMessage('Glücksrad-Feld wurde gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  async function deleteGiveawayWheelField(fieldUid){
    const giveawayUid = state.modal?.uid || state.selectedUid;
    if (!giveawayUid || !fieldUid) return;
    if (!window.confirm('Dieses Glücksrad-Feld deaktivieren?')) return;
    state.saving = true;
    render();
    try {
      await apiPost(`${api.detailBase}/${encodeURIComponent(giveawayUid)}/wheel/bound/fields/${encodeURIComponent(fieldUid)}/delete`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid, false);
      await loadGiveaway(giveawayUid, false);
      state.modal = { type: 'wheelEditor', uid: giveawayUid };
      setMessage('Glücksrad-Feld wurde deaktiviert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false;
      render();
    }
  }

  function renderWheelEditorModal(){
    const uid = state.modal?.uid || state.selectedUid;
    const g = uid === state.selectedUid ? selectedGiveaway() : rows(state.giveaways).find(item => item.giveawayUid === uid);
    if (!g) return '';
    const fields = boundWheelFields(g);
    const existing = hasGiveawayWheel(g);
    const boundWheel = g.boundWheel || {};
    const issue = setupIssueText(g);
    return `
      <div class="lgw-modal-backdrop" data-lgw-close-modal>
        <div class="lgw-modal lgw-wheel-editor-modal" role="dialog" aria-modal="true" aria-label="Giveaway-Glücksrad bearbeiten" data-lgw-modal-box>
          <div class="lgw-modal-head">
            <div>
              <p class="lgw-eyebrow">Giveaway-Glücksrad</p>
              <h3>${existing ? 'Glücksrad bearbeiten' : 'Glücksrad erstellen'}: ${esc(g.title || g.giveawayUid || '-')}</h3>
              <p class="lgw-muted">Dieses Fenster bearbeitet nur das an dieses Giveaway gebundene Glücksrad.</p>
            </div>
            <button class="lgw-icon-btn" data-lgw-close-modal type="button">×</button>
          </div>

          <section class="lgw-panel lgw-wheel-context">
            <div class="lgw-kv lgw-kv-compact">
              <span>Giveaway</span><strong><code>${esc(g.giveawayUid || '-')}</code></strong>
              <span>Status</span><strong>${statusBadge(g.status)}</strong>
              <span>Glücksrad</span><strong>${existing ? 'vorhanden' : 'wird erstellt'}</strong>
              <span>Gebundenes Rad</span><strong>${esc(boundWheel.boundWheelUid || g.boundWheelUid || g.wheelSnapshotUid || g.settingsSnapshot?.wheelSnapshotUid || '-')}</strong>
              <span>Felder</span><strong>${fmtNumber(fields.length)}</strong>
              <span>Startbereit</span><strong>${g.setupComplete === false ? 'Nein' : 'Ja'}</strong>
            </div>
            ${issue ? `<p class="lgw-warning">Noch nicht startbereit: ${esc(issue.replace(/^Noch nicht startbereit:\s*/i, ''))}</p>` : ''}
          </section>

          <section class="lgw-panel">
            <div class="lgw-panel-head">
              <div>
                <h3>Felder / Gewinne</h3>
                <p class="lgw-muted">Mindestens ein aktives Feld ist nötig, damit ein Glücksrad-Giveaway startbereit ist.</p>
              </div>
            </div>

            <form class="lgw-form lgw-wheel-field-form" data-lgw-create-wheel-field>
              <div class="lgw-form-row">
                <label>Label<input name="label" placeholder="z. B. 500 Kekskrümel" required></label>
                <label>Subtext<input name="subLabel" placeholder="optional"></label>
              </div>
              <div class="lgw-form-row">
                <label>Gewicht<input name="weight" type="number" min="1" value="1"></label>
                <label>Gesamtmenge<input name="quantityTotal" type="number" min="1" value="1"></label>
              </div>
              <div class="lgw-form-row">
                <label>Reward-Typ
                  <select name="rewardType">
                    <option value="manual">manual</option>
                    <option value="points">points</option>
                    <option value="none">none</option>
                    <option value="bonus_spin">bonus_spin</option>
                  </select>
                </label>
                <label>Reward-Wert<input name="rewardValue" placeholder="optional"></label>
              </div>
              <div class="lgw-modal-actions">
                <label class="lgw-check"><input name="enabled" type="checkbox" checked> aktiv</label>
                <button class="lgw-btn" type="submit" ${state.saving ? 'disabled' : ''}>Feld hinzufügen</button>
              </div>
            </form>

            <div class="lgw-wheel-field-list">
              ${fields.map(field => `
                <form class="lgw-wheel-field-card" data-lgw-update-wheel-field data-field-uid="${esc(field.fieldUid)}">
                  <div class="lgw-wheel-field-top">
                    <strong>${esc(field.label || '-')}</strong>
                    ${field.enabled !== false && field.enabled !== 0 ? statusBadge('active') : statusBadge('paused')}
                  </div>
                  <div class="lgw-form-row">
                    <label>Reihenfolge<input name="sortOrder" type="number" value="${esc(field.sortOrder || 1)}"></label>
                    <label>Label<input name="label" value="${esc(field.label || '')}" required></label>
                  </div>
                  <div class="lgw-form-row">
                    <label>Subtext<input name="subLabel" value="${esc(field.subLabel || field.sub || '')}"></label>
                    <label>Gewicht<input name="weight" type="number" min="1" value="${esc(field.weight || 1)}"></label>
                  </div>
                  <div class="lgw-form-row">
                    <label>Gesamtmenge<input name="quantityTotal" type="number" min="1" value="${esc(field.quantityTotal || 1)}"></label>
                    <label>Reward-Typ
                      <select name="rewardType">
                        ${['manual','points','none','bonus_spin'].map(type => `<option value="${type}" ${field.rewardType === type ? 'selected' : ''}>${type}</option>`).join('')}
                      </select>
                    </label>
                  </div>
                  <div class="lgw-form-row">
                    <label>Reward-Wert<input name="rewardValue" value="${esc(field.rewardValue || '')}"></label>
                    <label class="lgw-check"><input name="enabled" type="checkbox" ${field.enabled !== false && field.enabled !== 0 ? 'checked' : ''}> aktiv</label>
                  </div>
                  <div class="lgw-modal-actions">
                    <button class="lgw-btn" type="submit">Speichern</button>
                    <button class="lgw-btn lgw-btn-danger" type="button" data-lgw-delete-wheel-field="${esc(field.fieldUid)}">Deaktivieren</button>
                  </div>
                </form>
              `).join('') || `<p class="lgw-muted">Noch keine Felder vorhanden. Lege mindestens ein Feld an.</p>`}
            </div>
          </section>

          <div class="lgw-modal-actions">
            <button class="lgw-btn lgw-btn-secondary" type="button" data-lgw-close-modal>Zurück zu Giveaways</button>
          </div>
        </div>
      </div>
    `;
  }

  function canStartGiveaway(g){
    return norm(g?.status) === 'draft' && g?.canOpen !== false && g?.setupComplete !== false && !needsWheelEditor(g);
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
    if (type === 'control' && state.modal?.type !== 'control') {
      state.participantListOpen = false;
      state.participantSearch = '';
      state.participantSortBy = 'tickets';
      state.participantSortDir = 'desc';
      state.participantLimit = 25;
    }
    state.modal = { type, uid: uid || state.selectedUid || '' };
    if (type === 'control') startControlRefresh();
    else stopControlRefresh();
    render();
  }

  function closeModal(){
    state.modal = null;
    state.participantListOpen = false;
    state.participantSearch = '';
    state.participantLimit = 25;
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
        roundMode: 'single',
        allowNewEntriesBetweenRounds: false,
        removeWinnerAfterRound: true,
        ticketCarryoverMode: 'tickets'
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
      state.highlightedUid = nextUid || '';
      if (!uid) { state.search = ''; state.statusFilter = 'all'; state.sortBy = 'active'; state.sortDir = 'desc'; }
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
      close: { path: `${api.detailBase}/${encoded}/close-entries`, confirm: '', body: () => ({ actor: 'dashboard' }), control: true },
      draw: { path: `${api.detailBase}/${encoded}/draw`, confirm: 'Jetzt fair backendseitig einen Gewinner ziehen?', body: () => ({ actor: 'dashboard' }), control: true },
      replaceLast: { path: `${api.detailBase}/${encoded}/winners/replace-last`, confirm: 'Letzten Gewinner wirklich ersetzen? Der bisherige Gewinner wird entfernt und ein Ersatz wird ausgelost.', body: () => ({ actor: 'dashboard', reason: 'dashboard_replace_last_winner' }), control: true },
      finish: { path: `${api.detailBase}/${encoded}/finish`, confirm: 'Giveaway wirklich beenden? Danach ist es read-only.', body: () => ({ actor: 'dashboard' }), control: true },
      cancel: { path: `${api.detailBase}/${encoded}/cancel`, confirm: 'Giveaway wirklich abbrechen?', body: () => ({ actor: 'dashboard' }), control: true },
      archive: {
        path: `${api.detailBase}/${encoded}/delete`,
        confirm: 'Giveaway archivieren? Es wird aus der normalen Übersicht ausgeblendet, bleibt aber über den Filter „Archiviert“ erhalten. Es wird dabei nicht automatisch rückerstattet.',
        body: () => ({ actor: 'dashboard', reason: 'dashboard_archive' })
      },
      hardDelete: {
        path: `${api.detailBase}/${encoded}/hard-delete`,
        confirm: 'Giveaway WIRKLICH dauerhaft löschen? Das entfernt dieses Giveaway komplett aus der Giveaway-Datenbank. Es wird dabei NICHT automatisch rückerstattet. Loyalty-Transaktionen bleiben als Punkte-Audit erhalten. Dieser Schritt kann nicht rückgängig gemacht werden.',
        body: () => ({ actor: 'dashboard', reason: 'dashboard_hard_delete', confirmHardDelete: true })
      }
    };
    const cfg = map[action];
    if (!cfg) return;
    if (cfg.confirm && !window.confirm(cfg.confirm)) return;
    const controlOpen = isControlModalFor(uid) || options.openControl || cfg.control;
    state.saving = true;
    if (!controlOpen) render();
    try {
      const result = await apiPost(cfg.path, cfg.body());
      const removesFromCurrentView = action === 'archive' || action === 'hardDelete';
      const nextUid = removesFromCurrentView ? '' : (result.giveaway?.giveawayUid || uid);
      if (removesFromCurrentView) {
        state.modal = null;
        stopControlRefresh();
        state.selectedUid = '';
        state.selected = null;
      }
      await refreshGiveaways(nextUid, false);
      if (controlOpen && !removesFromCurrentView) {
        state.modal = { type:'control', uid: nextUid };
        startControlRefresh();
        await refreshControlModal(nextUid);
      } else {
        const msg = action === 'archive'
          ? 'Giveaway wurde archiviert und aus der normalen Übersicht ausgeblendet.'
          : (action === 'hardDelete'
            ? 'Giveaway wurde dauerhaft gelöscht.'
            : (action === 'draw' ? `Gewinner gezogen: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}` : (action === 'replaceLast' ? `Letzter Gewinner ersetzt. Neuer Gewinner: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}` : 'Giveaway wurde aktualisiert.')));
        setMessage(msg);
      }
    } catch (err) {
      if (controlOpen) {
        const box = root?.querySelector('[data-lgw-control-error]');
        if (box) box.textContent = err.message || String(err);
        else state.error = err.message || String(err);
      } else {
        state.error = err.message || String(err);
      }
    } finally {
      state.saving = false;
      if (controlOpen && !(action === 'archive' || action === 'hardDelete')) {
        await refreshControlModal(uid).catch(() => render());
      } else {
        render();
      }
    }
  }

  async function claimWheel(userLogin, userDisplayName, uid = state.selectedUid){
    if (!uid || !userLogin) return;
    const controlOpen = isControlModalFor(uid);
    state.saving = true;
    if (!controlOpen) render();
    try {
      await apiPost(`${api.detailBase}/${encodeURIComponent(uid)}/wheel/claim`, {
        userLogin,
        userDisplayName: userDisplayName || userLogin,
        source: 'dashboard',
        duration: 7000
      });
      await refreshGiveaways(uid, false);
      state.modal = { type:'control', uid };
      startControlRefresh();
      await refreshControlModal(uid);
    } catch (err) {
      if (controlOpen) {
        const box = root?.querySelector('[data-lgw-control-error]');
        if (box) box.textContent = err.message || String(err);
        else state.error = err.message || String(err);
      } else {
        state.error = err.message || String(err);
      }
    } finally {
      state.saving = false;
      if (controlOpen) await refreshControlModal(uid).catch(() => render());
      else render();
    }
  }

  async function confirmClaim(uid, winnerUid){
    if (!uid || !winnerUid) return;
    if (!window.confirm('Claim für diesen Gewinner manuell bestätigen?')) return;
    const controlOpen = isControlModalFor(uid);
    state.saving = true;
    if (!controlOpen) render();
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
      startControlRefresh();
      await refreshControlModal(uid);
    } catch (err) {
      if (controlOpen) {
        const box = root?.querySelector('[data-lgw-control-error]');
        if (box) box.textContent = err.message || String(err);
        else state.error = err.message || String(err);
      } else {
        state.error = err.message || String(err);
      }
    } finally {
      state.saving = false;
      if (controlOpen) await refreshControlModal(uid).catch(() => render());
      else render();
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

  // Opens the giveaway-bound wheel editor as a modal inside the new Giveaway-Control.
  // It must not route into the old loyalty_games inline giveaway UI.


  function renderImportantCardActions(g){
    const uid = esc(g.giveawayUid || '');
    const s = norm(g.status);
    const editable = g.editable === true || s === 'draft';
    const wheel = isWheelGiveaway(g);
    const actions = [];
    if (editable) actions.push(`<button class="lgw-btn lgw-btn-small lgw-btn-secondary" data-lgw-edit="${uid}">Bearbeiten</button>`);
    if (wheel) {
      actions.push(`<button class="lgw-btn lgw-btn-small lgw-btn-secondary" data-lgw-open-wheel-editor="${uid}">${wheelEditorButtonLabel(g)}</button>`);
    }
    if (canStartGiveaway(g)) actions.push(`<button class="lgw-btn lgw-btn-small" data-lgw-action="open" data-uid="${uid}">Starten</button>`);
    if (isActiveGiveaway(g) && s !== 'draft') actions.push(`<button class="lgw-btn lgw-btn-small" data-lgw-open-control="${uid}">Steuern</button>`);
    const archiveDelete = renderArchiveDeleteActions(g, 'lgw-btn-small');
    if (archiveDelete) actions.push(archiveDelete);
    if (!actions.length) actions.push(`<button class="lgw-btn lgw-btn-small" data-lgw-open-details="${uid}">Anzeigen</button>`);
    return actions.join('');
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
    const important = importantGiveaways();
    const active = activeGiveaways();
    const preparedCount = important.filter(g => norm(g.status) === 'draft' || g.setupComplete === false || Array.isArray(g.setupIssues) && g.setupIssues.length > 0).length;
    const selectedImportantUid = important.some(g => g.giveawayUid === state.selectedUid) ? state.selectedUid : (important[0]?.giveawayUid || '');
    return `
      <section class="lgw-panel lgw-active-panel">
        <div class="lgw-panel-head">
          <div>
            <h3>Aktive & vorbereitete Giveaways</h3>
            <p class="lgw-muted">Laufende, vorbereitete und unvollständige Giveaways bleiben hier sichtbar. Fehlende Glücksräder können direkt im Editor angelegt werden.</p>
          </div>
          <strong>${fmtNumber(important.length)}</strong>
        </div>
        ${important.length ? `
          <div class="lgw-active-row">
            <label>Giveaway auswählen
              <select data-lgw-active-select>
                ${important.map(g => `<option value="${esc(g.giveawayUid)}" ${g.giveawayUid === selectedImportantUid ? 'selected' : ''}>${esc(g.title || g.giveawayUid)} · ${esc(statusLabel(g.status))}</option>`).join('')}
              </select>
            </label>
            ${renderImportantPrimaryButton(important.find(g => g.giveawayUid === selectedImportantUid) || important[0])}
          </div>
          <div class="lgw-active-summary">
            <span>${fmtNumber(active.length)} aktiv</span>
            <span>${fmtNumber(preparedCount)} vorbereitet/offen</span>
          </div>
          <div class="lgw-active-cards">
            ${important.slice(0, 8).map(g => {
              const issue = setupIssueText(g);
              const isSelected = g.giveawayUid === state.selectedUid;
              const isHighlighted = g.giveawayUid === state.highlightedUid;
              return `
                <article class="lgw-active-card ${isSelected ? 'is-active' : ''} ${isHighlighted ? 'is-highlighted' : ''} ${g.setupComplete === false ? 'is-incomplete' : ''}">
                  <button class="lgw-active-card-main" data-lgw-open-details="${esc(g.giveawayUid)}" title="Giveaway-Details öffnen">
                    <strong>${esc(g.title || '-')}</strong>
                    <span>${statusBadge(g.setupComplete === false ? 'unvollständig' : g.status)}</span>
                    <small>${norm(g.status) === 'draft' ? 'Erstellt' : 'Start'}: ${fmtDate(norm(g.status) === 'draft' ? g.createdAt : giveawayStartDate(g))}</small>
                    ${issue ? `<small class="lgw-card-issue">${esc(issue)}</small>` : ''}
                  </button>
                  <div class="lgw-active-card-actions">
                    ${renderImportantCardActions(g)}
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        ` : `<p class="lgw-muted">Aktuell kein aktives oder vorbereitetes Giveaway.</p>`}
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
                ['all','Alle'], ['active','Nur aktive'], ['draft','Entwurf'], ['open','Offen'], ['closed_for_entries','Teilnahme geschlossen'], ['waiting_for_claim','Wartet auf Claim'], ['waiting_for_wheel','Wartet auf Glücksrad'], ['wheel_completed','Glücksrad abgeschlossen'], ['finished','Beendet'], ['cancelled','Abgebrochen'], ['deleted','Archiviert']
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
            <h3>Alle Giveaways</h3>
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
                  ${canStartGiveaway(g) ? `<button class="lgw-btn lgw-btn-small" data-lgw-action="open" data-uid="${esc(g.giveawayUid)}">Starten</button>` : ''}
                  ${isWheelGiveaway(g) ? `<button class="lgw-btn lgw-btn-small lgw-btn-secondary" data-lgw-open-wheel-editor="${esc(g.giveawayUid)}">${wheelEditorButtonLabel(g)}</button>` : ''}
                  ${isActiveGiveaway(g) ? `<button class="lgw-btn lgw-btn-small" data-lgw-open-control="${esc(g.giveawayUid)}">Steuern</button>` : ''}
                  ${renderArchiveDeleteActions(g, 'lgw-btn-small')}
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
            ${renderArchiveDeleteActions(g, '')}
          </div>
        </div>
        <div class="lgw-kv lgw-kv-compact">
          <span>Status</span><strong>${statusBadge(g.status)}</strong>
          <span>Modus</span><strong>${esc(statusLabel(g.mode))}</strong>
          <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein'}</strong>
          <span>Kosten/Ticket</span><strong>${fmtNumber(g.costAmount)} Kekskrümel</strong>
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
    const isWheelMode = mode.startsWith('wheel_');
    const claim = getChatClaimSettings(g);
    const claimEnabled = !isWheelMode && claim.enabled === true;
    const prize = rows(g?.prizes || [])[0] || {};
    return `
      <label>Titel<input name="title" value="${esc(g?.title || '')}" required></label>
      <label>Beschreibung<textarea name="description" rows="3">${esc(g?.description || '')}</textarea></label>
      <div class="lgw-form-row">
        <label>Modus<select name="mode" data-lgw-form-mode>${[
          ['classic_single','Normales Giveaway'], ['wheel_single','Glücksrad-Giveaway']
        ].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <label>Glücksrad-Preset-UID<input name="wheelPresetUid" value="${esc(g?.wheelPresetUid || '')}" placeholder="optional"></label>
      </div>
      <div class="lgw-form-row">
        <label>Kosten pro Ticket (Kekskrümel)<input name="costAmount" type="number" min="0" value="${esc(g?.costAmount ?? 0)}"><small class="lgw-muted">0 = kostenlos. Bei Kosten werden Punkte beim Ticket-Kauf gebucht.</small></label>
        <label>Max Tickets/User<input name="maxTicketsPerUser" type="number" min="1" value="${esc(g?.maxTicketsPerUser ?? 1)}"></label>
      </div>
      <div class="lgw-form-row">
        <label>Gewinneranzahl<input name="winnerCount" type="number" min="1" value="${esc(g?.winnerCount ?? 1)}"></label>
        <label>Sub-Luck Faktor<input name="subscriberLuckMultiplier" type="number" min="1" value="${esc(g?.subscriberLuckMultiplier ?? 1)}"></label>
      </div>
      <div class="lgw-form-note">
        Weitere Gewinner werden aus den bisherigen Teilnehmern gezogen. Bereits gezogene Gewinner werden nicht erneut gezogen; Tickets der übrigen Teilnehmer bleiben erhalten.
      </div>
      <div class="lgw-check-row" data-lgw-normal-claim ${isWheelMode ? 'hidden' : ''}>
        <label class="lgw-check"><input name="chatClaimEnabled" type="checkbox" data-lgw-claim-toggle ${claimEnabled ? 'checked' : ''}> Gewinner muss sich im Chat melden</label>
      </div>
      <div class="lgw-form-row" data-lgw-claim-options ${claimEnabled ? '' : 'hidden'}>
        <label>Chat-Claim Timeout<input name="chatClaimTimeoutSeconds" type="number" min="10" value="${esc(claim.timeoutSeconds || 60)}"></label>
        <label>Claim-Modus<select name="chatClaimMode"><option value="any_message" ${claim.mode === 'any_message' ? 'selected' : ''}>Irgendeine Chatnachricht</option></select></label>
      </div>
      <div class="lgw-form-note" data-lgw-wheel-hint ${isWheelMode ? '' : 'hidden'}>
        Bei Glücksrad-Giveaways werden die Gewinne im Glücksrad-Editor gepflegt. Die Drehung dient als Claim.
      </div>
      <div data-lgw-normal-prize ${isWheelMode ? 'hidden' : ''}>
        <div class="lgw-form-row">
          <label>Gewinn-Label<input name="prizeLabel" value="${esc(prize.label || g?.title || '')}"></label>
          <label>Gewinn-Menge<input name="prizeQuantity" type="number" min="1" value="${esc(prize.quantityTotal || g?.winnerCount || 1)}"></label>
        </div>
        <label>Gewinn-Beschreibung<textarea name="prizeDescription" rows="2">${esc(prize.description || '')}</textarea></label>
      </div>
      <div class="lgw-check-row">
        <label class="lgw-check"><input name="firstTicketFree" type="checkbox" ${g?.firstTicketFree ? 'checked' : ''}> erstes Ticket kostenlos</label>
        <label class="lgw-check"><input name="subOnly" type="checkbox" ${g?.subOnly ? 'checked' : ''}> nur Subs</label>
      </div>
    `;
  }

  function syncGiveawayFormVisibility(form){
    if (!form) return;
    const mode = String(form.querySelector('[name="mode"]')?.value || 'classic_single');
    const isWheelMode = mode.startsWith('wheel_');
    const claimToggle = form.querySelector('[name="chatClaimEnabled"]');
    const claimEnabled = !isWheelMode && claimToggle?.checked === true;
    form.querySelectorAll('[data-lgw-normal-claim]').forEach(el => { el.hidden = isWheelMode; });
    form.querySelectorAll('[data-lgw-claim-options]').forEach(el => { el.hidden = !claimEnabled; });
    form.querySelectorAll('[data-lgw-wheel-hint]').forEach(el => { el.hidden = !isWheelMode; });
    form.querySelectorAll('[data-lgw-normal-prize]').forEach(el => { el.hidden = isWheelMode; });
    if (isWheelMode && claimToggle) claimToggle.checked = false;
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
    if (state.modal.type === 'wheelEditor') return renderWheelEditorModal();
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

  function getControlState(g){
    const s = norm(g?.status);
    const wheel = isWheelGiveaway(g);
    const entries = activeEntries(g);
    const winners = winnerRows(g);
    const pendingClaims = openClaimWinners(g);
    const pendingPermissions = pendingWheelPermissions(g);
    const usedPermissions = usedWheelPermissions(g);
    const canStart = s === 'draft';
    const canClose = s === 'open';
    const canDraw = s === 'closed_for_entries' && winners.length < winnerTarget(g);
    const canFinish = !isFinalStatus(g?.status) && ['closed_for_entries','waiting_for_claim','waiting_for_wheel','open'].includes(s);
    const canCancel = !isFinalStatus(g?.status) && s !== 'finished';
    const latest = latestWinner(g);
    const latestStatus = norm(latest?.status);
    const drawnCount = winners.length;
    const targetCount = winnerTarget(g);
    const hasAnyWinner = drawnCount > 0;
    const canReplaceLast = hasAnyWinner && !isFinalStatus(g?.status) && !['claim_confirmed','awarded','finished','wheel_completed'].includes(latestStatus);
    return { s, wheel, entries, winners, pendingClaims, pendingPermissions, usedPermissions, canStart, canClose, canDraw, canFinish, canCancel, drawnCount, targetCount, canReplaceLast };
  }

  function renderParticipantList(g, controlState){
    const entries = sortedParticipantEntries(controlState.entries || activeEntries(g));
    const visible = entries.slice(0, Math.max(1, Number(state.participantLimit || 25)));
    const totalEntries = (controlState.entries || activeEntries(g)).length;
    const totalTickets = totalEntryTickets(controlState.entries || activeEntries(g));
    return `
      <section class="lgw-control-section lgw-participant-panel" data-lgw-participant-panel>
        <div class="lgw-participant-head">
          <div>
            <h4>Teilnehmerliste</h4>
            <p class="lgw-muted">${fmtNumber(totalEntries)} Teilnehmer / ${fmtNumber(totalTickets)} Tickets. Die Liste ist bewusst nur bei Bedarf sichtbar.</p>
          </div>
          <button class="lgw-btn lgw-btn-small lgw-btn-secondary" type="button" data-lgw-toggle-participants="close">Ausblenden</button>
        </div>
        <div class="lgw-participant-tools lgw-participant-tools-minimal">
          <label>Suche
            <input type="search" value="${esc(state.participantSearch)}" placeholder="Name oder Login..." data-lgw-participant-search autocomplete="off" />
          </label>
          <label>Sortieren nach
            <select data-lgw-participant-sort>
              ${[
                ['tickets','Tickets'],
                ['name','Name']
              ].map(([value,label]) => `<option value="${value}" ${state.participantSortBy === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          <label>Richtung
            <select data-lgw-participant-dir>
              <option value="desc" ${state.participantSortDir === 'desc' ? 'selected' : ''}>Absteigend</option>
              <option value="asc" ${state.participantSortDir === 'asc' ? 'selected' : ''}>Aufsteigend</option>
            </select>
          </label>
        </div>
        <div class="lgw-table-wrap lgw-participant-table-wrap">
          <table class="lgw-table lgw-participant-table lgw-participant-table-minimal">
            <thead><tr><th>User</th><th>Tickets</th></tr></thead>
            <tbody>
              ${visible.map(entry => `
                <tr>
                  <td><strong>${esc(entry.userDisplayName || entry.userLogin || '-')}</strong>${entry.userLogin && entry.userLogin !== entry.userDisplayName ? `<br><small>${esc(entry.userLogin)}</small>` : ''}</td>
                  <td><strong>${fmtNumber(entryTicketCount(entry))}</strong></td>
                </tr>
              `).join('') || `<tr><td colspan="2" class="lgw-muted">Keine passenden Teilnehmer gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="lgw-participant-footer">
          <span class="lgw-muted">Zeige ${fmtNumber(visible.length)} von ${fmtNumber(entries.length)} gefilterten Einträgen.</span>
          ${visible.length < entries.length ? `<button class="lgw-btn lgw-btn-small" type="button" data-lgw-participant-more>Mehr anzeigen</button>` : ''}
        </div>
      </section>
    `;
  }

  function renderControlContent(g){
    const c = getControlState(g);
    return `
      <div class="lgw-control-title">
        <div><strong>${esc(g.title || '-')}</strong><small>${esc(statusLabel(g.mode))} · ${esc(g.giveawayUid || '')}</small></div>
        ${statusBadge(g.status)}
      </div>
      <div class="lgw-control-phase">
        <strong>${esc(controlPhaseText(g))}</strong>
        <span>${c.wheel ? 'Glücksrad-Giveaway: Die Glücksrad-Drehung ist der Claim.' : 'Normales Giveaway: Chat-Claim ist optional je nach Config.'}</span>
      </div>
      <div class="lgw-grid lgw-grid-4 lgw-control-stats">
        <article class="lgw-card lgw-control-participant-card"><span>Teilnehmer</span><strong>${fmtNumber(c.entries.length)}</strong><small>${fmtNumber(totalEntryTickets(c.entries))} Tickets</small><button class="lgw-btn lgw-btn-small lgw-btn-secondary" type="button" data-lgw-toggle-participants="open">Teilnehmer anzeigen</button></article>
        <article class="lgw-card"><span>Gewinner</span><strong>${esc(winnerProgressText(g))}</strong><small>${esc(giveawayWinnerText(g))}</small></article>
        <article class="lgw-card"><span>${c.wheel ? 'Glücksrad' : 'Claim'}</span><strong>${c.wheel ? (c.pendingPermissions.length ? 'Wartet' : (c.usedPermissions.length ? 'Gedreht' : 'Bereit')) : (c.pendingClaims.length ? 'Wartet' : 'OK')}</strong><small>${c.wheel ? `${fmtNumber(c.pendingPermissions.length)} offen · ${fmtNumber(c.usedPermissions.length)} gedreht` : `${fmtNumber(c.pendingClaims.length)} offen`}</small></article>
        <article class="lgw-card"><span>Nächster Schritt</span><strong>${c.canStart ? 'Starten' : c.canClose ? 'Schließen' : c.canDraw ? (c.drawnCount > 0 ? 'Weiter auslosen' : 'Auslosen') : c.pendingClaims.length ? 'Claim' : c.pendingPermissions.length ? 'Drehung' : !isFinalStatus(g.status) ? 'Abschluss' : 'Fertig'}</strong><small>${fmtDate(g.updatedAt || g.openedAt || g.createdAt)}</small></article>
      </div>
      ${state.participantListOpen ? renderParticipantList(g, c) : ''}

      <section class="lgw-control-section">
        <h4>Ablauf</h4>
        <div class="lgw-control-actions">
          <button class="lgw-btn" data-lgw-action="open" data-uid="${esc(g.giveawayUid)}" ${c.canStart ? '' : 'disabled'}>Giveaway starten</button>
          <button class="lgw-btn lgw-btn-secondary" data-lgw-action="close" data-uid="${esc(g.giveawayUid)}" ${c.canClose ? '' : 'disabled'}>Teilnahme schließen</button>
          <button class="lgw-btn" data-lgw-action="draw" data-uid="${esc(g.giveawayUid)}" ${c.canDraw ? '' : 'disabled'}>${c.drawnCount > 0 ? 'Weiteren Gewinner auslosen' : 'Gewinner auslosen'}</button>
          <button class="lgw-btn lgw-btn-danger" data-lgw-action="replaceLast" data-uid="${esc(g.giveawayUid)}" ${c.canReplaceLast ? '' : 'disabled'}>Letzten Gewinner ersetzen</button>
        </div>
        <div class="lgw-control-help">
          <p><strong>Weiteren Gewinner auslosen</strong> zieht einen zusätzlichen Gewinner. Bereits gezogene Gewinner bleiben erhalten.</p>
          <p><strong>Letzten Gewinner ersetzen</strong> entfernt den letzten noch nicht abgeschlossenen Gewinner und lost direkt einen Ersatz aus.</p>
        </div>
      </section>

      <section class="lgw-control-section">
        <h4>${c.wheel ? 'Glücksrad-Claim' : 'Chat-Claim'}</h4>
        ${c.wheel ? `
          <p class="lgw-muted">Bei Glücksrad-Giveaways gilt: Gewinner auslosen → Gewinner dreht das Glücksrad → Drehung ist der Claim.</p>
          <div class="lgw-control-actions">
            <a class="lgw-btn lgw-btn-secondary" href="${api.overlay}" target="_blank">Glücksrad-Overlay öffnen</a>
            ${c.pendingPermissions.map(p => `<button class="lgw-btn" data-lgw-claim-wheel="${esc(p.userLogin)}" data-display-name="${esc(p.userDisplayName || p.userLogin)}" data-uid="${esc(g.giveawayUid)}">Glücksrad drehen für ${esc(p.userDisplayName || p.userLogin)}</button>`).join('')}
            ${!c.pendingPermissions.length ? `<button class="lgw-btn lgw-btn-disabled" disabled>Keine offene Glücksrad-Drehung</button>` : ''}
          </div>
          ${c.usedPermissions.length ? `<div class="lgw-mini-list">${c.usedPermissions.slice(-5).map(p => `<span>${esc(p.userDisplayName || p.userLogin || '-')} · ${esc(p.metadata?.resultLabel || p.spinUid || 'gedreht')}</span>`).join('')}</div>` : ''}
        ` : `
          <p class="lgw-muted">Bei normalen Giveaways kann ein Gewinner per Chat-Claim oder manuell bestätigt werden.</p>
          <div class="lgw-control-actions">
            ${c.pendingClaims.map(w => `<button class="lgw-btn" data-lgw-confirm-claim="${esc(w.winnerUid)}" data-uid="${esc(g.giveawayUid)}">Claim bestätigen: ${esc(w.userDisplayName || w.userLogin)}</button>`).join('')}
            ${!c.pendingClaims.length ? `<button class="lgw-btn lgw-btn-disabled" disabled>Kein offener Chat-Claim</button>` : ''}
          </div>
        `}
      </section>

      <section class="lgw-control-section">
        <h4>Abschluss</h4>
        <div class="lgw-control-actions">
          <button class="lgw-btn lgw-btn-secondary" data-lgw-refresh-control="${esc(g.giveawayUid)}">Aktualisieren</button>
          <button class="lgw-btn" data-lgw-action="finish" data-uid="${esc(g.giveawayUid)}" ${c.canFinish ? '' : 'disabled'}>Giveaway abschließen</button>
          <button class="lgw-btn lgw-btn-danger" data-lgw-action="cancel" data-uid="${esc(g.giveawayUid)}" ${c.canCancel ? '' : 'disabled'}>Giveaway abbrechen</button>
        </div>
      </section>

      <div class="lgw-warning">Mehrere Gewinner laufen über dieselbe Konsole: Nach einer bestätigten normalen Claim-Phase oder nach einer Glücksrad-Drehung springt das Giveaway wieder auf „Teilnahme geschlossen“, solange noch Gewinner offen sind. Dann kann über „Weiteren Gewinner auslosen“ der nächste Gewinner gezogen werden.</div>
      <div class="lgw-control-error" data-lgw-control-error></div>
    `;
  }

  function renderControlModal(){
    const uid = state.modal.uid || state.selectedUid;
    const g = uid === state.selectedUid ? selectedGiveaway() : rows(state.giveaways).find(item => item.giveawayUid === uid);
    if (!g) return '';
    return `
      <div class="lgw-modal-backdrop" data-lgw-close-modal>
        <div class="lgw-modal lgw-control-modal" role="dialog" aria-modal="true" aria-label="Giveaway steuern" data-lgw-modal-box>
          <div class="lgw-modal-head">
            <div>
              <h3>Giveaway steuern</h3>
              <p class="lgw-muted">Dieses Fenster ist die Live-Konsole. Nur Status, Gewinner, Claim-/Glücksrad-Daten und Buttons werden alle 5 Sekunden aktualisiert.</p>
            </div>
            <button class="lgw-icon-btn" data-lgw-close-modal type="button">×</button>
          </div>
          <div data-lgw-control-content="${esc(g.giveawayUid || '')}">
            ${renderControlContent(g)}
          </div>
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


  function bindControlEvents(scope){
    const area = scope || root;
    if (!area) return;
    area.querySelectorAll('[data-lgw-action]').forEach(btn => btn.addEventListener('click', () => {
      giveawayAction(btn.dataset.lgwAction, btn.dataset.uid, { openControl: ['open','draw','close','replaceLast','finish','cancel'].includes(btn.dataset.lgwAction) });
    }));
    area.querySelectorAll('[data-lgw-claim-wheel]').forEach(btn => btn.addEventListener('click', () => claimWheel(btn.dataset.lgwClaimWheel, btn.dataset.displayName, btn.dataset.uid)));
    area.querySelectorAll('[data-lgw-confirm-claim]').forEach(btn => btn.addEventListener('click', () => confirmClaim(btn.dataset.uid, btn.dataset.lgwConfirmClaim)));
    area.querySelectorAll('[data-lgw-toggle-participants]').forEach(btn => btn.addEventListener('click', async () => {
      state.participantListOpen = btn.dataset.lgwToggleParticipants !== 'close';
      state.participantLimit = 25;
      const uid = state.modal?.uid || state.selectedUid;
      if (uid) await refreshControlModal(uid);
    }));
    area.querySelector('[data-lgw-participant-search]')?.addEventListener('input', async ev => {
      state.participantSearch = ev.currentTarget.value;
      state.participantLimit = 25;
      const uid = state.modal?.uid || state.selectedUid;
      if (uid) await refreshControlModal(uid);
    });
    area.querySelector('[data-lgw-participant-sort]')?.addEventListener('change', async ev => {
      state.participantSortBy = ev.currentTarget.value;
      state.participantLimit = 25;
      const uid = state.modal?.uid || state.selectedUid;
      if (uid) await refreshControlModal(uid);
    });
    area.querySelector('[data-lgw-participant-dir]')?.addEventListener('change', async ev => {
      state.participantSortDir = ev.currentTarget.value;
      state.participantLimit = 25;
      const uid = state.modal?.uid || state.selectedUid;
      if (uid) await refreshControlModal(uid);
    });
    area.querySelector('[data-lgw-participant-more]')?.addEventListener('click', async () => {
      state.participantLimit = Math.min(Number(state.participantLimit || 25) + 25, 1000);
      const uid = state.modal?.uid || state.selectedUid;
      if (uid) await refreshControlModal(uid);
    });
    area.querySelectorAll('[data-lgw-refresh-control]').forEach(btn => btn.addEventListener('click', async () => {
      await refreshControlModal(btn.dataset.lgwRefreshControl);
      startControlRefresh();
    }));
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
    root.querySelectorAll('[data-lgw-open-wheel-editor]').forEach(btn => btn.addEventListener('click', async () => {
      const uid = btn.dataset.lgwOpenWheelEditor;
      await loadGiveaway(uid, false);
      openGiveawayWheelEditor(uid);
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

    bindControlEvents(root);

    root.querySelectorAll('[data-lgw-save-giveaway]').forEach(form => {
      syncGiveawayFormVisibility(form);
      form.querySelector('[name="mode"]')?.addEventListener('change', () => syncGiveawayFormVisibility(form));
      form.querySelector('[name="chatClaimEnabled"]')?.addEventListener('change', () => syncGiveawayFormVisibility(form));
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        syncGiveawayFormVisibility(ev.currentTarget);
        saveGiveaway(ev.currentTarget, ev.currentTarget.dataset.uid || '');
      });
    });

    root.querySelector('[data-lgw-create-wheel-field]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreateGiveawayWheelField(ev.currentTarget);
    });
    root.querySelectorAll('[data-lgw-update-wheel-field]').forEach(form => {
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        handleUpdateGiveawayWheelField(ev.currentTarget);
      });
    });
    root.querySelectorAll('[data-lgw-delete-wheel-field]').forEach(btn => {
      btn.addEventListener('click', () => deleteGiveawayWheelField(btn.dataset.lgwDeleteWheelField));
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

  return { loadAll, render, openGiveawayWheelEditor, openGiveawayDetails: async function(uid){ if (uid) await loadGiveaway(uid, false); openModal('details', uid); } };
})();
