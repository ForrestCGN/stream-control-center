# Modul: loyalty_games

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP215 / LWG-5.7

## Zweck

`loyalty_games` ist das vorbereitete Runtime-Modul für spätere Kekskrümel-Spiele wie Gamble, Duell, Raffle/Roulette.

## Aktueller Status

Das Modul bleibt online/geladen, aber spielbezogene Commands bleiben deaktiviert.

## Weiterhin nicht freigegeben

```text
!gamble
!duell
!roulette
!raffle
```

## Gamble-Vorbereitung

`!gamble` ist vorbereitet, aber nicht live freigegeben.

Wichtige Designregel für später:

```text
- serverseitige Zufallslogik
- crypto.randomInt
- keine vorhersagbaren Seeds
- Einsatz maximal verfügbare Punkte
- klare Cooldowns/Settings
- Antwort über zentrale commands.js/twitch_presence-Brücke
```

## Nächster möglicher Schritt

Nach STEP215 kann kontrolliert mit Admin-Points oder Gamble-API-/Live-Test weitergemacht werden. Keine Aktivierung ohne eigenen STEP und Testplan.
