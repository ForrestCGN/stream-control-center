# STEP044.4 - TTS Overlay via Sound-System Visual State

Stand: 2026-05-04

## Zweck

Normales Chat-TTS laeuft bereits ueber das Sound-System, aber die TTS-Overlay-Anzeige war nicht sichtbar. Dieser STEP gleicht das TTS-Overlay an das stabile VIP-Overlay-Muster an.

## Problem

Der vorherige Ansatz nutzte fuer die Anzeige primaer TTS-eigene WebSocket-/Overlay-State-Events.

Beim VIP-Overlay ist das stabilere Muster:

- Sound-System ist Single Source of Truth fuer aktuell laufenden Sound.
- Overlay pollt `/api/sound/status`.
- Overlay zeigt nur Items, deren `visual.module` zum Overlay passt.

## Aenderungen

### `backend/modules/tts_system.js`

Bei Chat-TTS ueber Sound-System wird an `/api/sound/play` jetzt ein `visual`-Objekt mitgegeben:

```json
{
  "module": "tts_overlay",
  "type": "chat_tts",
  "requestId": "...",
  "displayName": "...",
  "login": "...",
  "role": "...",
  "text": "...",
  "title": "Text to Speech",
  "voice": "...",
  "voiceLabel": "...",
  "engine": "...",
  "durationMs": 1234,
  "source": "tts_system"
}
```

### `htdocs/overlays/_overlay-tts.html`

Das Overlay wurde auf Sound-System-Visual-State umgebaut:

- pollt `/api/sound/status`
- sucht `state.current` / `state.parallel` / optional `state.queue`
- zeigt nur Items mit `visual.module === "tts_overlay"`
- spielt kein Audio selbst
- nutzt Sound-System-Status als fuehrende Anzeigequelle
- WebSocket-Events vom Sound-System bleiben als Schnellpfad erhalten

## Ergebnis

Zielablauf:

1. Chat-User triggert `!tts`.
2. TTS-System erzeugt Audiodatei.
3. TTS-System ruft `/api/sound/play` mit `visual.module = "tts_overlay"` auf.
4. Sound-System spielt Audio.
5. TTS-Overlay erkennt das laufende SoundItem ueber `/api/sound/status`.
6. Overlay zeigt User/Text.
7. Wenn Sound-System nicht mehr current ist, blendet das Overlay aus.

## Test

OBS-/Browser-URL:

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=center&width=1000&scale=1.15&poll=1&debug=1
```

Danach Chat-Test:

```text
!tts Dies ist ein Test fuer das TTS Overlay ueber Sound-System Visual State.
```

Erwartung:

- Ton kommt ueber Sound-System.
- TTS-Overlay zeigt User/Text.
- Overlay spielt kein eigenes Audio.
- Queue bleibt sauber.

## Hinweise

- Keine Funktionalitaet entfernt.
- Altes Audio-Playback des TTS-Overlays ist fuer den Sound-System-Modus nicht mehr fuehrend.
- Das Muster entspricht dem VIP-Overlay-Prinzip: Sound-System-Status fuehrt die Anzeige.
