# CURRENT_STATUS

Stand: RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt/vorbereitet

```text
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP102: Stream-PC Verbindungsstatus UI-Plan dokumentiert.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung vorbereitet und live sichtbar.
RDAP104: Server-Deploy-Wrapper und Backup-/Deploy-Cleanup vorbereitet.
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt.
```

## RDAP103 Live-Befund

```text
Admin / Verbindungen sichtbar.
Stream-PC Verbindung sichtbar.
Status: offline.
Heartbeat: keine aktive Meldung.
Actions: deaktiviert.
Transport: WSS.
Portfreigabe Stream-PC: nein.
Sicherheitsgrenzen sichtbar OK.
```

Offline ist korrekt, weil die Agent-Runtime final deaktiviert bleibt.

## RDAP104 Ergebnis

```text
Neue Server-Hilfsscripte:
- tools/server/remote-modboard-deploy-step.sh
- tools/server/remote-modboard-cleanup-backups.sh

Erweiterte Deploy-Engine:
- tools/remote-modboard-deploy.sh installiert Server-Hilfsscripte nach /opt/stream-control-center/tools/server
```

## RDAP104B Live-Bestaetigung

```text
Wrapper vorhanden:
- /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh
- /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh

Syntaxchecks:
- deploy-step syntax ok
- cleanup syntax ok

Cleanup:
- Remote-Modboard Live-Backups: found=7, keep=6, 1 geloescht
- RDAP Deploy-Clones: found=7, keep=6, 1 geloescht

Service/API:
- /api/remote/status ok
- /api/remote/routes statusApiVersion erreichbar
```

## Neuer Server-Deploy-Standard ab RDAP104B

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Finaler Sicherheitszustand

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
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
RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```
