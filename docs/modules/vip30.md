# VIP30 / 30 Tage VIP - STEP8.6

Stand: Version 0.8.6 / Build `step8.6-external-vip-remove-slot-release`.

## Aktueller Stand

- Stage B ist live-fähig: VIP-Grant, Slot-Write und Redemption Fulfill/Cancel.
- Alert bleibt weiterhin deaktiviert.
- STEP8.5: manueller Cleanup für abgelaufene aktive Slots.
- STEP8.6: externe/manuelle VIP-Entzüge können aktive VIP30-Slots freigeben.

## Neue Routen

- `GET /api/vip30/external-vip-remove/status`
- `POST /api/vip30/external-vip-remove/test`
- `POST /api/vip30/external-vip-remove/process?confirm=YES`

## Verhalten externer VIP-Entzug

Wenn ein `channel.vip.remove`-ähnliches Event verarbeitet wird und für den User ein aktiver VIP30-Slot existiert:

1. kein Twitch-Write, weil der VIP bereits extern entfernt wurde,
2. Slot-Status wird auf `external_removed` gesetzt,
3. dadurch zählt der Slot nicht mehr als aktiv und der Platz ist frei,
4. Log-Eintrag `external_vip_remove_slot_released` wird geschrieben.

Wenn kein aktiver Slot existiert, wird nur `external_vip_remove_no_active_slot` geloggt.

## Safety

- keine VIP-Vergabe
- kein Redemption Fulfill/Cancel
- kein Alert
- keine Slot-Löschung, nur Statuswechsel

## Hinweis

Die VIP30-Seite abonniert Bus-Events `twitch.eventsub/channel.vip.remove` und `twitch.vip/remove`. Falls das Twitch-Modul dieses Event noch nicht real auf den Bus legt, kann STEP8.6 bereits per Test-/Process-Route geprüft werden; die echte Twitch-EventSub-Anbindung folgt dann separat.
