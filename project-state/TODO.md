# TODO

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

Aufgaben:

```text
- Startdateien aus GitHub/dev lesen.
- Zentrale Dokus lesen:
  - PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
  - REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
  - REMOTE_MODBOARD_ROADMAP_CURRENT.md
- Bestehenden Haupt-Router und Admin-Notes-Page-State pruefen.
- Plan nennen.
- Auf go warten.
- Frontend-only ZIP bauen.
- Lokale node --check fuer remote-modboard.js und rdap28-admin-notes.js.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, falls remote-modboard/ geaendert wird.
```

## Direkt danach

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Aufgaben:

```text
- Zieluser-Wechsel sauber laden.
- Count/Notice/Listentitel eindeutig auf aktuell ausgewaehlten User beziehen.
- Keine alten User-Daten stehen lassen.
```

## Doku-Aufraeumung spaeter

```text
- historische RDAP-Dateien nicht sofort loeschen
- erst Index/Archivplan erstellen
- ggf. START_HERE_FOR_NEW_CHAT auf die neue zentrale Doku-Basis kuerzen
```

## Nicht machen

```text
- Kein Deactivate.
- Kein Delete.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Community-Read-Freigabe.
- Keine Rollen-/Gruppen-/Permission-Writes.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
- Kein wildes weiteres CSS-Gefrickel vor State-Fixes.
```
