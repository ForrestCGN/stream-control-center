# Module-Dokumentation

Stand: 2026-06-11

## Aktueller bestätigter Bereich

```text
STEP213 / LWG-5.5 – Points Command Freigabepaket
```

Aktuell im Fokus:

```text
loyalty
loyalty_games
loyalty_games/gamble.js
commands
communication_bus
helper_texts / DB-Textvarianten
```

## Grundregeln

```text
Keine Funktionalität entfernen.
Module bleiben aktiv/online; Chat-Commands werden separat freigegeben.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
SQLite aktiv, MySQL/MariaDB portabel mitdenken.
Multitexte über Datenbank/Helper im CGN-/Altersheim-/Heimleitung-/Rentner-Stil.
EventBus/Communication Bus und Heartbeats berücksichtigen.
Bei Tests nur notwendige Felder ausgeben.
Vor Tests StepDone ausführen.
```

## Aktuelle Freigabe

Nur `!punkte / !points` wird für die produktive Nutzung vorbereitet.

Nicht freigegeben:

```text
!givepoints
!setpoint
!gamble
!duell
!raffle
!roulette
```
