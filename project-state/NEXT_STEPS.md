# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## STEP203.6 testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"features.eventBonusesEnabled":true}' | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/follow?login=testfollow&displayName=TestFollow" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/subscribe?login=testsubevent&displayName=TestSubEvent&tier=2000" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/cheer?login=testbits&displayName=TestBits&bits=500" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 30
```

## Danach

```text
STEP203.7 - Loyalty Event Dashboard Auswertung / Live Shadow Prep
```
