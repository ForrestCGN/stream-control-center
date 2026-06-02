# CHANGELOG

## CAN-23.16

- `GET /api/overlay-monitor/client-control/identity-contract` als read-only Route in `overlay_monitor.js` ergaenzt.
- Normalisierte Overlay-ID-Empfehlung `overlay:<stable-id>` sichtbar gemacht.
- Capability-Empfehlungen und duplicate normalized IDs sichtbar gemacht.
- Bus-Integration-Matrix liest Overlay-ID-/Capability-Vertrag mit aus.
- Dashboard-Bus-Matrix zeigt ID-Format, Duplikate und Capability-Anzahl.
- Keine Client-Umbenennung.
- Keine Overlay-/OBS-Aktion.
- Kein EventBus-Emit.
- Keine Recovery.
