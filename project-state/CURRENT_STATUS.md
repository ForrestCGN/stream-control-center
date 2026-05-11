## STEP260 - DeathCounter DB-Storage STABLE dokumentiert

Stand: 2026-05-11

DeathCounter V2 ist nach Live-Test stabil auf produktiven DB-Storage umgestellt.

Aktueller DeathCounter-Stand:

```text
STEP252 DB-Schema vorbereitet
STEP253 Storage-Preview read-only
STEP254 Import-Readiness-Validation read-only
STEP255 Guarded Import erfolgreich
STEP256 DB-vs-JSON Consistency Check
STEP257 DB Read-Test
STEP258 Active DB Storage mit Übergangs-Dual-Write
STEP259 DB-only produktiv + manueller JSON Backup/Export
STEP260 STABLE-Doku und Doku-Cleanup
```

Produktives Verhalten:

```text
readState(): DB-first
updateState(): DB-only
activeStorage: database
dualWriteEnabled: false
fallbackStorage: json_backup_export_file
```

JSON-Verhalten:

```text
!dcount backup -> Timestamp-Backup unter data/deathcounter/backups/
!dcount export -> Haupt-JSON aus DB neu schreiben, vorher Backup anlegen
```

Bestätigte Live-Tests:

```text
status/settings/read-test/consistency/integration-check OK
storage/backup OK
storage/export?mode=export OK
!dcount backup OK
!dcount export OK
!rip + !del Schreibtest OK
```

Stabile Referenzdoku:

```text
docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md
```
