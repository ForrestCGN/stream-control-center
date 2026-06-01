# EVENTBUS CAN-9.0 RECOVERY PREFLIGHT ROUTE START BOUNDARY

Stand: 2026-06-01
Status: Planung / Startgrenze / keine Umsetzung

## Zweck

CAN-9.0 startet den naechsten Arbeitsblock nach dem abgeschlossenen CAN-8.x read-only Preflight-Dashboard-Strang.

Dieser Step definiert ausschliesslich die Grenze fuer eine spaetere read-only Preflight-Route.

## Aktueller stabiler Stand

~~~text
CAN-7.x: Recovery-Readiness read-only im Backend und Dashboard sichtbar.
CAN-8.x: Recovery-Preflight read-only im Backend und Dashboard sichtbar.
CAN-8.9: Preflight-Check-Matrix im Backend aktiv.
CAN-8.11/CAN-8.12: Preflight-Check-Matrix im Dashboard sichtbar und abgenommen.
~~~

Live bestaetigter Zustand aus CAN-8.x:

~~~text
recoveryPreflight.status = ready
recoveryPreflight.canPrepare = false
recoveryPreflight.canExecute = false
checks total = 13
checks ok = 13
warnings = 0
blocking = 0
blocked = 0
~~~

## Ziel von CAN-9.x

CAN-9.x darf spaeter eine getrennte read-only Preflight-Route vorbereiten.

Wichtig: Diese Route darf noch keine Recovery ausfuehren.

## Erlaubte Richtung ab CAN-9.1

CAN-9.1 darf maximal planen oder vorbereiten:

~~~text
GET /api/bus-diagnostics/recovery-preflight/status
read-only Antwort
keine Statusveraenderung
keine Queue-Beruehrung
keine Sound-Beruehrung
keine Alert-Beruehrung
keine Overlay-Beruehrung
keine DB-Migration
keine Config-Aenderung
~~~

## Nicht erlaubt

Weiterhin blockiert:

~~~text
POST /api/.../recovery...
Command-Route
Execute-Route
Prepare-Route mit Statusaenderung
Bestaetigungs-Code-Erzeugung
Recovery-Ausfuehrung
Alert-Replay
Sound-Replay
Overlay-Retry
Auto-Recovery
manuelle Recovery-Ausfuehrung
Dashboard-Buttons fuer Recovery
Simulation-Buttons
~~~

## Route-Grenze

Eine spaetere read-only Preflight-Route darf nur Daten liefern, die bereits im bestehenden Status vorhanden oder daraus rein lesend ableitbar sind.

Sie darf nicht:

~~~text
Jobs anlegen
Locks schreiben
Audits schreiben
Bestaetigungs-Codes erzeugen
Queue-Eintraege veraendern
Sound/Alert/Overlay anstossen
Recovery-State veraendern
~~~

## Geplante Antwortstruktur fuer spaeter

~~~text
ok
module
version
feature = recovery_preflight_route
readOnly = true
mode = read_only
status
canPrepare = false
canExecute = false
safety
checks
checkSummary
scope
hardBlockedActions
blockers
warnings
source
checkedAt
~~~

## Pflicht-Safety-Felder

~~~text
readOnly = true
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
~~~

## CAN-9.1 Startgrenze

Naechster sinnvoller Schritt:

~~~text
CAN-9.1: Recovery-Preflight Route Datenmodell und Sicherheitsvertrag planen.
~~~

CAN-9.1 soll noch keinen produktiven Code aktivieren. Falls Code geplant wird, muss zuerst die echte aktuelle Datei `backend/modules/bus_diagnostics.js` geprueft werden.

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
