'use strict';

(function registerMediaLibraryModule() {
  const MODULE_ID = 'media';
  const PAGE_ID = 'media-library';
  const STATUS_URL = '/api/remote/media/status';
  const CONTEXT_URL = '/api/remote/media/index/context/list';
  const DEFAULT_PAGE_SIZE = 50;
  const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

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
    pageSize: DEFAULT_PAGE_SIZE,
    detailItem: null,
    syncDialogOpen: false,
    contextLoading: false,
    contextError: '',
    contextData: null,
    contextFilters: {
      rootKey: 'media',
      moduleKey: '',
      categoryKey: '',
      fullCategoryKey: '',
      kind: ''
    }
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

  function mediaKindOptionLabel(kind) {
    const value = String(kind || '').toLowerCase();
    if (!value) return 'Alle Dateitypen';
    if (value === 'audio') return 'Sounds';
    if (value === 'image') return 'Bilder';
    if (value === 'video') return 'Videos';
    return 'Sonstige';
  }

  function friendlyContextLabel(value) {
    const key = String(value || '').trim();
    if (!key) return '';
    return key
      .replace(/[_-]+/g, ' ')
      .replace(/\w/g, char => char.toUpperCase());
  }

  function contextModuleOptions() {
    return [
      ['', 'Alle Bereiche'],
      ['alerts', 'Alerts'],
      ['general', 'Allgemein'],
      ['stream_events', 'Stream-Events'],
      ['vip', 'VIP'],
      ['commands', 'Commands'],
      ['channelpoints', 'Kanalpunkte'],
      ['birthday', 'Geburtstag'],
      ['shot_alarm', 'Shot-Alarm'],
      ['vip30', 'VIP30'],
      ['audio', 'Audio'],
      ['hypetrain', 'Hype-Train'],
      ['twitch_events', 'Twitch-Events']
    ];
  }

  function contextCategoryOptions(moduleKey) {
    const key = String(moduleKey || '').trim().toLowerCase();
    const map = {
      alerts: [['bits', 'Bits'], ['donation', 'Donation'], ['follow', 'Follow'], ['kofi', 'Ko-fi'], ['raid', 'Raid'], ['sub', 'Sub'], ['tipeee', 'Tipeee']],
      general: [['audio', 'Audio'], ['general', 'Allgemein'], ['images', 'Bilder'], ['intro', 'Intro'], ['outro', 'Outro'], ['test', 'Test'], ['transitions', 'Transitions'], ['video', 'Video']],
      stream_events: [['1-jahres-event', '1-Jahres-Event']],
      vip: [['general', 'Allgemein']],
      commands: [['general', 'Allgemein'], ['roxxy', 'Roxxy']],
      channelpoints: [['general', 'Allgemein']],
      birthday: [['default-song', 'Default-Song'], ['general', 'Allgemein'], ['party-songs', 'Party-Songs'], ['user-songs', 'User-Songs']],
      shot_alarm: [['shot-system', 'Shot-System']],
      vip30: [['general', 'Allgemein']],
      hypetrain: [['general', 'Allgemein']],
      twitch_events: [['hypetrain', 'Hype-Train']]
    };
    return [['', key ? 'Alle Ordner' : 'Erst Bereich waehlen'], ...(map[key] || [])];
  }

  function selectedContextText() {
    const filters = safeObject(state.contextFilters);
    const parts = [];
    if (filters.moduleKey) parts.push(friendlyContextLabel(filters.moduleKey));
    if (filters.categoryKey) parts.push(friendlyContextLabel(filters.categoryKey));
    if (filters.kind) parts.push(mediaKindOptionLabel(filters.kind));
    return parts.join(' / ') || 'Alle Dateien';
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
      [data-page-panel="media-library"] .rdap-media-context-controls{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
        gap:8px;
        align-items:end;
      }
      [data-page-panel="media-library"] .rdap-media-context-field{
        display:grid;
        gap:4px;
      }
      [data-page-panel="media-library"] .rdap-media-context-field span{
        color:var(--muted);
        font-size:11px;
        font-weight:800;
        letter-spacing:.03em;
        text-transform:uppercase;
      }
      [data-page-panel="media-library"] .rdap-media-search,
      [data-page-panel="media-library"] .rdap-media-select{
        min-height:38px;
        border-radius:999px;
        border:1px solid rgba(145,100,255,.24);
        background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(27,216,255,.035));
        color:var(--text);
        padding:8px 13px;
        outline:none;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.045);
        color-scheme:dark;
      }
      [data-page-panel="media-library"] .rdap-media-search:focus,
      [data-page-panel="media-library"] .rdap-media-select:focus{
        border-color:rgba(27,216,255,.52);
        box-shadow:0 0 0 1px rgba(27,216,255,.18),0 0 18px rgba(27,216,255,.12),inset 0 1px 0 rgba(255,255,255,.06);
      }
      [data-page-panel="media-library"] .rdap-media-select{
        appearance:none;
        background-image:
          linear-gradient(145deg,rgba(255,255,255,.07),rgba(27,216,255,.035)),
          linear-gradient(45deg,transparent 50%,var(--cyan) 50%),
          linear-gradient(135deg,var(--cyan) 50%,transparent 50%);
        background-position:
          0 0,
          calc(100% - 17px) 50%,
          calc(100% - 11px) 50%;
        background-size:
          auto,
          6px 6px,
          6px 6px;
        background-repeat:no-repeat;
        padding-right:32px;
      }
      [data-page-panel="media-library"] .rdap-media-select option{
        background:#111733;
        color:#f7f8ff;
      }
      [data-page-panel="media-library"] .rdap-media-search{
        min-width:min(320px,100%);
        flex:1 1 240px;
      }
      [data-page-panel="media-library"] .rdap-media-select{
        flex:0 0 auto;
      }
      [data-page-panel="media-library"] .rdap-media-layout-wide,
      [data-page-panel="media-library"] .rdap-media-inventory-card{
        grid-column:1 / -1;
        align-self:start;
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

      [data-page-panel="media-library"] .rdap-media-sync-card{
        display:grid;
        gap:10px;
        align-self:start;
        min-height:0;
      }
      [data-page-panel="media-library"] .rdap-media-sync-progress{
        display:grid;
        gap:6px;
      }
      [data-page-panel="media-library"] .rdap-media-sync-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.09);
        border:1px solid rgba(255,255,255,.08);
      }
      [data-page-panel="media-library"] .rdap-media-sync-bar i{
        display:block;
        height:100%;
        width:0%;
        background:linear-gradient(90deg,rgba(27,216,255,.55),rgba(178,108,255,.75));
      }
      [data-page-panel="media-library"] .rdap-media-sync-meta{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        align-items:center;
        color:var(--muted);
        font-size:12px;
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

  function contextItemsActive() {
    const contextData = safeObject(state.contextData);
    return contextData.ok === true && Array.isArray(contextData.items);
  }

  function contextSummary() {
    const context = safeObject(state.contextData);
    const count = contextItemsActive() ? Number(context.count || (Array.isArray(context.items) ? context.items.length : 0) || 0) : 0;
    const total = contextItemsActive() ? Number(context.total || count || 0) : 0;
    const returned = Math.max(0, Number.isFinite(count) ? count : 0);
    const totalSeen = Math.max(returned, Number.isFinite(total) ? total : returned);
    const percent = totalSeen > 0 ? Math.round((returned / totalSeen) * 100) : 0;
    return {
      active: contextItemsActive(),
      count: returned,
      total: totalSeen,
      truncated: totalSeen > returned,
      percent: Math.max(0, Math.min(100, percent)),
      filters: safeObject(context.filters)
    };
  }

  function rawInventoryItems() {
    if (contextItemsActive()) {
      return Array.isArray(state.contextData.items) ? state.contextData.items : [];
    }
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    return Array.isArray(inventory.items) ? inventory.items : [];
  }

  function filteredInventoryItems() {
    let items = rawInventoryItems();

    if (!contextItemsActive()) {
      if (state.filter === 'sounds' || state.filter === 'videos' || state.filter === 'images') {
        items = items.filter(item => item && item.rootKey === state.filter);
      } else if (state.filter !== 'all') {
        items = items.filter(item => item && item.kind === state.filter);
      }
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

  function currentPageSize() {
    const size = Number(state.pageSize || DEFAULT_PAGE_SIZE);
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }

  function pagedInventoryItems(items) {
    const pageSize = currentPageSize();
    if (contextItemsActive()) {
      const context = contextSummary();
      const totalPages = Math.max(1, Math.ceil(context.total / pageSize));
      const page = Math.min(Math.max(1, Number(state.page || 1)), totalPages);
      state.page = page;
      const start = (page - 1) * pageSize;
      return {
        page,
        pageSize,
        totalPages,
        start,
        end: Math.min(start + items.length, context.total),
        total: context.total,
        items
      };
    }

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(1, Number(state.page || 1)), totalPages);
    state.page = page;
    const start = (page - 1) * pageSize;
    return {
      page,
      pageSize,
      totalPages,
      start,
      end: Math.min(start + pageSize, items.length),
      total: items.length,
      items: items.slice(start, start + pageSize)
    };
  }

  function renderRootRows(data) {
    const context = contextSummary();
    if (context.active) {
      return `<div class="module-row">
        <span class="module-icon cyan">MED</span>
        <div>
          <b>Dateiauswahl</b>
          <small>${escapeHtml(String(context.count))} von ${escapeHtml(String(context.total))} Dateien · ${escapeHtml(selectedContextText())}</small>
        </div>
      </div>`;
    }

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

  function syncFoundation() {
    const data = safeObject(state.data);
    return safeObject(data.syncFoundation || (safeObject(data.syncInfo).syncFoundation) || safeObject(safeObject(data.inventory).syncFoundation));
  }

  function mediaDbReadActive(data) {
    const safeData = safeObject(data);
    const sourceInfo = safeObject(safeData.sourceInfo);
    const onlineIndex = safeObject(safeData.onlineIndexTarget);
    const inventory = safeObject(safeData.inventory);
    const source = String(inventory.source || sourceInfo.primary || '').toLowerCase();
    return source === 'remote_media_index_readonly'
      || String(sourceInfo.primary || '').toLowerCase() === 'remote_media_index'
      || onlineIndex.activeAsReadSource === true;
  }

  function syncProgress(sync) {
    const context = contextSummary();
    if (context.active) {
      return {
        state: context.truncated ? 'context_limited' : 'context_complete',
        returned: context.count,
        totalSeen: context.total,
        percent: context.percent,
        truncated: context.truncated
      };
    }

    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const counts = safeObject(inventory.counts);
    const dbReadActive = mediaDbReadActive(data);

    if (dbReadActive) {
      const itemLength = Array.isArray(inventory.items) ? inventory.items.length : 0;
      const returned = Number(counts.returned || counts.total || itemLength || 0);
      const totalSeen = Number(counts.totalSeen || counts.total || returned || 0);
      const truncated = inventory.truncated === true || returned < totalSeen;
      const percent = totalSeen > 0 ? Math.round((returned / totalSeen) * 100) : 0;
      return {
        state: truncated ? 'compact_limited' : 'complete',
        returned,
        totalSeen,
        percent: Math.max(0, Math.min(100, Math.round(percent))),
        truncated
      };
    }

    const progress = safeObject(sync && sync.progress);
    const returned = Number(progress.returned || counts.returned || 0);
    const totalSeen = Number(progress.totalSeen || counts.totalSeen || returned || 0);
    const percent = Number.isFinite(Number(progress.percent)) ? Number(progress.percent) : (totalSeen > 0 ? Math.round((returned / totalSeen) * 100) : 0);
    return {
      state: progress.state || (sync && sync.currentLimitProblemVisible ? 'compact_limited' : 'idle'),
      returned,
      totalSeen,
      percent: Math.max(0, Math.min(100, Math.round(percent))),
      truncated: progress.truncated === true || (sync && sync.currentLimitProblemVisible === true)
    };
  }

  function syncStateLabel(value) {
    const stateText = String(value || '').toLowerCase();
    if (stateText === 'running') return 'Synchronisiert';
    if (stateText === 'complete') return 'Vollstaendig';
    if (stateText === 'failed') return 'Fehler';
    if (stateText === 'compact_limited') return 'Unvollstaendig';
    if (stateText === 'context_limited') return 'Kontext aktiv';
    if (stateText === 'context_complete') return 'Kontext komplett';
    if (stateText === 'local_direct_read') return 'Lokal direkt';
    if (stateText === 'available') return 'Verfuegbar';
    return 'Bereit';
  }

  function renderSyncStatusCard() {
    const data = safeObject(state.data);
    const sync = syncFoundation();
    const progress = syncProgress(sync);
    const onlineIndex = safeObject(data.onlineIndexTarget);
    const isOnline = data.runtimeMode !== 'local' && !safeObject(data.mode).local;
    const dbReadActive = mediaDbReadActive(data);
    const status = syncStateLabel(progress.state);
    const context = contextSummary();
    const dbText = context.active
      ? 'Auswahl aktiv'
      : (isOnline
        ? (dbReadActive ? 'Online-DB aktiv' : 'Online-DB vorbereitet')
        : 'Lokal liest direkt');
    const detail = context.active
      ? `${progress.returned} von ${progress.totalSeen || progress.returned} Dateien geladen. Diese Ansicht ist read-only.`
      : (dbReadActive
        ? `${progress.returned} Medien aus dem Online-Index geladen. DB-Read-Source ist read-only aktiv.`
        : (sync.currentLimitProblemVisible
          ? `Aktuell kommen ${progress.returned} von ${progress.totalSeen} Dateien online an. Full-Sync in Chunks ist als naechster DB-Schritt vorbereitet.`
          : (isOnline ? 'Online-Index und Sync-Fortschritt sind vorbereitet. Produktive DB-Writes folgen separat.' : 'Lokal ist der Stream-PC die Datei-Wahrheit.')));
    const chipKind = context.active ? 'info' : (progress.truncated ? 'warn' : 'info');
    const footerLabel = context.active ? 'Auswahl read-only' : (dbReadActive ? 'DB Read-only' : 'Read-only Foundation');
    return `<article class="cgn-card span2 rdap-media-sync-card">
      <div class="card-head"><div><p class="cgn-eyebrow">${context.active ? 'Auswahl-Status' : 'Sync-Status'}</p><h2>${context.active ? 'Dateiauswahl' : 'Media-Synchronisierung'}</h2></div>${chip(status, chipKind)}</div>
      <div class="rdap-media-sync-progress">
        <div class="rdap-media-sync-meta"><strong>${escapeHtml(dbText)}</strong><span>${escapeHtml(detail)}</span></div>
        <div class="rdap-media-sync-bar" aria-label="Sync-Fortschritt"><i style="width:${escapeHtml(String(progress.percent))}%"></i></div>
        <div class="rdap-media-sync-meta"><span>${escapeHtml(String(progress.returned))} / ${escapeHtml(String(progress.totalSeen || progress.returned))} Dateien</span><span>${escapeHtml(String(progress.percent))}%</span><span>${escapeHtml(footerLabel)}</span></div>
      </div>
      <div class="login-actions" style="justify-content:flex-start;flex-wrap:wrap"><button class="secondaryButton small" type="button" data-media-sync-detail="1">Sync-Info</button></div>
    </article>`;
  }

  function renderSyncDetailModal() {
    if (!state.syncDialogOpen) return '';
    const data = safeObject(state.data);
    const sync = syncFoundation();
    const progress = syncProgress(sync);
    const onlineIndex = safeObject(data.onlineIndexTarget);
    const rows = [
      ['Status', syncStateLabel(progress.state)],
      ['Fortschritt', `${progress.returned} / ${progress.totalSeen || progress.returned} Dateien (${progress.percent}%)`],
      ['Online-Ziel', onlineIndex.table ? `${onlineIndex.database || 'remote_modboard_mariadb'}.${onlineIndex.table}` : (sync.onlineDatabaseTarget || 'remote_modboard_mariadb.remote_media_index')],
      ['Full-Sync', mediaDbReadActive(data) ? 'Online-Index ist befuellt und als Read-Source aktiv' : (sync.fullSyncPrepared || sync.fullSyncChunkProtocolPlanned ? 'vorbereitet, spaeter in Chunks' : 'nicht aktiv')],
      ['Delta-Sync', sync.deltaSyncPrepared ? 'vorbereitet' : 'nicht aktiv'],
      ['Online → Agent', sync.onlineToAgentQueuePlanned || sync.bidirectionalSyncPlanned ? 'Auftragsqueue geplant' : 'nicht aktiv'],
      ['Aktive Writes', sync.activeWrites || onlineIndex.activeWrites || onlineIndex.dataWritesEnabled ? 'ja' : 'nein'],
      ['Hinweis', mediaDbReadActive(data) ? '0.2.56A zeigt den DB-Read-Source-Status in der UI korrekt an. Writes bleiben deaktiviert.' : (sync.note || '0.2.53 bereitet Status und Zielarchitektur vor.')]
    ];
    return `<div class="rdap-media-detail-backdrop" data-media-close-sync="1" role="presentation">
      <section class="rdap-media-detail-dialog" role="dialog" aria-modal="true" aria-label="Media-Sync-Status">
        <div class="rdap-media-detail-head">
          <div><p class="cgn-eyebrow">Media-Sync</p><h3 class="rdap-media-detail-title">Daten werden synchronisiert / vorbereitet</h3></div>
          <button class="secondaryButton small" type="button" data-media-close-sync="1">Schliessen</button>
        </div>
        <div class="rdap-media-sync-progress" style="margin-bottom:12px">
          <div class="rdap-media-sync-bar"><i style="width:${escapeHtml(String(progress.percent))}%"></i></div>
          <div class="rdap-media-sync-meta"><span>${escapeHtml(String(progress.returned))} / ${escapeHtml(String(progress.totalSeen || progress.returned))} Dateien</span><span>${escapeHtml(String(progress.percent))}%</span></div>
        </div>
        <div class="rdap-media-detail-grid">
          ${rows.map(([label, value]) => `<div class="rdap-media-detail-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join('')}
        </div>
      </section>
    </div>`;
  }

  function renderInventoryList() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const items = filteredInventoryItems();

    if (!inventory.active && !contextItemsActive()) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Noch keine Medienliste aktiv.</strong><span>Online wartet die Ansicht auf den Stream-PC/Agent. Lokal wird das Inventar angezeigt, wenn die Medienordner erreichbar sind.</span></div></div>';
    }

    if (!items.length) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Keine Medien gefunden.</strong><span>Suche oder Kontext-Filter anpassen.</span></div></div>';
    }

    const pageData = pagedInventoryItems(items);
    const cards = pageData.items.map((item, index) => {
      const safeItem = safeObject(item);
      const itemIndex = contextItemsActive() ? index : pageData.start + index;
      const title = mediaTitle(safeItem);
      const area = mediaArea(safeItem);
      const kind = mediaKindLabel(safeItem);
      return `<article class="rdap-media-item">
        <span class="rdap-media-kind">${escapeHtml(kind)}</span>
        <div class="rdap-media-main">
          <strong class="rdap-media-title">${escapeHtml(title)}</strong>
          <span class="rdap-media-subline"><span>${escapeHtml(area)}</span>${safeItem.fullCategoryKey ? `<span>${escapeHtml(safeItem.fullCategoryKey)}</span>` : ''}</span>
        </div>
        <div class="rdap-media-meta">
          <span class="rdap-media-meta-chip">${escapeHtml(formatBytes(safeItem.sizeBytes))}</span>
          <button class="secondaryButton small" type="button" data-media-detail-index="${escapeHtml(String(itemIndex))}">Info</button>
        </div>
      </article>`;
    }).join('');

    const from = pageData.start + 1;
    const to = pageData.end;
    const totalLabel = pageData.total || items.length;
    const pager = `<div class="rdap-media-pager">
      <span class="rdap-media-page-info">${escapeHtml(String(from))}-${escapeHtml(String(to))} von ${escapeHtml(String(totalLabel))} Dateien</span>
      <span class="login-actions" style="justify-content:flex-end;flex-wrap:wrap">
        <button class="secondaryButton small" type="button" data-media-page="prev" ${pageData.page <= 1 ? 'disabled' : ''}>Zurueck</button>
        <button class="secondaryButton small" type="button" data-media-page="next" ${pageData.page >= pageData.totalPages ? 'disabled' : ''}>Weiter</button>
      </span>
    </div>`;
    return `<div class="rdap-media-list">${cards}</div>${pager}`;
  }

  function renderFilters(data) {
    const context = contextSummary();
    if (context.active) {
      return '<button class="secondaryButton small" type="button" data-media-context-clear="1">Filter zuruecksetzen</button>';
    }

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


  function renderContextControls() {
    const filters = safeObject(state.contextFilters);
    const moduleOptions = contextModuleOptions();
    const categoryOptions = contextCategoryOptions(filters.moduleKey);
    const kindOptions = [['', 'Alle Dateitypen'], ['audio', 'Sounds'], ['image', 'Bilder'], ['video', 'Videos']];
    return `<div class="rdap-media-context-controls">
      <label class="rdap-media-context-field"><span>Bereich</span><select class="rdap-media-select" data-media-context-module="1">${moduleOptions.map(([key, label]) => `<option value="${escapeHtml(key)}" ${filters.moduleKey === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
      <label class="rdap-media-context-field"><span>Ordner</span><select class="rdap-media-select" data-media-context-category="1">${categoryOptions.map(([key, label]) => `<option value="${escapeHtml(key)}" ${filters.categoryKey === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
      <label class="rdap-media-context-field"><span>Dateityp</span><select class="rdap-media-select" data-media-context-kind="1">${kindOptions.map(([key, label]) => `<option value="${escapeHtml(key)}" ${filters.kind === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></label>
      <label class="rdap-media-context-field"><span>Anzahl</span><select class="rdap-media-select" data-media-page-size="1" title="Dateien pro Seite">${PAGE_SIZE_OPTIONS.map(size => `<option value="${escapeHtml(String(size))}" ${currentPageSize() === size ? 'selected' : ''}>${escapeHtml(String(size))} pro Seite</option>`).join('')}</select></label>
      <button class="secondaryButton small" type="button" data-media-context-load="1" ${state.contextLoading ? 'disabled' : ''}>Anzeigen</button>
    </div>`;
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
      ['Quelle', item.rootKey || '—'],
      ['Dateityp intern', item.kind || '—'],
      ['Bereich', item.moduleKey || '—'],
      ['Ordner', item.categoryKey || '—'],
      ['Bereich/Ordner', item.fullCategoryKey || '—'],
      ['Web-Pfad', item.webPath || item.publicPath || '—']
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
    const context = contextSummary();
    const inventoryStatus = context.active ? `${context.total} Dateien` : (inventory.active ? `${inventoryCount} Medien${inventory.truncated ? ' · gekuerzt' : ''}` : 'Inventar folgt');
    const statusText = state.error ? 'Fehler' : (state.loading || state.contextLoading ? 'Lade...' : (context.active ? 'Dateiauswahl aktiv · read-only' : (inventory.active ? 'Inventar aktiv · read-only' : 'Read-only vorbereitet')));
    const truncatedNotice = '';
    const contextIntroCards = context.active ? '' : `
          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Bereiche</p><h2>Media-Bereiche</h2></div>${chip('read-only', 'info')}</div>
            <div class="module-list">${renderRootRows(data)}</div>
          </article>

          ${renderSyncStatusCard()}
`;

    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>${escapeHtml(statusText)}</p></div>
        </section>

        <section class="metric-grid">
          <article class="metric-card cgn-card"><span>Modus</span><strong>${escapeHtml(runtimeLabel)}</strong><small>Online/Lokal</small><div class="cgn-progress"><i style="width:70%"></i></div></article>
          <article class="metric-card cgn-card"><span>Inventar</span><strong>${escapeHtml(inventoryStatus)}</strong><small>${escapeHtml(context.active ? 'Auswahl aktiv' : (inventory.active ? 'aktiv' : 'wartet'))}</small><div class="cgn-progress ${inventory.active || context.active ? '' : 'cgn-progress--warn'}"><i style="width:${context.active ? escapeHtml(String(context.percent)) : (inventory.active ? '80' : '15')}%"></i></div></article>
          <article class="metric-card cgn-card"><span>Status</span><strong>Read-only</strong><small>keine Bearbeitung</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        </section>

        <section class="page-grid">
          ${contextIntroCards}
          <article class="cgn-card span2 rdap-media-inventory-card">
            <div class="card-head"><div><p class="cgn-eyebrow">Inventar</p><h2>Medienliste</h2></div></div>
            <div class="rdap-media-toolbar">
              <div class="rdap-media-toolbar-row">${renderFilters(data)} <button class="secondaryButton small" type="button" data-media-refresh="1">Neu laden</button></div>
              <div class="rdap-media-toolbar-row">${renderSortControls()}</div>
              ${renderContextControls()}
            </div>
            ${truncatedNotice}
            ${renderInventoryList()}
          </article>
        </section>
        ${renderDetailModal()}
        ${renderSyncDetailModal()}
      </section>`);
  }

  function bindPanelActions(panel) {
    panel.querySelectorAll('[data-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.getAttribute('data-media-filter') || 'all';
        state.contextData = null;
        state.contextError = '';
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

    const pageSizeSelect = panel.querySelector('[data-media-page-size]');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', () => {
        const nextSize = Number(pageSizeSelect.value || DEFAULT_PAGE_SIZE);
        state.pageSize = PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : DEFAULT_PAGE_SIZE;
        resetListPage();
        if (contextItemsActive()) {
          state.page = 1;
          loadContextItems();
        } else safeRender();
      });
    }

    panel.querySelectorAll('[data-media-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.getAttribute('data-media-page');
        state.page += direction === 'next' ? 1 : -1;
        state.detailItem = null;
        if (contextItemsActive()) loadContextItems();
        else safeRender();
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


    const syncDetail = panel.querySelector('[data-media-sync-detail]');
    if (syncDetail) {
      syncDetail.addEventListener('click', () => {
        state.syncDialogOpen = true;
        state.detailItem = null;
        safeRender();
      });
    }

    panel.querySelectorAll('[data-media-close-sync]').forEach((node) => {
      node.addEventListener('click', (event) => {
        if (event.currentTarget !== event.target && event.currentTarget.classList.contains('rdap-media-detail-backdrop')) return;
        state.syncDialogOpen = false;
        safeRender();
      });
    });

    const contextClear = panel.querySelector('[data-media-context-clear]');
    if (contextClear) contextClear.addEventListener('click', () => {
      state.contextData = null;
      state.contextError = '';
      resetListPage();
      safeRender();
    });

    const contextModule = panel.querySelector('[data-media-context-module]');
    if (contextModule) contextModule.addEventListener('change', () => {
      state.contextFilters.moduleKey = contextModule.value || '';
      state.contextFilters.categoryKey = '';
      state.contextFilters.fullCategoryKey = '';
      resetListPage();
      safeRender();
    });

    const contextCategory = panel.querySelector('[data-media-context-category]');
    if (contextCategory) contextCategory.addEventListener('change', () => {
      state.contextFilters.categoryKey = contextCategory.value || '';
      state.contextFilters.fullCategoryKey = '';
      resetListPage();
      safeRender();
    });

    const contextKind = panel.querySelector('[data-media-context-kind]');
    if (contextKind) contextKind.addEventListener('change', () => {
      state.contextFilters.kind = contextKind.value || '';
      resetListPage();
      safeRender();
    });

    const contextLoad = panel.querySelector('[data-media-context-load]');
    if (contextLoad) contextLoad.addEventListener('click', () => {
      resetListPage();
      loadContextItems();
    });

    const refresh = panel.querySelector('[data-media-refresh]');
    if (refresh) refresh.addEventListener('click', () => { loadStatus(); loadContextItems(); });
  }

  function buildContextQuery() {
    const filters = safeObject(state.contextFilters);
    const params = new URLSearchParams();
    const pageSize = currentPageSize();
    const page = Math.max(1, Number(state.page || 1));
    params.set('limit', String(pageSize));
    params.set('offset', String((page - 1) * pageSize));
    params.set('root_key', filters.rootKey || 'media');
    if (filters.moduleKey) params.set('module_key', filters.moduleKey);
    if (filters.categoryKey) params.set('category_key', filters.categoryKey);
    if (filters.kind) params.set('kind', filters.kind);
    return params.toString();
  }

  async function loadContextItems() {
    if (state.contextLoading) return;
    state.contextLoading = true;
    state.contextError = '';
    safeRender();

    try {
      const res = await fetch(`${CONTEXT_URL}?${buildContextQuery()}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body || body.ok !== true) throw new Error(body && body.error ? body.error : `HTTP ${res.status}`);
      state.contextData = body;
      state.filter = 'all';
      state.detailItem = null;
    } catch (err) {
      state.contextError = err && err.message ? err.message : String(err || 'media_context_failed');
      state.contextData = null;
    } finally {
      state.contextLoading = false;
      safeRender();
    }
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
        sourceInfo: { primary: 'agent_memory', primaryActive: false, dbIndexChecked: false, dbIndexAvailable: null, fallbackEnabled: false, writesEnabled: false },
        syncFoundation: { prepared: true, readOnly: true, progress: { state: 'failed', returned: 0, totalSeen: 0, percent: 0 }, onlineDatabaseIndexPlanned: true, fullSyncPrepared: true, deltaSyncPrepared: true, bidirectionalSyncPlanned: true }
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
    loadContextItems();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
