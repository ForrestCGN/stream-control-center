# EVENTBUS CAN-23.12 - VIP Overlay Bus Status read-only

## Zweck

CAN-23.12 macht VIP-Sound-Overlay Show/Update/Hide/ACK read-only sichtbar.

## Geaendert

```text
backend/modules/vip_sound_overlay.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/vip-sound/eventbus/overlay/status
```

## Die Route zeigt

```text
show
update
audio_started
audio_ended
finished
hide
failed
timeout
overlay visible/phase/requestId
client connected/lastSeen
queue length
ACK-Routen
```

## Sicherheitsgrenze

```text
read-only
kein VIP-Overlay-Reset
keine Queue-Mutation
kein Sound
kein Overlay-Send
kein EventBus-Emit
keine Recovery/Selbstheilung
```

## Tests

```bat
node -c backend\modules\vip_sound_overlay.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
