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
- STEP8.10.1 Admin Refresh Actions

## Aktueller Schritt

STEP8.10.2 Light Admin Actions wurde vorbereitet.

## Inhalt

Dashboard-Tab `Aktionen` enthält nun zusätzlich:

```txt
Reward Sync/Ensure
Cleanup Dry-Run
Cleanup Run
Slot external_removed
```

## Safety

Keine Backend-Änderung. Das Dashboard nutzt bestehende VIP30-Routen und einfache Browser-Bestätigung. Spätere Rechte/Rollen sollen die Sichtbarkeit/Ausführung steuern.

## Nächster Schritt

Nach Test von STEP8.10.2:

```txt
STEP8.11 VIP30 Alert planen
```

oder vorher:

```txt
Dashboard-Rechte/Rollen-Konzept für Admin-Aktionen
```
