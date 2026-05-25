# NEXT_STEPS – nach STEP409

## Direkt testen

Nach Entpacken und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `version` ist `1.8.10`
- `capability` ist `vip.sound.status_events`
- `statusApiVersion` ist `1.0.0`
- kein `step`-Feld mehr

## Danach sinnvoll

STEP410 kann einer dieser Wege sein:

1. VIP EventBus Status als stabil dokumentieren.
2. `vip.sound` in eine allgemeine Communication Debug-/Dashboard-Auswertung aufnehmen.
3. Weitere echte VIP-/Mod-Command-Fälle testen: accepted, duplicate, sound_missing, denied.

Nicht als nächstes nebenbei umbauen:

- Sound-System
- Queue
- Overlay-Design
- Daily-Usage
- DB-Schema
