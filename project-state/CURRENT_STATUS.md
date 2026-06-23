# CURRENT STATUS

Stand: RDAP6F_AUTH_DB_INTEGRATION_PLAN  
Datum: 2026-06-23

## Aktueller bestaetigter Arbeitsstand

RDAP6F wurde als Planungsstep dokumentiert. Der Plan legt fest, wie die getesteten Auth-/Rollen-/Gruppen-/Permission-/Session-/Lock-/Audit-Tabellen spaeter in die echte Remote-Modboard-/Webserver-Struktur eingebunden werden.

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
```

## Remote-Modboard read-only live

Der Remote-Modboard-Node-Basisdienst laeuft read-only auf dem Webserver:

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
```

Live verfuegbare Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
```

Bestaetigte Health-Werte:

```text
ok: true
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
driverAvailable: true
configured: true
connectionTested: true
reachable: true
migrationEnabled: false
error: null
```

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

## Wichtiger Doku-Hinweis

Einige Dateinamen aus Zwischen-Prompts existieren nicht in GitHub/dev und nicht lokal. Sie duerfen nicht als Pflichtdateien vorausgesetzt werden.

Nicht vorhandene Zwischenstand-Dateien:

```text
docs/current/RDAP_STATUS_AND_NEXT_STEPS_2026-06-23.md
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
docs/current/RDAP6B_TEST_DB_DRY_RUN_RUNBOOK.md
```

Belastbar vorhanden und fuer RDAP6F relevant:

```text
docs/current/RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md
docs/current/RDAP6C_AUTH_DB_MIGRATION_SCRIPT_PACKAGE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
```

## RDAP6F Entscheidung

```text
scc_rdap6_test bleibt reine Testdatenbank.
Die echte Remote-Modboard-/Auth-Ziel-DB ist c3stream_control.
DB-User bleibt c1stream_control.
```

RDAP6F gibt keine Migration und keine Auth-Aktivierung frei.

## Naechster sinnvoller Schritt

```text
RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER
```

Ziel:

```text
Remote-Modboard bekommt eine sichere interne read-only DB-Schicht fuer Auth-Modell-Daten.
```

Weiterhin keine Auth-Aktivierung, keine Sessions, keine Writes und keine Agent-Actions.
