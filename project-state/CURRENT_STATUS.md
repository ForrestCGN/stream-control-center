# CURRENT_STATUS

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt/vorbereitet

```text
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP102: Stream-PC Verbindungsstatus UI-Plan dokumentiert.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung vorbereitet und live sichtbar.
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt.
RDAP105: Doku-Inventur und Cleanup-Plan erstellt.
RDAP106: zentrale Current-State-Doku neu aufgebaut.
```

## Remote-Modboard aktueller Stand

```text
- Public URL: https://mods.forrestcgn.de/
- Interner Service: http://127.0.0.1:3010/
- Systemd-Service: scc-remote-modboard.service
- Auth-/Session-/Twitch-OAuth-Basis aktiv.
- Admin-User-Read-Basis vorhanden.
- Admin-Notes Read/Create/Update vorhanden.
- Admin-Notes Delete/Deactivate disabled.
- Stream-PC Verbindung read-only sichtbar.
```

## Server-Deploy-Standard

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

Bestaetigt in RDAP104B:

```text
- deploy-step wrapper vorhanden
- cleanup wrapper vorhanden
- deploy-step syntax ok
- cleanup syntax ok
- cleanup live ausgefuehrt
```

## Stream-PC-Agent aktueller Stand

```text
Public WSS Heartbeat wurde live bestaetigt.
Runtime danach final disabled.
Admin / Verbindungen zeigt Stream-PC Verbindung read-only.
Status offline ist korrekt, solange Runtime disabled bleibt.
```

Aktueller Sicherheitszustand:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Doku aktueller Stand

RDAP106 hat zentrale Current-Dateien aufgebaut:

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
```

## Sicherheitsgrenzen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine DB-Migration.
Keine neue Permission.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
```

## Naechster empfohlener Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```
