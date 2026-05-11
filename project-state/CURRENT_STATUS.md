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

## STEP252 - DeathCounter DB-Schema Storage-Grundlage

Stand: 2026-05-11

DeathCounter V2 hat jetzt eine vorbereitete Datenbank-Storage-Grundlage. Diese ist bewusst noch nicht produktiv aktiv. Die produktive Single Source of Truth bleibt weiterhin:

```text
data/deathcounter/deathcounter.v2.json
```

Neu vorbereitet:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Wichtig:

```text
- keine Count-Migration
- kein JSON-Import in DB
- keine Umstellung der RIP/DEL/TODE-Logik
- keine Änderung am Overlay
- keine Änderung an Streamer.bot
```

Integration-Check erweitert:

```text
/api/deathcounter/v2/integration-check
```

Zusätzlich zeigen auch Config/Settings den vorbereiteten Storage-Status.


## STEP254 - DeathCounter Storage Validation / Import-Readiness

Stand: 2026-05-11

- Neue Read-only-Route `GET /api/deathcounter/v2/storage/validate`.
- Prueft JSON-State gegen vorbereitete DB-Tabellen.
- Meldet Fehler/Warnungen/Infos und `readyForImport`.
- Integration-Check enthaelt jetzt `database_storage_validation`.
- Keine DB-Schreiboperation, kein Count-Import, kein Storage-Wechsel.

## STEP253 - DeathCounter Storage Preview

Stand: 2026-05-11

DeathCounter V2 hat jetzt eine reine Vorschau-Route fuer die spaetere DB-Migration:

```text
GET /api/deathcounter/v2/storage/preview
```

Die Route liest weiterhin nur den produktiven JSON-State und baut daraus im Speicher geplante Tabellenzeilen fuer:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Wichtig:

```text
- readOnly: true
- writesDatabase: false
- importsCounts: false
- switchesStorage: false
- activeStorage bleibt json_state_file
```

Der Integration-Check enthaelt jetzt zusaetzlich `database_storage_preview`.

Referenz:

```text
project-state/STEP253_DEATHCOUNTER_STORAGE_PREVIEW_2026-05-11.md
```
