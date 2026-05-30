# STEP611A - Completion Verification Triage / Fix Map

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP611 triagieren, ohne direkt etwas zu reparieren.

## Script

```text
tools/system-inspection/triage_completion_verification_step611a.ps1
```

## Input

```text
system-scan-output/step611_doc_marker_checks.tsv
system-scan-output/step611_required_report_checks.tsv
system-scan-output/step611_final_module_route_docs_completion.json
```

## Output

```text
system-scan-output/step611a_completion_verification_triage_summary.txt
system-scan-output/step611a_missing_marker_fix_map.tsv
system-scan-output/step611a_missing_report_fix_map.tsv
system-scan-output/step611a_similar_existing_reports.tsv
system-scan-output/step611a_completion_verification_triage.md
system-scan-output/step611a_completion_verification_triage.json
```

## Ergebnisziel

- Exakt zeigen, welcher Marker fehlt.
- Exakt zeigen, welche Report-Dateien STEP611 erwartet hat.
- Aehnliche vorhandene Reports finden.
- Entscheiden, ob STEP611B eine korrigierte Verification oder ein Recovery-Step sein muss.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\triage_completion_verification_step611a.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP611B - Fixed Final Completion Verification
```

oder

```text
STEP611B - Missing Report/Marker Recovery
```
