# STEP418 – Alert Real Flow EventBus

Stand: 2026-05-25

## Ziel

Echte Alert-Lifecycle-Phasen werden zusätzlich als `alert.status` EventBus-Events gespiegelt.

## Wichtig

Der bestehende produktive Ablauf bleibt unverändert:

- Alert-Queue bleibt unverändert.
- Sound-System-/Bundle-Flow bleibt unverändert.
- TTS-Flow bleibt unverändert.
- Legacy Overlay/WebSocket Flow bleibt unverändert.
- Keine DB-Migration.

## Neue beobachtbare Phasen

- `received`
- `rejected`
- `ignored`
- `queued`
- `selected`
- `sound_bundle_prequeue_started`
- `sound_bundle_prequeue_finished`
- `sound_bundle_prequeue_failed`
- `waiting_for_sound`
- `sound_bundle_ready`
- `sound_wait_done`
- `playing`
- `visual_sent`
- `finished`
- `failed`

## Version

`alert_system` EventBus-Version: `3.1.1`

## Test

Debug-Client öffnen:

```text
http://127.0.0.1:8080/public/tools/alert_eventbus_debug.html
```

Dann einen normalen Alert-Test auslösen, z. B. vorhandene Preset-/Dashboard-/API-Route nutzen.

Der Debug-Client soll echte Alert-Phasen anzeigen. `/api/alerts/eventbus/status` soll `stats.errors: 0` zeigen.
