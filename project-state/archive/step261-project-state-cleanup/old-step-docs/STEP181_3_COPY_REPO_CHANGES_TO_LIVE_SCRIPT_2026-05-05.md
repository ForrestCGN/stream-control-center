# STEP181.3 - Copy Repo Changes To Live Script

Stand: 2026-05-05

## Ziel

Ein kleines Hilfsscript kopiert manuell entpackte/geaenderte Repo-Dateien nach Live.

Wichtig:
Das Script entpackt keine ZIP-Dateien. ZIPs werden weiterhin manuell nach `D:\Git\stream-control-center` entpackt.

## Neue Dateien

```text
copylive.cmd
tools/commands/copylive.cmd
tools/commands/copy_repo_changes_to_live.ps1
project-state/STEP181_3_COPY_REPO_CHANGES_TO_LIVE_SCRIPT_2026-05-05.md
```

## Nutzung

```powershell
cd D:\Git\stream-control-center
.\copylive
```

Optional nur anzeigen, was passieren wuerde:

```powershell
.\copylive -WhatIfOnly
```

Optional ohne Syntaxcheck:

```powershell
.\copylive -NoSyntaxCheck
```

## Was kopiert wird

Das Script liest `git status --porcelain -uall` und kopiert nur erlaubte Runtime-Dateien:

- `backend/*`
- `htdocs/*`
- `config/*`

## Was bewusst NICHT kopiert wird

- `docs/*`
- `project-state/*`
- `.env`
- `.git`
- Secrets
- SQLite/DB-Dateien
- ZIP/7z/Backups/temp-Dateien
- Löschungen

## Sicherheit

Vor dem Überschreiben vorhandener Live-Dateien wird ein Backup unter dem Repo erstellt:

```text
_live_copy_backup\YYYYMMDD_HHMMSS\...
```

## Nach dem Kopieren

Wenn Backend-Dateien geändert wurden, muss das Backend neu gestartet werden.

Danach zum Beispiel:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/text-pairs" | ConvertTo-Json -Depth 30
```

## Keine Funktionalität entfernt

Dieses Script ersetzt nicht den GitHub-/Deploy-Workflow. Es ist nur ein schneller Live-Test-Helfer nach manuellem Entpacken.
