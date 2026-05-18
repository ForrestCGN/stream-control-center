# STEP207 – Loyalty AutoRunner Boot Recovery

Dieses ZIP direkt nach `D:\Git\stream-control-center` entpacken.

Danach ausführen:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: recover loyalty runner after backend restart"
```

Nach Deploy testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
```

Erwartung:

- `version = 0.1.10`

Recovery-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot&reason=step207_recovery_test" | ConvertTo-Json -Depth 60
```

Dann Backend/Node neu starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Danach Test sauber beenden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot&reason=step207_recovery_test_stop" | ConvertTo-Json -Depth 60
```
