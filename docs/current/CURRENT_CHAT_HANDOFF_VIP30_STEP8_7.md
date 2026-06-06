# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.7 Übergabe

Stand: 2026-06-06 08:34:56 UTC

## Wichtigster Punkt für den nächsten Chat

Nicht patchen.

Zuerst Live vs Repo prüfen:
- Laufender Node-Root laut `/api/_status`: `D:\Streaming\stramAssets`
- Repo lokal: `D:\Git\stream-control-center`

STEP8.7 wurde im Ablauf unsauber vorbereitet, weil Patch-Skript-Arbeitsweise verwendet wurde. Im nächsten Chat zuerst echte Dateien vergleichen und dann vollständigen Datei-/Deploy-Stand herstellen.

## Aktueller VIP30-Stand

### Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation

### Noch offen

- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus sauber abschließen
- Alert ist weiterhin bewusst OFF

## STEP8.5 Cleanup

Version: `0.8.5`  
Build: `step8.5-cleanup-expire-revoke-manual`

Routen:
- `GET /api/vip30/cleanup/check`
- `POST /api/vip30/cleanup/run`

Getestet:
```txt
cleanup_ready
armed: True
blockerCount: 0
expiredCount: 0
dry_run_no_expired_slots
```

## STEP8.6 Externer VIP-Entzug

Version: `0.8.6`  
Build: `step8.6-external-vip-remove-slot-release`

Routen:
- `GET /api/vip30/external-vip-remove/status`
- `POST /api/vip30/external-vip-remove/test`
- `POST /api/vip30/external-vip-remove/process?confirm=YES`

Getestet:
```txt
enabled: True
subscribed: True
Subscriptions:
- module:vip30:twitch.eventsub:channel.vip.remove
- module:vip30:twitch.vip:remove
```

Simulation mit `younecraft`:
```txt
younecraft:
active -> external_removed
```

Log:
```txt
external_vip_remove_slot_released
success: True
reason: external_removed
message: Externer VIP-Entzug erkannt: aktiver VIP30-Slot wurde freigegeben.
```

## Aktueller Slot-Stand aus dem Test

```txt
akighosty / AkiGhosty
status: active
startUtc: 2026-06-05T19:29:55.399Z
endUtc:   2026-07-05T19:29:55.399Z

younecraft / YouneCraft
status: external_removed
startUtc: 2026-06-05T19:48:34.006Z
endUtc:   2026-07-05T19:48:34.006Z
```

Achtung:
- `younecraft` wurde nur im VIP30-System per Test auf `external_removed` gesetzt.
- Twitch selbst wurde dadurch nicht verändert.

## STEP8.7 aktueller Befund

In `D:\Git\stream-control-center\backend\modules\twitch.js` wurden per `Select-String` bereits STEP8.7-Inhalte gefunden:
- `channel.vip.remove`
- `vipEventBus`
- `twitch.eventsub`
- `channel.vip.add`

Aber `/api/twitch/eventsub/status?refresh=1` zeigte:
- `$s.vipEventBus` leer
- keine `channel.vip*` in `configuredSubscriptions`

Ursache:
```txt
/api/_status rootDir = D:\Streaming\stramAssets
```

Das bedeutet:
- Der laufende Node nutzt Live-System `D:\Streaming\stramAssets`
- Forrest arbeitete im Repo `D:\Git\stream-control-center`
- Live-Datei ist vermutlich noch nicht auf STEP8.7-Stand

## Nächster sauberer Start

### 1. Root prüfen

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$r.rootDir
$r.modules | Where-Object { $_ -like "*twitch*" }
```

### 2. Live vs Repo vergleichen

```powershell
Select-String -Path D:\Git\stream-control-center\backend\modules\twitch.js -Pattern "channel.vip.remove","vipEventBus","twitch.eventsub" | Select-Object LineNumber,Line

Select-String -Path D:\Streaming\stramAssets\backend\modules\twitch.js -Pattern "channel.vip.remove","vipEventBus","twitch.eventsub" | Select-Object LineNumber,Line
```

### 3. Wenn Live nicht aktuell ist

Kein Patch-Skript.

Saubere Optionen:
- vollständigen STEP8.7.1-ZIP mit kompletter `backend/modules/twitch.js` und Doku erzeugen
- oder kontrollierter Deploy über bestehendes Projektverfahren

Standard nach Übernahme:
```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\twitch.js
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.7 Twitch EventSub VIP Remove Bus"
```

Danach Node neu starten.

### 4. EventSub prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status?refresh=1"
$s.vipEventBus
$s.configuredSubscriptions | Where-Object { $_.type -like "channel.vip*" }
```

Erwartung:
```txt
vipEventBus.configured = True
channel.vip.add
channel.vip.remove
```

Wenn configured vorhanden, aber noch nicht known/subscribed:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/reconcile"
```

Danach erneut Status prüfen.

## Nach STEP8.7

Echten Test erst dann:
```txt
Einem aktiven VIP30-User in Twitch manuell VIP entziehen
-> prüfen, ob VIP30-Slot automatisch external_removed wird
```

Prüfen:
```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/slots?limit=5"
$s.slots | Select-Object userLogin,userDisplayName,status,startUtc,endUtc

$l = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs"
$l.logs | Select-Object -First 5 eventType,userLogin,success,reason,message,createdAt
```
