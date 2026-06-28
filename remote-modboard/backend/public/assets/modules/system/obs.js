'use strict';

(function registerSystemObsModule() {
  const MODULE_ID = 'system';
  const PAGE_ID = 'obs';
  const ENDPOINT = '/api/remote/local-dashboard/obs/status';
  let loading = false;
  let refreshTimer = null;

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: MODULE_ID,
      pageId: PAGE_ID,
      label: 'OBS',
      title: 'OBS',
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
          <p class="cgn-eyebrow">System / OBS</p>
          <h1>OBS Status</h1>
          <p>Read-only OBS-Status und vorbereitetes Inventar-Modell. Diese Seite zeigt nur Erreichbarkeit, Szenen-/Quellen-/Audio-Struktur und Sicherheitsgrenzen. Keine Szenenwechsel, keine Mutes, keine Media-Steuerung.</p>
        </div>
        <div class="rdap-obs-header-actions">
          <span class="cgn-chip" id="obsStatusPill">lädt</span>
          <button class="secondaryButton small" type="button" id="obsRefreshButton">OBS neu laden</button>
        </div>
      </section>

      <section class="metric-grid rdap-obs-metrics">
        <article class="metric-card cgn-card"><span>OBS</span><strong id="obsReachable">—</strong><small>WebSocket-Port</small><div class="cgn-progress"><i id="obsReachableBar" style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Port</span><strong id="obsPort">—</strong><small>Standard: 4455</small><div class="cgn-progress"><i style="width:45%"></i></div></article>
        <article class="metric-card cgn-card"><span>Agent</span><strong id="obsAgent">—</strong><small>remote_agent</small><div class="cgn-progress"><i id="obsAgentBar" style="width:8%"></i></div></article>
        <article class="metric-card cgn-card"><span>Steuerung</span><strong id="obsControl">Aus</strong><small>read-only</small><div class="cgn-progress cgn-progress--warn"><i style="width:8%"></i></div></article>
      </section>

      <section class="page-grid rdap-obs-grid">
        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Details</p><h2>Read-only Status</h2></div><span class="cgn-chip cgn-chip--info">0.2.15</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>Status</span><strong id="obsStatusText">—</strong></div>
            <div class="kv-row"><span>Geprüft</span><strong id="obsCheckedAt">—</strong></div>
            <div class="kv-row"><span>OBS-Request</span><strong id="obsRequestState">keiner</strong></div>
            <div class="kv-row"><span>Inventar</span><strong id="obsInventoryState">vorbereitet</strong></div>
          </div>
          <p class="rdap-obs-detail" id="obsDetailText">Noch nicht geladen.</p>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Inventar</p><h2>Szenen / Quellen / Audio</h2></div><span class="cgn-chip cgn-chip--info" id="obsInventoryPill">vorbereitet</span></div>
          <div class="rdap-obs-inventory-metrics">
            <div><span>Szenen</span><strong id="obsSceneCount">0</strong></div>
            <div><span>Quellen</span><strong id="obsSourceCount">0</strong></div>
            <div><span>Audio</span><strong id="obsAudioCount">0</strong></div>
          </div>
          <div class="rdap-obs-inventory-columns">
            <div><h3>Szenen</h3><div class="rdap-obs-list" id="obsSceneList"><p>lädt…</p></div></div>
            <div><h3>Quellen</h3><div class="rdap-obs-list" id="obsSourceList"><p>lädt…</p></div></div>
            <div><h3>Audio</h3><div class="rdap-obs-list" id="obsAudioList"><p>lädt…</p></div></div>
          </div>
          <p class="rdap-obs-detail" id="obsInventoryNote">Inventarstruktur wird geladen.</p>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Sicherheit</p><h2>Keine Steuerung aktiv</h2></div><span class="cgn-chip cgn-chip--warn">geschützt</span></div>
          <div class="admin-lock-note rdap-obs-note">
            <i>!</i>
            <div>
              <strong>Nur Anzeige</strong>
              <span>OBS-Kommandos bleiben deaktiviert: kein Szenenwechsel, kein Mute/Unmute, keine Quellen-Sichtbarkeit, keine Media-Steuerung und keine Agent-Actions.</span>
            </div>
          </div>
          <div class="module-list rdap-obs-action-list">
            <div class="module-row"><span class="module-icon purple">🎬</span><div><b>Szenenwechsel</b><small>geplant, aktuell deaktiviert</small></div></div>
            <div class="module-row"><span class="module-icon blue">🔇</span><div><b>Mute/Unmute</b><small>geplant, aktuell deaktiviert</small></div></div>
            <div class="module-row"><span class="module-icon cyan">⏹</span><div><b>Media stoppen</b><small>geplant, aktuell deaktiviert</small></div></div>
          </div>
          <p class="rdap-obs-updated" id="obsLastUpdated">Noch nicht geladen</p>
        </article>
      </section>
    `;

    installStyle();
    bindActions();
    return panel;
  }

  function installStyle() {
    if (document.getElementById('rdap0215ObsStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap0215ObsStyle';
    style.textContent = `
      [data-page-panel="obs"] .rdap-obs-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      [data-page-panel="obs"] .rdap-obs-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="obs"] .rdap-obs-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="obs"] .rdap-obs-detail{margin:14px 0 0;color:var(--muted);font-size:13px;line-height:1.45}
      [data-page-panel="obs"] .rdap-obs-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.18)}
      [data-page-panel="obs"] .rdap-obs-updated{margin:12px 0 0;color:var(--muted);font-size:12px}
      [data-page-panel="obs"] .rdap-obs-inventory-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0 14px}
      [data-page-panel="obs"] .rdap-obs-inventory-metrics>div{border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px;background:rgba(255,255,255,.03)}
      [data-page-panel="obs"] .rdap-obs-inventory-metrics span{display:block;color:var(--muted);font-size:12px;margin-bottom:4px}
      [data-page-panel="obs"] .rdap-obs-inventory-metrics strong{font-size:22px}
      [data-page-panel="obs"] .rdap-obs-inventory-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      [data-page-panel="obs"] .rdap-obs-inventory-columns h3{font-size:13px;margin:0 0 8px;color:var(--text)}
      [data-page-panel="obs"] .rdap-obs-list{min-height:78px;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px;background:rgba(0,0,0,.12)}
      [data-page-panel="obs"] .rdap-obs-list p{margin:0;color:var(--muted);font-size:12px;line-height:1.45}
      [data-page-panel="obs"] .rdap-obs-list .obs-item{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px}
      [data-page-panel="obs"] .rdap-obs-list .obs-item:last-child{border-bottom:0}
      [data-page-panel="obs"] .rdap-obs-list .obs-item small{color:var(--muted)}
      @media(max-width:900px){[data-page-panel="obs"] .rdap-obs-inventory-columns{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function bindActions() {
    const button = document.getElementById('obsRefreshButton');
    if (!button || button.dataset.rdap0215Bound === '1') return;
    button.dataset.rdap0215Bound = '1';
    button.addEventListener('click', () => loadObsStatus('manual'));
  }

  async function getJson(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
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
    const result = await getJson(ENDPOINT);
    renderObsStatus(result, reason);
    setButtonLoading(false);
    loading = false;
  }

  function renderObsStatus(result, reason) {
    const body = result && result.body ? result.body : {};
    const obs = body.obs || {};
    const agent = body.remoteAgent || {};
    const safety = body.safety || {};
    const inventory = body.inventory || {};
    const counts = inventory.counts || {};
    const reachable = obs.reachable === true;
    const agentConnected = agent.connected === true;
    const controlEnabled = safety.obsControlEnabled === true || obs.controlEnabled === true;

    setChip('obsStatusPill', result && result.ok && reachable, reachable ? 'OBS erreichbar' : 'OBS nicht erreichbar');
    setText('obsReachable', reachable ? 'Ja' : 'Nein');
    setText('obsPort', obs.port || '4455');
    setText('obsAgent', agentConnected ? 'Verbunden' : 'Nicht verbunden');
    setText('obsControl', controlEnabled ? 'Aktiv' : 'Aus');
    setText('obsStatusText', obs.status || (reachable ? 'reachable' : 'not_reachable'));
    setText('obsCheckedAt', formatDate(obs.checkedAt));
    setText('obsRequestState', obs.noObsRequestSent === false ? 'gesendet' : 'keiner');
    setText('obsInventoryState', inventory.active ? 'aktiv' : 'vorbereitet');
    setText('obsDetailText', obs.detail || body.note || 'OBS read-only Status geladen.');
    setText('obsLastUpdated', `Aktualisiert: ${new Date().toLocaleString('de-DE')}${reason ? ` · ${reason}` : ''}`);
    setText('obsSceneCount', counts.scenes || 0);
    setText('obsSourceCount', counts.sources || 0);
    setText('obsAudioCount', counts.audioSources || 0);
    setText('obsInventoryNote', inventory.note || 'OBS-Inventar ist read-only vorbereitet.');
    setChip('obsInventoryPill', Boolean(inventory.prepared), inventory.active ? 'aktiv' : 'vorbereitet');
    renderList('obsSceneList', inventory.scenes || (inventory.groups && inventory.groups.scenes && inventory.groups.scenes.items), 'Noch keine Szenen gelesen.');
    renderList('obsSourceList', inventory.sources || (inventory.groups && inventory.groups.sources && inventory.groups.sources.items), 'Noch keine Quellen gelesen.');
    renderList('obsAudioList', inventory.audioSources || (inventory.groups && inventory.groups.audioSources && inventory.groups.audioSources.items), 'Noch keine Audioquellen gelesen.');
    setBar('obsReachableBar', reachable ? 92 : 12);
    setBar('obsAgentBar', agentConnected ? 88 : 12);
  }

  function renderList(id, items, emptyText) {
    const node = document.getElementById(id);
    if (!node) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      node.innerHTML = `<p>${escapeHtml(emptyText)}</p>`;
      return;
    }
    node.innerHTML = list.slice(0, 12).map((item) => {
      const name = typeof item === 'string' ? item : (item && (item.name || item.label || item.id)) || 'Unbenannt';
      const meta = item && typeof item === 'object' && item.type ? item.type : 'read-only';
      return `<div class="obs-item"><span>${escapeHtml(name)}</span><small>${escapeHtml(meta)}</small></div>`;
    }).join('');
  }

  function setButtonLoading(value) {
    const button = document.getElementById('obsRefreshButton');
    if (!button) return;
    button.disabled = Boolean(value);
    button.textContent = value ? 'lädt…' : 'OBS neu laden';
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

  function setBar(id, value) {
    const node = document.getElementById(id);
    if (!node) return;
    node.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
  }

  function formatDate(value) {
    if (!value || value === '—') return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
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
    if (window.RdapMainRouter && typeof window.RdapMainRouter.getCurrentPage === 'function') {
      return window.RdapMainRouter.getCurrentPage() === PAGE_ID;
    }
    const panel = document.querySelector('[data-page-panel="obs"]');
    return Boolean(panel && panel.classList.contains('is-active-view'));
  }

  function startRefresh() {
    stopRefresh();
    refreshTimer = window.setInterval(() => {
      if (pageIsActive()) loadObsStatus('auto');
    }, 15000);
  }

  function stopRefresh() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = null;
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
