# STEP603A - Channelpoints Module Docs Batch

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Den Channelpoints-Anteil aus dem von STEP602 bestimmten Batch `A_channelpoints` getrennt dokumentieren.

## Ziel-Doku

```text
docs/modules/channelpoints.md
```

## Script

```text
tools/system-inspection/apply_channelpoints_module_docs_batch_step603a.ps1
```

## Input

```text
system-scan-output/step602_next_real_module_doc_batch_rows.tsv
```

## Output

```text
docs/modules/channelpoints.md
system-scan-output/step603a_channelpoints_module_docs_batch_summary.txt
system-scan-output/step603a_channelpoints_module_docs_batch_rows.tsv
system-scan-output/step603a_channelpoints_module_docs_batch.json
```

## Grundsatz

Sound-System-/Routing-Zeilen werden nicht mit Channelpoints vermischt. Diese folgen in STEP603B.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\apply_channelpoints_module_docs_batch_step603a.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP603B - Sound System Routing Docs Batch
```
