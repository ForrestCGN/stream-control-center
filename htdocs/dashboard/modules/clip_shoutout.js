(function () {
  'use strict';

  const API = '/api/clip-shoutout';

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else node.setAttribute(key, value);
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  async function getJson(path) {
    const res = await fetch(API + path, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || ('HTTP ' + res.status));
    return data;
  }

  async function postJson(path, body) {
    const res = await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || ('HTTP ' + res.status));
    return data;
  }

  function fmt(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
  }

  function mount(root) {
    root.innerHTML = '';
    root.classList.add('clip-shoutout-dashboard');

    const statusLine = el('div', { class: 'cso-status', text: 'Lade Clip-Shoutout…' });
    const settingsBox = el('div', { class: 'cso-card' });
    const queueBox = el('div', { class: 'cso-card' });

    root.appendChild(el('div', { class: 'cso-header' }, [
      el('div', {}, [
        el('h2', { text: 'Clip-Shoutout / SO-System' }),
        el('p', { text: '90-Tage-Clip-Suche, offizieller Twitch-Shoutout nach Anzeige und Cooldown-Queue.' })
      ]),
      el('button', { class: 'cso-button', type: 'button', text: 'Aktualisieren' })
    ]));
    root.appendChild(statusLine);
    root.appendChild(settingsBox);
    root.appendChild(queueBox);

    root.querySelector('button').addEventListener('click', refresh);

    async function refresh() {
      try {
        const [status, queue] = await Promise.all([getJson('/status'), getJson('/queue')]);
        renderStatus(status);
        renderSettings(status.config || {});
        renderQueue(queue.officialQueue || {});
      } catch (err) {
        statusLine.textContent = 'Fehler: ' + (err.message || String(err));
      }
    }

    function renderStatus(status) {
      statusLine.textContent = `Status: ${status.enabled ? 'aktiv' : 'inaktiv'} · Command: !${status.command || 'so'} · Version: ${status.moduleVersion || '-'}`;
    }

    function renderSettings(cfg) {
      const official = cfg.officialShoutout || {};
      settingsBox.innerHTML = '';
      settingsBox.appendChild(el('h3', { text: 'Einstellungen' }));

      const lookback = el('input', { type: 'number', min: '1', max: '3650', value: String(cfg.clipLookbackDays || 90) });
      const ranges = el('input', { type: 'text', value: Array.isArray(cfg.clipSearchRangesDays) ? cfg.clipSearchRangesDays.join(',') : '90,365,0' });
      const officialEnabled = el('input', { type: 'checkbox' });
      officialEnabled.checked = official.enabled !== false;
      const save = el('button', { class: 'cso-button', type: 'button', text: 'Speichern' });

      settingsBox.appendChild(el('label', {}, ['Clip-Lookback Tage', lookback]));
      settingsBox.appendChild(el('label', {}, ['Suchbereiche Tage (0 = all_time)', ranges]));
      settingsBox.appendChild(el('label', { class: 'cso-check' }, [officialEnabled, ' Offiziellen Twitch-Shoutout nach Anzeige queue’n']));
      settingsBox.appendChild(save);

      save.addEventListener('click', async () => {
        const rangeValues = ranges.value.split(',').map(v => Number.parseInt(v.trim(), 10)).filter(v => Number.isFinite(v) && v >= 0);
        await postJson('/settings', {
          clipLookbackDays: Number.parseInt(lookback.value, 10) || 90,
          clipSearchRangesDays: rangeValues.length ? rangeValues : [90, 365, 0],
          officialShoutout: { enabled: officialEnabled.checked }
        });
        await refresh();
      });
    }

    function renderQueue(data) {
      queueBox.innerHTML = '';
      queueBox.appendChild(el('h3', { text: 'Offizielle Shoutout-Queue' }));
      queueBox.appendChild(el('p', { text: `Offen: ${data.pending || 0} · Letzter Versand: ${fmt(data.lastSentAt)} · Fehler: ${data.lastError || '-'}` }));

      const table = el('table', { class: 'cso-table' });
      table.appendChild(el('thead', {}, el('tr', {}, ['ID', 'Ziel', 'Status', 'Verfügbar ab', 'Aktion'].map(t => el('th', { text: t })))));
      const tbody = el('tbody');
      for (const row of data.queue || []) {
        const remove = el('button', { class: 'cso-button cso-danger', type: 'button', text: 'Entfernen' });
        remove.addEventListener('click', async () => { await postJson('/queue/remove', { id: row.id }); await refresh(); });
        const retry = el('button', { class: 'cso-button', type: 'button', text: 'Jetzt prüfen' });
        retry.addEventListener('click', async () => { await postJson('/queue/retry', { id: row.id }); await refresh(); });
        tbody.appendChild(el('tr', {}, [
          el('td', { text: String(row.id || '') }),
          el('td', { text: '@' + (row.target_display || row.target_login || '') }),
          el('td', { text: row.status || '' }),
          el('td', { text: fmt(row.available_at) }),
          el('td', {}, [retry, remove])
        ]));
      }
      if (!tbody.children.length) tbody.appendChild(el('tr', {}, el('td', { colspan: '5', text: 'Keine offenen offiziellen Shoutouts.' })));
      table.appendChild(tbody);
      queueBox.appendChild(table);
    }

    refresh();
  }

  window.CGNClipShoutoutDashboard = { mount };

  document.addEventListener('DOMContentLoaded', () => {
    const auto = document.querySelector('[data-module="clip_shoutout"], #clip-shoutout-dashboard');
    if (auto) mount(auto);
  });
}());
