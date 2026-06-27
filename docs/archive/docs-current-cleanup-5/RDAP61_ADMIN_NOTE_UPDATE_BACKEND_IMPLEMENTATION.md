# RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP61 setzt den in RDAP60 geplanten kleinsten Backend-Update-Scope fuer Admin-Notizen um.

RDAP61 ist ein Backend-Code-Step.

Es wird keine Frontend-Update-UI gebaut.

## Ausgangspunkt

Bestaetigter Stand nach RDAP60:

```text
Update und Deactivate werden nicht gemeinsam gebaut.
Zuerst soll nur Admin-Note Update als kleinster sinnvoller Write-Scope vorbereitet werden.
Deactivate bleibt danach ein separater Scope.
```

Bestehende Routen:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

Vor RDAP61 zeigte Update noch auf den disabled-Service.

## Umsetzung RDAP61

RDAP61 nutzt die bestehende Update-Route weiter und erfindet keine neue Route.

Geaendert wurde:

```text
POST /api/remote/admin/users/admin-notes/update
```

Die Route wird von disabled auf confirmed umgestellt:

```text
buildAdminUserAdminNoteWriteConfirmed({ context, req, action: 'update' })
```

Der bestehende confirmed-Service wurde erweitert:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

## Erlaubter Update-Scope

Erlaubte Eingaben:

```text
targetUserUid
noteUid
noteText
confirmWrite: true
```

Serverseitig wird ausschliesslich gesetzt:

```text
note_text = validierter noteText
updated_by_user_uid = actor.userUid
updated_at = now
```

Update ist nur erlaubt, wenn:

```text
Notiz existiert.
Notiz gehoert zu targetUserUid.
Notiz status = active.
```

Inactive/deactivated Notizen werden im ersten Update-Scope nicht editiert.

## Schutzbausteine

Der Update-Write verwendet:

```text
gueltige Session
DashboardAccess
remote.view
admin.users.note.write
confirmWrite nur aus JSON-Body
Zieluser-Validierung
noteUid-Validierung
noteText-Validierung mit max. 5000 Zeichen
Tabellen-/Schema-Pruefung
Lock
Audit attempt/success/failure
Read-Back nach Update
Lock Release
```

## Lock

Fuer Update:

```text
resourceType: admin_user_note
resourceKey: admin_user_note:<noteUid>
lockScope fachlich: admin.users.note:<targetUserUid>
```

Die technische Lock-Tabelle nutzt `resource_key`.

Lock-Fehler verhindert den Write.

## Audit

Audit-Action:

```text
admin.user_note.update
```

Raw `note_text` wird nicht ins Audit geschrieben.

Audit nutzt nur sichere Metadaten:

```text
targetUserUid
noteUid
oldNoteTextLength
newNoteTextLength
confirmWriteAccepted
rawNoteTextLogged: false
```

## Read-Back

Nach Update wird die Notiz serverseitig erneut gelesen.

Pflichtpruefung:

```text
exists true
noteUid passt
targetUserUid passt
status active
noteTextLength passt
updated_by_user_uid passt zu actor.userUid
updated_at gesetzt
```

Die Update-Response setzt:

```text
noteTextReturned: false
readBackPerformed: true
readBackFound: true
```

## Weiterhin nicht umgesetzt

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Public-/Profil-/Self-Service-Nutzung.
Keine Session-Revocation.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Erwartete lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\admin-user-admin-note-write-confirmed.service.js

git status --short
git diff --stat
```

## Webserver-Deploy

RDAP61 aendert Backend-Code.

Nach lokalem `stepdone.cmd` ist ein Webserver-Deploy aus frischem GitHub/dev-Clone noetig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
cd RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
sudo bash tools/remote-modboard-deploy.sh RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION dev
```

Kein manueller Zusatz-Restart nach Deploy.

## Nach Deploy pruefen

Empfohlene Live-Checks:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

Produktiver Update-Test nur mit gueltiger eingeloggter Admin-Session und bewusstem `confirmWrite:true`.

## Ergebnis

```text
RDAP61 aktiviert Backend-Update fuer aktive Admin-Notizen.
Create bleibt erhalten.
Deactivate bleibt deaktiviert.
Delete bleibt verboten.
Keine Update-UI wurde gebaut.
```

## Naechster sinnvoller Step

Nach lokalem Test und Webserver-Deploy:

```text
RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS
```

Ziel: Live-Befund dokumentieren, inklusive Routenstatus und sicherer Update-Test-Bestaetigung.
