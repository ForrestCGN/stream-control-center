## STEP249 - DeathCounter Command rawInput Parser-Fix

Stand: 2026-05-11

- DeathCounter Command-Parser ist jetzt kompatibler mit Streamer.bot-`rawInput` und `input0`/`input1`.
- Wenn Streamer.bot den Command selbst als ersten Token übergibt (`!dcount`, `.dcount`, `!rip`, `!tode`), entfernt das Backend diesen Token vor der eigentlichen Auswertung.
- `!dcount` kann dadurch wieder zuverlässig togglen.
- `!rip @Name` und `!tode @Name` bleiben mit @-Pflicht nutzbar, auch wenn der komplette Chattext als `rawInput` kommt.
- Keine Dashboard-, DB-, Count-Migrations-, Overlay- oder EventSub-Änderung.

Aktueller DeathCounter-Stand:

```text
STEP238    Command-API
STEP239    Backend-Chatversand über Bot
STEP240    DB-Settings
STEP241    DB-Textvarianten
STEP242    Dashboard-Basis
STEP242.1  Sichtbare-Spieler-Fix
STEP242.2  Dashboard-Tabs/Layout-Fix
STEP243    Dashboard UX Cleanup
STEP244    Statistik Game-Filter
STEP245    Streamer.bot Minimal-Bridge Doku
STEP246    Twitch EventSub Game-Sync
STEP247    Spieler-Detailansicht
STEP248    Spieler-Detail Quick-Corrections
STEP249    Command rawInput Parser-Fix
```

Referenz:

```text
project-state/STEP249_DEATHCOUNTER_COMMAND_RAWINPUT_PARSER_2026-05-11.md
```
