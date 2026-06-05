# VIP30 STEP8.7 – Twitch EventSub VIP Remove über Bus

STEP8.7 ergänzt das Twitch-EventSub-System um `channel.vip.add` und `channel.vip.remove` und leitet echte Twitch-VIP-Events über den Communication Bus weiter.

Ziel für VIP30:

- `channel.vip.remove` von Twitch wird auf `twitch.eventsub / channel.vip.remove` emitted.
- VIP30 verarbeitet das Event über den vorhandenen STEP8.6-Listener.
- Ein aktiver VIP30-Slot wird auf `external_removed` gesetzt und zählt nicht mehr gegen die Slot-Grenze.

Safety:

- Kein Twitch-Write.
- Kein VIP-Grant.
- Kein Fulfill/Cancel.
- Kein Alert.
- Keine Slot-Löschung.

Patch-Datei:

- `tools/patches/vip30_step8_7_patch_twitch_eventsub_bus.js`

Nach dem Patch bitte `backend/modules/twitch.js` und `backend/modules/vip30.js` per `node -c` prüfen.
