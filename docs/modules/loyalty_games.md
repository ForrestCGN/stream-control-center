# Loyalty Games – STEP228 / LWG-6.9

Aktueller Stand:

- `loyalty_games.js` Version `0.2.7`
- Build `STEP_LWG_6_9_GAMBLE_DASHBOARD_WRITE_API`
- Gamble Dashboard Read/Write API vorhanden
- Schreibende Aktionen sind rollen- und confirm-geschützt
- Audit-Tabelle `loyalty_games_dashboard_audit`

## Neue Routes

- `GET /api/loyalty/games/gamble/dashboard-config`
- `POST /api/loyalty/games/gamble/dashboard-config`
- `GET /api/loyalty/games/gamble/dashboard-audit`

## Write Payload Beispiel

```json
{
  "actorLogin": "forrestcgn",
  "actorDisplayName": "ForrestCGN",
  "actorRole": "streamer",
  "confirmWrite": true,
  "reason": "Dashboard Änderung",
  "engine": {
    "enabled": true,
    "winChancePercent": 47,
    "userCooldownMs": 60000
  },
  "command": {
    "enabled": true,
    "cooldownUserMs": 60000,
    "sendResultToChat": true,
    "activationState": "dashboard"
  }
}
```
