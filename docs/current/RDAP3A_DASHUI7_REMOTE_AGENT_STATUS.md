# RDAP3A / DASHUI7 Stream-PC Verbindung

Stand: 2026-06-23  
Status: read-only Statusseite, keine produktiven Aktionen

## Zweck

Diese Datei dokumentiert den aktuellen RDAP3A/DASHUI7-Stand für die erste read-only Statusanzeige der späteren Verbindung zwischen Remote-Modboard und lokalem Stream-PC.

Im Dashboard wird der Bereich nicht mehr als technisch sperriger Begriff „Remote-Agent“ geführt, sondern benutzerfreundlich als:

```text
Stream-PC Verbindung
```

Intern bleiben technische Namen unverändert, damit bestehende Routen und Dateien eindeutig bleiben.

## Sichtbare Dashboard-Bezeichnungen

Sidebar:

```text
Live -> Stream-PC
```

Seitentitel / Breadcrumb:

```text
Stream-PC Verbindung
```

Modul-Tab:

```text
Übersicht
```

## Interne technische Namen

Diese bleiben absichtlich unverändert:

```text
backend/modules/remote_agent.js
GET /api/remote-agent/status
GET /api/remote-agent/routes
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/agentClient.js
```

Grund:

```text
Intern ist remote_agent eindeutig. Im UI ist Stream-PC Verbindung verständlicher.
```

## API-Status

Statusroute:

```text
GET /api/remote-agent/status
```

Erwarteter RDAP3A-Stand:

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

## Dashboard-Verhalten

Die Seite zeigt echte API-Daten aus `/api/remote-agent/status`.

Sie darf nicht mehr anzeigen:

```text
Status in DASHUI5
Platzhalter
Minimal erlaubte Actions mit agent.ping als aktiv erlaubt
```

Stattdessen zeigt sie:

```text
Stream-PC Verbindung
Stream-PC nicht verbunden
RDAP3A / Read-only
API geladen
read-only
kein WSS-Dienst verbunden
keine Schreibroute
```

## Sicherheitsgrenzen

RDAP3A bleibt read-only.

Nicht enthalten:

```text
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Media-Schreiboperation
keine Text-/Config-Änderung
keine Commands/Kanalpunkte
keine DB-Aktionen
keine Datei-/Shell-/Prozessaktionen
kein produktiver WSS-Agent
kein Login-System
kein Permission-System
```

## Geänderte Dateien in RDAP3A-FIX1

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
keine API-Routen
keine produktive SQLite
keine Backend-Logik
keine Agent-/WSS-Laufzeit
keine produktiven Aktionen
```

## Test

Nach Installation:

```cmd
build-dashboard-v2.cmd
testdeploy.cmd
```

Node-Neustart:

```text
nicht nötig, wenn nur dieser FIX1 eingespielt wird und RDAP3A-Backend bereits läuft
```

API prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/status" | ConvertTo-Json -Depth 8
```

Frontend-Build prüfen:

```powershell
$js = Get-ChildItem ".\htdocs\dashboard-v2\assets\*.js" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Select-String -Path $js.FullName -Pattern "DASHUI5","Stream-PC Verbindung","remote-agent/status"
```

Erwartung:

```text
DASHUI5 darf nicht mehr auftauchen.
Stream-PC Verbindung soll auftauchen.
remote-agent/status soll auftauchen.
```

Dashboard prüfen:

```text
http://127.0.0.1:8080/dashboard-v2/?v=rdap3a-fix1
Live -> Stream-PC
```

## Nächster sinnvoller Schritt

Nach erfolgreichem Test und StepDone:

```text
RDAP3B / Minimaler WSS-Dienst lokal im Testmodus planen
```

Weiterhin ohne produktive Aktionen.
