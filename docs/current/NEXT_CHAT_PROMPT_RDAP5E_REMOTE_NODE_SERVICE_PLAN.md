# NEXT CHAT PROMPT - RDAP5E Remote Modboard Node Service Plan

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

## Wichtig

Bitte zuerst den aktuellen Repo-/Doku-Stand prüfen und nicht raten.

Dieser Prompt basiert auf dem Stand:

```text
RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF
```

Die bisher vorgeschlagene Prüfung `RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK` ist als eigener Hauptstep nicht mehr sinnvoll, weil viele Server-Fakten bereits bekannt sind.

## Projekt

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel Stream-PC: D:\Streaming\stramAssets
Lokaler Stream-PC-Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2 lokal: http://127.0.0.1:8080/dashboard-v2/
Produktive lokale SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
Remote-Webserver: web.cgn.community
```

## Zuerst zwingend lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5_AUTH_USER_MODEL_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5A_TWITCH_BASE_ACCESS_NO_VIP_DASHBOARD.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5C_AUTH_DB_MIGRATION_DESIGN.md
docs/current/REMOTE_DASHBOARD_RDAP5C2_SIMPLE_ROLE_AND_MODULE_PERMISSION_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5C4_KNOWN_REMOTE_SERVER_FACTS.md
docs/current/NEXT_CHAT_PROMPT_RDAP5E_REMOTE_NODE_SERVICE_PLAN.md
```

## Bekannter Webserver-Stand

Diese Fakten sind bereits bekannt und sollen nicht unnötig erneut abgefragt werden:

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 läuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
noch kein produktiver Node-Service
noch kein Reverse Proxy fuer Remote-API
noch kein Remote-Agent
```

Ein frischer Gegencheck direkt vor Installation/Deployment ist erlaubt, aber nicht als kompletter neuer Planungsstep nötig.

## Webserver-DB

In ISPConfig wurde eine MariaDB/MySQL-Datenbank angelegt:

```text
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort nicht erfragen, nicht posten und nicht dokumentieren. Nur ENV-/Secret-Ablage planen.

## Lokale SQLite bleibt unberührt

Die lokale produktive SQLite bleibt unangetastet:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Keine Migration, kein Kopieren, kein Ersetzen, keine Löschung ohne separaten Plan und ausdrückliches Go.

## Aktueller Rollen-/Gruppen-/Rechte-Stand

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

## Revidiertes DB-Konzept

Geplante Tabellen ab RDAP5C3:

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

## package.json / Node-Abhängigkeiten

Bekannter Repo-Stand:

```text
type: commonjs
dotenv vorhanden
express vorhanden
sqlite3 vorhanden
ws vorhanden
mysql2 nicht vorhanden
mariadb nicht vorhanden
```

Empfehlung aus RDAP5C:

```text
mysql2/promise spaeter fuer MySQL/MariaDB nutzen
```

Aber: Kein `npm install` ohne separaten Plan und ausdrückliches Go.

## Nächster Auftrag

Starte mit:

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

Ziel:

Planen, wie der Remote-Modboard-Node-Service auf `web.cgn.community` für `mods.forrestcgn.de` aussehen soll.

Konkrete Planungspunkte:

```text
wo der Node-Service auf dem Webserver liegt
wie er gestartet/verwaltet wird
wie nginx / mods.forrestcgn.de zur Node-API routet
wo ENV/Secrets sicher liegen
wie mysql2 spaeter eingebunden wird
wie die MariaDB-Verbindung read-only/health getestet wird
welche erste read-only Health/API gebaut wird
wie Logging/Audit vorbereitet wird
wie der spaetere Stream-PC-Agent angebunden wird
wie keine freien Shell-/Datei-/Prozessbefehle moeglich sind
```

## RDAP5E darf

```text
Plan erstellen
Dateistruktur vorschlagen
Service-/nginx-/ENV-Konzept vorschlagen
Healthcheck-Konzept planen
erste read-only API planen
Tests planen
Rollback/Undo planen
```

## RDAP5E darf nicht ohne neues Go

```text
kein npm install
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
keinen produktiven Node-Service starten
keine nginx-/Firewall-/Proxy-Aenderung
keine Secrets ins Repo oder Frontend schreiben
keine Agent-Actions aktivieren
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine freie Shell-/Datei-/Prozesssteuerung
```

## Verbindliche Arbeitsweise

- Immer zuerst echte Dateien/Repo-/Live-Stand prüfen.
- Nicht raten.
- Wenn Dateien fehlen, exakt diese Dateien anfordern.
- Vor Code-/ZIP-Änderungen erst Scope nennen:
  - Ziel
  - betroffene Dateien
  - Nicht-Änderungen
  - Tests
  - Rollback
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen/löschen/neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter:
  `D:\Git\stream-control-center\_handoff\`
- Nicht ständig Desktop als Ziel verwenden.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- Bei Fehlern `stepundo.cmd` nutzen.

## Wichtige Korrektur aus dem letzten Chat

Nicht nochmal alles doppelt planen oder prüfen, was bereits bekannt ist.

Bekannt ist bereits:

```text
Node/npm/git/MariaDB-Client sind auf dem Webserver vorhanden.
mods.forrestcgn.de läuft per nginx/HTTPS und liefert 200 OK.
MariaDB-DB c1stream_control ist vorhanden.
```

Nächster Schritt ist die Remote-Node-Service-Planung, nicht nochmal ein reiner Node-Versionscheck.
