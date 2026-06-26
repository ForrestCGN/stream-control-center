# NEXT_STEPS

Stand: RDAP80C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_TOKEN_PLAN
```

## Ziel

```text
Stream-PC-Verbindungs-Handshake, interne Agent-ID, Agent-Secret/Token und Heartbeat-Empfang konkret planen.
Noch keine produktiven Remote-Actions.
```

## Ausgangspunkt RDAP80C

```text
- GET /api/remote/agent/status vorhanden.
- UI-Page ist Admin -> Verbindungen / Stream-PC Verbindung.
- Kein eigenes Hauptmodul Agent in der Navigation.
- Status ist disabled/offline.
- Heartbeat-Modell ist read-only vorbereitet.
- WSS-Pfad /agent-ws ist nur geplant.
- RDAP80/RDAP80B sind serverseitig live bestaetigt.
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

## RDAP81 klaeren

```text
- Wie authentifiziert sich der Stream-PC beim Webserver?
- Wo liegt das Agent-Secret serverseitig?
- Wie wird das Secret lokal auf dem Stream-PC gespeichert?
- Wie wird ein Agent eindeutig benannt: agentId / streamPcName?
- WSS-Handshake: Pfad, Header/Token, Version, Reject-Gruende.
- Heartbeat-Modell: Intervall, stale/offline-Zeit, In-Memory vs. DB.
- Welche Statusdaten duerfen im UI sichtbar sein?
- Welche Daten duerfen niemals geloggt werden?
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
Keine produktive Agent-Action-Queue.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```

