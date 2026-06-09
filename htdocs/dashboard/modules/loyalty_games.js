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
    giveawayCommands: '/api/loyalty/giveaways/commands',
    giveawayTexts: '/api/loyalty/giveaways/texts',
    communicationStatus: '/api/communication/status',
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
    giveawayCommands: null,
    giveawayTexts: null,
    communicationStatus: null,
    selectedPresetUid: '',
    selectedPreset: null,
    selectedGiveawayUid: '',
    selectedGiveaway: null,
    activeTab: 'overview',
    presetEditorModal: { open: false, mode: 'create', context: 'presets', presetUid: '', targetGiveawayUid: '' },
    giveawayDraftWheelPresetUid: '',
    giveawayWheelPresetOverrides: {},
    giveawayEditorModal: { open: false, mode: 'create', giveawayUid: '' },
    giveawayStatusFilter: 'all'
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

  const INCOMPLETE_BADGE_STYLE = 'border-color:rgba(255,140,0,.78);background:rgba(255,140,0,.16);color:#ffb35c;box-shadow:0 0 14px rgba(255,140,0,.18)';

  function statusLabel(status){
    const clean = String(status || '').toLowerCase();
    const labels = {
      active: 'Aktiv',
      running: 'Läuft',
      ok: 'OK',
      open: 'Offen',
      draft: 'Entwurf',
      paused: 'Pausiert',
      closed_for_entries: 'Teilnahme geschlossen',
      finished: 'Beendet',
      exhausted: 'Aufgebraucht',
      cancelled: 'Abgebrochen',
      deleted: 'Gelöscht',
      pending: 'Ausstehend',
      used: 'Genutzt',
      classic_single: 'Classic Single',
      classic_multi: 'Classic Multi',
      wheel_single: 'Wheel Single',
      wheel_multi: 'Wheel Multi'
    };
    return labels[clean] || String(status || '-');
  }

  function statusBadge(status){
    const clean = String(status || '').toLowerCase();
    const label = statusLabel(status);
    if (['active', 'running', 'ok', 'open'].includes(clean)) return `<span class="lg-badge lg-badge-ok">${esc(label)}</span>`;
    if (['draft', 'paused', 'closed_for_entries'].includes(clean)) return `<span class="lg-badge lg-badge-warn">${esc(label)}</span>`;
    return `<span class="lg-badge lg-badge-off">${esc(label)}</span>`;
  }

  function setupBadge(giveaway){
    if (!giveaway) return '';
    if (giveaway.setupComplete === true) return `<span class="lg-badge lg-badge-ok">Bereit</span>`;
    return `<span class="lg-badge lg-badge-incomplete" style="${INCOMPLETE_BADGE_STYLE}">Unvollständig</span>`;
  }

  function setupIssuesText(giveaway){
    const issues = rows(giveaway?.setupIssues);
    if (!issues.length) return '';
    return issues.map(issue => issue.message || issue.code || 'Pflichtangabe fehlt').join(', ');
  }

  function setupWarningBlock(giveaway){
    if (!giveaway || giveaway.setupComplete === true) return '';
    const text = setupIssuesText(giveaway) || 'Es fehlen noch Pflichtangaben.';
    return `<p class="lg-warning"><strong>Noch nicht bereit:</strong> ${esc(text)}<br><small>Speichern als Entwurf ist erlaubt. Öffnen ist erst möglich, wenn alle Pflichtdaten vollständig sind.</small></p>`;
  }


  function isFinalGiveawayStatus(status){
    return ['finished', 'cancelled', 'deleted'].includes(String(status || '').toLowerCase());
  }

  function canEditGiveaway(giveaway){
    return !!giveaway && String(giveaway.status || '').toLowerCase() === 'draft' && giveaway.editable !== false;
  }

  function hasPendingWheel(giveaway){
    const winners = rows(giveaway?.winners || []);
    const permissions = rows(giveaway?.wheelPermissions || []);
    return winners.some(winner => String(winner.status || '').toLowerCase() === 'waiting_for_wheel')
      || permissions.some(permission => String(permission.status || '').toLowerCase() === 'pending');
  }

  function giveawayFilterMatches(giveaway, filter){
    const clean = String(filter || 'all').toLowerCase();
    const status = String(giveaway?.status || '').toLowerCase();
    if (clean === 'all') return true;
    if (clean === 'incomplete') return giveaway?.setupComplete === false;
    if (clean === 'ready') return status === 'draft' && giveaway?.setupComplete === true;
    if (clean === 'draw_open') return status === 'closed_for_entries';
    if (clean === 'wheel_open') return hasPendingWheel(giveaway);
    return status === clean;
  }

  function ensureLoyaltyMainSection(){
    if (!window.CGN) return;

    window.CGN.sections.loyalty = {
      label: 'Loyalty',
      icon: '🎟️',
      role: 'mod/supermod/streamer',
      description: 'Core, Glücksrad, Giveaways, Raffles, Texte, Statistik, Config und Verlauf.',
      items: ['loyalty_games']
    };

    const nav = document.querySelector('#mainNav .nav-main-block');
    if (nav && !nav.querySelector('[data-section="loyalty"]')) {
      const btn = document.createElement('button');
      btn.className = 'nav-main-item';
      btn.dataset.section = 'loyalty';
      btn.innerHTML = '<span class="nav-icon">🎟️</span><span class="nav-label"><strong>Loyalty</strong><small>Punkte, Glücksrad, Giveaways</small></span>';

      const communityBtn = nav.querySelector('[data-section="community"]');
      if (communityBtn) nav.insertBefore(btn, communityBtn);
      else nav.appendChild(btn);

      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        window.CGN.setActiveModule('loyalty_games', { section: 'loyalty' });
      });
    }
  }

  function registerDashboardModule(){
    if (!window.CGN) return;
    ensureLoyaltyMainSection();

    window.CGN.modules.loyalty_games = {
      title: 'Loyalty',
      panelId: 'loyaltyGamesModule',
      group: 'loyalty',
      overlayLink: api.overlay,
      overlayLabel: 'Glücksrad-Overlay öffnen',
      reload(){ return window.LoyaltyGamesModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty_games = {
      label: 'Loyalty',
      icon: '🎡',
      enabled: true,
      description: 'Loyalty-Zentrale mit Core, Glücksrad, Giveaways, Raffles, Texten, Statistik und Config.'
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
    if (!force && state.status && state.wheelStatus && state.presets && state.giveaways && state.giveawayCommands && state.giveawayTexts && state.communicationStatus) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.config).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.routes).catch(err => ({ ok:false, error:err.message, routes:[] })),
        window.CGN.api(api.sessions).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.wheelStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.wheelConfig).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.presets).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.spins).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawaysStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.giveaways).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayCommands).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] })),
        window.CGN.api(api.communicationStatus).catch(err => ({ ok:false, error:err.message, status:{ clients:[] } }))
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

      state = { ...state, loading:false, error:'', status, config, routes, sessions, wheelStatus, wheelConfig, presets, spins, giveawaysStatus, giveaways, giveawayCommands, giveawayTexts, communicationStatus, selectedPresetUid, selectedGiveawayUid };
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
      state.activeTab = 'wheel';
      setMessage('Preset wurde erstellt.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function collectFieldUpdates(){
    return Array.from(document.querySelectorAll('[data-lg-field-card][data-field-uid]')).map(card => {
      const data = new FormData();
      card.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
        if (input.type === 'checkbox') {
          if (input.checked) data.set(input.name, 'on');
        } else {
          data.set(input.name, input.value);
        }
      });
      return {
        fieldUid: card.dataset.fieldUid || '',
        payload: {
          label: data.get('label'),
          subLabel: data.get('subLabel'),
          weight: Number(data.get('weight') || 1),
          quantityTotal: Number(data.get('quantityTotal') || 1),
          rewardType: data.get('rewardType') || 'manual',
          rewardValue: data.get('rewardValue') || '',
          enabled: data.get('enabled') === 'on',
          sortOrder: Number(data.get('sortOrder') || 1)
        }
      };
    }).filter(item => item.fieldUid);
  }

  async function handleUpdatePreset(form){
    const presetUid = state.selectedPresetUid;
    if (!presetUid) return;
    const data = new FormData(form);
    const fieldUpdates = state.selectedPreset?.editable ? collectFieldUpdates() : [];
    state.saving = true; render();
    try {
      await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}`, {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        removeAfterWin: data.get('removeAfterWin') === 'on',
        actor: 'dashboard'
      });
      for (const field of fieldUpdates) {
        await apiPut(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(field.fieldUid)}`, field.payload);
      }
      await refreshPresets(presetUid);
      if (state.presetEditorModal?.open && state.presetEditorModal?.context === 'giveaways') {
        const targetGiveawayUid = state.presetEditorModal?.targetGiveawayUid || '';
        rememberGiveawayWheelPresetSelection(targetGiveawayUid, presetUid);
        if (targetGiveawayUid) await attachPresetToGiveaway(targetGiveawayUid, presetUid);
        state.activeTab = 'giveaways';
        state.presetEditorModal = { open: false, mode: 'create', context: 'presets', presetUid: '', targetGiveawayUid: '' };
        await refreshGiveaways(targetGiveawayUid || state.selectedGiveawayUid);
        setMessage('Glücksrad wurde gespeichert und im Giveaway ausgewählt.');
      } else {
        setMessage(fieldUpdates.length ? 'Preset und Felder wurden gespeichert.' : 'Preset wurde gespeichert.');
      }
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
    if (!window.confirm('Feld wirklich entfernen?')) return;

    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/games/wheel/presets/${encodeURIComponent(presetUid)}/fields/${encodeURIComponent(fieldUid)}/delete`, { actor: 'dashboard' });
      await refreshPresets(presetUid);
      setMessage('Feld wurde entfernt.');
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

  function isWheelGiveawayMode(mode){
    return String(mode || '').startsWith('wheel_');
  }

  function getGiveawayWheelPresetSelection(giveaway, wheelMode){
    if (!wheelMode) return '';
    const giveawayUid = String(giveaway?.giveawayUid || '').trim();
    if (giveawayUid && state.giveawayWheelPresetOverrides && state.giveawayWheelPresetOverrides[giveawayUid]) {
      return state.giveawayWheelPresetOverrides[giveawayUid];
    }
    if (!giveaway && state.giveawayDraftWheelPresetUid) return state.giveawayDraftWheelPresetUid;
    return giveaway?.wheelPresetUid || '';
  }

  function rememberGiveawayWheelPresetSelection(giveawayUid, presetUid){
    const uid = String(giveawayUid || '').trim();
    const preset = String(presetUid || '').trim();
    if (uid) {
      state.giveawayWheelPresetOverrides = { ...(state.giveawayWheelPresetOverrides || {}), [uid]: preset };
      return;
    }
    state.giveawayDraftWheelPresetUid = preset;
  }

  function clearGiveawayWheelPresetSelection(giveawayUid){
    const uid = String(giveawayUid || '').trim();
    if (uid && state.giveawayWheelPresetOverrides) {
      const next = { ...state.giveawayWheelPresetOverrides };
      delete next[uid];
      state.giveawayWheelPresetOverrides = next;
    } else {
      state.giveawayDraftWheelPresetUid = '';
    }
  }

  function syncGiveawayWheelPresetVisibility(form){
    if (!form) return;
    const modeSelect = form.querySelector('[data-lg-giveaway-mode-select]');
    const presetRow = form.querySelector('[data-lg-wheel-preset-row]');
    const presetSelect = form.querySelector('[data-lg-wheel-preset-select]');
    const wheelMode = isWheelGiveawayMode(modeSelect?.value || 'classic_single');

    if (presetRow) presetRow.style.display = wheelMode ? '' : 'none';
    if (presetSelect) {
      const editable = presetSelect.dataset.editable === '1';
      presetSelect.disabled = !editable || !wheelMode;
      if (!wheelMode) presetSelect.value = '';
    }
  }

  function buildGiveawayPayload(form){
    const data = new FormData(form);
    const mode = String(data.get('mode') || 'classic_single');
    const wheelMode = isWheelGiveawayMode(mode);
    return {
      title: data.get('title'),
      description: data.get('description'),
      mode,
      wheelEnabled: wheelMode,
      wheelPresetUid: wheelMode ? (data.get('wheelPresetUid') || '') : '',
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

  function buildGiveawayPayloadFromRecord(giveaway, override = {}){
    const currentMode = String(override.mode || giveaway?.mode || 'classic_single');
    const wheelMode = isWheelGiveawayMode(currentMode);
    const round = giveaway?.roundPolicy || {};
    const prize = rows(giveaway?.prizes || [])[0] || {};
    const wheelPresetUid = override.wheelPresetUid !== undefined
      ? String(override.wheelPresetUid || '').trim()
      : String(giveaway?.wheelPresetUid || '').trim();

    return {
      title: override.title !== undefined ? override.title : (giveaway?.title || ''),
      description: override.description !== undefined ? override.description : (giveaway?.description || ''),
      mode: currentMode,
      wheelEnabled: wheelMode,
      wheelPresetUid: wheelMode ? wheelPresetUid : '',
      costAmount: Number(override.costAmount ?? giveaway?.costAmount ?? 0),
      maxTicketsPerUser: Number(override.maxTicketsPerUser ?? giveaway?.maxTicketsPerUser ?? 1),
      firstTicketFree: override.firstTicketFree ?? giveaway?.firstTicketFree ?? false,
      subOnly: override.subOnly ?? giveaway?.subOnly ?? false,
      subscriberLuckMultiplier: Number(override.subscriberLuckMultiplier ?? giveaway?.subscriberLuckMultiplier ?? 1),
      winnerCount: Number(override.winnerCount ?? giveaway?.winnerCount ?? 1),
      roundPolicy: {
        roundMode: override.roundMode || round.roundMode || 'single',
        allowNewEntriesBetweenRounds: override.allowNewEntriesBetweenRounds ?? round.allowNewEntriesBetweenRounds ?? false,
        removeWinnerAfterRound: override.removeWinnerAfterRound ?? round.removeWinnerAfterRound ?? true,
        ticketCarryoverMode: override.ticketCarryoverMode || round.ticketCarryoverMode || 'none'
      },
      prizes: [{
        label: prize.label || giveaway?.title || 'Gewinn',
        description: prize.description || '',
        quantityTotal: Number(prize.quantityTotal || prize.quantity_total || 1)
      }],
      actor: 'dashboard'
    };
  }

  async function attachPresetToGiveaway(giveawayUid, presetUid){
    const uid = String(giveawayUid || '').trim();
    const preset = String(presetUid || '').trim();
    if (!uid || !preset) return false;
    const giveaway = rows(state.giveaways).find(item => item.giveawayUid === uid) || state.selectedGiveaway;
    if (!giveaway || !canEditGiveaway(giveaway)) return false;
    const payload = buildGiveawayPayloadFromRecord(giveaway, { mode: giveaway.mode || 'wheel_single', wheelPresetUid: preset });
    await apiPut(`/api/loyalty/giveaways/${encodeURIComponent(uid)}`, payload);
    clearGiveawayWheelPresetSelection(uid);
    return true;
  }

  async function handleCreateGiveaway(form){
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/giveaways', buildGiveawayPayload(form));
      const uid = result.giveaway?.giveawayUid;
      clearGiveawayWheelPresetSelection('');
      state.giveawayEditorModal = { open: false, mode: 'create', giveawayUid: '' };
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
      clearGiveawayWheelPresetSelection(giveawayUid);
      state.giveawayEditorModal = { open: false, mode: 'create', giveawayUid: '' };
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


  function communicationClients(){
    return rows(state.communicationStatus?.status?.clients || state.communicationStatus?.clients || []);
  }

  function findCommunicationClient(moduleName){
    const clients = communicationClients();
    return clients.find(client =>
      client.module === moduleName ||
      client.id === `module:${moduleName}` ||
      client.id === moduleName ||
      String(client.id || '').includes(moduleName)
    ) || null;
  }

  function getHealthInfo(moduleName, fallbackOk, options = {}){
    const client = findCommunicationClient(moduleName);
    if (!client) {
      if (options.planned) return { color: 'gray', label: 'geplant', detail: 'noch nicht installiert', client: null };
      return {
        color: fallbackOk ? 'yellow' : 'red',
        label: fallbackOk ? 'Status OK' : 'offline',
        detail: fallbackOk ? 'API ok, kein Bus-Client gefunden' : 'nicht angemeldet',
        client: null
      };
    }

    const status = String(client.status || '').toLowerCase();
    const hasHeartbeat = client.hasHeartbeat === true || Number(client.heartbeatCount || 0) > 0;
    if (status === 'online' && hasHeartbeat) {
      return {
        color: 'green',
        label: 'online',
        detail: `Heartbeat ${fmtNumber(client.heartbeatCount || 0)}`,
        client
      };
    }

    if (status === 'online') {
      return { color: 'yellow', label: 'online', detail: 'kein Heartbeat', client };
    }

    return { color: 'red', label: client.status || 'offline', detail: client.lastError || 'nicht bereit', client };
  }

  function renderAmpel(info){
    return `<span class="lg-ampel lg-ampel-${esc(info.color)}" title="${esc(info.detail)}"></span>`;
  }

  function renderModuleCard(item){
    const info = item.health;
    return `
      <button class="lg-module-card" data-lg-jump-tab="${esc(item.tab || 'overview')}">
        <span class="lg-module-card-top">
          <span class="lg-module-icon">${esc(item.icon || '•')}</span>
          ${renderAmpel(info)}
        </span>
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.description || '')}</small>
        <span class="lg-module-state">${esc(info.label)} · ${esc(info.detail)}</span>
      </button>
    `;
  }

  function renderOverview(){
    const status = state.status || {};
    const diag = status.diagnostics || {};
    const wheel = state.wheelStatus || status.games?.wheel || {};
    const presetDiag = diag.presets || {};
    const giveawaysDiag = state.giveawaysStatus?.diagnostics?.counts || {};
    const db = diag.database || {};
    const clients = communicationClients();

    const gamesHealth = getHealthInfo('loyalty_games', status.ok !== false && !status.lastError);
    const giveawaysHealth = getHealthInfo('loyalty_giveaways', state.giveawaysStatus?.ok !== false);
    const overlayHealth = getHealthInfo('loyalty_wheel_overlay', false);
    const coreHealth = getHealthInfo('loyalty', true);
    const rewardsHealth = getHealthInfo('loyalty_rewards', false, { planned: true });
    const channelpointsHealth = getHealthInfo('channelpoints', false);

    const incompleteGiveaways = rows(state.giveaways).filter(g => g && g.setupComplete === false).length;
    const openGiveaways = giveawaysDiag.open || rows(state.giveaways).filter(g => String(g.status || '').toLowerCase() === 'open').length;
    const activePresets = presetDiag.active || rows(state.presets).filter(p => String(p.status || '').toLowerCase() === 'active').length;

    const moduleCards = [
      {
        title: 'Core',
        icon: '💰',
        tab: 'points',
        description: 'User, Punkte, Währungen und Transaktionen',
        health: coreHealth
      },
      {
        title: 'Glücksrad',
        icon: '🎡',
        tab: 'wheel',
        description: `${fmtNumber(activePresets)} aktive Presets · ${fmtNumber(wheel.fields || 0)} Felder im Live-Rad`,
        health: gamesHealth
      },
      {
        title: 'Giveaways',
        icon: '🎁',
        tab: 'giveaways',
        description: `${fmtNumber(openGiveaways)} offen · ${fmtNumber(incompleteGiveaways)} unvollständig`,
        health: incompleteGiveaways > 0 ? { color: 'yellow', label: 'Warnung', detail: `${fmtNumber(incompleteGiveaways)} unvollständig` } : giveawaysHealth
      },
      {
        title: 'Raffles',
        icon: '🎫',
        tab: 'raffles',
        description: 'schnelle Chat-Verlosungen · geplant',
        health: rewardsHealth
      },
      {
        title: 'Texte',
        icon: '💬',
        tab: 'texts',
        description: 'Multi-Textverwaltung für Loyalty-Module',
        health: giveawaysHealth
      },
      {
        title: 'Statistik',
        icon: '📊',
        tab: 'statistics',
        description: 'Nutzung, Gewinner, Gewinne und Teilnehmer',
        health: coreHealth
      },
      {
        title: 'Config',
        icon: '⚙️',
        tab: 'config',
        description: 'zentrale Einstellungen und Setup-Prüfungen',
        health: channelpointsHealth
      },
      {
        title: 'Verlauf',
        icon: '📜',
        tab: 'history',
        description: 'Events, Spins, Ziehungen und Audit',
        health: gamesHealth
      }
    ];

    return `
      <div class="lg-loyalty-home">
        <div class="lg-home-hero">
          <div>
            <p class="lg-eyebrow">Loyalty Control Center</p>
            <h3>Übersicht</h3>
            <p class="lg-muted">Wähle direkt den Loyalty-Bereich. Globale Glücksrad-Presets liegen unter Glücksrad, Giveaway-Glücksräder im jeweiligen Giveaway.</p>
          </div>
          <div class="lg-home-legend">
            <span>${renderAmpel({color:'green', detail:'ok'})} aktiv</span>
            <span>${renderAmpel({color:'yellow', detail:'warnung'})} warnung/teilweise</span>
            <span>${renderAmpel({color:'red', detail:'fehler'})} fehler/offline</span>
            <span>${renderAmpel({color:'gray', detail:'geplant'})} geplant</span>
          </div>
        </div>

        <div class="lg-module-grid">
          ${moduleCards.map(renderModuleCard).join('')}
        </div>
      </div>

      <div class="lg-grid lg-grid-4">
        <article class="lg-card">
          <span class="lg-card-label">CanBus Clients</span>
          <strong>${fmtNumber(clients.length)}</strong>
          <small>registrierte Clients im Communication-Bus</small>
          ${badge(state.communicationStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Glücksrad</span>
          <strong>${wheel.running ? 'Dreht gerade' : 'Bereit'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'} · ${fmtNumber(wheel.fields || 0)} Felder</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Glücksrad-Presets</span>
          <strong>${fmtNumber(presetDiag.presets || rows(state.presets).length)}</strong>
          <small>unter Glücksrad · aktiv ${fmtNumber(presetDiag.active || 0)} · aufgebraucht ${fmtNumber(presetDiag.exhausted || 0)}</small>
          ${badge(true, 'DB')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Giveaways</span>
          <strong>${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)}</strong>
          <small>Entwürfe ${fmtNumber(giveawaysDiag.draft || 0)} · offen ${fmtNumber(giveawaysDiag.open || 0)}</small>
          ${badge(state.giveawaysStatus?.ok !== false, 'OK', 'Fehler')}
        </article>
      </div>

      <div class="lg-panel">
        <h3>Systemstatus</h3>
        <div class="lg-kv">
          <span>Core/Glücksrad Schema</span><strong>${esc(String(diag.schemaReady ?? '-'))}</strong>
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
          <span class="lg-card-label">Glücksrad Status</span>
          <strong>${wheel.running ? 'Dreht gerade' : 'Bereit'}</strong>
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


  async function openPresetEditorModal(options = {}){
    const mode = options.mode === 'edit' ? 'edit' : 'create';
    const presetUid = String(options.presetUid || '').trim();
    state.presetEditorModal = {
      open: true,
      mode,
      context: String(options.context || state.activeTab || 'presets').trim() || 'presets',
      presetUid,
      targetGiveawayUid: String(options.targetGiveawayUid || '').trim()
    };
    if (mode === 'edit' && presetUid && presetUid !== state.selectedPresetUid) {
      await loadPreset(presetUid, false);
    }
    render();
  }

  function closePresetEditorModal(){
    state.presetEditorModal = { open: false, mode: 'create', context: 'presets', presetUid: '', targetGiveawayUid: '' };
    render();
  }

  async function handleCreatePresetFromModal(form){
    const data = new FormData(form);
    state.saving = true; render();
    try {
      const result = await apiPost('/api/loyalty/games/wheel/presets', {
        name: data.get('name'),
        description: data.get('description'),
        minVisibleSlots: Number(data.get('minVisibleSlots') || 12),
        status: data.get('status') || 'draft',
        removeAfterWin: data.get('removeAfterWin') === 'on',
        createdBy: 'dashboard',
        metadata: {
          createdFrom: 'preset_editor_modal',
          editorContext: state.presetEditorModal?.context || 'presets',
          targetGiveawayUid: state.presetEditorModal?.targetGiveawayUid || ''
        }
      });
      const uid = result.preset?.presetUid || '';
      const context = state.presetEditorModal?.context || 'presets';
      const targetGiveawayUid = state.presetEditorModal?.targetGiveawayUid || '';
      await refreshPresets(uid);
      if (context === 'giveaways' && uid) {
        rememberGiveawayWheelPresetSelection(targetGiveawayUid, uid);
        if (targetGiveawayUid) await attachPresetToGiveaway(targetGiveawayUid, uid);
        state.activeTab = 'giveaways';
        state.presetEditorModal = { open: true, mode: 'edit', context, presetUid: uid, targetGiveawayUid };
        if (targetGiveawayUid) await refreshGiveaways(targetGiveawayUid);
        setMessage('Glücksrad wurde erstellt und im Giveaway ausgewählt. Füge jetzt die Felder hinzu und speichere danach das Glücksrad.');
      } else {
        state.presetEditorModal = { open: true, mode: 'edit', context, presetUid: uid, targetGiveawayUid: '' };
        setMessage('Preset wurde erstellt. Du kannst jetzt Felder hinzufügen.');
      }
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderPresetEditorModal(){
    const modal = state.presetEditorModal || {};
    if (!modal.open) return '';
    const mode = modal.mode === 'edit' ? 'edit' : 'create';
    const context = modal.context || 'presets';
    const selected = mode === 'edit' ? state.selectedPreset : null;
    const fields = rows(selected?.fields || []);
    const editable = mode === 'create' ? true : !!selected?.editable;
    const isGiveawayContext = context === 'giveaways';
    const editorNoun = isGiveawayContext ? 'Glücksrad' : 'Preset';
    const title = mode === 'edit'
      ? `${editorNoun} bearbeiten: ${selected ? esc(selected.name || editorNoun) : `${editorNoun} wird geladen`}`
      : (isGiveawayContext ? 'Giveaway-Glücksrad erstellen' : 'Neues Preset erstellen');
    const introText = isGiveawayContext
      ? 'Erstelle oder bearbeite hier das Glücksrad, das im Giveaway verwendet wird. Technische Felder werden ausgeblendet.'
      : 'Erstelle und bearbeite hier globale Presets für das Glücksrad.';
    const createHint = isGiveawayContext
      ? 'Nach dem Anlegen öffnet sich direkt die Felder-Bearbeitung. Das Glücksrad wird automatisch im Giveaway ausgewählt.'
      : 'Nach dem Anlegen kannst du direkt Felder hinzufügen und das Preset weiter bearbeiten.';
    const createButtonLabel = isGiveawayContext ? 'Glücksrad anlegen & Felder bearbeiten' : 'Preset erstellen';
    const saveButtonLabel = isGiveawayContext ? 'Glücksrad speichern' : 'Preset-Einstellungen speichern';

    return `
      <div class="lg-editor-modal-backdrop" data-lg-close-preset-editor>
        <div class="lg-editor-modal" role="dialog" aria-modal="true" aria-label="Preset-Editor" onclick="event.stopPropagation()">
          <div class="lg-editor-modal-head">
            <div>
              <p class="lg-eyebrow">${isGiveawayContext ? 'Giveaway / Glücksrad-Editor' : 'Glücksrad / Preset-Editor'}</p>
              <h3>${title}</h3>
              <p class="lg-muted">${introText}</p>
              ${isGiveawayContext ? `<p class="lg-muted">Dieses Glücksrad ist erst bereit, wenn mindestens ein aktives gültiges Feld vorhanden ist.</p>` : ''}
            </div>
            <button class="lg-btn lg-btn-secondary" type="button" data-lg-close-preset-editor>Schließen</button>
          </div>

          ${mode === 'create' ? `
            <form class="lg-form lg-editor-modal-section" data-lg-modal-create-preset>
              <div class="lg-form-row">
                <label>Name<input name="name" required placeholder="z. B. Rentner-Rad"></label>
                <label>Mindest-Slots<input name="minVisibleSlots" type="number" min="1" max="96" value="12"></label>
              </div>
              <label>Beschreibung<textarea name="description" rows="2" placeholder="Kurzbeschreibung"></textarea></label>
              <div class="lg-form-row">
                ${isGiveawayContext ? `<input name="status" type="hidden" value="draft">` : `
                  <label>Status
                    <select name="status">
                      <option value="draft">Entwurf</option>
                      <option value="active">Aktiv</option>
                    </select>
                  </label>
                `}
                <label class="lg-check"><input name="removeAfterWin" type="checkbox" checked> Gewinnfeld nach Auslosung aus diesem Rad entfernen</label>
              </div>
              ${isGiveawayContext ? `<p class="lg-warning">${createHint}</p>` : ''}
              <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>${createButtonLabel}</button>
            </form>
          ` : selected ? `
            <div class="lg-editor-modal-section">
              <div class="lg-kv lg-kv-compact">
                ${isGiveawayContext ? `
                  <span>Verwendung</span><strong>Giveaway-Glücksrad</strong>
                ` : `
                  <span>Status</span><strong>${statusBadge(selected.status)}</strong>
                  <span>Typ</span><strong>${esc(selected.presetType)}</strong>
                `}
                <span>Bearbeitbar</span><strong>${editable ? 'Ja' : 'Nein, nur kopieren/anzeigen'}</strong>
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
                  <button class="lg-btn" type="submit">${saveButtonLabel}</button>
                </form>
              ` : `<p class="lg-warning">${isGiveawayContext ? 'Dieses Glücksrad ist nicht direkt bearbeitbar. Bitte lege bei Bedarf ein neues Glücksrad für das Giveaway an.' : 'Dieses Preset ist nicht direkt bearbeitbar. Änderungen bitte über Kopieren als neues Preset anlegen.'}</p>`}
            </div>
            ${renderFieldsEditor(selected, fields, editable)}
          ` : `<p class="lg-muted">Preset wird geladen...</p>`}
        </div>
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
            <button class="lg-btn lg-btn-secondary" data-lg-open-preset-editor data-mode="create" data-context="presets">Neues Preset im Editor</button>
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
          <h3>Schnellanlage Standalone-Preset</h3>
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
            <button class="lg-btn" data-lg-open-preset-editor data-mode="edit" data-context="presets" data-preset-uid="${esc(selected.presetUid)}">Im Editor öffnen</button>
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
              <button class="lg-btn" type="submit">Preset speichern</button>
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
            <div class="lg-field-card" data-lg-field-card data-field-uid="${esc(field.fieldUid)}">
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
                ${editable ? `<button class="lg-btn lg-btn-danger" type="button" data-lg-delete-field="${esc(field.fieldUid)}">Entfernen</button>` : ''}
              </div>
            </div>
          `).join('') || `<p class="lg-muted">Noch keine Felder im Preset.</p>`}
        </div>
      </div>
    `;
  }

  function renderGiveawaySummaryCard(giveaway){
    const status = String(giveaway.status || '').toLowerCase();
    const issues = setupIssuesText(giveaway);
    const entries = rows(giveaway.entries || []);
    const winners = rows(giveaway.winners || []);
    const activeTickets = entries.filter(entry => entry.status !== 'cancelled').length;
    const editAllowed = canEditGiveaway(giveaway);
    const canOpen = status === 'draft' && giveaway.setupComplete === true;
    const openBlocked = status === 'draft' && giveaway.setupComplete !== true;
    const wheelPending = hasPendingWheel(giveaway);
    const wheelButton = giveaway.wheelEnabled && editAllowed
      ? (giveaway.wheelPresetUid
        ? `<button class="lg-btn lg-btn-secondary" type="button" data-lg-open-preset-editor data-mode="edit" data-context="giveaways" data-preset-uid="${esc(giveaway.wheelPresetUid)}" data-target-giveaway-uid="${esc(giveaway.giveawayUid)}">Glücksrad bearbeiten</button>`
        : `<button class="lg-btn lg-btn-secondary" type="button" data-lg-open-preset-editor data-mode="create" data-context="giveaways" data-target-giveaway-uid="${esc(giveaway.giveawayUid)}" title="Lege ein neues Glücksrad für diesen Entwurf an.">Glücksrad erstellen</button>`)
      : '';

    return `
      <article class="lg-giveaway-card">
        <div class="lg-giveaway-card-head">
          <div>
            <strong>${esc(giveaway.title || 'Ohne Titel')}</strong>
            <small>${esc(statusLabel(giveaway.mode || ''))} · erstellt ${fmtDate(giveaway.createdAt)}</small>
          </div>
          <div class="lg-giveaway-card-badges">
            ${statusBadge(giveaway.status)}
            ${status === 'draft' ? setupBadge(giveaway) : ''}
            ${wheelPending ? `<span class="lg-badge lg-badge-warn">Rad offen</span>` : ''}
          </div>
        </div>
        ${status === 'draft' && giveaway.setupComplete !== true ? `<p class="lg-giveaway-card-warning">${esc(issues || 'Es fehlen noch Pflichtangaben.')}</p>` : ''}
        <div class="lg-giveaway-card-meta">
          <span>Tickets: <strong>${fmtNumber(activeTickets)}</strong></span>
          <span>Gewinner: <strong>${fmtNumber(winners.length)}</strong></span>
          <span>Glücksrad: <strong>${giveaway.wheelEnabled ? (giveaway.wheelPresetUid ? (giveaway.setupComplete === true ? 'Bereit' : 'Unvollständig') : 'Fehlt') : 'Nicht nötig'}</strong></span>
        </div>
        <div class="lg-giveaway-card-actions">
          ${editAllowed ? `<button class="lg-btn lg-btn-secondary" type="button" data-lg-edit-giveaway="${esc(giveaway.giveawayUid)}">Giveaway bearbeiten</button>` : ''}
          ${wheelButton}
          ${canOpen ? `<button class="lg-btn" type="button" data-lg-giveaway-action="open" data-giveaway-uid="${esc(giveaway.giveawayUid)}">Öffnen</button>` : ''}
          ${openBlocked ? `<button class="lg-btn" type="button" disabled title="${esc(issues || 'Pflichtangaben fehlen')}">Öffnen</button>` : ''}
          ${status === 'open' ? `<button class="lg-btn lg-btn-secondary" type="button" data-lg-giveaway-action="close" data-giveaway-uid="${esc(giveaway.giveawayUid)}">Teilnahme schließen</button>` : ''}
          ${status === 'closed_for_entries' ? `<button class="lg-btn" type="button" data-lg-draw-winner="${esc(giveaway.giveawayUid)}">Auslosen</button>` : ''}
          ${wheelPending ? `<button class="lg-btn lg-btn-secondary" type="button" disabled title="Die Rad-Drehung wird im nächsten Step als eigener Dialog angebunden.">Rad-Drehung offen</button>` : ''}
          <button class="lg-btn lg-btn-secondary" type="button" data-lg-giveaway-action="copy" data-giveaway-uid="${esc(giveaway.giveawayUid)}">Kopieren</button>
          ${status !== 'deleted' && !['open','closed_for_entries'].includes(status) ? `<button class="lg-btn lg-btn-danger" type="button" data-lg-giveaway-action="delete" data-giveaway-uid="${esc(giveaway.giveawayUid)}">Löschen</button>` : ''}
          ${['open','closed_for_entries'].includes(status) ? `<button class="lg-btn lg-btn-danger" type="button" data-lg-giveaway-action="cancel" data-giveaway-uid="${esc(giveaway.giveawayUid)}">Abbrechen</button>` : ''}
        </div>
      </article>
    `;
  }

  function renderGiveawayEditorModal(presets){
    const modal = state.giveawayEditorModal || {};
    if (!modal.open) return '';
    const mode = modal.mode === 'edit' ? 'edit' : 'create';
    const selected = mode === 'edit' ? state.selectedGiveaway : null;
    const editable = mode === 'create' ? true : canEditGiveaway(selected);
    const title = mode === 'edit'
      ? `Giveaway bearbeiten: ${selected ? esc(selected.title || 'Ohne Titel') : 'wird geladen'}`
      : 'Neues Giveaway erstellen';
    const intro = mode === 'edit'
      ? 'Bearbeite hier den Entwurf. Nach dem Öffnen wird das Giveaway gesperrt.'
      : 'Speichern legt zuerst einen Entwurf an. Öffnen ist erst möglich, wenn alle Pflichtdaten vollständig sind.';

    return `
      <div class="lg-editor-modal-backdrop" data-lg-close-giveaway-modal>
        <div class="lg-editor-modal" role="dialog" aria-modal="true" aria-label="Giveaway-Editor" onclick="event.stopPropagation()">
          <div class="lg-editor-modal-head">
            <div>
              <p class="lg-eyebrow">Loyalty / Giveaway-Editor</p>
              <h3>${title}</h3>
              <p class="lg-muted">${intro}</p>
            </div>
            <button class="lg-btn lg-btn-secondary" type="button" data-lg-close-giveaway-modal>Schließen</button>
          </div>
          ${mode === 'edit' && !selected ? `<p class="lg-muted">Giveaway wird geladen...</p>` : ''}
          ${mode === 'edit' && selected ? `
            <div class="lg-giveaway-summary-strip">
              <span>Status: <strong>${statusBadge(selected.status)}</strong></span>
              <span>Bereit: <strong>${setupBadge(selected)}</strong></span>
              <span>Modus: <strong>${esc(statusLabel(selected.mode))}</strong></span>
              <span>Kosten: <strong>${fmtNumber(selected.costAmount)}</strong></span>
              <span>Gewinner: <strong>${fmtNumber(selected.winnerCount)}</strong></span>
            </div>
            ${setupWarningBlock(selected)}
          ` : ''}
          ${mode === 'create' ? `
            <form class="lg-form lg-editor-modal-section" data-lg-create-giveaway>
              ${renderGiveawayFormFields(null, true, presets)}
              <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Giveaway als Entwurf speichern</button>
            </form>
          ` : selected && editable ? `
            <form class="lg-form lg-editor-modal-section" data-lg-update-giveaway>
              ${renderGiveawayFormFields(selected, true, presets)}
              <button class="lg-btn" type="submit" ${state.saving ? 'disabled' : ''}>Giveaway speichern</button>
            </form>
          ` : selected ? `<p class="lg-warning">Dieses Giveaway ist nicht mehr editierbar. Änderungen bitte über „Kopieren“ als neuen Entwurf anlegen.</p>` : ''}
        </div>
      </div>
    `;
  }

  function renderGiveaways(){
    const giveaways = rows(state.giveaways);
    const presets = rows(state.presets).filter(p => p.status === 'active' && p.presetType === 'standalone');
    const filter = state.giveawayStatusFilter || 'all';
    const visibleGiveaways = giveaways.filter(giveaway => giveawayFilterMatches(giveaway, filter));
    const counts = {
      all: giveaways.length,
      draft: giveaways.filter(g => String(g.status || '').toLowerCase() === 'draft').length,
      incomplete: giveaways.filter(g => g.setupComplete === false).length,
      ready: giveaways.filter(g => String(g.status || '').toLowerCase() === 'draft' && g.setupComplete === true).length,
      open: giveaways.filter(g => String(g.status || '').toLowerCase() === 'open').length,
      draw_open: giveaways.filter(g => String(g.status || '').toLowerCase() === 'closed_for_entries').length,
      wheel_open: giveaways.filter(hasPendingWheel).length,
      finished: giveaways.filter(g => String(g.status || '').toLowerCase() === 'finished').length,
      cancelled: giveaways.filter(g => String(g.status || '').toLowerCase() === 'cancelled').length
    };

    return `
      <div class="lg-panel lg-giveaway-overview-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Giveaways</h3>
            <p class="lg-muted">Übersicht zuerst. Erstellen und Bearbeiten öffnen jeweils ein eigenes Fenster.</p>
          </div>
          <div class="lg-actions">
            <button class="lg-btn" type="button" data-lg-new-giveaway>+ Neues Giveaway</button>
            <button class="lg-btn lg-btn-secondary" data-lg-giveaway-refresh>Aktualisieren</button>
          </div>
        </div>
        <div class="lg-giveaway-filter-row">
          <label>Status filtern
            <select data-lg-giveaway-filter>
              <option value="all" ${filter === 'all' ? 'selected' : ''}>Alle (${fmtNumber(counts.all)})</option>
              <option value="draft" ${filter === 'draft' ? 'selected' : ''}>Entwurf (${fmtNumber(counts.draft)})</option>
              <option value="incomplete" ${filter === 'incomplete' ? 'selected' : ''}>Unvollständig (${fmtNumber(counts.incomplete)})</option>
              <option value="ready" ${filter === 'ready' ? 'selected' : ''}>Bereit (${fmtNumber(counts.ready)})</option>
              <option value="open" ${filter === 'open' ? 'selected' : ''}>Offen (${fmtNumber(counts.open)})</option>
              <option value="draw_open" ${filter === 'draw_open' ? 'selected' : ''}>Auslosung offen (${fmtNumber(counts.draw_open)})</option>
              <option value="wheel_open" ${filter === 'wheel_open' ? 'selected' : ''}>Rad-Drehung offen (${fmtNumber(counts.wheel_open)})</option>
              <option value="finished" ${filter === 'finished' ? 'selected' : ''}>Beendet (${fmtNumber(counts.finished)})</option>
              <option value="cancelled" ${filter === 'cancelled' ? 'selected' : ''}>Abgebrochen (${fmtNumber(counts.cancelled)})</option>
            </select>
          </label>
          <span class="lg-muted">${fmtNumber(visibleGiveaways.length)} von ${fmtNumber(giveaways.length)} sichtbar</span>
        </div>
        <div class="lg-giveaway-card-grid">
          ${visibleGiveaways.map(renderGiveawaySummaryCard).join('') || `<p class="lg-muted">Für diesen Filter wurden keine Giveaways gefunden.</p>`}
        </div>
      </div>
      ${renderGiveawayEditorModal(presets)}
    `;
  }

  function renderGiveawayFormFields(giveaway, editable, presets){
    const mode = giveaway?.mode || 'classic_single';
    const wheelMode = isWheelGiveawayMode(mode);
    const wheelPresetUid = getGiveawayWheelPresetSelection(giveaway, wheelMode);
    const round = giveaway?.roundPolicy || {};
    const prize = rows(giveaway?.prizes || [])[0] || {};
    const removeWinner = round.removeWinnerAfterRound !== false;

    return `
      <label>Titel<input name="title" value="${esc(giveaway?.title || '')}" required ${editable ? '' : 'disabled'}></label>
      <label>Beschreibung<textarea name="description" rows="2" ${editable ? '' : 'disabled'}>${esc(giveaway?.description || '')}</textarea></label>
      <div class="lg-form-row lg-giveaway-mode-row">
        <label>Modus
          <select name="mode" data-lg-giveaway-mode-select ${editable ? '' : 'disabled'}>
            ${[
              ['classic_single','Classic Single'],
              ['classic_multi','Classic Multi'],
              ['wheel_single','Wheel Single'],
              ['wheel_multi','Wheel Multi']
            ].map(([value,label]) => `<option value="${value}" ${mode === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="lg-wheel-config-panel" data-lg-wheel-preset-row style="${wheelMode ? '' : 'display:none'}">
        <label>Glücksrad
          <select name="wheelPresetUid" data-lg-wheel-preset-select data-editable="${editable ? '1' : '0'}" ${editable && wheelMode ? '' : 'disabled'}>
            <option value="">Noch kein Glücksrad ausgewählt</option>
            ${presets.map(p => `<option value="${esc(p.presetUid)}" ${wheelPresetUid === p.presetUid ? 'selected' : ''}>Glücksrad verwenden: ${esc(p.name)}</option>`).join('')}
          </select>
        </label>
        <div class="lg-inline-actions">
          ${giveaway?.giveawayUid ? `<button class="lg-btn lg-btn-secondary" type="button" data-lg-open-preset-editor data-mode="create" data-context="giveaways" data-target-giveaway-uid="${esc(giveaway.giveawayUid)}">Neues Glücksrad erstellen</button>` : ''}
          ${wheelPresetUid ? `<button class="lg-btn lg-btn-secondary" type="button" data-lg-open-preset-editor data-mode="edit" data-context="giveaways" data-preset-uid="${esc(wheelPresetUid)}" data-target-giveaway-uid="${esc(giveaway?.giveawayUid || '')}">Ausgewähltes Glücksrad bearbeiten</button>` : ''}
        </div>
        <small class="lg-muted">Ohne Glücksrad kann das Giveaway als Entwurf gespeichert, aber nicht geöffnet werden. Ein neues Glücksrad erstellst du nach dem Speichern direkt über die Giveaway-Kachel.</small>
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


  async function handleCreateEntry(form){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid) return;
    const data = new FormData(form);
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/entries`, {
        userLogin: data.get('userLogin'),
        userDisplayName: data.get('userDisplayName') || data.get('userLogin'),
        ticketCount: Number(data.get('ticketCount') || 1),
        isSubscriber: data.get('isSubscriber') === 'on',
        source: 'dashboard'
      });
      await refreshGiveaways(giveawayUid);
      setMessage('Teilnahme wurde eingetragen.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function cancelEntry(entryUid){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid || !entryUid) return;
    if (!window.confirm('Teilnahme wirklich stornieren?')) return;
    state.saving = true; render();
    try {
      await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/entries/${encodeURIComponent(entryUid)}/cancel`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid);
      setMessage('Teilnahme wurde storniert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }


  async function drawGiveawayWinner(giveawayUid = state.selectedGiveawayUid){
    if (!giveawayUid) return;
    if (!window.confirm('Jetzt fair backendseitig einen Gewinner ziehen?')) return;
    state.saving = true; render();
    try {
      const result = await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/draw`, { actor: 'dashboard' });
      await refreshGiveaways(giveawayUid);
      setMessage(`Gewinner gezogen: ${result.winner?.userDisplayName || result.winner?.userLogin || 'unbekannt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  async function claimGiveawayWheel(userLogin, userDisplayName){
    const giveawayUid = state.selectedGiveawayUid;
    if (!giveawayUid || !userLogin) return;
    state.saving = true; render();
    try {
      const result = await apiPost(`/api/loyalty/giveaways/${encodeURIComponent(giveawayUid)}/wheel/claim`, {
        userLogin,
        userDisplayName: userDisplayName || userLogin,
        source: 'dashboard',
        duration: 7000
      });
      await refreshGiveaways(giveawayUid);
      setMessage(`Rad gestartet: ${result.spin?.selectedFieldLabel || 'Ergebnis folgt'}`);
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderGiveawayDetails(giveaway){
    const rounds = rows(giveaway.rounds || []);
    const prizes = rows(giveaway.prizes || []);
    const entries = rows(giveaway.entries || []);
    const winners = rows(giveaway.winners || []);
    const wheelPermissions = rows(giveaway.wheelPermissions || []);
    const events = rows(giveaway.events || []);
    const editableEntries = giveaway.status === 'open';

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
          <h3>Teilnahmen</h3>
          <strong class="lg-big-number">${fmtNumber(entries.filter(entry => entry.status !== 'cancelled').length)}</strong>
          <p class="lg-muted">Tickets werden gespeichert, Punkte aber noch nicht gebucht.</p>
        </div>
        <div class="lg-panel">
          <h3>Gewinner</h3>
          <strong class="lg-big-number">${fmtNumber(winners.length)}</strong>
          <p class="lg-muted">Ziehung per crypto.randomInt.</p>
        </div>
      </div>

      <div class="lg-panel">
        <div class="lg-panel-head">
          <h3>Teilnahmen / Tickets</h3>
          <span class="lg-muted">${editableEntries ? 'Giveaway ist offen' : 'Teilnahmen nur bei Status open möglich'}</span>
        </div>

        ${editableEntries ? `
          <form class="lg-form lg-entry-form" data-lg-create-entry>
            <input name="userLogin" placeholder="Twitch-Name" required>
            <input name="userDisplayName" placeholder="Anzeigename optional">
            <input name="ticketCount" type="number" min="1" value="1" title="Tickets">
            <label class="lg-check"><input name="isSubscriber" type="checkbox"> Sub/VIP-Luck anwenden</label>
            <button class="lg-btn" type="submit">Teilnahme eintragen</button>
          </form>
        ` : ''}

        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Tickets</th><th>Gewicht</th><th>Kosten offen</th><th>Quelle</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${fmtDate(entry.createdAt)}</td>
                  <td>${esc(entry.userDisplayName || entry.userLogin || '-')}</td>
                  <td>${esc(entry.status || '-')}</td>
                  <td>${fmtNumber(entry.ticketCount || 0)}</td>
                  <td>${fmtNumber(entry.ticketWeight || 0)}</td>
                  <td>${fmtNumber(entry.costDue || 0)}</td>
                  <td>${esc(entry.source || '-')}</td>
                  <td>${entry.status !== 'cancelled' ? `<button class="lg-btn lg-btn-danger" data-lg-cancel-entry="${esc(entry.entryUid)}">Storno</button>` : ''}</td>
                </tr>
              `).join('') || `<tr><td colspan="8" class="lg-muted">Noch keine Teilnahmen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Gewinner</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Preis</th><th>Algorithmus</th><th>Tickets</th><th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${winners.map(winner => `
                <tr>
                  <td>${fmtDate(winner.createdAt)}</td>
                  <td><strong>${esc(winner.userDisplayName || winner.userLogin || '-')}</strong></td>
                  <td>${esc(winner.prizeLabel || '-')}</td>
                  <td>${esc(winner.drawAlgorithm || '-')}</td>
                  <td>${fmtNumber(winner.totalTicketWeight || 0)}</td>
                  <td>${fmtNumber(winner.ticketPosition || 0)}</td>
                </tr>
              `).join('') || `<tr><td colspan="6" class="lg-muted">Noch kein Gewinner gezogen.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Wheel-Berechtigungen</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>User</th><th>Status</th><th>Spin</th><th>Erstellt</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${wheelPermissions.map(permission => `
                <tr>
                  <td>${esc(permission.userDisplayName || permission.userLogin || '-')}</td>
                  <td>${esc(permission.status || '-')}</td>
                  <td>${esc(permission.spinUid || '-')}</td>
                  <td>${fmtDate(permission.createdAt)}</td>
                  <td>${permission.status === 'pending' ? `<button class="lg-btn" data-lg-claim-wheel="${esc(permission.userLogin)}" data-display-name="${esc(permission.userDisplayName || permission.userLogin)}">Rad drehen</button>` : ''}</td>
                </tr>
              `).join('') || `<tr><td colspan="5" class="lg-muted">Keine Wheel-Berechtigung vorhanden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Events</h3>
        <div class="lg-mini-list">
          ${events.slice(0, 12).map(event => `
            <div class="lg-mini-row">
              <strong>${esc(event.eventType)}</strong>
              <span>${fmtDate(event.createdAt)}</span>
            </div>
          `).join('') || `<p class="lg-muted">Keine Events.</p>`}
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


  async function refreshChatSetup(rerender = true){
    try {
      const [giveawayCommands, giveawayTexts] = await Promise.all([
        window.CGN.api(api.giveawayCommands).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.giveawayTexts).catch(err => ({ ok:false, error:err.message, keys:[], categories:[] }))
      ]);
      state.giveawayCommands = giveawayCommands;
      state.giveawayTexts = giveawayTexts;
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  async function saveChatTextVariant(form){
    const data = new FormData(form);
    const key = String(data.get('key') || '').trim();
    const category = String(data.get('category') || 'general').trim();
    const value = String(data.get('value') || '').trim();
    if (!key || !value) return;
    state.saving = true; render();
    try {
      await apiPost(api.giveawayTexts, {
        action: 'saveVariant',
        variant: { key, category, value, enabled: true, weight: 1 }
      });
      await refreshChatSetup(false);
      setMessage('Textvariante gespeichert.');
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.saving = false; render();
    }
  }

  function renderChatSetup(){
    const commands = rows(state.giveawayCommands);
    const textPayload = state.giveawayTexts || {};
    const categories = Array.isArray(textPayload.categories) ? textPayload.categories : [];
    const keys = Array.isArray(textPayload.keys) ? textPayload.keys : [];
    return `
      <div class="lg-grid lg-grid-2">
        <div class="lg-panel">
          <h3>Chat-Commands</h3>
          <p class="lg-muted">Eingetragen, aber bewusst nicht aktiv. Keine Twitch-Command-Ausführung in diesem Step.</p>
          <div class="lg-table-wrap">
            <table class="lg-table">
              <thead>
                <tr><th>Command</th><th>Alias</th><th>Aktion</th><th>Status</th><th>Usage</th></tr>
              </thead>
              <tbody>
                ${commands.map(cmd => `
                  <tr>
                    <td><code>!${esc(cmd.command)}</code></td>
                    <td>${(cmd.aliases || []).map(alias => `<code>!${esc(alias)}</code>`).join(' ') || '<span class="lg-muted">-</span>'}</td>
                    <td>${esc(cmd.action || '-')}</td>
                    <td>${cmd.active ? badge(true, 'aktiv') : `<span class="lg-badge lg-badge-off">inaktiv</span>`}</td>
                    <td><code>${esc(cmd.usage || '-')}</code></td>
                  </tr>
                `).join('') || `<tr><td colspan="5" class="lg-muted">Keine Commands eingetragen.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <div class="lg-panel">
          <h3>Text-Kategorien</h3>
          <p class="lg-muted">CGN-/Altersheim-/Rentner-Texte laufen über den bestehenden Helper für Textvarianten.</p>
          <div class="lg-kv">
            ${categories.map(cat => `<span>${esc(cat.label || cat.id)}</span><strong>${fmtNumber(cat.variantCount || cat.count || 0)} Varianten</strong>`).join('') || '<span>Texte</span><strong>-</strong>'}
          </div>
        </div>
      </div>

      <div class="lg-panel">
        <h3>Chat-Multi-Texte</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr><th>Key</th><th>Kategorie</th><th>Aktive Varianten</th><th>Varianten</th></tr>
            </thead>
            <tbody>
              ${keys.map(item => `
                <tr>
                  <td><code>${esc(item.key)}</code></td>
                  <td>${esc(item.category || 'general')}</td>
                  <td>${fmtNumber(item.activeCount || 0)} / ${fmtNumber(item.totalCount || 0)}</td>
                  <td>
                    ${(item.variants || []).map(v => `<div class="lg-muted">• ${esc(v.value || v.text || '')}</div>`).join('')}
                    <form class="lg-inline-form" data-lg-save-chat-text>
                      <input type="hidden" name="key" value="${esc(item.key)}">
                      <input type="hidden" name="category" value="${esc(item.category || 'general')}">
                      <input name="value" placeholder="Neue Variante im CGN-Stil..." autocomplete="off">
                      <button class="lg-btn lg-btn-secondary" type="submit">Variante speichern</button>
                    </form>
                  </td>
                </tr>
              `).join('') || `<tr><td colspan="4" class="lg-muted">Keine Textkeys geladen.</td></tr>`}
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


  function renderPointsManagement(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Core</h3>
            <p class="lg-muted">Dieser Bereich wird die zentrale Verwaltung für User-Konten, Punktestände, Transaktionen und Leaderboards.</p>
          </div>
          <span class="lg-badge lg-badge-warn">geplant</span>
        </div>
        <div class="lg-grid lg-grid-3">
          <article class="lg-card"><span class="lg-card-label">User-Konten</span><strong>Geplant</strong><small>User suchen, Punktestand anzeigen, Verlauf prüfen.</small></article>
          <article class="lg-card"><span class="lg-card-label">Transaktionen</span><strong>Geplant</strong><small>Punkte hinzufügen/abziehen mit Audit-Log.</small></article>
          <article class="lg-card"><span class="lg-card-label">Leaderboard</span><strong>Geplant</strong><small>Ranglisten und Auswertungen.</small></article>
        </div>
      </div>
    `;
  }

  function renderWheelArea(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Glücksrad</h3>
            <p class="lg-muted">Live-Test, Overlay-Status und globale Presets. Giveaway-Glücksräder werden nur im jeweiligen Giveaway bearbeitet.</p>
          </div>
          <a class="lg-btn lg-btn-secondary" href="${api.overlay}" target="_blank">Overlay öffnen</a>
        </div>
      </div>
      ${renderWheel()}
      <div class="lg-panel">
        <h3>Globale Presets</h3>
        <p class="lg-muted">Normale Glücksrad-Presets werden hier verwaltet. Giveaway-gebundene Räder erscheinen im Giveaway selbst.</p>
      </div>
      ${renderPresets()}
    `;
  }

  function renderRafflesArea(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Raffles</h3>
            <p class="lg-muted">Geplanter Bereich für schnelle Chat-Verlosungen mit weniger Setup als Giveaways.</p>
          </div>
          <span class="lg-badge lg-badge-warn">geplant</span>
        </div>
        <div class="lg-grid lg-grid-3">
          <article class="lg-card"><span class="lg-card-label">Schnellstart</span><strong>Geplant</strong><small>Raffle starten, Teilnahmebedingung setzen, Gewinner ziehen.</small></article>
          <article class="lg-card"><span class="lg-card-label">Teilnehmer</span><strong>Geplant</strong><small>Chat-Teilnahmen und Ausschlüsse verwalten.</small></article>
          <article class="lg-card"><span class="lg-card-label">Gewinner</span><strong>Geplant</strong><small>Wer hat wann was gewonnen.</small></article>
        </div>
      </div>
    `;
  }

  function renderTextsArea(){
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Texte</h3>
            <p class="lg-muted">Zentrale Multi-Textverwaltung für das Loyalty-System. Module werden später per Dropdown gewählt.</p>
          </div>
          <span class="lg-badge lg-badge-ok">Helper-basiert</span>
        </div>
      </div>
      ${renderChatSetup()}
    `;
  }

  function renderStatisticsArea(){
    const giveawaysDiag = state.giveawaysStatus?.diagnostics?.counts || {};
    const presetDiag = state.status?.diagnostics?.presets || {};
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Statistik</h3>
            <p class="lg-muted">Nutzung und Gewinner-Auswertungen für Punkteverwaltung, Glücksrad, Giveaways und Raffles.</p>
          </div>
          <span class="lg-badge lg-badge-warn">Ausbau folgt</span>
        </div>
        <div class="lg-grid lg-grid-4">
          <article class="lg-card"><span class="lg-card-label">Giveaways</span><strong>${fmtNumber(giveawaysDiag.total || rows(state.giveaways).length)}</strong><small>Gewinner-/Teilnehmerstatistik folgt.</small></article>
          <article class="lg-card"><span class="lg-card-label">Glücksrad-Presets</span><strong>${fmtNumber(presetDiag.presets || rows(state.presets).length)}</strong><small>Gewinnverteilung und Spins folgen.</small></article>
          <article class="lg-card"><span class="lg-card-label">Raffles</span><strong>Geplant</strong><small>Raffle-Gewinner und Nutzung.</small></article>
          <article class="lg-card"><span class="lg-card-label">Nutzung</span><strong>Geplant</strong><small>Wer welches Modul wann genutzt hat.</small></article>
        </div>
      </div>
    `;
  }

  function renderConfigArea(){
    const commands = rows(state.giveawayCommands);
    return `
      <div class="lg-panel">
        <div class="lg-panel-head">
          <div>
            <h3>Config</h3>
            <p class="lg-muted">Zentrale Einstellungen für Loyalty. Commands werden im zentralen Command-Editor bearbeitet.</p>
          </div>
          <span class="lg-badge lg-badge-warn">Foundation</span>
        </div>
        <div class="lg-grid lg-grid-3">
          <article class="lg-card"><span class="lg-card-label">Allgemein</span><strong>Geplant</strong><small>Modul aktiv, Default-Währung, Rollen/Rechte.</small></article>
          <article class="lg-card"><span class="lg-card-label">Glücksrad</span><strong>Geplant</strong><small>Dauer, Slots, Overlay und Preset-Defaults.</small></article>
          <article class="lg-card"><span class="lg-card-label">Giveaways</span><strong>Geplant</strong><small>Defaults für Tickets, Gewinner und Chatmeldungen.</small></article>
          <article class="lg-card"><span class="lg-card-label">Raffles</span><strong>Geplant</strong><small>Defaults für schnelle Verlosungen.</small></article>
          <article class="lg-card"><span class="lg-card-label">Texte</span><strong>Siehe Texte</strong><small>Multi-Texte über den bestehenden Helper.</small></article>
          <article class="lg-card"><span class="lg-card-label">Commands</span><strong>${fmtNumber(commands.length)} bekannt</strong><small>Fehlende Standard-Commands später prüfen/anlegen, nie überschreiben.</small></article>
        </div>
      </div>
    `;
  }

  function renderTabs(){
    const tabs = [
      ['overview', 'Übersicht'],
      ['points', 'Core'],
      ['wheel', 'Glücksrad'],
      ['giveaways', 'Giveaways'],
      ['raffles', 'Raffles'],
      ['texts', 'Texte'],
      ['statistics', 'Statistik'],
      ['config', 'Config'],
      ['history', 'Verlauf']
    ];
    return `
      <div class="lg-tabs">
        ${tabs.map(([id, label]) => `<button class="lg-tab ${state.activeTab === id ? 'is-active' : ''}" data-lg-tab="${id}">${label}</button>`).join('')}
      </div>
    `;
  }

  function renderActiveTab(){
    if (state.activeTab === 'points') return renderPointsManagement();
    if (state.activeTab === 'wheel') return renderWheelArea();
    if (state.activeTab === 'giveaways') return renderGiveaways();
    if (state.activeTab === 'raffles') return renderRafflesArea();
    if (state.activeTab === 'texts') return renderTextsArea();
    if (state.activeTab === 'statistics') return renderStatisticsArea();
    if (state.activeTab === 'config') return renderConfigArea();
    if (state.activeTab === 'history') return renderSessions();
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

    root.querySelectorAll('[data-lg-jump-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.lgJumpTab || 'overview';
        render();
      });
    });

    root.querySelectorAll('[data-lg-open-preset-editor]').forEach(btn => {
      btn.addEventListener('click', () => openPresetEditorModal({
        mode: btn.dataset.mode || btn.dataset.lgMode || 'create',
        context: btn.dataset.context || 'presets',
        presetUid: btn.dataset.presetUid || '',
        targetGiveawayUid: btn.dataset.targetGiveawayUid || ''
      }));
    });
    root.querySelectorAll('[data-lg-close-preset-editor]').forEach(btn => {
      btn.addEventListener('click', () => closePresetEditorModal());
    });
    root.querySelector('[data-lg-modal-create-preset]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreatePresetFromModal(ev.currentTarget);
    });

    root.querySelectorAll('[data-lg-select-preset]').forEach(btn => {
      btn.addEventListener('click', () => loadPreset(btn.dataset.lgSelectPreset));
    });
    root.querySelector('[data-lg-new-giveaway]')?.addEventListener('click', () => {
      state.giveawayEditorModal = { open: true, mode: 'create', giveawayUid: '' };
      state.selectedGiveawayUid = '';
      state.selectedGiveaway = null;
      clearGiveawayWheelPresetSelection('');
      render();
    });
    root.querySelectorAll('[data-lg-close-giveaway-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.giveawayEditorModal = { open: false, mode: 'create', giveawayUid: '' };
        render();
      });
    });

    root.querySelectorAll('[data-lg-edit-giveaway]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uid = btn.dataset.lgEditGiveaway || '';
        state.giveawayEditorModal = { open: true, mode: 'edit', giveawayUid: uid };
        await loadGiveaway(uid, false);
      });
    });

    root.querySelector('[data-lg-preset-refresh]')?.addEventListener('click', async () => {
      await refreshPresets(state.selectedPresetUid);
      render();
    });
    root.querySelector('[data-lg-giveaway-refresh]')?.addEventListener('click', async () => {
      await refreshGiveaways(state.selectedGiveawayUid);
      render();
    });
    root.querySelector('[data-lg-giveaway-filter]')?.addEventListener('change', ev => {
      state.giveawayStatusFilter = ev.currentTarget.value || 'all';
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
    root.querySelectorAll('[data-lg-delete-field]').forEach(btn => {
      btn.addEventListener('click', () => deleteField(btn.dataset.lgDeleteField));
    });
    root.querySelectorAll('[data-lg-preset-action]').forEach(btn => {
      btn.addEventListener('click', () => presetAction(btn.dataset.lgPresetAction, btn.dataset.presetUid));
    });
    root.querySelectorAll('[data-lg-start-spin]').forEach(btn => {
      btn.addEventListener('click', () => startPresetSpin(btn.dataset.lgStartSpin));
    });

    root.querySelectorAll('[data-lg-create-giveaway], [data-lg-update-giveaway]').forEach(form => {
      syncGiveawayWheelPresetVisibility(form);
      form.querySelector('[data-lg-giveaway-mode-select]')?.addEventListener('change', () => syncGiveawayWheelPresetVisibility(form));
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

    root.querySelector('[data-lg-create-entry]')?.addEventListener('submit', ev => {
      ev.preventDefault();
      handleCreateEntry(ev.currentTarget);
    });

    root.querySelectorAll('[data-lg-cancel-entry]').forEach(btn => {
      btn.addEventListener('click', () => cancelEntry(btn.dataset.lgCancelEntry));
    });

    root.querySelectorAll('[data-lg-draw-winner]').forEach(btn => {
      btn.addEventListener('click', () => drawGiveawayWinner(btn.dataset.lgDrawWinner || state.selectedGiveawayUid));
    });

    root.querySelectorAll('[data-lg-claim-wheel]').forEach(btn => {
      btn.addEventListener('click', () => claimGiveawayWheel(btn.dataset.lgClaimWheel, btn.dataset.displayName));
    });

    root.querySelectorAll('[data-lg-save-chat-text]').forEach(form => {
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        saveChatTextVariant(ev.currentTarget);
      });
    });
  }

  function render(){
    root = document.getElementById('loyaltyGamesModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = `<div class="lg-panel"><h2>Loyalty</h2><p class="lg-muted">Lade Daten...</p></div>`;
      return;
    }

    if (state.error) {
      root.innerHTML = `<div class="lg-panel lg-error"><h2>Loyalty</h2><p>${esc(state.error)}</p><button data-lg-reload>Neu laden</button></div>`;
      root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));
      return;
    }

    root.innerHTML = `
      <div class="lg-head">
        <div>
          <p class="lg-eyebrow">Loyalty</p>
          <h2>Loyalty-Zentrale</h2>
          <p class="lg-subline">Core, Glücksrad, Giveaways, Raffles, Texte, Statistik, Config und Verlauf.</p>
        </div>
        <div class="lg-actions">
          <a class="lg-btn lg-btn-secondary" href="${api.overlay}" target="_blank">Overlay öffnen</a>
          <button class="lg-btn" data-lg-reload ${state.saving ? 'disabled' : ''}>Reload</button>
        </div>
      </div>

      <style>
        .lg-editor-modal-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(4,8,18,.72);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:28px;}
        .lg-editor-modal{width:min(1180px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(108,226,255,.38);border-radius:22px;background:linear-gradient(180deg,rgba(17,24,39,.98),rgba(10,15,30,.98));box-shadow:0 0 40px rgba(146,92,255,.25),0 0 18px rgba(42,217,255,.18);padding:18px;}
        .lg-editor-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(108,226,255,.18);}
        .lg-editor-modal-head h3{margin:.2rem 0 .35rem;}
        .lg-editor-modal-section{padding:12px;border:1px solid rgba(108,226,255,.14);border-radius:16px;background:rgba(255,255,255,.025);margin-bottom:14px;}
        .lg-giveaway-filter-row{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:10px 0 14px;flex-wrap:wrap;}
        .lg-giveaway-filter-row label{min-width:240px;max-width:360px;width:100%;}
        .lg-giveaway-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;}
        .lg-giveaway-card{border:1px solid rgba(108,226,255,.14);background:rgba(255,255,255,.025);border-radius:16px;padding:12px;display:grid;gap:10px;}
        .lg-giveaway-card.is-active{border-color:rgba(108,226,255,.45);box-shadow:0 0 18px rgba(42,217,255,.10);}
        .lg-giveaway-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
        .lg-giveaway-card-head strong{display:block;font-size:15px;}
        .lg-giveaway-card-head small{display:block;margin-top:3px;color:var(--muted);font-size:12px;}
        .lg-giveaway-card-badges{display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap;}
        .lg-giveaway-card-warning{margin:0;color:#ffb35c;font-size:12px;}
        .lg-giveaway-card-meta{display:flex;flex-wrap:wrap;gap:8px;color:var(--muted);font-size:12px;}
        .lg-giveaway-card-actions{display:flex;flex-wrap:wrap;gap:8px;}
        .lg-giveaway-summary-strip{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 12px;}
        .lg-giveaway-summary-strip span{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);border-radius:12px;padding:8px 10px;color:var(--muted);font-size:12px;}
        .lg-giveaway-summary-strip strong{margin-left:4px;color:inherit;}
        .lg-inline-actions{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap;}
        .lg-giveaway-mode-row > label{grid-column:1 / -1;}
        .lg-wheel-config-panel{border:1px solid rgba(108,226,255,.14);border-radius:14px;background:rgba(255,255,255,.025);padding:12px;margin-top:4px;margin-bottom:12px;}
        .lg-wheel-config-panel label{display:block;margin:0;}
        .lg-wheel-config-panel small{display:block;margin-top:8px;}
      </style>
      ${state.message ? `<div class="lg-toast">${esc(state.message)}</div>` : ''}
      ${state.saving ? `<div class="lg-toast lg-toast-warn">Speichere...</div>` : ''}
      ${renderTabs()}
      ${renderActiveTab()}
      ${renderPresetEditorModal()}
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
