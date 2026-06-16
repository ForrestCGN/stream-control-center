# Modul-Doku – Loyalty Core

Stand: 2026-06-16

## Zweck

Das Loyalty-Core-Modul verwaltet Kekskrümel, automatische Watch-Punkte, Event-Boni, Transaktionen, Balances, Rankings, Reservierungen und zentrale Einstellungen.

## Aktueller Status

```text
Produktivmodus: live-only
Fachliche Zustände: aktiv / inaktiv
Version: 0.1.24
Currency: Kekskrümel
Watch-Punkte: aktiv
Twitch-Event-Boni: aktiv
Shadow-Modus: fachlich beendet, shadowMode=false
Alerts: weiterhin Diagnose/Shadow-Beobachtung, keine Produktivumschaltung über neue Alert-Route
```

## Live-only-Regel

Ab LC-CORE-LIVE-CLEANUP-2 gilt fachlich:

```text
Aktiv   = live
Inaktiv = off
```

`shadowMode` bleibt aus API-Kompatibilität vorerst vorhanden, ist aber `false`. Alte Config/API-Werte mit `mode=shadow` sollen nicht mehr in Shadow buchen, sondern als Live behandelt werden.

## Shadow-Migration

Die frühere Shadow-Phase wurde abgeschlossen:

```text
Normale User wurden nach Live migriert.
Test-/Bridge-/Diagnose-User wurden ausgeschlossen.
Ignored/System-Reste wurden nicht nach Live gebucht.
Rest-Shadow-Werte wurden gezielt genullt.
Abschlussprüfung: candidates=0 totalShadow=0.
```

Referenzwerte:

```text
Urlug:
  balanceShadow = 0
  balanceLive   = 1006852
  activeBalance = 1006852

Tronic6:
  balanceShadow = 0
  balanceLive   = 12536
  activeBalance = 12536
```

## Wichtige Routen

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/transactions
GET  /api/loyalty/balance/:login
GET  /api/loyalty/users
GET  /api/loyalty/events/history
GET  /api/loyalty/runner/status
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

Status-Diagnose bestätigt:

```text
bonusMapping.mode = live
eventBonusesEnabled = true
supportedEvents enthalten follow, subscribe, resub, gift_sub, gift_bomb, cheer, raid und derived gifted_sub_received
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

Bestätigtes Ergebnis aus Importphase:

```text
Erfolgreich: 479 User
Gebucht: 1.832.557 Kekskrümel
Fehler: 0
```

Nachträglich wurde erkannt, dass die bereits im neuen System gesammelten Shadow-Punkte nicht addiert waren. Das wurde über die Shadow->Live-Migration korrigiert.

## Bekannte Kompatibilitäts-/Cleanup-Punkte

Folgende Felder/Begriffe können noch in Status/Diagnose/Dashboard vorkommen und sollen später bereinigt werden:

```text
streamElementsStillActive
importStatus
shadowMode als reines Kompatibilitätsfeld
alte Dashboard-Texte mit Shadow-/Runner-Bezug
```

Dabei gilt:

```text
Keine API-Breaking-Changes ohne bewusste Freigabe.
DB-Spalten nicht blind droppen.
Erst alle Referenzen in Backend, Dashboard, Tools und Doku prüfen.
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

Tools:

```text
tools/loyalty_migrate_shadow_to_live_once.js
```
