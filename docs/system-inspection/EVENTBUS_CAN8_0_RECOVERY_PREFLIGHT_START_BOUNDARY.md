# EVENTBUS CAN-8.0 RECOVERY PREFLIGHT STARTGRENZE

Stand: 2026-06-01
Status: Planung / Startgrenze / keine Umsetzung

## Ausgangslage

CAN-7.x ist abgeschlossen:

~~~text
CAN-7.1: recoveryReadiness read-only im Backend-Status aktiv
CAN-7.2 / 7.2.1: Live-Test und Testfeld-Korrektur dokumentiert
CAN-7.3: Recovery-Readiness read-only im Dashboard sichtbar
CAN-7.4: Recovery-Tab mit internen Untertabs aufgeraeumt
CAN-7.5: UX-Abnahme dokumentiert
CAN-7.6: Recovery-Dashboard-read-only abgeschlossen und CAN-8.0-Grenze definiert
~~~

Bestaetigter Sicherheitsstand:

~~~text
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Command-Route
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
Recovery-Dashboard bleibt read-only
~~~

## Ziel von CAN-8.0

CAN-8.0 startet noch keine technische Preflight-API.

Dieser Step legt nur fest, wie CAN-8.1 spaeter beginnen darf:

~~~text
read-only Preflight-Datenmodell pruefen
bestehende Recovery-Readiness-Daten weiterverwenden
keine produktive Aktion erlauben
keine Command-Route ergaenzen
keine Dashboard-Aktionsbuttons ergaenzen
keine DB-/Config-Migration
~~~

## Begriff: Preflight

Preflight bedeutet in CAN-8.x:

~~~text
Eine spaetere Diagnose prueft, ob eine manuelle Low-Risk-Aktion theoretisch vorbereitet werden duerfte.
Sie fuehrt nichts aus.
Sie schreibt nichts produktiv um.
Sie beruehrt keine Alert-/Sound-/Overlay-Queue.
Sie erstellt keine Wiederholung von Alerts oder Sounds.
~~~

## CAN-8.1 erlaubte Grenze

CAN-8.1 darf maximal eine weitere read-only Diagnoseebene vorbereiten.

Erlaubt:

~~~text
bestehende Recovery-Readiness aus /api/bus-diagnostics/status weiter auswerten
zusaetzliche read-only Preflight-Planfelder im bus_diagnostics-Kontext entwerfen
Statusfelder fuer Dashboard-Anzeige vorbereiten
Blockierungsgruende standardisieren
keine Ausfuehrung
~~~

Nicht erlaubt:

~~~text
POST-Route
Command-Route
Recovery-Ausfuehrung
Recovery-Button
Simulation-Button
Alert-Replay
Sound-Replay
Overlay-Retry
Auto-Recovery
Queue-Unlock
DB-Migration
Config-Migration
~~~

## Moegliche CAN-8.1 Felder

Nur als Planungsrahmen:

~~~text
preflightReadiness.enabled
preflightReadiness.mode = read_only
preflightReadiness.availableActions
preflightReadiness.blockedActions
preflightReadiness.requiredGuards
preflightReadiness.missingGuards
preflightReadiness.safety
preflightReadiness.reasons
preflightReadiness.nextAllowedStep
~~~

Wichtig: Diese Felder duerfen in CAN-8.1 nur angezeigt/diagnostiziert werden. Sie duerfen keine Ausfuehrung freischalten.

## Harte Sperren bleiben bestehen

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
~~~

## Pflicht vor jedem spaeteren Code-Step

Vor CAN-8.1 Code muss erneut geprueft werden:

~~~text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
~~~

Wenn GitHub/dev nicht vollstaendig reicht, muessen die echten Dateien angefordert werden.

## Tests fuer CAN-8.1

Nur wenn spaeter Code kommt:

~~~cmd
node -c backend\modules\bus_diagnostics.js
~~~

Status-Pruefung:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object module,version,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
~~~

Erwartung:

~~~text
readOnly = True
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Nicht geaendert

CAN-8.0 ist nur Planung/Doku.

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-8.1: Read-only Preflight-Datenmodell fuer bus_diagnostics planen oder vorbereiten
~~~
