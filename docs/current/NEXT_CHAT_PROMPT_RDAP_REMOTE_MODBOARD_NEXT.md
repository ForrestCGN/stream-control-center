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
backend/modules/obs_shared.js
backend/modules/local_remote_modboard_adapter.js
backend/modules/obs_live_status.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
remote-modboard/backend/public/assets/modules/system/obs.js
```

Aktueller Stand:

```text
0.2.20 - Agent OBS Live-State read-only vorbereitet
```

Wichtig:

```text
Inventar langsam, Bedienstatus schnell.
Stream-PC pusht OBS-Live-State read-only ueber bestehende Agent-WSS-Verbindung.
Online-Endpunkt: /api/remote/agent/obs/live/status.
Lokal bleibt: /api/remote-agent/obs/live/status.
Live-State ist Memory-only, streng sanitisiert, keine Commands, keine Actions, keine Secrets.
Produktive OBS-Szenen sind Szenen ohne fuehrenden `_`.
Interne `_`-Szenen gehoeren nicht in die normale Mod-Bedienflaeche.
OBS-Seite ist als spaetere Mod-Bedienung ausgerichtet, aber aktuell read-only.
Rollen-/Rechte-Zielbild: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility, obs.admin.diagnostics.
Technik/Diagnose soll spaeter in Admin / Diagnose, nicht in die normale OBS-Mod-Seite.
Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
```

Naechster sinnvoller Step:

```text
0.2.21 - OBS Allowlist-/Rechte-Modell read-only planen/vorbereiten, noch ohne echte OBS-Actions.
```
