# REMOTE DASHBOARD RDAP5B - Auth DB Schema Plan

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5B_AUTH_DB_SCHEMA_PLAN  
Status: Planung, keine Umsetzung

## Zweck

RDAP5B plant das DB-/Migrationskonzept fuer das spaetere Remote-Modboard:

```text
User
Twitch-Status
lokale Rollen
Modulrechte
User-Allows
User-Denies
Sessions
Locks
Audit
Agent-Registry
```

Dies ist nur Planung.

```text
Keine DB-Migration.
Keine SQLite-Aenderung.
Keine MariaDB-Aenderung.
Kein Login-Code.
Keine Schreibroute.
Keine produktive Aktion.
Keine Secrets.
```

## Aktueller DB-Stand

Auf dem Webserver wurde eine MySQL/MariaDB-Datenbank angelegt.

```text
Server: web.cgn.community
Site: forrestcgn.de
DB-Typ: MySQL/MariaDB
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
Zweck: spaeter Remote-Modboard/Auth/User/Rollen/Permissions/Sessions/Locks/Audit
```

Das Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

Die lokale produktive SQLite bleibt unveraendert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Ergebnis der Pattern-Pruefung

Beim RDAP5B-Start wurden im GitHub/dev-Repo per Code-Suche keine belastbaren Treffer gefunden fuer:

```text
DatabaseSync
CREATE TABLE IF NOT EXISTS
sqlite
app.sqlite
better-sqlite3
```

Daraus folgt:

```text
Keine vorhandene DB-Migrationsdatei annehmen.
Kein DB-Helper erfinden.
Vor spaeterer Umsetzung echte Live-/Repo-Dateien erneut pruefen.
Wenn DB-Code vorhanden ist, aber nicht in GitHub-Suche auftaucht: Datei gezielt anfordern.
```

Vorhandene relevante Helper:

```text
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_routes.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_state.js
backend/core/security.js
backend/core/paths.js
```

## Grundentscheidung

RDAP5B plant zwei getrennte DB-Welten:

```text
1. Lokale Stream-PC SQLite
   - bleibt produktiv fuer bestehende Stream-Control-Center-Daten
   - wird nicht ersetzt
   - wird nicht ueberschrieben
   - wird nicht in RDAP5B migriert

2. Webserver MySQL/MariaDB
   - neue DB fuer Remote-Modboard
   - Auth/User/Rollen/Permissions/Sessions/Locks/Audit
   - spaeter DB-portabel planen
```

## DB-portables Design

Da spaeter MariaDB relevant ist, sollen keine unnoetigen SQLite-Spezialfaelle erzwungen werden.

Empfohlen:

```text
IDs als VARCHAR/CHAR statt SQLite-only rowid-Abhaengigkeit
Timestamps als ISO-String oder DATETIME konsistent planen
JSON nur fuer flexible Metadaten, aber Kernrechte normalisiert speichern
Booleans als TINYINT(1) / INTEGER 0/1 kompatibel
Indizes explizit planen
Unique Constraints explizit planen
```

## Tabellenkonzept

### dashboard_users

Zweck:

```text
lokale User-Identitaet fuer Remote-Modboard
Verknuepfung mit Twitch
Basisdaten fuer Anzeige
```

Felder:

```text
user_id                 VARCHAR(64) PRIMARY KEY
twitch_user_id          VARCHAR(64) UNIQUE NOT NULL
twitch_login            VARCHAR(100) NOT NULL
twitch_display_name     VARCHAR(150)
twitch_avatar_url       TEXT
is_enabled              TINYINT(1) DEFAULT 1
local_base_access       TINYINT(1) DEFAULT 0
notes                   TEXT NULL
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
last_login_at           DATETIME NULL
last_role_check_at      DATETIME NULL
```

Hinweise:

```text
local_base_access ist fuer explizite lokale Ausnahmen.
VIP allein gibt keinen Dashboard-Basiszugang.
```

### dashboard_twitch_status

Zweck:

```text
aktueller Twitch-Status je User/Kanal
wird bei Login/Refresh neu geprueft
```

Felder:

```text
status_id               VARCHAR(64) PRIMARY KEY
user_id                 VARCHAR(64) NOT NULL
channel_twitch_user_id  VARCHAR(64) NOT NULL
is_broadcaster          TINYINT(1) DEFAULT 0
is_moderator            TINYINT(1) DEFAULT 0
is_vip                  TINYINT(1) DEFAULT 0
checked_at              DATETIME NOT NULL
source                  VARCHAR(50) DEFAULT 'twitch'
raw_summary_json        TEXT NULL
```

Regeln:

```text
is_moderator -> Dashboard-Basiszugang moeglich
is_broadcaster -> Dashboard-Basiszugang
is_vip -> Community-/Website-Status, kein Dashboard-Basiszugang
```

Unique:

```text
UNIQUE(user_id, channel_twitch_user_id)
```

### dashboard_roles

Zweck:

```text
lokale Rollen definieren
```

Startwerte:

```text
leadmod
admin
owner
sound_profi
```

Optional als Anzeige-/Planrollen:

```text
mod_base
streamer_base
vip_community
```

Felder:

```text
role_key                VARCHAR(80) PRIMARY KEY
label                   VARCHAR(150) NOT NULL
description             TEXT NULL
is_system               TINYINT(1) DEFAULT 0
is_assignable           TINYINT(1) DEFAULT 1
requires_base_access    TINYINT(1) DEFAULT 1
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Regeln:

```text
leadmod requires_base_access = 1
sound_profi requires_base_access = 1
admin requires_base_access = 0 oder 1 je nach finaler Security-Entscheidung
owner requires_base_access = 0
```

### dashboard_user_roles

Zweck:

```text
lokale Rollen an User vergeben
```

Felder:

```text
user_role_id            VARCHAR(64) PRIMARY KEY
user_id                 VARCHAR(64) NOT NULL
role_key                VARCHAR(80) NOT NULL
is_enabled              TINYINT(1) DEFAULT 1
assigned_by_user_id     VARCHAR(64) NULL
assigned_at             DATETIME NOT NULL
expires_at              DATETIME NULL
reason                  TEXT NULL
```

Unique:

```text
UNIQUE(user_id, role_key)
```

### dashboard_permissions

Zweck:

```text
alle bekannten Permission-Keys zentral definieren
```

Felder:

```text
permission_key          VARCHAR(120) PRIMARY KEY
module_key              VARCHAR(80) NOT NULL
action_key              VARCHAR(80) NOT NULL
label                   VARCHAR(150) NOT NULL
description             TEXT NULL
protection_level        VARCHAR(30) NOT NULL
requires_lock           TINYINT(1) DEFAULT 0
requires_audit          TINYINT(1) DEFAULT 1
is_active               TINYINT(1) DEFAULT 1
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Beispiele:

```text
dashboard.read
admin.users.read
admin.users.manage
admin.roles.manage
admin.audit.read
sound.read
sound.test
sound.upload
sound.edit
sound.delete
sound.command.edit
events.read
events.start
events.stop
events.config.edit
loyalty.points.adjust
obs.scene.switch
agent.status.read
agent.action.requested
```

### dashboard_role_permissions

Zweck:

```text
Standardrechte pro lokaler Rolle
```

Felder:

```text
role_permission_id      VARCHAR(64) PRIMARY KEY
role_key                VARCHAR(80) NOT NULL
permission_key          VARCHAR(120) NOT NULL
effect                  VARCHAR(10) NOT NULL
created_at              DATETIME NOT NULL
```

Regel:

```text
effect: allow oder deny
```

Unique:

```text
UNIQUE(role_key, permission_key)
```

### dashboard_user_permission_overrides

Zweck:

```text
direkte User-Allows und User-Denies
```

Felder:

```text
override_id             VARCHAR(64) PRIMARY KEY
user_id                 VARCHAR(64) NOT NULL
permission_key          VARCHAR(120) NOT NULL
effect                  VARCHAR(10) NOT NULL
resource_key            VARCHAR(200) NULL
is_enabled              TINYINT(1) DEFAULT 1
assigned_by_user_id     VARCHAR(64) NULL
assigned_at             DATETIME NOT NULL
expires_at              DATETIME NULL
reason                  TEXT NULL
```

Regeln:

```text
effect = allow oder deny
deny gewinnt vor allow, ausser expliziter Owner-Notfallmodus
resource_key optional fuer modul-/ressourcenspezifische Ausnahmen
```

### dashboard_module_permission_matrix

Zweck:

```text
modulfreundliche Rechte-Matrix fuer Dashboard-UX
```

Felder:

```text
matrix_id               VARCHAR(64) PRIMARY KEY
module_key              VARCHAR(80) NOT NULL
permission_key          VARCHAR(120) NOT NULL
ui_group                VARCHAR(100) NULL
ui_label                VARCHAR(150) NOT NULL
ui_level                VARCHAR(50) NULL
default_for_mod         TINYINT(1) DEFAULT 0
default_for_leadmod     TINYINT(1) DEFAULT 0
default_for_streamer    TINYINT(1) DEFAULT 0
default_for_admin       TINYINT(1) DEFAULT 0
default_for_sound_profi TINYINT(1) DEFAULT 0
is_visible_in_admin     TINYINT(1) DEFAULT 1
sort_order              INTEGER DEFAULT 100
```

Beispiel UI-Level:

```text
ansehen
starten/testen
bearbeiten
loeschen
konfigurieren
admin
```

### dashboard_sessions

Zweck:

```text
Remote-Modboard Sessions
```

Felder:

```text
session_id              VARCHAR(128) PRIMARY KEY
user_id                 VARCHAR(64) NOT NULL
session_hash            VARCHAR(255) NOT NULL
created_at              DATETIME NOT NULL
last_seen_at            DATETIME NOT NULL
expires_at              DATETIME NOT NULL
revoked_at              DATETIME NULL
ip_hash                 VARCHAR(255) NULL
user_agent_hash         VARCHAR(255) NULL
csrf_token_hash         VARCHAR(255) NULL
```

Regeln:

```text
Session-Token nie im Klartext speichern
HttpOnly/Secure/SameSite Cookies
CSRF fuer Schreibaktionen
```

### dashboard_locks

Zweck:

```text
Bearbeitungslocks fuer Ressourcen
```

Felder:

```text
lock_id                 VARCHAR(64) PRIMARY KEY
resource_key            VARCHAR(200) NOT NULL
resource_version        VARCHAR(100) NULL
owner_user_id           VARCHAR(64) NOT NULL
state                   VARCHAR(40) NOT NULL
created_at              DATETIME NOT NULL
heartbeat_at            DATETIME NOT NULL
expires_at              DATETIME NOT NULL
released_at             DATETIME NULL
takeover_by_user_id     VARCHAR(64) NULL
takeover_at             DATETIME NULL
reason                  TEXT NULL
```

Regeln:

```text
resource_key Format: <bereich>:<modul>:<resource-id>
Speichern nur mit gueltigem Lock + Resource-Version
Owner/Admin-Takeover auditpflichtig
```

Index:

```text
INDEX(resource_key, state)
INDEX(owner_user_id)
```

### dashboard_audit_log

Zweck:

```text
Audit fuer Login, Permission-Checks, Locks, Schreibaktionen und Agent-Aktionen
```

Felder:

```text
audit_id                VARCHAR(64) PRIMARY KEY
timestamp               DATETIME NOT NULL
actor_user_id           VARCHAR(64) NULL
actor_display_name      VARCHAR(150) NULL
source                  VARCHAR(80) NOT NULL
action                  VARCHAR(120) NOT NULL
permission_key          VARCHAR(120) NULL
resource_key            VARCHAR(200) NULL
old_value_summary       TEXT NULL
new_value_summary       TEXT NULL
status                  VARCHAR(40) NOT NULL
request_id              VARCHAR(100) NULL
correlation_id          VARCHAR(100) NULL
ip_hash                 VARCHAR(255) NULL
user_agent_hash         VARCHAR(255) NULL
details_json            TEXT NULL
```

Regeln:

```text
keine Secrets im Audit
sensible Werte maskieren
Retention konfigurierbar
```

### agent_registry

Zweck:

```text
spaetere registrierte Stream-PC-Agenten
```

Felder:

```text
agent_id                VARCHAR(80) PRIMARY KEY
agent_name              VARCHAR(150) NOT NULL
agent_secret_hash       VARCHAR(255) NOT NULL
is_enabled              TINYINT(1) DEFAULT 1
allowed_actions_json    TEXT NULL
last_seen_at            DATETIME NULL
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
created_by_user_id      VARCHAR(64) NULL
```

Regeln:

```text
Agent-Secret nie im Klartext speichern
nur Allowlist-Actions
keine freien Shell-/Datei-/Prozessaktionen
```

## Effektive Rechte berechnen

Geplante Schritte:

```text
1. User anhand Session laden
2. Twitch-Status pruefen/refreshen
3. Dashboard-Basiszugang berechnen
4. lokale Rollen laden
5. Rollen-Permissions laden
6. User-Overrides laden
7. Modulmatrix anwenden
8. Deny/Allow priorisieren
9. Ergebnis fuer Backend-Aktion verwenden
10. optional Ergebnis fuer Frontend-UI ausgeben
```

Basiszugang:

```text
Twitch MOD
oder Twitch STREAMER/Broadcaster
oder lokale Rolle ADMIN
oder lokale Rolle OWNER
oder local_base_access
```

VIP:

```text
kein Dashboard-Basiszugang
nur Community-/Website-Status
```

Prioritaet:

```text
OWNER / Notfallmodus
explizites User-Deny
explizites User-Allow
lokale Rollen
Twitch-Basisrollen MOD/STREAMER
Modulmatrix
keine Freigabe = verboten
```

## Migrationsregeln

Spaetere Migrationen duerfen nur sanft sein:

```text
CREATE TABLE IF NOT EXISTS
CREATE INDEX IF NOT EXISTS bzw. DB-kompatible Pruefung
ALTER TABLE nur nach Spaltenpruefung
keine Tabellen loeschen
keine produktive SQLite ersetzen
Backup vor Migration
Migration versionieren
Rollback-Hinweise dokumentieren
```

## Config-/Secret-Regeln

Geplante Config-Dateien spaeter:

```text
config/remote_dashboard_auth.json
config/remote_dashboard_db.json
```

Geplante Secrets niemals ins Repo:

```text
secrets/remote_dashboard_db.env
secrets/twitch_oauth.env
secrets/agent_secrets.env
```

Alternativ ENV im Webserver.

Keine Secrets im Frontend:

```text
kein DB-Passwort
kein Agent-Secret
kein Twitch Client Secret
kein Session Secret
```

## RDAP5B Nicht-Umsetzung

RDAP5B baut nicht:

```text
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
```

## Naechste moegliche Schritte

```text
RDAP5C_AUTH_DB_MIGRATION_DESIGN
```

Konkretes Migration-/Helper-Design, aber noch ohne produktive Ausfuehrung.

```text
RDAP6_MINIMAL_REMOTE_AUTH_IMPLEMENTATION
```

Erst nach Migration-Plan, echter Datei-/DB-Pruefung und separatem Go.
