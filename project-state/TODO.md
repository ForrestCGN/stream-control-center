# TODO

- Sound-Runtime im Dashboard bedienbar machen.
- Sound-System-Payload später kontrolliert an vorhandenes sound_system anschließen.
- Timer/Timeout für Sound-Runden ergänzen.
- Twitch-Chat-Antworten für aktive Sound-Runde auswerten.
- Overlay/Ranking später anbinden.


## EVS-15 Sound Runtime Test Helpers

- Backend-Helper `POST /api/stream-events/sound-runtime/create-test-event?confirm=1` ergänzt.
- Sound-Testevent mit Test-Snippets, Antwortvarianten und Prepared-only-Playback-Payload.
- Keine direkte Sound-Ausgabe, kein Queue-Touch, keine direkte Chat-Ausgabe.


## EVS-16 – Sound Runtime Dashboard Report

- Sound-Runtime-Report im Statistik-Tab sichtbar gemacht.
- Backend-Report liefert vorbereitete Sound-ChatOutputs und PlaybackPayloads.
- Keine direkte Sound-Ausgabe, keine Queue-Berührung, kein Twitch-Chat-Senden.
