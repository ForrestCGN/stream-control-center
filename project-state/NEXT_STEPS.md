# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Twitch Events / Communication Bus

### Direkt nach Installation von BUS-TWITCH.1 testen

```powershell
node -c .\backend\modules\twitch_events.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s | Select-Object ok,module,moduleVersion,health,lastError
```

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/catalog"
$c | Select-Object ok,module,moduleVersion,count
```

```powershell
$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.clients | Where-Object { $_.module -eq "twitch_events" } | Select-Object id,module,status,lastHeartbeatAt,heartbeatCount
```

### Naechster Code-Step

```text
BUS-TWITCH.2 – Chat parallel anbinden
```

Ziel:

```text
twitch_presence -> twitch_events.handleIrcEvent(...)
commands.handleChatMessage(...) bleibt parallel aktiv.
Kein ACK, kein Replay, keine Queue fuer Chat.
Keine Funktion entfernen.
```

### Danach

```text
BUS-TWITCH.3 – EventSub parallel anbinden
BUS-TWITCH.4 – VIP30 Channelpoints Subscriber / Fulfill-Cancel Lifecycle
BUS-TWITCH.5+ – weitere Module einzeln migrieren
```

## AutoShout / Shoutout

```text
1. Falls noch vorhanden: forrestcgn aus AutoShout-Streamer-Liste entfernen.
2. papselzockt_ / papselzockt_cgn prüfen und korrekten Login speichern.
3. Optional später AutoShout-Diagnose ergänzen.
4. Keine weitere Codeänderung ohne neuen Auftrag.
```

## Loyalty / Glücksrad

```text
LWG-4N.7 einspielen und Runtime testen, sofern dieser Bereich wieder aufgenommen wird.
```
