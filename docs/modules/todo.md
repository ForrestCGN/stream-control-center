# Todo-Modul

## Zweck

Das Modul `backend/modules/todo.js` stellt das Todo-System bereit.

Es verarbeitet Todo-Einträge aus Chat-/HTTP-Aufrufen, postet diese in konfigurierte Discord-Channels, pflegt Statistiken, verwaltet Settings und nutzt das zentrale Textvarianten-System.

## Modul-Metadaten

Aktueller Analyse-Stand CAN-34.1:

```text
MODULE_NAME = todo
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 1
category = content
routesPrefix = /api/todo, /todo, /discord/todo
```

Das Modul exportiert `MODULE_META` mit:

```text
name: todo
version: 0.1.0
type: runtime
category: content
description: Todo API, Discord-Posting und Text-/Settings-Verwaltung.
routesPrefix:
- /api/todo
- /todo
- /discord/todo
legacy: false
```

Der Bus-Block ist aktuell bewusst nicht aktiv registriert:

```text
bus.registered = false
bus.heartbeat = false
bus.emits = []
bus.listens = []
```

## Wichtige Runtime-Regel

Das Todo-Modul ist produktiv relevant.

Deshalb gilt:

```text
Keine Todo-Funktion ändern ohne eigenen Plan.
Keine Todo-Einträge erstellen/löschen/ändern ohne ausdrücklichen Go-Schritt.
Keine Settings speichern ohne ausdrücklichen Go-Schritt.
Keine Texte/Varianten speichern/löschen ohne ausdrücklichen Go-Schritt.
Kein Reload ohne ausdrücklichen Go-Schritt.
Keine DB-Migration ohne eigenen Plan.
Keine Funktionalität entfernen.
```

## Datenquellen

Das Modul nutzt unter anderem:

```text
config/discord_channels.json
config/messages/todo.json
todo_settings
module_text_variants
module_texts
todo_user_stats
todo_daily_stats
```

Produktive SQLite-DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Status-Endpunkt

Bevorzugte schnelle Diagnose:

```text
GET /api/todo/status
```

Der Status enthält unter anderem:

```text
schemaVersion
schemaReady
schemaError
databasePath
discordChannelsPath
messagesPath
loadedAt
lastLoadError
lastUserinfoError
settings
settingsTable
textsTable
legacyTextsTable
textsSource
targets
aliases
channels
```

## Read-only Routen

Diese Routen dürfen für Diagnose/Dashboard-Prüfungen genutzt werden:

```text
GET /api/todo/status
GET /api/todo/config
GET /api/todo/settings
GET /api/todo/routes
GET /api/todo/integration-check
GET /api/todo/stats
GET /api/todo/stats/top
GET /api/todo/stats/today
GET /api/todo/admin/settings
GET /api/todo/admin/texts
GET /discord/todo/status
```

Hinweis:

```text
/admin/settings und /admin/texts sind per GET read-only.
POST auf dieselben Routen ist schreibend.
```

## Read-only Integration-Check

Sichere Diagnose-Route:

```text
GET /api/todo/integration-check
```

Diese Route prüft:

```text
Schema
Status
Discord-Channel-Konfiguration
Targets/Aliase
Settings-Tabelle
Todo-Statistik-Tabellen
Textvarianten
Legacy-Texte
Dateien
DB-Pfad
```

Wichtige Regel:

```text
Der Integration-Check darf keine DB-, JSON- oder Dateiänderungen vornehmen.
Warnungen zu fehlenden Discord-Channels bedeuten nur, dass einzelne Todo-Ziele nicht posten können.
```

## Produktive / schreibende / vorsichtige Routen

Diese Routen dürfen nicht automatisch durch Diagnose oder Dashboard-Healthchecks ausgelöst werden:

```text
GET /api/todo/add
POST /api/todo/add
GET /discord/todo
POST /discord/todo
GET /api/todo/reload
POST /api/todo/reload
POST /api/todo/admin/settings
POST /api/todo/admin/texts
```

Besonders wichtig:

```text
/api/todo/add und /discord/todo posten nach Discord und erhöhen Todo-Statistiken.
```

`/api/todo/reload` lädt Runtime-Config und Texte neu. Das ist nicht destruktiv, aber trotzdem ein aktiver Admin-Eingriff und kein automatischer Diagnose-Call.

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/todo.js
```

Das Dashboard nutzt:

```text
/api/todo/status
/api/todo/admin/settings
/api/todo/admin/texts
/api/todo/stats
/api/todo/stats/today
/api/todo/reload
```

Dashboard-Schreib-/Aktionsfunktionen:

```text
reloadBackend()
saveSetting()
saveVariant()
addVariant()
deleteVariant()
```

Diese Funktionen dürfen nicht durch automatische Diagnosekarten ausgelöst werden.

## Sicherheitsregel für zukünftige Todo-Diagnosekarten

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /api/todo/status lesen
- darf /api/todo/routes lesen
- darf /api/todo/integration-check lesen
- darf /api/todo/stats und /stats/today lesen
- darf GET /api/todo/admin/settings und GET /api/todo/admin/texts lesen
- darf keine /api/todo/add Route aufrufen
- darf keine /discord/todo Route aufrufen
- darf keinen /api/todo/reload auslösen
- darf keine POST /api/todo/admin/settings Route aufrufen
- darf keine POST /api/todo/admin/texts Route aufrufen
- darf keine Discord-Nachricht posten
- darf keine Statistik erhöhen
- darf keine Settings/Textvarianten speichern oder löschen
```

## Bekannte Folgeidee

Möglicher späterer kleiner Schritt:

```text
CAN-34.3 - Todo Dashboard Read-only Diagnosekarte planen
```

Möglicher Inhalt:

```text
- Modulversion anzeigen
- Schema OK anzeigen
- Integration-Check OK anzeigen
- Ziel-/Channel-Status anzeigen
- Statistik-Tabellen-Zähler anzeigen
- Textvarianten-Zähler anzeigen
- Read-only Routen als erlaubt markieren
- Add/Reload/Admin-POST-Routen als gesperrt markieren
```

## Stand

```text
CAN-34.2: Doku-/Regelstand erstellt.
```
