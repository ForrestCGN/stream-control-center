window.HugModule = (function(){
  'use strict';

  let root = null;
  let status = null;
  let loading = false;
  let actionsBound = false;

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  function num(v){ return Number(v || 0).toLocaleString('de-DE'); }
  async function api(path, options){ return window.CGN.api(path, options || {}); }

  function registerModule(){
    if (!window.CGN) return;
    window.CGN.modules.hug = {
      title: 'Hug-System',
      panelId: 'hugModule',
      group: 'community',
      overlayLink: '',
      overlayLabel: '',
      reload(){ return window.HugModule?.loadAll?.(true); }
    };
  }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="hug-card hug-hero">
        <div>
          <h2>Hug-System</h2>
          <div class="hug-note">Zentrale Übersicht für Hug/Rehug, DB-Texte, Statistiken und Diagnose. Schreiben/Bearbeiten bleibt in dieser Phase bewusst deaktiviert.</div>
        </div>
        <div class="hug-actions">
          <button type="button" data-hug-action="reload">Neu laden</button>
          <button type="button" data-hug-action="reload-hug">Hug-Reload testen</button>
        </div>
      </div>

      <div class="hug-grid">
        <div class="hug-card" id="hugStatusCard"></div>
        <div class="hug-card" id="hugStatsCard"></div>
        <div class="hug-card" id="hugOutputCard"></div>
        <div class="hug-card" id="hugDbCard"></div>
        <div class="hug-card hug-wide" id="hugTopCard"></div>
        <div class="hug-card hug-wide" id="hugRecentCard"></div>
        <div class="hug-card hug-wide" id="hugTextCard"></div>
        <div class="hug-card hug-wide" id="hugTypeCard"></div>
        <div class="hug-card hug-wide" id="hugDiagCard"></div>
      </div>
    `;
  }

  function render(){
    if (!root) return;
    if (!root.dataset.ready) {
      renderShell();
      root.dataset.ready = '1';
      bindActions();
    }
    renderStatus();
    renderStats();
    renderOutput();
    renderDatabase();
    renderTop();
    renderRecent();
    renderTexts();
    renderTypes();
    renderDiag();
  }

  function renderStatus(){
    const el = document.getElementById('hugStatusCard');
    if (!el) return;
    el.innerHTML = `
      <h3>Status</h3>
      <div class="hug-row"><span>Modul</span><strong class="hug-pill ${status?.enabled ? 'ok' : 'warn'}">${status?.enabled ? 'Aktiv' : 'Inaktiv'}</strong></div>
      <div class="hug-row"><span>Quelle</span><span>${esc(status?.source || '-')}</span></div>
      <div class="hug-row"><span>Schema</span><span>${esc(status?.schemaVersion ?? '-')}</span></div>
      <div class="hug-row"><span>Cache</span><span>${esc(status?.cacheLoadedAt || '-')}</span></div>
      <div class="hug-row"><span>Rehug-Fenster</span><span>${esc(status?.rehugWindowSeconds ?? '-')}s</span></div>
      <div class="hug-row"><span>Top-Limit</span><span>${esc(status?.topLimit ?? '-')}</span></div>
    `;
  }

  function renderStats(){
    const el = document.getElementById('hugStatsCard');
    if (!el) return;
    const c = status?.counts || {};
    el.innerHTML = `
      <h3>Statistik</h3>
      <div class="hug-kpis">
        ${kpi('User', c.users)}
        ${kpi('Hugs vergeben', c.totalHugsGiven)}
        ${kpi('Hugs erhalten', c.totalHugsReceived)}
        ${kpi('Rehugs', c.totalRehugsGiven)}
      </div>
      <div class="hug-row"><span>Aktive User</span><span>${num(c.enabledUsers)}</span></div>
      <div class="hug-row"><span>Inaktive User</span><span>${num(c.disabledUsers)}</span></div>
      <div class="hug-row"><span>Pair-Stats</span><span>${num(c.pairStats)}</span></div>
      <div class="hug-row"><span>Pending Rehugs</span><span>${num(c.pendingRehugs)}</span></div>
    `;
  }

  function kpi(label, value){
    return `<div class="hug-kpi"><strong>${num(value)}</strong><span>${esc(label)}</span></div>`;
  }

  function renderOutput(){
    const el = document.getElementById('hugOutputCard');
    if (!el) return;
    const out = status?.output || {};
    el.innerHTML = `
      <h3>Chat-Ausgabe</h3>
      <div class="hug-row"><span>Modus</span><strong class="hug-pill ok">${esc(out.mode || '-')}</strong></div>
      <div class="hug-row"><span>Prefer</span><span>${esc(out.prefer || '-')}</span></div>
      <div class="hug-row"><span>Fallback Streamer</span><span>${out.fallbackToStreamer === false ? 'Nein' : 'Ja'}</span></div>
      <div class="hug-row"><span>Fallback Streamer.bot</span><span>${out.fallbackToStreamerbot === false ? 'Nein' : 'Ja'}</span></div>
      <div class="hug-note">Änderungen am Output-Modus bleiben erstmal bewusst nicht im Dashboard schreibbar.</div>
    `;
  }

  function renderDatabase(){
    const el = document.getElementById('hugDbCard');
    if (!el) return;
    const db = status?.database || {};
    el.innerHTML = `
      <h3>Datenbank</h3>
      <div class="hug-row"><span>Adapter</span><span>${esc(db.adapter || '-')}</span></div>
      <div class="hug-row"><span>Dialect</span><span>${esc(db.dialect || '-')}</span></div>
      <div class="hug-row"><span>MariaDB</span><span>${esc(db.mariaDbReady || 'vorbereitet')}</span></div>
      <div class="hug-note">Pfad: ${esc(db.path || '')}</div>
    `;
  }

  function renderTop(){
    const el = document.getElementById('hugTopCard');
    if (!el) return;
    const top = status?.top || {};
    el.innerHTML = `
      <h3>Toplisten</h3>
      <div class="hug-top-grid">
        ${topList('Top Hugger', top.given, 'givenTotal')}
        ${topList('Top Empfänger', top.received, 'receivedTotal')}
        ${topList('Top Rehug', top.rehug, 'rehugGivenTotal')}
      </div>
    `;
  }

  function topList(title, rows, key){
    const list = Array.isArray(rows) && rows.length ? rows.map((r, i) => `
      <li><span>${i + 1}. ${esc(r.displayName || r.login || '-')}</span><strong>${num(r[key])}</strong></li>
    `).join('') : '<li><span>Keine Daten</span><strong>-</strong></li>';
    return `<div class="hug-top-list"><h4>${esc(title)}</h4><ol>${list}</ol></div>`;
  }

  function renderRecent(){
    const el = document.getElementById('hugRecentCard');
    if (!el) return;
    const rows = Array.isArray(status?.recentPairs) ? status.recentPairs : [];
    el.innerHTML = `
      <h3>Letzte Hug-Aktionen</h3>
      <div class="hug-table-wrap">
        <table class="hug-table">
          <thead><tr><th>Von</th><th>An</th><th>Hugs</th><th>Rehugs</th><th>Letzter Hug</th><th>Letzter Rehug</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map(row => `
              <tr>
                <td>${esc(row.fromDisplayName || '-')}</td>
                <td>${esc(row.toDisplayName || '-')}</td>
                <td>${num(row.givenCount)}</td>
                <td>${num(row.rehugCount)}</td>
                <td>${esc(row.lastHugAt || '-')}</td>
                <td>${esc(row.lastRehugAt || '-')}</td>
              </tr>
            `).join('') : '<tr><td colspan="6">Keine Daten vorhanden.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTexts(){
    const el = document.getElementById('hugTextCard');
    if (!el) return;
    const kinds = Array.isArray(status?.textKinds) ? status.textKinds : [];
    el.innerHTML = `
      <h3>Texte / Messages</h3>
      <div class="hug-kind-grid">
        ${kinds.length ? kinds.map(k => `<div class="hug-kind"><strong>${num(k.count)}</strong><span>${esc(k.kind)}</span></div>`).join('') : '<div class="hug-empty">Keine Textdaten gefunden.</div>'}
      </div>
      <div class="hug-note">Texte liegen in der Datenbank. Datei-Import/Reload bleibt Diagnose, Bearbeiten folgt später mit Rollen/Rechte/Audit.</div>
    `;
  }

  function renderTypes(){
    const el = document.getElementById('hugTypeCard');
    if (!el) return;
    const types = Array.isArray(status?.types) ? status.types : [];
    el.innerHTML = `
      <h3>Hug-Typen</h3>
      <div class="hug-type-list">
        ${types.length ? types.map(t => `
          <div class="hug-type">
            <strong>#${esc(t.id)} ${esc(t.name)}</strong>
            <span>Gewicht ${esc(t.weight)} · ${t.enabled ? 'aktiv' : 'inaktiv'} · Hug-Texte ${esc(t.hugTexts ?? t.hugTextCount ?? '-')} · Rehug-Texte ${esc(t.rehugTexts ?? t.rehugTextCount ?? '-')}</span>
          </div>
        `).join('') : '<div class="hug-empty">Keine Hug-Typen gefunden.</div>'}
      </div>
    `;
  }

  function renderDiag(){
    const el = document.getElementById('hugDiagCard');
    if (!el) return;
    const lastImport = status?.lastImport || {};
    el.innerHTML = `
      <h3>Diagnose</h3>
      <div class="hug-row"><span>Config</span><span>${esc(status?.configPath || '-')}</span></div>
      <div class="hug-row"><span>Messages</span><span>${esc(status?.messagesPath || '-')}</span></div>
      <div class="hug-row"><span>Letzter Import</span><span>${lastImport.importedAt ? esc(lastImport.importedAt) : esc(lastImport.reason || '-')}</span></div>
      <div class="hug-row"><span>Letzter Fehler</span><span>${esc(status?.lastError || '-')}</span></div>
      <pre class="hug-json">${esc(JSON.stringify({ module: status?.module, counts: status?.counts, output: status?.output }, null, 2))}</pre>
    `;
  }

  function bindActions(){
    if (actionsBound || !root) return;
    actionsBound = true;
    root.addEventListener('click', async ev => {
      const btn = ev.target.closest('[data-hug-action]');
      if (!btn) return;
      const action = btn.dataset.hugAction;
      btn.disabled = true;
      try {
        if (action === 'reload') await loadAll(true);
        if (action === 'reload-hug') {
          await api('/api/hug/reload');
          await loadAll(true);
        }
      } catch (err) {
        alert(`Hug-Fehler: ${err.message}`);
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    try {
      status = await api('/api/dashboard/community/hug/status');
      render();
    } catch (err) {
      if (root) root.innerHTML = `<div class="hug-card"><h2>Hug-System</h2><div class="hug-error">${esc(err.message)}</div></div>`;
    } finally {
      loading = false;
    }
  }

  function init(){
    registerModule();
    root = document.getElementById('hugModule');
    if (!root) return;
    renderShell();
    bindActions();
    loadAll(false);
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'hug') loadAll(true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, loadAll };
})();
