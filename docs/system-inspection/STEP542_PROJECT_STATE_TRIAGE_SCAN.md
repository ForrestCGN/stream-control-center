# STEP542 – Project-State Triage Scan

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

`project-state` wird analysiert und in sinnvolle Kategorien aufgeteilt.

Dieser STEP ist Analyse-only.

## Warum

`project-state` ist zentral für:

```text
Chatwechsel
CURRENT_STATUS
NEXT_STEPS
TODO
FILES
CHANGELOG
General Project Prompt
STEP-/Übergabe-Dokumente
```

Nach STEP541 ist klar: Project-State enthält viele TODO-/NEXT_STEPS-/STEP-Treffer, aber sie dürfen nicht automatisch gelöscht werden.

## Macht nicht

- keine Datei löschen
- keine Datei verschieben
- keine Inhalte verändern
- keine Archive aufräumen
- keine Runtime-Dateien anfassen

## Scan-Ausführung

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_project_state_triage_step542.ps1
```

## Reports

```text
system-scan-output\step542_project_state_triage_scan.json
system-scan-output\step542_project_state_triage_summary.txt
system-scan-output\step542_project_state_buckets.txt
system-scan-output\step542_project_state_core_active.txt
system-scan-output\step542_project_state_archive_candidates.txt
system-scan-output\step542_project_state_manual_review.txt
```

## Kategorien

```text
core_active
archive_existing
next_steps_append_fragment
current_status_append_fragment
step_state_fragment
append_fragment
archive_move_list
handoff_or_rule
feature_state_note
step_related_other
other_project_state
```

## Danach

Reports hochladen. Danach wird entschieden, ob ein sicherer Konsolidierungs-/Archivierungsbatch vorbereitet wird.
