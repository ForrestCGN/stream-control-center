# STEP222 - Challenge DB Helper Cleanup (2026-05-10)

## Ziel

`backend/modules/challenge.js` reduziert SQLite-nahe SQL-Konstrukte weiter und nutzt vorhandene Helper aus `backend/core/database.js`.

SQLite bleibt produktiv aktiv. MySQL/MariaDB bleiben weiterhin vorbereitet, aber inaktiv.

## Betroffene Datei

- `backend/modules/challenge.js`

## Änderungen

- `id INTEGER PRIMARY KEY AUTOINCREMENT` in der Runtime-Events-Tabelle wurde durch `database.primaryKeyAutoIncrementSql()` ersetzt.
- Das `schema_versions`-Upsert nutzt jetzt `database.upsert(...)` statt direktem `ON CONFLICT(...)`.
- Das Basis-Upsert fuer `challenge_user_mode_stats` nutzt jetzt `database.upsert(...)` statt direktem `ON CONFLICT(...)`.
- Bestehende Counter-Updates fuer requested/queued/started/finished bleiben unveraendert.
- Bestehende Runtime-Event-Erfassung bleibt unveraendert.

## Bewusst nicht geändert

- Keine Challenge-/Queue-/Timer-Logik.
- Keine Overlay-/WebSocket-Logik.
- Keine Chat-/Discord-Sound-Logik.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Technische Einordnung

Dieser STEP ist Teil von DB-Portabilitaet Phase 2.

Vorher enthielt `challenge.js` noch SQLite-nahe SQL-Details:

```text
INTEGER PRIMARY KEY AUTOINCREMENT
ON CONFLICT(...)
```

Nach diesem STEP sind diese direkten Konstrukte aus `challenge.js` entfernt. Die konkrete SQL-Dialektentscheidung liegt nun fuer diese Stellen in `backend/core/database.js`.

## Syntaxcheck

```powershell
node --check backend\modules\challenge.js
```

## Live-/API-Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Commit-Befehl

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: use core upsert helpers in challenge stats"
```

## Nächster sinnvoller Schritt

Nach erfolgreichem Test kann ein erneuter gezielter Scan auf `backend/modules/challenge.js` laufen:

```powershell
Select-String -Path backend\modules\challenge.js -Pattern "ON CONFLICT|AUTOINCREMENT|INSERT OR IGNORE|PRAGMA" -Context 1,1
```

Danach sollten weitere Module mit klar abgrenzbaren SQL-Dialektstellen einzeln geprüft werden.
