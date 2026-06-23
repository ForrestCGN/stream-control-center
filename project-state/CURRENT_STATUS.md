# CURRENT STATUS

Stand: RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE  
Datum: 2026-06-23

## Aktueller bestätigter Arbeitsstand

RDAP5H erstellt ein kontrolliertes Handoff-/Installationspaket fuer den spaeteren Remote-Modboard-Node-Service auf `web.cgn.community` fuer `mods.forrestcgn.de`.

Fuehrender Service-Code bleibt:

```text
remote-modboard/backend/
```

Neu hinzugekommen sind ausschliesslich Deploy-/Server-Handoff-Dateien:

```text
remote-modboard/deploy/README_REMOTE_SERVER_INSTALL.md
remote-modboard/deploy/systemd/scc-remote-modboard.service.example
remote-modboard/deploy/nginx/mods.forrestcgn.de.remote-api.example.conf
remote-modboard/deploy/env/remote-modboard.env.example
remote-modboard/deploy/scripts/README_COMMANDS.md
```

## Enthaltenes Zielbild

```text
Node-Service intern: 127.0.0.1:3010
Service-Name: scc-remote-modboard.service
Empfohlener Pfad: /opt/stream-control-center/remote-modboard/backend
ENV-Datei: /etc/stream-control-center/remote-modboard.env
nginx-Reverse-Proxy: /api/remote/ -> 127.0.0.1:3010/api/remote/
```

## Bekannter Webserver-/DB-Stand

```text
Webserver: web.cgn.community
Remote-Modboard: https://mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
MariaDB: 11.8.6
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wurde nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Rollen-/Gruppenmodell

Fuehrend bleibt RDAP5C3:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

## Nicht geändert durch RDAP5H

```text
kein produktiver Node-Service gestartet
kein npm install ausgefuehrt
keine nginx-Aenderung ausgefuehrt
keine systemd-Aenderung ausgefuehrt
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
kein Login/Auth
kein WSS-Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Datei-/Shell-/Prozesssteuerung
keine echten Secrets
backend/server.js unveraendert
backend/modules/remote_agent.js unveraendert
Root-package.json unveraendert
```

## Wichtiger erkannter Altstand

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort weiterhin als Rolle/Permission-Preset.

Das ist seit RDAP5C3 fachlich ueberholt und bleibt als verbindlicher TODO bestehen.

## Nächster sinnvoller Schritt

```text
RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION
```

Ziel: Echte, kontrollierte Ausfuehrung auf dem Webserver nur nach separatem Go: Pfade pruefen, Service-User/ENV/Dateien/npm/systemd/nginx/Healthchecks Schritt fuer Schritt ausfuehren.
