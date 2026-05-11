## STEP250 - DeathCounter DCOUNT Extra Players

Stand: 2026-05-11

- DeathCounter `!dcount` unterstützt jetzt Zusatzspieler im Overlay.
- Neue Befehle:
  - `!dcount add @User`
  - `!dcount remove @User`
  - `!dcount clear`
- `!dcount reset` bleibt Standard-Reset auf ForrestCGN + EngelCGN ohne Extras.
- Die maximale Anzahl Zusatzspieler kommt weiterhin aus `deathcounter_settings.maxExtraPlayers`.
- Spielerauflösung nutzt vorhandene State-/Twitch-Lookup-Logik.
- Keine Dashboard-, Overlay-, Streamer.bot-, DB- oder Count-Migration.

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
STEP249    Streamer.bot rawInput Parser-Fix
STEP250    DCOUNT Zusatzspieler add/remove/clear
```

Referenz:

```text
project-state/STEP250_DEATHCOUNTER_DCOUNT_EXTRA_PLAYERS_2026-05-11.md
```
