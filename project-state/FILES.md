# FILES – CAN-7.2.1 Recovery-Readiness Testfeld-Fix

Stand: 2026-06-01

## Geänderte Doku-/Projektdateien

- `docs/system-inspection/EVENTBUS_CAN7_2_RECOVERY_READINESS_LIVE_TEST_ACCEPTANCE.md`
  - korrigierte Testbefehle und Live-Abnahme
- `docs/system-inspection/EVENTBUS_CAN7_2_1_RECOVERY_READINESS_TEST_FIELD_FIX.md`
  - eigener Fix-Step für falsche Testfelder
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2.md`
  - korrigierte Übergabe
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2_1.md`
  - Übergabe für nächsten Schritt
- `docs/current/README_CAN7_2_1_FILE_ZIP.md`
  - ZIP-Hinweise
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht enthalten

- `backend/modules/bus_diagnostics.js`
- `htdocs/dashboard/modules/bus_diagnostics.js`
- Config-Dateien
- DB-Dateien

## Nächste relevante Datei

Vor CAN-7.3 prüfen:

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

# FILES – CAN-7.2 Recovery-Readiness Live-Test und Abnahmegrenze

Stand: 2026-06-01

## Neue/aktualisierte Doku

- `docs/system-inspection/EVENTBUS_CAN7_2_RECOVERY_READINESS_LIVE_TEST_ACCEPTANCE.md`
  - Test-/Abnahmeplan für CAN-7.1 `recoveryReadiness`.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2.md`
  - Übergabe für nächsten Schritt.
- `docs/current/README_CAN7_2_FILE_ZIP.md`
  - ZIP-Hinweise.

## Technisch relevant für den Live-Test

- `backend/modules/bus_diagnostics.js`
  - durch CAN-7.1 geändert, in CAN-7.2 nicht erneut geändert.

## Für CAN-7.3 benötigt

- `htdocs/dashboard/modules/bus_diagnostics.js`
  - vollständige echte Datei vor jeder Änderung prüfen oder anfordern.

---

# FILES – CAN-7.1 / Recovery-Readiness Statusfelder

Stand: 2026-06-01

## Geaendert in CAN-7.1

- `backend/modules/bus_diagnostics.js`
  - Version `1.2.5`
  - Build `STEP_CAN7_1`
  - neues read-only Statusfeld `recoveryReadiness`

## Neu in CAN-7.1

- `docs/system-inspection/EVENTBUS_CAN7_1_RECOVERY_READINESS_STATUS_FIELDS.md`
  - technische Beschreibung der additiven Readiness-Felder
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_1.md`
  - kompakte Uebergabe fuer CAN-7.2
- `docs/current/README_CAN7_1_FILE_ZIP.md`
  - Entpack-/Test-Hinweis fuer dieses ZIP

## Fuer CAN-7.2 relevant

- `htdocs/dashboard/modules/bus_diagnostics.js`
  - bestehender Recovery-Tab
  - nur Anzeige erweitern
  - keine Buttons / keine Aktionen

## Nicht anfassen ohne separates Go

- `backend/modules/communication_bus.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `config/alert_system.json`
- `config/sound_system.json`
- produktive SQLite-Datenbank

---

# FILES – CAN-7.0 / Recovery-Readiness aktueller Arbeitsstand

Stand: 2026-06-01

## Neuer Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN7_0_REAL_FILE_INSPECTION_READINESS_BOUNDARY.md`
  - echte Datei-Pruefung und CAN-7.1 Startgrenze
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_0.md`
  - kompakte Uebergabe fuer CAN-7.1
- `docs/current/README_CAN7_0_FILE_ZIP.md`
  - ZIP-Hinweis

## Fuer CAN-7.1 direkt relevant

- `backend/modules/bus_diagnostics.js`
  - einziger erlaubter erster Code-Kandidat
  - nur additive read-only `recoveryReadiness`-Felder
  - keine neue produktive Route
  - keine Recovery-Ausfuehrung

## In CAN-7.0 geprueft, aber nicht zu aendern

- `backend/modules/communication_bus.js`
  - Status-/Settings-/Test-/Mirror-/Replay-/Watchdog-Faehigkeiten vorhanden
  - fuer CAN-7.1 nicht anfassen
- `backend/modules/alert_system.js`
  - Alert-Queue, Output, Overlay-Watchdog, Korrelation vorhanden
  - fuer CAN-7.1 nicht anfassen
- `backend/modules/sound_system.js`
  - Sound-Queue, Bus, dry-run Command-Pfad vorhanden
  - fuer CAN-7.1 nicht anfassen
- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Recovery-Tab zeigt read-only Daten
  - fuer CAN-7.1 keine Buttons / keine UI-Aktion ergaenzen

## Weiter relevant fuer spaetere CAN-7.x Pruefung

- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `config/alert_system.json`
- `config/sound_system.json`

## Nicht anfassen ohne separates Go

- Keine Recovery-Automatik aktivieren.
- Keine Simulation-Buttons im Dashboard ergaenzen.
- Keine Recovery-Buttons im Dashboard ergaenzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine Queue-/Sound-/Overlay-/Alert-Logik produktiv beruehren.

---

# FILES – CAN-6.10 / Recovery-Planungsabschluss

Stand: 2026-06-01

## Neu in CAN-6.10

- `docs/system-inspection/EVENTBUS_CAN6_10_RECOVERY_PLANNING_CLOSURE_CAN7_START_GATE.md`
  - Abschlusscheck der CAN-6.x-Planungsreihe
  - harte Startgrenze fuer CAN-7.0
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_10.md`
  - kompakte Uebergabe fuer den naechsten Chat / CAN-7.0
- `docs/current/README_CAN6_10_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweis fuer dieses ZIP

## Weiterhin relevante CAN-6 Dokumente

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`
- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md`
- `docs/system-inspection/EVENTBUS_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET.md`
- `docs/system-inspection/EVENTBUS_CAN6_9_RECOVERY_IMPLEMENTATION_SEQUENCE_GATES.md`

## Vor CAN-7.0 technisch pruefen

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
- Keine Recovery-Buttons im Dashboard ergaenzen.
- Keine Simulation-Buttons im Dashboard ergaenzen.
- Keine Alert-/Sound-Replays erlauben.
- Keine produktive Queue-/Sound-/Overlay-Logik umbauen.

---

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

