# STEP258 DeathCounter Active Database Storage

Dieses ZIP stellt DeathCounter V2 auf aktive DB-Nutzung um.

## Wichtig

- ZIP nach `D:\Git\stream-control-center` entpacken.
- Danach Standardabschluss ausfuehren:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP258 deathcounter active database storage"
```

## Live-Tests

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Erwartung

```text
activeStorage: database
configuredStorage: database
fallbackStorage: json_state_file
dualWriteEnabled: true
jsonFallbackEnabled: true
active_database_storage.ok: true
```

## Bewusst nicht enthalten

- kein optionaler Storage-Schalter
- keine Dashboard-Aenderung
- keine Overlay-Aenderung
- keine Streamer.bot-Aenderung
- kein Entfernen der JSON-Datei
