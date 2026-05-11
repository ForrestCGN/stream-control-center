## STEP259 - DeathCounter DB-only Storage + manueller JSON Backup/Export

Stand: 2026-05-11

DeathCounter ist jetzt produktiv DB-basiert. Automatischer JSON-Dual-Write wurde entfernt.

Aktueller DeathCounter-Stand:

```text
STEP252 DB-Schema vorbereitet
STEP253 Storage-Preview read-only
STEP254 Import-Readiness-Validation read-only
STEP255 Guarded Import erfolgreich
STEP256 DB-vs-JSON Consistency Check
STEP257 DB Read-Test
STEP258 Active DB Storage mit JSON-Fallback/Dual-Write
STEP259 DB-only produktiv + manueller JSON Backup/Export
```

Aktives Verhalten:

```text
readState(): DB-first
updateState(): DB-only
JSON: nur Backup/Export/Fallback-Datei
```

Neue Funktionen:

```text
/api/deathcounter/v2/storage/backup
/api/deathcounter/v2/storage/export?mode=backup
/api/deathcounter/v2/storage/export?mode=export
!dcount backup
!dcount export
```
