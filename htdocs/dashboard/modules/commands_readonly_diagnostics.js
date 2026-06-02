"use strict";

(function(){
  const MODULE_VERSION = "0.1.0-can33-3";
  const PANEL_ID = "commandsModule";
  const CARD_ID = "commandsReadonlyDiagnosticsCard";
  const REFRESH_MS = 15000;

  const state = {
    loading: false,
    lastLoadedAt: 0,
    payload: null,
    error: "",
    renderTimer: null,
    observerReady: false
  };

  const READ_ONLY_ROUTES = [
    "GET /api/commands/status",
    "GET /api/commands/list",
    "GET /api/commands/catalog",
    "GET /api/commands/logs",
    "GET /api/commands/history",
    "GET /api/commands/media-command-preview"
  ];

  const BLOCKED_ROUTES = [
    "POST /api/commands/upsert",
    "POST /api/commands/delete",
    "GET/POST /api/commands/execute"
  ];

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  }

  function panel(){ return document.getElementById(PANEL_ID); }

  function isVisible(){
    const root = panel();
    return Boolean(root && !root.hidden);
  }

  function activeTab(){
    const root = panel();
    const btn = root?.querySelector("[data-cmd-tab].active");
    return btn?.dataset?.cmdTab || "";
  }

  function isDiagnosticsTab(){
    if (!isVisible()) return false;
    return activeTab() === "diagnostics";
  }

  async function api(path){
    if (window.CGN?.api) return window.CGN.api(path);
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }

  async function loadPayload(force = false){
    const now = Date.now();
    if (!force && state.payload && now - state.lastLoadedAt < REFRESH_MS) return state.payload;
    if (state.loading) return state.payload;

    state.loading = true;
    try {
      const [status, list, logs, catalog] = await Promise.all([
        api("/api/commands/status"),
        api("/api/commands/list"),
        api("/api/commands/logs?limit=15").catch(err => ({ ok:false, logs:[], error: err?.message || String(err) })),
        api("/api/commands/catalog").catch(err => ({ ok:false, categories:[], actions:[], error: err?.message || String(err) }))
      ]);

      state.payload = { status, list, logs, catalog };
      state.lastLoadedAt = Date.now();
      state.error = "";
      return state.payload;
    } catch (err) {
      state.error = err?.message || String(err);
      return state.payload || null;
    } finally {
      state.loading = false;
    }
  }

  function safeArray(value){ return Array.isArray(value) ? value : []; }

  function pickCommandCount(list){
    if (Array.isArray(list?.commands)) return list.commands.length;
    if (Array.isArray(list?.items)) return list.items.length;
    if (Array.isArray(list)) return list.length;
    return 0;
  }

  function pickLogCount(logs){
    if (Array.isArray(logs?.logs)) return logs.logs.length;
    if (Array.isArray(logs?.items)) return logs.items.length;
    if (Array.isArray(logs)) return logs.length;
    return 0;
  }

  function pickCatalogCount(catalog){
    const categories = safeArray(catalog?.categories);
    const actions = safeArray(catalog?.actions);
    const nestedActions = categories.reduce((sum, cat) => sum + safeArray(cat.actions).length, 0);
    return { categories: categories.length, actions: actions.length || nestedActions };
  }

  function routePills(routes, mode){
    return routes.map(route => `<span class="cmd-rodiag-route-pill ${esc(mode)}">${esc(route)}</span>`).join("");
  }

  function metric(label, value, note, mode = "neutral"){
    return `<div class="cmd-rodiag-metric ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  function renderCard(payload){
    const status = payload?.status || {};
    const list = payload?.list || {};
    const logs = payload?.logs || {};
    const catalog = payload?.catalog || {};
    const catalogCount = pickCatalogCount(catalog);

    const statusOk = status.ok === true;
    const schemaOk = status.schemaOk !== false;
    const lightStatus = status.lightStatus === true;
    const schemaTouchOnStatus = status.schemaTouchOnStatus === true;
    const commandCount = pickCommandCount(list);
    const logCount = pickLogCount(logs);
    const productiveBlocked = true;

    const badge = statusOk && schemaOk && !schemaTouchOnStatus
      ? '<span class="cmd-pill ok">READ-ONLY OK</span>'
      : '<span class="cmd-pill warn">PRÜFEN</span>';

    return `
      <section id="${CARD_ID}" class="cmd-card cmd-rodiag-card" data-can33-readonly-diagnostics="1" data-version="${esc(MODULE_VERSION)}">
        <div class="cmd-section-head">
          <div>
            <h3>Commands Read-only Diagnose</h3>
            <span>Nur Anzeige. Keine Execute-/Upsert-/Delete-Aktion.</span>
          </div>
          <div class="cmd-rodiag-head-pills">
            ${badge}
            <span class="cmd-pill neutral">v${esc(status.moduleVersion || status.version || "-")}</span>
            <span class="cmd-pill neutral">${esc(status.moduleBuild || "build -")}</span>
          </div>
        </div>

        <div class="cmd-rodiag-grid">
          ${metric("Status OK", statusOk ? "ja" : "nein", "GET /api/commands/status", statusOk ? "ok" : "warn")}
          ${metric("Schema OK", schemaOk ? "ja" : "nein", "Status-Wert", schemaOk ? "ok" : "warn")}
          ${metric("Light Status", lightStatus ? "ja" : "nein", "schneller Health-Endpunkt", lightStatus ? "ok" : "warn")}
          ${metric("Schema Touch", schemaTouchOnStatus ? "ja" : "nein", "soll nein bleiben", schemaTouchOnStatus ? "warn" : "ok")}
          ${metric("Commands", commandCount, "nur gelesen", "neutral")}
          ${metric("Logs geladen", logCount, "limit=15", "neutral")}
          ${metric("Katalog-Kategorien", catalogCount.categories, "nur gelesen", "neutral")}
          ${metric("Katalog-Aktionen", catalogCount.actions, "nur gelesen", "neutral")}
        </div>

        <div class="cmd-rodiag-routes">
          <div>
            <h4>Read-only erlaubt</h4>
            <div class="cmd-rodiag-route-list">${routePills(READ_ONLY_ROUTES, "ok")}</div>
          </div>
          <div>
            <h4>Produktiv gesperrt</h4>
            <div class="cmd-rodiag-route-list">${routePills(BLOCKED_ROUTES, "blocked")}</div>
          </div>
        </div>

        <p class="cmd-muted">CAN-33.3: Diese Karte nutzt nur vorhandene Diagnose-/Listen-Endpunkte. Sie erzeugt keine Command-Ausführung, speichert nichts, löscht nichts und löst keine Zielmodule aus.</p>
      </section>
    `;
  }

  function insertionTarget(){
    const root = panel();
    if (!root) return null;
    const tabs = root.querySelector(".cmd-tabs");
    if (tabs) return tabs;
    const wrap = root.querySelector(".cmd-wrap");
    return wrap || root;
  }

  async function render(force = false){
    if (!isDiagnosticsTab()) return;
    const target = insertionTarget();
    if (!target) return;

    const payload = await loadPayload(force);
    const existing = document.getElementById(CARD_ID);
    if (!payload) {
      if (existing) existing.remove();
      return;
    }

    const html = renderCard(payload);
    if (existing) existing.outerHTML = html;
    else target.insertAdjacentHTML("afterend", html);
  }

  function scheduleRender(force = false){
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(() => {
      state.renderTimer = null;
      render(force);
    }, 180);
  }

  function cleanupWhenNotDiagnostics(){
    if (isDiagnosticsTab()) return;
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.remove();
  }

  function installObserver(){
    if (state.observerReady) return;
    const root = panel();
    if (!root) return;

    const observer = new MutationObserver(() => {
      cleanupWhenNotDiagnostics();
      scheduleRender(false);
    });
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

  window.CGNCommandsReadonlyDiagnostics = {
    version: MODULE_VERSION,
    refresh: () => render(true)
  };
})();
