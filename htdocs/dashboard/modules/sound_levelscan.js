window.SoundLevelScanModule = (function(){
  'use strict';

  const API = '/api/sound/loudness';
  const state = {
    mounted: false,
    loading: false,
    scanLimit: 500,
    resultLimit: 250,
    order: 'recommended_gain_db',
    dir: 'desc',
    statusFilter: 'all',
    search: '',
    status: null,
    results: null,
    lastMessage: ''
  };

  function esc(value){ return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function num(value, digits = 1){ const n = Number(value); return Number.isFinite(n) ? n.toFixed(digits) : '-'; }
  function pct(value){ const n = Number(value); return Number.isFinite(n) ? `${Math.round(n)}%` : '-'; }
  function ms(value){ const n = Number(value); return Number.isFinite(n) && n > 0 ? `${(n / 1000).toFixed(1)}s` : '-'; }

  function warningLabel(key){
    const map = {
      true_peak_above_limit: 'True Peak über Limit',
      large_negative_gain: 'viel zu laut',
      large_positive_gain: 'viel zu leise',
      volume_cap_reached: 'Volume-Cap erreicht',
      loudnorm_parse_failed: 'Messwerte unvollständig',
      ffmpeg_failed: 'FFmpeg-Fehler'
    };
    return map[key] || key;
  }

  function statusLabel(value){
    if (value === 'ok') return 'OK';
    if (value === 'warning') return 'Warnung';
    if (value === 'error') return 'Fehler';
    return value || '-';
  }

  function statusClass(value){
    if (value === 'ok') return 'success';
    if (value === 'error') return 'danger';
    if (value === 'warning') return 'warn';
    return '';
  }

  function qs(params){
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  }

  function findRoot(){ return document.getElementById('soundModule'); }
  function findTabs(root){ return root ? root.querySelector('.sound-tabs') : null; }
  function findGrid(root){ return root ? root.querySelector('.sound-grid') : null; }

  function ensureMounted(){
    const root = findRoot();
    const tabs = findTabs(root);
    const grid = findGrid(root);
    if (!root || !tabs || !grid) return false;

    if (!tabs.querySelector('[data-sound-tab="levelscan"]')) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'sound-tab';
      tab.dataset.soundTab = 'levelscan';
      tab.textContent = 'Pegel-Scan';
      const diagnoseTab = tabs.querySelector('[data-sound-tab="diagnose"]');
      if (diagnoseTab) tabs.insertBefore(tab, diagnoseTab);
      else tabs.appendChild(tab);
    }

    if (!document.getElementById('soundLevelScanCard')) {
      const card = document.createElement('div');
      card.className = 'sound-card sound-levelscan-card';
      card.id = 'soundLevelScanCard';
      card.dataset.soundSection = 'levelscan';
      card.hidden = true;
      grid.appendChild(card);
    }

    bindOnce(root);
    render();
    state.mounted = true;
    return true;
  }

  function bindOnce(root){
    if (root.dataset.soundLevelscanBound === '1') return;
    root.dataset.soundLevelscanBound = '1';
    root.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-sound-level-action]');
      if (!button) return;
      const action = button.dataset.soundLevelAction;
      try {
        if (action === 'scan') await runScan();
        if (action === 'reload') await loadAll();
        if (action === 'problematic') {
          state.order = 'recommended_gain_db';
          state.dir = 'asc';
          state.statusFilter = 'warning';
          await loadAll();
        }
      } catch (err) {
        state.lastMessage = err.message || String(err);
        render();
      }
    });

    root.addEventListener('change', async (event) => {
      const target = event.target;
      if (!target || !target.dataset.soundLevelControl) return;
      readControls();
      await loadResultsOnly();
    });

    root.addEventListener('input', (event) => {
      const target = event.target;
      if (!target || !target.dataset.soundLevelControl) return;
      readControls();
      render();
    });
  }

  function readControls(){
    const scanLimit = Number(document.getElementById('soundLevelScanLimit')?.value);
    const resultLimit = Number(document.getElementById('soundLevelResultLimit')?.value);
    state.scanLimit = Number.isFinite(scanLimit) ? Math.max(1, Math.min(5000, Math.round(scanLimit))) : state.scanLimit;
    state.resultLimit = Number.isFinite(resultLimit) ? Math.max(1, Math.min(1000, Math.round(resultLimit))) : state.resultLimit;
    state.order = document.getElementById('soundLevelOrder')?.value || state.order;
    state.dir = document.getElementById('soundLevelDir')?.value || state.dir;
    state.statusFilter = document.getElementById('soundLevelStatusFilter')?.value || state.statusFilter;
    state.search = document.getElementById('soundLevelSearch')?.value || '';
  }

  async function runScan(){
    readControls();
    state.loading = true;
    state.lastMessage = 'Scan läuft...';
    render();
    const result = await api('/scan', {
      method: 'POST',
      body: JSON.stringify({ limit: state.scanLimit })
    });
    state.status = await api('/status');
    state.lastMessage = result?.scan ? `Scan fertig: ${result.scan.scannedFiles} Dateien, ${result.scan.warningFiles} Warnungen, ${result.scan.errorFiles} Fehler.` : 'Scan fertig.';
    await loadResultsOnly();
    state.loading = false;
    render();
  }

  async function loadResultsOnly(){
    const query = qs({
      limit: state.resultLimit,
      order: state.order,
      dir: state.dir
    });
    state.results = await api(`/results?${query}`);
    render();
  }

  async function loadAll(){
    state.loading = true;
    render();
    try {
      state.status = await api('/status');
      await loadResultsOnly();
      if (!state.lastMessage) state.lastMessage = 'Pegel-Scan geladen.';
    } finally {
      state.loading = false;
      render();
    }
  }

  function filteredResults(){
    const rows = Array.isArray(state.results?.results) ? state.results.results : [];
    const needle = String(state.search || '').trim().toLowerCase();
    return rows.filter(row => {
      if (state.statusFilter !== 'all' && row.status !== state.statusFilter) return false;
      if (needle && !String(row.relativePath || '').toLowerCase().includes(needle)) return false;
      return true;
    });
  }

  function renderSummary(){
    const scan = state.status?.latestScan || state.status?.lastResult?.scan || null;
    const defaults = state.status?.defaults || {};
    const count = Number(state.status?.resultsCount || 0);
    return `
      <div class="sound-levelscan-summary">
        <div class="sound-source-item"><span>Ergebnisse</span><strong class="sound-pill">${esc(count)}</strong></div>
        <div class="sound-source-item"><span>Letzter Scan</span><strong class="sound-pill">${scan?.finishedAt ? esc(scan.finishedAt) : '-'}</strong></div>
        <div class="sound-source-item"><span>Ziel-LUFS</span><strong class="sound-pill">${esc(defaults.targetLufs ?? '-')}</strong></div>
        <div class="sound-source-item"><span>True Peak Limit</span><strong class="sound-pill">${esc(defaults.truePeakLimitDbtp ?? '-')} dBTP</strong></div>
        <div class="sound-source-item"><span>Max Volume</span><strong class="sound-pill">${esc(defaults.maxPlaybackVolume ?? '-')}%</strong></div>
      </div>
      ${scan ? `
        <div class="sound-levelscan-lastscan">
          <span>Gefunden: <strong>${esc(scan.discoveredFiles ?? '-')}</strong></span>
          <span>Gescannt: <strong>${esc(scan.scannedFiles ?? '-')}</strong></span>
          <span>OK: <strong>${esc(scan.okFiles ?? '-')}</strong></span>
          <span>Warnungen: <strong>${esc(scan.warningFiles ?? '-')}</strong></span>
          <span>Fehler: <strong>${esc(scan.errorFiles ?? '-')}</strong></span>
        </div>
      ` : ''}
    `;
  }

  function renderControls(){
    return `
      <div class="sound-levelscan-controls">
        <label class="sound-field">
          <span>Scan-Limit</span>
          <input id="soundLevelScanLimit" data-sound-level-control="scanLimit" type="number" min="1" max="5000" value="${esc(state.scanLimit)}">
        </label>
        <label class="sound-field">
          <span>Ergebnis-Limit</span>
          <input id="soundLevelResultLimit" data-sound-level-control="resultLimit" type="number" min="1" max="1000" value="${esc(state.resultLimit)}">
        </label>
        <label class="sound-field">
          <span>Sortieren nach</span>
          <select id="soundLevelOrder" data-sound-level-control="order">
            <option value="recommended_gain_db" ${state.order === 'recommended_gain_db' ? 'selected' : ''}>Empfohlener Gain</option>
            <option value="input_i" ${state.order === 'input_i' ? 'selected' : ''}>LUFS</option>
            <option value="input_tp" ${state.order === 'input_tp' ? 'selected' : ''}>True Peak</option>
            <option value="recommended_volume" ${state.order === 'recommended_volume' ? 'selected' : ''}>Empfohlenes Volume</option>
            <option value="relative_path" ${state.order === 'relative_path' ? 'selected' : ''}>Dateiname</option>
            <option value="scanned_at" ${state.order === 'scanned_at' ? 'selected' : ''}>Scan-Zeit</option>
          </select>
        </label>
        <label class="sound-field">
          <span>Richtung</span>
          <select id="soundLevelDir" data-sound-level-control="dir">
            <option value="desc" ${state.dir === 'desc' ? 'selected' : ''}>Absteigend</option>
            <option value="asc" ${state.dir === 'asc' ? 'selected' : ''}>Aufsteigend</option>
          </select>
        </label>
        <label class="sound-field">
          <span>Status</span>
          <select id="soundLevelStatusFilter" data-sound-level-control="statusFilter">
            <option value="all" ${state.statusFilter === 'all' ? 'selected' : ''}>Alle</option>
            <option value="ok" ${state.statusFilter === 'ok' ? 'selected' : ''}>OK</option>
            <option value="warning" ${state.statusFilter === 'warning' ? 'selected' : ''}>Warnungen</option>
            <option value="error" ${state.statusFilter === 'error' ? 'selected' : ''}>Fehler</option>
          </select>
        </label>
        <label class="sound-field sound-levelscan-search">
          <span>Suche</span>
          <input id="soundLevelSearch" data-sound-level-control="search" type="text" value="${esc(state.search)}" placeholder="Dateiname oder Ordner...">
        </label>
      </div>
      <div class="sound-actions">
        <button type="button" class="success" data-sound-level-action="scan" ${state.loading ? 'disabled' : ''}>Scan starten</button>
        <button type="button" data-sound-level-action="reload" ${state.loading ? 'disabled' : ''}>Neu laden</button>
        <button type="button" data-sound-level-action="problematic" ${state.loading ? 'disabled' : ''}>Problematische zuerst</button>
      </div>
    `;
  }

  function renderRows(){
    const rows = filteredResults();
    if (!rows.length) return `<div class="sound-empty">Keine passenden Pegel-Ergebnisse vorhanden.</div>`;
    return `
      <div class="sound-levelscan-table-wrap">
        <table class="sound-levelscan-table">
          <thead>
            <tr>
              <th>Datei</th>
              <th>Status</th>
              <th>LUFS</th>
              <th>True Peak</th>
              <th>Gain</th>
              <th>Volume</th>
              <th>Dauer</th>
              <th>Warnungen</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td class="sound-levelscan-path">${esc(row.relativePath)}</td>
                <td><span class="sound-pill ${statusClass(row.status)}">${esc(statusLabel(row.status))}</span></td>
                <td>${num(row.inputI, 2)}</td>
                <td>${num(row.inputTp, 2)} dBTP</td>
                <td>${num(row.recommendedGainDb, 1)} dB</td>
                <td>${pct(row.recommendedVolume)}</td>
                <td>${ms(row.durationMs)}</td>
                <td class="sound-levelscan-warnings">${(Array.isArray(row.warnings) ? row.warnings : []).map(w => `<span>${esc(warningLabel(w))}</span>`).join('') || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function render(){
    const card = document.getElementById('soundLevelScanCard');
    if (!card) return;
    card.innerHTML = `
      <div class="sound-levelscan-head">
        <div>
          <h3>Pegel-Scan</h3>
          <div class="sound-note">Read-only Analyse der Sound-Dateien. Es wird nichts normalisiert, überschrieben oder an der Sound-Queue verändert.</div>
        </div>
        <span class="sound-pill ${state.loading ? '' : 'success'}">${state.loading ? 'Lädt...' : 'Read-only'}</span>
      </div>
      ${renderSummary()}
      ${renderControls()}
      ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      ${renderRows()}
      <div class="sound-note">Hinweis: <strong>True Peak über Limit</strong> und <strong>viel zu laut</strong> sind Kandidaten für spätere Playback-Korrektur oder normalisierte Kopien. Dieser Schritt zeigt nur Daten an.</div>
    `;
  }

  function boot(){
    if (!ensureMounted()) return;
    loadAll().catch(err => {
      state.lastMessage = err.message || String(err);
      render();
    });
  }

  window.addEventListener('cgn:module-show', (event) => {
    if (event.detail?.module !== 'sound_system') return;
    setTimeout(boot, 0);
  });

  document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  if (document.readyState !== 'loading') setTimeout(boot, 0);

  return { loadAll, ensureMounted };
})();
