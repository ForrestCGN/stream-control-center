(function () {
  'use strict';

  const state = {
    loading: false,
    data: null,
    obsStatus: null,
    obsSources: [],
    obsScenes: [],
    obsSceneItems: [],
    obsError: '',
    sceneError: '',
    error: '',
    filter: 'all',
    sourceFilter: 'all',
    selectedSceneMode: 'current',
    selectedSceneName: '',
    lastCurrentSceneName: '',
    tab: 'overview',
    autoRefresh: true,
    timer: null,
    lastLoadedAt: ''
  };

  const API_STATUS = '/api/overlay-monitor/status?events=10';
  const API_OBS_STATUS = '/api/obs/status';
  const API_OBS_BROWSER_SOURCES = '/api/obs/browser-sources';
  const API_OBS_SCENES = '/api/obs/scenes';
  const AUTO_REFRESH_MS = 5000;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function panel() {
    return document.getElementById('overlaysModule');
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '');

    if (!res.ok) {
      const detail = data && typeof data === 'object'
        ? (data.message || data.error?.message || data.error?.code || data.error || '')
        : data;
      throw new Error(detail || `HTTP ${res.status}`);
    }

    return data;
  }

  function apiOk(data) {
    return !(data && typeof data === 'object' && data.ok === false);
  }

  function apiMessage(data, fallback = '') {
    if (!data || typeof data !== 'object') return fallback;
    return clean(data.message || data.error?.message || data.error?.code || data.error || data.reason || fallback);
  }

  function unwrapApiData(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) return raw.data;
    return raw;
  }

  function clean(value) {
    return String(value ?? '').trim();
  }

  function key(value) {
    return clean(value).toLowerCase().replace(/\.html?$/i, '').replace(/[^a-z0-9]+/g, '');
  }

  function basename(value) {
    const text = clean(value).split('?')[0].replace(/\\/g, '/');
    return text.split('/').filter(Boolean).pop() || text;
  }

  function statusClass(status) {
    const s = String(status || 'unknown').toLowerCase();
    if (s === 'online' || s === 'ok' || s === 'connected' || s === 'ready') return 'ok';
    if (s === 'waiting' || s === 'hidden' || s === 'standby' || s === 'inactive') return 'muted';
    if (s === 'registered' || s === 'no_heartbeat' || s === 'no-heartbeat' || s === 'stale' || s === 'warning' || s === 'warn' || s === 'needs_attention') return 'warn';
    if (s === 'offline' || s === 'dead' || s === 'error' || s === 'bad' || s === 'disconnected') return 'bad';
    return 'muted';
  }

  function fmtTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function fmtDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' });
  }

  function fmtAge(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n)) return '—';
    if (n < 60) return `${Math.max(0, Math.round(n))}s`;
    const min = Math.floor(n / 60);
    const sec = Math.round(n % 60);
    if (min < 60) return `${min}m ${sec}s`;
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}m`;
  }

  function shortText(value, max = 90) {
    const text = String(value || '').trim();
    if (!text) return '—';
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
  }

  function lastContact(overlay) {
    return overlay.lastHeartbeatAt || overlay.lastHelloAt || overlay.lastSeenAt || overlay.connectedAt || overlay.registeredAt || '';
  }

  function heartbeatLabel(client) {
    if (!client) return 'kein Client';
    if (client.hasHeartbeat === true || client.lastHeartbeatAt) return `OK · Heartbeat ${fmtAge(client.heartbeatAgeSeconds ?? client.ageSeconds)}`;
    if (client.connected === true) return 'Warnung · kein Heartbeat';
    return 'kein Heartbeat';
  }

  function obsPayload() {
    return unwrapApiData(state.obsStatus || {}) || {};
  }

  function obsConnected() {
    const obs = obsPayload();
    return obs.connected === true || obs.obsConnected === true || (state.obsStatus && state.obsStatus.ok === true && obs.connected !== false && obs.obsConnected !== false);
  }

  function currentProgramSceneName() {
    const obs = obsPayload();
    const fromObs = clean(obs.currentProgramSceneName || obs.programSceneName || obs.currentScene || obs.sceneName);
    if (fromObs) return fromObs;
    const scenesRaw = unwrapApiData(state._lastScenesRaw || {}) || {};
    return clean(scenesRaw.currentProgramSceneName || scenesRaw.programSceneName || '');
  }

  function selectedSceneName() {
    if (state.selectedSceneMode === 'manual' && state.selectedSceneName) return state.selectedSceneName;
    return currentProgramSceneName();
  }

  function normalizeList(raw, keys) {
    const data = unwrapApiData(raw);
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    for (const itemKey of keys) {
      if (Array.isArray(data[itemKey])) return data[itemKey];
    }
    return [];
  }

  function normalizeObsSources(raw) {
    return normalizeList(raw, ['browserSources', 'sources', 'inputs', 'data', 'items']);
  }

  function normalizeObsScenes(raw) {
    return normalizeList(raw, ['scenes', 'data', 'items']).map(scene => ({
      sceneName: clean(scene.sceneName || scene.name || scene.scene || scene.id),
      raw: scene
    })).filter(scene => scene.sceneName);
  }

  function normalizeSceneItems(raw, sceneName) {
    return normalizeList(raw, ['sceneItems', 'items', 'sources', 'data']).map(item => ({
      sceneName,
      sourceName: clean(item.sourceName || item.inputName || item.name || item.source || item.id),
      sceneItemId: item.sceneItemId ?? item.id ?? '',
      enabled: item.sceneItemEnabled === true || item.enabled === true || item.visible === true,
      locked: item.sceneItemLocked === true || item.locked === true,
      raw: item
    })).filter(item => item.sourceName);
  }

  async function loadObsSceneItems() {
    state.obsScenes = [];
    state.obsSceneItems = [];
    state.sceneError = '';

    try {
      const scenesRaw = await api(API_OBS_SCENES);
      state._lastScenesRaw = scenesRaw;
      const scenes = normalizeObsScenes(scenesRaw);
      state.obsScenes = scenes;
      const currentScene = currentProgramSceneName();
      if (currentScene && state.selectedSceneMode !== 'manual') state.selectedSceneName = currentScene;
      if (!scenes.length) return;

      const results = await Promise.allSettled(scenes.map(scene => api(`/api/obs/scene-items?scene=${encodeURIComponent(scene.sceneName)}`)));
      const allItems = [];
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return;
        allItems.push(...normalizeSceneItems(result.value, scenes[index].sceneName));
      });
      state.obsSceneItems = allItems;
    } catch (err) {
      state.sceneError = err?.message || String(err || 'OBS-Szenen konnten nicht geladen werden.');
    }
  }

  function sourceUrl(src) {
    return clean(src.url || src.local_file || src.file || src.path || src.inputSettings?.url || src.inputSettings?.local_file || '');
  }

  function sourceName(src) {
    return clean(src.inputName || src.sourceName || src.name || src.id || 'OBS Browser Source');
  }

  function findScenesForSource(src) {
    const name = sourceName(src);
    const wanted = key(name);
    if (!wanted) return [];
    return state.obsSceneItems.filter(item => key(item.sourceName) === wanted);
  }

  function sceneItemsForScene(sceneName) {
    const wanted = key(sceneName);
    if (!wanted) return [];
    return state.obsSceneItems.filter(item => key(item.sceneName) === wanted);
  }

  function sceneNameSet() {
    return new Set(state.obsScenes.map(scene => key(scene.sceneName)).filter(Boolean));
  }

  function browserSourceMap() {
    const map = new Map();
    for (const src of state.obsSources) {
      const nameKey = key(sourceName(src));
      if (nameKey && !map.has(nameKey)) map.set(nameKey, src);
    }
    return map;
  }

  function sourceIsSceneLike(sourceNameValue) {
    return sceneNameSet().has(key(sourceNameValue));
  }

  function sourceIsBrowserLike(sourceNameValue) {
    return browserSourceMap().has(key(sourceNameValue));
  }

  function busClients() {
    return Array.isArray(state.data?.overlays) ? state.data.overlays : [];
  }

  function scoreClientForSource(client, src, extraText = '') {
    const srcName = sourceName(src);
    const url = sourceUrl(src);
    const base = basename(url);
    const hay = [srcName, url, base, extraText].map(key).filter(Boolean).join('|');
    const clientId = key(client.id);
    const module = key(client.module);
    const clientName = key(client.name);
    let score = 0;

    if (clientId && hay.includes(clientId)) score += 100;
    if (clientId && clientId.includes(key(base))) score += 60;
    if (module && hay.includes(module)) score += 50;
    if (clientName && hay.includes(clientName)) score += 35;

    const loose = [
      ['vip', 'vip'],
      ['alert', 'alert'],
      ['alerts', 'alert'],
      ['sound', 'sound'],
      ['tts', 'tts'],
      ['tts', 'sound'],
      ['death', 'death'],
      ['deathcounter', 'death'],
      ['challenge', 'challenge'],
      ['firework', 'firework'],
      ['start', 'start'],
      ['end', 'end']
    ];

    for (const [sourceToken, clientToken] of loose) {
      if (hay.includes(sourceToken) && (clientId.includes(clientToken) || module.includes(clientToken) || clientName.includes(clientToken))) score += 18;
    }

    return score;
  }

  function findClientForSource(src, pathText = '') {
    const clients = busClients();
    let best = null;
    let bestScore = 0;
    for (const client of clients) {
      const score = scoreClientForSource(client, src, pathText);
      if (score > bestScore) {
        best = client;
        bestScore = score;
      }
    }
    return bestScore >= 18 ? { client: best, score: bestScore } : { client: null, score: 0 };
  }

  function evaluateSource(row) {
    const obsOk = obsConnected();
    const visible = row.effectiveVisible === true;
    const client = row.client;
    const busStatus = String(client?.status || '').toLowerCase();
    const connected = client?.connected === true;

    if (!obsOk) return { status: 'warning', label: 'OBS offline/unbekannt', detail: 'OBS liefert keine sichere Laufzeitbewertung.' };
    if (!row.inSelectedScene) return { status: 'warning', label: 'Nicht in Szene', detail: 'Browserquelle wurde nicht in der ausgewählten Szene oder ihren Unter-Szenen gefunden.' };

    if (!visible) {
      if (connected && (client.hasHeartbeat === true || client.lastHeartbeatAt)) return { status: 'waiting', label: 'Bereit / ausgeblendet', detail: 'Quelle ist effektiv nicht sichtbar, der Bus-Client sendet aber echte Heartbeats.' };
      if (connected) return { status: 'warning', label: 'Ausgeblendet, kein Heartbeat', detail: 'Quelle ist effektiv nicht sichtbar. Client ist angemeldet, aber ohne echten Heartbeat.' };
      return { status: 'waiting', label: 'Ausgeblendet / wartet', detail: 'Für Event-Overlays ist das ein normaler Zustand.' };
    }

    if (!client) return { status: 'warning', label: 'Sichtbar, kein Bus-Client', detail: 'Quelle ist effektiv sichtbar, aber kein passender Overlay-Client wurde erkannt.' };
    if (!(client.hasHeartbeat === true || client.lastHeartbeatAt)) return { status: 'warning', label: 'Sichtbar, kein Heartbeat', detail: 'Quelle ist effektiv sichtbar, aber es gibt keinen echten bus_heartbeat.' };
    if (busStatus === 'online') return { status: 'ok', label: 'Sichtbar + Heartbeat', detail: 'OBS-Quelle ist effektiv sichtbar und der Bus-Client sendet echte Heartbeats.' };
    if (busStatus === 'stale') return { status: 'warning', label: 'Sichtbar, Heartbeat stale', detail: 'Quelle ist sichtbar, aber der letzte Heartbeat ist zu alt.' };
    return { status: 'error', label: `Sichtbar, Bus ${busStatus || 'unbekannt'}`, detail: 'Quelle ist sichtbar, aber der Overlay-Client wirkt nicht bereit.' };
  }

  function buildNestedSourceRowsForScene(sceneName) {
    const sourceMap = browserSourceMap();
    const sceneSet = sceneNameSet();
    const rows = [];
    const maxDepth = 10;

    function walk(currentSceneName, parentEffectiveVisible, pathParts, visited, depth) {
      const currentKey = key(currentSceneName);
      if (!currentKey || visited.has(currentKey) || depth > maxDepth) return;
      const nextVisited = new Set(visited);
      nextVisited.add(currentKey);

      const items = sceneItemsForScene(currentSceneName);
      for (const item of items) {
        const itemName = clean(item.sourceName);
        if (!itemName) continue;
        const directVisible = item.enabled === true;
        const effectiveVisible = parentEffectiveVisible && directVisible;
        const itemKey = key(itemName);
        const nextPath = [...pathParts, itemName];

        if (sourceMap.has(itemKey)) {
          const src = sourceMap.get(itemKey);
          const pathText = nextPath.join(' → ');
          const match = findClientForSource(src, pathText);
          const row = {
            raw: src,
            name: sourceName(src),
            kind: clean(src.inputKind || src.unversionedInputKind || src.kind || 'browser_source'),
            url: sourceUrl(src),
            local: src.is_local_file === true || !!src.local_file,
            width: src.width || '—',
            height: src.height || '—',
            fps: src.fps || '—',
            selectedScene: sceneName,
            sceneName: currentSceneName,
            scenes: findScenesForSource(src),
            selectedItems: [item],
            visible: effectiveVisible,
            directVisible,
            parentVisible: parentEffectiveVisible,
            effectiveVisible,
            inSelectedScene: true,
            nested: pathParts.length > 1,
            depth,
            path: nextPath,
            pathText,
            containerPath: pathParts.join(' → '),
            client: match.client,
            matchScore: match.score
          };
          row.evaluation = evaluateSource(row);
          rows.push(row);
          continue;
        }

        if (sceneSet.has(itemKey)) {
          walk(itemName, effectiveVisible, nextPath, nextVisited, depth + 1);
        }
      }
    }

    if (sceneName) walk(sceneName, true, [sceneName], new Set(), 0);

    return rows;
  }

  function buildSourceRows() {
    const selectedScene = selectedSceneName();
    const nestedRows = buildNestedSourceRowsForScene(selectedScene);
    if (nestedRows.length > 0 || selectedScene) {
      return nestedRows.sort((a, b) => {
        if (a.effectiveVisible !== b.effectiveVisible) return a.effectiveVisible ? -1 : 1;
        if ((a.depth || 0) !== (b.depth || 0)) return (a.depth || 0) - (b.depth || 0);
        return a.name.localeCompare(b.name);
      });
    }

    return state.obsSources.map(src => {
      const match = findClientForSource(src, '');
      const row = {
        raw: src,
        name: sourceName(src),
        kind: clean(src.inputKind || src.unversionedInputKind || src.kind || 'browser_source'),
        url: sourceUrl(src),
        local: src.is_local_file === true || !!src.local_file,
        width: src.width || '—',
        height: src.height || '—',
        fps: src.fps || '—',
        selectedScene: '',
        scenes: findScenesForSource(src),
        selectedItems: [],
        visible: false,
        directVisible: false,
        parentVisible: true,
        effectiveVisible: false,
        inSelectedScene: false,
        nested: false,
        depth: 0,
        path: [],
        pathText: '',
        containerPath: '',
        client: match.client,
        matchScore: match.score
      };
      row.evaluation = evaluateSource(row);
      return row;
    });
  }

  function filteredSourceRows() {
    const rows = buildSourceRows();
    if (state.sourceFilter === 'all') return rows;
    if (state.sourceFilter === 'visible') return rows.filter(row => row.visible);
    if (state.sourceFilter === 'hidden') return rows.filter(row => !row.visible);
    if (state.sourceFilter === 'problem') return rows.filter(row => ['warning', 'error'].includes(row.evaluation.status));
    if (state.sourceFilter === 'ok') return rows.filter(row => row.evaluation.status === 'ok');
    if (state.sourceFilter === 'waiting') return rows.filter(row => row.evaluation.status === 'waiting');
    return rows;
  }

  function sourceCounts() {
    const rows = buildSourceRows();
    return {
      total: rows.length,
      visible: rows.filter(row => row.visible).length,
      hidden: rows.filter(row => !row.visible).length,
      ok: rows.filter(row => row.evaluation.status === 'ok').length,
      waiting: rows.filter(row => row.evaluation.status === 'waiting').length,
      warning: rows.filter(row => row.evaluation.status === 'warning').length,
      error: rows.filter(row => row.evaluation.status === 'error').length
    };
  }

  function filteredOverlays() {
    const overlays = busClients();
    if (state.filter === 'all') return overlays;
    if (state.filter === 'problem') return overlays.filter(o => !['online'].includes(String(o.status || '').toLowerCase()));
    return overlays.filter(o => String(o.status || '').toLowerCase() === state.filter);
  }

  function problemCount() {
    const issues = Array.isArray(state.data?.issues) ? state.data.issues.length : 0;
    const counts = sourceCounts();
    return issues + counts.warning + counts.error;
  }

  function renderSummaryCards() {
    const s = state.data?.summary || {};
    const c = state.data?.communication || {};
    const obsOk = obsConnected();
    const counts = sourceCounts();
    const rows = [
      ['Quellen', counts.total, ''],
      ['Sichtbar', counts.visible, counts.visible ? 'ok' : 'muted'],
      ['Wartend', counts.waiting + counts.hidden, 'muted'],
      ['Warnung/Fehler', counts.warning + counts.error, counts.error ? 'bad' : (counts.warning ? 'warn' : 'ok')],
      ['OK Heartbeat', s.withHeartbeat ?? 0, (s.withHeartbeat ?? 0) ? 'ok' : 'warn'],
      ['Ohne Heartbeat', s.registered ?? s.withoutHeartbeat ?? 0, (s.registered ?? s.withoutHeartbeat ?? 0) ? 'warn' : 'ok'],
      ['OBS', obsOk ? 'verbunden' : 'offline', obsOk ? 'ok' : 'warn']
    ];

    return `
      <div class="ovm-summary-grid">
        ${rows.map(([label, value, cls]) => `
          <div class="ovm-summary-card ${cls ? `is-${cls}` : ''}">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="ovm-meta-line">
        <span>Communication Bus: <strong>${c.available ? 'verfügbar' : 'nicht verfügbar'}</strong></span>
        <span>Bus-Clients gesamt: <strong>${esc(c.clientCount ?? 0)}</strong></span>
        <span>OBS-Browserquellen: <strong>${esc(state.obsSources.length)}</strong></span>
        <span>OBS-Szenen: <strong>${esc(state.obsScenes.length)}</strong></span>
        <span>Aktuelle Szene: <strong>${esc(currentProgramSceneName() || '—')}</strong></span>
        <span>Auswahl: <strong>${esc(selectedSceneName() || '—')}</strong></span>
        <span>Letzter Scan: <strong>${esc(fmtDateTime(state.data?.lastScanAt))}</strong></span>
        <span>Console-Logs unterdrückt: <strong>${esc(state.data?.stats?.consoleLogsSuppressed ?? 0)}</strong></span>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = [
      ['overview', 'Übersicht'],
      ['sources', 'Quellenstatus'],
      ['bus', 'Bus-Clients'],
      ['obs', 'OBS-Rohquellen'],
      ['issues', `Probleme${problemCount() ? ` (${problemCount()})` : ''}`],
      ['raw', 'Rohdaten']
    ];
    return `
      <div class="ovm-tabs" role="tablist" aria-label="Overlay-Monitor Bereiche">
        ${tabs.map(([tabKey, label]) => `<button type="button" class="ovm-tab ${state.tab === tabKey ? 'active' : ''}" data-ovm-tab="${esc(tabKey)}">${esc(label)}</button>`).join('')}
      </div>
    `;
  }

  function renderSceneSelector() {
    const current = currentProgramSceneName();
    const selected = selectedSceneName();
    const scenes = state.obsScenes.map(scene => scene.sceneName).filter(Boolean);
    const uniqueScenes = [...new Set(scenes)];
    const auto = state.selectedSceneMode !== 'manual';
    return `
      <section class="ovm-scene-panel">
        <div class="ovm-scene-main">
          <div>
            <span class="ovm-kicker">OBS-Szene</span>
            <strong>${esc(selected || 'Keine Szene erkannt')}</strong>
            <small>Aktuelle Program-Szene: ${esc(current || 'unbekannt')}${auto ? ' · folgt automatisch' : ' · manuell gewählt'}</small>
          </div>
          <label class="ovm-scene-select">
            <span>Szene anzeigen</span>
            <select data-ovm-scene-select>
              <option value="__current__" ${auto ? 'selected' : ''}>Aktuelle Szene automatisch folgen</option>
              ${uniqueScenes.map(scene => `<option value="${esc(scene)}" ${!auto && scene === state.selectedSceneName ? 'selected' : ''}>${esc(scene)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="ovm-scene-hint">Gezeigt werden alle Browser-/Overlayquellen der ausgewählten Szene inklusive eingebundener Unter-Szenen. Sichtbare Quellen stehen oben.</div>
      </section>
    `;
  }

  function renderBusToolbar() {
    const filters = [
      ['all', 'Alle'],
      ['online', 'Online'],
      ['registered', 'Ohne Heartbeat'],
      ['stale', 'Stale'],
      ['offline', 'Offline'],
      ['dead', 'Dead'],
      ['problem', 'Probleme']
    ];
    return `
      <div class="ovm-toolbar">
        <div class="ovm-filters" role="tablist" aria-label="Overlay-Filter">
          ${filters.map(([filterKey, label]) => `<button type="button" class="ovm-filter ${state.filter === filterKey ? 'active' : ''}" data-ovm-filter="${esc(filterKey)}">${esc(label)}</button>`).join('')}
        </div>
        ${renderRefreshActions()}
      </div>
    `;
  }

  function renderSourceToolbar() {
    const filters = [
      ['all', 'Alle'],
      ['visible', 'Sichtbar'],
      ['hidden', 'Ausgeblendet'],
      ['ok', 'OK'],
      ['waiting', 'Wartet'],
      ['problem', 'Warnung/Fehler']
    ];
    return `
      <div class="ovm-toolbar">
        <div class="ovm-filters" role="tablist" aria-label="Quellenstatus-Filter">
          ${filters.map(([filterKey, label]) => `<button type="button" class="ovm-filter ${state.sourceFilter === filterKey ? 'active' : ''}" data-ovm-source-filter="${esc(filterKey)}">${esc(label)}</button>`).join('')}
        </div>
        ${renderRefreshActions()}
      </div>
    `;
  }

  function renderRefreshActions() {
    return `
      <div class="ovm-actions">
        <label class="ovm-toggle"><input type="checkbox" data-ovm-auto ${state.autoRefresh ? 'checked' : ''}> Auto-Refresh</label>
        <button type="button" class="ovm-btn" data-ovm-refresh>Aktualisieren</button>
      </div>
    `;
  }

  function renderOverview() {
    const counts = sourceCounts();
    const obsOk = obsConnected();
    const busOnlineButObsOffline = !obsOk && Number(state.data?.summary?.online || 0) > 0;
    const visibleProblems = buildSourceRows().filter(row => row.visible && ['warning', 'error'].includes(row.evaluation.status));
    return `
      <section class="ovm-card">
        <h3>Gesamtbewertung</h3>
        <div class="ovm-overview-grid">
          <div class="ovm-status-box is-${counts.error ? 'bad' : (counts.warning ? 'warn' : 'ok')}">
            <span>Overlay-Quellen</span>
            <strong>${esc(counts.total)} in Szene</strong>
            <small>${esc(counts.visible)} effektiv sichtbar, ${esc(counts.hidden)} ausgeblendet · ${esc(selectedSceneName() || 'keine Szene')}, ${esc(counts.warning + counts.error)} mit Warnung/Fehler.</small>
          </div>
          <div class="ovm-status-box is-${obsOk ? 'ok' : 'warn'}">
            <span>OBS-Verbindung</span>
            <strong>${obsOk ? 'verbunden' : 'offline / unbekannt'}</strong>
            <small>${esc(state.obsError || state.sceneError || 'OBS-Daten werden nur gelesen.')}</small>
          </div>
          <div class="ovm-status-box is-${visibleProblems.length ? 'warn' : 'ok'}">
            <span>Sichtbare Problemquellen</span>
            <strong>${esc(visibleProblems.length)}</strong>
            <small>${visibleProblems.length ? 'Sichtbare Quellen mit fehlendem/auffälligem Bus-Kontakt.' : 'Keine sichtbare Problemquelle erkannt.'}</small>
          </div>
        </div>
        ${busOnlineButObsOffline ? `<div class="ovm-warning-line">Bus-Clients melden sich aktiv, obwohl OBS offline/unbekannt ist. Das ist kein Beweis für eine laufende OBS-Quelle.</div>` : ''}
      </section>
      <section class="ovm-card">
        <h3>Wichtig für Event-Overlays</h3>
        <div class="ovm-next-grid">
          <div><strong>Ausgeblendet ist nicht kaputt</strong><span>Sound, VIP, Alerts oder Deathcounter können warten, bis ein Event kommt.</span></div>
          <div><strong>Sichtbar + kein Heartbeat</strong><span>Wichtigster Warnfall: Quelle ist in OBS aktiv, aber der Client sendet kein echtes Lebenszeichen.</span></div>
          <div><strong>Reparatur folgt später</strong><span>Cache neu laden und Quelle aus/ein kommt im nächsten Step als manuelle Aktion.</span></div>
        </div>
      </section>
    `;
  }

  function renderSourceCards() {
    const rows = filteredSourceRows();
    if (!rows.length) {
      return `${renderSceneSelector()}<div class="ovm-empty"><strong>Keine passenden OBS-Overlayquellen in dieser Szene gefunden.</strong><span>Prüfe OBS-Verbindung, ausgewählte Szene oder Filter.</span></div>`;
    }
    return `
      ${renderSceneSelector()}
      ${renderSourceToolbar()}
      <div class="ovm-source-grid">
        ${rows.map(row => {
          const ev = row.evaluation;
          const client = row.client;
          const scenes = row.scenes.length ? row.scenes.map(item => `${item.sceneName}${item.enabled ? ' sichtbar' : ' aus'}`).join(' · ') : 'in keiner gelesenen Szene';
          return `
            <article class="ovm-source-card is-${statusClass(ev.status)}">
              <div class="ovm-source-head">
                <div>
                  <strong>${esc(row.name)}</strong>
                  <small>${esc(shortText(row.url, 120))}</small>
                </div>
                <span class="ovm-badge is-${statusClass(ev.status)}">${esc(ev.label)}</span>
              </div>
              <div class="ovm-source-facts">
                <span>OBS: <strong>gefunden</strong></span>
                <span>Sichtbar: ${row.visible ? '<strong>ja</strong>' : '<strong>nein</strong>'}</span>
                <span>Direkt sichtbar: ${row.directVisible ? '<strong>ja</strong>' : '<strong>nein</strong>'}</span>
                <span>Effektiv sichtbar: ${row.effectiveVisible ? '<strong>ja</strong>' : '<strong>nein</strong>'}</span>
                <span>Bus: <strong>${esc(client ? (client.status || 'verbunden') : 'nicht erkannt')}</strong></span>
                <span>Heartbeat: <strong>${esc(client ? heartbeatLabel(client) : '—')}</strong></span>
              </div>
              <div class="ovm-source-detail">
                <span>${esc(ev.detail)}</span>
                <span>Pfad: ${esc(row.pathText || row.selectedScene || '—')}</span>
                <span>Container: ${esc(row.containerPath || '—')}</span>
                <span>Aktive Bewertung: ${row.effectiveVisible ? 'effektiv sichtbar' : 'effektiv ausgeblendet'}</span><span>Alle direkten Szenen: ${esc(scenes)}</span>
                <span>Bus-Client: ${client ? esc(client.id) : '<span class="ovm-muted">—</span>'}</span>
                <span>Letzter Hello: ${client ? esc(fmtTime(client.lastHelloAt)) : '<span class="ovm-muted">—</span>'}</span>
                <span>Letzter Heartbeat: ${client && client.lastHeartbeatAt ? esc(fmtTime(client.lastHeartbeatAt)) : '<span class="ovm-muted">kein echter Heartbeat</span>'}</span>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderBusClients() {
    const overlays = filteredOverlays();
    if (!overlays.length) {
      return `
        <div class="ovm-empty">
          <strong>Keine passenden Overlay-Clients gefunden.</strong>
          <span>Ein Overlay erscheint hier, sobald es sich per Bus als Overlay-Client registriert.</span>
        </div>
      `;
    }

    return `
      ${renderBusToolbar()}
      <div class="ovm-table-wrap">
        <table class="ovm-table">
          <thead>
            <tr>
              <th>Overlay</th>
              <th>Status</th>
              <th>Verbunden</th>
              <th>Hello</th>
              <th>Heartbeat</th>
              <th>Letzter Kontakt</th>
              <th>Modul / Version</th>
              <th>Capabilities</th>
              <th>Grund / Fehler</th>
            </tr>
          </thead>
          <tbody>
            ${overlays.map(overlay => {
              const status = String(overlay.status || 'unknown').toLowerCase();
              const caps = Array.isArray(overlay.capabilities) ? overlay.capabilities : [];
              const reason = overlay.disconnectReason || overlay.lastErrorAt || '';
              return `
                <tr>
                  <td>
                    <strong>${esc(overlay.name || overlay.id || 'Overlay')}</strong>
                    <small>${esc(overlay.id || '—')}</small>
                    <small>Mode: ${esc(overlay.mode || '—')}</small>
                  </td>
                  <td><span class="ovm-badge is-${statusClass(status)}">${esc(status)}</span></td>
                  <td>${overlay.connected ? '<span class="ovm-badge is-ok">ja</span>' : '<span class="ovm-badge is-muted">nein</span>'}</td>
                  <td><strong>${esc(fmtTime(overlay.lastHelloAt))}</strong><small>${esc(fmtAge(overlay.helloAgeSeconds))}</small></td>
                  <td>${overlay.hasHeartbeat ? `<strong>${esc(fmtTime(overlay.lastHeartbeatAt))}</strong><small>${esc(fmtAge(overlay.heartbeatAgeSeconds))} · ${esc(overlay.heartbeatCount || 0)}x</small>` : '<span class="ovm-badge is-warn">Warnung · kein Heartbeat</span>'}</td>
                  <td>${esc(fmtDateTime(lastContact(overlay)))}</td>
                  <td><strong>${esc(overlay.module || '—')}</strong><small>${esc(overlay.version || '—')}</small></td>
                  <td>${caps.length ? caps.map(cap => `<span class="ovm-chip">${esc(cap)}</span>`).join('') : '<span class="ovm-muted">—</span>'}</td>
                  <td>${reason ? esc(reason) : '<span class="ovm-muted">—</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderObsSources() {
    const obsOk = obsConnected();
    if (state.obsError && !state.obsSources.length) {
      return `<div class="ovm-error">OBS-Browserquellen konnten nicht gelesen werden: ${esc(state.obsError)}</div>`;
    }
    if (!state.obsSources.length) {
      return `
        <div class="ovm-empty">
          <strong>Keine OBS-Browserquellen gefunden.</strong>
          <span>${obsOk ? 'OBS ist erreichbar, liefert aber keine Browserquellen.' : 'OBS ist offline oder der OBS-Status ist unbekannt.'}</span>
        </div>
      `;
    }

    return `
      <section class="ovm-card">
        <h3>OBS-Rohquellen</h3>
        <p class="ovm-muted">Read-only: Browserquellen aus OBS inklusive URL/Datei. Sichtbarkeit steht im Tab Quellenstatus.</p>
      </section>
      <div class="ovm-table-wrap">
        <table class="ovm-table">
          <thead>
            <tr>
              <th>Quelle</th>
              <th>Typ</th>
              <th>URL / Datei</th>
              <th>Größe</th>
              <th>FPS</th>
            </tr>
          </thead>
          <tbody>
            ${state.obsSources.map(src => {
              const name = sourceName(src);
              const kind = clean(src.inputKind || src.unversionedInputKind || src.kind || 'browser_source');
              const url = sourceUrl(src);
              const local = src.is_local_file === true || !!src.local_file;
              return `
                <tr>
                  <td><strong>${esc(name)}</strong></td>
                  <td><span class="ovm-badge is-muted">${esc(kind)}</span></td>
                  <td><span title="${esc(url)}">${esc(shortText(url, 120))}</span><small>${local ? 'lokale Datei' : 'URL'}</small></td>
                  <td>${esc(src.width || '—')} × ${esc(src.height || '—')}</td>
                  <td>${esc(src.fps || '—')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderIssues() {
    const issues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    const sourceProblems = buildSourceRows().filter(row => ['warning', 'error'].includes(row.evaluation.status));
    if (!issues.length && !sourceProblems.length) return '<div class="ovm-ok-note">Keine Overlay-Probleme gemeldet.</div>';
    return `
      <div class="ovm-issues">
        ${sourceProblems.map(row => `
          <div class="ovm-issue is-${row.evaluation.status === 'warning' ? 'warn' : 'bad'}">
            <div>
              <strong>${esc(row.name)}</strong>
              <span>${esc(row.evaluation.label)} – ${esc(row.evaluation.detail)}</span>
            </div>
            <span class="ovm-badge is-${row.evaluation.status === 'warning' ? 'warn' : 'bad'}">Quelle</span>
          </div>
        `).join('')}
        ${issues.map(issue => `
          <div class="ovm-issue is-${issue.level === 'warn' ? 'warn' : 'bad'}">
            <div>
              <strong>${esc(issue.overlayId || issue.key || 'Overlay')}</strong>
              <span>${esc(issue.message || issue.status || 'Problem')}</span>
            </div>
            <span class="ovm-badge is-${issue.level === 'warn' ? 'warn' : 'bad'}">${esc(issue.status || issue.level || 'problem')}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRaw() {
    const raw = {
      overlayMonitor: state.data,
      obsStatus: state.obsStatus,
      obsSources: state.obsSources,
      obsScenes: state.obsScenes,
      obsSceneItems: state.obsSceneItems,
      obsError: state.obsError,
      sceneError: state.sceneError,
      evaluatedSources: buildSourceRows()
    };
    return `
      <section class="ovm-card">
        <h3>Rohdaten</h3>
        <p class="ovm-muted">Nur zur Diagnose.</p>
        <pre class="ovm-raw">${esc(JSON.stringify(raw, null, 2))}</pre>
      </section>
    `;
  }

  function renderTabContent() {
    if (state.tab === 'sources') return renderSourceCards();
    if (state.tab === 'bus') return renderBusClients();
    if (state.tab === 'obs') return renderObsSources();
    if (state.tab === 'issues') return `<section class="ovm-card"><h3>Aktuelle Hinweise</h3>${renderIssues()}</section>`;
    if (state.tab === 'raw') return renderRaw();
    return renderOverview();
  }

  function render() {
    const root = panel();
    if (!root) return;

    if (state.loading && !state.data) {
      root.innerHTML = '<div class="ovm-shell"><div class="ovm-card">Overlay-Monitor wird geladen…</div></div>';
      return;
    }

    if (state.error && !state.data) {
      root.innerHTML = `
        <div class="ovm-shell">
          <div class="ovm-head"><div><span class="ovm-kicker">Control / Overlays</span><h2>Overlay-Monitor</h2></div><button class="ovm-btn" data-ovm-refresh>Erneut laden</button></div>
          <div class="ovm-error">${esc(state.error)}</div>
        </div>
      `;
      bind(root);
      return;
    }

    root.innerHTML = `
      <div class="ovm-shell">
        <div class="ovm-head">
          <div>
            <span class="ovm-kicker">Control / Overlays</span>
            <h2>Overlay-Monitor</h2>
            <p>Read-only Quellenstatus: OBS-Sichtbarkeit, Browserquelle, Bus-Anmeldung und echter Heartbeat werden getrennt bewertet. Reparaturaktionen folgen im nächsten Step.</p>
          </div>
          <div class="ovm-head-meta">
            <span>Stand: ${esc(fmtDateTime(state.lastLoadedAt || state.data?.fetchedAt))}</span>
            ${state.error ? `<span class="ovm-warn-text">Monitor-Fehler: ${esc(state.error)}</span>` : ''}
            ${state.obsError ? `<span class="ovm-warn-text">OBS-Hinweis: ${esc(state.obsError)}</span>` : ''}
            ${state.sceneError ? `<span class="ovm-warn-text">Szenen-Hinweis: ${esc(state.sceneError)}</span>` : ''}
          </div>
        </div>
        ${renderSummaryCards()}
        ${renderTabs()}
        ${renderTabContent()}
      </div>
    `;
    bind(root);
  }

  function bind(root) {
    root.querySelectorAll('[data-ovm-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tab = btn.dataset.ovmTab || 'overview';
        render();
      });
    });
    root.querySelectorAll('[data-ovm-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.ovmFilter || 'all';
        render();
      });
    });
    root.querySelectorAll('[data-ovm-source-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.sourceFilter = btn.dataset.ovmSourceFilter || 'all';
        render();
      });
    });
    root.querySelector('[data-ovm-scene-select]')?.addEventListener('change', event => {
      const value = event.target.value || '__current__';
      if (value === '__current__') {
        state.selectedSceneMode = 'current';
        state.selectedSceneName = currentProgramSceneName();
      } else {
        state.selectedSceneMode = 'manual';
        state.selectedSceneName = value;
      }
      render();
    });
    root.querySelector('[data-ovm-refresh]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-ovm-auto]')?.addEventListener('change', event => {
      state.autoRefresh = !!event.target.checked;
      setupTimer();
    });
  }

  async function loadAll(force = false) {
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    state.obsError = '';
    state.sceneError = '';
    render();
    try {
      const [monitorResult, obsStatusResult, obsSourcesResult] = await Promise.allSettled([
        api(API_STATUS),
        api(API_OBS_STATUS),
        api(API_OBS_BROWSER_SOURCES)
      ]);

      if (monitorResult.status === 'fulfilled') {
        state.data = monitorResult.value;
      } else {
        state.error = monitorResult.reason?.message || String(monitorResult.reason || 'Overlay-Monitor konnte nicht geladen werden.');
      }

      if (obsStatusResult.status === 'fulfilled') {
        state.obsStatus = obsStatusResult.value;
      } else {
        state.obsStatus = null;
        state.obsError = obsStatusResult.reason?.message || String(obsStatusResult.reason || 'OBS-Status konnte nicht geladen werden.');
      }

      if (obsSourcesResult.status === 'fulfilled') {
        state.obsSources = normalizeObsSources(obsSourcesResult.value);
      } else {
        state.obsSources = [];
        state.obsError = state.obsError || obsSourcesResult.reason?.message || String(obsSourcesResult.reason || 'OBS-Browserquellen konnten nicht geladen werden.');
      }

      if (obsConnected()) await loadObsSceneItems();
      else {
        state.obsScenes = [];
        state.obsSceneItems = [];
      }

      state.lastLoadedAt = new Date().toISOString();
    } catch (err) {
      state.error = err?.message || String(err || 'Overlay-Monitor konnte nicht geladen werden.');
    } finally {
      state.loading = false;
      render();
    }
  }

  function setupTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    if (!state.autoRefresh) return;
    state.timer = setInterval(() => {
      if (window.CGN?.activeModule === 'overlays') loadAll(false);
    }, AUTO_REFRESH_MS);
  }

  window.addEventListener('cgn:module-show', event => {
    if (event?.detail?.module === 'overlays') {
      loadAll(true);
      setupTimer();
    }
  });

  window.OverlaysModule = { loadAll, render };
  setupTimer();
})();
