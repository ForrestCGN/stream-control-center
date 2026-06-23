# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST

## Diese Datei zuerst lesen

In einem neuen Chat immer zuerst diese Datei lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach mindestens diese Dateien prüfen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md
docs/current/RDAP6F_AUTH_DB_INTEGRATION_PLAN.md
docs/current/RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER.md
docs/current/RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
```

Wenn eine Datei in GitHub/dev fehlt: nicht raten, exakt sagen welche Datei fehlt.

## Repository und Pfade

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel Stream-PC: D:\Streaming\stramAssets
Lokaler Stream-PC-Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2 lokal: http://127.0.0.1:8080/dashboard-v2/
Produktive lokale SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
Remote-Webserver: web.cgn.community
Server-Testpfad zuletzt: /root/rdap6-test/stream-control-center
RDAP6H Server-Backup: /root/rdap6h_backup_remote_modboard_20260623_151316
Übergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestätigter Stand

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet
RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
```

Wichtig: Einige ältere Prompt-/Status-Dateinamen aus Zwischenständen existieren nicht in GitHub/dev. Der belastbare aktuelle Doku-Stand basiert auf den vorhandenen Dateien in `docs/current` und `project-state`, besonders `RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md`.

## Remote-Modboard / Webserver-Stand

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
```

Live verfuegbare Read-only-Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
```

RDAP6H Live-Test-Ergebnis:

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

`schema.ready=false` ist aktuell erwartbar, weil die RDAP6C-Tabellen in `c3stream_control` noch nicht produktiv angelegt wurden.

Bewusst weiterhin nicht aktiv:

```text
keine Remote-Writes
keine produktiven Agent-Actions
kein produktiver WSS-Agent
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Datei-/Shell-/Prozesssteuerung
keine Secrets im Repo oder Frontend
kein Login/Auth-Code
keine Sessions
keine DB-Migration
```

## Webserver-DB

Final korrigiert:

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## Lokale SQLite bleibt unverändert

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Keine Migration, kein Ersetzen, kein Löschen, kein Kopieren ohne separaten Plan und ausdrückliches Go.

## Rollen-/Gruppenmodell ab RDAP5C3

Twitch-Status:

```text
streamer / broadcaster
mod
vip
```

Auswirkung:

```text
streamer -> Dashboard-Basiszugang
mod      -> Dashboard-Basiszugang
vip      -> kein Dashboard-Basiszugang, nur Community/Website
```

Manuell vergebene Dashboard-Rollen:

```text
lead_mod
admin
owner
spaeter eigene Rollen optional
```

Dashboard-Gruppen / Markierungen:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
spaeter eigene Gruppen optional
```

Wichtig:

```text
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
Rechte werden serverseitig geprüft, nicht frontendseitig.
```

## RDAP6D / RDAP6E Ergebnis

Der RDAP6D-Testlauf wurde auf dem Webserver durchgeführt.

```text
Server: web.cgn.community
Pfad: /root/rdap6-test/stream-control-center
DB: scc_rdap6_test
Ergebnisdatei auf Server:
_tmp/rdap6d_webserver_test_output/RDAP6D_TEST_RESULT_FILLED.md
```

Ausgeführt wurden:

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
```

Ergebnis:

```text
RDAP6D Testdatenbanklauf bestanden: ja
Produktivlauf freigegeben: nein
```

Wichtige Validierungswerte:

```text
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
module_permission_table_rows = 0
session_rows = 0
lock_rows = 0
audit_rows = 0
```

## RDAP6F Entscheidung

```text
scc_rdap6_test bleibt reine Testdatenbank.
Die echte Remote-Modboard-/Auth-Ziel-DB ist c3stream_control.
DB-User bleibt c1stream_control.
```

RDAP6F ist nur Planung. Keine Migration, keine Auth-Aktivierung, keine Sessions.

## Nächster sinnvoller Schritt

```text
RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Ziel von RDAP6I:

```text
Sicheres Produktiv-Migrations-Runbook fuer c3stream_control vorbereiten.
```

Nicht ändern:

```text
keine produktive SQLite
keine Remote-Agent-Schreibaktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Secrets
keine Rollenzusammenführung
keine sound_profi-Rolle
keine SQL-Ausführung ohne separates Go
```

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand prüfen.
- Nicht raten.
- Nicht bekannte Infos doppelt und dreifach abfragen.
- Wenn Dateien fehlen, exakt diese Dateien anfordern.
- Nur EIN Arbeitsort pro Schritt.
- Vor jedem Befehlsblock klar sagen: Wo ausführen, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
- Maximal ein Befehlsblock pro Antwort.
- Vor Code-/ZIP-Änderungen Scope nennen:
  - Ziel
  - betroffene Dateien
  - Nicht-Änderungen
  - Tests
  - Rollback
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen, löschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `_handoff`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
