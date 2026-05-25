# STEP410 – VIP EventBus Delivery Classification

## Ziel

`vip.sound` Status-Events sollen nicht mehr breit an alle Bus-Clients ausgeliefert werden.

Im letzten Test landete das Event zusätzlich bei einem Alert-Shadow-Client. Das war nicht akut kaputt, aber diagnostisch unsauber.

## Änderung

In `backend/modules/vip_sound_overlay.js` wurde die EventBus-Zieladresse von allgemein auf modulbezogen umgestellt:

```text
vorher:
target.type: all
target.id: *
target.module: ""
target.capability: ""

nachher:
target.type: all
target.id: *
target.module: vip_sound_overlay
target.capability: ""
```

Zusätzlich meldet `/api/vip-sound/eventbus/status` jetzt:

```text
target
deliveryClassification: module_scoped_status_event
```

## Version

```text
vip_sound_overlay.js: 1.8.11
statusApiVersion: 1.0.0
capability: vip.sound.status_events
```

## Bewusst nicht geändert

- Kein Sound-System-Umbau
- Keine Queue-Änderung
- Keine Daily-Usage-Änderung
- Keine Overlay-Designänderung
- Keine DB-Migration
- Keine Änderung an den bestehenden VIP-Routen

## Test

Syntaxprüfung:

```cmd
node --check backend\modules\vip_sound_overlay.js
```

Live-Test nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/command?login=forrestcgn&displayName=ForrestCGN&targetLogin=araglor&targetDisplayName=araglor&source=step410-test&trigger=!vip&actorIsBroadcaster=true" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung: `deliveredTo` enthält nur noch passende `vip_sound_overlay`-Clients und keine fremden Alert-Clients mehr.
