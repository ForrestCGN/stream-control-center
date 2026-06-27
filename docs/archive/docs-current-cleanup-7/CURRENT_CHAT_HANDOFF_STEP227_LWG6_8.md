# CURRENT CHAT HANDOFF – STEP227 / LWG-6.8

Stand: `!gamble` ist live bestätigt; STEP227 ergänzt eine read-only Dashboard-Snapshot-Route.

## Runtime-Änderung

- Datei: `backend/modules/loyalty_games.js`
- Version: `0.2.6`
- Build: `STEP_LWG_6_8_GAMBLE_DASHBOARD_READONLY_API`

Neue Route:

```text
GET /api/loyalty/games/gamble/dashboard-config
```

## Sicherheitsrahmen

- Route ist nur lesend.
- Keine Settings werden geändert.
- Kein Punktestand wird geändert.
- `!gamble` bleibt im vorherigen Zustand.
- Spätere Schreibfunktionen müssen Rollen-/Rechteprüfung und Audit-Logging erhalten.

## Nächster Schritt

STEP228 / LWG-6.9: Schreibende Dashboard-Konfiguration für Gamble planen/umsetzen, aber nur mit Admin-/Owner-Schutz und Audit.
