Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Forrest arbeitet mit `go`, `ok`, `weiter`.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten.
Erst die Startdateien wirklich aus GitHub/dev lesen, dann Plan nennen, dann auf mein explizites `go` warten.

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
backend/modules/remote_agent.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
```

Aktueller Stand:

```text
0.2.18D - OBS-Inventar read-only ueber obs_shared vorbereitet
```

Wichtig:

```text
remote_agent 0.1.5D liest OBS_WS_URL / OBS_WS_PASSWORD aus .env. Das OBS-Inventar wird read-only ueber die bestehende obs_shared-Verbindung gelesen.
OBS_WS_URL=ws://127.0.0.1:4455 aktiviert lokalen read-only Inventar-Read automatisch.
Diagnose: /api/remote-agent/obs/inventory/status.
Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
```
