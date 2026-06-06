# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.11 Alert Bus Event

Stand: 2026-06-06

## Ergebnis

STEP8.11 ergänzt den VIP30-Live-Erfolg um ein Alert-Bus-Event.

Wenn der VIP30-Live-Flow erfolgreich ist:

```txt
VIP vergeben
VIP30-Slot gespeichert
Redemption fulfilled (Stage B)
-> vip30.alert / trigger
```

## Wichtig

Dies ist noch keine neue Overlay-/Sound-Implementierung.  
Es ist die saubere Backend-Vorbereitung, damit das vorhandene Alert-/Sound-System danach gezielt an `vip30.alert` angebunden werden kann.

## Geändert

```txt
backend/modules/vip30.js
```

## Nicht geändert

```txt
htdocs/dashboard/...
backend/modules/twitch.js
backend/modules/communication_bus.js
bestehende VIP-/Sound-/Alert-Module
```

## Safety

Alert wird nur erzeugt, wenn:

```txt
result.ok === true
alerts.enabled !== false
live.allowAlert === true
Bus verfügbar
```

Kein Alert bei:

```txt
Refund / Cancel
Slots voll
User ist bereits VIP
User hat bereits aktiven VIP30-Slot
Cleanup
external_removed
manuellen Admin-Aktionen
Fehlern
```

## Neues Bus-Event

```txt
channel: vip30.alert
action: trigger
```

Payload enthält:

```txt
user
slot
alert.soundKey
alert.durationMs
alert.title
alert.message
sourceResult
```

## Neue Statusroute

```txt
GET /api/vip30/alert/status
```

Diese Route ist read-only.

## Tests

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.11 Alert Bus Event"
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/status" | ConvertTo-Json -Depth 6
```

## Nächster Schritt

STEP8.12:

```txt
VIP30 Alert an bestehendes Alert-/Sound-System anbinden
```
