# Diagnose-/Registry-Regeln für neue Module

Stand: CAN-42.32 / 2026-06-03

## Ziel

Neue Module sollen nicht mehr nachträglich in Dashboard-Diagnosen geflickt werden. Diagnose, Status und Registry werden direkt beim Moduldesign berücksichtigt.

## Pflicht bei neuen Backend-Modulen

### 1. Statusroute prüfen

Bevor Code umgesetzt wird, klären:

- Braucht das Modul eine Statusroute?
- Ist es fachlich diagnosefähig?
- Ist es nur Helper/Bridge/technisches Modul ohne eigene Diagnose?

Bevorzugter Standard:

```text
GET /api/<modul>/status
```

### 2. Standardfelder im Status

Wenn eine Statusroute existiert, soll sie soweit passend liefern:

```text
ok
module
moduleVersion
moduleBuild
version
enabled
routeCount
routes
dataEndpoints
diagnostics
```

### 3. Standard-`diagnostics`-Block

Der Block soll, soweit sinnvoll, enthalten:

```text
diagnostics.ok
diagnostics.health
diagnostics.module
diagnostics.version
diagnostics.build
diagnostics.schemaVersion
diagnostics.schemaReady
diagnostics.lastError
diagnostics.counts
diagnostics.database
diagnostics.state
diagnostics.queue
diagnostics.runtime
diagnostics.warnings
diagnostics.errors
```

Nicht jedes Modul braucht alle Unterbereiche. Leere oder nicht passende Bereiche dürfen fehlen, aber der Aufbau soll konsistent bleiben.

### 4. Registry-Eintrag

Diagnosefähige Module müssen in der Registry auftauchen:

```text
GET /api/diagnostics/registry
```

Pflichtfelder je Eintrag:

```text
key
label
group
status
```

Beispiel:

```json
{
  "key": "example",
  "label": "Example",
  "group": "system",
  "status": "/api/example/status"
}
```

### 5. Coverage-Test

Nach Registry-Änderungen muss geprüft werden:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

Erwartung:

```text
ok = True
missingLoadedModules = 0
registryOnlyEntries = 0
```

### 6. Dashboard-Regel

Keine neuen Dateien wie:

```text
*_readonly_diagnostics.js
*_readonly_diagnostics.css
*_diagnostics_ext.js
*_diagnostics_ext.css
```

Ausnahmen nur nach ausdrücklicher Planung und `go`.

Die zentrale Diagnose bleibt:

```text
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
```

### 7. Doku-Pflicht

Bei neuen Modulen aktualisieren:

```text
docs/modules/[modul].md
docs/modules/README.md oder Modulübersicht
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Bei Chatwechsel zusätzlich:

```text
docs/current/CURRENT_CHAT_HANDOFF_*.md
```
