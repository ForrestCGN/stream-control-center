# Current System Status

## STEP277A_FIX10 - Clip-Shoutout Clip List Endpoint

Clip-Shoutout ist auf STEP277A_FIX10 aktualisiert.

Neu:

- `GET /api/clip-shoutout/clips?target=<login>` listet passende Clips eines Kanals zur Kontrolle.
- Die Route startet keinen Shoutout, queued keinen Sound, lädt keine MP4 und verändert die Repeat-Guard-Memory nicht.

Weiterhin aktiv:

- Direct Playback ohne dauerhaften MP4-Cache.
- Avatar-Fix.
- Video-Retry im Sound-System-Overlay.
- Repeat Guard gegen direkte Clip-Wiederholungen.
