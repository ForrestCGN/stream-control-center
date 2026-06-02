# CAN-25.2 - Sound-Shadow Summary Card read-only

## Zweck

CAN-25.2 verbessert die Dashboard-/Bus-Diagnose-Sicht fuer die Sound-Shadow-Stufe.

## Umsetzung

Ergaenzt wurde eine read-only Summary Card:

```text
Sound-Shadow Status
```

Die Card zeigt Diagnosewerte aus der vorhandenen Bus-/Statusstruktur, ohne Schreibaktionen auszufuehren.

## Sichtbare Bereiche

```text
Kandidat
Hooks
Tests
Letztes Ergebnis
Safety Flags
Deaktivierungs-Hinweis als Text
```

## Sichtbare Kernfelder

```text
enabled
rewardKey
candidateFound
mediaAssetId
autoHookInstalled
executeHookInstalled
eventSubHookInstalled
attempts
okCount
failedCount
skipped
lastAutoResult.accepted
lastAutoResult.skipped
lastSkipReason
queueTouched
audioTouched
productiveMigration
redemptionChanged
twitchTouched
```

## Sicherheitsgrenze

CAN-25.2 ist read-only.

Nicht enthalten:

```text
kein Enable/Disable Button
kein Test-Button
kein Execute-Test Button
kein Sound-Play Button
kein Queue-Reset
kein Migration-Button
keine neue Produktivroute
keine produktive Sound-Bus-Migration
```

## Geaenderte Dateien

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Hinweis zur Datenquelle

Die Card versucht Sound-Shadow-Daten aus der bestehenden Matrix/Status-Struktur zu lesen, insbesondere aus channelpoints-bezogenen Shadow-Feldern.

## Bewertung

Die UI-Erweiterung macht den Shadow-Zustand besser sichtbar, ohne das Systemverhalten zu veraendern.

## Naechster Schritt

```text
CAN-25.3: Lokaler Dashboard-Check / Screenshot- oder Sichtpruefung pending.
```
