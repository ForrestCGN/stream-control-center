# EVENTBUS CAN-14.2 - Backend Status Shape read-only Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.2

## Zweck

Dieses Dokument plant den spaeteren Backend Status Shape fuer die read-only Safety Status View.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Route hinzu.
Es fuegt keine Dashboard-Karte hinzu.
Es fuegt keine Dashboard-Buttons hinzu.
Es fuehrt keine Queue-, Sound-, Alert-, Overlay-, DB- oder Config-Mutation aus.
```

## Ausgangslage

CAN-14.0 hat die read-only Safety Status View geplant.

CAN-14.1 hat den Safety Status Contract read-only definiert:

```text
Root-Struktur
Summary
Statusgruppen
Level-Enum green/yellow/red/gray
HardBlockedAction Contract
Bedeutung von false
Bedeutung von unknown
Dashboard-/Backend-Grenzen
```

CAN-14.2 plant jetzt, wie ein spaeterer Backend Status Shape aussehen darf, ohne ihn bereits umzusetzen.

## Grundregel

Der spaetere Backend Status Shape darf nur vorhandene read-only Informationen zusammenfassen oder statische Sicherheitsgrenzen melden.

Er darf nicht:

```text
Recovery vorbereiten
Recovery ausfuehren
SafetyStop setzen
SafetyStop clearen
Cancel ausloesen
Audit schreiben
Rechte pruefen mit Nebenwirkung
Confirm starten
Queue veraendern
Sound veraendern
Alert veraendern
Overlay veraendern
OBS/Streamer.bot ausloesen
DB schreiben
Config schreiben
```

## Moegliche spaetere Quelle

Primaerer Kandidat fuer einen spaeteren read-only Status Shape:

```text
backend/modules/bus_diagnostics.js
```

Warum:

```text
Das Modul ist bereits im Recovery-/Preflight-/Guard-Diagnosebereich aktiv.
Es liefert bereits read-only Diagnoseinformationen.
Es ist der naheliegende Ort fuer eine zusammenfassende Safety-Status-Ansicht.
```

Nicht in CAN-14.2 entschieden:

```text
keine neue Route
keine Modulversionserhoehung
keine konkrete Implementierung
```

## Moegliche spaetere Route

Nur als Planung, nicht in CAN-14.2 umzusetzen:

```text
GET /api/bus-diagnostics/safety-status
```

Pflicht:

```text
Nur GET
Keine Schreiboperation
Keine Recovery-Vorbereitung
Keine Recovery-Ausfuehrung
Keine produktive Mutation
```

## Backend Status Shape Root

Der spaetere Backend Shape soll am CAN-14.1 Contract bleiben:

```json
{
  "ok": true,
  "module": "bus_diagnostics",
  "contract": "safety_status_readonly",
  "contractVersion": "CAN-14.1",
  "shapeVersion": "CAN-14.2",
  "readOnly": true,
  "generatedAt": "ISO-8601",
  "summary": {},
  "groups": {},
  "hardBlockedActions": [],
  "notes": []
}
```

## Root-Zusatzfelder

CAN-14.2 ergaenzt fuer den Backend Shape:

| Feld | Typ | Bedeutung |
|---|---|---|
| shapeVersion | string | Backend-Shape-Planungsstand |
| sourceModule | string | Modul, das den Status spaeter erzeugt |
| sourceRoute | string | Route, falls spaeter umgesetzt |
| dataSources | array | Read-only Datenquellen |
| mutationCheck | object | explizite No-Mutation-Sicherheitsfelder |

## DataSources Shape

```json
{
  "dataSources": [
    {
      "id": "bus_diagnostics_status",
      "type": "existing_status",
      "mode": "read_only",
      "required": true,
      "mutationAllowed": false
    },
    {
      "id": "recovery_preflight",
      "type": "existing_preflight",
      "mode": "read_only",
      "required": false,
      "mutationAllowed": false
    },
    {
      "id": "guard_summary",
      "type": "existing_guard_data",
      "mode": "read_only",
      "required": false,
      "mutationAllowed": false
    }
  ]
}
```

## MutationCheck Shape

```json
{
  "mutationCheck": {
    "dbWrite": false,
    "configWrite": false,
    "queueMutation": false,
    "soundMutation": false,
    "alertMutation": false,
    "overlayMutation": false,
    "obsAction": false,
    "streamerbotAction": false,
    "recoveryPrepare": false,
    "recoveryExecute": false
  }
}
```

Pflichtregel:

```text
Wenn einer dieser Werte true waere, darf der Safety Status nicht als green/read-only angezeigt werden.
```

## Feldherkunft

### Statisch gesetzte Sicherheitsfelder

Diese Felder duerfen spaeter statisch/hart gesetzt werden, solange sie der Wahrheit entsprechen:

```text
readOnly: true
canPrepare: false
canExecute: false
recoveryExecution: false
commandRoute: false
prepareRoute: false
executeRoute: false
productiveMutationPresent: false
```

### Aus bestehendem Status ableitbare Felder

Diese Felder duerfen spaeter aus vorhandenen read-only Daten abgeleitet werden:

```text
guardCount
guardOk
guardWarnings
guardBlocked
guardErrors
preflightKnown
preflightOk
preflightWarnings
preflightBlocked
```

### Noch nicht implementierte Felder

Diese Felder muessen spaeter bis zur echten Umsetzung klar als false/gray/yellow markiert werden:

```text
auditReady
rightsReady
confirmReady
safetyStopReady
cancelReady
duplicateLockReady
```

Wichtig:

```text
false bedeutet hier nicht Fehler.
false bedeutet: geplant, aber noch nicht technisch umgesetzt/freigegeben.
```

### Unknown-Felder

Falls ein Wert nicht sicher aus vorhandenen Daten bestimmbar ist, muss er unknown bleiben.

Empfohlen:

```json
{
  "known": false,
  "value": null,
  "level": "gray",
  "note": "not available in read-only source"
}
```

Nicht erlaubt:

```text
raten
aus Dashboard-Zustand ableiten
aus alten Dokus als Live-Wert verkaufen
unknown als ok verkaufen
```

## Summary Backend-Regeln

Der spaetere Backend Shape muss die Gesamtbewertung konservativ bilden.

```text
red, wenn produktive Recovery oder gefaehrliche Route erkannt wird
yellow, wenn geplante Sicherheitsbausteine fehlen, aber keine produktive Gefahr aktiv ist
green, wenn read-only sicher und keine Gefahr aktiv ist
gray, wenn keine belastbare Datenlage vorhanden ist
```

## HardBlockedActions Backend-Regel

Die Liste harter Blocker muss spaeter immer mindestens enthalten:

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

Diese Blocker sind gewollt.

Ein harter Blocker ist kein Fehler.

## No-Mutation Testplanung

Falls spaeter umgesetzt, muessen Tests mindestens pruefen:

```text
HTTP-Methode ist GET
readOnly ist true
canPrepare ist false
canExecute ist false
recoveryExecution ist false
mutationCheck alle false
keine DB-Datei wird geschrieben
keine Config-Datei wird geschrieben
keine Queue/Sound/Alert/Overlay-Aenderung
keine OBS/Streamer.bot-Aktion
hardBlockedActions enthaelt Pflicht-Blocker
```

## Dashboard-Verbraucher

Ein spaeteres Dashboard darf diesen Shape nur anzeigen.

Nicht erlaubt:

```text
Buttons daraus ableiten
Recovery starten
SafetyStop clearen
Cancel ausloesen
Alert/Sound replay anbieten
Queue/Overlay repair anbieten
```

## Versionen

CAN-14.2 ist ein reiner Doku-/Planungsschritt.

Daher:

```text
Keine Modulversion erhoehen.
Keine routeVersion erhoehen.
Keine Backend-Datei aendern.
Keine Dashboard-Datei aendern.
```

Wenn spaeter Code umgesetzt wird, muss dann separat geprueft werden:

```text
Gibt es moduleVersion?
Gibt es routeVersion?
Muss bus_diagnostics version erhoeht werden?
Muss Dashboard-Doku angepasst werden?
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

## Ergebnis CAN-14.2

CAN-14.2 definiert:

```text
Backend Status Shape bleibt read-only.
bus_diagnostics ist spaeter naheliegender Modul-Kandidat.
Eine moegliche Route waere nur GET /api/bus-diagnostics/safety-status.
MutationCheck ist Pflichtbestandteil.
Feldherkunft und unknown-Regeln sind festgelegt.
Naechster Schritt ist CAN-14.3 Dashboard Safety Status Anzeige planen.
```
