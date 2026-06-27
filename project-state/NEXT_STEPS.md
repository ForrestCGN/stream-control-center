# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.9 - Dashboard-v2 Navigation angeglichen`:

```text
0.2.10 - Stream-PC Status read-only vorbereitet
```

Ziel:

1. Vorhandenen Menuepunkt `System -> Stream-PC` aktivieren.
2. Ausschliesslich bestehende GET-Routen verwenden: `/api/_status`, `/api/stream-status/current`, `/api/diag/ws`.
3. Server-, Modul-, Routen-, WebSocket- und gecachten Streamstatus anzeigen.
4. Keine Refresh-, Test-, Log-, Session- oder Schreibroute aufrufen.
5. Keine Buttons, Actions oder Steuerfunktionen aktivieren.
6. `/dashboard` stabil lassen.

Pflicht-Pruefdateien:

```text
backend/server.js
backend/modules/stream_status.js
backend/modules/diagnostics.js
frontend/dashboard-v2/src/services/apiClient.js
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/
frontend/dashboard-v2/src/modules/
```

Wenn vorhanden zusaetzlich:

```text
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/diagnostics.js
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
project-state/PARKED_TODOS.md
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
```

Diese Idee bleibt geparkt. Erst lokale Read-only-Module sauber migrieren.
