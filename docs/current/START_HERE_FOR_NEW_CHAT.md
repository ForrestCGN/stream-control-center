# START HERE FOR NEW CHAT

Stand: RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN  
Datum: 2026-06-23

## Sofort zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS.md
docs/current/RDAP7_LOGIN_SESSION_CONCEPT.md
docs/current/RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN.md
```

## Arbeitsweise

```text
Erst echten Stand pruefen, dann Scope nennen, dann auf klares go warten.
Nicht raten.
Keine Funktionalitaet entfernen.
Keine Parallelstrukturen bauen.
Vorhandene Module/Helper/Patterns nutzen.
Nur EIN Arbeitsort pro Schritt.
Keine langen Ausgaben anfordern, wenn nicht noetig.
Bei ZIPs echte Repo-Pfade ab Repo-Root verwenden.
Nicht den Desktop als Standardziel verwenden.
installstep.cmd vor stepdone.cmd.
stepdone.cmd erst nach Einspielen/Test.
Kein git add . verwenden.
Secrets niemals ins Repo, Frontend oder Chat.
```

## Aktueller Stand

RDAP6K wurde produktiv auf `c3stream_control` ausgefuehrt und validiert. RDAP6L dokumentiert das Ergebnis. RDAP7 dokumentiert das Login-/Session-Konzept. RDAP7A dokumentiert den read-only User-Resolution-Plan.

Remote-Modboard bleibt weiterhin read-only:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## Webserver / Remote-Modboard

```text
Webserver: web.cgn.community
Remote-Modboard: https://mods.forrestcgn.de
Service: scc-remote-modboard.service
Installationspfad: /opt/stream-control-center/remote-modboard/backend
ENV: /etc/stream-control-center/remote-modboard.env
```

## Produktive Auth-DB

```text
DB_NAME=c3stream_control
DB_USER=c1stream_control
Backup vor Migration: /root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
schema.ready=true
```

Passwort niemals dokumentieren oder posten.

## Naechster technischer Schritt

```text
RDAP7B_AUTH_STATUS_READONLY_ENDPOINTS
```

Ziel:

```text
Remote-Modboard Backend um read-only Auth-Status-/Me-Endpunkte erweitern.
Kein Login, keine Sessions, keine Cookies, keine Writes.
```

Nicht erlaubt:

```text
keine Auth-Aktivierung
keine OAuth-Weiterleitung
keine Callback-Verarbeitung
keine Session-Erstellung
keine Cookie-Ausgabe
keine User-/Identity-Writes
keine Remote-Writes
keine Agent-Actions
```
