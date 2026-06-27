# Next Steps

Stand: 2026-06-27

## Nach Installation lokal ausfuehren

Aus dem lokalen Repo:

```powershell
cd D:\Git\stream-control-center
```

Dry-Run:

```powershell
.\tools\cleanup\rdap-docs-cleanup-2-safe-delete.ps1
```

Wenn die Liste passt, echte Loeschung:

```powershell
.\tools\cleanup\rdap-docs-cleanup-2-safe-delete.ps1 -Execute
```

Danach:

```powershell
git status
```

## Kein Webserver-Deploy

Dieser Step ist Cleanup/Doku/Tooling. Kein Runtime-Deploy noetig.

## Danach

Wenn `git status` sauber nachvollziehbar ist:

```powershell
.\stepdone.cmd "RDAP Docs Cleanup 2: sichere Backup- und project-state-Root-Altdateien bereinigt"
```

## Naechster fachlicher Cleanup

```text
RDAP_DOCS_CLEANUP_3_DOCS_CURRENT_CONSOLIDATION
```

Ziel: `docs/current` wirklich zusammenfuehren und veraltete Handoff-/Statusdateien paketweise entfernen.
