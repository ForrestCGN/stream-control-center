# CURRENT_STATUS

Stand: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt / vorbereitet

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
Der erste kontrollierte produktive Backend-Create-Write fuer Admin-Benutzernotizen wurde ausgefuehrt.
RDAP39B dokumentierte den Live-Stand.
RDAP39C stellt die fehlende echte Admin-Notiz-Readroute im Repo wieder her/synchronisiert sie.
```

## Live-System

```text
Webserver: mods.forrestcgn.de
Service: scc-remote-modboard.service
Live-Pfad: /opt/stream-control-center/remote-modboard
DB: MariaDB 11.8.6 / c3stream_control
DB-Client: /root/rdap29_mysql_client.cnf
Branch: dev
```

## RDAP39 Create-Stand

```text
Route: POST /api/remote/admin/users/admin-notes/create
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
statusApiVersion: rdap_admin_note_write39.v1
confirmWrite: Pflicht, nur JSON-Body
```

## RDAP39 erstellte Test-Notiz

```text
note_uid: admin_note_20260625104920_5fec9726d7a3
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
created_at: 2026-06-25 12:49:20
updated_at: 2026-06-25 12:49:20
```

## RDAP39C Read-Restore

```text
Route: GET /api/remote/admin/users/admin-notes/read
Service: buildAdminUserAdminNoteRealReadAuthed
Service-Datei: remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
routeBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
statusApiVersion: rdap_admin_users27.v1
```

## Sicherheitsstand

```text
Readroute bleibt read-only.
Create ist backendseitig bestaetigt, aber UI-Create ist noch nicht gebaut.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Community-Read fuer Admin-Notizen bleibt verboten.
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control bleibt deaktiviert.
```

## Naechster empfohlener Step

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```
