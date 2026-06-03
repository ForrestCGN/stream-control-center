# Tagebuch-Modul

## Stand

```text
CAN-42.8
```

## Modul

```text
Datei: backend/modules/tagebuch.js
Modulname: tagebuch
MODULE_VERSION: 0.1.0
SCHEMA_VERSION: 5
```

## Zweck

Streamtagebuch API, Discord-Posting und Text-/Settings-Verwaltung.

## Diagnose-Standard

Seit CAN-42.8 liefert `GET /api/tagebuch/status` zusätzlich einen standardisierten `diagnostics`-Block.

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
state
files
webhook
warnings
errors
lastError
```

## Counts

```text
state
runtimeEvents
userStats
dailyUserStats
settings
textVariants
legacyTexts
```

## Schreibende Aktionen

Folgende Aktionen bleiben produktiv und dürfen nicht durch Diagnose ausgelöst werden:

```text
/api/tagebuch/stream/start
/api/tagebuch/stream/end
/api/tagebuch/entry
/api/tagebuch/reset
/api/tagebuch/reload
/api/tagebuch/admin/settings
/api/tagebuch/admin/texts
/discord/stream/start
/discord/stream/end
/discord/tagebuch
/discord/tagebuch/reset
```

## Regeln

```text
Keine Funktionalität entfernen.
Keine DB neu bauen oder überschreiben.
Diagnose zentral unter Admin > Diagnose.
Tagebuch-Modul-Seite bleibt Bedienseite.
```
