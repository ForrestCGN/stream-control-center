# Todo-Modul

## Stand

```text
CAN-42.6
```

## Modul

```text
Datei: backend/modules/todo.js
Modulname: todo
MODULE_VERSION: 0.1.0
SCHEMA_VERSION: 1
```

## Zweck

Todo API, Discord-Posting und Text-/Settings-Verwaltung.

## Diagnose-Standard

Seit CAN-42.6 liefert `GET /api/todo/status` zusätzlich einen standardisierten `diagnostics`-Block.

Dieser Block ist für `Admin > Diagnose` vorgesehen und ergänzt bestehende Statusfelder nur. Bestehende Felder bleiben erhalten.

## Diagnostics-Felder

```text
ok
health
module
version
schemaVersion
schemaReady
configSource
textSource
database
counts
warnings
errors
lastError
```

## Counts

```text
targets
channelsConfigured
channelsTotal
missingChannels
userStats
dailyStats
settings
textVariants
legacyTexts
```

## Schreibende Aktionen

Folgende Aktionen bleiben produktiv und dürfen nicht durch Diagnose ausgelöst werden:

```text
/api/todo/add
/discord/todo
/api/todo/reload
/api/todo/admin/settings
/api/todo/admin/texts
```

## Regeln

```text
Keine Funktionalität entfernen.
Keine DB neu bauen oder überschreiben.
Diagnose zentral unter Admin > Diagnose.
Todo-Modul-Seite bleibt Bedienseite.
```
