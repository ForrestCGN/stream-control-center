# TODO - stream-control-center

Stand: 2026-06-23

## Offen / geplant

### RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING

Prioritaet: hoch, aber erst nach Plan und Go.

Aufgaben:

- Remote-Node-Monitoring fuer den read-only Stand planen.
- Health-, Status- und Routes-Pruefung dokumentieren.
- systemd-, journal- und nginx-Pruefung dokumentieren.
- Hardening pruefen, aber keine blinden Service-Aenderungen.
- Keine Secrets loggen oder dokumentieren.
- Keine Schreib-, Agent- oder Auth-Funktionen aktivieren.

### RDAP4B remote_agent.js auf RDAP5C3 korrigieren

Prioritaet: wichtig, aber separater Step.

Problem:

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort als Rolle/Permission-Preset. Das ist fachlich ueberholt.

Regeln fuer den spaeteren Fix:

- Datei zuerst echt aus Repo/dev/live lesen.
- Keine Funktionalitaet entfernen.
- Bestehende read-only RDAP4B-Routen nicht entfernen.
- `sound_profi` darf keine Rolle sein.
- `sound_profi` darf kein festes globales Permission-Preset sein.
- `sound_profi` ist Gruppe/Markierung.
- Rechte ueber `target_type` + `target_key` / Modulmatrix denken.
- Umsetzung nur nach eigenem Scope und Forrests ausdruecklichem Go.

### RDAP6_AUTH_DB_MIGRATION_PREP

Prioritaet: spaeter.

Nur vorbereiten mit:

- Backup-Konzept
- `schema_migrations`
- User-Tabelle
- Twitch-Identity-Tabelle
- Rollen-Tabelle
- Gruppen/Markierungen-Tabelle
- Modulpermission-Matrix mit `target_type` + `target_key`
- Audit-Log-Konzept

Nicht ohne separates Go:

- DB-Migration ausfuehren
- produktive MariaDB-Struktur aendern
- produktive SQLite aendern
- Auth aktivieren
- Sessions aktivieren
- Remote-Schreibfunktionen aktivieren
- Agent-Aktionen aktivieren

## Erledigt / dokumentiert

### RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE

Status: dokumentiert am 2026-06-23.

Festgehalten:

- RDAP5I read-only live erfolgreich.
- Remote API unter `mods.forrestcgn.de/api/remote/` dokumentiert.
- DB-Lesetest ueber `health?db=1` dokumentiert.
- korrekte DB-Zuordnung dokumentiert:
  - `DB_USER=c1stream_control`
  - `DB_NAME=c3stream_control`
- falsche alte Zuordnung markiert.
- Passwort wird nicht dokumentiert.
- nginx/ISPConfig Proxy dokumentiert.
- systemd-Service-Status dokumentiert.
- deaktivierte Schreib-, Agent-, Auth- und Migrationsfunktionen dokumentiert.
