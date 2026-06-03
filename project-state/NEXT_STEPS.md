# Next Steps

## Aktueller Stand

CAN-42.32 dokumentiert den bereinigten Diagnose-/Registry-Stand und legt verbindliche Regeln für neue Module fest.

## Nächster sinnvoller Schritt

CAN-42.33: Nächstes Modul bzw. nächste geplante Funktion nur nach New-Module-Check beginnen.

Vor Umsetzung neuer Module immer prüfen:

1. Gibt es bereits ein Modul / eine vorhandene Datei im Repo?
2. Braucht das Modul eine Statusroute?
3. Ist es diagnosefähig und gehört es in `/api/diagnostics/registry`?
4. Kann es den Standard-`diagnostics`-Block liefern?
5. Wird die Registry-Coverage danach weiterhin `ok = true`?
6. Welche Doku-Dateien müssen gleichzeitig aktualisiert werden?

## Testpflicht bei neuen Diagnosemodulen

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
