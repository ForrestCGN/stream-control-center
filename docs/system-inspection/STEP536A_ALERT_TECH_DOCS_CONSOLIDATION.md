# STEP536A – Alert Tech Docs Consolidation

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Alert-/Alert-Dashboard-/Alert-Overlay-/Alert-Handoff-STEP-Dokus werden in eine Sammeldoku überführt.

## Neue Sammeldoku

```text
docs/backend/ALERT_TECH_HISTORY_CONSOLIDATED.md
```

## Quarantine-Skript

```text
tools/system-inspection/quarantine_alert_tech_docs_step536a.ps1
```

## Anwendung

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/backend/ALERT_TECH_HISTORY_CONSOLIDATED.md
```

Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_alert_tech_docs_step536a.ps1
```

Wenn nur erwartete Alert-Dateien als `WOULD_MOVE` auftauchen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_alert_tech_docs_step536a.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Wichtig

Die offenen Punkte aus dem alten Sound-System/Alert-Handoff wurden in der Sammeldoku gerettet.

## Nicht betroffen

- keine Backend-Runtime-Datei
- keine Dashboard-Runtime-Datei
- keine Overlay-Runtime-Datei
- keine Config
- keine SQLite/Secrets/Tokens
