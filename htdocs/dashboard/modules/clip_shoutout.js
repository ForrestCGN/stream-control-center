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
    const displayQueueBox = el('div', { class: 'cso-card' });
    const officialQueueBox = el('div', { class: 'cso-card' });

    root.appendChild(el('div', { class: 'cso-header' }, [
      el('div', {}, [
        el('h2', { text: 'Clip-Shoutout / SO-System' }),
        el('p', { text: 'Shouti-Queue mit 2-Minuten-Abstand nach Anzeige-Ende, 90-Tage-Clip-Suche und offizieller Twitch-Shoutout-Queue.' })
      ]),
      el('button', { class: 'cso-button', type: 'button', text: 'Aktualisieren' })
    ]));
    root.appendChild(statusLine);
    root.appendChild(settingsBox);
    root.appendChild(displayQueueBox);
    root.appendChild(officialQueueBox);

    root.querySelector('button').addEventListener('click', refresh);

    async function refresh() {
      try {
        const [status, queue] = await Promise.all([getJson('/status'), getJson('/queue')]);
        renderStatus(status);
        renderSettings(status.config || {});
        renderDisplayQueue(queue.displayQueue || status.displayQueue || {});
        renderOfficialQueue(queue.officialQueue || status.officialQueue || {});
      } catch (err) {
        statusLine.textContent = 'Fehler: ' + (err.message || String(err));
      }
    }

    function renderStatus(status) {
      const d = status.displayQueue || {};
      const o = status.officialQueue || {};
      statusLine.textContent = `Status: ${status.enabled ? 'aktiv' : 'inaktiv'} · Command: !${status.command || 'so'} · Version: ${status.moduleVersion || '-'} · Shouti offen: ${d.pending || 0} · Aktiv: ${d.activeTarget ? '@' + d.activeTarget : '-'} · Offiziell offen: ${o.pending || 0}`;
    }

    function renderSettings(cfg) {
      const official = cfg.officialShoutout || {};
      const display = cfg.displayQueue || {};
      settingsBox.innerHTML = '';
      settingsBox.appendChild(el('h3', { text: 'Einstellungen' }));

      const lookback = el('input', { type: 'number', min: '1', max: '3650', value: String(cfg.clipLookbackDays || 90) });
      const ranges = el('input', { type: 'text', value: Array.isArray(cfg.clipSearchRangesDays) ? cfg.clipSearchRangesDays.join(',') : '90,365,0' });
      const displayCooldown = el('input', { type: 'number', min: '0', max: '3600000', step: '1000', value: String(display.displayCooldownMs || 120000) });
      const officialGlobal = el('input', { type: 'number', min: '0', max: '3600000', step: '1000', value: String(official.globalCooldownMs || 120000) });
      const officialEnabled = el('input', { type: 'checkbox' });
      officialEnabled.checked = official.enabled !== false;
      const save = el('button', { class: 'cso-button', type: 'button', text: 'Speichern' });

      settingsBox.appendChild(el('label', {}, ['Clip-Lookback Tage', lookback]));
      settingsBox.appendChild(el('label', {}, ['Suchbereiche Tage (0 = all_time)', ranges]));
      settingsBox.appendChild(el('label', {}, ['Shouti-Anzeige-Cooldown ms', displayCooldown]));
      settingsBox.appendChild(el('label', {}, ['Offizieller Shoutout Global-Cooldown ms', officialGlobal]));
      settingsBox.appendChild(el('label', { class: 'cso-check' }, [officialEnabled, ' Offiziellen Twitch-Shoutout nach Anzeige queue’n']));
      settingsBox.appendChild(save);

      save.addEventListener('click', async () => {
        const rangeValues = ranges.value.split(',').map(v => Number.parseInt(v.trim(), 10)).filter(v => Number.isFinite(v) && v >= 0);
        await postJson('/settings', {
          clipLookbackDays: Number.parseInt(lookback.value, 10) || 90,
          clipSearchRangesDays: rangeValues.length ? rangeValues : [90, 365, 0],
          displayQueue: { displayCooldownMs: Number.parseInt(displayCooldown.value, 10) || 120000, cooldownStartsAfterFinish: true },
          officialShoutout: {
            enabled: officialEnabled.checked,
            globalCooldownMs: Number.parseInt(officialGlobal.value, 10) || 120000
          }
        });
        await refresh();
      });
    }

    function renderDisplayQueue(data) {
      displayQueueBox.innerHTML = '';
      displayQueueBox.appendChild(el('h3', { text: 'Shouti-Anzeige-Queue' }));
      displayQueueBox.appendChild(el('p', { text: `Offen/Aktiv: ${data.pending || 0} · Aktiv: ${data.activeTarget ? '@' + data.activeTarget : '-'} · Cooldown nach Ende: ${data.cooldownStartsAfterFinish ? 'ja' : 'nein'} · Cooldown läuft: ${data.cooldownRunning ? 'ja' : 'nein'} · Rest: ${Math.ceil((data.cooldownRemainingMs || 0) / 1000)}s · Nächster Start ab: ${fmt(data.nextDisplayAllowedAt)} · Fehler: ${data.lastError || '-'}` }));
      const table = el('table', { class: 'cso-table' });
      table.appendChild(el('thead', {}, el('tr', {}, ['ID', 'Ziel', 'Status', 'Verfügbar ab', 'Aktion'].map(t => el('th', { text: t })))));
      const tbody = el('tbody');
      for (const row of data.queue || []) {
        const remove = el('button', { class: 'cso-button cso-danger', type: 'button', text: 'Entfernen' });
        remove.disabled = row.status === 'active';
        remove.addEventListener('click', async () => { await postJson('/display-queue/remove', { id: row.id }); await refresh(); });
        const retry = el('button', { class: 'cso-button', type: 'button', text: 'Jetzt prüfen' });
        retry.disabled = row.status === 'active';
        retry.addEventListener('click', async () => { await postJson('/display-queue/retry', { id: row.id }); await refresh(); });
        tbody.appendChild(el('tr', {}, [
          el('td', { text: String(row.id || '') }),
          el('td', { text: '@' + (row.target_display || row.target_login || '') }),
          el('td', { text: row.status || '' }),
          el('td', { text: fmt(row.available_at) }),
          el('td', {}, [retry, remove])
        ]));
      }
      if (!tbody.children.length) tbody.appendChild(el('tr', {}, el('td', { colspan: '5', text: 'Keine offenen Shouti-Anzeigen.' })));
      table.appendChild(tbody);
      displayQueueBox.appendChild(table);
    }

    function renderOfficialQueue(data) {
      officialQueueBox.innerHTML = '';
      officialQueueBox.appendChild(el('h3', { text: 'Offizielle Twitch-Shoutout-Queue' }));
      officialQueueBox.appendChild(el('p', { text: `Offen: ${data.pending || 0} · Letzter Versand: ${fmt(data.lastSentAt)} · Fehler: ${data.lastError || '-'}` }));

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
      officialQueueBox.appendChild(table);
    }

    refresh();
  }

  window.CGNClipShoutoutDashboard = { mount };

  document.addEventListener('DOMContentLoaded', () => {
    const auto = document.querySelector('[data-module="clip_shoutout"], #clip-shoutout-dashboard');
    if (auto) mount(auto);
  });
}());
