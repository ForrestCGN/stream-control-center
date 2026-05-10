# STEP226 - Ko-fi/Tipeee DB-Helper-Cleanup (2026-05-10)

## Ziel

Die kleinen Provider-Module `kofi.js` und `tipeee.js` sollen weiter von SQLite-spezifischer DDL entkoppelt werden.

SQLite bleibt produktiv aktiv. MySQL/MariaDB bleiben vorbereitet, aber inaktiv.

## Betroffene Dateien

- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`

## Geändert

- Direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Definitionen wurden durch `database.primaryKeyAutoIncrementSql()` ersetzt.
- Die bestehenden Tabellen, Spalten, Indizes, Provider-Routen, Webhook-/Socket-Logik und Forwarding-Logik bleiben unverändert.

## Bewusst nicht geändert

- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Keine Ko-fi-Webhook-Logik.
- Keine Tipeee-Socket-Logik.
- Keine Alert-Forwarding-Logik.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\kofi.js
node --check backend\modules\tipeee.js
```

API-/Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/kofi/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Einordnung

Dieser STEP ist Teil von DB-Portabilität Phase 2. Ziel ist die schrittweise Reduktion direkter SQLite-SQL-Konstrukte in produktiven Modulen, ohne das aktive SQLite-System zu verändern.
