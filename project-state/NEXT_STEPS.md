# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
```

Danach den Start/Stop-Fallback testen.
