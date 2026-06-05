# VIP30 / 30 Tage VIP

Stand: VIP30-STEP3 / 2026-06-05  
Version: `0.3.0` / `step3-channelpoints-reward-link`

## Ziel

VIP30 ist ein Node-only Modul im `stream-control-center` fuer die 30-Tage-VIP-Kanalpunkte-Belohnung.

STEP3 verbindet VIP30 sicher mit dem vorhandenen Channelpoints-System, ohne Twitch-Live-Aktionen auszufuehren.

## Reward-Festlegung

```txt
reward_key: vip30
title: 30 Tage VIP
cost: 40000
category_key: vip
action_type: vip30
action_key: vip30.redeem
auto_fulfill: false
twitch_is_enabled: false in STEP3
```

## STEP3-Umfang

Enthalten:

- VIP30 Version `0.3.0`.
- Kosten von 50.000 auf **40.000 Kanalpunkte** angepasst.
- Lokaler Channelpoints-Reward-Status.
- Lokaler Channelpoints-Reward-Ensure.
- Automatische Kategorie `vip`, falls noch nicht vorhanden.
- Reward wird in `channelpoints_rewards` angelegt oder aktualisiert.
- Reward bleibt auf Twitch-Seite inaktiv (`twitch_is_enabled = 0`).
- Action-Payload setzt Schutzflags fuer STEP3.
- Bus-Event `vip30.channelpoints / reward.ensured`.
- Logging in `vip30_log` ueber `channelpoints_reward_ensured`.

Nicht enthalten:

- Kein Add VIP.
- Kein Remove VIP.
- Kein Fulfill/Cancel.
- Kein Twitch-Reward-Push.
- Keine Live-Redemption-Ausfuehrung.
- Keine Streamer.bot-Abhaengigkeit.
- Kein Legacy-Import.

## Routen

```txt
GET  /api/vip30/status
GET  /api/vip30/health
GET  /api/vip30/slots
GET  /api/vip30/logs
GET  /api/vip30/stats
GET  /api/vip30/twitch/capability
GET  /api/vip30/twitch/scopes
GET  /api/vip30/channelpoints/reward/status
POST /api/vip30/channelpoints/reward/ensure?confirm=YES
```

## Tests

Nach Entpacken:

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modulesip30.js
.\stepdone.cmd "VIP30-STEP3 Channelpoints Reward Link 40000"
```

Nach Serverstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/reward/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/reward/ensure?confirm=YES" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/reward/status" | ConvertTo-Json -Depth 8
```

Bus-Check:

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$c.status.clients |
  Where-Object module -eq "vip30" |
  Select-Object id,module,status,lastHeartbeatAt,heartbeatCount
```

## Sicherheitsregeln

STEP3 schreibt nur lokal in die bestehende SQLite-DB-Tabellen des Channelpoints-Systems.

Der Reward wird absichtlich mit `twitch_is_enabled = 0` gespeichert. Dadurch wird nichts auf Twitch live geschaltet.

Die Payload enthaelt:

```json
{
  "vip30": {
    "dryRunOnly": true,
    "noTwitchWriteInThisStep": true,
    "noVipGrantInThisStep": true,
    "noRedemptionFulfillCancelInThisStep": true
  },
  "twitch": {
    "should_redemptions_skip_request_queue": false,
    "fulfill_after_success": false,
    "cancel_on_failure": false
  }
}
```

Damit wird verhindert, dass eine versehentlich aktive Redemption im aktuellen STEP automatisch fulfilled/canceled wird, solange der echte VIP30-Ausfuehrungspfad noch nicht umgesetzt ist.
