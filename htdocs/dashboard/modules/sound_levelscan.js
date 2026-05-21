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
    showPreview: true,
    polling: false,
    pollTimer: null,
    status: null,
    results: null,
    correctionSettings: null,
    normalizationSettings: null,
    correctionPreview: null,
    lastMessage: ''
  };

  const HELP = {
    scanLimit: 'Maximale Anzahl Dateien, die beim nächsten Scan gemessen werden. Höher = vollständiger, aber langsamer.',
    resultLimit: 'Maximale Anzahl gespeicherter Ergebnisse, die aus der Datenbank geladen und in der Tabelle angezeigt werden.',
    status: 'OK = unauffällig. Warnung = Datei sollte geprüft werden. Fehler = Messung fehlgeschlagen.',
    lufs: 'LUFS beschreibt die wahrgenommene durchschnittliche Lautstärke. Je näher an 0, desto lauter. Ziel hier: ca. -18 LUFS.',
    truePeak: 'True Peak ist die technische Spitzenlautstärke. Werte über dem Limit können clippen oder verzerren. Ziel: maximal -1.5 dBTP.',
    gain: 'Empfohlene Änderung in dB. Negativ = leiser machen. Positiv = lauter machen.',
    volume: 'Grobe empfohlene Playback-Lautstärke auf Basis des Zielpegels und Max-Volume. 100% bedeutet: Datei ist eher zu leise.',
    duration: 'Länge der Datei. Sehr kurze Sounds können trotz LUFS-Wert subjektiv anders wirken.',
    warnings: 'Automatisch erkannte Auffälligkeiten, z. B. zu laut, zu leise, True Peak über Limit oder Volume-Cap erreicht.',
    targetLufs: 'Zielwert für die spätere Angleichung. -18 LUFS ist für Stream-Sounds ein brauchbarer, nicht zu aggressiver Startwert.',
    peakLimit: 'Technisches Sicherheitslimit für Spitzenpegel. Dateien darüber sollten nicht einfach lauter gemacht werden.',
    maxVolume: 'Obergrenze, die später für automatische Playback-Korrekturen genutzt werden könnte. Der Scanner ändert aktuell nichts.',
    clipping: 'True Peak über Limit. Diese Datei ist technisch zu heiß und sollte eher leiser/normalisiert werden.',
    tooLoud: 'Große negative Gain-Empfehlung. Die Datei ist deutlich lauter als der Zielwert.',
    tooQuiet: 'Volume-Cap erreicht oder große positive Gain-Empfehlung. Die Datei ist eher zu leise.',
    readOnly: 'Nur Analyse. Es werden keine Dateien überschrieben, normalisiert oder im Sound-System verändert.',
    ttsExcluded: 'TTS-/Speech-Dateien werden standardmäßig aus dem Pegel-Scan herausgefiltert, damit temporäre Sprachdateien die Sound-Auswertung nicht verfälschen.',
    preview: 'Korrektur-Vorschau: zeigt nur, welche Playback-Lautstärke oder Gain-Änderung später empfohlen wäre. Es wird nichts angewendet.',
    previewVolume: 'Empfohlene spätere Playback-Lautstärke. Niedrig = Datei ist aktuell sehr laut. 100% = Datei ist eher zu leise oder erreicht das Ziel nicht.',
    previewGain: 'Empfohlene Gain-Änderung. Negativ senkt den Sound ab, positiv hebt ihn an. Große Werte sollten manuell geprüft werden.',
    previewRisk: 'Einschätzung für eine spätere automatische Korrektur. True-Peak-Warnungen und starke Absenkungen sind Kandidaten für manuelle Prüfung.',
    progress: 'Fortschritt des aktuell laufenden Scans. Das Dashboard fragt den Status regelmäßig vom Backend ab, während FFmpeg die Dateien misst.',
    correctionSettings: 'Vorbereitete Einstellungen für eine spätere automatische Playback-Korrektur. In diesem Schritt wird noch nichts beim Abspielen verändert.',
    maxBoost: 'Maximale Anhebung. Schützt davor, sehr leise oder verrauschte Dateien zu stark hochzuziehen.',
    maxCut: 'Maximale Absenkung. Schützt vor extremen automatischen Änderungen bei sehr lauten Dateien.',
    normalizedCopies: 'Geplante spätere Export-Option: normalisierte Kopien in einen separaten Ordner schreiben. Originale bleiben erhalten.'
  };

  function esc(value){ return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function num(value, digits = 1){ const n = Number(value); return Number.isFinite(n) ? n.toFixed(digits) : '-'; }
  function pct(value){ const n = Number(value); return Number.isFinite(n) ? `${Math.round(n)}%` : '-'; }
  function ms(value){ const n = Number(value); return Number.isFinite(n) && n > 0 ? `${(n / 1000).toFixed(1)}s` : '-'; }
  function db(value, digits = 1){ const n = Number(value); return Number.isFinite(n) ? `${n > 0 ? '+' : ''}${n.toFixed(digits)} dB` : '-'; }
  function help(text){ return `<span class="sound-help" title="${esc(text)}" aria-label="${esc(text)}">?</span>`; }
  function withHelp(label, text){ return `<span class="sound-label-help">${esc(label)} ${help(text)}</span>`; }

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

  function warningHelp(key){
    const map = {
      true_peak_above_limit: 'Die Datei überschreitet das True-Peak-Limit. Das kann zu Verzerrung/Clipping führen.',
      large_negative_gain: 'Die Datei ist deutlich lauter als der Zielwert und müsste stark abgesenkt werden.',
      large_positive_gain: 'Die Datei ist deutlich leiser als der Zielwert und müsste stark angehoben werden.',
      volume_cap_reached: 'Die Datei ist so leise, dass selbst 100% Playback-Volume rechnerisch nicht sauber bis zum Ziel reichen.',
      loudnorm_parse_failed: 'FFmpeg hat keine vollständigen loudnorm-Messwerte geliefert.',
      ffmpeg_failed: 'FFmpeg konnte die Datei nicht sauber analysieren.'
    };
    return map[key] || 'Scanner-Warnung aus dem Backend.';
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

  function gainClass(value){
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    if (n <= -10) return 'danger';
    if (n <= -6) return 'warn';
    if (n >= 6) return 'warn';
    return 'success';
  }

  function peakClass(value, limit){
    const n = Number(value);
    const l = Number(limit);
    if (!Number.isFinite(n) || !Number.isFinite(l)) return '';
    if (n > l) return 'danger';
    if (n > l - 1.5) return 'warn';
    return 'success';
  }

  function previewClass(row){
    const gain = previewGain(row);
    const warnings = Array.isArray(row?.warnings) ? row.warnings : [];
    if (row?.status === 'error') return 'danger';
    if (warnings.includes('true_peak_above_limit')) return 'danger';
    if (Number.isFinite(gain) && gain <= -10) return 'danger';
    if (Number.isFinite(gain) && (gain <= -6 || gain >= 6)) return 'warn';
    if (warnings.includes('volume_cap_reached')) return 'warn';
    return 'success';
  }

  function previewText(row){
    if (!row || row.status === 'error') return 'nicht bewertbar';
    const gain = previewGain(row);
    const volume = previewVolume(row);
    if (!Number.isFinite(gain) || !Number.isFinite(volume)) return 'keine Empfehlung';
    if (gain < -0.25) return `später auf ca. ${Math.round(volume)}% / ${db(gain, 1)}`;
    if (gain > 0.25) return `später auf ca. ${Math.round(volume)}% / ${db(gain, 1)}`;
    return `nahe Zielwert / ca. ${Math.round(volume)}%`;
  }

  function previewHint(row){
    const preview = row?.correctionPreview || findPreview(row)?.correctionPreview || null;
    const warnings = Array.isArray(row?.warnings) ? row.warnings : [];
    const gain = Number(preview?.limitedGainDb ?? row?.recommendedGainDb);
    if (preview && Array.isArray(preview.reasons) && preview.reasons.includes('true_peak_protected')) return 'True-Peak-Schutz würde die Anhebung begrenzen.';
    if (warnings.includes('true_peak_above_limit')) return 'Achtung: True Peak über Limit. Spätere Korrektur sollte diesen Sound eher absenken und nicht weiter anheben.';
    if (warnings.includes('volume_cap_reached')) return 'Zu leise: selbst 100% Playback-Volume reicht rechnerisch nicht sauber bis zum Zielwert.';
    if (Number.isFinite(gain) && gain <= -10) return 'Sehr laut: automatische Absenkung wäre stark. Vor Aktivierung einmal anhören.';
    if (Number.isFinite(gain) && gain >= 6) return 'Eher leise: deutliche Anhebung wäre nötig. Rauschen/Qualität prüfen.';
    return HELP.preview;
  }

  function findPreview(row){
    const path = String(row?.relativePath || '');
    const list = Array.isArray(state.correctionPreview?.results) ? state.correctionPreview.results : [];
    return list.find(item => String(item.relativePath || '') === path) || null;
  }

  function previewGain(row){
    const preview = row?.correctionPreview || findPreview(row)?.correctionPreview || null;
    const value = preview?.limitedGainDb ?? row?.recommendedGainDb;
    return Number(value);
  }

  function previewVolume(row){
    const preview = row?.correctionPreview || findPreview(row)?.correctionPreview || null;
    const value = preview?.recommendedVolume ?? row?.recommendedVolume;
    return Number(value);
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
        if (action === 'loudest') {
          state.order = 'input_i';
          state.dir = 'desc';
          state.statusFilter = 'all';
          await loadAll();
        }
        if (action === 'quietest') {
          state.order = 'input_i';
          state.dir = 'asc';
          state.statusFilter = 'all';
          await loadAll();
        }
        if (action === 'save-correction') await saveCorrectionSettings();
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
    const showPreviewEl = document.getElementById('soundLevelShowPreview');
    if (showPreviewEl) state.showPreview = !!showPreviewEl.checked;
  }

  function correctionFormNumber(id, fallback, min, max){
    const value = Number(document.getElementById(id)?.value);
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value));
  }

  async function saveCorrectionSettings(){
    const current = state.correctionSettings || {};
    const normalization = state.normalizationSettings || {};
    const payload = {
      correction: {
        enabled: !!document.getElementById('soundLevelCorrectionEnabled')?.checked,
        mode: document.getElementById('soundLevelCorrectionEnabled')?.checked ? 'ready' : 'preview',
        targetLufs: correctionFormNumber('soundLevelCorrectionTargetLufs', current.targetLufs ?? -18, -40, -6),
        truePeakLimitDbtp: correctionFormNumber('soundLevelCorrectionPeakLimit', current.truePeakLimitDbtp ?? -1.5, -12, 0),
        maxPlaybackVolume: Math.round(correctionFormNumber('soundLevelCorrectionMaxVolume', current.maxPlaybackVolume ?? 80, 1, 100)),
        maxBoostDb: correctionFormNumber('soundLevelCorrectionMaxBoost', current.maxBoostDb ?? 6, 0, 18),
        maxCutDb: correctionFormNumber('soundLevelCorrectionMaxCut', current.maxCutDb ?? 12, 0, 12),
        minPlaybackVolume: correctionFormNumber('soundLevelCorrectionMinVolume', current.minPlaybackVolume ?? 35, 0, 100),
        strengthPercent: correctionFormNumber('soundLevelCorrectionStrength', current.strengthPercent ?? 50, 0, 100),
        protectTruePeak: !!document.getElementById('soundLevelCorrectionProtectPeak')?.checked,
        excludeTts: !!document.getElementById('soundLevelCorrectionExcludeTts')?.checked
      },
      normalization: {
        outputDir: document.getElementById('soundLevelNormalizationOutputDir')?.value || normalization.outputDir || 'htdocs/assets/sounds_normalized',
        createMissingFolders: !!document.getElementById('soundLevelNormalizationFolders')?.checked
      },
      updatedBy: 'dashboard'
    };
    const saved = await api('/correction/settings', { method: 'POST', body: JSON.stringify(payload) });
    state.correctionSettings = saved.correction || null;
    state.normalizationSettings = saved.normalization || null;
    state.lastMessage = payload.correction.enabled ? 'Pegel-Korrektur gespeichert. Sie greift beim Abspielen zentral im Sound-System.' : 'Korrektur-Vorschau-Einstellungen gespeichert. Playback bleibt ausgeschaltet.';
    await loadResultsOnly();
  }

  async function runScan(){
    readControls();
    state.loading = true;
    state.lastMessage = 'Scan gestartet... Fortschritt wird automatisch aktualisiert.';
    render();
    await api('/scan', {
      method: 'POST',
      body: JSON.stringify({ limit: state.scanLimit, async: true })
    });
    state.status = await api('/status');
    startPolling();
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
    try { state.correctionPreview = await api(`/correction/preview?${query}`); } catch (_) { state.correctionPreview = null; }
    render();
  }

  async function loadAll(){
    state.loading = true;
    render();
    try {
      state.status = await api('/status');
      try {
        const corr = await api('/correction/settings');
        state.correctionSettings = corr.correction || null;
        state.normalizationSettings = corr.normalization || null;
      } catch (_) {
        state.correctionSettings = null;
        state.normalizationSettings = null;
      }
      await loadResultsOnly();
      if (state.status?.running) startPolling();
      if (!state.lastMessage) state.lastMessage = 'Pegel-Scan geladen.';
    } finally {
      state.loading = false;
      render();
    }
  }


  function startPolling(){
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.polling = true;
    state.pollTimer = setInterval(() => {
      pollStatus().catch(err => {
        state.lastMessage = err.message || String(err);
        stopPolling();
        render();
      });
    }, 1000);
  }

  function stopPolling(){
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = null;
    state.polling = false;
  }

  async function pollStatus(){
    state.status = await api('/status');
    const progress = state.status?.progress || {};
    if (state.status?.running) {
      const scanned = Number(progress.scannedFiles || 0);
      const total = Number(progress.discoveredFiles || 0);
      const percent = Number(progress.progressPercent || 0);
      state.lastMessage = total > 0 ? `Scan läuft: ${scanned}/${total} Dateien (${percent}%).` : 'Scan läuft: Dateien werden vorbereitet...';
      render();
      return;
    }

    stopPolling();
    await loadResultsOnly();
    const latest = state.status?.latestScan || state.status?.progress || null;
    if (latest && latest.status === 'failed') {
      state.lastMessage = `Scan fehlgeschlagen: ${latest.errorText || state.status?.lastError || 'unbekannter Fehler'}`;
    } else if (latest && (latest.scannedFiles !== undefined || state.status?.progress)) {
      const scanned = Number(latest.scannedFiles || 0);
      const warnings = Number(latest.warningFiles || 0);
      const errors = Number(latest.errorFiles || 0);
      state.lastMessage = `Scan fertig: ${scanned} Dateien, ${warnings} Warnungen, ${errors} Fehler.`;
    } else {
      state.lastMessage = 'Scan fertig.';
    }
    render();
  }

  function allRows(){
    return Array.isArray(state.results?.results) ? state.results.results : [];
  }

  function filteredResults(){
    const rows = allRows();
    const needle = String(state.search || '').trim().toLowerCase();
    return rows.filter(row => {
      if (state.statusFilter !== 'all' && row.status !== state.statusFilter) return false;
      if (needle && !String(row.relativePath || '').toLowerCase().includes(needle)) return false;
      return true;
    });
  }

  function calcStats(rows){
    const data = Array.isArray(rows) ? rows : [];
    const warnings = data.filter(row => row.status === 'warning').length;
    const errors = data.filter(row => row.status === 'error').length;
    const ok = data.filter(row => row.status === 'ok').length;
    const clipping = data.filter(row => Array.isArray(row.warnings) && row.warnings.includes('true_peak_above_limit')).length;
    const tooLoud = data.filter(row => Number(row.recommendedGainDb) <= -6).length;
    const veryLoud = data.filter(row => Number(row.recommendedGainDb) <= -10).length;
    const tooQuiet = data.filter(row => Number(row.recommendedGainDb) >= 6 || (Array.isArray(row.warnings) && row.warnings.includes('volume_cap_reached'))).length;
    const wouldReduce = data.filter(row => Number(row.recommendedGainDb) < -0.25).length;
    const wouldRaise = data.filter(row => Number(row.recommendedGainDb) > 0.25).length;
    const nearTarget = data.filter(row => { const g = Number(row.recommendedGainDb); return Number.isFinite(g) && Math.abs(g) <= 0.25; }).length;
    const capped = data.filter(row => Array.isArray(row.warnings) && row.warnings.includes('volume_cap_reached')).length;
    return { total: data.length, ok, warnings, errors, clipping, tooLoud, veryLoud, tooQuiet, wouldReduce, wouldRaise, nearTarget, capped };
  }

  function renderSummary(){
    const scan = state.status?.latestScan || state.status?.lastResult?.scan || null;
    const defaults = state.status?.defaults || {};
    const count = Number(state.status?.resultsCount || 0);
    const stats = calcStats(allRows());
    return `
      <div class="sound-levelscan-summary">
        <div class="sound-source-item" title="${esc('Gespeicherte Pegel-Ergebnisse in der Datenbank.')}"><span>Ergebnisse</span><strong class="sound-pill">${esc(count)}</strong></div>
        <div class="sound-source-item" title="${esc('Zeitpunkt des zuletzt abgeschlossenen Scans.')}"><span>Letzter Scan</span><strong class="sound-pill">${scan?.finishedAt ? esc(scan.finishedAt) : '-'}</strong></div>
        <div class="sound-source-item" title="${esc(HELP.targetLufs)}"><span>Ziel-LUFS</span><strong class="sound-pill">${esc(defaults.targetLufs ?? '-')}</strong></div>
        <div class="sound-source-item" title="${esc(HELP.peakLimit)}"><span>True Peak Limit</span><strong class="sound-pill">${esc(defaults.truePeakLimitDbtp ?? '-')} dBTP</strong></div>
        <div class="sound-source-item" title="${esc(HELP.maxVolume)}"><span>Max Volume</span><strong class="sound-pill">${esc(defaults.maxPlaybackVolume ?? '-')}%</strong></div>
      </div>
      <div class="sound-levelscan-quickstats">
        <div class="sound-levelscan-stat success" title="${esc('Dateien ohne erkannte Auffälligkeiten in der aktuell geladenen Ergebnismenge.')}"><strong>${esc(stats.ok)}</strong><span>OK</span></div>
        <div class="sound-levelscan-stat warn" title="${esc('Dateien mit Warnungen in der aktuell geladenen Ergebnismenge.')}"><strong>${esc(stats.warnings)}</strong><span>Warnungen</span></div>
        <div class="sound-levelscan-stat danger" title="${esc(HELP.clipping)}"><strong>${esc(stats.clipping)}</strong><span>Peak zu hoch</span></div>
        <div class="sound-levelscan-stat danger" title="${esc(HELP.tooLoud)}"><strong>${esc(stats.tooLoud)}</strong><span>zu laut</span></div>
        <div class="sound-levelscan-stat warn" title="${esc(HELP.tooQuiet)}"><strong>${esc(stats.tooQuiet)}</strong><span>zu leise</span></div>
      </div>
      ${scan ? `
        <div class="sound-levelscan-lastscan">
          <span title="${esc('Anzahl gefundener Dateien innerhalb des Scan-Limits.')}">Gefunden: <strong>${esc(scan.discoveredFiles ?? '-')}</strong></span>
          <span title="${esc('Anzahl tatsächlich gemessener Dateien.')}">Gescannt: <strong>${esc(scan.scannedFiles ?? '-')}</strong></span>
          <span title="${esc('Unauffällige Dateien im letzten Scan.')}">OK: <strong>${esc(scan.okFiles ?? '-')}</strong></span>
          <span title="${esc('Dateien mit Warnungen im letzten Scan.')}">Warnungen: <strong>${esc(scan.warningFiles ?? '-')}</strong></span>
          <span title="${esc('Dateien, bei denen die Messung fehlgeschlagen ist.')}">Fehler: <strong>${esc(scan.errorFiles ?? '-')}</strong></span>
        </div>
      ` : ''}
    `;
  }


  function renderProgressPanel(){
    const progress = state.status?.progress || {};
    const running = !!state.status?.running || progress.status === 'running';
    const percent = Math.max(0, Math.min(100, Number(progress.progressPercent || 0)));
    const scanned = Number(progress.scannedFiles || 0);
    const total = Number(progress.discoveredFiles || 0);
    const current = String(progress.currentFile || '').trim();
    if (!running && !state.polling && percent <= 0) return '';
    return `
      <div class="sound-levelscan-progress" title="${esc(HELP.progress)}">
        <div class="sound-levelscan-progress-head">
          <div>
            <strong>${running ? 'Scan läuft' : 'Letzter Fortschritt'}</strong>
            <span>${total > 0 ? `${scanned}/${total} Dateien gemessen` : 'Dateien werden vorbereitet...'}</span>
          </div>
          <span class="sound-pill ${running ? 'warn' : 'success'}">${esc(percent.toFixed(1))}%</span>
        </div>
        <div class="sound-levelscan-progress-bar" aria-label="Scan-Fortschritt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${esc(percent)}">
          <div style="width:${esc(percent)}%"></div>
        </div>
        ${current ? `<div class="sound-levelscan-current" title="${esc(current)}">Aktuell: <strong>${esc(current)}</strong></div>` : ''}
        <div class="sound-levelscan-lastscan">
          <span>OK: <strong>${esc(progress.okFiles || 0)}</strong></span>
          <span>Warnungen: <strong>${esc(progress.warningFiles || 0)}</strong></span>
          <span>Fehler: <strong>${esc(progress.errorFiles || 0)}</strong></span>
        </div>
      </div>
    `;
  }

  function renderCorrectionSettingsPanel(){
    const corr = state.correctionSettings || {};
    const norm = state.normalizationSettings || {};
    const previewSummary = state.correctionPreview?.summary || {};
    const correctionActive = corr.enabled === true && ['ready', 'active', 'apply'].includes(String(corr.mode || '').toLowerCase());
    return `
      <div class="sound-levelscan-correction-settings">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Pegel-Anpassung beim Abspielen</strong>
            <span>${esc(HELP.correctionSettings)}</span>
          </div>
          <span class="sound-pill ${correctionActive ? 'success' : 'danger'}" title="${correctionActive ? 'Aktiv: sound_system.js passt die Item-Lautstärke beim Abspielen anhand der letzten Pegel-Messung an.' : 'Aus: es wird nur vorgerechnet und nichts beim Abspielen verändert.'}">${correctionActive ? 'Anwendung AKTIV' : 'Anwendung AUS'}</span>
        </div>
        <div class="sound-levelscan-settings-grid">
          <label class="sound-check" title="Wenn aktiv, passt das Sound-System beim Start eines Sounds die Item-Volume anhand des letzten Pegel-Scans an. Originaldateien bleiben unverändert.">
            <input id="soundLevelCorrectionEnabled" type="checkbox" ${correctionActive ? 'checked' : ''}>
            <span>Playback-Korrektur aktivieren</span>
          </label>
          <label class="sound-field">
            ${withHelp('Ziel-LUFS', HELP.targetLufs)}
            <input id="soundLevelCorrectionTargetLufs" type="number" min="-40" max="-6" step="0.5" value="${esc(corr.targetLufs ?? -18)}">
          </label>
          <label class="sound-field">
            ${withHelp('True Peak Limit', HELP.peakLimit)}
            <input id="soundLevelCorrectionPeakLimit" type="number" min="-12" max="0" step="0.1" value="${esc(corr.truePeakLimitDbtp ?? -1.5)}">
          </label>
          <label class="sound-field">
            ${withHelp('Max Volume', HELP.maxVolume)}
            <input id="soundLevelCorrectionMaxVolume" type="number" min="1" max="100" step="1" value="${esc(corr.maxPlaybackVolume ?? 80)}">
          </label>
          <label class="sound-field">
            ${withHelp('Max Boost', HELP.maxBoost)}
            <input id="soundLevelCorrectionMaxBoost" type="number" min="0" max="18" step="0.5" value="${esc(corr.maxBoostDb ?? 6)}">
          </label>
          <label class="sound-field">
            ${withHelp('Max Cut', HELP.maxCut)}
            <input id="soundLevelCorrectionMaxCut" type="number" min="0" max="40" step="0.5" value="${esc(corr.maxCutDb ?? 24)}">
          </label>
          <label class="sound-check" title="Verhindert, dass leise Dateien über das True-Peak-Limit angehoben werden.">
            <input id="soundLevelCorrectionProtectPeak" type="checkbox" ${corr.protectTruePeak === false ? '' : 'checked'}>
            <span>True-Peak-Schutz</span>
          </label>
          <label class="sound-check" title="TTS-/Speech-Dateien bleiben von Pegel-Scan und Vorschau ausgeschlossen.">
            <input id="soundLevelCorrectionExcludeTts" type="checkbox" ${corr.excludeTts === false ? '' : 'checked'}>
            <span>TTS ausschließen</span>
          </label>
        </div>
        <div class="sound-levelscan-preview-grid compact">
          <div title="Dateien, die nach gespeicherten Vorschau-Einstellungen automatisch relativ sicher wären."><strong>${esc(previewSummary.autoSafe ?? '-')}</strong><span>auto-safe</span></div>
          <div title="Dateien, die vor Aktivierung manuell geprüft werden sollten."><strong>${esc(previewSummary.manualReview ?? '-')}</strong><span>prüfen</span></div>
          <div title="Dateien, die später leiser würden."><strong>${esc(previewSummary.reduce ?? '-')}</strong><span>leiser</span></div>
          <div title="Dateien, die später lauter würden."><strong>${esc(previewSummary.raise ?? '-')}</strong><span>lauter</span></div>
        </div>
        <div class="sound-actions">
          <button type="button" data-sound-level-action="save-correction" title="Speichert die Pegel-Einstellungen. Wenn Playback-Korrektur aktiv ist, greift sie zentral im Sound-System.">Pegel-Einstellungen speichern</button>
        </div>
        <div class="sound-note">Wenn aktiv, passt <code>sound_system.js</code> nur die Playback-Volume des Sound-Items an. Originaldateien, Queue, Discord-Routing und Alert-Bundles bleiben unverändert.</div>
      </div>

      <div class="sound-levelscan-normalization-planned">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Normalisierte Kopien</strong>
            <span>${esc(HELP.normalizedCopies)}</span>
          </div>
          <span class="sound-pill warn">geplant</span>
        </div>
        <div class="sound-levelscan-settings-grid compact">
          <label class="sound-field sound-levelscan-wide">
            <span>Zielordner für spätere Kopien</span>
            <input id="soundLevelNormalizationOutputDir" type="text" value="${esc(norm.outputDir || 'htdocs/assets/sounds_normalized')}" title="Geplanter separater Ausgabeordner. Originale bleiben erhalten.">
          </label>
          <label class="sound-check" title="Später darf das Export-Modul Unterordner wie alerts/ automatisch anlegen.">
            <input id="soundLevelNormalizationFolders" type="checkbox" ${norm.createMissingFolders === false ? '' : 'checked'}>
            <span>Unterordner anlegen</span>
          </label>
        </div>
        <div class="sound-note"><strong>Noch kein Export.</strong> Dieser Bereich bereitet nur die spätere Option vor. Es werden keine Kopien erzeugt und keine Originale überschrieben.</div>
      </div>
    `;
  }

  function renderPreviewPanel(){
    const rows = allRows();
    const stats = calcStats(rows);
    return `
      <div class="sound-levelscan-preview">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Korrektur-Vorschau</strong>
            <span>${esc(HELP.preview)}</span>
          </div>
          <span class="sound-pill" title="${esc(HELP.readOnly)}">nur Vorschau</span>
        </div>
        <div class="sound-levelscan-preview-grid">
          <div title="Sounds, die später leiser abgespielt würden."><strong>${esc(stats.wouldReduce)}</strong><span>würden leiser</span></div>
          <div title="Sounds, die später lauter abgespielt würden."><strong>${esc(stats.wouldRaise)}</strong><span>würden lauter</span></div>
          <div title="Sounds, die bereits nah am Zielwert liegen."><strong>${esc(stats.nearTarget)}</strong><span>nahe Ziel</span></div>
          <div title="Sounds, die wegen Max-Volume nicht sauber auf Ziel kommen."><strong>${esc(stats.capped)}</strong><span>Volume-Cap</span></div>
          <div title="Sounds mit True-Peak-Warnung."><strong>${esc(stats.clipping)}</strong><span>Peak prüfen</span></div>
        </div>
        <div class="sound-note">Diese Vorschau nutzt die bereits gemessenen Werte. Sie aktiviert noch keine automatische Pegel-Korrektur im Sound-System.</div>
      </div>
    `;
  }

  function renderControls(){
    return `
      <details class="sound-levelscan-guide" open>
        <summary>Werte kurz erklärt</summary>
        <div class="sound-levelscan-guide-grid">
          <div title="${esc(HELP.lufs)}"><strong>LUFS</strong><span>Wahrgenommene Lautstärke. Näher an 0 = lauter.</span></div>
          <div title="${esc(HELP.truePeak)}"><strong>True Peak</strong><span>Technische Spitze. Über Limit = Risiko für Clipping.</span></div>
          <div title="${esc(HELP.gain)}"><strong>Gain</strong><span>Empfohlene Korrektur. Minus = leiser.</span></div>
          <div title="${esc(HELP.volume)}"><strong>Volume</strong><span>Grobe spätere Playback-Empfehlung.</span></div>
          <div title="${esc(HELP.readOnly)}"><strong>Read-only</strong><span>Aktuell wird nichts verändert.</span></div>
        </div>
      </details>

      <div class="sound-levelscan-controls">
        <label class="sound-field">
          ${withHelp('Scan-Limit', HELP.scanLimit)}
          <input id="soundLevelScanLimit" data-sound-level-control="scanLimit" type="number" min="1" max="5000" value="${esc(state.scanLimit)}" title="${esc(HELP.scanLimit)}">
        </label>
        <label class="sound-field">
          ${withHelp('Ergebnis-Limit', HELP.resultLimit)}
          <input id="soundLevelResultLimit" data-sound-level-control="resultLimit" type="number" min="1" max="1000" value="${esc(state.resultLimit)}" title="${esc(HELP.resultLimit)}">
        </label>
        <label class="sound-field">
          <span>Sortieren nach</span>
          <select id="soundLevelOrder" data-sound-level-control="order" title="Sortierfeld für die Tabelle.">
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
          <select id="soundLevelDir" data-sound-level-control="dir" title="Aufsteigend oder absteigend sortieren.">
            <option value="desc" ${state.dir === 'desc' ? 'selected' : ''}>Absteigend</option>
            <option value="asc" ${state.dir === 'asc' ? 'selected' : ''}>Aufsteigend</option>
          </select>
        </label>
        <label class="sound-field">
          ${withHelp('Status', HELP.status)}
          <select id="soundLevelStatusFilter" data-sound-level-control="statusFilter" title="${esc(HELP.status)}">
            <option value="all" ${state.statusFilter === 'all' ? 'selected' : ''}>Alle</option>
            <option value="ok" ${state.statusFilter === 'ok' ? 'selected' : ''}>OK</option>
            <option value="warning" ${state.statusFilter === 'warning' ? 'selected' : ''}>Warnungen</option>
            <option value="error" ${state.statusFilter === 'error' ? 'selected' : ''}>Fehler</option>
          </select>
        </label>
        <label class="sound-field sound-levelscan-search">
          <span>Suche</span>
          <input id="soundLevelSearch" data-sound-level-control="search" type="text" value="${esc(state.search)}" placeholder="Dateiname oder Ordner..." title="Filtert lokal nach Dateiname oder Ordnerpfad.">
        </label>
        <label class="sound-check" title="${esc(HELP.preview)}">
          <input id="soundLevelShowPreview" data-sound-level-control="showPreview" type="checkbox" ${state.showPreview ? 'checked' : ''}>
          <span>Korrektur-Vorschau anzeigen</span>
        </label>
      </div>
      <div class="sound-actions">
        <button type="button" class="success" data-sound-level-action="scan" ${state.loading ? 'disabled' : ''} title="Startet einen neuen Read-only-Scan über das Backend.">Scan starten</button>
        <button type="button" data-sound-level-action="reload" ${state.loading ? 'disabled' : ''} title="Lädt Status und Ergebnisse neu.">Neu laden</button>
        <button type="button" data-sound-level-action="problematic" ${state.loading ? 'disabled' : ''} title="Zeigt Warnungen mit stärkster Absenkung zuerst.">Problematische zuerst</button>
        <button type="button" data-sound-level-action="loudest" ${state.loading ? 'disabled' : ''} title="Sortiert nach den lautesten gemessenen Dateien.">Lauteste zuerst</button>
        <button type="button" data-sound-level-action="quietest" ${state.loading ? 'disabled' : ''} title="Sortiert nach den leisesten gemessenen Dateien.">Leiseste zuerst</button>
      </div>
    `;
  }

  function renderWarnings(row){
    const warnings = Array.isArray(row.warnings) ? row.warnings : [];
    if (!warnings.length) return '<span class="sound-levelscan-muted">-</span>';
    return warnings.map(w => `<span title="${esc(warningHelp(w))}">${esc(warningLabel(w))}</span>`).join('');
  }

  function renderPreviewCell(row){
    if (!state.showPreview) return '';
    return `<td class="sound-levelscan-preview-cell" title="${esc(previewHint(row))}"><span class="sound-levelscan-preview-pill ${previewClass(row)}">${esc(previewText(row))}</span></td>`;
  }

  function renderRows(){
    const rows = filteredResults();
    if (!rows.length) return `<div class="sound-empty">Keine passenden Pegel-Ergebnisse vorhanden.</div>`;
    const defaults = state.status?.defaults || {};
    return `
      <div class="sound-levelscan-table-head">
        <strong>${esc(rows.length)} angezeigte Dateien</strong>
        <span>Mouseover auf Spalten, Werte oder Warnungen zeigt Erklärungen.</span>
      </div>
      <div class="sound-levelscan-table-wrap">
        <table class="sound-levelscan-table">
          <thead>
            <tr>
              <th title="Relativer Dateipfad unter htdocs/assets/sounds.">Datei</th>
              <th title="${esc(HELP.status)}">Status</th>
              <th title="${esc(HELP.lufs)}">LUFS</th>
              <th title="${esc(HELP.truePeak)}">True Peak</th>
              <th title="${esc(HELP.gain)}">Gain</th>
              <th title="${esc(HELP.volume)}">Volume</th>
              <th title="${esc(HELP.duration)}">Dauer</th>
              <th title="${esc(HELP.warnings)}">Warnungen</th>
              ${state.showPreview ? `<th title="${esc(HELP.preview)}">Vorschau</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td class="sound-levelscan-path" title="${esc(row.relativePath)}">${esc(row.relativePath)}</td>
                <td><span class="sound-pill ${statusClass(row.status)}" title="${esc(HELP.status)}">${esc(statusLabel(row.status))}</span></td>
                <td title="${esc(HELP.lufs)}"><span class="sound-levelscan-value">${num(row.inputI, 2)}</span></td>
                <td title="${esc(HELP.truePeak)}"><span class="sound-levelscan-value ${peakClass(row.inputTp, defaults.truePeakLimitDbtp)}">${num(row.inputTp, 2)} dBTP</span></td>
                <td title="${esc(HELP.gain)}"><span class="sound-levelscan-value ${gainClass(row.recommendedGainDb)}">${db(row.recommendedGainDb, 1)}</span></td>
                <td title="${esc(HELP.volume)}"><span class="sound-levelscan-value">${pct(row.recommendedVolume)}</span></td>
                <td title="${esc(HELP.duration)}">${ms(row.durationMs)}</td>
                <td class="sound-levelscan-warnings">${renderWarnings(row)}</td>
                ${renderPreviewCell(row)}
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
          <div class="sound-note">Read-only Analyse der Sound-Dateien. TTS-/Speech-Dateien werden standardmäßig ausgelassen. Es wird nichts normalisiert, überschrieben oder an der Sound-Queue verändert.</div>
        </div>
        <span class="sound-pill ${state.loading ? '' : 'success'}" title="${esc(HELP.readOnly)}">${state.loading ? 'Lädt...' : 'Read-only'}</span>
        <span class="sound-pill" title="${esc(HELP.ttsExcluded)}">TTS raus</span>
      </div>
      ${renderSummary()}
      ${renderControls()}
      ${renderProgressPanel()}
      ${renderCorrectionSettingsPanel()}
      ${state.showPreview ? renderPreviewPanel() : ''}
      ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      ${renderRows()}
      <div class="sound-note">Hinweis: <strong>True Peak über Limit</strong>, <strong>viel zu laut</strong> und <strong>Volume-Cap erreicht</strong> sind Kandidaten für spätere Playback-Korrektur oder normalisierte Kopien. TTS-/Speech-Dateien sind standardmäßig ausgeschlossen. Dieser Schritt zeigt nur Daten an.</div>
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
