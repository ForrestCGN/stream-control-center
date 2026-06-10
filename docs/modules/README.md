# Module-Dokumentation

Stand: 2026-06-10

## Twitch Events

```text
BUS-TWITCH.5 – EventSub Chat Live Token/ID Readiness Check
```

`twitch_events` ist die zentrale Twitch-Event-Schicht. EventSub-Ownership ist vorbereitet, aber nicht aktiv. Chat läuft aktuell weiterhin über die IRC/Presence Parallel Bridge; `channel.chat.message` wird live auf IDs/Scopes geprüft.
