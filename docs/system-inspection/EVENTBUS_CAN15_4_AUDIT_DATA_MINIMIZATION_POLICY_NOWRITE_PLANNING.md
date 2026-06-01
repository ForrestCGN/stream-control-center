# EVENTBUS CAN-15.4 - Audit Data Minimization Policy no-write Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.4

## Zweck

CAN-15.4 plant eine Datenminimierungs-Policy fuer spaetere Audit-Kontexte.

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

CAN-15.2 hat die Audit-Boundary no-write geplant.

CAN-15.3 hat einen Audit-Event-Katalog no-write geplant.

CAN-15.4 legt nun fest, welche Daten spaeter in Audit-Kontexten erlaubt, maskiert, gehasht, gekuerzt oder verboten sind.

## Harte no-write-Grenze

CAN-15.4 darf nicht enthalten:

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
API-Route
Dashboard-Button
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```

## Grundprinzip

Audit darf spaeter nur speichern:

```text
so viel wie noetig
so wenig wie moeglich
keine Secrets
keine sensiblen Rohdaten
keine unnoetigen personenbezogenen Daten
keine vollstaendigen Payloads ohne klaren Zweck
```

## Datenklassen

### Klasse A - erlaubt

Diese Daten sind spaeter grundsaetzlich auditfaehig, solange sie nicht mit Secrets kombiniert werden:

```text
auditId
event
eventPhase
category
riskLevel
createdAt
source
action
scope
decision
result
reason
readOnly
canPrepare
canExecute
recoveryExecution
routeMethod
routePath
moduleName
moduleVersion
guardCount
guardOk
guardWarnings
guardErrors
preflightCount
preflightWarnings
preflightErrors
correlationId
requestId
```

### Klasse B - nur gekuerzt oder normalisiert

Diese Daten duerfen spaeter nur gekuerzt, normalisiert oder begrenzt gespeichert werden:

```text
actorDisplayName
targetDisplayName
routeQuery
userAgent
errorMessage
warningMessage
reasonText
metadata
```

Regel:

```text
maximale Laenge begrenzen
keine Tokens/Secrets
keine vollstaendigen Rohdaten
```

### Klasse C - nur gehasht/pseudonymisiert

Diese Daten duerfen spaeter nur gehasht oder pseudonymisiert gespeichert werden, wenn sie fuer Nachvollziehbarkeit erforderlich sind:

```text
actorId
targetId
userEmail
ipAddress
sessionId
connectionId
```

Regel:

```text
kein Klartext, wenn nicht zwingend erforderlich
Hash oder gekuerzte ID bevorzugen
```

### Klasse D - verboten

Diese Daten duerfen spaeter niemals im Audit gespeichert werden:

```text
Tokens
OAuth Access Tokens
OAuth Refresh Tokens
API Keys
Passwoerter
Session Cookies
Authorization Header
private Headers
vollstaendige Request Bodies mit Secrets
vollstaendige Chatlogs
vollstaendige Discord-Nachrichten
vollstaendige Twitch-API-Rohantworten
vollstaendige OBS-WebSocket-Payloads
vollstaendige Streamer.bot-Payloads mit sensiblen Daten
.env Inhalte
Config-Secrets
Datenbank-Verbindungsstrings mit Passwort
```

## Maskierungsregeln

### Secret-Maskierung

Wenn ein Feld einen Secret-Verdacht hat, muss es spaeter maskiert werden:

```text
token
secret
password
passwd
apikey
api_key
authorization
cookie
session
refresh
bearer
client_secret
```

Ausgabe:

```text
[redacted]
```

### Teilmaskierung

Fuer optionale Anzeige spaeter:

```text
abcd1234efgh5678 -> abcd…5678
email@example.com -> e***@example.com oder hash
```

### Fehlertexte

Fehlertexte duerfen spaeter gespeichert werden, aber nur:

```text
gekuerzt
ohne Secrets
ohne komplette Payloads
```

Empfohlene maximale Laenge:

```text
500 Zeichen
```

## Query-String-Regel

Route-Pfade sind erlaubt, Query-Strings sind kritisch.

Erlaubt:

```text
/api/bus-diagnostics/status
/api/bus-diagnostics/recovery-preflight
```

Nur nach Pruefung/Redaktion:

```text
?baseUrl=...
?token=...
?key=...
```

Regel:

```text
routePath ohne Query bevorzugen
Query nur allowlisten
Secret-Parameter immer entfernen
```

## Metadata-Regel

Metadata darf spaeter nicht als Rohdaten-Ablage missbraucht werden.

Erlaubt:

```text
kleine strukturierte Zusatzinfos
Counts
Flags
Reason Codes
Step IDs
Scope IDs
```

Nicht erlaubt:

```text
vollstaendige Response Bodies
vollstaendige Request Bodies
komplette User-Objekte
komplette Client-Objekte mit Secrets
```

## Retention-Grundsatz fuer spaeter

Noch keine technische Umsetzung.

Planungsregel:

```text
Audit-Retention muss konfigurierbar sein.
Keine hart codierte Aufbewahrungsdauer.
Owner/Admin muss spaeter Retention einstellen koennen.
```

Empfohlene spaetere Kategorien:

```text
low risk read-only: kuerzere Retention moeglich
blocked high-risk: laengere Retention sinnvoll
critical actions: laengere Retention sinnvoll
```

## Zugriffsschutz fuer spaeter

Audit-Daten duerfen spaeter nicht fuer alle Dashboard-User sichtbar sein.

Planungsregel:

```text
Audit-Anzeige nur fuer berechtigte Rollen.
Mindestens Admin/Owner.
Keine Rechte-Umsetzung in CAN-15.4.
```

## Export-Regel fuer spaeter

Audit-Export ist riskant.

Planungsregel:

```text
kein Export ohne eigene Planung
kein CSV/JSON-Export ohne Rechtepruefung
kein Export mit Secrets
Export separat auditieren
```

## Debug-/Log-Abgrenzung

Audit ist nicht Debug-Log.

Audit soll spaeter speichern:

```text
sicherheitsrelevante Entscheidung
wer/was/warum/wann
kompakte technische Flags
```

Audit soll nicht speichern:

```text
vollstaendige Debug-Traces
komplette Stacktraces
beliebige Raw Payloads
```

Stacktraces duerfen spaeter hoechstens:

```text
gekuerzt
separat
ohne Secrets
mit Retention
```

## Beispiel fuer erlaubtes spaeteres Audit-Minimalobjekt

Nur Planung, keine Umsetzung:

```json
{
  "auditId": "audit_...",
  "event": "audit.recovery.preflight.load.result",
  "eventPhase": "result",
  "category": "read_only_refresh",
  "riskLevel": "low",
  "createdAt": "ISO-8601",
  "source": "dashboard",
  "action": "recovery_preflight_load",
  "scope": "recovery.preflight",
  "decision": "allowed_read_only",
  "result": "displayed",
  "reason": "GET/read-only",
  "readOnly": true,
  "canPrepare": false,
  "canExecute": false,
  "recoveryExecution": false,
  "routeMethod": "GET",
  "routePath": "/api/bus-diagnostics/recovery-preflight",
  "guardSummary": {
    "total": 16,
    "ok": 16,
    "warnings": 0,
    "errors": 0
  }
}
```

## Beispiel fuer verbotene Rohdaten

Nicht speichern:

```json
{
  "headers": {
    "authorization": "Bearer abc.def.ghi",
    "cookie": "session=..."
  },
  "body": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

## Secret-Erkennung als spaeteres Konzept

Eine spaetere technische Phase muss vor Speicherung pruefen:

```text
Feldname enthaelt Secret-Schluesselwort
Wert sieht wie Token aus
Wert enthaelt Bearer
Wert enthaelt Basic Auth
Wert enthaelt typische API-Key-Muster
```

Aber:

```text
CAN-15.4 baut keinen Scanner.
CAN-15.4 plant nur die Policy.
```

## Policy-Entscheidung

Fuer alle spaeteren Audit-Planungen gilt ab CAN-15.4:

```text
Datenminimierung ist Pflicht.
Secrets sind verboten.
Raw Payloads sind verboten, ausser separat geplant und redigiert.
Retention muss konfigurierbar sein.
Audit-Anzeige braucht Rechte.
Audit-Export braucht eigene Planung.
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
Keine Audit Write Route
```

## Ergebnis CAN-15.4

CAN-15.4 definiert:

```text
Datenklassen A-D
Maskierungsregeln
Query-String-Regeln
Metadata-Regeln
Retention-Grundsaetze
Zugriffsschutz-Grundsaetze
Export-Grenzen
Audit-vs-Debug-Abgrenzung
```

## Naechster sinnvoller Schritt

```text
CAN-15.5 - Audit Display Planning read-only/no-data Planning
```
