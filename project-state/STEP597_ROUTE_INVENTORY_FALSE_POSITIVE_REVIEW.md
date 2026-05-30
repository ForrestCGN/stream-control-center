# STEP597 - Route Inventory False-Positive Review

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Die 357 False-Positive-Kandidaten aus STEP595 nicht blind übernehmen, sondern als Risiko-/Review-Hinweis in `docs/backend/ROUTES.md` dokumentieren.

## Geänderte Zieldatei

```text
docs/backend/ROUTES.md
```

## Script

```text
tools/system-inspection/apply_false_positive_review_step597.ps1
```

## Input

```text
docs/backend/ROUTES.md
system-scan-output/step595_false_positive_candidates.tsv
```

## Output

```text
docs/backend/ROUTES.md
system-scan-output/step597_false_positive_review_summary.txt
system-scan-output/step597_false_positive_risk_summary.tsv
system-scan-output/step597_false_positive_area_summary.tsv
system-scan-output/step597_false_positive_review.json
```

## Grundsatz

False-Positive-Kandidaten sind keine bestätigten produktiven Routen.

Erst echte Moduldatei und Router-Kontext prüfen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\apply_false_positive_review_step597.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP598 - Module Route Docs Batch Plan
```
