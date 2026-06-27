'use strict';

(function installNavigationCleanup() {
  const BUILD = 'RDAP129_ONLINE_MODBOARD_NAVIGATION_CLEANUP';
  const FORBIDDEN_MODULES = new Set(['local-dashboard', 'account']);
  const FORBIDDEN_SYSTEM_PAGES = new Set(['routes']);

  function removeNode(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function cleanupNavigation() {
    const nav = document.querySelector('.cgn-nav');
    if (!nav) return;

    FORBIDDEN_MODULES.forEach((moduleId) => {
      nav.querySelectorAll(`.nav-group[data-module-id="${moduleId}"], .nav-sub[data-module-id="${moduleId}"]`).forEach(removeNode);
      nav.querySelectorAll(`.nav-group[data-target="nav-${moduleId}"], #nav-${moduleId}`).forEach(removeNode);
    });

    nav.querySelectorAll('.nav-link').forEach((link) => {
      const moduleId = String(link.dataset.moduleId || '').trim();
      const page = String(link.dataset.page || '').trim();
      const section = String(link.dataset.section || '').trim().toLowerCase();
      if (FORBIDDEN_MODULES.has(moduleId)) removeNode(link);
      if ((moduleId === 'system' || section === 'system') && FORBIDDEN_SYSTEM_PAGES.has(page)) removeNode(link);
    });
  }

  function runCleanup() {
    cleanupNavigation();
    window.setTimeout(cleanupNavigation, 50);
    window.setTimeout(cleanupNavigation, 250);
    window.setTimeout(cleanupNavigation, 1000);
  }

  document.addEventListener('DOMContentLoaded', runCleanup);
  window.addEventListener('rdap:module-registry-ready', runCleanup);

  if (document.readyState !== 'loading') runCleanup();

  try {
    const nav = document.querySelector('.cgn-nav');
    if (nav && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(cleanupNavigation);
      observer.observe(nav, { childList: true, subtree: true });
    }
  } catch (err) {}

  window.RemoteModboardNavigationCleanup = { build: BUILD, run: runCleanup };
})();
