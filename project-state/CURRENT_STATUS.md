## STEP248 - DeathCounter Spieler-Detail Quick-Corrections

Stand: 2026-05-11

- DeathCounter Dashboard Spieler-Detailansicht hat jetzt schnelle Korrektur-Aktionen für das aktuelle Spiel.
- In der Detailkarte eines Spielers gibt es `+1 Tod`, `-1 Tod` und `Steuerung öffnen`.
- Aktionen laufen weiterhin über `/api/deathcounter/v2/command` mit `sendChat=0`.
- `-1 Tod` bleibt durch eine Bestätigungsabfrage geschützt.
- Keine Backend-, DB-, Count-Migrations-, Overlay- oder Streamer.bot-Änderung.

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
```

Referenz:

```text
project-state/STEP248_DEATHCOUNTER_PLAYER_DETAIL_QUICK_CORRECTIONS_2026-05-11.md
```
