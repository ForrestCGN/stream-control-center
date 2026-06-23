# CURRENT STATUS

Stand: RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF  
Datum: 2026-06-23

## Aktueller bestätigter Stand

RDAP5C4 wurde als reiner Doku-/Korrektur-/Übergabe-Step erstellt. Es wurde nichts produktiv umgesetzt.

Wichtige Korrektur:

```text
RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK muss nicht als kompletter Hauptstep wiederholt werden.
Node/npm/git/MariaDB-Client sind auf dem Webserver bereits bekannt vorhanden.
```

Nächster sinnvoller Hauptstep:

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

## Bekannter Webserver-Stand

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

Noch nicht umgesetzt:

```text
kein produktiver Remote-Modboard-Node-Service
kein Reverse Proxy fuer Remote-API
kein produktiver Remote-Agent
keine Agent-Actions
keine Remote-DB-Migration
kein produktiver Login/Auth-Service
```

## Webserver-DB

```text
Server: web.cgn.community
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wurde nicht dokumentiert und darf nicht ins Repo oder Frontend.

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

Empfehlung fuer spaetere MariaDB-Anbindung:

```text
mysql2/promise
```

Noch kein `npm install`.

## Rollen-/Gruppenmodell

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

## Revidierte Tabellen ab RDAP5C3

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

## Nicht geändert durch RDAP5C4

- kein Backend-Code
- kein Frontend-Code
- keine produktive SQLite
- keine MariaDB-Aenderung
- keine DB-Migration
- keine Schreibroute
- kein produktiver WSS-Agent
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands-/Kanalpunkte-Steuerung
- keine Datei-/Shell-/Prozesssteuerung
- kein Login-Code
- kein npm install
- keine Secrets
- keine nginx-/Service-Aenderung

## Wichtige Leitplanken

- Keine produktive SQLite ersetzen oder löschen.
- Webserver-DB fuer Remote-Modboard/Auth getrennt planen.
- Keine Schreibfunktionen ohne Permission/Lock/Audit.
- Keine DB-Migration ohne Backup-/Rollback-/Secret-Plan.
- Keine Agent-Aktionen ohne Allowlist.
- Keine freie Shell-/Datei-/Prozesssteuerung.
- Frontend zeigt Rechte nur an; Backend entscheidet.
- VIP ist kein Dashboard-Basiszugang.
- `sound_profi` hat keine festen globalen Rechte.
- Bekannte Infos nicht unnötig mehrfach prüfen.
