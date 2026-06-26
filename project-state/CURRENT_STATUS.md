# CURRENT_STATUS

Stand: RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP62B: Live-Befund dokumentiert.
RDAP64D: Admin-Notes ueber Haupt-Router sichtbar gemacht, live bestaetigt.
RDAP65B: Admin-Notes fachlich im Browser bestaetigt; Create, Update, User-Detail und Navigation funktionieren.
RDAP67: Admin-Notes UI-Polish vorbereitet; Frontend-only.
RDAP68: RDAP67 live fachlich bestaetigt; Layout weiter verbesserungswuerdig.
RDAP69: Admin-Notes Compact-Layout vorbereitet; Frontend-only.
RDAP70: RDAP69 live technisch bestaetigt; Layout fachlich weiterhin zu technisch.
RDAP71: Admin-Notes Clean-Layout vorbereitet; Frontend-only.
RDAP72: technische Statusbloecke in Normalansicht ausgeblendet; Frontend-only.
RDAP73: Admin-Notes-Liste menschlicher lesbar gemacht; Frontend-only.
RDAP74: Header/Toolbar-Doppelstand bereinigt; Frontend-only.
```

## RDAP74 Umsetzung

```text
Geaendert:
remote-modboard/backend/public/assets/remote-modboard.js

Art:
- idempotente Style-Injection rdap74AdminNotesHeaderActionsDedupStyle
- initAdminNotesHeaderActionsDedup() ergaenzt
- Buttons "Notizen neu laden" und "Neue Notiz" in oberen Admin-Notizen-Header verschoben
- separate Toolbar "Admin-Notizen" ausgeblendet
- bestehende Button-IDs/Eventhandler bleiben erhalten
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

## Naechster empfohlener Step

```text
RDAP75_ADMIN_NOTES_HEADER_ACTIONS_LIVE_VERIFICATION_DOC
```
