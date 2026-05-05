window.VipModule = (function(){
  'use strict';

  const API = '/api/vip-sound';
  let root = null;
  let state = {
    page: 'overview',
    summary: null,
    settings: null,
    roles: null,
    texts: null,
    eventKeys: null,
    daily: null,
    events: null,
    stats: null,
    soundUsers: null,
    soundStatus: null,
    uploadStatus: null,
    selectedSoundLogin: '',
    soundManualLogin: '',
    soundFilter: 'all',
    soundSearch: '',
    soundSort: 'missing',
    vipUserFilter: 'all',
    note: '',
    loading: false,
    textFilterStyle: '',
    textFilterEventKey: '',
    textSearch: ''
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function post(path, payload){ return api(path, { method: 'POST', body: JSON.stringify(payload || {}) }); }
  function boolText(v){ return v ? 'Aktiv' : 'Inaktiv'; }
  function badge(text, cls){ return `<span class="vip-pill ${cls || ''}">${esc(text)}</span>`; }
  function fmt(v){ return v === null || v === undefined || v === '' ? '—' : esc(v); }
  function count(v){ return Number(v || 0); }

  async function loadAll(keepNote){
    if (!root) root = document.getElementById('vipModule');
    if (!root) return;
    state.loading = true;
    if (!keepNote) state.note = '';
    renderLoading();
    try {
      const [summary, settings, roles, texts, eventKeys, daily, events, stats, soundUsers, uploadStatus, twitchSync] = await Promise.all([
        api('/admin/summary'),
        api('/settings'),
        api('/roles'),
        loadTexts(),
        api('/texts/event-keys').catch(() => ({ ok:false, rows:[] })),
        api('/daily-usage/today').catch(() => ({ ok:false, rows:[] })),
        api('/events/recent').catch(() => ({ ok:false, rows:[] })),
        api('/stats').catch(() => ({ ok:false })),
        api('/sounds/users').catch(() => ({ ok:false, rows:[] })),
        api('/upload/status').catch(() => ({ ok:false })),
        api('/twitch-sync/status').catch(() => ({ ok:false }))
      ]);
      state.summary = summary;
      state.settings = settings;
      state.roles = roles;
      state.texts = texts;
      state.eventKeys = eventKeys;
      state.daily = daily;
      state.events = events;
      state.stats = stats;
      state.soundUsers = soundUsers;
      state.uploadStatus = uploadStatus;
      state.twitchSync = twitchSync;
      if (!state.selectedSoundLogin && soundUsers?.rows?.length) state.selectedSoundLogin = soundUsers.rows[0].login || '';
      if (state.selectedSoundLogin) state.soundStatus = await loadSoundStatus(state.selectedSoundLogin);
    } catch (err) {
      state.note = `Fehler beim Laden: ${err.message || err}`;
    } finally {
      state.loading = false;
      render();
    }
  }

  function loadTexts(){
    const params = new URLSearchParams();
    params.set('limit', '300');
    if (state.textFilterStyle) params.set('style', state.textFilterStyle);
    if (state.textFilterEventKey) params.set('eventKey', state.textFilterEventKey);
    if (state.textSearch) params.set('search', state.textSearch);
    return api('/texts?' + params.toString());
  }


  function loadSoundStatus(login){
    const clean = String(login || '').trim();
    if (!clean) return Promise.resolve(null);
    const params = new URLSearchParams();
    params.set('login', clean);
    return api('/sounds/status?' + params.toString()).catch(() => null);
  }

  function renderLoading(){
    if (!root) return;
    root.innerHTML = `<section class="vip-card glass"><h2>VIP-System</h2><p class="vip-muted">Lade VIP-Daten...</p></section>`;
  }

  function render(){
    if (!root) return;
    root.innerHTML = `${noteHtml()}${tabsHtml()}${pageHtml()}`;
    bind();
  }

  function noteHtml(){
    if (!state.note) return '';
    const cls = state.note.startsWith('Fehler') ? 'bad' : 'ok';
    return `<section class="vip-note glass ${cls}">${esc(state.note)}</section>`;
  }

  function heroHtml(){
    const s = state.summary || {};
    const status = s.status || {};
    const db = s.db || {};
    return '';
  }

  function tabsHtml(){
    const tabs = [['overview','Übersicht'],['settings','Settings'],['texts','Texte'],['sounds','Sounds'],['roles','VIPs & Mods'],['stats','Statistik'],['daily','Daily-Usage'],['events','Events'],['test','Test']];
    return `<div class="vip-tabs glass">${tabs.map(([id,label]) => `<button type="button" class="vip-tab ${state.page === id ? 'active' : ''}" data-vip-page="${id}">${esc(label)}</button>`).join('')}</div>`;
  }

  function pageHtml(){
    if (state.page === 'settings') return settingsPage();
    if (state.page === 'texts') return textsPage();
    if (state.page === 'sounds') return soundsPage();
    if (state.page === 'roles') return rolesPage();
    if (state.page === 'stats') return statsPage();
    if (state.page === 'daily') return dailyPage();
    if (state.page === 'events') return eventsPage();
    if (state.page === 'test') return testPage();
    return overviewPage();
  }

  function overviewPage(){
    const s = state.summary || {};
    const db = s.db || {};
    const status = s.status || {};
    const stats = s.stats || {};
    const totals = stats.totals || {};
    const sync = state.twitchSync || state.summary?.twitchSync || state.soundUsers?.twitchSync || {};
    const syncSettings = sync.settings || {};
    const syncCounts = sync.counts || {};
    const token = sync.token || {};
    const users = state.soundUsers?.rows || [];
    const sound = soundStats(users);
    const lastSyncAt = syncSettings.lastAt || syncCounts.lastSyncAt || '';
    const lastSyncOk = syncSettings.lastOk;
    const nextSyncAt = nextSyncTime(lastSyncAt, syncSettings.intervalHours || 24);
    const syncError = syncSettings.lastError || sync.runtime?.lastError || '';
    const warnings = overviewWarnings({ syncSettings, sync, token, sound, syncError, lastSyncAt, lastSyncOk });
    return `<div class="vip-grid">${metricCard('VIP-System', s.version ? 'Aktiv' : 'Unbekannt', `Version ${fmt(s.version)}`, s.version ? 'ok' : 'warn')}${metricCard('Twitch-Sync', sync.running ? 'Läuft' : (lastSyncOk === false ? 'Warnung' : 'Bereit'), lastSyncAt ? `Letzter Sync: ${formatDateTime(lastSyncAt)}` : 'Noch kein Sync', sync.running ? 'warn' : (lastSyncOk === false ? 'bad' : 'ok'))}${metricCard('VIPs & Mods', count(syncCounts.total || users.length), `VIPs ${count(syncCounts.vips)} · Mods ${count(syncCounts.mods)}`, '')}${metricCard('Sounds', sound.withSound, `${sound.missing} fehlen`, sound.missing ? 'warn' : 'ok')}${metricCard('Nächster Sync', nextSyncAt ? formatDateTime(nextSyncAt) : '—', `${syncSettings.intervalHours || 24}h Intervall`, nextSyncAt ? '' : 'warn')}${metricCard('Events heute', count(totals.total_events), `${count(totals.accepted_events)} akzeptiert`, '')}<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>Status & Warnungen</h3><p>Kurze Übersicht für den Betrieb. Technische Details bleiben in den passenden Tabs.</p></div><div class="vip-actions"><button type="button" data-vip-action="reload">Aktualisieren</button><button type="button" class="success" data-vip-action="run-twitch-sync">Twitch-Sync starten</button></div></div><div class="vip-status-grid">${overviewStatusCard('System', s.version ? 'VIP-System aktiv' : 'Status unbekannt', status.client?.connected ? 'Overlay verbunden' : 'Overlay nicht verbunden', s.version ? 'ok' : 'warn')}${overviewStatusCard('Twitch', token.ok ? 'Token vorhanden' : 'Token fehlt', syncError || (lastSyncAt ? `Letzter Sync: ${formatDateTime(lastSyncAt)}` : 'Noch kein Sync durchgeführt'), token.ok && !syncError ? 'ok' : 'warn')}${overviewStatusCard('Sounds', `${sound.withSound} von ${sound.total} vorhanden`, sound.missing ? `${sound.missing} VIPs/Mods ohne Sound` : 'Alle bekannten User haben einen Sound', sound.missing ? 'warn' : 'ok')}${overviewStatusCard('Datenbank', `${count(db.settingsRows)} Settings · ${count(db.messageTemplates)} Texte`, `${count(db.twitchUsersRows || syncCounts.total || users.length)} Twitch-Cache-Einträge`, '')}</div>${warnings.length ? `<div class="vip-warning-list">${warnings.map(w => overviewWarningCard(w.title, w.text, w.cls, w.actionPage)).join('')}</div>` : `<div class="vip-ok-box">${badge('Keine akuten Warnungen', 'ok')}<span>VIP-System, Twitch-Sync und Sounds sehen nach aktuellem Dashboard-Stand sauber aus.</span></div>`}</section></div>`;
  }

  function metricCard(title, value, sub, cls){ return `<section class="vip-card glass vip-metric"><h3>${esc(title)}</h3><div class="vip-metric-value ${cls || ''}">${esc(value)}</div><p>${esc(sub || '')}</p></section>`; }

  function overviewStatusCard(title, value, sub, cls){
    return `<article class="vip-status-card ${cls || ''}"><h4>${esc(title)}</h4><strong>${esc(value)}</strong><span>${esc(sub || '')}</span></article>`;
  }

  function overviewWarningCard(title, text, cls, actionPage){
    const action = actionPage ? `<button type="button" data-vip-page="${esc(actionPage)}">Öffnen</button>` : '';
    return `<article class="vip-warning-card ${cls || 'warn'}"><div><h4>${esc(title)}</h4><p>${esc(text)}</p></div>${action}</article>`;
  }

  function overviewWarnings(data){
    const warnings = [];
    if (!data.token.ok) warnings.push({ title:'Twitch-Token prüfen', text:'Der Twitch-Sync meldet keinen gültigen Token. VIP-/Mod-Cache kann dann nicht aktualisiert werden.', cls:'bad', actionPage:'roles' });
    if (data.syncError) warnings.push({ title:'Letzter Twitch-Sync fehlerhaft', text:data.syncError, cls:'bad', actionPage:'roles' });
    if (!data.lastSyncAt) warnings.push({ title:'Noch kein Twitch-Sync', text:'Der lokale VIP-/Mod-Cache wurde noch nicht synchronisiert.', cls:'warn', actionPage:'roles' });
    else if (data.lastSyncOk === false) warnings.push({ title:'Letzter Twitch-Sync nicht erfolgreich', text:'Der Cache ist vorhanden, aber der letzte Sync wurde nicht als erfolgreich gemeldet.', cls:'warn', actionPage:'roles' });
    if (data.sound.missing > 0) warnings.push({ title:'VIPs/Mods ohne Sound', text:`${data.sound.missing} von ${data.sound.total} bekannten Twitch-VIPs/Mods haben noch keine Sounddatei.`, cls:'warn', actionPage:'sounds' });
    if (data.sound.brokenDuration > 0) warnings.push({ title:'Sounddauer unklar', text:`Bei ${data.sound.brokenDuration} vorhandenen Sounddateien konnte keine saubere Dauer gelesen werden.`, cls:'warn', actionPage:'sounds' });
    if (data.syncSettings.enabled === false) warnings.push({ title:'Auto-Sync deaktiviert', text:'Der automatische Twitch-Sync ist ausgeschaltet.', cls:'warn', actionPage:'roles' });
    if (data.sync.running) warnings.push({ title:'Sync läuft gerade', text:'Der Twitch-Sync ist aktuell aktiv. Werte können sich gleich ändern.', cls:'warn', actionPage:'roles' });
    return warnings;
  }

  function nextSyncTime(lastAt, intervalHours){
    if (!lastAt) return '';
    const d = new Date(lastAt);
    if (Number.isNaN(d.getTime())) return '';
    const hours = Math.max(1, Number(intervalHours || 24));
    return new Date(d.getTime() + hours * 60 * 60 * 1000).toISOString();
  }

  function settingsPage(){
    const rows = state.settings?.settings || state.summary?.settings?.rows || [];
    return `<section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Settings</h3><p>Dashboardfähige VIP-Einstellungen aus der Datenbank. JSON bleibt nur Fallback/Import.</p></div></div><div class="vip-table-wrap"><table class="vip-table"><thead><tr><th>Key</th><th>Wert</th><th>Typ</th><th>Quelle</th><th>Beschreibung</th><th>Aktion</th></tr></thead><tbody>${rows.map(settingRow).join('') || '<tr><td colspan="6">Keine Settings gefunden.</td></tr>'}</tbody></table></div></section>`;
  }

  function settingRow(row){
    const key = row.key || '';
    const type = row.valueType || 'string';
    const value = row.rawValue ?? row.value ?? '';
    return `<tr><td><code>${esc(key)}</code></td><td><input class="vip-input" data-setting-value="${esc(key)}" value="${esc(value)}"></td><td><select class="vip-input" data-setting-type="${esc(key)}">${['string','number','boolean','json'].map(t => `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`).join('')}</select></td><td>${badge(row.source || 'database')}</td><td class="vip-muted">${esc(row.description || '')}</td><td><button type="button" data-save-setting="${esc(key)}">Speichern</button></td></tr>`;
  }

  function textsPage(){
    const rows = state.texts?.rows || [];
    const keys = state.eventKeys?.rows || [];
    const eventOptions = ['', ...Array.from(new Set(keys.map(k => k.eventKey || k.event_key).filter(Boolean)))];
    return `<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>Texte</h3><p>VIP-Texte kommen aus der Datenbank. Harte Texte im Code sollen langfristig nur Seed-Defaults sein.</p></div><button type="button" class="success" data-vip-action="new-text">Neuer Text</button></div><div class="vip-filter-row"><label>Style <select id="vipTextStyle"><option value="">Alle</option><option value="heimleitung" ${state.textFilterStyle === 'heimleitung' ? 'selected' : ''}>heimleitung / Chat</option><option value="overlay" ${state.textFilterStyle === 'overlay' ? 'selected' : ''}>overlay</option></select></label><label>Event-Key <select id="vipTextEventKey">${eventOptions.map(k => `<option value="${esc(k)}" ${state.textFilterEventKey === k ? 'selected' : ''}>${esc(k || 'Alle')}</option>`).join('')}</select></label><label>Suche <input id="vipTextSearch" value="${esc(state.textSearch)}" placeholder="Text suchen..."></label><button type="button" data-vip-action="apply-text-filter">Filtern</button></div><div class="vip-text-list">${rows.map(textCard).join('') || '<div class="vip-empty">Keine Texte gefunden.</div>'}</div></section>`;
  }

  function textCard(row){
    const id = Number(row.id || 0);
    return `<article class="vip-text-card ${row.enabled ? '' : 'disabled'}"><div class="vip-text-meta">${badge(row.style || '')}${badge(row.eventKey || '')}${badge(row.enabled ? 'Aktiv' : 'Inaktiv', row.enabled ? 'ok' : 'warn')}<span class="vip-muted">ID ${id} · Gewicht ${esc(row.weight || 1)}</span></div><div class="vip-text-edit-grid"><label>Event-Key <input class="vip-input" data-text-event="${id}" value="${esc(row.eventKey || '')}"></label><label>Style <select class="vip-input" data-text-style="${id}"><option value="heimleitung" ${row.style === 'heimleitung' ? 'selected' : ''}>heimleitung / Chat</option><option value="overlay" ${row.style === 'overlay' ? 'selected' : ''}>overlay</option></select></label><label>Gewicht <input class="vip-input" type="number" min="1" max="1000" data-text-weight="${id}" value="${esc(row.weight || 1)}"></label><label class="vip-check"><input type="checkbox" data-text-enabled="${id}" ${row.enabled ? 'checked' : ''}> Aktiv</label></div><textarea class="vip-textarea" data-text-message="${id}">${esc(row.messageText || '')}</textarea><div class="vip-actions right"><button type="button" data-save-text="${id}">Speichern</button><button type="button" data-toggle-text="${id}">${row.enabled ? 'Deaktivieren' : 'Aktivieren'}</button></div></article>`;
  }

  function soundsPage(){
    const users = state.soundUsers?.rows || [];
    const settings = state.uploadStatus?.settings || state.soundUsers?.settings || {};
    const selected = state.selectedSoundLogin || '';
    const selectedUser = users.find(u => u.login === selected) || null;
    const status = state.soundStatus || selectedUser || {};
    const sound = status.sound || selectedUser?.sound || {};
    const expectedExt = settings.fileExtension || sound.fileExtension || '.mp3';
    const maxMb = settings.maxSoundUploadBytes ? Math.round(Number(settings.maxSoundUploadBytes) / 1024 / 1024) : 15;
    const stats = soundStats(users);
    const filter = state.soundFilter || 'all';
    const search = state.soundSearch || '';
    const sort = state.soundSort || 'missing';
    const filteredRaw = sortSoundUsers(users.filter(u => soundUserMatchesFilter(u, filter, search)), sort);
    const missingAll = users.filter(u => !u.sound?.exists);
    const missing = missingAll.slice(0, 8);
    const showMissingQuickAccess = filter !== 'missing' && !search && missing.length > 0;
    const filtered = showMissingQuickAccess ? filteredRaw.filter(u => !!u.sound?.exists) : filteredRaw;
    const selectedTitle = status.user?.displayName || selectedUser?.displayName || selected || 'Kein User ausgewählt';
    return `<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>Sounds</h3><p>VIP-/Mod-Sounds verwalten. Fokus: fehlende Sounds schnell finden, User auswählen, Datei hochladen oder ersetzen.</p></div><button type="button" data-vip-action="reload-sounds">Sounds neu laden</button></div><div class="vip-mini-grid">${soundMetricCard('Bekannte User', stats.total, 'Twitch-Cache', '')}${soundMetricCard('Sounds vorhanden', stats.withSound, `${stats.missing} fehlen`, stats.missing ? 'warn' : 'ok')}${soundMetricCard('Ø Soundlänge', stats.avg ? formatMs(stats.avg) : '—', 'ffprobe', '')}${soundMetricCard('Längster Sound', stats.longest?.displayName || '—', stats.longest?.sound?.durationMs ? formatMs(stats.longest.sound.durationMs) : '', '')}</div><div class="vip-sound-filter-row"><label>Status <select id="vipSoundFilter"><option value="all" ${filter === 'all' ? 'selected' : ''}>Alle</option><option value="missing" ${filter === 'missing' ? 'selected' : ''}>Ohne Sound</option><option value="withsound" ${filter === 'withsound' ? 'selected' : ''}>Mit Sound</option><option value="vip" ${filter === 'vip' ? 'selected' : ''}>Twitch VIP</option><option value="mod" ${filter === 'mod' ? 'selected' : ''}>Twitch Mod</option></select></label><label>Suche <input id="vipSoundSearch" value="${esc(search)}" placeholder="Login oder Anzeigename"></label><label>Sortierung <select id="vipSoundSort"><option value="missing" ${sort === 'missing' ? 'selected' : ''}>Fehlende zuerst</option><option value="name" ${sort === 'name' ? 'selected' : ''}>Name A-Z</option><option value="role" ${sort === 'role' ? 'selected' : ''}>Rolle</option><option value="duration" ${sort === 'duration' ? 'selected' : ''}>Längste Sounds</option></select></label><button type="button" data-vip-action="apply-sound-filter">Anzeigen</button><div class="vip-muted">${esc(filtered.length)} von ${esc(users.length)} Usern sichtbar. Upload bleibt auf Twitch-VIPs und Twitch-Mods aus dem Cache ausgerichtet.</div></div><div class="vip-sound-workbench"><div class="vip-sound-panel"><h4>User auswählen</h4><label>Twitch VIP/Mod<select id="vipSoundUser">${filtered.map(u => `<option value="${esc(u.login || '')}" ${selected === u.login ? 'selected' : ''}>${esc(soundUserOptionLabel(u))}</option>`).join('') || users.map(u => `<option value="${esc(u.login || '')}" ${selected === u.login ? 'selected' : ''}>${esc(soundUserOptionLabel(u))}</option>`).join('')}</select></label><label>Oder Login manuell<input id="vipSoundManualLogin" value="${esc(state.soundManualLogin || '')}" placeholder="z. B. araglor"></label><div class="vip-actions"><button type="button" data-vip-action="resolve-sound-user">User prüfen</button><button type="button" data-vip-action="apply-sound-filter">Liste aktualisieren</button></div><div class="vip-muted">Manuelle Eingabe prüft nur den Status. Berechtigungen kommen weiterhin aus dem Twitch-Cache.</div></div><div class="vip-sound-panel vip-current-sound"><h4>Aktueller Soundstatus</h4><div class="vip-current-sound-title"><strong>${esc(selectedTitle)}</strong><span>${esc(twitchStatusLabel(selectedUser || status.user || {}))}</span></div><div class="vip-standard-list"><div><strong>Datei:</strong> <code>${fmt(sound.fileName)}</code></div><div><strong>Vorhanden:</strong> ${badge(sound.exists ? 'Ja' : 'Nein', sound.exists ? 'ok' : 'warn')}</div><div><strong>Dauer:</strong> ${sound.durationMs ? esc(formatMs(sound.durationMs)) : '—'}</div><div><strong>Größe:</strong> ${sound.sizeBytes ? esc(fileSizeText(sound.sizeBytes)) : '—'}</div><div><strong>Pfad:</strong> <span class="vip-muted">${fmt(sound.relativeFile || sound.fullPath)}</span></div><div><strong>Upload-Regel:</strong> <code>${esc(expectedExt)}</code> · max. ${esc(maxMb)} MB</div></div></div></div><div class="vip-upload-box vip-upload-box-strong"><label>Neue Sounddatei auswählen<input id="vipSoundFile" type="file" accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a"></label><label class="vip-check"><input id="vipSoundOverwrite" type="checkbox"> vorhandenen Sound ersetzen</label><button type="button" class="success" data-vip-action="upload-sound">Sound hochladen</button><div class="vip-muted">Nach dem Upload wird die Userliste neu geladen und der ausgewählte User aktualisiert.</div></div>${showMissingQuickAccess ? `<section class="vip-sound-missing-box"><div class="vip-card-head"><div><h3>Schnellzugriff: fehlende Sounds</h3><p>Die ersten ${esc(missing.length)} User ohne Sounddatei.</p></div><button type="button" data-vip-action="show-missing-sounds">Ohne Sound anzeigen</button></div><div class="vip-sound-card-grid">${missing.map(soundUserCard).join('')}</div></section>` : `<div class="vip-ok-box">${badge('Keine fehlenden Sounds', 'ok')}<span>Alle aktuell bekannten Twitch-VIPs/Mods haben eine Sounddatei.</span></div>`}<section class="vip-sound-list-box"><div class="vip-card-head"><div><h3>Soundliste</h3><p>Gefilterte Übersicht. Fehlende Sounds werden oben separat gezeigt; für Upload oder Änderung auf „Auswählen“ klicken.</p></div></div><div class="vip-sound-card-grid">${filtered.map(soundUserCard).join('') || '<div class="vip-empty">Keine User für diesen Filter gefunden.</div>'}</div></section></section>`;
  }

  function formatMs(ms){
    const n = Math.max(0, Number(ms || 0));
    if (!n) return '—';
    const sec = n / 1000;
    return sec >= 60 ? `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')} min` : `${sec.toFixed(1).replace('.', ',')} s`;
  }

  function soundStats(users){
    const rows = Array.isArray(users) ? users : [];
    const total = rows.length;
    const withSound = rows.filter(u => !!u.sound?.exists).length;
    const missing = total - withSound;
    const durations = rows.map(u => Number(u.sound?.durationMs || 0)).filter(n => n > 0);
    const avg = durations.length ? Math.round(durations.reduce((a,b) => a + b, 0) / durations.length) : 0;
    const longest = rows.reduce((best, row) => Number(row.sound?.durationMs || 0) > Number(best?.sound?.durationMs || 0) ? row : best, null);
    const brokenDuration = rows.filter(u => u.sound?.exists && !u.sound?.durationOk).length;
    return { total, withSound, missing, avg, longest, brokenDuration };
  }

  function soundMetricCard(title, value, sub, cls){
    return `<section class="vip-mini-metric"><h4>${esc(title)}</h4><strong class="${cls || ''}">${esc(value)}</strong><span>${esc(sub || '')}</span></section>`;
  }

  function soundUserMatchesFilter(row, filter, search){
    const f = String(filter || 'all').toLowerCase();
    const q = String(search || '').trim().toLowerCase();
    const text = `${row?.login || ''} ${row?.displayName || ''}`.toLowerCase();
    if (q && !text.includes(q)) return false;
    if (f === 'missing') return !row?.sound?.exists;
    if (f === 'withsound') return !!row?.sound?.exists;
    if (f === 'vip') return twitchPrimaryRole(row) === 'vip' || truthyRoleValue(row?.twitch?.isVip);
    if (f === 'mod') return twitchPrimaryRole(row) === 'mod' || truthyRoleValue(row?.twitch?.isMod);
    return true;
  }

  function sortSoundUsers(rows, sort){
    const list = Array.isArray(rows) ? [...rows] : [];
    const mode = String(sort || 'missing').toLowerCase();
    return list.sort((a,b) => {
      if (mode === 'missing') {
        const am = a?.sound?.exists ? 1 : 0;
        const bm = b?.sound?.exists ? 1 : 0;
        if (am !== bm) return am - bm;
      }
      if (mode === 'duration') return Number(b?.sound?.durationMs || 0) - Number(a?.sound?.durationMs || 0);
      if (mode === 'role') {
        const ar = twitchPrimaryRole(a) || '';
        const br = twitchPrimaryRole(b) || '';
        if (ar !== br) return ar.localeCompare(br, 'de');
      }
      return String(a?.displayName || a?.login || '').localeCompare(String(b?.displayName || b?.login || ''), 'de', { sensitivity:'base' });
    });
  }

  function fileSizeText(bytes){
    const n = Number(bytes || 0);
    if (!n) return '—';
    if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
    if (n >= 1024) return `${Math.round(n / 1024)} KB`;
    return `${n} B`;
  }

  function soundUserCard(row){
    const sound = row.sound || {};
    const role = twitchStatusLabel(row);
    const exists = !!sound.exists;
    return `<article class="vip-sound-user-card ${exists ? 'ok' : 'warn'}"><div><strong>${esc(row.displayName || row.login || '—')}</strong><span><code>${esc(row.login || '')}</code> · ${esc(role)}</span></div><div class="vip-pill-wrap">${badge(exists ? 'Sound vorhanden' : 'fehlt', exists ? 'ok' : 'warn')}${sound.durationMs ? badge(formatMs(sound.durationMs)) : ''}</div><button type="button" data-select-sound-login="${esc(row.login || '')}">${exists ? 'Ändern' : 'Hochladen'}</button></article>`;
  }

  function listHas(list, value){
    return Array.isArray(list) && list.map(String).map(v => v.toLowerCase()).includes(String(value || '').toLowerCase());
  }

  function userHasRole(row, role){
    return userHasTwitchRole(row, role);
  }

  function truthyRoleValue(value){
    return value === true || value === 1 || String(value || '').toLowerCase() === 'true' || String(value || '').toLowerCase() === '1';
  }

  function twitchInfo(row){
    return row && typeof row.twitch === 'object' ? row.twitch : {};
  }

  function twitchPrimaryRole(row){
    const twitch = twitchInfo(row);
    const direct = String(twitch.primaryRole || '').toLowerCase();
    if (direct === 'mod' || direct === 'vip' || direct === 'broadcaster') return direct;
    if (truthyRoleValue(twitch.isBroadcaster)) return 'broadcaster';
    if (truthyRoleValue(twitch.isMod)) return 'mod';
    if (truthyRoleValue(twitch.isVip)) return 'vip';
    if (listHas(row?.twitchRoles, 'mod')) return 'mod';
    if (listHas(row?.twitchRoles, 'vip')) return 'vip';
    return '';
  }

  function twitchAllowed(row){
    const twitch = twitchInfo(row);
    if (Object.prototype.hasOwnProperty.call(twitch, 'allowed')) return truthyRoleValue(twitch.allowed);
    return ['mod', 'vip', 'broadcaster'].includes(twitchPrimaryRole(row));
  }

  function twitchStatusLabel(row){
    const twitch = twitchInfo(row);
    const label = String(twitch.statusLabel || '').trim();
    if (label) return label;
    const role = twitchPrimaryRole(row);
    if (role === 'mod') return 'Twitch Mod';
    if (role === 'vip') return 'Twitch VIP';
    if (role === 'broadcaster') return 'Broadcaster';
    return 'nicht berechtigt';
  }

  function soundUserOptionLabel(row){
    const name = row?.displayName || row?.login || '';
    const status = twitchStatusLabel(row);
    const soundText = row?.sound?.exists ? 'Sound vorhanden' : 'kein Sound';
    return `${name} · ${status} · ${soundText}`;
  }

  function userHasTwitchRole(row, role){
    const r = String(role || '').toLowerCase();
    const twitch = twitchInfo(row);
    if (r === 'vip') return truthyRoleValue(twitch.isVip) || twitchPrimaryRole(row) === 'vip' || listHas(row?.twitchRoles, 'vip');
    if (r === 'mod' || r === 'moderator') return truthyRoleValue(twitch.isMod) || twitchPrimaryRole(row) === 'mod' || listHas(row?.twitchRoles, 'mod');
    if (r === 'broadcaster') return truthyRoleValue(twitch.isBroadcaster) || twitchPrimaryRole(row) === 'broadcaster';
    return false;
  }

  function userHasLocalRole(row, role){
    const r = String(role || '').toLowerCase();
    return listHas(row?.localRoles, r) || listHas(row?.local?.roles, r);
  }

  function userHasHistorySound(row, soundType){
    const s = String(soundType || '').toLowerCase();
    return listHas(row?.historySoundTypes, s) || listHas(row?.history?.soundTypes, s);
  }

  function userMatchesFilter(row, filter){
    const f = String(filter || 'all').toLowerCase();
    if (f === 'missing') return !row.sound?.exists;
    if (f === 'withsound') return !!row.sound?.exists;
    if (f === 'vip' || f === 'twitch_vip') return twitchPrimaryRole(row) === 'vip' || truthyRoleValue(row?.twitch?.isVip);
    if (f === 'mod' || f === 'twitch_mod') return twitchPrimaryRole(row) === 'mod' || truthyRoleValue(row?.twitch?.isMod);
    return true;
  }

  function sourceLabels(row){
    const labels = [];
    if (row?.permissionSource === 'twitch_cache' || listHas(row?.sources, 'twitch_sync')) labels.push('Twitch-Cache');
    if (row?.history?.hasUsage || (Array.isArray(row?.history?.sources) && row.history.sources.length)) labels.push('Historie');
    if (row?.local?.ignoredForPermission) labels.push('lokale Overrides ignoriert');
    return labels.join(' · ');
  }


  function syncStatusHtml(){
    const sync = state.twitchSync || state.summary?.twitchSync || state.soundUsers?.twitchSync || {};
    const settings = sync.settings || {};
    const counts = sync.counts || {};
    const token = sync.token || {};
    const lastAt = settings.lastAt || counts.lastSyncAt || '';
    const lastOk = settings.lastOk;
    const error = settings.lastError || sync.runtime?.lastError || '';
    return `<div class="vip-sync-box"><div><strong>Twitch-Sync</strong><p class="vip-muted">Automatisch alle ${esc(settings.intervalHours || 24)}h, plus manueller Abruf. Dashboard liest den lokalen Cache.</p><div class="vip-pill-wrap">${badge(settings.enabled !== false ? 'Auto-Sync aktiv' : 'Auto-Sync aus', settings.enabled !== false ? 'ok' : 'warn')}${badge(token.ok ? 'Token vorhanden' : 'Token fehlt', token.ok ? 'ok' : 'bad')}${badge(sync.running ? 'Sync läuft' : 'Idle', sync.running ? 'warn' : '')}${lastAt ? badge('Letzter Sync: ' + formatDateTime(lastAt), lastOk ? 'ok' : 'warn') : badge('Noch kein Sync', 'warn')}${error ? badge('Fehler: ' + error, 'bad') : ''}</div></div><div class="vip-sync-actions"><div class="vip-muted">Cache: ${esc(counts.total || 0)} User · VIPs ${esc(counts.vips || 0)} · Mods ${esc(counts.mods || 0)}</div><button type="button" class="success" data-vip-action="run-twitch-sync">Von Twitch aktualisieren</button></div></div>`;
  }

  function formatDateTime(value){
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value || '—');
    return d.toLocaleString('de-DE', { dateStyle:'short', timeStyle:'short' });
  }

  function rolesPage(){
    const users = state.soundUsers?.rows || [];
    const stats = soundStats(users);
    const filter = state.vipUserFilter || 'all';
    const filtered = users.filter(row => userMatchesFilter(row, filter));
    return `<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>VIPs & Mods</h3><p>VIP-Sound-Rechte kommen ausschließlich aus dem Twitch-Sync-Cache: Twitch-VIP oder Twitch-Mod. Keine manuellen Sonderfreigaben.</p></div><button type="button" data-vip-action="reload-sounds">Liste neu laden</button></div>${syncStatusHtml()}<div class="vip-mini-grid">${soundMetricCard('Twitch-User', stats.total, 'VIPs + Mods aus Cache', '')}${soundMetricCard('Sounds vorhanden', stats.withSound, `${stats.missing} fehlen`, stats.missing ? 'warn' : 'ok')}${soundMetricCard('Ø Soundlänge', stats.avg ? formatMs(stats.avg) : '—', 'ffprobe', '')}${soundMetricCard('Längster Sound', stats.longest?.displayName || '—', stats.longest?.sound?.durationMs ? formatMs(stats.longest.sound.durationMs) : '', '')}</div><div class="vip-filter-row vip-filter-compact"><label>Filter <select id="vipUserFilter"><option value="all" ${filter === 'all' ? 'selected' : ''}>Alle</option><option value="missing" ${filter === 'missing' ? 'selected' : ''}>Ohne Sound</option><option value="withsound" ${filter === 'withsound' ? 'selected' : ''}>Mit Sound</option><option value="vip" ${filter === 'vip' ? 'selected' : ''}>Twitch VIP</option><option value="mod" ${filter === 'mod' ? 'selected' : ''}>Twitch Mod</option></select></label><button type="button" data-vip-action="apply-user-filter">Anzeigen</button><div class="vip-muted">Filter zeigt ${esc(filtered.length)} von ${esc(users.length)} Usern. Berechtigt sind nur Twitch-VIPs und Twitch-Mods aus dem lokalen Sync-Cache.</div></div><div class="vip-table-wrap"><table class="vip-table vip-users-table"><thead><tr><th>User</th><th>Twitch-Status</th><th>Sound</th><th>Dauer</th><th>Datei</th><th>Aktion</th></tr></thead><tbody>${filtered.map(soundUserRow).join('') || '<tr><td colspan="6">Keine User fuer diesen Filter gefunden.</td></tr>'}</tbody></table></div></section>`;
  }

  function rolePills(list, emptyLabel){
    const rows = Array.isArray(list) ? list : [];
    return rows.length ? rows.map(r => badge(r)).join('') : badge(emptyLabel || '—', 'warn');
  }

  function twitchStatusPills(row){
    const label = twitchStatusLabel(row);
    return badge(label, twitchAllowed(row) ? 'ok' : 'warn');
  }

  function localStatusPills(row){
    const ignored = row?.local?.ignoredForPermission;
    const roles = row?.local?.roles || row?.localRoles || [];
    if (ignored) return badge('lokale Overrides ignoriert', 'warn');
    return rolePills(roles, 'kein Override');
  }

  function historyStatusPills(row){
    const list = row?.history?.soundTypes || row?.historySoundTypes || [];
    return list.length ? list.map(r => badge(`${r}-Historie`)).join('') : badge('keine Historie', 'warn');
  }

  function soundUserRow(row){
    const sound = row.sound || {};
    return `<tr><td><strong>${esc(row.displayName || row.login)}</strong><br><code>${esc(row.login || '')}</code><br><span class="vip-muted">${esc(sourceLabels(row) || 'Twitch-Cache')}</span></td><td><div class="vip-pill-wrap">${twitchStatusPills(row)}</div></td><td>${badge(sound.exists ? 'vorhanden' : 'fehlt', sound.exists ? 'ok' : 'warn')}</td><td>${sound.durationMs ? esc(formatMs(sound.durationMs)) : '—'}</td><td><code>${esc(sound.fileName || '—')}</code></td><td><button type="button" data-select-sound-login="${esc(row.login || '')}">${sound.exists ? 'Song ändern' : 'Song hochladen'}</button></td></tr>`;
  }

  function roleFallbackSection(){
    const rows = state.roles?.rows || [];
    return `<section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Alte lokale Rollen-Daten</h3><p>Nur noch Alt-/Diagnosedaten. VIP-Sound-Rechte kommen ausschließlich aus dem Twitch-Sync-Cache.</p></div></div><div class="vip-form-row"><input id="vipRoleLogin" placeholder="login"><input id="vipRoleDisplay" placeholder="Anzeigename"><select id="vipRoleType"><option value="vip">VIP</option><option value="mod">Mod</option><option value="crew">Crew</option></select><input id="vipRoleNote" placeholder="Notiz"><button type="button" data-vip-action="save-role">Override speichern</button></div><div class="vip-table-wrap"><table class="vip-table"><thead><tr><th>Login</th><th>Name</th><th>Typ</th><th>Status</th><th>Quelle</th><th>Notiz</th><th></th></tr></thead><tbody>${rows.map(roleRow).join('') || '<tr><td colspan="7">Keine lokalen Fallbacks vorhanden.</td></tr>'}</tbody></table></div></section>`;
  }

  function roleRow(row){ return `<tr><td><code>${esc(row.login)}</code></td><td>${esc(row.displayName || row.login)}</td><td>${badge(row.roleType || 'vip')}</td><td>${badge(boolText(row.enabled), row.enabled ? 'ok' : 'warn')}</td><td>${esc(row.source || '')}</td><td class="vip-muted">${esc(row.note || '')}</td><td><button type="button" class="danger" data-delete-role="${esc(row.login)}" data-role-type="${esc(row.roleType || '')}">Entfernen</button></td></tr>`; }


  function statsPage(){
    const stats = state.stats || {};
    const totals = stats.totals || {};
    const users = state.soundUsers?.rows || [];
    const sound = soundStats(users);
    const recent = Array.isArray(stats.recent) && stats.recent.length ? stats.recent : (state.events?.rows || []);
    const topUsers = Array.isArray(stats.topUsers) && stats.topUsers.length ? stats.topUsers : buildTopUsers(recent);
    const bySoundType = Array.isArray(stats.bySoundType) ? stats.bySoundType : buildSoundTypeStats(recent);
    const dailyRows = state.daily?.rows || [];
    const denied = recent.filter(isDeniedEvent);
    const missingUsers = users.filter(u => !u.sound?.exists);
    const attemptedMissing = missingUsers.filter(u => userHasMissingAttempt(u, recent));
    const lastUsage = buildLastUsageRows(recent).slice(0, 10);
    const started = recent.filter(r => Number(r.sound_system_started || r.soundSystemStarted || 0) === 1).length;
    const queued = recent.filter(r => Number(r.sound_system_queued || r.soundSystemQueued || 0) === 1).length;
    return `<div class="vip-grid">${metricCard('Events gesamt', count(totals.total_events || recent.length), 'aus vorhandener Statistikroute', '')}${metricCard('Akzeptiert', count(totals.accepted_events), `${count(totals.override_events)} Override`, 'ok')}${metricCard('Abgelehnt / Fehler', count(totals.error_events || denied.length), `${count(totals.duplicate_events)} Duplikate`, (totals.error_events || denied.length) ? 'warn' : 'ok')}${metricCard('Heute genutzt', count(dailyRows.length), 'Daily-Usage heute', '')}${metricCard('Sound-Queue', queued, `${started} gestartet`, '')}${metricCard('Sounds', sound.withSound, `${sound.missing} fehlen`, sound.missing ? 'warn' : 'ok')}<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>VIP-Statistik</h3><p>Aus bestehenden VIP-Routen berechnet. Keine neue Tabelle, keine Backend-Änderung.</p></div><div class="vip-actions"><button type="button" data-vip-action="reload">Aktualisieren</button><button type="button" data-vip-page="events">Events öffnen</button></div></div><div class="vip-stat-grid"><div>${statBlock('Top User', topUsers.slice(0, 8).map(r => statLine(r.user_display_name || r.userDisplayName || r.user_login || r.userLogin, `${count(r.count)}x`)).join('') || emptyStatLine('Noch keine User-Statistik'))}</div><div>${statBlock('Sound-Typen', bySoundType.map(r => statLine(r.sound_type || r.soundType || '—', `${count(r.count)}x`)).join('') || emptyStatLine('Keine Typ-Daten'))}</div><div>${statBlock('Sounddateien', [statLine('Vorhanden', `${sound.withSound} von ${sound.total}`), statLine('Fehlen', `${sound.missing}`), statLine('Ø Dauer', sound.avg ? formatMs(sound.avg) : '—'), statLine('Längster Sound', sound.longest?.displayName ? `${sound.longest.displayName} · ${formatMs(sound.longest.sound?.durationMs)}` : '—')].join(''))}</div></div></section><section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Letzte Auslösungen</h3><p>Komprimierte Ansicht aus den vorhandenen Eventdaten.</p></div></div>${statsRecentList(recent.slice(0, 8))}</section><section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Abgelehnt / Handlungsbedarf</h3><p>Duplikate, fehlende Sounds und sonstige Fehler aus den letzten Events.</p></div></div>${denied.length ? statsRecentList(denied.slice(0, 8)) : `<div class="vip-ok-box">${badge('Keine Ablehnungen in den geladenen Events', 'ok')}<span>Die vorhandenen Eventdaten zeigen keinen akuten Fehler.</span></div>`}</section><section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>User ohne Sound</h3><p>Aus Twitch-Cache und Soundprüfung. User mit Versuch werden hervorgehoben.</p></div><button type="button" data-vip-page="sounds">Sounds öffnen</button></div>${missingUsers.length ? `<div class="vip-stat-user-grid">${missingUsers.map(u => missingSoundCard(u, attemptedMissing.includes(u))).join('')}</div>` : `<div class="vip-ok-box">${badge('Alle Sounds vorhanden', 'ok')}<span>Für alle bekannten VIPs/Mods existiert aktuell eine Sounddatei.</span></div>`}</section><section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Letzte Nutzung pro User</h3><p>Aus den geladenen Recent-Events abgeleitet.</p></div></div>${lastUsage.length ? statsLastUsageTable(lastUsage) : '<div class="vip-empty">Noch keine Nutzungsdaten vorhanden.</div>'}</section></div>`;
  }

  function statBlock(title, body){
    return `<div class="vip-stat-block"><h4>${esc(title)}</h4><div>${body}</div></div>`;
  }

  function statLine(label, value){
    return `<div class="vip-stat-line"><span>${esc(label || '—')}</span><strong>${esc(value || '—')}</strong></div>`;
  }

  function emptyStatLine(text){
    return `<div class="vip-muted">${esc(text)}</div>`;
  }

  function isDeniedEvent(row){
    return !Number(row.accepted || 0) || !!(row.error_code || row.errorCode) || Number(row.duplicate || 0) === 1;
  }

  function buildTopUsers(rows){
    const map = new Map();
    for (const row of rows || []) {
      const login = String(row.user_login || row.userLogin || '').toLowerCase();
      if (!login) continue;
      const current = map.get(login) || { user_login: login, user_display_name: row.user_display_name || row.userDisplayName || login, count: 0 };
      current.count += 1;
      map.set(login, current);
    }
    return Array.from(map.values()).sort((a,b) => count(b.count) - count(a.count));
  }

  function buildSoundTypeStats(rows){
    const map = new Map();
    for (const row of rows || []) {
      const type = String(row.sound_type || row.soundType || 'unknown').toLowerCase();
      map.set(type, (map.get(type) || 0) + 1);
    }
    return Array.from(map.entries()).map(([sound_type, c]) => ({ sound_type, count: c })).sort((a,b) => count(b.count) - count(a.count));
  }

  function userHasMissingAttempt(user, rows){
    const login = String(user?.login || '').toLowerCase();
    if (!login) return false;
    return (rows || []).some(r => String(r.user_login || r.userLogin || '').toLowerCase() === login && (String(r.event_key || r.eventKey || '').includes('sound_missing') || String(r.error_code || r.errorCode || r.event_type || r.eventType || '').toLowerCase().includes('missing')));
  }

  function buildLastUsageRows(rows){
    const map = new Map();
    for (const row of rows || []) {
      const login = String(row.user_login || row.userLogin || '').toLowerCase();
      if (!login) continue;
      const old = map.get(login);
      const at = row.created_at || row.createdAt || '';
      if (!old || new Date(at).getTime() > new Date(old.created_at || old.createdAt || 0).getTime()) map.set(login, row);
    }
    return Array.from(map.values()).sort((a,b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
  }

  function statsRecentList(rows){
    return `<div class="vip-stat-event-list">${(rows || []).map(r => `<article class="vip-stat-event ${isDeniedEvent(r) ? 'warn' : 'ok'}"><div><strong>${fmt(r.user_display_name || r.userDisplayName || r.user_login || r.userLogin)}</strong><span>${fmt(r.event_type || r.eventType || r.event_key || r.eventKey)}</span></div><div class="vip-pill-wrap">${badge(r.sound_type || r.soundType || '—')}${badge(Number(r.accepted || 0) ? 'akzeptiert' : (Number(r.duplicate || 0) ? 'Duplikat' : 'Fehler'), Number(r.accepted || 0) ? 'ok' : 'warn')}${r.error_code || r.errorCode ? badge('Fehler', 'bad') : ''}</div><time>${fmt(formatDateTime(r.created_at || r.createdAt))}</time></article>`).join('') || '<div class="vip-empty">Keine Events vorhanden.</div>'}</div>`;
  }

  function missingSoundCard(user, attempted){
    return `<article class="vip-missing-card ${attempted ? 'warn' : ''}"><div><strong>${esc(user.displayName || user.login || '—')}</strong><span>${esc(twitchStatusLabel(user))}</span></div>${badge(attempted ? 'bereits versucht' : 'kein Versuch geladen', attempted ? 'warn' : '')}<button type="button" data-select-sound-login="${esc(user.login || '')}">Sound hochladen</button></article>`;
  }

  function statsLastUsageTable(rows){
    return `<div class="vip-table-wrap"><table class="vip-table"><thead><tr><th>User</th><th>Letzte Nutzung</th><th>Typ</th><th>Status</th><th>Quelle</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmt(r.user_display_name || r.userDisplayName || r.user_login || r.userLogin)}</td><td>${fmt(formatDateTime(r.created_at || r.createdAt))}</td><td>${badge(r.sound_type || r.soundType || '')}</td><td>${badge(Number(r.accepted || 0) ? 'akzeptiert' : (Number(r.duplicate || 0) ? 'Duplikat' : 'Fehler'), Number(r.accepted || 0) ? 'ok' : 'warn')}</td><td>${fmt(r.source)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function dailyPage(){
    const rows = state.daily?.rows || state.summary?.dailyUsage?.rows || [];
    return `<section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Daily-Usage</h3><p>Anzeige der heutigen VIP-/Mod-Sound-Nutzung. Reset-Aktionen bleiben bewusst getrennt und gesichert.</p></div></div><div class="vip-table-wrap"><table class="vip-table"><thead><tr><th>Datum</th><th>User</th><th>Typ</th><th>Request</th><th>Erstellt</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmt(r.usage_date || r.usageDate)}</td><td>${fmt(r.user_display_name || r.userDisplayName || r.user_login || r.userLogin)}</td><td>${badge(r.sound_type || r.soundType || '')}</td><td>${fmt(r.request_id || r.requestId)}</td><td>${fmt(r.created_at || r.createdAt)}</td></tr>`).join('') || '<tr><td colspan="5">Heute keine Daily-Usage-Einträge.</td></tr>'}</tbody></table></div></section>`;
  }

  function eventsPage(){
    const rows = state.events?.rows || state.summary?.events?.rows || [];
    return `<section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Events / Statistik</h3><p>Letzte VIP-Events aus der Datenbank.</p></div></div>${eventsTable(rows, false)}</section>`;
  }

  function eventsTable(rows, compact){
    return `<div class="vip-table-wrap"><table class="vip-table"><thead><tr><th>Zeit</th><th>User</th><th>Typ</th><th>Event</th><th>Status</th><th>Quelle</th>${compact ? '' : '<th>Sound</th>'}</tr></thead><tbody>${rows.map(r => `<tr><td>${fmt(r.created_at || r.createdAt)}</td><td>${fmt(r.user_display_name || r.userDisplayName || r.user_login || r.userLogin)}</td><td>${badge(r.sound_type || r.soundType || '')}</td><td>${fmt(r.event_type || r.eventType || r.event_key || r.eventKey)}</td><td>${badge(Number(r.accepted || 0) ? 'accepted' : (r.error_code || 'denied'), Number(r.accepted || 0) ? 'ok' : 'warn')}</td><td>${fmt(r.source)}</td>${compact ? '' : `<td class="vip-muted">${fmt(r.sound_file || r.soundFile)}</td>`}</tr>`).join('') || `<tr><td colspan="${compact ? 6 : 7}">Keine Events vorhanden.</td></tr>`}</tbody></table></div>`;
  }

  function testPage(){
    return `<section class="vip-card glass span-12"><div class="vip-card-head"><div><h3>Testauslösung</h3><p>Testet den VIP-Command über die vorhandene Admin-Test-API. Kein Streamer.bot nötig.</p></div></div><div class="vip-form-row test"><input id="vipTestActor" placeholder="Actor Login, z. B. forrestcgn"><input id="vipTestTarget" placeholder="Target Login, optional"><select id="vipTestRole"><option value="broadcaster">Broadcaster</option><option value="moderator">Moderator</option><option value="vip">VIP</option><option value="viewer">Viewer</option></select><button type="button" data-vip-action="run-test">Test starten</button></div><div class="vip-muted">VIP-Sound-Upload ist im Tab Sounds verfügbar. Twitch-VIP-/Mod-Sync läuft über den Tab VIPs & Mods.</div></section>`;
  }

  function bind(){
    root.querySelectorAll('[data-vip-page]').forEach(btn => btn.addEventListener('click', () => { state.page = btn.dataset.vipPage; render(); }));
    root.querySelectorAll('[data-vip-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.vipAction)));
    root.querySelectorAll('[data-save-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.saveSetting)));
    root.querySelectorAll('[data-save-text]').forEach(btn => btn.addEventListener('click', () => saveText(Number(btn.dataset.saveText || 0))));
    root.querySelectorAll('[data-toggle-text]').forEach(btn => btn.addEventListener('click', () => toggleText(Number(btn.dataset.toggleText || 0))));
    root.querySelectorAll('[data-delete-role]').forEach(btn => btn.addEventListener('click', () => deleteRole(btn.dataset.deleteRole, btn.dataset.roleType)));
    root.querySelectorAll('[data-select-sound-login]').forEach(btn => btn.addEventListener('click', async () => { state.selectedSoundLogin = btn.dataset.selectSoundLogin || ''; state.soundManualLogin = ''; state.soundStatus = await loadSoundStatus(state.selectedSoundLogin); state.page = 'sounds'; state.note = `Soundverwaltung geöffnet: ${state.selectedSoundLogin}`; render(); }));
  }

  async function handleAction(action){
    try {
      if (action === 'reload') return loadAll(false);
      if (action === 'apply-text-filter') {
        state.textFilterStyle = document.getElementById('vipTextStyle')?.value || '';
        state.textFilterEventKey = document.getElementById('vipTextEventKey')?.value || '';
        state.textSearch = document.getElementById('vipTextSearch')?.value || '';
        state.texts = await loadTexts();
        state.note = 'Textfilter aktualisiert.';
        return render();
      }
      if (action === 'new-text') return newText();
      if (action === 'reload-sounds') return reloadSounds();
      if (action === 'resolve-sound-user') return resolveSoundUser();
      if (action === 'upload-sound') return uploadVipSound();
      if (action === 'apply-sound-filter') { state.soundFilter = document.getElementById('vipSoundFilter')?.value || 'all'; state.soundSearch = document.getElementById('vipSoundSearch')?.value || ''; state.soundSort = document.getElementById('vipSoundSort')?.value || 'missing'; return render(); }
      if (action === 'show-missing-sounds') { state.soundFilter = 'missing'; state.soundSearch = ''; state.soundSort = 'missing'; return render(); }
      if (action === 'apply-user-filter') { state.vipUserFilter = document.getElementById('vipUserFilter')?.value || 'all'; return render(); }
      if (action === 'run-twitch-sync') return runTwitchSync();
      if (action === 'save-role') return saveRole();
      if (action === 'run-test') return runTest();
    } catch (err) { state.note = `Fehler: ${err.message || err}`; render(); }
  }

  async function saveSetting(key){
    const value = root.querySelector(`[data-setting-value="${CSS.escape(key)}"]`)?.value ?? '';
    const valueType = root.querySelector(`[data-setting-type="${CSS.escape(key)}"]`)?.value || 'string';
    await post('/settings/upsert', { key, value, valueType });
    state.note = `Setting gespeichert: ${key}`;
    await loadAll(true);
  }

  function readTextPayload(id){ return { id: id > 0 ? id : undefined, eventKey: root.querySelector(`[data-text-event="${id}"]`)?.value || '', style: root.querySelector(`[data-text-style="${id}"]`)?.value || 'heimleitung', weight: Number(root.querySelector(`[data-text-weight="${id}"]`)?.value || 1), enabled: !!root.querySelector(`[data-text-enabled="${id}"]`)?.checked, messageText: root.querySelector(`[data-text-message="${id}"]`)?.value || '' }; }

  async function saveText(id){
    await post('/texts/upsert', readTextPayload(id));
    state.note = id > 0 ? `Text gespeichert: ID ${id}` : 'Text angelegt.';
    state.texts = await loadTexts();
    render();
  }

  async function toggleText(id){
    const current = !!root.querySelector(`[data-text-enabled="${id}"]`)?.checked;
    await post('/texts/toggle', { id, enabled: !current });
    state.note = `Text ${!current ? 'aktiviert' : 'deaktiviert'}: ID ${id}`;
    state.texts = await loadTexts();
    render();
  }

  function newText(){
    const row = { id: 0, eventKey: state.textFilterEventKey || 'accepted_vip', style: state.textFilterStyle || 'heimleitung', messageText: '', enabled: true, weight: 1 };
    state.texts = state.texts || { rows: [] };
    state.texts.rows = [row, ...(state.texts.rows || [])];
    state.note = 'Neuer Text vorbereitet. Bitte ausfüllen und speichern.';
    render();
  }

  async function reloadSounds(){
    state.soundUsers = await api('/sounds/users');
    state.uploadStatus = await api('/upload/status').catch(() => state.uploadStatus || null);
    state.twitchSync = await api('/twitch-sync/status').catch(() => state.twitchSync || null);
    if (!state.selectedSoundLogin && state.soundUsers?.rows?.length) state.selectedSoundLogin = state.soundUsers.rows[0].login || '';
    if (state.selectedSoundLogin) state.soundStatus = await loadSoundStatus(state.selectedSoundLogin);
    state.note = 'Soundliste aktualisiert.';
    render();
  }


  async function runTwitchSync(){
    state.note = 'Twitch-Sync läuft...';
    render();
    const result = await post('/twitch-sync/run', {});
    state.twitchSync = await api('/twitch-sync/status').catch(() => result || state.twitchSync);
    state.soundUsers = await api('/sounds/users').catch(() => state.soundUsers);
    state.note = result.ok ? `Twitch-Sync abgeschlossen: ${result.counts?.total || 0} User im Cache.` : `Twitch-Sync fehlgeschlagen: ${result.error || 'unknown'}`;
    render();
  }

  async function resolveSoundUser(){
    const manual = document.getElementById('vipSoundManualLogin')?.value || '';
    const selected = document.getElementById('vipSoundUser')?.value || '';
    const login = manual.trim() || selected.trim();
    if (!login) throw new Error('Bitte VIP/Mod/User auswählen oder Login eingeben.');
    state.soundManualLogin = manual.trim();
    state.selectedSoundLogin = login;
    state.soundStatus = await loadSoundStatus(login);
    state.note = `Soundstatus geladen: ${login}`;
    render();
  }

  async function uploadVipSound(){
    const manual = document.getElementById('vipSoundManualLogin')?.value || '';
    const selected = document.getElementById('vipSoundUser')?.value || '';
    const login = manual.trim() || selected.trim() || state.selectedSoundLogin;
    const file = document.getElementById('vipSoundFile')?.files?.[0] || null;
    const overwrite = !!document.getElementById('vipSoundOverwrite')?.checked;
    if (!login) throw new Error('Bitte VIP/Mod/User auswählen oder Login eingeben.');
    if (!file) throw new Error('Bitte eine Sounddatei auswählen.');

    const form = new FormData();
    form.append('login', login);
    form.append('overwrite', overwrite ? 'true' : 'false');
    form.append('file', file);

    const res = await fetch(API + '/sounds/upload', { method: 'POST', body: form });
    let json = null;
    try { json = await res.json(); } catch (_) { json = null; }
    if (!res.ok || !json || json.ok === false) {
      throw new Error((json && (json.message || json.error)) || `Upload fehlgeschlagen (${res.status})`);
    }

    state.selectedSoundLogin = json.user?.login || login;
    state.soundManualLogin = '';
    state.soundStatus = json;
    state.soundUsers = await api('/sounds/users').catch(() => state.soundUsers);
    state.note = json.sound?.overwritten ? 'Sound wurde ersetzt.' : 'Sound wurde hochgeladen.';
    render();
  }

  async function saveRole(){
    const payload = { login: document.getElementById('vipRoleLogin')?.value || '', displayName: document.getElementById('vipRoleDisplay')?.value || '', roleType: document.getElementById('vipRoleType')?.value || 'vip', note: document.getElementById('vipRoleNote')?.value || '', enabled: true };
    await post('/roles/upsert', payload);
    state.note = `Rolle gespeichert: ${payload.login}`;
    await loadAll(true);
  }

  async function deleteRole(login, roleType){
    if (!confirm(`Rollen-Fallback wirklich entfernen?\n${login} / ${roleType || 'alle Rollen'}`)) return;
    await post('/roles/delete', { login, roleType });
    state.note = `Rolle entfernt: ${login}`;
    await loadAll(true);
  }

  async function runTest(){
    const actor = document.getElementById('vipTestActor')?.value || 'forrestcgn';
    const target = document.getElementById('vipTestTarget')?.value || '';
    const role = document.getElementById('vipTestRole')?.value || 'broadcaster';
    const payload = { userName: actor, user: actor, input0: target, rawInput: target ? '@' + target : '', actorRole: role, isModerator: role === 'moderator' ? 'true' : 'false', isBroadcaster: role === 'broadcaster' ? 'true' : 'false', source: 'dashboard-test' };
    const result = await post('/admin/test', payload);
    state.note = result.ok ? 'VIP-Test wurde ausgelöst.' : `VIP-Test fehlgeschlagen: ${result.error || 'unknown'}`;
    await loadAll(true);
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'vip') loadAll(true); });
  return { loadAll };
})();
