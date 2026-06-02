# CHANGELOG

## CAN-23.5

- `GET /api/sound/eventbus/command/lifecycle` als read-only Route in `sound_system.js` ergaenzt.
- Canonical Lifecycle definiert: accepted, queued, started, failed, finished, timeout.
- Bus-Integration-Matrix liest den Sound-Lifecycle mit aus.
- Dashboard-Bus-Matrix zeigt Lifecycle-Status/Route beim Sound-System.
- Kein Sound-Play.
- Keine Queue-Mutation.
- Kein Dry-Run.
- Kein Play-Test.
- Kein EventBus-Emit.
- Keine Recovery.
