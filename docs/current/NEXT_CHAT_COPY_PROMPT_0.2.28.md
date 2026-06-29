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
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

Aktueller Stand:

```text
0.2.27B ist getestet: Media-Agent-Sync bleibt verbunden, keine Rejects, Online-Inventar aktiv.
0.2.28 polisht Status/UI fuer Agent-Sync, kompakte Liste, memory-only, keine Server-Persistenz.
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

Media-Entscheidung:

```text
Lokal bleibt Master/Wahrheit fuer echte produktive Media-Dateien.
Online zeigt aktuell nur read-only Agent-Memory-Index.
Server-Persistenz fuer Media-Index ist sinnvoll, aber separater Step.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine Uploads/Deletes/Edits.
```

Naechster sinnvoller Schritt:

```text
RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN
```

Nicht direkt bauen:

```text
Keine DB-Migration ohne separaten bestaetigten Step.
Keine bidirektionale Datei-Synchronisation.
Keine Upload/Edit/Delete-Funktionen.
Keine Agent-Apply-Queue ohne Permission/Confirm/Audit/Conflict-Plan.
```

Standard-Arbeitsweise:

```text
Wenn GitHub/dev ueber Connector abgeschnitten/unvollstaendig ist:
- erst Source-Sammel-Script liefern
- Source-ZIP vom Nutzer abwarten
- daraus echten Install-Step-ZIP mit Zielpfaden bauen

Check-Ausgaben kurz halten:
- Webserver: curl + jq mit ausgewaehlten Feldern
- Windows lokal: Invoke-RestMethod + pscustomobject
- volles JSON nur bei Fehlerdiagnose
```
