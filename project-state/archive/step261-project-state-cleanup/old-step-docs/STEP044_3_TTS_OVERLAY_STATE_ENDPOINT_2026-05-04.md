# STEP044.3 - TTS Overlay-State Endpoint

Stand: 2026-05-04

## Zweck

Dieser STEP stabilisiert die normale Chat-TTS-Anzeige nach dem Umbau auf Sound-System-Playback.

Problem nach STEP044/STEP044.1/STEP044.2:

- Chat-TTS-Audio laeuft korrekt ueber das Sound-System.
- Die TTS-Queue wird automatisch freigegeben.
- Das TTS-Overlay zeigt aber nicht zuverlaessig an, weil es vom WebSocket-Einzelereignis abhaengt.

Wie beim VIP-Overlay soll die Anzeige nicht mehr nur an einem einmaligen WebSocket-Event haengen.

## Geaenderte Dateien

- `backend/modules/tts_system.js`
- `htdocs/overlays/_overlay-tts.html`

## Neue Route

```text
GET /api/tts/overlay-state
```

Antwort-Beispiel bei laufendem TTS:

```json
{
  "ok": true,
  "module": "tts_system",
  "overlay": true,
  "show": true,
  "playing": true,
  "item": {
    "id": "...",
    "user": "ForrestCGN",
    "role": "broadcaster",
    "text": "...",
    "playbackMode": "sound_system",
    "visualOnly": true,
    "durationMs": 2500,
    "remainingMs": 2200
  },
  "queueSize": 0,
  "updatedAt": "..."
}
```

Antwort bei inaktivem TTS:

```json
{
  "ok": true,
  "module": "tts_system",
  "overlay": true,
  "show": false,
  "playing": false,
  "item": null,
  "queueSize": 0
}
```

## Overlay-Verhalten

Das Overlay nutzt weiterhin WebSocket fuer schnelle Updates, pollt aber zusaetzlich:

```text
/api/tts/overlay-state
```

Fallback bleibt:

```text
/api/tts/status
```

Dadurch kann das Overlay auch dann anzeigen, wenn ein WebSocket-Event in OBS verloren geht oder die Browserquelle beim Event noch nicht bereit war.

## Architektur

Bei Chat-TTS mit Sound-System:

- Sound-System spielt Audio.
- TTS-Overlay zeigt nur Name/Text.
- TTS-Overlay spielt keinen Ton.
- TTS-Overlay ruft bei `visualOnly` kein `/api/tts/done` auf.
- Backend setzt Done weiter per Dauer/Timer.

## Keine Funktionalitaet entfernt

- Bestehende TTS-Routen bleiben erhalten.
- `tts_play` bleibt erhalten.
- Overlay-Audio-Modus bleibt fuer `playbackMode=overlay` erhalten.
- Sound-System-Modus bleibt Default fuer Chat-TTS.
