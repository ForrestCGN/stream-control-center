# EVENTBUS CAN-9.1 RECOVERY PREFLIGHT ROUTE CONTRACT PLAN

Stand: 2026-06-01
Status: Plan / Sicherheitsvertrag / keine Umsetzung

## Ausgangslage

CAN-8.x hat den Recovery-Preflight-Strang als read-only Backend-/Dashboard-Anzeige abgeschlossen.

Stabil bestaetigt:

~~~text
recoveryPreflight.status = ready
recoveryPreflight.mode = read_only
recoveryPreflight.canPrepare = false
recoveryPreflight.canExecute = false
recoveryPreflight.checkSummary.total = 13
recoveryPreflight.checkSummary.ok = 13
recoveryPreflight.checkSummary.warnings = 0
recoveryPreflight.checkSummary.blocking = 0
recoveryPreflight.checkSummary.blocked = 0
~~~

CAN-9.0 hat nur die Startgrenze fuer eine spaetere read-only Preflight-Route definiert.

## Ziel von CAN-9.1

CAN-9.1 legt den Vertrag fuer eine spaetere read-only GET-Route fest.

Es wird noch nichts technisch umgesetzt.

## Spaetere erlaubte Route

Die spaetere Route darf maximal so aussehen:

~~~text
GET /api/bus-diagnostics/recovery-preflight
~~~

Zweck:

~~~text
Nur den bereits vorhandenen recoveryPreflight-Status gezielt ausgeben.
Keine Berechnung mit Seiteneffekt.
Keine Statusaenderung.
Keine Queue-/Sound-/Alert-/Overlay-Beruehrung.
Keine Recovery-Ausfuehrung.
~~~

## Verbotene Routen

Weiterhin nicht erlaubt:

~~~text
POST /api/bus-diagnostics/recovery-preflight
POST /api/bus-diagnostics/recovery-preflight/prepare
POST /api/bus-diagnostics/recovery-preflight/execute
GET  /api/bus-diagnostics/recovery-preflight/execute
GET  /api/bus-diagnostics/recovery-preflight/replay
GET  /api/bus-diagnostics/recovery-preflight/retry
~~~

Auch nicht als Test-Route.

## Response-Vertrag

Die spaetere GET-Route muss mindestens liefern:

~~~text
ok
module
version
statusApiVersion
feature
mode
readOnly
flowTouched
queueTouched
soundSystemTouched
alertSystemTouched
overlayTouched
automationEnabled
productiveActions
recoveryPreflight
checkedAt
~~~

`recoveryPreflight` bleibt das bestehende Datenmodell aus CAN-8.9.

## recoveryPreflight Pflichtfelder

~~~text
status
mode
readOnly
canPrepare
canExecute
currentStep
nextAllowedStep
safety
scope
checks
checkSummary
hardBlockedActions
blockers
warnings
source
checkedAt
~~~

## Sicherheitsvertrag

Jede spaetere Route muss diese Flags hart setzen bzw. aus dem bestehenden Status uebernehmen:

~~~text
readOnly = true
mode = read_only
canPrepare = false
canExecute = false
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
~~~

Falls eines dieser Felder nicht sicher `false` bzw. `true` ist, muss die Route mit `ok=false` antworten und darf keine Aktion anbieten.

## Erlaubte Query-Parameter

CAN-9.1 plant fuer eine spaetere Route nur harmlose Anzeige-Parameter:

~~~text
raw=1       optional: vorhandene Rohdaten einblenden, falls bereits im Status vorhanden
baseUrl=... optional: wie bisher bei /status, nur fuer Diagnosefetch
~~~

Nicht erlaubt:

~~~text
action
execute
prepare
confirm
replay
retry
force
clear
unlock
~~~

## Dashboard-Grenze

Dashboard darf eine spaetere Route nur lesen.

Erlaubt:

~~~text
Status anzeigen
Checks anzeigen
Scope anzeigen
Blocker anzeigen
Warnungen anzeigen
hart blockierte Aktionen anzeigen
~~~

Nicht erlaubt:

~~~text
Prepare-Button
Execute-Button
Replay-Button
Retry-Button
Clear-Button
Unlock-Button
Simulation-Trigger
Recovery-Trigger
~~~

## Testgrenze fuer spaeteren CAN-9.2-Code-Step

Ein spaeterer Code-Step darf nur diese Tests verlangen:

~~~powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$p | Select-Object ok,module,version,feature,mode,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$p.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$p.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
~~~

Erwartung:

~~~text
readOnly = True
canPrepare = False
canExecute = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Nicht geaendert

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
CAN-9.2: Recovery-Preflight GET-Route minimal read-only planen oder umsetzen.
~~~

Vor CAN-9.2-Code muss die echte aktuelle Datei vollstaendig geprueft werden:

~~~text
backend/modules/bus_diagnostics.js
~~~
