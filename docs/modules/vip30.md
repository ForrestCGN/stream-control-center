# Modul: VIP30 / 30 Tage VIP

Stand: VIP30-STEP2 / 2026-06-05
Version: `0.2.0` / `step2-twitch-capability-check`

## Zweck

VIP30 verwaltet das geplante 30-Tage-VIP-System vollständig im Node-Backend des `stream-control-center`.

Der Reward soll direkt im bestehenden Kanalpunkte-System eingetragen werden:

```text
reward_key: vip30
title: 30 Tage VIP
cost: 50000
category_key: vip
action_type: vip30
action_key: vip30.redeem
auto_fulfill: false
```

## Aktueller STEP2-Umfang

STEP2 ergänzt nur den Twitch-Capability-Check. Es werden keine Twitch-Live-Aktionen ausgeführt.

Vorhanden:

```text
/api/vip30/status
/api/vip30/health
/api/vip30/slots
/api/vip30/logs
/api/vip30/stats
/api/vip30/twitch/capability
/api/vip30/twitch/scopes
```

## Twitch Capability Check

`GET /api/vip30/twitch/capability` fragt intern die vorhandene Twitch-Auth-Validate-Route ab:

```text
/api/twitch/auth/validate
```

Geprüft werden:

```text
channel:manage:redemptions
channel:manage:vips
Broadcaster/User-Match, sofern verfügbar
Token gültig
```

Wichtig:

```text
checkOnly: true
noTwitchWrite: true
noVipGrant: true
noVipRevoke: true
noRedemptionFulfillCancel: true
```

## Benötigte Scopes

```text
channel:manage:redemptions
```

wird später benötigt, um eine Channelpoints-Redemption nach erfolgreicher VIP-Vergabe auf `FULFILLED` oder bei Ablehnung/Fehler auf `CANCELED` zu setzen.

```text
channel:manage:vips
```

wird später benötigt, um VIPs zu setzen und nach Ablauf wieder zu entfernen.

Optional:

```text
channel:read:vips
```

kann für reine Lese-/Diagnoseprüfungen hilfreich sein. Für Add/Remove bleibt `channel:manage:vips` relevant.

## Bus

VIP30 meldet sich am Communication Bus als Modul `module:vip30` an und sendet Heartbeats.

Capabilities in STEP2:

```text
vip30.status
vip30.slots
vip30.logs
vip30.stats
vip30.twitch.capability
vip30.cleanup.planned
vip30.redeem.planned
```

Zusätzlich wird beim Capability-Check ein Event auf `vip30.twitch` gesendet:

```text
capability.ready
capability.missing
```

## Logging

Normale VIP30-Abläufe werden nicht ins Server-Log geschrieben. Dashboard/DB bleiben die primäre Stelle.

Tabellen:

```text
vip30_slots
vip30_log
```

## Tests

Nach Entpacken:

```powershell
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP2 Twitch Capability Check"
```

Nach erfolgreichem Stepdone und Serverstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/twitch/scopes" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/twitch/capability" | ConvertTo-Json -Depth 8
```

Bus-Check:

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$c.status.clients |
  Where-Object module -eq "vip30" |
  Select-Object id,module,status,lastHeartbeatAt,heartbeatCount
```

## Nicht enthalten

```text
Keine VIP-Vergabe
Kein VIP-Entzug
Kein Fulfill/Cancel einer Redemption
Kein Channelpoints-Executor-Umbau
Kein Dashboard-UI-Umbau
Kein Streamer.bot
Kein Import alter JSON-Daten
```
