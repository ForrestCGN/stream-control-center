# Diagnostics Standard

## Stand

```text
CAN-42.2
```

## Ziel

Alle Module sollen künftig möglichst einheitliche Status-/Diagnosefelder liefern, damit `Admin > Diagnose` zuverlässige und vergleichbare Werte anzeigen kann.

Wichtig:

```text
Diagnose liest nur.
Modul-Seiten bleiben Bedienseiten.
Produktive Aktionen werden nicht ausgelöst.
Leere Felder bedeuten: Feld fehlt, heißt anders oder wird vom Modul noch nicht geliefert.
```

## Zentrale Diagnose-Regel

```text
Diagnose gehört zentral nach Admin > Diagnose.
Keine neuen Diagnosekarten mehr direkt in einzelne Module.
Bestehende Modul-Diagnosen werden später schrittweise zentralisiert.
Hinweise nur dort, wo sie fachlich helfen.
Rollen/Rechte/Confirm/Audit-Logging sichern spätere Mod-Zugriffe.
```

## Mindest-Statusschema für Module

Jedes Modul sollte langfristig mindestens diese Felder liefern:

```json
{
  "ok": true,
  "module": "module_key",
  "version": "0.1.0",
  "enabled": true,
  "status": "ok",
  "schemaVersion": 1,
  "configSource": "database_with_json_fallback",
  "textSource": "database_variants_with_json_fallback",
  "database": {
    "enabled": true,
    "connected": true,
    "path": "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite",
    "tables": []
  },
  "routes": [],
  "lastError": null,
  "lastLoadedAt": null
}
```

## Empfohlene Felder

### Modulidentität

```text
module
name
version
status
enabled
category
description
```

### Schema / Daten

```text
schemaVersion
database.enabled
database.connected
database.path
database.tables
migrations.status
migrations.lastRunAt
```

### Config

```text
configSource
configPath
configLoaded
settingsSource
settingsCount
```

### Texte

```text
textSource
textsLoaded
textCategories
textKeys
textVariants
```

### Routen

```text
routes
routesCount
readRoutesCount
writeRoutesCount
```

Routen werden in der normalen Admin-Diagnose nicht als vollständige Liste angezeigt. Sie dürfen aber in Rohdaten oder Detail-Doku vorhanden sein.

### Laufzeit / EventBus

```text
startedAt
lastLoadedAt
lastReloadAt
lastHeartbeatAt
eventBus.registered
eventBus.publishes
eventBus.consumes
```

### Fehler

```text
lastError
lastErrorAt
warnings
```

## Anzeigen in Admin > Diagnose

Die zentrale Diagnose soll folgende Werte priorisieren:

```text
Status erreichbar
Version
Schema-Version
Gruppe/Kategorie
Config-Quelle
Textsystem
DB-Status
Routenanzahl
Letzter Fehler
Rohdaten optional einklappbar
```

## Umgang mit fehlenden Feldern

Wenn ein Feld fehlt:

```text
- anzeigen als "-"
- nicht als Fehler werten
- bei Bedarf in Inventar/ToDo notieren
- Modul später sanft erweitern
```

Wenn ein Feld anders heißt:

```text
- Diagnose kann Alias-Mapping nutzen
- langfristig Modul-Status vereinheitlichen
```

Beispiele für Alias-Mapping:

```text
schemaVersion | schema.version | schema.current
version | moduleVersion | meta.version | moduleMeta.version
configSource | settingsSource | config.settingsSource
textSource | textsSource | texts.source
lastError | stats.lastError | error
```

## Read-only Endpunkte

Statusrouten sollen grundsätzlich GET sein:

```text
GET /api/<module>/status
```

Zusätzliche GETs sind erlaubt, wenn sie wirklich read-only sind.

Nicht verwenden, wenn GET intern schreibt/mutiert:

```text
GET /api/birthday/show/queue
```

## Schreibende Aktionen

Diese Aktionen gehören nicht in automatische Diagnose:

```text
POST / reload
POST / save
POST / delete
POST / upload
POST / import
POST / show
POST / sound
POST / queue clear
POST / OBS repair
```

Sie dürfen später im Admin-Bereich sichtbar dokumentiert werden, aber nicht automatisch ausgelöst werden.

## Schrittweise Umsetzung

1. Zentrales Diagnose-Inventar erstellen.
2. Fehlende Felder je Modul dokumentieren.
3. Module nach und nach sanft erweitern.
4. Alte Modul-Diagnosekarten aus Einzelseiten entfernen.
5. Rollen/Rechte/Confirm/Audit-Logging für produktive Aktionen später umsetzen.

## Aktuelle Module für Inventar

```text
birthday
todo
tagebuch
hug
commands
message_rotator
bus_diagnostics
overlay_monitor
sound_system
media
vip
alerts
```
