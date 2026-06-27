'use strict';

(function installRdapRefreshBehaviorCleanup() {
  const STATIC_PAGES = new Set([
    'routes',
    'modules',
    'permissions',
    'access',
    'account'
  ]);

  const LIVE_STATUS_PAGES = new Set([
    'overview',
    'diagnostics',
    'connections'
  ]);

  function installStyle() {
    if (document.getElementById('rdap116bRefreshBehaviorStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap116bRefreshBehaviorStyle';
    style.textContent = `
      .footer{display:none!important}
      #autoRefreshText{display:none!important}
      .rdap-header-refresh-button{white-space:nowrap}
      .rdap-header-refresh-button[hidden]{display:none!important}
      .rdap-refresh-policy-note{font-size:12px;color:var(--muted);opacity:.82}
    `;
    document.head.appendChild(style);
  }

  function ensureHeaderRefreshButton() {
    const topRight = document.querySelector('.top-right');
    if (!topRight) return null;

    let button = document.getElementById('rdapHeaderRefreshButton');
    if (!button) {
      button = document.createElement('button');
      button.id = 'rdapHeaderRefreshButton';
      button.type = 'button';
      button.className = 'secondaryButton small rdap-header-refresh-button';
      button.textContent = 'Neu laden';
      button.addEventListener('click', () => {
        if (window.RdapMainRouter && typeof window.RdapMainRouter.loadDashboard === 'function') {
          window.RdapMainRouter.loadDashboard('manual');
          return;
        }

        const legacyButton = document.getElementById('refreshButton');
        if (legacyButton) legacyButton.click();
      });

      topRight.insertBefore(button, topRight.firstElementChild || null);
    }

    return button;
  }

  function hasLocalRefreshAction(page) {
    const panel = document.querySelector(`[data-page-panel="${cssEscape(page)}"]`);
    if (!panel) return false;

    return [...panel.querySelectorAll('button,a')]
      .some((node) => /neu\s*laden|aktualisieren|verbindung\s*neu\s*laden/i.test(node.textContent || ''));
  }

  function getCurrentPage() {
    if (window.RdapMainRouter && typeof window.RdapMainRouter.getCurrentPage === 'function') {
      return window.RdapMainRouter.getCurrentPage();
    }

    const active = document.querySelector('[data-page-panel].is-active-view');
    return active ? active.dataset.pagePanel : 'overview';
  }

  function applyRefreshPolicy() {
    installStyle();

    const footer = document.querySelector('.footer');
    if (footer) footer.hidden = true;

    const oldText = document.getElementById('autoRefreshText');
    if (oldText) {
      oldText.hidden = true;
      oldText.setAttribute('aria-hidden', 'true');
    }

    const oldButton = document.getElementById('refreshButton');
    if (oldButton) {
      oldButton.hidden = true;
      oldButton.setAttribute('aria-hidden', 'true');
      oldButton.tabIndex = -1;
    }

    const page = getCurrentPage();
    const headerButton = ensureHeaderRefreshButton();
    if (!headerButton) return;

    const showHeaderRefresh = LIVE_STATUS_PAGES.has(page) && !STATIC_PAGES.has(page) && !hasLocalRefreshAction(page);
    headerButton.hidden = !showHeaderRefresh;
    headerButton.setAttribute('aria-hidden', showHeaderRefresh ? 'false' : 'true');
    headerButton.tabIndex = showHeaderRefresh ? 0 : -1;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/[^A-Za-z0-9_-]/g, '\\$&');
  }

  installStyle();
  applyRefreshPolicy();

  document.addEventListener('DOMContentLoaded', applyRefreshPolicy);
  window.addEventListener('rdap:main-router-page-change', () => {
    window.requestAnimationFrame(applyRefreshPolicy);
  });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(applyRefreshPolicy);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
