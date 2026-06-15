# Project State – LC-CORE-POINTS-2A/2B/2C confirmed

Stand: 2026-06-15

## Bestätigter Stand

```text
stream-control-center / Loyalty Core
Branch: dev
Module relevant: loyalty, twitch_events, twitch_presence, communication_bus
Loyalty Version live bestätigt: 0.1.15
```

## Bestätigt

```text
LC-CORE-CLEANUP-1
LC-CORE-POINTS-1
LC-CORE-POINTS-2A
LC-CORE-POINTS-2B
LC-CORE-POINTS-2C
```

## Wichtigste Erkenntnisse

```text
1. Loyalty nutzt /api/twitch/events/stream-state als zentrale Live-Wahrheit.
2. Normaler Override ohne Confirm ist pending und startet AutoRunner nicht.
3. Confirmed Override publiziert twitch.stream.online und startet AutoRunner.
4. Clear-Override publiziert twitch.stream.offline und stoppt AutoRunner.
5. Twitch Presence läuft, wenn gestartet, und speichert aktive/presente User.
6. Loyalty-Presence-Runner verarbeitet Presence-User korrekt.
7. Systemuser werden ignoriert.
8. Subscriber ohne konkretes Tier erhalten Fallback-Wert 6.
```

## Offene Entscheidung

```text
Soll forrestcgn dauerhaft wieder ignoriert werden?
Im letzten Presence-Test erhielt forrestcgn Watch-Punkte.
```

## Nächster vorgeschlagener Schritt

```text
Kurzentscheidung: forrestcgn ignorieren ja/nein.
Danach LC-CORE-POINTS-3 – EventBonus-Pfad mit echten Twitch-Events prüfen.
```

## Regeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite ersetzen/löschen.
Keine Apply-/Patch-/Regex-Scripte.
Vor Änderungen echte Dateien aus GitHub/dev prüfen.
ZIPs mit echten Zielpfaden ab Repo-Root liefern.
Nach Code-/Doku-Step StepDone-Befehl angeben.
```
