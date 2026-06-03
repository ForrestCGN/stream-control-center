# Modul: Hug / Rehug

Stand: CAN-43.3

## Zweck

Das Modul `hug` stellt das Hug-/Rehug-System bereit.

Es verwaltet:

- Hug- und Rehug-Commands
- Hug-/Rehug-Statistiken
- Pending-Rehug-Fenster
- Hug-Typen
- Hug-/Rehug-Textpaare
- Chatweite Hug-Texte
- Systemantworten
- Toplisten-Titel
- Dashboard-/Admin-Endpunkte für Textpflege

## Technische Hauptdatei

```text
backend/modules/hug.js
```

## Modul-Metadaten

Bestätigter Stand CAN-43.3:

```text
MODULE_NAME    = hug
MODULE_VERSION = 0.1.1
MODULE_BUILD   = diagnostics-standard
SCHEMA_VERSION = 3
```

## Routen

Wichtige Routen:

```text
GET      /api/hug/status
GET      /api/hug/config
GET      /api/hug/settings
GET      /api/hug/routes
GET      /api/hug/integration-check
POST     /api/hug/reload
GET      /api/hug/reload
POST     /api/hug/action
POST     /api/hug/stats
GET      /api/hug/cmd
GET      /api/hug/statscmd
GET      /api/hug/top
GET/POST /api/hug/command
GET      /api/hug/db/status
GET      /api/dashboard/community/hug/status
GET      /api/hug/text-store/status
POST     /api/hug/text-store/reload
GET      /api/hug/db/output-mode
POST     /api/hug/db/output-mode
GET      /api/hug/types
GET      /api/hug/texts
GET/POST /api/hug/admin/text-pairs
GET/POST /api/dashboard/community/hug/text-pairs
GET/POST /api/hug/admin/hug-all-texts
GET/POST /api/dashboard/community/hug/hug-all-texts
GET/POST /api/hug/admin/response-texts
GET/POST /api/dashboard/community/hug/response-texts
GET/POST /api/hug/admin/top-title-texts
GET/POST /api/dashboard/community/hug/top-title-texts
```

## Diagnose-Standard

`GET /api/hug/status` liefert den Modulstatus inklusive:

- `ok`
- `module`
- `moduleVersion`
- `moduleBuild`
- `version`
- `build`
- `schemaVersion`
- `source`
- `cacheLoadedAt`
- `database`
- `enabled`
- `output`
- `topLimit`
- `rehugWindowSeconds`
- `counts`
- `diagnostics`
- `textKinds`
- `top`
- `recentPairs`
- `lastImport`
- `lastError`

Der `diagnostics`-Block liefert:

- `ok`
- `health`
- `module`
- `version`
- `build`
- `schemaVersion`
- `expectedSchemaVersion`
- `schemaReady`
- `configSource`
- `textSource`
- `database`
- `counts`
- `warnings`
- `errors`
- `lastError`

## Integration-Check

`GET /api/hug/integration-check` ist nicht-destruktiv.

CAN-43.3 bestätigter Stand:

```text
total=12
ok=12
warnings=0
errors=0
```

Geprüfte Checks:

- `config_file`
- `messages_file`
- `hug_users`
- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_settings`
- `hug_types`
- `hug_texts`
- `hug_text_pairs`
- `runtime_cache`
- `active_text_pairs`
- `routes`

## Datenbanktabellen

Bestätigte Tabellen im Live-System:

- `hug_users`
- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_settings`
- `hug_types`
- `hug_texts`
- `hug_text_pairs`

Produktive DB-Regel bleibt:

- `D:\Streaming\stramAssets\data\sqlite\app.sqlite` niemals neu bauen, überschreiben oder löschen.
- Migrationen nur sanft und geprüft.

## Bestätigte Live-Zähler CAN-43.3

```text
users               : 61
enabledUsers        : 60
disabledUsers       : 1
pairStats           : 201
pendingRehugs       : 0
hugTypes            : 30
hugTextPairs        : 30
activeHugTextPairs  : 30
hugAllTexts         : 20
dbTexts             : 107
totalHugsGiven      : 807
totalHugsReceived   : 750
totalRehugsGiven    : 78
totalRehugsReceived : 78
```

## Dashboard-Extension

Bewusst behalten:

```text
htdocs/dashboard/modules/hug_diagnostics_ext.js
htdocs/dashboard/modules/hug_diagnostics_ext.css
```

Grund:

- aktive Read-only-Diagnoseerweiterung
- nutzt GET-Diagnosedaten
- trennt produktive Routen von Read-only-Routen
- führt keine Hug-/Rehug-Aktionen aus
- führt keinen produktiven Reload aus
- triggert keine Chat-Ausgabe
- verändert keine Datenbankdaten

## Registry

`hug` ist in der zentralen Diagnose-Registry eingetragen.

Statusroute:

```text
/api/hug/status
```

CAN-43.3 Coverage:

```text
ok=True
missingLoadedModules=0
registryOnlyEntries=0
```

## CAN-43.3 Ergebnis

`hug` erfüllt den aktuellen Diagnose-/Registry-Standard.

Keine Codeänderung nötig.
Keine Modulversion erhöht.
Keine produktive Funktion geändert.
