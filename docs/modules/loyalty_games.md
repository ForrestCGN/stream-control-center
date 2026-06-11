# Modul: loyalty_games

Stand: 2026-06-11  
Aktueller Stand: LWG-5.6 Kontext

## Aktueller Status

```text
loyalty_games v0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
```

## Gamble

`!gamble` ist vorbereitet, aber weiterhin nicht freigegeben.

Wichtig:

```text
- Gamble nutzt später serverseitige nicht vorhersagbare Zufallsentscheidung.
- Kein Math.random, sondern crypto.randomInt.
- Einsatz darf nie größer als verfügbare Kekskrümel sein.
- Command bleibt deaktiviert, bis Points-Command und Chat-Ausgabe stabil bestätigt sind.
```
