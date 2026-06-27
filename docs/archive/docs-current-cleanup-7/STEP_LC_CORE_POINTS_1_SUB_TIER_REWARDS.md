# STEP LC-CORE-POINTS-1 – Sub-Tier-Watch-Werte und Resub-Bonus

Stand: 2026-06-15

## Ziel

Der Loyalty-Core wird an die bisherige StreamElements-Punktevergabe angepasst und für Subscriber-Tiers vorbereitet.

## Fachliche Zielwerte

```text
Viewer: 2 Kekskrümel alle 10 Minuten
Tier 1 Subscriber: 6 Kekskrümel alle 10 Minuten
Tier 2 Subscriber: 8 Kekskrümel alle 10 Minuten
Tier 3 Subscriber: 10 Kekskrümel alle 10 Minuten

Follow: 10 Kekskrümel
Sub Tier 1/2/3: 50 / 100 / 150 Kekskrümel
Resub Tier 1/2/3: 50 / 100 / 150 Kekskrümel
Cheer: 10 Kekskrümel pro 100 Bits
Tip: 10 Kekskrümel pro 1 EUR
Raid: 50 Kekskrümel
```

## Umsetzung

```text
backend/modules/loyalty.js
```

Änderungen:

```text
- Modulversion auf 0.1.15 erhöht.
- DEFAULT_CONFIG.watch.subscriberTierAmounts ergänzt: 1000=6, 2000=8, 3000=10.
- SETTINGS_DEFINITIONS um watch.subscriberTierAmounts erweitert.
- bonuses.resub.enabled im Default auf true gesetzt.
- calculateWatchAmount() wertet Subscriber-Tier bevorzugt aus.
- subscriberMultiplier bleibt als Fallback erhalten.
- recordWatchHeartbeat() nimmt subscriberTier/subscriber_tier/tier/subTier/subscriptionTier an.
- Presence-Runner übergibt Subscriber-Tier an den Watch-Heartbeat.
- Neuer Watch-State bekommt nicht mehr sofort Punkte, sondern wartet bis zum ersten Intervall.
```

## Wichtig zu bestehenden Live-Settings

Die Settings liegen in der produktiven SQLite und werden über `helper_settings.seedDefaults()` nur eingefügt, wenn sie fehlen. Bestehende Werte werden nicht automatisch überschrieben.

Deshalb nach Deploy/StepDone prüfen und bei Bedarf setzen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"key":"watch.subscriberTierAmounts","value":{"1000":6,"2000":8,"3000":10}}'
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"key":"bonuses.resub.enabled","value":true}'
```

## Nicht geändert

```text
Keine Commands aktiviert.
Keine Live-/Shadow-Umstellung.
Keine Giveaway-/Games-Änderung.
Keine produktive SQLite ersetzt oder gelöscht.
Keine EventBonus-Typen außer Resub-Default geändert.
Keine Dashboard-Neustruktur.
```

## Tests

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/states?limit=20" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?limit=20&type=watch_interval" | ConvertTo-Json -Depth 8
```

Gezielte Watch-Heartbeat-Tests nur mit klaren Testusern ausführen, weil diese produktive SQLite-Einträge erzeugen.

## StepDone

```powershell
.\stepdone.cmd "LC-CORE-POINTS-1 Sub-Tier-Watch-Werte und Resub-Bonus vorbereitet"
```
