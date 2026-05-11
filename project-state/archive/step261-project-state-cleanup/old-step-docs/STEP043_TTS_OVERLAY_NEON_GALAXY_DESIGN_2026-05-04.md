# STEP043 - TTS Overlay Neon Galaxy Design

Stand: 2026-05-04

## Zweck

Normales Chat-TTS Overlay visuell an das aktuelle ForrestCGN / Neon-Galaxy / Alert-Design angleichen.

## Geänderte Datei

- `htdocs/overlays/_overlay-tts.html`

## Nicht geändert

- Keine Backend-Änderung
- Keine Änderung an TTS-Queue
- Keine Änderung an WebSocket-Events
- Keine Änderung an `/api/tts/done`
- Keine Änderung am Alert-TTS / Sound-System Ablauf

## Erhaltene Funktionalität

Das Overlay reagiert weiter auf:

- `tts_play`
- `tts_stop`

Das Overlay nutzt weiter:

- `msg.item.id`
- `msg.item.user`
- `msg.item.role`
- `msg.item.text`
- `msg.audioUrl`
- `msg.gapAfterMs`
- `GET /api/tts/done?id=...`

## Neues Design

- Neon-Galaxy Card mit CGN-Rahmenverlauf
- Cyan/Lila Glow
- Runner-Effekt
- dezente Seitenlinien mit Diamanten
- Mikrofon-Orb
- Username prominent
- Role-Badge
- Text groß und lesbar
- responsive Verhalten für kleinere Browsergrößen

## URL-Parameter

Optional verwendbar:

- `?position=bottom` Standard
- `?position=top`
- `?position=center`
- `?width=860`
- `?scale=1`
- `?bottom=118`
- `?top=160`
- `?x=50`

Beispiel:

```text
/overlays/_overlay-tts.html?position=bottom&width=900&bottom=120&scale=1
```

## Test

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 10
```

Dann normales Chat-TTS per Streamer.bot oder vorhandener TTS-Route testen.

## Erwartung

- TTS wird abgespielt
- neues Overlay erscheint
- Text/User/Role werden angezeigt
- nach Audio-Ende ruft das Overlay `/api/tts/done` auf
- Queue läuft weiter
