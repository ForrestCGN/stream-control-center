# REMOTE DASHBOARD RDAP5H - Remote Node Server Install Package

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE  
Status: Installations-/Handoff-Paket, keine produktive Ausführung

## Zweck

RDAP5H liefert ein kontrolliertes Server-Handoff-Paket fuer den spaeteren Betrieb des Remote-Modboard-Node-Service auf:

```text
web.cgn.community
mods.forrestcgn.de
```

Fuehrendes Service-Paket bleibt:

```text
remote-modboard/backend/
```

Dieses Paket ergaenzt nur Doku, Vorlagen und kontrollierte Befehlsnotizen.

## Wichtig

RDAP5H fuehrt nichts produktiv aus.

```text
Kein npm install wird ausgefuehrt.
Kein systemd-Service wird installiert.
Kein systemctl start/enable wird ausgefuehrt.
Keine nginx-Datei wird live geschrieben.
Kein nginx reload wird ausgefuehrt.
Keine DB-Migration wird ausgefuehrt.
Keine MariaDB-Schreibaktion wird ausgefuehrt.
Keine lokale SQLite wird angefasst.
Keine Secrets werden ins Repo geschrieben.
Keine Agent-Actions werden aktiviert.
Keine OBS-/Sound-/Overlay-/Command-Steuerung wird aktiviert.
Keine freie Shell-/Datei-/Prozesssteuerung wird eingebaut.
```

## Enthaltene Handoff-Dateien

```text
remote-modboard/deploy/README_REMOTE_SERVER_INSTALL.md
remote-modboard/deploy/systemd/scc-remote-modboard.service.example
remote-modboard/deploy/nginx/mods.forrestcgn.de.remote-api.example.conf
remote-modboard/deploy/env/remote-modboard.env.example
remote-modboard/deploy/scripts/README_COMMANDS.md
```

## Installationsziel spaeter

Empfohlener Zielpfad auf dem Webserver:

```text
/opt/stream-control-center/remote-modboard/
```

Empfohlene Secret-/ENV-Datei:

```text
/etc/stream-control-center/remote-modboard.env
```

Empfohlener systemd-Service:

```text
scc-remote-modboard.service
```

Empfohlener interner Node-Listen-Port:

```text
127.0.0.1:3010
```

## nginx-Ziel spaeter

Nur Reverse Proxy ueber nginx, Node nicht direkt oeffentlich.

Geplante Remote-API:

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
```

Spaeterer WSS-Agent-Pfad wird nur vorbereitet, nicht produktiv genutzt:

```text
/ws/agent
```

## DB-Stand

Bekannt:

```text
Engine: MariaDB 11.8.6
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und nicht ins Repo geschrieben. Es gehoert spaeter ausschliesslich in die Server-ENV-Datei.

## Sicherheitsgrenzen

Auch im Installationspaket gilt:

```text
Keine freien Shell-Kommandos aus der App.
Keine freien Dateipfade aus der App.
Keine freien Prozessbefehle aus der App.
Keine DB-Migration in diesem Step.
Keine Schreibroute.
Keine Agent-Actions.
Frontend entscheidet keine Rechte.
Backend entscheidet spaeter.
```

## Abgrenzung zu RDAP5F

RDAP5F hat das read-only Node-Basispaket angelegt:

```text
remote-modboard/backend/
```

RDAP5H ergaenzt nur den Server-Handoff fuer spaetere manuelle Installation.

## Naechster sinnvoller Schritt

Nach RDAP5H:

```text
RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION
```

Nur nach separatem Go.

Ziel von RDAP5I waere dann die echte, kontrollierte Ausfuehrung auf dem Webserver:

```text
Zielpfade pruefen
Service-User ggf. anlegen
Dateien kopieren
npm install nur im Remote-Paket
ENV-Datei auf Server erstellen ohne Passwort im Chat
systemd-Service installieren
nginx-Snippet einbinden
Healthchecks ausfuehren
Rollback pruefbar halten
```
