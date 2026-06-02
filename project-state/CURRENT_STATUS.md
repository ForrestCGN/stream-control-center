# CURRENT_STATUS

## Stand: CAN-33.2 vorbereitet

CAN-33.2 ergänzt eine dedizierte Commands-Modul-Doku mit Read-only-/Produktiv-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-33: Commands-Modul Status/Doku/Diagnose prüfen und glätten
```

## Ergebnis CAN-33.1 Analyse

Das Commands-Modul ist grundsätzlich sauber aufgestellt:

```text
backend/modules/commands.js
MODULE_NAME = commands
MODULE_VERSION = 0.1.6
MODULE_BUILD = channel-guard
API_PREFIX = /api/commands
```

Vorhanden:

```text
MODULE_META
MODULE_VERSION Export
getStatus/statusPayload
Routenliste via buildRoutes()
Dashboard-Anbindung
DryRun/Testpfad
Execution-Log
```

Nicht vorhanden war bisher:

```text
docs/modules/commands.md
```

## Änderung CAN-33.2

Neu:

```text
docs/modules/commands.md
```

Darin festgehalten:

```text
- Modulzweck
- Backend-Routen
- Dashboard-Routen
- Status-Endpunkt
- DryRun/Test vs Execute
- Read-only Routen
- Produktive Routen
- Sicherheitsregeln für spätere Diagnosekarten
```

## Wichtigste Sicherheitsentscheidung

Read-only Diagnose darf nur lesende bzw. sichere Diagnose-Endpunkte nutzen:

```text
GET /api/commands/status
GET /api/commands/list
GET /api/commands/catalog
GET /api/commands/logs
GET /api/commands/history
GET /api/commands/media-command-preview
```

Nicht automatisch verwenden:

```text
POST /api/commands/upsert
POST /api/commands/delete
GET/POST /api/commands/execute
```

`/api/commands/test` nur als DryRun/Parse-Test.

## Nicht geändert

```text
Keine Codeänderung.
Keine Command-Funktion geändert.
Keine Chat-Ausgaben geändert.
Keine Twitch-/Streamer.bot-Aktion.
Keine DB-Migration.
Keine produktiven Buttons.
Keine Execute-/Upsert-/Delete-Tests.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-33.2 anwenden.
Danach optional CAN-33.3 Commands Dashboard Read-only Diagnosekarte planen.
```
