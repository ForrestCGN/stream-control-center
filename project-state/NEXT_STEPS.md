# NEXT_STEPS – nach STEP412

## Direkt testen

Nach Entpacken und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP412" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `version` ist `0.1.13`
- `capability` ist `sound.event_output`
- `statusApiVersion` ist `1.0.0`
- `busMode` ist `legacy_parallel`
- `soundSystemRole` ist `central_audio_media_layer`
- `stats.emitted` steigt
- `stats.errors` bleibt `0`

## Danach sinnvoll

STEP413 – echten Sound-Playback-/Queue-Test über vorhandene `/api/sound/play` Route durchführen und prüfen:

- `sound.started`
- `sound.finished`
- `sound.queue.updated`
- alter Sound-System-WebSocket läuft weiter
- Playback läuft weiter
- Queue/Prioritäten bleiben stabil

## Danach erst

- Alert-System stärker mit Sound-Bus-Korrelation verbinden.
- VIP-System stärker mit Sound-Bus-Korrelation verbinden.
- Noch nicht direkt `sound.play` als produktive Bus-Steuerung erzwingen.
