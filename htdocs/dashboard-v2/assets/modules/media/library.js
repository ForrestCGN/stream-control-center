'use strict';

(function registerMediaLibraryModule() {
  const MODULE_ID = 'media';
  const PAGE_ID = 'media-library';
  const STATUS_URL = '/api/remote/media/status';

  const state = {
    loaded: false,
    loading: false,
    error: '',
    data: null,
    filter: 'all'
  };

  let installed = false;

  function getContentRoot() {
    return document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (!Number.isFinite(size) || size <= 0) return '0 B';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  function formatDate(value) {
    if (!value) return '—';
    const text = String(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s)?(\d{2})?:?(\d{2})?/);
    if (!match) return text.slice(0, 16);
    const [, year, month, day, hour, minute] = match;
    if (hour && minute) return `${day}.${month}.${year}, ${hour}:${minute}`;
    return `${day}.${month}.${year}`;
  }

  function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function chip(label, kind, attrs) {
    return `<span class="cgn-chip ${kind ? `cgn-chip--${kind}` : ''}" ${attrs || ''}>${escapeHtml(label)}</span>`;
  }

  function installMediaListStyles() {
    if (document.getElementById('rdapMediaListReadabilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdapMediaListReadabilityStyle';
    style.textContent = `
      [data-page-panel="media-library"] .rdap-media-list{
        display:grid;
        gap:10px;
        width:100%;
      }
      [data-page-panel="media-library"] .rdap-media-item{
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:10px 14px;
        align-items:start;
        padding:12px 14px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(27,216,255,.025));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }
      [data-page-panel="media-library"] .rdap-media-main{
        min-width:0;
        display:grid;
        gap:5px;
      }
      [data-page-panel="media-library"] .rdap-media-title{
        display:block;
        min-width:0;
        font-size:15px;
        line-height:1.25;
        font-weight:900;
        color:var(--text);
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      [data-page-panel="media-library"] .rdap-media-path{
        display:block;
        min-width:0;
        font-size:11.5px;
        line-height:1.3;
        color:var(--muted);
        opacity:.72;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      [data-page-panel="media-library"] .rdap-media-meta{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        justify-content:flex-end;
        align-items:center;
      }
      [data-page-panel="media-library"] .rdap-media-meta-chip{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:28px;
        padding:6px 9px;
        border-radius:999px;
        font-size:12px;
        line-height:1;
        white-space:nowrap;
        color:var(--text);
        background:rgba(255,255,255,.07);
        border:1px solid rgba(255,255,255,.09);
      }
      [data-page-panel="media-library"] .rdap-media-meta-chip.rdap-media-area{
        border-color:rgba(27,216,255,.26);
        background:rgba(27,216,255,.10);
      }
      [data-page-panel="media-library"] .rdap-media-list-note{
        margin-top:8px;
        font-size:12px;
        color:var(--muted);
        opacity:.75;
      }
      @media (max-width:900px){
        [data-page-panel="media-library"] .rdap-media-item{
          grid-template-columns:1fr;
        }
        [data-page-panel="media-library"] .rdap-media-meta{
          justify-content:flex-start;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function mountPanel(html) {
    const content = getContentRoot();
    if (!content) return null;

    let panel = document.querySelector(`[data-page-panel="${PAGE_ID}"]`);
    const holder = document.createElement('div');
    holder.innerHTML = html.trim();
    const nextPanel = holder.firstElementChild;
    if (!nextPanel) return panel;

    if (panel && panel.parentNode) panel.replaceWith(nextPanel);
    else {
      const footer = content.querySelector('.footer');
      if (footer) content.insertBefore(nextPanel, footer);
      else content.appendChild(nextPanel);
    }

    bindPanelActions(nextPanel);
    syncRouterActiveState();
    return nextPanel;
  }

  function syncRouterActiveState() {
    if (!window.RdapMainRouter || typeof window.RdapMainRouter.getCurrentPage !== 'function') return;
    if (window.RdapMainRouter.getCurrentPage() !== PAGE_ID) return;

    document.querySelectorAll('[data-page-panel]').forEach((panel) => {
      const active = panel.dataset.pagePanel === PAGE_ID;
      panel.hidden = !active;
      panel.classList.toggle('is-active-view', active);
    });
  }

  function mountRenderError(err) {
    const message = err && err.message ? err.message : String(err || 'media_ui_render_failed');
    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>UI konnte nicht gerendert werden.</p></div>
        </section>
        <section class="page-grid">
          <article class="cgn-card span2"><div class="admin-lock-note"><i>!</i><div><strong>${escapeHtml(message)}</strong><span>Die Ansicht bleibt read-only.</span></div></div></article>
        </section>
      </section>`);
  }

  function safeRender() {
    try {
      render();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'media_ui_render_failed');
      mountRenderError(err);
      if (window.console && typeof window.console.error === 'function') window.console.error('media_ui_render_failed', err);
    }
  }

  function registerModuleAndPage() {
    if (!window.RemoteModboardModules) return;
    if (typeof window.RemoteModboardModules.registerModule === 'function') {
      window.RemoteModboardModules.registerModule({
        id: MODULE_ID,
        labelKey: 'module.media.label',
        descriptionKey: 'module.media.description',
        label: 'Media',
        description: 'Medien fuer Stream-Module.',
        icon: '▣',
        order: 25,
        runtime: 'both',
        permission: 'media.read',
        navSubId: 'nav-media'
      });
    }
    if (typeof window.RemoteModboardModules.registerPage === 'function') {
      window.RemoteModboardModules.registerPage({
        moduleId: MODULE_ID,
        pageId: PAGE_ID,
        labelKey: 'page.media.library.label',
        titleKey: 'page.media.library.title',
        descriptionKey: 'page.media.library.description',
        tabKey: 'page.media.library.tab',
        label: 'Medienuebersicht',
        title: 'Media-System',
        tab: 'read-only',
        section: 'Media',
        order: 10,
        permission: 'media.read',
        runtime: 'both',
        script: '/assets/modules/media/library.js'
      });
    }
  }

  function inventoryItems() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const items = Array.isArray(inventory.items) ? inventory.items : [];
    if (state.filter === 'all') return items;
    if (state.filter === 'sounds' || state.filter === 'videos' || state.filter === 'images') return items.filter(item => item && item.rootKey === state.filter);
    return items.filter(item => item && item.kind === state.filter);
  }

  function renderRootRows(data) {
    const inventory = safeObject(data && data.inventory);
    const groups = safeObject(inventory.groups);
    const roots = Array.isArray(data && data.plannedRoots) ? data.plannedRoots : [];

    if (!roots.length) {
      return '<div class="module-row"><span class="module-icon purple">MED</span><div><b>Noch keine Bereiche gemeldet</b><small>Die read-only Ansicht ist vorbereitet.</small></div></div>';
    }

    return roots.map((root) => {
      const safeRoot = safeObject(root);
      const group = safeObject(groups[safeRoot.key]);
      const count = Number(group.count || 0);
      return `<div class="module-row">
        <span class="module-icon cyan">${escapeHtml(String(safeRoot.key || 'med').slice(0, 3).toUpperCase())}</span>
        <div>
          <b>${escapeHtml(safeRoot.label || safeRoot.key || 'Media')}</b>
          <small>${count} Medien</small>
        </div>
      </div>`;
    }).join('');
  }

  function renderInventoryList() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const items = inventoryItems();

    if (!inventory.active) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Noch keine Medienliste aktiv.</strong><span>Online wartet die Ansicht auf den Stream-PC/Agent. Lokal wird das Inventar angezeigt, wenn die Medienordner erreichbar sind.</span></div></div>';
    }

    if (!items.length) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Keine Medien fuer diesen Filter.</strong><span>Waehle einen anderen Filter.</span></div></div>';
    }

    const cards = items.slice(0, 500).map((item) => {
      const safeItem = safeObject(item);
      const title = safeItem.name || safeItem.relativePath || 'Unbenannte Datei';
      const path = safeItem.relativePath && safeItem.relativePath !== safeItem.name ? safeItem.relativePath : '';
      const area = safeItem.rootLabel || safeItem.rootKey || 'Media';
      return `<article class="rdap-media-item">
        <div class="rdap-media-main">
          <strong class="rdap-media-title">${escapeHtml(title)}</strong>
          ${path ? `<small class="rdap-media-path">${escapeHtml(path)}</small>` : ''}
        </div>
        <div class="rdap-media-meta">
          <span class="rdap-media-meta-chip rdap-media-area">${escapeHtml(area)}</span>
          <span class="rdap-media-meta-chip">${escapeHtml(formatBytes(safeItem.sizeBytes))}</span>
          <span class="rdap-media-meta-chip">${escapeHtml(formatDate(safeItem.modifiedAt))}</span>
        </div>
      </article>`;
    }).join('');

    const limitNote = items.length > 500 ? '<p class="rdap-media-list-note">Es werden die ersten 500 Medien dieses Filters angezeigt.</p>' : '';
    return `<div class="rdap-media-list">${cards}</div>${limitNote}`;
  }

  function renderFilters(data) {
    const inventory = safeObject(data && data.inventory);
    const counts = safeObject(inventory.counts);
    const filters = [
      ['all', `Alle (${counts.returned || counts.total || 0})`],
      ['sounds', `Sounds (${counts.sounds || 0})`],
      ['images', `Bilder (${counts.images || 0})`],
      ['videos', `Videos (${counts.videos || 0})`]
    ];
    return filters.map(([key, label]) => `<button class="secondaryButton small ${state.filter === key ? 'is-active' : ''}" type="button" data-media-filter="${escapeHtml(key)}">${escapeHtml(label)}</button>`).join(' ');
  }

  function render() {
    installMediaListStyles();

    const data = safeObject(state.data);
    const mode = safeObject(data.mode);
    const inventory = safeObject(data.inventory);
    const counts = safeObject(inventory.counts);

    const runtimeLabel = data.runtimeMode === 'local' || mode.local ? 'Lokal' : 'Online';
    const inventoryCount = counts.returned || counts.total || 0;
    const inventoryStatus = inventory.active ? `${inventoryCount} Medien${inventory.truncated ? ' · gekuerzt' : ''}` : 'Inventar folgt';
    const statusText = state.error ? 'Fehler' : (state.loading ? 'Lade...' : (inventory.active ? 'Inventar aktiv · read-only' : 'Read-only vorbereitet'));
    const truncatedNotice = inventory.truncated ? `<div class="admin-lock-note"><i>!</i><div><strong>Liste gekuerzt.</strong><span>Es werden ${escapeHtml(String(inventoryCount || inventory.limit || 0))} Medien angezeigt.</span></div></div>` : '';
    const readOnlyNotice = '<div class="admin-lock-note"><i>i</i><div><strong>Diese Ansicht ist read-only.</strong><span>Dateien kommen vom Stream-PC/Agent. Upload, Bearbeiten und Loeschen sind deaktiviert.</span></div></div>';

    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>${escapeHtml(statusText)}</p></div>
        </section>

        <section class="metric-grid">
          <article class="metric-card cgn-card"><span>Modus</span><strong>${escapeHtml(runtimeLabel)}</strong><small>Online/Lokal</small><div class="cgn-progress"><i style="width:70%"></i></div></article>
          <article class="metric-card cgn-card"><span>Inventar</span><strong>${escapeHtml(inventoryStatus)}</strong><small>${escapeHtml(inventory.active ? 'aktiv' : 'wartet')}</small><div class="cgn-progress ${inventory.active ? '' : 'cgn-progress--warn'}"><i style="width:${inventory.active ? '80' : '15'}%"></i></div></article>
          <article class="metric-card cgn-card"><span>Status</span><strong>Read-only</strong><small>keine Bearbeitung</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        </section>

        <section class="page-grid">
          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Bereiche</p><h2>Media-Bereiche</h2></div>${chip('read-only', 'info')}</div>
            <div class="module-list">${renderRootRows(data)}</div>
          </article>

          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Hinweis</p><h2>Nur ansehen</h2></div>${chip('gesperrt', 'warn')}</div>
            ${readOnlyNotice}
          </article>

          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Inventar</p><h2>Medienliste</h2></div>${chip(inventory.active ? 'Inventar aktiv' : 'wartet', inventory.active ? 'ok' : 'warn')}</div>
            <div class="login-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-bottom:12px">${renderFilters(data)} <button class="secondaryButton small" type="button" data-media-refresh="1">Neu laden</button></div>
            ${truncatedNotice}
            ${renderInventoryList()}
          </article>
        </section>
      </section>`);
  }

  function bindPanelActions(panel) {
    panel.querySelectorAll('[data-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.getAttribute('data-media-filter') || 'all';
        safeRender();
      });
    });
    const refresh = panel.querySelector('[data-media-refresh]');
    if (refresh) refresh.addEventListener('click', () => loadStatus());
  }

  async function loadStatus() {
    if (state.loading) return;
    state.loading = true;
    state.error = '';
    safeRender();

    try {
      const res = await fetch(STATUS_URL, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body || body.ok !== true) throw new Error(body && body.error ? body.error : `HTTP ${res.status}`);
      state.data = body;
      state.loaded = true;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'media_status_failed');
      state.data = {
        runtimeMode: 'unknown',
        summary: `Media-Status konnte nicht geladen werden: ${state.error}`,
        mode: { local: false },
        inventory: { active: false, items: [], counts: {} },
        permissions: {},
        plannedRoots: [],
        allowedExtensions: [],
        sourceInfo: { primary: 'agent_memory', primaryActive: false, dbIndexChecked: false, dbIndexAvailable: null, fallbackEnabled: false, writesEnabled: false }
      };
    } finally {
      state.loading = false;
      safeRender();
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    installMediaListStyles();
    registerModuleAndPage();
    safeRender();
    loadStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
