# CURRENT STATUS – VIP30

Stand: 2026-06-06

## Grün getestet

- STEP8.4 Stage B
- STEP8.5 Cleanup Dry-Run
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove`
- STEP8.7.1 Routing-Fix
- STEP8.8 Dashboard Read-only
- STEP8.8.1 Dashboard CGN-Design-Polish
- STEP8.9 Dashboard Settings
- STEP8.9.1 Config UX Polish
- STEP8.10.1 Admin Refresh Actions
- STEP8.10.3 Streamer/Mod Cleanup

## Aktueller Schritt

STEP8.11 Alert Bus Event wurde vorbereitet.

## Inhalt

Backend-Version:

```txt
0.8.7 / step8.11-alert-bus-event
```

Neu:

```txt
Bus-Event vip30.alert / trigger nach erfolgreichem Live-Flow
GET /api/vip30/alert/status
```

## Safety

Alert-Bus-Event wird nur nach erfolgreichem VIP30-Live-Flow erzeugt und nur wenn `live.allowAlert` offen ist. Es schreibt nicht in Twitch und verändert keine Slots.

## Nächster Schritt

```txt
STEP8.12 VIP30 Alert an bestehendes Alert-/Sound-System anbinden
```
