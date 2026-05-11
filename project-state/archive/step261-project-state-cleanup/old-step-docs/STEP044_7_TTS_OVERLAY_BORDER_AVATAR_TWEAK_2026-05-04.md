# STEP044.7 - TTS Overlay Border / Avatar Tweak

Stand: 2026-05-04

## Zweck

Kleiner visueller Feinschliff fuer das TTS-Overlay nach erfolgreichem Sound-System-Umbau.

Keine Backend-Aenderung. Keine Aenderung am Sound-System. Keine Aenderung an der TTS-Queue.

## Geaenderte Datei

- `htdocs/overlays/_overlay-tts.html`

## Aenderungen

- Innere Card-Umrandung entfernt.
- Aeusserer Neon-Rahmen und Glow bleiben erhalten.
- Avatar minimal vergroessert.
- Grid-Abstand leicht angepasst, damit Avatar und Text sauber sitzen.
- Long-Text-Clamp bleibt erhalten, damit lange Texte das Layout nicht sprengen.

## Spaeter dashboardfaehig machen

Folgende Overlay-Werte sollen spaeter in DB-Settings und Dashboard editierbar werden:

- `ttsOverlay.position`
- `ttsOverlay.width`
- `ttsOverlay.bottom`
- `ttsOverlay.scale`
- `ttsOverlay.avatarSize`
- `ttsOverlay.showAvatar`
- `ttsOverlay.showInnerBorder`
- `ttsOverlay.maxTextLines`
- `ttsOverlay.fontSizeName`
- `ttsOverlay.fontSizeText`
- `ttsOverlay.debug`

Ziel: DB-first ueber `helper_settings.js`, z. B. `tts_settings` Key `ttsOverlay`.

## Test

OBS-URL empfohlen:

```text
http://127.0.0.1:8080/overlays/_overlay-tts.html?position=bottom&width=900&bottom=110&scale=1&poll=1
```

Test mit kurzem und langem Text.

Erwartung:

- Ton ueber Sound-System.
- Overlay zeigt Avatar/Displayname/Text.
- Keine innere Umrandung.
- Avatar etwas groesser.
- Lange Texte bleiben in der Card und sprengen das Layout nicht.
