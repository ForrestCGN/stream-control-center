# STEP225 - Hug DB Helper Cleanup (2026-05-10)

## Ziel

`backend/modules/hug.js` reduziert SQLite-nahe SQL-Konstrukte und nutzt vorhandene zentrale DB-Helper aus `backend/core/database.js`.

SQLite bleibt produktiv aktiv. MySQL/MariaDB werden weiterhin nicht verbunden und nicht genutzt.

## Betroffene Datei

- `backend/modules/hug.js`

## Geändert

- `INTEGER PRIMARY KEY AUTOINCREMENT` in Hug-Tabellen-DDL wurde durch `db.primaryKeyAutoIncrementSql()` ersetzt.
- Die lokale `columnExists(...)`-Hilfsfunktion nutzt jetzt `db.columnExists(...)`.
- Direkte `PRAGMA table_info(...)`-Nutzung wurde aus `hug.js` entfernt.

## Bewusst nicht geändert

- Keine Hug-/Rehug-Fachlogik.
- Keine Chat-Ausgaben.
- Keine Stats-Logik.
- Keine Routen.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Syntaxcheck

```powershell
node --check backend\modules\hug.js
```

## Empfohlene Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/hug/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: use core helpers in hug schema checks"
```
