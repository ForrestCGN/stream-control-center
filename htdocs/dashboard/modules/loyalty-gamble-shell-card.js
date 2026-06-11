(() => {
  'use strict';

  const MODULE_ID = 'loyalty-gamble';
  const CARD_ID = 'cgn-loyalty-gamble-shell-card';
  const PAGE_URL = '/dashboard/loyalty-gamble.html';
  const API_URL = '/api/loyalty/games/gamble/dashboard-config';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function findMount() {
    const selectors = [
      '[data-dashboard-modules]',
      '[data-dashboard-grid]',
      '[data-module-grid]',
      '.dashboard-grid',
      '.module-grid',
      '.cgn-dashboard-grid',
      'main'
    ];
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  function formatCooldown(ms) {
    const n = Number(ms || 0);
    if (!Number.isFinite(n) || n <= 0) return 'aus';
    if (n >= 60000 && n % 60000 === 0) return `${Math.round(n / 60000)} min`;
    if (n >= 1000) return `${Math.round(n / 1000)} s`;
    return `${n} ms`;
  }

  function setCardStatus(card, data) {
    const engineOn = Boolean(data?.config?.engine?.enabled);
    const commandOn = Boolean(data?.command?.enabled);
    const chance = data?.config?.engine?.winChancePercent ?? '?';
    const cooldown = data?.command?.cooldownUserMs ?? data?.config?.engine?.userCooldownMs ?? 0;
    const status = card.querySelector('[data-gamble-shell-status]');
    const meta = card.querySelector('[data-gamble-shell-meta]');
    if (status) {
      status.textContent = engineOn && commandOn ? 'Live' : (engineOn || commandOn ? 'Teilaktiv' : 'Aus');
      status.classList.toggle('is-live', engineOn && commandOn);
      status.classList.toggle('is-warn', !(engineOn && commandOn));
    }
    if (meta) {
      meta.textContent = `Chance ${escapeHtml(chance)}% · Cooldown ${escapeHtml(formatCooldown(cooldown))}`;
    }
  }

  async function refreshCard(card) {
    try {
      const response = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
      const data = await response.json();
      setCardStatus(card, data);
    } catch (_) {
      const status = card.querySelector('[data-gamble-shell-status]');
      const meta = card.querySelector('[data-gamble-shell-meta]');
      if (status) {
        status.textContent = 'API?';
        status.classList.add('is-warn');
      }
      if (meta) meta.textContent = 'Status konnte nicht geladen werden';
    }
  }

  function buildCard() {
    const card = document.createElement('a');
    card.id = CARD_ID;
    card.className = 'cgn-shell-module-card loyalty-gamble-shell-card';
    card.href = PAGE_URL;
    card.setAttribute('data-dashboard-module-card', MODULE_ID);
    card.innerHTML = `
      <div class="cgn-shell-module-card__icon">🎰</div>
      <div class="cgn-shell-module-card__body">
        <strong>Loyalty Gamble</strong>
        <span data-gamble-shell-meta>lädt Status...</span>
      </div>
      <span class="cgn-shell-module-card__status" data-gamble-shell-status>lädt</span>
    `;
    return card;
  }

  function registerModule() {
    window.CGN_DASHBOARD_MODULES = window.CGN_DASHBOARD_MODULES || [];
    if (!window.CGN_DASHBOARD_MODULES.some((entry) => entry && entry.id === MODULE_ID)) {
      window.CGN_DASHBOARD_MODULES.push({
        id: MODULE_ID,
        title: 'Loyalty Gamble',
        url: PAGE_URL,
        category: 'loyalty',
        compact: true,
        step: 'STEP232_LWG7_3'
      });
    }
  }

  function mountCard() {
    registerModule();
    if (document.getElementById(CARD_ID)) return;
    const mount = findMount();
    if (!mount) return;
    const card = buildCard();
    mount.appendChild(card);
    refreshCard(card);
    window.setInterval(() => refreshCard(card), 60000);
  }

  ready(mountCard);
})();
