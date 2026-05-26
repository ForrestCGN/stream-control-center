# STEP278O - Communication Bus Issue-/Watchdog-Test

## Ziel

STEP278O ergänzt eine manuelle Watchdog-Diagnose für den Communication Bus.

Der Watchdog soll testweise sichtbar machen, wenn Kommunikationszustände problematisch sind, ohne Produktivsysteme zu migrieren oder automatisch zu überwachen.

## Geändert

- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Neu

- `project-state/STEP278O_ISSUE_WATCHDOG_TEST.md`

## Version

```text
communication_bus v0.5.0 / STEP278O
```

## Neue Route

```text
GET /api/communication/watchdog
```

Mit Issue-Tracking:

```text
GET /api/communication/watchdog?track=1
```

Optionaler Zielclient-Check:

```text
GET /api/communication/watchdog?clientId=overlay_master_test&track=1
```

## Diagnosepunkte

Der Watchdog erkennt testweise:

- `communication_no_clients`
- `communication_no_connected_clients`
- `communication_client_offline_*`
- `communication_replay_target_missing_*`
- `communication_event_not_delivered_*`
- `communication_ack_missing_*`
- `communication_event_expired_without_ack_*` für aktuell sichtbare Events

## Verhalten

Standardaufruf:

```text
/api/communication/watchdog
```

ist nur lesend und verändert den Bus-State nicht.

Mit:

```text
/api/communication/watchdog?track=1
```

werden erkannte Punkte über die vorhandene Helper-Funktion `trackIssue()` in `issues[]` gespeichert.

## Bewusst nicht geändert

- Kein automatischer Watchdog-Timer.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein OBS-Umbau.
- Keine Änderung am Master-Test-Overlay.
- Keine Änderung an `helper_communication.js`.

## Testablauf

1. Backend nach Deploy starten.
2. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
3. Reset ohne Clients:
   - `http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1`
4. Overlay geschlossen lassen.
5. ACK-pflichtiges Event erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Watchdog%20No%20Client&requireAck=1&replayable=1&ttlMs=60000`
6. Trocken-Diagnose:
   - `http://127.0.0.1:8080/api/communication/watchdog`
7. Erwartung:
   - `tracked: false`
   - Diagnose enthält fehlende Clients, nicht ausgeliefertes Event und fehlenden ACK.
8. Diagnose mit Tracking:
   - `http://127.0.0.1:8080/api/communication/watchdog?track=1`
9. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
10. Erwartung:
   - `stats.issues` ist größer 0.
   - `issues[]` enthält Watchdog-Einträge.

## Rollback

Rollback: `backend/modules/communication_bus.js` und die aktualisierten Doku-Dateien auf STEP278N zurücksetzen.
