# STEP256 - DeathCounter Storage Consistency Check

Dieses ZIP ist direkt nach `D:\Git\stream-control-center` entpackbar.

## Inhalt

```text
backend/modules/deathcounter_v2.js
project-state/STEP256_DEATHCOUNTER_STORAGE_CONSISTENCY_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
```

## Neue Route

```text
GET /api/deathcounter/v2/storage/consistency
```

## Test nach Deploy

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Erwartung

Nach erfolgreichem STEP255-Import:

```text
consistent: true
validation.errors: 0
validation.warnings: 0
activeStorage: json_state_file
writesDatabase: false
switchesStorage: false
```

## Abschluss

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP256 deathcounter storage consistency check"
```
