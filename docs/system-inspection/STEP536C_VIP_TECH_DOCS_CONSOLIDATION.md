# STEP536C – VIP Tech Docs Consolidation

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

VIP-STEP-Dokus werden in eine Sammeldoku überführt.

## Neue Sammeldoku

```text
docs/vip/VIP_TECH_HISTORY_CONSOLIDATED.md
```

## Quarantine-Skript

```text
tools/system-inspection/quarantine_vip_tech_docs_step536c.ps1
```

## Anwendung

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/vip/VIP_TECH_HISTORY_CONSOLIDATED.md
```

Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_vip_tech_docs_step536c.ps1
```

Wenn nur erwartete VIP-Dateien als `WOULD_MOVE` auftauchen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_vip_tech_docs_step536c.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Wichtig

Produktiver VIP-Flow bleibt Sound-System-Lifecycle. Bus bleibt Shadow/Diagnose/Preview, solange kein separater Produktiv-Step beschlossen ist.

## Nicht betroffen

- keine Backend-Runtime-Datei
- keine Dashboard-Runtime-Datei
- keine Overlay-Runtime-Datei
- keine Config
- keine SQLite/Secrets/Tokens
