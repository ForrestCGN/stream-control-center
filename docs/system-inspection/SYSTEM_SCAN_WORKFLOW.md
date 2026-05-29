# System-Scan Workflow – stream-control-center

Stand: 2026-05-29  
STEP: STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP_v0.1.2

## Ziel

Robuster Minimal-Scan ohne Markdown-Tabellen und ohne komplexe Quote-/Regex-Stellen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_project_inventory.ps1
```

## Ausgabe

```text
system-scan-output\system_inventory.json
system-scan-output\scan_summary.txt
system-scan-output\file_list.txt
system-scan-output\routes_inventory.txt
system-scan-output\cleanup_candidates.txt
system-scan-output\important_files_by_system.txt
```

## Hinweis

Cleanup-Kandidaten werden nur markiert. Nichts wird automatisch gelöscht.
