# CURRENT STATUS

Stand: RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK  
Datum: 2026-06-23

## Aktueller bestaetigter Arbeitsstand

RDAP6I wurde als reines Runbook fuer eine spaetere produktive Auth-DB-Migration vorbereitet.

Dieser Stand fuehrt keine Migration aus, aktiviert keine Authentifizierung, erstellt keine Sessions, aktiviert keine Remote-Writes und keine Agent-Actions.

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet
RDAP6H Remote read-only Auth-Model Deploy/Test live bestanden
RDAP6I Auth DB Production Migration Runbook dokumentiert
```

## Remote-Modboard read-only live

Der Remote-Modboard-Node-Basisdienst laeuft read-only auf dem Webserver:

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
```

Live verfuegbare Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
```

RDAP6H Live-Test bestaetigt:

```text
Service: active
/api/remote/routes: OK
/api/remote/auth/model: OK
database.reachable: true
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
schema.ready: false
```

`schema.ready=false` ist korrekt, weil die RDAP6C-Tabellen in `c3stream_control` noch nicht produktiv angelegt sind.

## Service-/Runtime-Stand

```text
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
mysql2: 3.22.5
express: 5.2.1
dotenv: 17.4.2
```

## Installierte Pfade auf Webserver

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

Service-User:

```text
sccremote
```

Node-Service laeuft nicht als root.

## Webserver-DB final korrigiert

Fruehere Doku hatte DB_USER und DB_NAME vertauscht.

Final bestaetigt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## Remote-Agent / Rollen-/Gruppenmodell

`backend/modules/remote_agent.js` steht auf:

```text
moduleVersion: 0.0.3
moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY
```

Fuehrend bleibt RDAP5C3:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Der Remote-Agent bleibt read-only.

## RDAP6D / RDAP6E Test-DB-Ergebnis

Der RDAP6D-Testlauf wurde auf dem Webserver durchgefuehrt.

```text
Server: web.cgn.community
Pfad: /root/rdap6-test/stream-control-center
DB: scc_rdap6_test
Ergebnisdatei auf Server:
_tmp/rdap6d_webserver_test_output/RDAP6D_TEST_RESULT_FILLED.md
```

Ausgefuehrt wurden:

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

RDAP6F gibt keine Migration und keine Auth-Aktivierung frei.

## RDAP6G / RDAP6H Stand

RDAP6G hat folgende read-only Route vorbereitet:

```text
GET /api/remote/auth/model
```

Zweck:

```text
Auth-/Rollen-/Gruppen-/Permission-/Schema-Modell aus MariaDB read-only lesen.
Fehlende Tabellen sauber melden.
Keine Auth aktivieren.
Keine Sessions erstellen.
Keine Writes.
```

RDAP6H hat den Live-Deploy/Test dieser Route bestanden.

## RDAP6I Runbook

Neue Doku:

```text
docs/current/RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK.md
```

Zweck:

```text
Sicheren Ablauf fuer eine spaetere produktive Migration in c3stream_control dokumentieren.
Backup, Restore-/Rollback-Weg, SQL-Reihenfolge, Validation und Stop-Punkte festlegen.
```

RDAP6I fuehrt keine Migration aus.

## Nicht umgesetzt

```text
keine produktive DB-Migration
keine MariaDB-Schreibaktion auf Ziel-/Produktiv-DB
kein Auth/Login
keine produktiven Sessions
kein produktiver WSS-Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
keine freie Shell-/Datei-/Prozesssteuerung
keine Secrets im Repo oder Frontend
```

## Naechster sinnvoller Schritt

```text
RDAP6J_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION_PRECHECK
```

Ziel:

```text
Vor echter SQL-Ausfuehrung nochmals Ziel-DB, Backup-Moeglichkeit, SQL-Dateien, Validation und Rollback-Weg pruefen.
```

RDAP6J darf nur Precheck sein, ausser Forrest gibt ausdruecklich ein separates Go fuer echte SQL-Ausfuehrung.
