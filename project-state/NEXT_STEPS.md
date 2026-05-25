# NEXT_STEPS – nach STEP406

## Direkt testen

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen:

```cmd
node --check backend\modules\vip_sound_overlay.js
```

3. Backend neu starten.
4. Status prüfen:

```text
http://127.0.0.1:8080/api/vip-sound/eventbus/status
http://127.0.0.1:8080/api/vip-sound/integration-check
```

5. Einen echten VIP-/Mod-Sound auslösen.
6. Danach erneut `/api/vip-sound/eventbus/status` prüfen.

## Möglicher nächster STEP

STEP407 kann danach die EventBus-Statusdaten im Dashboard sichtbar machen oder einen Watchdog/Recent-Events-Block ergänzen.

Keine Bus-only-Umstellung ohne gesonderte Entscheidung.
