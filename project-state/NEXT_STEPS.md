# NEXT STEPS - stream-control-center

Stand: 2026-06-23

## Sofort abgeschlossen / aktueller Dokumentationsstand

### RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE

Status: dokumentiert.

Ziel:

- RDAP5I read-only live sauber im Repo festhalten.
- Korrekte DB-Zuordnung dokumentieren.
- Startdateien fuer neuen Chat vorbereiten.
- Alt-TODO `remote_agent.js` RDAP4B -> RDAP5C3 markieren.
- Keine Code-, DB-, Service- oder nginx-Aenderung.

Betroffene Doku-Dateien:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/NEXT_CHAT_PROMPT_RDAP5I_REMOTE_READONLY_LIVE.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Naechster optionaler Step

### RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING

Ziel:

- Monitoring und Haertung fuer den bereits live laufenden read-only Remote-Node vorbereiten.
- Keine Schreibaktionen aktivieren.
- Keine Auth-/Session-Erstellung aktivieren.
- Keine DB-Migration aktivieren.
- Keine Agent-Aktionen aktivieren.

Moegliche Inhalte:

- Health/Status strukturierter pruefen.
- Service-/Journal-Pruefkommandos dokumentieren.
- Rate-Limit-/Security-Header-/Proxy-Hardening pruefen.
- Logging ohne Secrets pruefen.
- systemd Hardening pruefen, z. B. restriktivere Optionen, aber nur nach Plan.
- Fail2ban/nginx/Logrotation nur planen, nicht blind aendern.

Vor Umsetzung nennen:

- Ziel
- Scope
- Dateien
- Nicht-Aenderungen
- Tests

Umsetzung erst nach Forrests `go`.

## Spaeterer eigener Step

### RDAP4B_REMOTE_AGENT_RDAP5C3_ROLE_GROUP_REVISION

Grund:

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort als Rolle/Permission-Preset. Das ist fachlich ueberholt.

Ziel:

- `sound_profi` nicht mehr als Rolle fuehren.
- `sound_profi` nicht als festes globales Permission-Preset behandeln.
- `sound_profi` als Gruppe/Markierung behandeln.
- Modulrechte ueber `target_type` + `target_key` / Modulmatrix denken.
- Bestehende read-only RDAP4B-Routen nicht entfernen.

Wichtig:

- Erst echte Datei lesen.
- Keine Funktionalitaet entfernen.
- Nur mit eigenem Scope und Go.

## Spaeter mit separatem Plan

### RDAP6_AUTH_DB_MIGRATION_PREP

Nur starten mit:

- Backup-Plan
- Migrationsplan
- `schema_migrations`
- User-/Twitch-/Rollen-/Gruppen-/Modulmatrix-Tabellenentwurf
- ausdruecklichem Go

Nicht erlaubt ohne separates Go:

- produktive MariaDB-Struktur aendern
- produktive SQLite aendern
- Auth aktivieren
- Sessions erstellen
- Remote writes aktivieren
- Agent-Aktionen aktivieren
