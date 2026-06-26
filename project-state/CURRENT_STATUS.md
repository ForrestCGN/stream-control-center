# CURRENT_STATUS

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
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
```

## Zentrale Doku ab jetzt

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_DOCS_CONSOLIDATION.md
```

## Aktueller Browser-/Design-Befund

```text
Admin-Notes sind sichtbar.
Create/Update funktionieren grundsaetzlich.
Delete/Deactivate sind nicht sichtbar.
Technische Statusbloecke wurden aus der Hauptansicht entfernt.
Header-Aktionen stehen im oberen Admin-Notizen-Header.
Notizkarten sind menschlicher lesbar.

Offen:
- Header/Router-State kann falsch sein: User-Detail steht oben, obwohl Admin-Notizen sichtbar sind.
- Zieluser-/Count-Kontext muss geprueft/fixiert werden: Count muss zum ausgewaehlten User passen.
- Weitere UI-Politur erst nach diesen State-Fixes.
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
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```
