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
    showStop: '/api/birthday/show/stop'
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
    showState: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function boolText(value) { return value ? 'Aktiv' : 'Inaktiv'; }
  function fmt(value) { return value === undefined || value === null || value === '' ? '<span class="birthday-muted">-</span>' : esc(value); }
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
      description: 'Geburtstage, automatische kleine Gratulationen, manuelle Birthday-Show und Textvarianten.'
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
      const [status, users, settings, texts, showState] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(`${api.users}?includeInactive=true`).catch(err => ({ ok:false, error:err.message, users:[] })),
        window.CGN.api(api.settings),
        window.CGN.api(api.texts),
        window.CGN.api(api.showState).catch(err => ({ ok:false, error:err.message, state:null }))
      ]);
      state.status = status;
      state.users = users;
      state.settings = settings;
      state.texts = texts;
      state.showState = showState;
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
    const showVideoUrl = root?.querySelector('[data-birthday-user-video]')?.value || '';
    const showVideoDurationMs = root?.querySelector('[data-birthday-user-video-ms]')?.value || '';
    const showSongVolume = root?.querySelector('[data-birthday-user-volume]')?.value || '';
    if (!login.trim()) throw new Error('Username fehlt.');
    if (!birthdayDate.trim()) throw new Error('Geburtstag fehlt.');
    await window.CGN.api(api.user, { method:'POST', body: JSON.stringify({ login, displayName, birthdayDate, active, showSongFile, showVideoUrl, showVideoDurationMs, showSongVolume }) });
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
    const videoEl = root?.querySelector('[data-birthday-user-video]');
    const videoMsEl = root?.querySelector('[data-birthday-user-video-ms]');
    const volumeEl = root?.querySelector('[data-birthday-user-volume]');
    if (loginEl) loginEl.value = user.login || '';
    if (displayEl) displayEl.value = user.displayName || '';
    if (dateEl) dateEl.value = user.birthdayDateWithYear || user.birthdayDate || '';
    if (activeEl) activeEl.value = user.active ? 'true' : 'false';
    if (songEl) songEl.value = user.showSongFile || '';
    if (videoEl) videoEl.value = user.showVideoUrl || '';
    if (videoMsEl) videoMsEl.value = user.showVideoDurationMs || '';
    if (volumeEl) volumeEl.value = user.showSongVolume || '';
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
            <label>User-Song-Datei <input type="text" data-birthday-user-song placeholder="birthday/user.mp3 oder leer für Standard"></label>
            <label>User-Video-URL <input type="text" data-birthday-user-video placeholder="/assets/media/video/user.webm oder leer"></label>
            <label>Video-Dauer ms <input type="number" data-birthday-user-video-ms placeholder="9000"></label>
            <label>Song-Lautstärke <input type="number" min="0" max="100" data-birthday-user-volume placeholder="85"></label>
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
    const tabs = [['overview','Übersicht'], ['users','Geburtstage'], ['settings','Settings'], ['texts','Texte']];
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
          ${state.tab === 'users' ? renderUsers() : state.tab === 'settings' ? renderSettings() : state.tab === 'texts' ? renderTexts() : renderOverview()}
        `}
      </div>`;
    bind();
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
