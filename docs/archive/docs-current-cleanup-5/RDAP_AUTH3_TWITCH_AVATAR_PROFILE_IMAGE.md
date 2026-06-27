# RDAP_AUTH3_TWITCH_AVATAR_PROFILE_IMAGE

Stand: 2026-06-24

## Ziel

Der Remote-Modboard-Login soll den Twitch-Avatar des aktuell eingeloggten Users anzeigen koennen.

Dazu wird `profile_image_url` aus der Twitch Helix User-Antwort uebernommen, gespeichert und in `/api/remote/auth/me` wieder ausgegeben.

## Geaenderte Dateien

```text
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
db/rdap_auth3/sql/001_rdap_auth3_avatar_columns.sql
docs/current/RDAP_AUTH3_TWITCH_AVATAR_PROFILE_IMAGE.md
```

## DB-Erweiterung

Optional und sanft:

```sql
ALTER TABLE dashboard_users
  ADD COLUMN profile_image_url VARCHAR(500) NULL AFTER login_name;

ALTER TABLE dashboard_identities
  ADD COLUMN provider_profile_image_url VARCHAR(500) NULL AFTER provider_display_name;
```

Die mitgelieferte SQL-Datei prueft vorher per `INFORMATION_SCHEMA`, ob die Spalten bereits existieren.

## Sicherheits-/Scope-Grenzen

Nicht enthalten:

```text
- keine freie User-Verwaltung
- keine Rollen-/Rechte-Schreibverwaltung
- keine Allowlist-UI-Writes
- keine Remote-Actions
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Wichtig fuer Tests

Nach Migration und Deploy muss der User einmal neu einloggen, damit Twitch `profile_image_url` erneut gelesen und gespeichert wird.

Danach sollte `/api/remote/auth/me` `avatarUrl` bzw. `profileImageUrl` liefern.
