# CURRENT STATUS – stream-control-center

Stand: 2026-06-08

## Aktueller Schwerpunkt

```text
Loyalty Games / CGN Gluecksrad
```

## Neuer Stand

```text
STEP LWG-1 – Loyalty Games Backend-Grundsystem v0.1.0
```

## Umgesetzt in diesem Stand

```text
- Neues Top-Level-Modul backend/modules/loyalty_games.js
- Wheel-Submodul backend/modules/loyalty_games/wheel.js
- Shared Helper backend/modules/loyalty_games/shared.js
- Config config/loyalty_games.json
- DB-Tabelle loyalty_game_sessions
- Backendseitige gewichtete Zufallsauswahl per crypto.randomInt
- Spin-Status und Session-Speicherung
- WebSocket-Broadcast fuer Overlay-Event
- Diagnose-/Registry-Eintrag fuer loyalty_games
- Modul-Dokus fuer loyalty_games und loyalty_wheel
```

## Bewusst nicht umgesetzt

```text
- keine Punktkosten
- keine Reward-Ausfuehrung
- kein Dashboard
- keine Aenderung an backend/modules/loyalty.js
- keine Aenderung an Watch-Runner/Event-Boni
- keine Queue
- keine Auto-Recovery
```

## Vorheriger VIP30-Stand bleibt relevant

```text
VIP30_STEP8_18_3_testuser_input_fix.zip
VIP30 Overlay optisch verbessern bleibt offen.
```
