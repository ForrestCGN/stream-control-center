# STEP278N - Communication Bus Replay-/Resync-Test

## Ziel

Replay-/Resync-Verhalten des vorbereiteten Communication Bus kontrolliert testbar machen.

Der Schritt ergänzt eine kleine Test-/Diagnose-API für die bereits vorhandene Helper-Funktion `replayForClient()` und erweitert das Master-Test-Overlay um Replay-/Resync-Debug.

## Geändert

- `backend/modules/communication_bus.js`
- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Neu

- `project-state/STEP278N_REPLAY_RESYNC_TEST.md`

## Versionen

```text
communication_bus v0.4.0 / STEP278N
overlay_master_test v0.1.2 / STEP278N
```

## Neue Route

```text
GET /api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Die Route ruft intern auf:

```js
currentBus.replayForClient(clientId, {
  includeAckRequired
});
```

## Testablauf

1. Reset:

```text
http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1
```

2. Overlay geschlossen lassen.

3. Replayable Event erzeugen:

```text
http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Replay%20Test&requireAck=1&replayable=1&ttlMs=60000
```

Erwartung:

```text
deliveredCount: 0
```

4. Overlay öffnen:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

5. Replay auslösen:

```text
http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Erwartung:

```text
replayed: 1
```

6. Status prüfen:

```text
http://127.0.0.1:8080/api/communication/status
```

Erwartung:

- `replays` steigt
- `acks` steigt
- `lastAckAt` aktualisiert sich
- Overlay zeigt die Replay-Testkarte

## Bewusst nicht geändert

- kein automatisches Replay bei `hello`
- keine Alert-Produktion
- keine Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine DB-Änderung
- keine Dashboard-Seite
- kein OBS-Umbau
- keine Änderung an produktiven Alert-Flows

## Rollback

Bei Problemen können die geänderten Dateien aus dem vorherigen STEP278M-Stand wiederhergestellt werden. Es wurden keine Datenbanken, Secrets oder produktiven Alert-Flows verändert.
