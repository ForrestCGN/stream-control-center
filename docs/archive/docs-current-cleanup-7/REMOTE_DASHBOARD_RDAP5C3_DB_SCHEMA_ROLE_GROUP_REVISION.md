# REMOTE DASHBOARD RDAP5C3 - DB Schema Role/Group Revision

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION  
Status: Planung/Korrektur, keine Umsetzung

## Zweck

RDAP5C3 korrigiert den DB-/Schema-Plan aus RDAP5B/RDAP5C passend zu RDAP5C2.

Wichtigste Änderung:

```text
Rollen und Gruppen werden getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
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
Kein npm install.
```

## Ausgangsstand

Webserver-DB ist vorhanden:

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

Lokale produktive SQLite bleibt unveraendert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Begriffskorrektur

Nicht mehr verwenden:

```text
lokale Rollen
sound_profi Rolle
sound_profi Permission-Bundle
```

Stattdessen:

```text
manuell vergebene Dashboard-Rollen
Dashboard-Gruppen / Markierungen
Modulfreigaben
```

## Zielmodell

### Twitch-Status

Automatisch beim Login/Refresh geprüft:

```text
streamer / broadcaster
mod
vip
```

Bedeutung:

```text
streamer -> Dashboard-Basiszugang
mod      -> Dashboard-Basiszugang
vip      -> kein Dashboard-Basiszugang, nur Community/Website
```

### Dashboard-Rollen

Manuell vergebene Rollen:

```text
leadmod
admin
owner
spaeter eigene Rollen optional
```

### Dashboard-Gruppen / Markierungen

Manuell vergebene Gruppen:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
spaeter eigene Gruppen optional
```

Wichtig:

```text
Gruppen geben nicht automatisch globale Rechte.
Gruppen sind Zielgruppen fuer Modulfreigaben.
```

## Revidiertes Tabellenkonzept

### dashboard_users

Zweck:

```text
User-Identitaet fuer Remote-Modboard
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
manual_base_access      TINYINT(1) DEFAULT 0
notes                   TEXT NULL
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
last_login_at           DATETIME NULL
last_role_check_at      DATETIME NULL
```

Hinweis:

```text
manual_base_access ist fuer explizite Betreiber-Ausnahmen.
VIP allein gibt keinen Dashboard-Basiszugang.
```

### dashboard_twitch_status

Zweck:

```text
aktueller Twitch-Status je User/Kanal
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

Unique:

```text
UNIQUE(user_id, channel_twitch_user_id)
```

Regel:

```text
is_vip ist Anzeige/Community-Status, kein Dashboard-Basiszugang.
```

### dashboard_roles

Zweck:

```text
manuell vergebene Dashboard-Rollen
```

Start-Rollen:

```text
leadmod
admin
owner
```

Felder:

```text
role_key                VARCHAR(80) PRIMARY KEY
label                   VARCHAR(150) NOT NULL
description             TEXT NULL
is_system               TINYINT(1) DEFAULT 0
is_assignable           TINYINT(1) DEFAULT 1
requires_base_access    TINYINT(1) DEFAULT 1
sort_order              INTEGER DEFAULT 100
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Empfohlene Startwerte:

```text
leadmod:
  requires_base_access = 1

admin:
  requires_base_access = 0 oder 1, finale Security-Entscheidung spaeter

owner:
  requires_base_access = 0
  is_system = 1
```

Nicht enthalten:

```text
sound_profi
```

### dashboard_user_roles

Zweck:

```text
Usern Dashboard-Rollen zuweisen
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

### dashboard_groups

Zweck:

```text
Zusatzgruppen / Markierungen / Zielgruppen fuer Modulfreigaben
```

Start-Gruppen:

```text
sound_profi
```

Spaeter optional:

```text
event_helfer
medien_helfer
eigene Gruppen
```

Felder:

```text
group_key               VARCHAR(80) PRIMARY KEY
label                   VARCHAR(150) NOT NULL
description             TEXT NULL
scope_hint              VARCHAR(120) NULL
is_system               TINYINT(1) DEFAULT 0
is_assignable           TINYINT(1) DEFAULT 1
requires_base_access    TINYINT(1) DEFAULT 1
sort_order              INTEGER DEFAULT 100
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Wichtig:

```text
Gruppen geben keine Rechte durch sich selbst.
Rechte entstehen erst ueber Modulfreigaben.
```

Beispiel Startwert:

```text
group_key: sound_profi
label: Sound-Profi
scope_hint: sound/media
requires_base_access: 1
```

### dashboard_user_groups

Zweck:

```text
Usern Zusatzgruppen / Markierungen zuweisen
```

Felder:

```text
user_group_id           VARCHAR(64) PRIMARY KEY
user_id                 VARCHAR(64) NOT NULL
group_key               VARCHAR(80) NOT NULL
is_enabled              TINYINT(1) DEFAULT 1
assigned_by_user_id     VARCHAR(64) NULL
assigned_at             DATETIME NOT NULL
expires_at              DATETIME NULL
reason                  TEXT NULL
```

Unique:

```text
UNIQUE(user_id, group_key)
```

### dashboard_permissions

Zweck:

```text
technische Permission-Keys intern definieren
```

Felder:

```text
permission_key          VARCHAR(120) PRIMARY KEY
module_key              VARCHAR(80) NOT NULL
action_key              VARCHAR(80) NOT NULL
label                   VARCHAR(150) NOT NULL
description             TEXT NULL
ui_label                VARCHAR(150) NULL
ui_group                VARCHAR(100) NULL
protection_level        VARCHAR(30) NOT NULL
requires_lock           TINYINT(1) DEFAULT 0
requires_audit          TINYINT(1) DEFAULT 1
is_active               TINYINT(1) DEFAULT 1
sort_order              INTEGER DEFAULT 100
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Wichtig:

```text
Permission-Keys sind intern.
Normale UI zeigt einfache Labels und Haekchen.
```

### dashboard_module_permission_matrix

Zweck:

```text
Streamerfreundliche Modulfreigaben pro Rolle/Gruppe
```

Diese Tabelle ersetzt starre globale Rollenrechte als Hauptkonzept.

Felder:

```text
matrix_id               VARCHAR(64) PRIMARY KEY
module_key              VARCHAR(80) NOT NULL
permission_key          VARCHAR(120) NOT NULL
target_type             VARCHAR(20) NOT NULL
target_key              VARCHAR(80) NOT NULL
effect                  VARCHAR(10) NOT NULL
is_enabled              TINYINT(1) DEFAULT 1
ui_label                VARCHAR(150) NULL
sort_order              INTEGER DEFAULT 100
created_at              DATETIME NOT NULL
updated_at              DATETIME NOT NULL
```

Werte:

```text
target_type:
  twitch_status
  role
  group
  user

effect:
  allow
  deny
```

Beispiele:

```text
module_key: sound
permission_key: sound.test
target_type: role
target_key: leadmod
effect: allow

module_key: sound
permission_key: sound.test
target_type: group
target_key: sound_profi
effect: allow

module_key: sound
permission_key: sound.delete
target_type: group
target_key: sound_profi
effect: deny
```

Wichtig:

```text
sound_profi bekommt nur Rechte, wenn in dieser Matrix pro Modul ein Allow gesetzt ist.
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
Deny gewinnt vor Allow, ausser expliziter Owner-Notfallmodus.
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
Session-Token nie im Klartext speichern.
HttpOnly/Secure/SameSite Cookies.
CSRF fuer Schreibaktionen.
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

## Entfernte / ueberholte Konzepte

Nicht mehr verwenden:

```text
dashboard_role_permissions als starres Hauptmodell fuer alles
sound_profi als role_key
sound_profi als globales permission_bundle
default_for_sound_profi als feste Spalte in Matrix
```

Warum?

```text
Es soll konfigurierbar pro Modul sein.
Neue Rollen/Gruppen sollen spaeter moeglich sein.
Feste Spalten wie default_for_sound_profi skalieren schlecht.
```

## Neues Matrix-Prinzip

Statt fester Spalten:

```text
default_for_mod
default_for_leadmod
default_for_admin
default_for_sound_profi
```

besser generisch:

```text
target_type
target_key
effect
```

Vorteil:

```text
neue Rollen ohne DB-Schema-Aenderung
neue Gruppen ohne DB-Schema-Aenderung
sound_profi pro Modul konfigurierbar
einfache UI-Haekchen weiterhin moeglich
```

## UI-Abbildung

Das Dashboard kann aus `dashboard_module_permission_matrix` einfache Haekchen bauen.

Beispiel:

```text
Modul: Sounds

Aktion             Mod   LeadMod   Admin   Owner   Sound-Profi
Ansehen            x     x         x       x       x
Testen             x     x         x       x       x
Hochladen          -     x         x       x       -
Loeschen           -     -         x       x       -
Konfigurieren      -     -         x       x       -
```

Intern:

```text
role: leadmod -> sound.upload allow
group: sound_profi -> sound.test allow
role: admin -> sound.delete allow
```

## Effektive Rechte berechnen

Ablauf:

```text
1. Session/User laden
2. Twitch-Status laden/refreshen
3. Dashboard-Basiszugang pruefen
4. Dashboard-Rollen laden
5. Dashboard-Gruppen laden
6. Matrix-Eintraege fuer Rollen/Gruppen/Twitch-Status/User laden
7. User-Overrides laden
8. Deny/Allow priorisieren
9. Backend entscheidet
```

Basiszugang:

```text
Twitch broadcaster
oder Twitch mod
oder manual_base_access
oder admin/owner nach finaler Regel
```

Kein Basiszugang:

```text
VIP allein
```

Gruppen-Regel:

```text
Gruppe ist nur wirksam, wenn requires_base_access erfuellt ist.
```

## Seeds

Start-Rollen:

```text
leadmod
admin
owner
```

Start-Gruppen:

```text
sound_profi
```

Start-Twitch-Targets fuer Matrix:

```text
twitch_status: broadcaster
twitch_status: mod
```

Nicht als Basisziel fuer Dashboard:

```text
twitch_status: vip
```

## Migrationshinweis

RDAP5C3 ist nur Planung.

Eine spaetere Migration muesste:

```text
dashboard_groups und dashboard_user_groups anlegen
sound_profi aus Rollen-Seeds entfernen
Matrix auf target_type/target_key umstellen
keine produktive SQLite anfassen
Backup vor MariaDB-Migration erstellen
schema_migrations nutzen
```

## Nicht-Umsetzung

RDAP5C3 baut nicht:

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
kein npm install
```

## Naechster sinnvoller Schritt

```text
RDAP5D_REMOTE_SERVER_NODE_ENV_CHECK
```

Jetzt kann als naechstes die Webserver-/Node-/ENV-Frage geklaert werden.
