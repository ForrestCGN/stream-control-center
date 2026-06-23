# CURRENT STATUS

Stand: RDAP3A-FIX1 / DASHUI7 Stream-PC Verbindung UI-Begriffe korrigiert  
Datum: 2026-06-23

## Aktueller Dashboard-v2-Stand

Dashboard-v2 läuft lokal:

```text
http://127.0.0.1:8080/dashboard-v2/
```

Altes Dashboard bleibt produktiv:

```text
http://127.0.0.1:8080/dashboard/
```

Technische Basis:

```text
frontend/dashboard-v2/
React + Vite
```

Build-Output:

```text
htdocs/dashboard-v2/
```

## RDAP3A / DASHUI7

RDAP3A ergänzt die erste echte read-only Status-Anbindung für die spätere Verbindung zwischen Remote-Modboard und Stream-PC.

Backend:

```text
backend/modules/remote_agent.js
GET /api/remote-agent/status
GET /api/remote-agent/routes
```

Die API ist live geprüft und liefert:

```text
ok: true
module: remote_agent
moduleVersion: 0.0.1
moduleBuild: RDAP3A_DASHUI7_READONLY_STATUS
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
status.connectionState: offline
```

Der Offline-Status ist korrekt, weil in RDAP3A noch kein produktiver WSS-Dienst existiert.

## DASHUI7 / UI-Begriffe

Der Dashboard-Bereich wird sichtbar nicht mehr als „Remote Agent“ geführt, sondern benutzerfreundlich als:

```text
Stream-PC Verbindung
```

Sidebar:

```text
Live -> Stream-PC
```

Intern bleiben technische Namen unverändert:

```text
remote_agent
/api/remote-agent/status
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
```

## Geänderte Dateien RDAP3A-FIX1

```text
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
docs/current/RDAP3A_DASHUI7_REMOTE_AGENT_STATUS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Nicht geändert

```text
backend/modules/remote_agent.js
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/styles/global.css
keine produktive SQLite
kein Agent-Prozess erstellt
kein produktiver WSS-Endpunkt aktiviert
kein Reverse Proxy geändert
keine OBS-Änderung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Media-/Datei-/Shell-Aktion
keine Schreibfunktionen im Dashboard-v2
kein Login-System improvisiert
```

## Nach Einspielen nötig

```text
Dashboard-v2 neu bauen
testdeploy.cmd ausführen
Browser hart neu laden
```

Node/Backend-Neustart ist für RDAP3A-FIX1 nicht nötig, sofern RDAP3A-Backend bereits läuft, weil dieser Fix nur Frontend-/Doku-Dateien ändert.

## Nächster sinnvoller Schritt

```text
RDAP3B / Minimaler WSS-Dienst lokal im Testmodus planen
```

Weiterhin keine produktiven Agent-Aktionen ohne Permission-/Lock-/Audit-Konzept.
