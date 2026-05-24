# Current System Status

## STEP278O - Communication Bus Issue-/Watchdog-Test

Der Communication Bus besitzt jetzt eine manuelle Watchdog-Diagnose für Test- und Audit-Zwecke.

Geändert:

- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`

Neu:

- `project-state/STEP278O_ISSUE_WATCHDOG_TEST.md`

Version:

```text
communication_bus v0.5.0 / STEP278O
```

Neue Route:

```text
http://127.0.0.1:8080/api/communication/watchdog
```

Mit Tracking:

```text
http://127.0.0.1:8080/api/communication/watchdog?track=1
```

Die Route erkennt testweise:

- keine registrierten Clients
- registrierte Clients ohne aktive Verbindung
- offline Clients
- fehlenden Zielclient für Replay-/Watchdog-Checks
- Events ohne Auslieferung
- ACK-pflichtige Events ohne ACK
- aktuell sichtbare abgelaufene ACK-pflichtige Events ohne ACK

Wichtig:

- Standardmäßig ist der Watchdog nur lesend.
- Issues werden nur mit `track=1` in `issues[]` geschrieben.
- Es gibt keinen automatischen Watchdog-Timer.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.

## STEP278N - Communication Bus Replay-/Resync-Test

Der Communication Bus besitzt jetzt eine kontrollierte Replay-Test-API und das Master-Test-Overlay wurde für Replay-/Resync-Tests erweitert.

Geändert:

- `backend/modules/communication_bus.js`
- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`

Neu:

- `project-state/STEP278N_REPLAY_RESYNC_TEST.md`

Versionen:

```text
communication_bus v0.4.0 / STEP278N
overlay_master_test v0.1.2 / STEP278N
```

Neue Route:

```text
http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Wichtig:

- Replay wird nicht automatisch bei `hello` ausgelöst.
- Die Route ist ein kontrollierter Test-/Diagnoseweg.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.

## STEP278M - Master Overlay Reconnect-/OBS-Reload-Test

Master-Test-Overlay für Reconnect-/OBS-Reload-Tests gehärtet.

Geändert:

- `htdocs/overlays/_overlay-master-test.html`

Version:

```text
overlay_master_test v0.1.1 / STEP278M
```

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Der Reconnect-Test prüft:

- neue Session-ID pro WebSocket-Verbindung
- `connectCount` und `disconnectCount`
- letzte Verbindung und Trennung
- letzte `hello_ack` und `heartbeat_ack`
- sauberer Heartbeat-Neustart nach Reconnect

## STEP278L - Master Overlay Bus Test Mode

Master-Test-Overlay als Communication-Bus-Testclient erweitert.

Version:

```text
overlay_master_test v0.1.0 / STEP278L
```

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Funktionen:

- `hello` beim WebSocket-Connect senden
- `heartbeat` regelmäßig senden
- Bus-Testevents empfangen
- ACKs senden
- Test-/Mirror-Karten anzeigen

## STEP278K - Communication WS Test Client

Ein manueller Browser-Testclient für den Communication Bus ist ergänzt.

Neu:

- `htdocs/public/tools/communication_ws_test_client.html`

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

Version:

```text
communication_ws_test_client v0.1.0 / STEP278K
```

## STEP278J - Versioned Startup Logs

Startup-Logs der neuen Module enthalten Version und Build.

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `docs/backend/MODULE_VERSIONING_STANDARD.md`
