# CAN-42.14b - Dashboard Diagnostics Label-/Zeit-Anzeige-Cleanup

## Ziel

Der generische Diagnostics-Detailblock soll vorhandene Daten lesbarer anzeigen.

## Änderung

Betroffen:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

Anpassungen:

- technische Keys wie `dailyUsageRows`, `clientLastSeenAt`, `clientAgeMs`, `eventBusErrors` erhalten lesbarere Labels.
- Timestamp-Werte in Millisekunden werden als Datum/Uhrzeit angezeigt.
- reine Millisekundenwerte werden mit Einheit dargestellt.
- Überschriften wurden geglättet: `Standard-Diagnose`, `Zähler`.

## Nicht geändert

```text
backend/*
Statusrouten
Datenbank
produktive Aktionen
Modul-Logik
```

Keine Funktionalität entfernt.

## Test

```powershell
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Danach Dashboard hart neu laden und Diagnose-Detailseiten prüfen.
