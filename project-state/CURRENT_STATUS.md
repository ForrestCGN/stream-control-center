# CURRENT STATUS

Stand: RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION_DOCUMENTED  
Datum: 2026-06-23

## Aktueller bestätigter Stand

RDAP5C3 wurde als reiner Planungs-/Doku-Step erstellt. Es wurde nichts produktiv umgesetzt.

RDAP5C3 korrigiert den DB-/Schema-Plan:

- Rollen und Gruppen sind getrennt.
- `sound_profi` ist keine Rolle.
- `sound_profi` ist keine feste Rechte-Sammlung.
- `sound_profi` ist eine Gruppe / Markierung.
- Modulrechte werden pro Modul konfiguriert.
- Die Modulmatrix nutzt `target_type` und `target_key`.
- Feste Spalten wie `default_for_sound_profi` sollen nicht verwendet werden.
- `dashboard_role_permissions` ist nicht mehr das starre Hauptmodell.

## Webserver-DB

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

RDAP5C3 ersetzt, migriert oder veraendert diese DB nicht.

## Rollen-/Gruppenmodell

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

## Revidierte Tabellen

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

## Nicht geändert durch RDAP5C3

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
- Modulfreigaben sollen streamerfreundlich per Haekchen konfigurierbar werden.
