window.StreamEventsModule = (function(){
  'use strict';

  const api = {
    status: '/api/stream-events/status',
    list: '/api/stream-events/events?limit=250',
    events: '/api/stream-events/events',
    texts: '/api/stream-events/texts',
    config: '/api/stream-events/config',
    textRuntimeReport: '/api/stream-events/text-runtime/report',
    soundRuntimeReport: '/api/stream-events/sound-runtime/report',
    statisticsUsers: '/api/stream-events/statistics/users',
    statisticsUser: '/api/stream-events/statistics/user'
  };

  let root = null;
  let state = {
    loading: false,
    saving: false,
    error: '',
    message: '',
    status: null,
    events: [],
    selectedUid: '',
    selected: null,
    ranking: null,
    texts: null,
    config: null,
    textRuntimeReport: null,
    soundRuntimeReport: null,
    statisticsUsers: null,
    selectedStatsUser: '',
    userStatistics: null,
    userStatsModal: { open: false, login: '', eventUid: '', autoRefresh: true, intervalMs: 5000, lastScrollTop: 0, lastRefreshAt: '' },
    configSaving: false,
    textSaving: false,
    modal: null,
    activeTab: 'overview'
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])); }
  function norm(v){ return String(v || '').trim().toLowerCase(); }
  function fmtDate(v){ if (!v) return '-'; const d = new Date(v); return Number.isNaN(d.getTime()) ? esc(v) : esc(d.toLocaleString('de-DE')); }
  function rows(v){ return Array.isArray(v) ? v : (Array.isArray(v?.rows) ? v.rows : []); }
  function selectedEvent(){ return state.selected || state.events.find(e => e.eventUid === state.selectedUid) || state.events[0] || null; }

  function installIntoDashboard(){
    if (!window.CGN) return;
    window.CGN.modules.stream_events = window.CGN.modules.stream_events || {
      title: 'Event-System',
      panelId: 'streamEventsModule',
      group: 'community',
      overlayLink: '',
      reload(){ return window.StreamEventsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.stream_events = window.CGN.moduleCatalog.stream_events || {
      label: 'Event-System',
      icon: '🎲',
      enabled: true,
      description: 'Stream-Events mit Sound-/Text-Spielen, Punktewertung und Top 3.'
    };
    const community = window.CGN.sections?.community;
    if (community && Array.isArray(community.items) && !community.items.includes('stream_events')) {
      const idx = community.items.indexOf('challenges');
      if (idx >= 0) community.items.splice(idx, 0, 'stream_events');
      else community.items.push('stream_events');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('stream_events')) {
      window.CGN.favorites.push('stream_events');
    }
    if (window.CGN.activeModule === 'sectionhome' && window.CGN.activeSection === 'community') {
      window.SectionHomeModule?.render?.();
    }
  }

  function statusBadge(status){
    const s = norm(status);
    let cls = 'evs-badge-muted';
    if (s === 'active') cls = 'evs-badge-ok';
    else if (s === 'ready') cls = 'evs-badge-good';
    else if (s === 'draft') cls = 'evs-badge-warn';
    else if (s === 'finished') cls = 'evs-badge-info';
    else if (s === 'cancelled' || s === 'canceled') cls = 'evs-badge-off';
    const labels = { draft:'Entwurf', ready:'Startbereit', active:'Läuft', finished:'Beendet', cancelled:'Abgebrochen', canceled:'Abgebrochen' };
    return `<span class="evs-badge ${cls}">${esc(labels[s] || status || '-')}</span>`;
  }

  function issueLabel(issue){
    const key = String(issue || '');
    const map = {
      'event.name_missing': 'Eventname fehlt.',
      'event.no_game_type_selected': 'Mindestens Sound oder Text auswählen.',
      'sound.no_snippets': 'Sound ist aktiv, aber es gibt noch keinen gültigen Schnipsel.',
      'text.no_phrases': 'Text ist aktiv, aber es gibt noch keinen gültigen Geheimsatz.'
    };
    if (map[key]) return map[key];
    if (key.includes('.title_missing')) return 'Bei einem Sound-Schnipsel fehlt der Name.';
    if (key.includes('.media_missing')) return 'Bei einem Sound-Schnipsel fehlt die Mediendatei/Referenz.';
    if (key.includes('.answers_missing')) return 'Bei einem Sound-Schnipsel fehlen erlaubte Antworten.';
    if (key.includes('.phrase_missing')) return 'Bei einem Text-Rätsel fehlt der Geheimsatz.';
    return key;
  }

  function warnLabel(warn){
    const key = String(warn || '');
    if (key === 'sound.answer_seconds_very_short') return 'Antwortzeit für Sound ist sehr kurz.';
    if (key.includes('.answers_empty_uses_phrase')) return 'Beim Text-Rätsel fehlen Antwortvarianten; der Geheimsatz wird als Lösung genutzt.';
    if (key.includes('.points_not_set')) return 'Beim Text-Rätsel sind keine Punkte gesetzt.';
    if (key === 'text.word_points_enabled_but_zero_points') return 'Wortpunkte sind aktiv, aber Punkte pro Wort stehen auf 0.';
    return key;
  }

  function renderValidation(event){
    const validation = event?.validation || {};
    const issues = Array.isArray(validation.issues) ? validation.issues : [];
    const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    if (issues.length === 0 && warnings.length === 0) return '<div class="evs-valid-ok">✅ Event ist startbereit.</div>';
    return `
      <div class="evs-validation">
        ${issues.length ? `<div class="evs-validation-block"><strong>Noch nötig:</strong>${issues.map(i => `<div>• ${esc(issueLabel(i))}</div>`).join('')}</div>` : ''}
        ${warnings.length ? `<div class="evs-validation-block evs-validation-warn"><strong>Hinweise:</strong>${warnings.map(i => `<div>• ${esc(warnLabel(i))}</div>`).join('')}</div>` : ''}
      </div>
    `;
  }

  function eventTypes(event){
    const list = [];
    if (event?.soundEnabled) list.push('Sound');
    if (event?.textEnabled) list.push('Text');
    return list.length ? list.join(' + ') : '-';
  }


  function runtimeReport(){ return state.textRuntimeReport || null; }
  function runtimeReportFor(event){ const report = runtimeReport(); return event && report && report.eventUid === event.eventUid ? report : null; }
  function soundRuntimeReport(){ return state.soundRuntimeReport || null; }
  function soundRuntimeReportFor(event){ const report = soundRuntimeReport(); return event && report && report.eventUid === event.eventUid ? report : null; }
  function statisticsUsers(){ return Array.isArray(state.statisticsUsers?.users) ? state.statisticsUsers.users : []; }
  function userStatistics(){ return state.userStatistics || null; }
  function reportCount(report, key){ return Number(report?.counts?.[key] || 0); }
  function chatOutputText(output){ return output?.text || output?.chatText || ''; }
  function chatKindLabel(kind){
    const map = { word_found: 'Worttreffer', word_points_added: 'Wortpunkte', phrase_solved: 'Satz gelöst', sound_round_started: 'Sound gestartet', sound_solved: 'Sound gelöst', sound_unresolved: 'Sound ungelöst' };
    return map[kind] || kind || 'Chat-Output';
  }

  function render(){
    root = document.getElementById('streamEventsModule');
    if (!root) return;
    const ev = selectedEvent();
    state.selected = ev;

    root.innerHTML = `
      <div class="evs-page">
        <div class="evs-header glass">
          <div>
            <div class="evs-kicker">EVS-16 · Sound-Runtime Dashboard Report</div>
            <h2>Event-System</h2>
            <p>Übersicht zeigt laufende Events. Text- und Sound-Runtime, User-Details, Runden, Treffer, Payloads und Ranking sind dashboardfreundlich sichtbar.</p>
          </div>
          <div class="evs-header-actions">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
            <button type="button" class="evs-btn" data-evs-action="new">Neues Event</button>
          </div>
        </div>

        ${state.error ? `<div class="evs-alert evs-alert-error">${esc(state.error)}</div>` : ''}
        ${state.message ? `<div class="evs-alert evs-alert-ok">${esc(state.message)}</div>` : ''}

        ${renderTabs()}
        ${renderActiveTab(ev)}

        ${state.modal ? renderModal() : ''}
        ${state.userStatsModal?.open ? renderUserStatsModal() : ''}
      </div>
    `;
    attachMediaFields(root);
  }

  function tabs(){
    return [
      { id: 'overview', label: 'Übersicht', icon: '📋' },
      { id: 'events', label: 'Events', icon: '🎲' },
      { id: 'texts', label: 'Texte', icon: '💬' },
      { id: 'config', label: 'Config', icon: '⚙️' },
      { id: 'stats', label: 'Statistik', icon: '🏆' },
      { id: 'overlay', label: 'Overlay', icon: '🖥️' }
    ];
  }

  function renderTabs(){
    return `
      <nav class="evs-tabs glass" aria-label="Event-System Bereiche">
        ${tabs().map(tab => `
          <button type="button" class="evs-tab ${state.activeTab === tab.id ? 'is-active' : ''}" data-evs-tab="${esc(tab.id)}">
            <span>${esc(tab.icon)}</span><b>${esc(tab.label)}</b>
          </button>
        `).join('')}
      </nav>
    `;
  }

  function renderActiveTab(event){
    const tab = state.activeTab || 'overview';
    if (tab === 'events') return renderEventsTab(event);
    if (tab === 'texts') return renderTextsTab();
    if (tab === 'config') return renderConfigTab();
    if (tab === 'stats') return renderStatsTab(event);
    if (tab === 'overlay') return renderOverlayTab(event);
    return renderOverviewTab(event);
  }

  function renderOverviewTab(ev){
    const activeEvents = state.events.filter(event => norm(event.status) === 'active');
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div>
            <h3>Laufende Events</h3>
            <span>Nur aktive Events und schneller Zugriff auf Status/Statistik.</span>
          </div>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
        </div>
        ${activeEvents.length ? `
          <div class="evs-event-card-grid">
            ${activeEvents.map(renderRunningEventCard).join('')}
          </div>
          ${renderRuntimeReportPanel(activeEvents[0], true)}
        ` : '<div class="evs-empty">Aktuell läuft kein Event. Vorbereitete Events findest du im Tab „Events“.</div>'}
      </section>
    `;
  }

  function renderEventsTab(ev){
    return `
      <div class="evs-grid">
        <section class="evs-card glass">
          <div class="evs-card-head">
            <div>
              <h3>Konfigurierte Events</h3>
              <span>Entwürfe, startbereite, laufende und beendete Events.</span>
            </div>
            <button type="button" class="evs-btn evs-btn-small" data-evs-action="new">Neues Event</button>
          </div>
          <div class="evs-list">
            ${state.events.length ? state.events.map(renderEventRow).join('') : '<div class="evs-empty">Noch keine Events vorhanden.</div>'}
          </div>
        </section>

        <section class="evs-card glass">
          <div class="evs-card-head">
            <h3>Event-Details</h3>
            ${ev ? statusBadge(ev.status) : ''}
          </div>
          ${ev ? renderEventDetail(ev) : '<div class="evs-empty">Wähle links ein Event aus oder erstelle ein neues.</div>'}
        </section>
      </div>
    `;
  }

  function renderRunningEventCard(event){
    const sound = event.soundConfig || {};
    const text = event.textConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets.length : 0;
    const phrases = Array.isArray(text.phrases) ? text.phrases.length : 0;
    return `
      <article class="evs-running-card">
        <div class="evs-running-card-head">
          <div>
            <h3>${esc(event.name || 'Unbenanntes Event')}</h3>
            <span>${esc(eventTypes(event))}</span>
          </div>
          ${statusBadge(event.status)}
        </div>
        <p>${esc(event.description || 'Keine Beschreibung.')}</p>
        <div class="evs-mini-grid evs-mini-grid-compact">
          <div><strong>Sounds</strong><span>${esc(snippets)}</span></div>
          <div><strong>Sätze</strong><span>${esc(phrases)}</span></div>
          <div><strong>Wörter</strong><span>${esc(reportCount(runtimeReportFor(event), 'wordHits'))}</span></div>
          <div><strong>Lösungen</strong><span>${esc(reportCount(runtimeReportFor(event), 'phraseSolves'))}</span></div>
          <div><strong>Gestartet</strong><span>${fmtDate(event.startedAt)}</span></div>
          <div><strong>Geändert</strong><span>${fmtDate(event.updatedAt)}</span></div>
        </div>
        <div class="evs-action-row">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="selectEvent" data-uid="${esc(event.eventUid)}" data-target-tab="stats">Statistik ansehen</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Bearbeiten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}">Beenden</button>
        </div>
      </article>
    `;
  }

  function renderConfigTab(){
    const cfg = state.config?.config || {};
    const eventDefaults = cfg.eventDefaults || {};
    const soundDefaults = cfg.soundDefaults || {};
    const textDefaults = cfg.textDefaults || {};
    const overlayDefaults = cfg.overlayDefaults || {};
    return `
      <section class="evs-card glass evs-tab-panel evs-config-panel">
        <div class="evs-card-head">
          <div>
            <h3>Event-System Config</h3>
            <span>Globale Standardwerte. Einzelne Events können davon später abweichen.</span>
          </div>
          <button type="button" class="evs-btn" data-evs-action="saveConfig">Config speichern</button>
        </div>

        <div class="evs-text-rule-note">Diese Einstellungen sind die Voreinstellungen für neue Events und spätere Runtime-Regeln. Sie ersetzen keine Event-Bearbeitung.</div>

        <div class="evs-config-grid">
          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Allgemein</strong><small>Grundverhalten des Event-Systems</small></div>
            <label><span>Top-Gewinner anzeigen</span><input id="evsCfgTopWinners" type="number" min="1" max="10" value="${esc(eventDefaults.defaultTopWinners ?? 3)}"></label>
            <label class="evs-check"><input id="evsCfgOneActive" type="checkbox" ${eventDefaults.allowOnlyOneActiveEvent !== false ? 'checked' : ''}> Nur ein aktives Event gleichzeitig</label>
            <label class="evs-check"><input id="evsCfgOverviewRunning" type="checkbox" ${eventDefaults.overviewShowsOnlyRunningEvents !== false ? 'checked' : ''}> Übersicht nur laufende Events</label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Sound-Spiel Defaults</strong><small>Standardwerte für neue Sound-Runden</small></div>
            <label><span>Antwortzeit in Sekunden</span><input id="evsCfgSoundAnswerSeconds" type="number" min="5" max="300" value="${esc(soundDefaults.defaultAnswerSeconds ?? 20)}"></label>
            <label><span>Punkte pro Soundlösung</span><input id="evsCfgSoundPoints" type="number" min="0" max="10000" value="${esc(soundDefaults.defaultPoints ?? 10)}"></label>
            <label><span>Wenn nicht erkannt</span><select id="evsCfgSoundUnresolved">
              <option value="requeue_later" ${soundDefaults.unresolvedPolicy === 'requeue_later' ? 'selected' : ''}>Später nochmal</option>
              <option value="remove" ${soundDefaults.unresolvedPolicy === 'remove' ? 'selected' : ''}>Aus Event entfernen</option>
              <option value="manual" ${soundDefaults.unresolvedPolicy === 'manual' ? 'selected' : ''}>Manuell entscheiden</option>
            </select></label>
            <label class="evs-check"><input id="evsCfgSoundAvoidRepeat" type="checkbox" ${soundDefaults.avoidImmediateRepeat !== false ? 'checked' : ''}> Direkte Wiederholung vermeiden</label>
            <label class="evs-check"><input id="evsCfgRevealVideo" type="checkbox" ${soundDefaults.revealVideoEnabled !== false ? 'checked' : ''}> Auflösungs-Video erlauben</label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Text-Spiel Defaults</strong><small>Sätze, Teiltreffer und Wortpunkte</small></div>
            <label><span>Punkte für komplette Lösung</span><input id="evsCfgTextPhrasePoints" type="number" min="0" max="10000" value="${esc(textDefaults.defaultPhrasePoints ?? 40)}"></label>
            <label><span>Teiltreffer-Meldung</span><select id="evsCfgPartialVisibility">
              <option value="off" ${textDefaults.partialHintVisibility === 'off' ? 'selected' : ''}>Aus</option>
              <option value="general" ${textDefaults.partialHintVisibility === 'general' ? 'selected' : ''}>Allgemein</option>
              <option value="with_sentence" ${textDefaults.partialHintVisibility === 'with_sentence' ? 'selected' : ''}>Mit Satznummer</option>
            </select></label>
            <label class="evs-check"><input id="evsCfgPartialHints" type="checkbox" ${textDefaults.partialHintsEnabled !== false ? 'checked' : ''}> Teiltreffer-Hinweise aktivieren</label>
            <label class="evs-check"><input id="evsCfgShowWordCount" type="checkbox" ${textDefaults.showPartialWordCount !== false ? 'checked' : ''}> Anzahl gefundener Wörter anzeigen</label>
            <label class="evs-check"><input id="evsCfgUniqueWords" type="checkbox" ${textDefaults.uniqueWordPerUserPhrase !== false ? 'checked' : ''}> Wort pro User/Satz nur einmal zählen</label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Wortpunkte</strong><small>Optional, damit mehr User Punkte sammeln können</small></div>
            <label class="evs-check"><input id="evsCfgWordPoints" type="checkbox" ${textDefaults.wordPointsEnabled ? 'checked' : ''}> Punkte für gefundene Wörter aktivieren</label>
            <label><span>Punkte pro neuem Wort</span><input id="evsCfgPointsPerWord" type="number" min="0" max="1000" value="${esc(textDefaults.pointsPerNewWord ?? 1)}"></label>
            <label><span>Max. Wortpunkte pro User/Satz</span><input id="evsCfgMaxWordPoints" type="number" min="0" max="10000" value="${esc(textDefaults.maxWordPointsPerUserPhrase ?? 5)}"></label>
            <label><span>Zusätzlicher Hinweis-Cooldown</span><input id="evsCfgPartialCooldown" type="number" min="0" max="3600" value="${esc(textDefaults.partialHintCooldownSeconds ?? 0)}"></label>
          </div>

          <div class="evs-config-card">
            <div class="evs-config-card-head"><strong>Overlay Defaults</strong><small>Vorbereitung für den späteren Overlay-Step</small></div>
            <label class="evs-check"><input id="evsCfgOverlayTop3" type="checkbox" ${overlayDefaults.showTop3 !== false ? 'checked' : ''}> Top 3 anzeigen</label>
            <label class="evs-check"><input id="evsCfgOverlayRound" type="checkbox" ${overlayDefaults.showCurrentRound !== false ? 'checked' : ''}> aktuelle Runde anzeigen</label>
            <label class="evs-check"><input id="evsCfgOverlayHints" type="checkbox" ${overlayDefaults.showPartialHints !== false ? 'checked' : ''}> Teiltreffer-Hinweise im Overlay erlauben</label>
          </div>
        </div>

        <div class="evs-tab-help">Quelle: ${esc(state.config?.source || 'default')} · Letzte Änderung: ${fmtDate(state.config?.updatedAt)}</div>
      </section>
    `;
  }

  function renderSoundTab(event){
    if (!event) return renderSelectEventEmpty('Sound-Spiel');
    const sound = event.soundConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets : [];
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Sound-Spiel</h3><span>Audio-Schnipsel, Antwortzeit, Lösungen und Verhalten bei nicht erkannt.</span></div>
          <button type="button" class="evs-btn" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Sound konfigurieren</button>
        </div>
        ${event.soundEnabled ? `
          <div class="evs-mini-grid evs-mini-grid-compact">
            <div><strong>Antwortzeit</strong><span>${esc(sound.answerSeconds || sound.defaultAnswerSeconds || 20)} Sekunden</span></div>
            <div><strong>Nicht erkannt</strong><span>${esc(sound.unresolvedPolicy === 'remove' ? 'Entfernen' : 'Später nochmal')}</span></div>
            <div><strong>Schnipsel</strong><span>${esc(snippets.length)}</span></div>
            <div><strong>Auflösungs-Video</strong><span>${esc(snippets.some(s => s.revealVideoMediaId) ? 'vorbereitet' : 'optional')}</span></div>
          </div>
          <div class="evs-list evs-tab-list">
            ${snippets.length ? snippets.map((snip, idx) => `<div class="evs-info-row"><strong>${esc(idx + 1)}. ${snip.title || snip.name || 'Unbenannter Schnipsel'}</strong><span>${esc((snip.acceptedAnswers || []).join(', ') || 'Antworten fehlen')}</span></div>`).join('') : '<div class="evs-empty">Noch kein Sound-Schnipsel hinterlegt.</div>'}
          </div>
        ` : '<div class="evs-empty">Sound-Spiel ist für dieses Event nicht aktiviert.</div>'}
      </section>
    `;
  }

  function renderTextGameTab(event){
    if (!event) return renderSelectEventEmpty('Text-Spiel');
    const text = event.textConfig || {};
    const phrases = Array.isArray(text.phrases) ? text.phrases : [];
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Text-Spiel</h3><span>Mehrere geheime Sätze, Worttreffer, Wortpunkte und Teiltreffer-Hinweise.</span></div>
          <button type="button" class="evs-btn" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Text-Spiel konfigurieren</button>
        </div>
        ${event.textEnabled ? `
          <div class="evs-mini-grid evs-mini-grid-compact">
            <div><strong>Geheime Sätze</strong><span>${esc(phrases.length)}</span></div>
            <div><strong>Teiltreffer</strong><span>${esc(text.partialHintVisibility === 'with_sentence' ? 'mit Satznummer' : (text.partialHintVisibility === 'general' ? 'allgemein' : 'aus'))}</span></div>
            <div><strong>Wortpunkte</strong><span>${esc(text.wordPointsEnabled ? `${text.pointsPerNewWord || 0} pro Wort` : 'aus')}</span></div>
            <div><strong>Limit</strong><span>${esc(text.maxWordPointsPerUserPhrase || 0)} pro User/Satz</span></div>
          </div>
          <div class="evs-list evs-tab-list">
            ${phrases.length ? phrases.map((phrase, idx) => `<div class="evs-info-row"><strong>Satz ${esc(idx + 1)}</strong><span>${esc(phrase.phrase || phrase.text || phrase.solution || 'Geheimsatz fehlt')}</span></div>`).join('') : '<div class="evs-empty">Noch kein Geheimsatz hinterlegt.</div>'}
          </div>
        ` : '<div class="evs-empty">Text-Spiel ist für dieses Event nicht aktiviert.</div>'}
      </section>
    `;
  }

  function renderTextsTab(){
    return renderTextConfigPanel(true);
  }

  function renderStatsTab(event){
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Statistik & Runtime</h3><span>Ranking, Text-Spiel, Sound-Spiel, User-Filter und vorbereitete Payloads für das ausgewählte Event.</span></div>
          ${event ? `<div class="evs-action-row evs-action-row-tight"><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Ranking laden</button><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runtimeReport" data-uid="${esc(event.eventUid)}">Text-Report laden</button><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="soundRuntimeReport" data-uid="${esc(event.eventUid)}">Sound-Report laden</button><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsUsers" data-uid="${esc(event.eventUid)}">Userliste laden</button></div>` : ''}
        </div>
        ${event ? renderStatsUserFilter(event) + renderSoundRuntimeReportPanel(event, false) + renderRuntimeReportPanel(event, false) : '<div class="evs-empty">Kein Event ausgewählt.</div>'}
      </section>
    `;
  }

  function renderStatsUserFilter(event){
    const users = statisticsUsers();
    const selected = state.selectedStatsUser || '';
    const options = ['<option value="">User auswählen…</option>'].concat(users.map(user => {
      const label = `${user.userDisplayName || user.userLogin} · ${user.totalPoints || 0} Punkte · ${user.wordHits || 0} Wörter · ${user.phraseSolves || 0} Lösungen`;
      return `<option value="${esc(user.userLogin)}" ${selected === user.userLogin ? 'selected' : ''}>${esc(label)}</option>`;
    })).join('');
    return `
      <div class="evs-user-filter">
        <label>
          <span>User-Statistik</span>
          <select data-evs-user-stat-select data-event-uid="${esc(event.eventUid)}">${options}</select>
        </label>
        <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="statsUsers" data-uid="${esc(event.eventUid)}">Dropdown aktualisieren</button>
        ${selected ? `<button type="button" class="evs-btn" data-evs-action="openUserStats" data-user-login="${esc(selected)}" data-uid="${esc(event.eventUid)}">User-Details öffnen</button>` : ''}
        <small>${users.length ? `${esc(users.length)} User mit Event-Daten gefunden.` : 'Noch keine Userdaten geladen oder vorhanden.'}</small>
      </div>
    `;
  }

  function renderSoundRuntimeReportPanel(event, compact){
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    const report = soundRuntimeReportFor(event);
    const rankingRows = rows((report?.ranking && report.ranking.rows) ? report.ranking : state.ranking);
    const rounds = Array.isArray(report?.rounds) ? report.rounds : [];
    const scoreEntries = Array.isArray(report?.scoreEntries) ? report.scoreEntries : [];
    const chatOutputs = Array.isArray(report?.chatOutputs) ? report.chatOutputs : [];
    const playbackPayloads = Array.isArray(report?.playbackPayloads) ? report.playbackPayloads : [];
    if (!report) {
      return `<div class="evs-runtime-report evs-runtime-report-empty evs-sound-report"><div class="evs-empty">Sound-Runtime-Report noch nicht geladen.</div><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="soundRuntimeReport" data-uid="${esc(event.eventUid)}">Sound-Report laden</button></div>`;
    }
    return `
      <div class="evs-runtime-report evs-sound-report ${compact ? 'is-compact' : ''}">
        <div class="evs-runtime-box-head evs-sound-report-head"><h4>Sound-Runtime</h4><small>preparedOnly=true · directPlayback=false · soundSystemQueueTouched=false</small></div>
        <div class="evs-runtime-counters">
          <div><strong>${esc(reportCount(report, 'rounds'))}</strong><span>Runden</span></div>
          <div><strong>${esc(reportCount(report, 'solved'))}</strong><span>Gelöst</span></div>
          <div><strong>${esc(reportCount(report, 'unresolved'))}</strong><span>Ungelöst</span></div>
          <div><strong>${esc(reportCount(report, 'soundScoreEntries'))}</strong><span>Sound-Punkte</span></div>
          <div><strong>${esc(reportCount(report, 'playbackPayloads'))}</strong><span>Playback-Payloads</span></div>
          <div><strong>${esc(reportCount(report, 'chatOutputs'))}</strong><span>Chat-Payloads</span></div>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box">
            <h4>Sound-Runden</h4>
            ${rounds.length ? rounds.slice(0, compact ? 5 : 16).map(round => {
              const snippet = round.config?.snippet || {};
              const result = round.resultData || {};
              return `<div class="evs-runtime-row"><strong>${esc(snippet.title || round.itemUid || round.roundUid)}</strong><span>${esc(soundRoundStatusLabel(round.status || round.result))} · ${esc(round.roundUid)}</span><small>${fmtDate(round.startedAt || round.createdAt)}${round.finishedAt ? ` → ${fmtDate(round.finishedAt)}` : ''}${result.userDisplayName ? ` · ${esc(result.userDisplayName)} · +${esc(result.points || 0)}` : ''}</small></div>`;
            }).join('') : '<div class="evs-empty">Noch keine Sound-Runden.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Sound-Punkte</h4>
            ${scoreEntries.length ? scoreEntries.slice(0, compact ? 5 : 16).map(row => `<div class="evs-runtime-row"><strong>${esc(row.userDisplayName || row.userLogin)}</strong><span>${esc(row.reason || row.sourceType)} · +${esc(row.points || 0)} Punkte</span><small>${fmtDate(row.createdAt)} · ${esc(row.metadata?.title || row.sourceUid || '')}</small></div>`).join('') : '<div class="evs-empty">Noch keine Sound-Punkte.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Ranking</h4>
            ${rankingRows.length ? rankingRows.slice(0, compact ? 5 : 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
          </section>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box evs-runtime-chatoutputs">
            <div class="evs-runtime-box-head"><h4>Vorbereitete Sound-Chatmeldungen</h4><small>directSend=false · via=bus_payload</small></div>
            ${chatOutputs.length ? chatOutputs.slice(0, compact ? 4 : 12).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p><small>${esc(output.textKey || '')} · ${fmtDate(output.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine vorbereiteten Sound-Chatmeldungen.</div>'}
          </section>

          <section class="evs-runtime-box evs-runtime-chatoutputs">
            <div class="evs-runtime-box-head"><h4>Vorbereitete Playback-Payloads</h4><small>target=sound_system · queueTouched=false</small></div>
            ${playbackPayloads.length ? playbackPayloads.slice(0, compact ? 3 : 8).map(payload => `<div class="evs-chat-output-row"><span>${esc(payload.action || 'Playback')}</span><p>${esc(payload.item?.label || payload.item?.mediaId || 'Sound-System Payload')}</p><small>${esc(payload.channel || '')} · directPlay=${esc(payload.directPlay)} · queueTouched=${esc(payload.queueTouched)}</small></div>`).join('') : '<div class="evs-empty">Aktuell kein Playback-Payload im Report. Bei aktiver Sound-Runde erscheint hier die vorbereitete Sound-System-Anforderung.</div>'}
          </section>
        </div>

        <div class="evs-tab-help">Sound-Report: ${fmtDate(report.updatedAt)} · Event: ${esc(event.name || event.eventUid)}</div>
      </div>
    `;
  }

  function soundRoundStatusLabel(status){
    const s = norm(status);
    const map = { active: 'Aktiv', solved: 'Gelöst', unresolved: 'Ungelöst', skipped: 'Übersprungen', finished: 'Beendet' };
    return map[s] || status || '-';
  }

  function renderRuntimeReportPanel(event, compact){
    if (!event) return '<div class="evs-empty">Kein Event ausgewählt.</div>';
    const report = runtimeReportFor(event);
    const rankingRows = rows((report?.ranking && report.ranking.rows) ? report.ranking : state.ranking);
    const wordHits = Array.isArray(report?.wordHits) ? report.wordHits : [];
    const phraseSolves = Array.isArray(report?.phraseSolves) ? report.phraseSolves : [];
    const chatOutputs = Array.isArray(report?.chatOutputs) ? report.chatOutputs : [];
    if (!report) {
      return `<div class="evs-runtime-report evs-runtime-report-empty"><div class="evs-empty">Text-Runtime-Report noch nicht geladen.</div><button type="button" class="evs-btn evs-btn-secondary" data-evs-action="runtimeReport" data-uid="${esc(event.eventUid)}">Report laden</button></div>`;
    }
    return `
      <div class="evs-runtime-report ${compact ? 'is-compact' : ''}">
        <div class="evs-runtime-counters">
          <div><strong>${esc(reportCount(report, 'wordHits'))}</strong><span>Worttreffer</span></div>
          <div><strong>${esc(reportCount(report, 'phraseSolves'))}</strong><span>Satzlösungen</span></div>
          <div><strong>${esc(reportCount(report, 'chatOutputs'))}</strong><span>Chat-Payloads</span></div>
          <div><strong>${esc(rankingRows.length)}</strong><span>Spieler im Ranking</span></div>
        </div>

        <div class="evs-runtime-columns">
          <section class="evs-runtime-box">
            <h4>Ranking</h4>
            ${rankingRows.length ? rankingRows.slice(0, compact ? 5 : 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Worttreffer</h4>
            ${wordHits.length ? wordHits.slice(0, compact ? 5 : 12).map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.userDisplayName || hit.userLogin)}</strong><span>Satz ${esc(hit.phraseNumber)} · ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine Worttreffer.</div>'}
          </section>

          <section class="evs-runtime-box">
            <h4>Satzlösungen</h4>
            ${phraseSolves.length ? phraseSolves.slice(0, compact ? 5 : 12).map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.userDisplayName || solve.userLogin)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine Satzlösung.</div>'}
          </section>
        </div>

        <section class="evs-runtime-box evs-runtime-chatoutputs">
          <div class="evs-runtime-box-head"><h4>Vorbereitete Chatmeldungen</h4><small>directSend=false · via=bus_payload</small></div>
          ${chatOutputs.length ? chatOutputs.slice(0, compact ? 4 : 12).map(output => `<div class="evs-chat-output-row"><span>${esc(chatKindLabel(output.kind))}</span><p>${esc(chatOutputText(output))}</p><small>${esc(output.textKey || '')} · ${fmtDate(output.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Noch keine vorbereiteten Chatmeldungen im Report.</div>'}
        </section>

        <div class="evs-tab-help">Report: ${fmtDate(report.updatedAt)} · Event: ${esc(event.name || event.eventUid)}</div>
      </div>
    `;
  }


  function renderUserStatisticsPanel(event){
    const report = userStatistics();
    if (!state.selectedStatsUser) return '';
    if (!report || !report.user || report.user.userLogin !== state.selectedStatsUser || (event && report.eventUid && report.eventUid !== event.eventUid)) {
      return `<section class="evs-runtime-box evs-user-detail"><div class="evs-empty">User-Report für ${esc(state.selectedStatsUser)} noch nicht geladen.</div></section>`;
    }
    const u = report.user || {};
    const wordHits = Array.isArray(report.text?.wordHits) ? report.text.wordHits : [];
    const phraseSolves = Array.isArray(report.text?.phraseSolves) ? report.text.phraseSolves : [];
    const timeline = Array.isArray(report.timeline) ? report.timeline : [];
    const soundRows = Array.isArray(report.sound?.rows) ? report.sound.rows : [];
    return `
      <section class="evs-user-detail">
        <div class="evs-runtime-box-head"><h4>User-Detail: ${esc(u.userDisplayName || u.userLogin)}</h4><small>${esc(u.userLogin || '')} · ${fmtDate(report.updatedAt)}</small></div>
        <div class="evs-runtime-counters evs-user-counters">
          <div><strong>${esc(u.totalPoints || 0)}</strong><span>Punkte gesamt</span></div>
          <div><strong>${esc(u.wordHits || 0)}</strong><span>Worttreffer</span></div>
          <div><strong>${esc(u.phraseSolves || 0)}</strong><span>Satzlösungen</span></div>
          <div><strong>${esc(u.eventCount || 0)}</strong><span>Events</span></div>
        </div>
        <div class="evs-runtime-columns evs-user-columns">
          <section class="evs-runtime-box">
            <h4>Gefundene Wörter</h4>
            ${wordHits.length ? wordHits.slice(0, 20).map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.eventName || hit.eventUid)}</strong><span>Satz ${esc(hit.phraseNumber)} · Wort: ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)} · „${esc(hit.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Worttreffer für diesen User.</div>'}
          </section>
          <section class="evs-runtime-box">
            <h4>Satzlösungen</h4>
            ${phraseSolves.length ? phraseSolves.slice(0, 20).map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.eventName || solve.eventUid)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)} · „${esc(solve.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Satzlösungen für diesen User.</div>'}
          </section>
          <section class="evs-runtime-box">
            <h4>Sound-Spiel später</h4>
            ${soundRows.length ? soundRows.slice(0, 20).map(row => `<div class="evs-runtime-row"><strong>${esc(row.eventName || row.eventUid)}</strong><span>${esc(row.reason || row.sourceType || 'Sound')} · +${esc(row.points || 0)}</span><small>${fmtDate(row.createdAt)}</small></div>`).join('') : `<div class="evs-empty">${esc(report.sound?.note || 'Sound-Statistik ist vorbereitet, aber noch ohne Runtime-Daten.')}</div>`}
          </section>
        </div>
        <section class="evs-runtime-box evs-user-timeline">
          <h4>Aktivität / Wann, wie, wo</h4>
          ${timeline.length ? timeline.slice(0, 30).map(item => `<div class="evs-user-timeline-row"><b>${esc(userTimelineLabel(item.kind))}</b><span>${esc(item.row?.eventName || item.row?.eventUid || '')}</span><em>${esc(item.label || '')}</em><strong>${esc(item.points || 0)} Punkte</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Keine Aktivität für diesen User.</div>'}
        </section>
      </section>
    `;
  }

  function userTimelineLabel(kind){
    const map = { word_hit: 'Wort', phrase_solved: 'Satz', sound_score: 'Sound' };
    return map[kind] || kind || 'Aktivität';
  }


  function selectedStatsEvent(){
    const uid = state.userStatsModal?.eventUid || state.selectedUid;
    return state.events.find(e => e.eventUid === uid) || selectedEvent();
  }

  function renderUserStatsModal(){
    const modal = state.userStatsModal || {};
    const event = selectedStatsEvent();
    const report = userStatistics();
    const login = modal.login || state.selectedStatsUser || '';
    const hasReport = report && report.user && report.user.userLogin === login && (!modal.eventUid || report.eventUid === modal.eventUid);
    const u = hasReport ? (report.user || {}) : { userLogin: login, userDisplayName: login };
    const wordHits = hasReport && Array.isArray(report.text?.wordHits) ? report.text.wordHits : [];
    const phraseSolves = hasReport && Array.isArray(report.text?.phraseSolves) ? report.text.phraseSolves : [];
    const timeline = hasReport && Array.isArray(report.timeline) ? report.timeline : [];
    const soundRows = hasReport && Array.isArray(report.sound?.rows) ? report.sound.rows : [];
    const auto = modal.autoRefresh !== false;
    return `
      <div class="evs-modal-backdrop evs-user-modal-backdrop" data-evs-user-modal-close="1">
        <div class="evs-modal glass evs-user-modal" role="dialog" aria-modal="true" aria-label="User Statistik">
          <div class="evs-modal-head evs-user-modal-head">
            <div>
              <h3>User-Statistik: ${esc(u.userDisplayName || u.userLogin || login)}</h3>
              <p>${event ? `Aktuelles Event: ${esc(event.name || event.eventUid)}` : 'Aktuelles Event'} · ${hasReport ? `Stand: ${fmtDate(report.updatedAt)}` : 'Report wird geladen oder ist noch leer.'}</p>
            </div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeUserStatsModal">×</button>
          </div>
          <div class="evs-user-modal-toolbar">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="refreshUserStatsModal" data-user-login="${esc(login)}" data-uid="${esc(modal.eventUid || state.selectedUid || '')}">Jetzt aktualisieren</button>
            <button type="button" class="evs-btn evs-btn-secondary ${auto ? 'is-active' : ''}" data-evs-action="toggleUserStatsAuto">AutoReload: ${auto ? 'An' : 'Aus'}</button>
            <small>Aktualisiert nur dieses Popup im Hintergrund. Kein Seitenreload.</small>
          </div>
          <div class="evs-user-modal-body" data-evs-user-modal-body>
            ${hasReport ? `
              <div class="evs-runtime-counters evs-user-counters">
                <div><strong>${esc(u.totalPoints || 0)}</strong><span>Punkte gesamt</span></div>
                <div><strong>${esc(u.wordHits || 0)}</strong><span>Worttreffer</span></div>
                <div><strong>${esc(u.phraseSolves || 0)}</strong><span>Satzlösungen</span></div>
                <div><strong>${esc(u.eventCount || 0)}</strong><span>Events</span></div>
              </div>

              <div class="evs-user-modal-grid">
                <section class="evs-runtime-box">
                  <h4>Gefundene Wörter</h4>
                  ${wordHits.length ? wordHits.map(hit => `<div class="evs-runtime-row"><strong>${esc(hit.eventName || hit.eventUid)}</strong><span>Satz ${esc(hit.phraseNumber)} · Wort: ${esc(hit.wordOriginal || hit.wordKey)} · +${esc(hit.pointsAwarded || 0)}</span><small>${fmtDate(hit.createdAt)} · „${esc(hit.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Worttreffer für diesen User.</div>'}
                </section>
                <section class="evs-runtime-box">
                  <h4>Gelöste Sätze</h4>
                  ${phraseSolves.length ? phraseSolves.map(solve => `<div class="evs-runtime-row"><strong>${esc(solve.eventName || solve.eventUid)}</strong><span>Satz ${esc(solve.phraseNumber)} · +${esc(solve.pointsAwarded || 0)} Punkte</span><small>${fmtDate(solve.createdAt)} · „${esc(solve.chatMessage || '')}“</small></div>`).join('') : '<div class="evs-empty">Keine Satzlösungen für diesen User.</div>'}
                </section>
                <section class="evs-runtime-box">
                  <h4>Sound-Spiel später</h4>
                  ${soundRows.length ? soundRows.map(row => `<div class="evs-runtime-row"><strong>${esc(row.eventName || row.eventUid)}</strong><span>${esc(row.reason || row.sourceType || 'Sound')} · +${esc(row.points || 0)}</span><small>${fmtDate(row.createdAt)}</small></div>`).join('') : `<div class="evs-empty">${esc(report.sound?.note || 'Sound-Statistik ist vorbereitet, aber noch ohne Runtime-Daten.')}</div>`}
                </section>
              </div>

              <section class="evs-runtime-box evs-user-timeline evs-user-modal-timeline">
                <h4>Aktivität / Wann, wie, wo</h4>
                ${timeline.length ? timeline.map(item => `<div class="evs-user-timeline-row"><b>${esc(userTimelineLabel(item.kind))}</b><span>${esc(item.row?.eventName || item.row?.eventUid || '')}</span><em>${esc(item.label || '')}</em><strong>${esc(item.points || 0)} Punkte</strong><small>${fmtDate(item.createdAt)}</small></div>`).join('') : '<div class="evs-empty">Keine Aktivität für diesen User.</div>'}
              </section>
            ` : `<div class="evs-empty">User-Report für ${esc(login)} wird geladen oder enthält noch keine Daten im aktuellen Event.</div>`}
          </div>
          <div class="evs-user-modal-footer">
            <span>${auto ? `AutoReload alle ${esc(Math.round((modal.intervalMs || 5000) / 1000))} Sekunden` : 'AutoReload aus'}${modal.lastRefreshAt ? ` · zuletzt: ${fmtDate(modal.lastRefreshAt)}` : ''}</span>
            <button type="button" class="evs-btn" data-evs-action="closeUserStatsModal">Schließen</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderOverlayTab(event){
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Overlay</h3><span>Vorschau und Anzeigeoptionen werden später hier getrennt eingebaut.</span></div>
          ${event ? statusBadge(event.status) : ''}
        </div>
        <div class="evs-empty">Overlay ist noch nicht Teil dieses Steps. Geplant: aktuelles Event, aktuelle Runde, Hinweise, Gewinner und Top 3.</div>
      </section>
    `;
  }

  function renderSelectEventEmpty(title){
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head"><h3>${esc(title)}</h3></div>
        <div class="evs-empty">Bitte zuerst in der Übersicht ein Event auswählen oder ein neues Event erstellen.</div>
      </section>
    `;
  }

  function attachMediaFields(scope){
    if (!scope) return;
    if (window.MediaField?.initAll) {
      window.MediaField.initAll(scope);
      scope.querySelectorAll('[data-media-field]').forEach(field => {
        const openLabel = field.dataset.openLabel || '';
        const clearLabel = field.dataset.clearLabel || '';
        const openBtn = field.querySelector('[data-media-field-open]');
        const clearBtn = field.querySelector('[data-media-field-clear]');
        if (openLabel && openBtn) openBtn.textContent = openLabel;
        if (clearLabel && clearBtn) clearBtn.textContent = clearLabel;
      });
      return;
    }
    scope.querySelectorAll('[data-media-field-preview]').forEach(preview => {
      preview.innerHTML = '<span class="mf-muted">Media-System-Komponente nicht geladen.</span>';
    });
  }

  function renderEventRow(event){
    const active = event.eventUid === state.selectedUid || (!state.selectedUid && event === state.events[0]);
    const sound = event.soundConfig || {};
    const text = event.textConfig || {};
    const snippets = Array.isArray(sound.snippets) ? sound.snippets.length : 0;
    const phrases = Array.isArray(text.phrases) ? text.phrases.length : 0;
    return `
      <button type="button" class="evs-event-row ${active ? 'is-active' : ''}" data-evs-select="${esc(event.eventUid)}">
        <span>
          <strong>${esc(event.name || 'Unbenanntes Event')}</strong>
          <small>${esc(eventTypes(event))} · Sounds ${esc(snippets)} · Sätze ${esc(phrases)} · geändert ${fmtDate(event.updatedAt)}</small>
        </span>
        ${statusBadge(event.status)}
      </button>
    `;
  }

  function renderEventDetail(event){
    const rankingRows = rows(state.ranking?.rows);
    return `
      <div class="evs-detail">
        <div class="evs-detail-title">
          <div>
            <h3>${esc(event.name || 'Unbenanntes Event')}</h3>
            <p>${esc(event.description || 'Keine Beschreibung.')}</p>
          </div>
        </div>

        <div class="evs-mini-grid">
          <div><strong>Spieltyp</strong><span>${esc(eventTypes(event))}</span></div>
          <div><strong>Erstellt</strong><span>${fmtDate(event.createdAt)}</span></div>
          <div><strong>Gestartet</strong><span>${fmtDate(event.startedAt)}</span></div>
          <div><strong>Beendet</strong><span>${fmtDate(event.finishedAt)}</span></div>
        </div>

        ${renderValidation(event)}

        <div class="evs-action-row">
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="edit" data-uid="${esc(event.eventUid)}">Bearbeiten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="validate" data-uid="${esc(event.eventUid)}">Prüfen</button>
          <button type="button" class="evs-btn" data-evs-action="start" data-uid="${esc(event.eventUid)}" ${event.status === 'ready' ? '' : 'disabled'}>Starten</button>
          <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="finish" data-uid="${esc(event.eventUid)}" ${event.status === 'active' ? '' : 'disabled'}>Beenden</button>
          <button type="button" class="evs-btn evs-btn-danger" data-evs-action="cancel" data-uid="${esc(event.eventUid)}" ${['draft','ready','active'].includes(norm(event.status)) ? '' : 'disabled'}>Abbrechen</button>
        </div>

        <div class="evs-ranking">
          <div class="evs-card-head evs-card-head-inner"><h3>Aktuelle Rangliste</h3><button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Neu laden</button></div>
          ${rankingRows.length ? rankingRows.slice(0, 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>'}
        </div>
      </div>
    `;
  }

  function modalEvent(){ return state.modal?.event || {}; }

  function renderPhraseEditor(phrase, index, total){
    const answerValue = Array.isArray(phrase.acceptedAnswers) ? phrase.acceptedAnswers.join(', ') : '';
    return `
      <section class="evs-phrase-row" data-evs-phrase-row data-index="${index}">
        <div class="evs-phrase-head">
          <div>
            <strong>Satz ${index + 1}</strong>
            <small>Komplette Lösung gewinnt · Teiltreffer werden aus den Wörtern dieses Satzes berechnet</small>
          </div>
          <button type="button" class="evs-icon-btn evs-icon-btn-danger" data-evs-action="removePhrase" data-index="${index}" ${total <= 1 ? 'disabled title="Mindestens ein Satz bleibt sichtbar"' : ''}>×</button>
        </div>
        <label>Geheimsatz<textarea data-evs-phrase-text rows="3" placeholder="z. B. Forrest und Engel machen Party...">${esc(phrase.phrase || phrase.text || phrase.solution || '')}</textarea></label>
        <div class="evs-two-cols evs-text-answers-points">
          <label>Erlaubte Antworten / Varianten <span class="evs-inline-optional">Optional</span><input data-evs-phrase-answers value="${esc(answerValue)}" placeholder="optional, z. B. forrest engel party, forrest und engel machen party"></label>
          <label>Punkte für komplette Lösung<input data-evs-phrase-points type="number" min="0" value="${esc(phrase.pointsFirst || phrase.points || 40)}"></label>
        </div>
      </section>
    `;
  }


  function textCategories(){
    const list = Array.isArray(state.texts?.categories) ? state.texts.categories : [];
    return list.length ? list : [{ id: 'general', label: 'Texte', key: 'general' }];
  }

  function textKeysForCategory(categoryId){
    const keys = Array.isArray(state.texts?.keys) ? state.texts.keys : [];
    return keys.filter(item => String(item.category || 'general') === String(categoryId || 'general'));
  }

  function renderTextVariant(variant, keyItem){
    const id = variant?.id || '';
    const value = variant?.value || variant?.text || '';
    const enabled = variant?.enabled !== false;
    const weight = variant?.weight || 1;
    return `
      <div class="evs-text-variant" data-evs-text-variant data-variant-id="${esc(id)}" data-text-key="${esc(keyItem.key)}" data-category="${esc(keyItem.category || 'general')}">
        <textarea rows="2" data-evs-text-value placeholder="Textvariante">${esc(value)}</textarea>
        <div class="evs-text-variant-actions">
          <label class="evs-check evs-check-compact"><input type="checkbox" data-evs-text-enabled ${enabled ? 'checked' : ''}> Aktiv</label>
          <label class="evs-mini-label">Gewichtung<input type="number" min="1" data-evs-text-weight value="${esc(weight)}"></label>
          <button type="button" class="evs-btn evs-btn-small" data-evs-action="saveTextVariant">Speichern</button>
          <button type="button" class="evs-btn evs-btn-small evs-btn-danger" data-evs-action="deleteTextVariant" ${id ? '' : 'disabled'}>Löschen</button>
        </div>
      </div>
    `;
  }

  function renderTextKeyEditor(keyItem){
    const variants = Array.isArray(keyItem.variants) && keyItem.variants.length ? keyItem.variants : [];
    const category = keyItem.category || 'general';
    return `
      <details class="evs-text-key" data-evs-text-key="${esc(keyItem.key)}" open>
        <summary>
          <span><strong>${esc(keyItem.key)}</strong><small>${esc(keyItem.activeCount || 0)} aktiv / ${esc(keyItem.totalCount || variants.length)} Varianten</small></span>
        </summary>
        <div class="evs-text-key-body">
          ${variants.map(v => renderTextVariant(v, keyItem)).join('') || '<div class="evs-empty">Noch keine Variante vorhanden.</div>'}
          <div class="evs-text-variant evs-text-variant-new" data-evs-text-new data-text-key="${esc(keyItem.key)}" data-category="${esc(category)}">
            <textarea rows="2" data-evs-text-value placeholder="Neue Variante hinzufügen"></textarea>
            <div class="evs-text-variant-actions">
              <label class="evs-check evs-check-compact"><input type="checkbox" data-evs-text-enabled checked> Aktiv</label>
              <label class="evs-mini-label">Gewichtung<input type="number" min="1" data-evs-text-weight value="1"></label>
              <button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="saveTextVariant">+ Variante speichern</button>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  function renderTextConfigPanel(asTab = false){
    const categories = textCategories();
    if (!state.texts) {
      return `
        <section class="evs-card glass evs-text-config-panel ${asTab ? 'evs-tab-panel' : ''}">
          <div class="evs-card-head"><h3>Text-Config / Multi-Texte</h3><button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="reloadTexts">Texte laden</button></div>
          <div class="evs-empty">Texte werden beim Aktualisieren geladen.</div>
        </section>
      `;
    }
    return `
      <section class="evs-card glass evs-text-config-panel ${asTab ? 'evs-tab-panel' : ''}">
        <div class="evs-card-head">
          <div>
            <h3>Text-Config / Multi-Texte</h3>
            <span>Chat- und Systemtexte für Eventmeldungen. Varianten können später zufällig genutzt werden.</span>
          </div>
          <button type="button" class="evs-btn evs-btn-small evs-btn-secondary" data-evs-action="reloadTexts">Texte neu laden</button>
        </div>
        <div class="evs-text-config-help">
          <strong>Vorbereitung:</strong> Diese Texte sind dashboardfähig und werden später von der Chat-Runtime genutzt. Platzhalter wie <code>{user}</code>, <code>{points}</code>, <code>{eventName}</code>, <code>{phraseNumber}</code> und <code>{wordCount}</code> bleiben im Text stehen.
        </div>
        <div class="evs-text-category-list">
          ${categories.map(cat => {
            const keys = textKeysForCategory(cat.id || cat.key);
            return `
              <details class="evs-text-category" open>
                <summary><strong>${esc(cat.label || cat.id || cat.key)}</strong><small>${esc(keys.length)} Text-Key(s)</small></summary>
                <div class="evs-text-category-body">
                  ${keys.length ? keys.map(renderTextKeyEditor).join('') : '<div class="evs-empty">Keine Texte in dieser Kategorie.</div>'}
                </div>
              </details>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderModal(){
    const event = modalEvent();
    const sound = event.soundConfig || {};
    const snippet = Array.isArray(sound.snippets) && sound.snippets[0] ? sound.snippets[0] : {};
    const text = event.textConfig || {};
    const phrases = Array.isArray(text.phrases) && text.phrases.length ? text.phrases : [{}];
    const partialMode = text.partialHintVisibility || text.partialHintDisplayMode || (text.hintTokensEnabled === false || text.partialHintsEnabled === false ? 'off' : (text.partialHintWithSentence === true ? 'with_sentence' : 'general'));
    const showPartialCount = text.showPartialCount === true || text.partialHintShowCount === true;
    const wordPointsEnabled = text.wordPointsEnabled === true;
    return `
      <div class="evs-modal-backdrop" data-evs-modal-close="1">
        <div class="evs-modal glass" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>${event.eventUid ? 'Event bearbeiten' : 'Neues Event'}</h3><p>Bearbeitung im eigenen Fenster. Grunddaten, Sound-Spiel und Text-Spiel gehören zu diesem Event.</p></div>
            <button type="button" class="evs-icon-btn" data-evs-action="closeModal">×</button>
          </div>
          <div class="evs-form">
            <label>Eventname<input id="evsEventName" value="${esc(event.name || '')}" placeholder="z. B. Serien-Intro-Abend"></label>
            <label>Beschreibung<textarea id="evsEventDescription" rows="2" placeholder="Kurze Info für dich und Mods">${esc(event.description || '')}</textarea></label>

            <div class="evs-choice-row">
              <label class="evs-check"><input id="evsSoundEnabled" type="checkbox" ${event.soundEnabled ? 'checked' : ''}> Sound-Snippet-Spiel</label>
              <label class="evs-check"><input id="evsTextEnabled" type="checkbox" ${event.textEnabled ? 'checked' : ''}> Text-/Geheimsatz-Spiel</label>
            </div>

            <details class="evs-config-box" ${event.soundEnabled ? 'open' : ''}>
              <summary>Sound-Spiel konfigurieren</summary>
              <div class="evs-two-cols evs-sound-rule-grid">
                <label>Antwortzeit in Sekunden<input id="evsSoundAnswerSeconds" type="number" min="5" value="${esc(sound.answerSeconds || sound.defaultAnswerSeconds || 20)}"></label>
                <label>Wenn nicht erkannt<select id="evsSoundUnresolvedPolicy"><option value="requeue_later" ${sound.unresolvedPolicy !== 'remove' ? 'selected' : ''}>Später nochmal versuchen</option><option value="remove" ${sound.unresolvedPolicy === 'remove' ? 'selected' : ''}>Für dieses Event entfernen</option></select></label>
              </div>

              <div class="evs-sound-media-grid">
                <section class="evs-sound-card evs-sound-card-required">
                  <div class="evs-sound-card-head">
                    <div>
                      <strong>Audio-Schnipsel</strong>
                      <small>Pflicht · das sollen die Zuschauer erraten</small>
                    </div>
                    <span class="evs-badge evs-badge-warn">Pflicht</span>
                  </div>
                  <label>Schnipsel-Name<input id="evsSnippetTitle" value="${esc(snippet.title || snippet.name || '')}" placeholder="z. B. Knight Rider"></label>
                  <label>Erlaubte Antworten, mit Komma getrennt<input id="evsSnippetAnswers" value="${esc((snippet.acceptedAnswers || []).join(', '))}" placeholder="knight rider, knightrider"></label>
                  <div class="evs-field-block">
                    <span class="evs-label">Audio aus Media-System</span>
                    <div class="evs-media-field evs-media-field-audio" data-media-field data-module-key="stream_events" data-category-key="sound_snippets" data-allowed-types="audio" data-title="Audio-Schnipsel auswählen oder hochladen" data-open-label="Audio-Schnipsel auswählen" data-clear-label="Entfernen" data-value-input="#evsSnippetMedia">
                      <input id="evsSnippetMedia" type="hidden" data-media-field-value value="${esc(snippet.mediaId || snippet.mediaPath || snippet.file || snippet.snippetMediaId || '')}">
                    </div>
                  </div>
                </section>

                <section class="evs-sound-card evs-sound-card-optional">
                  <div class="evs-sound-card-head">
                    <div>
                      <strong>Auflösungs-Video</strong>
                      <small>Optional · kann nach der Lösung gezeigt werden</small>
                    </div>
                    <span class="evs-badge evs-badge-muted">Optional</span>
                  </div>
                  <div class="evs-field-block">
                    <span class="evs-label">Video aus Media-System</span>
                    <div class="evs-media-field evs-media-field-video" data-media-field data-module-key="stream_events" data-category-key="reveal_videos" data-allowed-types="video,animation" data-title="Optionales Auflösungs-Video auswählen oder hochladen" data-open-label="Optionales Video auswählen" data-clear-label="Entfernen" data-value-input="#evsSnippetVideo">
                      <input id="evsSnippetVideo" type="hidden" data-media-field-value value="${esc(snippet.revealVideoMediaId || snippet.videoMediaId || '')}">
                    </div>
                    <small class="evs-help">Kann leer bleiben. Upload und Auswahl laufen über das vorhandene Media-System.</small>
                  </div>
                </section>
              </div>

              <small class="evs-help">Das Event speichert nur die Media-ID/Referenz. Wiedergabe und Upload bleiben beim vorhandenen Media-System.</small>
            </details>

            <details class="evs-config-box" ${event.textEnabled ? 'open' : ''}>
              <summary>Text-Spiel konfigurieren</summary>
              <div class="evs-text-simple">
                <div class="evs-text-rule-note">
                  <strong>Regel:</strong> Ein Text-Spiel kann mehrere geheime Sätze enthalten. Pro Satz gewinnt der erste komplette Löser. Danach ist nur dieser Satz erledigt und kommt aus der Rotation.
                </div>

                <div class="evs-form-row-head">
                  <div>
                    <strong>Geheime Sätze</strong>
                    <small>Pflicht · jeder Satz ist einzeln lösbar und kann eigene Antwortvarianten/Punkte haben</small>
                  </div>
                  <button type="button" class="evs-btn evs-btn-secondary evs-btn-small" data-evs-action="addPhrase">+ Satz hinzufügen</button>
                </div>

                <div class="evs-phrase-list">
                  ${phrases.map((item, index) => renderPhraseEditor(item, index, phrases.length)).join('')}
                </div>

                <div class="evs-partial-hints-box">
                  <div class="evs-form-row-head">
                    <div>
                      <strong>Teiltreffer & Wortpunkte</strong>
                      <small>Optional · User können Hinweise oder Punkte bekommen, wenn sie neue Wörter aus einem Satz treffen</small>
                    </div>
                    <span class="evs-badge evs-badge-muted">Optional</span>
                  </div>
                  <div class="evs-two-cols evs-text-config-grid">
                    <label>Teiltreffer melden<select id="evsTextPartialHintVisibility"><option value="off" ${partialMode === 'off' ? 'selected' : ''}>Nicht melden</option><option value="general" ${partialMode === 'general' ? 'selected' : ''}>Allgemein melden</option><option value="with_sentence" ${partialMode === 'with_sentence' ? 'selected' : ''}>Mit Satznummer melden</option></select></label>
                    <label>Zusätzlicher Cooldown in Sekunden<input id="evsTextPartialHintCooldown" type="number" min="0" value="${esc(text.partialHintCooldownSeconds ?? text.hintCooldownSeconds ?? 0)}"></label>
                  </div>
                  <div class="evs-choice-row evs-choice-row-compact">
                    <label class="evs-check evs-check-compact"><input id="evsTextShowPartialCount" type="checkbox" ${showPartialCount ? 'checked' : ''}> Anzahl gefundener Wörter anzeigen</label>
                    <label class="evs-check evs-check-compact"><input id="evsTextWordPointsEnabled" type="checkbox" ${wordPointsEnabled ? 'checked' : ''}> Punkte für gefundene Wörter</label>
                  </div>
                  <div class="evs-two-cols evs-text-config-grid">
                    <label>Punkte pro neues Wort<input id="evsTextPointsPerWord" type="number" min="0" value="${esc(text.pointsPerNewWord ?? text.wordPointsPerNewWord ?? 1)}"></label>
                    <label>Max. Wortpunkte pro User/Satz<input id="evsTextMaxWordPoints" type="number" min="0" value="${esc(text.maxWordPointsPerUserPhrase ?? text.maxWordPointsPerUserAndPhrase ?? 5)}"></label>
                  </div>
                  <small class="evs-help">Ein Wort zählt pro Event, Satz und User nur einmal. Wortpunkte sind optional und werden später in der Chat-Runtime umgesetzt.</small>
                </div>
              </div>
            </details>

            <div class="evs-modal-actions">
              <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="closeModal">Abbrechen</button>
              <button type="button" class="evs-btn" data-evs-action="saveEvent">Speichern</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function readModalPayload(){
    const soundEnabled = document.getElementById('evsSoundEnabled')?.checked === true;
    const textEnabled = document.getElementById('evsTextEnabled')?.checked === true;
    const payload = {
      name: document.getElementById('evsEventName')?.value || '',
      description: document.getElementById('evsEventDescription')?.value || '',
      soundEnabled,
      textEnabled
    };

    const snippetTitle = document.getElementById('evsSnippetTitle')?.value || '';
    const snippetMedia = document.getElementById('evsSnippetMedia')?.value || '';
    const snippetAnswers = splitCsv(document.getElementById('evsSnippetAnswers')?.value || '');
    const snippetVideo = document.getElementById('evsSnippetVideo')?.value || '';
    payload.soundConfig = {
      answerSeconds: Number(document.getElementById('evsSoundAnswerSeconds')?.value || 20),
      solvedPolicy: 'remove_from_rotation',
      unresolvedPolicy: document.getElementById('evsSoundUnresolvedPolicy')?.value || 'requeue_later',
      snippets: snippetTitle || snippetMedia || snippetAnswers.length ? [{ title: snippetTitle, mediaId: snippetMedia, acceptedAnswers: snippetAnswers, revealVideoMediaId: snippetVideo }] : []
    };

    const phraseRows = Array.from(document.querySelectorAll('[data-evs-phrase-row]'));
    const phrases = phraseRows.map(row => {
      const phraseText = row.querySelector('[data-evs-phrase-text]')?.value || '';
      const phraseAnswers = splitCsv(row.querySelector('[data-evs-phrase-answers]')?.value || '');
      const pointsFirst = Number(row.querySelector('[data-evs-phrase-points]')?.value || 40);
      return { phrase: phraseText, acceptedAnswers: phraseAnswers, pointsFirst, solvedPolicy: 'remove_from_rotation' };
    }).filter(item => item.phrase || item.acceptedAnswers.length);

    const partialHintVisibility = document.getElementById('evsTextPartialHintVisibility')?.value || 'off';
    const partialHintsEnabled = partialHintVisibility !== 'off';
    payload.textConfig = {
      allowFollowupSolves: false,
      winnerMode: 'first_complete_solver',
      solvedPolicy: 'remove_from_rotation',
      partialHintVisibility,
      partialHintDisplayMode: partialHintVisibility,
      hintTokensEnabled: partialHintsEnabled,
      partialHintsEnabled,
      partialHintMode: 'new_words_per_user',
      uniqueWordsPerUser: true,
      showPartialCount: document.getElementById('evsTextShowPartialCount')?.checked === true,
      wordPointsEnabled: document.getElementById('evsTextWordPointsEnabled')?.checked === true,
      pointsPerNewWord: Number(document.getElementById('evsTextPointsPerWord')?.value || 0),
      maxWordPointsPerUserPhrase: Number(document.getElementById('evsTextMaxWordPoints')?.value || 0),
      partialHintCooldownSeconds: Number(document.getElementById('evsTextPartialHintCooldown')?.value || 0),
      phrases
    };

    return payload;
  }

  function splitCsv(value){ return String(value || '').split(',').map(v => v.trim()).filter(Boolean); }

  function readConfigPayload(){
    return {
      config: {
        eventDefaults: {
          defaultTopWinners: Number(document.getElementById('evsCfgTopWinners')?.value || 3),
          allowOnlyOneActiveEvent: document.getElementById('evsCfgOneActive')?.checked !== false,
          overviewShowsOnlyRunningEvents: document.getElementById('evsCfgOverviewRunning')?.checked !== false
        },
        soundDefaults: {
          defaultAnswerSeconds: Number(document.getElementById('evsCfgSoundAnswerSeconds')?.value || 20),
          defaultPoints: Number(document.getElementById('evsCfgSoundPoints')?.value || 10),
          unresolvedPolicy: document.getElementById('evsCfgSoundUnresolved')?.value || 'requeue_later',
          avoidImmediateRepeat: document.getElementById('evsCfgSoundAvoidRepeat')?.checked !== false,
          revealVideoEnabled: document.getElementById('evsCfgRevealVideo')?.checked !== false
        },
        textDefaults: {
          defaultPhrasePoints: Number(document.getElementById('evsCfgTextPhrasePoints')?.value || 40),
          partialHintsEnabled: document.getElementById('evsCfgPartialHints')?.checked !== false,
          partialHintVisibility: document.getElementById('evsCfgPartialVisibility')?.value || 'general',
          showPartialWordCount: document.getElementById('evsCfgShowWordCount')?.checked !== false,
          uniqueWordPerUserPhrase: document.getElementById('evsCfgUniqueWords')?.checked !== false,
          wordPointsEnabled: document.getElementById('evsCfgWordPoints')?.checked === true,
          pointsPerNewWord: Number(document.getElementById('evsCfgPointsPerWord')?.value || 1),
          maxWordPointsPerUserPhrase: Number(document.getElementById('evsCfgMaxWordPoints')?.value || 5),
          partialHintCooldownSeconds: Number(document.getElementById('evsCfgPartialCooldown')?.value || 0)
        },
        overlayDefaults: {
          showTop3: document.getElementById('evsCfgOverlayTop3')?.checked !== false,
          showCurrentRound: document.getElementById('evsCfgOverlayRound')?.checked !== false,
          showPartialHints: document.getElementById('evsCfgOverlayHints')?.checked !== false
        }
      }
    };
  }

  async function saveConfig(){
    state.configSaving = true;
    state.error = '';
    try {
      state.config = await window.CGN.api(api.config, { method: 'POST', body: JSON.stringify(readConfigPayload()) });
      state.message = 'Config gespeichert.';
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.configSaving = false;
    }
  }

  async function loadAll(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    try {
      const [status, list, texts, config] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(api.texts),
        window.CGN.api(api.config)
      ]);
      state.status = status;
      state.events = rows(list);
      state.texts = texts;
      state.config = config;
      if (!state.selectedUid && state.events[0]) state.selectedUid = state.events[0].eventUid;
      const ev = selectedEvent();
      if (ev) {
        await loadRanking(ev.eventUid, false);
        await loadTextRuntimeReport(ev.eventUid, false);
        await loadStatisticsUsers(ev.eventUid, false);
      }
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function loadRanking(uid, rerender = true){
    if (!uid) return;
    try {
      state.ranking = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/ranking`);
    } catch (_) {
      state.ranking = null;
    }
    if (rerender) render();
  }


  async function loadSoundRuntimeReport(uid, rerender = true){
    try {
      const qs = uid ? `?eventUid=${encodeURIComponent(uid)}` : '';
      state.soundRuntimeReport = await window.CGN.api(`${api.soundRuntimeReport}${qs}`);
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  async function loadTextRuntimeReport(uid, rerender = true){
    if (!uid) return;
    try {
      state.textRuntimeReport = await window.CGN.api(`${api.textRuntimeReport}?eventUid=${encodeURIComponent(uid)}`);
    } catch (_) {
      state.textRuntimeReport = null;
    }
    if (rerender) render();
  }


  async function loadStatisticsUsers(uid, rerender = true){
    if (!uid) return;
    try {
      state.statisticsUsers = await window.CGN.api(`${api.statisticsUsers}?eventUid=${encodeURIComponent(uid)}`);
      const users = statisticsUsers();
      if (state.selectedStatsUser && !users.some(user => user.userLogin === state.selectedStatsUser)) {
        state.selectedStatsUser = '';
        state.userStatistics = null;
      }
    } catch (_) {
      state.statisticsUsers = null;
    }
    if (rerender) render();
  }


  let userStatsAutoTimer = null;

  function stopUserStatsAutoRefresh(){
    if (userStatsAutoTimer) clearInterval(userStatsAutoTimer);
    userStatsAutoTimer = null;
  }

  function startUserStatsAutoRefresh(){
    stopUserStatsAutoRefresh();
    const modal = state.userStatsModal || {};
    if (!modal.open || modal.autoRefresh === false || !modal.login) return;
    const intervalMs = Math.max(3000, Number(modal.intervalMs || 5000));
    userStatsAutoTimer = setInterval(() => refreshUserStatsModal(false), intervalMs);
  }

  async function openUserStatsModal(login, uid){
    const clean = norm(login).replace(/^@/, '');
    if (!clean) return;
    state.selectedStatsUser = clean;
    state.userStatsModal = { ...(state.userStatsModal || {}), open: true, login: clean, eventUid: uid || state.selectedUid || '', autoRefresh: state.userStatsModal?.autoRefresh !== false, intervalMs: state.userStatsModal?.intervalMs || 5000, lastScrollTop: 0 };
    await loadUserStatistics(clean, state.userStatsModal.eventUid, false);
    render();
    startUserStatsAutoRefresh();
  }

  function closeUserStatsModal(){
    stopUserStatsAutoRefresh();
    state.userStatsModal = { ...(state.userStatsModal || {}), open: false, lastScrollTop: 0 };
    render();
  }

  function preserveUserModalScroll(){
    const body = document.querySelector('[data-evs-user-modal-body]');
    if (body && state.userStatsModal) state.userStatsModal.lastScrollTop = body.scrollTop || 0;
  }

  function restoreUserModalScroll(){
    const body = document.querySelector('[data-evs-user-modal-body]');
    if (body && state.userStatsModal) body.scrollTop = Number(state.userStatsModal.lastScrollTop || 0);
  }

  async function refreshUserStatsModal(rerender = true){
    const modal = state.userStatsModal || {};
    if (!modal.open || !modal.login) return;
    preserveUserModalScroll();
    await loadUserStatistics(modal.login, modal.eventUid || state.selectedUid, false);
    if (state.userStatsModal) state.userStatsModal.lastRefreshAt = new Date().toISOString();
    if (rerender !== false) {
      render();
      restoreUserModalScroll();
    } else {
      render();
      restoreUserModalScroll();
    }
  }

  async function loadUserStatistics(login, uid, rerender = true){
    const clean = norm(login).replace(/^@/, '');
    if (!clean) { state.selectedStatsUser = ''; state.userStatistics = null; if (rerender) render(); return; }
    state.selectedStatsUser = clean;
    try {
      const qs = uid ? `?eventUid=${encodeURIComponent(uid)}` : '';
      state.userStatistics = await window.CGN.api(`${api.statisticsUser}/${encodeURIComponent(clean)}${qs}`);
    } catch (err) {
      state.error = err.message || String(err);
      state.userStatistics = null;
    }
    if (rerender) render();
  }

  async function loadEvent(uid){
    const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}`);
    state.selected = result.event;
    state.selectedUid = uid;
    return result.event;
  }

  async function saveEvent(){
    const current = state.modal?.event || {};
    const payload = readModalPayload();
    state.saving = true;
    state.error = '';
    try {
      const result = current.eventUid
        ? await window.CGN.api(`${api.events}/${encodeURIComponent(current.eventUid)}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await window.CGN.api(api.events, { method: 'POST', body: JSON.stringify(payload) });
      state.message = 'Event gespeichert.';
      state.modal = null;
      state.selectedUid = result.event?.eventUid || state.selectedUid;
      await loadAll(true);
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.saving = false;
    }
  }


  async function loadTexts(rerender = true){
    try {
      state.texts = await window.CGN.api(api.texts);
      if (rerender) render();
    } catch (err) {
      state.error = err.message || String(err);
      if (rerender) render();
    }
  }

  function readTextVariantPayload(row){
    if (!row) return null;
    const id = Number(row.dataset.variantId || 0) || 0;
    const key = row.dataset.textKey || '';
    const category = row.dataset.category || 'general';
    const value = row.querySelector('[data-evs-text-value]')?.value || '';
    const enabled = row.querySelector('[data-evs-text-enabled]')?.checked !== false;
    const weight = Number(row.querySelector('[data-evs-text-weight]')?.value || 1);
    if (!key) return null;
    return { action: 'saveVariant', variant: { id, key, category, value, enabled, weight } };
  }

  async function saveTextVariant(row){
    const payload = readTextVariantPayload(row);
    if (!payload) return;
    if (!String(payload.variant.value || '').trim()) {
      state.error = 'Textvariante darf nicht leer sein.';
      render();
      return;
    }
    state.textSaving = true;
    state.error = '';
    try {
      const result = await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify(payload) });
      state.texts = result.texts || result;
      state.message = 'Textvariante gespeichert.';
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    } finally {
      state.textSaving = false;
    }
  }

  async function deleteTextVariant(row){
    if (!row) return;
    const id = Number(row.dataset.variantId || 0) || 0;
    if (!id) return;
    if (!confirm('Textvariante wirklich löschen?')) return;
    try {
      const result = await window.CGN.api(api.texts, { method: 'POST', body: JSON.stringify({ action: 'deleteVariant', id }) });
      state.texts = result.texts || result;
      state.message = 'Textvariante gelöscht.';
      render();
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  async function eventAction(action, uid){
    if (!uid) return;
    if (action === 'start' && !confirm('Event wirklich starten? Es darf nur ein Event gleichzeitig laufen.')) return;
    if ((action === 'finish' || action === 'cancel') && !confirm(`Event wirklich ${action === 'finish' ? 'beenden' : 'abbrechen'}?`)) return;
    try {
      const result = await window.CGN.api(`${api.events}/${encodeURIComponent(uid)}/${action}`, { method: 'POST', body: '{}' });
      state.message = result.message || 'Aktion ausgeführt.';
      await loadAll(true);
    } catch (err) {
      state.error = err.message || String(err);
      render();
    }
  }

  function bind(){
    document.addEventListener('click', async ev => {
      const select = ev.target.closest('[data-evs-select]');
      if (select) {
        state.selectedUid = select.dataset.evsSelect;
        await loadEvent(state.selectedUid).catch(() => null);
        await loadRanking(state.selectedUid, false);
        await loadTextRuntimeReport(state.selectedUid, false);
        await loadSoundRuntimeReport(state.selectedUid, false);
        await loadStatisticsUsers(state.selectedUid, false);
        render();
        return;
      }
      const tab = ev.target.closest('[data-evs-tab]');
      if (tab) { state.activeTab = tab.dataset.evsTab || 'overview'; render(); return; }
      const btn = ev.target.closest('[data-evs-action]');
      if (!btn) return;
      const action = btn.dataset.evsAction;
      const uid = btn.dataset.uid || state.selectedUid;
      if (action === 'selectEvent') {
        state.selectedUid = uid;
        const targetTab = btn.dataset.targetTab || 'events';
        await loadEvent(uid).catch(() => null);
        await loadRanking(uid, false);
        await loadTextRuntimeReport(uid, false);
        await loadSoundRuntimeReport(uid, false);
        await loadStatisticsUsers(uid, false);
        state.activeTab = targetTab;
        render();
        return;
      }
      if (action === 'reload') return loadAll(true);
      if (action === 'reloadTexts') return loadTexts(true);
      if (action === 'saveConfig') return saveConfig();
      if (action === 'new') {
        const cfg = state.config?.config || {};
        const soundDefaults = cfg.soundDefaults || {};
        const textDefaults = cfg.textDefaults || {};
        state.modal = { event: {
          name: '',
          description: '',
          soundEnabled: true,
          textEnabled: false,
          soundConfig: { answerSeconds: soundDefaults.defaultAnswerSeconds || 20, unresolvedPolicy: soundDefaults.unresolvedPolicy || 'requeue_later', snippets: [] },
          textConfig: {
            partialHintsEnabled: textDefaults.partialHintsEnabled !== false,
            partialHintVisibility: textDefaults.partialHintVisibility || 'general',
            showPartialWordCount: textDefaults.showPartialWordCount !== false,
            wordPointsEnabled: textDefaults.wordPointsEnabled === true,
            pointsPerNewWord: textDefaults.pointsPerNewWord || 1,
            maxWordPointsPerUserPhrase: textDefaults.maxWordPointsPerUserPhrase || 5,
            partialHintCooldownSeconds: textDefaults.partialHintCooldownSeconds || 0,
            phrases: [{ phrase: '', acceptedAnswers: [], pointsFirst: textDefaults.defaultPhrasePoints || 40, solvedPolicy: 'remove_from_rotation' }]
          }
        } };
        render();
        return;
      }
      if (action === 'edit') { const event = await loadEvent(uid); state.modal = { event }; render(); return; }
      if (action === 'closeModal') { state.modal = null; render(); return; }
      if (action === 'addPhrase') {
        const payload = readModalPayload();
        const visibleRows = document.querySelectorAll('[data-evs-phrase-row]').length;
        while (payload.textConfig.phrases.length < visibleRows) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        state.modal.event = { ...(state.modal.event || {}), ...payload };
        render();
        return;
      }
      if (action === 'removePhrase') {
        const payload = readModalPayload();
        const visibleRows = document.querySelectorAll('[data-evs-phrase-row]').length;
        while (payload.textConfig.phrases.length < visibleRows) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        const index = Number(btn.dataset.index || -1);
        if (index >= 0 && payload.textConfig.phrases.length > 1) payload.textConfig.phrases.splice(index, 1);
        if (!payload.textConfig.phrases.length) payload.textConfig.phrases.push({ phrase: '', acceptedAnswers: [], pointsFirst: 40, solvedPolicy: 'remove_from_rotation' });
        state.modal.event = { ...(state.modal.event || {}), ...payload };
        render();
        return;
      }
      if (action === 'saveTextVariant') return saveTextVariant(btn.closest('[data-evs-text-variant], [data-evs-text-new]'));
      if (action === 'deleteTextVariant') return deleteTextVariant(btn.closest('[data-evs-text-variant]'));
      if (action === 'saveEvent') return saveEvent();
      if (action === 'validate') return eventAction('validate', uid);
      if (action === 'start') return eventAction('start', uid);
      if (action === 'finish') return eventAction('finish', uid);
      if (action === 'cancel') return eventAction('cancel', uid);
      if (action === 'ranking') return loadRanking(uid, true);
      if (action === 'runtimeReport') return loadTextRuntimeReport(uid, true);
      if (action === 'soundRuntimeReport') return loadSoundRuntimeReport(uid, true);
      if (action === 'statsUsers') return loadStatisticsUsers(uid, true);
      if (action === 'statsUser') return loadUserStatistics(btn.dataset.userLogin || state.selectedStatsUser, uid, true);
      if (action === 'openUserStats') return openUserStatsModal(btn.dataset.userLogin || state.selectedStatsUser, uid);
      if (action === 'refreshUserStatsModal') return refreshUserStatsModal(true);
      if (action === 'closeUserStatsModal') return closeUserStatsModal();
      if (action === 'toggleUserStatsAuto') { state.userStatsModal.autoRefresh = state.userStatsModal.autoRefresh === false; if (state.userStatsModal.autoRefresh) startUserStatsAutoRefresh(); else stopUserStatsAutoRefresh(); render(); return; }
    });

    document.addEventListener('click', ev => {
      if (ev.target.dataset?.evsModalClose === '1') {
        state.modal = null;
        render();
      }
      if (ev.target.dataset?.evsUserModalClose === '1') {
        closeUserStatsModal();
      }
    });

    document.addEventListener('change', async ev => {
      const select = ev.target.closest('[data-evs-user-stat-select]');
      if (!select) return;
      const uid = select.dataset.eventUid || state.selectedUid;
      await openUserStatsModal(select.value || '', uid);
    });

    window.addEventListener('cgn:module-show', ev => {
      if (ev.detail?.module === 'stream_events') loadAll(false);
    });
  }

  function init(){
    installIntoDashboard();
    root = document.getElementById('streamEventsModule');
    if (root) render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, loadAll, render };
})();
