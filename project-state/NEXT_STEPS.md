# NEXT_STEPS

Stand: RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED  
Datum: 2026-06-27

## Naechster Step

```text
RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Ziel

```text
- Naechste sinnvolle Stream-PC-Verbindungsdetails nur read-only planen.
- Bestehende Agent-/Status-/UI-Struktur aus GitHub/dev lesen.
- Bestehende Admin-/Verbindungen-Seite bevorzugen, keine parallele UI bauen.
- Pruefen, welche Statusfelder sicher angezeigt werden koennen.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine produktiven Writes.
```

## Neuer Standardbefehl fuer kuenftige Webserver-Deploys

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
Keine parallele neue UI, wenn Erweiterung der bestehenden Seite passt.
```
