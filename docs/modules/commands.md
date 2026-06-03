# Commands-Modul

Stand: 2026-06-03 12:00

## Zweck

Das Modul `commands` ist das zentrale Chat-Command-System im `stream-control-center`.

Es verwaltet konfigurierbare Chat-Commands, Aliase, Zielmodule, Berechtigungen, Cooldowns, Tests, Ausführung und Ausführungslogs.

## Modulstand

- Backend-Datei: `backend/modules/commands.js`
- Modulname: `commands`
- Modulversion: `0.1.7`
- Build: `channel-guard-diagnostics`
- Kategorie: `commands`
- Statusroute: `GET /api/commands/status`
- Registry-Key: `commands`

## Wichtige Tabellen

Das Modul nutzt die produktive SQLite-Datenbank und legt seine Tabellen sanft an.

Tabellen:

- `command_definitions`
- `command_execution_log`

Wichtig:

- Produktive DB nicht ersetzen.
- Keine Daten löschen.
- Schemaänderungen nur sanft per Migration.

## Wichtige API-Routen

| Methode | Route | Zweck |
| --- | --- | --- |
| GET | `/api/commands/status` | Schneller Status ohne schwere Listen/Kataloge/Logs |
| GET | `/api/commands/list` | Alle konfigurierten Commands auflisten |
| GET | `/api/commands/catalog` | Modul-Command-Katalog für Dashboard-Dropdowns |
| POST | `/api/commands/upsert` | Command anlegen oder aktualisieren |
| POST | `/api/commands/delete` | Command löschen |
| GET/POST | `/api/commands/test` | Chatnachricht trocken parsen und Zielpayload anzeigen |
| GET/POST | `/api/commands/execute` | Chatnachricht als Command ausführen |
| GET | `/api/commands/media-command-preview` | Preview für Media-Command-Routing und Payload |
| GET | `/api/commands/logs` | Letzte Command-Ausführungen anzeigen |
| GET | `/api/commands/history` | Alias für `/api/commands/logs` |

## Diagnose-Standard

CAN-43.2 bestätigt:

- Statusroute vorhanden.
- Standardfelder vorhanden.
- `diagnostics`-Block vorhanden.
- Registry-Eintrag vorhanden.
- Coverage sauber.
- Keine neue Dashboard-Diagnose-Extra-Datei nötig.

Bestätigte Live-Werte:

```text
ok=True
module=commands
moduleVersion=0.1.7
moduleBuild=channel-guard-diagnostics
enabled=True
initialized=True
schemaOk=True
health=ok
schemaVersion=2
schemaReady=True
```

Registry-Coverage:

```text
ok=True
missingLoadedModules=0
registryOnlyEntries=0
```

## Dashboard / Erweiterungen

Für `commands` existieren bewusst behaltene Read-only-Diagnose-Dateien:

- `htdocs/dashboard/modules/commands_readonly_diagnostics.js`
- `htdocs/dashboard/modules/commands_readonly_diagnostics.css`

Diese Dateien wurden in CAN-42.35 bewusst behalten und dürfen nicht blind entfernt werden.

## Aktuelle Live-Counts aus CAN-43.2

```text
commands       : 18
catalogGroups  : 7
catalogActions : 24
logs           : 1177
handled        : 0
ignored        : 0
executed       : 0
failed         : 0
cooldowns      : 0
```

## Standardtests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,enabled,initialized,schemaOk,schemaError
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
$s.routes | Select-Object method,path,purpose | Format-Table -AutoSize
```

Registry-Test:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

## Änderungsregeln

Bei künftigen Änderungen an `commands`:

- Vollständige echte Datei aus GitHub/dev prüfen.
- Keine Funktionalität entfernen.
- Keine bestehenden Command-Flows ungeprüft ändern.
- Produktive DB nicht überschreiben.
- Modulversion nur bei echter Codeänderung erhöhen.
- Statusroute und `diagnostics`-Block nach Änderung erneut testen.
- Registry-Coverage erneut testen.
- Diese Doku und project-state aktualisieren.
