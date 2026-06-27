# RDAP7F Chat-Handoff und Next-Chat-Prompt

Stand: RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT  
Datum: 2026-06-23

## Zweck

Dieser Step dokumentiert den aktuellen, gesicherten Stand fuer den naechsten Chat und legt die Arbeitsweise fuer die Fortsetzung fest.

Es wurden keine Code-, Datenbank-, Service-, Auth-, Session-, Cookie-, Agent- oder Remote-Write-Aenderungen vorgenommen.

## Aktueller bestaetigter Stand

```text
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich
RDAP6L Migrationsergebnis dokumentiert
RDAP7 Login-/Session-Konzept dokumentiert
RDAP7A Auth Read-only User Resolution Plan eingespielt
RDAP7B Auth Read-only Status Endpoints gebaut und nach GitHub/dev gepusht
RDAP7C Remote Auth Status Deploy/Test live bestanden
RDAP7C1 Server Workdir Cleanup live bestanden
RDAP7D Auth Status Deploy Result Docs erstellt
RDAP7E Server Workdir Cleanup Docs erstellt und GitHub/dev ist laut User sauber/leer
```

## Live-Status Remote-Modboard

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Interner Listen-Port: 127.0.0.1:3010
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
Service-Status nach RDAP7C/RDAP7C1: active
```

Live bestaetigte Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
```

Bestaetigter Sicherheitsstatus:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Auth-DB Stand

```text
DB-Typ: MariaDB 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
DB Remote Access: aus
Charset: utf8mb4
```

Passwort wird nicht dokumentiert, nicht ins Repo geschrieben und nicht im Chat gepostet.

Produktive RDAP6K-Migration erfolgreich:

```text
schema.ready: true
missingTables: []
dashboard_roles: 6
dashboard_groups: 1
dashboard_permissions: 22
dashboard_role_permissions: 18
dashboard_module_permissions: 0
dashboard_sessions: 0
dashboard_locks: 0
dashboard_audit_log: 0
sound_profi_role_count: 0
sound_profi_group_marker_count: 1
sound_profi_role_permission_count: 0
```

Vorheriges DB-Backup aus RDAP6J:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Hinweis: Spaetere Server-Backups sollen nicht mehr nach `/root`, sondern nach `/var/backups/stream-control-center/`.

## Server-Ordnerregel ab RDAP7C1

Nicht mehr verwenden:

```text
/root/rdap*-deploy
/root/rdap*-migration
/root/rdap*-precheck
/root/rdap*_backup_*
```

Neue Standards:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp:       /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

RDAP7C1 Ergebnis:

```text
/opt/stream-control-center/_deploy_tmp angelegt
/opt/stream-control-center/_runtime_tmp angelegt
/var/backups/stream-control-center angelegt
/root enthaelt keine RDAP-Ordner mehr
Service blieb active
/var/backups/stream-control-center war nach Cleanup leer
```

## Arbeitsweise fuer den naechsten Chat

Verbindlich:

```text
1. Zuerst START_HERE_FOR_NEW_CHAT.md lesen.
2. Dann MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt lesen.
3. Dann CURRENT_STATUS, NEXT_STEPS, TODO und FILES lesen.
4. GitHub/dev als Single Source of Truth nutzen.
5. Reale Dateien pruefen, nicht raten.
6. Keine Funktionalitaet entfernen.
7. Vor Umsetzung immer Scope nennen und auf ausdrueckliches go warten.
8. Pro Antwort maximal ein Befehlsblock.
9. Vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
10. Keine Ausgaben seitenweise anfordern, nur relevante sichtbare Ausgabe.
11. Keine Deploy-/Backup-/Temp-Arbeitsordner mehr in /root.
12. ZIPs mit echten Repo-Pfaden ab Repo-Root liefern.
13. Keine Secrets ins Repo, Frontend oder Chat.
14. Kein git add . verwenden; neue Dateien gezielt adden.
15. StepDone erst nach Einspielen/Deploy/Test.
```

## Naechster sinnvoller Step

```text
RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel:

```text
Twitch-OAuth-Dry-Run planen, ohne Login zu aktivieren.
```

Der naechste Step soll nur planen:

```text
benoetigte ENV-Werte
Redirect-/Callback-URLs
Twitch Developer Console Einstellungen
State/CSRF-Regel
Fehler-/Stop-Punkte
Rollback
Testplan
```

Noch nicht erlaubt:

```text
kein Twitch-Login aktivieren
keinen OAuth-Callback produktiv freischalten
keine Cookies setzen
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets ins Repo oder Frontend
```
