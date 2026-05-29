# STEP533 – Current-System-Status Append-Konsolidierung Batch 1

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Die fragmentierten Dateien `docs/current/CURRENT_SYSTEM_STATUS_STEP*_APPEND.md` werden in `docs/current/CURRENT_SYSTEM_STATUS.md` konsolidiert.

Dieser STEP betrifft nur Doku.

## Konsolidierte Themen

- Alert-Reconnect-Fix
- Restlaufzeit-Replay statt voller Dauer
- Legacy/direct Alert-Overlay bleibt produktiv
- Communication-Bus bleibt Shadow-/Vorbereitungsstand
- iframe-Bridge ist nicht produktiv
- bekannter Sound-System-Orphan-Lock bleibt separates Issue
- späteres Timing-Feintuning zwischen Visual, Sound und TTS

## Enthaltene Dateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
tools/system-inspection/quarantine_current_status_appends_step533.ps1
docs/system-inspection/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md
project-state/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md
```

## Anwendung

Nach Entpacken zuerst prüfen:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/current/CURRENT_SYSTEM_STATUS.md
```

Dann Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_current_status_appends_step533.ps1
```

Wenn der Report nur die erwarteten Append-Dateien enthält:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_current_status_appends_step533.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Erwartete Git-Änderungen

- `docs/current/CURRENT_SYSTEM_STATUS.md` geändert
- 15 `CURRENT_SYSTEM_STATUS_STEP*_APPEND.md` gelöscht
- neues Quarantine-Skript
- STEP533-Dokus neu

`_cleanup_quarantine/` bleibt durch `.gitignore` ungetrackt.

## Wichtig

Nicht breit `git add .` verwenden, solange lokale Runtime-/Scan-Ausgaben im Repo liegen könnten.
