'use strict';

(function installRemoteModboardRuntimeProfile() {
  const STATUS_URL = '/api/remote/status';
  let currentRuntimeMode = 'online';

  document.addEventListener('DOMContentLoaded', () => {
    injectRuntimeProfileStyles();
    refreshRuntimeProfile();
    window.addEventListener('rdap:module-registry-ready', () => applyModuleRuntimeScopes(currentRuntimeMode));
    window.addEventListener('rdap:main-router-page-change', () => applyModuleRuntimeScopes(currentRuntimeMode));
  });

  async function refreshRuntimeProfile() {
    try {
      const response = await fetch(STATUS_URL, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      const body = await response.json().catch(() => null);
      if (!body || body.ok === false) return;
      currentRuntimeMode = normalizeRuntimeMode(body.runtimeMode || (body.localDashboardProfile && body.localDashboardProfile.runtimeMode));
      renderRuntimeChip(body, currentRuntimeMode);
      applyModuleRuntimeScopes(currentRuntimeMode);
    } catch (err) {
      renderRuntimeChip({ localDashboardProfile: { visibleLabel: 'Modus unbekannt' } }, currentRuntimeMode, true);
    }
  }

  function renderRuntimeChip(status, runtimeMode, failed) {
    const chip = document.getElementById('quickRuntimeMode') || createRuntimeChip();
    if (!chip) return;
    const profile = status && status.localDashboardProfile ? status.localDashboardProfile : {};
    const label = failed ? translate('runtime.mode.unknown', 'Modus unbekannt') : (profile.visibleLabel || runtimeLabel(runtimeMode));
    chip.textContent = label;
    chip.dataset.runtimeMode = runtimeMode;
    chip.classList.toggle('cgn-chip--warn', runtimeMode === 'local');
    chip.classList.toggle('cgn-chip--info', runtimeMode !== 'local');
    chip.title = runtimeMode === 'local'
      ? translate('runtime.local.description', 'Lokalmodus: LAN-Oberfläche vorbereitet. Produktive Aktionen bleiben gesperrt.')
      : translate('runtime.online.description', 'Onlinemodus: Webserver-Betrieb. Produktive Aktionen bleiben backendseitig begrenzt.');
    document.documentElement.dataset.remoteRuntimeMode = runtimeMode;
    document.body.dataset.remoteRuntimeMode = runtimeMode;
  }

  function createRuntimeChip() {
    const topCenter = document.querySelector('.top-center');
    if (!topCenter) return null;
    const chip = document.createElement('span');
    chip.className = 'cgn-chip';
    chip.id = 'quickRuntimeMode';
    chip.textContent = translate('runtime.mode.loading', 'Modus');
    const loginChip = document.getElementById('quickLogin');
    if (loginChip) topCenter.insertBefore(chip, loginChip);
    else topCenter.appendChild(chip);
    return chip;
  }

  function applyModuleRuntimeScopes(runtimeMode) {
    const mode = normalizeRuntimeMode(runtimeMode);
    document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
      const scope = normalizeRuntimeScope(button.dataset.runtime || lookupRuntimeScope(button.dataset.page));
      const allowed = scope === 'both' || scope === mode;
      button.classList.toggle('is-runtime-blocked', !allowed);
      button.setAttribute('aria-disabled', allowed ? 'false' : 'true');
      button.dataset.runtimeAllowed = allowed ? 'true' : 'false';
      button.dataset.runtime = scope;
      const baseTitle = button.dataset.description || button.dataset.title || button.textContent.trim();
      const scopeLabel = runtimeScopeLabel(scope);
      const blockedText = translate('runtime.scope.blocked', 'In diesem Modus gesperrt');
      button.title = allowed ? `${baseTitle} · ${scopeLabel}` : `${baseTitle} · ${scopeLabel} · ${blockedText}`;
      ensureRuntimeMarker(button, scope, allowed);
    });
  }

  function ensureRuntimeMarker(button, scope, allowed) {
    if (!button) return;
    let marker = button.querySelector('.runtime-scope-marker');
    if (scope === 'both') {
      if (marker && marker.parentNode) marker.remove();
      return;
    }
    if (!marker) {
      marker = document.createElement('small');
      marker.className = 'runtime-scope-marker';
      button.appendChild(marker);
    }
    marker.textContent = allowed ? runtimeScopeShortLabel(scope) : 'gesperrt';
  }

  function lookupRuntimeScope(pageId) {
    const manifest = window.RemoteModboardModuleManifest || {};
    const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
    const page = pages.find((item) => normalizeId(item.pageId || item.id || item.page) === normalizeId(pageId));
    return page && page.runtime ? page.runtime : 'both';
  }

  function normalizeRuntimeMode(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'local' || normalized === 'lan') return 'local';
    return 'online';
  }

  function normalizeRuntimeScope(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'local' || normalized === 'online') return normalized;
    return 'both';
  }

  function normalizeId(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function runtimeLabel(runtimeMode) {
    return runtimeMode === 'local'
      ? translate('runtime.mode.local', 'Lokalmodus')
      : translate('runtime.mode.online', 'Onlinemodus');
  }

  function runtimeScopeLabel(scope) {
    if (scope === 'local') return translate('runtime.scope.local', 'Nur lokal');
    if (scope === 'online') return translate('runtime.scope.online', 'Nur online');
    return translate('runtime.scope.both', 'Online und lokal');
  }

  function runtimeScopeShortLabel(scope) {
    if (scope === 'local') return translate('runtime.scope.localShort', 'lokal');
    if (scope === 'online') return translate('runtime.scope.onlineShort', 'online');
    return translate('runtime.scope.bothShort', 'beides');
  }

  function translate(key, fallback) {
    if (window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.t === 'function') {
      return window.RemoteModboardLanguages.t(key, fallback);
    }
    return fallback || key || '';
  }

  function injectRuntimeProfileStyles() {
    if (document.getElementById('rdap122RuntimeProfileStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap122RuntimeProfileStyle';
    style.textContent = `
      #quickRuntimeMode[data-runtime-mode="local"]{
        border-color:rgba(27,216,255,.42)!important;
        background:linear-gradient(135deg,rgba(27,216,255,.16),rgba(155,77,255,.12))!important;
      }
      .nav-link.is-runtime-blocked{
        opacity:.48!important;
        filter:saturate(.55)!important;
        cursor:not-allowed!important;
      }
      .nav-link .runtime-scope-marker{
        margin-left:8px!important;
        padding:2px 6px!important;
        border-radius:999px!important;
        font-size:10px!important;
        line-height:1!important;
        color:var(--muted)!important;
        background:rgba(255,255,255,.06)!important;
        border:1px solid rgba(255,255,255,.08)!important;
      }
      .nav-link.is-runtime-blocked .runtime-scope-marker{
        color:#ffd7d7!important;
        border-color:rgba(255,105,105,.24)!important;
        background:rgba(255,105,105,.10)!important;
      }
    `;
    document.head.appendChild(style);
  }
})();
