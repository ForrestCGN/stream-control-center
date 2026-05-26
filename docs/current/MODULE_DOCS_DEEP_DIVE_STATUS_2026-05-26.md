# MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26

## Aktualisiert in STEP489

- `docs/modules/channelpoints-deep-dive.md`
- `docs/modules/README.md`

## Aktualisiert in STEP488

- `docs/modules/core-communication-bus.md`
- `docs/modules/README.md`

## Aktueller Stand

- STEP483 Dashboard Tabs dokumentiert.
- STEP484 Incoming-Shoutout-EventSub-Integration dokumentiert.
- STEP485 Produktionscheck dokumentiert.
- STEP486 Live-Test-/Decision-Prep dokumentiert.
- STEP488 Communication-Bus-Modul-Contract direkt in `helper_communication.js` dokumentiert.
- STEP489 Kanalpunkte-Backend-Skelett dokumentiert.

## Wichtiger Korrekturhinweis

Ein separater `helper_communication_contract.js` soll nicht als dauerhafte Architektur genutzt werden. Der Contract sitzt ab STEP488 im bestehenden Bus-Core.

## Kanalpunkte-Doku-Stand

`docs/modules/channelpoints-deep-dive.md` beschreibt aktuell nur das Skelett:

```text
backend/modules/channelpoints.js
moduleVersion 0.1.0
/api/channelpoints/status
/api/channelpoints/bus-test
Bus-Registrierung/Heartbeat/Status
keine Twitch-Schreibaktionen
keine DB-Migration
kein Dashboard-Modul
```

## Naechster Doku-Fokus

Nach STEP490 muessen Twitch-Readiness, benoetigte Scopes, vorhandene Twitch-Helper und geplante Reward-Sync-Routen in `docs/modules/channelpoints-deep-dive.md` nachgezogen werden.
