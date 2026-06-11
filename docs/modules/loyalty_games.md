# loyalty_games.js – STEP227 / LWG-6.8

Neue Version:

```text
0.2.6 / STEP_LWG_6_8_GAMBLE_DASHBOARD_READONLY_API
```

Neue Route:

```text
GET /api/loyalty/games/gamble/dashboard-config
```

Die Route bündelt für das spätere Dashboard:

- Gamble-Status
- Engine-Konfiguration
- `!gamble` Command-Snapshot
- Settings-Felder
- Textkeys
- relevante Endpunkte
- Safety-Hinweise

Die Route ist bewusst `readOnly=true`.
