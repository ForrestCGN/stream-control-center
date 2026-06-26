# TODO

Stand: RDAP78C_ADMIN_NOTES_NOTICE_HUMANIZER_STALE_COUNT_FIX  
Datum: 2026-06-26

## Jetzt testen

```text
Admin -> Admin-Notizen
ForrestCGN auswaehlen
EngelCGN auswaehlen
zurueck auf ForrestCGN
```

Erwartung:

```text
Count/Notice/Liste/Titel muessen immer zum aktuell ausgewaehlten Zieluser passen.
Alte Counts duerfen nicht wieder erscheinen.
```

## Checks

```text
node --check remote-modboard/backend/public/assets/remote-modboard.js
node --check remote-modboard/backend/public/assets/rdap28-admin-notes.js
git status --short
```

## Nicht machen

```text
Kein Delete/Deactivate.
Keine DB-Migration.
Keine neue Permission.
Keine Write-Freigabe.
```
