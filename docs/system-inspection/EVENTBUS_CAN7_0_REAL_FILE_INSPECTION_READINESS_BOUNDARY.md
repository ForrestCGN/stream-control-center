# EVENTBUS CAN-7.0 REAL FILE INSPECTION / READ-ONLY RECOVERY-READINESS BOUNDARY

Stand: 2026-06-01
Status: Doku / echte Datei-Pruefung / noch keine Umsetzung

## Ziel

CAN-7.0 startet nach dem abgeschlossenen CAN-6.x Planungsblock.

Dieser Step prueft die echten relevanten Dateien aus GitHub/dev und definiert die erste technische Umsetzungsgrenze fuer CAN-7.1.

CAN-7.0 ist weiterhin kein produktiver Code-Step.

## Gepruefte Dateien

~~~text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
~~~

Noch nicht fuer Code-Aenderung gelesen, aber fuer CAN-7.x weiter relevant:

~~~text
htdocs/overlays/_overlay-alerts-v2.html
htdocs/overlays/sound_system_overlay.html
config/alert_system.json
config/sound_system.json
~~~

## Festgestellter Iststand

### bus_diagnostics.js

~~~text
Modul: bus_diagnostics
Version: 1.2.4
Status-API-Version: 1.0.0
Modus: read-only Diagnose
Bestehende Routen:
- /api/bus-diagnostics/status
- /api/bus-diagnostics/check
- /api/bus-diagnostics/routes
- /api/bus-diagnostics/recovery-simulation/status
- /api/bus-diagnostics/recovery-simulation/test
~~~

Wichtige Grenze:

~~~text
buildStatus() setzt weiterhin:
readOnly = true
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
vipSystemTouched = false
overlayTouched = false
~~~

Der bestehende Recovery-Strategy-State ist bereits read-only und blockiert produktive Wiederholungs-/Retry-Aktionen.

Aktuell blockierte Aktionen im echten Code:

~~~text
auto_replay_alert
auto_replay_sound
auto_retry_overlay
auto_recovery
~~~

CAN-7.x darf daran nichts lockern.

### communication_bus.js

~~~text
Modul: communication_bus
Version: 0.8.3
Build: STEP278
Core: communication_core 0.3.0
~~~

Wichtige Grenze aus dem Dateikopf:

~~~text
Der Communication Bus migriert keine Alert-/Sound-/TTS-/VIP-Traffic-Flows.
Er ersetzt server.js broadcastWS nicht.
~~~

Bestehende Settings-/Status-Struktur:

~~~text
/api/communication/status
/api/communication/settings
/api/event-bus/settings
~~~

Bestehende Test-/Mirror-/Replay-/Watchdog-Faehigkeiten bleiben fuer Recovery-Arbeiten gefaehrlich und duerfen nicht als CAN-7.1 Startpunkt verwendet werden.

### alert_system.js

~~~text
Modul: alert_system
Version: 3.1.9
Schema-Version: 6
Step: 365
Capability: alert.event_output
Status-API-Version: 1.0.0
~~~

Wichtige Grenze:

~~~text
Alert-System enthaelt Queue, Overlay-Clients, Alert-Output, Sound-Korrelation und Watchdog.
Aktueller Note-Text: additive read-only visual delivery state diagnostics; runtime flow unchanged.
~~~

CAN-7.1 darf hier zunaechst nichts aendern.

### sound_system.js

~~~text
Modul: sound_system
Version: 0.1.20
Capability: sound.event_output
Command-Capability: sound.command_input
Status-API-Version: 1.0.0
Command-API-Version: 1.0.0
~~~

Wichtige Grenze:

~~~text
soundBusCommand ist im echten Code als dry_run angelegt.
allowQueueTouch = false
allowAudioTouch = false
~~~

CAN-7.1 darf Sound-System und Queue nicht beruehren.

### dashboard bus_diagnostics.js

~~~text
Dashboard-Modul: BusDiagnosticsModule
Recovery-Tab vorhanden
Aktive Tabs: Übersicht, Clients, Events & ACKs, Integrationen, Recovery, Issues, Config, Rohdaten
Statusquelle: /api/bus-diagnostics/status bzw. /api/bus-diagnostics/check
~~~

Der Recovery-Tab rendert aktuelle Recovery-State-, Sicherheits-, Quellen-, allowedActions-, blockedActions- und reason-Daten.

CAN-7.1 darf zunaechst keinen Button und keine Aktion ergaenzen.

## CAN-7.1 erlaubte erste technische Grenze

Erlaubt als naechster Schritt:

~~~text
Nur backend/modules/bus_diagnostics.js erweitern.
Nur additive read-only Felder.
Keine neue produktive Aktion.
Keine Command-Route.
Keine Recovery-Ausfuehrung.
Keine Dashboard-Buttons.
Keine Alert-/Sound-/Overlay-/Queue-Beruehrung.
~~~

Sinnvoller CAN-7.1 Inhalt:

~~~text
recoveryReadiness:
  schemaVersion
  phase
  readOnly
  automationEnabled
  productiveActions
  codeBoundary
  inspectedModules
  requiredGuards
  blockedActions
  allowedNextSteps
  missingPrerequisites
  safetyFlags
~~~

Wichtig: Diese Felder duerfen nur Diagnose-/Planungsstatus liefern und keine Entscheidung produktiv ausfuehren.

## CAN-7.1 nicht erlaubt

~~~text
Keine POST-Route
Keine Command-Route
Keine Preflight-Ausfuehrung
Keine Bestätigungs-Code-Erstellung
Keine Recovery-Aktion
Kein Alert-Replay
Kein Sound-Replay
Kein Overlay-Retry
Kein Queue-Unlock
Kein Safety-Stop-Schalter
Keine DB-Migration
Keine Config-Migration
Keine Dashboard-Aktionsbuttons
~~~

## Tests fuer CAN-7.1

Wenn CAN-7.1 spaeter umgesetzt wird, dann mindestens:

~~~powershell
node -c backend\modules\bus_diagnostics.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched

$s.recoveryReadiness | ConvertTo-Json -Depth 8
$s.recoveryStrategyState | Select-Object mode,state,severity,readOnly,automationEnabled
~~~

Pflicht-Erwartung:

~~~text
readOnly = true
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
recoveryReadiness.automationEnabled = false
recoveryReadiness.productiveActions = false
~~~

## Nicht geaendert

~~~text
Keine Backend-Datei geaendert
Keine API-Route geaendert
Keine Dashboard-Datei geaendert
Keine Overlay-Datei geaendert
Keine Config-Datei geaendert
Keine DB geaendert
Keine produktiven Flows geaendert
Keine Recovery-Buttons
Keine Simulation-Buttons
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-7.1: bus_diagnostics.js um additive read-only recoveryReadiness-Felder erweitern
~~~

Vor CAN-7.1 erneut:

~~~text
Ziel nennen
betroffene Datei nennen
geplante Aenderung nennen
nicht geaenderte Bereiche nennen
Tests nennen
auf Go warten
~~~
