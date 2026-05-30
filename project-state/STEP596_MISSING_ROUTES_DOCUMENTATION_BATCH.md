# STEP596 - Missing Routes Documentation Batch

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Gezielt nur die 26 fehlenden Routen-Erwähnungen aus STEP595 in die zentrale Routen-Inventur aufnehmen.

## Geänderte Zieldatei

```text
docs/backend/ROUTES.md
```

## Script

```text
tools/system-inspection/apply_missing_routes_docs_step596.ps1
```

## Input

```text
docs/backend/ROUTES.md
system-scan-output/step595_missing_routes_review.tsv
system-scan-output/step595_doc_target_summary.tsv
```

## Output

```text
docs/backend/ROUTES.md
system-scan-output/step596_missing_routes_documentation_batch_summary.txt
system-scan-output/step596_missing_routes_by_area.tsv
system-scan-output/step596_missing_routes_documentation_batch.json
```

## Grundsatz

Dieser STEP fasst nur die fehlenden Routen-Erwähnungen an.

Er erzeugt keine 45 Modul-Dokus und übernimmt keine 357 False-Positive-Kandidaten blind.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\apply_missing_routes_docs_step596.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP597 - Route Inventory False-Positive Review
```
