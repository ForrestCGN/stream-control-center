window.TagebuchModule = (function(){
  'use strict';

  const api = {
    status: '/api/tagebuch/status',
    settings: '/api/tagebuch/admin/settings',
    texts: '/api/tagebuch/admin/texts',
    statsTop: '/api/tagebuch/stats',
    statsToday: '/api/tagebuch/stats/today',
    reload: '/api/tagebuch/reload'
  };

  let root = null;
  let state = { status:null, settings:null, texts:null, statsTop:null, statsToday:null, loading:false, error:'', tab:'overview' };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function rows(data){ return Array.isArray(data?.rows) ? data.rows : []; }
  function boolText(v){ return v ? 'Aktiv' : 'Inaktiv'; }
  function pill(v, good=true){ return `<span class="tagebuch-pill ${good ? 'ok' : 'warn'}">${esc(v)}</span>`; }
  function fmt(v){ return v ? esc(v) : '<span class="tagebuch-muted">-</span>'; }
  function rowByKey(list, key){ return rows(list).find(r => r.key === key); }

  function getInputValue(row){
    const el = root?.querySelector(`[data-setting-input="${CSS.escape(row.key)}"]`);
    if (!el) return row.value;
    const raw = el.value;
    if (row.valueType === 'boolean') return raw === 'true';
    if (row.valueType === 'number') return Number(raw);
    if (row.valueType === 'json') {
      try { return JSON.parse(raw); } catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return raw;
  }

  async function loadAll(force){
    root = document.getElementById('tagebuchModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.settings && state.texts) { render(); return; }

    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, settings, texts, statsTop, statsToday] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.settings),
        window.CGN.api(api.texts),
        window.CGN.api(api.statsTop).catch(err => ({ ok:false, error:err.message, users:[] })),
        window.CGN.api(api.statsToday).catch(err => ({ ok:false, error:err.message, users:[] }))
      ]);
      state = { ...state, status, settings, texts, statsTop, statsToday, loading:false, error:'' };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function reloadBackend(){
    await window.CGN.api(api.reload, { method:'POST', body:'{}' });
    await loadAll(true);
  }

  async function saveSetting(key){
    const row = rowByKey(state.settings?.settings, key);
    if (!row) return;
    const value = getInputValue(row);
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key, value }) });
    await loadAll(true);
  }

  async function saveText(key){
    const el = root?.querySelector(`[data-text-input="${CSS.escape(key)}"]`);
    if (!el) return;
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({ key, value: el.value }) });
    await loadAll(true);
  }

  function renderSettingInput(row){
    if (row.valueType === 'boolean') {
      return `<select data-setting-input="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    }
    if (row.valueType === 'json') {
      return `<textarea data-setting-input="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    }
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-setting-input="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderOverview(){
    const status = state.status || {};
    const cfg = status.config || {};
    const st = status.state || {};
    const top = Array.isArray(state.statsTop?.users) ? state.statsTop.users : [];
    return `
      <div class="tagebuch-grid">
        <section class="tagebuch-card tagebuch-card-main">
          <h3>Status</h3>
          <div class="tagebuch-kpis">
            <div><strong>${boolText(cfg.enabled)}</strong><span>Modul</span></div>
            <div><strong>${st.currentPageNumber ?? '-'}</strong><span>Aktuelle Seite</span></div>
            <div><strong>${boolText(st.activeStream)}</strong><span>Stream aktiv</span></div>
            <div><strong>${st.nextPageNumberIfNewDate ?? '-'}</strong><span>Nächste Seite</span></div>
          </div>
          <div class="tagebuch-rows">
            <div><span>Seitendatum</span><strong>${fmt(st.currentPageDate)}</strong></div>
            <div><span>Heute lokal</span><strong>${fmt(st.localDateToday)}</strong></div>
            <div><span>Settings</span><strong>${fmt(cfg.settingsSource)} / ${fmt(cfg.settingsTable)}</strong></div>
            <div><span>Webhook</span><strong>${pill(cfg.hasWebhookUrl ? 'konfiguriert' : 'fehlt', !!cfg.hasWebhookUrl)}</strong></div>
          </div>
        </section>
        <section class="tagebuch-card">
          <h3>Top Einträge</h3>
          ${top.length ? `<ol class="tagebuch-top-list">${top.slice(0,5).map(u => `<li><span>${esc(u.display_name || u.user_display_name || u.user_login || u.author_display_name || u.author_login || 'User')}</span><strong>${esc(u.entry_count ?? u.count ?? 0)}</strong></li>`).join('')}</ol>` : '<div class="tagebuch-empty">Noch keine Statistikdaten oder nicht abrufbar.</div>'}
        </section>
      </div>
    `;
  }

  function renderSettings(){
    const list = rows(state.settings?.settings);
    return `<section class="tagebuch-card"><h3>Settings aus DB</h3><p class="tagebuch-note">JSON bleibt Fallback. Speichern schreibt einzelne Werte in die DB.</p><div class="tagebuch-setting-list">${list.map(row => `
      <article class="tagebuch-setting-row">
        <div><strong>${esc(row.key)}</strong><span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span></div>
        <div class="tagebuch-setting-input">${renderSettingInput(row)}</div>
        <button type="button" data-save-setting="${esc(row.key)}">Speichern</button>
      </article>`).join('')}</div></section>`;
  }

  function renderTexts(){
    const list = rows(state.texts?.texts);
    return `<section class="tagebuch-card"><h3>Texte aus DB</h3><p class="tagebuch-note">Diese Texte werden vom Backend genutzt. Platzhalter wie <code>{page}</code> bleiben unverändert erhalten.</p><div class="tagebuch-text-list">${list.map(row => `
      <article class="tagebuch-text-row">
        <div class="tagebuch-text-head"><strong>${esc(row.key)}</strong><span>${esc(row.source || '')}</span></div>
        <textarea data-text-input="${esc(row.key)}" spellcheck="false">${esc(row.value ?? row.text ?? '')}</textarea>
        <div class="tagebuch-row-actions"><button type="button" data-save-text="${esc(row.key)}">Text speichern</button></div>
      </article>`).join('')}</div></section>`;
  }

  function renderStats(){
    const top = Array.isArray(state.statsTop?.users) ? state.statsTop.users : [];
    const today = Array.isArray(state.statsToday?.users) ? state.statsToday.users : [];
    const table = list => list.length ? `<div class="tagebuch-table-wrap"><table><thead><tr><th>User</th><th>Einträge</th><th>Erster</th><th>Letzter</th></tr></thead><tbody>${list.map(u => `<tr><td>${esc(u.display_name || u.user_display_name || u.user_login || u.author_display_name || u.author_login || '-')}</td><td>${esc(u.entry_count ?? u.count ?? 0)}</td><td>${fmt(u.first_entry_at || u.firstEntryAt)}</td><td>${fmt(u.last_entry_at || u.lastEntryAt)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="tagebuch-empty">Keine Daten.</div>';
    return `<div class="tagebuch-grid"><section class="tagebuch-card"><h3>Top gesamt</h3>${table(top)}</section><section class="tagebuch-card"><h3>Heute</h3>${table(today)}</section></div>`;
  }

  function render(){
    root = document.getElementById('tagebuchModule');
    if (!root) return;
    const tabs = [
      ['overview','Übersicht'], ['settings','Settings'], ['texts','Texte'], ['stats','Statistik']
    ];
    root.innerHTML = `
      <div class="tagebuch-admin-wrap">
        <section class="tagebuch-card tagebuch-hero">
          <div><h2>📖 Tagebuch</h2><p>Streamtagebuch verwalten: Status, DB-Settings, DB-Texte und Statistiken.</p></div>
          <div class="tagebuch-actions"><button type="button" data-tagebuch-reload>Backend neu laden</button><button type="button" data-tagebuch-refresh>Aktualisieren</button></div>
        </section>
        ${state.error ? `<div class="tagebuch-error">${esc(state.error)}</div>` : ''}
        ${state.loading ? '<div class="tagebuch-card">Lade Tagebuch-Daten...</div>' : `
          <div class="tagebuch-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-tagebuch-tab="${id}">${label}</button>`).join('')}</div>
          ${state.tab === 'settings' ? renderSettings() : state.tab === 'texts' ? renderTexts() : state.tab === 'stats' ? renderStats() : renderOverview()}
        `}
      </div>`;
    bind();
  }

  function bind(){
    root?.querySelector('[data-tagebuch-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelector('[data-tagebuch-reload]')?.addEventListener('click', () => reloadBackend().catch(err => { state.error = err.message; render(); }));
    root?.querySelectorAll('[data-tagebuch-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.tagebuchTab || 'overview'; render(); }));
    root?.querySelectorAll('[data-save-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.saveSetting).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-save-text]').forEach(btn => btn.addEventListener('click', () => saveText(btn.dataset.saveText).catch(err => { state.error = err.message; render(); })));
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'tagebuch') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('tagebuchModule'); });
  else root = document.getElementById('tagebuchModule');

  return { loadAll, render };
})();
