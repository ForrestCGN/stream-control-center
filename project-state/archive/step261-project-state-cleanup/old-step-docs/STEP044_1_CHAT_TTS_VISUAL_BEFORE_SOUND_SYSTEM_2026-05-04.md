# STEP044.1 - Chat-TTS Visual vor Sound-System Playback

Stand: 2026-05-04

## Zweck

Fix fuer STEP044: Chat-TTS-Audio lief korrekt ueber das Sound-System, aber das TTS-Overlay zeigte nichts an.

## Ursache

Der Sound-System-Request wurde im TTS-Backend awaited. Wenn `/api/sound/play` erst nach Playback-Ende antwortet, wurde das Visual-Event fuer das TTS-Overlay zu spaet gesendet.

## Aenderung

- `backend/modules/tts_system.js`
  - sendet `tts_play` fuer das Overlay sofort nach der Audiodatei-Erzeugung
  - bei `playbackMode=sound_system` mit `visualOnly=true` und ohne `audioUrl`
  - Sound-System-Playback wird danach non-blocking gestartet
  - Done bleibt per Duration-Timer im Backend

- `htdocs/overlays/_overlay-tts.html`
  - visualOnly blendet nur ein/aus
  - visualOnly ruft nicht mehr `/api/tts/done` auf
  - Audio-Playback im Overlay bleibt fuer `playbackMode=overlay` erhalten

## Erwartung

- Chat-TTS Ton kommt ueber Sound-System
- TTS-Overlay zeigt User/Text direkt an
- Overlay spielt keinen Ton
- Queue wird automatisch nach Dauer + Buffer freigegeben

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 10
```

Dann normal im Chat:

```text
!tts Das ist ein Test
```

Erwartung:

- Ton ueber Sound-System
- Overlay sichtbar
- danach `playing=false`
