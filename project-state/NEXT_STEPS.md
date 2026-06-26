# NEXT_STEPS

Stand: RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

## Ziel

```text
Erster Backend-Code-Step fuer minimalen Transport-Accept.
Maximal WebSocket-Transport akzeptieren.
Noch keine Actions.
Heartbeat moeglichst separat halten.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP91

```text
- RDAP91 hat Runtime-Accept Transport-disabled Code-Plan dokumentiert.
- Zwei-Stufen-Freigabe bleibt Pflicht.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- RDAP92 darf maximal Transport akzeptieren.
- Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Heartbeat moeglichst separat.
- Keine zweite parallele /agent-ws Registrierung.
- Ab echtem Accept ist agent-runtime.service.js fachlich sinnvoll.
```

## RDAP92 planen/umsetzen

```text
- Relevante Runtime-Dateien erneut lesen.
- Exakten Backend-Code-Step planen.
- Auf explizites go warten.
- Bestehende Module/Services bevorzugen.
- Keine parallele /agent-ws Registrierung.
- Maximal Transport-Accept.
- Kein Heartbeat, falls nicht separat explizit geplant.
- Keine Actions.
- Keine Secrets.
```

## Strikt nicht machen

```text
Keine Agent-Actions in RDAP92.
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
