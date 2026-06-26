# CURRENT_STATUS

Stand: RDAP73_ADMIN_NOTES_HUMAN_READABLE_LIST  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP62B: Live-Befund dokumentiert.
RDAP63: Update-UI-Scope geplant.
RDAP64: Update-UI in rdap28-admin-notes.js implementiert, aber live nicht sichtbar.
RDAP64B: Router/Tab-Hotfix versucht, live nicht ausreichend.
RDAP64C: Existing-Nav-Bind-Hotfix versucht, live weiterhin leer.
RDAP64D: Admin-Notes ueber Haupt-Router sichtbar gemacht, live bestaetigt.
RDAP64E: Doku-/Status-Step nach RDAP64D auf GitHub/dev abgeschlossen.
RDAP65B: Admin-Notes fachlich im Browser bestaetigt; Create, Update, User-Detail und Navigation funktionieren.
RDAP67: Admin-Notes UI-Polish vorbereitet; Frontend-only.
RDAP68: RDAP67 live fachlich bestaetigt; Layout weiter verbesserungswuerdig.
RDAP69: Admin-Notes Compact-Layout vorbereitet; Frontend-only.
RDAP70: RDAP69 live technisch bestaetigt; Layout fachlich weiterhin zu technisch.
RDAP71: Admin-Notes Clean-Layout vorbereitet; Frontend-only.
RDAP72: technische Statusbloecke in Normalansicht ausgeblendet; Frontend-only.
RDAP73: Admin-Notes-Liste menschlicher lesbar gemacht; Frontend-only.
```

## RDAP73 Umsetzung

```text
Geaendert:
remote-modboard/backend/public/assets/remote-modboard.js

Art:
- idempotente Style-Injection rdap73AdminNotesHumanReadableListStyle
- technische Chips Admin-only / Read/Create/Update in Hauptansicht ausgeblendet
- Hinweistext vereinfacht
- technische noteUid nicht mehr als sichtbare Hauptueberschrift
- Notiz-Titel menschlich formatiert
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
RDAP74_ADMIN_NOTES_HUMAN_READABLE_LIST_LIVE_VERIFICATION_DOC
```
