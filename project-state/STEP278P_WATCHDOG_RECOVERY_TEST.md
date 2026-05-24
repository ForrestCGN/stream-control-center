# STEP278P - Communication Bus Watchdog-Recovery-Test

## Ziel

Der manuelle Communication-Bus-Watchdog unterscheidet jetzt zwischen aktuellen Problemen und erfolgreich recovered Events.

## Geändert

- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Version

```text
communication_bus v0.6.0 / STEP278P
```

## Neue/erweiterte Optionen

```text
/api/communication/watchdog?includeRecovered=1
/api/communication/watchdog?includeRecovered=1&trackRecovered=1
```

## Verhalten

- `ack_missing` wird nur noch gemeldet, wenn `ackCount <= 0` ist.
- `event_not_delivered` wird nur noch als aktuelles Problem gemeldet, wenn das Event weder direkt ausgeliefert wurde noch später ACKs erhalten hat.
- Events, die zuerst nicht ausgeliefert wurden, aber später per Replay/ACK bestätigt wurden, können mit `includeRecovered=1` separat unter `diagnosis.recovered[]` angezeigt werden.
- Recovery-Hinweise werden nur mit `trackRecovered=1` historisch in `issues[]` gespeichert.
- Bestehende historische Issues werden nicht automatisch gelöscht.

## Test

1. Reset ohne Clients.
2. ACK-pflichtiges replayable Event erzeugen, während das Overlay geschlossen ist.
3. Watchdog mit `track=1` ausführen und Problemzustand bestätigen.
4. Overlay öffnen.
5. Replay für `overlay_master_test` auslösen.
6. Status/Watchdog nach ACK prüfen.
7. Mit `includeRecovered=1` Recovery sichtbar machen.
8. Optional mit `trackRecovered=1` Recovery historisch speichern.

## Bewusst nicht umgesetzt

- Kein automatischer Watchdog-Timer.
- Keine automatische Löschung historischer Issues.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein OBS-Umbau.
- Keine Änderung am Master-Test-Overlay.
- Keine Änderung an `helper_communication.js`.
