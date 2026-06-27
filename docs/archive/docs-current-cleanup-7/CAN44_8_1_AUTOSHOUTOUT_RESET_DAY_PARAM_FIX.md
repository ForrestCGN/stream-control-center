# CAN-44.8.1 AutoShoutout Reset-Day Parameter Fix

Fix für `/api/clip-shoutout/auto/reset-day`.

## Problem
Der Reset-Day Endpoint konnte mit SQLite/database helper abbrechen:

```text
Unknown named parameter 'now'
```

## Ursache
Bei einer SELECT-Abfrage wurde der Parameter `now` mitgegeben, obwohl die Abfrage ihn nicht verwendet.

## Änderung
- Lese-Abfragen nutzen nur `since` + Ziel-Parameter.
- Update-Abfragen nutzen `since` + `now` + Ziel-Parameter.
- Keine DB-Strukturänderung.
- Keine bestehenden AutoShouti-Streamer werden gelöscht.
