# STEP196 Status Note - Alert DB-Settings Vorrang

Stand: 2026-05-08

Dieser Hinweis ergaenzt den aktuellen Projektstand, ohne historische Analyse-Snapshots zu ersetzen.

## Ergebnis

Mit STEP196 wird das Alert-System so angepasst, dass DB-Settings aus `alert_settings` fuer die Runtime Vorrang vor JSON-Fallbacks bekommen.

Wichtiger Fix:

```text
alert_settings key livealert -> Runtime config liveAlert
```

Damit kann `livealert.soundSystemEnabled=true` aus der DB die aktive Runtime-Config setzen, obwohl `config/alert_system.json` weiterhin als Fallback `liveAlert.soundSystemEnabled=false` enthaelt.

## Betroffene Datei

- `backend/modules/alert_system.js`

## Fachregel

```text
Dashboard-faehige Settings gehoeren langfristig in die DB.
JSON bleibt Seed/Fallback/technische Boot-Konfiguration.
Wenn ein DB-Setting existiert, muss es den JSON-Fallback ueberschreiben.
```

## Live-Test nach Deploy

- `/api/alerts/reload`
- `/api/alerts/config`
- `/api/alerts/integration-check`
- Twitch-Follow-Test ueber `/api/alerts/twitch/follow`
