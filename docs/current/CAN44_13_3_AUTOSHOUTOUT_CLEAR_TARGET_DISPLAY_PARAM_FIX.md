# CAN-44.13.3 AutoShoutout Clear Target Display-Param Fix

## Ziel
Fix für `/api/clip-shoutout/auto/clear-target`, nachdem der Aufruf mit `Unknown named parameter 'displayId0'` abgebrochen ist.

## Ursache
Beim Löschen aus `clip_shoutout_official_history` wurden die Parameter der Display-Queue-IDs aus dem vorherigen SQL-Statement wiederverwendet. Das SQL für die History nutzt aber eigene Platzhalter (`histDisplayId0`, ...). Dadurch wurde ein nicht verwendeter Parameter (`displayId0`) an das Statement übergeben.

## Änderung
- Separate Parameterliste für History-Display-IDs (`historyDisplayIdParams`).
- Separate SQL-Erweiterung `historyDisplayIdSql`.
- Keine fremden `displayId*`-Parameter mehr im History-DELETE.
- Modulversion: `0.2.24`.

## Dateien
- `backend/modules/clip_shoutout.js`

## Test
```powershell
node -c backend\modules\clip_shoutout.js

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","reason":"test_clear_before_stream"}' |
  ConvertTo-Json -Depth 8
```

## Erwartung
Der Endpoint gibt `ok: true` zurück und setzt/löscht nur den AutoShoutout-Teststatus für den angegebenen Login.
