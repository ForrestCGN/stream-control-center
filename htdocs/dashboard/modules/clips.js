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
    chatClipActivated: 'Clip gestartet',
    chatClipCreated: 'Twitch-Clip erstellt',
    chatClipFailed: 'Clip fehlgeschlagen',
    chatClipCreatedWithoutUrl: 'Clip ohne URL',
    chatLocalReplayMissing: 'Replay fehlt',
    chatLocalReplayInvalidDir: 'Replay-Ordner ungültig',
    chatReplaySaved: 'Replay gespeichert',
    chatClipDuplicate: 'Doppelter Clip',
    discordClipPost: 'Discord-Clip-Post',
    discordClipPartial: 'Discord Teilstatus',
    discordClipFailed: 'Discord Fehlerpost',
    systemDisabled: 'System deaktiviert',
    systemBackendNotReady: 'Backend nicht bereit',
    systemTwitchScopeMissing: 'Twitch-Scope fehlt',
    systemObsReplayNotReady: 'OBS Replay nicht bereit',
    systemStreamNotLive: 'Stream nicht live'
  };

  const TEXT_KEY_HINTS = {
    chatClipActivated: 'Chat-Antwort direkt nach !clip. Platzhalter je nach Flow möglich.',
    chatClipCreated: 'Chat-Antwort mit Twitch-Clip-Link. Platzhalter: {clipUrl}, {clipTitle}, {gameName}, {triggerUser}.',
    chatClipFailed: 'Chat-Antwort, wenn der Twitch-Clip nicht erstellt werden konnte.',
    chatReplaySaved: 'Chat-Antwort, wenn der lokale OBS-Replay-Clip gespeichert wurde.',
    discordClipPost: 'Discord-Nachricht für vollständige Clips. Platzhalter: {clipUrl}, {clipTitle}, {gameName}, {triggerUser}.',
    discordClipPartial: 'Discord-Nachricht bei Teil-Erfolg. Platzhalter: {status}, {reason}, {clipUrl}.',
    discordClipFailed: 'Discord-Nachricht bei fehlgeschlagener Verarbeitung.',
    systemStreamNotLive: 'Systemtext, wenn Clip-Erstellung nur live erlaubt ist.'
  };

  const SETTING_GROUPS = [
    {
      id: 'core',
      label: 'Basis',
      keys: ['enabled', 'backendCreateEnabled', 'defaultClipTitle', 'includeGameInCustomTitle', 'saveHistory', 'duplicatePolicy']
    },
    {
      id: 'twitch',
      label: 'Twitch',
      keys: ['twitchClipDurationSeconds', 'twitchClipPollMs', 'twitchClipPollMaxAttempts']
    },
    {
      id: 'obs',
      label: 'OBS Replay',
      keys: ['obsReplaySaveEnabled', 'obsReplayWindowSeconds', 'obsReplayPreTriggerSeconds', 'obsReplayPostTriggerSeconds', 'obsReplaySaveDelayMs', 'localReplayRenameEnabled', 'localReplayRenameDelayMs', 'localReplayDir', 'localReplayLookbackMinutes']
    },
    {
      id: 'discord',
      label: 'Discord',
      keys: ['discordPostEnabled', 'discordChannelMode', 'discordChannelKey', 'discordChannelId', 'postOnlyWhenLive']
    },
    {
      id: 'chat',
      label: 'Chat-Ausgaben',
      keys: ['sendClipActivatedMessage', 'sendTwitchClipResultMessage', 'sendChatResponse']
    },
    {
      id: 'advanced',
      label: 'Erweitert',
      keys: ['messagesPath']
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
    historyLimit: 50
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
    await window.CGN.api(api.settings, {
      method: 'POST',
      body: JSON.stringify({ key, value })
    });
    state.notice = `Setting "${key}" gespeichert.`;
    await loadAll(true);
  }

  async function saveDiscordSettings(){
    const keys = ['discordChannelMode', 'discordChannelKey', 'discordChannelId', 'discordPostEnabled', 'postOnlyWhenLive'];
    for (const key of keys) {
      const row = rowByKey(key);
      if (!row) continue;
      const value = getInputValue(row);
      await window.CGN.api(api.settings, {
        method: 'POST',
        body: JSON.stringify({ key, value })
      });
    }
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
    const keyed = group.keys.map(k => list.find(r => r.key === k)).filter(Boolean);
    const rest = list.filter(r => !SETTING_GROUPS.some(g => g.keys.includes(r.key)));
    const visible = group.id === 'advanced' ? keyed.concat(rest) : keyed;

    return `
      <section class="clips-card">
        <div class="clips-card-head">
          <div>
            <h3>Settings</h3>
            <p>DB-Settings aus dem Backend bearbeiten. Keine direkten Datei- oder DB-Zugriffe im Dashboard.</p>
          </div>
        </div>

        <div class="clips-subtabs">
          ${SETTING_GROUPS.map(g => `<button type="button" class="${state.settingGroup === g.id ? 'active' : ''}" data-clips-setting-group="${esc(g.id)}">${esc(g.label)}</button>`).join('')}
        </div>

        <div class="clips-setting-list">
          ${visible.map(row => `
            <article class="clips-setting-row ${row.key && row.key.startsWith('discord') ? 'is-discord' : ''}">
              <div class="clips-setting-info">
                <strong>${esc(row.key)}</strong>
                <span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span>
                <small>${esc(row.description || '')}</small>
              </div>
              <div class="clips-setting-input">${renderSettingInput(row)}</div>
              <button type="button" data-save-setting="${esc(row.key)}">Speichern</button>
            </article>
          `).join('')}
        </div>

        ${state.settingGroup === 'discord' ? `
          <div class="clips-discord-savebar">
            <button type="button" data-save-discord-settings>Discord-Ziel komplett speichern</button>
            <span>Speichert Mode, Key, direkte Channel-ID, Discord aktiv und Live-only zusammen.</span>
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
            <p>Kategorisiert wie Tagebuch/Todo: Kategorie wählen, Text-Key öffnen, Varianten bearbeiten.</p>
          </div>
        </div>

        <div class="clips-text-toolbar">
          <label>Kategorie
            <select data-text-category>
              ${cats.map(cat => `<option value="${esc(cat.id)}" ${cat.id === selected ? 'selected' : ''}>${esc(cat.label || cat.id)} (${esc(cat.keyCount ?? cat.count ?? 0)} Keys / ${esc(cat.variantCount ?? 0)} Varianten)</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="clips-text-list">
          ${keys.map(item => `
            <article class="clips-text-row">
              <div class="clips-text-head">
                <div>
                  <strong>${esc(textKeyLabel(item.key))}</strong>
                  <small>${esc(item.key)} · ${esc(textKeyHint(item.key))}</small>
                </div>
                <span>${esc(item.activeCount || 0)} aktiv / ${esc(item.totalCount || item.variants?.length || 0)} Varianten</span>
              </div>

              <div class="clips-variant-list">
                ${arr(item.variants).map(variant => `
                  <div class="clips-variant-row">
                    <textarea data-variant-text="${esc(variant.id)}" data-variant-key="${esc(item.key)}" spellcheck="false">${esc(variant.value ?? variant.text ?? '')}</textarea>
                    <div class="clips-variant-meta">
                      <label><input type="checkbox" data-variant-enabled="${esc(variant.id)}" data-variant-key="${esc(item.key)}" ${variant.enabled ? 'checked' : ''}> Aktiv</label>
                      <label>Gewicht <input type="number" min="1" max="99" data-variant-weight="${esc(variant.id)}" data-variant-key="${esc(item.key)}" value="${esc(variant.weight || 1)}"></label>
                      <span>${esc(variant.source || '')}</span>
                    </div>
                    <div class="clips-row-actions">
                      <button type="button" data-save-variant="${esc(variant.id)}" data-variant-key="${esc(item.key)}">Speichern</button>
                      <button type="button" class="danger" data-delete-variant="${esc(variant.id)}">Löschen</button>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="clips-new-variant">
                <textarea data-new-variant="${esc(item.key)}" placeholder="Neue Variante für ${esc(textKeyLabel(item.key))} hinzufügen..." spellcheck="false"></textarea>
                <button type="button" data-add-variant="${esc(item.key)}">Variante hinzufügen</button>
              </div>
            </article>
          `).join('')}
        </div>

        ${!keys.length ? '<div class="clips-empty">Keine Texte in dieser Kategorie.</div>' : ''}
      </section>`;
  }

  function renderHistory(){
    const list = historyRows();

    return `
      <section class="clips-card">
        <div class="clips-card-head">
          <div>
            <h3>History</h3>
            <p>Letzte Clip-Verarbeitungen aus dem Backend. Details/Repost können später auf dieser Basis ergänzt werden.</p>
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
                  <th>Twitch</th>
                  <th>OBS</th>
                  <th>Discord</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(row => `
                  <tr>
                    <td>${esc(normalizeDate(row.created_at || row.createdAt || row.updated_at || row.updatedAt || ''))}</td>
                    <td>
                      <strong>${fmt(row.clip_title || row.clipTitle || row.title)}</strong>
                      <small>${fmt(row.game_name || row.gameName)}</small>
                    </td>
                    <td>${fmt(row.trigger_user || row.triggerUser || row.trigger_login || row.triggerLogin)}</td>
                    <td>${fmt(row.twitch_status || row.twitchStatus || row.status)}</td>
                    <td>${row.obs_replay_saved || row.obsReplaySaved ? '<span class="clips-badge ok">saved</span>' : row.obs_replay_error || row.obsReplayError ? '<span class="clips-badge bad">error</span>' : '<span class="clips-badge muted">offen</span>'}</td>
                    <td>${row.discord_posted || row.discordPosted ? '<span class="clips-badge ok">posted</span>' : row.discord_error || row.discordError ? '<span class="clips-badge bad">error</span>' : '<span class="clips-badge muted">offen</span>'}</td>
                    <td class="clips-link-cell">
                      ${row.clip_url || row.clipUrl ? `<a href="${esc(row.clip_url || row.clipUrl)}" target="_blank" rel="noopener">Clip</a>` : ''}
                      ${row.twitch_edit_url || row.twitchEditUrl ? `<a href="${esc(row.twitch_edit_url || row.twitchEditUrl)}" target="_blank" rel="noopener">Edit</a>` : ''}
                      ${row.local_file_path || row.localFilePath ? `<span title="${esc(row.local_file_path || row.localFilePath)}">Lokal</span>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="clips-empty">Keine Clip-History gefunden.</div>'}
      </section>`;
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
