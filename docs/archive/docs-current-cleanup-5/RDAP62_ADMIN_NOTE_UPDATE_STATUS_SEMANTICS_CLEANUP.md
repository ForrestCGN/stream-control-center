# RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP62 bereinigt die Status-Semantik nach RDAP61/RDAP61B.

RDAP61 hat das Admin-Note Update-Backend aktiviert. RDAP61B hat live bestaetigt:

```text
POST /api/remote/admin/users/admin-notes/update ist Backend-confirmed aktiv.
adminNoteUpdateConfirmed.writeEnabled: true
adminNoteUpdateConfirmed.productiveWritesEnabled: true
adminNoteUpdateConfirmed.adminNoteUpdateEnabled: true
adminNoteUpdateConfirmed.frontendUpdateUiPrepared: false
adminNoteUpdateConfirmed.uiWriteButtonsEnabled: false
Deactivate bleibt disabled.
Delete bleibt verboten.
Community-Read bleibt verboten.
```

## Problem vor RDAP62

`/api/remote/status` enthielt noch aeltere RDAP42-Hinweistexte, die pauschal sagten:

```text
Admin-Notiz Update/Deactivate/Delete bleiben deaktiviert.
adminNoteUiStatusSemantics.adminNoteUpdateEnabled: false
Update, Deactivate und Delete bleiben deaktiviert.
```

Das war nach RDAP61 zu grob, weil nur die Update-UI weiter fehlt. Das Update-Backend ist inzwischen aktiv.

## Aenderung RDAP62

Geaendert wurde nur:

```text
remote-modboard/backend/src/routes/status.routes.js
```

RDAP62 trennt im Status nun sauber:

```text
Admin-Note Create-Backend: aktiv
Admin-Note Create-UI: vorbereitet/aktiv fuer write-berechtigte Admins
Admin-Note Update-Backend: aktiv
Admin-Note Update-UI: nicht gebaut
Admin-Note Deactivate: deaktiviert
Admin-Note Delete: verboten
Community-Read: verboten
```

## Status-API

Neuer Status-API-Wert:

```text
rdap_admin_note_update_status62.v1
```

Neuer Build-Hinweis:

```text
RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
```

## Semantik nach RDAP62

`auth.notes` sagt nicht mehr pauschal, dass Update deaktiviert ist.

Stattdessen gilt:

```text
RDAP39 aktiviert Create-Backend.
RDAP40 aktiviert Create-UI.
RDAP61 aktiviert Update-Backend.
RDAP62 baut keine neue UI.
Update-UI, Deactivate und Delete bleiben deaktiviert.
```

`adminNoteUiStatusSemantics` enthaelt nun getrennte Felder:

```text
adminNoteCreateBackendEnabled: true
adminNoteCreateUiPrepared: true
adminNoteUpdateBackendEnabled: true
adminNoteUpdateRoutePrepared: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateEnabled: false
adminNoteDeleteUiPrepared: false
physicalDeleteEnabled: false
communityPagesMayReadAdminNotes: false
newUiFunctionEnabled: false
```

`adminNoteWriteConfirmed` zeigt ebenfalls:

```text
createBackendEnabled: true
updateBackendEnabled: true
deactivateBackendEnabled: false
deleteBackendEnabled: false
adminNoteUpdateUiPrepared: false
noNewUiFunctionInRdap62: true
```

## Was RDAP62 ausdruecklich nicht tut

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Erwartete Checks

Lokal:

```powershell
node --check .\remote-modboard\backend\src\routes\status.routes.js
```

Nach Webserver-Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.statusApiVersion, .auth.notes, .adminNoteUiStatusSemantics'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

## Erwarteter Live-Befund nach Deploy

```text
statusApiVersion: rdap_admin_note_update_status62.v1
adminNoteUiStatusSemantics.adminNoteUpdateBackendEnabled: true
adminNoteUiStatusSemantics.adminNoteUpdateUiPrepared: false
adminNoteUiStatusSemantics.adminNoteDeactivateEnabled: false
adminNoteUiStatusSemantics.physicalDeleteEnabled: false
communityPagesMayReadAdminNotes: false
```

## Naechster sinnvoller Step

Nach Live-Bestaetigung:

```text
RDAP62B_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

Danach erst:

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```
