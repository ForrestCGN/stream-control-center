(() => {
  'use strict';

  const moduleEntry = {
    id: 'loyalty-gamble',
    group: 'Loyalty',
    title: 'Gamble',
    label: '!gamble',
    description: 'Kompakte Steuerung für Gamble-Config, Status, Statistik und Audit.',
    route: '/dashboard/loyalty-gamble.html',
    icon: '🎰',
    order: 710,
    compact: true,
    features: ['config', 'stats', 'audit', 'safety'],
    statusApi: '/api/loyalty/games/gamble/dashboard-config'
  };

  window.CGN_DASHBOARD_MODULES = window.CGN_DASHBOARD_MODULES || [];
  if (!window.CGN_DASHBOARD_MODULES.some(item => item && item.id === moduleEntry.id)) {
    window.CGN_DASHBOARD_MODULES.push(moduleEntry);
  }

  function findNavTarget() {
    return document.querySelector('[data-cgn-dashboard-modules]')
      || document.querySelector('[data-dashboard-modules]')
      || document.querySelector('#dashboardModuleGrid')
      || document.querySelector('#moduleGrid')
      || document.querySelector('.dashboard-module-grid')
      || document.querySelector('.module-grid');
  }

  function renderCard(target) {
    if (!target || target.querySelector('[data-module-card="loyalty-gamble"]')) return;
    const card = document.createElement('a');
    card.className = 'cgn-nav-card';
    card.href = moduleEntry.route;
    card.dataset.moduleCard = moduleEntry.id;
    card.innerHTML = `
      <strong>${moduleEntry.icon} ${moduleEntry.title}</strong>
      <span>${moduleEntry.description}</span>
      <div class="cgn-nav-meta">
        <small>Config</small><small>Stats</small><small>Audit</small>
      </div>`;
    target.appendChild(card);
  }

  function boot() {
    renderCard(findNavTarget());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
