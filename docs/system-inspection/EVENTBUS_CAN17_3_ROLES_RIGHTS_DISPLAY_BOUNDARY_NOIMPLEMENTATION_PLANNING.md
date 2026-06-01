# EVENTBUS CAN-17.3 - Roles/Rights Display Boundary no-implementation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-17.3

## Zweck

CAN-17.3 plant, wie Rollen-/Rechte-Informationen spaeter im Dashboard angezeigt werden duerften, ohne Anzeige, API oder Rechtepruefung technisch zu bauen.

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
Keine Rechte-Durchsetzung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-17.0 hat die Roles/Rights Boundary no-mutation geplant.

CAN-17.1 hat die Roles/Rights Action Matrix no-mutation geplant.

CAN-17.2 hat die Backend Boundary no-implementation geplant.

CAN-17.3 beschreibt nun reine Anzeigegrenzen.

## Harte Grenze fuer CAN-17.3

CAN-17.3 darf nicht enthalten:

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Middleware
Mutation
Recovery-Ausfuehrung
POST-Route
GET-Route fuer Rechte
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Display-Grundregel

Dashboard-Anzeige darf spaeter Rechte erklaeren, aber nicht ersetzen.

Nicht ausreichend:

```text
Button verstecken
Tab verstecken
Warntext anzeigen
Frontend-Rolle anzeigen
```

Erforderlich spaeter fuer echte Rechte:

```text
serverseitige Rechtepruefung
auditierbare Entscheidung
fail-safe Default
```

## Moegliche spaetere Anzeigeorte

Nur Planung:

```text
Admin / System / Rechte
Event-Bus / Communication Bus / Recovery / Rechte-Hinweise
Safety Status View / Rechte-Status
Audit / Zugriffsstatus
```

CAN-17.3 baut keine Anzeige.

## Anzeigezustaende fuer spaeter

### 1. Keine Rechte-Implementierung

Textidee:

```text
Rollen/Rechte sind geplant, aber technisch noch nicht aktiv.
Es wird keine Rechte-API geladen.
```

### 2. Rolle unbekannt

Textidee:

```text
Deine Rolle ist unbekannt. Riskante Aktionen bleiben blockiert.
```

### 3. Nicht berechtigt

Textidee:

```text
Du hast keine Berechtigung fuer diesen Bereich oder diese Aktion.
```

### 4. Read-only erlaubt

Textidee:

```text
Diese Ansicht ist read-only erlaubt.
```

### 5. High-risk blockiert

Textidee:

```text
Diese Aktion bleibt unabhaengig von deiner Rolle blockiert.
```

### 6. Backend-Pruefung fehlt

Textidee:

```text
Keine serverseitige Rechtepruefung vorhanden. Fail-safe blockiert.
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
  "section": "rolesRights",
  "contractVersion": "CAN-17.3",
  "readOnly": true,
  "hasApi": false,
  "hasMutation": false,
  "known": false,
  "role": "unknown",
  "permissionCheckAvailable": false,
  "serverSideEnforced": false,
  "level": "warning",
  "label": "Nicht technisch aktiv",
  "message": "Rollen/Rechte sind geplant, aber noch nicht implementiert.",
  "highRiskActionsBlocked": true,
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
role
permissionCheckAvailable
serverSideEnforced
level
label
message
highRiskActionsBlocked
```

## Feldregeln

### readOnly

Muss fuer diesen Planungsstrang bleiben:

```text
true
```

### hasApi

Muss fuer CAN-17.3 bleiben:

```text
false
```

### hasMutation

Muss fuer CAN-17.3 bleiben:

```text
false
```

### known

Wenn keine technische Rollenquelle vorhanden ist:

```text
false
```

### role

Ohne technische Rechtequelle:

```text
unknown
```

### permissionCheckAvailable

Ohne Backend-Rechtepruefung:

```text
false
```

### serverSideEnforced

Ohne Backend-Durchsetzung:

```text
false
```

### highRiskActionsBlocked

Default:

```text
true
```

## Rollenanzeige fuer spaeter

Nur Planung:

```text
viewer
moderator
admin
owner
system
unknown
```

Wichtig:

```text
unknown darf nie als admin/owner behandelt werden.
```

## Aktionsanzeige fuer spaeter

Eine spaetere UI darf Aktionen gruppieren:

```text
Read-only moeglich
Read-only ggf. eingeschraenkt
High-risk blockiert
Separate Planung erforderlich
Nicht verfuegbar
```

## High-risk Blocker Anzeige

Diese Aktionen sollen spaeter weiterhin klar als blockiert erscheinen:

```text
Recovery Execute
Recovery Prepare
SafetyStop Clear
SafetyStop Reset
Queue Clear
Alert Replay
Sound Replay
Overlay Repair
OBS Source Refresh
Streamer.bot Action Retry
Audit Write
Rights Mutation
Confirm Trigger
```

## Keine Buttons in CAN-17.3

Nicht erlaubte UI-Elemente:

```text
Rolle setzen
Rolle entfernen
Rechte speichern
Login
Logout
Benutzer anlegen
Benutzer loeschen
Recovery starten
SafetyStop clearen
Audit exportieren
```

## Keine Mock-/Fake-Rechte

Nicht erlaubt:

```text
Mock-Admin
Mock-Owner
hart codierter Owner
Demo-Login
Fake-Permission
Frontend-only Permission
```

## UX-Regeln fuer spaeter

Eine spaetere Anzeige muss klar sagen:

```text
Rechte-Anzeige ist informativ.
Backend-Pruefung ist massgeblich.
High-risk Aktionen bleiben blockiert.
Unbekannte Rolle blockiert.
```

Nicht erlaubt:

```text
unknown als OK
fehlende Backend-Pruefung als erlaubt
Button sichtbar = Recht vorhanden
UI-Status = serverseitige Freigabe
```

## Datenschutzregel

Rollen-/Rechte-Anzeige darf spaeter keine Secrets zeigen.

Nicht anzeigen:

```text
Session Tokens
OAuth Tokens
Cookies
Authorization Header
vollstaendige User-Payloads
private Rohdaten
```

## Audit-Hinweis fuer spaeter

Eine spaetere Rechteanzeige kann anzeigen:

```text
Rechteentscheidungen sollen spaeter auditierbar sein.
```

Aber:

```text
CAN-17.3 baut keine Audit-Integration.
```

## SafetyStop-Hinweis fuer spaeter

Eine spaetere Rechteanzeige kann anzeigen:

```text
SafetyStop kann Rechteentscheidungen fuer riskante Aktionen blockieren.
```

Aber:

```text
CAN-17.3 baut keine SafetyStop-Integration.
```

## Confirm-Hinweis fuer spaeter

Eine spaetere Rechteanzeige kann anzeigen:

```text
Confirm ist zusaetzlicher Schutz, ersetzt aber keine Rechte.
```

Aber:

```text
CAN-17.3 baut keine Confirm-Integration.
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

## Ergebnis CAN-17.3

CAN-17.3 definiert:

```text
Display-Grundregel
moegliche Anzeigeorte
Anzeigezustaende
Anzeige-Level
Display Contract
Pflichtfelder
Feldregeln
Rollenanzeige
Aktionsanzeige
High-risk Blocker Anzeige
No-Button-/No-Mock-Regeln
UX-Regeln
Datenschutzregel
Audit-/SafetyStop-/Confirm-Hinweise
```

## Naechster sinnvoller Schritt

```text
CAN-17.4 - Roles/Rights Planning Closure / Handoff
```
