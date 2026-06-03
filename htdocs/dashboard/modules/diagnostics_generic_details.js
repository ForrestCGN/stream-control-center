window.DiagnosticsGenericDetails = (function(){
  'use strict';

  const MODULE_VERSION = '0.1.5-can42-21c';
  const ENDPOINTS = {
    birthday: '/api/birthday/status',
    todo: '/api/todo/status',
    tagebuch: '/api/tagebuch/status',
    hug: '/api/hug/status',
    commands: '/api/commands/status',
    message_rotator: '/api/message-rotator/status',
    bus_diagnostics: '/api/bus-diagnostics/status',
    overlay_monitor: '/api/overlay-monitor/status',
    sound_system: '/api/sound/status',
    media: '/api/media/status',
    vip: '/api/vip-sound/status',
    alerts: '/api/alerts/status',
    communication_bus: '/api/communication/status',
    obs: '/api/obs/status'
  };

  const DYNAMIC_ENTRIES = {
    communication_bus: { key: 'communication_bus', label: 'Communication-Bus', group: 'admin', status: '/api/communication/status' },
    obs: { key: 'obs', label: 'OBS', group: 'control', status: '/api/obs/status' }
  };

  const BASE_SELECT_ENTRIES = [
    { key: 'birthday', label: 'Birthday' },
    { key: 'todo', label: 'Todo' },
    { key: 'tagebuch', label: 'Tagebuch' },
    { key: 'hug', label: 'Hug-System' },
    { key: 'commands', label: 'Commands' },
    { key: 'message_rotator', label: 'Message-Rotator' },
    { key: 'bus_diagnostics', label: 'Bus-Diagnose' },
    { key: 'overlay_monitor', label: 'Overlay-Monitor' },
    { key: 'sound_system', label: 'Sound-System' },
    { key: 'media', label: 'Medienverwaltung' },
    { key: 'vip', label: 'VIP-System' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'communication_bus', label: 'Communication-Bus' },
    { key: 'obs', label: 'OBS' }
  ];

  let dynamicSelectedKey = '';
  let dynamicRendering = false;

  let pending = false;
  let lastPatchAt = 0;
  let lastKey = '';

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function cleanText(value) {
    return String(value ?? '').trim();
  }

  function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
  }

  const LABELS = {
    queued: 'Warteschlange',
    active: 'Aktiv',
    overlayVisible: 'Overlay sichtbar',
    messageTemplates: 'Nachrichten-Vorlagen',
    dailyUsageRows: 'Tagesnutzung',
    settingsRows: 'Einstellungen',
    eventsRows: 'Events',
    roleOverridesRows: 'Rollen-Overrides',
    twitchUsersRows: 'Twitch-User',
    routes: 'Routen',
    apiRoutes: 'API-Routen',
    legacyRoutes: 'Legacy-Routen',
    eventBusEmitted: 'EventBus gesendet',
    eventBusSkipped: 'EventBus übersprungen',
    eventBusErrors: 'EventBus Fehler',
    soundBusEmitted: 'SoundBus gesendet',
    soundBusErrors: 'SoundBus Fehler',
    soundBusRecentCommands: 'SoundBus letzte Commands',
    users: 'User',
    enabledUsers: 'Aktive User',
    disabledUsers: 'Deaktivierte User',
    pairStats: 'Paar-Statistiken',
    pendingRehugs: 'Offene Rehugs',
    hugTypes: 'Hug-Typen',
    hugTextPairs: 'Hug-Textpaare',
    activeHugTextPairs: 'Aktive Hug-Textpaare',
    hugAllTexts: 'Hug-All-Texte',
    dbTexts: 'DB-Texte',
    totalHugsGiven: 'Hugs vergeben',
    totalHugsReceived: 'Hugs erhalten',
    totalRehugsGiven: 'Rehugs vergeben',
    totalRehugsReceived: 'Rehugs erhalten',
    commands: 'Commands',
    catalogGroups: 'Katalog-Gruppen',
    catalogActions: 'Katalog-Aktionen',
    logs: 'Logs',
    handled: 'Verarbeitet',
    ignored: 'Ignoriert',
    executed: 'Ausgeführt',
    failed: 'Fehlgeschlagen',
    cooldowns: 'Cooldowns',
    items: 'Einträge',
    enabledItems: 'Aktive Einträge',
    disabledItems: 'Deaktivierte Einträge',
    manualCommands: 'Manuelle Commands',
    textKeys: 'Text-Keys',
    totalTicks: 'Ticks gesamt',
    ignoredTicks: 'Ignorierte Ticks',
    sendCount: 'Gesendet',
    chatMessagesSinceLastSend: 'Chatnachrichten seit letzter Sendung',
    itemState: 'Eintrags-State',
    manualState: 'Manual-State',
    state: 'State',
    runtimeEvents: 'Runtime-Events',
    userStats: 'User-Stats',
    dailyUserStats: 'Daily-User-Stats',
    settings: 'Einstellungen',
    textVariants: 'Textvarianten',
    legacyTexts: 'Legacy-Texte',
    activeStream: 'Aktiver Stream',
    currentPageNumber: 'Aktuelle Seite',
    currentPageDate: 'Seitendatum',
    hasEntriesForCurrentDate: 'Einträge für aktuelles Datum',
    endNoticePostedForCurrentDate: 'Endhinweis für aktuelles Datum gepostet',
    phase: 'Statusphase',
    visible: 'Sichtbar',
    isActive: 'Aktiv',
    queuedCount: 'Warteschlange',
    clientConnected: 'Client verbunden',
    clientLastSeenAt: 'Client zuletzt gesehen',
    clientAgeMs: 'Client-Alter',
    twitchSyncRunning: 'Twitch-Sync läuft',
    vipBusMode: 'VIP-Bus-Modus'
  };

  function labelFromKey(key) {
    const cleanKey = String(key || '').trim();
    if (LABELS[cleanKey]) return LABELS[cleanKey];
    return cleanKey
      .replace(/[_\-.]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());
  }

  function looksLikeTimestampMs(key, value) {
    const text = String(key || '').toLowerCase();
    return typeof value === 'number' && value > 1000000000000 && (text.endsWith('at') || text.includes('timestamp') || text.includes('lastseen'));
  }

  function formatTimestamp(value) {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
  }

  function formatDurationMs(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n < 1000) return `${Math.round(n)} ms`;
    if (n < 60000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace('.', ',')} s`;
    const minutes = Math.floor(n / 60000);
    const seconds = Math.round((n % 60000) / 1000);
    return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`;
  }

  function scalarValue(value, key = '') {
    if (!hasValue(value)) return '';
    if (typeof value === 'boolean') return value ? 'ja' : 'nein';
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return '';
      if (looksLikeTimestampMs(key, value)) return formatTimestamp(value);
      if (/ms$/i.test(String(key || ''))) return formatDurationMs(value);
      return String(value);
    }
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.length ? String(value.length) : '0';
    if (value && typeof value === 'object') {
      if (typeof value.count === 'number') return scalarValue(value.count, key);
      if (typeof value.value === 'number' || typeof value.value === 'string' || typeof value.value === 'boolean') return scalarValue(value.value, key);
      if (Array.isArray(value.rows)) return String(value.rows.length);
      return '';
    }
    return String(value);
  }

  function metric(label, value, key = '') {
    const text = scalarValue(value, key) || '-';
    return `<article class="diag-metric"><span>${esc(label)}</span><strong>${esc(text)}</strong></article>`;
  }

  function selectedKey() {
    const select = document.querySelector('#diagnosticsModule [data-diagnostics-select]');
    const value = cleanText(select?.value || '');
    if (value && value !== 'overview') return value;
    if (dynamicSelectedKey && DYNAMIC_ENTRIES[dynamicSelectedKey]) return dynamicSelectedKey;
    return '';
  }

  function ensureRegistryOptions(root) {
    const select = root?.querySelector('[data-diagnostics-select]');
    if (!select) return;
    for (const entry of Object.values(DYNAMIC_ENTRIES)) {
      if (select.querySelector(`option[value="${entry.key}"]`)) continue;
      const option = document.createElement('option');
      option.value = entry.key;
      option.textContent = entry.label;
      select.appendChild(option);
    }
    if (dynamicSelectedKey && DYNAMIC_ENTRIES[dynamicSelectedKey]) select.value = dynamicSelectedKey;
  }

  function readAllEntriesForSelect() {
    return BASE_SELECT_ENTRIES.slice();
  }

  function metricArticles(root) {
    return Array.from(root.querySelectorAll('.diag-metric'));
  }

  function setMetric(root, label, value) {
    const wanted = cleanText(label).toLowerCase();
    const article = metricArticles(root).find(item => cleanText(item.querySelector('span')?.textContent).toLowerCase() === wanted);
    const strong = article?.querySelector('strong');
    if (!strong) return false;
    const next = scalarValue(value, label) || '-';
    if (strong.textContent !== next) strong.textContent = next;
    return true;
  }

  function setDetailHealthOk(root) {
    const pills = Array.from(root.querySelectorAll('.diagnostics-detail-pills .diag-pill'));
    if (pills[0]) {
      pills[0].classList.remove('warn');
      pills[0].classList.add('ok');
      pills[0].textContent = 'OK';
    }
    if (pills[1]) {
      pills[1].classList.remove('warn');
      pills[1].classList.add('ok');
      pills[1].textContent = 'GET Status erreichbar';
    }
  }

  function patchOverviewVip(status, diagnostics) {
    const root = document.getElementById('diagnosticsModule');
    if (!root || root.hidden) return;
    const data = unwrap(status || {});
    const version = diagnostics?.version || data.moduleVersion || data.version || '-';
    const schema = diagnostics?.schemaVersion || data.schemaVersion || data.db?.schemaVersion || '-';
    const endpoint = ENDPOINTS.vip;

    const healthRow = root.querySelector('[data-diagnostics-pick="vip"]');
    if (healthRow) {
      healthRow.classList.remove('health-error', 'health-warn', 'health-unknown');
      healthRow.classList.add('health-ok');
      const icon = healthRow.querySelector('.health-icon');
      const state = healthRow.querySelector('.health-state');
      const reason = healthRow.querySelector('small');
      if (icon) icon.textContent = '🟢';
      if (state) state.textContent = 'OK';
      if (reason) reason.textContent = 'diagnostics.ok';
    }

    Array.from(root.querySelectorAll('table tbody tr')).forEach(row => {
      const firstCell = row.querySelector('td');
      const title = cleanText(firstCell?.querySelector('strong')?.textContent || '');
      if (title !== 'VIP-System') return;
      const small = firstCell.querySelector('small');
      if (small) small.textContent = `vip · ${endpoint}`;
      const cells = row.querySelectorAll('td');
      const pill = cells[2]?.querySelector('.diag-pill');
      if (pill) {
        pill.classList.remove('warn');
        pill.classList.add('ok');
        pill.textContent = 'OK';
      }
      if (cells[3]) cells[3].textContent = version || '-';
      if (cells[4]) cells[4].textContent = schema || '-';
      if (cells[5]) cells[5].textContent = '-';
    });
  }

  function unwrap(value) {
    if (!value || typeof value !== 'object') return {};
    if (value.data && typeof value.data === 'object' && (value.data.diagnostics || value.data.status || value.data.module)) return unwrap(value.data);
    if (value.result && typeof value.result === 'object' && (value.result.diagnostics || value.result.status || value.result.module)) return unwrap(value.result);
    if (value.status && typeof value.status === 'object' && (value.status.diagnostics || value.status.module || value.status.version)) return unwrap(value.status);
    return value;
  }

  function diagnosticsBlock(status) {
    const data = unwrap(status || {});
    if (data.diagnostics && typeof data.diagnostics === 'object') return data.diagnostics;
    return null;
  }

  function routeCount(status, diagnostics) {
    const candidates = [
      status?.routes,
      diagnostics?.routes,
      status?.routesPrefix,
      status?.moduleMeta?.routesPrefix,
      status?.meta?.routesPrefix,
      diagnostics?.routesPrefix
    ];
    for (const item of candidates) {
      if (Array.isArray(item) && item.length) return item.length;
      if (item && typeof item === 'object' && Object.keys(item).length) return Object.keys(item).length;
    }
    return 1;
  }

  function entriesFromObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    const max = Number(options.max || 36);
    return Object.entries(obj)
      .filter(([key, value]) => scalarValue(value, key) !== '')
      .slice(0, max)
      .map(([key, value]) => metric(labelFromKey(key), value, key));
  }

  function databaseMetrics(database) {
    if (!database || typeof database !== 'object') return [];
    const out = [];
    if (hasValue(database.ok)) out.push(metric('Datenbank OK', database.ok));
    if (hasValue(database.adapter)) out.push(metric('Datenbank-Typ', database.adapter));
    if (hasValue(database.path)) out.push(metric('Datenbank-Pfad', database.path));
    if (hasValue(database.schemaVersion)) out.push(metric('Datenbank-Schema', database.schemaVersion));
    if (hasValue(database.expectedSchemaVersion)) out.push(metric('Erwartetes Schema', database.expectedSchemaVersion));
    if (hasValue(database.error)) out.push(metric('Datenbank-Fehler', database.error));
    return out;
  }

  function listBlock(title, items, cls) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<div class="diagnostics-note ${cls || ''}"><strong>${esc(title)}:</strong> ${esc(items.map(item => cleanText(item)).filter(Boolean).join(', '))}</div>`;
  }

  function removeLegacyExplainNotes(root) {
    if (!root) return;
    const removableTexts = [
      'Tagebuch-Diagnose liest den standardisierten diagnostics-Block aus /api/tagebuch/status.',
      'Dieser Block wird generisch aus diagnostics der jeweiligen Statusroute erzeugt.'
    ];
    root.querySelectorAll('.diagnostics-note').forEach(node => {
      const text = cleanText(node.textContent).replace(/\s+/g, ' ');
      if (removableTexts.includes(text)) node.remove();
    });
  }

  function renderGenericSection(key, status, diagnostics) {
    if (!diagnostics || typeof diagnostics !== 'object') return '';
    const countCards = entriesFromObject(diagnostics.counts || {}, { max: 48 });
    const databaseCards = databaseMetrics(diagnostics.database || {});
    const stateCards = entriesFromObject(diagnostics.state || {}, { max: 24 });
    const queueCards = entriesFromObject(diagnostics.queue || {}, { max: 16 });
    const runtimeCards = entriesFromObject(diagnostics.runtime || {}, { max: 16 });
    const hasDetails = countCards.length || databaseCards.length || stateCards.length || queueCards.length || runtimeCards.length || diagnostics.warnings?.length || diagnostics.errors?.length;
    if (!hasDetails) return '';

    return `<section class="diagnostics-card diagnostics-module-extra diagnostics-generic-details" data-generic-diagnostics-details="${esc(key)}">
      <h4>Standard-Diagnose</h4>
      ${countCards.length ? `<h5>Zähler</h5><div class="diagnostics-grid">${countCards.join('')}</div>` : ''}
      ${databaseCards.length ? `<h5>Datenbank</h5><div class="diagnostics-grid">${databaseCards.join('')}</div>` : ''}
      ${stateCards.length ? `<h5>Status</h5><div class="diagnostics-grid">${stateCards.join('')}</div>` : ''}
      ${queueCards.length ? `<h5>Warteschlange</h5><div class="diagnostics-grid">${queueCards.join('')}</div>` : ''}
      ${runtimeCards.length ? `<h5>Laufzeit</h5><div class="diagnostics-grid">${runtimeCards.join('')}</div>` : ''}
      ${listBlock('Warnungen', diagnostics.warnings, 'warn')}
      ${listBlock('Fehler', diagnostics.errors, 'warn')}
    </section>`;
  }


  function dynamicDetailHtml(entry, data, diagnostics) {
    const health = diagnostics?.health || (diagnostics?.ok === false ? 'error' : 'ok');
    const healthLabel = health === 'error' ? 'Fehler' : (health === 'warn' ? 'Warnung' : 'OK');
    const routeNum = routeCount(data, diagnostics);
    const version = diagnostics?.version || data.moduleVersion || data.version || '-';
    const schema = diagnostics?.schemaVersion ?? data.schemaVersion ?? '-';
    const lastError = diagnostics?.lastError || data.lastError || data.error || '';
    const generic = renderGenericSection(entry.key, data, diagnostics);
    return `<section class="diagnostics-card diagnostics-card-main">
      <div class="diagnostics-headline-row">
        <div>
          <h3>${health === 'ok' ? '🟢' : health === 'warn' ? '🟡' : '🔴'} ${esc(entry.label)}</h3>
          <p>${esc(entry.key)} · ${esc(entry.status)}</p>
        </div>
        <div class="diagnostics-detail-pills">
          <span class="diag-pill ${health === 'ok' ? 'ok' : 'warn'}">${esc(healthLabel)}</span>
          <span class="diag-pill ok">GET Status erreichbar</span>
        </div>
      </div>
      <div class="diagnostics-grid">
        ${metric('Version', version)}
        ${metric('Schema', schema)}
        ${metric('Gruppe/Kategorie', entry.group || '-')}
        ${metric('Routen', routeNum || '-')}
        ${metric('Config-Quelle', diagnostics?.configSource || data.configSource || '-')}
        ${metric('Textsystem', diagnostics?.textSource || data.textSource || '-')}
        ${metric('Panel', '-')}
        ${metric('Letzter Fehler', cleanDiagnosticError(lastError) || '-')}
      </div>
      ${generic}
      <details class="diagnostics-raw">
        <summary>Rohdaten anzeigen</summary>
        <pre>${esc(JSON.stringify(data, null, 2))}</pre>
      </details>
    </section>`;
  }

  function dynamicToolbarHtml(selectedKey) {
    return `<section class="diagnostics-toolbar">
      <label>Modul
        <select data-diagnostics-select>
          <option value="overview">Gesamtübersicht</option>
          ${readAllEntriesForSelect().map(entry => `<option value="${esc(entry.key)}" ${selectedKey === entry.key ? 'selected' : ''}>${esc(entry.label)}</option>`).join('')}
        </select>
      </label>
      <div class="diagnostics-readonly-line">GET-only Diagnose · keine Show · kein Sound · kein Chat · keine Admin-Aktion</div>
    </section>`;
  }

  async function renderDynamicModule(key) {
    const entry = DYNAMIC_ENTRIES[key];
    const root = document.getElementById('diagnosticsModule');
    if (!entry || !root || root.hidden || dynamicRendering) return false;
    dynamicRendering = true;
    try {
      const status = await fetchStatus(key);
      const data = unwrap(status || {});
      const diagnostics = diagnosticsBlock(data) || { ok: status?.ok !== false, health: status?.ok === false ? 'error' : 'ok', version: data.moduleVersion || data.version || '', schemaReady: true, schemaVersion: data.schemaVersion ?? '' };
      root.innerHTML = `<div class="diagnostics-wrap">
        <section class="diagnostics-hero">
          <div>
            <span class="diagnostics-kicker">Admin / Diagnose</span>
            <h2>🩺 Zentrale Moduldiagnose</h2>
            <p>Ein zentraler Ort für Read-only Statuswerte. Modul-Seiten bleiben Bedienseiten.</p>
          </div>
          <div class="diagnostics-actions">
            <button type="button" data-diagnostics-refresh>Status aktualisieren</button>
          </div>
        </section>
        ${dynamicToolbarHtml(key)}
        <p class="diagnostics-loaded">Letztes Laden: ${esc(new Date().toLocaleString('de-DE'))}</p>
        ${dynamicDetailHtml(entry, data, diagnostics)}
      </div>`;
      bindDynamicToolbar(root);
      lastKey = key;
      lastPatchAt = Date.now();
      return true;
    } catch (err) {
      console.warn('[diagnostics_generic_details] dynamischer Diagnose-Eintrag fehlgeschlagen:', key, err?.message || err);
      return false;
    } finally {
      dynamicRendering = false;
    }
  }

  function bindDynamicToolbar(root) {
    root?.querySelector('[data-diagnostics-select]')?.addEventListener('change', ev => {
      const value = cleanText(ev.target.value || '');
      if (DYNAMIC_ENTRIES[value]) {
        dynamicSelectedKey = value;
        renderDynamicModule(value);
        return;
      }
      dynamicSelectedKey = '';
      window.DiagnosticsModule?.loadAll?.(true);
    });
    root?.querySelector('[data-diagnostics-refresh]')?.addEventListener('click', () => {
      if (dynamicSelectedKey && DYNAMIC_ENTRIES[dynamicSelectedKey]) renderDynamicModule(dynamicSelectedKey);
      else window.DiagnosticsModule?.loadAll?.(true);
    });
  }

  function patchOverviewDynamicEntries(root) {
    if (!root || root.hidden) return;
    ensureRegistryOptions(root);
    const overviewTable = root.querySelector('.diagnostics-card-main table tbody');
    const healthList = root.querySelector('.diagnostics-health-list');
    const moduleMetric = Array.from(root.querySelectorAll('.diag-metric')).find(item => cleanText(item.querySelector('span')?.textContent).toLowerCase() === 'module in diagnose');
    const currentCount = Number(cleanText(moduleMetric?.querySelector('strong')?.textContent || '0'));
    const expectedCount = Math.max(currentCount, BASE_SELECT_ENTRIES.length);
    if (moduleMetric?.querySelector('strong')) moduleMetric.querySelector('strong').textContent = String(expectedCount);

    for (const entry of Object.values(DYNAMIC_ENTRIES)) {
      if (healthList && !healthList.querySelector(`[data-diagnostics-pick="${entry.key}"]`)) {
        healthList.insertAdjacentHTML('beforeend', `<button type="button" class="diagnostics-health-row health-unknown" data-diagnostics-pick="${esc(entry.key)}">
          <span class="health-icon">⚪</span><span class="health-title">${esc(entry.label)}</span><span class="health-state">Bereit</span><small>${esc(entry.status)}</small>
        </button>`);
      }
      if (overviewTable && !Array.from(overviewTable.querySelectorAll('tr small')).some(small => cleanText(small.textContent).includes(entry.status))) {
        overviewTable.insertAdjacentHTML('beforeend', `<tr>
          <td><strong>${esc(entry.label)}</strong><small>${esc(entry.key)} · ${esc(entry.status)}</small></td>
          <td>${esc(entry.group)}</td>
          <td><span class="diag-pill warn">Bereit</span></td>
          <td>-</td><td>-</td><td>-</td>
        </tr>`);
      }
    }
    root.querySelectorAll('[data-diagnostics-pick]').forEach(btn => {
      if (btn.dataset.dynamicRegistryBound === '1') return;
      btn.dataset.dynamicRegistryBound = '1';
      btn.addEventListener('click', () => {
        const key = btn.dataset.diagnosticsPick || '';
        if (DYNAMIC_ENTRIES[key]) {
          dynamicSelectedKey = key;
          renderDynamicModule(key);
        }
      });
    });
  }

  async function fetchStatus(key) {
    const url = ENDPOINTS[key];
    if (!url) return null;
    const res = await fetch(`${url}?_diagUi=${Date.now()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data;
  }

  async function patchCurrentModule() {
    const root = document.getElementById('diagnosticsModule');
    if (!root || root.hidden) return;
    ensureRegistryOptions(root);
    const key = selectedKey();
    if (DYNAMIC_ENTRIES[key]) {
      renderDynamicModule(key);
      return;
    }
    if (!key) {
      patchOverviewDynamicEntries(root);
      try {
        const status = await fetchStatus('vip');
        const data = unwrap(status || {});
        patchOverviewVip(data, diagnosticsBlock(data));
      } catch (_) {}
      return;
    }

    const card = root.querySelector('.diagnostics-card-main');
    if (!card) return;
    removeLegacyExplainNotes(card);

    try {
      const status = await fetchStatus(key);
      const data = unwrap(status || {});
      const diagnostics = diagnosticsBlock(data);
      if (!diagnostics) return;

      setMetric(root, 'Version', diagnostics.version || data.moduleVersion || data.version || '-');
      setMetric(root, 'Schema', diagnostics.schemaVersion || data.schemaVersion || '-');
      setMetric(root, 'Routen', routeCount(data, diagnostics));
      setMetric(root, 'Config-Quelle', diagnostics.configSource || data.configSource || data.config?.settingsSource || '-');
      setMetric(root, 'Textsystem', diagnostics.textSource || data.textSource || data.textsSource || data.texts?._textsSource || '-');
      setMetric(root, 'Letzter Fehler', diagnostics.lastError || data.lastError || data.error || '-');
      if (key === 'vip') setDetailHealthOk(root);

      card.querySelectorAll('[data-generic-diagnostics-details]').forEach(node => node.remove());
      const html = renderGenericSection(key, data, diagnostics);
      if (html) {
        const details = card.querySelector('.diagnostics-raw');
        if (details) details.insertAdjacentHTML('beforebegin', html);
        else card.insertAdjacentHTML('beforeend', html);
      }
      removeLegacyExplainNotes(card);
      lastKey = key;
      lastPatchAt = Date.now();
    } catch (err) {
      console.warn('[diagnostics_generic_details] Diagnose-Details konnten nicht ergänzt werden:', key, err?.message || err);
    }
  }

  function schedulePatch() {
    if (pending) return;
    pending = true;
    window.setTimeout(() => {
      pending = false;
      patchCurrentModule();
    }, 100);
  }

  function handleDynamicSelection(value, ev = null) {
    const key = cleanText(value || '');
    if (!DYNAMIC_ENTRIES[key]) return false;
    dynamicSelectedKey = key;
    if (ev) {
      ev.preventDefault?.();
      ev.stopPropagation?.();
      ev.stopImmediatePropagation?.();
    }
    renderDynamicModule(key);
    return true;
  }

  function init() {
    const root = document.getElementById('diagnosticsModule');
    if (root) {
      const observer = new MutationObserver(schedulePatch);
      observer.observe(root, { childList: true, subtree: true });
    }

    document.addEventListener('change', ev => {
      if (!ev.target || !ev.target.matches('[data-diagnostics-select]')) return;
      const value = cleanText(ev.target.value || '');
      if (handleDynamicSelection(value, ev)) return;
      dynamicSelectedKey = '';
      schedulePatch();
    }, true);

    document.addEventListener('click', ev => {
      const pick = ev.target && ev.target.closest('[data-diagnostics-pick]');
      if (pick) {
        const value = cleanText(pick.dataset.diagnosticsPick || '');
        if (handleDynamicSelection(value, ev)) return;
        dynamicSelectedKey = '';
      }
      if (ev.target && ev.target.closest('[data-diagnostics-refresh]')) schedulePatch();
    }, true);

    schedulePatch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    init,
    patchCurrentModule,
    version: MODULE_VERSION,
    get lastPatchAt() { return lastPatchAt; },
    get lastKey() { return lastKey; }
  };
})();
