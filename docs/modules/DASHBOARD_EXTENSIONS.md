# Dashboard Extensions

## Zweck

Diese Datei dokumentiert Dashboard-Erweiterungsdateien, die bewusst weiterhin separat geladen werden.

Wichtig: Neue Module sollen nicht automatisch weitere `*_diagnostics_ext.*` oder `*_readonly_diagnostics.*` Dateien bekommen. Diagnose für neue Module läuft standardmäßig über:

1. Modul-Statusroute mit `diagnostics`-Block
2. `/api/diagnostics/registry`
3. zentrale Dashboard-Diagnose `htdocs/dashboard/modules/diagnostics.js`
4. Registry-Coverage-Test

## Zentrale Diagnose

Kernstruktur:

- `htdocs/dashboard/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.css`
- Backend-Registry: `GET /api/diagnostics/registry`

## Bewusst behaltene Extensions

### Commands Read-only Diagnose

Dateien:

- `htdocs/dashboard/modules/commands_readonly_diagnostics.css`
- `htdocs/dashboard/modules/commands_readonly_diagnostics.js`

Zweck:

- zusätzliche Read-only-Karte im Commands-Diagnose-Tab
- zeigt erlaubte GET-Routen und produktiv gesperrte Routen
- löst keine Command-Ausführung, kein Upsert und kein Delete aus

Status:

- behalten
- späterer Integrationskandidat in `commands.js`

### Hug erweiterte Read-only-Diagnose

Dateien:

- `htdocs/dashboard/modules/hug_diagnostics_ext.css`
- `htdocs/dashboard/modules/hug_diagnostics_ext.js`

Zweck:

- erweiterte Diagnose im Hug-Diagnose-Tab
- zeigt DB-, Text-, Tabellen-, Statistik- und Routenstatus
- nutzt Read-only-/GET-Endpunkte
- löst keinen Hug/Rehug, keinen Reload und keine Chat-Ausgabe aus

Status:

- behalten
- späterer Integrationskandidat in `hug.js`

### Message-Rotator erweiterte Read-only-Diagnose

Dateien:

- `htdocs/dashboard/modules/message_rotator_diagnostics_ext.css`
- `htdocs/dashboard/modules/message_rotator_diagnostics_ext.js`

Zweck:

- erweiterte Diagnose im Message-Rotator-Diagnose-Tab
- zeigt Runtime, Konfiguration, Textsystem, Samples und Routen-Sicherheit
- blockiert produktive Aktionen wie Start/Stop/Tick/Manual/Reload/Admin-POST in der Anzeige

Status:

- behalten
- späterer Integrationskandidat in `message_rotator.js`

### Bus-Diagnose Read-only Summary

Dateien:

- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css`
- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js`

Zweck:

- Sicherheits-/Read-only-Zusammenfassung in der Bus-Diagnose
- prüft sichtbar, ob Flow, Queue, Sound, Overlay oder Recovery produktiv berührt wurden
- nutzt Status und Recovery-Preflight nur lesend

Status:

- behalten
- safety-relevant
- vorerst nicht integrieren

### Bus-Diagnose Subpage Safety

Dateien:

- `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css`
- `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js`

Zweck:

- Safety-Hinweise auf Bus-Diagnose-Unterseiten
- markiert manuelle Diagnoseaktionen
- zeigt Hinweise für Recovery und Sound-Bus-Dry-Run
- löst keine Recovery automatisch aus

Status:

- behalten
- safety-relevant
- vorerst nicht integrieren

### Overlay-Monitor Safety

Dateien:

- `htdocs/dashboard/modules/overlay_monitor_safety_ext.css`
- `htdocs/dashboard/modules/overlay_monitor_safety_ext.js`

Zweck:

- Safety-Hinweise im Overlay-Monitor
- markiert manuelle OBS-/Inventory-/Repair-Aktionen
- stellt klar, dass Reparatur-/Refresh-Aktionen nur manuell ausgelöst werden

Status:

- behalten
- safety-relevant
- Integration in `overlays.js` später möglich, aber nicht priorisiert

## Regel für neue Module

Bei neuen Modulen immer prüfen:

- Braucht das Modul eine Statusroute?
- Enthält die Statusroute einen standardisierten `diagnostics`-Block?
- Ist das Modul in `/api/diagnostics/registry` eingetragen, falls diagnosefähig?
- Bleibt Registry-Coverage grün?
- Wird keine neue Diagnose-Extra-Datei angelegt?
- Wurde Modul-Doku aktualisiert?
- Wurde `project-state` aktualisiert?

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

Erwartung:

```text
ok                   : True
missingLoadedModules : 0
registryOnlyEntries  : 0
```
