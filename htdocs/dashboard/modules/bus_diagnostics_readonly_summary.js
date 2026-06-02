"use strict";

(function(){
  const MODULE_VERSION = "0.1.0-can32-1";
  const PANEL_ID = "busDiagnosticsModule";
  const CARD_ID = "busdiagReadonlySummaryCard";
  const REFRESH_MS = 12000;

  const state = {
    loading: false,
    lastLoadedAt: 0,
    lastPayload: null,
    lastError: "",
    observerReady: false,
    renderTimer: null
  };

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  }

  function bool(v){ return v ? "ja" : "nein"; }

  function panel(){ return document.getElementById(PANEL_ID); }

  function content(){
    return panel()?.querySelector("[data-busdiag-content]") || null;
  }

  function isVisible(){
    const root = panel();
    return Boolean(root && !root.hidden);
  }

  function isOverview(){
    const root = panel();
    if (!root || root.hidden) return false;
    const active = root.querySelector("[data-busdiag-tab].active");
    if (active && active.dataset.busdiagTab) return active.dataset.busdiagTab === "overview";
    return Boolean(content()?.textContent?.includes("Gesamtstatus"));
  }

  async function api(path){
    if (window.CGN?.api) return window.CGN.api(path);
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }

  async function loadPayload(force = false){
    const now = Date.now();
    if (!force && state.lastPayload && now - state.lastLoadedAt < REFRESH_MS) return state.lastPayload;
    if (state.loading) return state.lastPayload;

    state.loading = true;
    try {
      const status = await api("/api/bus-diagnostics/status");
      let recoveryRoute = {};
      try {
        recoveryRoute = await api("/api/bus-diagnostics/recovery-preflight");
      } catch (err) {
        recoveryRoute = { ok: false, error: err?.message || String(err) };
      }

      state.lastPayload = { status, recoveryRoute };
      state.lastLoadedAt = Date.now();
      state.lastError = "";
      return state.lastPayload;
    } catch (err) {
      state.lastError = err?.message || String(err);
      return state.lastPayload || null;
    } finally {
      state.loading = false;
    }
  }

  function metric(label, value, note, good){
    const cls = good === true ? "ok" : (good === false ? "warning" : "neutral");
    return `<div class="busdiag-readonly-metric ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  function buildCard(payload){
    const status = payload?.status || {};
    const route = payload?.recoveryRoute || {};
    const preflight = route.recoveryPreflight || status.recoveryPreflight || {};
    const summary = Object.assign({}, status.summary || {}, route.summary || {});

    const readOnly = status.readOnly === true;
    const routeReadOnly = route.readOnly === true || summary.recoveryPreflightRouteReadOnly === true;
    const flowTouched = status.flowTouched === true;
    const queueTouched = status.queueTouched === true;
    const soundTouched = status.soundSystemTouched === true;
    const overlayTouched = status.overlayTouched === true;
    const canPrepare = preflight.canPrepare === true;
    const canExecute = preflight.canExecute === true;

    const productiveTouched = flowTouched || queueTouched || soundTouched || overlayTouched;
    const safe = readOnly && !productiveTouched && !canExecute;

    const badge = safe
      ? `<span class="busdiag-badge ok">read-only ok</span>`
      : `<span class="busdiag-badge warning">prüfen</span>`;

    const routeNote = route.fetchOk === false
      ? "Preflight-Route nicht sauber geladen"
      : "Anzeige nutzt nur read-only Diagnose-Routen";

    return `
      <article id="${CARD_ID}" class="busdiag-card busdiag-wide busdiag-readonly-summary-card" data-can32-readonly-summary="1" data-version="${esc(MODULE_VERSION)}">
        <h3>Sicherheits- / Read-only-Zusammenfassung</h3>
        <div class="busdiag-status-line">${badge}<span>${esc(routeNote)}</span></div>
        <div class="busdiag-readonly-grid">
          ${metric("Status read-only", bool(readOnly), "Bus-Diagnose Status", readOnly)}
          ${metric("Recovery Route read-only", bool(routeReadOnly), "Preflight nur lesend", routeReadOnly)}
          ${metric("Flow touched", bool(flowTouched), "soll nein bleiben", !flowTouched)}
          ${metric("Queue touched", bool(queueTouched), "soll nein bleiben", !queueTouched)}
          ${metric("Sound touched", bool(soundTouched), "soll nein bleiben", !soundTouched)}
          ${metric("Overlay touched", bool(overlayTouched), "soll nein bleiben", !overlayTouched)}
          ${metric("Recovery prepare", bool(canPrepare), "nur Anzeige, keine Ausführung", !canPrepare)}
          ${metric("Recovery execute", bool(canExecute), "muss gesperrt bleiben", !canExecute)}
        </div>
        <p class="busdiag-muted">CAN-32.1: Diese Karte ist reine Dashboard-Anzeige. Sie ruft nur read-only Diagnose-Endpunkte ab und löst keine Recovery-, OBS-, Sound-, Queue-, Twitch- oder DB-Aktion aus.</p>
      </article>
    `;
  }

  async function render(force = false){
    if (!isVisible() || !isOverview()) return;
    const target = content();
    if (!target) return;

    const payload = await loadPayload(force);
    const existing = document.getElementById(CARD_ID);
    if (state.lastError && !payload) {
      if (existing) existing.remove();
      return;
    }

    const html = buildCard(payload);
    if (existing) {
      existing.outerHTML = html;
    } else {
      target.insertAdjacentHTML("afterbegin", html);
    }
  }

  function scheduleRender(force = false){
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(() => {
      state.renderTimer = null;
      render(force);
    }, 180);
  }

  function installObserver(){
    if (state.observerReady) return;
    const root = panel();
    if (!root) return;

    const observer = new MutationObserver(() => scheduleRender(false));
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class"] });
    state.observerReady = true;
  }

  function boot(){
    installObserver();
    scheduleRender(true);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) scheduleRender(false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.CGNBusDiagnosticsReadonlySummary = {
    version: MODULE_VERSION,
    refresh: () => render(true)
  };
})();
