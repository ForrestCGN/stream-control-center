# STEP592 - Routes Scan Results Triage

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP591-Ergebnisse lokal auswerten und gruppieren.

## Input

```text
system-scan-output/step591_routes_missing_doc_mentions.tsv
system-scan-output/step591_module_doc_status.tsv
```

## Script

```text
tools/system-inspection/triage_routes_scan_results_step592.ps1
```

## Output

```text
system-scan-output/step592_routes_scan_triage_summary.txt
system-scan-output/step592_missing_routes_by_area.tsv
system-scan-output/step592_modules_no_matching_doc_by_area.tsv
system-scan-output/step592_top_missing_routes.tsv
system-scan-output/step592_top_modules_with_routes_no_matching_doc.tsv
system-scan-output/step592_routes_scan_triage.json
```

## Wichtig

Die Modul-Doku-Treffer aus STEP591 nutzen einfache Dateiname-zu-Doku-Logik. False-Positives sind erwartbar.

STEP592 soll deshalb nur gruppieren und einen sinnvollen Doku-Plan vorbereiten, nicht automatisch 45 Modul-Dokus erzeugen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\triage_routes_scan_results_step592.ps1
```

Danach den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

```text
STEP593 - Routes Documentation Consolidation Plan
```
