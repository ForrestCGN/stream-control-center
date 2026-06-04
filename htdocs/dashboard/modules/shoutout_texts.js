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
      const afterAuto = tabs.querySelector('[data-auto-so-tab]');
      const anchor = afterAuto || queueTab;
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
    return c ? String(c.label || c.id || id) : String(id || 'Alle');
  }

  function categoryHint(id){
    if (!id) return 'Alle Textkeys';
    if (isLegacyCategory(id)) return 'Fallback / Altbestand';
    return categoryLabel(id);
  }

  function textareaRowsFor(row){
    const count = Math.max(1, String(variantLines(row) || '').split(/\r?\n/).filter(Boolean).length);
    return Math.max(5, Math.min(14, count + 2));
  }

  function keyRows(){
    const list = keys();
    if (!state.selectedCategory) return list;
    return list.filter(row => String(row.category || '') === state.selectedCategory);
  }

  function selectedKeyRow(){
    const list = keys();
    let found = list.find(row => row.key === state.selectedKey) || null;
    if (!found && keyRows().length) found = keyRows()[0];
    if (found && state.selectedKey !== found.key) state.selectedKey = found.key;
    return found;
  }

  function variantLines(row){
    const vars = Array.isArray(row?.variants) ? row.variants : [];
    return vars.filter(v => v && v.enabled !== false).map(v => String(v.value || v.text || '').trim()).filter(Boolean).join('\n');
  }

  function markDirty(value = true){
    state.dirty = !!value;
    const p = panel(false);
    if (p) p.dataset.dirty = state.dirty ? '1' : '0';
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
      const cats = categories();
      if (!state.selectedCategory && cats.some(c => c.id === 'shoutout.chat')) state.selectedCategory = 'shoutout.chat';
      if (!selectedKeyRow()) state.selectedKey = '';
    } catch (err) {
      state.error = err && err.message ? err.message : String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function saveSelectedKey(){
    const row = selectedKeyRow();
    const p = panel(false);
    if (!row || !p) return;
    const text = String(p.querySelector('[data-shoutout-text-variants]')?.value || '');
    const variants = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
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

  function renderCategoryRail(){
    const cats = categories();
    return `
      <div class="shoutout-texts-rail">
        <button type="button" class="shoutout-texts-cat ${!state.selectedCategory ? 'active' : ''}" data-shoutout-text-category="">Alle Texte <small>${keys().length}</small></button>
        ${cats.map(cat => `
          <button type="button" class="shoutout-texts-cat ${state.selectedCategory === cat.id ? 'active' : ''} ${isLegacyCategory(cat.id) ? 'legacy' : ''}" data-shoutout-text-category="${esc(cat.id)}">
            <span>${esc(categoryLabel(cat.id))}</span>
            <small>${esc(cat.variantCount ?? cat.count ?? 0)}</small>
            ${isLegacyCategory(cat.id) ? '<em>Legacy</em>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderKeyList(){
    const rows = keyRows();
    return `
      <div class="shoutout-texts-keylist">
        ${rows.length ? rows.map(row => `
          <button type="button" class="shoutout-texts-key ${state.selectedKey === row.key ? 'active' : ''} ${isLegacyCategory(row.category) ? 'legacy' : ''}" data-shoutout-text-key="${esc(row.key)}">
            <strong>${esc(row.key)}</strong>
            <span>${esc(categoryHint(row.category))} · ${esc(row.activeCount ?? 0)}/${esc(row.totalCount ?? 0)} aktiv</span>
          </button>
        `).join('') : '<div class="shoutout-texts-empty">Keine Textkeys in dieser Kategorie.</div>'}
      </div>
    `;
  }

  function renderEditor(){
    const row = selectedKeyRow();
    if (!row) {
      return '<div class="shoutout-card shoutout-wide"><h3>Kein Textkey ausgewählt</h3><p class="shoutout-muted">Wähle links einen Textkey aus.</p></div>';
    }
    return `
      <div class="shoutout-card shoutout-wide shoutout-texts-editor">
        <div class="shoutout-card-head">
          <div>
            <h3>${esc(row.key)}</h3>
            <p>Kategorie: <code>${esc(row.category || 'general')}</code>. Eine Variante pro Zeile. Aktuell wird nur die Variantenliste bearbeitet; Runtime-Fallbacks bleiben bestehen.</p>
          </div>
          <div class="shoutout-texts-editor-actions">
            <button type="button" data-shoutout-text-reload>Neu laden</button>
            <button type="button" data-shoutout-text-save>Speichern</button>
          </div>
        </div>
        ${isLegacyCategory(row.category) ? '<div class="shoutout-texts-legacy-note">Legacy/Fallback: Dieser Key bleibt zur Kompatibilität erhalten. Neue Runtime-Zielkeys liegen unter <code>shoutout.*</code>.</div>' : ''}
        <textarea data-shoutout-text-variants spellcheck="false" rows="${textareaRowsFor(row)}">${esc(variantLines(row))}</textarea>
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
      <details class="shoutout-card shoutout-wide shoutout-texts-migration">
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
    p.innerHTML = `
      <div class="shoutout-texts-head">
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
      <div class="shoutout-texts-layout">
        ${renderCategoryRail()}
        <div class="shoutout-texts-main">
          ${renderKeyList()}
          ${renderEditor()}
          ${renderMigration()}
        </div>
      </div>
    `;
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

      const category = event.target && event.target.closest ? event.target.closest('[data-shoutout-text-category]') : null;
      if (category && state.active) {
        event.preventDefault();
        state.selectedCategory = category.getAttribute('data-shoutout-text-category') || '';
        state.selectedKey = '';
        markDirty(false);
        render();
        return;
      }

      const key = event.target && event.target.closest ? event.target.closest('[data-shoutout-text-key]') : null;
      if (key && state.active) {
        event.preventDefault();
        state.selectedKey = key.getAttribute('data-shoutout-text-key') || '';
        markDirty(false);
        render();
        return;
      }

      if (event.target && event.target.matches && event.target.matches('[data-shoutout-text-save]')) {
        event.preventDefault();
        saveSelectedKey();
        return;
      }

      if (event.target && event.target.matches && event.target.matches('[data-shoutout-text-reload]')) {
        event.preventDefault();
        markDirty(false);
        load(true);
      }
    }, true);

    document.addEventListener('input', event => {
      if (state.active && event.target && event.target.matches && event.target.matches('[data-shoutout-text-variants]')) markDirty(true);
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
