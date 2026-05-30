# STEP600 - Module Route Docs Batch A Verification

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP599 verifizieren und verhindern, dass die nächsten Doku-Steps weiter nur `docs/backend/ROUTES.md` erweitern.

## Script

```text
tools/system-inspection/verify_module_route_docs_batch_a_step600.ps1
```

## Input

```text
docs/backend/ROUTES.md
system-scan-output/step599_module_route_docs_batch_a_rows.tsv
system-scan-output/step598_module_route_docs_batch_summary.tsv
system-scan-output/step598_module_route_docs_batch_rows.tsv
```

## Output

```text
system-scan-output/step600_module_route_docs_batch_a_verification_summary.txt
system-scan-output/step600_next_real_module_doc_batch_rows.tsv
system-scan-output/step600_remaining_real_module_doc_batches.tsv
system-scan-output/step600_module_route_docs_batch_a_verification.md
system-scan-output/step600_module_route_docs_batch_a_verification.json
```

## Ergebnisziel

- STEP596/STEP597/STEP599-Abschnitte in `docs/backend/ROUTES.md` prüfen.
- Den nächsten echten Modul-Doku-Batch bestimmen.
- Danach gezielt außerhalb von `docs/backend/ROUTES.md` weiterarbeiten.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\verify_module_route_docs_batch_a_step600.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP601 - Module Route Docs Batch B
```
