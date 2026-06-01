# EVENTBUS CAN-17.0 - Roles/Rights Boundary no-mutation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-17.0

## Zweck

CAN-17.0 plant die Rollen-/Rechte-Grenzen fuer spaetere Dashboard-/Recovery-nahe Sicherheitsentscheidungen.

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

CAN-16.4 wurde abgeschlossen als:

```text
SafetyStop Planning read-only / no-api
```

Empfohlener naechster Schritt aus CAN-16.4:

```text
CAN-17.0 - Roles/Rights Boundary no-mutation Planning
```

## Harte Grenze fuer CAN-17.0

CAN-17.0 darf nicht enthalten:

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Mutation
Recovery-Ausfuehrung
POST-Route
GET-Route
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Zielbild fuer spaeter

Ein spaeteres Rollen-/Rechte-System soll sicherheitsnahe Aktionen kontrollieren.

Es soll spaeter entscheiden koennen:

```text
wer Safety-/Recovery-Status sehen darf
wer read-only Diagnose ausloesen darf
wer geplante high-risk Aktionen ueberhaupt anfragen duerfte
wer SafetyStop sehen duerfte
wer SafetyStop niemals clearen darf
wer Audit sehen duerfte
```

Aber:

```text
CAN-17.0 baut kein Rechte-System.
```

## Vorgeschlagene Rollen fuer spaeter

Nur Planung:

```text
viewer
moderator
admin
owner
system
```

## Rollenbeschreibung

### viewer

```text
normale Anzeige-/Leserechte, keine Safety-/Recovery-Aktionen
```

### moderator

```text
moeglich fuer einfache read-only Diagnoseansichten, keine high-risk Aktionen
```

### admin

```text
spaeter fuer administrative read-only/konfigurative Bereiche denkbar, aber high-risk Aktionen weiterhin stark begrenzt
```

### owner

```text
hoechste menschliche Rolle fuer spaetere Sicherheitsentscheidungen
```

### system

```text
interne Systemrolle, darf niemals stille produktive Recovery ausfuehren
```

## Wichtige Grundregel

Dashboard-Sichtbarkeit ist keine Berechtigung.

Planungsregel:

```text
Backend muss spaeter serverseitig pruefen.
UI allein reicht nie.
```

## Aktuelle no-mutation-Regel

CAN-17.0 darf Rechte nicht speichern, aendern oder anwenden.

Nicht erlaubt:

```text
User anlegen
Rolle setzen
Rolle entfernen
Rechte pruefen
Login pruefen
Session pruefen
Token pruefen
```

## Spaetere Rechte-Kategorien

Nur Planung:

```text
view:safety_status
view:recovery_guards
view:recovery_preflight
view:audit
view:safetystop
action:diagnostics_refresh_readonly
action:status_resync_readonly
request:recovery_prepare
request:recovery_execute
request:safetystop_clear
admin:system_config
admin:roles_manage
```

## Aktueller Status der Kategorien

```text
view:safety_status = geplant, aktuell keine Rechtepruefung
view:recovery_guards = geplant, aktuell keine Rechtepruefung
view:recovery_preflight = geplant, aktuell keine Rechtepruefung
view:audit = geplant, nicht implementiert
view:safetystop = geplant, nicht implementiert
action:diagnostics_refresh_readonly = geplant, aktuell read-only vorhanden ohne Rollenmodell
action:status_resync_readonly = geplant, aktuell read-only vorhanden ohne Rollenmodell
request:recovery_prepare = blockiert
request:recovery_execute = blockiert
request:safetystop_clear = blockiert
admin:system_config = nicht Teil dieses Strangs
admin:roles_manage = blockiert
```

## Spaetere Rechte-Matrix

Nur Planung:

| Recht | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| view:safety_status | maybe | maybe | yes | yes | yes | geplant |
| view:recovery_guards | no/maybe | maybe | yes | yes | yes | geplant |
| view:recovery_preflight | no/maybe | maybe | yes | yes | yes | geplant |
| view:audit | no | no | maybe | yes | limited | geplant |
| view:safetystop | no/maybe | maybe | yes | yes | yes | geplant |
| action:diagnostics_refresh_readonly | no | maybe | yes | yes | yes | geplant |
| action:status_resync_readonly | no | maybe | yes | yes | yes | geplant |
| request:recovery_prepare | no | no | no/maybe | maybe | no silent | blockiert |
| request:recovery_execute | no | no | no | no/separate planning | no silent | blockiert |
| request:safetystop_clear | no | no | no | no/separate planning | no silent | blockiert |
| admin:roles_manage | no | no | no/maybe | yes | no silent | blockiert |

## High-risk Aktionen bleiben unabhaengig von Rollen blockiert

Auch owner darf in diesem Stand nicht:

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
Confirm Trigger
```

Grund:

```text
Rolle allein ist keine Freigabe.
Audit, Confirm, SafetyStop, Guards, Preflight und separate Planung waeren spaeter zusaetzlich noetig.
```

## Rechte und Audit

Spaeter sollen Rechteentscheidungen auditierbar sein.

Moegliche spaetere Audit Events:

```text
audit.rights.check.request
audit.rights.check.decision
audit.rights.check.result
audit.rights.denied.decision
audit.rights.mutation.request
audit.rights.mutation.blocked.decision
```

Aber:

```text
CAN-17.0 erzeugt keine Audit Events.
```

## Rechte und SafetyStop

SafetyStop Clear duerfte spaeter niemals nur wegen Rolle erlaubt sein.

Planungsregel:

```text
owner/admin Rolle allein reicht nicht.
SafetyStop Clear braucht eigene Planung, Audit, Confirm, Guards und Preflight.
```

## Rechte und Confirm

Confirm darf spaeter nicht Rechte ersetzen.

Planungsregel:

```text
Rechte pruefen zuerst.
Confirm nur zusaetzlicher Schutz.
```

## Rechte und Backend

Spaetere technische Umsetzung muss serverseitig passieren.

Nicht ausreichend:

```text
Button verstecken
CSS-Klasse
Frontend-Flag
localStorage-Rolle
Query-Parameter
```

Erforderlich spaeter:

```text
serverseitige Rechtepruefung
auditierbare Entscheidung
kein Trust auf Client
```

## Rechte und Dashboard

Eine spaetere Dashboard-Anzeige darf Rechte sichtbar machen, aber nicht allein erzwingen.

Moegliche spaetere Hinweise:

```text
Du hast keine Berechtigung fuer Audit.
Diese Aktion ist fuer deine Rolle gesperrt.
High-risk Aktionen bleiben blockiert.
```

CAN-17.0 baut keine Dashboard-Hinweise.

## Rechte und Systemrolle

Die Systemrolle ist kritisch.

Planungsregel:

```text
system darf read-only Checks ausfuehren.
system darf keine stille Recovery ausfuehren.
system darf keine SafetyStop Clears ausfuehren.
system darf keine Replay-/Repair-/Clear-Aktionen eigenstaendig starten.
```

## Rechte und Konfiguration

Spaetere Rollen-/Rechte-Konfiguration braucht eigene Planung.

Nicht Teil von CAN-17.0:

```text
roles.json
permissions.json
DB-Rollen
Userverwaltung
Login
OAuth
Session
```

## No-mutation-Regel

CAN-17.0 darf nichts veraendern:

```text
keine DB
keine Config
keine Runtime-State-Aenderung
keine EventBus-State-Aenderung
keine Queue/Sound/Alert/Overlay-Aenderung
keine OBS-/Streamer.bot-Aktion
```

## Fail-safe-Regel fuer spaeter

Wenn Rechte spaeter nicht eindeutig gelesen werden koennen:

```text
blockieren
```

Nicht erlaubt:

```text
unknown role als admin behandeln
fehlende Rechte als erlaubt behandeln
Client-Angabe als Wahrheit nehmen
```

## Keine technische Umsetzung in CAN-17.0

CAN-17.0 erstellt nicht:

```text
roles.js
rights.js
permissions.js
auth.js
role table
permission table
login page
session middleware
dashboard rights UI
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
```

## Ergebnis CAN-17.0

CAN-17.0 definiert:

```text
Rollen viewer/moderator/admin/owner/system
Grundregel Backend statt UI-Trust
Rechte-Kategorien
Rechte-Matrix
High-risk Blocker unabhaengig von Rollen
Audit-/SafetyStop-/Confirm-Abgrenzung
Systemrollen-Grenzen
No-mutation-Regel
Fail-safe-Regel
```

## Naechster sinnvoller Schritt

```text
CAN-17.1 - Roles/Rights Action Matrix no-mutation Planning
```
