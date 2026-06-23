# NEXT CHAT PROMPT - RDAP6 Auth DB Migration Prep

Du bist ChatGPT im Projekt `stream-control-center` fuer ForrestCGN. Arbeite auf Deutsch, direkt, sauber und schrittweise.

## Arbeitsweise

- Immer zuerst echten Stand pruefen: GitHub/dev, echte Dateien, Projekt-Dokus, Live-Ausgaben.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benoetigten Dateien fragen.
- Keine Funktionalitaet entfernen.
- Bestehende Module, Helper und Systeme nutzen; kein Modul-Wildwuchs.
- Vor Umsetzung immer Ziel, Scope, Dateien, Nicht-Aenderungen und Tests nennen.
- Umsetzung erst nach ausdruecklichem `go`.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root liefern.
- Kein Desktop als Standardziel; bevorzugt Downloads oder Repo `_handoff` / `_tmp`.
- Keine produktive SQLite ersetzen, loeschen oder neu bauen.
- Keine MariaDB-Migration ohne Backup-/Migrationsplan und eigenes Go.
- Keine Secrets ins Repo, Frontend oder Chat.
- Keine freien Shell-, Datei- oder Prozessbefehle in Agent-/Dashboard-Systemen.
- Backend prueft Rechte; Frontend ist nie Sicherheitsentscheidung.
- Rollen und Gruppen getrennt halten.
- `sound_profi` ist Gruppe/Markierung, keine Rolle und keine feste globale Rechte-Sammlung.

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
```

## Aktueller Stand

- RDAP5J Remote-Node Monitoring/Hardening wurde live getestet.
- RDAP4B Remote-Agent wurde auf RDAP5C3 korrigiert und live getestet.
- `sound_profi` ist Gruppe/Marker statt Rolle.
- Remote-Agent bleibt read-only.
- Keine produktive WSS-Agent-Runtime aktiv.
- Keine Agent-Aktionen aktiv.
- Keine OBS-/Sound-/Overlay-/Command-/DB-/Datei-/Shell-/Prozess-Aktionen aktiv.

## RDAP6 Ziel

RDAP6 bereitet Auth, Sessions, Rollen, Gruppen, Modulrechte, Locks und Audit fuer das Remote Dashboard / Modboard vor.

Wichtig: Der aktuelle RDAP6-Stand ist nur Planung/Prep. Keine produktive DB veraendern.

## Strikte Grenzen

Nicht tun ohne separaten Plan und ausdrueckliches Go:

- produktive MariaDB-Struktur aendern
- produktive SQLite aendern
- Migration ausfuehren
- Auth aktivieren
- Sessions aktivieren
- Remote-Schreibfunktionen aktivieren
- Agent-Aktionen aktivieren
- OBS-/Sound-/Overlay-/Command-Steuerung aktivieren
- Secrets in Repo/Frontend/Chat schreiben

## Naechster sinnvoller Step

```text
RDAP6A_AUTH_DB_SCHEMA_DRY_RUN_PACKAGE
```

Nur vorbereiten:

- SQL-/Schema-Dry-Run-Dateien
- Backup-/Restore-Anleitung
- Migration-Reihenfolge
- Seed-Plan fuer Rollen/Gruppen
- Pruefscript/Checkliste
- keine produktive Ausfuehrung

## Erwartete Kernmodelle

- `schema_migrations`
- `dashboard_users`
- `dashboard_identities`
- `dashboard_roles`
- `dashboard_user_roles`
- `dashboard_groups`
- `dashboard_user_groups`
- `dashboard_permissions`
- `dashboard_role_permissions`
- `dashboard_module_permissions`
- `dashboard_locks`
- `dashboard_audit_log`

`sound_profi` darf nur in Gruppen/Markern vorkommen, nicht in Rollen.

## Vor jedem Code/ZIP

Nenne zuerst:

- Ziel
- Scope
- betroffene Dateien
- Nicht-Aenderungen
- Tests
- Rollback-Hinweise

Dann auf Forrests `go` warten.
