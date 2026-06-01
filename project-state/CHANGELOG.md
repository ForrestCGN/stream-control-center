# CHANGELOG – CAN-8.4 Recovery-Preflight Dashboard Read-only Anzeige geplant

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN8_4_RECOVERY_PREFLIGHT_DASHBOARD_READONLY_DISPLAY_PLAN.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN8_4.md` ergänzt.
- Projekt-State-Dateien auf CAN-8.4 nachgezogen.

## Nicht geändert

- Keine Backend-Datei.
- Keine Dashboard-Datei.
- Keine API-Route.
- Keine Config.
- Keine DB.
- Keine Recovery-Ausführung.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-8.5: Dashboard-Preflight read-only Anzeige umsetzen.

---

# CHANGELOG – CAN-8.3 Recovery-Preflight Statusfelder

Stand: 2026-06-01

## Geaendert

- `backend/modules/bus_diagnostics.js` auf Version `1.2.6` erhoeht.
- `recoveryPreflight` als read-only Statusfeld ergaenzt.
- Summary-Felder fuer Recovery-Preflight ergaenzt.

## Nicht geaendert

- Keine neue Route.
- Keine POST-/Command-Route.
- Keine Dashboard-Datei.
- Keine Recovery-Ausfuehrung.
- Keine produktive Flow-Aenderung.

# CHANGELOG – CAN-8.2 Recovery-Preflight Read-only Statusfelder Plan

Stand: 2026-06-01

## Geändert

- Konkrete read-only Statusfeld-Grenze fuer `recoveryPreflight` dokumentiert.
- Minimal erlaubten CAN-8.3-Code-Scope festgelegt.
- Testbefehle fuer spaeteren CAN-8.3-Code-Step definiert.
- Projekt-State auf CAN-8.3 vorbereitet.

## Nicht geändert

- Keine Backend-Datei geändert.
- Keine Dashboard-Datei geändert.
- Keine API-Route geändert.
- Keine Config geändert.
- Keine DB geändert.
- Keine Recovery-Ausführung ergänzt.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-8.3: `recoveryPreflight` read-only Statusfelder additiv in `backend/modules/bus_diagnostics.js` umsetzen.

# CHANGELOG – CAN-8.1 Recovery-Preflight Read-only Datenmodell

Stand: 2026-06-01

## Geändert

- Read-only Preflight-Datenmodell dokumentiert.
- Geplantes Feld `recoveryPreflight` definiert.
- Guard-/Safety-/Dashboard-Grenzen fuer spaetere Schritte festgelegt.
- Projekt-State auf CAN-8.2 vorbereitet.

## Nicht geändert

- Keine Backend-Datei geändert.
- Keine Dashboard-Datei geändert.
- Keine API-Route geändert.
- Keine Config geändert.
- Keine DB geändert.
- Keine Recovery-Ausführung ergänzt.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-8.2: Echte Dateien prüfen und konkrete read-only Preflight-Statusfelder planen.

# CHANGELOG – CAN-7.6 Recovery-Dashboard Read-only Abschluss

Stand: 2026-06-01

## Geändert

- CAN-7.x Abschluss dokumentiert.
- CAN-8.0 Startgrenze dokumentiert.
- Projekt-State-Dateien auf nächsten Preflight-Block vorbereitet.

## Nicht geändert

- Keine Backend-Datei geändert.
- Keine Dashboard-Datei geändert.
- Keine API-Route geändert.
- Keine Config geändert.
- Keine DB geändert.
- Keine Recovery-Ausführung ergänzt.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-8.0: Preflight-Backend-Readiness-Grenze anhand echter Dateien prüfen und dokumentieren.

# CHANGELOG – CAN-7.5 Recovery-Tab UX Live-Test

Stand: 2026-06-01

## Geaendert

- Live-Test-/Abnahmedoku fuer CAN-7.4 Recovery-Tab UX-Cleanup ergaenzt.
- Projekt-State auf CAN-7.5 fortgeschrieben.

## Nicht geaendert

- Keine Backend-Datei.
- Keine Dashboard-Datei.
- Keine API-Route.
- Keine Config.
- Keine DB.
- Keine Recovery-Ausfuehrung.
- Keine Recovery-Buttons.
- Keine Simulation-Buttons.
- Keine produktive Flow-Aenderung.

# CHANGELOG – CAN-7.4 Recovery-Tab UX-Cleanup

Stand: 2026-06-01

## Geändert

- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Recovery-Tab in interne Untertabs aufgeteilt:
    - Übersicht
    - Details
    - Readiness
    - Sperren & Simulation
  - Gewählte Unteransicht wird in `localStorage` gespeichert.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Recovery-Ausführung ergänzt.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine produktive Flow-Änderung.

## Test

- `node -c htdocs\dashboard\modules\bus_diagnostics.js` bestanden.

# CHANGELOG – CAN-7.3 Dashboard Recovery-Readiness Anzeige

Stand: 2026-06-01

## Geaendert

- `htdocs/dashboard/modules/bus_diagnostics.js` zeigt `recoveryReadiness` im bestehenden Recovery-Tab an.
- Anzeigegruppen ergaenzt:
  - Recovery-Readiness
  - Readiness-Safety
  - Readiness-Checks
  - Readiness-Blocker
  - Hart blockierte Recovery-Aktionen

## Nicht geaendert

- Keine Backend-Logik geaendert.
- Keine API-Route geaendert.
- Keine Dashboard-Buttons fuer Recovery ergaenzt.
- Keine Recovery-Ausfuehrung aktiviert.
- Keine produktive Queue-/Sound-/Overlay-Logik geaendert.
- Keine DB-/Config-Migration.

## Naechster Block

- CAN-7.4: Dashboard-Anzeige live testen und abnehmen.

---

# CHANGELOG – CAN-7.2.1 Recovery-Readiness Testfeld-Fix

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN7_2_RECOVERY_READINESS_LIVE_TEST_ACCEPTANCE.md` korrigiert.
- `docs/system-inspection/EVENTBUS_CAN7_2_1_RECOVERY_READINESS_TEST_FIELD_FIX.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2.md` korrigiert.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2_1.md` ergänzt.
- Projekt-State-Dateien auf CAN-7.2.1 nachgezogen.

## Grund

Die CAN-7.2-Doku enthielt falsche Select-Object-Felder für `recoveryReadiness`. Die API war korrekt; die Testdoku wurde korrigiert.

## Bestätigt

- `bus_diagnostics` läuft mit Version `1.2.5`.
- `recoveryReadiness.status = ready`.
- Alle produktiven Touch-Flags bleiben `False`.

## Nicht geändert

- Keine Backend-Datei geändert.
- Keine Dashboard-Datei geändert.
- Keine API-Route ergänzt.
- Keine Config/DB geändert.
- Keine Recovery ausgeführt.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-7.3: Dashboard-Read-only-Anzeige von `recoveryReadiness`.

---

# CHANGELOG – CAN-7.2 Recovery-Readiness Live-Test und Abnahmegrenze

Stand: 2026-06-01

## Geändert

- CAN-7.2 Test-/Abnahmedokument ergänzt.
- Aktuelle Projekt-State-Dateien für CAN-7.2 aktualisiert.
- Übergabedatei `docs/current/CURRENT_CHAT_HANDOFF_CAN7_2.md` ergänzt.

## Nicht geändert

- Keine Backend-Datei geändert.
- Keine Dashboard-Datei geändert.
- Keine API-Route ergänzt.
- Keine Config geändert.
- Keine DB geändert.
- Keine Recovery ausgeführt.
- Keine produktive Flow-Änderung.

## Nächster Block

- CAN-7.3: Dashboard-Read-only-Anzeige von `recoveryReadiness`, erst nach Live-Test und vollständiger Datei-Prüfung.

---

# CHANGELOG – CAN-7.1 Recovery-Readiness Statusfelder

Stand: 2026-06-01

## Geaendert

- `backend/modules/bus_diagnostics.js` als vollstaendige Ersatzdatei aktualisiert.
- Modulversion `bus_diagnostics` von `1.2.4` auf `1.2.5` erhoeht.
- Build-Marker auf `STEP_CAN7_1` gesetzt.
- Neues read-only Statusfeld `recoveryReadiness` ergaenzt.
- `docs/system-inspection/EVENTBUS_CAN7_1_RECOVERY_READINESS_STATUS_FIELDS.md` ergaenzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_1.md` ergaenzt.
- `docs/current/README_CAN7_1_FILE_ZIP.md` ergaenzt.
- Projekt-State-Dateien auf CAN-7.1 aktualisiert.

## Nicht geaendert

- Keine neue API-Route.
- Keine POST-/Command-Route.
- Keine Dashboard-Datei.
- Keine Overlay-Datei.
- Keine Config-Datei.
- Keine DB-Datei.
- Keine Recovery-Ausfuehrung.
- Keine Recovery-Buttons oder Simulation-Buttons.
- Keine produktive Flow-Aenderung.

## Test

~~~cmd
node -c backend\modulesus_diagnostics.js
~~~

## Naechster Block

- CAN-7.2: `recoveryReadiness` im bestehenden Bus-Diagnostics-Dashboard read-only anzeigen.

---

# CHANGELOG – CAN-7.0 Echte Datei-Pruefung und Readiness-Grenze

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN7_0_REAL_FILE_INSPECTION_READINESS_BOUNDARY.md` ergaenzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN7_0.md` ergaenzt.
- `project-state/CURRENT_STATUS.md` um CAN-7.0 Stand ergaenzt.
- `project-state/NEXT_STEPS.md` um CAN-7.1 Startgrenze ergaenzt.
- `project-state/TODO.md` um CAN-7.1 Aufgaben ergaenzt.
- `project-state/FILES.md` um CAN-7.0/CAN-7.1 Dateien ergaenzt.

## Geprüft

- `backend/modules/bus_diagnostics.js`
- `backend/modules/communication_bus.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `htdocs/dashboard/modules/bus_diagnostics.js`

## Nicht geändert

- Keine Backend-Datei geaendert.
- Keine API-Route geaendert.
- Keine Dashboard-Datei geaendert.
- Keine Overlay-Datei geaendert.
- Keine Config-Datei geaendert.
- Keine Datenbank geaendert.
- Keine Recovery-Automatik aktiviert.
- Keine produktiven Flows geaendert.

## Nächster Block

- CAN-7.1: `bus_diagnostics.js` um additive read-only `recoveryReadiness`-Felder erweitern.

---

# CHANGELOG – CAN-6.10 Recovery-Planungsabschluss

Stand: 2026-06-01

## Geaendert

- `docs/system-inspection/EVENTBUS_CAN6_10_RECOVERY_PLANNING_CLOSURE_CAN7_START_GATE.md` ergaenzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_10.md` ergaenzt.
- `docs/current/README_CAN6_10_FILE_ZIP.md` ergaenzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.10 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` auf CAN-7.0 Startgrenze aktualisiert.
- `project-state/TODO.md` um CAN-6.x Abschluss und CAN-7.0 offene Punkte erweitert.
- `project-state/FILES.md` um CAN-6.10 und CAN-7.0-Pruefdateien erweitert.

## Nicht geaendert

- Keine Backend-Dateien geaendert.
- Keine API-Routen geaendert.
- Keine Dashboard-Dateien geaendert.
- Keine Overlay-Dateien geaendert.
- Keine Config-Dateien geaendert.
- Keine DB-Dateien geaendert.
- Keine produktiven Flows geaendert.
- Keine Recovery-Buttons oder Simulation-Buttons ergaenzt.

## Naechster Block

- CAN-7.0: Echte Dateien pruefen und read-only Recovery-Readiness-Status vorbereiten.

---

# CHANGELOG – CAN-6.9 Recovery-Implementierungsreihenfolge und Code-Grenzen

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_9_RECOVERY_IMPLEMENTATION_SEQUENCE_GATES.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_9.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.9 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.10 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.9/CAN-6.10 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.9 Dateien erweitert.

## Definiert

- Verbindliche Implementierungsreihenfolge.
- Phase 0: echte Dateien pruefen.
- Phase 1: read-only Backend-Diagnose.
- Phase 2: read-only Statusroute.
- Phase 3: Dashboard nur Anzeige.
- Phase 4: Preflight nur nach separatem Go.
- Phase 5: Command-Konzept bleibt gesperrt.
- Harte Gates vor jedem Code-Step.
- Testregeln fuer den ersten spaeteren Code-Step.
- CAN-7.0 Startgrenze.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.10: CAN-6.x Abschlusscheck und Übergabe nach CAN-7.0 vorbereiten.

---

# CHANGELOG – CAN-6.8 Recovery-Safety-Stop- und Clear-Regelwerk

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_8.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.8 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.9 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.8/CAN-6.9 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.8 Dateien erweitert.

## Definiert

- Safety-Stop-Arten.
- Globale Stopps.
- Modulbezogene Stopps.
- Clear-/Review-/Rollback-Trennung.
- Low-Risk-Clear-Grenzen.
- Hart blockierte Clear-/Recovery-Aktionen.
- Dashboard-Hinweise ohne Aktion.
- Standardisierte Blockierungsgruende.
- Testregeln fuer spaetere Code-Steps.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.9: Recovery-Implementierungsreihenfolge und erste Code-Step-Grenzen planen.

---

# CHANGELOG – CAN-6.7 Recovery-Command-Audit-/State-Mapping

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_7.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.7 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.8 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.7/CAN-6.8 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.7 Dateien erweitert.

## Definiert

- Command-Zustaende fuer spaetere Recovery-Commands.
- Audit-Ereignisse pro Zustand.
- Mapping von Zustand zu Audit-Ereignis und Dashboard-Anzeige.
- Geplante Diagnose-State-Felder.
- Standardisierte Blockierungsgruende.
- Dashboard-Anzeige ohne Aktion.
- Rollback-/Clear-Hinweise ohne Automatik.
- Testregeln fuer spaetere Code-Steps.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.8: Recovery-Safety-Stop- und Clear-Regelwerk planen.

---

# CHANGELOG – CAN-6.6 Recovery-Ausfuehrungs-Command-Konzept

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_6.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.6 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.7 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.6/CAN-6.7 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.6 Dateien erweitert.

## Definiert

- Strikte Trennung von read-only Preflight und spaeterem Command.
- Geplante Command-Request- und Response-Felder.
- Guard-Reihenfolge fuer spaetere manuelle Ausfuehrung.
- Low-Risk-Aktionsgrenzen und weiterhin hart blockierte Aktionen.
- Idempotenz- und Duplikat-Sperren.
- Audit-Pflichtpunkte fuer Command-Versuche.
- Rollback-/Clear-Regeln.
- Safety-Stop-Regeln.
- Testregeln fuer einen spaeteren Code-Step.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.7: Recovery-Command-Audit-/State-Mapping planen.

---

# CHANGELOG – CAN-6.5 Dashboard-Preflight-Anzeige und UX-Regeln

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_5.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.5 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.6 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.5/CAN-6.6 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.5 Dateien erweitert.

## Definiert

- Sichtbare Preflight-Felder fuer eine spaetere Dashboard-Anzeige.
- Anzeigegruppen fuer Kopfbereich, Sicherheitsstatus, Rechte/Freigabe, Blockaden, Warnungen und Read-only-Hinweise.
- Status-Einstufungen: diagnose_only, blocked, warning, preflight_ok, not_available, unknown.
- Pflichttexte gegen Fehlbedienung.
- Verbotene UI-Elemente fuer CAN-6.5.
- Regeln fuer Bestätigungs-Code nur als Verfügbarkeitsstatus.
- CAN-6.1-Aktionen aus Dashboard-Sicht.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Datei geändert.
- Keine Recovery-Buttons ergänzt.
- Keine Simulation-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.6: Read-only Dashboard-Preflight-Anzeige als Code-Step planen.

---

# CHANGELOG – CAN-6.4 Read-only Recovery-Preflight-API-Konzept

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md` ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_4.md` ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.4 Abschlussstand erweitert.
- `project-state/NEXT_STEPS.md` um CAN-6.5 als nächsten Arbeitsblock erweitert.
- `project-state/TODO.md` um CAN-6.4/CAN-6.5 Aufgaben erweitert.
- `project-state/FILES.md` um CAN-6.4 Dateien erweitert.

## Definiert

- Konzept einer späteren read-only Recovery-Preflight-API.
- Request-/Response-Felder.
- Read-only Guard-Prüfungen.
- Blockierungs- und Warnungsgründe.
- Bestätigungs-Code-Verfügbarkeit im Preflight.
- Read-only-Garantie ohne Queue-/Lock-/Sound-/Alert-/Overlay-Mutation.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Route ergänzt.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln planen.

---

# CHANGELOG – CAN-6.3 Recovery-Audit- und Bestätigungs-Code-Konzept

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_3.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.3 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um CAN-6.4 als nächsten Arbeitsblock ergänzt.
- `project-state/TODO.md` um CAN-6.4 Preflight-Konzept-Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.3 relevante Dateien ergänzt.

## Bestätigter Stand

- CAN-6.3 definiert nur Audit- und Bestätigungs-Code-Konzept.
- Bestätigungs-Code ersetzen keine Guard-Pruefungen.
- Preflight ist nur Vorschau und darf nicht produktiv wirken.
- Keine produktive Recovery aktiviert.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine neuen Routen ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.
- Keine Code-Dateien geändert.

## Nächster Block

- CAN-6.4: Read-only Recovery-Preflight-API-Konzept planen.

---

# CHANGELOG – CAN-6.2 Backend-Schutzvertrag

Stand: 2026-06-01

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_2.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.2 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um CAN-6.3 als nächsten Arbeitsblock ergänzt.
- `project-state/TODO.md` um CAN-6.3 Audit-/Bestätigungs-Code-Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.2 relevante Dateien ergänzt.

## Bestätigter Stand

- CAN-6.2 definiert nur den Backend-Schutzvertrag.
- Guard-Kette definiert: Auth, Matrix, Confirm, State, Safety-Stop, Status, Duplicate, RateLimit, Audit, Rollback.
- Keine produktive Recovery aktiviert.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine neuen Routen ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.3: Recovery-Audit- und Bestätigungs-Code-Konzept planen.

---

# CHANGELOG – CAN-6.1 Manuelle Recovery-Aktionsmatrix

Stand: 2026-06-01
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

## Geändert

- `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md` neu ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_1.md` neu ergänzt.
- `project-state/CURRENT_STATUS.md` um CAN-6.1 Abschluss-/Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` auf nächsten Arbeitsblock CAN-6.2 aktualisiert.
- `project-state/TODO.md` CAN-6.1 Aufgaben abgeschlossen und CAN-6.2 Aufgaben ergänzt.
- `project-state/FILES.md` um CAN-6.1 Dateien ergänzt.

## Bestätigter Stand

- CAN-6.1 ist reine Planung/Dokumentation.
- Die manuelle Recovery-Aktionsmatrix ist definiert.
- Es wurden keine produktiven Flows freigeschaltet.
- Das Dashboard bleibt read-only.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.
- Keine Code-Dateien geändert.

## Nächster Block

- CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen.

---

# CHANGELOG – CAN-6.0 Dokumentationsabschluss

Stand: 2026-06-01

## Geändert

- `project-state/CURRENT_STATUS.md` um konsolidierten CAN-6.0 Übergabestand ergänzt.
- `project-state/NEXT_STEPS.md` um nächsten Arbeitsblock CAN-6.1 ergänzt.
- `TODO.md` um offene CAN-6.1 Aufgaben ergänzt.
- `FILES.md` um relevante CAN-5/CAN-6 Diagnose- und Dashboard-Dateien ergänzt.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN6_0.md` als Übergabedatei für den nächsten Chat ergänzt.

## Bestätigter Stand

- CAN-5.5 bis CAN-5.10 bilden einen stabilen read-only Diagnose-Stand.
- CAN-6.0 ist reine Planung für später mögliche manuelle Recovery.
- Es wurden keine produktiven Flows freigeschaltet.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Logik geändert.
- Keine Dashboard-Buttons ergänzt.
- Keine Recovery-Automatik aktiviert.
- Keine Queue-/Sound-/Overlay-Logik geändert.
- Keine DB-/Config-Migration.

## Nächster Block

- CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren.

---

# CHANGELOG – STEP278 Vorbereitung

Stand: 2026-05-31 08:14 UTC

## Geändert

- `clip_system.json` für heutigen Test angepasst:
  - `clipShoutout.officialShoutout.enabled = true`
  - `clipShoutout.officialShoutout.liveGateEnabled = false`

## Nicht geändert

- Keine Script-Dateien geändert.
- Kein Overlay-Design geändert.
- Keine Datenbank geändert.
- Keine Queue gelöscht.
- Keine Funktionalität entfernt.

## Grund

Die Official-Queue blieb auf `waiting_stream_live_offline`, obwohl Shoutouts während des Streams beobachtet werden sollen. Für den heutigen Test wird die interne Live-Gate-Sperre deaktiviert. Twitch selbst kann weiterhin ablehnen, wenn ein offizieller Shoutout nicht erlaubt ist.

## Beobachtung

Nach der Änderung zeigte der Status:

- `officialQueue.liveGate.enabled = false`
- `officialQueue.pending = 10`
- `officialShoutout.globalCooldownMs = 120000`
- `officialShoutout.targetCooldownMs = 3600000`
- `state.officialShoutout.lastBusEvent.action = shoutout.official.waiting_cooldown`

---

# CHANGELOG – CAN-8.0 Recovery-Preflight Startgrenze

Stand: 2026-06-01

## Geaendert

- CAN-8.0 als reine Startgrenze fuer spaetere Recovery-Preflight-Arbeiten dokumentiert.
- CAN-8.1-Grenze definiert: maximal read-only Preflight-Datenmodell, keine Ausfuehrung.
- Projekt-State auf naechsten Schritt CAN-8.1 aktualisiert.

## Nicht geaendert

- Keine Backend-Datei geaendert.
- Keine Dashboard-Datei geaendert.
- Keine API-Route ergaenzt.
- Keine Config geaendert.
- Keine DB geaendert.
- Keine Recovery-Ausfuehrung aktiviert.
- Keine produktive Flow-Aenderung.
