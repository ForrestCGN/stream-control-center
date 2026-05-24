# Current Status – stream-control-center

Stand: STEP286 – Alert Output Timing/Status Cleanup
Aktualisiert: 2026-05-24T13:25:00Z

## Aktueller Fokus

Der Alert-Bereich wurde von der reinen Mirror-/Bridge-Testphase in die native Bus-Ausgabevorbereitung überführt. STEP286 hat den ersten Live-Test ausgewertet und die Timing-/Statusausgabe der nativen Alert-Outputs bereinigt.

## Stabil bestätigte Kette

- Communication Bus Helper läuft (`communication_bus.js`, Modul-Version `0.8.1`).
- Communication Debug View läuft (`communication_debug_view.html`, Tool-Version `0.1.9`).
- Alert-System enthält Bus Mirror, Timing Diagnostics, Overlay Watchdog und Recovery Controls.
- Alert Bus Bridge ist vorhanden: `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge-Version: `0.1.1`.
- `alertOutput` ist im Alert-System vorhanden und statusfähig.

## Bestätigte Tests aus STEP286

- Standard `legacy` lief erfolgreich.
- `legacy_and_bus` lief erfolgreich.
- Status zeigte `emittedBus = 1`, `emittedLegacy > 0`, `lastMode = legacy_and_bus`.
- Watchdog meldete `status = acknowledged`.
- `issue` blieb leer.
- `timedOut = false`.
- `playingToAlertOutputBusMs` lag im Test bei wenigen Millisekunden.

## Neu in STEP286

- `backend/modules/alert_system.js` auf STEP286 aktualisiert.
- `overlaySentAt` wird beim visuellen Output nun konsistenter gesetzt.
- `alertOutput.lastTiming` wird nach dem visuellen Output erneut aktualisiert.
- Native Bus-Payloads enthalten den aktualisierten Output-Timing-Stand.
- Keine Sound-/TTS-/Queue-Logik geändert.

## Normalbetrieb

Aktueller sicherer Standard bleibt:

- `alertOutput.mode = legacy`
- Alter Alert-Pfad bleibt aktiv.
- Bridge kann weiter als OBS-Testquelle genutzt werden.
- Mirror bleibt im Normalbetrieb aus.

## Testpfade

- Bridge-URL: `/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
- Debug View: `/public/tools/communication_debug_view.html`
- Alert Status: `/api/alerts/status`
- Watchdog Status: `/api/alerts/overlay-watchdog/status`
- Mirror aktivieren: `/api/alerts/bus-mirror/enable?confirm=1`
- Mirror deaktivieren: `/api/alerts/bus-mirror/disable?confirm=1`

## Nächster Schritt

STEP287: `bus_first` gezielt testen. Danach entscheiden, ob Debug View/Dashboard die native `alertOutput`-Sektion sichtbarer machen soll.

Danach: Sound-System separat auditieren und stufenweise busfähig machen.
