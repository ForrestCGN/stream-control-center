# CURRENT_STATUS

Stand: RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP59 klaerte: Admin-Notizen bleiben vorerst Admin-only; kein Community-Read.
RDAP60 klaerte: Update und Deactivate werden nicht gemeinsam gebaut; zuerst nur Update.
RDAP61 aktiviert Backend-Update fuer aktive Admin-Notizen.
```

## RDAP61 Umsetzung

```text
POST /api/remote/admin/users/admin-notes/update nutzt jetzt buildAdminUserAdminNoteWriteConfirmed(... action: 'update').
Der confirmed-Service unterstuetzt create und update.
Update schreibt nur note_text, updated_by_user_uid und updated_at.
Update ist nur fuer aktive Notizen erlaubt.
Deactivate bleibt disabled.
Delete bleibt verboten.
Keine Update-UI wurde gebaut.
```

## Admin-Notes aktueller Strukturstand

```text
Bestehende Admin-Notes-Routen liegen in:
remote-modboard/backend/src/routes/admin-users.routes.js

GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate -> weiter disabled
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

## Weiterhin deaktiviert

```text
Admin-Note Deactivate
Physisches Delete
Update-UI
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS
```
