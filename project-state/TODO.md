# TODO

Stand: RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

Aufgaben:

```text
- Startdateien lesen.
- Header/Router-State fuer Admin-Notes gezielt pruefen.
- Frontend-only Fix planen.
- ZIP erst nach go bauen.
- Lokal node --check fuer remote-modboard.js und rdap28-admin-notes.js.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, falls remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notes sichtbar.
  - Haupt-Header zeigt Admin-Notizen.
  - User-Detail bleibt nicht als Header stehen.
  - Navigation stabil.
  - Create/Update weiterhin ok.
  - Delete/Deactivate nicht sichtbar.
```

## Danach

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
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
```
