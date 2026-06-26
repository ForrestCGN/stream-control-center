# TODO

Stand: RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX  
Datum: 2026-06-26

## Als Naechstes

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Aufgaben:

```text
- Startdateien aus GitHub/dev lesen.
- `rdap28-admin-notes.js` Target-Selection und Read-Reload pruefen.
- Sicherstellen, dass Zieluser-Wechsel alte Liste/alten Count nicht stehen laesst.
- UI-Text auf "Notizen fuer <DisplayName>" und "<n> Notizen geladen" fixieren.
- Frontend-only ZIP bauen, wenn bestehende Readroute reicht.
- node --check fuer betroffene JS-Dateien.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, falls remote-modboard/ geaendert wird.
```

## Danach

```text
Weitere Admin-Notes UI-Politur erst nach RDAP77.
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
