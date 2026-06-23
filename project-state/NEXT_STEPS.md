# NEXT STEPS

Stand: RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION  
Datum: 2026-06-23

## Aktueller Stand

RDAP5I ist technisch live read-only erfolgreich:

```text
https://mods.forrestcgn.de/api/remote/health?db=1
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
```

Bestaetigt:

```text
ok: true
readOnly: true
writeEnabled: false
database.reachable: true
agent.enabled: false
agent.actionsEnabled: false
```

## Sofort naechster Schritt

```text
RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE
```

Ziel:

```text
Live-Installation final dokumentieren
DB_USER/DB_NAME-Korrektur in allen relevanten Projektdateien festhalten
systemd/nginx/ISPConfig/Healthcheck-Ergebnisse dokumentieren
Prompt fuer neuen Chat aktualisieren
```

## Noch auszufuehrende Abschlusspruefungen

Auf `web.cgn.community`:

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
journalctl -u scc-remote-modboard.service -n 30 --no-pager
```

Erwartung:

```text
enabled
active
keine Fehler im Journal
```

## Danach moegliche Schritte

### Option A: RDAP5J Remote Node Monitoring and Hardening

```text
Service-Logs/Monitoring pruefen
nginx/API-Sicherheitsheader planen
Rate-Limit fuer /api/remote/ planen
Healthcheck-Monitoring planen
systemd-Hardening pruefen
Rollback-Doku finalisieren
```

Keine Auth/DB-Migration.

### Option B: RDAP6 Auth DB Migration Prep

Nur nach separatem Go und eigener Planung.

```text
MariaDB-Migrationsplan vorbereiten
schema_migrations planen
User-/Twitch-/Rollen-/Gruppen-/Modulmatrix-Tabellen vorbereiten
keine Schreibmigration ohne Backup und weiteres Go
```

## RDAP5I darf als erledigt gelten, wenn

```text
systemd enabled/active bestaetigt
Journal ohne Fehler bestaetigt
GitHub/dev Doku aktualisiert
DB_USER/DB_NAME-Korrektur ueberall dokumentiert
```
