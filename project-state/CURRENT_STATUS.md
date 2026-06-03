# CURRENT_STATUS

## Aktueller Arbeitsstand CAN-42.14b

CAN-42.14b vorbereitet: Generischer Dashboard-Diagnoseblock zeigt vorhandene Diagnostics-Daten lesbarer an.

Änderung:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

Ergebnis:

- technische Keys aus `diagnostics.counts` und `diagnostics.state` werden im Dashboard lesbarer beschriftet.
- Millisekundenwerte werden mit Einheit angezeigt.
- Timestamp-Millisekunden wie `clientLastSeenAt` werden als Datum/Uhrzeit dargestellt.
- Überschriften wurden von `Standard-Diagnostics`/`Counts` auf `Standard-Diagnose`/`Zähler` geglättet.

Nicht geändert:

```text
backend/*
Statusrouten
DB
produktive Aktionen
Hug-/Command-/VIP-/Rotator-Logik
```

Keine Funktionalität entfernt.
