# NEXT_STEPS

Stand: RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI  
Datum: 2026-06-27

## Naechster Step

```text
RDAP108B_STREAM_PC_CONNECTION_READONLY_UI_LIVE_CONFIRM
```

## Ziel

```text
- Nach lokalem stepdone RDAP108 auf Webserver deployen.
- Admin / Verbindungen im Browser pruefen.
- /api/remote/agent/status pruefen.
- Sichtbare neue UI-Felder kontrollieren.
- Bestaetigen, dass keine Runtime und keine Agent-Actions aktiv sind.
```

## Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI dev
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
