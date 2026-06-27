# CAN-44.13.2 AutoShoutout Clear Target Parameter Fix

## Ziel
Hotfix für den Endpoint:

- `POST /api/clip-shoutout/auto/clear-target`

## Problem
Beim Aufruf konnte SQLite/DB melden:

```text
Unknown named parameter 'now'
```

Grund: Einige DELETE-Statements bekamen Parameter wie `now`/`reason`, obwohl diese Platzhalter im jeweiligen SQL nicht verwendet wurden. Je nach DB-Wrapper wird das als Fehler abgewiesen.

## Änderung
- `clearAutoShoutoutTarget()` trennt jetzt Query-Parameter sauber:
  - `params` für SELECT/DELETE
  - `updateParams` für UPDATE-Statements mit `:now`/`:reason`
  - `activityParams` für Activity-Clear ohne überflüssige Parameter
- Modulversion auf `0.2.24` erhöht.

## Betroffene Datei
- `backend/modules/clip_shoutout.js`

## Test
```powershell
node -c backend\modules\clip_shoutout.js
```

Nach Deployment/Node-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","reason":"test_clear_before_stream"}' |
  ConvertTo-Json -Depth 8
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 10
```

Erwartung: FadJoe ist nicht mehr durch den Test-Trigger blockiert.
