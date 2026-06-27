# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.8 - Dashboard-v2 Einstieg vorbereitet`:

```text
0.2.9 - Erstes lokales Read-only-Modul vorbereitet
```

Ziel:

1. Bestehende lokale Status- und Diagnosefunktionen in Backend und altem Dashboard lesen.
2. Ein risikoarmes erstes Modul auswaehlen, bevorzugt System-/Stream-PC-Status.
3. Vorhandene APIs und Datenmodelle verwenden; keine parallelen Statuswege bauen.
4. Nur vorhandene Daten anzeigen.
5. Keine Actions, Writes oder Steuerfunktionen aktivieren.
6. `/dashboard` stabil lassen.

Pflicht-Pruefdateien:

```text
backend/server.js
backend/modules/stream_status.js
backend/modules/live_status_monitor.js
backend/modules/diagnostics.js
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/diagnostics.js
frontend/dashboard-v2/src/services/
frontend/dashboard-v2/src/modules/
```

Wenn vorhanden zusaetzlich:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
project-state/PARKED_TODOS.md
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
```

Diese Idee bleibt geparkt. Erst lokale Read-only-Module sauber migrieren.
