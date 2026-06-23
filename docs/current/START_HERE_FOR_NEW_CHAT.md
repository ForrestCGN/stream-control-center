# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF

## Diese Datei zuerst lesen

In einem neuen Chat immer zuerst diese Datei lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach mindestens diese Dateien prüfen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
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

## Repository und Pfade

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
Übergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestätigter Stand

RDAP5C4 korrigiert den Übergabestand:

```text
Node/npm/git/MariaDB-Client sind auf dem Webserver bereits bekannt vorhanden.
RDAP5D als reiner Node-Check ist nicht mehr der nächste Hauptstep.
Nächster sinnvoller Hauptstep ist RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.
```

## Bekannter Webserver-Stand

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

Ein kurzer Gegencheck direkt vor Installation/Deployment ist erlaubt, aber nicht wieder alles doppelt planen.

## Webserver-DB

```text
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Lokale SQLite bleibt unverändert

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Keine Migration, kein Ersetzen, kein Löschen, kein Kopieren ohne separaten Plan und ausdrückliches Go.

## Rollen-/Gruppenmodell ab RDAP5C3

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

Wichtig:

```text
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

## Revidiertes DB-Konzept

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

## Weiterhin bewusst nicht aktiv

```text
kein produktiver Remote-Modboard-Node-Service
kein produktiver WSS-Agent
keine Agent-Actions
keine Schreibroute
keine DB-Migration
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Commands-/Kanalpunkte-Steuerung
keine Datei-/Shell-/Prozesssteuerung
kein Login/Auth-Code
keine Secrets im Repo oder Frontend
kein npm install
keine nginx-/Service-Aenderung
```

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand prüfen.
- Nicht raten.
- Nicht bekannte Infos doppelt und dreifach abfragen.
- Wenn Dateien fehlen, exakt diese Dateien anfordern.
- Vor Code-/ZIP-Änderungen Scope nennen:
  - Ziel
  - betroffene Dateien
  - Nicht-Änderungen
  - Tests
  - Rollback
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen, löschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `_handoff`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- Bei Fehlern `stepundo.cmd` nutzen.

## Nächster sinnvoller Schritt

```text
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

Ziel:

```text
Planen, wie der Remote-Modboard-Node-Service auf web.cgn.community fuer mods.forrestcgn.de aufgebaut wird.
```

Noch keine Installation, keine Migration, kein npm install, keine nginx-/Service-Aenderung.
