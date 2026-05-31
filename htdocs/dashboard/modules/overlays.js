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
    issueLog: null,
    issueLogError: '',
    obsInventory: null,
    obsInventoryError: '',
    error: '',
    filter: 'all',
    sourceFilter: 'all',
    selectedOverlayKey: '',
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
  const API_ISSUES = '/api/overlay-monitor/issues?status=all&limit=150';
  const API_OBS_INVENTORY = '/api/overlay-monitor/obs-inventory';
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
    if (s === 'online' || s === 'ok' || s === 'connected' || s === 'ready' || s === 'external') return 'ok';
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

  function sourceHost(url) {
    const value = clean(url);
    if (!value) return '';
    try {
      const parsed = new URL(value, window.location.origin);
      return clean(parsed.hostname).toLowerCase();
    } catch (_) {
      return '';
    }
  }

  function isLocalOverlayUrl(url, src = {}) {
    const value = clean(url);
    if (!value) return false;
    if (src && (src.is_local_file === true || src.local_file)) return true;
    if (value.startsWith('/overlays/') || value.startsWith('overlays/')) return true;
    const host = sourceHost(value);
    if (!host) return false;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  function isExternalBrowserSource(src) {
    const url = sourceUrl(src);
    if (!url) return false;
    if (isPlaceholderBrowserSource(src)) return false;
    if (isLocalOverlayUrl(url, src)) return false;
    const host = sourceHost(url);
    return !!host;
  }

  function isPlaceholderBrowserSource(src) {
    const url = sourceUrl(src).toLowerCase();
    if (!url) return true;
    return url === 'about:blank' || url === 'about:srcdoc' || url === 'blank';
  }

  function sourceName(src) {
    return clean(src.inputName || src.sourceName || src.name || src.id || 'OBS Browser Source');
  }

  function overlayDisplayNameFromText(value, fallback = 'Overlay') {
    const raw = clean(value);
    const normalized = key(raw);
    const known = [
      ['vipsound', 'VIP Sound Overlay'],
      ['vipoverlay', 'VIP Sound Overlay'],
      ['vip', 'VIP Sound Overlay'],
      ['alertsv2', 'Alerts V2'],
      ['alertoverlayv2', 'Alerts V2'],
      ['alert', 'Alerts V2'],
      ['soundsystemoverlay', 'Sound-System Overlay'],
      ['soundoverlay', 'Sound-System Overlay'],
      ['soundsystem', 'Sound-System Overlay'],
      ['tts', 'TTS Overlay'],
      ['deathcounterv2', 'Deathcounter V2'],
      ['deathcounter', 'Deathcounter V2'],
      ['challengestatus', 'Challenge Status'],
      ['challenge', 'Challenge Status'],
      ['firework', 'Firework Overlay'],
      ['fireworks', 'Firework Overlay'],
      ['rahmen', 'Rahmen Overlay'],
      ['frameoverlay', 'Rahmen Overlay'],
      ['birthday', 'Birthday Overlay'],
      ['geburtstag', 'Birthday Overlay'],
      ['eastereggwinner', 'Easteregg Winner Overlay'],
      ['easteregg', 'Easteregg Winner Overlay'],
      ['clipshoutout', 'Clip-Shoutout Platzhalter'],
      ['clipplayer', 'Clip-Player Overlay'],
      ['mediaplayer', 'Media-Player Overlay'],
      ['megashoutout', 'Mega-Shoutout Overlay'],
      ['eventbustest', 'EventBus Test Overlay']
    ];
    for (const [needle, label] of known) {
      if (normalized.includes(needle)) return label;
    }
    if (!raw) return fallback;
    return raw
      .replace(/^overlay[:_-]?/i, '')
      .replace(/^_+/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\.html?$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase()) || fallback;
  }

  function overlayFileNameFromUrl(url) {
    const base = basename(url);
    return base && base !== url ? base : (base || '—');
  }

  function overlayFriendlyName(rowOrClient) {
    if (!rowOrClient) return 'Overlay';
    if (rowOrClient.external) return overlayDisplayNameFromText(rowOrClient.name || rowOrClient.url, rowOrClient.name || 'Externe Browserquelle');
    const parts = [rowOrClient.name, rowOrClient.url, rowOrClient.client?.name, rowOrClient.client?.id, rowOrClient.client?.module].filter(Boolean).join(' ');
    return overlayDisplayNameFromText(parts, rowOrClient.name || rowOrClient.client?.name || rowOrClient.client?.id || 'CGN Overlay');
  }

  function overlayKeyForEntry(entry) {
    return key([entry.type, entry.name, entry.obsSourceName, entry.busClientId, entry.fileName, entry.url].filter(Boolean).join('|'));
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

    const aliases = [
      ['rahmen', 'rahmen'],
      ['rahmen', 'frameoverlay'],
      ['rahmen', 'frame'],
      ['overlaybirthday', 'birthday'],
      ['overlaybirthday', 'geburtstag'],
      ['birthday', 'birthday'],
      ['birthday', 'geburtstag'],
      ['eastereggwinner', 'easteregg'],
      ['eastereggwinner', 'winner'],
      ['clipshoutout', 'clip']
    ];
    for (const [sourceToken, clientToken] of aliases) {
      if (hay.includes(sourceToken) && (clientId.includes(clientToken) || module.includes(clientToken) || clientName.includes(clientToken))) score += 80;
    }

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
      ['rahmen', 'rahmen'],
      ['rahmen', 'frame'],
      ['frame', 'rahmen'],
      ['frame', 'frame'],
      ['birthday', 'birthday'],
      ['birthday', 'geburtstag'],
      ['geburtstag', 'birthday'],
      ['clip', 'clip'],
      ['easteregg', 'easteregg'],
      ['start', 'start'],
      ['end', 'end']
    ];

    for (const [sourceToken, clientToken] of loose) {
      if (hay.includes(sourceToken) && (clientId.includes(clientToken) || module.includes(clientToken) || clientName.includes(clientToken))) score += 18;
    }

    return score;
  }

  function forcedClientTokenForSource(src, pathText = '') {
    const srcName = sourceName(src);
    const url = sourceUrl(src);
    const base = basename(url);
    const hay = [srcName, url, base, pathText].map(key).filter(Boolean).join('|');

    if (hay.includes('rahmen') || hay.includes('frameoverlay')) {
      return ['frameoverlay', 'rahmenoverlay'];
    }

    if (hay.includes('overlaybirthday') || hay.includes('birthday') || hay.includes('geburtstag')) {
      return ['birthdayoverlay', 'birthday', 'geburtstag'];
    }

    return [];
  }

  function clientMatchesForcedToken(client, token) {
    const clientText = [client?.id, client?.module, client?.name].map(key).filter(Boolean).join('|');
    return token && clientText.includes(token);
  }

  function findClientForSource(src, pathText = '') {
    const clients = busClients();
    const forcedTokens = forcedClientTokenForSource(src, pathText);

    for (const token of forcedTokens) {
      const forced = clients.find(client => clientMatchesForcedToken(client, token));
      if (forced) return { client: forced, score: 250 };
    }

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
    const external = row.external === true;
    const placeholder = row.placeholder === true;

    if (!obsOk) return { status: 'warning', label: 'OBS offline/unbekannt', detail: 'OBS liefert keine sichere Laufzeitbewertung.' };
    if (!row.inSelectedScene) return { status: 'warning', label: 'Nicht in Szene', detail: 'Browserquelle wurde nicht in der ausgewählten Szene oder ihren Unter-Szenen gefunden.' };

    if (placeholder) {
      if (visible) return { status: 'waiting', label: 'Platzhalter sichtbar', detail: 'OBS-Browserquelle ist about:blank/leer. Kein CGN-EventBus-Heartbeat erwartet.' };
      return { status: 'waiting', label: 'Platzhalter', detail: 'Leere OBS-Browserquelle / Platzhalter. Kein CGN-EventBus-Heartbeat erwartet.' };
    }

    if (external) {
      if (visible) return { status: 'external', label: 'Extern sichtbar', detail: 'Externe Browserquelle: kein CGN-EventBus-Heartbeat erwartet.' };
      return { status: 'waiting', label: 'Extern ausgeblendet', detail: 'Externe Browserquelle ist effektiv ausgeblendet. Kein CGN-EventBus-Heartbeat erwartet.' };
    }

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
          const placeholder = isPlaceholderBrowserSource(src);
          const external = isExternalBrowserSource(src);
          const match = (external || placeholder) ? { client: null, score: 0 } : findClientForSource(src, pathText);
          const row = {
            raw: src,
            name: sourceName(src),
            kind: clean(src.inputKind || src.unversionedInputKind || src.kind || 'browser_source'),
            url: sourceUrl(src),
            local: src.is_local_file === true || !!src.local_file,
            external,
            placeholder,
            busExpected: !(external || placeholder),
            sourceRole: placeholder ? 'placeholder_browser_source' : (external ? 'external_browser_source' : 'cgn_overlay_source'),
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
      const placeholder = isPlaceholderBrowserSource(src);
      const external = isExternalBrowserSource(src);
      const match = (external || placeholder) ? { client: null, score: 0 } : findClientForSource(src, '');
      const row = {
        raw: src,
        name: sourceName(src),
        kind: clean(src.inputKind || src.unversionedInputKind || src.kind || 'browser_source'),
        url: sourceUrl(src),
        local: src.is_local_file === true || !!src.local_file,
        external,
        placeholder,
        busExpected: !(external || placeholder),
        sourceRole: placeholder ? 'placeholder_browser_source' : (external ? 'external_browser_source' : 'cgn_overlay_source'),
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
    if (state.sourceFilter === 'external') return rows.filter(row => row.external === true);
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
      error: rows.filter(row => row.evaluation.status === 'error').length,
      external: rows.filter(row => row.external === true).length
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
    const persistedActive = Number(state.issueLog?.summary?.active || 0);
    const counts = sourceCounts();
    return issues + persistedActive + counts.warning + counts.error;
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
      ['Extern', counts.external, counts.external ? 'ok' : 'muted'],
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
        <span>Monitoring-Issues: <strong>${esc(state.issueLog?.summary?.active ?? 0)} aktiv / ${esc(state.issueLog?.summary?.resolved ?? 0)} erledigt</strong></span>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = [
      ['overview', 'Übersicht'],
      ['sources', 'Quellenstatus'],
      ['details', 'Overlay-Details'],
      ['inventory', 'OBS-Inventar'],
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
      ['external', 'Extern'],
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
            <small>${esc(counts.visible)} effektiv sichtbar, ${esc(counts.hidden)} ausgeblendet, ${esc(counts.external)} extern · ${esc(selectedSceneName() || 'keine Szene')}, ${esc(counts.warning + counts.error)} mit Warnung/Fehler.</small>
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
          <div><strong>Externe Quellen</strong><span>SoundAlerts, StreamStickers oder ViewerAttack erwarten keinen CGN-Bus-Heartbeat.</span></div>
          <div><strong>Sichtbar + kein Heartbeat</strong><span>Wichtigster Warnfall: lokale CGN-Quelle ist in OBS aktiv, aber der Client sendet kein echtes Lebenszeichen.</span></div>
          <div><strong>Reparatur folgt später</strong><span>Cache neu laden und Quelle aus/ein kommt im nächsten Step als manuelle Aktion.</span></div>
        </div>
      </section>
    `;
  }

  function sourceTitle(row) {
    if (!row) return 'Overlay-Quelle';
    return overlayFriendlyName(row);
  }

  function sourceStatusText(row) {
    if (!row || !row.evaluation) return 'Unbekannt';
    if (row.placeholder) return row.effectiveVisible ? 'Platzhalter sichtbar' : 'Platzhalter';
    if (row.external) return row.effectiveVisible ? 'Extern sichtbar' : 'Extern ausgeblendet';
    if (row.evaluation.status === 'ok') return row.effectiveVisible ? 'Sichtbar + Heartbeat' : 'Bereit / ausgeblendet';
    if (row.evaluation.status === 'waiting') return 'Wartet';
    if (row.evaluation.status === 'warning') return 'Warnung';
    if (row.evaluation.status === 'error') return 'Fehler';
    return row.evaluation.label || row.evaluation.status || 'Unbekannt';
  }

  function sourceCardBadges(row) {
    const badges = [];
    badges.push(`<span class="ovm-mini-badge ${row.effectiveVisible ? 'is-ok' : 'is-muted'}">${row.effectiveVisible ? 'sichtbar' : 'aus'}</span>`);
    if (row.placeholder) {
      badges.push('<span class="ovm-mini-badge is-muted">Platzhalter</span>');
    } else if (row.external) {
      badges.push('<span class="ovm-mini-badge is-muted">extern</span>');
    } else if (row.client) {
      const hbOk = row.client.hasHeartbeat === true || !!row.client.lastHeartbeatAt;
      badges.push(`<span class="ovm-mini-badge ${hbOk ? 'is-ok' : 'is-warn'}">${hbOk ? 'Heartbeat' : 'kein HB'}</span>`);
    } else {
      badges.push('<span class="ovm-mini-badge is-warn">kein Bus</span>');
    }
    if (row.nested) badges.push('<span class="ovm-mini-badge is-muted">verschachtelt</span>');
    return badges.join('');
  }

  function renderSourceCards() {
    const rows = filteredSourceRows();
    if (!rows.length) {
      return `${renderSceneSelector()}<div class="ovm-empty"><strong>Keine passenden OBS-Overlayquellen in dieser Szene gefunden.</strong><span>Prüfe OBS-Verbindung, ausgewählte Szene oder Filter.</span></div>`;
    }
    return `
      ${renderSceneSelector()}
      ${renderSourceToolbar()}
      <div class="ovm-source-list">
        ${rows.map(row => {
          const ev = row.evaluation || {};
          const client = row.client;
          const status = sourceStatusText(row);
          const scenes = row.scenes.length ? row.scenes.map(item => `${item.sceneName}${item.enabled ? ' sichtbar' : ' aus'}`).join(' · ') : 'in keiner gelesenen Szene';
          const hbText = (row.external || row.placeholder) ? 'nicht erwartet' : (client ? heartbeatLabel(client) : 'kein Bus-Client');
          return `
            <article class="ovm-source-row is-${statusClass(ev.status)}">
              <div class="ovm-source-row-main">
                <div class="ovm-source-title-block">
                  <div class="ovm-source-title-line">
                    <strong>${esc(sourceTitle(row))}</strong>
                    <span class="ovm-badge is-${statusClass(ev.status)}">${esc(status)}</span>
                  </div>
                  <div class="ovm-source-subline">${esc(shortText(row.url, 95))}</div>
                  <div class="ovm-source-badges">${sourceCardBadges(row)}</div>
                </div>
                <div class="ovm-source-quick">
                  <span><b>OBS</b>${row.effectiveVisible ? 'sichtbar' : 'aus'}</span>
                  <span><b>Bus</b>${row.placeholder ? 'Platzhalter' : (row.external ? 'extern' : (client ? (client.status || 'online') : 'fehlt'))}</span>
                  <span><b>HB</b>${(row.external || row.placeholder) ? '—' : (client && client.lastHeartbeatAt ? fmtAge(client.heartbeatAgeSeconds ?? client.ageSeconds) : 'fehlt')}</span>
                </div>
              </div>
              <details class="ovm-source-more">
                <summary>Details anzeigen</summary>
                <div class="ovm-source-detail compact">
                  <span>${esc(ev.detail || '')}</span>
                  <span>Pfad: ${esc(row.pathText || row.selectedScene || '—')}</span>
                  <span>Container: ${esc(row.containerPath || '—')}</span>
                  <span>Direkt sichtbar: ${row.directVisible ? 'ja' : 'nein'} · Effektiv sichtbar: ${row.effectiveVisible ? 'ja' : 'nein'}</span>
                  <span>Alle direkten Szenen: ${esc(scenes)}</span>
                  <span>Bus-Client: ${row.placeholder ? 'Platzhalter / keiner erwartet' : (row.external ? 'externe Quelle' : (client ? esc(client.id) : '—'))}</span>
                  <span>Heartbeat: ${esc(hbText)}</span>
                  <span>Letzter Hello: ${(row.external || row.placeholder) ? 'nicht erwartet' : (client ? esc(fmtTime(client.lastHelloAt)) : '—')}</span>
                  <span>Letzter Heartbeat: ${(row.external || row.placeholder) ? 'nicht erwartet' : (client && client.lastHeartbeatAt ? esc(fmtTime(client.lastHeartbeatAt)) : 'kein echter Heartbeat')}</span>
                </div>
              </details>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function buildOverlayDetailEntries() {
    const rows = buildSourceRows();
    const entries = [];
    const usedClientIds = new Set();

    for (const row of rows) {
      const client = row.client || null;
      if (client && client.id) usedClientIds.add(client.id);
      const entry = {
        type: row.placeholder ? 'placeholder' : (row.external ? 'external' : 'cgn'),
        name: overlayFriendlyName(row),
        obsSourceName: row.name,
        fileName: overlayFileNameFromUrl(row.url),
        url: row.url,
        pathText: row.pathText || '',
        containerPath: row.containerPath || '',
        sceneName: row.selectedScene || row.sceneName || '',
        directVisible: row.directVisible === true,
        effectiveVisible: row.effectiveVisible === true,
        external: row.external === true,
        placeholder: row.placeholder === true,
        busExpected: row.busExpected === true,
        busClientId: client ? clean(client.id) : '',
        busClientName: client ? clean(client.name) : '',
        module: client ? clean(client.module) : '',
        mode: client ? clean(client.mode) : '',
        version: client ? clean(client.version) : '',
        connected: client ? client.connected === true : false,
        hasHeartbeat: client ? (client.hasHeartbeat === true || !!client.lastHeartbeatAt) : false,
        lastHelloAt: client ? clean(client.lastHelloAt) : '',
        lastHeartbeatAt: client ? clean(client.lastHeartbeatAt) : '',
        heartbeatAgeSeconds: client ? client.heartbeatAgeSeconds : null,
        heartbeatCount: client ? client.heartbeatCount : 0,
        capabilities: client && Array.isArray(client.capabilities) ? client.capabilities : [],
        evaluation: row.evaluation || { status: 'unknown', label: 'Unbekannt', detail: '' },
        matchScore: row.matchScore || 0,
        sourceRow: row
      };
      entry.key = overlayKeyForEntry(entry);
      entries.push(entry);
    }

    for (const client of busClients()) {
      if (!client || !client.id || usedClientIds.has(client.id)) continue;
      const entry = {
        type: 'bus_only',
        name: overlayDisplayNameFromText([client.name, client.id, client.module].filter(Boolean).join(' '), client.name || client.id || 'Bus-Client'),
        obsSourceName: '',
        fileName: '—',
        url: '',
        pathText: '',
        containerPath: '',
        sceneName: '',
        directVisible: false,
        effectiveVisible: false,
        external: false,
        busExpected: true,
        busClientId: clean(client.id),
        busClientName: clean(client.name),
        module: clean(client.module),
        mode: clean(client.mode),
        version: clean(client.version),
        connected: client.connected === true,
        hasHeartbeat: client.hasHeartbeat === true || !!client.lastHeartbeatAt,
        lastHelloAt: clean(client.lastHelloAt),
        lastHeartbeatAt: clean(client.lastHeartbeatAt),
        heartbeatAgeSeconds: client.heartbeatAgeSeconds,
        heartbeatCount: client.heartbeatCount || 0,
        capabilities: Array.isArray(client.capabilities) ? client.capabilities : [],
        evaluation: client.connected === true
          ? (client.hasHeartbeat || client.lastHeartbeatAt ? { status: 'ok', label: 'Bus-Client aktiv', detail: 'Der Client sendet Heartbeats, ist aber keiner OBS-Quelle zugeordnet.' } : { status: 'warning', label: 'Bus-Client ohne Heartbeat', detail: 'Der Client ist angemeldet, aber keiner OBS-Quelle zugeordnet oder sendet keinen echten Heartbeat.' })
          : { status: 'waiting', label: 'Bus-Client offline', detail: 'Der Client ist aktuell nicht verbunden.' },
        matchScore: 0,
        sourceRow: null
      };
      entry.key = overlayKeyForEntry(entry);
      entries.push(entry);
    }

    return entries.sort((a, b) => {
      const rank = value => value.effectiveVisible ? 0 : value.external ? 2 : value.busClientId ? 1 : 3;
      const r = rank(a) - rank(b);
      if (r) return r;
      return a.name.localeCompare(b.name);
    });
  }

  function issueMatchesEntry(issue, entry) {
    const hay = key([issue.issueKey, issue.targetName, issue.message, issue.resolvedMessage, JSON.stringify(issue.details || {})].filter(Boolean).join('|'));
    const tokens = [entry.obsSourceName, entry.busClientId, entry.fileName, entry.name, entry.module].map(key).filter(Boolean);
    return tokens.some(token => token && hay.includes(token));
  }

  function selectedOverlayEntry(entries) {
    if (!entries.length) return null;
    const wanted = state.selectedOverlayKey;
    const found = wanted ? entries.find(entry => entry.key === wanted) : null;
    return found || entries[0];
  }

  function renderOverlayDetails() {
    const entries = buildOverlayDetailEntries();
    if (!entries.length) {
      return `<div class="ovm-empty"><strong>Keine Overlay-Details verfügbar.</strong><span>Es wurden weder OBS-Browserquellen noch Bus-Overlay-Clients erkannt.</span></div>`;
    }
    const selected = selectedOverlayEntry(entries);
    if (selected && state.selectedOverlayKey !== selected.key) state.selectedOverlayKey = selected.key;
    const storedIssues = Array.isArray(state.issueLog?.issues) ? state.issueLog.issues : [];
    const relatedIssues = selected ? storedIssues.filter(issue => issueMatchesEntry(issue, selected)) : [];
    const activeIssues = relatedIssues.filter(issue => clean(issue.status).toLowerCase() === 'active');
    const resolvedIssues = relatedIssues.filter(issue => clean(issue.status).toLowerCase() === 'resolved');
    const ev = selected.evaluation || {};
    return `
      <div class="ovm-detail-layout">
        <aside class="ovm-detail-list" aria-label="Overlay-Auswahl">
          ${entries.map(entry => {
            const selectedClass = selected && selected.key === entry.key ? 'active' : '';
            const evStatus = entry.evaluation?.status || 'unknown';
            return `
              <button type="button" class="ovm-detail-item ${selectedClass}" data-ovm-overlay-key="${esc(entry.key)}">
                <strong>${esc(entry.name)}</strong>
                <span>${esc(entry.obsSourceName || entry.busClientId || entry.fileName || '—')}</span>
                <small>${esc(entry.fileName || '—')}</small>
                <em class="ovm-dot is-${statusClass(evStatus)}"></em>
              </button>
            `;
          }).join('')}
        </aside>
        <section class="ovm-detail-panel">
          <div class="ovm-detail-head">
            <div>
              <span class="ovm-kicker">Overlay-Details</span>
              <h3>${esc(selected.name)}</h3>
              <p>${esc(ev.label || 'Status unbekannt')} · ${esc(ev.detail || '')}</p>
            </div>
            <span class="ovm-badge is-${statusClass(ev.status)}">${esc(ev.label || ev.status || 'unbekannt')}</span>
          </div>
          <div class="ovm-detail-grid">
            <div><span>Anzeigename</span><strong>${esc(selected.name)}</strong></div>
            <div><span>OBS-Quelle</span><strong>${esc(selected.obsSourceName || '—')}</strong></div>
            <div><span>Dateiname</span><strong>${esc(selected.fileName || '—')}</strong></div>
            <div><span>Typ</span><strong>${selected.external ? 'Externe Quelle' : selected.type === 'bus_only' ? 'Nur Bus-Client' : 'CGN Overlay'}</strong></div>
            <div><span>Szene/Pfad</span><strong>${esc(selected.pathText || selected.sceneName || '—')}</strong></div>
            <div><span>Container</span><strong>${esc(selected.containerPath || '—')}</strong></div>
            <div><span>Direkt sichtbar</span><strong>${selected.directVisible ? 'ja' : 'nein'}</strong></div>
            <div><span>Effektiv sichtbar</span><strong>${selected.effectiveVisible ? 'ja' : 'nein'}</strong></div>
            <div><span>Bus-Client</span><strong>${selected.external ? 'nicht erwartet' : esc(selected.busClientId || '—')}</strong></div>
            <div><span>Modul</span><strong>${esc(selected.module || '—')}</strong></div>
            <div><span>Mode / Version</span><strong>${esc([selected.mode, selected.version].filter(Boolean).join(' / ') || '—')}</strong></div>
            <div><span>Verbunden</span><strong>${selected.external ? 'extern' : (selected.connected ? 'ja' : 'nein')}</strong></div>
            <div><span>Letzter Hello</span><strong>${selected.external ? 'nicht erwartet' : esc(fmtDateTime(selected.lastHelloAt))}</strong></div>
            <div><span>Letzter Heartbeat</span><strong>${selected.external ? 'nicht erwartet' : (selected.lastHeartbeatAt ? `${esc(fmtDateTime(selected.lastHeartbeatAt))} · ${esc(fmtAge(selected.heartbeatAgeSeconds))}` : 'kein Heartbeat')}</strong></div>
            <div><span>Heartbeat-Zähler</span><strong>${selected.external ? '—' : esc(selected.heartbeatCount || 0)}</strong></div>
            <div><span>Match-Score</span><strong>${selected.external ? 'extern' : esc(selected.matchScore || 0)}</strong></div>
          </div>
          <section class="ovm-card compact">
            <h3>URL / Datei</h3>
            <code class="ovm-inline-code">${esc(selected.url || '—')}</code>
          </section>
          <section class="ovm-card compact">
            <h3>Capabilities</h3>
            ${selected.capabilities.length ? `<div>${selected.capabilities.map(cap => `<span class="ovm-chip">${esc(cap)}</span>`).join('')}</div>` : '<span class="ovm-muted">Keine Capabilities gemeldet.</span>'}
          </section>
          <section class="ovm-card compact">
            <h3>Monitoring-Issues zu diesem Overlay</h3>
            ${activeIssues.length ? `<h4>Aktiv</h4><div class="ovm-issues">${activeIssues.map(renderStoredIssue).join('')}</div>` : '<div class="ovm-ok-note">Keine aktiven Issues für dieses Overlay.</div>'}
            ${resolvedIssues.length ? `<h4>Erledigt</h4><div class="ovm-issues">${resolvedIssues.slice(0, 10).map(renderStoredIssue).join('')}</div>` : '<div class="ovm-muted">Keine erledigten Issues für dieses Overlay.</div>'}
          </section>
        </section>
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

  function issueSeverityClass(value) {
    const s = clean(value).toLowerCase();
    if (s === 'error' || s === 'bad') return 'bad';
    if (s === 'warn' || s === 'warning') return 'warn';
    return 'muted';
  }

  function renderStoredIssue(issue) {
    const active = clean(issue.status).toLowerCase() === 'active';
    const sev = issueSeverityClass(issue.severity);
    const details = issue.details && typeof issue.details === 'object' ? issue.details : {};
    const durationText = active
      ? `aktiv seit ${fmtDateTime(issue.firstSeenAt)}`
      : `erledigt ${fmtDateTime(issue.resolvedAt)}`;
    return `
      <div class="ovm-issue is-${active ? sev : 'muted'}">
        <div>
          <strong>${esc(issue.targetName || issue.issueKey || 'Monitoring-Issue')}</strong>
          <span>${esc(active ? issue.message : (issue.resolvedMessage || issue.message || 'Problem erledigt'))}</span>
          <small class="ovm-issue-meta">
            ${esc(durationText)} · zuletzt gesehen ${esc(fmtDateTime(issue.lastSeenAt))} · ${esc(issue.seenCount || 0)}x
            ${details.status ? ` · Status ${esc(details.status)}` : ''}
          </small>
        </div>
        <span class="ovm-badge is-${active ? sev : 'muted'}">${esc(active ? issue.severity : 'resolved')}</span>
      </div>
    `;
  }

  function renderIssues() {
    const runtimeIssues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    const sourceProblems = buildSourceRows().filter(row => ['warning', 'error'].includes(row.evaluation.status));
    const storedIssues = Array.isArray(state.issueLog?.issues) ? state.issueLog.issues : [];
    const activeStored = storedIssues.filter(issue => clean(issue.status).toLowerCase() === 'active');
    const resolvedStored = storedIssues.filter(issue => clean(issue.status).toLowerCase() === 'resolved');

    if (!runtimeIssues.length && !sourceProblems.length && !activeStored.length && !resolvedStored.length && !state.issueLogError) {
      return '<div class="ovm-ok-note">Keine Overlay-Probleme gemeldet.</div>';
    }

    return `
      <div class="ovm-issue-sections">
        ${state.issueLogError ? `<div class="ovm-error">Monitoring-Issue-Log konnte nicht geladen werden: ${esc(state.issueLogError)}</div>` : ''}
        <section class="ovm-card compact">
          <h3>Aktive Monitoring-Issues</h3>
          ${activeStored.length ? `<div class="ovm-issues">${activeStored.map(renderStoredIssue).join('')}</div>` : '<div class="ovm-ok-note">Keine aktiven gespeicherten Monitoring-Issues.</div>'}
        </section>
        <section class="ovm-card compact">
          <h3>Aktuelle Laufzeit-Hinweise</h3>
          ${(!runtimeIssues.length && !sourceProblems.length) ? '<div class="ovm-ok-note">Keine aktuellen Laufzeit-Hinweise.</div>' : `
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
              ${runtimeIssues.map(issue => `
                <div class="ovm-issue is-${issue.level === 'warn' ? 'warn' : 'bad'}">
                  <div>
                    <strong>${esc(issue.overlayId || issue.key || 'Overlay')}</strong>
                    <span>${esc(issue.message || issue.status || 'Problem')}</span>
                  </div>
                  <span class="ovm-badge is-${issue.level === 'warn' ? 'warn' : 'bad'}">${esc(issue.status || issue.level || 'problem')}</span>
                </div>
              `).join('')}
            </div>
          `}
        </section>
        <section class="ovm-card compact">
          <h3>Erledigte Monitoring-Issues</h3>
          ${resolvedStored.length ? `<div class="ovm-issues">${resolvedStored.slice(0, 40).map(renderStoredIssue).join('')}</div>` : '<div class="ovm-muted">Noch keine erledigten Monitoring-Issues.</div>'}
        </section>
      </div>
    `;
  }


  function inventoryData() {
    return state.obsInventory && typeof state.obsInventory === 'object' ? state.obsInventory : null;
  }

  function inventorySummary() {
    const inv = inventoryData();
    return inv && inv.summary && typeof inv.summary === 'object' ? inv.summary : {};
  }

  function inventorySceneTree() {
    const inv = inventoryData();
    if (!inv) return null;
    const wanted = selectedSceneName() || inv.currentProgramSceneName || '';
    const trees = Array.isArray(inv.sceneTrees) ? inv.sceneTrees : [];
    const found = wanted ? trees.find(tree => key(tree.sceneName || tree.displayName) === key(wanted)) : null;
    return found || inv.currentSceneTree || trees[0] || null;
  }

  function inventoryStatusLabel(node) {
    const status = clean(node?.status || node?.sourceType || node?.kind || 'unknown');
    if (status === 'ok') return 'OK';
    if (status === 'standby') return 'Wartet';
    if (status === 'external') return 'Extern';
    if (status === 'placeholder') return 'Platzhalter';
    if (status === 'warning') return 'Warnung';
    if (status === 'error') return 'Fehler';
    if (status === 'scene') return 'Szene';
    if (status === 'other') return 'Quelle';
    return status || 'Unbekannt';
  }

  function inventoryNodeMeta(node) {
    if (!node) return '';
    if (node.kind === 'scene') {
      const count = Array.isArray(node.children) ? node.children.length : 0;
      return `${count} Einträge · ${node.effectiveVisible ? 'sichtbar erreichbar' : 'ausgeblendet'}`;
    }
    if (node.kind === 'source') {
      const bits = [];
      bits.push(node.fileName || node.obsSourceName || 'Browserquelle');
      if (node.sourceType === 'cgn') bits.push(node.busClientId ? `Bus: ${node.busClientId}` : 'Bus fehlt');
      if (node.sourceType === 'external') bits.push('extern · kein Bus nötig');
      if (node.sourceType === 'placeholder') bits.push('Platzhalter · kein Bus nötig');
      bits.push(node.effectiveVisible ? 'sichtbar' : 'aus');
      return bits.filter(Boolean).join(' · ');
    }
    return node.obsSourceName || node.displayName || '';
  }

  function inventoryNodeClass(node) {
    if (!node) return 'muted';
    if (node.kind === 'scene') return node.effectiveVisible ? 'ok' : 'muted';
    if (node.status === 'ok' || node.status === 'external') return 'ok';
    if (node.status === 'standby' || node.status === 'placeholder' || node.status === 'other') return 'muted';
    if (node.status === 'warning') return 'warn';
    if (node.status === 'error') return 'bad';
    return statusClass(node.status);
  }

  function renderInventoryNode(node, depth = 0) {
    if (!node) return '';
    const children = Array.isArray(node.children) ? node.children : [];
    const isScene = node.kind === 'scene';
    const cls = inventoryNodeClass(node);
    const title = node.displayName || node.sceneName || node.obsSourceName || 'OBS-Eintrag';
    const meta = inventoryNodeMeta(node);
    const url = node.url ? `<code>${esc(shortText(node.url, 120))}</code>` : '';
    return `
      <div class="ovm-inventory-node is-${esc(cls)} ${isScene ? 'is-scene' : 'is-source'}" style="--ovm-depth:${Math.min(8, Math.max(0, depth))}">
        <div class="ovm-inventory-line">
          <span class="ovm-inventory-branch">${isScene ? '▸' : '•'}</span>
          <div class="ovm-inventory-main">
            <strong>${esc(title)}</strong>
            <span>${esc(meta)}</span>
            ${url}
          </div>
          <div class="ovm-inventory-tags">
            ${node.kind === 'source' ? `<span class="ovm-mini-badge ${node.effectiveVisible ? 'is-ok' : 'is-muted'}">${node.effectiveVisible ? 'sichtbar' : 'aus'}</span>` : ''}
            ${node.kind === 'source' && node.sourceType === 'cgn' ? `<span class="ovm-mini-badge ${node.hasHeartbeat ? 'is-ok' : (node.busClientId ? 'is-warn' : 'is-warn')}">${node.hasHeartbeat ? 'HB OK' : (node.busClientId ? 'kein HB' : 'kein Bus')}</span>` : ''}
            ${node.kind === 'source' && node.sourceType === 'external' ? '<span class="ovm-mini-badge is-muted">extern</span>' : ''}
            ${node.kind === 'source' && node.sourceType === 'placeholder' ? '<span class="ovm-mini-badge is-muted">Platzhalter</span>' : ''}
            <span class="ovm-badge is-${esc(cls)}">${esc(inventoryStatusLabel(node))}</span>
          </div>
        </div>
        ${children.length ? `<div class="ovm-inventory-children">${children.map(child => renderInventoryNode(child, depth + 1)).join('')}</div>` : ''}
      </div>
    `;
  }

  function renderInventorySourcesTable() {
    const inv = inventoryData();
    const sources = Array.isArray(inv?.sources) ? inv.sources : [];
    if (!sources.length) return '<div class="ovm-muted">Keine Browser-/Overlayquellen im Inventar.</div>';
    return `
      <div class="ovm-table-wrap compact">
        <table class="ovm-table">
          <thead><tr><th>Overlay</th><th>OBS-Quelle</th><th>Typ</th><th>Bus</th><th>Status</th><th>Pfad</th></tr></thead>
          <tbody>
            ${sources.map(src => `
              <tr>
                <td><strong>${esc(src.displayName || src.obsSourceName || '—')}</strong><br><small>${esc(src.fileName || '—')}</small></td>
                <td>${esc(src.obsSourceName || '—')}</td>
                <td>${esc(src.sourceType || '—')}</td>
                <td>${src.sourceType === 'cgn' ? esc(src.busClientId || 'fehlt') : 'nicht erwartet'}</td>
                <td><span class="ovm-badge is-${esc(inventoryNodeClass(src))}">${esc(inventoryStatusLabel(src))}</span></td>
                <td>${esc(shortText(src.pathText || src.sceneName || '—', 90))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderObsInventory() {
    const inv = inventoryData();
    const summary = inventorySummary();
    const tree = inventorySceneTree();
    if (!inv) {
      return `<section class="ovm-card"><h3>OBS-Inventar</h3><div class="ovm-empty"><strong>Noch kein Inventar geladen.</strong><span>${esc(state.obsInventoryError || 'Bitte aktualisieren.')}</span></div></section>`;
    }
    return `
      ${renderSceneSelector()}
      <section class="ovm-card">
        <div class="ovm-detail-head">
          <div>
            <span class="ovm-kicker">OBS-Inventar</span>
            <h3>${esc(tree?.sceneName || inv.currentProgramSceneName || 'OBS-Struktur')}</h3>
            <p>${inv.fromCache ? 'Letzter gespeicherter Stand' : 'Aktueller OBS-Stand'} · aktualisiert ${esc(fmtDateTime(inv.updatedAt || inv.cacheUpdatedAt))}${inv.refreshError ? ` · Hinweis: ${esc(inv.refreshError)}` : ''}</p>
          </div>
          <button type="button" class="ovm-btn" data-ovm-inventory-refresh>OBS-Inventar aktualisieren</button>
        </div>
        <div class="ovm-overview-grid">
          <div class="ovm-status-box is-ok"><span>Szenen</span><strong>${esc(summary.scenes ?? inv.sceneCount ?? 0)}</strong><small>rekursiv aus OBS gelesen</small></div>
          <div class="ovm-status-box is-ok"><span>Overlay-/Browserquellen</span><strong>${esc(summary.sources ?? 0)}</strong><small>${esc(summary.visible ?? 0)} sichtbar · ${esc(summary.cgn ?? 0)} CGN</small></div>
          <div class="ovm-status-box is-${Number(summary.warnings || 0) ? 'warn' : 'ok'}"><span>Warnungen</span><strong>${esc(summary.warnings ?? 0)}</strong><small>${esc(summary.external ?? 0)} extern · ${esc(summary.placeholder ?? 0)} Platzhalter</small></div>
        </div>
      </section>
      <section class="ovm-card">
        <h3>Logische OBS-Struktur</h3>
        <p class="ovm-muted">Baum der ausgewählten Szene inklusive Unter-Szenen. CGN-Overlays zeigen Bus/Heartbeat, externe Quellen und Platzhalter erwarten keinen Bus.</p>
        <div class="ovm-inventory-tree">${tree ? renderInventoryNode(tree, 0) : '<div class="ovm-muted">Keine Struktur für diese Szene gefunden.</div>'}</div>
      </section>
      <section class="ovm-card">
        <h3>Alle im Inventar gefundenen Browserquellen</h3>
        ${renderInventorySourcesTable()}
      </section>
    `;
  }

  function renderRaw() {
    const raw = {
      overlayMonitor: state.data,
      obsInventory: state.obsInventory,
      obsStatus: state.obsStatus,
      obsSources: state.obsSources,
      obsScenes: state.obsScenes,
      obsSceneItems: state.obsSceneItems,
      obsError: state.obsError,
      sceneError: state.sceneError,
      issueLog: state.issueLog,
      issueLogError: state.issueLogError,
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
    if (state.tab === 'details') return renderOverlayDetails();
    if (state.tab === 'inventory') return renderObsInventory();
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
    root.querySelectorAll('[data-ovm-overlay-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedOverlayKey = btn.dataset.ovmOverlayKey || '';
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
    root.querySelector('[data-ovm-inventory-refresh]')?.addEventListener('click', () => loadAll(true));
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
    state.issueLogError = '';
    state.obsInventoryError = '';
    render();
    try {
      const [monitorResult, obsStatusResult, obsSourcesResult, issueLogResult, inventoryResult] = await Promise.allSettled([
        api(API_STATUS),
        api(API_OBS_STATUS),
        api(API_OBS_BROWSER_SOURCES),
        api(API_ISSUES),
        api(`${API_OBS_INVENTORY}?refresh=${force ? '1' : '0'}`)
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

      if (issueLogResult.status === 'fulfilled') {
        state.issueLog = issueLogResult.value;
      } else {
        state.issueLog = null;
        state.issueLogError = issueLogResult.reason?.message || String(issueLogResult.reason || 'Monitoring-Issue-Log konnte nicht geladen werden.');
      }

      if (inventoryResult.status === 'fulfilled') {
        state.obsInventory = inventoryResult.value;
        if (state.obsInventory && state.obsInventory.ok === false) state.obsInventoryError = apiMessage(state.obsInventory, 'OBS-Inventar konnte nicht aktualisiert werden.');
      } else {
        state.obsInventoryError = inventoryResult.reason?.message || String(inventoryResult.reason || 'OBS-Inventar konnte nicht geladen werden.');
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
