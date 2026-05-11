# STEP256 - DeathCounter Storage Consistency Check

Stand: 2026-05-11

## Ziel

DeathCounter V2 bekommt nach dem kontrollierten DB-Import einen reinen Konsistenzcheck zwischen produktiver JSON-Datei und importierten DB-Zeilen.

## Neue Route

```text
GET /api/deathcounter/v2/storage/consistency
```

## Funktion

Die Route liest den aktuellen produktiven JSON-State aus:

```text
data/deathcounter/deathcounter.v2.json
```

und vergleicht die daraus abgeleiteten Zielzeilen mit den bereits importierten DB-Zeilen in:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Geprueft werden:

```text
- Spieler-IDs, Logins, Displaynames, active, sort_order
- Game-Keys und Displaynames
- Count-Zeilen pro player_id + game_key
- session_deaths und all_time_deaths
- Overlay-State: visible, title, selected_player_ids, extra_player_ids, current_game
- fehlende DB-Zeilen
- zusaetzliche DB-Zeilen
- Wertabweichungen zwischen JSON und DB
```

## Garantien

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
```

Die Route schreibt nichts, importiert nichts und schaltet keinen produktiven Storage um.

## Integration-Check

`/api/deathcounter/v2/integration-check` enthaelt jetzt zusaetzlich:

```text
database_storage_consistency
```

## Erwartung nach STEP255

Nach erfolgreichem STEP255-Import sollte der Check liefern:

```text
consistent: true
errors: 0
warnings: 0
```

Eine Info zu nicht rekonstruierten Events ist weiterhin normal, solange keine echte DB-Event-Historie produktiv geschrieben wird.

## Bewusst nicht geaendert

```text
- keine Umstellung der produktiven Count-Logik auf DB
- kein Schreiben in deathcounter.v2.json
- kein Import-Endpunkt geaendert
- keine Overlay-Aenderung
- keine Streamer.bot-Aenderung
```
