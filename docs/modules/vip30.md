# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.10`  
Build: `step8.17-sound-pool`

## Status

VIP30 ist live getestet und wurde um einen Sound-Pool erweitert.

## Erfolgreich getestete Kern-Flows

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
Sounds
Texte
Aktionen
Diagnose
```

## Config

Technische Einstellungen.

Der frühere einzelne Sound-Auswahlbereich wurde aus Config herausgenommen.

## Sounds

Mehrere VIP30-Sounds werden über den Tab `Sounds` verwaltet.

Setting:

```txt
alerts.soundPool
```

Felder:

```txt
id
enabled
weight
mediaId
mediaPath
label
```

Auswahl:

```txt
Ein aktiver Sound wird nach Gewichtung zufällig gewählt.
```

Fallback:

```txt
Wenn alerts.soundPool leer ist, nutzt das Backend weiterhin alerts.mediaId / alerts.mediaPath.
```

## Texte

Zufallstexte bleiben im Tab `Texte`.

Setting:

```txt
alerts.overlaySets
```

## Sound-/Overlay-Flow

```txt
VIP30 Erfolg
-> SoundPool zufällig auswählen
-> OverlaySet zufällig auswählen
-> /api/sound/bundle
-> sound_system_overlay.html zeigt VIP30-Card
-> Sound-System spielt ausgewählten Sound
```

## Keine Funktionalität entfernt

Bestehende `alerts.mediaId` bleibt als Fallback erhalten.
