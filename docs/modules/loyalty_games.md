# Modul: loyalty_games

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP213 / LWG-5.5

## Zweck

`loyalty_games` verwaltet Loyalty-Spielbereiche wie Glücksrad/Wheel und vorbereitete Games wie `gamble`.

## Aktueller Runtime-Stand

```text
backend/modules/loyalty_games.js
moduleVersion: 0.2.2
moduleBuild: STEP_LWG_5_2_STATUS_CLEANUP

backend/modules/loyalty_games/gamble.js
seit LWG-5.1 vorbereitet und angebunden
```

## Wichtig

Module bleiben geladen/online. Chat-Commands werden separat freigegeben.

## Gamble-Stand

`!gamble` ist vorbereitet, aber nicht produktiv aktiviert.

Bestätigt:

```text
POST /api/loyalty/games/gamble/play
wenn deaktiviert: HTTP 403 / gamble_disabled
```

Gamble nutzt serverseitige, nicht vorhersagbare Zufallslogik und darf nicht vom Browser/Overlay entschieden werden.

## Freigabe in STEP213

STEP213 aktiviert nur `!punkte / !points` über das Command-System. `!gamble` bleibt deaktiviert.

## Später

```text
1. !givepoints getrennt testen
2. !setpoint getrennt testen
3. !gamble isoliert mit Testuser und kleinen Einsätzen testen
4. !duell später mit Reservations
5. !raffle später StreamElements-nah
6. !roulette später als eigenes Farb-Roulette
```
