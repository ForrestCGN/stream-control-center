# STEP274O – Media Migration Category Suggestions

## Ziel

STEP274O ergänzt den fehlenden Vorschlagsgenerator für die Media-Registry-Migration.

Das Script erzeugt eine reviewbare Mapping-Datei für STEP274N:

```cmd
node tools\media_registry_suggest_categories.js
```

## Neue Datei

- `tools/media_registry_suggest_categories.js`

## Eigenschaften

- liest `media_assets` aus der bestehenden SQLite-Datenbank
- liest Command-Referenzen aus `command_definitions`
- erzeugt `config/media_migration_plan.suggested.json`
- erzeugt zusätzliche Reports unter `data/exports/media_migration/`
- ändert keine Datenbank
- verschiebt/kopiert keine Dateien

## Wichtige Regel

Die erzeugte Datei ist ein Vorschlag. Vor `--apply --copy-files` im Migrationstool muss sie geprüft und bei Bedarf angepasst werden.

## Test

```cmd
node --check tools\media_registry_suggest_categories.js
node tools\media_registry_suggest_categories.js
node tools\media_registry_migrate_categories.js --dry-run --map-file config\media_migration_plan.suggested.json
```
