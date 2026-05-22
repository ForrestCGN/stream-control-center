window.MediaModule = (function(){
  'use strict';

  const api = {
    status: '/api/media/status',
    list: '/api/media/list',
    scan: '/api/media/scan',
    upload: '/api/media/upload',
    update: '/api/media/update',
    delete: '/api/media/delete'
  };

  const TYPE_META = {
    audio: { label: 'Audio', icon: '🔊' },
    video: { label: 'Video', icon: '🎬' },
    image: { label: 'Bilder', icon: '🖼️' },
    animation: { label: 'Animationen', icon: '✨' }
  };

  const state = {
    tab: 'overview',
    loading: false,
    error: '',
    notice: '',
    status: null,
    lists: { audio: null, video: null, image: null, animation: null },
    filter: { q: '', category: '', status: 'active' },
    selected: null,
    preview: null,
    uploadType: 'audio',
    uploadCategory: 'general',
    uploadDisplayName: ''
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function iconButton(icon, label, attr, extraClass = '') {
    return `<button type="button" class="media-icon-btn ${extraClass}" ${attr || ''} title="${esc(label)}" aria-label="${esc(label)}"><span>${esc(icon)}</span></button>`;
  }

  function pill(label, mode) {
    return `<span class="media-pill ${esc(mode || '')}">${esc(label)}</span>`;
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
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function assets(type) {
    return Array.isArray(state.lists[type]?.assets) ? state.lists[type].assets : [];
  }

  function currentType() {
    return TYPE_META[state.tab] ? state.tab : 'audio';
  }

  async function loadStatus() {
    state.status = await window.CGN.api(api.status);
  }

  async function loadList(type) {
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('status', state.filter.status || 'active');
    if (state.filter.category) params.set('category', state.filter.category);
    if (state.filter.q) params.set('q', state.filter.q);
    state.lists[type] = await window.CGN.api(`${api.list}?${params.toString()}`);
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
      await Promise.all(Object.keys(TYPE_META).map(loadList));
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
    const category = String(root?.querySelector('[data-media-upload-category]')?.value || 'general').trim() || 'general';
    const displayName = String(root?.querySelector('[data-media-upload-name]')?.value || '').trim();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    fd.append('category', category);
    if (displayName) fd.append('displayName', displayName);
    const res = await fetch(api.upload, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
    state.notice = `Upload gespeichert: ${data.asset?.displayName || file.name}`;
    state.tab = type;
    await loadAll(true);
  }

  function selectAsset(id, type) {
    const item = assets(type).find(asset => Number(asset.id) === Number(id));
    state.selected = item || null;
    state.preview = item || null;
    render();
  }

  function previewAsset(id, type) {
    const item = assets(type).find(asset => Number(asset.id) === Number(id));
    state.preview = item || null;
    render();
  }

  async function saveSelected() {
    if (!state.selected) return;
    const displayName = String(root?.querySelector('[data-media-edit-name]')?.value || '').trim();
    const category = String(root?.querySelector('[data-media-edit-category]')?.value || '').trim() || 'general';
    const tagsRaw = String(root?.querySelector('[data-media-edit-tags]')?.value || '').trim();
    const tags = tagsRaw ? tagsRaw.split(/[;,]+/).map(item => item.trim()).filter(Boolean) : [];
    await window.CGN.api(api.update, { method: 'POST', body: JSON.stringify({ id: state.selected.id, displayName, category, tags }) });
    state.notice = 'Medium gespeichert.';
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
    await loadAll(true);
  }

  function renderOverview() {
    const st = state.status || {};
    const counts = st.counts || {};
    return `
      <div class="media-grid media-grid-main">
        <section class="media-card">
          <div class="media-headline"><div><h3>Übersicht</h3><p>Zentrale Registry für Medien, die später von Commands, Alerts, Sounds und Overlays genutzt werden.</p></div>${pill(st.schemaOk ? 'Schema OK' : 'Schema Fehler', st.schemaOk ? 'ok' : 'bad')}</div>
          <div class="media-kpis">
            <div><strong>${esc(counts.total || 0)}</strong><span>gesamt</span></div>
            <div><strong>${esc(counts.audio || 0)}</strong><span>Audio</span></div>
            <div><strong>${esc(counts.video || 0)}</strong><span>Video</span></div>
            <div><strong>${esc(counts.image || 0)}</strong><span>Bilder</span></div>
          </div>
          <p class="media-help">Neue Uploads landen unter <code>htdocs/assets/media/&lt;type&gt;</code>. Bestehende Legacy-Dateien werden nur registriert, nicht verschoben.</p>
        </section>
        <section class="media-card">
          <div class="media-headline"><div><h3>Schnellaktionen</h3><p>Scan registriert vorhandene Dateien erneut.</p></div></div>
          <div class="media-actions">${iconButton('🔄','Alle Medien neu scannen','data-media-scan')} ${iconButton('⬆️','Upload-Tab öffnen','data-media-tab-jump="upload"')}</div>
          <pre class="media-json">${esc(JSON.stringify({ step: st.step, assetsDir: st.assetsDir, lastScanAt: st.lastScanAt, lastError: st.lastError }, null, 2))}</pre>
        </section>
      </div>`;
  }

  function renderToolbar(type) {
    return `<div class="media-toolbar">
      <label class="grow">Suche <input data-media-filter-q value="${esc(state.filter.q)}" placeholder="Name, Datei, Pfad, Kategorie"></label>
      <label>Kategorie <input data-media-filter-category value="${esc(state.filter.category)}" placeholder="legacy, general, alerts..."></label>
      <label>Status <select data-media-filter-status><option value="active" ${state.filter.status === 'active' ? 'selected' : ''}>aktiv</option><option value="all" ${state.filter.status === 'all' ? 'selected' : ''}>alle</option><option value="deleted" ${state.filter.status === 'deleted' ? 'selected' : ''}>deleted</option></select></label>
      ${iconButton('🔎','Filter anwenden',`data-media-filter-apply="${esc(type)}"`)}
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

  function renderAssetTable(list, type) {
    if (!list.length) return '<div class="media-empty">Keine Medien für diesen Filter.</div>';
    return `<div class="media-table-wrap"><table class="media-table"><thead><tr><th>Name</th><th>Kategorie</th><th>Dauer</th><th>Größe</th><th>Quelle</th><th>Status</th><th></th></tr></thead><tbody>${list.map(asset => `
      <tr>
        <td><span class="media-file"><strong>${esc(asset.displayName || asset.fileName)}</strong><small>${esc(asset.relativePath || '')}</small></span></td>
        <td>${esc(asset.category || '')}</td>
        <td>${formatDuration(asset.durationMs)}${asset.width || asset.height ? `<br><small>${esc(asset.width)}×${esc(asset.height)}</small>` : ''}</td>
        <td>${formatBytes(asset.sizeBytes)}</td>
        <td>${esc(asset.source || '')}</td>
        <td>${asset.status === 'active' ? pill('aktiv','ok') : pill(asset.status || 'unknown','warn')}</td>
        <td><div class="media-actions">${iconButton('▶️','Vorschau',`data-media-preview="${esc(asset.id)}" data-media-type="${esc(type)}"`)}${iconButton('✏️','Bearbeiten',`data-media-select="${esc(asset.id)}" data-media-type="${esc(type)}"`)}</div></td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function renderPreviewAndEdit(type) {
    const selected = state.selected;
    const preview = state.preview;
    return `<div class="media-grid">
      <section class="media-card">
        <div class="media-headline"><div><h3>Vorschau</h3><p>Browser-Vorschau. Echte Stream-Ausführung folgt später über Sound-/Overlay-System.</p></div></div>
        <div class="media-preview-box">${renderPreview(preview)}</div>
      </section>
      <section class="media-card">
        <div class="media-headline"><div><h3>Metadaten</h3><p>Anzeigename, Kategorie und Tags bearbeiten.</p></div></div>
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
    return `<div class="media-preview-player">${player}</div><div><strong>${esc(asset.displayName || asset.fileName)}</strong><p class="media-help">${esc(asset.relativePath || '')}</p></div>`;
  }

  function renderEdit(asset) {
    return `<div class="media-edit">
      <label>Anzeigename <input data-media-edit-name value="${esc(asset.displayName || '')}"></label>
      <label>Kategorie <input data-media-edit-category value="${esc(asset.category || '')}"></label>
      <label style="grid-column:1/-1">Tags <input data-media-edit-tags value="${esc((asset.tags || []).join(', '))}" placeholder="hype, alert, kurz"></label>
      <div class="media-actions" style="grid-column:1/-1">${iconButton('💾','Speichern','data-media-save')} ${iconButton('🗑️','Ausblenden / Soft-Delete','data-media-delete-soft','danger')} ${iconButton('🔥','Datei endgültig löschen','data-media-delete-file','danger')}</div>
    </div>`;
  }

  function renderUpload() {
    return `<section class="media-card">
      <div class="media-headline"><div><h3>⬆️ Upload</h3><p>Upload in die zentrale Medienstruktur. Vorhandene Legacy-Dateien bleiben unverändert.</p></div></div>
      <div class="media-upload">
        <div class="media-upload-grid">
          <label>Datei <input type="file" data-media-upload-file accept="audio/*,video/*,image/*,.webm,.gif,.json"></label>
          <label>Typ <select data-media-upload-type>${Object.entries(TYPE_META).map(([id, meta]) => `<option value="${esc(id)}" ${state.uploadType === id ? 'selected' : ''}>${esc(meta.icon)} ${esc(meta.label)}</option>`).join('')}</select></label>
          <label>Kategorie <input data-media-upload-category value="${esc(state.uploadCategory)}" placeholder="general, commands, alerts"></label>
          <label>Anzeigename <input data-media-upload-name value="${esc(state.uploadDisplayName)}" placeholder="optional"></label>
        </div>
        <div class="media-actions">${iconButton('⬆️','Upload starten','data-media-upload')}</div>
      </div>
    </section>`;
  }

  function renderDiagnostics() {
    return `<section class="media-card"><div class="media-headline"><div><h3>Diagnose</h3><p>Rohdaten für Fehlersuche.</p></div>${iconButton('🔄','Aktualisieren','data-media-refresh')}</div><pre class="media-json">${esc(JSON.stringify(state.status || {}, null, 2))}</pre></section>`;
  }

  function renderActiveTab() {
    if (TYPE_META[state.tab]) return renderType(state.tab);
    if (state.tab === 'upload') return renderUpload();
    if (state.tab === 'diagnostics') return renderDiagnostics();
    return renderOverview();
  }

  function render() {
    root = document.getElementById('mediaModule');
    if (!root) return;
    const tabs = [['overview','Übersicht'],['audio','🔊 Audio'],['video','🎬 Video'],['image','🖼️ Bilder'],['animation','✨ Animationen'],['upload','⬆️ Upload'],['diagnostics','Diagnose']];
    root.innerHTML = `<div class="media-wrap">
      <section class="media-card media-hero"><div><h2>🗂️ Medienverwaltung</h2><p>Zentrale Medienverwaltung für Commands, Alerts, Sounds, Overlays und spätere Module.</p></div><div class="media-actions">${iconButton('🔄','Aktualisieren','data-media-refresh')}</div></section>
      ${state.error ? `<div class="media-error">${esc(state.error)}</div>` : ''}
      ${state.notice ? `<div class="media-notice">${esc(state.notice)}</div>` : ''}
      ${state.loading ? '<section class="media-card">Lade Medien...</section>' : `<div class="media-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-media-tab="${esc(id)}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}`}
    </div>`;
    bind();
  }

  function bind() {
    root?.querySelectorAll('[data-media-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.mediaTab || 'overview'; state.error = ''; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-media-tab-jump]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.mediaTabJump || 'overview'; render(); }));
    root?.querySelectorAll('[data-media-refresh]').forEach(btn => btn.addEventListener('click', () => refreshOnly().catch(showError)));
    root?.querySelectorAll('[data-media-scan]').forEach(btn => btn.addEventListener('click', () => scanMedia().catch(showError)));
    root?.querySelectorAll('[data-media-preview]').forEach(btn => btn.addEventListener('click', () => previewAsset(btn.dataset.mediaPreview, btn.dataset.mediaType)));
    root?.querySelectorAll('[data-media-select]').forEach(btn => btn.addEventListener('click', () => selectAsset(btn.dataset.mediaSelect, btn.dataset.mediaType)));
    root?.querySelector('[data-media-save]')?.addEventListener('click', () => saveSelected().catch(showError));
    root?.querySelector('[data-media-delete-soft]')?.addEventListener('click', () => deleteSelected(false).catch(showError));
    root?.querySelector('[data-media-delete-file]')?.addEventListener('click', () => deleteSelected(true).catch(showError));
    root?.querySelector('[data-media-upload]')?.addEventListener('click', () => uploadMedia().catch(showError));
    root?.querySelectorAll('[data-media-filter-apply]').forEach(btn => btn.addEventListener('click', async () => {
      state.filter.q = String(root.querySelector('[data-media-filter-q]')?.value || '').trim();
      state.filter.category = String(root.querySelector('[data-media-filter-category]')?.value || '').trim();
      state.filter.status = String(root.querySelector('[data-media-filter-status]')?.value || 'active');
      await loadList(btn.dataset.mediaFilterApply || currentType());
      render();
    }));
    root?.querySelector('[data-media-upload-type]')?.addEventListener('change', e => { state.uploadType = e.target.value || 'audio'; });
    root?.querySelector('[data-media-upload-category]')?.addEventListener('input', e => { state.uploadCategory = e.target.value || 'general'; });
    root?.querySelector('[data-media-upload-name]')?.addEventListener('input', e => { state.uploadDisplayName = e.target.value || ''; });
  }

  function showError(err) { state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'media') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('mediaModule'); });
  else root = document.getElementById('mediaModule');

  return { loadAll, render };
})();
