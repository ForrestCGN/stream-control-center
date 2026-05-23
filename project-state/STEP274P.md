# STEP274P – Media Migration Plan Refinement

## Ziel

STEP274P ergänzt einen sicheren Refinement-Generator für die Media-Registry-Migration.

Aus `config/media_migration_plan.suggested.json` wird eine semantisch bessere Datei erzeugt:

```text
config/media_migration_plan.refined.json
```

## Wichtig

Dieser Step ändert keine Datenbank und verschiebt/kopiert keine Mediendateien.
Er erzeugt nur eine Plan-Datei für den nächsten Dry-Run.

## Neue Datei

```text
tools/media_registry_refine_plan.js
```

## Nutzung

```cmd
cd D:\Git\stream-control-center
node tools\media_registry_refine_plan.js
```

Danach:

```cmd
node tools\media_registry_migrate_categories.js --dry-run --map-file config\media_migration_plan.refined.json
```

## Alert-Refinement

STEP274P sortiert Alert-Dateien anhand von Notizen/Dateinamen unter anderem nach:

```text
alerts/follow
alerts/bits
alerts/sub
alerts/raid
alerts/kofi
alerts/tipeee
alerts/donation
```

## Sicherheitsregel

Apply bleibt weiterhin getrennt und darf erst nach geprüftem Dry-Run erfolgen:

```cmd
node tools\media_registry_migrate_categories.js --apply --copy-files --map-file config\media_migration_plan.refined.json
```

Keine Datei wird gelöscht.
