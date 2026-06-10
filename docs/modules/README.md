# Module-Dokumentation

Stand: 2026-06-10

## Twitch Events / Twitch OAuth

```text
BUS-TWITCH.5b – User OAuth Force Verify + Scope Diagnostics
```

`twitch_events` bleibt die zentrale Twitch-Event-Schicht und weiterhin im vorbereiteten Zustand fuer EventSub Chat. `twitch.js` wurde nur fuer OAuth-Force-Verify und sichere Scope-Diagnose erweitert, damit `user:read:chat` sauber in den ForrestCGN User-Token gelangen kann.

## Wichtige Regel

```text
Keine EventSub-Subscription wird durch BUS-TWITCH.5b erstellt.
Kein EventSub-Takeover.
Keine bestehende Funktionalitaet entfernen.
```
