# FILES – CAN-6.9 / Recovery Implementation Sequence Gates

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_9_RECOVERY_IMPLEMENTATION_SEQUENCE_GATES.md`
  - verbindliche Implementierungsreihenfolge
  - Phase 0 echte Dateien pruefen
  - Phase 1 read-only Backend-Diagnose
  - Phase 2 read-only Statusroute
  - Phase 3 Dashboard nur Anzeige
  - Phase 4 Preflight nur nach separatem Go
  - Phase 5 Command-Konzept bleibt gesperrt
  - harte Gates vor jedem Code-Step
  - Testregeln fuer spaetere Code-Steps
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_9.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_9_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md`
- `docs/system-inspection/EVENTBUS_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET.md`

## Spaeter vor CAN-7.0 zwingend erneut zu pruefende echte Dateien

- `backend/modules/bus_diagnostics.js`
- `backend/modules/communication_bus.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `htdocs/dashboard/modules/bus_diagnostics.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `config/alert_system.json`
- `config/sound_system.json`

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine Command-Route bauen.
- Keine DB-/Config-Migration ohne separate Planung.

---

# FILES – CAN-6.8 / Recovery Safety-Stop Clear Ruleset

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET.md`
  - Safety-Stop-Arten
  - globale Stopps
  - modulbezogene Stopps
  - Clear-/Review-/Rollback-Trennung
  - Low-Risk-Clear-Grenzen
  - hart blockierte Clear-/Recovery-Aktionen
  - Dashboard-Hinweise ohne Aktion
  - Testregeln fuer spaetere Code-Steps
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_8.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_8_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md`

## Weiterhin nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine neue API-Route ohne separaten Code-Step bauen.
- Keine Dashboard-Code-Datei ohne echte Datei-Prüfung ändern.

---

# FILES – CAN-6.7 / Recovery Command Audit-State Mapping

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md`
  - Command-Zustaende
  - Audit-Ereignisse
  - Mapping Zustand -> Audit -> Anzeige
  - geplante State-Felder
  - standardisierte Blockierungsgruende
  - Rollback-/Clear-Hinweise
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_7.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_7_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`

## Weiterhin nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine neue API-Route ohne separaten Code-Step bauen.
- Keine Dashboard-Code-Datei ohne echte Datei-Prüfung ändern.

---

# FILES – CAN-6.6 / Recovery Execution Command Concept

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`
  - Konzept fuer spaeteren manuellen Recovery-Ausfuehrungs-Command
  - Preflight-/Command-Trennung
  - Command-Request-/Response-Felder
  - Guard-Reihenfolge
  - Idempotenz und Duplikat-Sperre
  - Audit-Pflichtpunkte
  - Rollback-/Clear-Regeln
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_6.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_6_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`

## Weiterhin nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine neue API-Route ohne separaten Code-Step bauen.
- Keine Dashboard-Code-Datei ohne echte Datei-Prüfung ändern.

---

# FILES – CAN-6.5 / Dashboard Preflight Read-only UX Concept

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
  - Konzept fuer spaetere read-only Dashboard-Preflight-Anzeige
  - Anzeigegruppen
  - Status-Einstufungen
  - Pflichttexte
  - verbotene UI-Elemente
  - Rollen-/Rechte-Hinweise
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_5.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_5_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`

## Weiterhin nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine neue API-Route ohne separaten Code-Step bauen.
- Keine Dashboard-Code-Datei ohne echte Datei-Prüfung ändern.

---

# FILES – CAN-6.4 / Recovery Preflight API Concept

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
  - Konzept fuer spaetere read-only Recovery-Preflight-API
  - Request-/Response-Felder
  - Guard-Pruefungen
  - Blockierungsgruende
  - Read-only-Garantie
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_4.md`
  - Übergabe fuer den naechsten Chat/Step
- `docs/current/README_CAN6_4_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise fuer dieses Datei-ZIP

## Weiterhin relevante Vorgänger-Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`

## Weiterhin nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine neue API-Route ohne separaten Code-Step bauen.

---

# FILES – CAN-6.3 / Recovery-Audit- und Bestätigungs-Code-Konzept aktueller Arbeitsstand

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
  - Audit-Eventtypen, Audit-Pflichtfelder, Bestätigungs-Code-Lebenszyklus, Bestätigungs-Code-Bindung und Preflight-Felder
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_3.md`
  - kompakte Übergabe fuer neuen Chat
- `docs/current/README_CAN6_3_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweis fuer diesen ZIP-Stand
- `project-state/CURRENT_STATUS.md`
  - aktueller CAN-6.3 Status und konsolidierter Übergabestand
- `project-state/NEXT_STEPS.md`
  - nächster Arbeitsblock CAN-6.4
- `project-state/TODO.md`
  - offene Aufgaben fuer Read-only Preflight-API-Konzept
- `project-state/CHANGELOG.md`
  - Dokumentationsabschluss CAN-6.3
- `project-state/FILES.md`
  - diese Datei

## Relevante CAN-6 Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md`
- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine neuen Recovery-Routen ergänzen.
- Keine Bestätigungs-Code produktiv aktivieren.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine produktive DB blind migrieren.

---

# FILES – CAN-6.2 / Backend-Schutzvertrag aktueller Arbeitsstand

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
  - Backend-Schutzvertrag fuer spaetere manuelle Recovery-Aktionen
  - Guard-Kette: Auth, Matrix, Confirm, State, Safety-Stop, Status, Duplicate, RateLimit, Audit, Rollback
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_2.md`
  - kompakte Übergabe fuer neuen Chat
- `docs/current/README_CAN6_2_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweis fuer diesen ZIP-Stand
- `project-state/CURRENT_STATUS.md`
  - aktueller CAN-6.2 Status und konsolidierter Übergabestand
- `project-state/NEXT_STEPS.md`
  - nächster Arbeitsblock CAN-6.3
- `project-state/TODO.md`
  - offene Aufgaben fuer Audit-/Bestätigungs-Code-Konzept
- `project-state/CHANGELOG.md`
  - Dokumentationsabschluss CAN-6.2
- `project-state/FILES.md`
  - diese Datei

## Relevante CAN-6 Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md`
- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine neuen Recovery-Routen ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine produktive DB blind migrieren.

---

# FILES – CAN-6.1 / Recovery-Aktionsmatrix aktueller Arbeitsstand

Stand: 2026-06-01
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

## Aktueller Dokumentationsstand

- `project-state/CURRENT_STATUS.md`
  - aktueller CAN-6.1 Status und konsolidierter Übergabestand
- `project-state/NEXT_STEPS.md`
  - nächster Arbeitsblock CAN-6.2
- `project-state/TODO.md`
  - CAN-6.1 abgeschlossen, CAN-6.2 offene Aufgaben ergänzt
- `project-state/CHANGELOG.md`
  - Dokumentationsabschluss CAN-6.1
- `project-state/FILES.md`
  - diese Datei
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_1.md`
  - kompakte Übergabe für neuen Chat

## Relevante CAN-5/CAN-6 Dokumente

- `docs/system-inspection/EVENTBUS_CAN5_7_SIMULATION_HARNESS_LIVE_TEST_STABLE.md`
- `docs/system-inspection/EVENTBUS_CAN5_8_RECOVERY_DASHBOARD_PLAN.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT.md`
- `docs/system-inspection/EVENTBUS_CAN5_10_RECOVERY_DASHBOARD_STABLE.md`
- `docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md`
- `docs/system-inspection/EVENTBUS_CAN6_0_DOCUMENTATION_CONSOLIDATED.md`
- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`

## Relevante Code-Dateien

- `backend/modules/bus_diagnostics.js`
  - Recovery-Strategy-State
  - Recovery-Simulation-Harness
  - read-only Diagnose-Endpunkte
- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Bus-Diagnostics-Dashboard
  - Recovery-Tab read-only Anzeige
- `backend/modules/communication_bus.js`
  - zentraler Communication-Bus / EventBus
- `backend/modules/alert_system.js`
  - spaeter relevant fuer Alert-Schutzvertrag
- `backend/modules/sound_system.js`
  - spaeter relevant fuer Sound-/Bundle-Schutzvertrag
- `htdocs/overlays/_overlay-alerts-v2.html`
  - spaeter relevant fuer Overlay-/Visual-State-Pruefung
- `htdocs/overlays/sound_system_overlay.html`
  - spaeter relevant fuer Sound-Overlay-Client-Pruefung

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Recovery-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.
- Keine DB-/Config-Migration ohne separate Planung.

---

# FILES – CAN-6.0 / Recovery-Diagnose aktueller Arbeitsstand

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `project-state/CURRENT_STATUS.md`
  - aktueller CAN-6.0 Status und konsolidierter Übergabestand
- `project-state/NEXT_STEPS.md`
  - nächster Arbeitsblock CAN-6.1
- `TODO.md`
  - offene Aufgaben für Doku, Recovery-Matrix und spätere sichere Umsetzung
- `CHANGELOG.md`
  - Dokumentationsabschluss CAN-6.0
- `FILES.md`
  - diese Datei
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_0.md`
  - kompakte Übergabe für neuen Chat

## Relevante CAN-5/CAN-6 Dokumente

- `docs/system-inspection/EVENTBUS_CAN5_7_SIMULATION_HARNESS_LIVE_TEST_STABLE.md`
- `docs/system-inspection/EVENTBUS_CAN5_8_RECOVERY_DASHBOARD_PLAN.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT.md`
- `docs/system-inspection/EVENTBUS_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT.md`
- `docs/system-inspection/EVENTBUS_CAN5_10_RECOVERY_DASHBOARD_STABLE.md`
- `docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md`

## Relevante Code-Dateien

- `backend/modules/bus_diagnostics.js`
  - Recovery-Strategy-State
  - Recovery-Simulation-Harness
  - read-only Diagnose-Endpunkte
- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Bus-Diagnostics-Dashboard
  - Recovery-Tab read-only Anzeige

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergänzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.

---

# FILES – STEP278 Vorbereitung

## Direkt relevant für heutigen Test

- `config/clip_system.json`
  - enthält `clipShoutout`
  - enthält jetzt `clipShoutout.officialShoutout.liveGateEnabled = false`

## Für STEP278 prüfen

### Backend

- `backend/server.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `backend/modules/clip_shoutout.js`
- `backend/modules/twitch.js`
- `backend/modules/twitch_presence.js`

### Overlays

- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`

### Configs

- `config/alert_system.json`
- `config/sound_system.json`
- `config/clip_system.json`

### Helper, falls vorhanden

- `backend/modules/helpers/helper_state.js`
- `backend/modules/helpers/helper_routes.js`
- `backend/modules/helpers/helper_core.js`
- `backend/modules/helpers/helper_config.js`
