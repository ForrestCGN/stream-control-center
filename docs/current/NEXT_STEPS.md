# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nach Installation testen

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/commands/bus-chat/start"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/twitch/presence/command-direct/disable"
```

Danach mit einem harmlosen Chat-Command testen und Status prüfen.

## Nächster fachlicher Step

```text
BUS-TWITCH.9 – Commands Bus-only Live-Test und Autostart-Entscheidung
```

Ziel: Wenn Bus-only stabil läuft, optional `COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true` setzen und Presence-Direktweg default deaktivieren.
