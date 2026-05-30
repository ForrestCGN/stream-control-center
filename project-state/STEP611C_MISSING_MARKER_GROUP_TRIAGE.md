# STEP611C - Missing Marker Group Triage

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Die zwei fehlenden Marker-Gruppen aus STEP611B exakt triagieren.

## Script

```text
tools/system-inspection/triage_missing_marker_groups_step611c.ps1
```

## Input

```text
system-scan-output/step611b_doc_marker_checks.tsv
system-scan-output/step611b_fixed_final_completion_verification.json
```

## Output

```text
system-scan-output/step611c_missing_marker_group_triage_summary.txt
system-scan-output/step611c_missing_marker_group_triage.tsv
system-scan-output/step611c_missing_marker_group_triage.md
system-scan-output/step611c_missing_marker_group_triage.json
```

## Ergebnisziel

- Exakt sehen, welche Doku-Marker-Gruppen noch fehlen.
- Bestehende STEP-Marker und STEP-Headings in den betroffenen Dateien anzeigen.
- Entscheiden, ob STEP611D nur Verification-Mapping erweitert oder Marker nachtraegt.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\triage_missing_marker_groups_step611c.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP611D - Fixed Final Completion Verification v2
```

oder

```text
STEP611D - Marker Recovery
```
