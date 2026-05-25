# NEXT_STEPS – nach STEP415

## Direkt testen

1. Backend neu starten.
2. Debug-Client im Browser öffnen:

```text
http://127.0.0.1:8080/public/tools/sound_eventbus_debug.html
```

3. Communication-Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- Client `sound_eventbus_debug` ist verbunden.
- `module` ist `sound_system`.
- `version` ist `1.0.0`.
- `capabilities` enthält `sound.event_output`.

4. Sound-Bus Test auslösen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP415" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `stats.errors` bleibt `0`.
- `deliveredTo` enthält `sound_eventbus_debug`.
- Im Browser erscheint das Event.

## Danach sinnvoll

STEP416: Alert-System an den Sound-/Communication-Bus anbinden bzw. Alert-Sound-Korrelation über Bus sauber prüfen, ohne Alert-Bundles oder Sound-System-Queue zu beschädigen.
