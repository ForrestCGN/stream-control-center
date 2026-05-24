# CURRENT_STATUS

## STEP278O

Communication Bus Issue-/Watchdog-Test ergänzt.

Geändert:

- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278O_ISSUE_WATCHDOG_TEST.md`

Version:

```text
communication_bus v0.5.0 / STEP278O
```

Neue Route:

```text
/api/communication/watchdog
```

Funktionen:

- manuelle Watchdog-Diagnose für den aktuellen Bus-Zustand
- erkennt keine Clients, keine verbundenen Clients, offline Clients, fehlende Zielclients, nicht ausgelieferte Events und fehlende ACKs
- Standardaufruf ist lesend und verändert keinen Bus-State
- mit `track=1` werden erkannte Diagnosepunkte über `trackIssue()` in `issues[]` gespeichert
- optional kann `clientId` geprüft werden

Wichtig:

- Kein automatischer Watchdog-Timer.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein OBS-Umbau.
- Keine Änderung am Master-Test-Overlay.
- Keine Änderung an `helper_communication.js`.

## STEP278N

Communication Bus Replay-/Resync-Test ergänzt.

Geändert:

- `backend/modules/communication_bus.js`
- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278N_REPLAY_RESYNC_TEST.md`

Versionen:

```text
communication_bus v0.4.0 / STEP278N
overlay_master_test v0.1.2 / STEP278N
```

Neue Route:

```text
/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Funktionen:

- Replay-Endpunkt ruft kontrolliert `replayForClient()` auf.
- Replay kann gezielt für einen registrierten Client ausgelöst werden.
- `includeAckRequired` kann per Query gesetzt werden.
- Master-Test-Overlay zeigt Replay-/Resync-Debug an.
- Master-Test-Overlay bestätigt replayed Events wie normale Bus-Events per ACK.

Wichtig:

- Kein automatisches Replay bei `hello`.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein OBS-Umbau.

## STEP278M

Master-Test-Overlay für Reconnect-/OBS-Reload-Tests gehärtet.

Geändert:

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278M_RECONNECT_OBS_RELOAD_TEST.md`

Overlay-Version:

```text
overlay_master_test v0.1.1 / STEP278M
```

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Funktionen:

- Reconnect-/Session-Debug anzeigen
- neue Session-ID pro WebSocket-Verbindung setzen
- `connectCount` und `disconnectCount` anzeigen
- letzte Verbindung und letzte Trennung anzeigen
- letzte `hello_ack` und `heartbeat_ack` anzeigen
- Heartbeat beim Reconnect sauber stoppen und neu starten
- alte Testkarten bei WebSocket-Close/Open ausblenden
- ACK-Details mit Session-/Reconnect-Informationen senden

Wichtig:

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.


## STEP278L

Master-Test-Overlay als Communication-Bus-Testclient erweitert.

Geändert:

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278L_MASTER_OVERLAY_BUS_TEST_MODE.md`

Overlay-Version:

```text
overlay_master_test v0.1.0 / STEP278L
```

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Funktionen:

- `type: "hello"` beim WebSocket-Connect senden
- `type: "heartbeat"` regelmäßig senden
- Bus-Testevents empfangen
- ACKs mit `type: "ack"`, `eventId`, `clientId` und `status` senden
- Test-/Mirror-Karten anzeigen
- Debug-Status für Verbindung, Client, Event und ACK anzeigen

Wichtig:

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.

## STEP278K

Communication WS Test Client ergänzt.

Neu:

- `htdocs/public/tools/communication_ws_test_client.html`
- `project-state/STEP278K_COMMUNICATION_WS_TEST_CLIENT.md`

Tool-Version:

```text
communication_ws_test_client v0.1.0 / STEP278K
```

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

Funktionen:

- WebSocket verbinden
- `hello` senden
- `heartbeat` senden
- Testevent per API erzeugen
- `ack` für letztes Event senden
- Communication Status anzeigen

Wichtig:

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.

## STEP278J

Versioned Startup Logs ergänzt.

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `docs/backend/MODULE_VERSIONING_STANDARD.md`
- `project-state/STEP278J_VERSIONED_STARTUP_LOGS.md`

Neue Log-Ausgaben:

```text
[communication_bus] v0.3.0 / STEP278H API routes and WS handler registered
[audit_log] v0.2.0 / STEP278E API routes registered
```

Wichtig:

- Keine Funktionsänderung.
- Keine neue Route.
- Keine Dashboard-/DB-/OBS-Änderung.
- Keine Produktivmigration.

## STEP278I

Module Version Metadata und verbindliche Versionierungsregel ergänzt.

Neu:

- `docs/backend/MODULE_VERSIONING_STANDARD.md`

Wichtig:

- Alle zukünftigen Module sollen `MODULE_META` besitzen.
- Status-Ausgaben sollen `moduleVersion` und `moduleBuild` enthalten.
- Startup-Logs enthalten Version und Build.
- STEP bleibt zusätzlich als Projekt-Historie erhalten.
