'use strict';

(function registerMediaLibraryModule() {
  const MODULE_ID = 'media';
  const PAGE_ID = 'media-library';
  const STATUS_URL = '/api/remote/media/status';
  const PAGE_SIZE = 50;

  const state = {
    loaded: false,
    loading: false,
    error: '',
    data: null,
    filter: 'all',
    search: '',
    sortKey: 'name',
    sortDir: 'asc',
    page: 1,
    detailItem: null
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

  function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function mediaTitle(item) {
    const safeItem = safeObject(item);
    return safeItem.displayName || safeItem.title || safeItem.label || safeItem.name || safeItem.relativePath || 'Unbenannte Datei';
  }

  function mediaFileName(item) {
    const safeItem = safeObject(item);
    return safeItem.name || (safeItem.relativePath ? String(safeItem.relativePath).split(/[\\/]/).pop() : '') || 'Unbenannte Datei';
  }

  function mediaArea(item) {
    const safeItem = safeObject(item);
    return safeItem.rootLabel || safeItem.rootKey || 'Media';
  }

  function mediaKindLabel(item) {
    const safeItem = safeObject(item);
    const kind = String(safeItem.kind || safeItem.type || '').toLowerCase();
    const rootKey = String(safeItem.rootKey || '').toLowerCase();
    if (rootKey === 'sounds' || kind === 'audio' || kind === 'sound') return 'Sound';
    if (rootKey === 'images' || kind === 'image') return 'Bild';
    if (rootKey === 'videos' || kind === 'video') return 'Video';
    return 'Media';
  }

  function mediaModifiedMs(item) {
    const value = safeObject(item).modifiedAt;
    const parsed = value ? Date.parse(value) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function compareText(a, b) {
    return String(a || '').localeCompare(String(b || ''), 'de', { numeric: true, sensitivity: 'base' });
  }

  function resetListPage() {
    state.page = 1;
    state.detailItem = null;
  }

  function installMediaListStyles() {
    if (document.getElementById('rdapMediaListReadabilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdapMediaListReadabilityStyle';
    style.textContent = `
      [data-page-panel="media-library"] .rdap-media-toolbar{
        display:grid;
        gap:10px;
        margin-bottom:12px;
      }
      [data-page-panel="media-library"] .rdap-media-toolbar-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        align-items:center;
        justify-content:flex-start;
      }
      [data-page-panel="media-library"] .rdap-media-search,
      [data-page-panel="media-library"] .rdap-media-select{
        min-height:34px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        color:var(--text);
        padding:7px 12px;
        outline:none;
      }
      [data-page-panel="media-library"] .rdap-media-search{
        min-width:min(320px,100%);
        flex:1 1 240px;
      }
      [data-page-panel="media-library"] .rdap-media-select{
        flex:0 0 auto;
      }
      [data-page-panel="media-library"] .rdap-media-list{
        display:grid;
        gap:10px;
        width:100%;
      }
      [data-page-panel="media-library"] .rdap-media-item{
        display:grid;
        grid-template-columns:auto minmax(0,1fr) auto;
        gap:10px 14px;
        align-items:center;
        padding:12px 14px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(27,216,255,.025));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }
      [data-page-panel="media-library"] .rdap-media-kind{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:74px;
        min-height:34px;
        padding:7px 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.02em;
        color:var(--text);
        border:1px solid rgba(27,216,255,.24);
        background:rgba(27,216,255,.10);
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
      [data-page-panel="media-library"] .rdap-media-subline{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        align-items:center;
        color:var(--muted);
        font-size:12px;
        opacity:.78;
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
      [data-page-panel="media-library"] .rdap-media-list-note,
      [data-page-panel="media-library"] .rdap-media-page-info{
        margin-top:8px;
        font-size:12px;
        color:var(--muted);
        opacity:.75;
      }
      [data-page-panel="media-library"] .rdap-media-pager{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        align-items:center;
        justify-content:space-between;
        margin-top:12px;
      }
      [data-page-panel="media-library"] .rdap-media-detail-backdrop{
        position:fixed;
        inset:0;
        z-index:9998;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,0,.56);
        backdrop-filter:blur(8px);
      }
      [data-page-panel="media-library"] .rdap-media-detail-dialog{
        width:min(720px,100%);
        max-height:min(82vh,760px);
        overflow:auto;
        border-radius:22px;
        border:1px solid rgba(255,255,255,.12);
        background:linear-gradient(145deg,rgba(28,20,48,.98),rgba(12,16,30,.98));
        box-shadow:0 24px 70px rgba(0,0,0,.42);
        padding:18px;
      }
      [data-page-panel="media-library"] .rdap-media-detail-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        margin-bottom:14px;
      }
      [data-page-panel="media-library"] .rdap-media-detail-title{
        margin:0;
        font-size:18px;
        line-height:1.25;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      [data-page-panel="media-library"] .rdap-media-detail-grid{
        display:grid;
        gap:8px;
      }
      [data-page-panel="media-library"] .rdap-media-detail-row{
        display:grid;
        grid-template-columns:140px minmax(0,1fr);
        gap:10px;
        padding:9px 0;
        border-top:1px solid rgba(255,255,255,.08);
      }
      [data-page-panel="media-library"] .rdap-media-detail-row span:first-child{
        color:var(--muted);
        font-size:12px;
      }
      [data-page-panel="media-library"] .rdap-media-detail-row span:last-child{
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      @media (max-width:900px){
        [data-page-panel="media-library"] .rdap-media-item{
          grid-template-columns:1fr;
        }
        [data-page-panel="media-library"] .rdap-media-meta{
          justify-content:flex-start;
        }
        [data-page-panel="media-library"] .rdap-media-detail-row{
          grid-template-columns:1fr;
          gap:3px;
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

  function rawInventoryItems() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    return Array.isArray(inventory.items) ? inventory.items : [];
  }

  function filteredInventoryItems() {
    let items = rawInventoryItems();

    if (state.filter === 'sounds' || state.filter === 'videos' || state.filter === 'images') {
      items = items.filter(item => item && item.rootKey === state.filter);
    } else if (state.filter !== 'all') {
      items = items.filter(item => item && item.kind === state.filter);
    }

    const search = normalizeText(state.search);
    if (search) {
      items = items.filter((item) => {
        const safeItem = safeObject(item);
        const haystack = [
          mediaTitle(safeItem),
          mediaFileName(safeItem),
          safeItem.relativePath,
          mediaArea(safeItem),
          mediaKindLabel(safeItem)
        ].map(normalizeText).join(' ');
        return haystack.includes(search);
      });
    }

    const sorted = items.slice().sort((left, right) => {
      const a = safeObject(left);
      const b = safeObject(right);
      let result = 0;
      if (state.sortKey === 'area') result = compareText(mediaArea(a), mediaArea(b)) || compareText(mediaTitle(a), mediaTitle(b));
      else if (state.sortKey === 'size') result = Number(a.sizeBytes || 0) - Number(b.sizeBytes || 0);
      else if (state.sortKey === 'modified') result = mediaModifiedMs(a) - mediaModifiedMs(b);
      else result = compareText(mediaTitle(a), mediaTitle(b));
      return state.sortDir === 'desc' ? result * -1 : result;
    });

    return sorted;
  }

  function pagedInventoryItems(items) {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, Number(state.page || 1)), totalPages);
    state.page = page;
    const start = (page - 1) * PAGE_SIZE;
    return {
      page,
      totalPages,
      start,
      end: Math.min(start + PAGE_SIZE, items.length),
      items: items.slice(start, start + PAGE_SIZE)
    };
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
    const items = filteredInventoryItems();

    if (!inventory.active) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Noch keine Medienliste aktiv.</strong><span>Online wartet die Ansicht auf den Stream-PC/Agent. Lokal wird das Inventar angezeigt, wenn die Medienordner erreichbar sind.</span></div></div>';
    }

    if (!items.length) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Keine Medien gefunden.</strong><span>Suche oder Filter anpassen.</span></div></div>';
    }

    const pageData = pagedInventoryItems(items);
    const cards = pageData.items.map((item, index) => {
      const safeItem = safeObject(item);
      const itemIndex = pageData.start + index;
      const title = mediaTitle(safeItem);
      const fileName = mediaFileName(safeItem);
      const area = mediaArea(safeItem);
      const kind = mediaKindLabel(safeItem);
      return `<article class="rdap-media-item">
        <span class="rdap-media-kind">${escapeHtml(kind)}</span>
        <div class="rdap-media-main">
          <strong class="rdap-media-title">${escapeHtml(title)}</strong>
          <span class="rdap-media-subline"><span>${escapeHtml(area)}</span><span>·</span><span>Datei: ${escapeHtml(fileName)}</span></span>
        </div>
        <div class="rdap-media-meta">
          <span class="rdap-media-meta-chip">${escapeHtml(formatBytes(safeItem.sizeBytes))}</span>
          <button class="secondaryButton small" type="button" data-media-detail-index="${escapeHtml(String(itemIndex))}">Info</button>
        </div>
      </article>`;
    }).join('');

    const from = pageData.start + 1;
    const to = pageData.end;
    const pager = `<div class="rdap-media-pager">
      <span class="rdap-media-page-info">${escapeHtml(String(from))}-${escapeHtml(String(to))} von ${escapeHtml(String(items.length))} Medien · Seite ${escapeHtml(String(pageData.page))}/${escapeHtml(String(pageData.totalPages))}</span>
      <span class="login-actions" style="justify-content:flex-end;flex-wrap:wrap">
        <button class="secondaryButton small" type="button" data-media-page="prev" ${pageData.page <= 1 ? 'disabled' : ''}>Zurueck</button>
        <button class="secondaryButton small" type="button" data-media-page="next" ${pageData.page >= pageData.totalPages ? 'disabled' : ''}>Weiter</button>
      </span>
    </div>`;
    return `<div class="rdap-media-list">${cards}</div>${pager}`;
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

  function renderSortControls() {
    const sortOptions = [
      ['name', 'Sortieren: Name'],
      ['area', 'Sortieren: Bereich'],
      ['size', 'Sortieren: Groesse'],
      ['modified', 'Sortieren: Geaendert']
    ];
    return `<input class="rdap-media-search" type="search" data-media-search="1" placeholder="Suche nach Datei, Bereich oder Typ" value="${escapeHtml(state.search)}">
      <select class="rdap-media-select" data-media-sort="1">${sortOptions.map(([key, label]) => `<option value="${escapeHtml(key)}" ${state.sortKey === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select>
      <button class="secondaryButton small" type="button" data-media-sort-dir="1">${state.sortDir === 'desc' ? 'Z-A' : 'A-Z'}</button>`;
  }

  function renderDetailModal() {
    if (!state.detailItem) return '';
    const item = safeObject(state.detailItem);
    const details = [
      ['Typ', mediaKindLabel(item)],
      ['Bereich', mediaArea(item)],
      ['Dateiname', mediaFileName(item)],
      ['Pfad', item.relativePath || '—'],
      ['Groesse', formatBytes(item.sizeBytes)],
      ['Geaendert', formatDate(item.modifiedAt)],
      ['Root-Key', item.rootKey || '—'],
      ['Kind', item.kind || '—']
    ];
    return `<div class="rdap-media-detail-backdrop" data-media-close-detail="1" role="presentation">
      <section class="rdap-media-detail-dialog" role="dialog" aria-modal="true" aria-label="Media-Details">
        <div class="rdap-media-detail-head">
          <div><p class="cgn-eyebrow">Media-Info</p><h3 class="rdap-media-detail-title">${escapeHtml(mediaTitle(item))}</h3></div>
          <button class="secondaryButton small" type="button" data-media-close-detail="1">Schliessen</button>
        </div>
        <div class="rdap-media-detail-grid">
          ${details.map(([label, value]) => `<div class="rdap-media-detail-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join('')}
        </div>
      </section>
    </div>`;
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
            <div class="rdap-media-toolbar">
              <div class="rdap-media-toolbar-row">${renderFilters(data)} <button class="secondaryButton small" type="button" data-media-refresh="1">Neu laden</button></div>
              <div class="rdap-media-toolbar-row">${renderSortControls()}</div>
            </div>
            ${truncatedNotice}
            ${renderInventoryList()}
          </article>
        </section>
        ${renderDetailModal()}
      </section>`);
  }

  function bindPanelActions(panel) {
    panel.querySelectorAll('[data-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.getAttribute('data-media-filter') || 'all';
        resetListPage();
        safeRender();
      });
    });

    const search = panel.querySelector('[data-media-search]');
    if (search) {
      search.addEventListener('input', () => {
        state.search = search.value || '';
        resetListPage();
        safeRender();
      });
    }

    const sort = panel.querySelector('[data-media-sort]');
    if (sort) {
      sort.addEventListener('change', () => {
        state.sortKey = sort.value || 'name';
        resetListPage();
        safeRender();
      });
    }

    const sortDir = panel.querySelector('[data-media-sort-dir]');
    if (sortDir) {
      sortDir.addEventListener('click', () => {
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
        resetListPage();
        safeRender();
      });
    }

    panel.querySelectorAll('[data-media-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.getAttribute('data-media-page');
        state.page += direction === 'next' ? 1 : -1;
        state.detailItem = null;
        safeRender();
      });
    });

    panel.querySelectorAll('[data-media-detail-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-media-detail-index'));
        const items = filteredInventoryItems();
        state.detailItem = Number.isFinite(index) ? safeObject(items[index]) : null;
        safeRender();
      });
    });

    panel.querySelectorAll('[data-media-close-detail]').forEach((node) => {
      node.addEventListener('click', (event) => {
        if (event.currentTarget !== event.target && event.currentTarget.classList.contains('rdap-media-detail-backdrop')) return;
        state.detailItem = null;
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
      resetListPage();
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
