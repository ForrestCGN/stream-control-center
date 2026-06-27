# CURRENT CHAT HANDOFF – EVS-10b Text Runtime Test Helpers

## Stand

EVS-10b baut auf EVS-10 auf und fügt sichere Testhelfer für die Text-Spiel-Runtime hinzu.

## Geändert

- `backend/modules/stream_events.js`
  - Version `0.4.1`
  - Build `STEP_EVS_10B_TEXT_RUNTIME_TEST_HELPERS`
  - neuer Report-Endpunkt: `GET /api/stream-events/text-runtime/report`
  - neuer Testevent-Endpunkt: `POST /api/stream-events/text-runtime/create-test-event?confirm=1`
  - Testevent kann optional direkt mit `start=true` gestartet werden.

## Nicht geändert

- Keine direkte Twitch-Chat-Ausgabe.
- Kein Sound-Playback.
- Kein Overlay.
- Keine Sound-Rotation.
- Keine neue Bus-Struktur.
- Keine parallele Textstruktur.

## Testbefehle

```powershell
node -c .ackend\modules\stream_events.js
.\stepdone.cmd "EVS-10b Text Runtime Test Helpers"
```

Danach optional im laufenden Backend:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/text-runtime/status
```

Ein Testevent anlegen und direkt starten:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"start":true}' http://127.0.0.1:8080/api/stream-events/text-runtime/create-test-event?confirm=1
```

Chat simulieren:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"testuser","message":"Party"}' http://127.0.0.1:8080/api/stream-events/text-runtime/test-chat
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"testuser","message":"Forrest Engel Party"}' http://127.0.0.1:8080/api/stream-events/text-runtime/test-chat
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"andereruser","message":"Forrest und Engel machen Party mit der Community"}' http://127.0.0.1:8080/api/stream-events/text-runtime/test-chat
```

Report:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/text-runtime/report
```

## Nächste Schritte

- Testergebnisse mit aktivem Testevent prüfen.
- Danach Chat-Ausgabe/Message-Routing über bestehende Textvarianten und Bus planen.
- Danach Dashboard-Statistik für Worttreffer/Satzlösungen vorbereiten.
