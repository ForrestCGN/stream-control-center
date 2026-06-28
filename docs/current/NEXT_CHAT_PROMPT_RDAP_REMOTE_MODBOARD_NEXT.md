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
remote-modboard/backend/public/assets/modules/system/obs.js
```

Aktueller Stand:

```text
0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet
```

Wichtig:

```text
Produktive OBS-Szenen sind Szenen ohne fuehrenden Unterstrich `_`.
Interne `_`-Szenen gehoeren nicht in die normale Mod-Bedienflaeche.
OBS-Seite ist als spaetere Mod-Bedienung ausgerichtet, aber aktuell read-only.
Rollen-/Rechte-Zielbild: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility, obs.admin.diagnostics.
Technik/Diagnose soll spaeter in Admin / Diagnose, nicht in die normale OBS-Mod-Seite.
Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
```

Naechster sinnvoller Step:

```text
0.2.20 - OBS Allowlist-/Rechte-Modell read-only vorbereiten, noch ohne echte OBS-Actions.
```
