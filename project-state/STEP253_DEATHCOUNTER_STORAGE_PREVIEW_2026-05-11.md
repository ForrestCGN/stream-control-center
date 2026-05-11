# STEP253 - DeathCounter Storage Preview

Stand: 2026-05-11

## Ziel

DeathCounter V2 bekommt eine reine Read-only-Vorschau fuer die spaetere DB-Storage-Migration.

Die neue Route liest den aktuellen produktiven JSON-State aus:

```text
data/deathcounter/deathcounter.v2.json
```

und baut daraus im Speicher eine Vorschau, welche Zeilen spaeter in die vorbereiteten DB-Tabellen geschrieben wuerden.

## Neue Route

```text
GET /api/deathcounter/v2/storage/preview
```

Optionale Query-Parameter:

```text
limit=25          maximale Beispielzeilen pro Tabellenbereich
includeRows=true  Beispielzeilen anzeigen; bei false nur Zusammenfassung
```

Beispiele:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?includeRows=false" | ConvertTo-Json -Depth 20
```

## Vorschau-Bereiche

```text
players       -> deathcounter_players
games         -> deathcounter_games
counts        -> deathcounter_counts
overlayState  -> deathcounter_overlay_state
events        -> deathcounter_events
```

`events` bleibt in der Vorschau leer, weil aus dem aktuellen JSON-State keine historische Event-Kette rekonstruiert wird.

## Sicherheitsregeln

Diese Route ist bewusst nicht produktiv schreibend:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
preparedStorage: database_schema
```

Nicht geaendert:

```text
- keine Count-Migration
- kein INSERT/UPDATE/DELETE fuer DeathCounter-Storage-Daten
- keine Umstellung von RIP/DEL/TODE auf DB
- keine Aenderung an Overlay oder Streamer.bot
- keine Aenderung an app.sqlite ausser bestehende STEP252-Schema-Vorbereitung, falls noch nicht vorhanden
```

## Integration-Check

`/api/deathcounter/v2/integration-check` meldet jetzt zusaetzlich:

```text
database_storage_preview
```

Der Check prueft, ob die Vorschau aus dem JSON-State gebaut werden kann und ob sie weiterhin als read-only gemeldet wird.

## Betroffene Dateien

```text
backend/modules/deathcounter_v2.js
project-state/STEP253_DEATHCOUNTER_STORAGE_PREVIEW_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
```

## Test

Lokaler Syntaxcheck:

```powershell
node --check backend\modules\deathcounter_v2.js
```

Live-API nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?includeRows=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
storage/preview ok: true
action: storage_preview
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
integration-check database_storage_preview ok: true
```
