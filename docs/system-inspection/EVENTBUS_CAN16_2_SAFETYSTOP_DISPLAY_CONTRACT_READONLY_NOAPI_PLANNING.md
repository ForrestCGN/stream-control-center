# EVENTBUS CAN-16.2 - SafetyStop Display Contract read-only/no-api Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-16.2

## Zweck

CAN-16.2 plant einen reinen Anzeige-/Contract-Entwurf fuer SafetyStop in einer spaeteren Safety Status View.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-16.0 hat das SafetyStop-Statuskonzept geplant.

CAN-16.1 hat die SafetyStop-State-Matrix geplant.

CAN-16.2 definiert nun, wie ein spaeterer Anzeigevertrag aussehen koennte, ohne ihn technisch umzusetzen.

## Harte Grenze fuer CAN-16.2

CAN-16.2 darf nicht enthalten:

```text
SafetyStop API
SafetyStop setzen
SafetyStop clearen
SafetyStop resetten
Dashboard-Button
DB-Tabelle
GET-Route
POST-Route
EventBus-Emit
Recovery-Ausfuehrung
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Moeglicher spaeterer Anzeige-Ort

Nur Planung:

```text
Event-Bus / Communication Bus
Recovery
Safety Status
Karte: SafetyStop
```

Keine Dashboard-Datei wird in CAN-16.2 geaendert.

## Display Contract Root

Nur Planung:

```json
{
  "section": "safetyStop",
  "contractVersion": "CAN-16.2",
  "readOnly": true,
  "hasApi": false,
  "hasMutation": false,
  "known": false,
  "state": "unknown",
  "active": false,
  "level": "warning",
  "label": "Unbekannt",
  "message": "SafetyStop-Zustand ist nicht technisch angebunden.",
  "reason": null,
  "source": null,
  "blocksRecovery": true,
  "blocksHighRiskActions": true,
  "clearAllowed": false,
  "clearVisible": false,
  "clearRequiresConfirm": true,
  "clearRequiresAudit": true,
  "updatedAt": null,
  "notes": []
}
```

## Pflichtfelder fuer spaetere Anzeige

```text
section
contractVersion
readOnly
hasApi
hasMutation
known
state
active
level
label
message
blocksRecovery
blocksHighRiskActions
clearAllowed
clearVisible
clearRequiresConfirm
clearRequiresAudit
```

## Optionale Felder fuer spaetere Anzeige

```text
reason
source
createdAt
updatedAt
expiresAt
notes
```

## Feldregeln

### readOnly

Muss fuer diesen Planungsstrang bleiben:

```text
true
```

### hasApi

Muss fuer CAN-16.2 bleiben:

```text
false
```

### hasMutation

Muss fuer CAN-16.2 bleiben:

```text
false
```

### known

Wenn der Zustand nicht technisch angebunden ist:

```text
false
```

Regel:

```text
known=false darf spaeter nicht als sicher verkauft werden.
```

### state

Erlaubte Werte:

```text
inactive
active
unknown
degraded
contradictory
```

### active

```text
true/false
```

Regel:

```text
active=true blockiert riskante Aktionen.
```

### level

Empfohlene Anzeige-Level:

```text
ok
warning
error
info
```

### label

Benutzerfreundlicher Statusname:

```text
Inaktiv
Aktiv
Unbekannt
Eingeschraenkt
Widerspruechlich
```

### message

Kurzer erklaerender Text fuer die Karte.

### blocksRecovery

Default fuer unbekannt/degraded/active/widerspruechlich:

```text
true
```

### blocksHighRiskActions

Default:

```text
true
```

### clearAllowed

Aktueller Planungsdefault:

```text
false
```

### clearVisible

Aktueller Planungsdefault:

```text
false
```

## Anzeige-Mapping

| state | known | active | level | label | message |
|---|---|---|---|---|---|
| inactive | true | false | ok | Inaktiv | Kein SafetyStop aktiv. High-risk Aktionen bleiben trotzdem separat blockiert. |
| active | true | true | error | Aktiv | SafetyStop blockiert riskante Aktionen. |
| unknown | false | false | warning | Unbekannt | SafetyStop-Zustand ist unbekannt. Fail-safe blockiert riskante Aktionen. |
| degraded | true | false | warning | Eingeschraenkt | SafetyStop ist nicht voll auswertbar. Fail-safe blockiert riskante Aktionen. |
| contradictory | true | true/false | error | Widerspruechlich | SafetyStop-Daten sind widerspruechlich. Fail-safe blockiert riskante Aktionen. |

## Anzeige fuer Clear

Clear darf spaeter nicht als Button erscheinen, solange nicht separat geplant.

Anzeige-Idee:

```text
Clear: nicht erlaubt
Confirm erforderlich: ja
Audit erforderlich: ja
```

Nicht erlaubt:

```text
Clear-Button
Reset-Button
Force-Clear-Button
Auto-Clear
```

## Anzeige fuer Blockierung

Spaetere Karte kann zeigen:

```text
Blockiert Recovery: ja/nein
Blockiert High-Risk-Aktionen: ja/nein
```

Regel:

```text
Bei unknown/degraded/contradictory immer ja.
```

## Anzeige fuer Reason

Reason Codes aus CAN-16.0:

```text
manual_operator
guard_failure
preflight_failure
system_error
config_error
unknown_state
security_policy
duplicate_risk
audit_unavailable
confirm_unavailable
rights_unavailable
```

Anzeige:

```text
Reason Code anzeigen, aber keine Rohdaten.
```

## Anzeige fuer Source

Source Codes aus CAN-16.0:

```text
system
owner
admin
guard
preflight
config
startup
unknown
```

Anzeige:

```text
Quelle anzeigen, aber keine personenbezogenen Details ohne Zweck.
```

## No-data Default fuer aktuellen Stand

Da es keine API und keine technische SafetyStop-Anbindung gibt, waere ein spaeterer reiner Hinweiszustand:

```text
known=false
state=unknown
level=warning
label=Unbekannt
message=SafetyStop-Zustand ist nicht technisch angebunden.
blocksRecovery=true
blocksHighRiskActions=true
clearAllowed=false
clearVisible=false
```

Wichtig:

```text
CAN-16.2 baut diese Anzeige nicht.
```

## Keine API-/Route-Annahme

Der Contract ist nur ein Anzeigeentwurf.

Nicht daraus ableiten:

```text
GET /api/safety-stop
GET /api/bus-diagnostics/safety-stop
GET /api/bus-diagnostics/safety-status/safetystop
```

Diese Routen existieren nicht durch CAN-16.2.

## Keine Backend-Shape-Implementierung

CAN-16.2 erzeugt keinen Backend-Status.

Nicht umgesetzt:

```text
backendSafetyStopShapeImplemented
safetyStopStatusProvider
safetyStopStateReader
```

## Keine Dashboard-Implementierung

CAN-16.2 erzeugt keine Karte.

Nicht umgesetzt:

```text
SafetyStop Card
SafetyStop Row
SafetyStop Badge
SafetyStop Status Widget
```

## UX-Regeln fuer spaeter

Eine spaetere Anzeige muss klar unterscheiden:

```text
nicht technisch angebunden
unbekannt
aktiv
inaktiv
eingeschraenkt
widerspruechlich
```

Nicht erlaubt:

```text
unknown als OK anzeigen
degraded als OK anzeigen
fehlende Daten als inactive anzeigen
Clear als schnelle Aktion anbieten
```

## Datenschutzregel

SafetyStop Display darf spaeter keine Secrets zeigen.

Nicht anzeigen:

```text
Tokens
Session IDs
Authorization Header
vollstaendige Error-Payloads
private Rohdaten
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
Kein SafetyStop Clear
Kein SafetyStop Reset
```

## Ergebnis CAN-16.2

CAN-16.2 definiert:

```text
SafetyStop Display Contract Root
Pflichtfelder
optionale Felder
Feldregeln
Anzeige-Mapping
Clear-Anzeigegrenze
Blockierungsanzeige
Reason-/Source-Anzeige
No-data Default
UX-Regeln
Datenschutzregel
```

## Naechster sinnvoller Schritt

```text
CAN-16.3 - SafetyStop Integration Boundary read-only/no-api Planning
```
