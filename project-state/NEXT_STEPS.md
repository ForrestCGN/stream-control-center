# NEXT_STEPS – nach STEP416

## Direkt testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/test?message=STEP416" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- `version` ist `3.1.0`
- `capability` ist `alert.event_output`
- `statusApiVersion` ist `1.0.0`
- `busMode` ist `legacy_parallel`
- `stats.emitted` steigt
- `stats.errors` bleibt `0`
- `queueTouched`, `soundSystemTouched` und `overlayTouched` sind `false`

## Danach sinnvoll

STEP417: Alert EventBus Debug-Consumer oder bestehendes Alert-Overlay versionieren/klassifizieren.

Nicht nebenbei umbauen:

- Alert-Queue
- Alert-TTS
- Sound-System-Bundles
- Overlay-Design
- DB-Schema
