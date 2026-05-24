# CURRENT_STATUS – STEP277A_FIX7

Aktueller Stand: Clip-Shoutout wurde auf Direct Playback ohne dauerhaften MP4-Cache umgestellt.

## Stabil aus vorherigen Fixes
- Command `!vso`, Alias `!clipso` und `!videoso` sind registriert.
- Ziel-Parsing aus Chat/API funktioniert korrekt.
- Clip-Suche nutzt gestaffelte Ranges und zufällige Auswahl.
- Sound-System-Bundle/Queue läuft stabil.
- Overlay-Video-Retry funktioniert.
- Avatar-Fallback und Avatar-Sanitize funktionieren.

## Neu in STEP277A_FIX7
- Twitch-Playback-URL wird direkt als `mediaUrl`/`videoUrl` an das Sound-System übergeben.
- Keine dauerhafte Speicherung neuer Clip-MP4s im Assets-Ordner im Standardmodus.
- Download-Fallback bleibt per Config möglich.

## Nächster Test
- Backend neu starten.
- `/api/clip-shoutout/status` prüfen.
- Clip-Shoutout per API und anschließend per Chat testen.
