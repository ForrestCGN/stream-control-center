# CURRENT STATUS

Stand: RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE  
Datum: 2026-06-23

## Aktueller bestätigter Arbeitsstand

RDAP5F bereitet das erste separate Remote-Modboard-Node-Basispaket vor.

Neue Basis:

```text
remote-modboard/backend/
```

Ziel:

```text
Read-only Remote-Modboard-Service fuer web.cgn.community / mods.forrestcgn.de vorbereiten.
```

## Enthalten

```text
GET /api/remote/health
GET /api/remote/status
GET /api/remote/routes
```

Alle Routen sind read-only.

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

## Nicht geändert durch RDAP5F

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

RDAP5F aendert diese Datei bewusst noch nicht, setzt aber einen verbindlichen TODO fuer einen spaeteren Korrekturstep.

## Nächster sinnvoller Schritt

```text
RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN
```

Ziel: Webserver-Installationsplan fuer Pfade, ENV, npm install im separaten Remote-Paket, systemd und nginx-Reverse-Proxy vorbereiten.
