# CURRENT STATUS

Stand: RDAP5B_AUTH_DB_SCHEMA_PLAN_DOCUMENTED  
Datum: 2026-06-23

## Aktueller bestätigter Stand

RDAP5B wurde als reiner Planungs-/Doku-Step erstellt. Es wurde nichts produktiv umgesetzt.

RDAP5B dokumentiert das DB-/Schema-Konzept fuer:

- User
- Twitch-Status
- lokale Rollen
- Modulrechte
- User-Allows
- User-Denies
- Sessions
- Locks
- Audit
- Agent-Registry

## Webserver-DB

Auf dem Webserver wurde eine MySQL/MariaDB-Datenbank angelegt:

```text
Server: web.cgn.community
Site: forrestcgn.de
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wurde nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Lokale SQLite

Die lokale produktive SQLite bleibt unveraendert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

RDAP5B ersetzt, migriert oder veraendert diese DB nicht.

## Pattern-Pruefung

Beim RDAP5B-Start wurden per GitHub-Code-Suche keine belastbaren Treffer gefunden fuer:

```text
DatabaseSync
CREATE TABLE IF NOT EXISTS
sqlite
app.sqlite
better-sqlite3
```

Daraus folgt:

- keine vorhandene DB-Migrationsdatei annehmen
- kein DB-Helper erfinden
- vor spaeterer Umsetzung echte Live-/Repo-Dateien erneut pruefen
- falls DB-Code vorhanden ist, aber nicht in GitHub-Suche auftaucht: Datei gezielt anfordern

## RDAP5A wichtige Entscheidungen

```text
Twitch MOD = Dashboard-Grundzugang moeglich
Twitch STREAMER/Broadcaster = Dashboard-Grundzugang
Twitch VIP = kein Dashboard-Grundzugang
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

## Nicht geändert durch RDAP5B

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
- keine Secrets

## Wichtige Leitplanken

- Keine produktive SQLite ersetzen oder löschen.
- Webserver-DB fuer Remote-Modboard/Auth getrennt planen.
- Keine Schreibfunktionen ohne Permission/Lock/Audit.
- Keine Agent-Aktionen ohne Allowlist.
- Keine freie Shell-/Datei-/Prozesssteuerung.
- Frontend zeigt Rechte nur an; Backend entscheidet.
- Jedes Modul braucht eigene Permission-Matrix.
- VIP ist kein Dashboard-Basiszugang.
