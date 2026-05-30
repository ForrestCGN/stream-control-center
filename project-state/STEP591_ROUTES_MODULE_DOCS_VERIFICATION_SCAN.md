# STEP591 - Routes and Module Docs Verification Scan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Lokaler Analyse-Scan der echten Backend-Dateien auf Routen-/API-Hinweise und grober Vergleich gegen vorhandene Modul-/Current-Dokus.

## Wichtig

Dieser STEP nimmt keine Code-Änderungen vor.

Der Scan ist bewusst konservativ:

```text
Regex-/Mention-Scan
keine automatische Routen-Doku
keine automatische Bewertung, ob Route produktiv ist
Treffer muessen vor Doku-Aenderungen fachlich geprueft werden
```

## Script

```text
tools/system-inspection/scan_routes_module_docs_step591.ps1
```

## Reports

```text
system-scan-output/step591_routes_module_docs_verification_summary.txt
system-scan-output/step591_detected_routes.tsv
system-scan-output/step591_routes_missing_doc_mentions.tsv
system-scan-output/step591_module_doc_status.tsv
system-scan-output/step591_routes_module_docs_verification.json
```

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\scan_routes_module_docs_step591.ps1
```

## Danach

Nur den `COPY_THIS_RESULT`-Block in den Chat kopieren.

## Nächster Schritt

Je nach Ergebnis:

```text
STEP592 - Routes Documentation Consolidation
```
