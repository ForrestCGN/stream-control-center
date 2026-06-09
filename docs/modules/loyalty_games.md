# Modul: loyalty_games

Stand: 2026-06-09  
Aktueller bestätigter Stand: LWG-4K.2

## Zweck

`loyalty_games` verwaltet das Glücksrad-System, Presets, Spins/Sessions und die Anbindung des Wheel-Overlays.

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_games/shared.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/assets/images/loyalty/wheel/*
```

## Bestätigte Funktionen

```text
- Wheel-Status und Config
- Wheel-Spin
- Presets in SQLite
- Preset-Felder
- Copy / Activate / Pause / Finish / Delete
- removeAfterWin als Preset-weite Einstellung
- Spin-Historie
- Overlay-Spin per WebSocket/Event
- Overlay-Heartbeat
- interner startWheelSpin für Giveaway-Claims
```

## Interne Nutzung durch Giveaways

`loyalty_giveaways` nutzt intern:

```text
loyalty_games._private.startWheelSpin(input)
```

Damit wird bei einem Wheel-Giveaway-Claim kein eigenes Rad gebaut, sondern der echte bestehende Wheel-Spin verwendet.

## Fairness

```text
- Das Rad-Ergebnis wird backendseitig bestimmt.
- Das Giveaway setzt kein Rad-Ergebnis manuell.
- UI/Command/API dürfen kein Ergebnis vorgeben.
```

## Nicht geändert

```text
- Keine Twitch-Command-Ausführung.
- Keine Streamer.bot-Anbindung.
- Keine Punktebuchung.
```
