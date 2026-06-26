# NEXT_STEPS

Stand: RDAP98B_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PARTIAL_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN
```

## Ziel

RDAP99 soll den fehlenden public WebSocket-Proxy fuer `/agent-ws` planen:

```text
- Aktuellen Nginx/Public-Routing-Zustand fuer mods.forrestcgn.de pruefen.
- Klaeren, warum wss://mods.forrestcgn.de/agent-ws 404 Not Found liefert.
- Plan fuer Proxy nach Node intern 127.0.0.1:3010/agent-ws erstellen.
- WebSocket Upgrade/Connection Header beruecksichtigen.
- Keine Nginx-Aenderung ohne separaten Plan/go.
- Keine Runtime dauerhaft aktivieren.
- Keine Secrets.
- Keine Actions.
```

## Voraussetzung

```text
RDAP98B abgeschlossen:
- RDAP98 Teiltest dokumentiert.
- Agent startet lokal und loggt sicher.
- Public /agent-ws liefert 404.
- Runtime final disabled.
```

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
Keine Nginx-Aenderung ohne Plan und go.
```
