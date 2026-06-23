# CURRENT STATUS

Stand: RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN  
Datum: 2026-06-23

## Aktueller bestätigter Arbeitsstand

RDAP5G dokumentiert den Installationsplan fuer das in RDAP5F vorbereitete separate Remote-Modboard-Node-Basispaket.

Neue Basis aus RDAP5F:

```text
remote-modboard/backend/
```

RDAP5G ist reine Planung.

## Enthalten in RDAP5G

```text
Webserver-Zielpfad geplant
Service-User-Konzept geplant
ENV-/Secret-Datei geplant
npm install nur im separaten remote-modboard/backend geplant
systemd-Service-Konzept geplant
nginx-Reverse-Proxy fuer /api/remote/ geplant
optionaler /ws/agent Pfad fuer spaeter dokumentiert
Healthchecks nach Start geplant
Rollback/Undo geplant
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

## Nicht geändert durch RDAP5G

```text
kein produktiver Node-Service gestartet
kein npm install ausgefuehrt
keine nginx-Aenderung
keine systemd-Aenderung
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
kein Login/Auth
kein WSS-Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Datei-/Shell-/Prozesssteuerung
keine Secrets
backend/server.js unveraendert
backend/modules/remote_agent.js unveraendert
Root-package.json unveraendert
```

## Wichtiger erkannter Altstand

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort weiterhin als Rolle/Permission-Preset.

Das ist seit RDAP5C3 fachlich ueberholt.

Dieser Punkt bleibt verbindlich in TODO.md und wird nicht in RDAP5G repariert.

## Nächster sinnvoller Schritt

```text
RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE
```

Ziel: konkretes Installationspaket/Anweisungen fuer Webserver-Pfad, ENV-Datei, npm install im separaten Remote-Paket, systemd und nginx-Reverse-Proxy vorbereiten.

RDAP5H erst nach separatem Go.
