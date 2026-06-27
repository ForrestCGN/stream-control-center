# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / `remote-modboard` / RDAP

## Zweck

Diese Datei beschreibt den aktuellen Remote-Modboard-Zustand kompakt und aktuell. Sie ist fuer neue Chats und Planung wichtiger als historische RDAP-Step-Dateien.

## Live-/Service-Stand

```text
Public URL:
https://mods.forrestcgn.de/

Interner Service:
http://127.0.0.1:3010/

Systemd:
scc-remote-modboard.service

Live-Pfad:
 /opt/stream-control-center/remote-modboard

Deploy:
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Aktuelle Backend-/UI-Basis

```text
- Express/Node Backend fuer Remote-Modboard.
- Public UI unter remote-modboard/backend/public.
- Auth-/Session-/Twitch-OAuth-Basis aktiv.
- Dashboard-Zugriff serverseitig gegated.
- Admin-Bereich vorhanden.
- Admin-User-Read-Basis vorhanden.
- Admin-Notes Read/Create/Update vorhanden.
- Agent-/Stream-PC-Status read-only sichtbar.
```

## Aktive / bestaetigte Funktionen

```text
- Remote-Modboard-Webseite laeuft.
- /api/remote/status erreichbar.
- /api/remote/routes erreichbar.
- Twitch Login / Session Handling funktionieren.
- Admin-User-Detail read-only sichtbar.
- Admin-Notes sichtbar.
- Admin-Notes Create aktiv.
- Admin-Notes Update aktiv.
- Admin-Notes Delete/Deactivate disabled.
- Stream-PC Verbindung read-only in Admin / Verbindungen sichtbar.
```

## Admin-Notes Routenstand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Write-Sicherheit fuer Create/Update:

```text
- serverseitige Session
- serverseitige Permission
- confirmWrite
- Audit
- Lock
- Readback
```

## Deaktiviert / nicht freigegeben

```text
- Admin-Note Deactivate
- physisches Delete
- Community-Read fuer Admin-Notizen
- Permission-/Rollen-/Gruppen-Writes in der UI
- Session-Revocation in der UI
- Agent-Steuerung
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-/Channelpoints-Steuerung
- freie Shell
- freie Dateioperationen
- freie Prozesssteuerung
- freie URL-Ausfuehrung
```

## Agent-/Runtime-Sicherheitszustand

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Workflow-Stand

RDAP104B hat bestaetigt:

```text
- Server-Deploy-Wrapper auf Webserver vorhanden.
- Cleanup-Script auf Webserver vorhanden.
- Bash-Syntaxchecks sauber.
- Cleanup live getestet.
- Neuer Ein-Befehl-Deploy aktiv.
```

## Doku-Stand

RDAP106 hat die zentrale Current-State-Doku aufgebaut:

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
```

## Naechster fachlicher Fokus

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- weitere Stream-PC-Verbindungsdetails read-only planen
- bestehende Admin-/Verbindungen-Seite nutzen
- keine Runtime-Aktivierung
- keine Agent-Actions
```
