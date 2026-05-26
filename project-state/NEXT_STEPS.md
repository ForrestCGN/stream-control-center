# NEXT_STEPS

1. STEP466-ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen:

```bat
node --check backend\modules\stream_status.js
node --check backend\modules\clip_shoutout.js
```

3. Projektstand abschließen:

```bat
.\stepdone.cmd "STEP466 Stream Live Status Core"
```

4. Backend neu starten.
5. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
```

6. Clip-Shoutout-Queue prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" | ConvertTo-Json -Depth 10
```
