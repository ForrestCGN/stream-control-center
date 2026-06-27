# CURRENT_STATUS

Stand: RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt/vorbereitet

```text
RDAP101B: Stream-PC Agent public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP102: Stream-PC Verbindungsstatus UI-Plan dokumentiert.
RDAP103: Read-only UI-Kachel fuer Stream-PC Verbindung vorbereitet und live sichtbar.
RDAP104: Server-Deploy-Wrapper und Backup-/Deploy-Cleanup vorbereitet.
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt.
RDAP105: Doku-Inventur und Cleanup-Plan erstellt.
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

## RDAP105 Doku-Inventur

```text
Snapshot-Befund:
- stream-control-center.zip: 3380 Eintraege
- docs/current: ca. 1435 Dateien
- project-state: ca. 1248 Dateien
- project-state/archive: ca. 996 Dateien
- Markdown-Dateien gesamt: ca. 3244

Bewertung:
- docs/current ist zu voll fuer echten Current-Fokus.
- project-state ist zu laut fuer schnelle Orientierung.
- historische Dokus sollen erhalten bleiben, aber klarer als Archiv behandelt werden.
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
RDAP106_DOCS_CURRENT_STATE_REBUILD
```
