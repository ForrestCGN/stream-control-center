# CURRENT_STATUS

Stand: RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP59 klaerte: Admin-Notizen bleiben vorerst Admin-only; kein Community-Read.
RDAP60 klaerte: Update und Deactivate werden nicht gemeinsam gebaut; zuerst nur Update.
RDAP61 aktivierte Backend-Update fuer aktive Admin-Notizen.
RDAP61B dokumentiert die Live-Bestaetigung von RDAP61.
```

## RDAP61 live bestaetigt

```text
Service live ok: true.
POST /api/remote/admin/users/admin-notes/update ist als Backend-confirmed aktiv.
adminNoteUpdateConfirmed.prepared: true.
adminNoteUpdateConfirmed.writeEnabled: true.
adminNoteUpdateConfirmed.productiveWritesEnabled: true.
adminNoteUpdateConfirmed.adminNoteUpdateEnabled: true.
adminNoteUpdateConfirmed.adminNoteCreateStillEnabled: true.
adminNoteUpdateConfirmed.adminNoteDeactivateEnabled: false.
adminNoteUpdateConfirmed.uiWriteButtonsEnabled: false.
adminNoteUpdateConfirmed.frontendUpdateUiPrepared: false.
adminNoteUpdateConfirmed.physicalDeleteEnabled: false.
adminNoteUpdateConfirmed.communityPagesMayReadAdminNotes: false.
adminNoteUpdateConfirmed.activeNotesOnly: true.
adminNoteUpdateConfirmed.rawNoteTextLogged: false.
```

## Disabled-Service live bestaetigt

```text
adminUsersAdminNoteWriteDisabled.routes enthaelt nur noch:
/api/remote/admin/users/admin-notes/deactivate

previouslyDisabledRouteNowConfirmed:
/api/remote/admin/users/admin-notes/update
```

## Admin-Notes aktueller Strukturstand

```text
Bestehende Admin-Notes-Routen liegen in:
remote-modboard/backend/src/routes/admin-users.routes.js

GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> weiter disabled
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

## Bekannter Follow-up

```text
/api/remote/status enthaelt noch aeltere RDAP42-Status-/Hinweistexte, die pauschal sagen, Update sei deaktiviert.
Das muss vor einer Update-UI bereinigt werden.
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
RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
```
