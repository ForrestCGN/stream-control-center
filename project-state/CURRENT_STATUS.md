# Current Status – stream-control-center

Stand: STEP285 – Alert Native Bus Output Mode
Aktualisiert: 2026-05-24T13:12:30Z

## Aktueller Fokus

Der Alert-Bereich wurde von der reinen Mirror-/Bridge-Testphase in die native Bus-Ausgabevorbereitung überführt.

## Stabil bestätigte Kette aus STEP284

- Communication Bus Helper läuft (`communication_bus.js`, Modul-Version `0.8.1`).
- Communication Debug View läuft (`communication_debug_view.html`, Tool-Version `0.1.9`).
- Alert-System enthält Bus Mirror, Timing Diagnostics, Overlay Watchdog und Recovery Controls.
- Alert Bus Bridge ist vorhanden: `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge-Version: `0.1.1`.

## Neu in STEP285

- `alert_system.js` enthält jetzt `alertOutput` als regulären visuellen Ausgabeweg.
- Unterstützte Modi:
  - `legacy`
  - `legacy_and_bus`
  - `bus_first`
  - `bus_only`
- Standard bleibt `legacy`, damit der bestehende produktive Betrieb unverändert startet.
- `/api/alerts/status` zeigt zusätzlich `alertOutput` und `alertBusMirror`.
- Der Real Alert Mirror bleibt separat erhalten und ist nicht entfernt.

## Normalbetrieb

Aktueller Standard:

- `alertOutput.mode = legacy`
- Alter Alert-Pfad bleibt aktiv.
- Bridge kann weiter als OBS-Testquelle genutzt werden.
- Mirror bleibt im Normalbetrieb aus.

## Testpfade

- Bridge-URL: `/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
- Debug View: `/public/tools/communication_debug_view.html`
- Alert Status: `/api/alerts/status`
- Mirror aktivieren: `/api/alerts/bus-mirror/enable?confirm=1`
- Mirror deaktivieren: `/api/alerts/bus-mirror/disable?confirm=1`

## Nächster Schritt

STEP286: Live-Test der nativen Alert Output Modes, zuerst mit Standard `legacy`, danach gezielt mit `legacy_and_bus` oder `bus_first`.

Danach: Sound-System separat auditieren und stufenweise busfähig machen.
