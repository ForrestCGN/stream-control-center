# STEP224 – helper_texts DB-Helper-Cleanup

Datum: 2026-05-10

## Ziel

`backend/modules/helpers/helper_texts.js` reduziert direkte SQLite-nahe SQL-Konstrukte und nutzt vorhandene Helper aus `backend/core/database.js`.

SQLite bleibt weiterhin produktiv aktiv. MySQL/MariaDB bleiben vorbereitet, aber inaktiv.

## Betroffene Dateien

- `backend/modules/helpers/helper_texts.js`

## Geändert

- `id INTEGER PRIMARY KEY AUTOINCREMENT` in den Text-Tabellen wurde durch `database.primaryKeyAutoIncrementSql()` ersetzt.
- Der Seed-Pfad fuer Legacy-Module-Texte nutzt jetzt `database.insertIgnore(...)` statt direktem `INSERT OR IGNORE`.

## Bewusst nicht geändert

- Keine Text-/Varianten-Fachlogik.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Keine Änderung an bestehenden Texten oder Varianten.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.

## Bewusst offengelassen

`setModuleText(...)` enthält weiterhin ein `ON CONFLICT(module_name, text_key) DO UPDATE SET ...`.

Grund: Diese Stelle hat Sonderlogik für `description`:

```sql
description = CASE WHEN excluded.description = '' THEN <table>.description ELSE excluded.description END
```

Das ist nicht identisch mit dem einfachen `database.upsert(...)`-Helper. Diese Stelle soll später separat gekapselt werden, wenn ein Helper für Custom-Upsert-Assignments vorhanden ist.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\helpers\helper_texts.js
```

API-/Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/texts" | ConvertTo-Json -Depth 120
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/texts" | ConvertTo-Json -Depth 120
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: use core helpers in text helper seeding"
```
