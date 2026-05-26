# NEXT_STEPS

Stand: 2026-05-26 / nach STEP489

## Direkt pruefen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
```

Falls STEP487 bereits entpackt wurde:

```bat
del backend\modules\helpers\helper_communication_contract.js
```

Danach:

```bat
.\stepdone.cmd "STEP489 Channelpoints Backend Skeleton"
```

## Runtime-Test nach stepdone und Server-Neustart

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

## Erwartung

- `/api/channelpoints/status` liefert `ok=True`.
- `moduleVersion` ist `0.1.0`.
- `bus.registered` ist `True`.
- `/api/channelpoints/bus-test` liefert `result.ok=True`.
- `subscriberDeliveredCount` ist mindestens `1`.
- `/api/communication/status` zeigt einen Modul-Client fuer `channelpoints` und mindestens eine `channelpoints`-Subscription.

## Offener Nachziehpunkt

`communication_bus.js` zeigt nach aussen noch `coreVersion 0.3.0`, waehrend der Helper-Core seit STEP488 `0.4.0` ist. Nicht nebenbei aendern; in einem kleinen Folge-STEP sauber nachziehen, falls gewuenscht.

## Naechster sinnvoller Fach-STEP

```text
STEP490_CHANNELPOINTS_TWITCH_READINESS_CHECK
```

Ziel:

```text
Twitch-Scopes und vorhandene Twitch-Helper pruefen
Readiness-/Diagnose-Route fuer Kanalpunkte vorbereiten
nur lesend/diagnostisch
keine Reward-Schreibaktionen
keine DB-Migration
```
