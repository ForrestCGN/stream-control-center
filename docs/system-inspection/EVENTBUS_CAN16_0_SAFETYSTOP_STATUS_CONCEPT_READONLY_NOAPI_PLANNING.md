# EVENTBUS CAN-16.0 - SafetyStop Status Concept read-only/no-api Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-16.0

## Zweck

CAN-16.0 plant ein SafetyStop-Statuskonzept als naechsten Sicherheitsbaustein nach CAN-15.

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

CAN-15.6 wurde abgeschlossen als:

```text
Audit Planning no-write / no-data
```

Empfohlener naechster Schritt aus CAN-15.6:

```text
CAN-16.0 - SafetyStop Status Concept read-only/no-api Planning
```

## Harte Grenze fuer CAN-16.0

CAN-16.0 darf nicht enthalten:

```text
SafetyStop API
SafetyStop setzen
SafetyStop clearen
SafetyStop resetten
Dashboard-Button
DB-Tabelle
POST-Route
GET-Route
EventBus-Emit
Recovery-Ausfuehrung
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Zielbild fuer spaeter

SafetyStop soll spaeter ein zentraler Sicherheitszustand sein, der Recovery-nahe oder riskante Aktionen blockieren kann.

Beispiele fuer spaeter blockierbare Aktionen:

```text
Recovery Execute
Queue Clear
Alert Replay
Sound Replay
Overlay Repair
Streamer.bot Action Retry
OBS Source Refresh
SafetyStop Clear
```

Wichtig:

```text
CAN-16.0 baut keinen SafetyStop.
CAN-16.0 plant nur das Statusmodell.
```

## SafetyStop-Grundidee

SafetyStop ist spaeter ein Zustand wie:

```text
inactive
active
unknown
degraded
```

Bedeutung:

```text
inactive = kein bekannter SafetyStop aktiv
active = SafetyStop blockiert riskante Aktionen
unknown = Zustand nicht bekannt, daher sicherheitshalber blockieren
degraded = SafetyStop-Subsystem nicht voll auswertbar, daher sicherheitshalber blockieren
```

## Vorgeschlagenes Statusmodell fuer spaeter

Nur Planung:

```json
{
  "safetyStop": {
    "known": true,
    "active": false,
    "state": "inactive",
    "reason": null,
    "source": null,
    "createdAt": null,
    "updatedAt": null,
    "expiresAt": null,
    "blocksRecovery": true,
    "blocksHighRiskActions": true,
    "clearAllowed": false,
    "clearRequiresConfirm": true,
    "clearRequiresAudit": true
  }
}
```

## Statusfelder

### known

```text
Ob der SafetyStop-Zustand bekannt ist.
```

Regel fuer spaeter:

```text
known=false muss riskante Aktionen blockieren.
```

### active

```text
Ob SafetyStop aktiv ist.
```

Regel fuer spaeter:

```text
active=true blockiert riskante Aktionen.
```

### state

Moegliche Werte:

```text
inactive
active
unknown
degraded
```

### reason

Moegliche spaetere Reason Codes:

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

### source

Moegliche spaetere Quellen:

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

### createdAt / updatedAt / expiresAt

Nur Planung.

Regel:

```text
Zeitfelder duerfen spaeter nie Secrets oder Payloads enthalten.
```

### blocksRecovery

```text
Ob SafetyStop Recovery-Ausfuehrung blockiert.
```

Default fuer spaeter:

```text
true
```

### blocksHighRiskActions

```text
Ob SafetyStop high-risk Aktionen blockiert.
```

Default fuer spaeter:

```text
true
```

### clearAllowed

```text
Ob Clear grundsaetzlich erlaubt waere.
```

Default fuer aktuellen Planungsstand:

```text
false
```

### clearRequiresConfirm / clearRequiresAudit

```text
SafetyStop Clear darf spaeter niemals still passieren.
```

Planungsregel:

```text
clearRequiresConfirm=true
clearRequiresAudit=true
```

## SafetyStop-Entscheidungsregel fuer spaeter

Riskante Aktionen duerfen spaeter nur weiterlaufen, wenn alle Bedingungen erfuellt sind:

```text
SafetyStop known=true
SafetyStop active=false
SafetyStop state=inactive
Guards OK
Preflight OK
Rechte OK
Confirm falls noetig OK
Audit falls noetig OK
```

Wenn ein Wert unbekannt ist:

```text
blockieren
```

## Anzeige-Idee fuer Safety Status View spaeter

Nur Planung.

Moegliche Anzeige:

```text
SafetyStop: Inaktiv / Aktiv / Unbekannt / Eingeschraenkt
Grund: reason code
Quelle: source
Blockiert Recovery: ja/nein
Blockiert High-Risk: ja/nein
Clear erlaubt: nein
```

Wichtig:

```text
Keine Dashboard-Aenderung in CAN-16.0.
```

## SafetyStop und Audit

Aus CAN-15 gilt:

```text
SafetyStop-relevante Entscheidungen sollen spaeter auditierbar sein.
SafetyStop Clear braucht spaeter eigene Planung.
SafetyStop Clear darf nicht automatisch/still passieren.
```

Moegliche spaetere Audit Events:

```text
audit.safetystop.status.view.request
audit.safetystop.status.view.decision
audit.safetystop.status.view.result
audit.safetystop.active.blocked.decision
audit.safetystop.clear.request
audit.safetystop.clear.blocked.decision
```

Aber:

```text
CAN-16.0 erzeugt keine Audit Events.
```

## SafetyStop und Confirm

Planungsregel:

```text
SafetyStop Clear braucht spaeter Confirm.
```

Aber:

```text
CAN-16.0 baut keine Confirm API.
```

## SafetyStop und Rechte

Planungsregel:

```text
SafetyStop Clear duerfte spaeter nur Owner/Admin erlaubt sein.
```

Aber:

```text
CAN-16.0 baut keine Rechtepruefung.
```

## SafetyStop und Retention

Planungsregel:

```text
SafetyStop-Historie waere spaeter Audit-Thema.
Keine eigene Retention in CAN-16.0.
```

## Clear/Reset-Grenze

SafetyStop Clear ist eine high-risk Aktion.

Weiterhin hart blockiert:

```text
SafetyStop Clear
SafetyStop Reset
SafetyStop Force Clear
SafetyStop Auto Clear
```

Jede spaetere Clear-Planung braucht separat:

```text
Audit
Confirm
Rights
Guard Check
Preflight Check
Manual Review
```

## Keine API in CAN-16.0

Nicht planen als technische Umsetzung:

```text
GET /api/safety-stop
POST /api/safety-stop
POST /api/safety-stop/clear
POST /api/safety-stop/reset
```

Diese Routen bleiben nicht vorhanden.

## Keine Dashboard-Aktion in CAN-16.0

Nicht erlaubte Buttons:

```text
SafetyStop setzen
SafetyStop clearen
SafetyStop resetten
SafetyStop testen
SafetyStop erzwingen
```

## No-Mutation-Regel

CAN-16.0 darf nichts veraendern:

```text
keine DB
keine Config
keine Runtime-State-Aenderung
keine EventBus-State-Aenderung
keine Queue/Sound/Alert/Overlay-Aenderung
keine OBS-/Streamer.bot-Aktion
```

## Fail-safe-Regel fuer spaeter

Wenn SafetyStop spaeter technisch unklar ist:

```text
unknown/degraded muss blockieren
```

Nicht erlaubt:

```text
unknown als OK behandeln
degraded als OK behandeln
fehlende Daten als inaktiv behandeln
```

## Ergebnis CAN-16.0

CAN-16.0 definiert:

```text
SafetyStop-Grundidee
SafetyStop-Statusmodell
Statusfelder
Reason Codes
Sources
Entscheidungsregel
Anzeige-Idee fuer Safety Status View
Audit-/Confirm-/Rights-Abgrenzung
Clear-/Reset-Grenze
Fail-safe-Regel
```

## Naechster sinnvoller Schritt

```text
CAN-16.1 - SafetyStop State Matrix read-only/no-api Planning
```
