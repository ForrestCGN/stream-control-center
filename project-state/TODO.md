# TODO

Stand: RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX  
Datum: 2026-06-26

## Jetzt testen

```text
RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX
```

Aufgaben:

```text
- ZIP lokal einspielen.
- node --check fuer rdap28-admin-notes.js und remote-modboard.js ausfuehren.
- Browser hart neu laden.
- Initial-/Restore-State pruefen.
- Navigation Admin-Notizen/User-Detail mehrfach pruefen.
- Nur wenn sauber: stepdone.cmd.
- Danach Webserver-Deploy aus frischem GitHub/dev, weil remote-modboard/ geaendert wurde.
```

## Direkt danach

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
- Kein wildes weiteres CSS-Gefrickel vor State-Fixes.
```
