# START_HERE_FOR_NEW_CHAT

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27

## Bitte zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED.md
docs/current/RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP106.md
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
RDAP104B: Server-Deploy-Wrapper und Cleanup live bestaetigt; neuer Ein-Befehl-Deploy aktiv.
RDAP105: Doku-Inventur und Cleanup-Plan erstellt.
RDAP106: zentrale Current-State-Doku neu aufgebaut.
```

## Aktuelle Doku-Orientierung

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
  Gesamtueberblick Remote-Modboard / RDAP.

docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
  Aktuelle Roadmap und naechste Schritte.

docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
  Aktueller Remote-Modboard Funktions- und Sicherheitsstand.

docs/current/CURRENT_DASHBOARD_STATE.md
  Aktueller Dashboard-/lokaler System-Kontext.

docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
  Aktueller Stream-PC-Agent-/WSS-/Runtime-Stand.

docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
  Regeln fuer current/archive/project-state.
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
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Empfehlung:

```text
Nach der Doku-Bereinigung wieder den fachlichen Feature-Plan aufnehmen:
weitere Stream-PC-Verbindungsdetails nur read-only planen.
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
