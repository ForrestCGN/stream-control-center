# NEXT_STEPS

1. STEP467-ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen: `node --check backend\modules\stream_status.js`.
3. `stepdone.cmd` ausführen.
4. Backend neu starten.
5. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/refresh?forceApi=1" | ConvertTo-Json -Depth 10
```

6. Danach `clip_shoutout` Live-Gate prüfen:

```powershell
$q = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
$q.officialQueue.liveGate | ConvertTo-Json -Depth 10
```

Wenn der Twitch-Backend-Endpunkt valide antwortet, soll `stream_status` nicht mehr `stale=true` aus der alten Datei melden, sondern `source=twitch_api` und `statusKnown=true`.

## Nach STEP468

1. Live/offline in `stream_status` gegen echten Streamstart testen.
2. Prüfen, ob `clip_shoutout` im Live-Gate `upstreamSource: twitch_api`, `statusKnown: true` und `stale: false` sieht.
3. Danach weitere Module schrittweise auf zentralen Stream-Status umstellen.
