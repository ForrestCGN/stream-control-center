# STEP230 - Dashboard Auth DB Helper Cleanup (2026-05-10)

## Ziel

`backend/modules/dashboard_auth.js` soll die verbliebenen direkten SQLite-`AUTOINCREMENT`-DDL-Stellen nicht mehr hart codieren, sondern den zentralen DB-Dialekt-Helper aus `backend/core/database.js` nutzen.

## Geänderte Dateien

- `backend/modules/dashboard_auth.js`

## Änderung

- Drei direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Stellen in den Dashboard-Auth-Schema-Tabellen wurden ersetzt durch:

```js
database.primaryKeyAutoIncrementSql()
```

Betroffene Tabellen:

- `dashboard_users`
- `dashboard_identities`
- `dashboard_audit_log`

## Bewusst nicht geändert

- Keine Login-Logik
- Keine Twitch-OAuth-Logik
- Keine Session-Logik
- Keine Rollen-/Rechte-Logik
- Keine Tabellenstruktur-Migration
- Keine Datenmigration
- Kein MySQL/MariaDB aktiv
- Keine Änderung an `backend/core/database.js`
- Keine Änderung an `backend/modules/sqlite_core.js`

## Technischer Hinweis

SQLite bleibt weiterhin der produktive Adapter. Der Helper gibt aktuell für SQLite weiterhin `INTEGER PRIMARY KEY AUTOINCREMENT` zurück. Dadurch ändert sich das erzeugte SQLite-Schema nicht, aber die DDL ist künftig zentral über die DB-Schicht gekapselt.

## Syntaxcheck

```powershell
node --check backend\modules\dashboard_auth.js
```

## Live-Tests nach Entpacken

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/roles" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```
