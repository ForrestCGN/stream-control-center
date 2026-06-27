# CURRENT_STATUS

Stand: RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt/vorbereitet

```text
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung live sichtbar.
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt.
RDAP106: zentrale Current-State-Doku neu aufgebaut.
RDAP107: sichere zusaetzliche Stream-PC-Verbindungsdetails read-only geplant.
RDAP108: Admin-/Verbindungen-Seite frontend-only erweitert.
```

## RDAP108 Ergebnis

```text
Geaendert:
- remote-modboard/backend/public/assets/rdap80-agent-status.js

Nicht geaendert:
- keine Backend-Route
- kein Agent-Service
- keine DB
- keine Runtime
- keine Actions

Neu sichtbar:
- Agent-Version/Protokoll
- Heartbeat-Seq/Alter
- Stale-/Offline-Schwellen
- Runtime-Gates
- erweiterte Transportdetails
- Heartbeat-Speicherung/Aktionsgrenzen
- einklappbare technische Diagnose ohne Secrets
```

## Stream-PC-Agent Sicherheitszustand bleibt

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Server-Deploy-Standard

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Naechster empfohlener Step

```text
RDAP108B_STREAM_PC_CONNECTION_READONLY_UI_LIVE_CONFIRM
```
