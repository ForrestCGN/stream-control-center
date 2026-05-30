# STEP606 - Dashboard Commands Batch Verification

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP605 verifizieren und den naechsten echten Modul-Doku-Batch bestimmen.

## Script

```text
tools/system-inspection/verify_dashboard_commands_batch_step606.ps1
```

## Input

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
system-scan-output/step605_dashboard_commands_module_docs_batch_rows.tsv
system-scan-output/step598_module_route_docs_batch_summary.tsv
system-scan-output/step598_module_route_docs_batch_rows.tsv
```

## Output

```text
system-scan-output/step606_dashboard_commands_batch_verification_summary.txt
system-scan-output/step606_next_real_module_doc_batch_rows.tsv
system-scan-output/step606_remaining_real_module_doc_batches.tsv
system-scan-output/step606_dashboard_commands_batch_verification.md
system-scan-output/step606_dashboard_commands_batch_verification.json
```

## Ergebnisziel

- STEP605-Abschnitt in `DASHBOARD_COMMANDS_CONSOLIDATION.md` pruefen.
- Batch `D_dashboard_commands` als erledigt behandeln.
- Naechsten echten Modul-Doku-Batch bestimmen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\verify_dashboard_commands_batch_step606.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP607 - Module Route Docs Batch E
```
