# EVENTBUS CAN-18.0 - Confirm Boundary no-action Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-18.0

## Zweck

CAN-18.0 plant die Confirm-/Bestaetigungsgrenzen fuer spaetere high-risk Aktionen.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine Middleware.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Confirm-Ausfuehrung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-17.4 wurde abgeschlossen als:

```text
Roles/Rights Planning no-mutation / no-implementation
```

Empfohlener naechster Schritt aus CAN-17.4:

```text
CAN-18.0 - Confirm Boundary no-action Planning
```

## Harte Grenze fuer CAN-18.0

CAN-18.0 darf nicht enthalten:

```text
Confirm API
Confirm Token
Confirm DB
Confirm Route
Confirm Button
Confirm Ausfuehrung
Recovery-Ausfuehrung
POST-Route
SafetyStop Clear
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Zielbild fuer spaeter

Confirm soll spaeter ein zusaetzlicher Schutz fuer riskante Aktionen sein.

Confirm darf spaeter nur ergaenzen, niemals ersetzen:

```text
Rollen/Rechte
Audit
SafetyStop
Guards
Preflight
separate Freigabe
```

## Grundregel

Confirm ist kein Recht.

Planungsregel:

```text
Confirm darf Rechte nicht ersetzen.
Confirm darf SafetyStop nicht ueberstimmen.
Confirm darf fehlende Guards/Preflight nicht ignorieren.
Confirm darf keine Aktion allein freigeben.
```

## Moegliche Confirm-Arten fuer spaeter

Nur Planung:

```text
info_confirm
risk_confirm
destructive_confirm
typed_confirm
owner_confirm
dual_confirm
```

## Confirm-Arten Beschreibung

### info_confirm

```text
Bestaetigung fuer einfache read-only oder informative Aktionen.
```

Status:

```text
spaeter vielleicht moeglich, aber nicht in CAN-18.0
```

### risk_confirm

```text
Bestaetigung fuer riskante, aber nicht destruktive Aktionen.
```

Status:

```text
separate Planung noetig
```

### destructive_confirm

```text
Bestaetigung fuer potenziell destruktive Aktionen.
```

Status:

```text
high-risk, blockiert
```

### typed_confirm

```text
Bestaetigung durch Eingabe eines festen Textes, z. B. CLEAR oder EXECUTE.
```

Status:

```text
high-risk, separate Planung noetig
```

### owner_confirm

```text
Bestaetigung nur durch Owner.
```

Status:

```text
separate Rollen-/Rechte- und Audit-Planung noetig
```

### dual_confirm

```text
Zwei unabhaengige Bestaetigungen.
```

Status:

```text
nicht fuer aktuellen Strang freigegeben
```

## Moegliche spaetere Confirm-Pflicht

Aktionen, die spaeter Confirm brauchen wuerden:

```text
SafetyStop Clear
Recovery Prepare
Recovery Execute
Queue Clear
Alert Replay
Sound Replay
Overlay Repair
OBS Source Refresh
Streamer.bot Action Retry
Audit Export
Rights Mutation
```

Aber:

```text
Diese Aktionen bleiben weiterhin blockiert.
```

## Keine Confirm-Freigabe fuer high-risk Aktionen

Auch mit Confirm bleiben diese in CAN-18.0 blockiert:

```text
Recovery Execute
SafetyStop Clear
Queue Clear
Alert Replay
Sound Replay
Overlay Repair
OBS Source Refresh
Streamer.bot Action Retry
Audit Write
Rights Mutation
```

## Confirm State Modell fuer spaeter

Nur Planung:

```json
{
  "confirm": {
    "required": false,
    "available": false,
    "state": "not_implemented",
    "type": null,
    "expiresAt": null,
    "ttlMs": null,
    "actorRequired": null,
    "phraseRequired": null,
    "attemptsAllowed": null,
    "attemptsUsed": 0,
    "confirmed": false,
    "cancelled": false,
    "expired": false
  }
}
```

## Confirm States

Moegliche spaetere States:

```text
not_required
required
pending
confirmed
cancelled
expired
failed
not_implemented
blocked
```

## Confirm TTL / Timeout Planung

Nur Planung:

Empfohlene spaetere Richtwerte:

```text
info_confirm: 60s
risk_confirm: 30s
destructive_confirm: 15s
typed_confirm: 15s
owner_confirm: 30s
dual_confirm: separat planen
```

Wichtig:

```text
CAN-18.0 baut keine Timer.
CAN-18.0 baut keine Tokens.
CAN-18.0 speichert keine Confirm-Requests.
```

## Confirm und Audit

Confirm-Entscheidungen sollen spaeter auditierbar sein.

Moegliche spaetere Audit Events:

```text
audit.confirm.request
audit.confirm.decision
audit.confirm.result
audit.confirm.cancelled
audit.confirm.expired
audit.confirm.failed
```

Aber:

```text
CAN-18.0 erzeugt keine Audit Events.
```

## Confirm und Rollen/Rechte

Confirm darf spaeter erst nach Rechtepruefung relevant werden.

Planungsreihenfolge:

```text
Identity pruefen
Rolle/Recht pruefen
SafetyStop pruefen
Guards/Preflight pruefen
Audit-Faehigkeit pruefen
Confirm anfordern
Aktion ggf. spaeter erlauben
```

CAN-18.0 baut keine Rechtepruefung.

## Confirm und SafetyStop

Confirm darf SafetyStop nicht ueberstimmen.

Planungsregel:

```text
SafetyStop active/unknown/degraded/contradictory blockiert auch dann, wenn Confirm vorhanden waere.
```

## Confirm und Preflight/Guards

Confirm darf Guards/Preflight nicht ersetzen.

Planungsregel:

```text
Confirm nur wenn Guards OK und Preflight OK.
```

## Confirm und UI

Moegliche spaetere UI-Hinweise:

```text
Bestaetigung erforderlich.
Bestaetigung abgelaufen.
Bestaetigung abgebrochen.
Bestaetigung fehlgeschlagen.
Diese Aktion bleibt trotz Bestaetigung blockiert.
```

Aber:

```text
CAN-18.0 baut keine UI.
```

## Keine Buttons in CAN-18.0

Nicht erlaubte UI-Elemente:

```text
Confirm
Cancel Confirm
Retry Confirm
Typed Confirm Eingabe
Owner Confirm
Dual Confirm
```

## Keine Tokens in CAN-18.0

Nicht erstellen:

```text
confirm token
confirm id
confirm nonce
confirm secret
confirm session
```

## Keine Routen in CAN-18.0

Nicht erstellen:

```text
GET /api/confirm
POST /api/confirm
POST /api/confirm/cancel
POST /api/confirm/execute
POST /api/recovery/confirm
```

## Keine Speicherung in CAN-18.0

Nicht erstellen:

```text
confirm table
confirm state file
confirm cache
confirm queue
confirm session store
```

## Confirm Fail-safe Regeln

Wenn Confirm spaeter erforderlich waere und nicht vorhanden ist:

```text
blockieren
```

Wenn Confirm abgelaufen ist:

```text
blockieren
```

Wenn Confirm von falscher Rolle kommt:

```text
blockieren
```

Wenn Confirm phrase falsch ist:

```text
blockieren
```

Wenn Confirm-System unknown/degraded ist:

```text
blockieren
```

## Confirm darf keine Aktion ausloesen

Wichtige Regel:

```text
Confirm ist nur Bestaetigung, nicht Ausfuehrung.
```

Nicht erlaubt:

```text
Confirm klickt und fuehrt direkt Recovery aus
Confirm klickt und cleart SafetyStop direkt
Confirm klickt und leert Queue direkt
```

Spaeter noetig waere:

```text
separate Execute-Phase
Audit
Guards
SafetyStop Check
Rights Check
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
Keine Rechte-Mutation
Keine Confirm-Ausfuehrung
```

## Ergebnis CAN-18.0

CAN-18.0 definiert:

```text
Confirm-Grundregel
Confirm-Arten
spaetere Confirm-Pflicht fuer high-risk Aktionen
Confirm-State-Modell
Confirm States
TTL-/Timeout-Planung
Audit-/Roles-/SafetyStop-/Preflight-Abgrenzung
UI-/Button-/Token-/Route-/Speicher-Grenzen
Fail-safe-Regeln
Confirm ist keine Ausfuehrung
```

## Naechster sinnvoller Schritt

```text
CAN-18.1 - Confirm Action Matrix no-action Planning
```
