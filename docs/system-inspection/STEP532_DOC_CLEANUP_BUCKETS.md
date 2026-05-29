# STEP532 – Doku-Cleanup-Buckets

Stand: 2026-05-29

## Nicht blind löschen

Die große Zahl der Cleanup-Kandidaten entsteht vor allem durch historische und generierte Doku.  
Das ist ein Signal für Verjüngung, nicht für Massenlöschung.

## Batch-Vorschlag

### Batch A – Sofort sinnvoll

```text
docs/current/CURRENT_SYSTEM_STATUS_STEP*_APPEND.md
docs/current/STEP20*_*.md
docs/current/STEP240_MESSAGE_ROTATOR_BACKEND_SCHEDULER.md
docs/current/STEP432_TO_STEP433_HANDOFF.md
```

Ziel: aktuelle Infos retten, dann Fragmente verschieben.

### Batch B – Danach

```text
docs/backend/*STEP*.md
docs/dashboard/*STEP*.md
docs/vip/STEP*.md
docs/overlays/STEP*.md
docs/media/*STEP*.md
docs/README_STEP*.txt
```

Ziel: technische Einzelnotizen auf Relevanz prüfen, dann archivieren.

### Batch C – Nicht jetzt

```text
docs/modules/*
docs/current/PROJECT_*.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/SERVER_LOG_MODULE_LOADING_RULES_2026-05-26.md
```

Diese Dateien können aktive Referenzdoku sein.

### Batch D – Nur Scan-Strategie ändern

```text
docs/archive/*
project-state/archive/*
docs/_generated/*
```

Diese Bereiche sollten künftig bei normalen TODO-/Cleanup-Scans optional ausgeschlossen werden.

## Aktueller sicherer nächster Schritt

`STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1`.

Erst wenn der aktuelle Status konsolidiert ist, lohnt sich das größere Entfernen alter STEP-Dokus.
