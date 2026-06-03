"use strict";

(function(){
  const MODULE_VERSION = "0.1.2-can34-3c-stability";
  const PANEL_ID = "todoModule";
  const CARD_ID = "todoReadonlyDiagnosticsCard";
  const TAB_ID = "todoReadonlyDiagnosticsTab";
  const REFRESH_MS = 15000;

  const state = {
    active: false,
    loading: false,
    lastLoadedAt: 0,
    payload: null,
    error: "",
    timers: []
  };

  const READ_ONLY_ROUTES = [
    "GET /api/todo/status",
    "GET /api/todo/config",
    "GET /api/todo/settings",
    "GET /api/todo/routes",
    "GET /api/todo/integration-check",
    "GET /api/todo/stats",
    "GET /api/todo/stats/top",
    "GET /api/todo/stats/today",
    "GET /api/todo/admin/settings",
    "GET /api/todo/admin/texts",
    "GET /discord/todo/status"
  ];

  const BLOCKED_ROUTES = [
    "GET/POST /api/todo/add",
    "GET/POST /discord/todo",
    "GET/POST /api/todo/reload",
    "POST /api/todo/admin/settings",
    "POST /api/todo/admin/texts"
  ];

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  }

  function panel(){ return document.getElementById(PANEL_ID); }
  function isVisible(){ const root = panel(); return Boolean(root && !root.hidden); }

  function clearOwnedTimers(){
    while (state.timers.length) clearTimeout(state.timers.pop());
  }

  function schedule(fn, delay){
    const timer = setTimeout(() => {
      state.timers = state.timers.filter(item => item !== timer);
      fn();
    }, delay);
    state.timers.push(timer);
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
      const [status, routes, integration] = await Promise.all([
        api("/api/todo/status"),
        api("/api/todo/routes"),
        api("/api/todo/integration-check")
      ]);
      state.payload = { status, routes, integration };
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

  function countObject(value){
    return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).length : 0;
  }

  function safeCount(check){
    if (!check || typeof check !== "object") return "-";
    if (typeof check.count === "number") return check.count;
    return "-";
  }

  function routePills(routes, mode){
    return routes.map(route => `<span class="todo-rodiag-route-pill ${esc(mode)}">${esc(route)}</span>`).join("");
  }

  function metric(label, value, note, mode = "neutral"){
    return `<div class="todo-rodiag-metric ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  function renderCard(payload){
    const status = payload?.status || {};
    const integration = payload?.integration || {};
    const checks = integration.checks || {};
    const channels = checks.channels || {};
    const tables = checks.tables || {};
    const settings = checks.settings || {};
    const texts = checks.texts || {};

    const statusOk = status.ok !== false;
    const schemaOk = status.schemaReady === true;
    const integrationOk = integration.ok === true || integration.healthy === true;
    const missingChannels = Array.isArray(channels.missing) ? channels.missing : [];
    const targetCount = checks.targets?.count ?? countObject(status.targets);
    const configuredChannels = Object.values(status.channels || {}).filter(item => item && item.configured).length;
    const totalChannels = countObject(status.channels);

    const badge = statusOk && schemaOk && integrationOk
      ? '<span class="todo-pill ok">READ-ONLY OK</span>'
      : '<span class="todo-pill warn">PRÜFEN</span>';

    return `
      <section id="${CARD_ID}" class="todo-card todo-rodiag-card" data-can34-readonly-diagnostics="1" data-version="${esc(MODULE_VERSION)}">
        <div class="todo-rodiag-head">
          <div>
            <h3>Todo Read-only Diagnose</h3>
            <p class="todo-note">Nur Anzeige. Kein Add, kein Reload, kein Speichern von Settings/Textvarianten.</p>
          </div>
          <div class="todo-rodiag-head-pills">
            ${badge}
            <span class="todo-pill neutral">v${esc(status.moduleVersion || status.version || "0.1.0")}</span>
            <span class="todo-pill neutral">schema ${esc(status.schemaVersion || "-")}</span>
          </div>
        </div>

        <div class="todo-rodiag-grid">
          ${metric("Status OK", statusOk ? "ja" : "nein", "GET /api/todo/status", statusOk ? "ok" : "warn")}
          ${metric("Schema OK", schemaOk ? "ja" : "nein", "schemaReady", schemaOk ? "ok" : "warn")}
          ${metric("Integration OK", integrationOk ? "ja" : "nein", "GET /api/todo/integration-check", integrationOk ? "ok" : "warn")}
          ${metric("Targets", targetCount, "Todo-Ziele", targetCount ? "ok" : "warn")}
          ${metric("Channels", `${configuredChannels}/${totalChannels}`, "konfiguriert", missingChannels.length ? "warn" : "ok")}
          ${metric("Fehlende Channels", missingChannels.length, missingChannels.map(item => item.key).join(", ") || "keine", missingChannels.length ? "warn" : "ok")}
          ${metric("User-Stats", safeCount(tables.userStats), tables.userStats?.table || "todo_user_stats", "neutral")}
          ${metric("Daily-Stats", safeCount(tables.dailyStats), tables.dailyStats?.table || "todo_daily_stats", "neutral")}
          ${metric("Settings", settings.count ?? safeCount(tables.settings), settings.table || "todo_settings", settings.ok === false ? "warn" : "neutral")}
          ${metric("Textvarianten", texts.count ?? safeCount(tables.textVariants), texts.table || "module_text_variants", texts.ok === false ? "warn" : "neutral")}
          ${metric("Legacy-Texte", texts.legacyCount ?? safeCount(tables.legacyTexts), texts.legacyTable || "module_texts", "neutral")}
          ${metric("DB", checks.database?.ok === false ? "prüfen" : "ok", checks.database?.adapter || status.databasePath || "-", checks.database?.ok === false ? "warn" : "neutral")}
        </div>

        <div class="todo-rodiag-routes">
          <div>
            <h4>Read-only erlaubt</h4>
            <div class="todo-rodiag-route-list">${routePills(READ_ONLY_ROUTES, "ok")}</div>
          </div>
          <div>
            <h4>Produktiv gesperrt</h4>
            <div class="todo-rodiag-route-list">${routePills(BLOCKED_ROUTES, "blocked")}</div>
          </div>
        </div>

        <p class="todo-muted">CAN-34.3c: Stabilitätsfix ohne MutationObserver. Diese Karte nutzt nur GET /status, /routes und /integration-check. Sie postet nichts nach Discord, erhöht keine Statistik, speichert keine Settings/Textvarianten und löst keinen Reload aus.</p>
      </section>
    `;
  }

  function tabsNode(){
    return panel()?.querySelector(".todo-tabs") || null;
  }

  function removeCard(){
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.remove();
  }

  function restoreNativeContent(){
    const root = panel();
    if (!root) return;
    root.querySelectorAll("[data-todo-readonly-hidden='1']").forEach(node => {
      delete node.dataset.todoReadonlyHidden;
      node.style.display = "";
    });
  }

  function ensureTab(){
    const tabs = tabsNode();
    if (!tabs || document.getElementById(TAB_ID)) return;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = TAB_ID;
    tab.dataset.todoReadonlyTab = "diagnostics";
    tab.textContent = "Diagnose";
    tabs.appendChild(tab);
  }

  function setTabActive(){
    const tabs = tabsNode();
    if (!tabs) return;
    tabs.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(TAB_ID)?.classList.add("active");
  }

  function hideNativeContent(){
    const tabs = tabsNode();
    if (!tabs) return;
    let node = tabs.nextElementSibling;
    while (node) {
      const next = node.nextElementSibling;
      if (node.id !== CARD_ID) {
        node.dataset.todoReadonlyHidden = "1";
        node.style.display = "none";
      }
      node = next;
    }
  }

  async function renderDiagnostics(force = false){
    if (!isVisible()) return;
    ensureTab();
    const tabs = tabsNode();
    if (!tabs) return;

    state.active = true;
    setTabActive();
    hideNativeContent();

    const payload = await loadPayload(force);
    if (!payload) return;

    const html = renderCard(payload);
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.outerHTML = html;
    else tabs.insertAdjacentHTML("afterend", html);

    setTabActive();
    hideNativeContent();
  }

  function showNative(){
    state.active = false;
    restoreNativeContent();
    removeCard();
    ensureTab();
  }

  function scheduleEnsure(){
    schedule(() => {
      if (!isVisible()) return;
      ensureTab();
      if (state.active) renderDiagnostics(false);
    }, 120);
    schedule(() => {
      if (!isVisible()) return;
      ensureTab();
      if (state.active) renderDiagnostics(false);
    }, 600);
  }

  function boot(){
    document.addEventListener("click", ev => {
      const diagTab = ev.target.closest?.(`#${TAB_ID}`);
      if (diagTab) {
        ev.preventDefault();
        ev.stopPropagation();
        clearOwnedTimers();
        renderDiagnostics(true);
        return;
      }

      const nativeTab = ev.target.closest?.("#todoModule [data-todo-tab]");
      if (nativeTab) {
        showNative();
        scheduleEnsure();
        return;
      }

      if (ev.target.closest?.("#todoModule [data-todo-refresh], #todoModule [data-todo-reload]")) {
        scheduleEnsure();
      }
    }, true);

    window.addEventListener("cgn:module-show", ev => {
      if (ev.detail?.module !== "todo") return;
      showNative();
      scheduleEnsure();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) scheduleEnsure();
    });

    scheduleEnsure();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.CGNTodoReadonlyDiagnostics = {
    version: MODULE_VERSION,
    refresh: () => renderDiagnostics(true),
    activate: () => renderDiagnostics(true),
    deactivate: showNative
  };
})();
