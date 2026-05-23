window.MediaModule = (function(){
  // STEP274S - Live-Filter ohne Lupe: Suche reagiert beim Tippen mit Debounce.
  'use strict';

  const api = {
    status: '/api/media/status',
    list: '/api/media/list',
    categories: '/api/media/categories',
    scan: '/api/media/scan',
    upload: '/api/media/upload',
    update: '/api/media/update',
    delete: '/api/media/delete',
    resolve: '/api/media/resolve'
  };

  const TYPE_META = {
    audio: { label: 'Audio', icon: '🔊' },
    video: { label: 'Video', icon: '🎬' },
    image: { label: 'Bilder', icon: '🖼️' },
    animation: { label: 'Animationen', icon: '✨' }
  };

  const MODULE_LABELS = {
    general: 'Allgemein',
    commands: 'Commands',
    alerts: 'Alerts',
    soundalerts: 'SoundAlerts',
    birthday: 'Geburtstag',
    vip: 'VIP',
    rewards: 'Rewards',
    tts: 'TTS',
    system: 'System',
    legacy: 'Legacy'
  };

  const state = {
    tab: 'overview',
    loading: false,
    error: '',
    notice: '',
    status: null,
    categories: [],
    lists: { audio: null, video: null, image: null, animation: null, recent: null },
    filter: { q: '', moduleKey: '', categoryKey: '', status: 'active', view: '' },
    selected: null,
    preview: null,
    resolved: null,
    uploadType: 'audio',
    uploadModuleKey: 'general',
    uploadCategoryKey: 'general',
    uploadDisplayName: ''
  };

  let root = null;
  let filterTimer = null;
  let filterSeq = 0;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function iconButton(icon, label, attr, extraClass = '') {
    return `<button type="button" class="media-icon-btn ${extraClass}" ${attr || ''} title="${esc(label)}" aria-label="${esc(label)}"><span>${esc(icon)}</span></button>`;
  }

  function pill(label, mode) {
    return `<span class="media-pill ${esc(mode || '')}">${esc(label)}</span>`;
  }

  function textButton(label, attr, extraClass = '') {
    return `<button type="button" class="media-text-btn ${extraClass}" ${attr || ''}>${esc(label)}</button>`;
  }

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (!n) return '0 B';
    const units = ['B','KB','MB','GB'];
    let value = n;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1; }
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function formatDuration(ms) {
    const total = Math.round(Number(ms || 0) / 1000);
    if (!total) return '-';
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function normalizeKey(value) {
    return String(value || '').trim().toLowerCase();
  }

  function moduleLabel(moduleKey) {
    const key = normalizeKey(moduleKey || 'general');
    return MODULE_LABELS[key] || key || 'Allgemein';
  }

  function fullCategory(asset) {
    const moduleKey = asset.moduleKey || asset.module_key || 'general';
    const categoryKey = asset.categoryKey || asset.category_key || asset.category || 'general';
    return `${moduleKey}/${categoryKey}`;
  }

  function isCommandRelated(asset) {
    return normalizeKey(asset.moduleKey) === 'commands' || normalizeKey(asset.fullCategoryKey || '').startsWith('commands/');
  }

  function assets(type) {
    return Array.isArray(state.lists[type]?.assets) ? state.lists[type].assets : [];
  }

  function currentType() {
    return TYPE_META[state.tab] ? state.tab : 'audio';
  }

  function allLoadedAssets() {
    const map = new Map();
    Object.keys(TYPE_META).forEach(type => assets(type).forEach(asset => map.set(Number(asset.id), asset)));
    assets('recent').forEach(asset => map.set(Number(asset.id), asset));
    return Array.from(map.values()).filter(Boolean);
  }

  function categoryOptionsForModule(moduleKey, type) {
    const key = normalizeKey(moduleKey);
    const categories = Array.isArray(state.categories) ? state.categories : [];
    return categories.filter(cat => {
      const catModule = normalizeKey(cat.moduleKey || cat.module_key || cat.module || 'general');
      if (key && catModule !== key) return false;
      const allowed = cat.allowedTypes || cat.allowed_types || cat.allowedTypesJson || [];
      if (!type || !Array.isArray(allowed) || !allowed.length) return true;
      return allowed.includes(type);
    });
  }

  function availableModules() {
    const set = new Set();
    (state.categories || []).forEach(cat => set.add(normalizeKey(cat.moduleKey || cat.module_key || 'general')));
    allLoadedAssets().forEach(asset => set.add(normalizeKey(asset.moduleKey || 'general')));
    return Array.from(set).filter(Boolean).sort((a,b) => moduleLabel(a).localeCompare(moduleLabel(b), 'de'));
  }

  function availableCategories(moduleKey) {
    const set = new Set();
    const key = normalizeKey(moduleKey);
    (state.categories || []).forEach(cat => {
      const catModule = normalizeKey(cat.moduleKey || cat.module_key || 'general');
      if (!key || catModule === key) set.add(normalizeKey(cat.categoryKey || cat.category_key || cat.category || 'general'));
    });
    allLoadedAssets().forEach(asset => {
      const assetModule = normalizeKey(asset.moduleKey || 'general');
      if (!key || assetModule === key) set.add(normalizeKey(asset.categoryKey || asset.category || 'general'));
    });
    return Array.from(set).filter(Boolean).sort((a,b) => a.localeCompare(b, 'de'));
  }

  async function loadStatus() {
    state.status = await window.CGN.api(api.status);
  }

  async function loadCategories() {
    try {
      const data = await window.CGN.api(api.categories);
      state.categories = Array.isArray(data.categories) ? data.categories : (Array.isArray(data.items) ? data.items : []);
    } catch (_) {
      state.categories = [];
    }
  }

  async function loadList(typeOrView) {
    const params = new URLSearchParams();
    if (TYPE_META[typeOrView]) params.set('type', typeOrView);
    if (typeOrView === 'recent') {
      params.set('view', 'recent');
      params.set('limit', '60');
    } else {
      params.set('limit', '500');
    }
    params.set('status', state.filter.status || 'active');
    if (state.filter.moduleKey) params.set('moduleKey', state.filter.moduleKey);
    if (state.filter.categoryKey) params.set('categoryKey', state.filter.categoryKey);
    if (state.filter.q) params.set('q', state.filter.q);
    state.lists[typeOrView] = await window.CGN.api(`${api.list}?${params.toString()}`);
  }

  async function loadAll(force) {
    root = document.getElementById('mediaModule');
    if (!root || !window.CGN) return;
    if (!force && state.status) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      await loadStatus();
      await loadCategories();
      await Promise.all([...Object.keys(TYPE_META), 'recent'].map(loadList));
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function refreshOnly() { await loadAll(true); }

  async function scanMedia() {
    const res = await window.CGN.api(api.scan, { method: 'POST', body: '{}' });
    state.notice = `Scan fertig: ${res.scanned || 0} Medien aktualisiert.`;
    await loadAll(true);
  }

  async function uploadMedia() {
    const fileInput = root?.querySelector('[data-media-upload-file]');
    const file = fileInput?.files?.[0];
    if (!file) throw new Error('Keine Datei ausgewählt.');
    const type = String(root?.querySelector('[data-media-upload-type]')?.value || state.uploadType || 'audio');
    const moduleKey = String(root?.querySelector('[data-media-upload-module]')?.value || state.uploadModuleKey || 'general').trim() || 'general';
    const categoryKey = String(root?.querySelector('[data-media-upload-category]')?.value || state.uploadCategoryKey || 'general').trim() || 'general';
    const displayName = String(root?.querySelector('[data-media-upload-name]')?.value || '').trim();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    fd.append('moduleKey', moduleKey);
    fd.append('categoryKey', categoryKey);
    fd.append('category', categoryKey);
    if (displayName) fd.append('displayName', displayName);
    const res = await fetch(api.upload, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
    state.notice = `Upload gespeichert: ${data.asset?.displayName || file.name}`;
    state.tab = type;
    await loadAll(true);
  }

  async function selectAsset(id, type) {
    const pool = type ? assets(type) : allLoadedAssets();
    const item = pool.find(asset => Number(asset.id) === Number(id));
    state.selected = item || null;
    state.preview = item || null;
    state.resolved = null;
    if (item) {
      try { state.resolved = await window.CGN.api(`${api.resolve}?id=${encodeURIComponent(item.id)}`); }
      catch (_) { state.resolved = null; }
    }
    render();
  }

  function previewAsset(id, type) {
    const pool = type ? assets(type) : allLoadedAssets();
    const item = pool.find(asset => Number(asset.id) === Number(id));
    state.preview = item || null;
    render();
  }

  async function saveSelected() {
    if (!state.selected) return;
    const displayName = String(root?.querySelector('[data-media-edit-name]')?.value || '').trim();
    const moduleKey = String(root?.querySelector('[data-media-edit-module]')?.value || state.selected.moduleKey || 'general').trim() || 'general';
    const categoryKey = String(root?.querySelector('[data-media-edit-category]')?.value || state.selected.categoryKey || state.selected.category || 'general').trim() || 'general';
    const tagsRaw = String(root?.querySelector('[data-media-edit-tags]')?.value || '').trim();
    const tags = tagsRaw ? tagsRaw.split(/[;,]+/).map(item => item.trim()).filter(Boolean) : [];
    await window.CGN.api(api.update, { method: 'POST', body: JSON.stringify({ id: state.selected.id, displayName, moduleKey, categoryKey, category: categoryKey, tags }) });
    state.notice = 'Medium gespeichert.';
    state.selected = null;
    state.resolved = null;
    await loadAll(true);
  }

  async function deleteSelected(deleteFile) {
    if (!state.selected) return;
    const msg = deleteFile ? 'Datei wirklich endgültig löschen?' : 'Medium aus der aktiven Liste ausblenden?';
    if (!window.confirm(msg)) return;
    await window.CGN.api(api.delete, { method: 'POST', body: JSON.stringify({ id: state.selected.id, deleteFile: !!deleteFile }) });
    state.notice = deleteFile ? 'Medium und Datei gelöscht.' : 'Medium ausgeblendet.';
    state.selected = null;
    state.preview = null;
    state.resolved = null;
    await loadAll(true);
  }

  function summarizeAssets() {
    const all = allLoadedAssets();
    const modules = {};
    const categories = {};
    const types = {};
    all.forEach(asset => {
      const moduleKey = normalizeKey(asset.moduleKey || 'general');
      const cat = normalizeKey(asset.categoryKey || asset.category || 'general');
      const type = asset.type || 'unknown';
      modules[moduleKey] = (modules[moduleKey] || 0) + 1;
      categories[`${moduleKey}/${cat}`] = (categories[`${moduleKey}/${cat}`] || 0) + 1;
      types[type] = (types[type] || 0) + 1;
    });
    return { all, modules, categories, types };
  }

  function renderOverview() {
    const st = state.status || {};
    const counts = st.counts || {};
    const summary = summarizeAssets();
    const moduleRows = Object.entries(summary.modules).sort((a,b) => b[1] - a[1]).map(([key,count]) => `
      <button type="button" class="media-module-chip" data-media-set-module="${esc(key)}">
        <strong>${esc(moduleLabel(key))}</strong><span>${esc(count)} Assets</span>
      </button>`).join('');
    const categoryRows = Object.entries(summary.categories).sort((a,b) => b[1] - a[1]).slice(0, 18).map(([key,count]) => {
      const [moduleKey, categoryKey] = key.split('/');
      return `<button type="button" class="media-category-chip" data-media-set-module="${esc(moduleKey)}" data-media-set-category="${esc(categoryKey)}"><span>${esc(moduleLabel(moduleKey))}</span><strong>${esc(categoryKey)}</strong><em>${esc(count)}</em></button>`;
    }).join('');
    return `
      <div class="media-grid media-grid-main">
        <section class="media-card">
          <div class="media-headline"><div><h3>Übersicht</h3><p>Zentrale Registry nach der Migration: Module und Kategorien sind jetzt direkt sichtbar und filterbar.</p></div>${pill(st.schemaOk ? 'Schema OK' : 'Schema Fehler', st.schemaOk ? 'ok' : 'bad')}</div>
          <div class="media-kpis">
            <div><strong>${esc(counts.total || summary.all.length || 0)}</strong><span>gesamt</span></div>
            <div><strong>${esc(counts.audio || summary.types.audio || 0)}</strong><span>Audio</span></div>
            <div><strong>${esc(counts.video || summary.types.video || 0)}</strong><span>Video</span></div>
            <div><strong>${esc(counts.image || summary.types.image || 0)}</strong><span>Bilder</span></div>
          </div>
          <p class="media-help">Neue Uploads landen unter <code>htdocs/assets/media/&lt;module&gt;/&lt;category&gt;</code>. Bestehende Dateien werden nicht automatisch gelöscht.</p>
        </section>
        <section class="media-card">
          <div class="media-headline"><div><h3>Schnellaktionen</h3><p>Scan registriert vorhandene Dateien erneut.</p></div></div>
          <div class="media-actions">${iconButton('🔄','Alle Medien neu scannen','data-media-scan')} ${iconButton('⬆️','Upload-Tab öffnen','data-media-tab-jump="upload"')} ${textButton('Recent öffnen','data-media-tab-jump="recent"')}</div>
          <pre class="media-json small">${esc(JSON.stringify({ step: st.step, assetsDir: st.assetsDir, lastScanAt: st.lastScanAt, lastError: st.lastError }, null, 2))}</pre>
        </section>
      </div>
      <div class="media-grid">
        <section class="media-card"><div class="media-headline compact"><div><h3>Module</h3><p>Direkt in die Modulansicht springen.</p></div></div><div class="media-chip-grid">${moduleRows || '<div class="media-empty">Noch keine Module geladen.</div>'}</div></section>
        <section class="media-card"><div class="media-headline compact"><div><h3>Stärkste Kategorien</h3><p>Top-Kategorien aus den geladenen Assets.</p></div></div><div class="media-chip-grid categories">${categoryRows || '<div class="media-empty">Noch keine Kategorien geladen.</div>'}</div></section>
      </div>`;
  }

  function renderModuleSelect(value, attr) {
    const modules = availableModules();
    const current = normalizeKey(value);
    const options = [''].concat(modules).map(key => `<option value="${esc(key)}" ${current === key ? 'selected' : ''}>${esc(key ? moduleLabel(key) : 'Alle Module')}</option>`).join('');
    return `<select ${attr || ''}>${options}</select>`;
  }

  function renderCategorySelect(value, moduleKey, attr, includeAll = true) {
    const categories = availableCategories(moduleKey);
    const current = normalizeKey(value);
    const options = (includeAll ? [''] : []).concat(categories.length ? categories : ['general']).map(key => `<option value="${esc(key)}" ${current === key ? 'selected' : ''}>${esc(key ? key : 'Alle Kategorien')}</option>`).join('');
    return `<select ${attr || ''}>${options}</select>`;
  }

  function renderToolbar(type) {
    return `<div class="media-toolbar">
      <label class="grow">Suche <input data-media-filter-q value="${esc(state.filter.q)}" placeholder="Name, Datei, ID, Pfad, Kategorie"></label>
      <label>Modul ${renderModuleSelect(state.filter.moduleKey, 'data-media-filter-module')}</label>
      <label>Kategorie ${renderCategorySelect(state.filter.categoryKey, state.filter.moduleKey, 'data-media-filter-category')}</label>
      <label>Status <select data-media-filter-status><option value="active" ${state.filter.status === 'active' ? 'selected' : ''}>aktiv</option><option value="all" ${state.filter.status === 'all' ? 'selected' : ''}>alle</option><option value="deleted" ${state.filter.status === 'deleted' ? 'selected' : ''}>deleted</option></select></label>
      ${iconButton('🔎','Filter anwenden',`data-media-filter-apply="${esc(type)}"`)}
      ${iconButton('🧹','Filter leeren',`data-media-filter-clear="${esc(type)}"`)}
      ${iconButton('🔄','Aktualisieren','data-media-refresh')}
    </div>`;
  }

  function renderType(type) {
    const meta = TYPE_META[type];
    const list = assets(type);
    return `<section class="media-card">
      <div class="media-headline"><div><h3>${esc(meta.icon)} ${esc(meta.label)}</h3><p>${esc(list.length)} Einträge im aktuellen Filter.</p></div>${iconButton('⬆️','Upload öffnen','data-media-tab-jump="upload"')}</div>
      ${renderToolbar(type)}
      ${renderAssetTable(list, type)}
    </section>
    ${renderPreviewAndEdit(type)}`;
  }

  function renderRecent() {
    const list = assets('recent');
    return `<section class="media-card">
      <div class="media-headline"><div><h3>🕘 Recent</h3><p>Letzte registrierte oder hochgeladene Medien. Praktisch nach Upload und Migration.</p></div>${iconButton('🔄','Aktualisieren','data-media-refresh')}</div>
      ${renderToolbar('recent')}
      ${renderAssetTable(list, '')}
    </section>
    ${renderPreviewAndEdit('')}`;
  }

  function renderAssetTable(list, type) {
    if (!list.length) return '<div class="media-empty">Keine Medien für diesen Filter.</div>';
    return `<div class="media-table-wrap"><table class="media-table"><thead><tr><th>ID</th><th>Name</th><th>Modul / Kategorie</th><th>Typ</th><th>Dauer</th><th>Größe</th><th>Status</th><th></th></tr></thead><tbody>${list.map(asset => `
      <tr class="${isCommandRelated(asset) ? 'is-command-related' : ''}">
        <td><code>#${esc(asset.id)}</code></td>
        <td><span class="media-file"><strong>${esc(asset.displayName || asset.fileName)}</strong><small>${esc(asset.relativePath || '')}</small></span></td>
        <td><span class="media-cat"><strong>${esc(moduleLabel(asset.moduleKey || 'general'))}</strong><small>${esc(asset.categoryKey || asset.category || 'general')}</small>${isCommandRelated(asset) ? pill('Command-Medium','info') : ''}</span></td>
        <td>${esc(TYPE_META[asset.type]?.label || asset.type || '')}</td>
        <td>${formatDuration(asset.durationMs)}${asset.width || asset.height ? `<br><small>${esc(asset.width)}×${esc(asset.height)}</small>` : ''}</td>
        <td>${formatBytes(asset.sizeBytes)}</td>
        <td>${asset.status === 'active' ? pill('aktiv','ok') : pill(asset.status || 'unknown','warn')}</td>
        <td><div class="media-actions">${iconButton('▶️','Vorschau',`data-media-preview="${esc(asset.id)}" data-media-type="${esc(type || asset.type || '')}"`)}${iconButton('✏️','Details / Bearbeiten',`data-media-select="${esc(asset.id)}" data-media-type="${esc(type || asset.type || '')}"`)}</div></td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function renderPreviewAndEdit(type) {
    const selected = state.selected;
    const preview = state.preview;
    return `<div class="media-grid media-detail-grid">
      <section class="media-card">
        <div class="media-headline"><div><h3>Vorschau</h3><p>Browser-Vorschau. Commands laufen weiterhin über Media-ID und Sound-Bridge.</p></div></div>
        <div class="media-preview-box">${renderPreview(preview)}</div>
      </section>
      <section class="media-card">
        <div class="media-headline"><div><h3>Details & Metadaten</h3><p>ID, Pfade, Modul/Kategorie und Tags.</p></div></div>
        ${selected ? renderEdit(selected) : '<div class="media-empty">Ein Medium zum Bearbeiten auswählen.</div>'}
      </section>
    </div>`;
  }

  function renderPreview(asset) {
    if (!asset) return '<div class="media-preview-player"><span class="media-muted">Keine Vorschau ausgewählt.</span></div>';
    const src = esc(asset.webPath || '');
    let player = '<span class="media-muted">Keine Vorschau verfügbar.</span>';
    if (asset.type === 'audio') player = `<audio controls preload="metadata" src="${src}"></audio>`;
    else if (asset.type === 'video' || asset.type === 'animation') player = `<video controls preload="metadata" src="${src}"></video>`;
    else if (asset.type === 'image') player = `<img src="${src}" alt="${esc(asset.displayName || asset.fileName)}">`;
    return `<div class="media-preview-player">${player}</div><div><strong>#${esc(asset.id)} · ${esc(asset.displayName || asset.fileName)}</strong><p class="media-help">${esc(asset.webPath || asset.relativePath || '')}</p></div>`;
  }

  function renderEdit(asset) {
    const resolved = state.resolved || null;
    const pathInfo = resolved?.paths || {};
    const commandHint = isCommandRelated(asset) ? '<div class="media-command-note">Dieses Medium liegt im Commands-Bereich. Commands sollten weiter über <code>mediaId</code> laufen, nicht über feste Dateipfade.</div>' : '';
    return `<div class="media-edit">
      <label>Anzeigename <input data-media-edit-name value="${esc(asset.displayName || '')}"></label>
      <label>Modul ${renderModuleSelect(asset.moduleKey || 'general', 'data-media-edit-module')}</label>
      <label>Kategorie ${renderCategorySelect(asset.categoryKey || asset.category || 'general', asset.moduleKey || 'general', 'data-media-edit-category', false)}</label>
      <label>Tags <input data-media-edit-tags value="${esc((asset.tags || []).join(', '))}" placeholder="hype, alert, kurz"></label>
      <div class="media-detail-list" style="grid-column:1/-1">
        <div><span>ID</span><code>#${esc(asset.id)}</code></div>
        <div><span>Typ</span><code>${esc(asset.type || '')}</code></div>
        <div><span>Full Category</span><code>${esc(fullCategory(asset))}</code></div>
        <div><span>Web</span><code>${esc(pathInfo.webPath || asset.webPath || '')}</code></div>
        <div><span>Relativ</span><code>${esc(pathInfo.relativePath || asset.relativePath || '')}</code></div>
        <div><span>Datei vorhanden</span>${pathInfo.exists === false ? pill('nein','bad') : pill('ja','ok')}</div>
      </div>
      ${commandHint}
      <div class="media-actions" style="grid-column:1/-1">${iconButton('💾','Speichern','data-media-save')} ${iconButton('🗑️','Ausblenden / Soft-Delete','data-media-delete-soft','danger')} ${iconButton('🔥','Datei endgültig löschen','data-media-delete-file','danger')}</div>
    </div>`;
  }

  function renderUpload() {
    return `<section class="media-card">
      <div class="media-headline"><div><h3>⬆️ Upload</h3><p>Upload in die zentrale Medienstruktur: <code>assets/media/&lt;module&gt;/&lt;category&gt;</code>.</p></div></div>
      <div class="media-upload">
        <div class="media-upload-grid">
          <label>Datei <input type="file" data-media-upload-file accept="audio/*,video/*,image/*,.webm,.gif,.json"></label>
          <label>Typ <select data-media-upload-type>${Object.entries(TYPE_META).map(([id, meta]) => `<option value="${esc(id)}" ${state.uploadType === id ? 'selected' : ''}>${esc(meta.icon)} ${esc(meta.label)}</option>`).join('')}</select></label>
          <label>Modul ${renderModuleSelect(state.uploadModuleKey, 'data-media-upload-module')}</label>
          <label>Kategorie ${renderCategorySelect(state.uploadCategoryKey, state.uploadModuleKey, 'data-media-upload-category', false)}</label>
          <label style="grid-column:1/-1">Anzeigename <input data-media-upload-name value="${esc(state.uploadDisplayName)}" placeholder="optional"></label>
        </div>
        <div class="media-actions">${iconButton('⬆️','Upload starten','data-media-upload')}</div>
      </div>
    </section>`;
  }

  function renderDiagnostics() {
    return `<section class="media-card"><div class="media-headline"><div><h3>Diagnose</h3><p>Rohdaten für Fehlersuche.</p></div>${iconButton('🔄','Aktualisieren','data-media-refresh')}</div><pre class="media-json">${esc(JSON.stringify({ status: state.status || {}, categories: state.categories || [], filters: state.filter }, null, 2))}</pre></section>`;
  }

  function renderActiveTab() {
    if (TYPE_META[state.tab]) return renderType(state.tab);
    if (state.tab === 'recent') return renderRecent();
    if (state.tab === 'upload') return renderUpload();
    if (state.tab === 'diagnostics') return renderDiagnostics();
    return renderOverview();
  }

  function render() {
    root = document.getElementById('mediaModule');
    if (!root) return;
    const tabs = [['overview','Übersicht'],['recent','🕘 Recent'],['audio','🔊 Audio'],['video','🎬 Video'],['image','🖼️ Bilder'],['animation','✨ Animationen'],['upload','⬆️ Upload'],['diagnostics','Diagnose']];
    root.innerHTML = `<div class="media-wrap">
      <section class="media-card media-hero"><div><h2>🗂️ Medienverwaltung</h2><p>Zentrale Medienverwaltung nach Migration: Module, Kategorien, ID, Pfade und Vorschau an einem Ort.</p></div><div class="media-actions">${iconButton('🔄','Aktualisieren','data-media-refresh')}</div></section>
      ${state.error ? `<div class="media-error">${esc(state.error)}</div>` : ''}
      ${state.notice ? `<div class="media-notice">${esc(state.notice)}</div>` : ''}
      ${state.loading ? '<section class="media-card">Lade Medien...</section>' : `<div class="media-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-media-tab="${esc(id)}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}`}
    </div>`;
    bind();
  }

  function readFilterValues() {
    state.filter.q = String(root.querySelector('[data-media-filter-q]')?.value || '').trim();
    state.filter.moduleKey = String(root.querySelector('[data-media-filter-module]')?.value || '').trim();
    state.filter.categoryKey = String(root.querySelector('[data-media-filter-category]')?.value || '').trim();
    state.filter.status = String(root.querySelector('[data-media-filter-status]')?.value || 'active');
  }

  function clearFilters() {
    state.filter = { q: '', moduleKey: '', categoryKey: '', status: 'active', view: '' };
  }


  function scheduleFilterApply(type, delay = 220) {
    if (!root) return;
    readFilterValues();
    const target = type || (state.tab === 'recent' ? 'recent' : currentType());
    if (filterTimer) clearTimeout(filterTimer);
    filterTimer = setTimeout(async () => {
      const seq = ++filterSeq;
      try {
        await loadList(target);
        if (seq === filterSeq) render();
      } catch (err) {
        if (seq === filterSeq) showError(err);
      }
    }, delay);
  }

  async function applyFilterNow(type) {
    if (filterTimer) {
      clearTimeout(filterTimer);
      filterTimer = null;
    }
    readFilterValues();
    const target = type || (state.tab === 'recent' ? 'recent' : currentType());
    filterSeq += 1;
    await loadList(target);
    render();
  }

  function bind() {
    root?.querySelectorAll('[data-media-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.mediaTab || 'overview'; state.error = ''; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-media-tab-jump]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.mediaTabJump || 'overview'; render(); }));
    root?.querySelectorAll('[data-media-refresh]').forEach(btn => btn.addEventListener('click', () => refreshOnly().catch(showError)));
    root?.querySelectorAll('[data-media-scan]').forEach(btn => btn.addEventListener('click', () => scanMedia().catch(showError)));
    root?.querySelectorAll('[data-media-preview]').forEach(btn => btn.addEventListener('click', () => previewAsset(btn.dataset.mediaPreview, btn.dataset.mediaType)));
    root?.querySelectorAll('[data-media-select]').forEach(btn => btn.addEventListener('click', () => selectAsset(btn.dataset.mediaSelect, btn.dataset.mediaType).catch(showError)));
    root?.querySelector('[data-media-save]')?.addEventListener('click', () => saveSelected().catch(showError));
    root?.querySelector('[data-media-delete-soft]')?.addEventListener('click', () => deleteSelected(false).catch(showError));
    root?.querySelector('[data-media-delete-file]')?.addEventListener('click', () => deleteSelected(true).catch(showError));
    root?.querySelector('[data-media-upload]')?.addEventListener('click', () => uploadMedia().catch(showError));
    root?.querySelectorAll('[data-media-filter-apply]').forEach(btn => btn.addEventListener('click', async () => {
      await applyFilterNow(btn.dataset.mediaFilterApply || currentType());
    }));
    root?.querySelectorAll('[data-media-filter-q]').forEach(input => input.addEventListener('input', () => {
      scheduleFilterApply(currentType(), 220);
    }));
    root?.querySelectorAll('[data-media-filter-module]').forEach(select => select.addEventListener('change', async () => {
      state.filter.moduleKey = String(select.value || '').trim();
      state.filter.categoryKey = '';
      await loadList(state.tab === 'recent' ? 'recent' : currentType());
      render();
    }));
    root?.querySelectorAll('[data-media-filter-category], [data-media-filter-status]').forEach(select => select.addEventListener('change', async () => {
      await applyFilterNow(state.tab === 'recent' ? 'recent' : currentType());
    }));
    root?.querySelectorAll('[data-media-filter-q]').forEach(input => input.addEventListener('keydown', async ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        await applyFilterNow(currentType());
      }
    }));
    root?.querySelectorAll('[data-media-filter-clear]').forEach(btn => btn.addEventListener('click', async () => {
      clearFilters();
      const target = btn.dataset.mediaFilterClear || currentType();
      await loadList(target);
      render();
    }));
    root?.querySelectorAll('[data-media-set-module]').forEach(btn => btn.addEventListener('click', async () => {
      state.filter.moduleKey = btn.dataset.mediaSetModule || '';
      state.filter.categoryKey = btn.dataset.mediaSetCategory || '';
      state.tab = 'recent';
      await loadList('recent');
      render();
    }));
    root?.querySelector('[data-media-upload-type]')?.addEventListener('change', e => { state.uploadType = e.target.value || 'audio'; });
    root?.querySelector('[data-media-upload-module]')?.addEventListener('change', e => { state.uploadModuleKey = e.target.value || 'general'; state.uploadCategoryKey = 'general'; render(); });
    root?.querySelector('[data-media-upload-category]')?.addEventListener('change', e => { state.uploadCategoryKey = e.target.value || 'general'; });
    root?.querySelector('[data-media-upload-name]')?.addEventListener('input', e => { state.uploadDisplayName = e.target.value || ''; });
    root?.querySelector('[data-media-edit-module]')?.addEventListener('change', () => render());
  }

  function showError(err) { state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'media') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('mediaModule'); });
  else root = document.getElementById('mediaModule');

  return { loadAll, render };
})();
