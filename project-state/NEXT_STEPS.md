# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nach Installation testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/twitch-events/status"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/twitch-events/start"
```

Danach echte Channelpoints-Einlösung auslösen und prüfen, ob VIP30 den neuen Eventpfad sieht.

## Nächster fachlicher Step

```text
BUS-TWITCH.16 – VIP30 Twitch-Events Subscriber Live-Test und Altweg-Vergleich
```

Ziel: Counters und Duplicate-Guard prüfen, bevor ein Source-Switch geplant wird.


## Nach BUS-TWITCH.15b

1. Node neu starten.
2. VIP30 TwitchEvents Subscriber manuell starten.
3. Erst normalen Reward, dann `30 Tage VIP` testen.
4. Pruefen, ob `lastNormalized.rewardTitle` und `lastResultReason` korrekt sind.
5. Danach entscheiden, ob BUS-TWITCH.16 Source-Switch/Autostart vorbereitet wird.
