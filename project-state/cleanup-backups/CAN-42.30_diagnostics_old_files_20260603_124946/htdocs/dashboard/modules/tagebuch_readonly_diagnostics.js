"use strict";

(function(){
  const MODULE_VERSION = "0.1.0-can35-3";
  const PANEL_ID = "tagebuchModule";
  const CARD_ID = "tagebuchReadonlyDiagnosticsCard";
  const TAB_ID = "tagebuchReadonlyDiagnosticsTab";
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
    "GET /api/tagebuch/status",
    "GET /api/tagebuch/config",
    "GET /api/tagebuch/settings",
    "GET /api/tagebuch/routes",
    "GET /api/tagebuch/integration-check",
    "GET /api/tagebuch/stats",
    "GET /api/tagebuch/stats/top",
    "GET /api/tagebuch/stats/today",
    "GET /api/tagebuch/stats/user",
    "GET /api/tagebuch/admin/settings",
    "GET /api/tagebuch/admin/texts",
    "GET /discord/tagebuch/status"
  ];

  const BLOCKED_ROUTES = [
    "GET/POST /api/tagebuch/stream/start",
    "GET/POST /api/tagebuch/stream/end",
    "GET/POST /api/tagebuch/entry",
    "GET/POST /api/tagebuch/reset",
    "GET/POST /api/tagebuch/reload",
    "GET/POST /discord/stream/start",
    "GET/POST /discord/stream/end",
    "GET/POST /discord/tagebuch",
    "GET/POST /discord/tagebuch/reset",
    "POST /api/tagebuch/admin/settings",
    "POST /api/tagebuch/admin/texts"
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
        api("/api/tagebuch/status"),
        api("/api/tagebuch/routes"),
        api("/api/tagebuch/integration-check")
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

  function yesNo(value){ return value ? "ja" : "nein"; }

  function routePills(routes, mode){
    return routes.map(route => `<span class="tagebuch-rodiag-route-pill ${esc(mode)}">${esc(route)}</span>`).join("");
  }

  function metric(label, value, note, mode = "neutral"){
    return `<div class="tagebuch-rodiag-metric ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  function infoRow(label, value, mode = "neutral"){
    return `<div class="tagebuch-rodiag-row ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function renderCard(payload){
    const status = payload?.status || {};
    const integration = payload?.integration || {};
    const checks = integration.checks || {};
    const tables = checks.tables || {};
    const cfg = status.config || {};
    const st = status.state || {};
    const webhook = checks.webhook || {};
    const texts = checks.texts || {};
    const settings = checks.settings || {};
    const database = checks.database || {};

    const statusOk = status.ok !== false;
    const schemaVersion = integration.schemaVersion || status.schemaVersion || database.schemaVersion || "-";
    const expectedSchema = database.expectedSchemaVersion || "-";
    const schemaOk = Number(database.schemaVersion || status.schemaVersion || 0) >= Number(database.expectedSchemaVersion || 0);
    const integrationOk = integration.ok === true && integration.healthy !== false;
    const activeStream = Boolean(st.activeStream);
    const hasEntries = Boolean(st.hasEntriesForCurrentDate);

    const badge = statusOk && schemaOk && integrationOk
      ? '<span class="tagebuch-pill ok">READ-ONLY OK</span>'
      : '<span class="tagebuch-pill warn">PRÜFEN</span>';

    return `
      <section id="${CARD_ID}" class="tagebuch-rodiag-shell" data-can35-readonly-diagnostics="1" data-version="${esc(MODULE_VERSION)}">
        <section class="tagebuch-card tagebuch-rodiag-card tagebuch-rodiag-header">
          <div>
            <h3>Tagebuch Read-only Diagnose</h3>
            <p class="tagebuch-note">Eigener Diagnose-Tab. Kein Entry, kein Streamstart/-ende, kein Reset, kein Reload, kein Speichern.</p>
          </div>
          <div class="tagebuch-rodiag-head-pills">
            ${badge}
            <span class="tagebuch-pill neutral">Schema ${esc(schemaVersion)}</span>
            <span class="tagebuch-pill neutral">Soll ${esc(expectedSchema)}</span>
          </div>
        </section>

        <section class="tagebuch-rodiag-section">
          <div class="tagebuch-rodiag-section-title">
            <h4>Status & Schema</h4>
            <span>nur /status und /integration-check</span>
          </div>
          <div class="tagebuch-rodiag-grid">
            ${metric("Status OK", yesNo(statusOk), "GET /api/tagebuch/status", statusOk ? "ok" : "warn")}
            ${metric("Schema OK", yesNo(schemaOk), `aktuell ${schemaVersion} / soll ${expectedSchema}`, schemaOk ? "ok" : "warn")}
            ${metric("Integration OK", yesNo(integrationOk), "GET /api/tagebuch/integration-check", integrationOk ? "ok" : "warn")}
            ${metric("DB", database.ok === false ? "prüfen" : "ok", database.adapter || status.databasePath || "-", database.ok === false ? "warn" : "neutral")}
          </div>
        </section>

        <section class="tagebuch-rodiag-section">
          <div class="tagebuch-rodiag-section-title">
            <h4>Aktueller Tagebuch-State</h4>
            <span>nur Anzeige</span>
          </div>
          <div class="tagebuch-rodiag-split">
            <div class="tagebuch-rodiag-list">
              ${infoRow("Aktuelle Seite", st.currentPageNumber ?? "-", "neutral")}
              ${infoRow("Seitendatum", st.currentPageDate || "-", "neutral")}
              ${infoRow("Heute lokal", st.localDateToday || "-", "neutral")}
              ${infoRow("Nächste Seite", st.nextPageNumberIfNewDate ?? "-", "neutral")}
            </div>
            <div class="tagebuch-rodiag-list">
              ${infoRow("Stream aktiv", yesNo(activeStream), activeStream ? "ok" : "neutral")}
              ${infoRow("Einträge heute", yesNo(hasEntries), hasEntries ? "ok" : "neutral")}
              ${infoRow("Leer-Hinweis gepostet", yesNo(st.endNoticePostedForCurrentDate), st.endNoticePostedForCurrentDate ? "ok" : "neutral")}
              ${infoRow("Zuletzt aktualisiert", st.updatedAt || "-", "neutral")}
            </div>
          </div>
        </section>

        <section class="tagebuch-rodiag-section">
          <div class="tagebuch-rodiag-section-title">
            <h4>Tabellen & Texte</h4>
            <span>Zähler ohne Schreibzugriff</span>
          </div>
          <div class="tagebuch-rodiag-grid">
            ${metric("State", safeCount(tables.state), tables.state?.table || "tagebuch_state", tables.state?.ok === false ? "warn" : "neutral")}
            ${metric("Runtime-Events", safeCount(tables.runtimeEvents), tables.runtimeEvents?.table || "tagebuch_runtime_events", tables.runtimeEvents?.ok === false ? "warn" : "neutral")}
            ${metric("User-Stats", safeCount(tables.userStats), tables.userStats?.table || "tagebuch_user_stats", tables.userStats?.ok === false ? "warn" : "neutral")}
            ${metric("Daily-Stats", safeCount(tables.dailyUserStats), tables.dailyUserStats?.table || "tagebuch_daily_user_stats", tables.dailyUserStats?.ok === false ? "warn" : "neutral")}
            ${metric("Settings", settings.count ?? safeCount(tables.settings), settings.table || "tagebuch_settings", settings.ok === false ? "warn" : "neutral")}
            ${metric("Textvarianten", texts.count ?? safeCount(tables.textVariants), texts.table || "module_text_variants", texts.ok === false ? "warn" : "neutral")}
            ${metric("Text-Kategorien", texts.categories ?? "-", texts.module || "tagebuch", "neutral")}
            ${metric("Config-Quelle", cfg.settingsSource || checks.config?.source || "-", "ohne Secrets", "neutral")}
          </div>
        </section>

        <section class="tagebuch-rodiag-section">
          <div class="tagebuch-rodiag-section-title">
            <h4>Webhook & Dateien</h4>
            <span>keine Secret-Anzeige</span>
          </div>
          <div class="tagebuch-rodiag-split">
            <div class="tagebuch-rodiag-list">
              ${infoRow("Discord-Webhook aktiv", yesNo(webhook.useDiscordWebhook ?? cfg.useDiscordWebhook), "neutral")}
              ${infoRow("Webhook konfiguriert", yesNo(webhook.hasWebhookUrl ?? cfg.hasWebhookUrl), (webhook.hasWebhookUrl ?? cfg.hasWebhookUrl) ? "ok" : "warn")}
              ${infoRow("Webhook Env", webhook.webhookUrlEnv || cfg.webhookUrlEnv || "-", "neutral")}
            </div>
            <div class="tagebuch-rodiag-list">
              ${infoRow("Config-Datei", checks.files?.config?.exists ? "vorhanden" : "prüfen", checks.files?.config?.ok === false ? "warn" : "ok")}
              ${infoRow("Messages-Datei", checks.files?.messages?.exists ? "vorhanden" : "prüfen", checks.files?.messages?.ok === false ? "warn" : "ok")}
              ${infoRow("Warnungen", Array.isArray(integration.warnings) ? integration.warnings.length : 0, integration.warnings?.length ? "warn" : "ok")}
            </div>
          </div>
        </section>

        <section class="tagebuch-rodiag-section tagebuch-rodiag-routes-section">
          <div class="tagebuch-rodiag-section-title">
            <h4>Routen-Sicherheit</h4>
            <span>klar getrennt</span>
          </div>
          <div class="tagebuch-rodiag-routes">
            <details open>
              <summary>Read-only erlaubt (${READ_ONLY_ROUTES.length})</summary>
              <div class="tagebuch-rodiag-route-list">${routePills(READ_ONLY_ROUTES, "ok")}</div>
            </details>
            <details>
              <summary>Produktiv gesperrt (${BLOCKED_ROUTES.length})</summary>
              <div class="tagebuch-rodiag-route-list">${routePills(BLOCKED_ROUTES, "blocked")}</div>
            </details>
          </div>
        </section>

        <section class="tagebuch-card tagebuch-rodiag-card">
          <p class="tagebuch-muted">CAN-35.3: Diese Diagnose ist bewusst auf mehrere Karten/Abschnitte verteilt. Sie nutzt nur GET /status, /routes und /integration-check. Sie postet nichts nach Discord, legt keine Seite an, verändert keinen State, erhöht keine Statistik, speichert keine Settings/Textvarianten und löst keinen Reload aus.</p>
        </section>
      </section>
    `;
  }

  function tabsNode(){
    return panel()?.querySelector(".tagebuch-tabs") || null;
  }

  function removeCard(){
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.remove();
  }

  function restoreNativeContent(){
    const root = panel();
    if (!root) return;
    root.querySelectorAll("[data-tagebuch-readonly-hidden='1']").forEach(node => {
      delete node.dataset.tagebuchReadonlyHidden;
      node.style.display = "";
    });
  }

  function ensureTab(){
    const tabs = tabsNode();
    if (!tabs || document.getElementById(TAB_ID)) return;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = TAB_ID;
    tab.dataset.tagebuchReadonlyTab = "diagnostics";
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
        node.dataset.tagebuchReadonlyHidden = "1";
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

      const nativeTab = ev.target.closest?.("#tagebuchModule [data-tagebuch-tab]");
      if (nativeTab) {
        showNative();
        scheduleEnsure();
        return;
      }

      if (ev.target.closest?.("#tagebuchModule [data-tagebuch-refresh], #tagebuchModule [data-tagebuch-reload]")) {
        scheduleEnsure();
      }
    }, true);

    window.addEventListener("cgn:module-show", ev => {
      if (ev.detail?.module !== "tagebuch") return;
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

  window.CGNTagebuchReadonlyDiagnostics = {
    version: MODULE_VERSION,
    refresh: () => renderDiagnostics(true),
    activate: () => renderDiagnostics(true),
    deactivate: showNative
  };
})();
