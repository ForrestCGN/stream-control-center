# CURRENT CHAT HANDOFF – BUS-TWITCH.15

Stand: 2026-06-10

## Ergebnis

VIP30 hat einen steuerbaren Subscriber auf das neue zentrale Twitch-Event:

```text
twitch.channelpoints.redemption.created
channel=twitch.channelpoints.redemption
action=created
```

## Altweg bleibt aktiv

```text
channelpoints.redemption / received
```

## Test

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/twitch-events/start"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/twitch-events/status"
```

## Nächster Step

BUS-TWITCH.16 – VIP30 Twitch-Events Subscriber Live-Test und Altweg-Vergleich.
