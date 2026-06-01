# EVENTBUS CAN-14.1 - Safety Status Contract read-only

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.1

## Zweck

Dieses Dokument definiert den read-only Safety Status Contract fuer eine spaetere Safety-Status-Anzeige.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Dashboard-Karte hinzu.
Es fuegt keine Dashboard-Buttons hinzu.
Es fuehrt keine Queue-, Sound-, Alert-, Overlay-, DB- oder Config-Mutation aus.
```

## Ausgangslage

CAN-13.6 hat die Sicherheitsplanung fuer spaetere manuelle Recovery abgeschlossen.

CAN-14.0 hat die Richtung fuer eine read-only Safety Status View geplant.

CAN-14.1 definiert jetzt den Contract: Feldnamen, Bedeutung, Datentypen und Anzeige-Logik.

## Grundregel

Der Safety Status Contract ist ein read-only Diagnosevertrag.

Er darf spaeter nur anzeigen:

```text
was sicher ist
was unbekannt ist
was geplant, aber nicht implementiert ist
was weiterhin blockiert ist
was gefaehrlich waere
```

Er darf nicht:

```text
SafetyStop setzen
SafetyStop clearen
Cancel ausloesen
Recovery vorbereiten
Recovery ausfuehren
Audit schreiben
Rechte veraendern
Confirm ausloesen
Queue veraendern
Sound veraendern
Alert veraendern
Overlay veraendern
OBS/Streamer.bot ausloesen
DB schreiben
Config schreiben
```

## Contract Root

Empfohlene Root-Struktur fuer spaetere read-only Safety-Status-Daten:

```json
{
  "ok": true,
  "module": "bus_diagnostics",
  "contract": "safety_status_readonly",
  "contractVersion": "CAN-14.1",
  "readOnly": true,
  "generatedAt": "ISO-8601",
  "summary": {},
  "groups": {},
  "hardBlockedActions": [],
  "notes": []
}
```

## Root-Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| ok | boolean | Ob der Status erfolgreich erzeugt werden konnte |
| module | string | Modulquelle des Status |
| contract | string | Name des Contracts |
| contractVersion | string | Contract-Version / CAN-Stand |
| readOnly | boolean | Muss true sein |
| generatedAt | string | ISO-8601 Zeitpunkt der Status-Erzeugung |
| summary | object | Kompakte Gesamtbewertung |
| groups | object | Detailgruppen |
| hardBlockedActions | array | Liste weiterhin hart blockierter Aktionen |
| notes | array | Hinweise ohne technische Nebenwirkung |

## Summary Contract

```json
{
  "overallLevel": "green",
  "overallText": "Read-only safety status",
  "canPrepare": false,
  "canExecute": false,
  "recoveryExecution": false,
  "dangerousRoutesPresent": false,
  "productiveMutationPresent": false
}
```

## Summary-Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| overallLevel | enum | green/yellow/red/gray |
| overallText | string | Kurzer Klartext |
| canPrepare | boolean | Ob Prepare technisch/konzeptionell erlaubt waere |
| canExecute | boolean | Ob Execute technisch/konzeptionell erlaubt waere |
| recoveryExecution | boolean | Ob Recovery-Ausfuehrung aktiv ist |
| dangerousRoutesPresent | boolean | Ob gefaehrliche Routen vorhanden waeren |
| productiveMutationPresent | boolean | Ob produktive Mutation vorhanden waere |

## Level-Enum

```text
green  = read-only sicher / keine gefaehrliche Route / keine Ausfuehrung
yellow = geplant, unvollstaendig oder beobachtungswuerdig, aber nicht aktiv gefaehrlich
red    = produktive Recovery aktiv oder gefaehrliche Route vorhanden
gray   = nicht implementiert / nicht vorhanden / nicht anwendbar
```

Wichtig:

```text
Nicht implementiert ist nicht automatisch rot.
Produktive Mutation waere rot.
Read-only ohne Mutation ist gruen.
```

## Groups Contract

Empfohlene Gruppen:

```json
{
  "executionSafety": {},
  "routeSafety": {},
  "guardPreflightSafety": {},
  "manualRecoveryPrerequisites": {},
  "candidateSafety": {}
}
```

## executionSafety

```json
{
  "level": "green",
  "readOnly": true,
  "canPrepare": false,
  "canExecute": false,
  "recoveryExecution": false,
  "productiveMutationPresent": false
}
```

Bedeutung:

```text
Zeigt, ob Recovery-Ausfuehrung oder produktive Mutation aktiv ist.
```

Pflichtregel:

```text
Wenn recoveryExecution true ist, muss level red sein.
Wenn productiveMutationPresent true ist, muss level red sein.
```

## routeSafety

```json
{
  "level": "green",
  "routeSafetyMethod": "GET",
  "commandRoute": false,
  "prepareRoute": false,
  "executeRoute": false,
  "postRoutePresent": false
}
```

Bedeutung:

```text
Zeigt, ob gefaehrliche Routen vorhanden sind.
```

Pflichtregel:

```text
Wenn commandRoute, prepareRoute, executeRoute oder postRoutePresent true ist, muss level red sein.
```

## guardPreflightSafety

```json
{
  "level": "green",
  "guardCount": 16,
  "guardOk": 16,
  "guardWarnings": 0,
  "guardBlocked": 0,
  "guardErrors": 0,
  "preflightKnown": true,
  "preflightOk": true,
  "preflightWarnings": 0,
  "preflightBlocked": 0
}
```

Bedeutung:

```text
Fasst vorhandene Guard-/Preflight-Diagnose zusammen.
```

Level-Regel:

```text
errors > 0 -> red
blocked > 0 -> yellow oder red je nach Blocker
warnings > 0 -> yellow
alles ok -> green
unbekannt -> gray
```

## manualRecoveryPrerequisites

```json
{
  "level": "yellow",
  "auditReady": false,
  "rightsReady": false,
  "confirmReady": false,
  "safetyStopReady": false,
  "cancelReady": false,
  "duplicateLockReady": false
}
```

Bedeutung:

```text
Zeigt, welche Sicherheitsbausteine nur geplant und noch nicht implementiert/freigegeben sind.
```

Wichtig:

```text
false ist hier kein Fehler.
false bedeutet: noch nicht technisch implementiert oder nicht freigegeben.
```

Level-Regel:

```text
alle false, aber keine produktive Recovery -> yellow
teilweise vorhanden -> yellow
alles vorhanden, aber keine Recovery aktiv -> green moeglich
Fehlender Baustein bei aktiver Recovery -> red
```

## candidateSafety

```json
{
  "level": "yellow",
  "lowRiskReadOnlyCandidates": [
    "diagnostics_refresh",
    "status_resync_readonly",
    "preflight_recheck",
    "guard_recheck",
    "safety_state_view",
    "overlay_client_ping_recheck"
  ],
  "blockedCandidates": [
    "safety_stop_set",
    "safety_stop_clear",
    "cancel_pending_action"
  ],
  "hardBlockedCandidates": [
    "alert_replay",
    "sound_replay",
    "queue_state_clear",
    "overlay_state_repair",
    "execute_recovery",
    "auto_recovery",
    "auto_retry_overlay",
    "streamerbot_action_retry",
    "obs_source_refresh"
  ]
}
```

Bedeutung:

```text
Zeigt, welche Kandidaten read-only niedriges Risiko haben und welche weiterhin blockiert sind.
```

## HardBlockedAction Contract

Ein Eintrag in `hardBlockedActions` sollte spaeter so aussehen:

```json
{
  "id": "alert_replay",
  "label": "Alert Replay",
  "blocked": true,
  "reason": "duplicate_risk",
  "riskLevel": "critical",
  "requiresSeparatePlanning": true
}
```

## HardBlockedAction Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| id | string | Technischer Kandidatenname |
| label | string | Lesbarer Name |
| blocked | boolean | Muss fuer harte Blocker true sein |
| reason | string | Blockiergrund |
| riskLevel | enum | low/medium/high/critical |
| requiresSeparatePlanning | boolean | Muss bei produktiver Recovery true sein |

## Pflicht-Hard-Blocker

Diese Aktionen bleiben weiterhin hart blockiert:

```text
alert_replay
sound_replay
queue_state_clear
overlay_state_repair
execute_recovery
auto_recovery
auto_retry_overlay
streamerbot_action_retry
obs_source_refresh
```

## Bedeutung von false

Der Contract muss `false` sauber interpretieren.

Beispiele:

```text
canExecute: false -> gut / sicher
recoveryExecution: false -> gut / sicher
executeRoute: false -> gut / sicher
auditReady: false -> geplant, aber noch nicht implementiert
safetyStopReady: false -> geplant, aber noch nicht implementiert
hardBlockedAction.blocked: true -> gut / gewollt blockiert
```

## Bedeutung von unknown

Falls spaeter ein Wert unbekannt ist, soll nicht geraten werden.

Empfohlen:

```json
{
  "known": false,
  "value": null,
  "level": "gray",
  "note": "not available"
}
```

Nicht erlaubt:

```text
unknown als ok verkaufen
unknown als true raten
unknown als false raten
```

## Dashboard-Anzeige-Regel

Eine spaetere Dashboard-Anzeige muss klar unterscheiden:

```text
Sicher read-only
Geplant aber nicht implementiert
Blockiert wegen Risiko
Fehler/Gefahr
Unbekannt
```

Nicht erlaubt:

```text
False pauschal als Fehler anzeigen
Nicht implementiert als kaputt anzeigen
Blockiert als kaputt anzeigen
Gruene Anzeige bei aktiver Recovery
```

## Backend-Regel

Ein spaeterer Backend-Status darf diesen Contract nur liefern, wenn er read-only bleibt.

Nicht erlaubt:

```text
Contract-Erzeugung loest Recovery aus
Contract-Erzeugung schreibt DB
Contract-Erzeugung schreibt Config
Contract-Erzeugung startet OBS/Streamer.bot
Contract-Erzeugung veraendert Queue/Sound/Alert/Overlay
```

## EventBus-Regel

CAN-14.1 definiert keinen neuen produktiven EventBus-Event.

Falls spaeter EventBus-Daten genutzt werden, nur read-only Diagnose/Status.

## Tests fuer spaetere Umsetzung

Wenn dieser Contract spaeter technisch umgesetzt wird, muessen mindestens diese Checks moeglich sein:

```text
readOnly === true
canPrepare === false
canExecute === false
recoveryExecution === false
commandRoute === false
prepareRoute === false
executeRoute === false
hardBlockedActions enthaelt Alert Replay
hardBlockedActions enthaelt Sound Replay
hardBlockedActions enthaelt Queue Clear
hardBlockedActions enthaelt Overlay State Repair
hardBlockedActions enthaelt Execute Recovery
```

## Harte Regeln bleiben

Weiterhin verboten:

```text
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Queue-Mutation
Keine Sound-Mutation
Keine Alert-Mutation
Keine Overlay-Mutation
Keine DB-/Config-Schreibzugriffe
Keine Streamer.bot-/OBS-Aktion
Keine Auto-Recovery
Kein Alert Replay
Kein Sound Replay
Kein Queue Clear
Kein Overlay State Repair
```

## Ergebnis CAN-14.1

CAN-14.1 definiert:

```text
Safety Status Contract ist read-only.
Feldgruppen und Bedeutung sind festgelegt.
False/Unknown/Blocked werden sauber unterschieden.
Produktive Recovery bleibt hart blockiert.
Naechster Schritt ist CAN-14.2 Backend Status Shape read-only planen.
```
