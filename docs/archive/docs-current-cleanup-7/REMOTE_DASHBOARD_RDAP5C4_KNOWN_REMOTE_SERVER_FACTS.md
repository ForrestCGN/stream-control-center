# REMOTE DASHBOARD RDAP5C4 - Known Remote Server Facts & Handoff

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF  
Status: Doku-/Korrektur-Step, keine Umsetzung

## Zweck

RDAP5C4 korrigiert den Übergabestand nach RDAP5C3.

Wichtige Korrektur:

```text
RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK ist als kompletter neuer Hauptstep nicht mehr sinnvoll.
Viele Webserver-/Node-Fakten sind bereits bekannt.
```

Der nächste sinnvolle Hauptstep ist daher:

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

## Bekannte Webserver-Fakten

Diese Informationen liegen bereits aus dem Projektverlauf vor:

```text
Webserver: web.cgn.community
Remote-Modboard-Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 läuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
```

Noch nicht vorhanden / noch nicht umgesetzt:

```text
kein produktiver Remote-Modboard-Node-Service
kein Reverse Proxy fuer Remote-API
kein produktiver Remote-Agent
keine Agent-Actions
keine Remote-DB-Migration
kein produktiver Login/Auth-Service
```

## Webserver-DB

In ISPConfig wurde eine MySQL/MariaDB-Datenbank angelegt:

```text
Server: web.cgn.community
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Das Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Lokale SQLite

Die lokale produktive SQLite bleibt unverändert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Keine Migration, kein Ersetzen, kein Löschen, kein Kopieren ohne separaten Plan und ausdrückliches Go.

## Repo-/Dependency-Stand

Aus RDAP5C:

```text
package.json:
  type: commonjs
  dotenv vorhanden
  express vorhanden
  sqlite3 vorhanden
  ws vorhanden
  mysql2 nicht vorhanden
  mariadb nicht vorhanden
```

Empfehlung für spätere MariaDB-Anbindung:

```text
mysql2/promise
```

Aber noch kein `npm install`.

## Rollen-/Gruppen-/Rechte-Stand

Ab RDAP5C3 gilt:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Twitch-Status:

```text
streamer / broadcaster
mod
vip
```

Auswirkung:

```text
streamer -> Dashboard-Basiszugang
mod      -> Dashboard-Basiszugang
vip      -> kein Dashboard-Basiszugang, nur Community/Website
```

Manuell vergebene Dashboard-Rollen:

```text
leadmod
admin
owner
spaeter eigene Rollen optional
```

Dashboard-Gruppen / Markierungen:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
spaeter eigene Gruppen optional
```

## Revidiertes DB-Konzept ab RDAP5C3

Geplante Tabellen:

```text
schema_migrations
dashboard_users
dashboard_twitch_status
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_module_permission_matrix
dashboard_user_permission_overrides
dashboard_sessions
dashboard_locks
dashboard_audit_log
agent_registry
```

Wichtig:

```text
dashboard_role_permissions ist nicht mehr starres Hauptmodell.
Modulmatrix nutzt target_type + target_key.
Keine festen Spalten wie default_for_sound_profi.
Neue Rollen/Gruppen spaeter ohne DB-Schema-Aenderung moeglich.
```

## Nächster sinnvoller Schritt

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

Ziel:

```text
Planen, wie der Remote-Modboard-Node-Service auf web.cgn.community fuer mods.forrestcgn.de aufgebaut wird.
```

Planungspunkte:

```text
Service-Pfad auf Webserver
Start-/Service-Konzept
nginx/Reverse-Proxy-Konzept
ENV-/Secret-Ablage
MariaDB-Verbindungsstrategie
erste read-only Health/API
Logging/Audit-Vorbereitung
spaetere Agent-Anbindung
keine freien Shell-/Datei-/Prozessbefehle
```

## Frischer Gegencheck

Ein kurzer Gegencheck direkt vor einer echten Installation ist sinnvoll, aber nicht als eigener langer Planungsstep.

Erlaubte reine Lesebefehle später:

```bash
node -v
npm -v
git --version
mysql --version
whoami
pwd
```

Keine Installation ohne separates Go.

## Nicht-Umsetzung

RDAP5C4 baut nicht:

```text
keinen Code
keine DB-Migration
keine SQLite-Aenderung
keine MariaDB-Aenderung
kein Login-Code
keine Schreibroute
kein Agent-Code
kein WSS-Agent
keine produktiven Aktionen
keine Frontend-Buttons
kein neues Backend-Modul
keine Secrets
kein npm install
keine nginx-/Service-Aenderung
```
