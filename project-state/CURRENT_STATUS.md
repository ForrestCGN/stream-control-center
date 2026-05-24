# Current Status – stream-control-center

Stand: STEP289 – Sound-System Bus Event Mirror / Native Status Output
Aktualisiert: 2026-05-24T13:45:00Z

## Aktueller Fokus

Der Alert-Bereich ist nach STEP287 busfähig vorbereitet. `legacy`, `legacy_and_bus` und `bus_first` wurden live bestätigt. Der sichere Standard bleibt `legacy`.

Der neue Fokus ist das Sound-System als zentrale Audio-/Medien-Schicht. STEP289 baut den ersten additiven Sound-Bus-Ausgang in `sound_system.js` ein.

## Stabil bestätigte Alert-Kette

- Communication Bus Helper läuft (`communication_bus.js`, Modul-Version `0.8.1`).
- Communication Debug View läuft (`communication_debug_view.html`, Tool-Version `0.1.9`).
- Alert-System enthält Bus Mirror, Timing Diagnostics, Overlay Watchdog und Recovery Controls.
- Alert Bus Bridge ist vorhanden: `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge-Version: `0.1.1`.
- `alertOutput` ist im Alert-System vorhanden und statusfähig.
- `bus_first` wurde live getestet und vom Watchdog bestätigt.

## Normalbetrieb Alerts

Aktueller sicherer Standard bleibt:

- `alertOutput.mode = legacy`
- Alter Alert-Pfad bleibt aktiv.
- Bridge kann weiter als OBS-Testquelle genutzt werden.
- Mirror bleibt im Normalbetrieb aus.
- `bus_first` ist bestanden, aber noch nicht Standard.
- `bus_only` bleibt vorbereitet, aber nicht freigegeben.

## STEP289 Sound-System-Bus

`backend/modules/sound_system.js` besitzt jetzt einen additiven Sound-Bus-Ausgang.

Wichtig:

- Sound-System bleibt Master für Queue, Prioritäten, Bundles und Ausgabe.
- Communication Bus ist nur zusätzlicher Event-/Status-Ausgang.
- Caller-Module werden in STEP289 nicht umgestellt.
- Bestehende REST-APIs und alter WebSocket bleiben erhalten.
- Default bleibt sicher: `soundBus.enabled = false`.

## Neue Status-/Config-Struktur

`/api/sound/status` enthält jetzt:

- `step = 289`
- `soundBus.enabled`
- `soundBus.communicationBusAvailable`
- `soundBus.stats.emitted`
- `soundBus.stats.skipped`
- `soundBus.stats.errors`
- `soundBus.stats.lastReason`
- `soundBus.stats.lastAction`
- `soundBus.stats.lastEventId`

`soundBus` ist außerdem als erlaubter DB-Settings-Block registriert.

## Nächster Schritt

STEP289 testen:

1. Backend starten.
2. `/api/sound/status` prüfen.
3. `soundBus.enabled` über `/api/sound/settings` aktivieren.
4. Test-Ping auslösen.
5. Bus-Event-Zähler prüfen.
6. Alert-Bundle-Test ausführen.
7. V5-Real-Mod-Test wiederholen.

Danach: Debug View/Dashboard für Sound-Bus-Events vorbereiten.
