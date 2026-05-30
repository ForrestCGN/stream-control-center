# STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD

## Ziel

Lokale Reward-CRUD-Grundlage für das Kanalpunkte-System.

## Dateien

- `backend/modules/channelpoints.js`
- `docs/modules/channelpoints-deep-dive.md`
- Projektstatus-/Doku-Dateien

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/categories"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards"
```

Beispiel Create:

```powershell
$body = @{ reward_key='test_reward'; title='Test Reward'; cost=100; category_key='general'; action_type='manual' } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards" -Method Post -ContentType "application/json" -Body $body
```

## Sicherheit

Keine Twitch-Schreibaktionen. Deaktivieren ist lokal-only.
