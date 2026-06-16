# Modul-Doku – Loyalty Core

Stand: 2026-06-16

## Zweck

Das Loyalty-Core-Modul verwaltet Kekskrümel, automatische Watch-Punkte, Event-Boni, Transaktionen, Balances und zentrale Einstellungen.

## Aktueller Status

```text
Produktivmodus: live-only
Fachliche Zustände: Aktiv / Inaktiv
Version: 0.1.24
Currency: Kekskrümel
Watch-Punkte: aktiv
Twitch-Event-Boni: aktiv
Shadow-Modus: fachlich entfernt, API-Feld shadowMode=false bleibt kompatibel
Alerts: weiterhin Diagnose/Shadow, keine Alert-Produktivumschaltung in diesem Step
```

Bestätigt aus `/api/loyalty/status`:

```text
mode = live
enabled = true
shadowMode = false
pointsState = active
```

## Live-only / Shadow-Migration

Shadow wurde bereinigt:

```text
Normale User wurden nach Live migriert.
Test-/Bridge-/System-Reste wurden gezielt genullt.
Abschluss-Dry-Run: candidates=0 totalShadow=0.
```

Referenzwerte:

```text
Urlug   balanceLive=1006852 balanceShadow=0 activeBalance=1006852
Tronic6 balanceLive=12536   balanceShadow=0 activeBalance=12536
```

## Wichtige Routen

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/transactions
GET  /api/loyalty/balance/:login
GET  /api/loyalty/events/history
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

Wichtiger Nachtrag:

```text
Vor dem Import im neuen Loyalty-System gesammelte Shadow-Punkte wurden beim StreamElements-Import nicht automatisch addiert. Deshalb wurde später eine eigene Shadow->Live-Migration durchgeführt.
```

## Dashboard-Wording

Der normale Loyalty-Core-Bereich zeigt fachlich Aktiv/Inaktiv. Shadow-/Import-Hauptstatusfelder wurden entfernt. Legacy-Hinweise bleiben nur im Diagnosebereich.

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

## Späterer Cleanup

DB-Spalten für Shadow bleiben vorerst erhalten und dürfen nur nach vollständiger Referenzprüfung entfernt werden:

```text
balance_shadow
total_earned_shadow
total_spent_shadow
```
