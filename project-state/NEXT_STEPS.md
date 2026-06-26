# NEXT_STEPS

Stand: RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN
```

## Ziel

```text
Minimalen Runtime-Accept-Transport-Code-Step planen.
Noch keine Actions.
Heartbeat moeglichst separat halten.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP90

```text
- RDAP90 hat Runtime-Accept disabled Build-Plan dokumentiert.
- Zwei-Stufen-Freigabe bleibt Pflicht.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- Der erste spaetere Accept-Code-Step darf maximal Transport akzeptieren.
- Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Heartbeat moeglichst separat planen.
- Keine zweite parallele /agent-ws Registrierung.
```

## RDAP91 planen

```text
- Relevante Runtime-Dateien erneut lesen.
- Bestehende Module/Services bevorzugen.
- Entscheiden, ob agent-runtime-disabled.service.js erweitert oder fachlich getrennt wird.
- Keinen parallelen /agent-ws Handler bauen.
- Exakten MODULE_BUILD definieren.
- Exakte Statusfelder definieren.
- Exakte Tests definieren.
- Keine Actions.
- Keine Secrets.
```

## Strikt nicht machen

```text
Keine Agent-Actions in RDAP91.
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
