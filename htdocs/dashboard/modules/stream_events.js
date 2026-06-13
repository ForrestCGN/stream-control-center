window.StreamEventsModule = (function(){
  'use strict';

  const api = {
    status: '/api/stream-events/status',
    list: '/api/stream-events/events?limit=250',
    events: '/api/stream-events/events'
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
    modal: null
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
            <div class="evs-kicker">EVS-4 · Media-System Vorbereitung</div>
            <h2>Event-System</h2>
            <p>Events vorbereiten, Sound/Text auswählen und Medien sauber über das vorhandene Media-System verknüpfen. Gameplay, Chat-Auswertung und Playback kommen später.</p>
          </div>
          <div class="evs-header-actions">
            <button type="button" class="evs-btn evs-btn-secondary" data-evs-action="reload">Aktualisieren</button>
            <button type="button" class="evs-btn" data-evs-action="new">Neues Event</button>
          </div>
        </div>

        ${state.error ? `<div class="evs-alert evs-alert-error">${esc(state.error)}</div>` : ''}
        ${state.message ? `<div class="evs-alert evs-alert-ok">${esc(state.message)}</div>` : ''}

        <div class="evs-grid">
          <section class="evs-card glass">
            <div class="evs-card-head">
              <h3>Vorbereitete Events</h3>
              <span>${state.events.length} Eintrag/Einträge</span>
            </div>
            <div class="evs-list">
              ${state.events.length ? state.events.map(renderEventRow).join('') : '<div class="evs-empty">Noch keine Events vorhanden.</div>'}
            </div>
          </section>

          <section class="evs-card glass">
            <div class="evs-card-head">
              <h3>Details</h3>
              ${ev ? statusBadge(ev.status) : ''}
            </div>
            ${ev ? renderEventDetail(ev) : '<div class="evs-empty">Wähle links ein Event aus oder erstelle ein neues.</div>'}
          </section>
        </div>

        ${state.modal ? renderModal() : ''}
      </div>
    `;
    attachMediaFields(root);
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
    return `
      <button type="button" class="evs-event-row ${active ? 'is-active' : ''}" data-evs-select="${esc(event.eventUid)}">
        <span>
          <strong>${esc(event.name || 'Unbenanntes Event')}</strong>
          <small>${esc(eventTypes(event))} · geändert ${fmtDate(event.updatedAt)}</small>
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

  function renderModal(){
    const event = modalEvent();
    const sound = event.soundConfig || {};
    const snippet = Array.isArray(sound.snippets) && sound.snippets[0] ? sound.snippets[0] : {};
    const text = event.textConfig || {};
    const phrase = Array.isArray(text.phrases) && text.phrases[0] ? text.phrases[0] : {};
    return `
      <div class="evs-modal-backdrop" data-evs-modal-close="1">
        <div class="evs-modal glass" role="dialog" aria-modal="true">
          <div class="evs-modal-head">
            <div><h3>${event.eventUid ? 'Event bearbeiten' : 'Neues Event'}</h3><p>Erst Sound und/oder Text auswählen, dann die gewählten Teile konfigurieren.</p></div>
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
              <label>Geheimsatz<textarea id="evsPhraseText" rows="2" placeholder="z. B. Forrest und Engel machen Party...">${esc(phrase.phrase || phrase.text || phrase.solution || '')}</textarea></label>
              <label>Erlaubte Antworten, mit Komma getrennt<input id="evsPhraseAnswers" value="${esc((phrase.acceptedAnswers || []).join(', '))}" placeholder="optional"></label>
              <div class="evs-two-cols">
                <label>Punkte erster Löser<input id="evsPhrasePoints" type="number" min="0" value="${esc(phrase.pointsFirst || phrase.points || 40)}"></label>
                <label>Weitere Löser Zeitfenster<input id="evsPhraseFollowupSeconds" type="number" min="0" value="${esc(text.followupSeconds || 60)}"></label>
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

    const phraseText = document.getElementById('evsPhraseText')?.value || '';
    const phraseAnswers = splitCsv(document.getElementById('evsPhraseAnswers')?.value || '');
    payload.textConfig = {
      followupSeconds: Number(document.getElementById('evsPhraseFollowupSeconds')?.value || 60),
      phrases: phraseText ? [{ phrase: phraseText, acceptedAnswers: phraseAnswers, pointsFirst: Number(document.getElementById('evsPhrasePoints')?.value || 40) }] : []
    };

    return payload;
  }

  function splitCsv(value){ return String(value || '').split(',').map(v => v.trim()).filter(Boolean); }

  async function loadAll(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    try {
      const [status, list] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.list)
      ]);
      state.status = status;
      state.events = rows(list);
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
      const btn = ev.target.closest('[data-evs-action]');
      if (!btn) return;
      const action = btn.dataset.evsAction;
      const uid = btn.dataset.uid || state.selectedUid;
      if (action === 'reload') return loadAll(true);
      if (action === 'new') { state.modal = { event: { name: '', description: '', soundEnabled: true, textEnabled: false, soundConfig: {}, textConfig: {} } }; render(); return; }
      if (action === 'edit') { const event = await loadEvent(uid); state.modal = { event }; render(); return; }
      if (action === 'closeModal') { state.modal = null; render(); return; }
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
