# RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Plan / Nginx Public WebSocket Routing

## Zweck

RDAP99 dokumentiert den Befund nach RDAP98B und plant den naechsten sicheren Schritt fuer das public WebSocket-Routing der Stream-PC Verbindung.

Der RDAP98 Teiltest zeigte:

```text
- Agent startet lokal auf dem Stream-PC.
- Agent loggt sichere Events ohne Secret-Ausgabe.
- Public WSS Ziel wss://mods.forrestcgn.de/agent-ws antwortet mit 404 Not Found.
- Heartbeat live ueber public WSS ist deshalb noch nicht bestaetigt.
- Runtime wurde final wieder deaktiviert.
- Actions bleiben false.
- productiveAgentRuntime bleibt false.
```

## Neuer Befund aus RDAP99

Forrest bestaetigte, dass in ISPConfig fuer `mods.forrestcgn.de` aktuell ein allgemeiner Proxy-Block fuer `/` vorhanden ist:

```nginx
location / {
    proxy_pass http://127.0.0.1:3010/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 30s;
    proxy_connect_timeout 5s;
    proxy_send_timeout 30s;
}
```

Interpretation:

```text
- Normale HTTP-Routen koennen ueber location / nach Node 127.0.0.1:3010 funktionieren.
- Fuer WebSocket /agent-ws fehlt ein eigener Location-Block.
- Fuer WebSocket fehlen Upgrade-/Connection-Header.
- Das erklaert den 404 fuer wss://mods.forrestcgn.de/agent-ws sehr wahrscheinlich.
```

## Ziel fuer den naechsten Aenderungsstep

Naechster Aenderungsstep:

```text
RDAP100_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_CONFIG
```

Ziel:

```text
- In ISPConfig/Nginx einen separaten location /agent-ws Block ergaenzen.
- Den bestehenden location / Block unveraendert lassen.
- WebSocket Upgrade korrekt weiterreichen.
- Danach nginx -t ausfuehren.
- Danach Nginx reloaden.
- Danach public /agent-ws erneut testen.
- Runtime nur fuer den Heartbeat-Live-Test temporaer aktivieren.
- Agent danach stoppen.
- Runtime final wieder deaktivieren.
```

## Geplanter Nginx Block fuer ISPConfig

Minimaler Vorschlag fuer RDAP100:

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

Hinweise:

```text
- Der Block muss zusaetzlich zum bestehenden location / existieren.
- Der Block soll im gleichen Server-Kontext fuer mods.forrestcgn.de liegen.
- Der Block soll vor oder neben location / stehen; / bleibt unveraendert.
- Fuer ISPConfig ist Connection "upgrade" bewusst minimaler als eine globale map-Definition.
- Wenn ISPConfig globale map-Nutzung sauber unterstuetzt, kann spaeter auf $connection_upgrade umgestellt werden. Fuer diesen Step wird das nicht benoetigt.
```

## Geplante Pruefung nach Nginx-Aenderung

Nur fuer RDAP100, nicht in RDAP99 ausfuehren:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Danach public Sichttest ohne Secret:

```text
- Erwartung vor Runtime-Aktivierung: /agent-ws wird nicht mehr als public 404 von Nginx beantwortet.
- Ein WebSocket-Handshake kann dann backendseitig kontrolliert abgelehnt werden, wenn Runtime disabled ist.
- Fuer echten Heartbeat-Test wird Runtime nur temporaer aktiviert.
```

## Sicherheitsgrenzen

Weiterhin strikt:

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
Keine Nginx-Aenderung ohne separaten RDAP100 go.
```

## Secret-Safety

Nicht dokumentieren, nicht posten, nicht in Git aufnehmen:

```text
SCC_AGENT_ACCESS_KEY
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
rohe Header
rohe Heartbeat-Payloads
komplette Config-Dumps
```

## Webserver-Deploy

Kein Webserver-Deploy noetig.

Begruendung:

```text
- RDAP99 ist Doku/Plan-only.
- Kein Backend-Code wird geaendert.
- Kein Agent-Code wird geaendert.
- Keine Nginx-Aenderung wird in RDAP99 ausgefuehrt.
- Runtime bleibt disabled.
```
