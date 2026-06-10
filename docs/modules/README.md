# Module-Dokumentation

Stand: 2026-06-10

## Aktueller BUS-TWITCH-Stand

```text
BUS-TWITCH.11 – Dokumentation/Konsolidierung nach erfolgreicher Chat-/Commands-Migration
```

## Bestätigte Modulbereiche

```text
twitch_events   Zentrale Twitch-Event-Schicht, EventSub Chat aktiv
twitch.js       Twitch-Core/API/OAuth/Helix, bestehende EventSub-Flows bleiben aktiv
commands        Command-Verarbeitung per Bus-Subscriber aktiv
twitch_presence IRC/Presence/Fallback, Direct Command Hook default aus
communication_bus Transport/Monitoring/Subscriptions/Heartbeat
```

## Wichtige Projektregeln

```text
Keine Funktionalität entfernen.
Neue Buswege zuerst parallel testen.
Alte Direktwege erst nach erfolgreichem Subscriber-Test deaktivieren.
DB-Dateien nicht ersetzen.
StepDone vor Live-Test.
```
