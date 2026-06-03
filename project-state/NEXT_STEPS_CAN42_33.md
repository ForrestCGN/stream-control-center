# NEXT STEPS CAN-42.33

## Status

CAN-42.33 inventarisiert die aktuell noch aktiv in `htdocs/dashboard/index.html` geladenen Dashboard-Erweiterungsdateien.

## Nächster empfohlener Schritt

CAN-42.34: Geladene Extension-Dateien einzeln prüfen.

Reihenfolge:

1. `commands_readonly_diagnostics.*`
2. `hug_diagnostics_ext.*`
3. `message_rotator_diagnostics_ext.*`
4. `bus_diagnostics_readonly_summary.*`
5. `bus_diagnostics_subpage_safety_ext.*`
6. `overlay_monitor_safety_ext.*`

## Wichtige Regel

Nichts blind löschen.

Erst prüfen, ob die jeweilige Datei:
- noch geladen wird,
- noch Funktionen registriert,
- von Hauptmodul-Dateien erwartet wird,
- sicherheits-/readonly-relevante Anzeige liefert,
- in Hauptmodul-Dateien integriert werden kann.

## Test nach jedem späteren Cleanup

```powershell
node -c htdocs\dashboard\modules\diagnostics.js
node -c htdocs\dashboard\modules\<betroffene_datei>.js
```

Dashboard hart neu laden:

```text
STRG + F5
```

Zusätzlich Registry-Coverage prüfen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
```
