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
