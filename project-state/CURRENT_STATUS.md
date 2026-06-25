# CURRENT_STATUS

Stand: RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP40B dokumentiert den Live-Stand und aktualisiert Projektstatus/TODO/NEXT_STEPS/CHANGELOG.
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

## RDAP40 UI-Stand

```text
Admin -> Admin-Notizen zeigt Notizen fuer tw:127709954.
Create-Button "Neue Notiz" ist fuer write-berechtigte Admins sichtbar.
Create nutzt bestehende RDAP39 Backend-Route.
Nach erfolgreichem Create laedt die UI die Notizliste ueber RDAP39C-Readback neu.
```

## RDAP40 Live-Ergebnis

```text
Browser-UI: 3 Admin-Notiz(en) geladen.
Create-Button sichtbar.
Neue Notiz wurde erstellt.
Liste wurde danach automatisch aktualisiert.
Keine Update-/Deactivate-/Delete-Buttons sichtbar.
```

## Erstellte RDAP40 Test-Notiz

```text
note_uid: admin_note_20260625171342_d1f871dd6370
target_user_uid: tw:127709954
status: active
note_text: —test
updated_at im UI: 2026-06-25T17:13:42.000Z
```

## Aktive Admin-Notizen im UI-Readback

```text
1. admin_note_20260625171342_d1f871dd6370
2. admin_note_20260625104920_5fec9726d7a3
3. rdap29-test-note-forrestcgn-readonly-validation
```

## Relevante API-Staende

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
```

Read-Route:

```text
statusApiVersion: rdap_admin_users27.v1
routeRestoreBuild: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
serviceBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
readOnly: true
writeEnabled: false
```

Create-Route:

```text
statusApiVersion: rdap_admin_note_write39.v1
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
adminNoteCreateEnabled: true
adminNoteUpdateEnabled: false
adminNoteDeactivateEnabled: false
physicalDeleteEnabled: false
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
Permission-Vergabe in der UI
```

## Bekannte Semantik-Unsauberkeit

```text
/api/remote/routes zeigt in adminNoteWriteConfirmed noch uiWriteButtonsEnabled: false.
Das stammt aus RDAP39 und ist nach RDAP40 semantisch ungenau, weil RDAP40 bewusst einen Create-Button fuer write-berechtigte Admins zeigt.
Kein akuter Funktionsfehler.
```

## Naechster empfohlener Step

```text
RDAP41_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```
