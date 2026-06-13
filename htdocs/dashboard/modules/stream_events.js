window.StreamEventsModule = (function(){
  'use strict';

  const api = {
    status: '/api/stream-events/status',
    list: '/api/stream-events/events?limit=250',
    events: '/api/stream-events/events',
    texts: '/api/stream-events/texts'
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

  function render(){
    root = document.getElementById('streamEventsModule');
    if (!root) return;
    const ev = selectedEvent();
    state.selected = ev;

    root.innerHTML = `
      <div class="evs-page">
        <div class="evs-header glass">
          <div>
            <div class="evs-kicker">EVS-7c · Event-Übersicht & Editor-Fenster</div>
            <h2>Event-System</h2>
            <p>Übersicht zeigt laufende Events. Die Event-Seite zeigt alle vorbereiteten Events mit Status. Bearbeitung öffnet sich im eigenen Fenster.</p>
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
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div>
            <h3>Event-System Config</h3>
            <span>Globale Einstellungen kommen in einen eigenen Bereich, getrennt von einzelnen Events.</span>
          </div>
        </div>
        <div class="evs-empty">Config ist für einen späteren Step vorbereitet. Geplant: Standardpunkte, Standard-Zeitlimits, Hinweisverhalten, Wortpunkte-Regeln, Overlay-Defaults und Rechte/Freigaben.</div>
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
    const rankingRows = rows(state.ranking?.rows);
    return `
      <section class="evs-card glass evs-tab-panel">
        <div class="evs-card-head">
          <div><h3>Statistik</h3><span>Ranking und spätere Auswertung für das ausgewählte Event.</span></div>
          ${event ? `<button type="button" class="evs-btn evs-btn-secondary" data-evs-action="ranking" data-uid="${esc(event.eventUid)}">Ranking laden</button>` : ''}
        </div>
        ${event ? (rankingRows.length ? rankingRows.slice(0, 10).map(row => `<div class="evs-rank-row"><strong>#${esc(row.rank)}</strong><span>${esc(row.userDisplayName || row.userLogin)}</span><b>${esc(row.points)} Punkte</b></div>`).join('') : '<div class="evs-empty">Noch keine Punkte.</div>') : '<div class="evs-empty">Kein Event ausgewählt.</div>'}
        <div class="evs-tab-help">Später: Auswertung pro Event, Sound-Statistik, Text-Statistik, gelöste Sätze, erkannte Schnipsel, Top-Spieler und Quoten.</div>
      </section>
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

  async function loadAll(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    try {
      const [status, list, texts] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list),
        window.CGN.api(api.texts)
      ]);
      state.status = status;
      state.events = rows(list);
      state.texts = texts;
      if (!state.selectedUid && state.events[0]) state.selectedUid = state.events[0].eventUid;
      const ev = selectedEvent();
      if (ev) await loadRanking(ev.eventUid, false);
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
        state.activeTab = targetTab;
        render();
        return;
      }
      if (action === 'reload') return loadAll(true);
      if (action === 'reloadTexts') return loadTexts(true);
      if (action === 'new') { state.modal = { event: { name: '', description: '', soundEnabled: true, textEnabled: false, soundConfig: {}, textConfig: {} } }; render(); return; }
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
    });

    document.addEventListener('click', ev => {
      if (ev.target.dataset?.evsModalClose === '1') {
        state.modal = null;
        render();
      }
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
