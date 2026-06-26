# NEXT_STEPS

Stand: RDAP100B_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP101_STREAM_PC_CONNECTION_AGENT_CLIENT_PUBLIC_WSS_HEARTBEAT_LIVE
```

## Ziel

RDAP101 soll den echten Heartbeat des lokalen Stream-PC Agent Clients ueber public WSS testen:

```text
- Vorab disabled Status pruefen.
- Runtime auf dem Webserver nur temporaer aktivieren.
- Stream-PC Agent lokal gegen wss://mods.forrestcgn.de/agent-ws starten.
- Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
- /api/remote/agent/status pruefen.
- Gueltigen Heartbeat bestaetigen.
- Agent stoppen.
- Runtime final wieder deaktivieren.
- Finalen disabled Status pruefen.
- Keine Actions.
```

## Voraussetzung

```text
RDAP100B abgeschlossen:
- Nginx/ISPConfig /agent-ws WebSocket Proxy live bestaetigt.
- Public WebSocket-Upgrade erreicht Backend-Upgrade-Handler.
- Test ohne Secret wurde erwartbar mit missing_connection_proof abgelehnt.
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
Keine Nginx-Aenderung im RDAP101 Heartbeat-Test.
```
