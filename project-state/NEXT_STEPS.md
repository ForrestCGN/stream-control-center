# NEXT STEP - Nach STEP255 DeathCounter Guarded Storage Import

## Direkt testen

Vor dem Import:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
```

Import ausfuehren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/deathcounter/v2/storage/import?confirm=IMPORT_DEATHCOUNTER_V2" | ConvertTo-Json -Depth 30
```

Nach dem Import pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
```

Erwartung nach erfolgreichem Import:

```text
activeStorage: json_state_file
switchesStorage: false
writesDatabase: true nur beim Import-Endpunkt
deathcounter_players rowCount > 0
deathcounter_games rowCount > 0
deathcounter_counts rowCount > 0
deathcounter_overlay_state rowCount > 0
deathcounter_events rowCount = 0
```

## Naechster sinnvoller Bau-Step

```text
STEP256: DeathCounter DB-Import-Livecheck und optional DB-Read-Preview gegen importierte Tabellen
```

Noch nicht blind bauen:

```text
- produktive RIP/DEL/TODE-Logik auf DB umstellen
- JSON-State deaktivieren
- Storage-Wechsel ohne getrennten STEP
- app.sqlite neu bauen oder ersetzen
```
