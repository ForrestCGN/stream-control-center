"use strict";

(function(){
  const MODULE_VERSION = "0.1.1-can38-3-no-mutationobserver";
  const PANEL_ID = "busDiagnosticsModule";
  const CARD_ID = "busdiagReadonlySummaryCard";
  const REFRESH_MS = 12000;

  const state = {
    loading: false,
    lastLoadedAt: 0,
    lastPayload: null,
    lastError: "",
    renderTimer: null,
    booted: false
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
      <article id="${CARD_ID}" class="busdiag-card busdiag-wide busdiag-readonly-summary-card" data-can38-readonly-summary="1" data-version="${esc(MODULE_VERSION)}">
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
        <p class="busdiag-muted">CAN-38.3: Diese Karte ist reine Dashboard-Anzeige. Sie ruft nur read-only Diagnose-Endpunkte ab, nutzt keinen MutationObserver und löst keine Recovery-, OBS-, Sound-, Queue-, Twitch- oder DB-Aktion aus.</p>
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

  function scheduleRender(force = false, delay = 180){
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(() => {
      state.renderTimer = null;
      render(force);
    }, delay);
  }

  function scheduleBurst(force = false){
    scheduleRender(force, 180);
    setTimeout(() => scheduleRender(false, 650), 650);
    setTimeout(() => scheduleRender(false, 1600), 1600);
  }

  function removeIfNotOverview(){
    if (!isVisible() || !isOverview()) {
      const existing = document.getElementById(CARD_ID);
      if (existing) existing.remove();
    }
  }

  function installEventHooks(){
    document.addEventListener("click", ev => {
      const target = ev.target;
      if (!target || typeof target.closest !== "function") return;

      const busTab = target.closest(`#${PANEL_ID} [data-busdiag-tab]`);
      if (busTab) {
        if (busTab.dataset.busdiagTab === "overview") scheduleBurst(false);
        else setTimeout(removeIfNotOverview, 220);
        return;
      }

      const busAction = target.closest(`#${PANEL_ID} [data-busdiag-action]`);
      if (busAction) {
        scheduleBurst(false);
        return;
      }

      const navTarget = target.closest("[data-module], [data-module-panel], [data-panel], [data-section]");
      if (navTarget) scheduleBurst(false);
    }, true);

    window.addEventListener("cgn:module-show", ev => {
      if (!ev.detail || ev.detail.module === "bus_diagnostics" || ev.detail.module === "busDiagnosticsModule") scheduleBurst(false);
    });

    window.addEventListener("hashchange", () => scheduleBurst(false));

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) scheduleBurst(false);
    });
  }

  function boot(){
    if (state.booted) return;
    state.booted = true;
    installEventHooks();
    scheduleBurst(true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.CGNBusDiagnosticsReadonlySummary = {
    version: MODULE_VERSION,
    refresh: () => render(true)
  };
})();
