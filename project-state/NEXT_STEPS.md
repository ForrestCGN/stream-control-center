# NEXT_STEPS

Stand: RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE
```

## Ziel

RDAP96 soll den in RDAP95 geplanten minimalen Stream-PC Agent Client vorbereiten:

```text
- Eigene Agent-Komponente unter remote-modboard/stream-pc-agent/.
- Nur Verbindung + Heartbeat.
- Verbindung spaeter zu wss://mods.forrestcgn.de/agent-ws.
- Lokaler/diagnostischer Test gegen ws://127.0.0.1:3010/agent-ws nur bewusst.
- Heartbeat alle 30 Sekunden.
- Reconnect mit Backoff.
- Logging ohne Secrets/Header/Token/Rohpayloads.
- Keine Actions.
```

## Voraussichtliche Dateien

```text
remote-modboard/stream-pc-agent/package.json
remote-modboard/stream-pc-agent/src/agent-client.js
remote-modboard/stream-pc-agent/src/config.js
remote-modboard/stream-pc-agent/src/logger.js
remote-modboard/stream-pc-agent/README.md
```

Nur wenn die echte Repo-Struktur beim Lesen nicht dagegen spricht.

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
Keine Runtime dauerhaft aktivieren.
```
