# CURRENT_STATUS

Stand: RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live erfolgreich getestet.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live erfolgreich getestet.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED ist live erfolgreich getestet.
RDAP40B dokumentiert den RDAP40 Live-Stand.
RDAP41 dokumentiert den Status-Semantik-Cleanup-Plan.
RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP ist live erfolgreich getestet.
RDAP42B dokumentiert den RDAP42 Live-Stand.
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

## Admin-Notizen aktueller Funktionsstand

```text
Admin -> Admin-Notizen zeigt Notizen fuer Zieluser tw:127709954.
Create-Button "Neue Notiz" ist fuer write-berechtigte Admins sichtbar.
Create nutzt bestehende RDAP39 Backend-Route.
Nach erfolgreichem Create laedt die UI die Notizliste ueber RDAP39C-Readback neu.
RDAP42 hat die Status-Semantik nach RDAP40 bereinigt.
```

## RDAP42 Live-Ergebnis

```text
/api/remote/routes erfolgreich getestet.
/api/remote/status erfolgreich getestet.
Beide liefern statusApiVersion rdap_admin_note_ui_status42.v1.
```

Bestaetigte Werte:

```text
uiWriteButtonsEnabled: true
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
newWriteFunctionEnabled: false
```

## Aktive Admin-Notizen aus RDAP40-Readback

```text
1. admin_note_20260625171342_d1f871dd6370
2. admin_note_20260625104920_5fec9726d7a3
3. rdap29-test-note-forrestcgn-readonly-validation
```

## Relevante API-Staende

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
GET  /api/remote/routes
GET  /api/remote/status
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

## Naechster empfohlener Step

```text
RDAP43_ADMIN_USER_DETAIL_TARGET_SELECTION_PLAN
```

Ziel: Admin-Notizen von fixem Zieluser `tw:127709954` loesen und User-Detailseite/Zieluser-Auswahl planen.
