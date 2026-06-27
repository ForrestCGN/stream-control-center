# Lokales Stream-PC-/LAN-Env- und Startprofil

Stand: 2026-06-27  
Gilt ab: `0.2.4 - Routes-Status angeglichen`  
Vorbereitet in: `RDAP125_LOCAL_STREAM_PC_ENV_START_PROFILE`

## Zweck

Diese Datei beschreibt, wie der lokale Betriebsmodus fuer Stream-PC/LAN vorbereitet werden soll, ohne produktive Aktionen zu aktivieren.

Ziel:

- Onlinebetrieb und Lokalbetrieb sauber trennen.
- Stream-PC/LAN-Startwerte nachvollziehbar dokumentieren.
- Forrest und spaeter EngelCGN im LAN vorbereiten.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions aktivieren.
- Keine Secrets ins Git, in Doku oder in den Chat schreiben.

## Aktueller Betriebsstand

Webserver-Livebetrieb:

```text
runtimeMode: online
visibleLabel: Onlinemodus
lanUseAllowed: false
actionsEnabled: false
productiveWritesEnabled: false
agentActionsEnabled: false
```

Der lokale Modus ist vorbereitet, aber nicht produktiv als LAN-Dashboard freigeschaltet.

## Backend-Env fuer Remote-Modboard

Die Backend-Konfiguration liest die Env aus:

```text
/etc/stream-control-center/remote-modboard.env
```

Oder per Override:

```text
REMOTE_MODBOARD_ENV_FILE=<pfad-zur-env-datei>
```

Wichtige Variablen fuer Online/Lokal-Profil:

```text
REMOTE_MODBOARD_HOST=127.0.0.1
REMOTE_MODBOARD_PORT=3010
REMOTE_MODBOARD_MODE=online
REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS=127.0.0.1/32
REMOTE_MODBOARD_LOCAL_DISPLAY_NAME=ForrestCGN Lokales Dashboard
```

### Online-Profil

Standard fuer den Webserver:

```text
REMOTE_MODBOARD_HOST=127.0.0.1
REMOTE_MODBOARD_PORT=3010
REMOTE_MODBOARD_MODE=online
REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS=127.0.0.1/32
REMOTE_PUBLIC_BASE_URL=https://mods.forrestcgn.de
```

Bedeutung:

- Dienst bindet intern auf `127.0.0.1`.
- Oeffentlicher Zugriff laeuft ueber Webserver/Reverse Proxy.
- UI zeigt `Onlinemodus`.
- LAN-Zugriff ist nicht freigegeben.

### Lokales LAN-Profil - vorbereitet, nicht blind aktivieren

Zielbild fuer spaeteren Stream-PC-/LAN-Betrieb:

```text
REMOTE_MODBOARD_HOST=0.0.0.0
REMOTE_MODBOARD_PORT=3010
REMOTE_MODBOARD_MODE=local
REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS=127.0.0.1/32,192.168.0.0/16,10.0.0.0/8
REMOTE_MODBOARD_LOCAL_DISPLAY_NAME=ForrestCGN Lokales Dashboard
REMOTE_PUBLIC_BASE_URL=http://<STREAM-PC-LAN-IP>:3010
```

Wichtig:

- `REMOTE_MODBOARD_MODE=lan` wird wie `local` behandelt.
- `0.0.0.0` bedeutet: Dienst kann im LAN erreichbar sein.
- Die konkrete Freigabe muss spaeter bewusst mit Windows-Firewall, Router-/Netzgrenze und Auth-Konzept geprueft werden.
- LAN-Zugriff ist nur ein Serving-Modus, keine Action-Freigabe.

## Stream-PC-Agent Env

Der Stream-PC-Agent liest diese Variablen:

```text
SCC_AGENT_WS_URL=wss://mods.forrestcgn.de/agent-ws
SCC_AGENT_ID=stream-pc-main
SCC_AGENT_NAME=Forrest Stream-PC
SCC_AGENT_VERSION=rdap96-heartbeat-only
SCC_AGENT_HEARTBEAT_INTERVAL_MS=30000
SCC_AGENT_ACCESS_KEY=<lokal-setzen-nicht-in-git-nicht-in-chat>
```

Aus der echten Agent-Konfiguration gilt:

- Default WebSocket: `wss://mods.forrestcgn.de/agent-ws`
- Default Agent-ID: `stream-pc-main`
- Default Agent-Name: `Forrest Stream-PC`
- Default Version: `rdap96-heartbeat-only`
- Heartbeat-Intervall: 5 Sekunden bis 300 Sekunden erlaubt, Standard 30 Sekunden
- `SCC_AGENT_ACCESS_KEY` ist Pflicht, wird aber nicht geloggt und gehoert nie in Git/Chat

### Manuelles Startprofil - Webserver-Verbindung

PowerShell auf dem Stream-PC:

```powershell
cd D:\Git\stream-control-centeremote-modboard\stream-pc-agent

$env:SCC_AGENT_WS_URL = "wss://mods.forrestcgn.de/agent-ws"
$env:SCC_AGENT_ID = "stream-pc-main"
$env:SCC_AGENT_NAME = "Forrest Stream-PC"
$env:SCC_AGENT_VERSION = "rdap96-heartbeat-only"
$env:SCC_AGENT_HEARTBEAT_INTERVAL_MS = "30000"
$env:SCC_AGENT_ACCESS_KEY = "<lokal-setzen-nicht-in-chat-oder-git>"

npm run check
npm start
```

### Manuelles Diagnoseprofil - lokaler Node-Port

Nur fuer bewusste lokale Diagnose:

```powershell
cd D:\Git\stream-control-centeremote-modboard\stream-pc-agent

$env:SCC_AGENT_WS_URL = "ws://127.0.0.1:3010/agent-ws"
$env:SCC_AGENT_ID = "stream-pc-main"
$env:SCC_AGENT_NAME = "Forrest Stream-PC"
$env:SCC_AGENT_VERSION = "rdap96-heartbeat-only"
$env:SCC_AGENT_HEARTBEAT_INTERVAL_MS = "30000"
$env:SCC_AGENT_ACCESS_KEY = "<lokal-setzen-nicht-in-chat-oder-git>"

npm run check
npm start
```

## Zugriff fuer Forrest und Engel im LAN

Vorbereitung fuer spaeter:

```text
Forrest: Owner/Admin, voller lokaler Dashboard-Zugriff nach Auth/Rechtepruefung.
EngelCGN: LAN-Zugriff nur auf freigegebene Module/Seiten, keine System-/Admin-/Action-Rechte ohne explizite Rolle.
```

Fuer Engel duerfen spaeter nur Bereiche sichtbar/nutzbar sein, die ueber Backend-Permissions freigegeben sind. Frontend-Module koennen Hinweise anzeigen, sind aber keine Sicherheit.

## Was lokale Module spaeter beachten muessen

Lokale Module muessen im Modulmanifest mit `runtime: local` oder `both` registriert werden.

Beispiel:

```js
{
  moduleId: 'local-dashboard',
  pageId: 'stream-pc-status',
  runtime: 'local',
  permission: 'local.streamPc.status.read',
  script: '/assets/modules/local-dashboard/stream-pc-status.js'
}
```

Regel:

- `moduleId` legt fest, unter welchem Hauptmenue die Seite erscheint.
- Neue Hauptmenues nur ueber `manifest.modules`.
- Keine versteckte Navigation aus Einzelmodulen als Standard.

Details stehen in:

```text
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
```

## Sicherheitsgrenze

RDAP125 ist Doku-only.

Nicht umgesetzt:

- keine Codeaenderung,
- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- kein Autostart,
- kein Windows-Dienst,
- keine Firewall-Aenderung.

## Naechster technischer Schritt nach dieser Doku

Sinnvoller Folgeschritt:

```text
RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN
```

Ziel:

- lokalen Dashboard-Hauptbereich im Manifest planen,
- erste lokale read-only Seiten definieren,
- keine Actions aktivieren,
- keine OBS-/Sound-/Overlay-/Command-Steuerung.
