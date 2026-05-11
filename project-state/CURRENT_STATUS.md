## STEP251 - DeathCounter Dashboard Extra Players

Stand: 2026-05-11

- DeathCounter-Dashboard kann Zusatzspieler jetzt im Tab `Steuerung` verwalten.
- Neue Dashboard-Aktionen:
  - Zusatzspieler hinzufügen
  - Zusatzspieler entfernen
  - alle Zusatzspieler leeren
- Das Dashboard nutzt weiter `/api/deathcounter/v2/command` und schreibt nicht direkt in State/DB.
- Übersicht/Sichtbare Spieler berücksichtigt jetzt Standardspieler plus Zusatzspieler.
- Backend, Overlay, Streamer.bot, DB und Count-Logik wurden nicht geändert.

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
STEP251    Dashboard-Zusatzspieler-Steuerung
```

Referenz:

```text
project-state/STEP251_DEATHCOUNTER_DASHBOARD_EXTRA_PLAYERS_2026-05-11.md
```
