# RDAP6H Remote Read-only Auth Model Deploy Test

Stand: 2026-06-23  
Status: Live-Test bestanden, read-only bleibt aktiv

## Zweck

RDAP6H dokumentiert den Live-Deploy- und Funktionstest der RDAP6G-Erweiterung auf dem Webserver `web.cgn.community`.

Dieser Step aktiviert weiterhin keine Authentifizierung, keine Sessions, keine Locks, keine Audit-Schreibungen, keine Remote-Writes und keine Agent-Actions.

## Geprüfte Live-Umgebung

```text
Webserver: web.cgn.community
Remote-Modboard: https://mods.forrestcgn.de
Service: scc-remote-modboard.service
Interner Listen-Port: 127.0.0.1:3010
Deploy-Ziel: /opt/stream-control-center/remote-modboard/backend
Backup-Pfad aus Test: /root/rdap6h_backup_remote_modboard_20260623_151316
```

## Durchgeführte Prüfung

Es wurde GitHub/dev frisch auf den Server geklont und `remote-modboard/backend` nach `/opt/stream-control-center/remote-modboard/backend` deployed.

Danach wurden ausgeführt:

```text
npm run check
systemctl restart scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
curl https://mods.forrestcgn.de/api/remote/routes
curl https://mods.forrestcgn.de/api/remote/auth/model
```

## Ergebnis

```text
Service aktiv: ja
npm run check: bestanden
/api/remote/routes: erreichbar
/api/remote/auth/model: erreichbar
database.reachable: true
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
schema.ready: false
```

`schema.ready=false` ist in diesem Stand erwartet, weil die RDAP6C-Tabellen in der echten Ziel-DB `c3stream_control` noch nicht produktiv angelegt wurden.

## Neue Live-Route

```text
GET https://mods.forrestcgn.de/api/remote/auth/model
```

Die Route antwortet stabil read-only und meldet fehlende Tabellen sauber.

## Ziel-DB-Status

```text
Ziel-DB: c3stream_control
DB-User: c1stream_control
Verbindung: erreichbar
RDAP6C-Tabellen in Ziel-DB: noch nicht vorhanden
Schema ready: false
```

Die Testdatenbank `scc_rdap6_test` bleibt reine Testdatenbank und ist nicht die produktive Ziel-DB.

## Build-Label-Cleanup

Beim Live-Test war die Funktion korrekt, aber `moduleBuild` stand noch auf:

```text
RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE
```

Dieser Doku-/Cleanup-Step hebt das Build-Label im Remote-Modboard-Server auf:

```text
RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
```

Das ist eine Status-/Doku-Korrektur. Es ändert keine Sicherheitslogik, keine Route und keine Datenbanklogik.

## Nicht geändert

```text
keine DB-Migration
keine SQL-Ausführung
keine Auth-Aktivierung
keine Session-Erstellung
keine Cookie-Logik
keine Lock-Erstellung
keine Audit-Schreibung
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine nginx-/systemd-Änderung
keine Secrets im Repo oder Frontend
```

## Nächster sinnvoller Schritt

```text
RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Ziel von RDAP6I ist ein sicheres Produktiv-Migrations-Runbook für `c3stream_control` mit Backup, Restore-Weg, Stop-Punkten, SQL-Reihenfolge und Validierung.

RDAP6I darf noch keine Migration ausführen. Produktivmigration nur nach separatem Go.
