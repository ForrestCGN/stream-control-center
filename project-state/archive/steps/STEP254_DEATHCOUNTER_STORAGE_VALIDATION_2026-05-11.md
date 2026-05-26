# STEP254 - DeathCounter Storage Validation / Import-Readiness

Stand: 2026-05-11

## Ziel

DeathCounter V2 bekommt eine weitere rein lesende Vorbereitung fuer eine spaetere DB-Migration.

Neue Route:

```text
GET /api/deathcounter/v2/storage/validate
```

Die Route prueft den aktuellen JSON-State gegen die vorbereitete DB-Struktur und meldet, ob ein spaeterer Import grundsaetzlich vorbereitet waere.

## Wichtig

Die Route ist absichtlich nicht destruktiv:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
preparedStorage: database_schema
```

Es werden keine Daten in `app.sqlite` geschrieben, keine Counts importiert und keine produktive Storage-Logik umgestellt.

## Validierungen

Geprueft werden unter anderem:

```text
- vorbereitete Storage-Tabellen vorhanden
- Zieltabellen leer / nicht leer
- Player-IDs und Logins vorhanden
- doppelte Player-IDs / Logins
- Game-Keys vorhanden / doppelt
- Count-Zeilen referenzieren vorhandene Player
- Count-Zeilen referenzieren vorhandene Games
- Count-Werte sind nicht-negativ und ganzzahlig
- Overlay selectedPlayerIds/extraPlayerIds referenzieren vorhandene Player
- aktuelle Spielreferenz ist vorhanden
```

Hinweis: Historische `deathcounter_events` werden weiterhin nicht aus dem JSON rekonstruiert. Das wird als Info gemeldet und blockiert die Readiness nicht.

## Integration-Check

`/api/deathcounter/v2/integration-check` enthaelt jetzt zusaetzlich:

```text
database_storage_validation
```

## Geaenderte Dateien

```text
backend/modules/deathcounter_v2.js
project-state/STEP254_DEATHCOUNTER_STORAGE_VALIDATION_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
```

## Testbefehle

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Erwartung

```text
readyForImport: true
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
```

Warnings koennen auftreten, wenn vorbereitete Zieltabellen bereits Zeilen enthalten. Das blockiert nicht zwingend, muss aber vor einem echten Import bewusst bewertet werden.
