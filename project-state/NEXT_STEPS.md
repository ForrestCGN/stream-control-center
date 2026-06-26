# NEXT_STEPS

Stand: RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```

## Ziel

```text
Header-/Handshake-Precheck in bestehendem disabled Guard vorbereiten.
Verbindungen weiterhin ablehnen.
missing/invalid/unknown Gruende sicher diagnostizieren.
Keine akzeptierte Agent-Verbindung.
Keine Runtime-Aktivierung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP84

```text
- RDAP83 Reject-Diagnose ist live bestaetigt.
- /agent-ws Upgrade-Guard ist vorbereitet.
- Abgelehnte /agent-ws Versuche werden in-memory diagnostiziert.
- RDAP84 hat den Access-Key-Handshake-Plan dokumentiert.
- Geplanter Header-Vertrag ist festgelegt.
- AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- acceptsAgentConnections bleibt false.
- Access-Key wird nicht ausgegeben.
- Status bleibt offline/disabled.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP85 vorbereitend pruefen

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/services/agent-runtime-disabled.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/*
project-state/*
```

## RDAP85 klaeren

```text
- Wird der Precheck im bestehenden agent-runtime-disabled.service.js erweitert?
- Welche Header-Bools duerfen sichtbar sein?
- Welche sanitized Hints duerfen sichtbar sein?
- Welche Reject-Gruende werden aktiv diagnostiziert?
- Wie bleibt acceptsAgentConnections garantiert false?
- Wie wird verhindert, dass Headerwerte oder Secrets geloggt werden?
- Welche Tests pruefen missing/unknown/invalid ohne echte Verbindung?
```

## Strikt nicht machen

```text
Keine akzeptierte Agent-Verbindung.
Keine Runtime-Aktivierung ohne separaten Plan.
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
Keine Secret-Ausgabe.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
