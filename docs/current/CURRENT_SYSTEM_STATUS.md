# CURRENT_SYSTEM_STATUS

## STEP278X

Alert Overlay Delivery Watchdog ergänzt.

Betroffene Runtime:

```text
alert_system.js
/api/alerts/overlay-watchdog/status
/api/alerts/overlay-watchdog/check
/api/alerts/overlay-watchdog/reset?confirm=1
```

Funktion:

- Kein neues Modul.
- Keine DB-Migration.
- Keine Sound-/TTS-/Queue-Änderung.
- Kein Umbau des echten Alert-Overlays.
- Beim `sendOverlay(... play ...)` wird ein Delivery-Datensatz erzeugt.
- Wenn kein Alert-Overlay verbunden ist, wird `no_overlay_client_at_play` sichtbar.
- Wenn nach Alert-Dauer + Grace-Zeit kein `finished`/`ack` vom Overlay kommt, wird `overlay_finish_ack_missing` sichtbar.
- Wenn das Overlay bestätigt, steht der Status auf `acknowledged`.

## Vorheriger Stand

STEP278W lieferte Timing-Diagnose für Queue, Sound-Warten, Playing, Overlay-Signal und Bus-Mirror-Signal.
