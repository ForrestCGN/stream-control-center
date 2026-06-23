# NEXT CHAT PROMPT - nach RDAP5C3

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Bitte zuerst den aktuellen Repo-/Doku-Stand prüfen und nicht raten.

## Projekt

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Remote-Modboard: https://mods.forrestcgn.de
Produktive lokale DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Zuerst zwingend lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
```

## Aktueller Stand

RDAP5C3 korrigiert das DB-Modell:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Revidierte Tabellen:

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

Passwort nicht erfragen oder dokumentieren.

## Nächster Auftrag

Starte mit:

```text
RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK
```

Ziel:

Klaeren, ob und wie Node fuer `mods.forrestcgn.de` auf `web.cgn.community` laufen kann.

Wichtig:

- Keine Installation.
- Kein npm install.
- Keine DB-Migration.
- Keine DB-Schreibaktion.
- Keine lokale SQLite anfassen.
- Keine Secrets posten oder dokumentieren.
- Keine Service-/Proxy-/Firewall-Aenderung ohne separates Go.

Moegliche reine Lesebefehle fuer den Server:

```bash
node -v
npm -v
which node
which npm
whoami
pwd
```

Danach Ergebnisse auswerten und naechsten sicheren Schritt planen.
