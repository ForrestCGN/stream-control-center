# Prompt fuer neuen Chat - RDAP Remote-Modboard weiterarbeiten

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Forrest arbeitet mit `go`, `ok`, `weiter`.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten. Erst echte Dateien lesen, dann Plan nennen, dann auf explizites `go` warten.

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
project-state/PARKED_TODOS.md
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

Aktueller Stand:

```text
0.2.25 - Media Local Inventory Readonly ist getestet und auf GitHub/dev.
0.2.26 - Runtime Profile / Module / Permission Standard Docs dokumentiert Architekturregeln.
OBS ist geparkt bei 0.2.22E.
Media ist aktueller fachlicher Fokus.
```

Harte Architekturregeln:

```text
1. Eine UI, zwei Runtime-Profile.
2. Remote-Modboard UI ist einzige UI-Wahrheit.
3. Lokales dashboard-v2 ist dieselbe UI mit runtimeMode=local.
4. Online ist dieselbe UI mit runtimeMode=online.
5. Module sind fachlich, nicht technisch.
6. Sync/Agent/Cache sind Infrastruktur, keine Navigationsmodule.
7. Gleiche Funktionen bleiben im gleichen Modul.
8. Jede Funktion wird mit User-/Rollen-/Permission-Modell geplant.
9. Keine Write-Funktion ohne Backend-Permission, Confirm, Audit, Lock/Readback wenn noetig.
```

Datenklassen:

```text
realtimePush:
  kleine Live-Zustaende, z.B. OBS aktuelle Szene, Sound current/queue, Agent online/offline.

pullOnDemand:
  Detaildaten und Listen bei Seitenaufruf/Reload/Filter.

slowSync:
  Inventare und Statusdaten, die regelmaessig aber nicht in Echtzeit gebraucht werden.
```

Media-Ziel:

```text
Media bleibt ein fachliches Modul.
Lokal liest Media direkt read-only.
Online bekommt Media spaeter per Agent-WSS Slow-Sync memory-only.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine Uploads/Deletes/Edits.
```

Sicherheitsgrenzen:

```text
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine DB-Migration ohne separaten Step.
Keine Agent-Actions ohne separaten Step.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade anzeigen.
Keine Secrets ausgeben.
```

Naechster sinnvoller Schritt:

```text
RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY
```

Vor Planung/Code echte Dateien aus GitHub/dev lesen, besonders Agent-Runtime, Remote-Agent und Media-Route. Danach Plan nennen und auf `go` warten.
