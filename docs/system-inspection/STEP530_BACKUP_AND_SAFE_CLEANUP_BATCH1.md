# STEP530 – Backup und Safe Cleanup Batch 1

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Vor dem ersten Aufräumen wird ein vollständiges Sicherheitsbackup des lokalen Projektstands erstellt. Danach wird nur eine sehr kleine, sichere Kandidatenliste geprüft.

## Batch-1-Kandidaten

```text
_live_copy_backup
backend/modules/birthday.js.step275b.bak
backend/modules/media.js.step275a.bak
backend/modules/sound_system.js.step275a.bak
htdocs/dashboard/app.js.bak_STEP274B
htdocs/dashboard/index.html.bak_STEP274B
```

## Warum diese Kandidaten?

- `_live_copy_backup` ist ein Backup-Ordner innerhalb des Repos.
- `.bak`/`bak_STEP` Dateien sind alte Sicherungsdateien.
- Keine produktiven `.js`-Module werden direkt angefasst.
- Keine Configs, keine Datenbank, keine Secrets.

## Ablauf

### 1. Backup erstellen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\create_full_project_backup.ps1
```

### 2. Dry-Run prüfen

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\cleanup_batch1_dryrun.ps1
```

Report:

```text
system-scan-output\step530_cleanup_batch1_dryrun.txt
```

### 3. Optional: Quarantine-Cleanup ausführen

Nur wenn Backup erfolgreich ist und der Dry-Run plausibel aussieht:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\cleanup_batch1_quarantine.ps1 -Apply
```

## Wichtig

Der Quarantine-Cleanup löscht nicht endgültig. Er verschiebt Kandidaten nach:

```text
_cleanup_quarantine\STEP530_<timestamp>
```

Danach wird erst geprüft, ob Server/Dashboard/Repo weiter sauber sind.
