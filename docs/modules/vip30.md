# VIP30 / 30 Tage VIP – STEP8.5

Stand: `0.8.5` / `step8.5-cleanup-expire-revoke-manual`

## Aktueller Funktionsstand

- Twitch-Kanalpunkte-Reward ist mit `vip30` verknüpft.
- Stage B ist vorbereitet: berechtigte User bekommen VIP, der Slot wird gespeichert und die Redemption wird fulfilled.
- Blockierte Redemptions werden canceled/refunded.
- Alert ist weiterhin gesperrt.
- Neu in STEP8.5: Cleanup/Entzug für abgelaufene aktive VIP30-Slots.

## Neue Cleanup-Routen

```txt
GET  /api/vip30/cleanup/check
POST /api/vip30/cleanup/run?confirm=YES
```

`cleanup/check` prüft nur, welche aktiven Slots abgelaufen sind.

`cleanup/run` läuft ohne `confirm=YES` als Dry-Run. Mit `confirm=YES` wird für abgelaufene aktive Slots der Twitch-VIP entfernt und der Slot auf `expired` gesetzt.

## Safety

- Es werden nur `status = active` Slots mit `end_utc <= now` verarbeitet.
- Slots werden nicht gelöscht, sondern auf `expired` oder bei Fehler auf `failed` gesetzt.
- Kein Alert.
- Kein Redemption-Fulfill/Cancel im Cleanup.
- Twitch-Remove-VIP läuft nur, wenn Cleanup, Twitch-Live-Actions und Capability grün sind.

## Externer VIP-Entzug

Für manuellen/external VIP-Entzug ist als nächster Step die EventSub-Verarbeitung `channel.vip.remove` geplant. Dann kann ein aktiver VIP30-Slot automatisch auf `revoked/external_removed` gesetzt werden, wenn Twitch meldet, dass ein VIP außerhalb des VIP30-Ablaufs entfernt wurde.
