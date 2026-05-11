# STEP221 - Tagebuch DB-Helper-Cleanup

Datum: 2026-05-10
Projekt: stream-control-center
Bereich: DB-Portabilitaet Phase 2

## Ziel

`backend/modules/tagebuch.js` soll SQLite-nahe Direktkonstrukte an klar abgegrenzten Stellen reduzieren und vorhandene Helper aus `backend/core/database.js` nutzen.

SQLite bleibt weiterhin produktiv aktiv. MySQL/MariaDB werden dadurch nicht aktiviert.

## Betroffene Datei

- `backend/modules/tagebuch.js`

## Geaendert

- Direkte `PRAGMA table_info(tagebuch_state)`-Abfragen in der Tagebuch-Schema-Migration entfernt.
- Spaltenpruefung in der Migration nutzt jetzt `database.tableColumns('tagebuch_state')`.
- Direkte `INSERT OR IGNORE INTO tagebuch_state ...`-Statements in der Migration entfernt.
- Insert-Ignore-SQL wird jetzt ueber `database.buildInsertIgnoreSql('tagebuch_state', stateDefaults)` erzeugt.

## Bewusst nicht geaendert

- Keine Tagebuch-Fachlogik.
- Keine Discord-/Webhook-Logik.
- Keine Streamstart-/Streamende-Logik.
- Keine Stats-Logik.
- Keine Reset-Logik.
- Keine Tabellenstruktur.
- Keine Datenmigration.
- Kein `package.json`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Aenderung an `backend/core/database.js`.
- Keine Aenderung an `backend/modules/sqlite_core.js`.

## Technischer Hinweis

Die Schema-DDL enthaelt weiterhin SQLite-nahe Konstrukte wie `INTEGER PRIMARY KEY AUTOINCREMENT` und `ON CONFLICT(...)` in anderen Bereichen. Das ist fuer diesen kleinen STEP bewusst unveraendert, weil SQLite produktiv aktiv bleibt und die Phase-2-Cleanups schrittweise erfolgen.

## Syntaxcheck

```powershell
node --check backend\modules\tagebuch.js
```

## Empfohlene Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Erwartung

- Alle Routen liefern `ok = true`.
- `databasePath` zeigt weiterhin auf `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- `schemaVersion` bleibt `5`.
- `settingsSource` bleibt `database_with_json_fallback`.
- `textsSource` bleibt `database_variants_with_json_fallback`.

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: use core helpers in tagebuch schema checks"
```
