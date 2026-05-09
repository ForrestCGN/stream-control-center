# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster Schritt

### STEP203.3.1 testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot_test" | ConvertTo-Json -Depth 30
```

## Danach

Wenn sauber:

```text
STEP203.4 - Loyalty Auto Shadow Runner
```
