# CURRENT_STATUS

Stand: RDAP77B_MODULE_REGISTRY_PANEL_MOUNT_AND_VISIBILITY_FIX  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP76D: Admin-Modul-/Page-Registry-Zielstruktur dokumentiert; Doku-only.
RDAP77: Frontend-Registry-Fundament fuer Module/Pages begonnen.
RDAP77B: Panel-Mount-/Sichtbarkeitsfix fuer Registry/Admin-Unterseiten vorbereitet.
```

## Strukturstand

```text
remote-modboard.js fuehrt Haupt-Router und Frontend-Registry.
Admin wird als Obermodul registriert.
Admin-Notizen und User-Detail sind Admin-Pages.
Inaktive Panels werden jetzt per hidden und is-active-view konsequent versteckt.
```

## Admin-Notes aktueller Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Code-Step

```text
RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```
