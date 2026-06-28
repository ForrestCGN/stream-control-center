'use strict';

(function registerSystemObsModule() {
  const MODULE_ID = 'system';
  const PAGE_ID = 'obs';
  const ENDPOINT = '/api/remote/local-dashboard/obs/status';
  const ONLINE_INVENTORY_ENDPOINT = '/api/remote/agent/obs/inventory/status';
  const LOCAL_INVENTORY_ENDPOINT = '/api/remote-agent/obs/inventory/status';
  const ONLINE_LIVE_ENDPOINT = '/api/remote/agent/obs/live/status';
  const LOCAL_LIVE_ENDPOINT = '/api/remote-agent/obs/live/status';
  const STEP_LABEL = '0.2.22E';
  const LOCAL_LIVE_REFRESH_MS = 250;
  const ONLINE_LIVE_REFRESH_MS = 1000;
  let activeLiveRefreshMs = getInitialLiveRefreshMs();
  const LIVE_REFRESH_HIDDEN_MS = 2000;
  const FULL_REFRESH_MS = 30000;
  const OBS_ALLOWLIST_MODEL = Object.freeze({
    switchableScenes: [],
    controllableAudioSources: [],
    controllableSources: [],
    actionEnabled: false,
    readOnly: true
  });
  let loading = false;
  let refreshTimer = null;
  let liveRefreshTimer = null;
  let liveRefreshRunning = false;
  let lastInventory = null;
  let lastLiveAvailable = false;

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'OBS',
      title: 'OBS Bedienung',
      tab: 'read-only',
      section: 'System',
      order: 30
    });
  }

  function createPanel() {
    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return null;

    let panel = document.querySelector('[data-page-panel="obs"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'rdap-view';
      panel.dataset.pagePanel = PAGE_ID;
      const diagnosticsPanel = content.querySelector('[data-page-panel="diagnostics"]');
      if (diagnosticsPanel && diagnosticsPanel.nextElementSibling) content.insertBefore(panel, diagnosticsPanel.nextElementSibling);
      else content.appendChild(panel);
    }

    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card rdap-obs-header">
        <div>
          <p class="cgn-eyebrow">OBS / Mod-Bedienfläche</p>
          <h1>OBS Bedienung</h1>
          <p>OBS-Ansicht für Mods: aktuelle Szene live, Szenen und Audio als echte read-only Liste. Steuern bleibt noch gesperrt.</p>
        </div>
        <div class="rdap-obs-header-actions">
          <span class="cgn-chip" id="obsStatusPill">lädt</span>
          <button class="secondaryButton small" type="button" id="obsRefreshButton">Anzeige aktualisieren</button>
        </div>
      </section>

      <section class="rdap-obs-topline">
        <article class="cgn-card rdap-obs-current"><span>Aktuelle Szene</span><strong id="obsCurrentScene">—</strong><small id="obsLiveState">Live-Status</small></article>
        <article class="cgn-card rdap-obs-mini"><span>OBS</span><strong id="obsConnectionText">—</strong><small>Verbindung</small></article>
        <article class="cgn-card rdap-obs-mini"><span>Szenen</span><strong id="obsProductiveSceneCount">—</strong><small id="obsInternalSceneText">Liste lädt</small></article>
        <article class="cgn-card rdap-obs-mini"><span>Audio</span><strong id="obsAudioCount">—</strong><small id="obsAudioHiddenText">Liste lädt</small></article>
      </section>

      <section class="rdap-obs-board">
        <article class="cgn-card rdap-obs-scenes-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Szenen</p><h2>Produktive Szenen</h2></div><span class="cgn-chip cgn-chip--info">${STEP_LABEL} Live</span></div>
          <p class="rdap-obs-detail">Produktive Szenen werden als echte OBS-Liste angezeigt. Wechseln bleibt gesperrt, bis eine Freigabe aktiv ist.</p>
          <div class="rdap-obs-scene-list" id="obsProductiveSceneList"><p>lädt…</p></div>
        </article>

        <article class="cgn-card rdap-obs-audio-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Audio</p><h2>Audiomixer</h2></div><span class="cgn-chip cgn-chip--info">Anzeige</span></div>
          <p class="rdap-obs-detail">Relevante Audioquellen werden angezeigt. Stummschalten bleibt gesperrt, bis eine Freigabe aktiv ist.</p>
          <div class="rdap-obs-audio-list" id="obsAudioList"><p>lädt…</p></div>
          <p class="rdap-obs-detail" id="obsAudioMore"></p>
        </article>
      </section>

      <section class="rdap-obs-secondary-grid">
        <article class="cgn-card rdap-obs-source-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Quellen</p><h2>Quellen-Übersicht</h2></div><span class="cgn-chip cgn-chip--info" id="obsSourcePill">—</span></div>
          <p class="rdap-obs-detail">Quellen werden nur angezeigt. Sichtbarkeit ändern bleibt gesperrt, bis eine Freigabe aktiv ist.</p>
          <div class="rdap-obs-source-list" id="obsSourcePreview"><p>lädt…</p></div>
        </article>

        <article class="cgn-card rdap-obs-rights-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Rechte / Allowlist</p><h2>Spätere Freigaben</h2></div><span class="cgn-chip cgn-chip--warn">read-only</span></div>
          <div class="rdap-obs-rights-list">
            <span><b>obs.read</b><small>Anzeige vorbereitet</small></span>
            <span><b>obs.scene.switch</b><small>nur Allowlist, noch aus</small></span>
            <span><b>obs.audio.mute</b><small>nur Allowlist, noch aus</small></span>
            <span><b>obs.source.visibility</b><small>nur Allowlist, noch aus</small></span>
          </div>
          <p class="rdap-obs-detail">${STEP_LABEL}: OBS-Listen kommen read-only vom Stream-PC. Keine Buttons, keine OBS-Kommandos, keine Agent-Actions.</p>
        </article>
      </section>
    `;

    installStyle();
    bindActions();
    return panel;
  }

  function installStyle() {
    if (document.getElementById('rdap0219ObsStyleFix3')) return;
    const old = document.getElementById('rdap0219ObsStyle');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    const style = document.createElement('style');
    style.id = 'rdap0219ObsStyleFix3';
    style.textContent = `
      [data-page-panel="obs"] .rdap-obs-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      [data-page-panel="obs"] .rdap-obs-header p:not(.cgn-eyebrow){max-width:1120px}
      [data-page-panel="obs"] .rdap-obs-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="obs"] .rdap-obs-detail{margin:10px 0 0;color:var(--muted);font-size:13px;line-height:1.45}
      [data-page-panel="obs"] .rdap-obs-detail code{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--text)}
      [data-page-panel="obs"] .rdap-obs-topline{display:grid;grid-template-columns:minmax(320px,1.6fr) repeat(3,minmax(150px,.75fr));gap:12px;margin-bottom:14px}
      [data-page-panel="obs"] .rdap-obs-current,[data-page-panel="obs"] .rdap-obs-mini{padding:16px;border-radius:18px}
      [data-page-panel="obs"] .rdap-obs-current span,[data-page-panel="obs"] .rdap-obs-mini span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px}
      [data-page-panel="obs"] .rdap-obs-current strong{display:block;font-size:25px;line-height:1.12;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .rdap-obs-mini strong{display:block;font-size:19px;line-height:1.15}
      [data-page-panel="obs"] .rdap-obs-current small,[data-page-panel="obs"] .rdap-obs-mini small{display:block;margin-top:6px;color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .rdap-obs-current.is-live strong{color:var(--text);text-shadow:0 0 16px rgba(69,220,255,.18)}
      [data-page-panel="obs"] .rdap-obs-board{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(340px,.75fr);gap:14px;align-items:start}
      [data-page-panel="obs"] .rdap-obs-scene-list{display:flex;flex-direction:column;gap:6px;margin-top:14px}
      [data-page-panel="obs"] .obs-scene-row{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.075);border-radius:11px;padding:8px 10px;background:rgba(255,255,255,.025);min-width:0}
      [data-page-panel="obs"] .obs-scene-row.is-current{border-color:rgba(69,220,255,.55);background:rgba(69,220,255,.09)}
      [data-page-panel="obs"] .obs-scene-dot{width:10px;height:10px;border-radius:99px;background:rgba(255,255,255,.18);box-shadow:none;margin-left:4px}
      [data-page-panel="obs"] .obs-scene-row.is-current .obs-scene-dot{background:rgba(69,220,255,.95);box-shadow:0 0 12px rgba(69,220,255,.55)}
      [data-page-panel="obs"] .obs-scene-name{font-size:14px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .obs-scene-state{border-radius:999px;padding:4px 8px;background:rgba(255,255,255,.075);font-size:11px;color:var(--muted);white-space:nowrap}
      [data-page-panel="obs"] .obs-scene-row.is-current .obs-scene-state{background:rgba(69,220,255,.25);color:var(--text)}
      [data-page-panel="obs"] .rdap-obs-audio-list{display:flex;flex-direction:column;gap:6px;margin-top:14px;max-height:420px;overflow:auto;padding-right:4px}
      [data-page-panel="obs"] .obs-audio-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.075);border-radius:11px;padding:8px 10px;background:rgba(255,255,255,.025);min-width:0}
      [data-page-panel="obs"] .obs-audio-row b{display:block;font-size:13px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .obs-audio-row small{display:block;margin-top:2px;color:var(--muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .obs-status-badge{border-radius:999px;padding:4px 8px;background:rgba(255,255,255,.075);font-size:11px;color:var(--muted);white-space:nowrap}
      [data-page-panel="obs"] .rdap-obs-secondary-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(340px,.75fr);gap:14px;margin-top:14px;align-items:start}
      [data-page-panel="obs"] .rdap-obs-source-list{margin-top:12px;border:1px solid rgba(255,255,255,.075);border-radius:12px;overflow:hidden;background:rgba(0,0,0,.10)}
      [data-page-panel="obs"] .obs-source-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:7px 10px;border-bottom:1px solid rgba(255,255,255,.045);font-size:12px;min-width:0}
      [data-page-panel="obs"] .obs-source-row:last-child{border-bottom:0}
      [data-page-panel="obs"] .obs-source-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="obs"] .obs-source-row small{color:var(--muted);white-space:nowrap}
      [data-page-panel="obs"] .rdap-obs-more{padding:8px 10px;color:var(--muted);font-size:12px;background:rgba(255,255,255,.025)}
      [data-page-panel="obs"] .rdap-obs-rights-list{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
      [data-page-panel="obs"] .rdap-obs-rights-list span{display:block;border:1px solid rgba(255,255,255,.075);border-radius:11px;padding:8px;background:rgba(255,255,255,.025)}
      [data-page-panel="obs"] .rdap-obs-rights-list b{display:block;font-size:12px}
      [data-page-panel="obs"] .rdap-obs-rights-list small{display:block;margin-top:2px;color:var(--muted);font-size:11px;line-height:1.25}
      @media(max-width:1200px){[data-page-panel="obs"] .rdap-obs-topline,[data-page-panel="obs"] .rdap-obs-board,[data-page-panel="obs"] .rdap-obs-secondary-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function bindActions() {
    const button = document.getElementById('obsRefreshButton');
    if (!button || button.dataset.rdap0219Fix3Bound === '1') return;
    button.dataset.rdap0219Fix3Bound = '1';
    button.addEventListener('click', () => loadObsStatus('manual'));
  }

  async function getJson(url) {
    try {
      const response = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } });
      const body = await response.json().catch(() => null);
      return { ok: response.ok && body && body.ok !== false, httpStatus: response.status, body };
    } catch (err) {
      return { ok: false, httpStatus: 0, body: null, error: err && err.message ? err.message : 'fetch_failed' };
    }
  }

  async function loadObsStatus(reason) {
    if (loading) return;
    loading = true;
    setButtonLoading(true);
    const candidates = getInventoryCandidates();
    let result = null;
    for (const url of candidates) {
      result = await getJson(url);
      if (result && result.ok && result.body && hasInventoryData(result.body)) break;
    }
    renderObsStatus(result, reason);
    setButtonLoading(false);
    loading = false;
  }

  function isLocalRuntime() {
    return location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  }

  function getInitialLiveRefreshMs() {
    return isLocalRuntime() ? LOCAL_LIVE_REFRESH_MS : ONLINE_LIVE_REFRESH_MS;
  }

  function getInventoryCandidates() {
    return isLocalRuntime() ? [LOCAL_INVENTORY_ENDPOINT, ONLINE_INVENTORY_ENDPOINT, ENDPOINT] : [ONLINE_INVENTORY_ENDPOINT, LOCAL_INVENTORY_ENDPOINT, ENDPOINT];
  }

  function hasInventoryData(body) {
    const inventory = normalizeInventoryBody(body);
    const counts = inventory.counts || body.counts || {};
    return inventory.active === true || Number(counts.total || 0) > 0 || Array.isArray(inventory.scenes) || Array.isArray(inventory.audioSources);
  }

  function normalizeInventoryBody(body) {
    if (!body || typeof body !== 'object') return {};
    if (body.inventory && typeof body.inventory === 'object') return body.inventory;
    if (Array.isArray(body.scenes) || Array.isArray(body.sources) || Array.isArray(body.audioSources) || body.counts) {
      return {
        active: body.active === true || (body.counts && Number(body.counts.total || 0) > 0),
        status: body.status || 'inventory_available',
        currentScene: body.currentScene || body.currentProgramSceneName || '',
        scenes: body.scenes || [],
        sources: body.sources || [],
        audioSources: body.audioSources || [],
        groups: body.groups || {},
        counts: body.counts || { scenes: 0, sources: 0, audioSources: 0, total: 0 }
      };
    }
    return {};
  }

  function renderObsStatus(result, reason) {
    void reason;
    const body = result && result.body ? result.body : {};
    const obs = body.obs || {};
    const inventory = normalizeInventoryBody(body);
    const scenes = Array.isArray(inventory.scenes) ? inventory.scenes : ((inventory.groups && inventory.groups.scenes && inventory.groups.scenes.items) || []);
    const sources = Array.isArray(inventory.sources) ? inventory.sources : ((inventory.groups && inventory.groups.sources && inventory.groups.sources.items) || []);
    const audioSources = Array.isArray(inventory.audioSources) ? inventory.audioSources : ((inventory.groups && inventory.groups.audioSources && inventory.groups.audioSources.items) || []);
    lastInventory = inventory;
    const currentScene = getCurrentSceneFromInventory(inventory) || getCurrentSceneFromLiveCache() || '—';
    const productiveScenes = scenes.filter(isProductiveScene);
    const internalSceneCount = Math.max(0, scenes.length - productiveScenes.length);
    const visibleAudio = audioSources.filter(isRelevantAudio);
    const hiddenAudioCount = Math.max(0, audioSources.length - visibleAudio.length);
    const hasInventory = inventory.active === true || productiveScenes.length > 0 || visibleAudio.length > 0 || sources.length > 0;
    const reachable = obs.reachable === true || obs.status === 'reachable' || obs.status === 'live_connected' || inventory.active === true || Boolean(currentScene && currentScene !== '—');

    setChip('obsStatusPill', result && result.ok && reachable, reachable ? 'OBS live verbunden' : 'OBS wartet');
    renderLiveScene(currentScene, hasInventory ? 'OBS Liste' : 'Live');
    setText('obsConnectionText', reachable ? 'Live verbunden' : 'Wartet');
    setText('obsProductiveSceneCount', hasInventory ? productiveScenes.length : '—');
    setText('obsInternalSceneText', hasInventory ? `${internalSceneCount} interne OBS-Elemente nicht angezeigt` : 'Liste lädt');
    setText('obsAudioCount', hasInventory ? visibleAudio.length : '—');
    setText('obsAudioHiddenText', hasInventory ? (hiddenAudioCount ? `${hiddenAudioCount} interne OBS-Elemente nicht angezeigt` : 'bereit') : 'Liste lädt');
    setText('obsSourcePill', hasInventory ? `${sources.length || 0} Quellen` : 'Liste lädt');

    renderProductiveScenes(productiveScenes, currentScene, hasInventory);
    renderAudioList(visibleAudio, hiddenAudioCount, hasInventory);
    renderSourcePreview(sources, hasInventory);
  }

  function isProductiveScene(item) {
    const name = getItemName(item).trim();
    if (!name || name.startsWith('_')) return false;
    if (/^[\s\-–—_]{4,}$/.test(name)) return false;
    return true;
  }

  function isSceneAllowlisted(name) {
    const allowlist = Array.isArray(OBS_ALLOWLIST_MODEL.switchableScenes) ? OBS_ALLOWLIST_MODEL.switchableScenes : [];
    return allowlist.some(item => sameName(item, name));
  }

  function isRelevantAudio(item) {
    const name = getItemName(item).trim();
    if (!name) return false;
    if (name.startsWith('_')) return false;
    return true;
  }

  function renderProductiveScenes(items, currentScene, hasInventory) {
    const node = document.getElementById('obsProductiveSceneList');
    if (!node) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      node.innerHTML = `<p class="rdap-obs-detail">${hasInventory ? 'Keine produktiven Szenen in der Freigabe-Liste.' : 'Szenenliste lädt…'}</p>`;
      return;
    }
    node.innerHTML = list.map((item) => {
      const name = getItemName(item);
      const isCurrent = sameName(name, currentScene);
      const state = isCurrent ? 'aktuell' : (isSceneAllowlisted(name) ? 'freigegeben (read-only)' : 'nicht freigegeben');
      return `<div class="obs-scene-row${isCurrent ? ' is-current' : ''}"><i class="obs-scene-dot"></i><span class="obs-scene-name">${escapeHtml(name)}</span><span class="obs-scene-state">${escapeHtml(state)}</span></div>`;
    }).join('');
  }

  function renderAudioList(items, hiddenCount, hasInventory) {
    const node = document.getElementById('obsAudioList');
    const more = document.getElementById('obsAudioMore');
    if (!node) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      node.innerHTML = `<p class="rdap-obs-detail">${hasInventory ? 'Keine relevanten Audioquellen in der Freigabe-Liste.' : 'Audioliste lädt…'}</p>`;
      if (more) more.textContent = hasInventory && hiddenCount ? `${hiddenCount} interne OBS-Elemente nicht angezeigt.` : '';
      return;
    }
    const visible = list.slice(0, 10);
    node.innerHTML = visible.map((item) => {
      const name = getItemName(item);
      const type = getItemType(item, 'audio');
      const muted = item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, 'muted') ? item.muted : null;
      const status = muted === true ? 'stumm' : muted === false ? 'aktiv' : 'Status unbekannt';
      return `<div class="obs-audio-row"><div><b>${escapeHtml(name)}</b><small>${escapeHtml(type)}</small></div><span class="obs-status-badge">${escapeHtml(status)}</span></div>`;
    }).join('');
    const extra = list.length > visible.length ? `+ ${list.length - visible.length} weitere relevante Audioquellen. ` : '';
    if (more) more.textContent = `${extra}${hiddenCount ? `${hiddenCount} interne OBS-Elemente nicht angezeigt.` : ''}`.trim();
  }

  function renderSourcePreview(items, hasInventory) {
    const node = document.getElementById('obsSourcePreview');
    if (!node) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      node.innerHTML = `<p class="rdap-obs-detail">${hasInventory ? 'Keine Quellen in der Anzeige-Liste.' : 'Quellenliste lädt…'}</p>`;
      return;
    }
    const visible = list.filter(item => !getItemName(item).trim().startsWith('_')).slice(0, 8);
    const base = visible.length ? visible : list.slice(0, 8);
    const rows = base.map((item) => `<div class="obs-source-row"><span>${escapeHtml(getItemName(item))}</span><small>${escapeHtml(getItemType(item, 'source'))}</small></div>`).join('');
    const restCount = Math.max(0, list.length - base.length);
    const rest = restCount ? `<div class="rdap-obs-more">+ ${restCount} weitere Quellen. </div>` : '';
    node.innerHTML = rows + rest;
  }


  function getLiveCandidates() {
    return isLocalRuntime()
      ? [
        { url: LOCAL_LIVE_ENDPOINT, label: 'Lokal Live', intervalMs: LOCAL_LIVE_REFRESH_MS },
        { url: ONLINE_LIVE_ENDPOINT, label: 'Online Live', intervalMs: ONLINE_LIVE_REFRESH_MS }
      ]
      : [
        { url: ONLINE_LIVE_ENDPOINT, label: 'Online Live', intervalMs: ONLINE_LIVE_REFRESH_MS },
        { url: LOCAL_LIVE_ENDPOINT, label: 'Lokal Live', intervalMs: LOCAL_LIVE_REFRESH_MS }
      ];
  }

  async function loadObsLiveStatus() {
    const candidates = getLiveCandidates();

    for (const candidate of candidates) {
      const result = await getJson(candidate.url);
      if (!result || !result.ok || !result.body) continue;
      const body = result.body;
      activeLiveRefreshMs = candidate.intervalMs;
      const currentScene = extractLiveScene(body);
      if (currentScene) {
        renderLiveScene(currentScene, candidate.label);
        const scenes = lastInventory && Array.isArray(lastInventory.scenes) ? lastInventory.scenes : [];
        const productiveScenes = scenes.filter(isProductiveScene);
        if (productiveScenes.length) renderProductiveScenes(productiveScenes, currentScene);
        return;
      }
      if (isLiveUnavailable(body)) {
        renderLiveUnavailable(candidate.label);
        return;
      }
    }
  }

  function extractLiveScene(body) {
    if (!body || typeof body !== 'object') return '';
    return body.currentScene || body.currentProgramSceneName ||
      (body.obs && (body.obs.currentScene || body.obs.currentProgramSceneName)) ||
      (body.liveState && (body.liveState.currentScene || body.liveState.currentProgramSceneName || (body.liveState.obs && (body.liveState.obs.currentScene || body.liveState.obs.currentProgramSceneName)))) || '';
  }

  function isLiveUnavailable(body) {
    if (!body || typeof body !== 'object') return false;
    const agent = body.agent && typeof body.agent === 'object' ? body.agent : {};
    const obs = body.obs && typeof body.obs === 'object' ? body.obs : {};
    const status = String(body.status || obs.status || '').toLowerCase();
    if (body.active === false) return true;
    if (agent.connected === false) return true;
    if (agent.liveStateStale === true || body.liveStateStale === true) return true;
    if (status.includes('offline') || status.includes('stale') || status.includes('no_live_scene') || status.includes('waiting')) return true;
    return false;
  }

  function getCurrentSceneFromInventory(inventory) {
    if (!inventory || typeof inventory !== 'object') return '';
    return inventory.currentScene || inventory.currentProgramSceneName || (inventory.live && (inventory.live.currentScene || inventory.live.currentProgramSceneName)) || '';
  }

  function renderLiveScene(currentScene, sourceLabel) {
    setText('obsCurrentScene', currentScene || '—');
    setText('obsLiveState', sourceLabel ? `${sourceLabel} · Auto ${activeLiveRefreshMs}ms` : `Auto ${activeLiveRefreshMs}ms`);
    const currentCard = document.querySelector('[data-page-panel="obs"] .rdap-obs-current');
    if (currentCard) currentCard.classList.toggle('is-live', Boolean(currentScene && currentScene !== '—'));
    lastLiveAvailable = Boolean(currentScene && currentScene !== '—');
    if (currentScene && currentScene !== '—') {
      setChip('obsStatusPill', true, 'OBS live verbunden');
      setText('obsConnectionText', 'Live verbunden');
    }
  }

  function renderLiveUnavailable(sourceLabel) {
    setText('obsCurrentScene', '—');
    setText('obsLiveState', sourceLabel ? `${sourceLabel} · wartet` : 'wartet');
    setChip('obsStatusPill', false, 'OBS wartet');
    setText('obsConnectionText', 'Wartet');
    const currentCard = document.querySelector('[data-page-panel="obs"] .rdap-obs-current');
    if (currentCard) currentCard.classList.remove('is-live');
    lastLiveAvailable = false;
  }

  function getCurrentSceneFromLiveCache() {
    const node = document.getElementById('obsCurrentScene');
    return lastLiveAvailable && node && node.textContent && node.textContent !== '—' ? node.textContent : '';
  }

  function getItemName(item) {
    if (typeof item === 'string') return item;
    return item && (item.name || item.label || item.id) ? String(item.name || item.label || item.id) : 'Unbenannt';
  }

  function getItemType(item, fallback) {
    if (!item || typeof item !== 'object') return fallback || 'read-only';
    return String(item.type || item.kind || fallback || 'read-only');
  }

  function sameName(a, b) {
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  }

  function setButtonLoading(value) {
    const button = document.getElementById('obsRefreshButton');
    if (!button) return;
    button.disabled = Boolean(value);
    button.textContent = value ? 'lädt…' : 'Anzeige aktualisieren';
  }

  function setChip(id, ok, text) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    node.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value == null || value === '' ? '—' : String(value);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pageIsActive() {
    if (window.RdapMainRouter && typeof window.RdapMainRouter.getCurrentPage === 'function') return window.RdapMainRouter.getCurrentPage() === PAGE_ID;
    const panel = document.querySelector('[data-page-panel="obs"]');
    return Boolean(panel && panel.classList.contains('is-active-view'));
  }

  function startRefresh() {
    stopRefresh();
    refreshTimer = window.setInterval(() => {
      if (pageIsActive()) loadObsStatus('auto-full');
    }, FULL_REFRESH_MS);
    scheduleNextLiveRefresh(0);
  }

  function scheduleNextLiveRefresh(delayMs) {
    if (liveRefreshTimer) window.clearTimeout(liveRefreshTimer);
    liveRefreshTimer = window.setTimeout(runLiveRefreshLoop, Math.max(0, Number(delayMs) || 0));
  }

  async function runLiveRefreshLoop() {
    if (liveRefreshRunning) {
      scheduleNextLiveRefresh(activeLiveRefreshMs);
      return;
    }
    liveRefreshRunning = true;
    try {
      if (pageIsActive() && !document.hidden) await loadObsLiveStatus();
    } catch (err) {
      // read-only live status must never break the page
    } finally {
      liveRefreshRunning = false;
      const nextDelay = document.hidden ? LIVE_REFRESH_HIDDEN_MS : activeLiveRefreshMs;
      scheduleNextLiveRefresh(nextDelay);
    }
  }

  function stopRefresh() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    if (liveRefreshTimer) window.clearTimeout(liveRefreshTimer);
    refreshTimer = null;
    liveRefreshTimer = null;
    liveRefreshRunning = false;
  }

  function install() {
    registerPage();
    createPanel();
    startRefresh();
    loadObsStatus('initial');
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('rdap:module-registry-ready', install);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) loadObsStatus('page');
  });
})();
