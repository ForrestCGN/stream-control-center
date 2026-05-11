# NEXT STEP - Nach STEP253 DeathCounter Storage Preview

## Direkt testen

Backend neu starten und pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?includeRows=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?limit=5" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
- storage/preview liefert action = storage_preview
- readOnly = true
- writesDatabase = false
- importsCounts = false
- switchesStorage = false
- activeStorage = json_state_file
- integration-check enthaelt database_storage_preview = ok
```

## Nächster sinnvoller Bau-Step

```text
STEP254: DeathCounter Storage-Preview im Dashboard anzeigen oder Export-/Diff-Validierung ohne Schreiben erweitern
```

Noch nicht blind bauen:

```text
- JSON-State durch DB ersetzen
- Count-Schreiblogik auf DB umstellen
- produktiven Import-Button bauen
- app.sqlite neu bauen oder überschreiben
- alte Count-Logik entfernen
- Overlay-Design auf neues CGN-Design migrieren
```
