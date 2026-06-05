(() => {
  'use strict';

  const root = document.querySelector('[data-cgn-shoutout-sets]');
  if (!root) return;

  const API = '/api/clip-shoutout/overlay-sets';
  const statusEl = root.querySelector('[data-status]');
  const listEl = root.querySelector('[data-set-list]');
  const placeholdersEl = root.querySelector('[data-placeholders]');
  const template = document.getElementById('set-template');

  let sets = [];
  let defaults = [];
  let placeholders = ['{displayName}', '{login}', '{clipTitle}', '{clipUrl}', '{gameName}'];

  function setStatus(text, type = '') {
    statusEl.textContent = text || '';
    statusEl.classList.remove('ok', 'error');
    if (type) statusEl.classList.add(type);
  }

  function safeId(value, fallback) {
    return String(value || fallback || 'overlay-set')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback || 'overlay-set';
  }

  function normalizeSet(raw, index) {
    const fallbackId = `overlay-set-${index + 1}`;
    return {
      id: safeId(raw && (raw.id || raw.key), fallbackId),
      enabled: raw && raw.enabled !== false,
      weight: Math.max(0, Number(raw && raw.weight || 1) || 1),
      headline: String(raw && raw.headline || '').trim() || 'Schaut gerne mal vorbei!',
      subline: String(raw && raw.subline || '').trim() || 'Heute auf der Leinwand: {displayName}'
    };
  }

  function renderPlaceholders() {
    placeholdersEl.innerHTML = '';
    placeholders.forEach(token => {
      const code = document.createElement('code');
      code.textContent = token;
      placeholdersEl.appendChild(code);
    });
  }

  function exampleRender(text) {
    return String(text || '')
      .replace(/\{displayName\}/g, 'CrazyMeerSchweinchen')
      .replace(/\{login\}/g, 'crazymeerschweinchen')
      .replace(/\{clipTitle\}/g, 'Rentnerkino Deluxe')
      .replace(/\{clipUrl\}/g, 'https://clips.twitch.tv/...')
      .replace(/\{gameName\}/g, 'Minecraft');
  }

  function readCard(card) {
    return {
      id: safeId(card.querySelector('[data-field="id"]').value, 'overlay-set'),
      enabled: card.querySelector('[data-field="enabled"]').checked,
      weight: Math.max(0, Number(card.querySelector('[data-field="weight"]').value || 1) || 1),
      headline: String(card.querySelector('[data-field="headline"]').value || '').trim(),
      subline: String(card.querySelector('[data-field="subline"]').value || '').trim()
    };
  }

  function collectSets() {
    return Array.from(listEl.querySelectorAll('[data-set-card]'))
      .map(readCard)
      .filter(set => set.headline || set.subline)
      .map((set, index) => ({
        ...set,
        id: safeId(set.id, `overlay-set-${index + 1}`),
        headline: set.headline || 'Schaut gerne mal vorbei!',
        subline: set.subline || 'Heute auf der Leinwand: {displayName}'
      }));
  }

  function updatePreview(card) {
    const headline = card.querySelector('[data-field="headline"]').value;
    const subline = card.querySelector('[data-field="subline"]').value;
    card.querySelector('[data-preview-headline]').textContent = exampleRender(headline);
    card.querySelector('[data-preview-subline]').textContent = exampleRender(subline);
  }

  function renderSets() {
    listEl.innerHTML = '';
    sets.forEach((set, index) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector('[data-set-number]').textContent = String(index + 1);
      card.querySelector('[data-field="id"]').value = set.id;
      card.querySelector('[data-field="enabled"]').checked = set.enabled !== false;
      card.querySelector('[data-field="weight"]').value = String(set.weight || 1);
      card.querySelector('[data-field="headline"]').value = set.headline || '';
      card.querySelector('[data-field="subline"]').value = set.subline || '';

      card.addEventListener('input', () => updatePreview(card));
      card.addEventListener('change', () => updatePreview(card));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        card.remove();
        renumberCards();
        setStatus('Set entfernt. Speichern nicht vergessen.');
      });

      updatePreview(card);
      listEl.appendChild(card);
    });
    renumberCards();
  }

  function renumberCards() {
    Array.from(listEl.querySelectorAll('[data-set-card]')).forEach((card, index) => {
      card.querySelector('[data-set-number]').textContent = String(index + 1);
    });
  }

  async function loadSets() {
    setStatus('Lade Overlay-Sets …');
    try {
      const res = await fetch(API, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const payload = data.overlaySets || {};
      sets = (payload.sets || []).map(normalizeSet);
      defaults = (payload.defaults || []).map(normalizeSet);
      placeholders = Array.isArray(payload.placeholders) && payload.placeholders.length ? payload.placeholders : placeholders;

      renderPlaceholders();
      renderSets();
      setStatus(`Geladen: ${sets.length} Overlay-Sets.`, 'ok');
    } catch (err) {
      setStatus(`Fehler beim Laden: ${err.message || err}`, 'error');
    }
  }

  async function saveSets() {
    const payloadSets = collectSets();
    if (!payloadSets.length) {
      setStatus('Es muss mindestens ein Set vorhanden sein.', 'error');
      return;
    }

    setStatus('Speichere Overlay-Sets …');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sets: payloadSets })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const payload = data.overlaySets || {};
      sets = (payload.sets || payloadSets).map(normalizeSet);
      renderSets();
      setStatus(`Gespeichert: ${sets.length} Overlay-Sets.`, 'ok');
    } catch (err) {
      setStatus(`Fehler beim Speichern: ${err.message || err}`, 'error');
    }
  }

  function addSet() {
    const next = listEl.querySelectorAll('[data-set-card]').length + 1;
    sets = collectSets();
    sets.push({
      id: `overlay-set-${next}`,
      enabled: true,
      weight: 1,
      headline: 'Neues Rentner-Kino!',
      subline: 'Heute auf der Leinwand: {displayName}'
    });
    renderSets();
    setStatus('Neues Set hinzugefügt. Speichern nicht vergessen.');
  }

  root.addEventListener('click', (event) => {
    const action = event.target && event.target.dataset ? event.target.dataset.action : '';
    if (action === 'reload') loadSets();
    if (action === 'save') saveSets();
    if (action === 'add') addSet();
  });

  loadSets();
})();
