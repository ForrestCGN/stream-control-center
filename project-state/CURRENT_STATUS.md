# CURRENT_STATUS

Stand: RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN  
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
RDAP76D: Admin-Modul-/Page-Registry-Zielstruktur dokumentiert; Doku-only.
```

## Zentrale Doku ab jetzt

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN.md
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP76D.md
```

## Aktueller Struktur-Befund

```text
Die Haupt-App in remote-modboard.js besitzt bereits einen Router/Page-State.
index.html enthaelt statische Hauptbereiche und Admin-Grundnavigation.
Admin-Notizen und User-Detail werden aktuell historisch aus rdap28-admin-notes.js injiziert.
Dadurch gibt es konkurrierende Page-State-/Header-/Nav-Verantwortung.
```

## Ziel

```text
Modul-/Page-Registry einfuehren:
- Module beschreiben sich selbst.
- App-Shell ordnet Module und Pages automatisch ein.
- Haupt-Router bleibt einzige Wahrheit.
- Feature-Dateien rendern nur Inhalt und eigene Actions.
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
RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION
```
