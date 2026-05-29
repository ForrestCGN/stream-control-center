# STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Vor dem eigentlichen Aufräumen wird ein lokales Sicherheitsbackup erstellt. Danach beginnt Batch 1 mit sehr sicheren Altlasten-Kandidaten.

## Dateien

```text
tools/system-inspection/create_full_project_backup.ps1
tools/system-inspection/cleanup_batch1_dryrun.ps1
tools/system-inspection/cleanup_batch1_quarantine.ps1
docs/system-inspection/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md
project-state/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md
```

## Betroffene Cleanup-Kandidaten

```text
_live_copy_backup
backend/modules/birthday.js.step275b.bak
backend/modules/media.js.step275a.bak
backend/modules/sound_system.js.step275a.bak
htdocs/dashboard/app.js.bak_STEP274B
htdocs/dashboard/index.html.bak_STEP274B
```

## Bewusst nicht geändert

- keine produktiven Module
- keine Configs
- keine Datenbank
- keine Secrets
- keine Overlays
- keine Dashboard-Produktivdateien
- keine EventBus-Logik
- kein Sound-System-Umbau

## Test nach Anwendung

```powershell
cd D:\Git\stream-control-center
git status
node --check backend\server.js
```

Danach Server starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```
