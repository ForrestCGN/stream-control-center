# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP7_LOGIN_SESSION_CONCEPT

## Diese Datei zuerst lesen

In einem neuen Chat immer zuerst diese Datei lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach mindestens diese Dateien pruefen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS.md
docs/current/RDAP7_LOGIN_SESSION_CONCEPT.md
docs/current/RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER.md
docs/current/RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST.md
docs/current/RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK.md
```

Wenn eine Datei in GitHub/dev fehlt: nicht raten, exakt sagen welche Datei fehlt.

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
Server-Testpfad zuletzt: /root/rdap6-test/stream-control-center
Uebergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestaetigter Stand

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet und deployed
RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
RDAP6I Auth DB Production Migration Runbook dokumentiert
RDAP6J Productive Migration Precheck bestanden und Backup erstellt
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich ausgefuehrt
RDAP6L Migrationsergebnis dokumentiert
RDAP7 Login-/Session-Konzept dokumentiert
```

## Remote-Modboard / Webserver-Stand

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
moduleBuild live: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
```

Live verfuegbare Read-only-Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
```

Bewusst weiterhin nicht aktiv:

```text
keine Remote-Writes
keine produktiven Agent-Actions
kein produktiver WSS-Agent
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Datei-/Shell-/Prozesssteuerung
keine Secrets im Repo oder Frontend
kein Login/Auth-Code aktiv
keine Session-Erstellung aktiv
```

## Webserver-DB

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## RDAP6K produktive Auth-DB-Migration

RDAP6K wurde auf `c3stream_control` erfolgreich ausgefuehrt.

Vorheriges Backup:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Ergebnis:

```text
schema.ready: true
missingTables: []
dashboard_roles: 6
dashboard_groups: 1
dashboard_permissions: 22
dashboard_role_permissions: 18
dashboard_module_permissions: 0
dashboard_sessions: 0
dashboard_locks: 0
dashboard_audit_log: 0
sound_profi_role_count: 0
sound_profi_group_marker_count: 1
sound_profi_role_permission_count: 0
```

Trotz produktiver Schema-/Seed-Migration bleibt das Remote-Modboard read-only:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## RDAP7 Konzept

RDAP7 ist nur Konzept/Doku fuer Login und Sessions.

Festgelegt:

```text
Twitch-OAuth als spaetere Login-Quelle
Sessions in dashboard_sessions
Cookies spaeter HttpOnly/Secure/SameSite
Session-ID nie roh in DB speichern
Rechteentscheidung immer serverseitig
Frontend ist keine Sicherheitsentscheidung
sound_profi bleibt Gruppe/Marker
VIP gibt keinen Dashboard-Basiszugang
```

Nicht aktiv:

```text
kein Login
keine Callback-Route aktiv
keine Session-Erstellung
keine Cookie-Ausgabe
keine Auth-Middleware aktiv
```

## Naechster sinnvoller Schritt

```text
RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN
```

Ziel:

```text
Read-only User-/Identity-/Session-Status-Endpunkte planen, ohne Login zu aktivieren.
```

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand pruefen.
- Nicht raten.
- Nur EIN Arbeitsort pro Schritt.
- Vor jedem Befehlsblock klar sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
- Maximal ein Befehlsblock pro Antwort.
- Umsetzung erst nach Forrests ausdruecklichem `go`.
- Keine Funktionalitaet entfernen.
- Keine produktive SQLite ersetzen, loeschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
