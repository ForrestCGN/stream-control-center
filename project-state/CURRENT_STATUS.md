# CURRENT STATUS – VIP30

Stand: 2026-06-06

## Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus
- STEP8.7.1 Routing-Fix für `/api/twitch/eventsub/status`
- STEP8.8 Dashboard Read-only
- STEP8.8.1 Dashboard CGN-Design-Polish

## Aktueller Schritt

STEP8.9 Dashboard Settings wurde vorbereitet.

Backend-Status:

```txt
GET /api/vip30/settings vorhanden
POST /api/vip30/settings/save vorhanden
POST /api/vip30/settings nicht vorhanden
```

STEP8.9 nutzt deshalb `/api/vip30/settings/save`.

## STEP8.9 Sicherheitsstand

Direkt editierbar:

```txt
alerts.enabled
alerts.soundKey
logging.enabled
reward.title
reward.prompt
slots.maxSlots
slots.durationDays
cleanup.releaseSlotOnExternalVipRemove
```

Gesperrt/critical im Dashboard:

```txt
live.*
twitch.*
bridge.*
channelpoints.*
cleanup.enabled
cleanup.removeVipOnExpire
enabled
```

## DB-Kompatibilität

Keine Backend-/DB-Änderung in STEP8.9.

Die vorhandene Route nutzt bestehende `vip30_settings`-Tabelle und vorhandene DB-Helfer im Backend. Keine neue SQLite-Sonderlogik.

## Nächster sinnvoller Schritt

Nach Test von STEP8.9:

```txt
STEP8.10 Dashboard manuelle Admin-Aktionen planen
```
