window.SectionHomeModule = (function(){
  'use strict';

  let root = null;

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }

  function render(){
    root = document.getElementById('sectionhomeModule');
    if (!root || !window.CGN) return;

    const sectionId = window.CGN.activeSection || 'live';
    const section = window.CGN.sections[sectionId] || window.CGN.sections.live;
    const items = Array.isArray(section.items) ? section.items : [];

    root.innerHTML = `
      <div class="section-hero glass">
        <div>
          <div class="section-kicker">${esc(section.role || '')}</div>
          <h2>${esc(section.icon || '')} ${esc(section.label || 'Dashboard')}</h2>
          <p>${esc(section.description || '')}</p>
        </div>
        <div class="section-hero-actions">
          <button type="button" data-section-refresh>Aktualisieren</button>
        </div>
      </div>

      <div class="section-grid">
        ${items.map(renderTile).join('')}
      </div>
    `;
  }

  function renderTile(moduleId){
    const item = window.CGN.moduleCatalog[moduleId] || { label: moduleId, icon: '□', enabled: false, description: 'Vorbereitet.' };
    const enabled = item.enabled === true && !!window.CGN.modules[moduleId];
    return `
      <button type="button" class="section-tile ${enabled ? '' : 'is-disabled'}" data-section-module="${esc(moduleId)}" ${enabled ? '' : 'disabled'} title="${enabled ? 'Öffnen' : 'Vorbereitet, noch nicht aktiv'}">
        <span class="section-tile-icon">${esc(item.icon || '□')}</span>
        <span class="section-tile-content">
          <strong>${esc(item.label || moduleId)}</strong>
          <small>${esc(item.description || '')}</small>
        </span>
        <span class="section-tile-state">${enabled ? 'Öffnen' : 'Vorbereitet'}</span>
      </button>
    `;
  }

  function bind(){
    document.addEventListener('click', ev => {
      const tile = ev.target.closest('[data-section-module]');
      if (tile && !tile.disabled) {
        window.CGN.setActiveModule(tile.dataset.sectionModule);
        return;
      }
      if (ev.target.closest('[data-section-refresh]')) render();
    });
  }

  function init(){
    root = document.getElementById('sectionhomeModule');
    render();
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'sectionhome') render();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  bind();

  return { init, render };
})();
