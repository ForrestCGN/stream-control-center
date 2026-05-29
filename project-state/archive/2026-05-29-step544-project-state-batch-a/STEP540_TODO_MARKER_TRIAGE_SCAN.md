# STEP540_TODO_MARKER_TRIAGE_SCAN

Version: 0.1.1  
Stand: 2026-05-29

## Änderung gegenüber v0.1.0

PowerShell-5.1-Kompatibilitätsfix für `Join-Path`/Array-Erzeugung.

## Ziel

TODO-/Marker-Hits nach Abschluss des technischen STEP-Doku-Cleanups triagieren.

## Bestandteil

```text
tools/system-inspection/scan_todo_marker_triage_step540.ps1
docs/system-inspection/STEP540_TODO_MARKER_TRIAGE_SCAN.md
project-state/STEP540_TODO_MARKER_TRIAGE_SCAN.md
```

## Wichtig

Dieser STEP ist Analyse-only.

Keine Löschung nur aufgrund von TODO-/Marker-Treffern.

## Nächster Schritt

Reports prüfen und danach entscheiden:

```text
1. echte Aufgaben in TODO/NEXT_STEPS überführen
2. Scan-/Rettungsberichte ggf. separat archivieren
3. alte Systemübersichten prüfen
4. Modul-Dokus gezielt aktualisieren
```
