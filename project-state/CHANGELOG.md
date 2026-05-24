# Changelog

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
