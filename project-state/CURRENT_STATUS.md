# CURRENT_STATUS

## Stand: CAN-34.2 vorbereitet

CAN-34.2 ergänzt eine dedizierte Todo-Modul-Doku mit Read-only-/Write-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-34: Todo-Modul Status/Doku/Diagnose prüfen und glätten
```

## Ergebnis CAN-34.1 Analyse

Das Todo-Modul ist technisch schon weit aufgestellt:

```text
backend/modules/todo.js
MODULE_NAME = todo
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 1
routesPrefix = /api/todo, /todo, /discord/todo
```

Vorhanden:

```text
MODULE_META
buildStatus()
/api/todo/status
/api/todo/routes
/api/todo/integration-check
read-only Integration-Check
Dashboard-Anbindung
DB-Settings
DB-Textvarianten
Statistiken
```

Nicht vorhanden war bisher:

```text
docs/modules/todo.md
```

## Änderung CAN-34.2

Neu:

```text
docs/modules/todo.md
```

Darin festgehalten:

```text
- Modulzweck
- MODULE_META / Version / Routenprefix
- Status-Endpunkt
- Read-only Routen
- produktive/schreibende Routen
- Dashboard-Schreibfunktionen
- Integration-Check als sichere Diagnose
- Regeln für spätere Todo-Diagnosekarten
```

## Wichtigste Sicherheitsentscheidung

Read-only Diagnose darf nutzen:

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

Nicht automatisch verwenden:

```text
GET/POST /api/todo/add
GET/POST /discord/todo
GET/POST /api/todo/reload
POST /api/todo/admin/settings
POST /api/todo/admin/texts
```

## Nicht geändert

```text
Keine Codeänderung.
Keine Todo-Funktion geändert.
Keine Todo-Einträge erstellt/geändert/gelöscht.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert/gelöscht.
Kein Reload ausgelöst.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Twitch-/Streamer.bot-Aktion.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-34.2 anwenden.
Danach optional CAN-34.3 Todo Dashboard Read-only Diagnosekarte planen.
```
