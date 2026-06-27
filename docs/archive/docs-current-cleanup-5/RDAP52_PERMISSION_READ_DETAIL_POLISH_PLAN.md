# RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Plan-only / Doku-only

## Ausgangslage

RDAP51/RDAP51B ist der bestaetigte Ausgangsstand:

- Admin-User-Detail ist read-only sichtbar.
- ForrestCGN @forrestcgn / `tw:127709954` ist im User-Detail auswaehlbar.
- Name/Login/UID/Status, Rollen, Gruppen und Sessions sind read-only sichtbar.
- Es gibt keine sichtbare Rollen-/Gruppen-/Permission-Schreibverwaltung.
- Die Bridge User-Detail -> Admin-Notizen ist live bestaetigt.
- Admin-Notizen uebernimmt beim Oeffnen aus dem User-Detail exakt denselben Zieluser.
- Der Kontext-Hinweis `Aus User-Detail geoeffnet` ist sichtbar.
- `Zurueck zum User-Detail` und `Hinweis ausblenden` sind sichtbar.

## Ziel von RDAP52

RDAP52 plant die naechste read-only Politur fuer Permission-/Rollen-Details im Admin-Bereich.

Es soll zuerst besser sichtbar und erklaerbar werden:

```text
Welche Rollen hat der ausgewaehlte User?
Welche Gruppen hat der ausgewaehlte User?
Welche Permissions ergeben sich aus Rollen/Gruppen?
Welche Module/Targets sind betroffen?
Welche Rechte sind nur Anzeige/Diagnose?
Welche Bereiche bleiben bewusst gesperrt?
```

RDAP52 baut noch keine Umsetzung. Dieser Step ist nur Plan/Dokumentation.

## Verbindlicher Scope

```text
Plan-only
Doku-only
Keine Code-Aenderung
Keine Backend-Aenderung
Keine neue Route
Keine DB-Migration
Keine produktiven Writes
Keine Permission-Schreibverwaltung
Keine Rollen-/Gruppen-Schreibverwaltung
Keine Session-Revocation
Keine Admin-Note Update-/Deactivate-/Delete-Funktion
Kein Webserver-Deploy noetig
```

## Relevante bestehende Datenquelle

Weiterverwendet werden soll vorrangig:

```text
GET /api/remote/auth/model
```

Die Route liefert read-only bereits die fachlich relevanten Daten:

```text
model.users
model.userRoles
model.userGroups
model.roles
model.groups
model.permissions
model.rolePermissions
model.modulePermissions
model.sessions
schema
counts
validation
```

Planregel:

```text
Keine neue Backend-Route bauen, solange /api/remote/auth/model fuer die read-only Detailansicht reicht.
```

## Geplante fachliche Anzeige fuer RDAP53

RDAP53 kann nach separatem `go` als Umsetzung vorbereitet werden.

Empfohlene UI-Politur:

### 1. User-Detail erweitert um Permission-Zusammenfassung

Im bestehenden Admin-User-Detail soll fuer den aktuell ausgewaehlten User read-only angezeigt werden:

```text
User
Login
Twitch-ID / Provider-Key
Aktiver Status
Direkte Rollen
Direkte Gruppen
Sessions
Effektive Permission-Zusammenfassung
```

Wichtig:

```text
Die Anzeige ist Diagnose/Transparenz.
Das Frontend entscheidet keine Rechte.
Das Backend bleibt die verbindliche Wahrheit.
```

### 2. Rollen-Detail read-only

Fuer jede Rolle des Users soll sichtbar werden:

```text
Rollenname
Rollenstatus
zugeordnete Permissions
ob die Rolle systemisch/owner/admin/mod/spezial ist, falls Daten vorhanden
```

Wenn Daten fehlen oder unvollstaendig sind:

```text
Nicht raten.
Als "nicht im Modell enthalten" oder "nicht eindeutig ableitbar" anzeigen.
```

### 3. Gruppen-Detail read-only

Fuer jede Gruppe des Users soll sichtbar werden:

```text
Gruppenname
Gruppenstatus
zugeordnete Rollen/Permissions, soweit aus dem Modell ableitbar
```

Wenn das aktuelle Modell Gruppen-Permissions nicht direkt abbildet:

```text
Nicht erfinden.
Nur direkte Daten anzeigen.
Offenen Datenbedarf in TODO/Doku festhalten.
```

### 4. Effektive Permissions read-only

Aus den vorhandenen Modelldaten kann UI-seitig eine read-only Ansicht vorbereitet werden:

```text
Permission-Key
Quelle: Rolle / Gruppe / direkt, soweit ableitbar
Modul / Target, soweit ueber modulePermissions ableitbar
Status / Beschreibung, soweit vorhanden
```

Wichtig:

```text
Keine Freigabe-Logik im Frontend bauen.
Keine "User darf X" Entscheidungen produktiv aus dem Frontend ableiten.
Nur erklaeren, welche Daten im Modell sichtbar sind.
```

### 5. Module/Targets

Wenn `model.modulePermissions` passende Daten enthaelt, soll die Anzeige gruppieren nach:

```text
Modul
Target
Permission
Quelle
Status
```

Wenn die Struktur nicht eindeutig ist:

```text
Read-only Diagnose anzeigen.
Keine neue Semantik erfinden.
```

### 6. Safety-Hinweis

Die UI soll klar sichtbar machen:

```text
Read-only.
Keine Schreibverwaltung in diesem Bereich.
Frontend zeigt nur an.
Backend entscheidet.
Write-Steps brauchen spaeter eigenen Plan mit Permission, Confirm, Locking, Audit, Backup/Read-Back.
```

## Technische Richtung fuer RDAP53

RDAP53 sollte, wenn freigegeben, klein und frontend-orientiert bleiben:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
```

Nur wenn notwendig:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aber Admin-Notizen sollen nicht mit Permission-Verwaltung vermischt werden.

Backend-Dateien bleiben in RDAP53 nur dann unangetastet, wenn `/api/remote/auth/model` reicht:

```text
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Nicht bauen

Ausdruecklich nicht bauen:

```text
Permission speichern
Rollen vergeben
Gruppen vergeben
User aktivieren/deaktivieren
Session widerrufen
Admin-Note Update
Admin-Note Deactivate
Admin-Note Delete
Community-Read fuer Admin-Notizen
Agent-Actions
OBS-Steuerung
Sound-Steuerung
Overlay-Steuerung
Command-Steuerung
Channelpoints-Steuerung
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Tests fuer RDAP52

Da Doku-only:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN.zip" "RDAP52 Permission-Read-Detail-Polish geplant"

git status --short
git diff --stat
```

Erwartung:

```text
Nur docs/current/* und project-state/* geaendert.
Keine remote-modboard Code-Dateien geaendert.
Kein Node-Neustart noetig.
Kein Webserver-Deploy noetig.
```

Abschluss nach Kontrolle:

```powershell
.\stepdone.cmd "RDAP52 Permission-Read-Detail-Polish geplant; Doku-only, keine Code-Aenderung, keine Writes, kein Webserver-Deploy"
```

## Naechster sinnvoller Step danach

```text
RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED
```

Empfohlener Fokus fuer RDAP53:

```text
Frontend-only read-only Permission-Detail-Anzeige im bestehenden Admin-User-Detail vorbereiten.
Bestehendes /api/remote/auth/model auswerten.
Keine neue Backend-Route.
Keine Writes.
Keine DB-Migration.
```
