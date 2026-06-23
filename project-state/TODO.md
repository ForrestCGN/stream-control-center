# TODO - stream-control-center

Stand: 2026-06-23

## Offen / geplant

### RDAP5J Live-Akzeptanztests ausfuehren

RDAP5J ist als Runbook dokumentiert. Forrest muss die Tests ausfuehren und die Ausgaben posten.

Pruefpunkte:

- Service enabled/active.
- Journal ohne Crash-Loops.
- Node nur lokal auf `127.0.0.1:3010`.
- lokale API funktioniert.
- externe API funktioniert.
- DB-Lesetest funktioniert.
- read-only bleibt unveraendert.
- keine Secrets in Ausgaben.

Doku:

```text
docs/current/REMOTE_DASHBOARD_RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING.md
```

### RDAP4B remote_agent.js auf RDAP5C3 korrigieren

Separater Step.

Regeln:

- Datei zuerst echt lesen.
- Keine Funktionalitaet entfernen.
- Bestehende read-only RDAP4B-Routen nicht entfernen.
- `sound_profi` darf keine Rolle sein.
- `sound_profi` ist Gruppe/Markierung.
- Rechte ueber `target_type` + `target_key` / Modulmatrix denken.
- Umsetzung nur nach eigenem Scope und Go.

### RDAP6_AUTH_DB_MIGRATION_PREP

Spaeterer separater Step.

Nur mit:

- Backup-Konzept
- `schema_migrations`
- User-/Twitch-/Rollen-/Gruppen-/Modulmatrix-Entwurf
- Audit-Log-Konzept
- separatem Go

## Erledigt / dokumentiert

### RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING_DOCS

Dokumentiert am 2026-06-23.

Festgehalten:

- Monitoring-Runbook fuer Remote-Node angelegt.
- Hardening-Checkliste dokumentiert.
- Akzeptanzkriterien dokumentiert.
- keine Code-, DB-, Service- oder nginx-Aenderung vorgenommen.

### RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE

Dokumentiert am 2026-06-23.

Festgehalten:

- RDAP5I read-only live erfolgreich.
- Remote API dokumentiert.
- DB-Lesetest dokumentiert.
- korrekte DB-Zuordnung dokumentiert.
- falsche alte Zuordnung markiert.
- Passwort wird nicht dokumentiert.
- nginx/ISPConfig Proxy dokumentiert.
- systemd-Service-Status dokumentiert.
