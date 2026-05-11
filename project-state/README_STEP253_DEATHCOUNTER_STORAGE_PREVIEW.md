# STEP253 - DeathCounter Storage Preview

Dieses ZIP ist direkt nach `D:\Git\stream-control-center` entpackbar.

## Inhalt

- Backend: Read-only-Route `GET /api/deathcounter/v2/storage/preview`
- Integration-Check: zusätzlicher Check `database_storage_preview`
- Doku: project-state und docs/current aktualisiert

## Wichtig

Diese Änderung importiert keine Counts, schreibt keine DeathCounter-Storage-Daten und schaltet nicht auf DB-Storage um.

Aktiver produktiver Storage bleibt:

```text
data/deathcounter/deathcounter.v2.json
```

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?includeRows=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/preview?limit=5" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```
