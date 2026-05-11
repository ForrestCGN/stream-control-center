# NEXT STEP - Nach STEP254 DeathCounter Storage Validation

## Direkt testen

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
readyForImport: true
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
```

## Naechster sinnvoller Bau-Step

```text
STEP255: DeathCounter Import-Plan / Backup- und Rollback-Konzept dokumentieren
```

Noch nicht blind bauen:

```text
- echten Import ausfuehren
- JSON-State durch DB ersetzen
- produktive RIP/DEL/TODE-Logik auf DB umstellen
- app.sqlite neu bauen oder ueberschreiben
```
