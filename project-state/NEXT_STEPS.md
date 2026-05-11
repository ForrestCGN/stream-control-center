# NEXT STEP - Nach STEP256 DeathCounter Storage Consistency Check

## Direkt testen

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung nach erfolgreichem STEP255-Import:

```text
consistent: true
errors: 0
warnings: 0
activeStorage: json_state_file
writesDatabase: false
switchesStorage: false
```

## Naechster sinnvoller Bau-Step

```text
STEP257: DeathCounter DB-Read-Preview / DB-State-Vorschau ohne produktive Umschaltung
```

Ziel waere: Aus den importierten DB-Tabellen denselben Public-State bauen, den Overlay/Dashboard aktuell aus JSON bekommen wuerden, aber weiterhin nur als Vorschau-Route.

Noch nicht blind bauen:

```text
- produktive RIP/DEL/TODE-Logik auf DB umstellen
- JSON-State deaktivieren
- Storage-Wechsel ohne getrennten STEP
- app.sqlite neu bauen oder ersetzen
```
