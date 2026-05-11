# STEP254 - DeathCounter Storage Validation

Dieses ZIP ist direkt nach `D:\Git\stream-control-center` entpackbar.

## Inhalt

```text
backend/modules/deathcounter_v2.js
project-state/STEP254_DEATHCOUNTER_STORAGE_VALIDATION_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
```

## Abschluss nach Entpacken

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP254 deathcounter storage validation"
```

## Live-Test

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Sicherheitsrahmen

STEP254 ist nur Readiness-Validation. Keine DB-Schreiboperation, kein Count-Import und kein Storage-Wechsel.
