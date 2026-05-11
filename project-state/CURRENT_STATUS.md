## STEP261 - project-state Cleanup / Archivierung alter Fragmente

Stand: 2026-05-11

DeathCounter-DB-Umbau ist stabil abgeschlossen. Danach wurde `project-state` fuer bessere Uebersicht aufgeraeumt.

Aktueller DeathCounter-Produktivstand:

```text
activeStorage: database
dualWriteEnabled: false
fallbackStorage: json_backup_export_file
```

DeathCounter Verhalten:

```text
readState(): DB-first
updateState(): DB-only
JSON: nur manuelles Backup/Exportformat
!dcount backup: Timestamp-Backup
!dcount export: Haupt-JSON aus DB neu schreiben
```

Project-State Cleanup:

```text
alte APPEND-/STATUS_NOTE-/SAVED-/README-/Testlog-/Report-/STEP-Fragmente werden nach project-state/archive/step261-project-state-cleanup/ verschoben.
Nichts wird geloescht.
Aktive Dateien bleiben im project-state-Root.
```

Anwendung nach ZIP-Entpacken:

```powershell
cd D:\Git\stream-control-center
.\STEP261_APPLY_PROJECT_STATE_CLEANUP.cmd
.\stepdone.cmd "STEP261 project-state cleanup archive old fragments"
```
