// STEP191 - Clip Dashboard: Textvarianten UX Cleanup mit verständlichen Labels und Platzhalter-Hinweisen.
window.ClipsModule = (function(){
  'use strict';

  const api = {
    status: '/api/clip/status',
    settings: '/api/clip/admin/settings',
    texts: '/api/clip/admin/texts',
    history: '/api/clip/history?limit=50'
  };

  let root = null;

  const TEXT_KEY_LABELS = {
    chatClipActivated: 'Chat: Clip-Sicherung gestartet',
    chatClipCreated: 'Chat: Twitch-Clip-Link ausgeben',
    chatClipFailed: 'Chat: Clip-Erstellung fehlgeschlagen',
    chatClipCreatedWithoutUrl: 'Chat: Clip erstellt, aber noch ohne URL',
    chatLocalReplayMissing: 'Chat: lokale Replay-Datei nicht gefunden',
    chatLocalReplayInvalidDir: 'Chat: Replay-Ordner ungültig',
    chatReplaySaved: 'Chat: lokaler Replay-Clip gespeichert',
    chatClipDuplicate: 'Chat: Clip bereits verarbeitet',

    discordClipPost: 'Discord: fertigen Clip posten',
    discordClipPartial: 'Discord: teilweise verarbeitet',
    discordClipFailed: 'Discord: Verarbeitung fehlgeschlagen',

    systemDisabled: 'System: Clip-System deaktiviert',
    systemBackendNotReady: 'System: Backend nicht bereit',
    systemTwitchScopeMissing: 'System: Twitch-Scope fehlt',
    systemObsReplayNotReady: 'System: OBS Replay nicht bereit',
    systemStreamNotLive: 'System: Stream ist nicht live'
  };

  const TEXT_KEY_HINTS = {
    chatClipActivated: 'Wird direkt nach dem Clip-Start als Chatmeldung genutzt.',
    chatClipCreated: 'Wird genutzt, wenn ein Twitch-Clip-Link verfügbar ist.',
    chatClipFailed: 'Wird genutzt, wenn Twitch oder Backend die Clip-Erstellung ablehnt.',
    chatClipCreatedWithoutUrl: 'Wird genutzt, wenn Twitch zwar eine Clip-ID liefert, aber noch keine fertige URL.',
    chatLocalReplayMissing: 'Wird genutzt, wenn keine passende lokale OBS-Replay-Datei gefunden wurde.',
    chatLocalReplayInvalidDir: 'Wird genutzt, wenn der konfigurierte Replay-Ordner ungültig ist.',
    chatReplaySaved: 'Wird genutzt, wenn der lokale OBS-Replay-Clip erfolgreich gesichert wurde.',
    chatClipDuplicate: 'Wird genutzt, wenn ein Clip schon verarbeitet wurde.',

    discordClipPost: 'Discord-Post für erfolgreich verarbeitete Clips.',
    discordClipPartial: 'Discord-Post, wenn Twitch/OBS/Discord nur teilweise erfolgreich waren.',
    discordClipFailed: 'Discord-Post, wenn die Clip-Verarbeitung fehlgeschlagen ist.',

    systemDisabled: 'Interner Systemtext, wenn das Clip-System deaktiviert ist.',
    systemBackendNotReady: 'Interner Systemtext, wenn Backend-Create blockiert ist.',
    systemTwitchScopeMissing: 'Interner Systemtext, wenn der OAuth-Scope clips:edit fehlt.',
    systemObsReplayNotReady: 'Interner Systemtext, wenn OBS Replay nicht bereit ist.',
    systemStreamNotLive: 'Interner Systemtext, wenn Clips nur live erlaubt sind.'
  };

  const TEXT_KEY_PLACEHOLDERS = {
    chatClipCreated: ['{clipUrl}', '{clipTitle}', '{gameName}', '{triggerUser}'],
    chatClipCreatedWithoutUrl: ['{clipTitle}', '{clipId}'],
    chatLocalReplayInvalidDir: ['{clipsDir}'],
    discordClipPost: ['{clipUrl}', '{clipTitle}', '{gameName}', '{triggerUser}'],
    discordClipPartial: ['{clipUrl}', '{clipTitle}', '{gameName}', '{triggerUser}', '{status}', '{reason}'],
    discordClipFailed: ['{clipTitle}', '{gameName}', '{triggerUser}', '{reason}'],
    systemStreamNotLive: ['{clipTitle}', '{gameName}', '{triggerUser}']
  };

  const SETTING_GROUPS = [
    {
      id: 'core',
      label: 'Basis',
      note: 'Normale Bedienung für den Clip-Flow.',
      keys: ['enabled', 'backendCreateEnabled', 'defaultClipTitle', 'includeGameInCustomTitle', 'saveHistory']
    },
    {
      id: 'obs',
      label: 'OBS Replay',
      note: 'OBS-Replay-Handling. Ziel bleibt 30 Sekunden vor und 30 Sekunden nach !clip.',
      keys: ['obsReplaySaveEnabled', 'obsReplaySaveDelayMs', 'localReplayRenameEnabled', 'localReplayRenameDelayMs', 'localReplayDir']
    },
    {
      id: 'discord',
      label: 'Discord',
      note: 'Discord läuft im Dashboard direkt über die DB-Channel-ID. JSON-Key bleibt nur Legacy/Fallback.',
      keys: ['discordPostEnabled', 'discordChannelId', 'postOnlyWhenLive']
    },
    {
      id: 'chat',
      label: 'Chat',
      note: 'Chat-Ausgaben, die Streamer.bot aus der Backend-Antwort nutzen kann.',
      keys: ['sendClipActivatedMessage', 'sendTwitchClipResultMessage', 'sendChatResponse']
    },
    {
      id: 'advanced',
      label: 'Erweitert',
      note: 'Technische Werte. Nur ändern, wenn du wirklich weißt, warum.',
      keys: ['obsReplayWindowSeconds', 'obsReplayPreTriggerSeconds', 'obsReplayPostTriggerSeconds', 'localReplayLookbackMinutes', 'twitchClipDurationSeconds', 'twitchClipPollMs', 'twitchClipPollMaxAttempts', 'duplicatePolicy']
    }
  ];

  let state = {
    status: null,
    settings: null,
    texts: null,
    history: null,
    loading: false,
    error: '',
    notice: '',
    tab: 'overview',
    textCategory: '',
    settingGroup: 'core',
    historyLimit: 50,
    selectedHistoryId: ''
  };

  function esc(v){
    return window.CGN?.esc
      ? window.CGN.esc(v)
      : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function arr(v){
    return Array.isArray(v) ? v : [];
  }

  function firstArray(...items){
    for (const item of items) {
      if (Array.isArray(item)) return item;
    }
    return [];
  }

  function settingsRows(){
    return firstArray(
      state.settings?.settings?.rows,
      state.settings?.settings,
      state.settings?.rows
    );
  }

  function historyRows(){
    return firstArray(
      state.history?.rows,
      state.history?.history?.rows,
      state.history?.items
    );
  }

  function textData(){
    return state.texts?.texts || state.texts || {};
  }

  function textCategories(){
    return firstArray(textData().categories, state.texts?.categories);
  }

  function textKeys(){
    return firstArray(textData().keys, state.texts?.keys);
  }

  function fmt(v){
    if (v === true) return 'Ja';
    if (v === false) return 'Nein';
    return v === undefined || v === null || v === '' ? '<span class="clips-muted">-</span>' : esc(v);
  }

  function boolBadge(value){
    const active = !!value;
    return `<span class="clips-badge ${active ? 'ok' : 'warn'}">${active ? 'Aktiv' : 'Inaktiv'}</span>`;
  }

  function statusBadge(ok, labelOk, labelBad){
    return `<span class="clips-badge ${ok ? 'ok' : 'bad'}">${esc(ok ? labelOk : labelBad)}</span>`;
  }

  function normalizeDate(v){
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString('de-DE');
  }

  function rowByKey(key){
    return settingsRows().find(r => r.key === key);
  }

  function getInputValue(row){
    const el = root?.querySelector(`[data-setting-input="${CSS.escape(row.key)}"]`);
    if (!el) return row.value;
    const raw = el.value;
    if (row.valueType === 'boolean') return raw === 'true';
    if (row.valueType === 'number') return Number(raw);
    if (row.valueType === 'json') {
      try { return JSON.parse(raw); }
      catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return raw;
  }

  async function loadAll(force){
    root = document.getElementById('clipsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.settings && state.texts && state.history) {
      render();
      return;
    }

    state.loading = true;
    state.error = '';
    state.notice = '';
    render();

    try {
      const [status, settings, texts, history] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.settings).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.texts).catch(err => ({ ok:false, error:err.message, texts:{ categories:[], keys:[] } })),
        window.CGN.api(api.history).catch(err => ({ ok:false, error:err.message, rows:[] }))
      ]);

      state = { ...state, status, settings, texts, history, loading:false, error:'' };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function saveSetting(key){
    const row = rowByKey(key);
    if (!row) return;
    const value = getInputValue(row);
    const settings = { [key]: value };

    if (key === 'discordChannelId') {
      settings.discordChannelMode = 'custom';
    }

    await window.CGN.api(api.settings, {
      method: 'POST',
      body: JSON.stringify({ settings })
    });
    state.notice = `Setting "${key}" gespeichert.`;
    await loadAll(true);
  }

  async function saveDiscordSettings(){
    const keys = ['discordPostEnabled', 'discordChannelId', 'postOnlyWhenLive'];
    const settings = { discordChannelMode: 'custom' };

    for (const key of keys) {
      const row = rowByKey(key);
      if (!row) continue;
      settings[key] = getInputValue(row);
    }

    await window.CGN.api(api.settings, {
      method: 'POST',
      body: JSON.stringify({ settings })
    });
    state.notice = 'Discord-Clip-Ziel gespeichert.';
    await loadAll(true);
  }

  function selectedTextCategory(){
    const cats = textCategories();
    if (!cats.length) return '';
    if (!state.textCategory || !cats.some(c => c.id === state.textCategory)) state.textCategory = cats[0].id;
    return state.textCategory;
  }

  function textKeyLabel(key){
    return TEXT_KEY_LABELS[key] || key;
  }

  function textKeyHint(key){
    return TEXT_KEY_HINTS[key] || 'Mehrere aktive Varianten sind möglich. Das Backend wählt zufällig eine aktive Variante.';
  }

  function textKeyPlaceholders(key){
    const values = TEXT_KEY_PLACEHOLDERS[key] || [];
    if (!values.length) return '';
    return values.map(value => `<code>${esc(value)}</code>`).join(' ');
  }

  async function saveVariant(id, key){
    const safeId = String(id || 'new');
    const textEl = root?.querySelector(`[data-variant-text="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const enabledEl = root?.querySelector(`[data-variant-enabled="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const weightEl = root?.querySelector(`[data-variant-weight="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    if (!textEl) return;

    await window.CGN.api(api.texts, {
      method: 'POST',
      body: JSON.stringify({
        action: 'saveVariant',
        variant: {
          id: id && id !== 'new' ? Number(id) : undefined,
          key,
          category: selectedTextCategory() || 'general',
          value: textEl.value,
          enabled: enabledEl ? enabledEl.checked : true,
          weight: weightEl ? Number(weightEl.value || 1) : 1
        }
      })
    });

    state.notice = `Textvariante für "${textKeyLabel(key)}" gespeichert.`;
    await loadAll(true);
  }

  async function addVariant(key){
    const el = root?.querySelector(`[data-new-variant="${CSS.escape(key)}"]`);
    const value = String(el?.value || '').trim();
    if (!value) throw new Error('Bitte zuerst einen neuen Text eintragen.');

    await window.CGN.api(api.texts, {
      method: 'POST',
      body: JSON.stringify({
        action: 'saveVariant',
        variant: {
          key,
          category: selectedTextCategory() || 'general',
          value,
          enabled: true,
          weight: 1
        }
      })
    });

    state.notice = `Neue Textvariante für "${textKeyLabel(key)}" hinzugefügt.`;
    await loadAll(true);
  }

  async function deleteVariant(id){
    if (!id) return;
    if (!window.confirm('Diese Textvariante wirklich löschen?')) return;

    await window.CGN.api(api.texts, {
      method: 'POST',
      body: JSON.stringify({ action:'deleteVariant', id:Number(id) })
    });

    state.notice = 'Textvariante gelöscht.';
    await loadAll(true);
  }

  function settingDisplayLabel(key){
    const labels = {
      enabled: 'Clip-System aktiv',
      backendCreateEnabled: 'Backend-Create aktiv',
      defaultClipTitle: 'Standard-Clip-Titel',
      includeGameInCustomTitle: 'Game an eigenen Titel anhängen',
      saveHistory: 'History speichern',

      obsReplaySaveEnabled: 'OBS Replay speichern',
      obsReplaySaveDelayMs: 'OBS Save-Delay in ms',
      localReplayRenameEnabled: 'Lokale Datei suchen/umbenennen',
      localReplayRenameDelayMs: 'Wartezeit nach OBS-Save in ms',
      localReplayDir: 'Replay-Ordner',

      discordPostEnabled: 'Discord-Post aktiv',
      discordChannelId: 'Discord Channel-ID',
      postOnlyWhenLive: 'Nur posten, wenn Stream live ist',

      sendClipActivatedMessage: 'Startmeldung senden',
      sendTwitchClipResultMessage: 'Ergebnisnachricht senden',
      sendChatResponse: 'Chatantworten aktiv',

      obsReplayWindowSeconds: 'Replay-Gesamtlänge',
      obsReplayPreTriggerSeconds: 'Sekunden vor !clip',
      obsReplayPostTriggerSeconds: 'Sekunden nach !clip',
      localReplayLookbackMinutes: 'Suchfenster lokale Datei',
      twitchClipDurationSeconds: 'Twitch Clip-Zielwert',
      twitchClipPollMs: 'Twitch Polling-Abstand',
      twitchClipPollMaxAttempts: 'Twitch Polling-Versuche',
      duplicatePolicy: 'Duplikat-Regel'
    };
    return labels[key] || key;
  }

  function settingHelpText(key, row){
    const hints = {
      enabled: 'Schaltet das Clip-System grundsätzlich ein oder aus.',
      backendCreateEnabled: 'Wenn aktiv, darf das Backend Twitch-Clip, Discord-Post und OBS-Replay zentral steuern.',
      defaultClipTitle: 'Fallback, wenn kein eigener Titel, Streamtitel oder Game gefunden wird.',
      includeGameInCustomTitle: 'Bei !clip eigener Titel wird das Game angehängt, z. B. Titel | Spiel.',
      saveHistory: 'Schreibt Clip-Läufe in die History-Tabelle.',

      obsReplaySaveEnabled: 'Speichert zusätzlich zum Twitch-Clip einen lokalen OBS-Replay-Clip.',
      obsReplaySaveDelayMs: 'Delay nach !clip bis SaveReplayBuffer. 30000 ms = 30 Sekunden Nachlauf.',
      localReplayRenameEnabled: 'Sucht die frische OBS-Datei und benennt sie passend um.',
      localReplayRenameDelayMs: 'Wartezeit nach SaveReplayBuffer, bevor die Datei gesucht wird.',
      localReplayDir: 'Ordner, in dem OBS ReplayBuffer-Dateien landen.',

      discordPostEnabled: 'Postet fertige Clips in Discord.',
      discordChannelId: 'Direkte Discord Channel-ID. Wird in der DB gespeichert.',
      postOnlyWhenLive: 'Wenn aktiv, wird nur bei Live-Stream nach Discord gepostet.',

      sendClipActivatedMessage: 'Backend liefert eine Startmeldung für den Chat zurück.',
      sendTwitchClipResultMessage: 'Backend liefert eine Ergebnisnachricht mit Clip-Link zurück.',
      sendChatResponse: 'Aktiviert Chatantworten aus dem Backend grundsätzlich.',

      duplicatePolicy: 'Technische Duplikat-Regel: ignore, update oder allow.'
    };
    return hints[key] || row?.description || '';
  }

  function renderSettingInput(row){
    const key = row.key || '';
    const value = row.rawValue ?? row.value ?? '';

    if (row.valueType === 'boolean') {
      return `<select data-setting-input="${esc(key)}">
        <option value="true" ${row.value === true ? 'selected' : ''}>Aktiv</option>
        <option value="false" ${row.value === false ? 'selected' : ''}>Inaktiv</option>
      </select>`;
    }

    if (key === 'discordChannelMode') {
      return `<select data-setting-input="${esc(key)}">
        <option value="key" ${String(value) === 'key' ? 'selected' : ''}>Key aus discord_channels.json</option>
        <option value="custom" ${String(value) === 'custom' ? 'selected' : ''}>Direkte Channel-ID</option>
      </select>`;
    }

    if (key === 'duplicatePolicy') {
      return `<select data-setting-input="${esc(key)}">
        ${['ignore', 'update', 'allow'].map(v => `<option value="${v}" ${String(value) === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select>`;
    }

    if (row.valueType === 'json') {
      return `<textarea data-setting-input="${esc(key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    }

    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-setting-input="${esc(key)}" type="${type}" value="${esc(value)}">`;
  }

  function renderReadinessList(items){
    return `<div class="clips-readiness-list">${items.map(item => `
      <article class="clips-readiness-item ${item.ok ? 'ok' : 'bad'}">
        <div><strong>${esc(item.title)}</strong><span>${esc(item.sub || '')}</span></div>
        ${statusBadge(item.ok, item.good || 'OK', item.bad || 'Fehler')}
      </article>
    `).join('')}</div>`;
  }

  function renderOverview(){
    const status = state.status || {};
    const cfg = status.config || {};
    const twitch = status.twitchApi || {};
    const obs = status.obsReplay || {};
    const discord = status.discord || {};
    const backend = status.backendCreate || {};
    const db = status.database || {};
    const channel = status.channelInfo || {};

    const blockers = arr(backend.blockers);

    return `
      <div class="clips-grid">
        <section class="clips-card clips-card-main">
          <div class="clips-card-head">
            <div>
              <h3>Status</h3>
              <p>Clip-System, Backend-Create, Twitch, OBS Replay und Discord auf einen Blick.</p>
            </div>
            ${boolBadge(status.enabled)}
          </div>

          <div class="clips-kpis">
            <div><strong>${backend.ready ? 'Bereit' : 'Blockiert'}</strong><span>Backend Create</span></div>
            <div><strong>${twitch.readyForCreateClip ? 'OK' : 'Nein'}</strong><span>Twitch clips:edit</span></div>
            <div><strong>${obs.readyForBackendSave ? 'OK' : 'Nein'}</strong><span>OBS Replay</span></div>
            <div><strong>${discord.readyForPost ? 'OK' : 'Nein'}</strong><span>Discord</span></div>
          </div>

          ${blockers.length ? `<div class="clips-blockers"><strong>Blocker:</strong> ${blockers.map(esc).join(', ')}</div>` : '<div class="clips-okline">Keine Backend-Create-Blocker gemeldet.</div>'}

          <div class="clips-rows">
            <div><span>Schema</span><strong>${fmt(status.schemaVersion)}</strong></div>
            <div><span>Datenbank</span><strong>${fmt(db.table || db.historyTable || 'clip_history')}</strong></div>
            <div><span>Stream</span><strong>${channel.is_live === true ? 'Live' : channel.is_live === false ? 'Offline' : 'Unbekannt'}</strong></div>
            <div><span>Game</span><strong>${fmt(channel.game_name)}</strong></div>
            <div><span>Titel</span><strong>${fmt(channel.title)}</strong></div>
          </div>
        </section>

        <section class="clips-card">
          <h3>Readiness</h3>
          ${renderReadinessList([
            { title:'Twitch API', sub:twitch.login || twitch.userId || '', ok:!!twitch.readyForCreateClip, good:'bereit', bad:'nicht bereit' },
            { title:'OBS Replay Buffer', sub:`Delay: ${fmt(obs.configuredPostTriggerDelayMs)} ms`, ok:!!obs.readyForBackendSave, good:'bereit', bad:'nicht bereit' },
            { title:'Discord Bridge', sub:`${discord.discordChannelMode || '-'} / ${discord.discordChannelKey || discord.discordChannelId || '-'}`, ok:!!discord.readyForPost, good:'bereit', bad:'nicht bereit' },
            { title:'DB-Texte', sub:cfg.messagesFromDbPrepared ? 'module_text_variants vorbereitet' : 'Fallback/Helper fehlt', ok:!!cfg.messagesFromDbPrepared, good:'DB', bad:'prüfen' },
            { title:'DB-Settings', sub:cfg.settingsTable || 'clip_settings', ok:!!cfg.settingsFromDbPrepared, good:'DB', bad:'prüfen' }
          ])}
        </section>
      </div>`;
  }

  function renderSettings(){
    const list = settingsRows();
    const group = SETTING_GROUPS.find(g => g.id === state.settingGroup) || SETTING_GROUPS[0];
    const visible = group.keys.map(k => list.find(r => r.key === k)).filter(Boolean);

    return `
      <section class="clips-card">
        <div class="clips-card-head">
          <div>
            <h3>Settings</h3>
            <p>DB-Settings aus dem Backend bearbeiten. Normale Ansicht zeigt nur die wirklich relevanten Felder.</p>
          </div>
        </div>

        <div class="clips-subtabs">
          ${SETTING_GROUPS.map(g => `<button type="button" class="${state.settingGroup === g.id ? 'active' : ''}" data-clips-setting-group="${esc(g.id)}">${esc(g.label)}</button>`).join('')}
        </div>

        ${group.note ? `<div class="clips-setting-note">${esc(group.note)}</div>` : ''}

        <div class="clips-setting-list">
          ${visible.map(row => `
            <article class="clips-setting-row ${row.key && row.key.startsWith('discord') ? 'is-discord' : ''}">
              <div class="clips-setting-info">
                <strong>${esc(settingDisplayLabel(row.key))}</strong>
                <span>${esc(row.key)} · ${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span>
                <small>${esc(settingHelpText(row.key, row))}</small>
              </div>
              <div class="clips-setting-input">${renderSettingInput(row)}</div>
              <button type="button" data-save-setting="${esc(row.key)}">Speichern</button>
            </article>
          `).join('')}
        </div>

        ${state.settingGroup === 'discord' ? `
          <div class="clips-discord-savebar">
            <button type="button" data-save-discord-settings>Discord-Ziel speichern</button>
            <span>Speichert Discord aktiv, direkte Channel-ID und Live-only. JSON-Key bleibt nur Legacy/Fallback/Import.</span>
          </div>
        ` : ''}

        ${!visible.length ? '<div class="clips-empty">Keine Settings in dieser Gruppe gefunden.</div>' : ''}
      </section>`;
  }

  function renderTexts(){
    const cats = textCategories();
    const selected = selectedTextCategory();
    const keys = textKeys().filter(item => !selected || item.category === selected);

    return `
      <section class="clips-card">
        <div class="clips-card-head">
          <div>
            <h3>Textvarianten</h3>
            <p>Texte werden DB-basiert verwaltet. Pro Textbereich können mehrere aktive Varianten existieren; das Backend wählt zufällig.</p>
          </div>
        </div>

        <div class="clips-text-toolbar">
          <label>Kategorie
            <select data-text-category>
              ${cats.map(cat => `<option value="${esc(cat.id)}" ${cat.id === selected ? 'selected' : ''}>${esc(cat.label || cat.id)} (${esc(cat.keyCount ?? cat.count ?? 0)} Bereiche / ${esc(cat.variantCount ?? 0)} Varianten)</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="clips-text-list">
          ${keys.map(item => {
            const placeholders = textKeyPlaceholders(item.key);
            return `
              <article class="clips-text-row">
                <div class="clips-text-head">
                  <div>
                    <strong>${esc(textKeyLabel(item.key))}</strong>
                    <small><code>${esc(item.key)}</code></small>
                    <p>${esc(textKeyHint(item.key))}</p>
                    ${placeholders ? `<div class="clips-placeholder-list"><span>Platzhalter:</span> ${placeholders}</div>` : ''}
                  </div>
                  <span>${esc(item.activeCount || 0)} aktiv / ${esc(item.totalCount || item.variants?.length || 0)} Varianten</span>
                </div>

                <div class="clips-new-variant clips-new-variant-top">
                  <textarea data-new-variant="${esc(item.key)}" placeholder="Neue Textvariante eintragen..." spellcheck="false"></textarea>
                  <button type="button" data-add-variant="${esc(item.key)}">Neue Variante speichern</button>
                </div>

                <div class="clips-variant-list">
                  ${arr(item.variants).map(variant => `
                    <div class="clips-variant-row">
                      <textarea data-variant-text="${esc(variant.id)}" data-variant-key="${esc(item.key)}" spellcheck="false">${esc(variant.value ?? variant.text ?? '')}</textarea>
                      <div class="clips-variant-meta">
                        <label><input type="checkbox" data-variant-enabled="${esc(variant.id)}" data-variant-key="${esc(item.key)}" ${variant.enabled ? 'checked' : ''}> Aktiv</label>
                        <label>Gewicht <input type="number" min="1" max="99" data-variant-weight="${esc(variant.id)}" data-variant-key="${esc(item.key)}" value="${esc(variant.weight || 1)}"></label>
                        <span>${esc(variant.source || '')}</span>
                        <span>ID ${esc(variant.id || '')}</span>
                      </div>
                      <div class="clips-row-actions">
                        <button type="button" data-save-variant="${esc(variant.id)}" data-variant-key="${esc(item.key)}">Speichern</button>
                        <button type="button" class="danger" data-delete-variant="${esc(variant.id)}">Löschen</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </article>`;
          }).join('')}
        </div>

        ${!keys.length ? '<div class="clips-empty">Keine Texte in dieser Kategorie.</div>' : ''}
      </section>`;
  }


  function pick(row, ...keys){
    for (const key of keys) {
      const value = row?.[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function clipStatusLabel(status){
    const value = String(status || '').toLowerCase();
    if (value === 'created') return 'Erstellt';
    if (value === 'failed') return 'Fehler';
    if (value === 'skipped') return 'Übersprungen';
    if (value === 'pending') return 'Wartet';
    if (value === 'processing') return 'Läuft';
    return status || '-';
  }

  function clipStatusClass(status){
    const value = String(status || '').toLowerCase();
    if (value === 'created') return 'ok';
    if (value === 'failed') return 'bad';
    if (value === 'skipped') return 'warn';
    if (value === 'pending' || value === 'processing') return 'muted';
    return 'muted';
  }

  function renderStatusBadge(status){
    return `<span class="clips-badge ${clipStatusClass(status)}">${esc(clipStatusLabel(status))}</span>`;
  }

  function renderBoolState(value, labelTrue, labelFalse, error){
    if (error) return `<span class="clips-badge bad" title="${esc(error)}">Fehler</span>`;
    return value ? `<span class="clips-badge ok">${esc(labelTrue || 'OK')}</span>` : `<span class="clips-badge muted">${esc(labelFalse || 'Offen')}</span>`;
  }

  function selectedHistoryRow(){
    const list = historyRows();
    if (!list.length) return null;
    if (!state.selectedHistoryId) return list[0];
    return list.find(row => String(row.id || row.jobId || row.clipId || '') === String(state.selectedHistoryId)) || list[0];
  }

  function renderDetailRow(label, value){
    return `<div><span>${esc(label)}</span><strong>${fmt(value)}</strong></div>`;
  }

  function renderHistoryDetails(row){
    if (!row) return '<section class="clips-card"><div class="clips-empty">Kein Clip ausgewählt.</div></section>';

    const clipUrl = pick(row, 'clipUrl', 'clip_url');
    const editUrl = pick(row, 'twitchEditUrl', 'twitch_edit_url');
    const localPath = pick(row, 'localReplayPath', 'localReplayFile', 'localReplayPath', 'local_file_path', 'localFilePath');
    const reason = pick(row, 'reason', 'error', 'lastError');
    const discordError = pick(row, 'discordError', 'discord_error');
    const obsError = pick(row, 'obsReplayError', 'obs_replay_error');
    const localError = pick(row, 'localReplayError', 'local_replay_error');
    const jobId = pick(row, 'jobId', 'job_id');

    return `
      <section class="clips-card clips-history-detail">
        <div class="clips-card-head">
          <div>
            <h3>Clip-Details</h3>
            <p>${fmt(pick(row, 'clipTitle', 'clip_title', 'title'))}</p>
          </div>
          <div class="clips-detail-actions">
            <button type="button" disabled title="Backend-Route für Repost fehlt noch.">Repost vorbereitet</button>
            <button type="button" disabled title="Backend-Route für Retry fehlt noch.">Retry vorbereitet</button>
          </div>
        </div>

        <div class="clips-detail-summary">
          <div>${renderStatusBadge(pick(row, 'status', 'twitchStatus', 'twitch_status'))}<span>Status</span></div>
          <div>${renderBoolState(Boolean(pick(row, 'discordPosted', 'discord_posted')), 'Gepostet', 'Nicht gepostet', discordError)}<span>Discord</span></div>
          <div>${renderBoolState(Boolean(pick(row, 'obsReplaySaved', 'obs_replay_saved')), 'Gespeichert', 'Nicht gespeichert', obsError)}<span>OBS Replay</span></div>
          <div>${renderBoolState(Boolean(pick(row, 'localReplaySaved', 'local_replay_saved')), 'Gefunden', 'Offen', localError)}<span>Lokale Datei</span></div>
        </div>

        ${(reason || discordError || obsError || localError) ? `
          <div class="clips-detail-errors">
            ${reason ? `<div><strong>Grund:</strong> ${esc(reason)}</div>` : ''}
            ${discordError ? `<div><strong>Discord:</strong> ${esc(discordError)}</div>` : ''}
            ${obsError ? `<div><strong>OBS:</strong> ${esc(obsError)}</div>` : ''}
            ${localError ? `<div><strong>Lokal:</strong> ${esc(localError)}</div>` : ''}
          </div>
        ` : ''}

        <div class="clips-detail-grid">
          ${renderDetailRow('ID', pick(row, 'id'))}
          ${renderDetailRow('Job-ID', jobId)}
          ${renderDetailRow('Twitch Clip-ID', pick(row, 'clipId', 'clip_id'))}
          ${renderDetailRow('Titel', pick(row, 'clipTitle', 'clip_title', 'title'))}
          ${renderDetailRow('Eigener Titel', pick(row, 'customTitle', 'custom_title'))}
          ${renderDetailRow('Streamtitel', pick(row, 'streamTitle', 'stream_title'))}
          ${renderDetailRow('Spiel', pick(row, 'gameName', 'game_name'))}
          ${renderDetailRow('Ausgelöst von', pick(row, 'triggerUser', 'trigger_user', 'triggerLogin', 'trigger_login'))}
          ${renderDetailRow('Quelle', pick(row, 'sourceMethod', 'source_method'))}
          ${renderDetailRow('Erstellt', normalizeDate(pick(row, 'createdAt', 'created_at')))}
          ${renderDetailRow('Aktualisiert', normalizeDate(pick(row, 'updatedAt', 'updated_at')))}
          ${renderDetailRow('OBS angefragt', normalizeDate(pick(row, 'obsReplayRequestedAt', 'obs_replay_requested_at')))}
          ${renderDetailRow('Lokal umbenannt', normalizeDate(pick(row, 'localReplayRenamedAt', 'local_replay_renamed_at')))}
          ${renderDetailRow('Lokale Datei', localPath)}
        </div>

        <div class="clips-detail-links">
          ${clipUrl ? `<a href="${esc(clipUrl)}" target="_blank" rel="noopener">Twitch Clip öffnen</a>` : ''}
          ${editUrl ? `<a href="${esc(editUrl)}" target="_blank" rel="noopener">Twitch Edit öffnen</a>` : ''}
          ${localPath ? `<span title="${esc(localPath)}">Lokale Datei vorhanden</span>` : ''}
          ${jobId ? `<span>Job-ID: ${esc(jobId)}</span>` : '<span>Keine Job-ID vorhanden</span>'}
        </div>
      </section>`;
  }

  function renderHistory(){
    const list = historyRows();
    const selected = selectedHistoryRow();

    return `
      <div class="clips-history-layout">
        <section class="clips-card">
          <div class="clips-card-head">
            <div>
              <h3>History</h3>
              <p>Letzte Clip-Verarbeitungen. Eine Zeile auswählen, um Details zu sehen.</p>
            </div>
            <button type="button" data-clips-refresh-history>History aktualisieren</button>
          </div>

          ${list.length ? `
            <div class="clips-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Zeit</th>
                    <th>Titel</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>OBS</th>
                    <th>Discord</th>
                    <th>Links</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map(row => {
                    const rowKey = String(row.id || row.jobId || row.clipId || '');
                    const selectedClass = selected && String(selected.id || selected.jobId || selected.clipId || '') === rowKey ? 'is-selected' : '';
                    const clipUrl = pick(row, 'clipUrl', 'clip_url');
                    const editUrl = pick(row, 'twitchEditUrl', 'twitch_edit_url');
                    const localPath = pick(row, 'localReplayPath', 'localReplayFile', 'local_file_path', 'localFilePath');
                    return `
                      <tr class="clips-history-row ${selectedClass}" data-history-id="${esc(rowKey)}">
                        <td>${esc(normalizeDate(pick(row, 'createdAt', 'created_at', 'updatedAt', 'updated_at')))}</td>
                        <td>
                          <strong>${fmt(pick(row, 'clipTitle', 'clip_title', 'title'))}</strong>
                          <small>${fmt(pick(row, 'gameName', 'game_name'))}</small>
                        </td>
                        <td>${fmt(pick(row, 'triggerUser', 'trigger_user', 'triggerLogin', 'trigger_login'))}</td>
                        <td>${renderStatusBadge(pick(row, 'status', 'twitchStatus', 'twitch_status'))}</td>
                        <td>${renderBoolState(Boolean(pick(row, 'obsReplaySaved', 'obs_replay_saved')), 'saved', 'offen', pick(row, 'obsReplayError', 'obs_replay_error'))}</td>
                        <td>${renderBoolState(Boolean(pick(row, 'discordPosted', 'discord_posted')), 'posted', 'offen', pick(row, 'discordError', 'discord_error'))}</td>
                        <td class="clips-link-cell">
                          ${clipUrl ? `<a href="${esc(clipUrl)}" target="_blank" rel="noopener">Clip</a>` : ''}
                          ${editUrl ? `<a href="${esc(editUrl)}" target="_blank" rel="noopener">Edit</a>` : ''}
                          ${localPath ? `<span title="${esc(localPath)}">Lokal</span>` : ''}
                        </td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="clips-empty">Keine Clip-History gefunden.</div>'}
        </section>

        ${renderHistoryDetails(selected)}
      </div>`;
  }

  function render(){
    root = document.getElementById('clipsModule');
    if (!root) return;

    const tabs = [
      ['overview', 'Übersicht'],
      ['settings', 'Settings'],
      ['texts', 'Texte'],
      ['history', 'History']
    ];

    root.innerHTML = `
      <div class="clips-admin-wrap">
        <section class="clips-card clips-hero">
          <div>
            <h2>✂️ Clips</h2>
            <p>Clip-System verwalten: Status, Readiness, DB-Settings, Textvarianten, Discord-Ziel und History.</p>
          </div>
          <div class="clips-actions">
            <button type="button" data-clips-refresh>Aktualisieren</button>
          </div>
        </section>

        ${state.error ? `<div class="clips-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="clips-notice">${esc(state.notice)}</div>` : ''}

        ${state.loading ? '<div class="clips-card">Lade Clip-Daten...</div>' : `
          <div class="clips-tabs">
            ${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-clips-tab="${id}">${label}</button>`).join('')}
          </div>

          ${state.tab === 'settings' ? renderSettings() : state.tab === 'texts' ? renderTexts() : state.tab === 'history' ? renderHistory() : renderOverview()}
        `}
      </div>`;

    bind();
  }

  function bind(){
    root?.querySelector('[data-clips-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelector('[data-clips-refresh-history]')?.addEventListener('click', async () => {
      try {
        state.history = await window.CGN.api(api.history);
        render();
      } catch (err) {
        state.error = err.message || String(err);
        render();
      }
    });

    root?.querySelectorAll('[data-history-id]').forEach(row => {
      row.addEventListener('click', ev => {
        if (ev.target && String(ev.target.tagName || '').toLowerCase() === 'a') return;
        state.selectedHistoryId = row.dataset.historyId || '';
        render();
      });
    });

    root?.querySelectorAll('[data-clips-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tab = btn.dataset.clipsTab || 'overview';
        render();
      });
    });

    root?.querySelectorAll('[data-clips-setting-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.settingGroup = btn.dataset.clipsSettingGroup || 'core';
        render();
      });
    });

    root?.querySelectorAll('[data-save-setting]').forEach(btn => {
      btn.addEventListener('click', () => saveSetting(btn.dataset.saveSetting).catch(err => {
        state.error = err.message || String(err);
        render();
      }));
    });

    root?.querySelector('[data-save-discord-settings]')?.addEventListener('click', () => {
      saveDiscordSettings().catch(err => {
        state.error = err.message || String(err);
        render();
      });
    });

    root?.querySelector('[data-text-category]')?.addEventListener('change', ev => {
      state.textCategory = ev.target.value;
      render();
    });

    root?.querySelectorAll('[data-save-variant]').forEach(btn => {
      btn.addEventListener('click', () => saveVariant(btn.dataset.saveVariant, btn.dataset.variantKey).catch(err => {
        state.error = err.message || String(err);
        render();
      }));
    });

    root?.querySelectorAll('[data-add-variant]').forEach(btn => {
      btn.addEventListener('click', () => addVariant(btn.dataset.addVariant).catch(err => {
        state.error = err.message || String(err);
        render();
      }));
    });

    root?.querySelectorAll('[data-delete-variant]').forEach(btn => {
      btn.addEventListener('click', () => deleteVariant(btn.dataset.deleteVariant).catch(err => {
        state.error = err.message || String(err);
        render();
      }));
    });
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'clips') loadAll(false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('clipsModule'); });
  } else {
    root = document.getElementById('clipsModule');
  }

  return { loadAll, render };
})();
