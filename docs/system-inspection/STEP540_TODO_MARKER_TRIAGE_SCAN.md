# STEP540 – TODO/Marker Triage Scan

Version: 0.1.1  
Stand: 2026-05-29

## Änderung gegenüber v0.1.0

PowerShell-5.1-Kompatibilitätsfix:

```text
Join-Path Array-Erzeugung korrigiert.
```

## Ziel

Nach Abschluss des technischen STEP-Doku-Cleanups bleiben viele TODO-/Marker-Hits übrig.

Dieser STEP sortiert diese Treffer in sinnvolle Kategorien, ohne irgendetwas zu löschen oder zu verschieben.

## Zweck

Unterscheiden zwischen:

```text
echten offenen Aufgaben
Known Issues
Next Steps
Future Notes
bewussten Scope-Notizen
Checklist-/Rettungs-/Scan-Treffern
Dateinamen-Kontext wie todo-deep-dive.md
```

## Macht nicht

- keine Datei löschen
- keine Datei verschieben
- keine Runtime-Datei ändern
- keine Config/DB/Secrets anfassen

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_todo_marker_triage_step540.ps1
```

## Reports

```text
system-scan-output\step540_todo_marker_triage_scan.json
system-scan-output\step540_todo_marker_triage_summary.txt
system-scan-output\step540_todo_marker_buckets.txt
system-scan-output\step540_todo_marker_file_summary.txt
system-scan-output\step540_todo_marker_action_candidates.txt
system-scan-output\step540_todo_marker_hits_raw.txt
```

## Danach

Reports hochladen. Danach entscheiden wir, welche Kategorie zuerst bereinigt oder in echte TODO-/NEXT_STEPS-Struktur überführt wird.
