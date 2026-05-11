# NEXT STEP - Nach STEP257 DeathCounter DB Read-Test

## Direkt testen

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeState=true&limit=20" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
publicStateMatchesJson: true
validation.errors: 0
warnings: 0
switchesStorage: false
activatesDatabaseStorage: false
activeStorage: json_state_file
```

## Naechster sinnvoller Bau-Step

```text
STEP258: DeathCounter DB-Lesehelper intern kapseln oder deaktivierte Storage-Mode-Strategie vorbereiten
```

Noch nicht blind bauen:

```text
- produktive RIP/DEL/TODE-Logik auf DB umstellen
- JSON-State deaktivieren
- /state oder /overlay produktiv aus DB lesen lassen
- Storage-Wechsel ohne getrennten Schutz-Step
```
