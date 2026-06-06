# CURRENT STATUS – VIP30

Stand: 2026-06-06 09:20 UTC

## Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus
- STEP8.7.1 Routing-Fix für `/api/twitch/eventsub/status`
- STEP8.8 VIP30 Dashboard Read-only funktional im Dashboard geprüft

## Aktueller Dashboard-Stand

STEP8.8:

```txt
VIP30 Dashboard Read-only funktioniert.
```

Forrest-Rückmeldung:

```txt
Sieht alles gut im Dashboard aus.. Leider kein CGN-Design, aber sonst ok :)
```

STEP8.8.1:

```txt
CGN-/Neon-Design-Polish für htdocs/dashboard/modules/vip30.css vorbereitet.
```

## Aktuelle Safety

Weiterhin nicht aktiv:

```txt
- VIP30-Alert
- Auto-Alert
- VIP manuell vergeben über Dashboard
- VIP manuell entziehen über Dashboard
- Cleanup Run über Dashboard
- Redemption fulfill/cancel über Dashboard
```

## Nächster sinnvoller Schritt

Wenn STEP8.8.1 Design passt:

```txt
STEP8.9 – Dashboard Config Read/Write planen
```
