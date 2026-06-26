# CURRENT_STATUS

Stand: RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP64D: Admin-Notes ueber Haupt-Router sichtbar gemacht, live bestaetigt.
RDAP65B: Admin-Notes fachlich im Browser bestaetigt; Create, Update, User-Detail und Navigation funktionieren.
RDAP67-RDAP74: Admin-Notes UI schrittweise enttechnisiert; Frontend-only.
RDAP75: Design-Contract und Findings dokumentiert.
RDAP75B: Doku-/Uebergabe-Stand und neuer Chat-Prompt aktualisiert.
RDAP76B: Zentrale Projekt-/UI-/Roadmap-Dokumentation konsolidiert; Doku-only.
RDAP76: Admin-Notes Router-/Header-State-Fix vorbereitet; Frontend-only.
```

## Zentrale Doku ab jetzt

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP76.md
```

## Aktueller Browser-/Design-Stand

```text
Admin-Notes sind sichtbar.
Create/Update funktionieren grundsaetzlich.
Delete/Deactivate sind nicht sichtbar.
Technische Statusbloecke wurden aus der Hauptansicht entfernt.
Header-Aktionen stehen im oberen Admin-Notizen-Header.
Notizkarten sind menschlicher lesbar.

RDAP76-Fix:
- Admin-Notes/User-Detail Page-State nutzt bevorzugt den bestehenden Haupt-Router.
- Header, aktive Navigation und sichtbares Panel sollen dadurch zusammenpassen.
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
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```
