# STEP598 - Module Route Docs Batch Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Die 45 Modul-Doku-Kandidaten aus STEP595 in kleine sinnvolle Doku-Batches gruppieren.

## Script

```text
tools/system-inspection/plan_module_route_docs_step598.ps1
```

## Input

```text
system-scan-output/step595_module_doc_update_plan.tsv
system-scan-output/step595_doc_target_summary.tsv
```

## Output

```text
system-scan-output/step598_module_route_docs_batch_plan_summary.txt
system-scan-output/step598_module_route_docs_batch_rows.tsv
system-scan-output/step598_module_route_docs_batch_summary.tsv
system-scan-output/step598_module_route_docs_batch_plan.md
system-scan-output/step598_module_route_docs_batch_plan.json
```

## Grundsatz

Keine neuen Einzel-Dokus pro Modul erzeugen, solange ein passender Sammelabschnitt reicht.

Dieser STEP plant nur. Er ändert keine Modul-Dokus.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\plan_module_route_docs_step598.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP599 - Module Route Docs Batch A
```
