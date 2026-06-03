# CURRENT_STATUS

## Aktueller Stand: CAN-42.12c vorbereitet

Die zentrale Dashboard-Diagnose wurde nach CAN-42.12b erweitert:

```text
CAN-42.10 Tagebuch Modul-Diagnose aus Modul-Seite entfernt/deaktiviert
CAN-42.11 Commands /status mit standardisiertem diagnostics-Block
CAN-42.12 Hug /status mit standardisiertem diagnostics-Block
CAN-42.12b Dashboard Hug-Diagnose Anzeige-Fix
CAN-42.12c Dashboard generischer Diagnostics-Details-Renderer
```

## Ergebnis CAN-42.12c

Ein neuer read-only Frontend-Renderer ergänzt auf Diagnose-Detailseiten generisch vorhandene Inhalte aus `diagnostics`:

```text
counts
database
state
queue
runtime
warnings
errors
```

Dadurch bekommen Hug, Commands und künftige Module automatisch mehr Detailwerte angezeigt, sobald ihre Statusroute einen standardisierten `diagnostics`-Block liefert.

## Nicht geändert

```text
Backend-Module
produktive POST-Routen
Hug-/Command-/Tagebuch-/Todo-Logik
DB-Schema
Streamer.bot-/OBS-Flows
```
