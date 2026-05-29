# STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP

Version: 0.1.2  
Stand: 2026-05-29

## Ziel

Robuster System-Scan-Start für `stream-control-center`.

## Fix in v0.1.2

Die Markdown-Ausgabe wurde entfernt, weil PowerShell-Quote-/Backtick-Kombinationen unnötig fehleranfällig waren.  
Diese Version erzeugt JSON und einfache TXT-Dateien.

## Dateien

```text
tools/system-inspection/scan_project_inventory.ps1
docs/system-inspection/SYSTEM_SCAN_WORKFLOW.md
project-state/STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP.md
```

## Test

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_project_inventory.ps1
```
