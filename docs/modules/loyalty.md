# Modul-Doku – Loyalty Core

Stand: 2026-06-15 19:55

## Zweck

Das Loyalty-Core-Modul verwaltet Kekskrümel, automatische Watch-Punkte, Event-Boni, Transaktionen, Balances und zentrale Einstellungen.

## Aktueller Status

```text
Produktivmodus: live
Version: 0.1.23
Currency: Kekskrümel
Watch-Punkte: aktiv
Twitch-Event-Boni: aktiv
Alerts: weiterhin Shadow, nicht produktiv über neue Alert-Route
```

## Wichtige Routen

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/transactions
GET  /api/loyalty/balance/:login
```

## Watch-Punkte

Aktuell bestätigte Werte:

```text
watch.enabled = true
watch.amount = 2
watch.intervalMinutes = 10
watch.subscriberMultiplier = 3
subscriberTierAmounts:
  1000 = 6
  2000 = 8
  3000 = 10
```

Bestätigtes Verhalten:

```text
Normale Viewer: 2 Kekskrümel pro Intervall
Subscriber/Fallback: 6 Kekskrümel pro Intervall
```

Offen:

```text
subscriberTier steht häufig unknown/none.
watchAmountSource nutzt oft subscriber_multiplier_fallback.
Tier-2/Tier-3-Erkennung später gezielt prüfen.
```

## Event-Boni

Support-Events laufen produktiv über `twitch_events` / Communication Bus und werden als `event_bonus` gebucht.

Beispiele aus Live-Test:

```text
Cheer100 -> 10
GiftSub Gifter -> 50
GiftSub Receiver -> 5
```

Offen:

```text
GiftSub-Receiver-Buchung mit Dashboard-Konfig abgleichen.
```

## StreamElements-Import

Import wurde additiv über Transaktionen durchgeführt, keine direkte DB-Überschreibung.

```text
type = legacy_points_import
sourceProvider = streamelements
mode = live
reason = streamelements_points_import
referenceId = streamelements_top489_2026-06-15
```

Bestätigtes Ergebnis:

```text
Erfolgreich: 479 User
Gebucht: 1.832.557 Kekskrümel
Fehler: 0
```

## Dateien

Backend:

```text
backend/modules/loyalty.js
backend/modules/twitch_events.js
backend/modules/alerts_twitch_events.js
```

Dashboard:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```
