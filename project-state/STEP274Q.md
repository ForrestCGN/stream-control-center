# STEP274Q – Media Registry Migration Apply Hotfix

## Ziel

Hotfix fuer `tools/media_registry_migrate_categories.js`, nachdem der echte Apply mit
`UNIQUE constraint failed: media_assets.relative_path` abgebrochen ist.

## Ursache

Der Dry-Run war fachlich korrekt, aber der Apply konnte in SQLite scheitern, wenn finale Zielpfade bereits als alte `relative_path`-Werte anderer Assets existierten oder wenn mehrere geplante Zielpfade erst waehrend der Migration eindeutig werden mussten.

SQLite prueft `UNIQUE(media_assets.relative_path)` sofort pro Update. Dadurch kann ein Pfad noch blockiert sein, obwohl die blockierende Row in derselben Migration spaeter ebenfalls verschoben wuerde.

## Fix

`tools/media_registry_migrate_categories.js` wurde erweitert:

- STEP-Kennung auf `STEP274Q` gesetzt.
- Zielpfade werden bereits im Plan eindeutig reserviert.
- Doppelte geplante Zielpfade werden vor Apply abgefangen.
- Apply laeuft zweiphasig:
  1. betroffene Rows werden temporaer auf eindeutige `media/__migration_tmp__/...` Pfade gesetzt.
  2. danach werden finale Zielpfade/Kategorien gesetzt.
- Dateien werden weiterhin nur kopiert, niemals geloescht.
- Alte Dateien bleiben erhalten.

## Wichtig nach fehlgeschlagenem Apply

Ein fehlgeschlagener Apply kann bereits einzelne Dateien kopiert haben, bevor die DB-Transaktion rollbackt. Das ist unkritisch: Der neue Dry-Run erkennt vorhandene identische Zielkopien und behandelt sie als nicht erneut kopierpflichtig.

## Test

```cmd
node tools\media_registry_migrate_categories.js --dry-run --map-file config\media_migration_plan.refined.json
node tools\media_registry_migrate_categories.js --apply --copy-files --map-file config\media_migration_plan.refined.json
node tools\media_registry_migrate_categories.js --dry-run --map-file config\media_migration_plan.refined.json
```

Erwartung nach erfolgreichem Apply:

```text
dbUpdates: 0
copyNeeded: 0
missingSources: 0
```

## Rollback

Das Script schreibt weiterhin vor jedem Lauf Backup-/Report-Dateien unter:

- `D:\Streaming\stramAssets\data\backups\`
- `D:\Streaming\stramAssets\data\exports\media_migration\`
