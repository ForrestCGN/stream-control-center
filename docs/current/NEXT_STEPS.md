# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Direkt nach Einspielen von LC-CORE-POINTS-1

```powershell
.\stepdone.cmd "LC-CORE-POINTS-1 Sub-Tier-Watch-Werte und Resub-Bonus vorbereitet"
```

Danach testen, kein zweites StepDone nach erfolgreichem Test.

## Syntax

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
```

## Settings prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" | ConvertTo-Json -Depth 8
```

Wenn bestehende Live-Settings noch alte Werte enthalten, gezielt setzen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"key":"watch.subscriberTierAmounts","value":{"1000":6,"2000":8,"3000":10}}'
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"key":"bonuses.resub.enabled","value":true}'
```

## Core-Status prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/states?limit=20" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?limit=20&type=watch_interval" | ConvertTo-Json -Depth 8
```

## Watch-Flow testen

Nur mit klaren Testusern testen, weil Einträge in der produktiven SQLite entstehen.

Erwartung:

```text
Erster Heartbeat: skipped=true, awarded=false, reason=watch_interval_initial_wait.
Fälliger Heartbeat nach Intervall: awarded=true.
Viewer: 2.
Tier 1: 6.
Tier 2: 8.
Tier 3: 10.
```

## Danach sinnvoll

```text
LC-CORE-POINTS-2 – EventBonus-Pfad mit echten Twitch-Events prüfen: Follow/Sub/Resub/Cheer/Raid/Tip.
```
