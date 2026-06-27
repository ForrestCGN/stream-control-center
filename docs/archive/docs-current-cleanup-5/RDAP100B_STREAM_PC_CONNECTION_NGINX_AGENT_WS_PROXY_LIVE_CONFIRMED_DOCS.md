# RDAP100B_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_LIVE_CONFIRMED_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku / Live-Bestaetigung / Nginx Public WebSocket Routing

## Zweck

RDAP100B dokumentiert den live bestaetigten RDAP100 Stand fuer das public WebSocket Routing der Stream-PC Verbindung.

Der separate ISPConfig/Nginx Block fuer `/agent-ws` wurde ergaenzt und der public WebSocket-Upgrade-Test erreicht jetzt den Backend-Upgrade-Handler des Remote-Modboards.

## Ausgangspunkt

RDAP99 hatte dokumentiert:

```text
- ISPConfig fuer mods.forrestcgn.de hatte bereits location / mit proxy_pass http://127.0.0.1:3010/.
- Fuer WebSocket /agent-ws fehlte ein eigener Location-Block.
- Upgrade-/Connection-Header fehlten fuer /agent-ws.
- Public WSS /agent-ws lieferte zuvor 404 Not Found.
```

## RDAP100 Aenderung ausserhalb des Repos

In ISPConfig/Nginx wurde fuer `mods.forrestcgn.de` ein separater Location-Block fuer `/agent-ws` ergaenzt.

Geplanter/gesetzter Block:

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

Der bestehende `location /` Block bleibt unveraendert fuer normale HTTP/API/UI-Routen.

## Live-Test ohne Secret

Zuerst wurde ein normaler HTTP-GET gegen public `/agent-ws` getestet.

Beobachtung:

```text
HTTP/2 404
x-remote-modboard-build: RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
{"ok":false,"service":"remote-modboard","error":"not_found","path":"/agent-ws",...}
```

Interpretation:

```text
Die Anfrage erreicht bereits das Node-Backend.
Der 404 kommt nicht mehr als nackter Nginx-404, sondern aus dem Remote-Modboard HTTP-Router.
Das ist fuer normalen HTTP-GET auf einem WebSocket-Upgrade-Pfad erwartbar.
```

Danach wurde ein public WebSocket-Upgrade-Test ohne Secret/Proof durchgefuehrt.

Beobachtung:

```text
HTTP/1.1 503 Service Unavailable
X-SCC-Agent-Runtime: transport-guarded
X-SCC-Agent-Actions: disabled
X-SCC-Agent-Reject-Reason: missing_connection_proof

Stream-PC connection rejected.
reason=missing_connection_proof
```

Interpretation:

```text
Public /agent-ws erreicht jetzt den Backend-Upgrade-Handler.
Nginx leitet Upgrade/Connection korrekt weiter.
Die Ablehnung missing_connection_proof ist erwartet, weil absichtlich kein Secret/Bearer/Proof gesendet wurde.
```

## Bestaetigtes Ergebnis

```text
Public /agent-ws erreicht Backend-Upgrade-Handler: OK
Nginx WebSocket Upgrade/Connection Weiterleitung: OK
Erwartete Ablehnung ohne Secret: OK
Keine Secrets im Test verwendet: OK
Keine Actions: OK
Runtime final disabled: OK
```

## Finaler Sicherheitszustand

Forrest bestaetigte nach RDAP100 final:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Secret-Safety

Nicht in Chat, Doku, ZIP oder Git aufgenommen:

```text
SCC_AGENT_ACCESS_KEY
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
rohe Header mit Secrets
rohe Heartbeat-Payloads
komplette Config-Dumps
```

## Keine Actions

Weiterhin unveraendert:

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

## Webserver-Deploy

Kein Repo-Webserver-Deploy noetig.

Begruendung:

```text
- RDAP100B ist Doku-only.
- Kein Backend-Code wird geaendert.
- Kein Agent-Code wird geaendert.
- Die live bestaetigte Aenderung war eine ISPConfig/Nginx-Konfiguration ausserhalb des Repos.
- Runtime bleibt final disabled.
```

## Naechster sinnvoller Step

```text
RDAP101_STREAM_PC_CONNECTION_AGENT_CLIENT_PUBLIC_WSS_HEARTBEAT_LIVE
```

Ziel:

```text
- Vorab final disabled Status pruefen.
- Runtime temporaer aktivieren.
- Stream-PC Agent lokal gegen wss://mods.forrestcgn.de/agent-ws starten.
- Gueltigen Heartbeat ueber public WSS bestaetigen.
- /api/remote/agent/status pruefen.
- Agent stoppen.
- Runtime final wieder deaktivieren.
- Final disabled Status pruefen.
- Keine Secrets im Chat.
- Keine Actions.
```
