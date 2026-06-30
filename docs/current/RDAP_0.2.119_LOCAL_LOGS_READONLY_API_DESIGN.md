# RDAP 0.2.119 - Local Logs Readonly API Design

## Ziel

Konkretes Design fuer eine lokale Logs-read-only-API vorbereiten.

Dieser Stand ist bewusst ein Design-/Doku-Step.

Es wird noch keine API gebaut.

## Ausgangslage

Aktueller Stand:

```text
0.2.118 - Local Logs Source Plan
```

Logs-Hauptansicht:

```text
Admin -> Logs
```

Aktuell:

```text
Remote-Modboard aktiv
Lokal / Stream-PC vorbereitet, noch keine API
```

## Gepruefte bestehende Struktur

### Remote Agent Status

Bestehender read-only Status-Owner:

```text
GET /api/remote/agent/status
```

Wichtige Eigenschaften:

```text
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
heartbeat in-memory
Agent-Actions deaktiviert
```

Diese Route ist ein sinnvoller Design-Anker fuer lokale Logs, aber sie wird in diesem Step nicht erweitert.

### Agent Runtime / WSS

Bestehende Agent-Runtime ist fuer kontrollierte Stream-PC-Verbindung vorbereitet:

```text
geplanter WSS-Pfad: /agent-ws
Agent-ID: stream-pc-main
Heartbeat-Protokoll: rdap-agent-heartbeat.v1
Component-Status-Protokoll: rdap-component-status.v1
Live-State-Protokoll: rdap-agent-live-state.v1
OBS Inventory Sync: rdap-agent-obs-inventory.v1
Media Inventory Sync: rdap-agent-media-inventory.v1
```

Wichtig:

```text
In-Memory-first
keine Agent-Actions
keine Commands
keine Shell-/Prozess-Actions
keine Rohpayloads in Status/Logs
keine Secrets/Tokens/Cookies/ENV-Werte
```

### Bestehende OBS read-only Routen

Bereits vorhandene read-only Routen fuer Agent-/OBS-Daten:

```text
GET /api/remote/local-dashboard/obs/status
GET /api/remote/local-dashboard/obs/model
GET /api/remote/agent/obs/live/status
GET /api/remote/agent/obs/inventory/status
```

Diese Routen zeigen: lokale/Agent-Daten werden bereits read-only ueber eigene Routen sichtbar gemacht.

### Bestehende Media read-only Route

Bereits vorhanden:

```text
GET /api/remote/media/status
```

Online kann diese Route aus `remote_media_index` read-only lesen oder Agent-Memory als Fallback nutzen.

Wichtig:

```text
Upload/Edit/Delete bleiben aus.
Media-Writes bleiben separat gegated.
Agent-Writes bleiben aus.
```

## Design-Entscheidung fuer lokale Logs

Lokale Logs bekommen spaeter eine eigene Route im Remote-Modboard, statt in `/api/remote/admin/audit/log` gemischt zu werden.

Bevorzugter Route-Name fuer den spaeteren API-Skeleton:

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

Begruendung:

```text
local/logs ist fachlich breiter als agent/local-logs
passt zum Log-Quelle-Dropdown Lokal / Stream-PC
trennt Remote-Audit-Logs sauber von lokalen Status-/Recent-/Diagnose-Logs
kann intern Agent-Memory, Media-Status und spaeter weitere read-only Quellen normalisieren
```

Nicht bevorzugt fuer den ersten Skeleton:

```text
GET /api/remote/agent/local-logs/list
```

Grund:

```text
zu eng am Agent benannt
lokale Logs koennen spaeter auch aus sicheren Remote-Modboard-Statusquellen entstehen
```

## Owner-Modell

### API-Owner spaeter

Neuer eigener Service/Route-Scope:

```text
remote_local_logs_readonly
```

Moegliche Dateien fuer 0.2.120:

```text
remote-modboard/backend/src/services/local-logs-readonly.service.js
remote-modboard/backend/src/routes/local-logs-readonly.routes.js
```

Registrierung spaeter ueber bestehende App-/Routes-Struktur nach vorheriger Datei-Pruefung.

### Datenquellen spaeter

Start-Reihenfolge:

```text
1. Agent-/Stream-PC Verbindungsstatus aus bestehender Agent-Runtime
2. Media-System Status/Recent aus vorhandenen read-only Quellen
3. OBS/Overlay/Sound spaeter nur, wenn sichere read-only Status-/Recent-Quelle existiert
```

## Antwortformat fuer lokale Logs

### Statusroute

```json
{
  "ok": true,
  "service": "remote-modboard",
  "module": "remote_local_logs_readonly",
  "moduleBuild": "0.2.120 - Local Logs Readonly API Skeleton",
  "statusApiVersion": "rdap_local_logs120.v1",
  "route": "/api/remote/local/logs/status",
  "method": "GET",
  "readOnly": true,
  "writeEnabled": false,
  "agentActionsEnabled": false,
  "localControlEnabled": false,
  "source": "local",
  "prepared": true,
  "active": false,
  "reason": "api_skeleton_prepared_later",
  "sources": {
    "agent": { "prepared": true, "active": false },
    "media": { "prepared": true, "active": false },
    "sound": { "prepared": false, "active": false },
    "obs": { "prepared": false, "active": false },
    "overlays": { "prepared": false, "active": false },
    "system": { "prepared": true, "active": false }
  },
  "safety": {
    "readOnly": true,
    "noWrites": true,
    "noMigration": true,
    "noDeletion": true,
    "noAgentActions": true,
    "noObsControl": true,
    "noSoundControl": true,
    "noOverlayControl": true,
    "noShellOrProcessActions": true,
    "noFileContent": true,
    "noSecrets": true
  }
}
```

### Listenroute

```json
{
  "ok": true,
  "service": "remote-modboard",
  "module": "remote_local_logs_readonly",
  "moduleBuild": "0.2.120 - Local Logs Readonly API Skeleton",
  "statusApiVersion": "rdap_local_logs120.v1",
  "route": "/api/remote/local/logs/list",
  "method": "GET",
  "readOnly": true,
  "writeEnabled": false,
  "source": "local",
  "area": "all",
  "limit": 25,
  "count": 0,
  "items": []
}
```

## Log-Item Normalform

```json
{
  "id": "local-generated-id-or-null",
  "source": "local",
  "area": "agent",
  "createdAt": "2026-06-30T00:00:00.000Z",
  "actor": "system",
  "actorLabel": "Stream-PC Agent",
  "status": "info",
  "action": "agent_status",
  "resourceType": "stream_pc",
  "resourceKey": "stream-pc-main",
  "summary": "Stream-PC Agent nicht verbunden.",
  "detailsSafe": "Heartbeat pending / offline.",
  "technicalSource": "agent_runtime_memory"
}
```

Erlaubte Statuswerte fuer lokale Logs:

```text
success
attempt
failure
warning
info
```

Erlaubte Bereiche fuer den ersten Skeleton:

```text
all
agent
media
system
```

Spaeter moeglich, aber nicht in 0.2.120 erzwingen:

```text
sound
obs
overlays
```

## Query-Parameter spaeter

```text
limit=25|50|100
area=all|agent|media|system|sound|obs|overlays
status=success|attempt|failure|warning|info
search=<text>
```

Harte Grenze:

```text
limit max 100
```

Keine Query-Parameter fuer:

```text
Dateipfade
freie URLs
Shell-Kommandos
Prozessnamen
Rohpayloads
```

## Offline-/Fehlerverhalten

Wenn der Stream-PC/Agent nicht erreichbar ist:

```text
ok: true
source: local
active: false
reason: agent_offline_or_not_connected
items: [] oder ein synthetischer read-only Info-/Warning-Eintrag
```

Die UI soll spaeter sauber anzeigen:

```text
Lokale Logs aktuell nicht erreichbar.
Remote-Logs bleiben unveraendert nutzbar.
```

Kein Fehlerzustand darf eine Aktion ausloesen.

## UI-Anbindung spaeter

Erst nach bestaetigtem API-Skeleton:

```text
Dropdown-Option Lokal / Stream-PC aktivieren
bei source=local /api/remote/local/logs/list abfragen
Remote-Quelle unveraendert lassen
Log-Bereich-Filter fuer lokale Bereiche mappen
Offline-Hinweis anzeigen
```

Nicht im API-Skeleton erzwingen:

```text
neues Layout
Retention
Selbstbereinigung
Admin-Notizen-Ausbau
```

## Sicherheitsgrenzen

```text
nur GET
nur read-only
keine Writes
keine Migration
keine Loeschung
keine Prune-/Cleanup-Funktion
keine Agent-Actions
keine OBS-/Sound-/Overlay-Steuerung
keine lokalen Steueraktionen
keine Shell-/Datei-/Prozess-Actions
keine freien URLs
keine Secrets, Tokens, Cookies, ENV-Werte, Rohpayloads, Dateiinhalte oder absolute Pfadlisten ausgeben
```

## Betroffene Dateien fuer spaeteren 0.2.120 Skeleton

Voraussichtlich:

```text
remote-modboard/backend/src/services/local-logs-readonly.service.js
remote-modboard/backend/src/routes/local-logs-readonly.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON.md
```

Nur nach echter Datei-Pruefung.

## Nicht Teil dieses Steps

```text
keine Code-Aenderung
keine neue API
keine UI-Aktivierung
keine Remote-Audit-Route-Aenderung
keine Admin-Notizen-Erweiterung
keine Retention-UI
kein Webserver-Deploy
```

## Naechster sinnvoller Step

```text
RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON
```

Ziel fuer 0.2.120:

```text
read-only Skeleton-Routen bauen
noch keine echte lokale Log-Aggregation erzwingen
Status/List mit leerer oder synthetischer sicherer Antwort
/api/remote/routes erweitern
node --check
lokal testen
danach bei Code-Aenderung Webserver-Deploy mit Wrapper
```

## Test / Abschluss

Doku-only.

Lokal pruefen:

```powershell
cd D:\Git\stream-control-center
git status
```

Kein Node-Neustart.
Kein Webserver-Deploy.
