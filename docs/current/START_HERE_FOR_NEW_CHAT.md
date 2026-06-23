# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP5B_AUTH_DB_SCHEMA_PLAN_DOCUMENTED

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
docs/current/NEXT_CHAT_PROMPT_RDAP5C_AFTER_RDAP5B.md
```

## Repository und Pfade

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2: http://127.0.0.1:8080/dashboard-v2/
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
Übergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestätigter Stand

```text
RDAP5B dokumentiert das DB-/Schema-Konzept fuer Remote-Modboard/Auth/User/Rollen/Permissions/Sessions/Locks/Audit.
```

Webserver-DB vorhanden:

```text
Server: web.cgn.community
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

Lokale SQLite bleibt unveraendert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## RDAP5A Rollen-/Rechte-Grundsatz

```text
Twitch MOD = Dashboard-Grundzugang moeglich
Twitch STREAMER/Broadcaster = Dashboard-Grundzugang
Twitch VIP = Community-/Website-Status, kein Dashboard-Grundzugang
```

Lokale Rollen/Freigaben:

```text
LEADMOD = manuell lokal
ADMIN = manuell lokal
OWNER = manuell lokal / Systemhoheit
SOUND_PROFI = lokale Zusatzfreigabe
User-Allow = direkte Zusatzfreigabe
User-Deny = direkte Sperre
```

## RDAP5B geplante Tabellen

```text
dashboard_users
dashboard_twitch_status
dashboard_roles
dashboard_user_roles
dashboard_permissions
dashboard_role_permissions
dashboard_user_permission_overrides
dashboard_module_permission_matrix
dashboard_sessions
dashboard_locks
dashboard_audit_log
agent_registry
```

## Weiterhin bewusst nicht aktiv

```text
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
```

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand prüfen, nicht raten.
- Vor Code-/ZIP-Änderungen Scope, betroffene Dateien, Nicht-Änderungen und Tests nennen.
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Bei fehlenden Dateien exakt diese Dateien anfordern.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen, löschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `_handoff`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- `stepundo.cmd` nutzen, wenn ein Teststand kaputt ist.

## Nächster sinnvoller Schritt

```text
RDAP5C_AUTH_DB_MIGRATION_DESIGN
```

Ziel:

- Migration-/Helper-Design fuer die Webserver-DB planen.
- Noch keine Migration ausfuehren.
- Vorher echte Server-/Node-/DB-Zugriffsmoeglichkeiten klaeren.
- Secrets sicher planen.
