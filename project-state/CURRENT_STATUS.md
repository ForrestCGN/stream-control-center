# CURRENT STATUS – VIP30

Stand: 2026-06-06 08:55 UTC

## Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus
- STEP8.7.1 Routing-Fix für `/api/twitch/eventsub/status`

## Aktueller bestätigter Stand

VIP30 läuft im Live-System aus:

```txt
D:\Streaming\stramAssets
```

Lokales Repo:

```txt
D:\Git\stream-control-center
```

Der Live-vs-Repo-Abgleich für die relevanten Dateien wurde durchgeführt:

```txt
backend/modules/twitch.js
backend/modules/vip30.js
```

Ergebnis: Die VIP/EventSub-relevanten Stellen waren in Repo und Live vorhanden.

## STEP8.7.1 Statusroute

Problem:
`/api/twitch/eventsub/status?refresh=1` lieferte vorher die Helix-Subscription-Ausgabe statt den echten EventSub-Status-Snapshot.

Ursache:
`/api/twitch/eventsub/status` war zusätzlich am Subscription-Listing-Handler registriert.

Korrektur:
Der Alias `/api/twitch/eventsub/status` wurde aus dem Subscription-Listing entfernt. Die echte Statusroute bleibt aktiv:

```txt
/eventsub/status
/twitch/eventsub/status
/api/twitch/eventsub/status
```

Bestätigter Test nach `stepdone.cmd` und Node-Neustart:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status?refresh=1"
$s.vipEventBus
$s.configuredSubscriptions | Where-Object { $_.type -like "channel.vip*" }
```

Ergebnis:

```txt
vipEventBus.configured = True
knownRemove = True
knownAdd = True

channel.vip.add
channel.vip.remove
```

## Echter STEP8.7 Live-Test

Testablauf:

```txt
1. akighosty in Twitch manuell VIP gegeben
2. akighosty in Twitch manuell VIP entzogen
3. VIP30-Slots und Logs geprüft
```

Bestätigtes Ergebnis:

```txt
akighosty -> external_removed
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

Damit ist der komplette echte Ablauf bestätigt:

```txt
Twitch channel.vip.remove
-> backend/modules/twitch.js
-> Communication Bus: twitch.eventsub / channel.vip.remove
-> backend/modules/vip30.js
-> aktiver VIP30-Slot wird external_removed
-> Log wird geschrieben
```

## Aktueller Slot-Stand nach Test

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

Aktuell sind damit keine aktiven VIP30-Slots aus den Tests mehr offen.

## Safety-Stand

Weiterhin bewusst OFF / nicht aktiv:

- VIP30-Alert
- automatische Alert-Ausgabe
- zusätzliche Twitch-Writes außerhalb der getesteten VIP30-Live-Flows
- automatische Cleanup-Ausführung auf Start, sofern nicht separat geplant/aktiviert

## Nächster sinnvoller Schritt

STEP8.8 planen:

```txt
VIP30 Alert-Anbindung planen und danach erst umsetzen.
```

Vor Code zuerst klären:

- eigener VIP30-Alert oder Nutzung Sound-/Alert-System
- Trigger-Zeitpunkt: nur bei erfolgreicher VIP-Vergabe
- keine Alerts bei `external_removed`, Cleanup oder Blockern
- Textvarianten im CGN-/Altersheim-/Rentner-Stil
- Dashboardfähigkeit später berücksichtigen
- EventBus-/Status-/Diagnose-Felder prüfen
