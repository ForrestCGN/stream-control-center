# STEP044.5 - TTS Overlay Clean Layout

Stand: 2026-05-04

## Zweck

Aufraeumen des neuen TTS-Overlays nach erfolgreichem Umbau auf Sound-System Visual State.

Keine Backend-Aenderung in diesem STEP.

## Geaenderte Datei

- `htdocs/overlays/_overlay-tts.html`

## Aenderungen

- Sichtbarer Kopftext `Text to Speech` entfernt.
- Rollen-Badge wie `BROADCASTER` entfernt.
- Voice-/Engine-Footer im normalen Overlay ausgeblendet.
- Footer bleibt nur im Debug-Modus sichtbar (`?debug=1`).
- Standardposition wieder naeher am alten Overlay:
  - `position=bottom`
  - `width=900`
  - `bottom=74`
  - `scale=1`
- Design/Neon-Stil bleibt erhalten.
- Sound-System-Visual-State-Logik bleibt unveraendert.
- Overlay spielt weiterhin keinen Ton selbst.

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&bottom=74&scale=1&poll=1
```

Debug:

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&bottom=74&scale=1&poll=1&debug=1
```

## Erwartung

- TTS-Audio kommt ueber Sound-System.
- Overlay zeigt nur User und Text.
- Kein `TEXT TO SPEECH`.
- Kein Rollen-Badge.
- Keine Voice-/Engine-Info im normalen Stream.
- Queue bleibt sauber.
