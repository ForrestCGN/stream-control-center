# STEP278L - Master Overlay Bus Test Mode

## Ziel

Das vorhandene Master-Test-Overlay wurde zu einem echten Communication-Bus-Testclient erweitert.

## Geändert

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Neu

- `project-state/STEP278L_MASTER_OVERLAY_BUS_TEST_MODE.md`

## Overlay-Version

```text
overlay_master_test v0.1.0 / STEP278L
```

## URL

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

## Funktionen

Das Overlay kann jetzt:

- beim WebSocket-Connect `type: "hello"` senden
- regelmäßige `type: "heartbeat"` senden
- Bus-Testevents empfangen
- ACKs über `type: "ack"`, `eventId`, `clientId` und `status` senden
- Testevents und Mirror-Events visuell anzeigen
- Debug-Status für Verbindung, Client, Event und ACK anzeigen

## Testablauf

1. Backend nach Deploy starten.
2. Overlay öffnen:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

3. Optional Bus zurücksetzen:

```text
http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1
```

4. Overlay neu laden.
5. Status prüfen:

```text
http://127.0.0.1:8080/api/communication/status
```

Erwartung:

- Client `overlay_master_test` ist registriert.
- Client-Type ist `overlay`.
- Status ist `online`.
- Capabilities sind gesetzt.

6. Testevent auslösen:

```text
http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Hallo%20Master%20Overlay&requireAck=1&replayable=1
```

Erwartung:

- Overlay zeigt das Testevent im Mirror-Modus an.
- `/api/communication/status` zeigt ACKs vom Client `overlay_master_test`.

## Bewusst nicht geändert

- Kein Umbau von `backend/server.js`.
- Kein Ersatz von `broadcastWS`.
- Keine produktive Alert-Migration.
- Keine Sound-/TTS-/VIP-/Mod-Migration.
- Keine Datenbankänderung.
- Keine Dashboard-Seite.
- Keine OBS-Änderung.

## Rollback

Nur die geänderten Dateien aus diesem STEP zurücksetzen. Es wurden keine Datenbank-, Backend-Routen- oder Produktivsysteme migriert.
