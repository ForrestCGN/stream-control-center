window.BirthdayModule = (function(){
  'use strict';

  const api = {
    status: '/api/birthday/status',
    users: '/api/birthday/admin/users',
    user: '/api/birthday/admin/user',
    deleteUser: '/api/birthday/admin/user/delete',
    settings: '/api/birthday/admin/settings',
    texts: '/api/birthday/admin/texts',
    reload: '/api/birthday/reload',
    showState: '/api/birthday/show/state',
    showStop: '/api/birthday/show/stop',
    upload: '/api/birthday/admin/show/upload',
    showAssets: '/api/birthday/admin/show/assets',
    showRecheck: '/api/birthday/admin/show/recheck',
    showParties: '/api/birthday/admin/show/parties',
    showProfile: '/api/birthday/admin/show/profile',
    resolveUser: '/api/birthday/admin/resolve-user',
    importMedia: '/api/birthday/admin/show/import-media'
  };

  const TEXT_KEY_LABELS = {
    usage: 'Hilfe / Nutzung',
    register_success: 'Registrierung erfolgreich',
    register_success_with_year: 'Registrierung erfolgreich mit Jahr',
    register_updated: 'Geburtstag aktualisiert',
    register_updated_with_year: 'Geburtstag aktualisiert mit Jahr',
    show_own_birthday: 'Eigener Geburtstag anzeigen',
    show_own_birthday_with_year: 'Eigener Geburtstag mit Jahr anzeigen',
    show_missing: 'Kein Geburtstag gespeichert',
    delete_success: 'Geburtstag gelöscht',
    delete_missing: 'Kein Geburtstag zum Löschen',
    invalid_date: 'Ungültiges Datum',
    registration_disabled: 'Registrierung deaktiviert',
    birthday_greeting_chat: 'Auto-Gratulation Chat',
    birthday_greeting_chat_with_age: 'Auto-Gratulation Chat mit Alter',
    birthday_diary_entry: 'Tagebuch-Eintrag',
    birthday_diary_entry_with_age: 'Tagebuch-Eintrag mit Alter',
    today_none: 'Heute keine Geburtstage',
    today_list: 'Heute-Liste',
    already_greeted: 'Bereits gratuliert',
    command_disabled: 'Modul deaktiviert',
    party_usage: 'Party Nutzung',
    party_denied: 'Party keine Berechtigung',
    party_started: 'Party gestartet',
    party_missing_target: 'Party Ziel fehlt',
    party_user_not_found: 'Party User nicht gefunden',
    party_user_not_present: 'Party User nicht anwesend',
    party_disabled: 'Party deaktiviert'
  };

  const TEXT_KEY_HINTS = {
    birthday_greeting_chat: 'Wird automatisch im Chat gesendet, wenn ein registrierter User an seinem Geburtstag schreibt.',
    birthday_greeting_chat_with_age: 'Wie Auto-Gratulation, aber mit {age}, wenn ein Jahr gespeichert ist.',
    birthday_diary_entry: 'Systemeintrag im Tagebuch ohne Alter.',
    birthday_diary_entry_with_age: 'Systemeintrag im Tagebuch mit {age}.',
    today_list: 'Platzhalter: {names}, {count}.',
    register_success_with_year: 'Platzhalter: {displayName}, {birthdayDate}, {age}, {year}.'
  };

  const state = {
    tab: 'overview',
    loading: false,
    error: '',
    notice: '',
    status: null,
    users: null,
    settings: null,
    texts: null,
    textCategory: '',
    userSearch: '',
    showState: null,
    showAssets: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function boolText(value) { return value ? 'Aktiv' : 'Inaktiv'; }
  function fmt(value) { return value === undefined || value === null || value === '' ? '<span class="birthday-muted">-</span>' : esc(value); }
  function avatarHtml(url, name){ const initial = esc(String(name || '?').slice(0,1).toUpperCase()); return url ? `<img class="birthday-avatar" src="${esc(url)}" alt="">` : `<span class="birthday-avatar birthday-avatar-fallback">${initial}</span>`; }
  function rows(data) { return Array.isArray(data?.rows) ? data.rows : []; }
  function userRows() { return Array.isArray(state.users?.users) ? state.users.users : []; }
  function textData() { return state.texts?.texts || state.texts || {}; }
  function textCategories() { return Array.isArray(textData().categories) ? textData().categories : []; }
  function textKeys() { return Array.isArray(textData().keys) ? textData().keys : []; }
  function textKeyLabel(key) { return TEXT_KEY_LABELS[key] || key; }
  function textKeyHint(key) { return TEXT_KEY_HINTS[key] || 'Mehrere aktive Varianten sind möglich. Das Backend wählt zufällig eine Variante.'; }

  function ensurePanel() {
    root = document.getElementById('birthdayModule');
    if (root) return root;
    const main = document.querySelector('.main');
    if (!main) return null;
    root = document.createElement('section');
    root.id = 'birthdayModule';
    root.className = 'dashboard-module birthday-admin';
    root.dataset.modulePanel = 'birthday';
    root.hidden = true;
    main.appendChild(root);
    return root;
  }

  function registerWithDashboard() {
    if (!window.CGN) return;
    window.CGN.modules.birthday = {
      title: 'Birthday-System',
      panelId: 'birthdayModule',
      group: 'community',
      overlayLink: '/overlays/_overlay-birthday.html?debug=1',
      overlayLabel: 'Birthday-Overlay öffnen',
      reload() { return window.BirthdayModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.birthday = {
      label: 'Birthday-System',
      icon: '🎂',
      enabled: true,
      description: 'Geburtstage, automatische kleine Gratulationen, manuelle Birthday-Shows mit @User, Avatar und Party-Presets.'
    };
    const items = window.CGN.sections?.community?.items;
    if (Array.isArray(items) && !items.includes('birthday')) {
      const commandsIndex = items.indexOf('commands');
      if (commandsIndex >= 0) items.splice(commandsIndex, 0, 'birthday');
      else items.push('birthday');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('birthday')) {
      window.CGN.favorites.push('birthday');
    }
  }

  async function loadAll(force) {
    ensurePanel();
    if (!root || !window.CGN) return;
    if (!force && state.status && state.users && state.settings && state.texts) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, users, settings, texts, showState, showAssets] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(`${api.users}?includeInactive=true`).catch(err => ({ ok:false, error:err.message, users:[] })),
        window.CGN.api(api.settings),
        window.CGN.api(api.texts),
        window.CGN.api(api.showState).catch(err => ({ ok:false, error:err.message, state:null })),
        window.CGN.api(api.showAssets).catch(err => ({ ok:false, error:err.message }))
      ]);
      state.status = status;
      state.users = users;
      state.settings = settings;
      state.texts = texts;
      state.showState = showState;
      state.showAssets = showAssets;
      state.loading = false;
      state.error = '';
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function reloadBackend() {
    await window.CGN.api(api.reload, { method: 'POST', body: '{}' });
    await loadAll(true);
  }

  function getSettingInputValue(row) {
    const el = root?.querySelector(`[data-birthday-setting="${CSS.escape(row.key)}"]`);
    if (!el) return row.value;
    if (row.valueType === 'boolean') return el.value === 'true';
    if (row.valueType === 'number') return Number(el.value);
    if (row.valueType === 'json') {
      try { return JSON.parse(el.value); } catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return el.value;
  }

  async function saveSetting(key) {
    const row = rows(state.settings?.settings).find(item => item.key === key);
    if (!row) return;
    await window.CGN.api(api.settings, { method: 'POST', body: JSON.stringify({ key, value: getSettingInputValue(row) }) });
    state.notice = `Setting gespeichert: ${key}`;
    await loadAll(true);
  }

  function selectedTextCategory() {
    const cats = textCategories();
    if (!cats.length) return '';
    if (!state.textCategory || !cats.some(cat => cat.id === state.textCategory)) state.textCategory = cats[0].id;
    return state.textCategory;
  }

  async function saveVariant(id, key) {
    const safeId = String(id || 'new');
    const textEl = root?.querySelector(`[data-birthday-variant-text="${CSS.escape(safeId)}"][data-birthday-variant-key="${CSS.escape(key)}"]`);
    const enabledEl = root?.querySelector(`[data-birthday-variant-enabled="${CSS.escape(safeId)}"][data-birthday-variant-key="${CSS.escape(key)}"]`);
    const weightEl = root?.querySelector(`[data-birthday-variant-weight="${CSS.escape(safeId)}"][data-birthday-variant-key="${CSS.escape(key)}"]`);
    if (!textEl) return;
    await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({
      action: 'saveVariant',
      variant: {
        id: id && id !== 'new' ? Number(id) : undefined,
        key,
        category: selectedTextCategory() || 'general',
        value: textEl.value,
        enabled: enabledEl ? enabledEl.checked : true,
        weight: weightEl ? Number(weightEl.value || 1) : 1
      }
    }) });
    state.notice = 'Textvariante gespeichert.';
    await loadAll(true);
  }

  async function addVariant(key) {
    const el = root?.querySelector(`[data-birthday-new-variant="${CSS.escape(key)}"]`);
    const value = String(el?.value || '').trim();
    if (!value) throw new Error('Bitte zuerst einen neuen Text eintragen.');
    await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({
      action: 'saveVariant',
      variant: { key, category: selectedTextCategory() || 'general', value, enabled: true, weight: 1 }
    }) });
    state.notice = 'Textvariante hinzugefügt.';
    await loadAll(true);
  }

  async function deleteVariant(id) {
    if (!id) return;
    if (!window.confirm('Diese Textvariante wirklich löschen?')) return;
    await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({ action:'deleteVariant', id:Number(id) }) });
    state.notice = 'Textvariante gelöscht.';
    await loadAll(true);
  }

  async function saveUserFromForm() {
    const login = root?.querySelector('[data-birthday-user-login]')?.value || '';
    const displayName = root?.querySelector('[data-birthday-user-display]')?.value || '';
    const birthdayDate = root?.querySelector('[data-birthday-user-date]')?.value || '';
    const active = root?.querySelector('[data-birthday-user-active]')?.value !== 'false';
    const showSongFile = root?.querySelector('[data-birthday-user-song]')?.value || '';
    const showSongVolume = root?.querySelector('[data-birthday-user-volume]')?.value || '';
    const showSongDurationMs = root?.querySelector('[data-birthday-user-song-ms]')?.value || '';
    if (!login.trim()) throw new Error('Username fehlt.');
    if (!birthdayDate.trim()) throw new Error('Geburtstag fehlt.');
    await window.CGN.api(api.user, { method:'POST', body: JSON.stringify({ login, displayName, birthdayDate, active, showSongFile, showSongVolume, showSongDurationMs }) });
    state.notice = `Geburtstag gespeichert: ${login}`;
    await loadAll(true);
  }

  function fillUserForm(login) {
    const user = userRows().find(item => item.login === login);
    if (!user) return;
    const loginEl = root?.querySelector('[data-birthday-user-login]');
    const displayEl = root?.querySelector('[data-birthday-user-display]');
    const dateEl = root?.querySelector('[data-birthday-user-date]');
    const activeEl = root?.querySelector('[data-birthday-user-active]');
    const songEl = root?.querySelector('[data-birthday-user-song]');
    const volumeEl = root?.querySelector('[data-birthday-user-volume]');
    const songMsEl = root?.querySelector('[data-birthday-user-song-ms]');
    if (loginEl) loginEl.value = user.login || '';
    if (displayEl) displayEl.value = user.displayName || '';
    if (dateEl) dateEl.value = user.birthdayDateWithYear || user.birthdayDate || '';
    if (activeEl) activeEl.value = user.active ? 'true' : 'false';
    if (songEl) songEl.value = user.showSongFile || '';
    if (volumeEl) volumeEl.value = user.showSongVolume || '';
    if (songMsEl) songMsEl.value = user.showSongDurationMs || '';
  }

  async function deleteUser(login, hard = false) {
    if (!login) return;
    if (!window.confirm(hard ? `Geburtstag von ${login} endgültig löschen?` : `Geburtstag von ${login} deaktivieren?`)) return;
    await window.CGN.api(api.deleteUser, { method:'POST', body: JSON.stringify({ login, hard }) });
    state.notice = hard ? `Gelöscht: ${login}` : `Deaktiviert: ${login}`;
    await loadAll(true);
  }


  async function stopShow() {
    await window.CGN.api(api.showStop, { method:'POST', body:'{}' });
    state.notice = 'Birthday-Show gestoppt.';
    await loadAll(true);
  }



  async function recheckShowAssets() {
    state.showAssets = await window.CGN.api(api.showRecheck, { method:'POST', body:'{}' });
    state.notice = 'Birthday-Mediendauer neu geprüft.';
    await loadAll(true);
  }

  async function uploadAsset(kind) {
    const fileInput = root?.querySelector(`[data-birthday-upload-file="${CSS.escape(kind)}"]`);
    const loginInput = root?.querySelector('[data-birthday-upload-login]');
    const file = fileInput?.files?.[0] || null;
    if (!file) throw new Error('Bitte zuerst eine Datei auswählen.');
    const fd = new FormData();
    fd.append('kind', kind);
    fd.append('file', file);
    if (kind === 'user_song') {
      const login = String(loginInput?.value || root?.querySelector('[data-birthday-user-login]')?.value || '').trim();
      if (!login) throw new Error('Für User-Song bitte zuerst @User oder Twitch-Login angeben.');
      fd.append('login', login);
    }
    const res = await fetch(api.upload, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    const profile = data.profile || data.reference?.profile || {};
    const niceName = profile.displayNameOverride || profile.displayName || profile.login || '';
    state.notice = `Upload gespeichert: ${data.relativePath || data.fileName || kind}${niceName ? ` für ${niceName}` : ''}`;
    await loadAll(true);
  }


  function bindBirthdayMediaFields() {
    const fields = Array.from(root?.querySelectorAll('[data-birthday-media-target][data-media-field]') || []);
    if (!fields.length) return;
    if (!window.MediaField?.attach) {
      console.warn('[Birthday] MediaField component not available yet.');
      return;
    }
    fields.forEach(field => {
      const targetSelector = field.dataset.birthdayMediaTarget || '';
      if (!field.__birthdayMediaTargetBound) {
        field.addEventListener('media-field:change', ev => {
          const asset = ev.detail?.asset || null;
          const target = targetSelector ? root?.querySelector(targetSelector) : null;
          if (!target) return;
          target.value = asset ? (asset.relativePath || asset.webPath || '') : '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        });
        field.__birthdayMediaTargetBound = true;
      }
      window.MediaField.attach(field);
    });
  }


  function birthdayUploadSafeKind(kind) {
    return String(kind || '').replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function birthdayUploadFileInput(kind) {
    const safeKind = birthdayUploadSafeKind(kind);
    if (!safeKind) return null;
    return root?.querySelector('[data-birthday-upload-file="' + safeKind + '"]') || null;
  }

  function updateBirthdayUploadFallbackButtons() {
    root?.querySelectorAll('[data-birthday-upload]').forEach(btn => {
      const kind = btn.dataset.birthdayUpload || '';
      const input = birthdayUploadFileInput(kind);
      const hasFile = !!(input && input.files && input.files.length);
      btn.disabled = !hasFile;
      btn.classList.toggle('is-disabled', !hasFile);
      btn.title = hasFile ? '' : 'Bitte zuerst eine Datei auswählen.';
    });
  }


  // STEP274W_FIX1_IMPORT_MEDIA_PICKER
  async function importBirthdayShowMedia(kind) {
    const cleanKind = String(kind || '').trim();
    if (!cleanKind) throw new Error('Import-Typ fehlt.');
    if (!window.MediaPicker?.open) throw new Error('MediaPicker ist nicht verfügbar. Bitte Dashboard hart neu laden.');

    const cfg = {
      intro_video: {
        title: 'Birthday Intro-Video auswählen oder hochladen',
        allowedTypes: ['video', 'animation']
      },
      default_song: {
        title: 'Birthday Standardsong auswählen oder hochladen',
        allowedTypes: ['audio']
      },
      user_song: {
        title: 'Birthday User-Song auswählen oder hochladen',
        allowedTypes: ['audio']
      }
    }[cleanKind];

    if (!cfg) throw new Error('Unbekannter Birthday-Medientyp: ' + cleanKind);

    let login = '';
    if (cleanKind === 'user_song') {
      login = String(root?.querySelector('[data-birthday-import-login]')?.value || root?.querySelector('[data-birthday-upload-login]')?.value || root?.querySelector('[data-birthday-user-login]')?.value || '').trim();
      if (!login) throw new Error('Für User-Song bitte zuerst @User oder Twitch-Login eintragen.');
    }

    window.MediaPicker.open({
      moduleKey: 'birthday',
      categoryKey: 'general',
      allowedTypes: cfg.allowedTypes,
      title: cfg.title,
      onSelect: async (asset) => {
        if (!asset || !asset.id) return;
        try {
          state.error = '';
          state.notice = 'Birthday-Medium wird übernommen...';
          render();

          const result = await window.CGN.api(api.importMedia, {
            method: 'POST',
            body: JSON.stringify({
              kind: cleanKind,
              mediaId: asset.id,
              login
            })
          });

          state.notice = result?.message || 'Birthday-Medium übernommen.';
          await loadAll(true);
        } catch (err) {
          state.error = err.message || String(err);
          render();
        }
      }
    });
  }

  function currentParties() {
    const assets = state.showAssets?.ok ? state.showAssets : (state.status?.showAssets || {});
    return Array.isArray(assets.parties) ? assets.parties : [];
  }

  function currentProfiles() {
    const assets = state.showAssets?.ok ? state.showAssets : (state.status?.showAssets || {});
    return Array.isArray(assets.profiles) ? assets.profiles : [];
  }

  function currentStyles() {
    const assets = state.showAssets?.ok ? state.showAssets : (state.status?.showAssets || {});
    return Array.isArray(assets.stylePresets) ? assets.stylePresets : (Array.isArray(state.status?.config?.partyStyles) ? state.status.config.partyStyles : []);
  }

  async function savePartyFromForm() {
    const partyKey = root?.querySelector('[data-birthday-party-key]')?.value || '';
    const title = root?.querySelector('[data-birthday-party-title]')?.value || '';
    const styleKey = root?.querySelector('[data-birthday-party-style]')?.value || 'cgn_neon';
    const songFile = root?.querySelector('[data-birthday-party-song]')?.value || '';
    const headlineTemplate = root?.querySelector('[data-birthday-party-headline]')?.value || '{headline}';
    const sublineTemplate = root?.querySelector('[data-birthday-party-subline]')?.value || '{message}';
    const isDefault = root?.querySelector('[data-birthday-party-default]')?.checked || false;
    if (!partyKey && !title) throw new Error('Bitte Party-Key oder Titel eintragen.');
    await window.CGN.api(api.showParties, { method:'POST', body: JSON.stringify({ partyKey, title, styleKey, songFile, headlineTemplate, sublineTemplate, isDefault, enabled:true }) });
    state.notice = 'Party gespeichert.';
    await loadAll(true);
  }

  async function assignPartyFromForm() {
    const login = root?.querySelector('[data-birthday-profile-login]')?.value || '';
    const partyKey = root?.querySelector('[data-birthday-profile-party]')?.value || '';
    if (!login) throw new Error('Bitte @User oder Twitch-Login eintragen.');
    const result = await window.CGN.api(api.showProfile, { method:'POST', body: JSON.stringify({ login, partyKey, active:true }) });
    const profile = result.profile || {};
    state.notice = `User-Party-Zuordnung gespeichert${profile.displayNameOverride ? ` für ${profile.displayNameOverride}` : ''}.`;
    await loadAll(true);
  }

  function fillPartyForm(partyKey) {
    const party = currentParties().find(item => item.partyKey === partyKey);
    if (!party) return;
    const set = (sel, val) => { const el = root?.querySelector(sel); if (el) el.value = val ?? ''; };
    set('[data-birthday-party-picker]', party.partyKey);
    set('[data-birthday-party-key]', party.partyKey);
    set('[data-birthday-party-title]', party.title);
    set('[data-birthday-party-style]', party.styleKey || 'cgn_neon');
    set('[data-birthday-party-song]', party.songFile || '');
    set('[data-birthday-party-headline]', party.headlineTemplate || '{headline}');
    set('[data-birthday-party-subline]', party.sublineTemplate || '{message}');
    const def = root?.querySelector('[data-birthday-party-default]'); if (def) def.checked = !!party.isDefault;
  }

  function clearPartyForm() {
    const set = (sel, val) => { const el = root?.querySelector(sel); if (el) el.value = val ?? ''; };
    set('[data-birthday-party-picker]', '');
    set('[data-birthday-party-key]', '');
    set('[data-birthday-party-title]', '');
    set('[data-birthday-party-style]', 'cgn_neon');
    set('[data-birthday-party-song]', '');
    set('[data-birthday-party-headline]', '{headline}');
    set('[data-birthday-party-subline]', '{message}');
    const def = root?.querySelector('[data-birthday-party-default]'); if (def) def.checked = false;
  }

  function fillProfileForm(login) {
    const clean = String(login || '').trim().toLowerCase();
    const profile = currentProfiles().find(item => item.login === clean) || {};
    const userSong = (state.showAssets?.userSongs || []).find(item => item.login === clean) || {};
    const loginEl = root?.querySelector('[data-birthday-profile-login]');
    const partyEl = root?.querySelector('[data-birthday-profile-party]');
    if (loginEl) loginEl.value = clean || profile.login || userSong.login || '';
    if (partyEl) partyEl.value = profile.partyKey || '';
  }

  function sortedParties() {
    return currentParties().slice().sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return String(a.title || a.partyKey || '').localeCompare(String(b.title || b.partyKey || ''), 'de');
    });
  }

  function partyOptionLabel(party) {
    const title = party.title || party.partyKey || 'Party';
    const style = party.style?.label || party.styleKey || '';
    return `${title}${style ? ` · ${style}` : ''}${party.isDefault ? ' · Standard' : ''}`;
  }

  function renderSettingInput(row) {
    if (row.valueType === 'boolean') {
      return `<select data-birthday-setting="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    }
    if (row.valueType === 'json') return `<textarea data-birthday-setting="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-birthday-setting="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderOverview() {
    const status = state.status || {};
    const cfg = status.config || {};
    const today = status.today || {};
    const stats = status.stats || {};
    const show = state.showState?.state || status.show || {};
    return `
      <div class="birthday-grid">
        <section class="birthday-card birthday-card-main">
          <h3>Status</h3>
          <div class="birthday-kpis">
            <div><strong>${boolText(cfg.enabled)}</strong><span>Modul</span></div>
            <div><strong>${boolText(cfg.automaticGreeting?.enabled)}</strong><span>Auto-Gratulation</span></div>
            <div><strong>${esc(today.count ?? 0)}</strong><span>Heute</span></div>
            <div><strong>${esc(userRows().length)}</strong><span>Einträge</span></div>
          </div>
          <div class="birthday-rows">
            <div><span>Command</span><strong>!${fmt(cfg.command?.trigger || 'birthday')}</strong></div>
            <div><span>Alias</span><strong>${fmt((cfg.command?.aliases || []).join(', '))}</strong></div>
            <div><span>Timezone</span><strong>${fmt(cfg.timezone)}</strong></div>
            <div><span>Chat-Hook</span><strong>${status.chatHookInstalled ? 'installiert' : 'nicht installiert'}</strong></div>
            <div><span>Auto-Checks</span><strong>${esc(stats.automaticChecks ?? 0)}</strong></div>
            <div><span>Auto-Gratulationen</span><strong>${esc(stats.automaticGreetings ?? 0)}</strong></div>
            <div><span>Birthday-Show</span><strong>${show.active ? `${esc(show.phase)} für @${esc(show.targetDisplayName || show.targetLogin)}` : 'inaktiv'}</strong></div>
          </div>
          <div class="birthday-row-actions"><a class="birthday-link-btn" href="/overlays/_overlay-birthday.html?debug=1" target="_blank">Overlay öffnen</a><button type="button" data-birthday-stop-show>Show stoppen</button></div>
        </section>
        <section class="birthday-card">
          <h3>Heute Geburtstag</h3>
          ${(today.rows || []).length ? `<div class="birthday-mini-list">${today.rows.map(user => `<button type="button" data-edit-birthday-user="${esc(user.login)}"><strong>${esc(user.displayName || user.login)}</strong><span>${esc(user.birthdayDateWithYear || user.birthdayDate || '')}</span></button>`).join('')}</div>` : '<div class="birthday-empty">Heute keine registrierten Geburtstage.</div>'}
        </section>
      </div>
    `;
  }

  function renderUsers() {
    const users = userRows();
    return `
      <div class="birthday-grid birthday-grid-users">
        <section class="birthday-card">
          <h3>User bearbeiten</h3>
          <div class="birthday-form">
            <label>Twitch-Login<input type="text" data-birthday-user-login placeholder="forrestcgn"></label>
            <label>Anzeigename<input type="text" data-birthday-user-display placeholder="ForrestCGN"></label>
            <label>Geburtstag<input type="text" data-birthday-user-date placeholder="22.05 oder 22.05.1980"></label>
            <label>Status<select data-birthday-user-active><option value="true">aktiv</option><option value="false">inaktiv</option></select></label>
            <label>User-Song-Datei <input type="text" data-birthday-user-song placeholder="media/birthday/general/birthday_song_user.mp3 oder leer für Standard"></label>
            <div class="birthday-mediafield-block" data-media-field data-module-key="birthday" data-category-key="general" data-allowed-types="audio" data-title="User-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-user-song]"></div>
            <label>Song-Dauer ms <input type="number" data-birthday-user-song-ms placeholder="auto / optional"></label>
            <label>Song-Lautstärke <input type="number" min="0" max="100" data-birthday-user-volume placeholder="85"></label>
            <p class="birthday-note">Das Intro-Video ist global. User-Songs werden technisch per Login gespeichert, im Dashboard/Overlay aber mit Anzeigename + Avatar genutzt.</p>
            <button type="button" data-birthday-save-user>Speichern</button>
          </div>
        </section>
        <section class="birthday-card birthday-card-main">
          <h3>Registrierte Geburtstage</h3>
          <div class="birthday-table-wrap"><table><thead><tr><th>User</th><th>Datum</th><th>Alter</th><th>Show-Song</th><th>Status</th><th></th></tr></thead><tbody>
            ${users.map(user => `<tr>
              <td><strong>${esc(user.displayName || user.login)}</strong><small>${esc(user.login)}</small></td>
              <td>${esc(user.birthdayDateWithYear || user.birthdayDate || '')}</td>
              <td>${user.age == null ? '-' : esc(user.age)}</td>
              <td>${fmt(user.showSongFile || '')}</td>
              <td>${user.active ? '<span class="birthday-pill ok">aktiv</span>' : '<span class="birthday-pill warn">inaktiv</span>'}</td>
              <td class="birthday-row-actions"><button type="button" data-edit-birthday-user="${esc(user.login)}">Bearbeiten</button><button type="button" data-delete-birthday-user="${esc(user.login)}">Deaktivieren</button><button type="button" class="danger" data-hard-delete-birthday-user="${esc(user.login)}">Löschen</button></td>
            </tr>`).join('')}
          </tbody></table></div>
          ${!users.length ? '<div class="birthday-empty">Noch keine Geburtstage gespeichert.</div>' : ''}
        </section>
      </div>`;
  }

  function byteLabel(bytes) {
    const n = Number(bytes || 0);
    if (!n) return '-';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 102.4) / 10} KB`;
    return `${Math.round(n / 1024 / 102.4) / 10} MB`;
  }

  function assetBadge(asset) {
    if (!asset || !asset.relativePath) return '<span class="birthday-pill warn">nicht gesetzt</span>';
    if (!asset.exists) return '<span class="birthday-pill warn">Datei fehlt</span>';
    if (!asset.durationOk) return '<span class="birthday-pill warn">Dauer Fallback</span>';
    return '<span class="birthday-pill ok">bereit</span>';
  }

  function renderAssetBox(title, asset) {
    asset = asset || {};
    return `<article class="birthday-asset-box">
      <div class="birthday-asset-head"><strong>${esc(title)}</strong>${assetBadge(asset)}</div>
      <div class="birthday-rows compact">
        <div><span>Datei</span><strong>${fmt(asset.relativePath || '')}</strong></div>
        <div><span>Dauer</span><strong>${fmt(asset.durationLabel || '')} <small>${asset.durationOk ? 'ffprobe' : (asset.durationSource || 'unbekannt')}</small></strong></div>
        <div><span>Größe</span><strong>${esc(byteLabel(asset.sizeBytes))}</strong></div>
        <div><span>Media</span><strong>${asset.hasVideo ? 'Video' : ''}${asset.hasVideo && asset.hasAudio ? ' + ' : ''}${asset.hasAudio ? 'Audio' : ''}${(!asset.hasVideo && !asset.hasAudio) ? '-' : ''}</strong></div>
        <div><span>Sound-System</span><strong>${asset.soundSystem?.canPlay ? 'abspielbar' : 'nicht bereit'}${asset.soundSystem?.expectedKindOk === false ? ' · Typ prüfen' : ''}</strong></div>
        <div><span>SoundPegel</span><strong>${asset.loudness?.known ? `bekannt (${esc(asset.loudness.status || 'ok')})` : `nicht gescannt`}</strong></div>
      </div>
      ${asset.error ? `<p class="birthday-note warn">${esc(asset.error)}</p>` : ''}
      ${asset.fallbackUsed ? '<p class="birthday-note warn">Dauer konnte nicht sicher gelesen werden. Es wird ein Fallback genutzt.</p>' : ''}
    </article>`;
  }

  function renderShow() {
    const status = state.status || {};
    const cfg = status.config?.show || {};
    const show = state.showState?.state || status.show || {};
    const assets = state.showAssets?.ok ? state.showAssets : (status.showAssets || {});
    const timing = assets.timingPreview || {};
    const queue = Array.isArray(show.queue) ? show.queue : [];
    return `
      <div class="birthday-grid birthday-grid-users">
        <section class="birthday-card birthday-card-main">
          <h3>Party-Show Status</h3>
          <p class="birthday-note">Medien laufen über das Sound-System. Das Birthday-Overlay bleibt während des Intro-Videos ruhig und eskaliert erst, wenn die Song-Phase startet.</p>
          <div class="birthday-rows">
            <div><span>Status</span><strong>${show.active ? `${esc(show.phase)} für @${esc(show.targetDisplayName || show.targetLogin)}` : 'inaktiv'}</strong></div>
            <div><span>Aktive Party</span><strong>${fmt(show.partyTitle || show.partyKey || '')} ${show.styleKey ? `· ${esc(show.styleKey)}` : ''}</strong></div>
            <div><span>Intro-Video</span><strong>${fmt(cfg.defaultVideoFile || cfg.defaultVideoUrl || '')}</strong></div>
            <div><span>Standardsong</span><strong>${fmt(cfg.defaultSongFile || '')}</strong></div>
            <div><span>Timing Standard</span><strong>${fmt(timing.defaultTotalDurationLabel || '')} gesamt · Party ab ${fmt(timing.partyStartsAfterLabel || '')}</strong></div>
            <div><span>Sound-System</span><strong>${fmt(cfg.soundOutputTarget || 'overlay')} / ${fmt(cfg.soundTarget || 'stream')}</strong></div>
            <div><span>Exklusiv</span><strong>${cfg.forceExclusive === false ? 'nein' : 'ja'}</strong></div>
          </div>
          ${(timing.warnings || []).length ? `<div class="birthday-error small">Warnungen: ${esc(timing.warnings.join(', '))}</div>` : ''}
          <div class="birthday-row-actions"><a class="birthday-link-btn" href="/overlays/_overlay-birthday.html?debug=1" target="_blank">Birthday-Overlay öffnen</a><button type="button" data-birthday-stop-show>Show stoppen</button><button type="button" data-birthday-recheck-assets>Dauer neu prüfen</button></div>
          <div class="birthday-queue-box"><h4>Birthday-/Sound-System-Warteschlange</h4>${queue.length ? `<ol>${queue.map(item => `<li><strong>@${esc(item.targetDisplayName || item.targetLogin)}</strong> <span>${esc(item.status || '')}</span> <small>${esc(item.partyTitle || item.partyKey || 'Standard-Party')}</small></li>`).join('')}</ol>` : '<p class="birthday-note">Keine Birthday-Show in der Warteschlange.</p>'}</div>
        </section>
        <section class="birthday-card birthday-media-import-card">
          <h3>Medien auswählen / hochladen</h3>
          <p class="birthday-note">STEP274W_FIX1_SHOW_MEDIAPICKER_UI: Hauptweg ist jetzt der zentrale MediaPicker. Uploads landen zuerst in der Media-Registry und werden danach kontrolliert ins Birthday-/Sound-System übernommen.</p>

          <div class="birthday-media-import-grid">
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="intro_video">
              <strong>🎬 Intro-Video auswählen</strong>
              <span>MediaPicker · erlaubt Video/Animation</span>
            </button>
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="default_song">
              <strong>🔊 Standardsong auswählen</strong>
              <span>MediaPicker · erlaubt Audio</span>
            </button>
          </div>

          <div class="birthday-media-user-import">
            <label>User für eigenen Song<input type="text" data-birthday-import-login placeholder="@Araglor"></label>
            <button type="button" class="birthday-media-import-btn" data-birthday-import-media="user_song">
              <strong>🔊 User-Song auswählen</strong>
              <span>Erst User eintragen, dann MediaPicker öffnen</span>
            </button>
          </div>

          <details class="birthday-legacy-upload-fallback">
            <summary>Legacy-Direktupload anzeigen</summary>
            <div class="birthday-form">
              <label>Globales Intro-Video<input type="file" data-birthday-upload-file="intro_video" accept="video/webm,video/mp4,video/quicktime"></label>
              <button type="button" data-birthday-upload="intro_video" disabled title="Bitte zuerst eine Datei auswählen.">Intro-Video hochladen</button>
              <label>Standardsong<input type="file" data-birthday-upload-file="default_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>
              <button type="button" data-birthday-upload="default_song" disabled title="Bitte zuerst eine Datei auswählen.">Standardsong hochladen</button>
              <label>User für eigenen Song<input type="text" data-birthday-upload-login placeholder="@Araglor"></label>
              <label>User-Song<input type="file" data-birthday-upload-file="user_song" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label>
              <button type="button" data-birthday-upload="user_song" disabled title="Bitte zuerst eine Datei auswählen.">User-Song hochladen</button>
            </div>
            <p class="birthday-note">Fallback nur nutzen, wenn der MediaPicker nicht verfügbar ist.</p>
          </details>
        </section>
      </div>
      <section class="birthday-card birthday-card-main">
        <h3>Medien-Status & Laufzeiten</h3>
        <p class="birthday-note">Diese Werte steuern das Timing: Intro-Dauer → Songstart/Partyphase → Songdauer → Overlay aus.</p>
        <div class="birthday-asset-grid">
          ${renderAssetBox('Globales Intro-Video', assets.intro)}
          ${renderAssetBox('Standardsong', assets.defaultSong)}
        </div>
      </section>`;
  }

  function renderParties() {
    const assets = state.showAssets?.ok ? state.showAssets : (state.status?.showAssets || {});
    const userSongs = Array.isArray(assets.userSongs) ? assets.userSongs : [];
    const parties = sortedParties();
    const profiles = currentProfiles();
    const styles = currentStyles();
    const partyOptions = parties.map(party => `<option value="${esc(party.partyKey)}">${esc(partyOptionLabel(party))}</option>`).join('');
    const profileLogins = Array.from(new Set([
      ...profiles.map(p => p.login),
      ...userSongs.map(u => u.login)
    ].filter(Boolean))).sort((a,b) => String(a).localeCompare(String(b), 'de'));

    return `
      <section class="birthday-card birthday-card-main birthday-manager-card">
        <div class="birthday-section-head">
          <div><h3>Partys verwalten</h3><p class="birthday-note">Hier legst du Party-Presets an. Danach weist du rechts einen User einer Party zu. Ohne Zuordnung läuft immer Standard-Party + Standardsong.</p></div>
          <button type="button" data-birthday-new-party>Neue Party</button>
        </div>
        <div class="birthday-grid birthday-grid-users birthday-grid-tight">
          <section class="birthday-subcard">
            <h4>Party auswählen / bearbeiten</h4>
            <div class="birthday-form">
              <label>Vorhandene Party<select data-birthday-party-picker><option value="">Neue Party anlegen...</option>${partyOptions}</select></label>
              <div class="birthday-form-two">
                <label>Party-Key<input type="text" data-birthday-party-key placeholder="araglor_party"></label>
                <label>Titel<input type="text" data-birthday-party-title placeholder="Araglor Party"></label>
              </div>
              <div class="birthday-form-two">
                <label>Style<select data-birthday-party-style>${styles.map(style => `<option value="${esc(style.key)}">${esc(style.label || style.key)}</option>`).join('')}</select></label>
                <label>Song-Datei optional<input type="text" data-birthday-party-song placeholder="media/birthday/general/birthday_song_araglor_2.mp3 oder leer = User/Standard-Song"></label>
                <div class="birthday-mediafield-block" data-media-field data-module-key="birthday" data-category-key="general" data-allowed-types="audio" data-title="Party-Song auswählen oder hochladen" data-birthday-media-target="[data-birthday-party-song]"></div>
              </div>
              <label>Headline Template<input type="text" data-birthday-party-headline value="{headline}"></label>
              <label>Subline Template<input type="text" data-birthday-party-subline value="{message}"></label>
              <label class="birthday-check"><input type="checkbox" data-birthday-party-default> als Standard-Party setzen</label>
              <button type="button" data-birthday-save-party>Party speichern</button>
            </div>
          </section>
          <section class="birthday-subcard">
            <h4>User einer Party zuordnen</h4>
            <div class="birthday-form">
              <label>User / Mention<input type="text" data-birthday-profile-login placeholder="@Araglor" list="birthday-profile-logins"></label>
              <datalist id="birthday-profile-logins">${profileLogins.map(login => `<option value="${esc(login)}"></option>`).join('')}</datalist>
              <label>Party<select data-birthday-profile-party><option value="">Standard-Party nutzen</option>${partyOptions}</select></label>
              <button type="button" data-birthday-assign-party>User zuordnen</button>
            </div>
            <p class="birthday-note">Du kannst @Anzeigename, Anzeigename oder Login eingeben. Gespeichert wird der Login; angezeigt werden Anzeigename und Avatar, wenn auflösbar.</p>
          </section>
        </div>
      </section>

      <section class="birthday-card birthday-card-main">
        <h3>Party-Presets</h3>
        ${parties.length ? `<div class="birthday-table-wrap"><table><thead><tr><th>Party</th><th>Style</th><th>Song</th><th>Status</th><th></th></tr></thead><tbody>${parties.map(party => `<tr><td><strong>${esc(party.title || party.partyKey)}</strong><small>${esc(party.partyKey)}${party.isDefault ? ' · Standard' : ''}</small></td><td>${esc(party.style?.label || party.styleKey || '')}</td><td>${fmt(party.songFile || 'Fallback/User/Standard')}</td><td>${party.enabled ? '<span class="birthday-pill ok">aktiv</span>' : '<span class="birthday-pill warn">inaktiv</span>'}</td><td><button type="button" data-edit-birthday-party="${esc(party.partyKey)}">Bearbeiten</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="birthday-empty">Noch keine Party-Presets.</div>'}
      </section>

      <section class="birthday-card birthday-card-main">
        <h3>User-Zuordnungen & Songs</h3>
        ${userSongs.length || profiles.length ? `<div class="birthday-table-wrap"><table><thead><tr><th>User</th><th>Zugeordnete Party</th><th>Song</th><th>Dauer</th><th>Status</th><th></th></tr></thead><tbody>${userSongs.map(item => {
          const asset = item.asset || {}; const profile = profiles.find(p => p.login === item.login) || {}; const party = profile.party || null;
          return `<tr><td><div class="birthday-userline">${avatarHtml(item.avatarUrl || item.asset?.avatarUrl || profile.avatarUrl || '', item.displayName || item.login)}<span><strong>${esc(item.displayName || item.login)}</strong><small>${esc(item.login)}</small></span></div></td><td>${party ? `<strong>${esc(party.title || party.partyKey)}</strong><small>${esc(party.partyKey || '')}</small>` : '<span class="birthday-muted">Standard-Party</span>'}</td><td>${fmt(asset.relativePath || '')}</td><td>${fmt(asset.durationLabel || '')} <small>${esc(asset.durationSource || '')}</small></td><td>${asset.exists && asset.durationOk ? '<span class="birthday-pill ok">bereit</span>' : '<span class="birthday-pill warn">prüfen</span>'}</td><td><button type="button" data-edit-birthday-profile="${esc(item.login)}">Zuordnung bearbeiten</button></td></tr>`;
        }).join('')}${profiles.filter(p => !userSongs.some(u => u.login === p.login)).map(profile => `<tr><td><div class="birthday-userline">${avatarHtml(profile.avatarUrl || '', profile.displayNameOverride || profile.login)}<span><strong>${esc(profile.displayNameOverride || profile.login)}</strong><small>${esc(profile.login)}</small></span></div></td><td>${profile.party ? `<strong>${esc(profile.party.title || profile.party.partyKey)}</strong><small>${esc(profile.party.partyKey || '')}</small>` : '<span class="birthday-muted">Standard-Party</span>'}</td><td colspan="3"><span class="birthday-muted">kein eigener User-Song; Party/Standard-Song wird genutzt</span></td><td><button type="button" data-edit-birthday-profile="${esc(profile.login)}">Zuordnung bearbeiten</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="birthday-empty">Noch keine User-Songs oder Party-Zuordnungen hinterlegt.</div>'}
      </section>`;
  }

  function renderSettings() {
    const list = rows(state.settings?.settings);
    return `<section class="birthday-card"><h3>Settings</h3><p class="birthday-note">JSON bleibt Fallback. Speichern schreibt einzelne Werte in die DB.</p><div class="birthday-setting-list">${list.map(row => `
      <article class="birthday-setting-row">
        <div><strong>${esc(row.key)}</strong><span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span></div>
        <div class="birthday-setting-input">${renderSettingInput(row)}</div>
        <button type="button" data-save-birthday-setting="${esc(row.key)}">Speichern</button>
      </article>`).join('')}</div></section>`;
  }

  function renderTexts() {
    const cats = textCategories();
    const selected = selectedTextCategory();
    const keys = textKeys().filter(item => !selected || item.category === selected);
    return `<section class="birthday-card"><h3>Texte / Varianten</h3><p class="birthday-note">Kategorie wählen und Varianten bearbeiten. Mehrere aktive Varianten werden zufällig ausgewählt. Platzhalter u. a.: {displayName}, {birthdayDate}, {age}, {year}, {names}.</p>
      <div class="birthday-text-toolbar"><label>Kategorie<select data-birthday-text-category>${cats.map(cat => `<option value="${esc(cat.id)}" ${cat.id === selected ? 'selected' : ''}>${esc(cat.label || cat.id)} (${esc(cat.keyCount ?? cat.count ?? 0)} Keys / ${esc(cat.variantCount ?? 0)} Varianten)</option>`).join('')}</select></label></div>
      <div class="birthday-text-list">${keys.map(item => `
        <article class="birthday-text-row">
          <div class="birthday-text-head"><div><strong>${esc(textKeyLabel(item.key))}</strong><small>${esc(item.key)} · ${esc(textKeyHint(item.key))}</small></div><span>${esc(item.activeCount || 0)} aktiv / ${esc(item.totalCount || item.variants?.length || 0)} Varianten</span></div>
          <div class="birthday-variant-list">${(item.variants || []).map(variant => `
            <div class="birthday-variant-row">
              <textarea data-birthday-variant-text="${esc(variant.id)}" data-birthday-variant-key="${esc(item.key)}" spellcheck="false">${esc(variant.value ?? variant.text ?? '')}</textarea>
              <div class="birthday-variant-meta"><label><input type="checkbox" data-birthday-variant-enabled="${esc(variant.id)}" data-birthday-variant-key="${esc(item.key)}" ${variant.enabled ? 'checked' : ''}> Aktiv</label><label>Gewicht <input type="number" min="1" max="99" data-birthday-variant-weight="${esc(variant.id)}" data-birthday-variant-key="${esc(item.key)}" value="${esc(variant.weight || 1)}"></label><span>${esc(variant.source || '')}</span></div>
              <div class="birthday-row-actions"><button type="button" data-save-birthday-variant="${esc(variant.id)}" data-birthday-variant-key="${esc(item.key)}">Speichern</button><button type="button" class="danger" data-delete-birthday-variant="${esc(variant.id)}">Löschen</button></div>
            </div>`).join('')}</div>
          <div class="birthday-new-variant"><textarea data-birthday-new-variant="${esc(item.key)}" placeholder="Neue Variante für ${esc(textKeyLabel(item.key))} hinzufügen..." spellcheck="false"></textarea><button type="button" data-add-birthday-variant="${esc(item.key)}">Variante hinzufügen</button></div>
        </article>`).join('')}</div>
      ${!keys.length ? '<div class="birthday-empty">Keine Texte in dieser Kategorie.</div>' : ''}</section>`;
  }

  function render() {
    ensurePanel();
    if (!root) return;
    const tabs = [['overview','Übersicht'], ['show','Show/Medien'], ['parties','Partys'], ['users','Geburtstage'], ['settings','Settings'], ['texts','Texte']];
    root.innerHTML = `
      <div class="birthday-admin-wrap">
        <section class="birthday-card birthday-hero">
          <div><h2>🎂 Birthday-System</h2><p>Geburtstage verwalten, kleine automatische Chat-Gratulationen steuern und Texte im Heimaufsicht-Stil pflegen.</p></div>
          <div class="birthday-actions"><button type="button" data-birthday-reload>Backend neu laden</button><button type="button" data-birthday-refresh>Aktualisieren</button></div>
        </section>
        ${state.error ? `<div class="birthday-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="birthday-notice">${esc(state.notice)}</div>` : ''}
        ${state.loading ? '<div class="birthday-card">Lade Birthday-Daten...</div>' : `
          <div class="birthday-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-birthday-tab="${id}">${label}</button>`).join('')}</div>
          ${state.tab === 'show' ? renderShow() : state.tab === 'parties' ? renderParties() : state.tab === 'users' ? renderUsers() : state.tab === 'settings' ? renderSettings() : state.tab === 'texts' ? renderTexts() : renderOverview()}
        `}
      </div>`;
    bind();
    bindBirthdayMediaFields();
  }

  function bind() {
    root?.querySelector('[data-birthday-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelector('[data-birthday-reload]')?.addEventListener('click', () => reloadBackend().catch(err => { state.error = err.message; render(); }));
    root?.querySelector('[data-birthday-stop-show]')?.addEventListener('click', () => stopShow().catch(err => { state.error = err.message; render(); }));
    root?.querySelectorAll('[data-birthday-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.birthdayTab || 'overview'; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-save-birthday-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.saveBirthdaySetting).catch(err => { state.error = err.message; render(); })));
    root?.querySelector('[data-birthday-text-category]')?.addEventListener('change', ev => { state.textCategory = ev.target.value; render(); });
    root?.querySelectorAll('[data-save-birthday-variant]').forEach(btn => btn.addEventListener('click', () => saveVariant(btn.dataset.saveBirthdayVariant, btn.dataset.birthdayVariantKey).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-add-birthday-variant]').forEach(btn => btn.addEventListener('click', () => addVariant(btn.dataset.addBirthdayVariant).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-delete-birthday-variant]').forEach(btn => btn.addEventListener('click', () => deleteVariant(btn.dataset.deleteBirthdayVariant).catch(err => { state.error = err.message; render(); })));
    root?.querySelector('[data-birthday-save-user]')?.addEventListener('click', () => saveUserFromForm().catch(err => { state.error = err.message; render(); }));
    root?.querySelectorAll('[data-edit-birthday-user]').forEach(btn => btn.addEventListener('click', () => { state.tab = 'users'; render(); setTimeout(() => fillUserForm(btn.dataset.editBirthdayUser), 0); }));
    root?.querySelectorAll('[data-delete-birthday-user]').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.deleteBirthdayUser, false).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-hard-delete-birthday-user]').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.hardDeleteBirthdayUser, true).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-birthday-import-media]').forEach(btn => btn.addEventListener('click', () => {
      importBirthdayShowMedia(btn.dataset.birthdayImportMedia).catch(err => { state.error = err.message || String(err); render(); });
    }));
    root?.querySelectorAll('[data-birthday-upload-file]').forEach(input => input.addEventListener('change', updateBirthdayUploadFallbackButtons));
    root?.querySelectorAll('[data-birthday-upload]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      uploadAsset(btn.dataset.birthdayUpload).catch(err => { state.error = err.message; render(); });
    }));
    updateBirthdayUploadFallbackButtons();
    root?.querySelector('[data-birthday-recheck-assets]')?.addEventListener('click', () => recheckShowAssets().catch(err => { state.error = err.message; render(); }));
    root?.querySelector('[data-birthday-save-party]')?.addEventListener('click', () => savePartyFromForm().catch(err => { state.error = err.message; render(); }));
    root?.querySelector('[data-birthday-assign-party]')?.addEventListener('click', () => assignPartyFromForm().catch(err => { state.error = err.message; render(); }));
    root?.querySelector('[data-birthday-party-picker]')?.addEventListener('change', ev => { if (ev.target.value) fillPartyForm(ev.target.value); else clearPartyForm(); });
    root?.querySelector('[data-birthday-new-party]')?.addEventListener('click', () => clearPartyForm());
    root?.querySelector('[data-birthday-profile-login]')?.addEventListener('change', ev => fillProfileForm(ev.target.value));
    root?.querySelectorAll('[data-edit-birthday-party]').forEach(btn => btn.addEventListener('click', () => { state.tab = 'parties'; render(); setTimeout(() => fillPartyForm(btn.dataset.editBirthdayParty), 0); }));
    root?.querySelectorAll('[data-edit-birthday-profile]').forEach(btn => btn.addEventListener('click', () => { state.tab = 'parties'; render(); setTimeout(() => fillProfileForm(btn.dataset.editBirthdayProfile), 0); }));
  }

  function init() {
    registerWithDashboard();
    ensurePanel();
    window.SectionHomeModule?.render?.();
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'birthday') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { loadAll, render, init };
})();
