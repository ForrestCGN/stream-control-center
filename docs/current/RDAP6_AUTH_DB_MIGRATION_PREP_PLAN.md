# RDAP6 Auth DB Migration Prep Plan

Stand: 2026-06-23

## Ziel

RDAP6 bereitet Auth-, Session-, Rollen-, Gruppen- und Modulrechte fuer das Remote Dashboard / Modboard vor.

Dieser Stand ist nur Planung und Vorbereitung. Es werden keine produktiven Datenbanken veraendert und keine Auth-/Session-/Write-Funktionen aktiviert.

## Strikte Nicht-Aenderungen

In diesem Prep-Step nicht erlaubt:

- keine produktive MariaDB-Struktur aendern
- keine produktive SQLite aendern
- keine Migration ausfuehren
- keine Auth aktivieren
- keine Sessions aktivieren
- keine Remote-Schreibfunktionen aktivieren
- keine Agent-Aktionen aktivieren
- keine OBS-/Sound-/Overlay-/Command-Steuerung aktivieren
- keine Secrets ins Repo, Frontend oder Chat schreiben
- keine freien Shell-/Datei-/Prozessbefehle einfuehren

## Ausgangsstand

Bestaetigt:

- Remote-Node ist read-only erreichbar.
- RDAP5J Monitoring/Hardening ist live getestet.
- RDAP4B Remote-Agent-Modell wurde auf RDAP5C3 korrigiert.
- `sound_profi` ist Gruppe/Marker, keine Rolle.
- Rollen und Gruppen bleiben getrennt.
- Konkrete Rechte sollen spaeter ueber eine Modulmatrix mit `target_type` + `target_key` vergeben werden.

## Backup-Konzept vor jeder echten Migration

Vor einer echten DB-Migration ist Pflicht:

1. Datenbankname, User und Host aus Server-Env pruefen.
2. Backup-Verzeichnis festlegen.
3. MariaDB-Dump erstellen.
4. Dump-Groesse pruefen.
5. Restore-Test mindestens in Testdatenbank planen.
6. Migration erst nach erfolgreichem Backup und separatem Go.

Beispiel nur als Schema, nicht blind ausfuehren:

```bash
mysqldump --single-transaction --routines --triggers --events DB_NAME > /root/backups/stream_control_YYYYMMDD_HHMMSS.sql
```

Wichtig:

- Keine Passwoerter in Befehle schreiben, die in Shell-History landen.
- Keine Dumps ins Repo legen.
- Keine Dumps in oeffentliche Webpfade legen.

## Migrationsprinzip

Jede spaetere Migration muss:

- idempotent sein, soweit sinnvoll.
- in `schema_migrations` protokolliert werden.
- keine bestehenden Daten loeschen.
- keine Tabellen blind droppen.
- keine Spalten ohne Fallback entfernen.
- Rollback-Hinweise dokumentieren.
- Audit-relevante Aenderungen vorbereiten.

## Geplante Basistabellen

### schema_migrations

Zweck:

- welche Migration wurde wann angewendet.

Geplante Felder:

```text
id
migration_key
version
applied_at
checksum
status
notes
```

### dashboard_users

Zweck:

- lokale Dashboard-User / Personenmodell.

Geplante Felder:

```text
id
user_uid
display_name
login_name
status
created_at
updated_at
last_login_at
```

### dashboard_identities

Zweck:

- Twitch-/Discord-/lokale Identitaeten an Dashboard-User binden.

Geplante Felder:

```text
id
user_uid
provider
provider_user_id
provider_login
provider_display_name
is_primary
created_at
updated_at
```

### dashboard_roles

Zweck:

- echte Rollen.

Geplante Standardrollen:

```text
owner
admin
lead_mod
mod
media_manager
readonly
```

Nicht enthalten:

```text
sound_profi
```

`sound_profi` ist keine Rolle.

### dashboard_user_roles

Zweck:

- Zuordnung User zu Rollen.

Geplante Felder:

```text
id
user_uid
role_key
granted_by
granted_at
revoked_at
```

### dashboard_groups

Zweck:

- Gruppen/Marker getrennt von Rollen.

Geplante Gruppen/Marker:

```text
sound_profi
```

### dashboard_user_groups

Zweck:

- Zuordnung User zu Gruppen/Markierungen.

Geplante Felder:

```text
id
user_uid
group_key
granted_by
granted_at
revoked_at
```

### dashboard_permissions

Zweck:

- technische Permission-Keys.

Beispiele:

```text
dashboard.read
media.read
media.upload
media.edit
media.delete
sound.read
sound.test
sound.command.edit
channelpoints.edit
agent.status.read
```

### dashboard_role_permissions

Zweck:

- Rollen-Presets fuer allgemeine Rechte.

Wichtig:

- kein `sound_profi` in dieser Tabelle als Rolle.

### dashboard_module_permissions

Zweck:

- konkrete Rechte pro Zieltyp/Zielschluessel.

Geplante Felder:

```text
id
subject_type
subject_key
permission_key
target_type
target_key
effect
created_by
created_at
updated_at
```

Beispiele fuer `subject_type`:

```text
user
role
group
```

Beispiele fuer `target_type`:

```text
module
media_folder
sound_category
command_group
channelpoints_reward
```

Beispiele fuer `effect`:

```text
allow
deny
```

Damit kann `sound_profi` als Gruppe gezielt Rechte fuer Sound-/Media-Ziele bekommen, ohne globale Rolle oder Owner-/Security-Rechte zu sein.

### dashboard_locks

Zweck:

- Multi-User-Locks fuer kritische Bearbeitungsbereiche.

Geplante Felder:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

### dashboard_audit_log

Zweck:

- nachvollziehen, wer wann was gemacht hat.

Geplante Felder:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

Retention muss konfigurierbar sein.

## Sicherheitsregeln fuer Auth und Sessions

Spaeter erst aktivieren, wenn vorbereitet:

- Session-Cookies `HttpOnly`, `Secure`, `SameSite` setzen.
- CSRF-Schutz fuer schreibende Aktionen planen.
- Login-Rate-Limits planen.
- Session-Invalidierung planen.
- Rollen/Rechte immer serverseitig pruefen.
- Frontend darf Rechte nur anzeigen, nie entscheiden.
- Audit fuer kritische Aktionen ist Pflicht.

## Migrationsreihenfolge spaeter

Nur nach separatem Go:

1. Backup erstellen und pruefen.
2. `schema_migrations` anlegen.
3. Basistabellen fuer User/Identities/Roles/Groups anlegen.
4. Permission-Tabellen anlegen.
5. Modulmatrix anlegen.
6. Locks/Audit-Tabellen anlegen.
7. Seeds fuer Standardrollen und `sound_profi` Gruppe eintragen.
8. Read-only Status pruefen.
9. Noch keine Auth aktivieren.
10. Erst in spaeterem Step Login/Auth aktivieren.

## Testplan fuer RDAP6-Prep

Fuer den Planungsstand:

- Doku pruefen.
- Keine DB-Aenderung erfolgt.
- Keine Auth aktiv.
- Keine Session aktiv.
- Remote-Node bleibt read-only.
- Remote-Agent-Modell bleibt RDAP5C3.

Fuer spaetere echte Migration:

- Migration auf Testdatenbank ausfuehren.
- Tabellen vorhanden.
- Seeds korrekt.
- `sound_profi` nur in Gruppen/Markern.
- keine produktiven Schreibaktionen aktiv.
- Rollback/Restore dokumentiert.

## Naechster Schritt

Nach diesem Prep-Plan koennen wir separat planen:

```text
RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE
```

Dieser naechste Step soll nur ein Dry-Run-/SQL-/Doku-Paket vorbereiten, noch keine produktive Migration ausfuehren.
