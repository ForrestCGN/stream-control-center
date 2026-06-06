# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.9` / `step8.14-overlay-sets-design05`  
Dashboard-Stand: `STEP8.16 Texte Tab`

## Status

VIP30 ist fachlich und technisch grün getestet.

## Erfolgreich getestete Flows

```txt
✅ Twitch Reward Einlösung
✅ EventSub Redemption
✅ VIP30 Bridge
✅ Twitch VIP Grant
✅ Slot Write
✅ Redemption Fulfill
✅ Sound-System Bundle
✅ CGN Split Lounge Overlay
✅ manueller VIP-Remove
✅ Slot-Freigabe external_removed
```

## Dashboard-Aufbau

```txt
Übersicht
Slots
Logs
Config
Texte
Aktionen
Diagnose
```

### Config

Technische Einstellungen:

```txt
VIP30 Alert-Sound
Slots/Laufzeit
Reward-Titel/Beschreibung
Logging
Cleanup
gesperrte kritische Live-/Twitch-/Bridge-Settings
```

### Texte

Redaktionelle Zufallstexte:

```txt
alerts.overlaySets
```

Felder:

```txt
id
enabled
weight
kicker
headline
subline
message
perks
brand
```

## Auto-Reload

Der Dashboard Auto-Reload schützt aktive Eingaben in:

```txt
Config
Texte
```

## Designreferenzen

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
docs/design/VIP30_SPLIT_LOUNGE_DESIGN.md
```
