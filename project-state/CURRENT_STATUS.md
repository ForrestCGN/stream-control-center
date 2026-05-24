# Current Status – stream-control-center

Stand: STEP284 – Alert Bus Bridge Handoff & Dokumentation
Aktualisiert: 2026-05-24T13:00:20Z

## Aktueller Fokus

Der Kommunikations-Audit für Alerts wurde abgeschlossen und in eine erste Bus-Bridge-Migration überführt.

## Stabil bestätigte Kette

- Communication Bus Helper läuft (`communication_bus.js`, Modul-Version `0.8.1`).
- Communication Debug View läuft (`communication_debug_view.html`, Tool-Version `0.1.9`).
- Alert-System enthält Bus Mirror, Timing Diagnostics, Overlay Watchdog und Recovery Controls.
- Neue Alert Bus Bridge ist vorhanden: `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge-Version: `0.1.1`.

## Letzter erfolgreicher Test

Die neue Bridge wurde als einziger Alert-Overlay-Client getestet:

- Client: `overlay_alerts_v2_bus_bridge`
- Status: online
- Bus Event `visual.alert.play` wurde zugestellt.
- Bus ACK wurde empfangen.
- Alert-System erhielt `finished`.
- Watchdog meldete `acknowledged`.
- Keine Issues, keine Drops, keine Queue-Reste.

## Normalbetrieb

Der Real Alert Mirror bleibt im Normalbetrieb aus.

Für Tests:

- Bridge-URL: `/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
- Mirror aktivieren: `/api/alerts/bus-mirror/enable?confirm=1`
- Mirror deaktivieren: `/api/alerts/bus-mirror/disable?confirm=1`
- Debug View: `/public/tools/communication_debug_view.html`

## Nächster Schritt

STEP285: Alert-System bekommt einen echten nativen Bus-Ausgabeweg, damit der Test-Mirror langfristig nicht mehr für produktive Bridge-Tests benötigt wird.

Danach: Sound-System separat auditieren und stufenweise busfähig machen.
