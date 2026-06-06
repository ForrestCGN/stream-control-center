# CURRENT STATUS – VIP30

Stand: 2026-06-06

## Grün getestet

- STEP8.4 Stage B
- STEP8.5 Cleanup Dry-Run
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove`
- STEP8.7.1 Routing-Fix
- STEP8.8 Dashboard Read-only
- STEP8.8.1 Dashboard CGN-Design-Polish
- STEP8.9 Dashboard Settings
- STEP8.9.1 Config UX Polish

## Aktueller Schritt

STEP8.10.1 Admin Refresh Actions wurde vorbereitet.

## Inhalt STEP8.10.1

Neuer Dashboard-Tab:

```txt
Aktionen
```

Nur sichere GET-/Refresh-Aktionen:

```txt
Status, Slots, Logs, Settings, Cleanup Check, External Remove Status, EventSub Status
```

## Safety

Keine Backend-Änderung, keine Twitch-Schreibaktion, kein Cleanup-Run, keine Redemption-Aktion.

## Nächster Schritt

Nach Test von STEP8.10.1:

```txt
STEP8.10.2 Confirm-/Audit-Konzept für gefährliche Admin-Aktionen planen
```
