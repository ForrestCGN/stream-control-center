# Commands-Modul

## Zweck

Das Modul `backend/modules/commands.js` ist das zentrale Chat-Command-System im `stream-control-center`.

Es verwaltet Command-Definitionen, Aliase, Rechte, Cooldowns, Zielrouten, Katalogwerte, Test-/DryRun-Funktionen und Ausführungslogs.

## Modul-Metadaten

Aktueller Analyse-Stand CAN-33.1:

```text
MODULE_NAME = commands
MODULE_VERSION = 0.1.6
MODULE_BUILD = channel-guard
API_PREFIX = /api/commands
```

Das Modul exportiert `MODULE_META` mit:

```text
name: commands
version: 0.1.6
build: channel-guard
type: runtime
category: commands
routesPrefix: /api/commands
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

Das Commands-Modul ist produktiv relevant.

Deshalb gilt:

```text
Keine Command-Funktion ändern ohne eigenen Plan.
Keine Chat-Ausgaben ändern ohne eigenen Plan.
Keine produktive Command-Ausführung ohne ausdrücklichen Go-Schritt.
Keine Upsert/Delete/Execute-Tests ohne ausdrücklichen Go-Schritt.
Keine DB-Migration ohne eigenen Plan.
Keine Funktionalität entfernen.
```

## Read-only Routen

Diese Routen dürfen für Diagnose/Dashboard-Prüfungen genutzt werden, solange sie nicht als produktiver Test missbraucht werden:

```text
GET /api/commands/status
GET /api/commands/list
GET /api/commands/catalog
GET /api/commands/logs
GET /api/commands/history
GET /api/commands/media-command-preview
```

Hinweis:

```text
/media-command-preview ist Diagnose/Preview und darf nicht als Sound-/Video-Ausführung verstanden werden.
```

## Produktive oder potenziell produktive Routen

Diese Routen dürfen nicht in automatischen Diagnose- oder Dashboard-Checks ausgelöst werden:

```text
POST /api/commands/upsert
POST /api/commands/delete
GET/POST /api/commands/execute
```

Diese Routen ändern Daten oder können echte Command-Ausführung auslösen.

## Test-/DryRun-Regel

`/api/commands/test` ist nur dann sicher, wenn es als DryRun/Testpfad verwendet wird und keine echte Ausführung triggert.

Regel:

```text
Diagnose darf parse/dryRun prüfen.
Diagnose darf Zielpayload anzeigen.
Diagnose darf keine echte Execute-Route verwenden.
Diagnose darf keine Cooldowns setzen.
Diagnose darf keine Zielmodule produktiv auslösen.
```

## Status-Endpunkt

`GET /api/commands/status` ist die bevorzugte leichte Diagnose-Route.

Analyse CAN-33.1:

```text
lightStatus: true
schemaTouchOnStatus: false
removedHeavyFields:
- commands
- moduleCatalog
- recent
```

Der Status ist damit geeignet für schnelle Dashboard-/Health-Anzeigen.

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/commands.js
```

Wichtige API-Nutzung:

```text
/api/commands/status
/api/commands/list
/api/commands/upsert
/api/commands/delete
/api/commands/test
/api/commands/execute
/api/commands/logs
/api/commands/catalog
/api/twitch/presence/status
/api/twitch/presence/start
/api/twitch/presence/stop
```

Dashboard-Tabs:

```text
Commands
Übersicht
Logs
Diagnose
```

## Sicherheitsregel für Dashboard-Diagnose

Für zukünftige Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /status, /list, /catalog, /logs, /history, /media-command-preview verwenden
- darf /test nur als DryRun/Parse-Test verwenden
- darf keine /execute Route aufrufen
- darf keine /upsert Route aufrufen
- darf keine /delete Route aufrufen
- darf keine Twitch-/Streamer.bot-/OBS-/Sound-/Queue-Aktion auslösen
```

## Beziehung zu commands_media.js

`backend/modules/commands_media.js` ist die Media-Brücke für Command-Dashboard, Medienverwaltung und Sound-System-Hub.

Sie stellt unter anderem Media-Optionen und Praxis-/Preview-Checks bereit.

Auch hier gilt:

```text
Keine Medien automatisch abspielen.
Keine Medien automatisch verschieben/löschen.
Keine produktive Sound-/Video-Ausführung durch Diagnose.
```

## Bekannte Folgeidee

Möglicher späterer kleiner Schritt:

```text
CAN-33.3 - Commands Dashboard Read-only Diagnosekarte
```

Ziel einer solchen Karte wäre nur:

```text
- Modulversion anzeigen
- Status ok/schema ok anzeigen
- Anzahl Commands anzeigen
- Anzahl Logs anzeigen
- Produktive Routen klar als gesperrt markieren
- Keine Execute-/Upsert-/Delete-Buttons
```

## Stand

```text
CAN-33.2: Doku-/Regelstand erstellt.
```
