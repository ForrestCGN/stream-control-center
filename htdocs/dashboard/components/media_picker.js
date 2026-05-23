window.MediaPicker = (function(){
  'use strict';

  const api = {
    options: '/api/media/picker-options',
    categories: '/api/media/categories',
    categoryUpsert: '/api/media/category/upsert',
    upload: '/api/media/upload'
  };

  const TYPE_META = {
    audio: { label: 'Audio', icon: '🔊' },
    video: { label: 'Video', icon: '🎬' },
    image: { label: 'Bild', icon: '🖼️' },
    animation: { label: 'Animation', icon: '✨' }
  };

  const VIEWS = [
    { id: 'recent', label: 'Neueste Uploads' },
    { id: 'module', label: 'Dieses Modul' },
    { id: 'general', label: 'Allgemein' },
    { id: 'all', label: 'Alle Medien' }
  ];

  const state = {
    open: false,
    loading: false,
    uploading: false,
    error: '',
    notice: '',
    config: {},
    view: 'recent',
    type: '',
    categoryKey: '',
    query: '',
    assets: [],
    categories: [],
    selected: null,
    uploadType: '',
    uploadCategoryKey: 'general',
    uploadNewCategoryKey: '',
    uploadNewCategoryLabel: '',
    uploadDisplayName: ''
  };

  let backdrop = null;
  let searchTimer = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function clean(value) {
    return String(value ?? '').trim();
  }

  function allowedTypes() {
    const raw = Array.isArray(state.config.allowedTypes) && state.config.allowedTypes.length
      ? state.config.allowedTypes
      : Object.keys(TYPE_META);
    return raw.filter(type => TYPE_META[type]);
  }

  function moduleKey() {
    return clean(state.config.moduleKey || 'general') || 'general';
  }

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (!n) return '0 B';
    const units = ['B','KB','MB','GB'];
    let value = n;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) { value /= 1024; index += 1; }
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function formatDuration(ms) {
    const total = Math.round(Number(ms || 0) / 1000);
    if (!total) return '-';
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function buildParams() {
    const params = new URLSearchParams();
    const types = allowedTypes();
    const selectedType = clean(state.type);
    params.set('type', selectedType || types.join(','));
    params.set('status', 'active');
    params.set('view', state.view === 'recent' ? 'recent' : 'module');
    params.set('limit', state.view === 'recent' ? '20' : '200');
    if (state.view === 'module') params.set('moduleKey', moduleKey());
    if (state.view === 'general') params.set('moduleKey', 'general');
    if (state.categoryKey) params.set('categoryKey', state.categoryKey);
    if (state.query) params.set('q', state.query);
    return params;
  }

  async function loadCategories() {
    const params = new URLSearchParams();
    params.set('moduleKey', moduleKey());
    const data = await window.CGN.api(`${api.categories}?${params.toString()}`);
    state.categories = Array.isArray(data.categories) ? data.categories : [];
    if (!state.categories.some(cat => cat.categoryKey === state.uploadCategoryKey)) {
      state.uploadCategoryKey = state.categories[0]?.categoryKey || 'general';
    }
  }

  async function loadOptions() {
    if (!window.CGN) throw new Error('Dashboard API nicht verfügbar.');
    state.loading = true;
    state.error = '';
    render();
    try {
      await loadCategories();
      const data = await window.CGN.api(`${api.options}?${buildParams().toString()}`);
      state.assets = Array.isArray(data.options) ? data.options : [];
      if (state.selected && !state.assets.some(asset => Number(asset.id) === Number(state.selected.id))) state.selected = null;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  function viewLabel() {
    return VIEWS.find(view => view.id === state.view)?.label || 'Medien';
  }

  function typeOptions(selected, includeAll) {
    const types = allowedTypes();
    const rows = includeAll ? [`<option value="">Alle erlaubten Typen</option>`] : [];
    for (const type of types) {
      const meta = TYPE_META[type];
      rows.push(`<option value="${esc(type)}" ${selected === type ? 'selected' : ''}>${esc(meta.icon)} ${esc(meta.label)}</option>`);
    }
    return rows.join('');
  }

  function categoryOptions(selected) {
    const rows = [`<option value="">Alle Zusatzkategorien</option>`];
    for (const cat of state.categories) {
      rows.push(`<option value="${esc(cat.categoryKey)}" ${selected === cat.categoryKey ? 'selected' : ''}>${esc(cat.label || cat.categoryKey)}</option>`);
    }
    return rows.join('');
  }

  function uploadCategoryOptions(selected) {
    const rows = [];
    for (const cat of state.categories) {
      rows.push(`<option value="${esc(cat.categoryKey)}" ${selected === cat.categoryKey ? 'selected' : ''}>${esc(cat.label || cat.categoryKey)}</option>`);
    }
    if (!rows.length) rows.push('<option value="general">Allgemein</option>');
    return rows.join('');
  }

  function renderPreview(asset) {
    if (!asset) return '<div class="mp-preview-empty">Kein Medium ausgewählt.</div>';
    const src = esc(asset.webPath || '');
    if (asset.type === 'audio') return `<audio controls preload="metadata" src="${src}"></audio>`;
    if (asset.type === 'video' || asset.type === 'animation') return `<video controls preload="metadata" src="${src}"></video>`;
    if (asset.type === 'image') return `<img src="${src}" alt="${esc(asset.label || asset.fileName || '')}">`;
    return '<div class="mp-preview-empty">Keine Vorschau verfügbar.</div>';
  }

  function renderAssetRows() {
    if (state.loading) return '<div class="mp-empty">Lade Medien...</div>';
    if (!state.assets.length) return '<div class="mp-empty">Keine Medien für diese Auswahl gefunden.</div>';
    return `<div class="mp-list">${state.assets.map(asset => {
      const selected = state.selected && Number(state.selected.id) === Number(asset.id);
      const meta = TYPE_META[asset.type] || { label: asset.type || 'Medium', icon: '📄' };
      return `<button type="button" class="mp-asset ${selected ? 'active' : ''}" data-mp-select="${esc(asset.id)}">
        <span class="mp-asset-icon">${esc(meta.icon)}</span>
        <span class="mp-asset-main"><strong>${esc(asset.label || asset.displayName || asset.fileName || `#${asset.id}`)}</strong><small>${esc(asset.relativePath || '')}</small></span>
        <span class="mp-asset-meta"><em>${esc(asset.moduleKey || 'general')}/${esc(asset.categoryKey || asset.category || 'general')}</em><small>${esc(formatDuration(asset.durationMs))} · ${esc(formatBytes(asset.sizeBytes))}</small></span>
      </button>`;
    }).join('')}</div>`;
  }

  function render() {
    if (!state.open) return;
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'media-picker-backdrop';
      document.body.appendChild(backdrop);
    }

    const title = state.config.title || 'Medium auswählen';
    const selected = state.selected;
    backdrop.innerHTML = `
      <div class="media-picker-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="mp-head">
          <div><h2>${esc(title)}</h2><p>Modul: <strong>${esc(moduleKey())}</strong> · Ansicht: ${esc(viewLabel())}</p></div>
          <button type="button" class="mp-close" data-mp-close>×</button>
        </div>

        <div class="mp-tabs">
          ${VIEWS.map(view => `<button type="button" class="${state.view === view.id ? 'active' : ''}" data-mp-view="${esc(view.id)}">${esc(view.label)}</button>`).join('')}
        </div>

        <div class="mp-filters">
          <label>Typ<select data-mp-type>${typeOptions(state.type, true)}</select></label>
          <label>Zusatzkategorie<select data-mp-category>${categoryOptions(state.categoryKey)}</select></label>
          <label class="mp-grow">Suche<input data-mp-query value="${esc(state.query)}" placeholder="Name, Pfad oder Kategorie"></label>
          <button type="button" data-mp-refresh>Aktualisieren</button>
        </div>

        ${state.error ? `<div class="mp-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="mp-notice">${esc(state.notice)}</div>` : ''}

        <div class="mp-body">
          <section class="mp-panel mp-results">
            <div class="mp-panel-head"><h3>Medien</h3><span>${esc(state.assets.length)} Einträge</span></div>
            ${renderAssetRows()}
          </section>

          <section class="mp-panel mp-side">
            <div class="mp-panel-head"><h3>Auswahl</h3></div>
            <div class="mp-preview">${renderPreview(selected)}</div>
            <div class="mp-selected-info">
              ${selected ? `<strong>${esc(selected.label || selected.displayName || selected.fileName || `#${selected.id}`)}</strong><small>${esc(selected.relativePath || '')}</small><code>mediaId=${esc(selected.id)}</code>` : '<small>Noch nichts ausgewählt.</small>'}
            </div>
            <button type="button" class="mp-primary" data-mp-confirm ${selected ? '' : 'disabled'}>Auswählen</button>

            <hr>
            <h3>Neues Medium hochladen</h3>
            <label>Datei<input type="file" data-mp-upload-file></label>
            <div class="mp-upload-grid">
              <label>Typ<select data-mp-upload-type>${typeOptions(state.uploadType, false)}</select></label>
              <label>Kategorie<select data-mp-upload-category>${uploadCategoryOptions(state.uploadCategoryKey)}</select></label>
            </div>
            <label>Anzeigename<input data-mp-upload-name value="${esc(state.uploadDisplayName)}" placeholder="optional"></label>
            <details class="mp-new-category">
              <summary>Neue Zusatzkategorie anlegen</summary>
              <label>Key<input data-mp-new-category-key value="${esc(state.uploadNewCategoryKey)}" placeholder="fun, intro, bits"></label>
              <label>Name<input data-mp-new-category-label value="${esc(state.uploadNewCategoryLabel)}" placeholder="Anzeige im Dashboard"></label>
              <button type="button" data-mp-create-category>Kategorie anlegen</button>
            </details>
            <button type="button" data-mp-upload ${state.uploading ? 'disabled' : ''}>${state.uploading ? 'Upload läuft...' : 'Upload starten'}</button>
          </section>
        </div>
      </div>`;
    bind();
  }

  function bind() {
    backdrop?.querySelector('[data-mp-close]')?.addEventListener('click', close);
    backdrop?.addEventListener('click', event => { if (event.target === backdrop) close(); }, { once: true });
    backdrop?.querySelectorAll('[data-mp-view]').forEach(btn => btn.addEventListener('click', () => { state.view = btn.dataset.mpView || 'recent'; loadOptions(); }));
    backdrop?.querySelector('[data-mp-refresh]')?.addEventListener('click', () => loadOptions());
    backdrop?.querySelector('[data-mp-type]')?.addEventListener('change', event => { state.type = event.target.value || ''; loadOptions(); });
    backdrop?.querySelector('[data-mp-category]')?.addEventListener('change', event => { state.categoryKey = event.target.value || ''; loadOptions(); });
    backdrop?.querySelector('[data-mp-query]')?.addEventListener('input', event => {
      state.query = event.target.value || '';
      if (searchTimer) window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(loadOptions, 250);
    });
    backdrop?.querySelectorAll('[data-mp-select]').forEach(btn => btn.addEventListener('click', () => {
      const id = Number(btn.dataset.mpSelect || 0);
      state.selected = state.assets.find(asset => Number(asset.id) === id) || null;
      render();
    }));
    backdrop?.querySelector('[data-mp-confirm]')?.addEventListener('click', () => {
      if (!state.selected) return;
      const selected = state.selected;
      const callback = typeof state.config.onSelect === 'function' ? state.config.onSelect : null;
      close();
      if (callback) callback(selected);
    });
    backdrop?.querySelector('[data-mp-upload-type]')?.addEventListener('change', event => { state.uploadType = event.target.value || allowedTypes()[0] || 'audio'; });
    backdrop?.querySelector('[data-mp-upload-category]')?.addEventListener('change', event => { state.uploadCategoryKey = event.target.value || 'general'; });
    backdrop?.querySelector('[data-mp-upload-name]')?.addEventListener('input', event => { state.uploadDisplayName = event.target.value || ''; });
    backdrop?.querySelector('[data-mp-new-category-key]')?.addEventListener('input', event => { state.uploadNewCategoryKey = event.target.value || ''; });
    backdrop?.querySelector('[data-mp-new-category-label]')?.addEventListener('input', event => { state.uploadNewCategoryLabel = event.target.value || ''; });
    backdrop?.querySelector('[data-mp-create-category]')?.addEventListener('click', () => createCategory().catch(showError));
    backdrop?.querySelector('[data-mp-upload]')?.addEventListener('click', () => upload().catch(showError));
  }

  async function createCategory() {
    const categoryKey = clean(state.uploadNewCategoryKey);
    if (!categoryKey) throw new Error('Kategorie-Key fehlt.');
    const label = clean(state.uploadNewCategoryLabel) || `${moduleKey()} / ${categoryKey}`;
    await window.CGN.api(api.categoryUpsert, {
      method: 'POST',
      body: JSON.stringify({ moduleKey: moduleKey(), categoryKey, label, allowedTypes: allowedTypes() })
    });
    state.uploadCategoryKey = categoryKey;
    state.categoryKey = categoryKey;
    state.uploadNewCategoryKey = '';
    state.uploadNewCategoryLabel = '';
    state.notice = `Kategorie angelegt: ${categoryKey}`;
    await loadOptions();
  }

  async function upload() {
    const file = backdrop?.querySelector('[data-mp-upload-file]')?.files?.[0];
    if (!file) throw new Error('Keine Datei ausgewählt.');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', state.uploadType || allowedTypes()[0] || 'audio');
    fd.append('moduleKey', moduleKey());
    fd.append('categoryKey', state.uploadCategoryKey || 'general');
    if (state.uploadDisplayName) fd.append('displayName', state.uploadDisplayName);
    state.uploading = true;
    state.error = '';
    render();
    try {
      const res = await fetch(api.upload, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
      state.selected = data.asset || null;
      state.view = 'recent';
      state.notice = `Upload gespeichert: ${data.asset?.displayName || file.name}`;
      state.uploadDisplayName = '';
      await loadOptions();
      if (data.asset) state.selected = data.asset;
    } finally {
      state.uploading = false;
      render();
    }
  }

  function showError(err) {
    state.error = err.message || String(err);
    state.uploading = false;
    render();
  }

  function open(config = {}) {
    state.open = true;
    state.loading = false;
    state.uploading = false;
    state.error = '';
    state.notice = '';
    state.config = { ...config };
    state.view = config.view || 'recent';
    state.type = '';
    state.categoryKey = '';
    state.query = '';
    state.assets = [];
    state.categories = [];
    state.selected = null;
    state.uploadType = allowedTypes()[0] || 'audio';
    state.uploadCategoryKey = config.categoryKey || 'general';
    state.uploadNewCategoryKey = '';
    state.uploadNewCategoryLabel = '';
    state.uploadDisplayName = '';
    render();
    loadOptions();
  }

  function close() {
    state.open = false;
    if (backdrop) {
      backdrop.remove();
      backdrop = null;
    }
  }

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.open) close();
  });

  return { open, close, loadOptions };
})();
