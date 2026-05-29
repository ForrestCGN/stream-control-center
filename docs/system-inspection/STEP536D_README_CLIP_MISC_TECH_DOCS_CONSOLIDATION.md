# STEP536D – README/Clip/Misc Tech Docs Consolidation

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Restliche technische STEP-Dokus aus README/Clip/Misc/Overlay/Dashboard werden in eine Sammeldoku überführt.

## Neue Sammeldoku

```text
docs/system-inspection/README_CLIP_MISC_TECH_HISTORY_CONSOLIDATED.md
```

## Quarantine-Skript

```text
tools/system-inspection/quarantine_readme_clip_misc_tech_docs_step536d.ps1
```

## Anwendung

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/system-inspection/README_CLIP_MISC_TECH_HISTORY_CONSOLIDATED.md
```

Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_readme_clip_misc_tech_docs_step536d.ps1
```

Wenn nur erwartete Restdateien als `WOULD_MOVE` auftauchen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_readme_clip_misc_tech_docs_step536d.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Nicht betroffen

- keine Backend-Runtime-Datei
- keine Dashboard-Runtime-Datei
- keine Overlay-Runtime-Datei
- keine Config
- keine SQLite/Secrets/Tokens
