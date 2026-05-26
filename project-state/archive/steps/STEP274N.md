# STEP274N – Media Registry Kategorie-/Dateistruktur-Migration vorbereiten

## Ziel

Vorhandene Medien sollen langfristig in die neue zentrale Struktur sortiert werden:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

Dabei darf keine bestehende Funktionalität kaputtgehen. Commands sollen weiterhin über stabile `mediaId`-Referenzen laufen, z. B.:

```text
/api/sound/play-media?mediaId=1311
```

## Ergebnis dieses Steps

Dieser Step ergänzt ein sicheres Migrations-/Analysewerkzeug:

```text
tools/media_registry_migrate_categories.js
config/media_migration_plan.example.json
```

Standard ist **Dry-Run**. Ohne `--apply` werden keine Dateien kopiert und keine Datenbankwerte geändert.

## Sicherheitsregeln

- Keine Dateien löschen.
- Standardmäßig nur planen/reporten.
- Vor Apply wird ein JSON-Backup der betroffenen DB-Zeilen geschrieben.
- Apply kann Dateien kopieren, aber nicht verschieben.
- Media-IDs bleiben gleich.
- Commands müssen nicht auf Pfade zeigen, sondern weiterhin auf `mediaId`.
- Alte Dateien bleiben nach Copy erstmal liegen.

## Script-Beispiele

Nur Analyse:

```cmd
node tools\media_registry_migrate_categories.js --dry-run
```

Analyse mit eigener Mapping-Datei:

```cmd
node tools\media_registry_migrate_categories.js --dry-run --map-file config\media_migration_plan.json
```

Nur Command-referenzierte Assets planen:

```cmd
node tools\media_registry_migrate_categories.js --dry-run --only-command-assets
```

Apply mit Kopie und DB-Update:

```cmd
node tools\media_registry_migrate_categories.js --apply --copy-files --map-file config\media_migration_plan.json
```

DB-only ist bewusst möglich, aber nur verwenden, wenn Dateien bereits korrekt liegen:

```cmd
node tools\media_registry_migrate_categories.js --apply --db-only --map-file config\media_migration_plan.json
```

## Reports/Backups

Das Script schreibt Reports nach:

```text
D:\Streaming\stramAssets\data\exports\media_migration\
```

Backups nach:

```text
D:\Streaming\stramAssets\data\backups\
```

## Mapping-Datei

Die Beispiel-Datei liegt unter:

```text
config/media_migration_plan.example.json
```

Für echte Migration kopieren nach:

```text
config/media_migration_plan.json
```

Danach einzelne IDs oder Regeln anpassen.

## Nächster Schritt

STEP274O sollte zuerst den Dry-Run auf dem Live-System ausführen und die CSV/JSON-Liste prüfen. Erst nach Sichtprüfung sollte `--apply --copy-files` verwendet werden.
