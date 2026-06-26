# NEXT_STEPS

Stand: RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP  
Datum: 2026-06-26

## Naechster Step

```text
RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRM
```

## Ziel

```text
- RDAP104 nach GitHub/dev deployen.
- Einmalig Fallback-Deploy nutzen, weil der neue Wrapper vor RDAP104 noch nicht auf dem Webserver liegt.
- Pruefen, dass /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh installiert wurde.
- Pruefen, dass /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh installiert wurde.
- Bash-Syntax beider Server-Scripte pruefen.
- Cleanup pruefen: maximal 6 Backups und 6 RDAP-Deploy-Clones.
- Danach kuenftige RDAP-Deploys nur noch mit einem Wrapper-Befehl.
```

## Kuenftiger Standardbefehl

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Runtime-Aktivierung.
Keine Secrets.
Keine Rohpayloads.
```
