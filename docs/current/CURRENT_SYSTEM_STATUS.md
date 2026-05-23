# Current System Status - STEP277A

STEP277A ergänzt den Video-/Clip-Shoutout über das zentrale Sound-System.

## Clip-Shoutout

Aktueller relevanter Stand:

- Neues Modul: `backend/modules/clip_shoutout.js`
- Routen:
  - `/api/clip-shoutout/status`
  - `/api/clip-shoutout/run`
  - `/api/clip/shoutout`
- Standard-Command:
  - `!vso @kanal`
  - Aliase: `clipso`, `videoso`

## Playback

Clip-Shoutouts laufen über das Sound-System:

1. Zieluser wird über Twitch aufgelöst.
2. Clips werden per Twitch Helix gelesen.
3. Ein Clip wird ausgewählt.
4. Die Clip-Playback-URL wird ermittelt.
5. Die MP4 wird lokal unter `htdocs/assets/sounds/clip_shoutout` gecacht.
6. Ein locked Bundle wird an `/api/sound/bundle` übergeben.
7. Das Sound-System-Overlay spielt den Clip mit Bild und Ton ab.

## Optionales TTS nach dem Clip

Wenn `clipShoutout.ttsAfterClipEnabled` oder ein Request-Parameter `tts=1` gesetzt ist:

1. TTS wird per `/api/tts/synthesize` vorbereitet.
2. Die erzeugte Datei wird als zweites Item in dasselbe Sound-System-Bundle gelegt.
3. Der Bundle-Lock verhindert, dass andere Sounds zwischen Clip und TTS laufen.

## Design

`htdocs/overlays/sound_system_overlay.html` rendert Clip-Shoutouts im bisherigen Clip-Shoutout/VIP30-Design:

- Avatar links
- Neon-Divider
- Video rechts
- Name unten
- Subline `🧓 Altersheim-TV`

Normale Sound-System-Audio- und Video-Items bleiben weiterhin unterstützt.

## Nicht geändert

- Bestehende Clip-Erstellung über `/api/clip/create`
- Bestehendes TTS-System
- Bestehendes Sound-System-Queue-Verhalten
- Bestehende Alert-/VIP-/Mod-Sound-Logik
- Streamer.bot wird für dieses Feature nicht verwendet
