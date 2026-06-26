# NEXT_STEPS

Stand: RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP100_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_CONFIG
```

## Ziel

RDAP100 soll den fehlenden public WebSocket-Proxy fuer `/agent-ws` gezielt ergaenzen und testen:

```text
- In ISPConfig/Nginx einen separaten location /agent-ws Block ergaenzen.
- Bestehenden location / Block unveraendert lassen.
- WebSocket Upgrade/Connection Header setzen.
- nginx -t ausfuehren.
- Nginx reloaden.
- Public /agent-ws erneut testen.
- Runtime fuer echten Heartbeat-Test nur temporaer aktivieren.
- Agent lokal starten.
- /api/remote/agent/status pruefen.
- Agent stoppen.
- Runtime final wieder deaktivieren.
- Final disabled Status pruefen.
```

## Voraussetzung

```text
RDAP99 abgeschlossen:
- RDAP98 Teiltest war bis public WSS 404 erfolgreich.
- ISPConfig hat bereits location / nach 127.0.0.1:3010.
- Fuer /agent-ws fehlt eigener WebSocket Location-Block.
- Upgrade-/Connection-Header fehlen.
```

## Geplanter Nginx Block

```nginx
location /agent-ws {
    proxy_pass http://127.0.0.1:3010/agent-ws;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 75s;
    proxy_connect_timeout 5s;
    proxy_send_timeout 75s;
}
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
```
