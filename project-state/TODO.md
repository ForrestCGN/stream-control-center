# TODO

Stand: RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP  
Datum: 2026-06-26

## Erledigt/vorbereitet

```text
RDAP101B:
- Public WSS Heartbeat live bestaetigt.
- Runtime final disabled.

RDAP102:
- Sichtbaren Stream-PC Verbindungsstatus geplant.

RDAP103:
- Vorhandene Verbindungen-Seite erweitert.
- Read-only Status-Semantik verbessert.
- Veralteten RDAP80B-Text aktualisiert.
- Heartbeat-Details verbessert.
- Keine Actions/Start/Stop Buttons.

RDAP104:
- Server-Deploy-Wrapper vorbereitet.
- Backup-/Deploy-Cleanup vorbereitet.
- Workflow-Dokus auf root-ohne-sudo und Ein-Befehl-Deploy aktualisiert.
```

## Naechster Schritt

```text
RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRM
```

## Offen / pruefen

```text
- RDAP104 einmalig per Fallback auf Webserver deployen.
- Danach pruefen, dass Wrapper unter /opt/stream-control-center/tools/server liegt.
- Cleanup-Ergebnis pruefen: maximal 6 Backups und 6 RDAP-Deploy-Clones.
- Danach alte manuelle Deploy-Ketten nicht mehr als Standard verwenden.
```

## Danach

```text
Nach RDAP104B: weitere Stream-PC-Verbindungsdetails nur read-only planen oder naechsten sicheren Statusbereich vorbereiten.
```
