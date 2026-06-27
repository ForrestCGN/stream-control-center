# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.7.1 DONE

Stand: 2026-06-06 08:55 UTC

## Ergebnis

STEP8.7 und STEP8.7.1 sind abgeschlossen und live bestätigt.

Der komplette echte Flow funktioniert:

```txt
Twitch channel.vip.remove
-> backend/modules/twitch.js
-> Communication Bus
-> backend/modules/vip30.js
-> aktiver VIP30-Slot wird external_removed
-> Log wird geschrieben
```

## Wichtig

Weiterhin nicht patchen.

Bei Änderungen:

```txt
vollständige echte Datei lesen/anfordern
vollständige Ersatzdatei liefern
ZIP mit echten Zielpfaden
node -c
stepdone.cmd
Node-Neustart
erst danach Live-Test
```

## Live-/Repo-Pfade

Live-System laut `/api/_status`:

```txt
D:\Streaming\stramAssets
```

Repo:

```txt
D:\Git\stream-control-center
```

## STEP8.7.1 Fix

Problem:
`/api/twitch/eventsub/status?refresh=1` lieferte vorher nicht den EventSub-Status-Snapshot, sondern eine Helix-Subscription-Ausgabe.

Ursache:
Doppelte/falsche Alias-Verwendung von `/api/twitch/eventsub/status`.

Fix:
In `backend/modules/twitch.js` wurde `/api/twitch/eventsub/status` aus dem Subscription-Listing-Handler entfernt. Die echte Statusroute bleibt aktiv.

## Bestätigter Status

Nach `stepdone.cmd` und Node-Neustart:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status?refresh=1"
$s.vipEventBus
$s.configuredSubscriptions | Where-Object { $_.type -like "channel.vip*" }
```

Ergebnis:

```txt
configured: True
knownRemove: True
knownAdd: True

channel.vip.add
channel.vip.remove
```

## Echter Live-Test

Ablauf:

```txt
akighosty in Twitch manuell VIP gegeben
akighosty in Twitch manuell VIP entzogen
```

Danach:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/slots?limit=5"
$s.slots | Select-Object userLogin,userDisplayName,status,startUtc,endUtc

$l = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs"
$l.logs | Select-Object -First 5 eventType,userLogin,success,reason,message,createdAt
```

Ergebnis:

```txt
userLogin: akighosty
status: external_removed
```

Log:

```txt
eventType: external_vip_remove_slot_released
userLogin: akighosty
success: True
reason: external_removed
message: Externer VIP-Entzug erkannt: aktiver VIP30-Slot wurde freigegeben.
createdAt: 2026-06-06T08:52:07.137Z
```

## Aktueller Slot-Stand

```txt
akighosty / AkiGhosty
status: external_removed
startUtc: 2026-06-05T19:29:55.399Z
endUtc:   2026-07-05T19:29:55.399Z

younecraft / YouneCraft
status: external_removed
startUtc: 2026-06-05T19:48:34.006Z
endUtc:   2026-07-05T19:48:34.006Z
```

## Safety

Weiterhin nicht aktiv:

```txt
VIP30-Alert
Auto-Alert
zusätzliche Twitch-Writes
automatische Cleanup-Aktivierung ohne separate Planung
```

## Nächster Schritt

STEP8.8 planen:

```txt
VIP30-Alert bei erfolgreicher VIP30-Vergabe
```

Vor Umsetzung klären:

```txt
- bestehendes Alert-System oder eigenes VIP30-Overlay
- Trigger nur bei erfolgreicher VIP-Vergabe
- keine Alerts bei external_removed, Cleanup, Blockern oder Refund
- Textvarianten CGN/Altersheim/Rentner
- Dashboardfähigkeit
- Diagnose-/Registry-Pflicht
```

## Relevante Dateien für nächsten Chat

```txt
backend/modules/vip30.js
backend/modules/twitch.js
backend/modules/communication_bus.js
docs/modules/vip30.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```
