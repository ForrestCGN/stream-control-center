# STEP278K — Communication WS Test Client

## Status

Implemented as manual browser test client.

## Neue Datei

- `htdocs/public/tools/communication_ws_test_client.html`

## Aktualisierte Dateien

- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## URL

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

## Tool-Version

```text
communication_ws_test_client v0.1.0 / STEP278K
```

## Funktionen

- Connect / Disconnect
- Send hello
- Send heartbeat
- Test Event per API erzeugen
- Ack für letztes Testevent senden
- Communication Status anzeigen
- Client-Status anzeigen

## Wichtig

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.
- Kein Ersatz von `broadcastWS`.
