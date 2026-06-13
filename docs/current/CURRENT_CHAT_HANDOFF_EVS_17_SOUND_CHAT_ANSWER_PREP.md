# CURRENT CHAT HANDOFF – EVS-17 Sound Chat Answer Prep

Stand: 2026-06-13

## Ziel

Sound-Spiel-Runtime um vorbereitete Chat-Antwort-Auswertung erweitern.

## Geänderte Dateien

- `backend/modules/stream_events.js`
- `docs/modules/stream_events.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_17_SOUND_CHAT_ANSWER_PREP.md`
- Projektstatus-Dateien unter `project-state/`

## Version

- `MODULE_VERSION = 0.5.3`
- `MODULE_BUILD = STEP_EVS_17_SOUND_CHAT_ANSWER_PREP`

## Neue Route

```text
POST /api/stream-events/sound-runtime/test-chat
```

## Verhalten

- Bei aktivem Sound-Event und aktiver Sound-Runde wird Chattext gegen die akzeptierten Antworten geprüft.
- Korrekte Antwort nutzt die bestehende `resolveSoundRound`-Logik.
- Punkte werden gebucht.
- `sound.solved` ChatOutput wird vorbereitet.
- Falsche Antwort wird als Miss gezählt und per Bus vorbereitet, aber erzeugt keine direkte Chat-Ausgabe.
- Twitch-Chat-Ausgabe bleibt deaktiviert (`directSend=false`).
- Playback bleibt prepared-only (`directPlay=false`).
- Sound-System-Queue wird nicht berührt.

## Testbefehle

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-17 Sound Chat Answer Prep"
```

Mit aktivem Sound-Testevent und aktiver Runde:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"soundtester","message":"heimleitung"}' http://127.0.0.1:8080/api/stream-events/sound-runtime/test-chat
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
```
