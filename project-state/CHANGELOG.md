# CHANGELOG

## CAN-23.8

- `GET /api/sound/eventbus/command/queue-status` als read-only Route in `sound_system.js` ergaenzt.
- Bus-Integration-Matrix liest Sound-Queue-Status mit aus.
- Dashboard-Bus-Matrix zeigt busy/idle, queuedCount, maxLength und Queue-Route beim Sound-System.
- Kein Sound-Play.
- Keine Queue-Mutation.
- Kein Queue-Clear.
- Kein Dry-Run.
- Kein Play-Test.
- Kein EventBus-Emit.
- Keine Recovery.
