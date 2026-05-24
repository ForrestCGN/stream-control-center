# Current Status – stream-control-center

Stand: STEP287 – Alert Native Output bus_first Live-Test
Aktualisiert: 2026-05-24T13:30:00Z

## Aktueller Fokus

Der Alert-Bereich wurde von der reinen Mirror-/Bridge-Testphase in die native Bus-Ausgabevorbereitung überführt. Nach STEP286 Timing-/Status-Cleanup wurde in STEP287 der Modus `bus_first` live getestet und bestätigt.

## Stabil bestätigte Kette

- Communication Bus Helper läuft (`communication_bus.js`, Modul-Version `0.8.1`).
- Communication Debug View läuft (`communication_debug_view.html`, Tool-Version `0.1.9`).
- Alert-System enthält Bus Mirror, Timing Diagnostics, Overlay Watchdog und Recovery Controls.
- Alert Bus Bridge ist vorhanden: `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge-Version: `0.1.1`.
- `alertOutput` ist im Alert-System vorhanden und statusfähig.

## Bestätigte Tests bis STEP287

- Standard `legacy` lief erfolgreich.
- `legacy_and_bus` lief erfolgreich.
- `bus_first` lief erfolgreich.
- Native Bus-Ausgabe wurde erzeugt.
- Bridge rendert den Alert über den Bus.
- Watchdog meldete `status = acknowledged`.
- `issue` blieb leer.
- `timedOut = false`.
- `playingToAlertOutputBusMs` lag im `bus_first` Test bei `2ms`.

## STEP287 Live-Test `bus_first`

Bestätigte Werte:

- `mode = bus_first`
- `legacyEnabled = false`
- `legacyFallbackEnabled = true`
- `busEnabled = true`
- `lastMode = bus_first`
- `emittedBus` erhöhte sich.
- `emittedLegacy` blieb unverändert gegenüber dem vorherigen Teststand.
- `errors = 0`
- Watchdog-ACK kam mit `finished` zurück.

## Normalbetrieb

Aktueller sicherer Standard bleibt:

- `alertOutput.mode = legacy`
- Alter Alert-Pfad bleibt aktiv.
- Bridge kann weiter als OBS-Testquelle genutzt werden.
- Mirror bleibt im Normalbetrieb aus.
- `bus_first` ist bestanden, aber noch nicht Standard.
- `bus_only` bleibt vorbereitet, aber nicht freigegeben.

## Testpfade

- Bridge-URL: `/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
- Debug View: `/public/tools/communication_debug_view.html`
- Alert Status: `/api/alerts/status`
- Watchdog Status: `/api/alerts/overlay-watchdog/status`
- Mirror aktivieren: `/api/alerts/bus-mirror/enable?confirm=1`
- Mirror deaktivieren: `/api/alerts/bus-mirror/disable?confirm=1`

## Nächster Schritt

Empfohlen: Communication Debug View und/oder Dashboard um native `alertOutput`-Statusanzeige erweitern, damit Modus, letzter Output, Bus-Event-ID, Fallback und Watchdog-Ergebnis direkt sichtbar sind.

Danach: Sound-System separat auditieren und stufenweise busfähig machen.
