window.ChannelpointsModule = (function(){
  'use strict';

  const api = {
    status: '/api/channelpoints/status',
    categories: '/api/channelpoints/categories',
    rewards: '/api/channelpoints/rewards',
    model: '/api/channelpoints/model',
    mediaPlan: '/api/channelpoints/media-plan',
    dbStatus: '/api/channelpoints/db-status',
    busTest: '/api/channelpoints/bus-test'
  };

  const ACTION_TYPES = [
    { id: 'manual', label: 'Manuell', hint: 'Nur lokal verwalten, keine automatische Ausführung.' },
    { id: 'streamerbot_action', label: 'Streamer.bot Action', hint: 'Später Streamer.bot-Action/Bridge auslösen.' },
    { id: 'backend_route', label: 'Backend Route', hint: 'Lokale API-Route ausführen.' },
    { id: 'bus_event', label: 'Communication Bus Event', hint: 'Event an andere Module senden.' },
    { id: 'media', label: 'Media-System', hint: 'Sound/Bild/Video über vorhandenes Media-System.' },
    { id: 'overlay', label: 'Overlay', hint: 'Overlay-Aktion vorbereiten.' },
    { id: 'multi_action', label: 'Multi-Action', hint: 'Später mehrere Schritte nacheinander.' }
  ];

  const state = {
    loading: false,
    error: '',
    notice: '',
    tab: 'overview',
    query: '',
    categoryFilter: 'all',
    statusFilter: 'all',
    actionFilter: 'all',
    status: null,
    categories: [],
    rewards: [],
    selectedKey: '',
    selected: null,
    busResult: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function registerDashboardModule() {
    if (!window.CGN) return;
    window.CGN.modules.channelpoints = {
      title: 'Kanalpunkte',
      panelId: 'channelpointsModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.ChannelpointsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.channelpoints = {
      label: 'Kanalpunkte',
      icon: '🟣',
      enabled: true,
      description: 'Twitch-Kanalpunkte lokal verwalten; Twitch-Sync folgt später.'
    };
    const communityItems = window.CGN.sections?.community?.items;
    if (Array.isArray(communityItems) && !communityItems.includes('channelpoints')) {
      const idx = communityItems.indexOf('commands');
      if (idx >= 0) communityItems.splice(idx, 0, 'channelpoints');
      else communityItems.push('channelpoints');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('channelpoints')) {
      window.CGN.favorites.push('channelpoints');
    }
  }

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function rewards() { return asArray(state.rewards); }
  function categories() { return asArray(state.categories); }

  function boolValue(value) {
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }

  function pill(label, mode) {
    return `<span class="cp-pill ${esc(mode || '')}">${esc(label)}</span>`;
  }

  function statusPills(reward) {
    return [
      reward.system_enabled ? pill('lokal aktiv', 'ok') : pill('lokal aus', 'off'),
      reward.is_paused ? pill('pausiert', 'warn') : pill('bereit', 'neutral'),
      reward.twitch_is_enabled ? pill('Twitch aktiv', 'warn') : pill('Twitch aus', 'neutral')
    ].join('');
  }

  function actionMeta(type) {
    return ACTION_TYPES.find(item => item.id === type) || ACTION_TYPES[0];
  }

  function categoryByKey(key) {
    return categories().find(cat => String(cat.category_key) === String(key)) || null;
  }

  function selectedReward() {
    const list = filteredRewards();
    const all = rewards();
    if (!all.length) return null;
    if (state.selected && !state.selected.id) return state.selected;
    if (state.selectedKey) {
      const found = all.find(item => String(item.reward_key) === state.selectedKey || String(item.id) === state.selectedKey);
      if (found) return found;
    }
    const fallback = list[0] || all[0];
    state.selectedKey = String(fallback.reward_key || fallback.id || '');
    return fallback;
  }

  function categoryOptions(selected) {
    const cats = categories();
    if (!cats.length) return '<option value="general">Allgemein</option>';
    return cats.map(cat => `<option value="${esc(cat.category_key)}" ${cat.category_key === selected ? 'selected' : ''}>${esc(cat.label || cat.category_key)}</option>`).join('');
  }

  function filterOptions() {
    const categoryItems = ['<option value="all">Alle Kategorien</option>']
      .concat(categories().map(cat => `<option value="${esc(cat.category_key)}" ${state.categoryFilter === cat.category_key ? 'selected' : ''}>${esc(cat.label || cat.category_key)}</option>`));
    const actionItems = ['<option value="all">Alle Aktionen</option>']
      .concat(ACTION_TYPES.map(type => `<option value="${esc(type.id)}" ${state.actionFilter === type.id ? 'selected' : ''}>${esc(type.label)}</option>`));
    return { categoryItems: categoryItems.join(''), actionItems: actionItems.join('') };
  }

  function filteredRewards() {
    const q = String(state.query || '').trim().toLowerCase();
    return rewards().filter(reward => {
      if (state.categoryFilter !== 'all' && String(reward.category_key) !== state.categoryFilter) return false;
      if (state.actionFilter !== 'all' && String(reward.action_type || 'manual') !== state.actionFilter) return false;
      if (state.statusFilter === 'enabled' && !boolValue(reward.system_enabled)) return false;
      if (state.statusFilter === 'disabled' && boolValue(reward.system_enabled)) return false;
      if (state.statusFilter === 'paused' && !boolValue(reward.is_paused)) return false;
      if (q) {
        const haystack = [
          reward.reward_key,
          reward.title,
          reward.prompt,
          reward.category_key,
          reward.action_type,
          reward.action_key,
          reward.notes
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function getField(name) { return root?.querySelector(`[data-cp-field="${name}"]`); }

  function readForm() {
    const payloadRaw = String(getField('action_payload_json')?.value || '').trim();
    let actionPayload = {};
    if (payloadRaw) {
      try { actionPayload = JSON.parse(payloadRaw); }
      catch (err) { throw new Error(`Action-Payload JSON ungültig: ${err.message}`); }
    }

    return {
      reward_key: String(getField('reward_key')?.value || '').trim(),
      title: String(getField('title')?.value || '').trim(),
      prompt: String(getField('prompt')?.value || '').trim(),
      cost: Number(getField('cost')?.value || 0),
      category_key: String(getField('category_key')?.value || 'general').trim(),
      sort_order: Number(getField('sort_order')?.value || 100),
      system_enabled: !!getField('system_enabled')?.checked,
      is_paused: !!getField('is_paused')?.checked,
      require_user_input: !!getField('require_user_input')?.checked,
      input_label: String(getField('input_label')?.value || '').trim(),
      action_type: String(getField('action_type')?.value || 'manual').trim(),
      action_key: String(getField('action_key')?.value || '').trim(),
      action_payload_json: JSON.stringify(actionPayload),
      media_asset_id: String(getField('media_asset_id')?.value || '').trim(),
      media_role: String(getField('media_role')?.value || 'none').trim(),
      queue_mode: String(getField('queue_mode')?.value || 'none').trim(),
      priority: Number(getField('priority')?.value || 0),
      cooldown_seconds: Number(getField('cooldown_seconds')?.value || 0),
      max_per_stream: Number(getField('max_per_stream')?.value || 0),
      max_per_user_per_stream: Number(getField('max_per_user_per_stream')?.value || 0),
      auto_fulfill: !!getField('auto_fulfill')?.checked,
      notes: String(getField('notes')?.value || '').trim()
    };
  }

  function blankReward() {
    return {
      reward_key: '',
      title: '',
      prompt: '',
      cost: 100,
      category_key: 'general',
      sort_order: 100,
      system_enabled: true,
      twitch_is_enabled: false,
      is_paused: false,
      require_user_input: false,
      input_label: '',
      action_type: 'manual',
      action_key: '',
      action_payload_json: '{}',
      media_asset_id: '',
      media_role: 'none',
      queue_mode: 'none',
      priority: 0,
      cooldown_seconds: 0,
      max_per_stream: 0,
      max_per_user_per_stream: 0,
      auto_fulfill: false,
      notes: ''
    };
  }

  async function loadAll(force) {
    root = document.getElementById('channelpointsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, cats, rewardsRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.categories),
        window.CGN.api(api.rewards)
      ]);
      state.status = status;
      state.categories = asArray(cats.categories);
      state.rewards = asArray(rewardsRes.rewards);
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function saveReward() {
    const payload = readForm();
    if (!payload.reward_key) throw new Error('reward_key fehlt.');
    if (!payload.title) throw new Error('Titel fehlt.');
    if (!Number.isFinite(payload.cost) || payload.cost < 1) throw new Error('Kosten müssen mindestens 1 sein.');

    const exists = rewards().some(item => String(item.reward_key) === payload.reward_key);
    const url = exists ? `${api.rewards}/${encodeURIComponent(payload.reward_key)}` : api.rewards;
    const method = exists ? 'PUT' : 'POST';

    const result = await window.CGN.api(url, { method, body: JSON.stringify(payload) });
    state.notice = exists ? 'Reward lokal aktualisiert.' : 'Reward lokal erstellt.';
    state.selectedKey = result.reward?.reward_key || payload.reward_key;
    state.selected = null;
    await loadAll(true);
  }

  async function disableReward(key) {
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/disable`, { method: 'POST', body: '{}' });
    state.notice = 'Reward lokal deaktiviert. Twitch wird in STEP495 nicht verändert.';
    state.selectedKey = key;
    state.selected = null;
    await loadAll(true);
  }

  async function enableReward(key) {
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/enable`, { method: 'POST', body: '{}' });
    state.notice = 'Reward lokal aktiviert. Twitch wird in STEP495 nicht verändert.';
    state.selectedKey = key;
    state.selected = null;
    await loadAll(true);
  }

  async function runBusTest() {
    const data = await window.CGN.api(`${api.busTest}?message=dashboard`);
    state.busResult = data;
    state.notice = 'Bus-Test ausgeführt.';
    await loadAll(true);
  }

  function setTab(tab) {
    state.tab = tab;
    render();
  }

  function renderHeader() {
    return `
      <div class="cp-header">
        <div>
          <p class="cp-kicker">Kanalpunkte-System</p>
          <h2>Twitch-Kanalpunkte</h2>
          <p>Gleiches Bedienmuster wie Commands: suchen, filtern, links auswählen, rechts bearbeiten.</p>
        </div>
        <div class="cp-header-actions">
          <button type="button" data-cp-action="reload">Neu laden</button>
        </div>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = [
      ['overview', 'Übersicht'],
      ['rewards', 'Rewards'],
      ['categories', 'Kategorien'],
      ['actions', 'Aktionen'],
      ['media', 'Medien'],
      ['redemptions', 'Einlösungen'],
      ['twitch', 'Twitch Sync']
    ];
    return `
      <div class="cp-tabs" role="tablist">
        ${tabs.map(([id, label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cp-tab="${id}">${esc(label)}</button>`).join('')}
      </div>
    `;
  }

  function renderToolbar() {
    const filters = filterOptions();
    return `
      <section class="cp-toolbar">
        <label>Suche
          <input data-cp-control="query" type="search" placeholder="Reward, Key, Kategorie, Aktion suchen..." value="${esc(state.query)}">
        </label>
        <label>Kategorie
          <select data-cp-control="categoryFilter">${filters.categoryItems}</select>
        </label>
        <label>Status
          <select data-cp-control="statusFilter">
            <option value="all" ${state.statusFilter === 'all' ? 'selected' : ''}>Alle Status</option>
            <option value="enabled" ${state.statusFilter === 'enabled' ? 'selected' : ''}>Lokal aktiv</option>
            <option value="disabled" ${state.statusFilter === 'disabled' ? 'selected' : ''}>Lokal aus</option>
            <option value="paused" ${state.statusFilter === 'paused' ? 'selected' : ''}>Pausiert</option>
          </select>
        </label>
        <label>Aktion
          <select data-cp-control="actionFilter">${filters.actionItems}</select>
        </label>
        <button type="button" data-cp-action="new">Neuer Reward</button>
      </section>
    `;
  }

  function renderOverview() {
    const status = state.status || {};
    const localState = status.localState || {};
    const bus = status.bus || {};
    const activeCount = rewards().filter(item => boolValue(item.system_enabled)).length;
    const pausedCount = rewards().filter(item => boolValue(item.is_paused)).length;
    return `
      <div class="cp-grid cp-stats">
        <div class="cp-card"><small>Backend</small><strong>${esc(status.moduleVersion || '-')}</strong><span>${esc(status.mode || '-')}</span></div>
        <div class="cp-card"><small>Rewards</small><strong>${esc(localState.rewardCount ?? rewards().length)}</strong><span>${activeCount} lokal aktiv · ${pausedCount} pausiert</span></div>
        <div class="cp-card"><small>Kategorien</small><strong>${esc(localState.categoryCount ?? categories().length)}</strong><span>lokal aus DB</span></div>
        <div class="cp-card"><small>Bus</small><strong>${bus.registered ? 'OK' : 'Nein'}</strong><span>${esc(bus.subscriptionCount ?? 0)} Subscription(s)</span></div>
      </div>
      <div class="cp-note">
        <strong>Dashboard-Muster:</strong> Kanalpunkte und Commands sollen gleich aufgebaut sein. Links Suche/Liste, rechts Detailbearbeitung. Twitch-Schreibaktionen bleiben deaktiviert.
      </div>
    `;
  }

  function renderRewardList() {
    const list = filteredRewards();
    return `
      <section class="cp-panel cp-list-panel">
        <div class="cp-panel-head">
          <h3>Rewards</h3>
          <span>${list.length}/${rewards().length}</span>
        </div>
        <div class="cp-reward-list">
          ${list.map(reward => {
            const action = actionMeta(reward.action_type || 'manual');
            const cat = categoryByKey(reward.category_key);
            return `
              <button type="button" class="cp-reward ${state.selectedKey === reward.reward_key ? 'active' : ''}" data-cp-select="${esc(reward.reward_key)}">
                <span>
                  <strong>${esc(reward.title || reward.reward_key)}</strong>
                  <small>${esc(reward.reward_key)} · ${esc(reward.cost)} Punkte · ${esc(cat?.label || reward.category_key || '-')}</small>
                </span>
                <span class="cp-reward-flags">
                  ${pill(action.label, 'neutral')}
                  ${statusPills(reward)}
                </span>
              </button>
            `;
          }).join('') || '<div class="cp-empty">Keine Rewards für diesen Filter.</div>'}
        </div>
      </section>
    `;
  }

  function renderCategories() {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head"><h3>Kategorien</h3><span>${categories().length} Einträge</span></div>
        <div class="cp-category-grid">
          ${categories().map(cat => {
            const count = rewards().filter(item => item.category_key === cat.category_key).length;
            return `
              <div class="cp-category">
                <strong>${esc(cat.label || cat.category_key)}</strong>
                <small>${esc(cat.category_key)} · Sortierung ${esc(cat.sort_order)} · ${count} Reward(s)</small>
                ${cat.enabled ? pill('aktiv', 'ok') : pill('inaktiv', 'off')}
              </div>
            `;
          }).join('') || '<div class="cp-empty">Keine Kategorien gefunden.</div>'}
        </div>
      </section>
    `;
  }

  function renderActionGuide() {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head"><h3>Aktionen</h3><span>geplant wie Command-Aktionen</span></div>
        <div class="cp-action-grid">
          ${ACTION_TYPES.map(item => `
            <div class="cp-action-card">
              <strong>${esc(item.label)}</strong>
              <code>${esc(item.id)}</code>
              <small>${esc(item.hint)}</small>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderMediaGuide() {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head"><h3>Medien</h3><span>bestehendes Media-System</span></div>
        <div class="cp-note">
          Uploads laufen ausschließlich über die vorhandene Medienverwaltung. Kanalpunkte speichern nur <code>media_asset_id</code> und <code>media_role</code>.
        </div>
        <button type="button" data-cp-action="open-media">Medienverwaltung öffnen</button>
      </section>
    `;
  }

  function renderPreparedTab(title, text) {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head"><h3>${esc(title)}</h3><span>vorbereitet</span></div>
        <div class="cp-empty">${esc(text)}</div>
      </section>
    `;
  }

  function renderEditor() {
    const reward = state.selected || selectedReward() || blankReward();
    const isNew = !reward.id;
    const payload = typeof reward.action_payload === 'object' && reward.action_payload
      ? JSON.stringify(reward.action_payload, null, 2)
      : String(reward.action_payload_json || '{}');
    const action = actionMeta(reward.action_type || 'manual');

    return `
      <section class="cp-panel cp-editor">
        <div class="cp-panel-head">
          <h3>${isNew ? 'Neuer Reward' : 'Reward bearbeiten'}</h3>
          <span>${isNew ? 'lokal erstellen' : `ID ${esc(reward.id)}`}</span>
        </div>

        <div class="cp-subtabs">
          <a href="#cp-core">Basis</a>
          <a href="#cp-action">Aktion</a>
          <a href="#cp-media">Medien</a>
          <a href="#cp-rules">Regeln</a>
        </div>

        <div id="cp-core" class="cp-editor-section">
          <h4>Basis</h4>
          <div class="cp-form-grid">
            <label>Key<input data-cp-field="reward_key" value="${esc(reward.reward_key)}" ${isNew ? '' : 'readonly'}></label>
            <label>Titel<input data-cp-field="title" value="${esc(reward.title)}"></label>
            <label>Kosten<input data-cp-field="cost" type="number" min="1" value="${esc(reward.cost || 100)}"></label>
            <label>Kategorie<select data-cp-field="category_key">${categoryOptions(reward.category_key || 'general')}</select></label>
            <label>Sortierung<input data-cp-field="sort_order" type="number" value="${esc(reward.sort_order ?? 100)}"></label>
            <label>Input-Label<input data-cp-field="input_label" value="${esc(reward.input_label || '')}"></label>
          </div>
          <label class="cp-wide">Prompt<textarea data-cp-field="prompt" rows="2">${esc(reward.prompt || '')}</textarea></label>
        </div>

        <div id="cp-action" class="cp-editor-section">
          <h4>Aktion</h4>
          <div class="cp-form-grid">
            <label>Action-Typ
              <select data-cp-field="action_type">
                ${ACTION_TYPES.map(type => `<option value="${type.id}" ${reward.action_type === type.id ? 'selected' : ''}>${esc(type.label)}</option>`).join('')}
              </select>
            </label>
            <label>Action-Key<input data-cp-field="action_key" value="${esc(reward.action_key || '')}"></label>
            <label>Queue
              <select data-cp-field="queue_mode">
                ${['none','single','queue','replace'].map(type => `<option value="${type}" ${reward.queue_mode === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </label>
            <label>Priorität<input data-cp-field="priority" type="number" value="${esc(reward.priority ?? 0)}"></label>
          </div>
          <div class="cp-note">${esc(action.hint)}</div>
          <label class="cp-wide">Action-Payload JSON<textarea data-cp-field="action_payload_json" rows="5">${esc(payload)}</textarea></label>
        </div>

        <div id="cp-media" class="cp-editor-section">
          <h4>Medien</h4>
          <div class="cp-form-grid">
            <label>Media-Rolle
              <select data-cp-field="media_role">
                ${['none','sound','image','video','overlay','animation'].map(type => `<option value="${type}" ${reward.media_role === type ? 'selected' : ''}>${type}</option>`).join('')}
              </select>
            </label>
            <label>Media-ID<input data-cp-field="media_asset_id" id="cpMediaAssetId" value="${esc(reward.media_asset_id || '')}" readonly></label>
          </div>
          <div class="cp-media-box">
            <div data-media-field data-module-key="channelpoints" data-allowed-types="audio,video,image,animation" data-title="Kanalpunkte-Medium auswählen" data-value-input="#cpMediaAssetId"></div>
            <button type="button" data-cp-action="open-media">Medienverwaltung öffnen</button>
          </div>
        </div>

        <div id="cp-rules" class="cp-editor-section">
          <h4>Regeln</h4>
          <div class="cp-form-grid">
            <label>Cooldown Sekunden<input data-cp-field="cooldown_seconds" type="number" min="0" value="${esc(reward.cooldown_seconds ?? 0)}"></label>
            <label>Max pro Stream<input data-cp-field="max_per_stream" type="number" min="0" value="${esc(reward.max_per_stream ?? 0)}"></label>
            <label>Max pro User/Stream<input data-cp-field="max_per_user_per_stream" type="number" min="0" value="${esc(reward.max_per_user_per_stream ?? 0)}"></label>
          </div>
          <div class="cp-checks">
            <label><input data-cp-field="system_enabled" type="checkbox" ${boolValue(reward.system_enabled) ? 'checked' : ''}> lokal aktiv</label>
            <label><input data-cp-field="is_paused" type="checkbox" ${boolValue(reward.is_paused) ? 'checked' : ''}> pausiert</label>
            <label><input data-cp-field="require_user_input" type="checkbox" ${boolValue(reward.require_user_input) ? 'checked' : ''}> User-Eingabe</label>
            <label><input data-cp-field="auto_fulfill" type="checkbox" ${boolValue(reward.auto_fulfill) ? 'checked' : ''}> später auto-fulfill</label>
          </div>
        </div>

        <label class="cp-wide">Notizen<textarea data-cp-field="notes" rows="2">${esc(reward.notes || '')}</textarea></label>

        <div class="cp-actions">
          <button type="button" data-cp-action="save">${isNew ? 'Lokal erstellen' : 'Speichern'}</button>
          ${!isNew && reward.system_enabled ? `<button type="button" data-cp-action="disable" data-key="${esc(reward.reward_key)}">Lokal deaktivieren</button>` : ''}
          ${!isNew && !reward.system_enabled ? `<button type="button" data-cp-action="enable" data-key="${esc(reward.reward_key)}">Lokal aktivieren</button>` : ''}
          <button type="button" data-cp-action="bus-test">Bus-Test</button>
        </div>
        <div class="cp-note cp-warning">Twitch wird in STEP495 nicht verändert. Deaktivieren ist nur lokal.</div>
      </section>
    `;
  }

  function renderActiveContent() {
    if (state.tab === 'overview') return renderOverview();
    if (state.tab === 'categories') return renderCategories();
    if (state.tab === 'actions') return renderActionGuide();
    if (state.tab === 'media') return renderMediaGuide();
    if (state.tab === 'redemptions') return renderPreparedTab('Einlösungen / Queue', 'Redemption-History und Warteschlange kommen später nach Twitch/EventSub-Anbindung.');
    if (state.tab === 'twitch') return renderPreparedTab('Twitch Sync', 'Twitch Rewards lesen/erstellen/aktualisieren/deaktivieren kommt erst in späteren Steps mit Scope-Prüfung.');
    return '';
  }

  function renderWorkArea() {
    if (state.tab === 'rewards' || state.tab === 'overview') {
      return `
        <div class="cp-layout">
          <div>${renderRewardList()}</div>
          ${renderEditor()}
        </div>
      `;
    }
    return renderActiveContent();
  }

  function render() {
    if (!root) root = document.getElementById('channelpointsModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = '<div class="cp-loading">Kanalpunkte werden geladen...</div>';
      return;
    }

    root.innerHTML = `
      <div class="cp-admin">
        ${renderHeader()}
        ${state.error ? `<div class="cp-alert error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="cp-alert ok">${esc(state.notice)}</div>` : ''}
        ${renderTabs()}
        ${renderToolbar()}
        ${renderActiveContent()}
        ${renderWorkArea()}
      </div>
    `;

    wireEvents();
    window.MediaField?.initAll?.(root);
  }

  function wireEvents() {
    root.querySelectorAll('[data-cp-tab]').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.cpTab || 'overview')));
    root.querySelectorAll('[data-cp-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedKey = btn.dataset.cpSelect || '';
        state.selected = null;
        state.tab = 'rewards';
        render();
      });
    });

    root.querySelector('[data-cp-action="reload"]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-cp-action="new"]')?.addEventListener('click', () => {
      state.selectedKey = '';
      state.selected = blankReward();
      state.tab = 'rewards';
      render();
    });
    root.querySelectorAll('[data-cp-action="open-media"]').forEach(btn => btn.addEventListener('click', () => window.CGN?.setActiveModule?.('media')));
    root.querySelector('[data-cp-action="save"]')?.addEventListener('click', async () => {
      try { state.error = ''; await saveReward(); }
      catch (err) { state.error = err.message || String(err); render(); }
    });
    root.querySelector('[data-cp-action="bus-test"]')?.addEventListener('click', async () => {
      try { state.error = ''; await runBusTest(); }
      catch (err) { state.error = err.message || String(err); render(); }
    });
    root.querySelectorAll('[data-cp-action="disable"]').forEach(btn => btn.addEventListener('click', async () => {
      try { state.error = ''; await disableReward(btn.dataset.key || state.selectedKey); }
      catch (err) { state.error = err.message || String(err); render(); }
    }));
    root.querySelectorAll('[data-cp-action="enable"]').forEach(btn => btn.addEventListener('click', async () => {
      try { state.error = ''; await enableReward(btn.dataset.key || state.selectedKey); }
      catch (err) { state.error = err.message || String(err); render(); }
    }));

    root.querySelector('[data-cp-control="query"]')?.addEventListener('input', ev => { state.query = ev.target.value || ''; render(); });
    root.querySelector('[data-cp-control="categoryFilter"]')?.addEventListener('change', ev => { state.categoryFilter = ev.target.value || 'all'; render(); });
    root.querySelector('[data-cp-control="statusFilter"]')?.addEventListener('change', ev => { state.statusFilter = ev.target.value || 'all'; render(); });
    root.querySelector('[data-cp-control="actionFilter"]')?.addEventListener('change', ev => { state.actionFilter = ev.target.value || 'all'; render(); });
  }

  registerDashboardModule();

  window.addEventListener('cgn:module-show', event => {
    if (event?.detail?.module === 'channelpoints') loadAll(false);
  });

  return { loadAll, render, registerDashboardModule };
})();
