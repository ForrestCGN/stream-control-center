'use strict';

(function createRemoteModboardLanguages() {
  const dictionaries = {};
  let currentLocale = 'de';

  function normalizeLocale(locale) {
    return String(locale || '').trim().toLowerCase().split(/[-_]/)[0] || 'de';
  }

  function register(locale, entries) {
    const safeLocale = normalizeLocale(locale);
    if (!dictionaries[safeLocale]) dictionaries[safeLocale] = {};
    Object.assign(dictionaries[safeLocale], entries && typeof entries === 'object' ? entries : {});
    return api;
  }

  function setLocale(locale) {
    const safeLocale = normalizeLocale(locale);
    currentLocale = dictionaries[safeLocale] ? safeLocale : 'de';
    try {
      window.dispatchEvent(new CustomEvent('rdap:language-locale-change', { detail: { locale: currentLocale } }));
    } catch (err) {}
    return api;
  }

  function getLocale() {
    return currentLocale;
  }

  function getAvailableLocales() {
    return Object.keys(dictionaries).sort();
  }

  function interpolate(value, params) {
    let text = String(value ?? '');
    if (!params || typeof params !== 'object') return text;
    Object.keys(params).forEach((key) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key] ?? ''));
    });
    return text;
  }

  function t(key, fallback, params) {
    const safeKey = String(key || '').trim();
    if (!safeKey) return interpolate(fallback || '', params);
    const active = dictionaries[currentLocale] || {};
    const german = dictionaries.de || {};
    const english = dictionaries.en || {};
    const value = active[safeKey] ?? german[safeKey] ?? english[safeKey];
    if (value !== undefined && value !== null && String(value) !== '') return interpolate(value, params);
    return interpolate(fallback || safeKey, params);
  }

  function resolve(value, fallback, params) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const active = value[currentLocale] ?? value.de ?? value.en ?? Object.values(value).find(Boolean);
      return interpolate(active || fallback || '', params);
    }
    return interpolate(value !== undefined && value !== null && String(value) !== '' ? value : (fallback || ''), params);
  }

  const api = {
    register,
    setLocale,
    getLocale,
    getAvailableLocales,
    t,
    resolve
  };

  window.RemoteModboardLanguages = window.RemoteModboardLanguages || api;
  window.rdapT = window.rdapT || t;
})();
