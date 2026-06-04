window.ShoutoutTextsModule = (function(){
  'use strict';

  const API = {
    texts: '/api/clip-shoutout/texts',
    migration: '/api/clip-shoutout/texts/migration'
  };

  const state = {
    active: false,
    loading: false,
    error: '',
    notice: '',
    data: null,
    migration: null,
    selectedCategory: '',
    selectedKey: '',
    dirty: false
  };

  function esc(v){
    return window.CGN?.esc
      ? window.CGN.esc(v)
      : String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function root(){ return document.getElementById('shoutoutModule'); }
  function visible(){ const r = root(); return !!r && r.hidden !== true; }

  async function api(path, options = {}){
    if (window.CGN?.api) return window.CGN.api(path, options);
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  }

  function ensureTab(){
    const r = root();
    if (!r) return null;
    const tabs = r.querySelector('.shoutout-tabs');
    if (!tabs) return null;
    let btn = tabs.querySelector('[data-shoutout-texts-tab]');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.className = 'shoutout-tab';
      btn.dataset.shoutoutTextsTab = '1';
      btn.textContent = 'Texte';
      const queueTab = tabs.querySelector('[data-shoutout-tab="queues"]');
      const anchor = queueTab;
      if (anchor && anchor.nextSibling) tabs.insertBefore(btn, anchor.nextSibling);
      else tabs.appendChild(btn);
      btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        activate();
      });
    }
    return btn;
  }

  function panel(create = true){
    const r = root();
    if (!r) return null;
    let p = r.querySelector('#shoutoutTextsTabPanel');
    if (!p && create) {
      const tabs = r.querySelector('.shoutout-tabs');
      p = document.createElement('div');
      p.id = 'shoutoutTextsTabPanel';
      p.className = 'shoutout-tab-panel shoutout-texts-panel';
      if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(p, tabs.nextSibling);
      else r.appendChild(p);
    }
    return p;
  }

  function hideOtherPanels(hide){
    const r = root();
    if (!r) return;
    r.querySelectorAll('.shoutout-tab-panel').forEach(p => {
      if (p.id !== 'shoutoutTextsTabPanel') p.style.display = hide ? 'none' : '';
    });
  }

  function categories(){
    const cats = state.data?.texts?.categories;
    return Array.isArray(cats) ? cats : [];
  }

  function keys(){
    const list = state.data?.texts?.keys;
    return Array.isArray(list) ? list : [];
  }

  function isLegacyCategory(id){
    return String(id || '') === 'auto_shoutout';
  }

  function categoryLabel(id){
    const c = categories().find(row => row.id === id || row.key === id);
    if (isLegacyCategory(id)) return 'Legacy AutoShoutout';
    return c ? String(c.label || c.id || id) : String(id || 'Alle Texte');
  }

  function categoryCount(id){
    if (!id) return keys().length;
    const c = categories().find(row => row.id === id || row.key === id);
    return c ? Number(c.variantCount ?? c.count ?? 0) : keyRows(id).length;
  }

  function keyRows(category = state.selectedCategory){
    const list = keys();
    if (!category) return list;
    return list.filter(row => String(row.category || '') === category);
  }

  function selectedKeyRow(){
    const list = keys();
    let found = list.find(row => row.key === state.selectedKey) || null;
    if (!found && keyRows().length) found = keyRows()[0];
    if (found && state.selectedKey !== found.key) state.selectedKey = found.key;
    return found;
  }

  function variantValues(row){
    const vars = Array.isArray(row?.variants) ? row.variants : [];
    return vars.filter(v => v && v.enabled !== false).map(v => String(v.value || v.text || '').trim()).filter(Boolean);
  }

  function markDirty(value = true){
    state.dirty = !!value;
    const p = panel(false);
    if (p) p.dataset.dirty = state.dirty ? '1' : '0';
  }

  function ensureSelection(){
    const cats = categories();
    if (!state.selectedCategory && cats.some(c => c.id === 'shoutout.chat')) state.selectedCategory = 'shoutout.chat';
    if (state.selectedCategory && !cats.some(c => c.id === state.selectedCategory) && !keyRows(state.selectedCategory).length) state.selectedCategory = '';
    if (!selectedKeyRow()) state.selectedKey = '';
  }

  async function load(force = false){
    if (!state.active || !visible()) return;
    if (state.loading && !force) return;
    if (!force && state.dirty) return;
    state.loading = true;
    state.error = '';
    render();
    try {
      const data = await api(API.texts);
      state.data = data;
      state.migration = data.migration || await api(API.migration).catch(err => ({ ok:false, error: err.message }));
      ensureSelection();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  function collectVariantValues(){
    const p = panel(false);
    if (!p) return [];
    return Array.from(p.querySelectorAll('[data-shoutout-text-variant-input]'))
      .map(input => String(input.value || '').trim())
      .filter(Boolean);
  }

  async function saveSelectedKey(){
    const row = selectedKeyRow();
    if (!row) return;
    const variants = collectVariantValues();
    if (!variants.length) {
      state.error = 'Mindestens eine Textvariante ist erforderlich.';
      render();
      return;
    }
    state.loading = true;
    state.error = '';
    state.notice = '';
    render();
    try {
      await api(API.texts, {
        method: 'POST',
        body: JSON.stringify({
          action: 'replaceKeyVariants',
          key: row.key,
          category: row.category || state.selectedCategory || 'shoutout.system',
          variants
        })
      });
      state.notice = `Textvarianten für ${row.key} gespeichert.`;
      markDirty(false);
      await load(true);
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
      state.loading = false;
      render();
    }
  }

  function renderCategoryOptions(){
    const cats = categories();
    return `
      <option value="">Alle Texte (${esc(keys().length)})</option>
      ${cats.map(cat => `
        <option value="${esc(cat.id)}" ${state.selectedCategory === cat.id ? 'selected' : ''}>
          ${esc(categoryLabel(cat.id))}${isLegacyCategory(cat.id) ? ' · Legacy' : ''} (${esc(cat.variantCount ?? cat.count ?? 0)})
        </option>
      `).join('')}
    `;
  }

  function renderKeyOptions(){
    const rows = keyRows();
    return rows.length
      ? rows.map(row => `<option value="${esc(row.key)}" ${state.selectedKey === row.key ? 'selected' : ''}>${esc(row.key)} · ${esc(row.activeCount ?? 0)}/${esc(row.totalCount ?? 0)} aktiv</option>`).join('')
      : '<option value="">Keine Textkeys</option>';
  }

  function renderVariantRows(row){
    const values = variantValues(row);
    const rows = values.length ? values : [''];
    const canRemove = rows.length > 1;
    return rows.map((value, index) => `
      <div class="shoutout-texts-variant-row ${canRemove ? '' : 'single'}" data-shoutout-text-variant-row>
        <label>
          <span>Variante ${index + 1}</span>
          <textarea data-shoutout-text-variant-input rows="${String(value).length > 110 ? 3 : 2}" spellcheck="false">${esc(value)}</textarea>
        </label>
        ${canRemove ? '<button type="button" class="shoutout-texts-icon-btn" data-shoutout-text-remove-variant title="Variante entfernen">×</button>' : ''}
      </div>
    `).join('');
  }

  function renderEditor(){
    const row = selectedKeyRow();
    if (!row) {
      return '<div class="shoutout-card shoutout-texts-editor"><h3>Kein Textkey ausgewählt</h3><p class="shoutout-muted">Wähle oben eine Kategorie und einen Text aus.</p></div>';
    }
    return `
      <div class="shoutout-card shoutout-texts-editor">
        <div class="shoutout-card-head shoutout-texts-editor-head">
          <div>
            <h3>${esc(row.key)}</h3>
            <p>Kategorie: <span class="shoutout-texts-category-pill">${esc(categoryLabel(row.category))}</span>. Runtime-Fallbacks bleiben bis zur späteren Umstellung bestehen.</p>
          </div>
          <div class="shoutout-texts-editor-actions">
            <button type="button" data-shoutout-text-add-variant>+ Variante</button>
            <button type="button" data-shoutout-text-reload>Neu laden</button>
            <button type="button" data-shoutout-text-save>Speichern</button>
          </div>
        </div>
        ${isLegacyCategory(row.category) ? '<div class="shoutout-texts-legacy-note">Legacy/Fallback: Dieser Key bleibt zur Kompatibilität erhalten. Neue Runtime-Zielkeys liegen unter <code>shoutout.*</code>.</div>' : ''}
        <div class="shoutout-texts-variants" data-shoutout-text-variants-list>
          ${renderVariantRows(row)}
        </div>
        <div class="shoutout-texts-help">
          <span>Platzhalter je nach Text: <code>@{displayName}</code>, <code>@{login}</code>, <code>{login}</code>, <code>{waitTime}</code>, <code>{reason}</code></span>
          <span>Varianten: ${esc(row.activeCount ?? 0)} aktiv / ${esc(row.totalCount ?? 0)} gesamt</span>
        </div>
      </div>
    `;
  }

  function renderMigration(){
    const m = state.migration || state.data?.migration || {};
    const planned = Array.isArray(m.plannedKeys) ? m.plannedKeys : [];
    return `
      <details class="shoutout-card shoutout-texts-migration">
        <summary>
          <span><strong>Migration / Kompatibilität</strong><small>Alte Config-Texte und Legacy-Keys bleiben Fallback.</small></span>
          <span class="shoutout-badge ${m.noRuntimeChange !== false ? 'ok' : 'warn'}">${m.noRuntimeChange !== false ? 'No Runtime Change' : 'Prüfen'}</span>
        </summary>
        <div class="shoutout-texts-meta-grid">
          <div><small>Modul</small><strong>${esc(state.data?.moduleVersion || m.moduleVersion || '-')}</strong></div>
          <div><small>Tabelle</small><strong>${esc(state.data?.texts?.variantsTable || m.targetTable || '-')}</strong></div>
          <div><small>Keys</small><strong>${esc(planned.length || keys().length)}</strong></div>
          <div><small>Legacy Auto-Route</small><strong>${esc(m.compatibility?.oldAutoTextsRouteRemains || state.data?.compatibility?.legacyAutoTextsRoute || '-')}</strong></div>
        </div>
      </details>
    `;
  }

  function render(){
    const p = panel(false);
    if (!p) return;
    const row = selectedKeyRow();
    p.innerHTML = `
      <div class="shoutout-texts-shell">
        <div class="shoutout-texts-head shoutout-card">
          <div>
            <div class="shoutout-kicker">Shoutout-System</div>
            <h2>Texte</h2>
            <p>Gemeinsamer Textbereich für Chat-Shoutout, AutoShoutout, offiziellen Twitch-Shoutout und Systemmeldungen.</p>
          </div>
          <div class="shoutout-texts-head-actions">
            <button type="button" data-shoutout-text-reload>${state.loading ? 'Lade...' : 'Aktualisieren'}</button>
          </div>
        </div>
        ${state.notice ? `<div class="shoutout-notice ok">${esc(state.notice)}</div>` : ''}
        ${state.error ? `<div class="shoutout-notice bad">${esc(state.error)}</div>` : ''}
        <div class="shoutout-card shoutout-texts-picker">
          <label>
            <span>Kategorie</span>
            <select data-shoutout-text-category-select>${renderCategoryOptions()}</select>
          </label>
          <label>
            <span>Text</span>
            <select data-shoutout-text-key-select>${renderKeyOptions()}</select>
          </label>
          <div class="shoutout-texts-picked-meta">
            <small>Aktuell</small>
            <strong>${row ? esc(row.key) : '-'}</strong>
            <span>${row ? `${esc(categoryLabel(row.category))} · ${esc(row.activeCount ?? 0)}/${esc(row.totalCount ?? 0)} aktiv` : 'Kein Text ausgewählt'}</span>
            ${row && isLegacyCategory(row.category) ? '<em>Legacy</em>' : ''}
          </div>
        </div>
        ${renderEditor()}
        ${renderMigration()}
      </div>
    `;
  }

  function addVariantField(){
    const list = panel(false)?.querySelector('[data-shoutout-text-variants-list]');
    if (!list) return;
    const index = list.querySelectorAll('[data-shoutout-text-variant-row]').length + 1;
    const wrap = document.createElement('div');
    wrap.className = 'shoutout-texts-variant-row';
    wrap.setAttribute('data-shoutout-text-variant-row', '');
    wrap.innerHTML = `
      <label>
        <span>Variante ${index}</span>
        <textarea data-shoutout-text-variant-input rows="2" spellcheck="false"></textarea>
      </label>
      <button type="button" class="shoutout-texts-icon-btn" data-shoutout-text-remove-variant title="Variante entfernen">×</button>
    `;
    list.appendChild(wrap);
    const input = wrap.querySelector('textarea');
    if (input) input.focus();
    markDirty(true);
  }

  function renumberVariants(){
    panel(false)?.querySelectorAll('[data-shoutout-text-variant-row]').forEach((row, index) => {
      const span = row.querySelector('label > span');
      if (span) span.textContent = `Variante ${index + 1}`;
    });
  }

  function activate(){
    state.active = true;
    const r = root();
    const btn = ensureTab();
    if (!r || !btn) return;
    r.querySelectorAll('.shoutout-tab').forEach(tab => {
      tab.classList.toggle('active', tab === btn);
      tab.setAttribute('aria-selected', tab === btn ? 'true' : 'false');
    });
    hideOtherPanels(true);
    panel(true);
    render();
    load(false);
  }

  function deactivate(){
    if (!state.active) return;
    state.active = false;
    const p = panel(false);
    if (p) p.remove();
    hideOtherPanels(false);
  }

  function bind(){
    document.addEventListener('click', event => {
      const tab = event.target && event.target.closest ? event.target.closest('[data-shoutout-texts-tab]') : null;
      if (tab) {
        event.preventDefault();
        event.stopPropagation();
        activate();
        return;
      }
      const nativeTab = event.target && event.target.closest ? event.target.closest('.shoutout-tab') : null;
      if (nativeTab && !nativeTab.hasAttribute('data-shoutout-texts-tab')) deactivate();

      if (!state.active) return;

      if (event.target && event.target.matches && event.target.matches('[data-shoutout-text-save]')) {
        event.preventDefault();
        saveSelectedKey();
        return;
      }

      if (event.target && event.target.matches && event.target.matches('[data-shoutout-text-reload]')) {
        event.preventDefault();
        markDirty(false);
        load(true);
        return;
      }

      if (event.target && event.target.matches && event.target.matches('[data-shoutout-text-add-variant]')) {
        event.preventDefault();
        addVariantField();
        return;
      }

      const remove = event.target && event.target.closest ? event.target.closest('[data-shoutout-text-remove-variant]') : null;
      if (remove) {
        event.preventDefault();
        const rows = panel(false)?.querySelectorAll('[data-shoutout-text-variant-row]') || [];
        if (rows.length <= 1) return;
        remove.closest('[data-shoutout-text-variant-row]')?.remove();
        renumberVariants();
        markDirty(true);
      }
    }, true);

    document.addEventListener('change', event => {
      if (!state.active || !event.target || !event.target.matches) return;
      if (event.target.matches('[data-shoutout-text-category-select]')) {
        state.selectedCategory = event.target.value || '';
        state.selectedKey = '';
        markDirty(false);
        ensureSelection();
        render();
      }
      if (event.target.matches('[data-shoutout-text-key-select]')) {
        state.selectedKey = event.target.value || '';
        markDirty(false);
        render();
      }
    });

    document.addEventListener('input', event => {
      if (state.active && event.target && event.target.matches && event.target.matches('[data-shoutout-text-variant-input]')) markDirty(true);
    });

    const observer = new MutationObserver(() => {
      if (visible()) ensureTab();
      else deactivate();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });

    setInterval(() => {
      if (visible()) ensureTab();
    }, 1500);
  }

  function init(){
    bind();
    ensureTab();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { activate, deactivate, load, render };
})();
