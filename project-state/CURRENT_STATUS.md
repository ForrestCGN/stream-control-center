# CURRENT_STATUS

Stand: RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS wurde nach GitHub/dev gebracht.
RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN wurde nach GitHub/dev gebracht.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist als Backend-Status-Cleanup gebaut.
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

## RDAP42 Ziel

```text
Status-/Routes-Summary nach RDAP40 semantisch bereinigen.
`uiWriteButtonsEnabled: false` nicht mehr missverstaendlich stehen lassen.
Klar trennen zwischen Backend-Auto-UI und bewusst vorbereiteter Create-UI.
```

## RDAP42 erwartete Status-Semantik

```text
statusApiVersion: rdap_admin_note_ui_status42.v1
backendAutoUiWriteButtonsEnabled: false
uiWriteButtonsEnabled: true
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
newWriteFunctionEnabled: false
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
Permission-Vergabe in der UI
DB-Migration
```

## Naechster empfohlener Step

Nach Live-Bestaetigung:

```text
RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```
