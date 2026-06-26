# CURRENT_STATUS

Stand: RDAP62B_ADMIN_NOTE_UPDATE_STATUS_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP59 klaerte: Admin-Notizen bleiben vorerst Admin-only; kein Community-Read.
RDAP60 klaerte: Update und Deactivate werden nicht gemeinsam gebaut; zuerst nur Update.
RDAP61 aktivierte Backend-Update fuer aktive Admin-Notizen.
RDAP61B dokumentierte die Live-Bestaetigung von RDAP61.
RDAP62 bereinigte die Status-Semantik nach RDAP61.
RDAP62B dokumentiert die Live-Bestaetigung von RDAP62.
```

## RDAP62 live bestaetigt

```text
/api/remote/status:
statusApiVersion: rdap_admin_note_update_status62.v1

Update-Backend aktiv:
adminNoteUiStatusSemantics.adminNoteUpdateBackendEnabled: true
adminNoteUiStatusSemantics.adminNoteUpdateRoutePrepared: true
adminNoteUiStatusSemantics.adminNoteUpdateRoute: /api/remote/admin/users/admin-notes/update

Update-UI aus:
adminNoteUiStatusSemantics.adminNoteUpdateUiPrepared: false

Deactivate/Delete aus:
adminNoteUiStatusSemantics.adminNoteDeactivateEnabled: false
adminNoteUiStatusSemantics.adminNoteDeleteUiPrepared: false
adminNoteUiStatusSemantics.physicalDeleteEnabled: false

Community-Read verboten:
adminNoteUiStatusSemantics.communityPagesMayReadAdminNotes: false
```

## RDAP61 Route weiterhin bestaetigt

```text
/api/remote/routes:
adminNoteUpdateConfirmed.writeEnabled: true
adminNoteUpdateConfirmed.productiveWritesEnabled: true
adminNoteUpdateConfirmed.adminNoteUpdateEnabled: true
adminNoteUpdateConfirmed.adminNoteCreateStillEnabled: true
adminNoteUpdateConfirmed.adminNoteDeactivateEnabled: false
adminNoteUpdateConfirmed.uiWriteButtonsEnabled: false
adminNoteUpdateConfirmed.frontendUpdateUiPrepared: false
adminNoteUpdateConfirmed.activeNotesOnly: true
adminNoteUpdateConfirmed.rawNoteTextLogged: false
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

## Weiterhin deaktiviert

```text
Admin-Note Update-UI
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```

