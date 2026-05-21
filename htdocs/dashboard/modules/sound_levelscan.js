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
    levelConfig: null,
    levelConfigApplyPreview: null,
    massVolumePreview: null,
    boostPreview: null,
    boostApplyResult: null,
    promoteHistory: null,
    promoteResult: null,
    correctionPreview: null,
    reference: null,
    referenceAudio: null,
    referenceOutputTarget: localStorage.getItem('sound-level-reference-output-target') || 'overlay',
    lastMessage: '',
    activeTab: 'overview'
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
    normalizedCopies: 'Geplante spätere Export-Option: normalisierte Kopien in einen separaten Ordner schreiben. Originale bleiben erhalten.',
    moduleTabs: 'Unterbereiche des Sound-Pegel-Systems. Trennt Scan, Ergebnisse, Korrektur und spätere Export-Funktionen.',
    reference: 'Automatische Referenz aus allen gültigen Nicht-TTS-Sounds. Nutzt Median-LUFS, damit einzelne Ausreißer den Zielwert nicht kaputtziehen.',
    referenceSound: 'Empfohlener echter Sound nahe am typischen Pegel. Diesen Sound kannst du zum Einpegeln von OBS/Voicemeeter nutzen.',
    referenceTest: 'Technischer Test-Sound wird zuerst als echte Datei im Sound-Ordner erzeugt und dann über das Sound-System abgespielt. Ausgabeweg ist wählbar: OBS/Overlay, Audiogerät oder beides.',
    referenceOutput: 'Ausgabeweg für Referenzsound und Test-Ton. Overlay geht an OBS, Device an das konfigurierte Audiogerät, Beides nutzt beide Ausgaben.',
    config: 'Zentrale Sound-Pegel-Konfiguration. Diese Werte werden in SQLite gespeichert und dienen als Grundlage fuer Upload-Defaults, Standardlautstaerke und spaetere Massenaktionen.',
    defaultPlaybackVolume: 'Basislautstaerke fuer normale Wiedergabe. Neue oder ungesetzte Sounds sollen langfristig mit diesem Wert starten.',
    uploadDefaultVolume: 'Standardlautstaerke fuer neu hochgeladene Alert-/SoundAlert-/VIP-Sounds. Wird in spaeteren Steps von den Upload-Modulen genutzt.',
    massApply: 'Vorbereitete Massenaktion fuer vorhandene Sounds. In diesem Step nur Konfiguration/Preview, keine bestehenden Daten werden umgeschrieben.',
    applyDefaults: 'Übernimmt die gespeicherten Sound-Pegel-Defaults in die relevanten DB-Settings der Module. Bestehende Sounds und Dateien werden nicht überschrieben.',
    boostCopies: 'Boost-Kopien sind verstärkte Kopien für zu leise Dateien. Originale bleiben unverändert. Erst einzelne Datei erzeugen und testen, dann später automatisieren.',
    boostCreateOne: 'Erzeugt nur für diese eine Datei eine verstärkte Kopie unter assets/sounds/normalized. Keine automatische Umleitung.',
    boostTargetLufs: 'Zielwert für neu erzeugte Boost-Kopien. Nicht mehr fest -18 LUFS, sondern passend zu deiner Referenz einstellbar.',
    boostSafetyDb: 'Sicherheitsabstand zur Auto-Referenz. Beispiel: Referenz -11.3 LUFS minus 2 dB ergibt Ziel ca. -13.3 LUFS.',
    adoptReferenceTarget: 'Berechnet den Boost-Zielwert aus der aktuellen Auto-Referenz minus Sicherheitsabstand und speichert ihn in SQLite.',
    boostOverwrite: 'Erzeugt die Boost-Kopie neu und überschreibt nur die Datei unter normalized/. Das Original bleibt unverändert.',
    boostPromote: 'Übernimmt die Boost-Kopie an die Originalstelle. Vorher wird automatisch ein Backup unter _backup_loudness angelegt.',
    boostRollback: 'Stellt die Originaldatei aus dem letzten Backup wieder her.'
  };

  function registerDashboardModule(){
    if (!window.CGN) return false;

    window.CGN.modules = window.CGN.modules || {};
    window.CGN.moduleCatalog = window.CGN.moduleCatalog || {};
    window.CGN.sections = window.CGN.sections || {};

    if (!window.CGN.modules.sound_level) {
      window.CGN.modules.sound_level = {
        title: 'Sound-Pegel',
        panelId: 'soundLevelModule',
        group: 'system',
        overlayLink: '',
        overlayLabel: '',
        reload() { return window.SoundLevelScanModule?.loadAll?.(true); }
      };
    }

    window.CGN.moduleCatalog.sound_level = {
      label: 'Sound-Pegel',
      icon: '📊',
      enabled: true,
      description: 'Pegel-Scan, Referenz, Korrektur-Vorschau und spätere Normalisierung.'
    };

    const system = window.CGN.sections.system;
    if (system && Array.isArray(system.items) && !system.items.includes('sound_level')) {
      const soundIndex = system.items.indexOf('sound_system');
      if (soundIndex >= 0) system.items.splice(soundIndex + 1, 0, 'sound_level');
      else system.items.unshift('sound_level');
    }

    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('sound_level')) {
      const soundIndex = window.CGN.favorites.indexOf('sound_system');
      if (soundIndex >= 0) window.CGN.favorites.splice(soundIndex + 1, 0, 'sound_level');
      else window.CGN.favorites.push('sound_level');
    }

    try { window.SectionHomeModule?.render?.(); } catch (_) {}

    const wantedModule = localStorage.getItem('cgn-dashboard-active-module') || '';
    if (wantedModule === 'sound_level' && window.CGN.activeModule !== 'sound_level') {
      setTimeout(() => window.CGN.setActiveModule('sound_level', { initial: true }), 0);
    }

    return true;
  }

  function esc(value){ return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function num(value, digits = 1){ const n = Number(value); return Number.isFinite(n) ? n.toFixed(digits) : '-'; }
  function pct(value){ const n = Number(value); return Number.isFinite(n) ? `${Math.round(n)}%` : '-'; }
  function ms(value){ const n = Number(value); return Number.isFinite(n) && n > 0 ? `${(n / 1000).toFixed(1)}s` : '-'; }
  function db(value, digits = 1){ const n = Number(value); return Number.isFinite(n) ? `${n > 0 ? '+' : ''}${n.toFixed(digits)} dB` : '-'; }
  function help(text){ return `<span class="sound-help" title="${esc(text)}" aria-label="${esc(text)}">?</span>`; }
  function withHelp(label, text){ return `<span class="sound-label-help">${esc(label)} ${help(text)}</span>`; }

  function normalizeReferenceOutputTarget(value){
    const clean = String(value || 'overlay').trim().toLowerCase();
    return ['overlay', 'device', 'both'].includes(clean) ? clean : 'overlay';
  }

  function getReferenceOutputTarget(){
    const selectValue = document.getElementById('soundLevelReferenceOutputTarget')?.value;
    state.referenceOutputTarget = normalizeReferenceOutputTarget(selectValue || state.referenceOutputTarget);
    try { localStorage.setItem('sound-level-reference-output-target', state.referenceOutputTarget); } catch (_) {}
    return state.referenceOutputTarget;
  }

  function referenceOutputLabel(value){
    const clean = normalizeReferenceOutputTarget(value);
    if (clean === 'device') return 'Audiogerät';
    if (clean === 'both') return 'OBS + Audiogerät';
    return 'OBS/Overlay';
  }

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

  function findRoot(){ return document.getElementById('soundLevelModule'); }

  function ensureMounted(){
    registerDashboardModule();
    const root = findRoot();
    if (!root) return false;

    if (!document.getElementById('soundLevelScanCard')) {
      root.innerHTML = '<div class="sound-card sound-levelscan-card" id="soundLevelScanCard"></div>';
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
      const tabButton = event.target.closest('[data-sound-level-tab]');
      if (tabButton) {
        state.activeTab = tabButton.dataset.soundLevelTab || 'overview';
        render();
        return;
      }

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
        if (action === 'save-level-config') await saveLevelConfig();
        if (action === 'preview-apply-defaults') await previewApplyDefaults();
        if (action === 'apply-defaults') await applyDefaultsToModules();
        if (action === 'preview-mass-volume') await previewMassVolume();
        if (action === 'apply-alert-missing-volumes') await applyAlertMissingVolumes();
        if (action === 'preview-boost-copies') await previewBoostCopies();
        if (action === 'create-boost-copy-one') await createBoostCopyOne(button.dataset.soundLevelFile || '');
        if (action === 'promote-boost-copy-one') await promoteBoostCopyOne(button.dataset.soundLevelFile || '');
        if (action === 'rollback-boost-copy-one') await rollbackBoostCopyOne(button.dataset.soundLevelFile || '', button.dataset.soundLevelPromotionId || '');
        if (action === 'adopt-reference-boost-target') await adoptReferenceBoostTarget();
        if (action === 'reload-reference') await loadReferenceOnly(true);
        if (action === 'play-reference') await playReferenceSound();
        if (action === 'play-reference-test') await playReferenceTestSound();
      } catch (err) {
        state.lastMessage = err.message || String(err);
        render();
      }
    });

    root.addEventListener('change', async (event) => {
      const target = event.target;
      if (!target) return;
      if (target.id === 'soundLevelReferenceOutputTarget') {
        getReferenceOutputTarget();
        state.lastMessage = `Referenz-Ausgabeweg: ${referenceOutputLabel(state.referenceOutputTarget)}.`;
        render();
        return;
      }
      if (!target.dataset.soundLevelControl) return;
      readControls();
      await loadReferenceOnly(false);
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

  function formNumber(id, fallback, min, max){
    const value = Number(document.getElementById(id)?.value);
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value));
  }

  function formBool(id, fallback){
    const el = document.getElementById(id);
    if (!el) return !!fallback;
    return !!el.checked;
  }

  async function previewApplyDefaults(){
    const preview = await api('/config/apply-defaults/preview');
    state.levelConfigApplyPreview = preview;
    state.lastMessage = 'Upload-/Playback-Defaults Vorschau geladen. Es wurde noch nichts geändert.';
    render();
  }

  async function applyDefaultsToModules(){
    const applied = await api('/config/apply-defaults', { method: 'POST', body: JSON.stringify({ updatedBy: 'dashboard' }) });
    state.levelConfigApplyPreview = applied;
    state.lastMessage = 'Sound-Pegel Defaults wurden in SQLite-Modul-Settings übernommen. Backend/Sound-System danach neu laden.';
    await loadAll();
  }

  async function previewMassVolume(){
    const preview = await api('/config/mass-volume-preview');
    state.massVolumePreview = preview;
    state.lastMessage = 'Bestehende Sound-Volumes Preview geladen. Es wurde nichts geändert.';
    render();
  }

  async function applyAlertMissingVolumes(){
    const result = await api('/config/mass-volume-apply/alerts-missing', { method: 'POST', body: JSON.stringify({ updatedBy: 'dashboard' }) });
    state.massVolumeApplyResult = result;
    state.massVolumePreview = await api('/config/mass-volume-preview');
    state.lastMessage = `Alert-Regeln aktualisiert: ${result.changed || 0} fehlende/ungültige Volume-Werte auf ${result.targetVolume || 80}% gesetzt.`;
    render();
  }

  async function previewBoostCopies(){
    const preview = await api('/boost/preview?limit=100&includeExisting=true');
    state.boostPreview = preview;
    state.lastMessage = 'Boost-Kopien Preview geladen. Es wurde noch nichts erzeugt.';
    render();
  }

  async function createBoostCopyOne(file){
    const clean = String(file || '').trim();
    if (!clean) throw new Error('Keine Datei für Boost-Kopie ausgewählt.');
    const overwrite = Boolean(document.getElementById('soundLevelBoostOverwrite')?.checked ?? true);
    const result = await api('/boost/create-one', { method: 'POST', body: JSON.stringify({ file: clean, overwrite, updatedBy: 'dashboard' }) });
    state.boostApplyResult = result;
    state.boostPreview = await api('/boost/preview?limit=100&includeExisting=true');
    state.lastMessage = `Boost-Kopie erzeugt: ${result.outputFile || clean} mit ${db(result.gainDb, 1)}.`;
    render();
  }

  async function promoteBoostCopyOne(file){
    const clean = String(file || '').trim();
    if (!clean) throw new Error('Keine Datei zum Übernehmen ausgewählt.');
    const result = await api('/promote/one', { method: 'POST', body: JSON.stringify({ file: clean, updatedBy: 'dashboard' }) });
    state.promoteResult = result;
    state.promoteHistory = await api('/promote/history?limit=50');
    state.boostPreview = await api('/boost/preview?limit=100&includeExisting=true');
    state.lastMessage = `Boost-Kopie übernommen: ${result.sourceFile || clean}. Backup: ${result.backupFile || ''}`;
    render();
  }

  async function rollbackBoostCopyOne(file, promotionId){
    const body = { updatedBy: 'dashboard' };
    if (promotionId) body.promotionId = promotionId;
    else body.file = String(file || '').trim();
    const result = await api('/promote/rollback-one', { method: 'POST', body: JSON.stringify(body) });
    state.promoteResult = result;
    state.promoteHistory = await api('/promote/history?limit=50');
    state.lastMessage = `Original wiederhergestellt: ${result.restoredFile || file}.`;
    render();
  }

  async function adoptReferenceBoostTarget(){
    setLoading(true);
    const current = state.levelConfig || {};
    const safetyDb = formNumber('soundLevelConfigBoostSafetyDb', current.boostReferenceSafetyDb ?? 2, 0, 8);
    const result = await api('/config/adopt-reference-target', {
      method: 'POST',
      body: JSON.stringify({ safetyDb, updatedBy: 'dashboard' })
    });
    state.levelConfig = result.config || state.levelConfig;
    state.reference = result.reference || state.reference;
    state.boostPreview = await api('/boost/preview?limit=100&includeExisting=true');
    state.lastMessage = `Boost-Ziel aus Referenz übernommen: ${num(result.targetLufs, 2)} LUFS.`;
    setLoading(false);
    render();
  }


  async function saveLevelConfig(){
    const current = state.levelConfig || {};
    const uploadDefaults = current.uploadDefaults || {};
    const massApply = current.massApply || {};
    const payload = {
      config: {
        defaultPlaybackVolume: Math.round(formNumber('soundLevelConfigDefaultPlaybackVolume', current.defaultPlaybackVolume ?? 80, 1, 100)),
        maxPlaybackVolume: Math.round(formNumber('soundLevelConfigMaxPlaybackVolume', current.maxPlaybackVolume ?? 100, 1, 100)),
        uploadDefaultVolume: Math.round(formNumber('soundLevelConfigUploadDefaultVolume', current.uploadDefaultVolume ?? 80, 1, 100)),
        referenceToleranceDb: formNumber('soundLevelConfigReferenceToleranceDb', current.referenceToleranceDb ?? 3, 0.5, 12),
        boostTargetLufs: formNumber('soundLevelConfigBoostTargetLufs', current.boostTargetLufs ?? -14, -40, -6),
        boostReferenceSafetyDb: formNumber('soundLevelConfigBoostSafetyDb', current.boostReferenceSafetyDb ?? 2, 0, 8),
        boostMaxGainDb: formNumber('soundLevelConfigBoostMaxGainDb', current.boostMaxGainDb ?? 12, 0.5, 18),
        defaultScanLimit: Math.round(formNumber('soundLevelConfigDefaultScanLimit', current.defaultScanLimit ?? 500, 1, 5000)),
        defaultResultLimit: Math.round(formNumber('soundLevelConfigDefaultResultLimit', current.defaultResultLimit ?? 250, 1, 1000)),
        defaultReferenceOutputTarget: document.getElementById('soundLevelConfigReferenceOutputTarget')?.value || current.defaultReferenceOutputTarget || state.referenceOutputTarget || 'overlay',
        uploadDefaults: {
          alerts: formBool('soundLevelConfigUploadAlerts', uploadDefaults.alerts !== false),
          soundalerts: formBool('soundLevelConfigUploadSoundAlerts', uploadDefaults.soundalerts !== false),
          vipMod: formBool('soundLevelConfigUploadVipMod', uploadDefaults.vipMod !== false),
          soundPresets: formBool('soundLevelConfigUploadPresets', uploadDefaults.soundPresets !== false)
        },
        massApply: {
          includeAlerts: formBool('soundLevelConfigMassAlerts', massApply.includeAlerts !== false),
          includeSoundAlerts: formBool('soundLevelConfigMassSoundAlerts', massApply.includeSoundAlerts !== false),
          includeVipMod: formBool('soundLevelConfigMassVipMod', massApply.includeVipMod !== false),
          includeSoundPresets: formBool('soundLevelConfigMassPresets', massApply.includeSoundPresets === true),
          overwriteExistingVolumes: formBool('soundLevelConfigMassOverwrite', massApply.overwriteExistingVolumes === true)
        }
      },
      updatedBy: 'dashboard'
    };
    const saved = await api('/config', { method: 'POST', body: JSON.stringify(payload) });
    state.levelConfig = saved.config || null;
    if (state.levelConfig?.defaultScanLimit) state.scanLimit = Number(state.levelConfig.defaultScanLimit) || state.scanLimit;
    if (state.levelConfig?.defaultResultLimit) state.resultLimit = Number(state.levelConfig.defaultResultLimit) || state.resultLimit;
    if (state.levelConfig?.defaultReferenceOutputTarget) {
      state.referenceOutputTarget = normalizeReferenceOutputTarget(state.levelConfig.defaultReferenceOutputTarget);
      try { localStorage.setItem('sound-level-reference-output-target', state.referenceOutputTarget); } catch (_) {}
    }
    state.lastMessage = 'Sound-Pegel Config wurde in SQLite gespeichert. Bestehende Sounds wurden nicht geändert.';
    render();
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


  async function loadReferenceOnly(showMessage){
    try {
      const response = await api('/reference?toleranceDb=3');
      state.reference = response.reference || null;
      if (showMessage) state.lastMessage = state.reference?.referenceLufs !== null && state.reference?.referenceLufs !== undefined
        ? `Auto-Referenz berechnet: ${num(state.reference.referenceLufs, 2)} LUFS.`
        : 'Auto-Referenz konnte noch nicht berechnet werden. Erst einen Scan durchführen.';
    } catch (err) {
      state.reference = null;
      if (showMessage) state.lastMessage = err.message || String(err);
    }
    render();
  }

  async function playReferenceSound(){
    const file = state.reference?.recommendedSound?.relativePath || '';
    if (!file) {
      state.lastMessage = 'Kein Referenzsound verfügbar. Erst einen Pegel-Scan durchführen.';
      render();
      return;
    }
    const outputTarget = getReferenceOutputTarget();
    const playQuery = qs({
      file,
      outputTarget,
      target: 'stream',
      source: 'sound_level_reference',
      category: 'system',
      override: true
    });
    await window.CGN.api(`/api/sound/play?${playQuery}`, { method: 'GET' });
    state.lastMessage = `Referenzsound über ${referenceOutputLabel(outputTarget)} abgespielt: ${file}`;
    render();
  }

  async function playReferenceTestSound(){
    const ref = state.reference || {};
    const durationMs = Number(ref.testSound?.durationMs || 10000);
    const referenceLufs = Number(ref.referenceLufs);
    const label = Number.isFinite(referenceLufs) ? `Referenz-Testton ${num(referenceLufs, 2)} LUFS` : 'Referenz-Testton';
    const createQuery = qs({
      targetLufs: Number.isFinite(referenceLufs) ? referenceLufs : -18,
      durationMs: Math.max(1000, Math.min(30000, Math.round(durationMs)))
    });
    const generated = await api(`/reference/test-file?${createQuery}`);
    const file = generated?.testSound?.relativePath || ref.testSound?.relativePath || 'generated/reference_test.wav';
    const outputTarget = getReferenceOutputTarget();
    const playQuery = qs({
      file,
      outputTarget,
      target: 'stream',
      category: 'system',
      source: 'sound_level_reference_test',
      label,
      volume: 80,
      override: true
    });
    await window.CGN.api(`/api/sound/play?${playQuery}`, { method: 'GET' });
    state.lastMessage = `Technischer Test-Ton wurde als ${file} erzeugt und über ${referenceOutputLabel(outputTarget)} gestartet.`;
    render();
  }

  async function loadAll(){
    state.loading = true;
    render();
    try {
      state.status = await api('/status');
      try {
        const cfg = await api('/config');
        state.levelConfig = cfg.config || null;
        try { state.levelConfigApplyPreview = await api('/config/apply-defaults/preview'); } catch (_) { state.levelConfigApplyPreview = null; }
        try { state.massVolumePreview = await api('/config/mass-volume-preview'); } catch (_) { state.massVolumePreview = null; }
        try { state.boostPreview = await api('/boost/preview?limit=100&includeExisting=true'); } catch (_) { state.boostPreview = null; }
        try { state.promoteHistory = await api('/promote/history?limit=50'); } catch (_) { state.promoteHistory = null; }
        if (state.levelConfig?.defaultScanLimit) state.scanLimit = Number(state.levelConfig.defaultScanLimit) || state.scanLimit;
        if (state.levelConfig?.defaultResultLimit) state.resultLimit = Number(state.levelConfig.defaultResultLimit) || state.resultLimit;
        if (state.levelConfig?.defaultReferenceOutputTarget) state.referenceOutputTarget = normalizeReferenceOutputTarget(state.levelConfig.defaultReferenceOutputTarget);
      } catch (_) {
        state.levelConfig = null;
      }
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
            ${withHelp('Korrektur-Stärke %', 'Wie stark die berechnete Korrektur tatsächlich angewendet wird. 50% = sanfter Safe-Modus.')}
            <input id="soundLevelCorrectionStrength" type="number" min="0" max="100" step="5" value="${esc(corr.strengthPercent ?? 50)}">
          </label>
          <label class="sound-field">
            ${withHelp('Mindest-Volume %', 'Sicherheitsgrenze, damit kurze SFX nicht komplett weggedrückt werden. Für echte Referenz-Arbeit später vorsichtig nutzen.')}
            <input id="soundLevelCorrectionMinVolume" type="number" min="0" max="100" step="1" value="${esc(corr.minPlaybackVolume ?? 35)}">
          </label>
          <label class="sound-field">
            ${withHelp('Max Boost', HELP.maxBoost)}
            <input id="soundLevelCorrectionMaxBoost" type="number" min="0" max="18" step="0.5" value="${esc(corr.maxBoostDb ?? 3)}">
          </label>
          <label class="sound-field">
            ${withHelp('Max Cut', HELP.maxCut)}
            <input id="soundLevelCorrectionMaxCut" type="number" min="0" max="12" step="0.5" value="${esc(corr.maxCutDb ?? 12)}">
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
    `;
  }

  function renderNormalizationPanel(){
    const norm = state.normalizationSettings || {};
    return `
      <div class="sound-levelscan-normalization-planned">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Normalisierte Kopien</strong>
            <span>${esc(HELP.normalizedCopies)}</span>
          </div>
          <span class="sound-pill warn">Einzeltest</span>
        </div>
        <div class="sound-levelscan-settings-grid compact">
          <label class="sound-field sound-levelscan-wide">
            <span>Zielordner für Kopien</span>
            <input id="soundLevelNormalizationOutputDir" type="text" value="${esc(norm.outputDir || 'htdocs/assets/sounds/normalized')}" title="Boost-Kopien werden im normalen Sound-Ordner unter normalized/ abgelegt, damit /api/sound/play sie direkt testen kann.">
          </label>
          <label class="sound-check" title="Das Export-Modul legt Unterordner wie alerts/ automatisch an.">
            <input id="soundLevelNormalizationFolders" type="checkbox" ${norm.createMissingFolders === false ? '' : 'checked'}>
            <span>Unterordner anlegen</span>
          </label>
        </div>
        <div class="sound-actions">
          <button type="button" data-sound-level-action="save-correction" title="Speichert nur die vorbereiteten Export-Einstellungen. Es werden keine Dateien erzeugt.">Export-Einstellungen speichern</button>
          <button type="button" data-sound-level-action="preview-boost-copies" title="Lädt Dateien, die laut Scan eine Boost-Kopie brauchen. Keine Änderung.">Boost-Preview laden</button>
        </div>
        <div class="sound-note"><strong>STEP272H:</strong> Boost-Kopien können neu erzeugt und anschließend mit automatischem Backup an die Originalstelle übernommen werden. Bestehende Regeln müssen dadurch nicht umgestellt werden.</div>
        ${renderBoostCopyPanel()}
      </div>
    `;
  }

  function renderBoostCopyPanel(){
    const preview = state.boostPreview || null;
    const result = state.boostApplyResult || null;
    if (!preview) {
      return `
        <div class="sound-levelscan-subcard">
          <div class="sound-card-head small">
            <strong>Boost-Kopien Preview</strong>
            <span>${esc(HELP.boostCopies)}</span>
          </div>
          <button type="button" data-sound-level-action="preview-boost-copies">Boost-Preview laden</button>
        </div>`;
    }
    const summary = preview.summary || {};
    const rows = Array.isArray(preview.rows) ? preview.rows : [];
    return `
      <div class="sound-levelscan-subcard sound-levelscan-boost-preview">
        <div class="sound-card-head small">
          <strong>Boost-Kopien Preview</strong>
          <span>${esc((preview.notes || []).join(' '))}</span>
        </div>
        <div class="sound-levelscan-summary-grid mini">
          <div><strong>${esc(summary.totalShown ?? 0)}</strong><span>angezeigt</span></div>
          <div><strong>${esc(summary.missingCopies ?? 0)}</strong><span>fehlen</span></div>
          <div><strong>${esc(summary.existingCopies ?? 0)}</strong><span>vorhanden</span></div>
          <div><strong>${esc(summary.unsupported ?? 0)}</strong><span>nicht direkt</span></div>
          <div><strong>${num(preview.boostTarget?.targetLufs ?? (state.levelConfig?.boostTargetLufs ?? -14), 2)}</strong><span>Boost-Ziel LUFS</span></div>
        </div>
        ${result ? `<div class="sound-note success">Boost-Kopie erzeugt: <strong>${esc(result.outputFile || '')}</strong>. Teste Original und Kopie bewusst über das Sound-System.</div>` : ''}
        <div class="sound-actions">
          <label class="sound-inline-check"><input id="soundLevelBoostOverwrite" type="checkbox" checked> vorhandene Boost-Kopie überschreiben</label>
          <button type="button" data-sound-level-action="preview-boost-copies">Boost-Preview neu laden</button>
        </div>
        ${rows.length ? `
          <div class="sound-table-wrap compact">
            <table class="sound-levelscan-table compact">
              <thead><tr><th>Datei</th><th>LUFS</th><th>Ziel-Gain</th><th>Kopie</th><th>Aktion</th></tr></thead>
              <tbody>
                ${rows.slice(0, 40).map(row => `
                  <tr class="${row.exists ? 'is-success' : 'is-danger'}">
                    <td>${esc(row.file || '-')}<br><small>${row.outputFile ? `Kopie: ${esc(row.outputFile)}` : ''}</small></td>
                    <td>${num(row.inputI, 2)}</td>
                    <td>${db(row.targetGainDb ?? row.recommendedGainDb, 1)}</td>
                    <td><span class="sound-pill ${row.exists ? 'success' : row.canCreate ? 'warn' : 'danger'}">${row.exists ? 'vorhanden' : row.canCreate ? 'fehlt' : 'nicht direkt'}</span></td>
                    <td>
                      ${row.canCreate ? `<button type="button" data-sound-level-action="create-boost-copy-one" data-sound-level-file="${esc(row.file || '')}" title="${esc(HELP.boostCreateOne)}">Boost-Kopie erzeugen</button>${row.exists ? ` <button type="button" data-sound-level-action="promote-boost-copy-one" data-sound-level-file="${esc(row.file || '')}" title="${esc(HELP.boostPromote)}">Kopie übernehmen</button>` : ''}` : `<span class="sound-muted small">${esc(row.unsupportedReason || 'nicht unterstützt')}</span>`}
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<p class="sound-muted small">Keine Boost-Kandidaten gefunden.</p>`}
        ${renderPromotionHistory()}
      </div>`;
  }

  function renderPromotionHistory(){
    const hist = state.promoteHistory;
    const rows = Array.isArray(hist?.rows) ? hist.rows : [];
    const result = state.promoteResult;
    return `
      <div class="sound-levelscan-subcard sound-levelscan-promote-history">
        <div class="sound-card-head small">
          <strong>Übernommene Kopien / Backups</strong>
          <span>Originale werden vor dem Ersetzen unter _backup_loudness gesichert.</span>
        </div>
        ${result ? `<div class="sound-note success">Letzte Aktion: <strong>${esc(result.action || '')}</strong> ${esc(result.sourceFile || result.restoredFile || '')}</div>` : ''}
        ${rows.length ? `
          <div class="sound-table-wrap compact">
            <table class="sound-levelscan-table compact">
              <thead><tr><th>Datei</th><th>Backup</th><th>Übernommen</th><th>Status</th><th>Aktion</th></tr></thead>
              <tbody>
                ${rows.slice(0, 20).map(row => `
                  <tr class="${row.rolledBackAt ? 'is-warning' : 'is-success'}">
                    <td>${esc(row.file || '-')}</td>
                    <td><small>${esc(row.backupFile || '')}</small></td>
                    <td>${esc(row.promotedAt || '')}</td>
                    <td>${row.rolledBackAt ? `Rollback ${esc(row.rolledBackAt)}` : 'aktiv'}</td>
                    <td>${row.canRollback ? `<button type="button" data-sound-level-action="rollback-boost-copy-one" data-sound-level-promotion-id="${esc(row.promotionId || '')}" data-sound-level-file="${esc(row.file || '')}" title="${esc(HELP.boostRollback)}">Rollback</button>` : '<span class="sound-muted small">-</span>'}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<p class="sound-muted small">Noch keine Boost-Kopie übernommen.</p>`}
      </div>`;
  }


  function referenceDeviationClass(value, tolerance){
    const n = Number(value);
    const t = Number(tolerance || 3);
    if (!Number.isFinite(n)) return '';
    if (Math.abs(n) <= t) return 'success';
    if (Math.abs(n) <= t * 2) return 'warn';
    return 'danger';
  }

  function renderReferencePanel(){
    const ref = state.reference || {};
    const recommended = ref.recommendedSound || null;
    const summary = ref.summary || {};
    const distribution = ref.distribution || {};
    const referenceLufs = Number(ref.referenceLufs);
    const toleranceDb = Number(ref.toleranceDb || 3);
    const deviation = recommended ? Number(recommended.deviationDb) : null;
    return `
      <div class="sound-levelscan-reference">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Auto-Referenz</strong>
            <span>${esc(HELP.reference)}</span>
          </div>
          <span class="sound-pill ${Number.isFinite(referenceLufs) ? 'success' : 'warn'}" title="${esc(HELP.reference)}">${Number.isFinite(referenceLufs) ? `${num(referenceLufs, 2)} LUFS` : 'kein Scan'}</span>
        </div>
        <div class="sound-levelscan-reference-grid">
          <div title="Median-LUFS der brauchbaren Nicht-TTS-Sounds."><strong>${Number.isFinite(referenceLufs) ? num(referenceLufs, 2) : '-'}</strong><span>Referenz LUFS</span></div>
          <div title="Toleranzbereich für OK-Bewertung."><strong>±${num(toleranceDb, 1)} dB</strong><span>Toleranz</span></div>
          <div title="Anzahl auswertbarer Dateien für die Referenz."><strong>${esc(ref.sourceCount ?? 0)}</strong><span>Quellen</span></div>
          <div title="Innerhalb der Toleranz zur Referenz."><strong>${esc(summary.ok ?? 0)}</strong><span>OK</span></div>
          <div title="Deutlich außerhalb der Toleranz."><strong>${esc((summary.tooLoud || 0) + (summary.tooQuiet || 0) + (summary.farTooLoud || 0) + (summary.farTooQuiet || 0))}</strong><span>daneben</span></div>
        </div>
        <div class="sound-levelscan-reference-box">
          <div>
            <strong>Empfohlener Referenzsound</strong>
            <span>${recommended ? esc(recommended.relativePath) : 'Noch nicht verfügbar. Erst einen Pegel-Scan ausführen.'}</span>
            ${recommended ? `<small title="Abweichung zur Auto-Referenz"><span class="sound-levelscan-preview-pill ${referenceDeviationClass(deviation, toleranceDb)}">${db(deviation, 1)} zur Referenz</span> <span class="sound-levelscan-muted">${ms(recommended.durationMs)} · ${num(recommended.inputI, 2)} LUFS · ${num(recommended.inputTp, 2)} dBTP</span></small>` : ''}
          </div>
          <div class="sound-levelscan-reference-actions">
            <label class="sound-field sound-levelscan-output-field" title="${esc(HELP.referenceOutput)}">
              <span>${withHelp('Ausgabeweg', HELP.referenceOutput)}</span>
              <select id="soundLevelReferenceOutputTarget">
                <option value="overlay" ${state.referenceOutputTarget === 'overlay' ? 'selected' : ''}>OBS/Overlay</option>
                <option value="device" ${state.referenceOutputTarget === 'device' ? 'selected' : ''}>Audiogerät</option>
                <option value="both" ${state.referenceOutputTarget === 'both' ? 'selected' : ''}>OBS + Audiogerät</option>
              </select>
            </label>
            <div class="sound-actions">
              <button type="button" class="success" data-sound-level-action="play-reference" ${recommended ? '' : 'disabled'} title="${esc(HELP.referenceSound)}">Referenzsound abspielen</button>
              <button type="button" data-sound-level-action="play-reference-test" ${Number.isFinite(referenceLufs) ? '' : 'disabled'} title="${esc(HELP.referenceTest)}">Test-Ton abspielen</button>
              <a class="ghost-link" href="${esc(ref.testSound?.url || '/api/sound/loudness/reference/test.wav')}" target="_blank" title="Test-Sound als WAV direkt im Browser öffnen, nur zum Gegenhören.">Test-WAV öffnen</a>
              <button type="button" data-sound-level-action="reload-reference" title="Referenz aus aktuellen Scan-Ergebnissen neu berechnen.">Referenz neu berechnen</button>
            </div>
          </div>
        </div>
        <details class="sound-levelscan-guide" open>
          <summary>Verteilung & Bewertung</summary>
          <div class="sound-levelscan-guide-grid">
            <div title="Leisester auswertbarer Sound."><strong>Min</strong><span>${num(distribution.min, 2)} LUFS</span></div>
            <div title="Unteres Quartil."><strong>Q1</strong><span>${num(distribution.q1, 2)} LUFS</span></div>
            <div title="Median / automatische Referenz."><strong>Median</strong><span>${num(distribution.median, 2)} LUFS</span></div>
            <div title="Oberes Quartil."><strong>Q3</strong><span>${num(distribution.q3, 2)} LUFS</span></div>
            <div title="Lautester auswertbarer Sound."><strong>Max</strong><span>${num(distribution.max, 2)} LUFS</span></div>
          </div>
        </details>
        <div class="sound-note">Ablauf: Referenzsound abspielen, OBS/Voicemeeter darauf einstellen, danach Ergebnisse relativ zur Referenz bewerten. Der technische Test-Ton wird als echte Datei im Sound-Ordner erzeugt und dann über den gewählten Sound-System-Ausgabeweg abgespielt; der WAV-Link ist nur zum Gegenhören.</div>
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
        <summary>Scan-Hinweise</summary>
        <div class="sound-levelscan-guide-grid">
          <div title="${esc(HELP.scanLimit)}"><strong>Scan-Limit</strong><span>Maximale Anzahl Dateien, die beim nächsten Lauf gemessen werden.</span></div>
          <div title="${esc(HELP.progress)}"><strong>Fortschritt</strong><span>Status, aktuelle Datei und Zähler werden live abgefragt.</span></div>
          <div title="${esc(HELP.ttsExcluded)}"><strong>TTS raus</strong><span>TTS-/Speech-Dateien werden standardmäßig ausgeschlossen.</span></div>
          <div title="${esc(HELP.readOnly)}"><strong>Read-only</strong><span>Der Scan verändert keine Sound-Dateien.</span></div>
          <div title="${esc(HELP.truePeak)}"><strong>Messung</strong><span>FFmpeg misst LUFS, True Peak und weitere Werte.</span></div>
        </div>
      </details>

      <div class="sound-levelscan-controls scan-only">
        <label class="sound-field">
          ${withHelp('Scan-Limit', HELP.scanLimit)}
          <input id="soundLevelScanLimit" data-sound-level-control="scanLimit" type="number" min="1" max="5000" value="${esc(state.scanLimit)}" title="${esc(HELP.scanLimit)}">
        </label>
      </div>
      <div class="sound-actions">
        <button type="button" class="success" data-sound-level-action="scan" ${state.loading ? 'disabled' : ''} title="Startet einen neuen Read-only-Scan über das Backend.">Scan starten</button>
        <button type="button" data-sound-level-action="reload" ${state.loading ? 'disabled' : ''} title="Lädt Status und Ergebnisse neu.">Neu laden</button>
        <button type="button" data-sound-level-tab="results" title="Nach dem Scan zur Ergebnistabelle wechseln.">Ergebnisse öffnen</button>
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

  function renderApplyDefaultsPanel(){
    const preview = state.levelConfigApplyPreview || {};
    const actions = Array.isArray(preview.actions) ? preview.actions : [];
    const rows = actions.length ? actions.map(action => `
      <div class="sound-levelscan-apply-row" title="${esc(action.note || '')}">
        <div>
          <strong>${esc(action.label || action.id)}</strong>
          <span>${esc(action.table || '')}${action.key ? ' / ' + esc(action.key) : ''}</span>
        </div>
        <div class="sound-levelscan-apply-values">
          <span>Vorher: <strong>${esc(formatApplyValue(action.before))}</strong></span>
          <span>Nachher: <strong>${esc(formatApplyValue(action.after))}</strong></span>
        </div>
        <span class="sound-pill ${action.applied ? 'success' : 'warn'}">${action.applied ? 'angewendet' : 'Vorschau'}</span>
      </div>
    `).join('') : `<div class="sound-empty">Noch keine Vorschau geladen.</div>`;

    return `
      <div class="sound-levelscan-apply-panel">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Defaults in Module übernehmen</strong>
            <span>${esc(HELP.applyDefaults)}</span>
          </div>
          <span class="sound-pill ${preview.applied ? 'success' : 'warn'}">${preview.applied ? 'angewendet' : 'Preview'}</span>
        </div>
        <div class="sound-levelscan-apply-list">${rows}</div>
        <div class="sound-actions">
          <button type="button" data-sound-level-action="preview-apply-defaults" title="Zeigt, welche Modul-Settings geändert würden. Noch keine Änderung.">Preview laden</button>
          <button type="button" class="success" data-sound-level-action="apply-defaults" title="Schreibt die Defaults in die passenden SQLite-Settings. Keine Sounddateien werden verändert.">Defaults anwenden</button>
        </div>
        <div class="sound-note"><strong>Wichtig:</strong> Diese Aktion schreibt nur DB-Settings wie Sound-System-Output-Defaults, SoundAlerts-Default-Volume und VIP-/Mod-Default-Volume. Bestehende Sounddateien und einzelne alte Regeln werden nicht überschrieben.</div>
      </div>
    `;
  }

  function formatApplyValue(value){
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch (_) { return '[object]'; }
    }
    return String(value);
  }

  function renderMassVolumePreview(){
    const preview = state.massVolumePreview || null;
    if (!preview || preview.ok === false) {
      return `
        <div class="sound-card muted">
          <div class="sound-card-head">
            <strong>Bestehende Sound-Volumes</strong>
            <span>Noch keine Preview geladen.</span>
          </div>
          <button type="button" data-sound-level-action="preview-mass-volume" title="Lädt eine reine Vorschau. Es wird nichts geändert.">Volume-Preview laden</button>
        </div>`;
    }

    const summary = preview.summary || {};
    const sections = Array.isArray(preview.sections) ? preview.sections : [];
    const loudness = preview.loudness || {};
    return `
      <div class="sound-card sound-levelscan-mass-preview">
        <div class="sound-card-head">
          <strong>Bestehende Sound-Volumes Preview</strong>
          <span>Nur Analyse. Keine Massenänderung.</span>
        </div>
        <div class="sound-levelscan-summary-grid compact">
          <div><strong>${esc(summary.totalRows ?? 0)}</strong><span>geprüfte Einträge</span></div>
          <div><strong>${esc(summary.totalWouldChange ?? 0)}</strong><span>wären Kandidaten</span></div>
          <div><strong>${esc(summary.explicitVolume100 ?? 0)}</strong><span>stehen auf 100%</span></div>
          <div><strong>${esc(summary.boostCopyNeeded ?? 0)}</strong><span>Boost-Kopie nötig</span></div>
          <div><strong>${esc(summary.runtimeCutCandidate ?? 0)}</strong><span>Runtime leiser</span></div>
        </div>
        <div class="sound-actions">
          <button type="button" data-sound-level-action="preview-mass-volume" title="Aktualisiert die Vorschau. Es wird nichts geändert.">Volume-Preview neu laden</button>
          <button type="button" class="success" data-sound-level-action="apply-alert-missing-volumes" title="Setzt nur fehlende/ungültige Alert-Regel-Volumes auf den Default. SoundAlerts mit 100% bleiben unverändert.">Alert-Missing auf 80 setzen</button>
        </div>
        ${renderMassVolumeApplyResult()}
        ${sections.map(renderMassVolumeSection).join('')}
        ${renderLoudnessNeeds(loudness)}
        <p class="sound-muted small">${esc((preview.notes || []).join(' '))}</p>
      </div>`;
  }

  function renderMassVolumeApplyResult(){
    const result = state.massVolumeApplyResult || null;
    if (!result) return '';
    if (result.ok === false) {
      return `<div class="sound-note danger">Alert-Volume-Aktion fehlgeschlagen: ${esc(result.message || result.error || 'unbekannt')}</div>`;
    }
    return `
      <div class="sound-note success">
        Alert-Regeln aktualisiert: <strong>${esc(result.changed || 0)}</strong> fehlende/ungültige Volume-Werte auf <strong>${esc(result.targetVolume || 80)}%</strong> gesetzt.
        Explizite bestehende Werte wurden nicht überschrieben.
      </div>`;
  }

  function renderMassVolumeSection(section){
    const rows = Array.isArray(section?.rows) ? section.rows : [];
    const summary = section?.summary || {};
    const shown = rows.filter(row => row.wouldChange || Number(row.before) === 100 || row.reason === 'explicit_volume_kept').slice(0, 25);
    return `
      <div class="sound-levelscan-subcard">
        <div class="sound-card-head small">
          <strong>${esc(section?.label || section?.area || 'Bereich')}</strong>
          <span>${esc(section?.note || '')}</span>
        </div>
        <div class="sound-levelscan-summary-grid mini">
          <div><strong>${esc(summary.total ?? 0)}</strong><span>gesamt</span></div>
          <div><strong>${esc(summary.wouldChange ?? 0)}</strong><span>Kandidaten</span></div>
          <div><strong>${esc(summary.volume100 ?? 0)}</strong><span>100%</span></div>
          <div><strong>${esc(summary.explicitKept ?? 0)}</strong><span>bleiben</span></div>
        </div>
        ${shown.length ? `
          <div class="sound-table-wrap compact">
            <table class="sound-levelscan-table compact">
              <thead><tr><th>Name</th><th>Datei/Bereich</th><th>Aktuell</th><th>Ziel</th><th>Aktion</th></tr></thead>
              <tbody>
                ${shown.map(row => `
                  <tr class="${row.wouldChange ? 'is-warning' : ''}">
                    <td>${esc(row.label || row.id || '-')}</td>
                    <td>${esc(row.file || row.source || row.area || row.category || '-')}</td>
                    <td>${row.before === null || row.before === undefined ? '-' : `${esc(row.before)}%`}</td>
                    <td>${row.after === null || row.after === undefined ? '-' : `${esc(row.after)}%`}</td>
                    <td><span class="sound-pill ${row.wouldChange ? 'warn' : 'success'}" title="${esc(row.reason || '')}">${esc(row.action || '-')}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<p class="sound-muted small">Keine auffälligen Einträge in diesem Bereich.</p>`}
      </div>`;
  }

  function renderLoudnessNeeds(loudness){
    const rows = Array.isArray(loudness?.rows) ? loudness.rows : [];
    const summary = loudness?.summary || {};
    const shown = rows.slice(0, 30);
    return `
      <div class="sound-levelscan-subcard">
        <div class="sound-card-head small">
          <strong>Pegel-Scan Bewertung</strong>
          <span>${esc(loudness?.note || '')}</span>
        </div>
        <div class="sound-levelscan-summary-grid mini">
          <div><strong>${esc(summary.total ?? 0)}</strong><span>Scan-Ergebnisse</span></div>
          <div><strong>${esc(summary.boostCopyNeeded ?? 0)}</strong><span>Boost-Kopie nötig</span></div>
          <div><strong>${esc(summary.runtimeCutCandidate ?? 0)}</strong><span>Runtime leiser</span></div>
          <div><strong>${esc(summary.ok ?? 0)}</strong><span>unauffällig</span></div>
        </div>
        ${shown.length ? `
          <div class="sound-table-wrap compact">
            <table class="sound-levelscan-table compact">
              <thead><tr><th>Datei</th><th>LUFS</th><th>Gain</th><th>Volume</th><th>Bewertung</th></tr></thead>
              <tbody>
                ${shown.map(row => `
                  <tr class="${row.boostCopyNeeded ? 'is-danger' : 'is-warning'}">
                    <td>${esc(row.file || '-')}</td>
                    <td>${num(row.inputI, 2)}</td>
                    <td>${db(row.targetGainDb ?? row.recommendedGainDb, 1)}</td>
                    <td>${row.recommendedVolume === null || row.recommendedVolume === undefined ? '-' : `${esc(row.recommendedVolume)}%`}</td>
                    <td><span class="sound-pill ${row.boostCopyNeeded ? 'danger' : 'warn'}">${row.boostCopyNeeded ? 'Boost-Kopie nötig' : 'Runtime leiser'}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<p class="sound-muted small">Keine auffälligen Pegel-Kandidaten aus dem letzten Scan.</p>`}
      </div>`;
  }

  function renderConfigPanel(){
    const cfg = state.levelConfig || {};
    const upload = cfg.uploadDefaults || {};
    const mass = cfg.massApply || {};
    const out = normalizeReferenceOutputTarget(cfg.defaultReferenceOutputTarget || state.referenceOutputTarget || 'overlay');
    return `
      <div class="sound-levelscan-config-panel">
        <div class="sound-levelscan-preview-head">
          <div>
            <strong>Sound-Pegel Config</strong>
            <span>${esc(HELP.config)}</span>
          </div>
          <span class="sound-pill success" title="Wird in SQLite gespeichert, nicht in config/**.">SQLite</span>
        </div>

        <div class="sound-settings-grid sound-levelscan-config-grid">
          <div class="sound-settings-title">Basis-Lautstärke</div>
          <label class="sound-field">
            <span>${withHelp('Default Playback Volume', HELP.defaultPlaybackVolume)}</span>
            <input id="soundLevelConfigDefaultPlaybackVolume" type="number" min="1" max="100" value="${esc(cfg.defaultPlaybackVolume ?? 80)}">
          </label>
          <label class="sound-field">
            <span>Max Playback Volume</span>
            <input id="soundLevelConfigMaxPlaybackVolume" type="number" min="1" max="100" value="${esc(cfg.maxPlaybackVolume ?? 100)}" title="Obergrenze fuer automatische Runtime-Volume-Anpassungen.">
          </label>
          <label class="sound-field">
            <span>${withHelp('Upload Default Volume', HELP.uploadDefaultVolume)}</span>
            <input id="soundLevelConfigUploadDefaultVolume" type="number" min="1" max="100" value="${esc(cfg.uploadDefaultVolume ?? 80)}">
          </label>

          <div class="sound-settings-title">Scan & Referenz</div>
          <label class="sound-field">
            <span>Referenz-Toleranz dB</span>
            <input id="soundLevelConfigReferenceToleranceDb" type="number" min="0.5" max="12" step="0.5" value="${esc(cfg.referenceToleranceDb ?? 3)}" title="Toleranzbereich fuer spaetere Bewertung relativ zur Auto-Referenz.">
          </label>
          <label class="sound-field">
            <span>Standard Scan-Limit</span>
            <input id="soundLevelConfigDefaultScanLimit" type="number" min="1" max="5000" value="${esc(cfg.defaultScanLimit ?? state.scanLimit ?? 500)}">
          </label>
          <label class="sound-field">
            <span>Standard Ergebnis-Limit</span>
            <input id="soundLevelConfigDefaultResultLimit" type="number" min="1" max="1000" value="${esc(cfg.defaultResultLimit ?? state.resultLimit ?? 250)}">
          </label>
          <label class="sound-field">
            <span>Standard Referenz-Ausgabeweg</span>
            <select id="soundLevelConfigReferenceOutputTarget" title="Standard-Ausgabeweg fuer Referenzsound und Test-Ton.">
              <option value="overlay" ${out === 'overlay' ? 'selected' : ''}>OBS/Overlay</option>
              <option value="device" ${out === 'device' ? 'selected' : ''}>Audiogerät</option>
              <option value="both" ${out === 'both' ? 'selected' : ''}>OBS + Audiogerät</option>
            </select>
          </label>

          <div class="sound-settings-title">Boost-Kopien Zielwert</div>
          <label class="sound-field">
            <span>${withHelp('Boost Ziel-LUFS', HELP.boostTargetLufs)}</span>
            <input id="soundLevelConfigBoostTargetLufs" type="number" min="-40" max="-6" step="0.1" value="${esc(cfg.boostTargetLufs ?? -14)}">
          </label>
          <label class="sound-field">
            <span>${withHelp('Sicherheitsabstand dB', HELP.boostSafetyDb)}</span>
            <input id="soundLevelConfigBoostSafetyDb" type="number" min="0" max="8" step="0.5" value="${esc(cfg.boostReferenceSafetyDb ?? 2)}">
          </label>
          <label class="sound-field">
            <span>Max Boost dB</span>
            <input id="soundLevelConfigBoostMaxGainDb" type="number" min="0.5" max="18" step="0.5" value="${esc(cfg.boostMaxGainDb ?? 12)}" title="Obergrenze fuer eine einzelne Boost-Kopie.">
          </label>
          <div class="sound-actions sound-levelscan-wide">
            <button type="button" data-sound-level-action="adopt-reference-boost-target" title="${esc(HELP.adoptReferenceTarget)}">Referenz als Boost-Ziel übernehmen</button>
          </div>

          <div class="sound-settings-title">Neue Uploads vorbereiten</div>
          <label class="sound-check"><input id="soundLevelConfigUploadAlerts" type="checkbox" ${upload.alerts !== false ? 'checked' : ''}><span>Neue Alert-Sounds mit Upload Default Volume</span></label>
          <label class="sound-check"><input id="soundLevelConfigUploadSoundAlerts" type="checkbox" ${upload.soundalerts !== false ? 'checked' : ''}><span>Neue SoundAlert/Kanalpunkte-Sounds</span></label>
          <label class="sound-check"><input id="soundLevelConfigUploadVipMod" type="checkbox" ${upload.vipMod !== false ? 'checked' : ''}><span>Neue VIP-/Mod-Sounds</span></label>
          <label class="sound-check"><input id="soundLevelConfigUploadPresets" type="checkbox" ${upload.soundPresets !== false ? 'checked' : ''}><span>Neue Sound-System Presets</span></label>

          <div class="sound-settings-title">Bestehende Sounds - Massenaktion vorbereitet</div>
          <label class="sound-check"><input id="soundLevelConfigMassAlerts" type="checkbox" ${mass.includeAlerts !== false ? 'checked' : ''}><span>Alerts einbeziehen</span></label>
          <label class="sound-check"><input id="soundLevelConfigMassSoundAlerts" type="checkbox" ${mass.includeSoundAlerts !== false ? 'checked' : ''}><span>SoundAlerts/Kanalpunkte einbeziehen</span></label>
          <label class="sound-check"><input id="soundLevelConfigMassVipMod" type="checkbox" ${mass.includeVipMod !== false ? 'checked' : ''}><span>VIP-/Mod-Sounds einbeziehen</span></label>
          <label class="sound-check"><input id="soundLevelConfigMassPresets" type="checkbox" ${mass.includeSoundPresets === true ? 'checked' : ''}><span>Sound-System Presets einbeziehen</span></label>
          <label class="sound-check"><input id="soundLevelConfigMassOverwrite" type="checkbox" ${mass.overwriteExistingVolumes === true ? 'checked' : ''}><span>Vorhandene Volume-Werte überschreiben</span></label>
        </div>

        ${renderApplyDefaultsPanel()}

        <div class="sound-actions">
          <button type="button" class="success" data-sound-level-action="save-level-config" title="Speichert diese Config in SQLite. Bestehende Sounds werden nicht geändert.">Config speichern</button>
          <button type="button" data-sound-level-action="preview-mass-volume" title="Lädt eine Vorschau vorhandener Sound-Volumes. Keine Änderung.">Volume-Preview</button>
          <button type="button" data-sound-level-action="reload" title="Config, Status und Ergebnisse neu laden.">Neu laden</button>
        </div>
        <div class="sound-note"><strong>Wichtig:</strong> Diese Seite speichert zentrale Defaults in der Datenbank. Upload-Module und Massenaktionen werden in späteren Steps daran angeschlossen. In diesem Step werden keine vorhandenen Sounds überschrieben.</div>
      </div>
    `;
  }

  const LEVEL_TABS = [
    { id: 'overview', label: 'Übersicht', hint: 'Status, Kurzstatistik und letzte Scan-Daten.' },
    { id: 'scan', label: 'Scan', hint: 'Scan starten, Fortschritt verfolgen und Scan-Parameter setzen.' },
    { id: 'reference', label: 'Referenz', hint: 'Auto-Referenz, Referenzsound und Test-Ton über wählbaren Ausgabeweg.' },
    { id: 'results', label: 'Ergebnisse', hint: 'Messwerte, Filter, Suche und Tabelle.' },
    { id: 'correction', label: 'Korrektur', hint: 'Playback-Korrektur und Korrektur-Vorschau konfigurieren.' },
    { id: 'config', label: 'Config', hint: 'Zentrale Defaults fuer Playback, Uploads und spaetere Massenaktionen.' },
    { id: 'normalization', label: 'Boost-Kopien', hint: 'Preview und Einzeltest fuer zu leise Dateien. Originale bleiben unverändert.' }
  ];

  function renderLevelTabs(){
    return `
      <div class="sound-level-tabs" role="tablist" aria-label="Sound-Pegel Bereiche">
        ${LEVEL_TABS.map(tab => `
          <button type="button" class="sound-level-tab ${state.activeTab === tab.id ? 'active' : ''}" data-sound-level-tab="${esc(tab.id)}" title="${esc(tab.hint)}" aria-selected="${state.activeTab === tab.id ? 'true' : 'false'}">${esc(tab.label)}</button>
        `).join('')}
      </div>
    `;
  }

  function renderTabContent(){
    if (state.activeTab === 'scan') {
      return `
        ${renderControls()}
        ${renderProgressPanel()}
        ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      `;
    }
    if (state.activeTab === 'reference') {
      return `
        ${renderReferencePanel()}
        ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      `;
    }
    if (state.activeTab === 'results') {
      return `
        ${renderResultsControls()}
        ${state.showPreview ? renderPreviewPanel() : ''}
        ${renderRows()}
      `;
    }
    if (state.activeTab === 'correction') {
      return `
        ${renderCorrectionSettingsPanel()}
        ${state.showPreview ? renderPreviewPanel() : ''}
        ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      `;
    }
    if (state.activeTab === 'config') {
      return `
        ${renderConfigPanel()}
        ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
      `;
    }
    if (state.activeTab === 'normalization') {
      return `
        ${renderNormalizationPanel()}
        <div class="sound-note">Boost-Kopien sind jetzt als Einzeltest möglich. Keine Massenaktion und keine automatische Umleitung.</div>
      `;
    }
    return `
      ${renderSummary()}
      ${renderProgressPanel()}
      ${renderOverviewActions()}
      ${state.lastMessage ? `<div class="sound-note">${esc(state.lastMessage)}</div>` : ''}
    `;
  }

  function renderOverviewActions(){
    return `
      <div class="sound-actions">
        <button type="button" class="success" data-sound-level-tab="scan" title="Zum Scan-Bereich wechseln.">Scan öffnen</button>
        <button type="button" data-sound-level-tab="reference" title="Zur Auto-Referenz wechseln.">Referenz öffnen</button>
        <button type="button" data-sound-level-tab="results" title="Zur Ergebnistabelle wechseln.">Ergebnisse öffnen</button>
        <button type="button" data-sound-level-tab="correction" title="Zu den Korrektur-Einstellungen wechseln.">Korrektur öffnen</button>
        <button type="button" data-sound-level-tab="config" title="Zur zentralen Sound-Pegel Config wechseln.">Config öffnen</button>
        <button type="button" data-sound-level-action="reload" ${state.loading ? 'disabled' : ''} title="Lädt Status und Ergebnisse neu.">Neu laden</button>
      </div>
      <details class="sound-levelscan-guide">
        <summary>Werte kurz erklärt</summary>
        <div class="sound-levelscan-guide-grid">
          <div title="${esc(HELP.lufs)}"><strong>LUFS</strong><span>Wahrgenommene Lautstärke. Näher an 0 = lauter.</span></div>
          <div title="${esc(HELP.truePeak)}"><strong>True Peak</strong><span>Technische Spitze. Über Limit = Risiko für Clipping.</span></div>
          <div title="${esc(HELP.gain)}"><strong>Gain</strong><span>Empfohlene Korrektur. Minus = leiser.</span></div>
          <div title="${esc(HELP.volume)}"><strong>Volume</strong><span>Grobe spätere Playback-Empfehlung.</span></div>
          <div title="${esc(HELP.readOnly)}"><strong>Read-only</strong><span>Scans ändern keine Dateien.</span></div>
        </div>
      </details>
    `;
  }

  function renderResultsControls(){
    return `
      <div class="sound-levelscan-controls compact">
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
        <button type="button" data-sound-level-action="reload" ${state.loading ? 'disabled' : ''} title="Lädt Status und Ergebnisse neu.">Neu laden</button>
        <button type="button" data-sound-level-action="problematic" ${state.loading ? 'disabled' : ''} title="Zeigt Warnungen mit stärkster Absenkung zuerst.">Problematische zuerst</button>
        <button type="button" data-sound-level-action="loudest" ${state.loading ? 'disabled' : ''} title="Sortiert nach den lautesten gemessenen Dateien.">Lauteste zuerst</button>
        <button type="button" data-sound-level-action="quietest" ${state.loading ? 'disabled' : ''} title="Sortiert nach den leisesten gemessenen Dateien.">Leiseste zuerst</button>
      </div>
    `;
  }

  function render(){
    const card = document.getElementById('soundLevelScanCard');
    if (!card) return;
    card.innerHTML = `
      <div class="sound-levelscan-head">
        <div>
          <h2>Sound-Pegel</h2>
          <div class="sound-note">Eigenes System für Pegel-Scan, Auto-Referenz, Korrektur-Vorschau und spätere normalisierte Kopien. TTS-/Speech-Dateien werden standardmäßig ausgelassen.</div>
        </div>
        <div class="sound-levelscan-head-pills">
          <span class="sound-pill ${state.loading ? '' : 'success'}" title="${esc(HELP.readOnly)}">${state.loading ? 'Lädt...' : 'Read-only'}</span>
          <span class="sound-pill" title="${esc(HELP.ttsExcluded)}">TTS raus</span>
        </div>
      </div>
      ${renderLevelTabs()}
      ${renderTabContent()}
      <div class="sound-note">Hinweis: <strong>True Peak über Limit</strong>, <strong>viel zu laut</strong> und <strong>Volume-Cap erreicht</strong> sind Kandidaten für spätere Playback-Korrektur oder normalisierte Kopien. TTS-/Speech-Dateien sind standardmäßig ausgeschlossen.</div>
    `;
  }

  function boot(){
    registerDashboardModule();
    if (!ensureMounted()) return;
    loadAll().catch(err => {
      state.lastMessage = err.message || String(err);
      render();
    });
  }

  window.addEventListener('cgn:module-show', (event) => {
    if (event.detail?.module !== 'sound_level') return;
    setTimeout(boot, 0);
  });

  document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  if (document.readyState !== 'loading') setTimeout(boot, 0);

  return { loadAll, ensureMounted };
})();
