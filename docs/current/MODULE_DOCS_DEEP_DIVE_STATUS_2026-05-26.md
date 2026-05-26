# MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26

## Aktualisiert

- `docs/modules/clip-shoutout-vso-deep-dive.md` aus STEP486 bleibt aktueller Shoutout-Stand.
- `docs/modules/core-communication-bus.md` in STEP487 aktualisiert.
- `docs/modules/helper-communication-contract.md` in STEP487 neu angelegt.
- `docs/modules/README.md` in STEP487 ergänzt.

## Aktueller Stand

- STEP483 Dashboard Tabs dokumentiert.
- STEP484 Incoming-Shoutout-EventSub-Integration dokumentiert.
- STEP485 Produktionscheck dokumentiert.
- STEP486 Live-Test-/Decision-Prep dokumentiert.
- STEP487 Communication-Bus-Modul-Contract dokumentiert.

## Communication-Bus-Fokus ab STEP487

Der bestehende Communication Bus hat bereits:

```text
Client Registry
Heartbeat
gezielte Event-Auslieferung
ACK-Tracking
Replaybare Events
Issue-/Fehler-Tracking
Statusausgabe
```

STEP487 ergänzt optional:

```text
Backend-Modul-Registrierung
Backend-Modul-Abmeldung
Backend-Modul-Heartbeat
Backend-Modul-Status
Backend-Subscribe/Unsubscribe
Backend-Modul-Client
Contract-Status
```

## Nächster Doku-Fokus

Nach STEP487 soll das kommende Kanalpunkte-System dokumentiert werden:

```text
docs/modules/channelpoints.md oder channelpoints-deep-dive.md
```

Dabei müssen mindestens dokumentiert werden:

```text
Twitch-Reward-Routen
DB-Tabellen
Dashboard-Dateien
EventBus-Channels/Actions
Reward-Aktivierung über Twitch is_enabled
Scopes
Tests
offene Punkte
```

Zusätzlich bleiben die echten Shoutout-Live-Test-Ergebnisse aus `/api/clip-shoutout/production-check`, `/api/clip-shoutout/live-test` und echten Shoutout-Events zu dokumentieren.
