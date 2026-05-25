# NEXT_STEPS – nach STEP413

## Direkt testen

Nach Entpacken, `node --check` und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP413" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- `version` ist `0.1.14`
- `configVersion` darf eine ältere Runtime-/Config-Version zeigen
- `capability` ist `sound.event_output`
- `deliveryClassification` ist `capability_scoped_legacy_parallel_event_stream`
- `target.capability` ist `sound.event_output`
- `stats.errors` bleibt `0`
- Legacy-API und Legacy-WebSocket bleiben unverändert

## Danach sinnvoll

1. Einen echten Sound über `/api/sound/play` testen und `sound.started`/`sound.finished` im EventBus-Status prüfen.
2. Danach Alert-System mit Sound-Bus-Korrelation sauber anbinden.
3. Danach VIP-System mit Sound-Bus-Korrelation erweitern.
