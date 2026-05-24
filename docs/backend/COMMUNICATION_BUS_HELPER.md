# Communication Bus / Alert Diagnose

Aktueller Stand umfasst Bus-Status, Replay, Watchdog, echten Alert-Bus-Mirror, Alert-Timing, echtes Alert-Overlay-ACK und sichere manuelle Alert-Overlay-Recovery.

Relevante Routen:

- `/api/communication/status`
- `/api/communication/watchdog`
- `/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1`
- `/api/alerts/bus-mirror/status`
- `/api/alerts/overlay-watchdog/status`
- `/api/alerts/overlay-watchdog/check`
- `/api/alerts/overlay-watchdog/recover?confirm=1`

Die Recovery-Route sendet nur ein Overlay-`clear`. Queue, Sound und TTS bleiben unverändert.
