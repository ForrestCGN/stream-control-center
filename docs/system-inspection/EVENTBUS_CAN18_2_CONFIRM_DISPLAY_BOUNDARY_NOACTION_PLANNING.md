# EVENTBUS CAN-18.2 - Confirm Display Boundary no-action Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-18.2

## Zweck

CAN-18.2 plant, wie ein spaeterer Confirm-Status angezeigt werden duerfte, ohne Confirm technisch umzusetzen.

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

CAN-18.0 hat die Confirm Boundary no-action geplant.

CAN-18.1 hat die Confirm Action Matrix no-action geplant.

CAN-18.2 beschreibt nun reine Anzeigegrenzen.

## Harte Grenze fuer CAN-18.2

CAN-18.2 darf nicht enthalten:

```text
Confirm API
Confirm Token
Confirm DB
Confirm Route
Confirm Button
Confirm Eingabefeld
Confirm Timer
Confirm Ausfuehrung
Recovery-Ausfuehrung
POST-Route
SafetyStop Clear
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Display-Grundregel

Confirm-Anzeige darf spaeter nur erklaeren, ob Confirm geplant, noetig, nicht verfuegbar, abgelaufen oder blockiert ist.

Confirm-Anzeige darf niemals selbst eine Aktion starten.

Nicht erlaubt:

```text
Confirm klicken und direkt ausfuehren
Confirm anzeigen als Freigabe
Confirm als Ersatz fuer Rechte anzeigen
Confirm als SafetyStop-Override anzeigen
```

## Moegliche spaetere Anzeigeorte

Nur Planung:

```text
Event-Bus / Communication Bus / Recovery / Safety Status
Event-Bus / Communication Bus / Recovery / Confirm
Audit / Confirm Events
Admin / Safety / Confirm Policy
```

CAN-18.2 baut keine Anzeige.

## Anzeigezustaende fuer spaeter

### 1. Confirm nicht implementiert

Textidee:

```text
Confirm ist geplant, aber technisch noch nicht aktiv.
```

### 2. Confirm nicht erforderlich

Textidee:

```text
Fuer diese read-only Aktion ist kein Confirm erforderlich.
```

### 3. Confirm erforderlich, aber nicht verfuegbar

Textidee:

```text
Confirm waere erforderlich, ist aber technisch nicht verfuegbar. Aktion bleibt blockiert.
```

### 4. Confirm ausstehend

Textidee:

```text
Bestaetigung steht aus.
```

Nur Planung, keine Umsetzung.

### 5. Confirm bestaetigt

Textidee:

```text
Bestaetigung liegt vor. Ausfuehrung ist dadurch noch nicht freigegeben.
```

### 6. Confirm abgelaufen

Textidee:

```text
Bestaetigung ist abgelaufen. Aktion bleibt blockiert.
```

### 7. Confirm abgebrochen

Textidee:

```text
Bestaetigung wurde abgebrochen. Aktion bleibt blockiert.
```

### 8. Confirm fehlgeschlagen

Textidee:

```text
Bestaetigung ist fehlgeschlagen. Aktion bleibt blockiert.
```

### 9. High-risk trotz Confirm blockiert

Textidee:

```text
Diese Aktion bleibt trotz Confirm blockiert und braucht separate Planung.
```

## Anzeige-Level

Empfohlene Level:

```text
ok
info
warning
error
blocked
```

## Display Contract fuer spaeter

Nur Planung:

```json
{
  "section": "confirm",
  "contractVersion": "CAN-18.2",
  "readOnly": true,
  "hasApi": false,
  "hasMutation": false,
  "available": false,
  "required": false,
  "state": "not_implemented",
  "type": null,
  "level": "warning",
  "label": "Nicht technisch aktiv",
  "message": "Confirm ist geplant, aber noch nicht implementiert.",
  "expiresAt": null,
  "ttlMs": null,
  "confirmed": false,
  "cancelled": false,
  "expired": false,
  "executionAllowed": false,
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
available
required
state
level
label
message
confirmed
cancelled
expired
executionAllowed
```

## Optionale Felder fuer spaetere Anzeige

```text
type
expiresAt
ttlMs
actorRequired
phraseRequired
attemptsAllowed
attemptsUsed
notes
```

## Feldregeln

### readOnly

Muss fuer CAN-18.2 bleiben:

```text
true
```

### hasApi

Muss fuer CAN-18.2 bleiben:

```text
false
```

### hasMutation

Muss fuer CAN-18.2 bleiben:

```text
false
```

### available

Ohne Confirm-System:

```text
false
```

### required

Nur Planungswert, darf keine Aktion starten.

### state

Erlaubte Planungswerte:

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

### executionAllowed

Muss im aktuellen Strang bleiben:

```text
false
```

## Anzeige-Mapping

| state | level | label | message |
|---|---|---|---|
| not_implemented | warning | Nicht technisch aktiv | Confirm ist geplant, aber noch nicht implementiert. |
| not_required | info | Nicht erforderlich | Fuer diese read-only Aktion ist kein Confirm erforderlich. |
| required | warning | Erforderlich | Confirm waere erforderlich. Keine Ausfuehrung. |
| pending | warning | Ausstehend | Confirm steht aus. Keine Ausfuehrung. |
| confirmed | info | Bestaetigt | Confirm liegt vor, ersetzt aber keine weiteren Pruefungen. |
| cancelled | warning | Abgebrochen | Confirm wurde abgebrochen. Aktion bleibt blockiert. |
| expired | warning | Abgelaufen | Confirm ist abgelaufen. Aktion bleibt blockiert. |
| failed | error | Fehlgeschlagen | Confirm ist fehlgeschlagen. Aktion bleibt blockiert. |
| blocked | blocked | Blockiert | Aktion bleibt trotz Confirm blockiert. |

## Confirm-Typ-Anzeige

Moegliche spaetere Typen:

```text
info_confirm
risk_confirm
destructive_confirm
typed_confirm
owner_confirm
dual_confirm
```

Anzeige darf spaeter erklaeren:

```text
welcher Confirm-Typ erforderlich waere
ob typed confirm eine Phrase braeuchte
ob owner confirm erforderlich waere
ob dual confirm erforderlich waere
```

Aber:

```text
CAN-18.2 baut keine Eingabe.
CAN-18.2 baut keine Tokens.
CAN-18.2 baut keine Timer.
```

## Keine Buttons in CAN-18.2

Nicht erlaubte UI-Elemente:

```text
Confirm
Cancel Confirm
Retry Confirm
Typed Confirm Eingabe
Owner Confirm
Dual Confirm
Execute after Confirm
```

## Keine Datenquelle

CAN-18.2 plant keine Datenquelle.

Nicht erstellen:

```text
GET /api/confirm
GET /api/confirm/status
POST /api/confirm
POST /api/confirm/cancel
POST /api/confirm/execute
```

## UX-Regeln fuer spaeter

Eine spaetere Anzeige muss klar sagen:

```text
Confirm ist nur Zusatzschutz.
Confirm ersetzt keine Rechte.
Confirm ersetzt keinen SafetyStop.
Confirm ersetzt keine Guards/Preflight.
Confirm fuehrt nichts direkt aus.
High-risk bleibt bis separate Planung blockiert.
```

Nicht erlaubt:

```text
confirmed = execute allowed
not_required = high-risk allowed
pending = safe
unknown = OK
```

## Datenschutzregel

Confirm-Anzeige darf spaeter keine Secrets zeigen.

Nicht anzeigen:

```text
Confirm Tokens
Nonces
Session Tokens
OAuth Tokens
Cookies
Authorization Header
vollstaendige User-Payloads
private Rohdaten
```

## Audit-Hinweis fuer spaeter

Eine spaetere Confirm-Anzeige kann zeigen:

```text
Confirm-Entscheidungen sollen spaeter auditierbar sein.
```

Aber:

```text
CAN-18.2 baut keine Audit-Integration.
```

## SafetyStop-Hinweis fuer spaeter

Eine spaetere Confirm-Anzeige kann zeigen:

```text
SafetyStop kann Aktionen trotz Confirm blockieren.
```

Aber:

```text
CAN-18.2 baut keine SafetyStop-Integration.
```

## Rollen-/Rechte-Hinweis fuer spaeter

Eine spaetere Confirm-Anzeige kann zeigen:

```text
Confirm ersetzt keine Rollen-/Rechtepruefung.
```

Aber:

```text
CAN-18.2 baut keine Rechtepruefung.
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

## Ergebnis CAN-18.2

CAN-18.2 definiert:

```text
Display-Grundregel
moegliche Anzeigeorte
Anzeigezustaende
Anzeige-Level
Display Contract
Pflichtfelder
optionale Felder
Feldregeln
Anzeige-Mapping
Confirm-Typ-Anzeige
No-Button-/No-Data-Source-Grenzen
UX-Regeln
Datenschutzregel
Audit-/SafetyStop-/Roles-Hinweise
```

## Naechster sinnvoller Schritt

```text
CAN-18.3 - Confirm Planning Closure / Handoff
```
