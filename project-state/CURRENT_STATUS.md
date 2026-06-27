# CURRENT_STATUS

Stand: RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt/vorbereitet

```text
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung live sichtbar.
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt.
RDAP106: zentrale Current-State-Doku neu aufgebaut.
RDAP107: sichere zusaetzliche Stream-PC-Verbindungsdetails read-only geplant.
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

## RDAP107 Ergebnis

```text
- Bestehende UI-Datei fuer RDAP108 identifiziert:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Bestehende API bestaetigt:
  GET /api/remote/agent/status
- Bestehender Service liefert ausreichend Read-only-Felder.
- Plan fuer sichere zusaetzliche UI-Details erstellt.
- Kein Code geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.
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
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
```
