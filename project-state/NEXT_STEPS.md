# NEXT_STEPS

Stand: RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP81_AGENT_HANDSHAKE_AND_TOKEN_PLAN
```

## Ziel

```text
Agent-Handshake, Agent-ID, Agent-Secret und Heartbeat-Empfang konkret planen.
Noch keine produktiven Remote-Actions.
```

## Ausgangspunkt RDAP80B

```text
- GET /api/remote/agent/status vorhanden.
- UI-Page ist Admin -> Verbindungen / Stream-PC Verbindung.
- Kein eigenes Hauptmodul Agent in der Navigation.
- Status ist disabled/offline.
- Heartbeat-Modell ist read-only vorbereitet.
- WSS-Pfad /agent-ws ist nur geplant.
```

## RDAP81 vorbereitend pruefen

```text
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
backend/modules/remote_agent.js
tools/*
docs/current/*
project-state/*
```

## Strikt nicht machen

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
