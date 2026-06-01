## STEP CAN-7.5 Recovery-Tab UX Live-Test und Abnahme

Stand: 2026-06-01
Marker: STEP_CAN7_5_RECOVERY_TAB_UX_LIVE_TEST_ACCEPTANCE

CAN-7.5 dokumentiert die Live-Abnahme des in CAN-7.4 aufgeraeumten Recovery-Tabs.

Geprueft werden sollen:

```text
Untertabs sichtbar
Recovery-Readiness weiterhin sichtbar
Sicherheitsflags weiterhin read-only
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
```

Details: `docs/system-inspection/EVENTBUS_CAN7_5_RECOVERY_TAB_UX_LIVE_TEST_ACCEPTANCE.md`

## STEP CAN-7.4 Recovery-Tab UX-Cleanup mit internen Untertabs

Stand: 2026-06-01
Marker: STEP_CAN7_4_RECOVERY_TAB_UX_CLEANUP_SUBTABS

CAN-7.4 räumt den bestehenden Recovery-Tab im Bus-Diagnostics-Dashboard auf.

Geändert:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Ergebnis:

```text
Recovery-Tab hat interne Untertabs:
- Übersicht
- Details
- Readiness
- Sperren & Simulation
```

Nicht geändert:

```text
Keine Backend-Aenderung
Keine API-Aenderung
Keine neue Route
Keine Recovery-Ausfuehrung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
```

Nächster Schritt:

```text
CAN-7.5: Recovery-Tab UX live testen und abnehmen.
```

Details: `docs/system-inspection/EVENTBUS_CAN7_4_RECOVERY_TAB_UX_CLEANUP_SUBTABS.md`

## STEP CAN-7.3 Dashboard Recovery-Readiness read-only Anzeige

Stand: 2026-06-01
Marker: STEP_CAN7_3_DASHBOARD_RECOVERY_READINESS_READONLY_DISPLAY

CAN-7.3 zeigt die mit CAN-7.1 eingefuehrten `recoveryReadiness`-Daten im bestehenden Bus-Diagnostics-Dashboard im Tab Recovery an.

Geaendert:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Nicht geaendert:

```text
Keine Backend-Aenderung
Keine API-Aenderung
Keine neue Route
Keine Recovery-Ausfuehrung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
```

Naechster Schritt:

```text
CAN-7.4: Dashboard-Anzeige live testen und abnehmen
```

Details: `docs/system-inspection/EVENTBUS_CAN7_3_DASHBOARD_RECOVERY_READINESS_READONLY_DISPLAY.md`

## STEP CAN-7.2.1 Recovery-Readiness Testfeld-Fix und Live-Abnahme

Stand: 2026-06-01
Marker: STEP_CAN7_2_1_RECOVERY_READINESS_TEST_FIELD_FIX

CAN-7.1 wurde live geprüft und abgenommen.

Bestätigt:

~~~text
bus_diagnostics version = 1.2.5
recoveryReadiness.status = ready
recoveryReadiness.canStartReadOnlyCode = True
recoveryReadiness.readOnly = True
recoveryReadiness.currentStep = CAN-7.1
recoveryReadiness.nextAllowedStep = CAN-7.2_read_only_dashboard_display_planning
~~~

Sicherheitsflags bestätigt:

~~~text
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

CAN-7.2.1 korrigiert nur die Doku-Testfelder aus CAN-7.2 und dokumentiert die Live-Abnahme.

Nicht geändert:

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
~~~

Nächster Schritt:

~~~text
CAN-7.3: Dashboard-Read-only-Anzeige von recoveryReadiness planen/umsetzen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN7_2_1_RECOVERY_READINESS_TEST_FIELD_FIX.md`

## STEP CAN-7.2 Recovery-Readiness Live-Test und Abnahmegrenze

Stand: 2026-06-01
Marker: STEP_CAN7_2_RECOVERY_READINESS_LIVE_TEST_ACCEPTANCE

CAN-7.2 dokumentiert die Abnahme der in CAN-7.1 ergänzten `recoveryReadiness`-Statusfelder.

~~~text
Nur Test-/Abnahmeplan
Keine Backend-Änderung
Keine Dashboard-Änderung
Keine neue API-Route
Keine produktive Flow-Änderung
~~~

Details: `docs/system-inspection/EVENTBUS_CAN7_2_RECOVERY_READINESS_LIVE_TEST_ACCEPTANCE.md`

## STEP CAN-7.1 Recovery-Readiness Statusfelder

Stand: 2026-06-01
Marker: STEP_CAN7_1_RECOVERY_READINESS_STATUS_FIELDS

CAN-7.1 setzt den ersten technischen read-only Backend-Step aus der CAN-7.0-Grenze um.

Geaendert:

~~~text
backend/modules/bus_diagnostics.js
~~~

Technische Aenderung:

~~~text
bus_diagnostics Version 1.2.5
Build STEP_CAN7_1
neues Statusfeld recoveryReadiness
nur additive read-only Diagnose
~~~

Nicht geaendert:

~~~text
Keine neue API-Route
Keine POST-/Command-Route
Keine Dashboard-Datei
Keine Overlay-Datei
Keine Config-Datei
Keine DB-Datei
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

Naechster sinnvoller Schritt:

~~~text
CAN-7.2: recoveryReadiness im Dashboard read-only anzeigen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN7_1_RECOVERY_READINESS_STATUS_FIELDS.md`

---

## STEP CAN-7.0 Echte Dateien geprüft und Recovery-Readiness-Grenze dokumentiert

Stand: 2026-06-01
Marker: STEP_CAN7_0_REAL_FILE_INSPECTION_READINESS_BOUNDARY

CAN-7.0 hat die echten relevanten Dateien aus GitHub/dev geprueft und die erste erlaubte technische Grenze fuer CAN-7.1 definiert.

Geprueft:

~~~text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
~~~

Festgestellt:

~~~text
bus_diagnostics.js: Version 1.2.4, read-only Diagnose
communication_bus.js: Version 0.8.3, ersetzt keine produktiven Alert/Sound-Flows
alert_system.js: Version 3.1.9, additive read-only visual delivery diagnostics
sound_system.js: Version 0.1.20, dry_run Command-Pfad ohne Queue-/Audio-Beruehrung
Dashboard Recovery-Tab: Anzeige, keine Aktion
~~~

Naechste erlaubte Grenze:

~~~text
CAN-7.1: Nur backend/modules/bus_diagnostics.js.
Nur additive read-only recoveryReadiness-Felder.
Keine produktive Aktion.
Keine Buttons.
Keine DB-/Config-Migration.
~~~

Weiterhin nicht aktiv:

~~~text
Keine Backend-Aenderung in CAN-7.0
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

Details: `docs/system-inspection/EVENTBUS_CAN7_0_REAL_FILE_INSPECTION_READINESS_BOUNDARY.md`

## STEP CAN-6.10 Recovery-Planungsabschluss und CAN-7.0 Startgrenze

Stand: 2026-06-01
Marker: STEP_CAN6_10_RECOVERY_PLANNING_CLOSURE_CAN7_START_GATE

CAN-6.x wurde als reine Planungs- und Sicherheitsreihe abgeschlossen.

Zusammenfassung:

~~~text
CAN-6.1 bis CAN-6.9 definieren Aktionsmatrix, Guards, Audit, Preflight, Dashboard-UX, Command-Konzept, State-Mapping, Safety-Stop/Clear und Implementierungs-Gates.
CAN-6.10 definiert die Abschlussgrenze und den erlaubten Startbereich fuer CAN-7.0.
~~~

Weiterhin nicht aktiv:

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

Naechster sinnvoller Schritt:

~~~text
CAN-7.0: Echte Dateien pruefen und read-only Recovery-Readiness-Status vorbereiten
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_10_RECOVERY_PLANNING_CLOSURE_CAN7_START_GATE.md`

## Abschluss-/Übergabestand CAN-6.9

Stand: 2026-06-01
Marker: STEP_CAN6_9_RECOVERY_IMPLEMENTATION_SEQUENCE_GATES

CAN-6.9 definiert die verbindliche Implementierungsreihenfolge und die harten Code-Grenzen fuer spaetere manuelle Recovery-Arbeiten.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
Dashboard-Preflight-Anzeige und UX-Regeln
Recovery-Ausfuehrungs-Command-Konzept
Recovery-Command-Audit-/State-Mapping
Recovery-Safety-Stop- und Clear-Regelwerk
Recovery-Implementierungsreihenfolge und Code-Grenzen
~~~

Definiert wurde:

~~~text
verbindliche Implementierungsreihenfolge
Phase 0 echte Dateien pruefen
Phase 1 read-only Backend-Diagnose
Phase 2 read-only Statusroute
Phase 3 Dashboard nur Anzeige
Phase 4 Preflight nur nach separatem Go
Phase 5 Command-Konzept bleibt gesperrt
harte Gates vor jedem Code-Step
Testregeln fuer den ersten spaeteren Code-Step
CAN-7.0 Startgrenze
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine Dashboard-Code-Änderung
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.10: CAN-6.x Abschlusscheck und Übergabe nach CAN-7.0 vorbereiten
~~~

Details/Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_9.md`

## Abschluss-/Übergabestand CAN-6.8

Stand: 2026-06-01
Marker: STEP_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET

CAN-6.8 definiert das Regelwerk fuer Safety-Stop, Modul-Stop, Clear, Review und Rollback-Hinweise im spaeteren manuellen Recovery-Kontext.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
Dashboard-Preflight-Anzeige und UX-Regeln
Recovery-Ausfuehrungs-Command-Konzept
Recovery-Command-Audit-/State-Mapping
Recovery-Safety-Stop- und Clear-Regelwerk
~~~

Definiert wurde:

~~~text
Safety-Stop-Arten
Globale Stopps
Modulbezogene Stopps
Clear-/Review-/Rollback-Trennung
Low-Risk-Clear-Grenzen
hart blockierte Clear-/Recovery-Aktionen
Dashboard-Hinweise ohne Aktion
standardisierte Blockierungsgruende
Testregeln fuer spaetere Code-Steps
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine Dashboard-Code-Änderung
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.9: Recovery-Implementierungsreihenfolge und erste Code-Step-Grenzen planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_8.md`

## Abschluss-/Übergabestand CAN-6.7

Stand: 2026-06-01
Marker: STEP_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING

CAN-6.7 definiert das Mapping fuer spaetere Recovery-Command-Zustaende, Audit-Ereignisse, Diagnose-State-Felder und Dashboard-Anzeige.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
Dashboard-Preflight-Anzeige und UX-Regeln
Recovery-Ausfuehrungs-Command-Konzept
Recovery-Command-Audit-/State-Mapping
~~~

Definiert wurde:

~~~text
Command-Zustaende
Audit-Ereignisse pro Zustand
Mapping Zustand -> Audit -> Anzeige
geplante State-Felder
standardisierte Blockierungsgruende
Dashboard-Anzeige ohne Aktion
Rollback-/Clear-Hinweise ohne Automatik
Testregeln fuer spaetere Code-Steps
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine Dashboard-Code-Änderung
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.8: Recovery-Safety-Stop- und Clear-Regelwerk planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_7.md`

## Abschluss-/Übergabestand CAN-6.6

Stand: 2026-06-01
Marker: STEP_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT

CAN-6.6 definiert das Konzept fuer einen spaeteren manuellen Recovery-Ausfuehrungs-Command.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
Dashboard-Preflight-Anzeige und UX-Regeln
Recovery-Ausfuehrungs-Command-Konzept
~~~

Definiert wurde:

~~~text
strikte Trennung von Preflight und Command
Command-Request-Felder
Command-Response-Felder
Guard-Reihenfolge fuer spaetere Ausfuehrung
Low-Risk-Aktionsgrenzen
hart blockierte Aktionen
Idempotenz und Duplikat-Sperre
Audit-Pflichtpunkte
Rollback-/Clear-Regeln
Safety-Stop-Regeln
Testregeln fuer spaeteren Code-Step
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine Dashboard-Code-Änderung
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.7: Recovery-Command-Audit-/State-Mapping planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_6.md`

## Abschluss-/Übergabestand CAN-6.5

Stand: 2026-06-01
Marker: STEP_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT

CAN-6.5 definiert das Konzept fuer eine spaetere read-only Dashboard-Anzeige von Recovery-Preflight-Daten.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
Dashboard-Preflight-Anzeige und UX-Regeln
~~~

Definiert wurde:

~~~text
sichtbare Preflight-Felder
Dashboard-Anzeigegruppen
Status-Einstufungen
Pflichttexte gegen Fehlbedienung
verbotene UI-Elemente
Rollen-/Rechte-Hinweise
Bestätigungs-Code nur als Verfügbarkeitsstatus
Dashboard-Datenmodell als Konzept
CAN-6.1-Aktionen aus Dashboard-Sicht
Testregeln fuer spaeteren Code-Step
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine Dashboard-Code-Änderung
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.6: Read-only Dashboard-Preflight-Anzeige als Code-Step planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_5.md`

## Abschluss-/Übergabestand CAN-6.4

Stand: 2026-06-01
Marker: STEP_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT

CAN-6.4 definiert das Konzept fuer eine spaetere read-only Recovery-Preflight-API.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
Read-only Recovery-Preflight-API-Konzept
~~~

Definiert wurde:

~~~text
spätere Preflight-Route nur als Konzept
Request-Felder
Response-Felder
read-only Guard-Prüfungen
Blockierungsgründe
Warnungsgründe
Bestätigungs-Code-Verfügbarkeit im Preflight
Read-only-Garantie
Dashboard-Anzeigefelder
Preflight-Einstufung der CAN-6.1-Aktionen
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_4.md`

## Abschluss-/Übergabestand CAN-6.3

Stand: 2026-06-01
Marker: STEP_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT

CAN-6.3 definiert das Recovery-Audit- und Bestätigungs-Code-Konzept fuer spaetere manuelle Recovery-Aktionen.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
Audit- und Bestätigungs-Code-Konzept
~~~

Definiert wurde:

~~~text
Audit-Eventtypen
Audit-Pflichtfelder
Bestätigungs-Code-Lebenszyklus
Bestätigungs-Code-Bindung an User/Rolle/Aktion/IDs
Preflight-Antwortfelder
Bestätigungs-Code-Wiederverwendungsschutz
blockierende Audit-Fehler
konzeptionelle Storage-/DB-Struktur
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.4: Read-only Recovery-Preflight-API-Konzept planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_3.md`

## Abschluss-/Übergabestand CAN-6.2

Stand: 2026-06-01
Marker: STEP_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT

CAN-6.2 definiert den Backend-Schutzvertrag fuer spaetere manuelle Recovery-Aktionen.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Manuelle Recovery-Aktionsmatrix
Backend-Schutzvertrag fuer spaetere Recovery-Aktionen
~~~

Definierte Schutzschichten:

~~~text
AuthGuard
ActionMatrixGuard
ConfirmGuard
RecoveryStateGuard
SafetyStopGuard
StatusGuard
DuplicateGuard
RateLimitGuard
AuditGuard
RollbackGuard
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine neuen Routen
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.3: Recovery-Audit- und Bestätigungs-Code-Konzept planen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md`
Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_2.md`

## Abschluss-/Übergabestand CAN-6.1

Stand: 2026-06-01
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

Der aktuelle Dokumentationsstand wurde nach CAN-6.1 erweitert.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Recovery-Simulation-Harness
Bus-Diagnostics-Dashboard Recovery-Tab
Manuelle Recovery-Aktionsmatrix
~~~

Stabiler Stand:

~~~text
CAN-5.5 bis CAN-5.10: read-only Diagnose stabil
CAN-6.0: manuelle Recovery nur geplant, nicht umgesetzt
CAN-6.1: manuelle Recovery-Aktionsmatrix definiert, keine Umsetzung
~~~

CAN-6.1 definiert:

~~~text
Zustand
Aktionsklasse
spaeter eventuell manuell erlaubte Aktion
hart blockierte Aktion
Berechtigung
Audit-Log
Duplikat-Sperre
Safety-Stop
Rollback-/Clear-Regel
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

Nächster Schritt:

~~~text
CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen
~~~

Details/Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_1.md`
Details/Matrix: `docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md`


## Abschluss-/Übergabestand CAN-6.0

Stand: 2026-06-01
Marker: STEP_CAN6_0_DOCUMENTATION_CONSOLIDATED

Der aktuelle Dokumentationsstand wurde nach CAN-6.0 konsolidiert.

Aktueller Fokus:

~~~text
Communication-Bus / EventBus Diagnose
Recovery-Strategy-State
Recovery-Simulation-Harness
Bus-Diagnostics-Dashboard Recovery-Tab
Manuelle Recovery-Planung
~~~

Stabiler Stand:

~~~text
CAN-5.5 bis CAN-5.10: read-only Diagnose stabil
CAN-6.0: manuelle Recovery nur geplant, nicht umgesetzt
~~~

Weiterhin nicht aktiv:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

Nächster Schritt:

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

Details/Übergabe: `docs/current/CURRENT_CHAT_HANDOFF_CAN6_0.md`


## STEP CAN-6.0 Manuelle Recovery-Planung

Stand: 2026-06-01
Marker: STEP_CAN6_0_MANUAL_RECOVERY_PLANNING

CAN-6.0 plant den Wechsel von reiner read-only Diagnose zu einer später möglichen, abgesicherten manuellen Recovery.

Wichtig: CAN-6.0 ist nur Planung und Sicherheitskonzept.

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Dashboard-Code-Änderung
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Weiterhin blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

Pflicht vor späteren manuellen Aktionen:

~~~text
Owner/Admin-Rechte
Bestätigungsdialog
Audit-Log
Duplikat-Sperre
Safety-Stop
Rollback-/Clear-Regel
~~~

Details: `docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md`

## STEP CAN-5.10 Recovery-Dashboard stabil dokumentiert

Stand: 2026-06-01
Marker: STEP_CAN5_10_RECOVERY_DASHBOARD_STABLE

CAN-5.10 dokumentiert den stabilen Abnahmestand des Recovery-Tabs im Bus-Diagnostics-Dashboard.

~~~text
Recovery-Strategie sichtbar
Sicherheitsstatus sichtbar
Recovery-Quelle lesbar
Blockierte Aktionen sichtbar
Erlaubte Aktionen sichtbar
Gründe sichtbar
Simulation-Harness sichtbar
Read-only-Hinweise sichtbar
~~~

Bestätigt bleibt:

~~~text
Keine Simulation-Buttons sichtbar
Keine Simulation per Dashboard auslösbar
Keine Recovery-Automatik sichtbar
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

CAN-5.10 ist nur Dokumentation/Stable-Status.

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Dashboard-Code-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_10_RECOVERY_DASHBOARD_STABLE.md`

## STEP CAN-5.9.3 Recovery-Dashboard aufgeräumtes Layout

Stand: 2026-06-01
Marker: STEP_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT

CAN-5.9.3 räumt nur die Darstellung im Recovery-Tab des Bus-Diagnostics-Dashboards auf.

~~~text
Recovery-Quelle kompakter als Zeilenliste
lange State-Werte ohne harten Wortumbruch
Tooltip mit vollständigem Wert
Blockierte Aktionen / Erlaubte Aktionen / Gründe bleiben sichtbar
Simulation-Harness bleibt read-only sichtbar
~~~

Nicht geändert:

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT.md`

## STEP CAN-5.9.2 Recovery-Dashboard kompakter Layout-Fix

Stand: 2026-06-01
Marker: STEP_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT

Die Recovery-Ansicht im Bus-Diagnostics-Dashboard wurde optisch kompakter gemacht.

~~~text
Recovery-Quelle als kompakte Kachelgruppe
Blockierte Aktionen, erlaubte Aktionen und Gründe bleiben sichtbar
Simulation-Harness bleibt read-only sichtbar
Keine Test-Buttons
Keine Recovery-Automatik
~~~

Nicht geändert:

~~~text
Keine Backend-Änderung
Keine produktive Flow-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT.md`

## STEP CAN-5.9.1 Recovery-Dashboard Layout-Fix

Stand: 2026-06-01
Marker: STEP_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX

CAN-5.9.1 verbessert die Lesbarkeit des Recovery-Tabs, ohne produktive Logik zu ändern.

~~~text
Dashboard-Datei: htdocs/dashboard/modules/bus_diagnostics.js
Recovery-Quelle breiter/als Liste dargestellt
lange State-Werte besser lesbar
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX.md`

## STEP CAN-5.9 Recovery-Diagnose im Dashboard read-only sichtbar

Stand: 2026-06-01
Marker: STEP_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY

CAN-5.9 ergänzt im bestehenden Bus-Diagnostics-Dashboard einen read-only Recovery-Tab.

~~~text
Dashboard-Datei: htdocs/dashboard/modules/bus_diagnostics.js
Tab: Recovery
Nur Anzeige-Logik
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Angezeigt werden Recovery-Strategy-State, Gründe, blockierte Aktionen, Quellwerte und Sicherheitsflags.

Details: `docs/system-inspection/EVENTBUS_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY.md`

## STEP CAN-5.8 Recovery-Diagnose Dashboard-Plan

Stand: 2026-06-01
Marker: STEP_CAN5_8_RECOVERY_DASHBOARD_PLAN

CAN-5.8 plant die spätere read-only Anzeige der Recovery-Diagnose im bestehenden Bus-Diagnostics-Dashboard.

~~~text
Nur read-only anzeigen
Keine Simulation per Dashboard auslösen
Keine automatische Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

Geplante Anzeige:

~~~text
recoveryStrategyState.mode
recoveryStrategyState.state
recoveryStrategyState.severity
recoveryStrategyState.nextAction
recoveryStrategyState.reasons
recoveryStrategyState.blockedActions
automationEnabled
productiveActions
flowTouched / queueTouched / soundSystemTouched / alertSystemTouched / overlayTouched
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_8_RECOVERY_DASHBOARD_PLAN.md`

## STEP CAN-5.7 Simulation-Harness Live-Test stabil bestätigt

Stand: 2026-06-01
Marker: STEP_CAN5_7_SIMULATION_HARNESS_LIVE_TEST_STABLE

CAN-5.6 wurde live mit dem CAN-5.5 read-only Recovery-Simulation-Harness geprüft.

