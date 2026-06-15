# CURRENT STATUS – LC Core / Twitch Events / Alert Shadow

Stand: 2026-06-15

## Gesamtstatus

```text
Loyalty Core ist produktiv über twitch_events / Communication Bus angebunden.
Alter Loyalty-Direktforward ist standardmäßig deaktiviert.
Alert-System ist im Shadow-Modus an twitch_events angebunden.
Produktiver Alert-Bus-Weg ist vorbereitet, aber nicht aktiv.
```

## Live bestätigt

```text
LC-CORE-POINTS-3B – Support-Events parallel an twitch_events
LC-CORE-POINTS-3C – Loyalty nutzt gefilterte 7 Subscriptions
LC-CORE-POINTS-3C1 – Twitch EventSub Statusroute Hotfix
LC-CORE-POINTS-3D – Legacy Loyalty Direktforward deaktiviert
LC-CORE-POINTS-3E – deaktivierte Legacy-Funktion wird nicht mehr pro Event aufgerufen
ALERT-TWITCH-1A – Alert-System Shadow-Binding live bestätigt
ALERT-TWITCH-1B – schaltbarer Alert-Bus-Weg vorbereitet, Standard shadow
```

## Bestätigte echte Events

```text
channel.cheer / akighosty / 10 Bits
channel.follow / bossmod_cgn
```

## Aktuelle Modulversionen

```text
loyalty.js: 0.1.17
twitch.js: 0.1.10
alert_system.js: 3.1.12
```

## Aktuelle sichere Zustände

```text
loyalty.twitchEventBonusBinding.subscriptionCount = 7
legacyLoyaltyDirectForward.enabled = False
alert_system.twitchEventAlertBinding.effectiveMode = shadow
alert_system.twitchEventAlertBinding.productiveEnqueue = False
```

## Nicht abgeschlossen

```text
Alert-System ist noch nicht produktiv auf Bus umgestellt.
Alter Alert-Direktpfad ist noch nicht diagnostisch sichtbar/deaktivierbar gemacht.
Alert-Shadow muss über mehrere Streams beobachtet werden.
```
