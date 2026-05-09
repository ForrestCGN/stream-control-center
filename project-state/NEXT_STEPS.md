# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/run-once?source=test_offline" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/run-once?source=test_live" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/start?source=manual_test" | ConvertTo-Json -Depth 30
Start-Sleep -Seconds 70
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/stop?source=manual_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events" | ConvertTo-Json -Depth 30
```

## Danach

```text
STEP203.5 - Live Shadow Test Vorbereitung / Cleanup
```
