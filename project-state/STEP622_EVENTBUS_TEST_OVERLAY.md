# STEP622 – EventBus Test-Overlay + Overlay-Bus-Standard

## Status

Vorbereitet als read-only/testorientierter Schritt ohne Änderungen an produktiven Stream-Overlays.

## Neue Dateien

```text
htdocs/overlays/_overlay-eventbus-test.html
docs/current/OVERLAY_EVENTBUS_STANDARD_STEP622.md
project-state/STEP622_EVENTBUS_TEST_OVERLAY.md
README_STEP622_EVENTBUS_TEST_OVERLAY.md
```

## Zweck

Ein technisches Referenzoverlay wurde erstellt, um das gewünschte Standardverhalten aller Overlay-Bus-Clients zu testen:

- bus_hello beim Laden
- echte bus_heartbeat alle 5 Sekunden
- Hello-ACK sichtbar
- Heartbeat-ACK sichtbar
- Eventempfang sichtbar
- automatische ACKs über shared/overlay_bus_client.js
- Page Visibility sichtbar
- WebSocket-Status sichtbar

## Nicht enthalten

- keine Änderungen an Alerts/VIP/Sound/Deathcounter
- keine OBS-Aktionen
- kein Cache-Refresh
- keine Automatik
- keine DB-Migration
- keine Reparaturbuttons

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-eventbus-test.html
```

## Erwartung

Dieses Overlay soll als Vorlage dienen. Wenn es sich in OBS sauber anmeldet, Heartbeats sendet und bei Aus-/Einblenden korrekt reagiert, wird dieses Verhalten als Standard für produktive Overlays übernommen.
