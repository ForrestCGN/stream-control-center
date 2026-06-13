# NEXT STEPS

1. EVS-14 lokal entpacken und Syntaxcheck ausführen.
2. StepDone setzen.
3. Mit einem aktiven Sound-Testevent `/sound-runtime/status`, `/next-round`, `/resolve` und `/report` prüfen.
4. Danach Dashboard-Testcontrols oder Sound-Chat-Auswertung bauen.


## EVS-15 Sound Runtime Test Helpers

- Backend-Helper `POST /api/stream-events/sound-runtime/create-test-event?confirm=1` ergänzt.
- Sound-Testevent mit Test-Snippets, Antwortvarianten und Prepared-only-Playback-Payload.
- Keine direkte Sound-Ausgabe, kein Queue-Touch, keine direkte Chat-Ausgabe.
