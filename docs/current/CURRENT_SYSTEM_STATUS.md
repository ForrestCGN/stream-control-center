# Current System Status

## STEP278B - Communication Helper Core

Der zentrale Communication-Bus-Core ist vorbereitet.

Neu:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278B_COMMUNICATION_HELPER_CORE.md`

Der Helper bietet:

- Client Registry
- Heartbeat Tracking
- gezieltes Event-Routing
- Ack Tracking
- Replayable Event Memory
- Issue Throttling
- Vorbereitung für Standalone-/Hosted-Overlays

Wichtig:

- Noch keine produktive Migration.
- `broadcastWS` bleibt unverändert.
- Alert-, Sound-, TTS-, VIP-/Mod- und Dashboard-Systeme bleiben unverändert.
- Das bestehende System bleibt produktiv.

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
