# Changelog

## STEP287 – Alert Native Output bus_first Live-Test

Datum: 2026-05-24T13:30:00Z

- `bus_first` live getestet und dokumentiert.
- Native Bus-Ausgabe wurde im `bus_first` Modus erfolgreich genutzt.
- Bridge rendert den Alert über den Communication Bus.
- Watchdog meldete `acknowledged`.
- `playingToAlertOutputBusMs` lag im Test bei `2ms`.
- Kein Legacy-Fallback nötig.
- Sicherer Standard bleibt `legacy`.
- `bus_only` bleibt vorbereitet, aber nicht freigegeben.
- Keine Code-Änderung gegenüber STEP286.
- Keine Sound-/TTS-/Queue-Änderung.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP286 – Alert Output Timing/Status Cleanup

Datum: 2026-05-24T13:25:00Z

- `backend/modules/alert_system.js` auf STEP286 aktualisiert.
- Live-Test von `legacy` und `legacy_and_bus` dokumentiert.
- `overlaySentAt` wird beim visuellen Alert-Output konsistenter gesetzt.
- `alertOutput.lastTiming` wird nach visueller Ausgabe erneut aktualisiert.
- Native Bus-Payloads erhalten den aktualisierten Timing-Stand.
- `legacy_and_bus` zeigte im Test `emittedBus = 1`, `lastMode = legacy_and_bus` und Watchdog `acknowledged`.
- Keine Sound-/TTS-/Queue-Änderung.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP285 – Alert Native Bus Output Mode

Datum: 2026-05-24T13:12:30Z

- `backend/modules/alert_system.js` auf STEP285 aktualisiert.
- Neue Config-Sektion `alertOutput` eingeführt.
- Native Alert-Ausgabemodi vorbereitet: `legacy`, `legacy_and_bus`, `bus_first`, `bus_only`.
- Standard bleibt `legacy`, dadurch keine automatische Verhaltensänderung im Produktivbetrieb.
- Native Bus-Ausgabe für echte Alert-Visuals ergänzt.
- Bus-Control-Ausgabe für Clear vorbereitet.
- `/api/alerts/status` um `alertOutput` und `alertBusMirror` erweitert.
- Alert-Timing um `alertOutputBusSentAt` und `playingToAlertOutputBusMs` erweitert.
- Real Alert Bus Mirror bleibt als Diagnose-/Testwerkzeug erhalten.
- Keine Sound-/TTS-/Queue-Änderung.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP284 – Alert Bus Bridge Handoff & Dokumentation

Datum: 2026-05-24T13:00:20Z

- Aktuellen stabilen Stand nach STEP283 dokumentiert.
- Erfolgreichen Bridge-Test festgehalten.
- Neue Handoff-Datei für neuen Chat erstellt.
- Current Status, Files und Next Steps aktualisiert.
- Neue Dokumentation `docs/backend/ALERT_BUS_BRIDGE_MIGRATION.md` ergänzt.
- Keine Code-Änderung gegenüber STEP283.
- Keine DB-Migration.
- Keine Funktionalität entfernt.
