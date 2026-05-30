# STEP604 - Channelpoints/Sound Routing Batch Verification

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP603A und STEP603B verifizieren und Batch `A_channelpoints` als erledigt behandeln.

## Script

```text
tools/system-inspection/verify_channelpoints_sound_routing_batch_step604.ps1
```

## Input

```text
docs/modules/channelpoints.md
docs/modules/sound_system_channelpoints_routing.md
system-scan-output/step603a_channelpoints_module_docs_batch_rows.tsv
system-scan-output/step603b_sound_system_routing_docs_batch_rows.tsv
system-scan-output/step598_module_route_docs_batch_summary.tsv
system-scan-output/step598_module_route_docs_batch_rows.tsv
```

## Output

```text
system-scan-output/step604_channelpoints_sound_routing_verification_summary.txt
system-scan-output/step604_next_real_module_doc_batch_rows.tsv
system-scan-output/step604_remaining_real_module_doc_batches.tsv
system-scan-output/step604_channelpoints_sound_routing_verification.md
system-scan-output/step604_channelpoints_sound_routing_verification.json
```

## Ergebnisziel

- STEP603A-Abschnitt in `docs/modules/channelpoints.md` pruefen.
- STEP603B-Abschnitt in `docs/modules/sound_system_channelpoints_routing.md` pruefen.
- Naechsten echten Modul-Doku-Batch bestimmen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\verify_channelpoints_sound_routing_batch_step604.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP605 - Module Route Docs Batch D
```
