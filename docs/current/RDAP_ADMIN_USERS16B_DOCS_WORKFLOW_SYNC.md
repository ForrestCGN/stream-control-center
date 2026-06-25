# RDAP16B – Doku-/Workflow-Sync nach Admin-Notiz-Tabellenmigration

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Branch: `dev`

## Ziel

Dieser Step dokumentiert den bestätigten RDAP16-Abschluss und korrigiert die Arbeitsweise, damit die gleiche Fehlerklasse nicht wieder entsteht.

Es handelt sich um einen reinen Doku-/Workflow-Sync.

## Bestätigter RDAP16-Stand

RDAP16 wurde auf dem Webserver ausgeführt.

Bestätigt:

```text
Tabelle: dashboard_user_admin_notes vorhanden
schemaReady: true
migrationRequired: false
writesStillBlocked: true
writeEnabled: false
productiveWritesEnabled: false
rowCount: 0
missingColumns: []
```

Backup vor Migration:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
```

Weiterhin nicht aktiv:

```text
Admin-Notiz-Writes
User freigeben/sperren
Rollen/Rechte ändern
Sessions widerrufen
produktive Agent-Actions
UI-Schreibbuttons
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Wichtige Korrektur aus dem Chat

Der Deploy hat nicht die Repo-Root-Dateien nach `/opt/stream-control-center/remote-modboard/` kopiert. Das ist korrekt, denn `tools/remote-modboard-deploy.sh` synchronisiert nur:

```text
<GitHub-/Deploy-Clone>/remote-modboard/  ->  /opt/stream-control-center/remote-modboard/
```

Daraus folgt:

```text
Repo-Root-Dateien wie docs/, project-state/ und tools/ bleiben im GitHub-/Deploy-Clone.
SQL-Dateien unter tools/ werden aus _deploy_tmp/<STEP>/tools/... ausgeführt.
Sie liegen nicht automatisch unter /opt/stream-control-center/remote-modboard/tools/.
```

Beispiel RDAP16:

```text
Richtig:
/opt/stream-control-center/_deploy_tmp/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION/tools/rdap16_admin_note_table_migration.sql

Auch vorhanden im timestamped Deploy-Clone:
/opt/stream-control-center/_deploy_tmp/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION_20260625_065206/tools/rdap16_admin_note_table_migration.sql

Falsch:
/opt/stream-control-center/remote-modboard/tools/rdap16_admin_note_table_migration.sql
```

## Service-Build bleibt erwartungsgemäß RDAP14B

Nach RDAP16 zeigt die Statusroute weiterhin:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Das ist kein Fehler, weil RDAP16 keine laufenden Backend-Dateien unter `remote-modboard/` geändert hat. RDAP16 betraf Repo-Root-Doku/SQL und die Datenbankmigration.

## Aktualisierte Arbeitsregel

Bei zukünftigen RDAP-Steps immer zuerst klären:

```text
Liegt die Datei unter remote-modboard/?
Dann wird sie nach /opt/stream-control-center/remote-modboard/ deployed.

Liegt die Datei im Repo-Root unter docs/, project-state/ oder tools/?
Dann liegt sie nach Clone/Deploy im _deploy_tmp-Clone, aber nicht im Live-Remote-Modboard-Ordner.
```

## DB-Migrationen

Bei zukünftigen RDAP-/MariaDB-Migrationen gilt verbindlich:

1. Env-Datei des Services prüfen.
2. Secrets nicht posten.
3. Env-Datei nicht blind per `source` laden, wenn Werte Leerzeichen enthalten können.
4. DB-Werte gezielt auslesen.
5. Backup mit `mysqldump` erstellen.
6. Backup-Datei auf Existenz und Größe prüfen.
7. Vorprüfung read-only über `INFORMATION_SCHEMA`.
8. SQL erst nach separatem Go ausführen.
9. Nachher Read-Back prüfen.
10. Diagnose-Route prüfen.
11. Writes bleiben blockiert, bis ein separater Write-Step mit Permission, Confirm-Write, Audit, Lock und Read-Back gebaut und freigegeben wurde.

## Separater offener Punkt

Beim Deploy trat auf:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
[fehler] OAuth Safety verletzt. Erwartet 403/403.
```

Das ist ein separater offener Punkt. Der Deploy-/Safety-Check muss später geprüft werden, weil `/auth/twitch/start` offenbar HTTP 302 liefert. Das darf nicht nebenbei in einem DB-/Doku-Step repariert werden.

## Geänderte Dateien in RDAP16B

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_ADMIN_USERS16B_DOCS_WORKFLOW_SYNC.md
```

## Nicht geändert

```text
Kein Backend-Code
Keine DB-Migration
Keine SQL-Ausführung
Keine UI
Keine Workflow-Tools
Keine Agent-Actions
Keine produktiven Writes
```
