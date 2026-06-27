# START_HERE_FOR_NEW_CHAT

Stand: RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED  
Datum: 2026-06-27

## Bitte zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD.md
docs/current/RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP.md
docs/current/RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP104B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Kurzstand

```text
RDAP101B: Public WSS Heartbeat live bestaetigt; Runtime danach final disabled.
RDAP103: Stream-PC Verbindung Read-only-Kachel live sichtbar; Status offline korrekt.
RDAP104: Server-Deploy-Wrapper und Backup-/Deploy-Cleanup vorbereitet.
RDAP104B: Wrapper und Cleanup live bestaetigt; neuer Ein-Befehl-Deploy aktiv.
```

## Neuer Webserver-Deploy-Standard

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

Wichtig:

```text
- Auf dem Webserver als root arbeiten.
- Kein sudo verwenden.
- Kein git pull unter /opt/stream-control-center.
- Keine langen manuellen Deploy-Ketten mehr als Standard.
- Keine Deploy-Arbeitsordner in /root.
```

## Naechster Entscheid

```text
RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Empfehlung:

```text
Naechste Stream-PC-Verbindungsdetails nur read-only planen.
Keine Runtime-Aktivierung.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Arbeitsweise

```text
Steps so gross wie moeglich und so klein wie noetig.
Bei go naechsten echten Step liefern.
Nicht endlos gleiche Befehle wiederholen.
Keine Funktionalitaet entfernen.
Nicht raten; echte Dateien/GitHub/dev nutzen.
ZIPs mit echten Zielpfaden und ohne unnoetige Root-README.
```
