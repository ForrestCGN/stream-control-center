(function(){
  const root = document.getElementById('alertsModule');
  if (!root) return;

  const state = {
    status: null,
    rules: [],
    types: [],
    assets: [],
    textVariants: [],
    chatBlocks: [],
    testPresets: [],
    displayProfiles: [],
    history: [],
    page: 'overview',
    source: 'all',
    type: 'all',
    note: '',
    modal: null,
    modalRule: null,
    ruleSortKey: 'value',
    ruleSortDir: 'asc',
    displayProfileId: null,
    previewPopout: null,
    previewVariantId: null,
    placeholderTarget: null
  };

  const SOURCE_LABELS = { all:'Alle', twitch:'Twitch', kofi:'Ko-fi', tipeee:'Tipeee' };
  const TYPE_LABELS = { bits:'Bits', follow:'Follow', sub:'Sub', resub:'Resub', gift_sub:'Gift Sub', giftsub:'Gift Sub', gift_bomb:'Sub-Bombe', communitygift:'Sub-Bombe', community_gift:'Sub-Bombe', raid:'Raid', donation:'Donation', membership:'Membership', shop:'Shop', commission:'Commission', subscription:'Subscription', hosting:'Hosting' };
  const CELEBRATIONS = [
    ['none','Keine'],
    ['heart_rain','Herzregen'],
    ['sparkle_rain','Sternenglanz']
  ];
  const CELEBRATION_STRENGTHS = [
    ['soft','Dezent'],
    ['medium','Normal'],
    ['strong','Stark']
  ];
  const IMAGE_MODES = ['none','icon','avatar','avatar_icon','special','avatar_special','random_pool'];
  const ANIMATIONS = ['neon_card','compact','big_celebration','minimal'];
  const DURATION_MODES = [
    { value:'fixed', label:'Manuell' },
    { value:'sound', label:'Nach Soundlänge' }
  ];
  const TWITCH_SUB_TIER_TYPES = new Set(['sub','resub','gift_sub','gifted_sub_received','gift_bomb']);
  const TWITCH_SUB_TIER_OPTIONS = [
    { value:'', label:'Alle / kein Tier-Filter' },
    { value:'prime', label:'Prime' },
    { value:'tier1', label:'Tier 1' },
    { value:'tier2', label:'Tier 2' },
    { value:'tier3', label:'Tier 3' }
  ];

  const esc = v => CGN.esc(v);
  const escClass = v => String(v ?? "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "default";
  const opt = (value,label,selected) => `<option value="${esc(value)}" ${String(value)===String(selected)?'selected':''}>${esc(label)}</option>`;
  const pill = (text, cls='') => `<span class="pill ${cls}">${esc(text)}</span>`;
  const fmtMs = ms => {
    const n = Number(ms || 0);
    return n > 0 ? `${(n / 1000).toFixed(1)}s` : '—';
  };
  const bytes = n => {
    const v = Number(n || 0);
    if (v >= 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`;
    if (v >= 1024) return `${Math.round(v / 1024)} KB`;
    return `${v} B`;
  };
  const empty = v => v === null || v === undefined ? '' : v;

  function parseChatTexts(value){
    if (Array.isArray(value)) return value.map(v => String(v ?? '').trim()).filter(Boolean);
    if (value === null || value === undefined || value === '') return [];
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(v => String(v ?? '').trim()).filter(Boolean);
      } catch (_) {}
      return raw.split(/\r?\n---+\r?\n|\r?\n\s*\r?\n/).map(v => String(v ?? '').trim()).filter(Boolean);
    }
    return [];
  }

  function ensureStep169Styles(){
    if (document.getElementById('alerts-step169-inline-styles')) return;
    const style = document.createElement('style');
    style.id = 'alerts-step169-inline-styles';
    style.textContent = `
      .placeholder-box{line-height:1.9}
      .placeholder-help-note{display:block;margin-top:6px;color:rgba(255,255,255,.58);font-size:12px}
      .placeholder-chip{cursor:pointer;position:relative;border:1px solid rgba(143,244,255,.22);background:rgba(143,244,255,.06);border-radius:8px;padding:2px 6px;margin:0 2px;white-space:nowrap}
      .placeholder-chip:hover{border-color:rgba(143,244,255,.65);box-shadow:0 0 12px rgba(143,244,255,.20)}
      .placeholder-chip:active{transform:translateY(1px);background:rgba(196,92,255,.16)}
      .placeholder-chip:hover::after{content:attr(data-help);position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);z-index:9999;min-width:220px;max-width:340px;padding:9px 10px;border-radius:10px;background:rgba(8,10,22,.96);border:1px solid rgba(143,244,255,.38);box-shadow:0 12px 36px rgba(0,0,0,.45),0 0 18px rgba(143,244,255,.16);color:#fff;font:12px/1.35 system-ui,Segoe UI,sans-serif;white-space:normal;text-align:left;pointer-events:none}
      .placeholder-chip:hover::before{content:'';position:absolute;left:50%;bottom:100%;transform:translateX(-50%);border:7px solid transparent;border-top-color:rgba(143,244,255,.38);pointer-events:none}

      .chat-text-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}
      .chat-text-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start;padding:8px;border:1px solid rgba(143,244,255,.14);border-radius:12px;background:rgba(255,255,255,.035)}
      .chat-text-row textarea{min-height:48px;resize:vertical}
      .chat-text-row button{height:36px;min-width:36px;padding:0 10px}
      .chat-block-tools{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 0}
      .design-section .design-grid{grid-template-columns:repeat(auto-fit,minmax(155px,1fr));align-items:stretch;gap:12px!important}
      .design-section .design-grid>label{min-height:116px;display:flex!important;flex-direction:column;justify-content:flex-start;gap:8px}
      .design-section .design-grid>label select,.design-section .design-grid>label input:not([type=range]){margin-top:auto}
      .design-section .design-grid>label input[type=range]{margin-top:auto;width:100%}
      .design-section .design-grid>label.compact-range button{margin-top:auto;align-self:flex-start}
      .rules-table-wrap{overflow-x:auto;}
      .rules-table{table-layout:fixed;min-width:1320px;width:100%;}
      .rules-table th,.rules-table td{vertical-align:middle;}
      .rules-table .col-rule-name{width:245px;}
      .rules-table .col-rule-active{width:108px;}
      .rules-table .col-rule-value{width:100px;}
      .rules-table .col-rule-design{width:205px;}
      .rules-table .col-rule-chat{width:230px;}
      .rules-table .col-rule-sound{width:290px;}
      .rules-table .col-rule-duration{width:96px;}
      .rules-table .col-rule-actions{width:118px;}
      .rules-table .chat-text-cell{display:block;min-width:0;}
      .rules-table .chat-text-cell strong{display:block;max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rules-table .sound-inline{max-width:300px;}
      .rules-table .sound-inline strong{display:block;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .rules-table .sound-inline .path-small{display:block;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:normal;}
      .rules-table .actions-cell .row-actions{justify-content:flex-end;flex-wrap:nowrap;gap:7px;}
      .icon-action-btn{width:32px;height:32px;min-width:32px;padding:0!important;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;line-height:1;font-weight:900;}
      .icon-action-btn.edit{color:#fff;}
      .icon-action-btn.test{color:#fff;border-color:rgba(143,244,255,.30);}
      .icon-action-btn.danger{color:#fff;}
      .icon-action-btn:hover{transform:translateY(-1px);}
      .rules-table .actions-head{text-align:right;}

      .design-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap!important;white-space:nowrap}
      .design-head-actions button{min-height:38px;padding:0 14px}
      .design-section .design-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));align-items:stretch;gap:12px!important}
      .design-section .design-grid>label{min-height:104px;display:flex!important;flex-direction:column;justify-content:flex-start;gap:8px}
      .design-section .design-grid>label select,.design-section .design-grid>label input:not([type=range]){margin-top:auto}
      .design-section .design-grid>label input[type=range]{margin-top:auto;width:100%}
      .design-section .design-grid>label.compact-range button{margin-top:auto;align-self:stretch}
    `;
    document.head.appendChild(style);
  }

  async function loadAll(keepNote=false){
    try {
      const [status, rules, assets, textVariants, chatBlocks, testPresets, displayProfiles, history] = await Promise.all([
        CGN.api('/api/alerts/status'),
        CGN.api('/api/alerts/rules'),
        CGN.api('/api/alerts/assets'),
        CGN.api('/api/alerts/text-variants'),
        CGN.api('/api/alerts/chat-blocks'),
        CGN.api('/api/alerts/test-presets'),
        CGN.api('/api/alerts/display-profiles'),
        CGN.api('/api/alerts/events?limit=100')
      ]);
      state.status = status;
      state.rules = Array.isArray(rules.rules) ? rules.rules : [];
      state.types = Array.isArray(rules.types) ? rules.types : [];
      state.assets = Array.isArray(assets.assets) ? assets.assets : [];
      state.textVariants = Array.isArray(textVariants.variants) ? textVariants.variants : [];
      state.chatBlocks = Array.isArray(chatBlocks.blocks) ? chatBlocks.blocks : [];
      state.testPresets = Array.isArray(testPresets.presets) ? testPresets.presets : [];
      state.displayProfiles = Array.isArray(displayProfiles.profiles) ? displayProfiles.profiles : [];
      state.history = Array.isArray(history.events) ? history.events : (Array.isArray(status.history) ? status.history : []);
      if (state.status && Array.isArray(state.history)) state.status.history = state.history;
      if (!state.displayProfileId && state.displayProfiles.length) {
        const def = state.displayProfiles.find(p => Number(p.is_default) === 1) || state.displayProfiles[0];
        state.displayProfileId = def?.id || null;
      }
      if (!keepNote) state.note = '';
      if (state.type !== 'all' && !availableTypes(state.source).some(t => t.type_key === state.type)) state.type = 'all';
      render();
    } catch (err) {
      root.innerHTML = `<section class="card glass"><h2>Fehler</h2><p class="bad">${esc(err.message)}</p></section>`;
    }
  }

  function sourceSort(a,b){
    const order = { twitch:1, kofi:2, tipeee:3 };
    return (order[a] || 99) - (order[b] || 99) || String(a).localeCompare(String(b));
  }

  function sources(includeAll=true){
    const set = new Set(['twitch','kofi','tipeee']);
    state.rules.forEach(r => r.source && set.add(r.source));
    state.types.forEach(t => t.source && set.add(t.source));
    const arr = Array.from(set).sort(sourceSort);
    return includeAll ? ['all', ...arr] : arr;
  }

  function availableTypes(source){
    const m = new Map();
    state.types.forEach(t => {
      if (source !== 'all' && t.source !== source) return;
      m.set(t.type_key, { ...t, label: TYPE_LABELS[t.type_key] || t.label || t.type_key });
    });
    state.rules.forEach(r => {
      if (source !== 'all' && r.source !== source) return;
      if (!m.has(r.type_key)) m.set(r.type_key, { source:r.source, type_key:r.type_key, label: TYPE_LABELS[r.type_key] || r.type_key, sort_order: 999 });
    });
    return Array.from(m.values()).sort((a,b)=>Number(a.sort_order ?? 999)-Number(b.sort_order ?? 999) || String(a.label || a.type_key).localeCompare(String(b.label || b.type_key)));
  }

  function typeOrder(source, typeKey){
    const found = state.types.find(t => t.source === source && t.type_key === typeKey) || state.types.find(t => t.type_key === typeKey);
    return Number(found?.sort_order ?? 999);
  }

  function typeLabel(typeKey){
    return TYPE_LABELS[typeKey] || typeKey || 'Alert';
  }

  function compactTypeLabel(r){
    if (state.source === 'all') return `${SOURCE_LABELS[r.source] || r.source} · ${typeLabel(r.type_key)}`;
    return typeLabel(r.type_key);
  }

  function rangeText(r){
    const min = r.min_value ?? 0;
    const max = r.max_value ?? '∞';
    return `${min} – ${max}`;
  }

  function ruleValueDescriptor(source, typeKey){
    const src = String(source || 'twitch');
    const type = String(typeKey || '');
    const fallback = {
      minLabel: 'Min-Wert',
      maxLabel: 'Max-Wert',
      minPlaceholder: '0',
      maxPlaceholder: 'leer = offen',
      help: 'Wertebereich, der diese Regel auslöst. Leer bei Max bedeutet: nach oben offen.'
    };

    if (src === 'twitch') {
      if (type === 'bits') return {
        minLabel: 'Min-Bits',
        maxLabel: 'Max-Bits',
        minPlaceholder: 'z. B. 100',
        maxPlaceholder: 'leer = ab Min-Bits offen',
        help: 'Bits/Cheer: Min und Max beziehen sich auf die Anzahl der gesendeten Bits. Beispiel: 100–249 trifft bei 100 bis 249 Bits.'
      };
      if (type === 'raid') return {
        minLabel: 'Min-Zuschauer',
        maxLabel: 'Max-Zuschauer',
        minPlaceholder: 'z. B. 5',
        maxPlaceholder: 'leer = ab Min-Zuschauer offen',
        help: 'Raid: Min und Max beziehen sich auf die Zuschauerzahl des Raids.'
      };
      if (type === 'gift_sub') return {
        minLabel: 'Min verschenkte Subs',
        maxLabel: 'Max verschenkte Subs',
        minPlaceholder: '1',
        maxPlaceholder: '4',
        help: 'Gift Sub: Min und Max beziehen sich auf die Anzahl der verschenkenen Subs. Für 1–4 nutzt das System aktuell gift_sub.'
      };
      if (type === 'gift_bomb') return {
        minLabel: 'Min Sub-Bombe',
        maxLabel: 'Max Sub-Bombe',
        minPlaceholder: 'z. B. 5',
        maxPlaceholder: 'leer = ab Min offen',
        help: 'Sub-Bombe: Min und Max beziehen sich auf die Anzahl der auf einmal verschenkten Subs. Beispiel: 5–9, 10–20, ab 21.'
      };
      if (type === 'sub') return {
        minLabel: 'Min Sub-Anzahl',
        maxLabel: 'Max Sub-Anzahl',
        minPlaceholder: '0 oder 1',
        maxPlaceholder: 'meist leer',
        help: 'Normaler Sub: Wert ist aktuell meist 1. Tier-Regeln laufen später über Regelbedingungen, nicht über Min/Max.'
      };
      if (type === 'gifted_sub_received') return {
        minLabel: 'Min empfangene Gifts',
        maxLabel: 'Max empfangene Gifts',
        minPlaceholder: '1',
        maxPlaceholder: 'meist leer',
        help: 'Empfangener GiftSub: channel.subscribe mit is_gift=true. Aktuell bewusst ohne aktive Regel, damit keine Doppel-Alerts entstehen.'
      };
      if (type === 'resub') return {
        minLabel: 'Min Monate',
        maxLabel: 'Max Monate',
        minPlaceholder: 'z. B. 12',
        maxPlaceholder: 'leer = ab Min-Monate offen',
        help: 'Resub: Wert kann für Monatsstaffeln genutzt werden. Die echten Twitch-Felder cumulative_months und streak_months bleiben im Event erhalten.'
      };
      if (type === 'follow') return {
        minLabel: 'Min-Wert',
        maxLabel: 'Max-Wert',
        minPlaceholder: '0',
        maxPlaceholder: 'leer lassen',
        help: 'Follow hat normalerweise keine Staffelung. Min/Max können leer bzw. 0/offen bleiben.'
      };
      if (type === 'channelpoints') return {
        minLabel: 'Min Punkte/Kosten',
        maxLabel: 'Max Punkte/Kosten',
        minPlaceholder: 'Reward-Kosten',
        maxPlaceholder: 'leer = offen',
        help: 'Kanalpunkte: Wert kann für Reward-Kosten oder eine spätere Reward-Staffel genutzt werden.'
      };
      if (type === 'hypeTrainBegin' || type === 'hypeTrainProgress' || type === 'hypeTrainEnd') return {
        minLabel: 'Min HypeTrain-Level',
        maxLabel: 'Max HypeTrain-Level',
        minPlaceholder: 'z. B. 1',
        maxPlaceholder: 'z. B. 5 oder leer',
        help: 'HypeTrain: Min/Max beziehen sich auf das HypeTrain-Level, sobald Level-Regeln aktiv genutzt werden.'
      };
    }

    if (type === 'donation' || src === 'kofi' || src === 'tipeee') return {
      minLabel: 'Min-Betrag',
      maxLabel: 'Max-Betrag',
      minPlaceholder: 'z. B. 5',
      maxPlaceholder: 'leer = ab Min-Betrag offen',
      help: 'Donation/Support: Min und Max beziehen sich auf den Betrag in der jeweiligen Währung.'
    };

    return fallback;
  }

  function isTwitchSubTierRule(source, typeKey){
    return String(source || '').toLowerCase() === 'twitch' && TWITCH_SUB_TIER_TYPES.has(String(typeKey || '').toLowerCase());
  }

  function cloneMeta(meta){
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {};
    try { return JSON.parse(JSON.stringify(meta)); } catch (_) { return Object.assign({}, meta); }
  }

  function normalizeTierLabel(value){
    const raw = String(value || '').trim().toLowerCase();
    if (!raw || raw === 'all' || raw === 'normal') return '';
    if (raw === '1000' || raw === 'tier_1' || raw === 'tier-1') return 'tier1';
    if (raw === '2000' || raw === 'tier_2' || raw === 'tier-2') return 'tier2';
    if (raw === '3000' || raw === 'tier_3' || raw === 'tier-3') return 'tier3';
    if (raw.includes('prime')) return 'prime';
    if (['tier1','tier2','tier3'].includes(raw)) return raw;
    return '';
  }

  function ruleTierFilter(rule){
    const meta = rule && rule.meta && typeof rule.meta === 'object' ? rule.meta : {};
    const match = meta.match && typeof meta.match === 'object' && !Array.isArray(meta.match) ? meta.match : {};
    const raw = match.tierLabel ?? match.tierLabels ?? match.tier ?? match.tiers ?? '';
    const first = Array.isArray(raw) ? raw[0] : raw;
    return normalizeTierLabel(first);
  }

  function ruleTierOptions(rule){
    const selected = ruleTierFilter(rule);
    return TWITCH_SUB_TIER_OPTIONS.map(o => opt(o.value, o.label, selected)).join('');
  }

  function ruleTierLabel(value){
    const normalized = normalizeTierLabel(value);
    const option = TWITCH_SUB_TIER_OPTIONS.find(o => o.value === normalized);
    return option ? option.label : 'Alle / kein Tier-Filter';
  }

  function ruleTierBadge(rule){
    if (!isTwitchSubTierRule(rule?.source, rule?.type_key)) return '';
    const tier = ruleTierFilter(rule);
    return `<span class="tier-filter-badge ${tier ? 'is-specific' : 'is-all'}">${esc(ruleTierLabel(tier))}</span>`;
  }

  function applyTierFilterToMeta(metaInput, tierValue){
    const meta = cloneMeta(metaInput);
    const tier = normalizeTierLabel(tierValue);
    const match = meta.match && typeof meta.match === 'object' && !Array.isArray(meta.match) ? { ...meta.match } : {};
    delete match.tier;
    delete match.tiers;
    delete match.tierLabel;
    delete match.tierLabels;
    if (tier) match.tierLabel = [tier];
    if (Object.keys(match).length) meta.match = match;
    else delete meta.match;
    return meta;
  }

  function updateRuleTierUi(){
    const source = root.querySelector('#ruleSource')?.value || 'twitch';
    const typeKey = root.querySelector('#ruleTypeKey')?.value || '';
    const row = root.querySelector('#ruleTierField');
    const select = root.querySelector('#ruleTierFilter');
    const help = root.querySelector('#ruleTierHelp');
    const available = isTwitchSubTierRule(source, typeKey);
    if (row) row.hidden = !available;
    if (select) select.disabled = !available;
    if (help) help.textContent = available
      ? 'Optionaler Filter für Prime/Tier 1/Tier 2/Tier 3. Alle = bestehendes Verhalten ohne Tier-Einschränkung.'
      : 'Tier-Filter ist nur für Twitch Sub, Resub, GiftSub und Sub-Bombe relevant.';
  }

  function updateRuleValueHelpUi(){
    const source = root.querySelector('#ruleSource')?.value || 'twitch';
    const typeKey = root.querySelector('#ruleTypeKey')?.value || '';
    const desc = ruleValueDescriptor(source, typeKey);
    const minLabel = root.querySelector('#ruleMinLabelText');
    const maxLabel = root.querySelector('#ruleMaxLabelText');
    const minInput = root.querySelector('#ruleMin');
    const maxInput = root.querySelector('#ruleMax');
    const help = root.querySelector('#ruleValueHelp');
    if (minLabel) minLabel.textContent = desc.minLabel;
    if (maxLabel) maxLabel.textContent = desc.maxLabel;
    if (minInput) minInput.placeholder = desc.minPlaceholder;
    if (maxInput) maxInput.placeholder = desc.maxPlaceholder;
    if (help) help.textContent = desc.help;
    updateRuleTierUi();
    updateRuleTtsUi();
  }

  function ttsValueDescriptor(source, typeKey){
    const src = String(source || '').toLowerCase();
    const type = String(typeKey || '').toLowerCase();
    if (type === 'bits' || type === 'cheer') return {
      minLabel: 'Min-Bits für TTS',
      minPlaceholder: 'z. B. 100 oder leer',
      help: 'Leer = TTS bei jeder passenden Bits-Regel mit Text. Bei Wert wird erst ab dieser Bit-Anzahl gesprochen.',
      sourceText: 'Verwendet wird der Cheer-/Bits-Text aus Twitch.'
    };
    if (type === 'resub') return {
      minLabel: 'Min-Monate für TTS',
      minPlaceholder: 'optional',
      help: 'Leer = TTS bei jedem Resub mit Nachricht. Optional kannst du TTS erst ab einer Monatszahl aktivieren.',
      sourceText: 'Verwendet wird message.text aus channel.subscription.message.'
    };
    if (type === 'donation' || src === 'kofi' || src === 'tipeee') return {
      minLabel: 'Min-Betrag für TTS',
      minPlaceholder: 'z. B. 5 oder leer',
      help: 'Leer = TTS bei jeder passenden Donation mit Nachricht. Bei Wert wird erst ab diesem Betrag gesprochen.',
      sourceText: 'Verwendet wird die Nachricht aus Ko-fi/Tipeee.'
    };
    if (type === 'channelpoints') return {
      minLabel: 'Min-Punkte für TTS',
      minPlaceholder: 'optional',
      help: 'Leer = TTS bei jeder passenden Kanalpunkte-Regel mit Texteingabe.',
      sourceText: 'Verwendet wird später user_input aus dem Reward.'
    };
    return {
      minLabel: 'Min-Wert für TTS',
      minPlaceholder: 'optional',
      help: 'Leer = TTS bei jedem passenden Alert mit Text. Bei Wert wird erst ab diesem Wert gesprochen.',
      sourceText: 'TTS wird nur abgespielt, wenn der Alert einen Text enthält.'
    };
  }

  function updateRuleTtsUi(){
    const enabledSelect = root.querySelector('#ruleTtsEnabled');
    const enabled = Number(enabledSelect?.value || 0) === 1;
    const source = root.querySelector('#ruleSource')?.value || 'twitch';
    const typeKey = root.querySelector('#ruleTypeKey')?.value || '';
    const desc = ttsValueDescriptor(source, typeKey);
    const detail = root.querySelector('#ruleTtsDetail');
    const status = root.querySelector('#ruleTtsStatus');
    const minLabel = root.querySelector('#ruleTtsMinAmountLabelText');
    const minInput = root.querySelector('#ruleTtsMinAmount');
    const minHelp = root.querySelector('#ruleTtsMinHelp');
    const sourceHelp = root.querySelector('#ruleTtsSourceHelp');
    if (detail) detail.hidden = !enabled;
    if (status) {
      status.textContent = enabled
        ? 'Aktiv: Erst läuft der Alert-Sound. Danach wird der Text per TTS abgespielt. Der Alert bleibt bis zum Ende sichtbar.'
        : 'Aus: Für diese Regel wird kein TTS abgespielt.';
      status.classList.toggle('ok', enabled);
      status.classList.toggle('muted', !enabled);
    }
    if (minLabel) minLabel.textContent = desc.minLabel;
    if (minInput) minInput.placeholder = desc.minPlaceholder;
    if (minHelp) minHelp.textContent = desc.help;
    if (sourceHelp) sourceHelp.textContent = desc.sourceText;
  }

  function visibleRules(){
    return state.rules
      .filter(r => state.source === 'all' || r.source === state.source)
      .filter(r => state.type === 'all' || r.type_key === state.type)
      .sort(ruleSort);
  }

  function ruleSort(a,b){
    const sc = sourceSort(a.source,b.source); if (sc) return sc;
    const to = typeOrder(a.source, a.type_key) - typeOrder(b.source, b.type_key); if (to) return to;
    if (a.type_key !== b.type_key) return String(a.type_key).localeCompare(String(b.type_key));
    const amin = a.min_value === null || a.min_value === undefined ? -999999 : Number(a.min_value);
    const bmin = b.min_value === null || b.min_value === undefined ? -999999 : Number(b.min_value);
    const acap = a.max_value === null || a.max_value === undefined ? 999999999 : Number(a.max_value);
    const bcap = b.max_value === null || b.max_value === undefined ? 999999999 : Number(b.max_value);
    return amin - bmin || acap - bcap || Number(a.priority || 0) - Number(b.priority || 0) || Number(a.id || 0) - Number(b.id || 0);
  }

  function numericRangeValue(r){
    const min = r.min_value === null || r.min_value === undefined ? -999999999 : Number(r.min_value);
    const max = r.max_value === null || r.max_value === undefined ? 999999999 : Number(r.max_value);
    return { min, max };
  }

  function sortArrow(key){
    if (state.ruleSortKey !== key) return '';
    return state.ruleSortDir === 'asc' ? ' ▲' : ' ▼';
  }

  function sortableTh(key, label, cls=''){
    return `<th class="${esc(cls)}"><button type="button" class="sort-th ${state.ruleSortKey === key ? 'active' : ''}" data-rule-sort="${esc(key)}" title="Nach ${esc(label)} sortieren">${esc(label)}${esc(sortArrow(key))}</button></th>`;
  }

  function rulesColgroup(){
    return `<colgroup><col class="col-rule-name"><col class="col-rule-active"><col class="col-rule-value"><col class="col-rule-design"><col class="col-rule-chat"><col class="col-rule-sound"><col class="col-rule-duration"><col class="col-rule-actions"></colgroup>`;
  }

  function typeOptionsForSource(source, selected, includeCurrent=true){
    const src = source || 'twitch';
    const rows = availableTypes(src);
    const hasSelected = rows.some(t => String(t.type_key) === String(selected));
    const extra = includeCurrent && selected && !hasSelected ? [opt(selected, TYPE_LABELS[selected] || selected, selected)] : [];
    return rows.map(t => opt(t.type_key, t.label || t.type_key, selected)).join('') + extra.join('');
  }

  function effectiveDurationMs(r){
    if ((r.duration_mode || 'fixed') === 'sound') {
      const sound = ruleSoundDurationMs(r);
      if (sound > 0) {
        const cfg = state.status?.config || {};
        const padded = sound + Number(cfg.soundDurationPaddingMs || 0);
        const min = Number(cfg.minAutoDurationMs || 1000);
        const max = Number(cfg.maxAutoDurationMs || 60000);
        return Math.max(min, Math.min(max, padded));
      }
    }
    return Number(r.duration_ms || 0);
  }

  function compareRulesForCurrentSort(a,b){
    const dir = state.ruleSortDir === 'desc' ? -1 : 1;
    const key = state.ruleSortKey || 'value';
    let result = 0;
    if (key === 'name') result = String(a.label || '').localeCompare(String(b.label || ''), 'de', { numeric:true, sensitivity:'base' });
    else if (key === 'value') {
      const ar = numericRangeValue(a), br = numericRangeValue(b);
      result = (ar.min - br.min) || (ar.max - br.max);
    }
    else if (key === 'sound') result = String(a.sound_label || a.sound_url || '').localeCompare(String(b.sound_label || b.sound_url || ''), 'de', { numeric:true, sensitivity:'base' });
    else if (key === 'design') result = String(displayProfileLabel(a) || '').localeCompare(String(displayProfileLabel(b) || ''), 'de', { numeric:true, sensitivity:'base' });
    else if (key === 'chat') result = String(chatBlockLabelForRule(a) || '').localeCompare(String(chatBlockLabelForRule(b) || ''), 'de', { numeric:true, sensitivity:'base' });
    else if (key === 'duration') result = Number(effectiveDurationMs(a) || 0) - Number(effectiveDurationMs(b) || 0);
    else if (key === 'active' || key === 'status') result = Number(a.enabled || 0) - Number(b.enabled || 0);
    else if (key === 'priority') result = Number(a.priority || 0) - Number(b.priority || 0);
    else if (key === 'id') result = Number(a.id || 0) - Number(b.id || 0);
    else if (key === 'source') result = String(a.source || '').localeCompare(String(b.source || ''), 'de', { numeric:true, sensitivity:'base' });
    else if (key === 'type') result = String(a.type_key || '').localeCompare(String(b.type_key || ''), 'de', { numeric:true, sensitivity:'base' });
    if (!result) result = ruleSort(a,b);
    return result * dir;
  }

  function sortRulesForView(list){
    return list.slice().sort(compareRulesForCurrentSort);
  }


  function ensureSoundPreviewStyles(){
    if (document.getElementById('alertSoundPreviewStyles')) return;
    const style = document.createElement('style');
    style.id = 'alertSoundPreviewStyles';
    style.textContent = `
      .sound-inline{display:flex;align-items:center;gap:10px;min-width:0;}
      .sound-inline > div{min-width:0;}
      .sound-icon-btn{width:30px;height:30px;min-width:30px;padding:0;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;line-height:1;border:1px solid rgba(143,244,255,.28);background:rgba(255,255,255,.07);color:#fff;cursor:pointer;box-shadow:0 0 0 rgba(0,0,0,0);}
      .sound-icon-btn:hover{border-color:rgba(143,244,255,.55);background:rgba(143,244,255,.12);}
      .sound-icon-btn:disabled{opacity:.35;cursor:not-allowed;}
      .sound-icon-btn.is-playing{border-color:rgba(67,240,255,.85);background:rgba(67,240,255,.18);box-shadow:0 0 14px rgba(67,240,255,.25);}
      .sound-select-row{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:10px;align-items:center;}
      .sound-media-picker-row{grid-template-columns:minmax(0,1fr) auto 34px;}
      .sound-media-picker-row input[readonly]{min-width:0;overflow:hidden;text-overflow:ellipsis;}
      .sound-media-picker-row button{height:40px;white-space:nowrap;}
      .sound-media-picker-row #pickRuleSoundMedia, .sound-media-picker-row #pickRuleImageMedia, .sound-media-picker-row #pickTopGraphicMedia{min-width:118px;padding-left:14px;padding-right:14px;}
      .sound-media-picker-row #clearRuleSoundMedia, .sound-media-picker-row #clearRuleImageMedia, .sound-media-picker-row #clearTopGraphicMedia{width:34px;min-width:34px;padding:0;}
      .sound-select-play{align-self:end;}
      .sound-assets-table .row-actions{gap:8px;align-items:center;}
      .legacy-sound-foldout{align-self:start;position:relative;min-height:40px;z-index:2;}
      .legacy-sound-foldout[open]{z-index:20;}
      .legacy-sound-foldout summary{display:flex;align-items:center;gap:10px;min-height:40px;cursor:pointer;list-style-position:outside;}
      .legacy-sound-foldout summary strong{white-space:nowrap;}
      .legacy-sound-summary{display:inline-block;min-width:0;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:700;color:rgba(210,220,235,.72);}
      .legacy-sound-body{display:none;}
      .legacy-sound-foldout[open] .legacy-sound-body{display:block;position:absolute;left:0;right:0;top:44px;padding:10px 12px 12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(21,21,24,.98);box-shadow:0 18px 36px rgba(0,0,0,.38),0 0 22px rgba(118,82,255,.10);}
      .legacy-sound-field{margin-top:0;}
      .legacy-sound-hint{margin:6px 0 0 0;}
      .path-small{font-size:11px;opacity:.78;word-break:break-all;}
      .chat-text-lines{white-space:pre-line;line-height:1.35;}
      .chat-block-select-row{display:grid;grid-template-columns:130px minmax(0,1fr);gap:10px;align-items:end;}
    `;
    document.head.appendChild(style);
  }

  function render(){
    ensureStep169Styles();
    ensureSoundPreviewStyles();
    root.innerHTML = `
      ${noteHtml()}
      ${topTabs()}
      ${pageHtml()}
      ${modalHtml()}
    `;
    bind();
    if (state.page === 'design') renderDesignPreview();
  }

  function noteHtml(){
    if (!state.note) return '';
    const cls = state.note.startsWith('Fehler') ? 'bad' : 'ok';
    return `<section class="admin-note glass ${cls}">${esc(state.note)}</section>`;
  }

  function topTabs(){
    const tabs = [
      ['overview','Übersicht'],
      ['rules','Regeln / Staffelungen'],
      ['texts','Overlay-Texte'],
      ['chattexts','Chat-Texte'],
      ['design','Design / Live-Vorschau'],
      ['assets','Sounds & Grafiken'],
      ['history','Letzte Alerts'],
      ['bus','Bus / Sync'],
      ['tests','Testcenter'],
      ['presets','Testwerte'],
      ['config','Config']
    ];
    return `<div class="alert-tabs glass">${tabs.map(([id,label]) => `<button class="tab-btn ${state.page===id?'active':''}" data-page="${id}">${label}</button>`).join('')}</div>`;
  }

  function pageHtml(){
    if (state.page === 'rules') return rulesPage();
    if (state.page === 'texts') return textsPage();
    if (state.page === 'chattexts') return chatBlocksPage();
    if (state.page === 'design') return designPage();
    if (state.page === 'assets') return assetsPage();
    if (state.page === 'history') return historyPage();
    if (state.page === 'bus') return busSyncPage();
    if (state.page === 'tests') return testsPage();
    if (state.page === 'presets') return presetsPage();
    if (state.page === 'config') return configPage();
    return overviewPage();
  }

  function overviewPage(){
    const s = state.status || {};
    const c = s.counts || {};
    const totalRules = Number(c.rules ?? state.rules.length ?? 0);
    const enabledRules = Number(c.enabledRules ?? state.rules.filter(r => Number(r.enabled)).length ?? 0);
    const inactiveRules = Math.max(0, totalRules - enabledRules);
    return `<div class="overview-grid dashboard-fluid-grid">
      ${statusCard('System', s.enabled ? 'AKTIV' : 'AUS', '', s.enabled ? 'ok':'bad')}
      ${statusCard('Overlay', String(s.overlayClients ?? 0), '', '')}
      ${statusCard('Queue', String(s.queueLength ?? 0), '', '')}
      ${statusCard('Uploads', s.multerReady ? 'OK' : 'FEHLER', '', s.multerReady ? 'ok':'bad')}
      ${statusCard('Sounds', `${c.soundAssetsWithDuration ?? 0}/${c.soundAssets ?? 0}`, '', (c.soundAssetsWithoutDuration || 0) ? 'warn':'ok')}
      ${statusCard('Regeln', `${enabledRules} aktiv`, `${inactiveRules} inaktiv`, '')}
      <section class="card glass span-12 latest-overview-card">
        <div class="card-head"><h2>Letzte 5 Alerts</h2><button data-page="history">Alle anzeigen</button></div>
        ${historyList(5, false)}
      </section>
      <section class="card glass span-12 alert-bus-mini-card">
        <div class="card-head"><h2>Alert ↔ SoundBus</h2><button data-page="bus">Bus / Sync öffnen</button></div>
        ${busSyncMiniHtml()}
      </section>
    </div>`;
  }

  function statusCard(title, metric, sub, cls){
    return `<section class="card glass status-card"><h2>${esc(title)}</h2><div class="metric ${cls || ''}">${esc(metric)}</div>${sub ? `<p class="status-subline">${esc(sub)}</p>` : ''}</section>`;
  }

  function compactRulesTable(){
    const rows = state.rules.slice().sort(ruleSort).slice(0, 10).map(r => ruleRow(r, true)).join('');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Typ</th><th>Name</th><th>Status</th><th>Wert</th><th>Chat-Text</th><th>Sound</th><th>Dauer</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8">Keine Regeln vorhanden.</td></tr>'}</tbody></table></div>`;
  }

  function rulesPage(){
    const groups = groupedRulesHtml();
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head">
        <div><h2>Regeln / Staffelungen</h2><p class="small-note">Hier steuerst du Staffelung, Sound, Dauer, Text/TTS und das gewünschte Design-Profil. Grafik, Animation und Celebration kommen aus dem Design-Editor.</p></div>
        <button class="success" id="openNewRule">+ Neue Regel</button>
      </div>
      ${filtersHtml()}
      ${groups}
    </section>`;
  }

  function groupedRulesHtml(){
    const rules = visibleRules();
    if (!rules.length) return '<div class="empty-box">Keine Regeln für diesen Filter.</div>';
    const groups = new Map();
    for (const r of rules) {
      const key = `${r.source}::${r.type_key}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }
    return Array.from(groups.entries()).map(([key, list]) => {
      const sample = list[0] || {};
      const title = state.source === 'all' ? `${SOURCE_LABELS[sample.source] || sample.source} · ${typeLabel(sample.type_key)}` : typeLabel(sample.type_key);
      const amountRules = sortRulesForView(list);
      return `<div class="rule-group">
        <div class="rule-group-head"><h3>${esc(title)}</h3><span>${amountRules.length} Regel(n)</span></div>
        <div class="table-wrap rules-table-wrap"><table class="table rules-table">${rulesColgroup()}<thead><tr>${sortableTh('name','Name','name-head')}${sortableTh('active','Status','active-head')}${sortableTh('value','Wert','value-head')}${sortableTh('design','Design','design-head')}${sortableTh('chat','Chat-Text','chat-head')}${sortableTh('sound','Sound','sound-head')}${sortableTh('duration','Dauer','duration-head')}<th class="actions-head" title="Aktionen">Aktion</th></tr></thead><tbody>${amountRules.map(r => ruleRow(r, false)).join('')}</tbody></table></div>
      </div>`;
    }).join('');
  }

  function filtersHtml(){
    const srcButtons = sources(true).map(src => `<button class="filter-btn ${state.source===src?'active':''}" data-source-filter="${esc(src)}">${esc(SOURCE_LABELS[src] || src)}</button>`).join('');
    const typeOptions = [opt('all','Alle Typen',state.type), ...availableTypes(state.source).map(t => opt(t.type_key, t.label || t.type_key, state.type))].join('');
    return `<div class="filter-panel"><div class="filter-bar">${srcButtons}</div><label>Typ <select id="typeFilter">${typeOptions}</select></label></div>`;
  }

  function ruleRow(r, compact){
    const type = compactTypeLabel(r);
    const range = rangeText(r);
    const duration = durationText(r);
    const statusButton = `<button type="button" class="status-toggle ${Number(r.enabled)?'is-active':'is-inactive'}" data-toggle-rule="${esc(r.id)}" title="Alert direkt ${Number(r.enabled)?'deaktivieren':'aktivieren'}">${Number(r.enabled)?'Aktiv':'Inaktiv'}</button>`;
    if (compact) {
      return `<tr><td>${pill(type)}</td><td><strong>${esc(r.label)}</strong></td><td>${statusButton}</td><td>${esc(range)}</td><td>${chatBlockInline(r)}</td><td>${ruleSoundInline(r)}</td><td>${esc(duration)}</td><td><button class="icon-action-btn edit" data-edit-rule="${esc(r.id)}" title="Regel bearbeiten" aria-label="Regel bearbeiten">✎</button></td></tr>`;
    }
    return `<tr class="${Number(r.enabled)?'':'disabled'}">
      <td><strong>${esc(r.label)}</strong><br><span class="muted">ID ${esc(r.id)} · Prio ${esc(r.priority)}</span>${ruleTierBadge(r) ? `<br>${ruleTierBadge(r)}` : ''}</td>
      <td>${statusButton}</td>
      <td>${esc(range)}</td>
      <td>${profileInline(r)}</td>
      <td>${chatBlockInline(r)}</td>
      <td>${ruleSoundInline(r)}</td>
      <td><strong>${esc(duration)}</strong></td>
      <td class="actions-cell"><div class="row-actions"><button class="icon-action-btn edit" data-edit-rule="${esc(r.id)}" title="Regel bearbeiten" aria-label="Regel bearbeiten">✎</button><button class="icon-action-btn test" data-test-rule="${esc(r.id)}" title="Alert testen" aria-label="Alert testen">▶</button><button class="icon-action-btn danger" data-del-rule="${esc(r.id)}" title="Regel löschen" aria-label="Regel löschen">×</button></div></td>
    </tr>`;
  }

  function durationText(r){
    const mode = r.duration_mode || 'fixed';
    if (mode === 'sound') {
      const dur = ruleSoundDurationMs(r);
      if (!dur) return fmtMs(r.duration_ms || 0);
      return calcDurationFromSoundMs(dur, r.duration_ms);
    }
    return fmtMs(r.duration_ms || 0);
  }

  function assetInline(label, url){
    if (!label && !url) return '<span class="muted">—</span>';
    const play = url ? `<button type="button" class="sound-icon-btn" data-play-sound="${esc(url)}" title="Sound abspielen" aria-label="Sound abspielen">▶</button>` : '';
    return `<div class="sound-inline">${play}<div><strong>${esc(label || 'Sound')}</strong><br><span class="muted path-small">${esc(url || '')}</span></div></div>`;
  }

  function ruleSoundInline(rule){
    const mediaId = ruleSoundMediaId(rule);
    if (!mediaId) return assetInline(rule?.sound_label, rule?.sound_url);
    const mediaLabel = rule.sound_media_label || rule.soundMediaLabel || `MediaId ${mediaId}`;
    const mediaDuration = ruleSoundMediaDurationMs(rule);
    const mediaInfo = `${mediaLabel}${mediaDuration ? ` · ${fmtMs(mediaDuration)}` : ''}`;
    const fallback = rule?.sound_label || rule?.sound_url ? `Fallback: ${rule.sound_label || rule.sound_url}` : 'kein Legacy-Fallback gesetzt';
    return `<div class="sound-inline"><div><strong>${esc(mediaInfo)}</strong><br><span class="muted path-small">Media-Registry #${esc(mediaId)} · ${esc(fallback)}</span></div></div>`;
  }

  function soundAssetById(id){
    if (id === null || id === undefined || id === '') return null;
    return state.assets.find(a => a.asset_type === 'sound' && Number(a.id) === Number(id)) || null;
  }

  function imageAssetById(id){
    if (id === null || id === undefined || id === '') return null;
    return state.assets.find(a => a.asset_type === 'image' && Number(a.id) === Number(id)) || null;
  }

  function selectedSoundUrl(id){
    return soundAssetById(id)?.public_url || '';
  }


  function displayProfileLabel(r){
    if (!r) return '';
    if (r.display_profile_name) return r.display_profile_name;
    const id = r.display_profile_id ?? r.displayProfileId;
    const profile = state.displayProfiles.find(p => Number(p.id) === Number(id));
    if (profile) return profile.name || `Profil ${profile.id}`;
    const def = state.displayProfiles.find(p => Number(p.is_default) === 1) || state.displayProfiles[0];
    return def ? `${def.name || 'Standardprofil'} (Standard)` : 'Standard';
  }

  function profileInline(r){
    const explicit = r && r.display_profile_id !== null && r.display_profile_id !== undefined && r.display_profile_id !== '';
    const name = displayProfileLabel(r);
    return `<strong>${esc(name || 'Standard')}</strong><br><span class="muted path-small">${explicit ? 'Regelprofil' : 'Fallback: Standard'}</span>`;
  }

  function selectedChatBlockIdForRule(r){
    const meta = r && r.meta && typeof r.meta === 'object' ? r.meta : {};
    const chat = meta.chatMessage && typeof meta.chatMessage === 'object' ? meta.chatMessage : {};
    const enabled = chat.enabled === true || chat.enabled === 1 || chat.enabled === '1' || chat.enabled === 'true';
    const id = chat.blockId ?? chat.block_id ?? chat.chatBlockId ?? chat.chat_block_id ?? '';
    return enabled && id !== null && id !== undefined && String(id) !== '' ? String(id) : '';
  }

  function chatBlockLabelForRule(r){
    const id = selectedChatBlockIdForRule(r);
    if (!id) return 'Nein';
    const block = (state.chatBlocks || []).find(b => Number(b.id) === Number(id));
    return block ? (block.label || ('Textblock ' + block.id)) : ('Textblock ID ' + id);
  }

  function chatBlockInline(r){
    const id = selectedChatBlockIdForRule(r);
    if (!id) return '<span class="muted">Nein</span>';
    const block = (state.chatBlocks || []).find(b => Number(b.id) === Number(id));
    const label = block ? (block.label || ('Textblock ' + block.id)) : ('Textblock ID ' + id);
    const count = block ? parseChatTexts(block.texts || block.texts_json || []).length : 0;
    return `<span class="chat-text-cell"><strong>${esc(label)}</strong><span class="muted path-small">zufällig${count ? ' · ' + count + ' Text(e)' : ''}</span></span>`;
  }

  function chatBlockOptions(source, typeKey, selected){
    const rows = (state.chatBlocks || []).filter(b => Number(b.enabled ?? 1) === 1 && b.source === source && b.type_key === typeKey);
    const opts = [opt('', 'Nein · keinen Chat-Text senden', selected == null || selected === '')];
    rows.forEach(b => opts.push(opt(b.id, b.label || ('Textblock ' + b.id), selected)));
    if (selected && !rows.some(b => Number(b.id) === Number(selected))) opts.push(opt(selected, 'Fehlender/anderer Textblock ID ' + selected, selected));
    return opts.join('');
  }

  function displayProfileOptions(selected, includeDefault){
    const rows = [];
    if (includeDefault) rows.push(opt('', '— Standardprofil verwenden —', selected == null || selected === ''));
    for (const p of state.displayProfiles) rows.push(opt(p.id, `${p.name || ('Profil ' + p.id)}${Number(p.is_default)?' · Standard':''}`, selected));
    return rows.join('');
  }


  const PLACEHOLDER_HELP = {
    userDisplayName: 'Anzeigename des Users, z.B. ForrestCGN',
    userLogin: 'Twitch-Login des Users, kleingeschrieben falls vorhanden',
    amount: 'Rohwert: Bits, Betrag, Viewerzahl oder Monate als Zahl',
    amountFormatted: 'Fertig formatierter Wert, z.B. 100 Bits, 5,00 €, 12 Viewer',
    currency: 'Währung bei Donations, z.B. EUR oder USD',
    months: 'Gesamtmonate bei Sub/Resub, falls vorhanden',
    streakMonths: 'Streak-Monate bei Resub, falls vorhanden',
    viewerCount: 'Viewerzahl bei Raids, falls vorhanden',
    recipientDisplayName: 'Empfänger bei Gift-Subs, falls vorhanden',
    provider: 'Anbieter/Provider, z.B. Twitch, Ko-fi oder Tipeee',
    source: 'Quelle technisch, z.B. twitch, kofi oder tipeee',
    type: 'Alert-Art technisch, z.B. bits, follow, donation oder raid',
    message: 'Nachricht des Users, falls vom Provider geliefert',
    ruleLabel: 'Name der gematchten Alert-Regel'
  };

  function placeholderChip(key){
    const help = PLACEHOLDER_HELP[key] || 'Platzhalter';
    return `<code class="placeholder-chip" title="${esc(help)} · klicken zum Einfügen" data-help="${esc(help)}" data-placeholder-key="${esc(key)}">{${esc(key)}}</code>`;
  }

  function placeholdersHtml(){
    const keys = Object.keys(PLACEHOLDER_HELP);
    return `<div class="placeholder-box">
      <strong>Platzhalter:</strong>
      ${keys.map(placeholderChip).join(' ')}
      <span class="placeholder-help-note">Hover zeigt die Bedeutung. Klick fügt den Platzhalter in das zuletzt aktive Textfeld ein.</span>
    </div>`;
  }

  function chatBlocksPage(){

    const list = (state.chatBlocks || [])
      .filter(v => state.source === 'all' || v.source === state.source)
      .filter(v => state.type === 'all' || v.type_key === state.type)
      .sort((a,b)=>String(a.source).localeCompare(String(b.source)) || String(a.type_key).localeCompare(String(b.type_key)) || Number(a.sort_order||0)-Number(b.sort_order||0));
    const rows = list.map(b => {
      const texts = Array.isArray(b.texts) ? b.texts : [];
      return `<tr class="${Number(b.enabled)?'':'disabled'}">
        <td><strong>${esc(SOURCE_LABELS[b.source] || b.source)} · ${esc(TYPE_LABELS[b.type_key] || b.type_key)}</strong><br><span class="muted">ID ${esc(b.id)} · ${Number(b.enabled)?'Aktiv':'Inaktiv'} · Sort ${esc(b.sort_order || 100)}</span></td>
        <td><strong>${esc(b.label || 'Chat-Textblock')}</strong><br><span class="muted">${esc(texts.length)} Text(e)</span></td>
        <td class="chat-text-lines">${texts.slice(0,3).map(t=>'• '+esc(t)).join('<br>')}${texts.length > 3 ? '<br><span class="muted">…</span>' : ''}</td>
        <td class="row-actions"><button data-edit-chat-block="${esc(b.id)}">Bearbeiten</button><button data-del-chat-block="${esc(b.id)}" class="danger">Löschen</button></td>
      </tr>`;
    }).join('');
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head"><div><h2>Chat-Texte</h2><p class="small-note">Textblöcke pro Alert-Art. Im Regel-Editor wählst du direkt Nein oder den gewünschten Textblock aus. Bei mehreren Texten wird zufällig genau einer gewählt und einmal pro Alert gesendet.</p></div><button class="success" id="newChatBlock">+ Chat-Textblock</button></div>
      ${filtersHtml()}
      ${placeholdersHtml()}
      <div class="table-wrap"><table class="table"><thead><tr><th>Typ</th><th>Name</th><th>Texte</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4">Keine Chat-Textblöcke vorhanden.</td></tr>'}</tbody></table></div>
    </section>`;
  }

  function designPage(){
    const profile = state.displayProfiles.find(p => Number(p.id) === Number(state.displayProfileId)) || state.displayProfiles.find(p => Number(p.is_default) === 1) || state.displayProfiles[0] || { name:'Neon Badge Standard', enabled:1, is_default:1, settings:{} };
    state.displayProfileId = profile.id || state.displayProfileId;
    const st = normalizeCropDefaultsOnEditorStart({ widthMode:'custom', overlayPosition:'custom', positionX:50, positionY:50, cardWidthPx:1120, cardHeightPx:300, sizeScale:1, fontScale:1, headlineScale:1, valueScale:1, avatarPosition:'left', avatarSize:'normal', providerLogoStyle:'tile', topGraphicAssetId:'', topGraphicMediaId:'', topGraphicMediaUrl:'', topGraphicMediaLabel:'', topGraphicUrl:'', topGraphicScale:1, topGraphicOffsetY:-18, topGraphicShape:'original', topGraphicFrameStrength:'normal', topGraphicImageZoom:1, topGraphicImageX:50, topGraphicImageY:50, topGraphicFrameStyle:'none', cardBorderColorA:'#8ff4ff', cardBorderColorB:'#c45cff', innerBorderEnabled:true, badgeEnabled:false, badgeStyle:'none', badgeScale:1, textAlign:'left', messageEnabled:true, messageScale:1, messageWidthMode:'normal', messageMaxLines:0, messageWeight:'normal', showSideLines:true, showParticles:true, glowStrength:'normal', celebrationStrength:'medium', ...(profile.settings || {}) });
    const profileOptions = state.displayProfiles.map(p => opt(p.id, `${p.name}${Number(p.is_default)?' · Standard':''}`, profile.id)).join('');
    const topGraphicMediaId = displayTopGraphicMediaId(st);
    const topGraphicMediaLabel = displayTopGraphicMediaLabel(st);
    const legacyTopGraphicLabel = selectedImageAssetLabel(st.topGraphicAssetId);
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head">
        <div><h2>Design / Live-Vorschau</h2><p class="small-note">Ein Alert ist hier ein Design. Auswählen = bearbeiten. Neu = neues Design mit Standardwerten.</p></div>
        <div class="head-actions design-head-actions"><button id="openDesignPopout">1920×1080</button><button id="playDesignPreview">Overlay-Test</button><button class="success" id="createDisplayProfile">+ Neu</button><button class="success" id="saveDisplayProfile">Speichern</button><button class="danger" id="deleteDisplayProfile">Löschen</button></div>
      </div>
      <div class="design-page-grid">
        <div class="design-form-panel">
          <div class="design-scroll">
            <div class="design-section design-section-profile">
              <h3>Profil</h3>
              <label>Profil<select id="displayProfileId">${profileOptions}</select></label>
              <label>Name<input id="displayProfileName" value="${esc(profile.name || '')}"></label>
              <label>Beschreibung<input id="displayProfileDesc" value="${esc(profile.description || '')}"></label>
              <label>Vorschau-Text<select id="designPreviewVariant">${designPreviewVariantOptions()}</select></label>
            </div>

            <div class="design-section">
              <h3>1. Alert-Größe & Position</h3>
              <div class="config-grid design-grid">
                <input type="hidden" data-display-key="widthMode" value="custom">
                <input type="hidden" data-display-key="overlayPosition" value="custom">
                ${compactRangeHtml('cardWidthPx','Breite px', st.cardWidthPx ?? 1120, 560, 1600, 10)}
                ${compactRangeHtml('cardHeightPx','Höhe px', st.cardHeightPx ?? 300, 180, 520, 10)}
                ${compactRangeHtml('positionX','Horizontal %', st.positionX ?? 50, 0, 100, 1)}
                ${compactRangeHtml('positionY','Vertikal %', st.positionY ?? 50, 0, 100, 1)}
                ${rangeHtml('sizeScale','Gesamtgröße', st.sizeScale, .7, 1.35, .01)}
              </div>
            </div>

            <div class="design-section">
              <h3>2. Inhalt: Avatar / Logo</h3>
              <div class="config-grid design-grid">
                ${selectHtml('avatarPosition','Avatar-Position', st.avatarPosition, [['left','links'],['right','rechts'],['top','oben'],['bottom','unten'],['hidden','ausblenden']])}
                ${selectHtml('avatarSize','Avatar-Größe', st.avatarSize, [['small','klein'],['normal','normal'],['large','groß']])}
                ${selectHtml('providerLogoStyle','Avatar-/Logo-Form', st.providerLogoStyle, [['tile','Kachel'],['round','rund'],['original','original']])}
              </div>
            </div>

            <div class="design-section">
              <h3>3. Inhalt: Text</h3>
              <div class="config-grid design-grid text-settings-grid">
                ${selectHtml('textAlign','Textausrichtung', st.textAlign, [['left','links'],['center','zentriert'],['right','rechts']])}
                ${rangeHtml('fontScale','Schriftgröße', st.fontScale, .75, 1.35, .01)}
                ${rangeHtml('headlineScale','Headline-Größe', st.headlineScale, .7, 1.4, .01)}
                ${rangeHtml('valueScale','Betrag/Wert-Größe', st.valueScale, .7, 1.4, .01)}
              </div>
              <div class="text-subsection-title">
                <strong>Nachrichtentext</strong>
                <span>Steuert nur den kleinen User-Text unter dem Alert. Headline, Wert, Sound, TTS und Queue bleiben unverändert.</span>
              </div>
              <div class="config-grid design-grid message-settings-grid">
                ${selectHtml('messageEnabled','Nachricht anzeigen', st.messageEnabled === false ? 'false':'true', [['true','anzeigen'],['false','ausblenden']])}
                ${rangeHtml('messageScale','Nachrichtengröße', st.messageScale ?? 1, .65, 1.8, .01)}
                ${selectHtml('messageWidthMode','Nachrichtenbreite', st.messageWidthMode || 'normal', [['compact','kompakt'],['normal','normal'],['wide','breit'],['full','volle Breite']])}
                ${selectHtml('messageMaxLines','Max. Zeilen', String(st.messageMaxLines ?? 0), [['0','alle'],['1','1 Zeile'],['2','2 Zeilen'],['3','3 Zeilen']])}
                ${selectHtml('messageWeight','Nachricht fett', st.messageWeight || 'normal', [['normal','normal'],['bold','fett']])}
              </div>
            </div>

            <div class="design-section">
              <h3>4. Grafik über dem Alert</h3>
              <div class="config-grid design-grid">
                <label class="wide-field">Grafik aus Media-Registry
                  <input type="hidden" data-display-key="topGraphicMediaId" value="${esc(topGraphicMediaId)}">
                  <input type="hidden" data-display-key="topGraphicMediaUrl" value="${esc(st.topGraphicMediaUrl || '')}">
                  <input type="hidden" data-display-key="topGraphicMediaLabel" value="${esc(st.topGraphicMediaLabel || '')}">
                  <div class="sound-select-row sound-media-picker-row"><input id="topGraphicMediaInfo" value="${esc(topGraphicMediaLabel)}" readonly><button type="button" id="pickTopGraphicMedia">Auswählen</button><button type="button" id="clearTopGraphicMedia" ${topGraphicMediaId ? '' : 'disabled'} title="Media-Registry-Grafik entfernen" aria-label="Media-Registry-Grafik entfernen">×</button></div>
                </label>
                <label class="wide-field">Alte Grafik / Fallback
                  <select data-display-key="topGraphicAssetId" aria-label="Alte Grafik / Fallback">${imageAssetSelectItems(st.topGraphicAssetId).map(([v,l])=>opt(v,l,st.topGraphicAssetId || '')).join('')}</select>
                </label>
                ${selectHtml('topGraphicShape','Grafik-Form', st.topGraphicShape || st.topGraphicFrameStyle || 'original', [['original','Original'],['round','Kreis'],['tile','Kachel'],['heart','Herz'],['shield','Schild'],['hexagon','Hexagon'],['diamond','Diamant'],['star','Stern']])}
                ${selectHtml('topGraphicFrameStrength','Grafik-Outline', normalizeGraphicOutline(st.topGraphicFrameStrength), [['soft','dezent'],['normal','normal']])}
                ${rangeHtml('topGraphicScale','Grafik-Größe', st.topGraphicScale ?? 1, .35, 2, .01)}
                ${rangeHtml('topGraphicOffsetY','Grafik-Höhe', st.topGraphicOffsetY ?? -18, -260, 180, 1)}
                ${rangeHtml('topGraphicImageZoom','Ausschnitt-Zoom', st.topGraphicImageZoom ?? 1, .6, 2.5, .01)}
                ${rangeHtml('topGraphicImageX','Ausschnitt X', st.topGraphicImageX ?? 50, 0, 100, 1)}
                ${rangeHtml('topGraphicImageY','Ausschnitt Y', st.topGraphicImageY ?? 50, 0, 100, 1)}
                <label class="compact-range"><span>Grafik</span><b class="range-value">1 / 50 / 50</b><button type="button" class="small-btn" id="centerTopGraphicCrop">Zentrieren</button></label>
              </div>
            </div>

            <div class="design-section">
              <h3>5. Rahmen & Linien</h3>
              <p class="small-note">Fester CGN-Verlauf: Cyan oben, Neon-Lila außen/unten. Innenlinie kann separat aus.</p>
              <div class="config-grid design-grid">
                ${selectHtml('innerBorderEnabled','Innenlinie', st.innerBorderEnabled === false ? 'false':'true', [['true','anzeigen'],['false','ausblenden']])}
                ${selectHtml('showSideLines','Seitenlinien/Rauten', st.showSideLines ? 'true':'false', [['true','anzeigen'],['false','ausblenden']])}
              </div>
            </div>

            <div class="design-section">
              <h3>6. Effekte & Celebration</h3>
              <p class="small-note">Reduziert auf zwei leichte Effekte: Herzregen und Sternenglanz. Feuerwerk ist wegen OBS/Browser-Performance entfernt.</p>
              <div class="config-grid design-grid">
                ${selectHtml('previewCelebration','Celebration-Vorschau', st.previewCelebration || 'none', CELEBRATIONS)}
                ${selectHtml('celebrationStrength','Celebration-Stärke', st.celebrationStrength || 'medium', CELEBRATION_STRENGTHS)}
                ${selectHtml('glowStrength','Glow', st.glowStrength, [['soft','weich'],['normal','normal'],['strong','stark']])}
                ${selectHtml('showParticles','Hintergrund-Partikel', st.showParticles ? 'true':'false', [['true','anzeigen'],['false','ausblenden']])}
              </div>
            </div>
          </div>
        </div>
        <div class="design-preview-panel">
          <h3>Live-Vorschau</h3>
          <p class="small-note">Die Vorschau nutzt eine 16:9-OBS-Fläche. Position und Breite werden proportional simuliert. „1920×1080 Vorschau“ öffnet ein separates Fenster für einen zweiten Monitor.</p>
          <div id="alertDesignPreview" class="alert-design-preview"></div>
        </div>
      </div>
    </section>`;
  }

  function selectHtml(key,label,value,items){ return `<label>${esc(label)}<select data-display-key="${esc(key)}">${items.map(([v,l])=>opt(v,l,value)).join('')}</select></label>`; }
  function colorHtml(key,label,value){ return `<label>${esc(label)}<input data-display-key="${esc(key)}" type="color" value="${esc(value || '#c45cff')}"></label>`; }
  function rangeHtml(key,label,value,min,max,step){ return `<label>${esc(label)} <span class="range-value">${esc(value)}</span><input data-display-key="${esc(key)}" type="range" min="${esc(min)}" max="${esc(max)}" step="${esc(step)}" value="${esc(value)}"></label>`; }
  function compactRangeHtml(key,label,value,min,max,step){ return `<label class="compact-range"><span>${esc(label)}</span><b class="range-value">${esc(value)}</b><input data-display-key="${esc(key)}" type="range" min="${esc(min)}" max="${esc(max)}" step="${esc(step)}" value="${esc(value)}"></label>`; }

  function imageAssetSelectItems(selected){
    const rows = [['','— keine Grafik —']];
    (state.assets || []).filter(a => a.asset_type === 'image').forEach(a => rows.push([a.id, a.label || a.original_name || a.public_url || ('Bild #' + a.id)]));
    return rows;
  }

  function selectedImageAssetUrl(id){
    if (id === null || id === undefined || id === '') return '';
    const a = (state.assets || []).find(x => Number(x.id) === Number(id));
    return a ? (a.public_url || a.url || a.path || '') : '';
  }

  function selectedImageAssetLabel(id){
    if (id === null || id === undefined || id === '') return 'keine alte Grafik gesetzt';
    const a = (state.assets || []).find(x => Number(x.id) === Number(id));
    if (!a) return 'alte Grafik nicht gefunden';
    return a.label || a.original_name || a.public_url || `Grafik ${a.id || id}`;
  }

  function displayTopGraphicMediaId(settings){
    const id = Number(settings?.topGraphicMediaId ?? settings?.top_graphic_media_id ?? 0);
    return Number.isFinite(id) && id > 0 ? id : '';
  }

  function displayTopGraphicMediaLabel(settings){
    const id = displayTopGraphicMediaId(settings);
    if (!id) return '— keine Media-Registry-Grafik —';
    const label = settings?.topGraphicMediaLabel || settings?.top_graphic_media_label || settings?.topGraphicMediaPath || settings?.top_graphic_media_path || settings?.topGraphicMediaUrl || settings?.top_graphic_media_url || `MediaId ${id}`;
    return `MediaId ${id} · ${label}`;
  }


  function designPreviewVariantOptions(){
    const variants = (state.textVariants || []).filter(v => Number(v.enabled ?? 1) === 1);
    if (!state.previewVariantId) {
      const bits = variants.find(v => String(v.source).toLowerCase() === 'twitch' && String(v.type_key).toLowerCase() === 'bits');
      state.previewVariantId = (bits || variants[0] || {}).id || null;
    }
    if (!variants.length) return '<option value="">Standard-Bits-Vorschau</option>';
    return variants.map(v => opt(v.id, `${SOURCE_LABELS[v.source] || v.source}/${TYPE_LABELS[v.type_key] || v.type_key} · ${v.label || 'Textvariante #' + v.id}`, state.previewVariantId)).join('');
  }

  function selectedPreviewVariant(){
    const id = Number(root.querySelector('#designPreviewVariant')?.value || state.previewVariantId || 0);
    return (state.textVariants || []).find(v => Number(v.id) === id) || (state.textVariants || []).find(v => String(v.source).toLowerCase() === 'twitch' && String(v.type_key).toLowerCase() === 'bits') || null;
  }

  function displaySimpleLabel(value){
    const map = { left:'links', right:'rechts', top:'oben', bottom:'unten', hidden:'aus', small:'klein', normal:'normal', large:'groß' };
    return map[value] || value || '';
  }

  function presetsPage(){
    const list = state.testPresets
      .filter(v => state.source === 'all' || v.source === state.source)
      .filter(v => state.type === 'all' || v.type_key === state.type)
      .sort((a,b)=>String(a.source).localeCompare(String(b.source)) || String(a.type_key).localeCompare(String(b.type_key)) || Number(a.sort_order||0)-Number(b.sort_order||0));
    const rows = list.map(p => `<tr class="${Number(p.enabled)?'':'disabled'}">
      <td><strong>${esc(SOURCE_LABELS[p.source] || p.source)} · ${esc(TYPE_LABELS[p.type_key] || p.type_key)}</strong><br><span class="muted">ID ${esc(p.id)} ${p.rule_id ? `· Regel ${esc(p.rule_id)}` : ''}</span></td>
      <td><strong>${esc(p.label || 'Preset')}</strong><br><span class="muted">${Number(p.enabled)?'Aktiv':'Inaktiv'}</span></td>
      <td><code>${esc(JSON.stringify(p.payload || {}))}</code></td>
      <td class="row-actions"><button data-play-preset="${esc(p.id)}">Im Overlay testen</button><button data-edit-preset="${esc(p.id)}">Bearbeiten</button><button data-del-preset="${esc(p.id)}" class="danger">Löschen</button></td>
    </tr>`).join('');
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head"><div><h2>Testwerte / Vorschau</h2><p class="small-note">Presets laufen durch die echte Backend-Logik: Regel, Textvariante, Platzhalter, Sound und Overlay.</p></div><button class="success" id="newPreset">+ Testpreset</button></div>
      ${filtersHtml()}
      <div class="table-wrap"><table class="table"><thead><tr><th>Typ</th><th>Name</th><th>Payload</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4">Keine Testpresets vorhanden.</td></tr>'}</tbody></table></div>
    </section>`;
  }

  function assetsPage(){
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head">
        <div><h2>Sounds & Grafiken</h2><p class="small-note">Uploads und Vorschau sind hier getrennt von der Regelübersicht.</p></div>
        <div class="head-actions"><button id="openUploadSound">+ Sound hochladen</button><button id="openUploadImage">+ Grafik hochladen</button><button id="scanDurations">Soundlängen scannen</button></div>
      </div>
      <div class="asset-page-grid">
        <div><h3>Sounds</h3>${assetTable('sound')}</div>
        <div><h3>Grafiken</h3>${assetTable('image')}</div>
      </div>
    </section>`;
  }

  function assetTable(kind){
    const list = state.assets.filter(a => a.asset_type === kind);
    const rows = list.map(a => assetRow(a)).join('');
    const headers = kind === 'sound'
      ? '<tr><th>Name</th><th>Dauer</th><th>Größe</th><th>Nutzung</th><th></th></tr>'
      : '<tr><th>Vorschau</th><th>Name</th><th>Größe</th><th>Nutzung</th><th></th></tr>';
    return `<div class="table-wrap"><table class="table ${kind === 'sound' ? 'sound-assets-table' : ''}"><thead>${headers}</thead><tbody>${rows || `<tr><td colspan="5">Keine ${kind === 'sound' ? 'Sounds' : 'Grafiken'} vorhanden.</td></tr>`}</tbody></table></div>`;
  }

  function assetRow(a){
    const used = assetUsageCount(a);
    const canDelete = used === 0;
    if (a.asset_type === 'sound') {
      return `<tr><td><strong>${esc(a.label || a.original_name || 'Sound')}</strong><br><span class="muted path-small">${esc(a.public_url)}</span></td><td>${fmtMs(a.duration_ms)}</td><td>${bytes(a.size_bytes)}</td><td>${used ? `${used} Regel(n)` : '<span class="muted">frei</span>'}</td><td class="row-actions"><button type="button" class="sound-icon-btn" data-play-sound="${esc(a.public_url)}" title="Sound abspielen" aria-label="Sound abspielen">▶</button><button type="button" data-del-asset="${esc(a.id)}" class="danger" ${canDelete?'':'disabled'}>Löschen</button></td></tr>`;
    }
    return `<tr><td>${a.public_url ? `<img class="preview-img" src="${esc(a.public_url)}" alt="">` : ''}</td><td><strong>${esc(a.label || a.original_name || 'Grafik')}</strong><br><span class="muted path-small">${esc(a.public_url)}</span></td><td>${bytes(a.size_bytes)}</td><td>${used ? `${used} Regel(n)` : '<span class="muted">frei</span>'}</td><td class="row-actions"><button data-del-asset="${esc(a.id)}" class="danger" ${canDelete?'':'disabled'}>Löschen</button></td></tr>`;
  }

  function assetUsageCount(asset){
    const id = Number(asset.id);
    return state.rules.filter(r => Number(r.sound_asset_id) === id || Number(r.image_asset_id) === id).length;
  }

  function testsPage(){
    const testSource = state.source !== 'all' ? state.source : 'twitch';
    const testType = state.type !== 'all' ? state.type : (availableTypes(testSource)[0]?.type_key || 'bits');
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head"><div><h2>Testcenter</h2><p class="small-note">Alerts gezielt testen, ohne die Regelverwaltung zu überladen.</p></div><button class="danger" id="clearQueue">Queue leeren</button></div>
      <div class="test-grid">
        <label>Quelle<select id="testSource">${sources(false).map(s => opt(s,SOURCE_LABELS[s]||s,testSource)).join('')}</select></label>
        <label>Typ<input id="testTypeKey" value="${esc(testType)}"></label>
        <label>User<input id="testUser" value="ForrestCGN"></label>
        <label>Amount<input id="testAmount" type="number" value="150"></label>
        <label class="wide-field">Nachricht<input id="testMsg" value="Test aus dem Dashboard"></label>
      </div>
      <div class="actions"><button class="success" id="playTest">Test Alert abspielen</button><button id="reloadApi">API Reload</button></div>
      <h3>Letzte Alerts</h3>${historyList(20)}
    </section>`;
  }

  function historyPage(){
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head">
        <div><h2>Letzte Alerts / History</h2><p class="small-note">Gespeicherte Alerts erneut in die interne Queue legen. Provider werden dabei nicht erneut ausgelöst.</p></div>
        <button id="refreshHistory">Aktualisieren</button>
      </div>
      ${historyTable()}
    </section>`;
  }

  function historyList(limit, compact=false){
    const items = (state.history || state.status?.history || []).slice(0, limit);
    const rows = items.map(h => `<div class="alert-log-item">
      <div><strong>${esc(SOURCE_LABELS[h.source] || h.source)} · ${esc(TYPE_LABELS[h.type_key] || h.type_key)}</strong> · ${esc(h.user_display || h.user_login || '')}</div>
      <span class="muted">${esc(amountText(h))} · Regel: ${esc(h.rule?.label || '—')} · ${esc(h.finishReason || '')} · ${esc(formatDate(h.finished_at || h.created_at || ''))}</span>
      ${compact ? '' : `<button data-replay-alert="${esc(h.eventUid)}">Nochmal abspielen</button>`}
    </div>`).join('');
    return `<div class="alert-log">${rows || '<p class="muted">Noch keine Alerts.</p>'}</div>`;
  }

  function historyTable(){
    const rows = (state.history || state.status?.history || []).map(h => `<tr>
      <td><strong>${esc(SOURCE_LABELS[h.source] || h.source)}</strong><br><span class="muted">${esc(TYPE_LABELS[h.type_key] || h.type_key)}</span></td>
      <td>${esc(h.user_display || h.user_login || '—')}</td>
      <td>${esc(amountText(h))}</td>
      <td>${esc(h.message || '—')}</td>
      <td>${esc(h.rule?.label || '—')}</td>
      <td>${esc(formatDate(h.finished_at || h.started_at || h.created_at || ''))}<br><span class="muted">${esc(h.finishReason || h.status || '')}</span></td>
      <td class="row-actions"><button data-replay-alert="${esc(h.eventUid)}">Nochmal abspielen</button></td>
    </tr>`).join('');
    return `<div class="table-wrap"><table class="table history-table"><thead><tr><th>Quelle</th><th>User</th><th>Betrag</th><th>Nachricht</th><th>Regel</th><th>Zeit</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="7">Noch keine Alerts.</td></tr>'}</tbody></table></div>`;
  }

  function amountText(h){
    const amount = Number(h.amount || 0);
    return amount ? String(amount) : '—';
  }

  function formatDate(v){
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString('de-DE');
  }


  function safeObj(value){ return value && typeof value === 'object' ? value : {}; }
  function safeStats(value){ return safeObj(value && value.stats ? value.stats : value); }
  function busOutputMode(){ return String((state.status && state.status.alertOutput && state.status.alertOutput.mode) || (state.status && state.status.config && state.status.config.alertOutput && state.status.config.alertOutput.mode) || 'legacy'); }
  function yesNo(value){ return value ? 'Ja' : 'Nein'; }
  function shortId(value, len=13){ const raw=String(value||''); return raw.length>len ? raw.slice(0,len)+'…' : raw || '—'; }
  function actionsText(actions){
    const obj = safeObj(actions);
    const keys = Object.keys(obj);
    if (!keys.length) return '—';
    return keys.map(k => `${k}:${obj[k]}`).join(' · ');
  }
  function rolesText(roles){
    const obj = safeObj(roles);
    const keys = Object.keys(obj);
    if (!keys.length) return '—';
    return keys.map(k => `${k}:${obj[k]}`).join(' · ');
  }

  function busSyncMiniHtml(){
    const s = state.status || {};
    const output = s.alertOutput || {};
    const corr = s.alertSoundCorrelation || {};
    const stats = safeStats(corr.stats);
    return `<div class="alert-bus-mini-grid">
      <div><span>Output</span><strong>${esc(output.mode || busOutputMode())}</strong></div>
      <div><span>Legacy</span><strong>${esc(yesNo(output.legacyEnabled))}</strong></div>
      <div><span>Bus</span><strong>${esc(yesNo(output.busEnabled))}</strong></div>
      <div><span>Bundles OK</span><strong>${esc(stats.bundlesOk ?? 0)}</strong></div>
      <div><span>Bundle-Fehler</span><strong class="${Number(stats.bundlesFailed||0) ? 'bad' : 'ok'}">${esc(stats.bundlesFailed ?? 0)}</strong></div>
      <div><span>Letzte Bundle-ID</span><strong>${esc(shortId(stats.lastBundleId || ''))}</strong></div>
    </div>`;
  }

  function busSyncPage(){
    const s = state.status || {};
    const output = s.alertOutput || {};
    const outputStats = safeStats(output.stats);
    const corr = s.alertSoundCorrelation || {};
    const corrStats = safeStats(corr.stats);
    const watchdog = s.overlayWatchdog || {};
    const watchdogStats = safeStats(watchdog.stats);
    const lastWatch = watchdog.last || {};
    const recent = Array.isArray(corr.recent) ? corr.recent : [];
    const cfg = s.config || {};
    const alertOutputCfg = cfg.alertOutput || {};
    const bus = output.bus || alertOutputCfg.bus || {};
    return `<section class="card glass span-12 page-card alert-bus-page">
      <div class="card-head big-head">
        <div>
          <h2>Alert / SoundBus Sync</h2>
          <p class="small-note">Korrelation zwischen Alert-System, Alert-SoundBundle, SoundBus und Overlay-Watchdog. Steuerung bleibt bewusst vorsichtig: kein Bus-only-Produktivwechsel.</p>
        </div>
        <div class="head-actions">
          <button id="refreshAlertsBusStatus">Status aktualisieren</button>
          <button class="success" id="saveAlertOutputMode">Output-Modus speichern</button>
        </div>
      </div>

      <div class="alert-bus-mode-panel">
        <label>Alert Output Modus
          <select id="alertOutputModeSelect">
            ${['legacy','legacy_and_bus','bus_first','bus_only'].map(mode => opt(mode, modeLabel(mode), output.mode || busOutputMode())).join('')}
          </select>
        </label>
        <div class="alert-bus-mode-hint ${output.mode === 'bus_only' ? 'bad' : output.mode === 'bus_first' ? 'warn' : 'ok'}">
          <strong>${esc(modeLabel(output.mode || busOutputMode()))}</strong>
          <span>${esc(modeHint(output.mode || busOutputMode()))}</span>
        </div>
      </div>

      <div class="alert-bus-kpis">
        ${busKpi('Output', output.mode || busOutputMode(), '', '')}
        ${busKpi('Legacy aktiv', yesNo(output.legacyEnabled), '', output.legacyEnabled ? 'ok' : 'warn')}
        ${busKpi('Bus aktiv', yesNo(output.busEnabled), '', output.busEnabled ? 'ok' : '')}
        ${busKpi('Comm-Bus', yesNo(output.communicationBusAvailable), '', output.communicationBusAvailable ? 'ok' : 'bad')}
        ${busKpi('Bundles vorbereitet', corrStats.bundlesPrepared ?? 0, `${corrStats.itemsPrepared ?? 0} Items`, '')}
        ${busKpi('Bundles OK', corrStats.bundlesOk ?? 0, `${corrStats.bundlesFailed ?? 0} Fehler`, Number(corrStats.bundlesFailed || 0) ? 'bad' : 'ok')}
        ${busKpi('Alert-Bus Events', outputStats.emittedBus ?? 0, `${outputStats.errors ?? 0} Fehler`, Number(outputStats.errors || 0) ? 'bad' : '')}
        ${busKpi('Watchdog', lastWatch.status || '—', lastWatch.issue || '', lastWatch.status === 'acknowledged' ? 'ok' : (lastWatch.status ? 'warn' : ''))}
      </div>

      <div class="alert-bus-detail-grid">
        <section class="alert-bus-subcard">
          <h3>Output / Bus</h3>
          ${detailRow('Channel', bus.channel || 'visual.alert')}
          ${detailRow('Action', bus.action || 'play')}
          ${detailRow('Clear', bus.clearAction || 'clear')}
          ${detailRow('Require ACK', yesNo(bus.requireAck))}
          ${detailRow('Replayable', yesNo(bus.replayable))}
          ${detailRow('TTL', `${bus.ttlMs || 0}ms`)}
          ${detailRow('Letzte Bus-ID', outputStats.lastBusEventId || outputStats.lastEventId || '—')}
          ${detailRow('Letzter Fehler', outputStats.lastError || '—', Number(outputStats.errors||0) ? 'bad' : '')}
        </section>
        <section class="alert-bus-subcard">
          <h3>SoundBundle-Korrelation</h3>
          ${detailRow('Letzter Alert', corrStats.lastEventUid || '—')}
          ${detailRow('Letzte Bundle-ID', corrStats.lastBundleId || '—')}
          ${detailRow('Letzte Phase', corrStats.lastPhase || '—')}
          ${detailRow('Letzter Fehler', corrStats.lastError || '—', Number(corrStats.bundlesFailed||0) ? 'bad' : '')}
          ${detailRow('Zuletzt', formatDate(corrStats.lastAt || ''))}
        </section>
        <section class="alert-bus-subcard">
          <h3>Overlay-Watchdog</h3>
          ${detailRow('Aktiv', yesNo(watchdog.enabled))}
          ${detailRow('Overlay-Clients', watchdog.overlayClients ?? s.overlayClients ?? 0)}
          ${detailRow('Status', lastWatch.status || '—', lastWatch.status === 'acknowledged' ? 'ok' : '')}
          ${detailRow('ACK', formatDate(lastWatch.ackAt || ''))}
          ${detailRow('Issue', lastWatch.issue || '—', lastWatch.issue ? 'bad' : '')}
          ${detailRow('Timeout', yesNo(lastWatch.timedOut), lastWatch.timedOut ? 'bad' : '')}
        </section>
      </div>

      <section class="alert-bus-subcard span-full">
        <div class="card-head"><h3>Letzte Alert/SoundBundle-Korrelation</h3><button data-page="history">Alert-Historie öffnen</button></div>
        <div class="table-wrap"><table class="table alert-bus-table"><thead><tr><th>Zeit</th><th>Phase</th><th>Alert</th><th>Bundle</th><th>Quelle</th><th>User</th><th>Items</th><th>Status</th></tr></thead><tbody>
          ${recent.map(busCorrelationRow).join('') || '<tr><td colspan="8">Noch keine Korrelationsdaten vorhanden.</td></tr>'}
        </tbody></table></div>
      </section>
    </section>`;
  }

  function busKpi(title, value, sub, cls=''){
    return `<div class="alert-bus-kpi"><span>${esc(title)}</span><strong class="${esc(cls)}">${esc(value ?? '—')}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  }
  function detailRow(label, value, cls=''){
    return `<div class="alert-bus-detail-row"><span>${esc(label)}</span><strong class="${esc(cls)}">${esc(value ?? '—')}</strong></div>`;
  }
  function busCorrelationRow(row){
    return `<tr>
      <td>${esc(formatDate(row.at || ''))}</td>
      <td>${pill(row.phase || '—', row.ok ? 'ok' : (row.error ? 'bad' : ''))}</td>
      <td><code>${esc(shortId(row.eventUid || '', 18))}</code></td>
      <td><code>${esc(shortId(row.bundleId || '', 22))}</code></td>
      <td>${esc(row.source || '—')}<br><span class="muted">${esc(row.type || '')}</span></td>
      <td>${esc(row.user || '—')}</td>
      <td>${esc(row.itemsPrepared ?? 0)}</td>
      <td class="${row.error ? 'bad' : 'ok'}">${esc(row.error || (row.ok ? 'OK' : '—'))}</td>
    </tr>`;
  }
  function modeLabel(mode){
    const map = { legacy:'Legacy', legacy_and_bus:'Legacy + Bus', bus_first:'Bus First', bus_only:'Bus Only' };
    return map[String(mode||'')] || String(mode||'legacy');
  }
  function modeHint(mode){
    const map = {
      legacy:'Produktiv sicher: altes Overlay bleibt führend, Bus bleibt aus.',
      legacy_and_bus:'Parallelbetrieb: Legacy bleibt sichtbar, Bus bekommt zusätzlich Events.',
      bus_first:'Dev-Testpfad: Bus ist primär, Legacy bleibt Fallback.',
      bus_only:'Nur Test/Diagnose: kein Legacy-Fallback. Nicht als Produktivstandard verwenden.'
    };
    return map[String(mode||'')] || map.legacy;
  }

  function configPage(){
    const cfg = state.status?.config || {};
    return `<section class="card glass span-12 page-card">
      <div class="card-head big-head">
        <div><h2>Config</h2><p class="small-note">Grundwerte des Alert-Systems. Änderungen werden in config/alert_system.json gespeichert.</p></div>
        <div class="head-actions"><button id="reloadApi">Backend neu laden</button><button class="success" id="saveAlertConfig">Config speichern</button></div>
      </div>
      <div class="config-grid">
        ${configSelect('enabled','Alert-System aktiv', cfg.enabled, [['true','ja'],['false','nein']])}
        ${configSelect('overlayEnabled','Overlay aktiv', cfg.overlayEnabled, [['true','ja'],['false','nein']])}
        ${configSelect('queueEnabled','Queue aktiv', cfg.queueEnabled, [['true','ja'],['false','nein']])}
        ${configSelect('uploadEnabled','Uploads aktiv', cfg.uploadEnabled, [['true','ja'],['false','nein']])}
        ${configSelect('allowLanUploads','LAN-Uploads erlauben', cfg.allowLanUploads, [['true','ja'],['false','nein']])}
        ${configInput('defaultDurationMs','Standarddauer ms', cfg.defaultDurationMs || 7000, 'number')}
        ${configInput('soundDurationPaddingMs','Sound-Puffer ms', cfg.soundDurationPaddingMs || 1200, 'number')}
        ${configInput('minAutoDurationMs','Min. Sounddauer ms', cfg.minAutoDurationMs || 4000, 'number')}
        ${configInput('maxAutoDurationMs','Max. Sounddauer ms', cfg.maxAutoDurationMs || 60000, 'number')}
        ${configInput('fallbackFinishMs','Fallback-Finish ms', cfg.fallbackFinishMs || 12000, 'number')}
        ${configInput('gapBetweenAlertsMs','Pause zwischen Alerts ms', cfg.gapBetweenAlertsMs || 700, 'number')}
        ${configInput('ffprobeTimeoutMs','ffprobe Timeout ms', cfg.ffprobeTimeoutMs || 5000, 'number')}
        ${configInput('maxSoundSizeBytes','Max. Soundgröße Bytes', cfg.maxSoundSizeBytes || 15728640, 'number')}
        ${configInput('maxImageSizeBytes','Max. Bildgröße Bytes', cfg.maxImageSizeBytes || 10485760, 'number')}
        ${configInput('soundsDir','Sound-Ordner', cfg.soundsDir || 'htdocs/assets/sounds/alerts', 'text', true)}
        ${configInput('imagesDir','Bild-Ordner', cfg.imagesDir || 'htdocs/assets/images/alerts', 'text', true)}
        ${configSelect('chatMessageEnabled','Chat-Nachrichten bauen/speichern', cfg.chatMessageEnabled !== false, [['true','ja'],['false','nein']])}
        ${configInput('chatMessagePostUrl','Chat-Post-URL', cfg.chatMessagePostUrl || '', 'text', true)}
        ${configSelect('chatMessagePostMethod','Chat-Post-Methode', cfg.chatMessagePostMethod || 'POST', [['POST','POST JSON'],['GET','GET ?message=...']])}
        ${configInput('chatMessageTimeoutMs','Chat-Timeout ms', cfg.chatMessageTimeoutMs || 2500, 'number')}
      </div>
      <p class="small-note config-warning">Hinweis: Provider-Secrets wie Ko-fi/Tipeee werden hier absichtlich nicht angezeigt. Diese bleiben getrennt geschützt.</p>
    </section>`;
  }

  function configInput(key,label,value,type='text',wide=false){
    return `<label class="${wide?'wide-field':''}">${esc(label)}<input data-config-key="${esc(key)}" type="${esc(type)}" value="${esc(value ?? '')}"></label>`;
  }

  function configSelect(key,label,value,items){
    const current = String(value !== false);
    return `<label>${esc(label)}<select data-config-key="${esc(key)}">${items.map(([v,l])=>opt(v,l,current)).join('')}</select></label>`;
  }

  function readConfigForm(){
    const boolKeys = new Set(['enabled','overlayEnabled','queueEnabled','uploadEnabled','allowLanUploads','chatMessageEnabled']);
    const numberKeys = new Set(['defaultDurationMs','soundDurationPaddingMs','minAutoDurationMs','maxAutoDurationMs','fallbackFinishMs','gapBetweenAlertsMs','ffprobeTimeoutMs','maxSoundSizeBytes','maxImageSizeBytes','chatMessageTimeoutMs']);
    const out = {};
    root.querySelectorAll('[data-config-key]').forEach(el => {
      const key = el.dataset.configKey;
      const raw = el.value;
      if (boolKeys.has(key)) out[key] = raw === 'true';
      else if (numberKeys.has(key)) out[key] = Number(raw || 0);
      else out[key] = raw;
    });
    return out;
  }

  function defaultRule(){
    const source = state.source !== 'all' ? state.source : 'twitch';
    const type_key = state.type !== 'all' ? state.type : (source === 'kofi' || source === 'tipeee' ? 'donation' : 'bits');
    return normalizeRule({
      source, type_key, label:'Neue Staffel', min_value:0, max_value:null, tier:'normal', priority:100,
      duration_ms:7000, duration_mode:'fixed', animation:'neon_card', image_mode:'avatar_icon', enabled:1,
      sound_asset_id:null, image_asset_id:null, sound_media_id:null, image_media_id:null, display_profile_id:null,
      tts_enabled:0, tts_timing:'after_alert', tts_mode:'audio_only', tts_template:'{user} schreibt: {message}', tts_max_chars:250, tts_min_amount:null,
      meta:{ chatMessage:{ enabled:false, blockId:null } }
    });
  }

  function defaultRuleForCurrentDesign(){
    const rule = defaultRule();
    const profileId = root.querySelector('#displayProfileId')?.value || state.displayProfileId || null;
    if (profileId) rule.display_profile_id = profileId;
    return rule;
  }


  function normalizeRule(rule){
    const base = {
      source:'twitch', type_key:'bits', label:'Neue Staffel', min_value:0, max_value:null, tier:'normal', priority:100,
      duration_ms:7000, duration_mode:'fixed', animation:'neon_card', image_mode:'avatar_icon', enabled:1,
      sound_asset_id:null, image_asset_id:null, sound_media_id:null, image_media_id:null, display_profile_id:null,
      tts_enabled:0, tts_timing:'after_alert', tts_mode:'audio_only', tts_template:'{user} schreibt: {message}', tts_max_chars:250, tts_min_amount:null,
      meta_json:'{}', meta:{ chatMessage:{ enabled:false, blockId:null } }
    };
    const r = { ...base, ...(rule || {}) };
    r.duration_mode = r.duration_mode === 'sound' ? 'sound' : 'fixed';
    r.enabled = Number(r.enabled ?? 1);
    r.tts_enabled = Number(r.tts_enabled ?? 0);
    return r;
  }

  function modalHtml(){
    if (state.modal === 'rule') return ruleModal();
    if (state.modal === 'upload') return uploadModal();
    if (state.modal === 'variant') return variantModal();
    if (state.modal === 'chatBlock') return chatBlockModal();
    if (state.modal === 'preset') return presetModal();
    return '';
  }

  function alertSoundCategoryKey(typeKey){
    const key = String(typeKey || '').trim().toLowerCase();
    if (['follow', 'bits', 'sub', 'resub', 'gift_sub', 'gift_bomb', 'raid', 'donation', 'membership', 'shop', 'commission'].includes(key)) return key;
    return key || 'general';
  }

  function ruleSoundMediaId(rule){
    const raw = rule?.sound_media_id ?? rule?.soundMediaId ?? '';
    const id = Number(raw || 0);
    return Number.isFinite(id) && id > 0 ? id : '';
  }

  function ruleSoundMediaDurationMs(rule){
    const id = ruleSoundMediaId(rule);
    if (!id) return 0;
    const duration = Number(rule?.sound_media_duration_ms ?? rule?.soundMediaDurationMs ?? 0);
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
  }

  function ruleSoundDurationMs(rule){
    const mediaDuration = ruleSoundMediaDurationMs(rule);
    if (mediaDuration > 0) return mediaDuration;
    const legacyDuration = Number(rule?.sound_duration_ms ?? rule?.soundDurationMs ?? selectedSoundDuration(rule?.sound_asset_id) ?? 0);
    return Number.isFinite(legacyDuration) && legacyDuration > 0 ? legacyDuration : 0;
  }

  function ruleSoundMediaLabel(rule){
    const id = ruleSoundMediaId(rule);
    if (!id) return '— kein Media-Registry-Sound —';
    const label = rule?.sound_media_label || rule?.soundMediaLabel || rule?.sound_media_path || rule?.soundMediaPath || `MediaId ${id}`;
    const duration = ruleSoundMediaDurationMs(rule);
    return `MediaId ${id} · ${label}${duration ? ` · ${fmtMs(duration)}` : ''}`;
  }

  function ruleImageMediaId(rule){
    const raw = rule?.image_media_id ?? rule?.imageMediaId ?? '';
    const id = Number(raw || 0);
    return Number.isFinite(id) && id > 0 ? id : '';
  }

  function ruleImageMediaLabel(rule){
    const id = ruleImageMediaId(rule);
    if (!id) return '— keine Media-Registry-Grafik —';
    const label = rule?.image_media_label || rule?.imageMediaLabel || rule?.image_media_path || rule?.imageMediaPath || `MediaId ${id}`;
    return `MediaId ${id} · ${label}`;
  }

  function ruleLegacyImageLabel(imageAssetId){
    const asset = imageAssetById(imageAssetId);
    if (!asset) return 'kein altes Bild gesetzt';
    return asset.label || asset.original_name || asset.public_url || `Grafik ${asset.id || imageAssetId}`;
  }

  function ruleLegacySoundLabel(soundAssetId){
    const asset = soundAssetById(soundAssetId);
    if (!asset) return 'kein alter Sound gesetzt';
    return asset.label || asset.original_name || asset.public_url || `Sound ${asset.id || soundAssetId}`;
  }

  function ruleModal(){
    const r = state.modalRule || defaultRule();
    const isEdit = !!r.id;
    const soundDuration = ruleSoundDurationMs(r);
    const soundMediaId = ruleSoundMediaId(r);
    const soundMediaLabel = ruleSoundMediaLabel(r);
    const legacySoundLabel = ruleLegacySoundLabel(r.sound_asset_id);
    const imageMediaId = ruleImageMediaId(r);
    const imageMediaLabel = ruleImageMediaLabel(r);
    const legacyImageLabel = ruleLegacyImageLabel(r.image_asset_id);
    const activeDurationText = (r.duration_mode || 'fixed') === 'sound' ? calcDurationFromSoundMs(soundDuration, r.duration_ms) : fmtMs(r.duration_ms ?? 7000);
    const fixedHint = (r.duration_mode || 'fixed') === 'fixed' ? `Aktiv: ${fmtMs(r.duration_ms ?? 7000)}` : `Nur Fallback: ${fmtMs(r.duration_ms ?? 7000)}`;
    const soundHint = (r.duration_mode || 'fixed') === 'sound' ? `Aktiv: ${calcDurationFromSoundMs(soundDuration, r.duration_ms)}` : 'Nicht aktiv';
    const valueDesc = ruleValueDescriptor(r.source || 'twitch', r.type_key || '');
    return `<div class="modal-backdrop" data-close-modal="1"><div class="modal-card glass" data-modal-card="1">
      <div class="modal-head"><div><h2>${isEdit ? 'Regel bearbeiten' : 'Neue Regel'}</h2><p class="small-note">${isEdit ? `ID ${esc(r.id)}` : 'Neue Alert-Staffel anlegen'}</p></div><button data-close-modal="1">×</button></div>
      <div class="modal-body">
        ${isEdit ? editLoadedSummary(r) : ''}
        <div class="form-section"><h3>Basis</h3><div class="form-grid editor-grid">
          <label>Quelle<select id="ruleSource">${sources(false).map(s=>opt(s,SOURCE_LABELS[s]||s,r.source)).join('')}</select></label>
          <label>Typ<select id="ruleTypeKey">${typeOptionsForSource(r.source || 'twitch', r.type_key || '')}</select></label>
          <label id="ruleTierField">Twitch-Tier<select id="ruleTierFilter">${ruleTierOptions(r)}</select></label>
          <label class="wide-field">Name<input id="ruleLabel" value="${esc(r.label || '')}"></label>
          <label><span id="ruleMinLabelText">${esc(valueDesc.minLabel)}</span><input id="ruleMin" type="number" value="${esc(empty(r.min_value))}" placeholder="${esc(valueDesc.minPlaceholder)}"></label>
          <label><span id="ruleMaxLabelText">${esc(valueDesc.maxLabel)}</span><input id="ruleMax" type="number" value="${esc(empty(r.max_value))}" placeholder="${esc(valueDesc.maxPlaceholder)}"></label>
          <label>Priorität<input id="rulePriority" type="number" value="${esc(r.priority ?? 100)}"></label>
        </div><p id="ruleValueHelp" class="small-note rule-value-help">${esc(valueDesc.help)}</p><p id="ruleTierHelp" class="small-note rule-tier-help"></p></div>
        <div class="form-section"><h3>Medien & Design</h3><div class="form-grid editor-grid">
          <label class="wide-field">Sound aus Media-Registry<input type="hidden" id="ruleSoundMediaId" value="${esc(soundMediaId)}"><div class="sound-select-row sound-media-picker-row"><input id="ruleSoundMediaInfo" value="${esc(soundMediaLabel)}" readonly><button type="button" id="pickRuleSoundMedia">Auswählen</button><button type="button" id="clearRuleSoundMedia" ${soundMediaId ? '' : 'disabled'} title="Media-Registry-Sound entfernen" aria-label="Media-Registry-Sound entfernen">×</button></div></label>
          <details class="wide-field legacy-sound-foldout" ${soundMediaId ? '' : 'open'}>
            <summary><strong>Alter Sound / Fallback</strong><span class="legacy-sound-summary">Aktuell: ${esc(legacySoundLabel)}</span></summary>
            <div class="legacy-sound-body">
              <label class="wide-field legacy-sound-field"><span>Nur verwenden, wenn oben kein Media-Registry-Sound gesetzt ist</span><div class="sound-select-row"><select id="ruleSound">${assetOptions('sound', r.sound_asset_id)}</select><button type="button" id="playRuleSound" class="sound-icon-btn sound-select-play" ${selectedSoundUrl(r.sound_asset_id) ? '' : 'disabled'} data-sound-id="${esc(r.sound_asset_id ?? '')}" title="Ausgewählten alten Sound abspielen" aria-label="Ausgewählten alten Sound abspielen">▶</button></div></label>
              <p class="small-note legacy-sound-hint">Sicherheits-Fallback für bestehende Alerts. Wird nur genutzt, wenn kein Media-Registry-Sound gesetzt ist.</p>
            </div>
          </details>
          <label class="wide-field">Regel-Grafik aus Media-Registry<input type="hidden" id="ruleImageMediaId" value="${esc(imageMediaId)}"><div class="sound-select-row sound-media-picker-row"><input id="ruleImageMediaInfo" value="${esc(imageMediaLabel)}" readonly><button type="button" id="pickRuleImageMedia">Auswählen</button><button type="button" id="clearRuleImageMedia" ${imageMediaId ? '' : 'disabled'} title="Media-Registry-Grafik entfernen" aria-label="Media-Registry-Grafik entfernen">×</button></div></label>
          <label class="wide-field">Alte Grafik / Fallback<select id="ruleImage" aria-label="Alte Grafik / Fallback">${assetOptions('image', r.image_asset_id)}</select></label>
          <label class="wide-field">Design-Profil<select id="ruleDisplayProfile">${displayProfileOptions(r.display_profile_id, true)}</select></label>
        </div><p class="small-note">Media-Registry-Sound/-Grafik hat Vorrang. Alte Sound-/Grafik-Fallbacks werden nur genutzt, wenn oben nichts aus der Media-Registry ausgewählt ist. Rahmen, Innenlinie und Celebration kommen aus dem gewählten Design-Profil.</p></div>
        <div class="form-section"><h3>Chat-Nachricht</h3><div class="form-grid editor-grid">
          <label class="wide-field">Chat-Textblock<select id="ruleChatBlock">${chatBlockOptions(r.source, r.type_key, r.meta?.chatMessage?.blockId || r.meta?.chatMessage?.block_id || '')}</select></label>
        </div><p class="small-note">Nein = kein Chat-Post. Bei Auswahl eines Textblocks wird pro Alert genau ein zufälliger Text aus diesem Block gesendet. Es wird kein einzelner Text pro Regel ausgewählt.</p></div>
        <div class="form-section"><h3>Dauer</h3><div class="duration-choice">
          <label class="radio-card"><input type="radio" name="durationModeChoice" value="fixed" ${(r.duration_mode || 'fixed') === 'fixed' ? 'checked':''}> <strong>Manuell</strong><span>${esc(fixedHint)}</span></label>
          <label class="radio-card"><input type="radio" name="durationModeChoice" value="sound" ${(r.duration_mode || 'fixed') === 'sound' ? 'checked':''}> <strong>Nach Soundlänge</strong><span>${esc(soundHint)}</span></label>
        </div>
        <div class="duration-summary">
          <span class="summary-pill strong-pill">Aktiver Modus: ${esc((r.duration_mode || 'fixed') === 'sound' ? 'Nach Soundlänge' : 'Manuell')}</span>
          <span class="summary-pill strong-pill">Overlaydauer: ${esc(activeDurationText)}</span>
          <span class="summary-pill">Sounddatei: ${esc(soundDuration ? fmtMs(soundDuration) : 'kein Sound / unbekannt')}</span>
          <span class="summary-pill">Fallback: ${esc(fmtMs(r.duration_ms ?? 7000))}</span>
        </div>
        <div id="durationFixedBox" class="duration-mode-box"><div class="form-grid editor-grid"><label>Manuelle Dauer in ms<input id="ruleDuration" type="number" value="${esc(r.duration_ms ?? 7000)}"></label></div></div>
        <div id="durationSoundBox" class="duration-mode-box"><div class="duration-calc">
          <div><span>Erkannte Sounddauer</span><strong id="durationSoundMs">${esc(soundDuration ? fmtMs(soundDuration) : 'kein Sound / unbekannt')}</strong></div>
          <div><span>Globaler Puffer</span><strong>${esc(fmtMs(state.status?.config?.soundDurationPaddingMs || 0))}</strong></div>
          <div><span>Berechnete Dauer</span><strong id="durationCalculatedMs">${esc(calcDurationFromSoundMs(soundDuration, r.duration_ms))}</strong></div>
        </div><p class="small-note">Die aktive Sounddatei selbst bleibt ${esc(soundDuration ? fmtMs(soundDuration) : 'unbekannt')} lang. Bei Media-Registry-Sound wird dessen Dauer verwendet; sonst der alte Fallback-Sound.</p></div></div>
        <div class="form-section tts-settings-section"><div class="section-head-inline"><div><h3>Text-to-Speech</h3><p class="small-note">Wenn aktiv, wird der übermittelte Text nach dem Alert-Sound gesprochen. Der Alert bleibt bis zum Ende der TTS-Ausgabe sichtbar.</p></div><span id="ruleTtsStatus" class="tts-status-pill"></span></div>
          <div class="form-grid editor-grid">
            <label>TTS-Ausgabe<select id="ruleTtsEnabled">${opt(0,'Aus',Number(r.tts_enabled||0))}${opt(1,'An',Number(r.tts_enabled||0))}</select></label>
            <label>Timing<select id="ruleTtsTiming">${opt('after_alert','Nach Alert-Sound',r.tts_timing||'after_alert')}${opt('during_alert','Während Alert',r.tts_timing||'after_alert')}</select></label>
            <label>Modus<select id="ruleTtsMode">${opt('audio_only','Nur Audio',r.tts_mode||'audio_only')}</select></label>
          </div>
          <div id="ruleTtsDetail" class="tts-detail-panel">
            <div class="form-grid editor-grid">
              <label><span id="ruleTtsMinAmountLabelText">Min-Wert für TTS</span><input id="ruleTtsMinAmount" type="number" value="${esc(empty(r.tts_min_amount))}" placeholder="optional"></label>
              <label>Max. Zeichen<input id="ruleTtsMaxChars" type="number" min="1" value="${esc(r.tts_max_chars ?? 250)}"></label>
              <label class="wide-field">Gesprochener Text / Template<input id="ruleTtsTemplate" value="${esc(r.tts_template || '{user} schreibt: {message}')}"></label>
            </div>
            <div class="tts-help-grid">
              <p id="ruleTtsMinHelp" class="small-note"></p>
              <p id="ruleTtsSourceHelp" class="small-note"></p>
              <p class="small-note"><strong>Platzhalter:</strong> {user} = Name, {message} = übermittelter Text, {amount} = Betrag/Bits/Anzahl. Beispiel: {user} schreibt: {message}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-actions"><button data-close-modal="1">Abbrechen</button><button class="success" id="saveRule">${isEdit ? 'Speichern' : 'Regel anlegen'}</button></div>
    </div></div>`;
  }

  function editLoadedSummary(r){
    const sound = selectedSoundDuration(r.sound_asset_id);
    return `<div class="edit-loaded-summary">
      <strong>Bearbeitet wird Regel ID ${esc(r.id)}:</strong>
      <span>${esc(SOURCE_LABELS[r.source] || r.source)} · ${esc(TYPE_LABELS[r.type_key] || r.type_key)}</span>
      <span>Name: ${esc(r.label || '—')}</span>
      <span>Wert: ${esc(r.min_value ?? 0)} – ${esc(r.max_value ?? '∞')}</span>
      <span>Priorität: ${esc(r.priority ?? 100)}</span>
      <span>Dauer-Modus: ${esc((r.duration_mode || 'fixed') === 'sound' ? 'Nach Soundlänge' : 'Manuell')}</span>
      <span>Sound-ID: ${esc(r.sound_asset_id ?? '—')}${sound ? ` · ${esc(fmtMs(sound))}` : ''}</span>
      <span>Design: ${esc(displayProfileLabel(r))}</span>
    </div>`;
  }


  function variantModal(){
    const v = state.modalRule || { source: state.source !== 'all' ? state.source : 'twitch', type_key: state.type !== 'all' ? state.type : 'follow', label:'', title_template:'', headline_template:'{userDisplayName}', value_template:'', subline_template:'', message_template:'', message_mode:'auto', hide_subline_when_message_exists:1, pick_weight:100, sort_order:100, enabled:1 };
    const isEdit = !!v.id;
    return `<div class="modal-backdrop" data-close-modal="1"><div class="modal-card glass" data-modal-card="1">
      <div class="modal-head"><div><h2>${isEdit ? 'Textvariante bearbeiten' : 'Neue Textvariante'}</h2><p class="small-note">${isEdit ? `ID ${esc(v.id)}` : 'Editierbarer Alert-Text'}</p></div><button data-close-modal="1">×</button></div>
      <div class="modal-body">${placeholdersHtml()}<div class="form-grid editor-grid">
        <label>Quelle<select id="variantSource">${sources(false).map(s=>opt(s,SOURCE_LABELS[s]||s,v.source)).join('')}</select></label>
        <label>Typ<input id="variantTypeKey" value="${esc(v.type_key || '')}"></label>
        <label>Regel-ID optional<input id="variantRuleId" type="number" value="${esc(empty(v.rule_id))}" placeholder="leer = alle Regeln"></label>
        <label>Name<input id="variantLabel" value="${esc(v.label || '')}"></label>
        <label class="wide-field">Titel<input id="variantTitle" value="${esc(v.title_template || '')}"></label>
        <label class="wide-field">Hauptzeile<input id="variantHeadline" value="${esc(v.headline_template || '')}"></label>
        <label class="wide-field">Wertzeile<input id="variantValue" value="${esc(v.value_template || '')}"></label>
        <label class="wide-field">Unterzeile<input id="variantSubline" value="${esc(v.subline_template || '')}"></label>
        <label class="wide-field">Message-Template optional<input id="variantMessageTemplate" value="${esc(v.message_template || '')}" placeholder="leer = echte Nachricht"></label>
        <label>Message-Modus<select id="variantMessageMode">${opt('auto','auto',v.message_mode||'auto')}${opt('always','always',v.message_mode||'auto')}${opt('never','never',v.message_mode||'auto')}</select></label>
        <label>Subline bei Message<select id="variantHideSubline">${opt(1,'ausblenden',Number(v.hide_subline_when_message_exists??1))}${opt(0,'anzeigen',Number(v.hide_subline_when_message_exists??1))}</select></label>
        <label>Gewicht<input id="variantWeight" type="number" value="${esc(v.pick_weight ?? 100)}"></label>
        <label>Sortierung<input id="variantSort" type="number" value="${esc(v.sort_order ?? 100)}"></label>
        <label>Aktiv<select id="variantEnabled">${opt(1,'Aktiv',Number(v.enabled ?? 1))}${opt(0,'Inaktiv',Number(v.enabled ?? 1))}</select></label>
      </div></div>
      <div class="modal-actions"><button data-close-modal="1">Abbrechen</button><button class="success" id="saveVariant">${isEdit ? 'Speichern' : 'Anlegen'}</button></div>
    </div></div>`;
  }

  function chatBlockModal(){
    const b = state.modalRule || { source: state.source !== 'all' ? state.source : 'twitch', type_key: state.type !== 'all' ? state.type : 'bits', label:'', texts:[''], enabled:1, sort_order:100 };
    const isEdit = !!b.id;
    const texts = normalizeChatTextRows(b.texts || b.texts_json || ['']);
    const textRows = texts.map((txt, i) => chatTextRowHtml(txt, i)).join('');
    return `<div class="modal-backdrop" data-close-modal="1"><div class="modal-card glass" data-modal-card="1">
      <div class="modal-head"><div><h2>${isEdit ? 'Chat-Textblock bearbeiten' : 'Neuer Chat-Textblock'}</h2><p class="small-note">Ein Block enthält mehrere Einzeltexte. Beim Alert wird daraus zufällig genau ein Text gewählt.</p></div><button data-close-modal="1">×</button></div>
      <div class="modal-body">${placeholdersHtml()}<div class="form-grid editor-grid">
        <label>Quelle<select id="chatBlockSource">${sources(false).map(s=>opt(s,SOURCE_LABELS[s]||s,b.source)).join('')}</select></label>
        <label>Typ<select id="chatBlockTypeKey">${typeOptionsForSource(b.source || 'twitch', b.type_key || '')}</select></label>
        <label>Name<input id="chatBlockLabel" value="${esc(b.label || '')}" placeholder="z.B. Bits Danke normal"></label>
        <label>Aktiv<select id="chatBlockEnabled">${opt(1,'Aktiv',Number(b.enabled ?? 1))}${opt(0,'Inaktiv',Number(b.enabled ?? 1))}</select></label>
        <label>Sortierung<input id="chatBlockSort" type="number" value="${esc(b.sort_order ?? 100)}"></label>
        <div class="wide-field"><label>Texte</label><div id="chatTextList" class="chat-text-list">${textRows}</div><div class="chat-block-tools"><button class="ghost" id="addChatTextRow" type="button">+ Text hinzufügen</button></div><p class="small-note">Jeder Kasten ist ein eigener möglicher Chat-Text. Platzhalter anklicken = in aktiven Text einsetzen.</p></div>
      </div></div>
      <div class="modal-actions"><button data-close-modal="1">Abbrechen</button><button class="success" id="saveChatBlock">${isEdit ? 'Speichern' : 'Anlegen'}</button></div>
    </div></div>`;
  }

  function normalizeChatTextRows(value){
    let arr = value;
    if (typeof value === 'string') {
      try { arr = JSON.parse(value); } catch (_) { arr = value.split(/\r?\n/); }
    }
    if (!Array.isArray(arr)) arr = [''];
    arr = arr.map(x => String(x || '').trim()).filter(Boolean);
    if (!arr.length) arr = [''];
    return arr;
  }

  function chatTextRowHtml(text, index){
    return `<div class="chat-text-row" data-chat-text-row="1"><textarea class="chat-text-input" rows="2" placeholder="{userDisplayName} haut {amountFormatted} raus! Danke 💜">${esc(text || '')}</textarea><button class="danger ghost" type="button" data-remove-chat-text="1" title="Text entfernen">×</button></div>`;
  }

  function presetModal(){
    const preset = state.modalRule || { source: state.source !== 'all' ? state.source : 'twitch', type_key: state.type !== 'all' ? state.type : 'bits', label:'', payload:{ user:'ForrestCGN', amount:100, message:'Test aus dem Dashboard' }, enabled:1, sort_order:100 };
    const isEdit = !!preset.id;
    const payloadText = JSON.stringify(preset.payload || {}, null, 2);
    return `<div class="modal-backdrop" data-close-modal="1"><div class="modal-card glass" data-modal-card="1">
      <div class="modal-head"><div><h2>${isEdit ? 'Testpreset bearbeiten' : 'Neues Testpreset'}</h2><p class="small-note">Payload wird für echte Overlay-Tests benutzt.</p></div><button data-close-modal="1">×</button></div>
      <div class="modal-body"><div class="form-grid editor-grid">
        <label>Quelle<select id="presetSource">${sources(false).map(s=>opt(s,SOURCE_LABELS[s]||s,preset.source)).join('')}</select></label>
        <label>Typ<input id="presetTypeKey" value="${esc(preset.type_key || '')}"></label>
        <label>Regel-ID optional<input id="presetRuleId" type="number" value="${esc(empty(preset.rule_id))}" placeholder="optional"></label>
        <label>Name<input id="presetLabel" value="${esc(preset.label || '')}"></label>
        <label>Sortierung<input id="presetSort" type="number" value="${esc(preset.sort_order ?? 100)}"></label>
        <label>Aktiv<select id="presetEnabled">${opt(1,'Aktiv',Number(preset.enabled ?? 1))}${opt(0,'Inaktiv',Number(preset.enabled ?? 1))}</select></label>
        <label class="wide-field">Payload JSON<textarea id="presetPayload" rows="10">${esc(payloadText)}</textarea></label>
      </div></div>
      <div class="modal-actions"><button data-close-modal="1">Abbrechen</button><button class="success" id="savePreset">${isEdit ? 'Speichern' : 'Anlegen'}</button></div>
    </div></div>`;
  }

  function uploadModal(){
    const kind = state.modalRule?.assetType || 'sound';
    return `<div class="modal-backdrop" data-close-modal="1"><div class="modal-card small-modal glass" data-modal-card="1">
      <div class="modal-head"><div><h2>${kind === 'sound' ? 'Sound hochladen' : 'Grafik hochladen'}</h2><p class="small-note">Uploads landen unter /assets/... und sind fürs Overlay erreichbar.</p></div><button data-close-modal="1">×</button></div>
      <form id="uploadForm" class="modal-body">
        <input type="hidden" name="assetType" value="${esc(kind)}">
        <div class="form-grid editor-grid">
          <label class="wide-field">Datei<input name="file" type="file" required></label>
          <label class="wide-field">Anzeigename<input name="label" placeholder="optional"></label>
          ${kind === 'image' ? `<label>Bildordner<select name="imageCategory"><option value="">Standard</option><option value="icons">icons</option><option value="special">special</option><option value="backgrounds">backgrounds</option></select></label>` : '<input type="hidden" name="imageCategory" value="">'}
        </div>
      </form>
      <div class="modal-actions"><button data-close-modal="1">Abbrechen</button><button class="success" id="submitUpload">Hochladen</button></div>
    </div></div>`;
  }

  function assetOptions(kind, selected){
    const none = kind === 'sound' ? '— kein Sound —' : '— kein Bild —';
    return opt('', none, selected == null || selected === '') + state.assets.filter(a => a.asset_type === kind).map(a => {
      const dur = kind === 'sound' && Number(a.duration_ms || 0) > 0 ? ` · ${fmtMs(a.duration_ms)}` : '';
      return opt(a.id, `${a.label || a.original_name || a.public_url}${dur}`, selected);
    }).join('');
  }

  function selectedSoundDuration(id){
    if (id === null || id === undefined || id === '') return 0;
    const a = state.assets.find(x => Number(x.id) === Number(id));
    return Number(a?.duration_ms || 0);
  }

  function calcDurationFromSoundMs(soundDuration, fallbackMs){
    const duration = Number(soundDuration || 0);
    if (!duration) return `Fallback ${Number(fallbackMs || 7000)} ms`;
    const cfg = state.status?.config || {};
    const padded = duration + Number(cfg.soundDurationPaddingMs || 0);
    const min = Number(cfg.minAutoDurationMs || 1000);
    const max = Number(cfg.maxAutoDurationMs || 60000);
    return fmtMs(Math.max(min, Math.min(max, padded)));
  }

  function calcSoundDurationText(soundId, fallbackMs){
    return calcDurationFromSoundMs(selectedSoundDuration(soundId), fallbackMs);
  }

  function readRuleForm(){
    const durationMode = document.querySelector('input[name="durationModeChoice"]:checked')?.value || 'fixed';
    return {
      id: state.modalRule?.id || undefined,
      source: document.getElementById('ruleSource').value,
      type_key: document.getElementById('ruleTypeKey').value.trim(),
      label: document.getElementById('ruleLabel').value.trim() || 'Unbenannte Regel',
      min_value: numOrNull('ruleMin'),
      max_value: numOrNull('ruleMax'),
      tier: 'normal',
      priority: Number(document.getElementById('rulePriority').value || 100),
      duration_ms: Number(document.getElementById('ruleDuration').value || 7000),
      duration_mode: durationMode,
      animation: 'neon_card',
      image_mode: (valOrNull('ruleImageMediaId') || valOrNull('ruleImage')) ? 'special' : 'none',
      enabled: Number(state.modalRule?.enabled ?? 1),
      sound_asset_id: valOrNull('ruleSound'),
      image_asset_id: valOrNull('ruleImage'),
      sound_media_id: valOrNull('ruleSoundMediaId'),
      image_media_id: valOrNull('ruleImageMediaId'),
      display_profile_id: valOrNull('ruleDisplayProfile'),
      tts_enabled: Number(document.getElementById('ruleTtsEnabled').value || 0),
      tts_timing: document.getElementById('ruleTtsTiming').value,
      tts_mode: document.getElementById('ruleTtsMode').value,
      tts_template: document.getElementById('ruleTtsTemplate').value || '{user} schreibt: {message}',
      tts_max_chars: Number(document.getElementById('ruleTtsMaxChars').value || 250),
      tts_min_amount: numOrNull('ruleTtsMinAmount'),
      meta: (() => {
        let meta = cloneMeta(state.modalRule?.meta || {});
        delete meta.celebration;
        const currentSource = document.getElementById('ruleSource')?.value || 'twitch';
        const currentType = document.getElementById('ruleTypeKey')?.value || '';
        const tierValue = isTwitchSubTierRule(currentSource, currentType) ? (document.getElementById('ruleTierFilter')?.value || '') : '';
        meta = applyTierFilterToMeta(meta, tierValue);
        const chatBlockId = valOrNull('ruleChatBlock');
        meta.chatMessage = {
          enabled: !!chatBlockId,
          blockId: chatBlockId
        };
        return meta;
      })()
    };
  }

  function isPlaceholderTextTarget(el){
    if (!el) return false;
    const tag = String(el.tagName || '').toLowerCase();
    if (tag === 'textarea') return true;
    if (tag !== 'input') return false;
    const type = String(el.type || 'text').toLowerCase();
    return ['text','search','url','email','tel'].includes(type);
  }

  function rememberPlaceholderTarget(el){
    if (isPlaceholderTextTarget(el) && !el.readOnly && !el.disabled) state.placeholderTarget = el;
  }

  function bestPlaceholderTarget(){
    if (isPlaceholderTextTarget(state.placeholderTarget) && document.contains(state.placeholderTarget)) return state.placeholderTarget;
    const active = document.activeElement;
    if (isPlaceholderTextTarget(active)) return active;
    return root.querySelector('.chat-text-input, #variantTitle, #variantHeadline, #variantValue, #variantSubline, #variantMessageTemplate, textarea, input[type="text"]');
  }

  function insertTextAtCursor(el, text){
    if (!el || !text) return false;
    el.focus();
    const start = Number.isFinite(el.selectionStart) ? el.selectionStart : String(el.value || '').length;
    const end = Number.isFinite(el.selectionEnd) ? el.selectionEnd : start;
    const value = String(el.value || '');
    el.value = value.slice(0, start) + text + value.slice(end);
    const pos = start + text.length;
    try { el.setSelectionRange(pos, pos); } catch (_) {}
    el.dispatchEvent(new Event('input', { bubbles:true }));
    el.dispatchEvent(new Event('change', { bubbles:true }));
    return true;
  }

  function insertPlaceholderFromChip(chip){
    const key = chip?.dataset?.placeholderKey;
    if (!key) return;
    const target = bestPlaceholderTarget();
    const inserted = insertTextAtCursor(target, `{${key}}`);
    if (!inserted) {
      state.note = `Kein Textfeld zum Einfügen aktiv.`;
      render();
    }
  }

  function setRuleSoundMediaSelection(asset){
    const id = asset && Number(asset.id || 0) > 0 ? Number(asset.id) : '';
    const duration = id ? Number(asset.durationMs ?? asset.duration_ms ?? 0) : 0;
    const labelText = id ? (asset.label || asset.displayName || asset.fileName || asset.relativePath || 'Media-Registry') : '';
    const label = id ? `MediaId ${id} · ${labelText}${duration ? ` · ${fmtMs(duration)}` : ''}` : '— kein Media-Registry-Sound —';
    const input = root.querySelector('#ruleSoundMediaId');
    const info = root.querySelector('#ruleSoundMediaInfo');
    const clearBtn = root.querySelector('#clearRuleSoundMedia');
    if (input) input.value = id ? String(id) : '';
    if (info) info.value = label;
    if (clearBtn) clearBtn.disabled = !id;
    if (state.modalRule) {
      state.modalRule.sound_media_id = id || null;
      state.modalRule.soundMediaId = id || null;
      state.modalRule.sound_media_label = id ? labelText : '';
      state.modalRule.soundMediaLabel = id ? labelText : '';
      state.modalRule.sound_media_duration_ms = id && duration > 0 ? duration : 0;
      state.modalRule.soundMediaDurationMs = id && duration > 0 ? duration : 0;
      state.modalRule.sound_media_path = id ? (asset.relativePath || '') : '';
      state.modalRule.sound_media_url = id ? (asset.webPath || '') : '';
    }
    updateDurationSoundInfo();
  }

  function openRuleSoundMediaPicker(){
    if (!window.MediaPicker || typeof window.MediaPicker.open !== 'function') {
      state.note = 'MediaPicker-Komponente ist nicht geladen.';
      render();
      return;
    }
    const source = root.querySelector('#ruleSource')?.value || state.modalRule?.source || 'twitch';
    const typeKey = root.querySelector('#ruleTypeKey')?.value || state.modalRule?.type_key || 'general';
    window.MediaPicker.open({
      title: `Alert-Sound auswählen · ${source}/${typeKey}`,
      moduleKey: 'alerts',
      categoryKey: alertSoundCategoryKey(typeKey),
      allowedTypes: ['audio'],
      view: 'module',
      onSelect: setRuleSoundMediaSelection
    });
  }

  function setRuleImageMediaSelection(asset){
    const id = asset && Number(asset.id || 0) > 0 ? Number(asset.id) : '';
    const labelText = id ? (asset.label || asset.displayName || asset.fileName || asset.relativePath || 'Media-Registry-Grafik') : '';
    const label = id ? `MediaId ${id} · ${labelText}` : '— keine Media-Registry-Grafik —';
    const input = root.querySelector('#ruleImageMediaId');
    const info = root.querySelector('#ruleImageMediaInfo');
    const clearBtn = root.querySelector('#clearRuleImageMedia');
    if (input) input.value = id ? String(id) : '';
    if (info) info.value = label;
    if (clearBtn) clearBtn.disabled = !id;
    if (state.modalRule) {
      state.modalRule.image_media_id = id || null;
      state.modalRule.imageMediaId = id || null;
      state.modalRule.image_media_label = id ? labelText : '';
      state.modalRule.imageMediaLabel = id ? labelText : '';
      state.modalRule.image_media_path = id ? (asset.relativePath || '') : '';
      state.modalRule.image_media_url = id ? (asset.webPath || '') : '';
    }
  }

  function openRuleImageMediaPicker(){
    if (!window.MediaPicker || typeof window.MediaPicker.open !== 'function') {
      state.note = 'MediaPicker-Komponente ist nicht geladen.';
      render();
      return;
    }
    const source = root.querySelector('#ruleSource')?.value || state.modalRule?.source || 'twitch';
    const typeKey = root.querySelector('#ruleTypeKey')?.value || state.modalRule?.type_key || 'general';
    window.MediaPicker.open({
      title: `Alert-Grafik auswählen · ${source}/${typeKey}`,
      moduleKey: 'alerts',
      categoryKey: alertSoundCategoryKey(typeKey),
      allowedTypes: ['image'],
      view: 'module',
      onSelect: setRuleImageMediaSelection
    });
  }

  function setTopGraphicMediaSelection(asset){
    const id = asset && Number(asset.id || 0) > 0 ? Number(asset.id) : '';
    const labelText = id ? (asset.label || asset.displayName || asset.fileName || asset.relativePath || 'Media-Registry-Grafik') : '';
    const url = id ? (asset.webPath || asset.web_path || '') : '';
    const fields = {
      topGraphicMediaId: id ? String(id) : '',
      topGraphicMediaUrl: url,
      topGraphicMediaLabel: labelText
    };
    for (const [key, value] of Object.entries(fields)) {
      const el = root.querySelector(`[data-display-key="${key}"]`);
      if (el) el.value = value;
    }
    const info = root.querySelector('#topGraphicMediaInfo');
    if (info) info.value = id ? `MediaId ${id} · ${labelText || url || 'Grafik'}` : '— keine Media-Registry-Grafik —';
    const clearBtn = root.querySelector('#clearTopGraphicMedia');
    if (clearBtn) clearBtn.disabled = !id;
    centerTopGraphicCrop();
    renderDesignPreview();
    updateDesignPopout();
  }

  function openTopGraphicMediaPicker(){
    if (!window.MediaPicker || typeof window.MediaPicker.open !== 'function') {
      state.note = 'MediaPicker-Komponente ist nicht geladen.';
      render();
      return;
    }
    window.MediaPicker.open({
      title: 'Alert-Grafik auswählen',
      moduleKey: 'alerts',
      categoryKey: 'graphics',
      allowedTypes: ['image'],
      view: 'module',
      onSelect: setTopGraphicMediaSelection
    });
  }

  function bind(){
    root.querySelectorAll('textarea, input').forEach(el => {
      el.addEventListener('focus', () => rememberPlaceholderTarget(el));
      el.addEventListener('click', () => rememberPlaceholderTarget(el));
    });
    root.querySelectorAll('[data-placeholder-key]').forEach(chip => chip.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      insertPlaceholderFromChip(chip);
    }));
    root.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', () => { state.page = el.dataset.page; state.modal = null; render(); }));
    root.querySelectorAll('[data-source-filter]').forEach(btn => btn.addEventListener('click', () => { state.source = btn.dataset.sourceFilter || 'all'; state.type = 'all'; render(); }));
    root.querySelector('#typeFilter')?.addEventListener('change', ev => { state.type = ev.currentTarget.value || 'all'; render(); });
    root.querySelectorAll('[data-rule-sort]').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.ruleSort || 'value';
      if (state.ruleSortKey === key) state.ruleSortDir = state.ruleSortDir === 'asc' ? 'desc' : 'asc';
      else { state.ruleSortKey = key; state.ruleSortDir = key === 'active' ? 'desc' : 'asc'; }
      render();
    }));

    root.querySelector('#openNewRule')?.addEventListener('click', () => { state.modal = 'rule'; state.modalRule = defaultRule(); render(); });
    root.querySelector('#newVariant')?.addEventListener('click', () => { state.modal = 'variant'; state.modalRule = null; render(); });
    root.querySelector('#newChatBlock')?.addEventListener('click', () => { state.modal = 'chatBlock'; state.modalRule = null; render(); });
    root.querySelectorAll('[data-edit-variant]').forEach(btn => btn.addEventListener('click', () => { state.modal = 'variant'; state.modalRule = JSON.parse(JSON.stringify(state.textVariants.find(v => Number(v.id) === Number(btn.dataset.editVariant)) || {})); render(); }));
    root.querySelectorAll('[data-del-variant]').forEach(btn => btn.addEventListener('click', async () => { if (!confirm('Textvariante wirklich löschen?')) return; await CGN.api(`/api/alerts/text-variants/${btn.dataset.delVariant}`, { method:'DELETE' }); state.note = 'Textvariante gelöscht.'; await loadAll(true); }));
    root.querySelectorAll('[data-edit-chat-block]').forEach(btn => btn.addEventListener('click', () => { state.modal = 'chatBlock'; state.modalRule = JSON.parse(JSON.stringify(state.chatBlocks.find(v => Number(v.id) === Number(btn.dataset.editChatBlock)) || {})); render(); }));
    root.querySelectorAll('[data-del-chat-block]').forEach(btn => btn.addEventListener('click', async () => { if (!confirm('Chat-Textblock wirklich löschen?')) return; await CGN.api(`/api/alerts/chat-blocks/${btn.dataset.delChatBlock}`, { method:'DELETE' }); state.note = 'Chat-Textblock gelöscht.'; await loadAll(true); }));
    root.querySelector('#newPreset')?.addEventListener('click', () => { state.modal = 'preset'; state.modalRule = null; render(); });
    root.querySelectorAll('[data-edit-preset]').forEach(btn => btn.addEventListener('click', () => { state.modal = 'preset'; state.modalRule = JSON.parse(JSON.stringify(state.testPresets.find(v => Number(v.id) === Number(btn.dataset.editPreset)) || {})); render(); }));
    root.querySelectorAll('[data-del-preset]').forEach(btn => btn.addEventListener('click', async () => { if (!confirm('Testpreset wirklich löschen?')) return; await CGN.api(`/api/alerts/test-presets/${btn.dataset.delPreset}`, { method:'DELETE' }); state.note = 'Testpreset gelöscht.'; await loadAll(true); }));
    root.querySelectorAll('[data-play-preset]').forEach(btn => btn.addEventListener('click', async () => { const res = await CGN.api(`/api/alerts/test-presets/${btn.dataset.playPreset}/play`, { method:'POST', body:'{}' }); state.note = `Preset gesendet · matchedRule: ${res.matchedRule ?? '—'}`; await loadAll(true); }));

    root.querySelector("#displayProfileId")?.addEventListener("change", ev => {
      state.displayProfileId = ev.currentTarget.value || null;
      render();
    });
    root.querySelector("#designPreviewVariant")?.addEventListener("change", ev => {
      state.previewVariantId = ev.currentTarget.value || null;
      renderDesignPreview();
      updateDesignPopout();
    });
    root.querySelectorAll("[data-display-key]").forEach(el => {
      const handler = () => {
        const valueLabel = el.closest("label")?.querySelector(".range-value");
        if (valueLabel) valueLabel.textContent = el.value;
        renderDesignPreview();
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", () => {
        if (el.dataset.displayKey === "topGraphicAssetId" || el.dataset.displayKey === "topGraphicMediaId") centerTopGraphicCrop();
        handler();
      });
    });
    root.querySelector("#centerTopGraphicCrop")?.addEventListener("click", centerTopGraphicCrop);
    root.querySelector('#pickTopGraphicMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openTopGraphicMediaPicker();
    });
    root.querySelector('#clearTopGraphicMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setTopGraphicMediaSelection(null);
    });
    root.querySelector("#centerDisplayPosition")?.addEventListener("click", () => {
      const x = root.querySelector('[data-display-key="positionX"]');
      const y = root.querySelector('[data-display-key="positionY"]');
      if (x) { x.value = '50'; const label = x.closest('label')?.querySelector('.range-value'); if (label) label.textContent = '50'; }
      if (y) { y.value = '50'; const label = y.closest('label')?.querySelector('.range-value'); if (label) label.textContent = '50'; }
      renderDesignPreview();
    });
    root.querySelectorAll(".anchor-grid button").forEach(btn => btn.addEventListener("click", () => {
      const x = root.querySelector('[data-display-key="positionX"]');
      const y = root.querySelector('[data-display-key="positionY"]');
      if (x) { x.value = btn.dataset.posX || '50'; const label = x.closest('label')?.querySelector('.range-value'); if (label) label.textContent = x.value; }
      if (y) { y.value = btn.dataset.posY || '50'; const label = y.closest('label')?.querySelector('.range-value'); if (label) label.textContent = y.value; }
      renderDesignPreview();
    }));
    root.querySelector("#createDisplayProfile")?.addEventListener("click", async () => {
      try { await createDisplayProfile(); }
      catch (err) { state.note = err.message || String(err); render(); }
    });
    root.querySelector("#saveDisplayProfile")?.addEventListener("click", async () => {
      try { await saveDisplayProfile(); }
      catch (err) { state.note = err.message || String(err); render(); }
    });
    root.querySelector("#deleteDisplayProfile")?.addEventListener("click", async () => {
      try { await deleteDisplayProfile(); }
      catch (err) { state.note = 'Fehler: ' + (err.message || String(err)); render(); }
    });
    root.querySelector("#playDesignPreview")?.addEventListener("click", playDisplayProfilePreview);
    root.querySelector("#openDesignPopout")?.addEventListener("click", openDesignPopout);

    root.querySelectorAll('[data-edit-rule]').forEach(btn => btn.addEventListener('click', async () => {
      await openEditRule(Number(btn.dataset.editRule));
    }));
    root.querySelectorAll('[data-test-rule]').forEach(btn => btn.addEventListener('click', async () => testRule(Number(btn.dataset.testRule))));
    root.querySelectorAll('[data-toggle-rule]').forEach(btn => btn.addEventListener('click', async () => toggleRuleEnabled(Number(btn.dataset.toggleRule))));
    root.querySelectorAll('[data-del-rule]').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Regel wirklich löschen?')) return;
      await CGN.api(`/api/alerts/rules/${btn.dataset.delRule}`, { method:'DELETE' });
      state.note = 'Regel gelöscht.';
      await loadAll(true);
    }));

    root.querySelector('#openUploadSound')?.addEventListener('click', () => { state.modal = 'upload'; state.modalRule = { assetType:'sound' }; render(); });
    root.querySelector('#openUploadImage')?.addEventListener('click', () => { state.modal = 'upload'; state.modalRule = { assetType:'image' }; render(); });
    root.querySelector('#scanDurations')?.addEventListener('click', async () => {
      const res = await CGN.api('/api/alerts/assets/scan-durations', { method:'POST', body:'{}' });
      state.note = `Soundlängen geprüft · scanned: ${res.scanned || 0}, updated: ${res.updated || 0}, failed: ${res.failed || 0}`;
      await loadAll(true);
    });
    root.querySelectorAll('[data-play-sound]').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      playSoundUrl(btn.dataset.playSound, btn);
    }));
    root.querySelector('#playRuleSound')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const soundId = root.querySelector('#ruleSound')?.value || '';
      const url = selectedSoundUrl(soundId);
      if (url) playSoundUrl(url, ev.currentTarget);
    });
    root.querySelector('#pickRuleSoundMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openRuleSoundMediaPicker();
    });
    root.querySelector('#clearRuleSoundMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setRuleSoundMediaSelection(null);
    });
    root.querySelector('#pickRuleImageMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openRuleImageMediaPicker();
    });
    root.querySelector('#clearRuleImageMedia')?.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setRuleImageMediaSelection(null);
    });
    updateSoundButtonStates();
    root.querySelectorAll('[data-del-asset]').forEach(btn => btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      if (!confirm('Asset wirklich löschen? Datei bleibt erhalten, solange deleteFile nicht gesetzt ist.')) return;
      await CGN.api(`/api/alerts/assets/${btn.dataset.delAsset}`, { method:'DELETE' });
      state.note = 'Asset gelöscht.';
      await loadAll(true);
    }));

    root.querySelector('#playTest')?.addEventListener('click', async () => {
      const payload = {
        source: root.querySelector('#testSource').value,
        type_key: root.querySelector('#testTypeKey').value.trim(),
        user: root.querySelector('#testUser').value,
        amount: Number(root.querySelector('#testAmount').value || 0),
        message: root.querySelector('#testMsg').value
      };
      const res = await CGN.api('/api/alerts/test', { method:'POST', body:JSON.stringify(payload) });
      state.note = `Test gesendet · matchedRule: ${res.matchedRule ?? '—'}`;
      await loadAll(true);
    });
    root.querySelector('#refreshAlertsBusStatus')?.addEventListener('click', async () => { await loadAll(true); });
    root.querySelector('#saveAlertOutputMode')?.addEventListener('click', async () => {
      const mode = root.querySelector('#alertOutputModeSelect')?.value || 'legacy';
      if (mode === 'bus_only' && !confirm('Bus Only hat keinen Legacy-Fallback. Nur für gezielte Tests verwenden. Trotzdem speichern?')) return;
      const res = await CGN.api('/api/alerts/config', { method:'POST', body: JSON.stringify({ alertOutput: { mode } }) });
      state.note = `Alert Output Modus gespeichert: ${modeLabel(mode)}`;
      if (res.config && state.status) state.status.config = res.config;
      await loadAll(true);
    });
    root.querySelector('#reloadApi')?.addEventListener('click', async () => { await CGN.api('/api/alerts/reload', { method:'POST', body:'{}' }); state.note = 'API Reload ausgeführt.'; await loadAll(true); });
    root.querySelector('#saveAlertConfig')?.addEventListener('click', async () => { const res = await CGN.api('/api/alerts/config', { method:'POST', body:JSON.stringify(readConfigForm()) }); state.note = 'Config gespeichert.'; if (res.config && state.status) state.status.config = res.config; await loadAll(true); });
    root.querySelector('#clearQueue')?.addEventListener('click', async () => { await CGN.api('/api/alerts/clear', { method:'POST', body:'{}' }); state.note = 'Queue geleert.'; await loadAll(true); });
    root.querySelector('#refreshHistory')?.addEventListener('click', async () => loadAll(true));

    root.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', ev => {
      if (ev.target.dataset.closeModal || ev.currentTarget.dataset.closeModal) { state.modal = null; state.modalRule = null; render(); }
    }));
    root.querySelector('[data-modal-card]')?.addEventListener('click', ev => ev.stopPropagation());
    root.querySelector('#saveRule')?.addEventListener('click', saveRule);
    root.querySelector('#ruleSource')?.addEventListener('change', ev => {
      const typeSelect = root.querySelector('#ruleTypeKey');
      if (!typeSelect) return;
      const oldValue = typeSelect.value;
      typeSelect.innerHTML = typeOptionsForSource(ev.currentTarget.value || 'twitch', oldValue, false);
      if (![...typeSelect.options].some(o => o.value === oldValue)) typeSelect.selectedIndex = 0;
      const chatSelect = root.querySelector('#ruleChatBlock');
      if (chatSelect) chatSelect.innerHTML = chatBlockOptions(ev.currentTarget.value || 'twitch', typeSelect.value || '', '');
      updateRuleValueHelpUi();
    });
    root.querySelector('#ruleTypeKey')?.addEventListener('change', ev => {
      const chatSelect = root.querySelector('#ruleChatBlock');
      const source = root.querySelector('#ruleSource')?.value || 'twitch';
      if (chatSelect) chatSelect.innerHTML = chatBlockOptions(source, ev.currentTarget.value || '', '');
      updateRuleValueHelpUi();
    });
    root.querySelector('#ruleTtsEnabled')?.addEventListener('change', updateRuleTtsUi);
    root.querySelector('#ruleTierFilter')?.addEventListener('change', updateRuleTierUi);
    updateRuleTierUi();
    updateRuleTtsUi();
    root.querySelector('#chatBlockSource')?.addEventListener('change', ev => { const t=root.querySelector('#chatBlockTypeKey'); if(t){ const old=t.value; t.innerHTML=typeOptionsForSource(ev.currentTarget.value||'twitch', old, false); if (![...t.options].some(o=>o.value===old)) t.selectedIndex=0; } });
    root.querySelector('#saveVariant')?.addEventListener('click', saveVariant);
    root.querySelector('#addChatTextRow')?.addEventListener('click', () => { const list=root.querySelector('#chatTextList'); if(list){ list.insertAdjacentHTML('afterbegin', chatTextRowHtml('', 0)); const ta=list.querySelector('.chat-text-row:first-child .chat-text-input'); if(ta){ state.placeholderTarget=ta; ta.focus(); ta.select?.(); } } });
    root.querySelectorAll('[data-remove-chat-text]').forEach(btn => btn.addEventListener('click', () => { const row=btn.closest('[data-chat-text-row]'); const list=root.querySelector('#chatTextList'); if(row && list && list.children.length > 1) row.remove(); else if(row){ const ta=row.querySelector('.chat-text-input'); if(ta) ta.value=''; } }));
    root.querySelector('#saveChatBlock')?.addEventListener('click', saveChatBlock);
    root.querySelector('#savePreset')?.addEventListener('click', savePreset);
    root.querySelectorAll('[data-replay-alert]').forEach(btn => btn.addEventListener('click', async () => replayAlert(btn.dataset.replayAlert)));
    root.querySelectorAll('input[name="durationModeChoice"]').forEach(el => el.addEventListener('change', updateDurationModeUi));
    updateDurationModeUi();
    root.querySelector('#ruleSound')?.addEventListener('change', () => { updateDurationSoundInfo(); updateRuleSoundButton(); });
    root.querySelector('#submitUpload')?.addEventListener('click', async () => {
      const form = root.querySelector('#uploadForm');
      const fd = new FormData(form);
      const res = await fetch('/api/alerts/assets/upload', { method:'POST', body:fd });
      const data = await res.json().catch(()=>({}));
      if (!res.ok || data.ok === false) throw new Error(data.message || data.error || 'Upload fehlgeschlagen');
      state.modal = null; state.modalRule = null;
      state.note = `Upload fertig: ${data.asset?.label || data.asset?.original_name || 'Asset'}`;
      await loadAll(true);
    });
  }

  function updateDurationModeUi(){
    const mode = root.querySelector('input[name="durationModeChoice"]:checked')?.value || 'fixed';
    const fixed = root.querySelector('#durationFixedBox');
    const sound = root.querySelector('#durationSoundBox');
    if (fixed) fixed.hidden = mode !== 'fixed';
    if (sound) sound.hidden = mode !== 'sound';
  }

  function updateDurationSoundInfo(){
    const mediaId = valOrNull('ruleSoundMediaId');
    const legacySoundId = valOrNull('ruleSound');
    let soundDuration = 0;
    if (mediaId && state.modalRule) soundDuration = ruleSoundMediaDurationMs(state.modalRule);
    if (!soundDuration) soundDuration = selectedSoundDuration(legacySoundId);
    const durationInput = root.querySelector('#ruleDuration');
    const soundEl = root.querySelector('#durationSoundMs');
    const calcEl = root.querySelector('#durationCalculatedMs');
    if (soundEl) soundEl.textContent = soundDuration ? fmtMs(soundDuration) : 'kein Sound / unbekannt';
    if (calcEl) calcEl.textContent = calcDurationFromSoundMs(soundDuration, durationInput?.value || 7000);
  }

  function updateRuleSoundButton(){
    const btn = root.querySelector('#playRuleSound');
    if (!btn) return;
    const soundId = root.querySelector('#ruleSound')?.value || '';
    const url = selectedSoundUrl(soundId);
    btn.disabled = !url;
    btn.dataset.soundId = soundId || '';
    btn.dataset.currentSoundUrl = url || '';
    updateSoundButtonStates();
  }

  let previewAudio = null;
  let previewAudioUrl = '';

  function normalizeSoundUrl(url){
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    try {
      if (raw.startsWith('/')) return new URL(raw, window.location.origin).href;
      return new URL('/' + raw.replace(/^\/+/, ''), window.location.origin).href;
    } catch (err) {
      return raw;
    }
  }

  function ensurePreviewAudio(){
    if (previewAudio) return previewAudio;
    previewAudio = document.createElement('audio');
    previewAudio.preload = 'auto';
    previewAudio.style.display = 'none';
    previewAudio.addEventListener('ended', updateSoundButtonStates);
    previewAudio.addEventListener('pause', updateSoundButtonStates);
    document.body.appendChild(previewAudio);
    return previewAudio;
  }

  function updateSoundButtonStates(){
    const playing = previewAudio && !previewAudio.paused && previewAudioUrl;
    root.querySelectorAll('[data-play-sound]').forEach(btn => {
      btn.classList.toggle('is-playing', !!playing && normalizeSoundUrl(btn.dataset.playSound) === previewAudioUrl);
    });
    const ruleBtn = root.querySelector('#playRuleSound');
    if (ruleBtn) {
      const url = selectedSoundUrl(root.querySelector('#ruleSound')?.value || '');
      ruleBtn.classList.toggle('is-playing', !!playing && normalizeSoundUrl(url) === previewAudioUrl);
    }
  }

  function playSoundUrl(url, btn){
    const finalUrl = normalizeSoundUrl(url);
    if (!finalUrl) return;
    try {
      const audio = ensurePreviewAudio();
      if (!audio.paused && previewAudioUrl === finalUrl) {
        audio.pause();
        audio.currentTime = 0;
        updateSoundButtonStates();
        return;
      }
      audio.pause();
      audio.currentTime = 0;
      previewAudioUrl = finalUrl;
      audio.src = finalUrl;
      audio.volume = 1;
      audio.load();
      updateSoundButtonStates();
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(err => {
          state.note = `Fehler beim Abspielen: ${err.message || err}`;
          updateSoundButtonStates();
          render();
        });
      }
    } catch (err) {
      state.note = `Fehler beim Abspielen: ${err.message || err}`;
      updateSoundButtonStates();
      render();
    }
  }


  function normalizeCropDefaultsOnEditorStart(settings){
    const out = Object.assign({}, settings || {});
    // STEP150: Beim Öffnen des Design-Editors wird die Top-Grafik bewusst wieder
    // auf die saubere Startposition gesetzt. Gespeicherte Altwerte wie Größe 2
    // oder verschobene Crops landen dadurch nicht mehr ungefragt auf den Reglern.
    out.topGraphicScale = 1;
    out.topGraphicOffsetY = -18;
    out.topGraphicImageZoom = 1;
    out.topGraphicImageX = 50;
    out.topGraphicImageY = 50;
    return out;
  }

  function readDisplaySettings(){
    const get = key => root.querySelector(`[data-display-key="${key}"]`)?.value;
    const num = (key, fallback) => Number(get(key) || fallback);
    const boolVal = (key, fallback) => {
      const raw = get(key);
      if (raw === undefined || raw === null || raw === '') return fallback;
      return raw !== 'false';
    };
    const topGraphicAssetId = get('topGraphicAssetId') || '';
    const topGraphicMediaId = get('topGraphicMediaId') || '';
    const topGraphicMediaUrl = get('topGraphicMediaUrl') || '';
    const topGraphicMediaLabel = get('topGraphicMediaLabel') || '';
    return {
      widthMode:get('widthMode')||'custom',
      overlayPosition:'custom',
      positionX:num('positionX',50),
      positionY:num('positionY',50),
      cardWidthPx:num('cardWidthPx',1120),
      cardHeightPx:num('cardHeightPx',300),
      sizeScale:num('sizeScale',1),
      fontScale:num('fontScale',1),
      headlineScale:num('headlineScale',1),
      valueScale:num('valueScale',1),
      avatarPosition:get('avatarPosition')||'left',
      avatarSize:get('avatarSize')||'normal',
      providerLogoStyle:get('providerLogoStyle')||'tile',
      topGraphicAssetId,
      topGraphicMediaId,
      topGraphicMediaUrl,
      topGraphicMediaLabel,
      topGraphicUrl:topGraphicMediaId ? topGraphicMediaUrl : selectedImageAssetUrl(topGraphicAssetId),
      topGraphicScale:num('topGraphicScale',1),
      topGraphicOffsetY:num('topGraphicOffsetY',-18),
      topGraphicShape:get('topGraphicShape')||'original',
      topGraphicFrameStrength:normalizeGraphicOutline(get('topGraphicFrameStrength')),
      topGraphicImageZoom:num('topGraphicImageZoom',1),
      topGraphicImageX:num('topGraphicImageX',50),
      topGraphicImageY:num('topGraphicImageY',50),
      topGraphicFrameStyle:get('topGraphicShape')||get('topGraphicFrameStyle')||'original',
      cardBorderColorA:'#8ff4ff',
      cardBorderColorB:'#c45cff',
      innerBorderEnabled:get('innerBorderEnabled')!=='false',
      previewCelebration:get('previewCelebration')||'none',
      celebrationStrength:get('celebrationStrength')||'medium',
      badgeEnabled:false,
      badgeStyle:'none',
      badgeScale:1,
      textAlign:get('textAlign')||'left',
      messageEnabled:boolVal('messageEnabled', true),
      messageScale:num('messageScale',1),
      messageWidthMode:get('messageWidthMode')||'normal',
      messageMaxLines:num('messageMaxLines',0),
      messageWeight:get('messageWeight')||'normal',
      showSideLines:get('showSideLines')!=='false',
      showParticles:get('showParticles')!=='false',
      glowStrength:get('glowStrength')||'normal'
    };
  }

  function setDisplayRangeValue(key, value){
    const el = root.querySelector(`[data-display-key="${key}"]`);
    if (!el) return;
    el.value = String(value);
    const label = el.closest('label')?.querySelector('.range-value');
    if (label) label.textContent = String(value);
  }

  function centerTopGraphicCrop(){
    setDisplayRangeValue('topGraphicScale', '1');
    setDisplayRangeValue('topGraphicOffsetY', '-18');
    setDisplayRangeValue('topGraphicImageZoom', '1');
    setDisplayRangeValue('topGraphicImageX', '50');
    setDisplayRangeValue('topGraphicImageY', '50');
    renderDesignPreview();
    updateDesignPopout();
  }

  function defaultDisplayProfileSettings(){
    return normalizeCropDefaultsOnEditorStart({
      widthMode:'custom', overlayPosition:'custom', positionX:50, positionY:50, cardWidthPx:1120, cardHeightPx:300,
      sizeScale:1, fontScale:1, headlineScale:1, valueScale:1, avatarPosition:'left', avatarSize:'normal', providerLogoStyle:'tile',
      topGraphicAssetId:'', topGraphicMediaId:'', topGraphicMediaUrl:'', topGraphicMediaLabel:'', topGraphicUrl:'', topGraphicScale:1, topGraphicOffsetY:-18, topGraphicShape:'original', topGraphicFrameStrength:'normal',
      topGraphicImageZoom:1, topGraphicImageX:50, topGraphicImageY:50, topGraphicFrameStyle:'none',
      cardBorderColorA:'#8ff4ff', cardBorderColorB:'#c45cff', innerBorderEnabled:true, badgeEnabled:false, badgeStyle:'none', badgeScale:1,
      textAlign:'left', messageEnabled:true, messageScale:1, messageWidthMode:'normal', messageMaxLines:0, messageWeight:'normal', showSideLines:true, showParticles:true, glowStrength:'normal', previewCelebration:'none', celebrationStrength:'medium'
    });
  }

  function normalizeGraphicOutline(value){
    const v = String(value || '').toLowerCase();
    if (v === 'soft') return 'soft';
    return 'normal';
  }

  function findDisplayProfileNameDuplicate(name, ignoreId){
    const needle = String(name || '').trim().toLowerCase();
    if (!needle) return null;
    return (state.displayProfiles || []).find(p => String(p.name || '').trim().toLowerCase() === needle && Number(p.id) !== Number(ignoreId || 0)) || null;
  }

  function assertDisplayProfileName(name, ignoreId){
    const clean = String(name || '').trim();
    if (!clean) throw new Error('Alert-Name darf nicht leer sein.');
    const duplicate = findDisplayProfileNameDuplicate(clean, ignoreId);
    if (duplicate) throw new Error(`Alert-Name existiert bereits: ${duplicate.name}`);
    return clean;
  }

  async function createDisplayProfile(){
    const nameRaw = prompt('Name für den neuen Alert:', 'Neuer Alert');
    if (nameRaw === null) return;
    const name = assertDisplayProfileName(nameRaw, 0);
    const descriptionRaw = prompt('Beschreibung für den neuen Alert:', '') || '';
    const payload = { name, description: descriptionRaw, is_default: 0, enabled: 1, sort_order: 100, settings: defaultDisplayProfileSettings() };
    const res = await CGN.api('/api/alerts/display-profiles', { method:'POST', body:JSON.stringify(payload) });
    if (res && res.ok === false) throw new Error(res.message || res.error || 'Alert konnte nicht erstellt werden.');
    const newId = res.profile?.id || res.id || null;
    await loadAll(true);
    if (newId) state.displayProfileId = newId;
    state.page = 'design';
    state.note = `Neuer Alert erstellt · ${name}`;
    render();
  }

  async function saveDisplayProfile(){
    const selectedId = Number(root.querySelector('#displayProfileId')?.value || state.displayProfileId || 0);
    const selected = state.displayProfiles.find(p => Number(p.id) === selectedId);
    if (!selected?.id) throw new Error('Kein Alert ausgewählt.');
    const name = assertDisplayProfileName(root.querySelector('#displayProfileName')?.value || selected.name || 'Neuer Alert', selected.id);
    const payload = {
      id:selected.id,
      name,
      description:root.querySelector('#displayProfileDesc')?.value || '',
      is_default:Number(selected.is_default || 0),
      enabled:Number(selected.enabled ?? 1),
      sort_order:selected.sort_order || 100,
      settings:readDisplaySettings()
    };
    const res = await CGN.api(`/api/alerts/display-profiles/${payload.id}`, { method:'PUT', body:JSON.stringify(payload) });
    if (res && res.ok === false) throw new Error(res.message || res.error || 'Alert konnte nicht gespeichert werden.');
    state.displayProfileId = payload.id;
    state.note = `Alert gespeichert · ${name}`;
    await loadAll(true);
  }

  async function deleteDisplayProfile(){
    const selectedId = Number(root.querySelector('#displayProfileId')?.value || state.displayProfileId || 0);
    const selected = state.displayProfiles.find(p => Number(p.id) === selectedId);
    if (!selected?.id) throw new Error('Kein Alert ausgewählt.');
    if (Number(selected.is_default)) throw new Error('Der Standard-Alert kann nicht gelöscht werden.');
    if (!confirm(`Alert/Design wirklich löschen?\n\n${selected.name || ('ID ' + selected.id)}\n\nRegeln mit diesem Design fallen danach auf Standard zurück.`)) return;
    const res = await CGN.api(`/api/alerts/display-profiles/${selected.id}`, { method:'DELETE' });
    if (res && res.ok === false) throw new Error(res.message || res.error || 'Alert konnte nicht gelöscht werden.');
    const fallback = state.displayProfiles.find(p => Number(p.is_default) === 1 && Number(p.id) !== Number(selected.id)) || state.displayProfiles.find(p => Number(p.id) !== Number(selected.id));
    state.displayProfileId = fallback?.id || null;
    state.note = `Alert gelöscht · ${selected.name || selected.id}`;
    await loadAll(true);
  }

  async function playDisplayProfilePreview(){
    const selected = state.displayProfiles.find(p => Number(p.id) === Number(root.querySelector('#displayProfileId')?.value || 0)) || state.displayProfiles[0];
    if (!selected?.id) return;
    await saveDisplayProfile();
    const previewSettings = readDisplaySettings();
    const res = await CGN.api(`/api/alerts/display-profiles/${selected.id}/play`, { method:'POST', body:JSON.stringify({ celebration: previewSettings.previewCelebration || 'none' }) });
    state.note = `Design-Vorschau gesendet · matchedRule: ${res.matchedRule ?? '—'}`;
    await loadAll(true);
  }

  async function replayAlert(eventUid){
    if (!eventUid) return;
    const res = await CGN.api(`/api/alerts/events/${encodeURIComponent(eventUid)}/replay`, { method:'POST', body:'{}' });
    state.note = `Alert erneut eingereiht · ${res.eventUid || ''}`.trim();
    await loadAll(true);
  }

  async function openEditRule(ruleId){
    if (!ruleId) return;
    try {
      const fresh = await CGN.api('/api/alerts/rules');
      if (Array.isArray(fresh.rules)) state.rules = fresh.rules;
      if (Array.isArray(fresh.types)) state.types = fresh.types;
      if (Array.isArray(fresh.assets)) state.assets = fresh.assets;
      const rule = state.rules.find(x => Number(x.id) === Number(ruleId));
      if (!rule) {
        state.note = `Fehler: Regel ID ${ruleId} wurde nicht gefunden.`;
        render();
        return;
      }
      state.modal = 'rule';
      state.modalRule = normalizeRule(JSON.parse(JSON.stringify(rule)));
      state.note = '';
      render();
    } catch (err) {
      const fallback = state.rules.find(x => Number(x.id) === Number(ruleId));
      if (fallback) {
        state.modal = 'rule';
        state.modalRule = normalizeRule(JSON.parse(JSON.stringify(fallback)));
        state.note = `Warnung: Regel aus aktuellem Dashboard-State geladen, API-Frischladen fehlgeschlagen: ${err.message}`;
      } else {
        state.note = `Fehler beim Laden der Regel: ${err.message}`;
      }
      render();
    }
  }


  function readChatBlockForm(){
    return {
      id: state.modalRule?.id || undefined,
      source: document.getElementById('chatBlockSource').value,
      type_key: document.getElementById('chatBlockTypeKey').value.trim(),
      label: document.getElementById('chatBlockLabel').value.trim() || 'Chat-Textblock',
      texts: [...document.querySelectorAll('.chat-text-input')].map(x => x.value.trim()).filter(Boolean),
      enabled: Number(document.getElementById('chatBlockEnabled').value || 1),
      sort_order: Number(document.getElementById('chatBlockSort').value || 100)
    };
  }

  async function saveChatBlock(){
    const payload = readChatBlockForm();
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `/api/alerts/chat-blocks/${payload.id}` : '/api/alerts/chat-blocks';
    const res = await CGN.api(url, { method, body:JSON.stringify(payload) });
    state.modal = null; state.modalRule = null;
    state.note = `Chat-Textblock gespeichert · ID ${res.block?.id || payload.id || 'neu'}`;
    await loadAll(true);
  }

  function readVariantForm(){
    return {
      id: state.modalRule?.id || undefined,
      source: document.getElementById('variantSource').value,
      type_key: document.getElementById('variantTypeKey').value.trim(),
      rule_id: numOrNull('variantRuleId'),
      label: document.getElementById('variantLabel').value.trim(),
      title_template: document.getElementById('variantTitle').value,
      headline_template: document.getElementById('variantHeadline').value,
      value_template: document.getElementById('variantValue').value,
      subline_template: document.getElementById('variantSubline').value,
      message_template: document.getElementById('variantMessageTemplate').value,
      message_mode: document.getElementById('variantMessageMode').value,
      hide_subline_when_message_exists: Number(document.getElementById('variantHideSubline').value || 1),
      pick_weight: Number(document.getElementById('variantWeight').value || 100),
      sort_order: Number(document.getElementById('variantSort').value || 100),
      enabled: Number(document.getElementById('variantEnabled').value || 1)
    };
  }

  async function saveVariant(){
    const payload = readVariantForm();
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `/api/alerts/text-variants/${payload.id}` : '/api/alerts/text-variants';
    const res = await CGN.api(url, { method, body:JSON.stringify(payload) });
    state.modal = null; state.modalRule = null;
    state.note = `Textvariante gespeichert · ID ${res.variant?.id || payload.id || 'neu'}`;
    await loadAll(true);
  }

  function readPresetForm(){
    let payload = {};
    try { payload = JSON.parse(document.getElementById('presetPayload').value || '{}'); }
    catch (err) { throw new Error(`Payload JSON ungültig: ${err.message}`); }
    return {
      id: state.modalRule?.id || undefined,
      source: document.getElementById('presetSource').value,
      type_key: document.getElementById('presetTypeKey').value.trim(),
      rule_id: numOrNull('presetRuleId'),
      label: document.getElementById('presetLabel').value.trim(),
      payload,
      sort_order: Number(document.getElementById('presetSort').value || 100),
      enabled: Number(document.getElementById('presetEnabled').value || 1)
    };
  }

  async function savePreset(){
    const payload = readPresetForm();
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `/api/alerts/test-presets/${payload.id}` : '/api/alerts/test-presets';
    const res = await CGN.api(url, { method, body:JSON.stringify(payload) });
    state.modal = null; state.modalRule = null;
    state.note = `Testpreset gespeichert · ID ${res.preset?.id || payload.id || 'neu'}`;
    await loadAll(true);
  }

  function rulePayloadFromState(r, enabledOverride){
    return {
      id: r.id,
      source: r.source,
      type_key: r.type_key,
      label: r.label || 'Unbenannte Regel',
      min_value: r.min_value ?? null,
      max_value: r.max_value ?? null,
      tier: 'normal',
      priority: Number(r.priority ?? 100),
      duration_ms: Number(r.duration_ms ?? 7000),
      duration_mode: r.duration_mode || 'fixed',
      animation: 'neon_card',
      image_mode: r.image_mode || r.imageMode || ((r.image_media_id ?? r.imageMediaId ?? r.image_asset_id) ? 'special' : 'none'),
      enabled: enabledOverride === undefined ? Number(r.enabled ?? 1) : Number(enabledOverride),
      sound_asset_id: r.sound_asset_id ?? null,
      image_asset_id: r.image_asset_id ?? null,
      sound_media_id: r.sound_media_id ?? r.soundMediaId ?? null,
      image_media_id: r.image_media_id ?? r.imageMediaId ?? null,
      display_profile_id: r.display_profile_id ?? null,
      tts_enabled: Number(r.tts_enabled ?? 0),
      tts_timing: r.tts_timing || 'after_alert',
      tts_mode: r.tts_mode || 'audio_only',
      tts_template: r.tts_template || '{user} schreibt: {message}',
      tts_max_chars: Number(r.tts_max_chars ?? 250),
      tts_min_amount: r.tts_min_amount ?? null,
      meta: (() => {
        const meta = cloneMeta(r.meta || {});
        delete meta.celebration;
        return meta;
      })()
    };
  }

  async function toggleRuleEnabled(id){
    const r = state.rules.find(x => Number(x.id) === Number(id));
    if (!r) return;
    const next = Number(r.enabled) ? 0 : 1;
    const payload = rulePayloadFromState(r, next);
    await CGN.api(`/api/alerts/rules/${id}`, { method:'PUT', body:JSON.stringify(payload) });
    state.note = `Regel ${next ? 'aktiviert' : 'deaktiviert'} · ID ${id}`;
    await loadAll(true);
  }

  async function saveRule(){
    const payload = readRuleForm();
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `/api/alerts/rules/${payload.id}` : '/api/alerts/rules';
    const res = await CGN.api(url, { method, body:JSON.stringify(payload) });
    state.modal = null; state.modalRule = null;
    state.note = `Regel gespeichert · ID ${res.rule?.id || payload.id || 'neu'}`;
    await loadAll(true);
  }

  async function testRule(id){
    const r = state.rules.find(x => Number(x.id) === Number(id));
    if (!r) return;
    const amount = r.max_value !== null && r.max_value !== undefined ? Number(r.max_value) : Number(r.min_value || 0);
    const payload = { source:r.source, type_key:r.type_key, ruleId:r.id, user:'ForrestCGN', amount, message:`Test für ${r.label}`, displayProfileId:r.display_profile_id || undefined };
    const res = await CGN.api('/api/alerts/test', { method:'POST', body:JSON.stringify(payload) });
    state.note = `Regeltest gesendet · matchedRule: ${res.matchedRule ?? '—'}`;
    await loadAll(true);
  }

  function numOrNull(id){ const v = document.getElementById(id)?.value; return v === '' || v === undefined ? null : Number(v); }
  function valOrNull(id){ const v = document.getElementById(id)?.value; return v === '' || v === undefined ? null : Number(v); }

  /* STEP128: EINZIGER Preview-Renderer.
     Mini-Vorschau und Popout nutzen die echte Overlay-Datei im 1920x1080-Iframe.
     Keine Fake-Preview-Markups mehr ergänzen, sonst weichen Dashboard und OBS wieder voneinander ab. */
  function renderDesignPreview(){
    const box = root.querySelector('#alertDesignPreview');
    if (!box) return;
    const st = readDisplaySettings();
    box.className = 'alert-design-preview overlay-iframe-preview step136-preview avatar-' + escClass(st.avatarPosition) + ' avatar-' + escClass(st.avatarSize) + ' logo-' + escClass(st.providerLogoStyle) + ' glow-' + escClass(st.glowStrength) + (st.showParticles ? '' : ' particles-off') + (st.showSideLines ? '' : ' lines-off');
    if (!box.querySelector('iframe.cgn-alert-preview-frame')) {
      box.innerHTML = designPreviewMarkup(st, false);
    } else {
      updateDesignPreviewToolbar(box, st, false);
    }
    updateDesignPreviewToolbar(box, st, false);
    applyPreviewVars(box, st);
    postPreviewAlertToFrame(box, st);
    updateDesignPopout();
  }

  function designPreviewMarkup(st, popout){
    const src = '/overlays/_overlay-alerts-v2.html?preview=1&v=2093';
    return '<div class="preview-toolbar"></div>' +
      '<div class="preview-viewport" aria-label="OBS-Vorschaufläche"><div class="preview-safe-zone"></div><div class="preview-crosshair"></div><div class="preview-anchor-dot"></div>' +
      '<div class="preview-axis x"></div><div class="preview-axis y"></div>' +
      '<div class="preview-corner-label tl">oben links</div><div class="preview-corner-label tc">oben</div><div class="preview-corner-label tr">oben rechts</div><div class="preview-corner-label ml">links</div><div class="preview-corner-label mr">rechts</div><div class="preview-corner-label bl">unten links</div><div class="preview-corner-label bc">unten</div><div class="preview-corner-label br">unten rechts</div>' +
      '<div class="preview-iframe-wrap"><iframe class="cgn-alert-preview-frame" src="' + esc(src) + '" title="Echte Alert-Vorschau"></iframe></div></div>';
  }

  function updateDesignPreviewToolbar(container, st, popout){
    const toolbar = container.querySelector('.preview-toolbar');
    if (!toolbar) return;
    const widthPx = previewCardBasePx(st);
    const heightPx = previewCardEstimatedHeight(st);
    const mode = popout ? '1920×1080 Originalgröße' : 'OBS 16:9 skaliert';
    toolbar.innerHTML = '<span>' + esc(mode) + '</span><strong>' + esc(widthPx + '×' + heightPx + ' px') + '</strong><em>' + esc('X ' + st.positionX + '% · Y ' + st.positionY + '% · Avatar ' + displaySimpleLabel(st.avatarPosition) + ' · ' + displaySimpleLabel(st.avatarSize)) + '</em>';
  }

  function applyPreviewVars(el, st){
    const viewport = el.querySelector('.preview-viewport');
    const wrap = el.querySelector('.preview-iframe-wrap');
    if (!viewport || !wrap) return;
    const popout = el.classList.contains('popout-preview');
    const scale = previewViewportScale(viewport, popout);
    wrap.style.transform = popout ? 'none' : ('scale(' + scale + ')');
    const m = previewPositionMetrics(st);
    const dot = el.querySelector('.preview-anchor-dot');
    if (dot) { dot.style.left = m.x + '%'; dot.style.top = m.y + '%'; dot.style.right='auto'; dot.style.bottom='auto'; dot.style.transform='translate(-50%,-50%)'; }
    const ax = el.querySelector('.preview-axis.x'); if (ax) ax.style.top = m.y + '%';
    const ay = el.querySelector('.preview-axis.y'); if (ay) ay.style.left = m.x + '%';
  }

  function previewViewportScale(viewport, popout){
    if (popout) return 1;
    const w = Math.max(320, viewport.clientWidth || 640);
    const h = Math.max(180, viewport.clientHeight || Math.round(w * 9 / 16));
    return Math.max(0.06, Math.min(1, Math.min(w / 1920, h / 1080)));
  }

  function previewCardBasePx(st){ return Math.round(Math.max(560, Math.min(1600, Number(st.cardWidthPx || 1120)))); }
  function previewCardEstimatedHeight(st){ return Math.round(Math.max(180, Math.min(520, Number(st.cardHeightPx || 300)))); }
  function previewPositionMetrics(st){ return { x:Number(st.positionX || 50), y:Number(st.positionY || 50) }; }

  function buildDashboardPreviewAlert(st){
    const variant = selectedPreviewVariant();
    const ctx = {
      userDisplayName: 'ForrestCGN',
      userLogin: 'forrestcgn',
      user: 'ForrestCGN',
      amount: 100,
      amountFormatted: '100 Bits',
      currency: 'EUR',
      months: 7,
      streakMonths: 3,
      viewerCount: 23,
      recipientDisplayName: 'EngelCGN',
      tier: 'normal',
      provider: (variant && variant.source) || 'twitch',
      message: 'Das ist ein längerer Vorschautext aus dem Dashboard. Hier sieht man Größe, Breite und maximale Zeilen direkt in der Live-Vorschau.'
    };
    const source = (variant && variant.source) || 'twitch';
    const type = (variant && variant.type_key) || 'bits';
    const tpl = v => renderPreviewTemplate(v || '', ctx);
    let headline = variant ? tpl(variant.headline_template) : 'ForrestCGN';
    let value = variant ? tpl(variant.value_template) : 'cheert 100 Bits';
    let subline = variant ? tpl(variant.subline_template) : '';
    let msg = ctx.message;
    if (variant) {
      const mode = String(variant.message_mode || 'auto').toLowerCase();
      if (variant.message_template) msg = tpl(variant.message_template);
      if (mode === 'never') msg = '';
      if (mode === 'always' && !msg) msg = ctx.message;
      if (msg && Number(variant.hide_subline_when_message_exists ?? 1)) subline = '';
    }
    return {
      id: 'dashboard_preview_' + Date.now(),
      source, provider: source, type, type_key: type, tier: 'normal',
      headline, value, subline, message: msg,
      user: ctx.user, userLogin: ctx.userLogin, userDisplayName: ctx.userDisplayName, avatarUrl: '', amount: ctx.amount,
      durationMs: 3600000,
      celebration: st.previewCelebration || 'none',
      meta: { celebration: st.previewCelebration || 'none' },
      display: { settings: st }
    };
  }

  function renderPreviewTemplate(template, ctx){
    return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      if (ctx[key] === undefined || ctx[key] === null) return '';
      return String(ctx[key]);
    });
  }

  function postPreviewAlertToFrame(container, st){
    const frame = container && container.querySelector ? container.querySelector('iframe.cgn-alert-preview-frame') : null;
    if (!frame) return;
    const send = () => {
      try { frame.contentWindow.postMessage({ op:'cgn_alert_preview', event:'render', alert: buildDashboardPreviewAlert(st) }, '*'); } catch(_) {}
    };
    frame.onload = send;
    setTimeout(send, 50);
    setTimeout(send, 150);
    setTimeout(send, 350);
  }

  function openDesignPopout(){
    const win = window.open('', 'cgnAlertDesignPreview', 'width=1920,height=1080,resizable=yes,scrollbars=no');
    if (!win) { state.note='Popout konnte nicht geöffnet werden. Popup-Blocker prüfen.'; render(); return; }
    state.previewPopout = win;
    const css = Array.from(document.styleSheets).map(ss => { try { return Array.from(ss.cssRules).map(r=>r.cssText).join('\n'); } catch(e) { return ''; } }).join('\n');
    win.document.open();
    win.document.write('<!doctype html><html lang="de"><head><meta charset="utf-8"><title>CGN Alert 1920×1080 Vorschau</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#050716;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}.popout-preview{width:1920px;height:1080px;padding:0;box-sizing:border-box}.popout-preview .preview-toolbar{position:absolute;z-index:20;left:12px;top:12px;background:rgba(3,5,16,.72);border:1px solid rgba(143,244,255,.22);border-radius:14px}.popout-preview .preview-viewport{width:1920px!important;height:1080px!important;max-height:none!important;border-radius:0!important}</style><style>' + css + '</style></head><body><div id="popoutPreview" class="alert-design-preview popout-preview step136-preview"></div></body></html>');
    win.document.close();
    setTimeout(updateDesignPopout, 80);
  }

  function updateDesignPopout(){
    const win=state.previewPopout; if(!win || win.closed) return;
    const target=win.document.getElementById('popoutPreview'); if(!target) return;
    const st=readDisplaySettings();
    target.className = 'alert-design-preview popout-preview overlay-iframe-preview step136-preview avatar-' + escClass(st.avatarPosition) + ' avatar-' + escClass(st.avatarSize) + ' logo-' + escClass(st.providerLogoStyle) + ' glow-' + escClass(st.glowStrength) + (st.showParticles ? '' : ' particles-off') + (st.showSideLines ? '' : ' lines-off');
    target.innerHTML = designPreviewMarkup(st, true);
    updateDesignPreviewToolbar(target, st, true);
    applyPreviewVars(target, st);
    postPreviewAlertToFrame(target, st);
  }

  window.addEventListener("resize", () => { if (state.page === "design") renderDesignPreview(); });
  window.AlertsModule = { loadAll };
  loadAll();
})();
