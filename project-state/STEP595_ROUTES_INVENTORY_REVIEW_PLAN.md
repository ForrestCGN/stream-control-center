# STEP595 - Routes Inventory Review and Docs Update Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Die scanbasierte Routen-Inventur aus STEP594 fachlich für spätere Doku-Updates vorbereiten.

## Script

```text
tools/system-inspection/review_routes_inventory_step595.ps1
```

## Input

```text
docs/backend/ROUTES.md
system-scan-output/step594_central_routes_inventory.tsv
system-scan-output/step594_routes_area_summary.tsv
system-scan-output/step591_routes_missing_doc_mentions.tsv
system-scan-output/step591_module_doc_status.tsv
```

## Output

```text
system-scan-output/step595_routes_inventory_review_plan_summary.txt
system-scan-output/step595_missing_routes_review.tsv
system-scan-output/step595_false_positive_candidates.tsv
system-scan-output/step595_module_doc_update_plan.tsv
system-scan-output/step595_doc_target_summary.tsv
system-scan-output/step595_routes_inventory_review_plan.md
system-scan-output/step595_routes_inventory_review_plan.json
```

## Grundsatz

Nicht blind 45 Modul-Dokus erzeugen.

Erst:
1. fehlende Routen-Doku-Erwähnungen prüfen
2. False-Positive-Kandidaten markieren
3. dann gezielte Doku-Batches erstellen

## Nächster Schritt

```text
STEP596 - Missing Routes Documentation Batch
```
