# Module-Dokumentation

Stand: 2026-06-10

## Aktueller Twitch-/Bus-Stand

```text
STEP BUS-TWITCH.3 – EventSub Ownership Preparation
```

## Bestaetigte Twitch-Event-Bereiche

```text
BUS-TWITCH.1  twitch_events Foundation
BUS-TWITCH.2  Chat Parallel Bridge ueber twitch_presence/IRC live bestaetigt
BUS-TWITCH.3  EventSub Ownership Preparation, keine Altlogik entfernt
```

## Wichtige Projektregeln

```text
Keine Funktionalitaet entfernen.
Bestehende Twitch-/EventSub-/Presence-/Command-Flows bleiben aktiv, bis Ersatz ueber twitch_events erfolgreich getestet und dokumentiert ist.
ACK/Replay fuer Twitch-Events sind vorbereitet, aber default aus.
Chat-Events bleiben lightweight: kein ACK, kein Replay, ttlMs 0, minimaler Payload.
```

## Relevante Modul-Dokus

```text
docs/modules/twitch_events.md
```
