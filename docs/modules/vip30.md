# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.12`  
Build: `step8.18-alert-test-route`

## Status

VIP30 ist live getestet und hat jetzt einen manuellen Alert-Test.

## Dashboard

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

## Sounds

Mehrere Sounds werden über `alerts.soundPool` verwaltet und zufällig nach Gewichtung gewählt.

## Texte

Mehrere Textsets werden über `alerts.overlaySets` verwaltet und zufällig nach Gewichtung gewählt.

## Manueller Alert-Test

Endpunkt:

```txt
POST /api/vip30/alert/test
```

Dashboard:

```txt
Aktionen -> VIP30 Alert testen
```

Der Test löst den echten VIP30-Sound-Bundle-Flow aus:

```txt
VIP30 Testuser
-> zufälliger Sound
-> zufälliges Textset
-> /api/sound/bundle
-> sound_system_overlay.html
```

Sicherheit:

```txt
✅ kein Twitch
✅ kein VIP Grant
✅ kein Slot
✅ kein Redemption Fulfill/Cancel
```

## Wichtig

Wenn nur Ton ohne Einblendung kommt, wurde vermutlich ein reiner Media-Preview oder Sound-Test benutzt. Der neue Alert-Test nutzt den VIP30-Visual-Pfad.
