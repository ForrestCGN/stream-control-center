# NEXT STEPS - stream-control-center

Stand: 2026-05-10

## Naechster echter Stream - Loyalty Livetest

Vor Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" | ConvertTo-Json -Depth 40
```

Nach Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Nach 10 bis 12 Minuten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=10" | ConvertTo-Json -Depth 120
```

Nach Streamende:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```

## Worauf achten

- `timerActive = true` nach Streamstart.
- `stream_state_start_signal` wenn Twitch/EventSub zusaetzlich online meldet.
- `manual.source = streamerbot` soll bei Doppelstart erhalten bleiben.
- `run_ok` nach 10 bis 12 Minuten.
- `awarded > 0` bei faelligen Watch-Punkten.
- `ignored_user` bei Bots/Systemusern.
- Event-Boni fuer Follow/Sub/Resub/Bits/Raid/GiftSub weiterhin pruefen.

## Danach

- Streamauswertung als ZIP erzeugen.
- Echte Streamdaten auswerten.
- Bot-Ignore-Liste ggf. erweitern.
- Dashboard-Ansicht fuer Loyalty Runner/Events/Transactions planen.
- Shadow-vs-Live-Umschaltung erst nach mehreren erfolgreichen Livetests entscheiden.
