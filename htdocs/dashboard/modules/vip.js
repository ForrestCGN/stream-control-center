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
    const tabs = [['overview','Übersicht'],['settings','Settings'],['texts','Texte'],['sounds','Sounds'],['roles','VIPs & Mods'],['daily','Daily-Usage'],['events','Events'],['test','Test']];
    return `<div class="vip-tabs glass">${tabs.map(([id,label]) => `<button type="button" class="vip-tab ${state.page === id ? 'active' : ''}" data-vip-page="${id}">${esc(label)}</button>`).join('')}</div>`;
  }

  function pageHtml(){
    if (state.page === 'settings') return settingsPage();
    if (state.page === 'texts') return textsPage();
    if (state.page === 'sounds') return soundsPage();
    if (state.page === 'roles') return rolesPage();
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
    return `<div class="vip-grid">${metricCard('System', s.version ? 'Aktiv' : 'Unbekannt', `Version ${fmt(s.version)}`, s.version ? 'ok' : 'warn')}${metricCard('Overlay', status.client?.connected ? 'Verbunden' : 'Getrennt', status.visible ? 'sichtbar' : 'idle', status.client?.connected ? 'ok' : 'warn')}${metricCard('Settings', count(db.settingsRows), 'DB-Settings', '')}${metricCard('Texte', count(db.messageTemplates), 'Chat-/Overlaytexte', '')}${metricCard('VIPs & Mods', count(state.soundUsers?.rows?.length || 0), `${count(db.twitchUsersRows || 0)} im Twitch-Cache`, '')}${metricCard('Events heute', count(totals.total_events), `${count(totals.accepted_events)} akzeptiert`, '')}<section class="vip-card glass span-12"><div class="vip-card-head"><h3>Aktueller VIP-Standard</h3></div><div class="vip-standard-list"><div><strong>Settings:</strong> DB über <code>vip_sound_settings</code>, JSON nur Fallback.</div><div><strong>Texte:</strong> DB über <code>vip_sound_message_templates</code>, editierbar über API.</div><div><strong>Sound:</strong> Ausgabe über <code>sound_system</code>, Overlay V2 liest Visual-State.</div><div><strong>Twitch-Sync:</strong> VIPs/Mods werden lokal gecached und können manuell oder automatisch alle 24h aktualisiert werden.</div><div><strong>Dashboard:</strong> Kein direkter SQLite-/Dateizugriff, nur Backend-APIs.</div></div></section><section class="vip-card glass span-12"><div class="vip-card-head"><h3>Letzte Events</h3><button type="button" data-vip-page="events">Alle anzeigen</button></div>${eventsTable((state.events?.rows || []).slice(0, 5), true)}</section></div>`;
  }

  function metricCard(title, value, sub, cls){ return `<section class="vip-card glass vip-metric"><h3>${esc(title)}</h3><div class="vip-metric-value ${cls || ''}">${esc(value)}</div><p>${esc(sub || '')}</p></section>`; }

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
    return `<section class="vip-card glass span-12"><div class="vip-card-head big"><div><h3>Sounds</h3><p>VIP-/Mod-Sounds verwalten. Die Datei wird automatisch nach der bestehenden VIP-Dateinamenlogik gespeichert.</p></div><button type="button" data-vip-action="reload-sounds">Sounds neu laden</button></div><div class="vip-mini-grid">${soundMetricCard('Bekannte User', stats.total, 'Twitch-Cache', '')}${soundMetricCard('Sounds vorhanden', stats.withSound, `${stats.missing} fehlen`, stats.missing ? 'warn' : 'ok')}${soundMetricCard('Ø Soundlänge', stats.avg ? formatMs(stats.avg) : '—', 'ffprobe', '')}${soundMetricCard('Längster Sound', stats.longest?.displayName || '—', stats.longest?.sound?.durationMs ? formatMs(stats.longest.sound.durationMs) : '', '')}</div><div class="vip-sound-grid"><div class="vip-sound-panel"><label>Twitch VIP/Mod auswählen<select id="vipSoundUser">${users.map(u => `<option value="${esc(u.login || '')}" ${selected === u.login ? 'selected' : ''}>${esc(soundUserOptionLabel(u))}</option>`).join('')}</select></label><label>Oder manuell Login eingeben<input id="vipSoundManualLogin" value="${esc(state.soundManualLogin || '')}" placeholder="z. B. araglor"></label><button type="button" data-vip-action="resolve-sound-user">User prüfen</button><div class="vip-muted">Die Liste kommt aus dem lokalen Twitch-Cache. Berechtigt sind nur Twitch-VIPs und Twitch-Mods.</div></div><div class="vip-sound-panel"><h4>Aktueller Soundstatus</h4><div class="vip-standard-list"><div><strong>User:</strong> ${fmt(status.user?.displayName || selectedUser?.displayName || selected || '—')}</div><div><strong>Datei:</strong> <code>${fmt(sound.fileName)}</code></div><div><strong>Vorhanden:</strong> ${badge(sound.exists ? 'Ja' : 'Nein', sound.exists ? 'ok' : 'warn')}</div><div><strong>Dauer:</strong> ${sound.durationMs ? esc(formatMs(sound.durationMs)) : '—'}</div><div><strong>Pfad:</strong> <span class="vip-muted">${fmt(sound.relativeFile || sound.fullPath)}</span></div><div><strong>Erwartete Endung:</strong> <code>${esc(expectedExt)}</code> · max. ${esc(maxMb)} MB</div></div></div></div><div class="vip-upload-box"><label>Neue Sounddatei auswählen<input id="vipSoundFile" type="file" accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a"></label><label class="vip-check"><input id="vipSoundOverwrite" type="checkbox"> vorhandenen Song ersetzen</label><button type="button" class="success" data-vip-action="upload-sound">Sound hochladen</button></div></section>`;
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
