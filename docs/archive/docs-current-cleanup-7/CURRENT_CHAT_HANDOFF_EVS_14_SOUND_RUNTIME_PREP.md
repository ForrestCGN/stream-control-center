# CURRENT CHAT HANDOFF – EVS-14 Sound Runtime Prep

Stand: 2026-06-13

## Ziel
EVS-14 bereitet die Sound-Spiel-Runtime im bestehenden `stream_events`-Modul vor, ohne das vorhandene Sound-System produktiv anzufassen.

## Wichtig
- Keine direkte Sound-Wiedergabe.
- Keine Sound-System-Queue wird verändert.
- Keine direkte Twitch-Chat-Ausgabe.
- Es werden nur Sound-Runden, Auswertung und vorbereitete Sound-System-/Chat-Payloads erzeugt.
- Bestehende Tabelle `stream_events_rounds` wird genutzt; keine neue DB-Tabelle.

## Neue Backend-Routen
- `GET /api/stream-events/sound-runtime/status`
- `GET /api/stream-events/sound-runtime/report`
- `POST /api/stream-events/sound-runtime/next-round`
- `POST /api/stream-events/sound-runtime/resolve`
- `POST /api/stream-events/sound-runtime/unresolved`

## Verhalten
- `next-round` wählt den nächsten noch nicht gelösten Sound-Schnipsel aus dem aktiven Sound-Event.
- Es wird eine aktive Runde in `stream_events_rounds` angelegt.
- Die Antwortzeit, Punkte, akzeptierte Antworten und Media-Referenz werden im Round-Snapshot gespeichert.
- Ein `playback`-Payload für das vorhandene `sound_system` wird vorbereitet, aber nicht ausgeführt.
- `resolve` wertet die aktive Sound-Runde, wenn die Antwort zu den akzeptierten Antworten passt.
- Bei Erfolg werden Punkte mit `sourceType=sound_solved` gebucht.
- `unresolved` markiert die aktive Sound-Runde als nicht gelöst und speichert die configured policy.

## Nicht enthalten
- Kein automatisches Abspielen über Sound-System.
- Kein Timer/Timeout.
- Keine Twitch-Chat-Live-Auswertung für Sound-Antworten.
- Kein Dashboard-Button für Sound-Runden.
- Kein Overlay.

## Nächster sinnvoller Schritt
EVS-14b: Sound-Runtime Dashboard/Test-Controls oder EVS-15: Sound-Chat-Antwortauswertung.
