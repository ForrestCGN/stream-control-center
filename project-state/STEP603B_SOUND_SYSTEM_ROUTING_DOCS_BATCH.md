# STEP603B - Sound System Routing Docs Batch

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Den Sound-/Routing-Anteil aus dem von STEP602 bestimmten Batch `A_channelpoints` getrennt dokumentieren.

## Ziel-Doku

```text
docs/modules/sound_system_channelpoints_routing.md
```

## Script

```text
tools/system-inspection/apply_sound_system_routing_docs_batch_step603b.ps1
```

## Input

```text
system-scan-output/step602_next_real_module_doc_batch_rows.tsv
```

## Output

```text
docs/modules/sound_system_channelpoints_routing.md
system-scan-output/step603b_sound_system_routing_docs_batch_summary.txt
system-scan-output/step603b_sound_system_routing_docs_batch_rows.tsv
system-scan-output/step603b_sound_system_routing_docs_batch.json
```

## Grundsatz

Channelpoints-Zeilen wurden in STEP603A getrennt dokumentiert.

Sound-System-/Routing-Doku darf keine funktionale Änderung an Queue, Prioritäten, Outputs oder Routing-Regeln bedeuten.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\apply_sound_system_routing_docs_batch_step603b.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP604 - Channelpoints/Sound Routing Batch Verification
```
