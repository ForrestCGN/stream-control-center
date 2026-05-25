# NEXT_STEPS – nach STEP410

## Direkt testen

Nach Entpacken und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/command?login=forrestcgn&displayName=ForrestCGN&targetLogin=araglor&targetDisplayName=araglor&source=step410-test&trigger=!vip&actorIsBroadcaster=true" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `version` ist `1.8.11`
- `target.module` ist `vip_sound_overlay`
- `deliveryClassification` ist `module_scoped_status_event`
- `counters.errors` bleibt `0`
- `last.action` ist z. B. `override_accepted`
- `last.result.deliveredTo` enthält keine fremden Alert-Clients mehr

## Danach sinnvoll

Wenn `deliveredTo` sauber ist:

1. VIP EventBus Status als stabil dokumentieren.
2. Weitere echte VIP-/Mod-Command-Fälle testen: accepted, duplicate, sound_missing, denied.
3. Danach erst überlegen, ob `vip.sound` ins Dashboard/Debug-UI aufgenommen wird.

Nicht als nächstes nebenbei umbauen:

- Sound-System
- Queue
- Overlay-Design
- Daily-Usage
- DB-Schema
