# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15

## Aktueller Arbeitsstand

```text
LC-CORE-POINTS-1 – Sub-Tier-Watch-Werte und Resub-Bonus vorbereitet
```

## Kurzfazit

Nach dem bestätigten Cleanup `LC-CORE-CLEANUP-1` bleibt Loyalty Consumer von `/api/twitch/events/stream-state`. Der nächste Core-Schritt pflegt die bisherige StreamElements-Punktevergabe in den Loyalty-Core ein.

## Punkte-Zielwerte

```text
Viewer: 2 Kekskrümel alle 10 Minuten
Tier 1 Subscriber: 6 Kekskrümel alle 10 Minuten
Tier 2 Subscriber: 8 Kekskrümel alle 10 Minuten
Tier 3 Subscriber: 10 Kekskrümel alle 10 Minuten

Follow: 10
Sub Tier 1/2/3: 50 / 100 / 150
Resub Tier 1/2/3: 50 / 100 / 150
Cheer: 10 pro 100 Bits
Tip: 10 pro 1 EUR
Raid: 50
```

## Geändert in LC-CORE-POINTS-1

```text
backend/modules/loyalty.js
```

```text
- Version 0.1.15.
- watch.subscriberTierAmounts ergänzt.
- Resub-Bonus im Default aktiviert.
- Watch-Punkte nutzen Subscriber-Tier bevorzugt.
- Subscriber-Multiplier bleibt Fallback.
- Erster Watch-Heartbeat legt nur den Watch-State an; Punkte gibt es erst nach Ablauf des Intervalls.
```

## Bestehende Settings beachten

Bestehende Werte in `loyalty_settings` werden nicht automatisch überschrieben. Nach Deploy müssen `watch.subscriberTierAmounts` und `bonuses.resub.enabled` geprüft und bei Bedarf per Settings-API gesetzt werden.

## Nicht geändert

```text
Keine Commands aktiviert.
Keine Live-/Shadow-Umstellung.
Keine produktive SQLite ersetzt oder gelöscht.
Keine Giveaway-/Games-Änderung.
Keine Dashboard-Neustruktur.
```
