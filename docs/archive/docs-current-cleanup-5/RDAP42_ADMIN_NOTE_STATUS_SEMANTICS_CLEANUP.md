# RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Status-/Routes-Semantik-Cleanup

## Zweck

RDAP42 bereinigt die Status-Semantik nach RDAP40. RDAP40 hat die Admin-Notiz-Create-UI bewusst vorbereitet und live bestätigt. In den Backend-Summaries stand danach noch `uiWriteButtonsEnabled: false`, was nach RDAP40 missverständlich war.

RDAP42 trennt deshalb sauber zwischen:

```text
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
```

## Geänderte Code-Dateien

```text
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Was geändert wurde

- `/api/remote/status` meldet jetzt `statusApiVersion: rdap_admin_note_ui_status42.v1`.
- `/api/remote/routes` meldet jetzt `statusApiVersion: rdap_admin_note_ui_status42.v1`.
- `adminNoteWriteConfirmed` wird in Status/Routes semantisch um RDAP40/RDAP42-Felder ergänzt.
- Neues Feld `adminNoteUiStatusSemantics` dokumentiert die UI-Semantik ausdrücklich.
- Routenbeschreibung für `POST /api/remote/admin/users/admin-notes/create` erwähnt jetzt die RDAP40-Create-UI mit Schreibrecht-Prüfung.

## Sicherheitsgrenzen

RDAP42 ändert keine produktive Funktionalität.

```text
Keine neue Schreibfunktion.
Keine DB-Migration.
Keine Permission-Aenderung.
Keine UI-Erweiterung fuer Update/Deactivate/Delete.
Keine Community-Seiten-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
Keine Secrets im Frontend oder Audit.
```

## Erwartete Tests

Lokal:

```powershell
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
```

Nach Webserver-Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminNoteWriteConfirmed.uiWriteButtonsEnabled, .adminNoteWriteConfirmed.backendAutoUiWriteButtonsEnabled, .adminNoteWriteConfirmed.adminNoteCreateUiPrepared, .adminNoteWriteConfirmed.adminNoteUpdateUiPrepared, .adminNoteUiStatusSemantics'

curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.statusApiVersion, .adminNoteWriteConfirmed.uiWriteButtonsEnabled, .adminNoteWriteConfirmed.backendAutoUiWriteButtonsEnabled, .adminNoteWriteConfirmed.adminNoteCreateUiPrepared, .adminNoteWriteConfirmed.adminNoteUpdateUiPrepared, .adminNoteUiStatusSemantics'
```

Erwartung:

```text
statusApiVersion: rdap_admin_note_ui_status42.v1
adminNoteWriteConfirmed.uiWriteButtonsEnabled: true
adminNoteWriteConfirmed.backendAutoUiWriteButtonsEnabled: false
adminNoteWriteConfirmed.adminNoteCreateUiPrepared: true
adminNoteWriteConfirmed.adminNoteCreateButtonVisibleForWritePermission: true
adminNoteWriteConfirmed.adminNoteUpdateUiPrepared: false
adminNoteWriteConfirmed.adminNoteDeactivateUiPrepared: false
adminNoteWriteConfirmed.adminNoteDeleteUiPrepared: false
adminNoteUiStatusSemantics.prepared: true
adminNoteUiStatusSemantics.newWriteFunctionEnabled: false
```

## Nächster sinnvoller Step

Nach Live-Bestätigung:

```text
RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

Danach kann sinnvoll geplant werden:

```text
RDAP43_ADMIN_NOTE_TARGET_USER_SELECTION_PLAN
```

Ziel RDAP43: weg vom fixen Zieluser `tw:127709954`, hin zu Admin-User-Detailseite/Zieluser-Auswahl.
