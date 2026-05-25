# STEP424 – Bus Diagnostics Dashboard Details

## Ziel

Die Dashboard-Busdiagnose zeigt mehr Details direkt im Dashboard, damit weniger PowerShell-Ausgaben kopiert werden müssen.

## Änderungen

- Capability-Anzeige als Chips.
- Event-Zeilen mit ausklappbarer Detailansicht.
- Alert/Sound-Korrelationsdetails für Matches und unmatched Alerts.
- Komplette Rohdaten als ausklappbare Diagnoseansicht.

## Schutz

- Kein Backend geändert.
- Keine Queue geändert.
- Kein Sound-System-Flow geändert.
- Kein Alert-Flow geändert.
- Keine Overlay-Steuerung geändert.
- Keine DB-Migration.

## Tests

```cmd
node --check htdocs\dashboard\modules\bus_diagnostics.js
```
