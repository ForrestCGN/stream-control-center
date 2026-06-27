# TODO

Stand: RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED  
Datum: 2026-06-27

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

RDAP104B:
- RDAP104 live bestaetigt.
- Server-Deploy-Wrapper auf Webserver vorhanden.
- Cleanup-Script auf Webserver vorhanden.
- Bash-Syntaxchecks sauber.
- Cleanup live ausgefuehrt.
- Neuer Deploy-Standard aktiv.
```

## Naechster Schritt

```text
RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Offen / pruefen

```text
- Welche weiteren Stream-PC-Verbindungsdetails sicher read-only in der UI sichtbar sein sollen.
- Welche vorhandenen Felder aus /api/remote/agent/status dafuer geeignet sind.
- Ob bestehende Admin-/Verbindungen-Seite dafuer erweitert werden kann.
```

## Danach

```text
Nach RDAP105-Plan: optional read-only UI-Erweiterung, aber nur ohne Runtime-Aktivierung und ohne Agent-Actions.
```
