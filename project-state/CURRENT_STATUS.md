# CURRENT STATUS – EVS-14 Sound Runtime Prep

EVS-14 bereitet Sound-Runden im Event-System vor. Sound-Schnipsel können als Runde angelegt, gelöst oder als ungelöst markiert werden. Es wird noch nichts direkt abgespielt.


## EVS-15 Sound Runtime Test Helpers

- Backend-Helper `POST /api/stream-events/sound-runtime/create-test-event?confirm=1` ergänzt.
- Sound-Testevent mit Test-Snippets, Antwortvarianten und Prepared-only-Playback-Payload.
- Keine direkte Sound-Ausgabe, kein Queue-Touch, keine direkte Chat-Ausgabe.
