# STEP531 – Doku-Verjüngung, TODO-Rettung und Cleanup-Scan

Version: 0.1.1  
Stand: 2026-05-29

## Ziel

Vor dem Doku-Aufräumen werden alte STEP-/APPEND-/HANDOFF-Fragmente und vergessene TODOs/FIXMEs/OFFEN-Punkte gesucht.

In diesem STEP wird nichts gelöscht.

## Fix in v0.1.1

Die TODO-Suche wurde vereinfacht und nutzt keine Generic-Listen/PSCustomObject-Rückgaben mehr, weil PowerShell damit lokal fehleranfällig war.

## Scan ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_docs_todos_and_cleanup.ps1
```

## Ausgabe

```text
system-scan-output\step531_docs_todo_cleanup_scan.json
system-scan-output\step531_docs_summary.txt
system-scan-output\step531_docs_cleanup_candidates.txt
system-scan-output\step531_docs_todo_hits.txt
```
